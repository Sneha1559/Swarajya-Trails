import json
import unittest
from types import SimpleNamespace
from unittest.mock import patch

from fastapi.testclient import TestClient

import main
from app.graph import graph
from app.orchestrator import orchestrator_agent


class FakeLLM:
    def __init__(self, content):
        self.content = content
        self.prompt = None
    def invoke(self, prompt):
        self.prompt = prompt
        return SimpleNamespace(content=self.content)


class OrchestratorClassificationTests(unittest.TestCase):
    def classify(self, query, decision):
        llm = FakeLLM(json.dumps(decision))
        with patch("app.orchestrator.get_llm", return_value=llm) as factory:
            result = orchestrator_agent(query)
        factory.assert_called_once_with(0)
        self.assertIn(query, llm.prompt)
        return result

    def test_historical_question_classification(self):
        result = self.classify("Why was Raigad important?", {"intent": "historical_question"})
        self.assertEqual(result["intent"], "historical_question")
        self.assertEqual(result["question"], "Why was Raigad important?")

    def test_fort_recommendation_classification(self):
        result = self.classify("Suggest forts for history lovers", {"intent": "fort_recommendation"})
        self.assertEqual(result["intent"], "fort_recommendation")

    def test_itinerary_planning_classification(self):
        result = self.classify(
            "Plan two days in Pune", {"intent": "itinerary_planning", "destination": "Pune", "days": 2, "travel_style": "Relaxed"}
        )
        self.assertEqual(result["intent"], "itinerary_planning")
        self.assertEqual(result["destination"], "Pune")
        self.assertEqual(result["days"], 2)

    def test_combined_workflow_classification_requires_explicit_both_tasks(self):
        result = self.classify(
            "Recommend forts and make an itinerary for one",
            {"intent": "recommendation_then_itinerary"},
        )
        self.assertEqual(result["intent"], "recommendation_then_itinerary")
        self.assertFalse(result["needs_clarification"])
    def test_storytelling_classification(self):
        result = self.classify("Tell me a story about Raigad", {"intent": "storytelling", "fort": "Raigad"})
        self.assertEqual(result["intent"], "storytelling")
        self.assertEqual(result["fort"], "Raigad")

    def test_fort_comparison_classification(self):
        result = self.classify(
            "Compare Raigad and Sinhagad", {"intent": "fort_comparison", "fort_a": "Raigad", "fort_b": "Sinhagad"}
        )
        self.assertEqual(result["intent"], "fort_comparison")
        self.assertEqual((result["fort_a"], result["fort_b"]), ("Raigad", "Sinhagad"))

    def test_parameter_extraction_and_json_embedded_in_fenced_output(self):
        content = '''Result:\n```json\n{"intent":"fort_recommendation","interests":"Maratha history","difficulty":"Easy","region":"Pune"}\n```'''
        with patch("app.orchestrator.get_llm", return_value=FakeLLM(content)):
            result = orchestrator_agent("Recommend easy forts around Pune for Maratha history")
        self.assertEqual(result["interests"], "Maratha history")
        self.assertEqual(result["difficulty"], "Easy")
        self.assertEqual(result["region"], "Pune")

    def test_string_interests_are_preserved(self):
        result = self.classify(
            "Recommend forts for trekking",
            {"intent": "fort_recommendation", "interests": "trekking, adventure"},
        )
        self.assertEqual(result["interests"], "trekking, adventure")

    def test_list_interests_are_normalized_and_passed_to_recommendation_agent(self):
        llm = FakeLLM(json.dumps({
            "intent": "fort_recommendation",
            "interests": ["trekking", "adventure"],
            "difficulty": "moderate",
            "region": "Maharashtra",
        }))
        with patch("app.orchestrator.get_llm", return_value=llm):
            with patch("app.graph.fort_recommendation_agent", return_value={"recommendations": "Raigad"}) as agent:
                state = graph.invoke({
                    "query": "Recommend forts in Maharashtra for trekking and adventure",
                })

        self.assertEqual(state["interests"], "trekking, adventure")
        agent.assert_called_once_with(
            interests="trekking, adventure",
            difficulty="moderate",
            region="Maharashtra",
        )

    def test_missing_interests_do_not_block_classification(self):
        result = self.classify(
            "Recommend forts",
            {"intent": "fort_recommendation"},
        )
        self.assertEqual(result["intent"], "fort_recommendation")
        self.assertNotIn("interests", result)

    def test_null_interests_do_not_block_classification(self):
        result = self.classify(
            "Recommend forts",
            {"intent": "fort_recommendation", "interests": None},
        )
        self.assertEqual(result["intent"], "fort_recommendation")
        self.assertNotIn("interests", result)

    def test_ambiguous_and_malformed_responses_request_clarification(self):
        with patch("app.orchestrator.get_llm", return_value=FakeLLM(json.dumps({
            "intent": "clarification",
            "needs_clarification": True,
            "clarification_question": "Would you like history, a story, or travel planning?",
        }))):
            result = orchestrator_agent("Tell me about forts")
        self.assertEqual(result["intent"], "clarification")
        self.assertTrue(result["needs_clarification"])
        self.assertIn("Would you like", result["clarification_question"])

        with patch("app.orchestrator.get_llm", return_value=FakeLLM("not json")):
            malformed = orchestrator_agent("Do something")
        self.assertEqual(malformed["intent"], "clarification")
        self.assertTrue(malformed["clarification_question"])

    def test_missing_required_destination_requests_clarification(self):
        with patch("app.orchestrator.get_llm", return_value=FakeLLM('{"intent":"itinerary_planning"}')):
            result = orchestrator_agent("Plan an itinerary")
        self.assertEqual(result["intent"], "clarification")
        self.assertIn("destination", result["clarification_question"])


class AutomaticGraphRoutingTests(unittest.TestCase):
    def test_automatic_intent_routes_to_each_specialized_agent(self):
        cases = [
            ("historical_question", "historical_question_agent", "historical_answer", {"question": "q", "answer": "a", "context": "c", "sources": [], "documents": []}, {"question": "q"}),
            ("fort_recommendation", "fort_recommendation_agent", "recommendation_result", {"recommendations": "Raigad"}, {}),
            ("itinerary_planning", "itinerary_planning_agent", "itinerary_result", {"destination": "Pune", "days": 1, "travel_style": "Balanced", "itinerary": "plan"}, {"destination": "Pune"}),
            ("storytelling", "storytelling_agent", "storytelling_result", {"fort": "Raigad", "story": "story", "context": "", "sources": [], "documents": []}, {"fort": "Raigad"}),
            ("fort_comparison", "fort_comparison_agent", "comparison_result", {"fort_a": "Raigad", "fort_b": "Sinhagad", "comparison": "compare"}, {"fort_a": "Raigad", "fort_b": "Sinhagad"}),
        ]
        for intent, agent_name, result_key, result, params in cases:
            with self.subTest(intent=intent):
                decision = {"intent": intent, "needs_clarification": False, **params}
                with patch("app.graph.orchestrator_agent", return_value=decision) as orchestrator:
                    with patch(f"app.graph.{agent_name}", return_value=result) as agent:
                        state = graph.invoke({"query": "natural request"})
                orchestrator.assert_called_once_with("natural request")
                agent.assert_called_once()
                self.assertEqual(state[result_key], result)

    def test_explicit_intent_bypasses_orchestrator(self):
        with patch("app.graph.orchestrator_agent") as orchestrator:
            with patch("app.graph.fort_recommendation_agent", return_value={"recommendations": "Raigad"}):
                state = graph.invoke({"intent": "fort_recommendation", "interests": "history"})
        orchestrator.assert_not_called()
        self.assertEqual(state["recommendation_result"], {"recommendations": "Raigad"})

    def test_combined_request_runs_recommendation_then_itinerary(self):
        decision = {"intent": "recommendation_then_itinerary", "needs_clarification": False, "days": 2}
        recommendation = {"recommendations": "Raigad Fort"}
        itinerary = {"destination": "Raigad Fort", "days": 2, "travel_style": "Balanced", "itinerary": "plan"}
        with patch("app.graph.orchestrator_agent", return_value=decision):
            with patch("app.graph.fort_recommendation_agent", return_value=recommendation) as recommender:
                with patch("app.graph.itinerary_planning_agent", return_value=itinerary) as planner:
                    state = graph.invoke({"query": "Recommend a fort and plan an itinerary", "days": 2})
        recommender.assert_called_once()
        planner.assert_called_once_with(destination="Raigad Fort", days=2, travel_style="Balanced")
        self.assertEqual(state["recommendation_result"], recommendation)
        self.assertEqual(state["itinerary_result"], itinerary)

    def test_ambiguous_request_does_not_call_specialized_agent(self):
        decision = {
            "intent": "clarification",
            "needs_clarification": True,
            "clarification_question": "Which fort or travel task do you mean?",
        }
        with patch("app.graph.orchestrator_agent", return_value=decision):
            with patch("app.graph.historical_question_agent") as history:
                with patch("app.graph.fort_recommendation_agent") as recommendation:
                    state = graph.invoke({"query": "Tell me about forts"})
        history.assert_not_called()
        recommendation.assert_not_called()
        self.assertEqual(state["clarification_question"], decision["clarification_question"])

    def test_chat_endpoint_does_not_expose_internal_retrieval_state(self):
        response_state = {
            "intent": "historical_question",
            "historical_answer": {
                "question": "q", "answer": "a", "context": "private context",
                "sources": ["forts.txt"], "documents": [{"metadata": {"source": "forts.txt"}}],
            },
            "source_names": ["forts.txt"],
            "current_agent_output": {"internal": "not exposed"},
        }
        with patch.object(main.graph, "invoke", return_value=response_state):
            response = TestClient(main.app).post("/chat", json={"query": "What happened at Raigad?"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {
            "intent": "historical_question",
            "result": {"question": "q", "answer": "a"},
            "sources": ["forts.txt"],
        })
    def test_chat_endpoint_uses_automatic_intent_and_returns_result_only(self):
        response_state = {
            "intent": "fort_recommendation",
            "current_agent_output": {"recommendations": "Raigad"},
            "source_names": [],
            "recommendation_result": {"recommendations": "Raigad"},
        }
        with patch.object(main.graph, "invoke", return_value=response_state) as invoke:
            response = TestClient(main.app).post("/chat", json={"query": "Suggest forts for history"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {
            "intent": "fort_recommendation",
            "result": {"recommendations": "Raigad"},
            "sources": [],
        })
        invoke.assert_called_once_with({"query": "Suggest forts for history"})


if __name__ == "__main__":
    unittest.main()
