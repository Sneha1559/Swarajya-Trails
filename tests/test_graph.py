import unittest
from unittest.mock import patch

from app.graph import graph


class GraphWorkflowTests(unittest.TestCase):
    def test_historical_question_intent(self):
        result = {"question": "q", "answer": "a", "context": "ctx", "sources": ["s"], "documents": []}
        with patch("app.graph.historical_question_agent", return_value=result):
            state = graph.invoke({"intent": "historical_question", "question": "q"})
        self.assertEqual(state["historical_answer"], result)
        self.assertEqual(state["retrieved_context"], "ctx")
        self.assertEqual(state["source_names"], ["s"])

    def test_fort_recommendation_intent(self):
        result = {"recommendations": "Raigad Fort"}
        with patch("app.graph.fort_recommendation_agent", return_value=result) as agent:
            state = graph.invoke({"intent": "fort_recommendation", "region": "Pune"})
        agent.assert_called_once_with(interests="History and heritage", difficulty="Any", region="Pune")
        self.assertEqual(state["recommendation_result"], result)

    def test_itinerary_intent_uses_explicit_destination(self):
        result = {"destination": "Raigad Fort", "days": 2, "travel_style": "Balanced", "itinerary": "plan"}
        with patch("app.graph.itinerary_planning_agent", return_value=result) as agent:
            state = graph.invoke({"intent": "itinerary_planning", "destination": "Raigad Fort", "days": 2})
        agent.assert_called_once_with(destination="Raigad Fort", days=2, travel_style="Balanced")
        self.assertEqual(state["itinerary_result"], result)

    def test_storytelling_intent(self):
        result = {"fort": "Raigad", "story": "story", "context": "ctx", "sources": ["s"], "documents": []}
        with patch("app.graph.storytelling_agent", return_value=result):
            state = graph.invoke({"intent": "storytelling", "fort": "Raigad"})
        self.assertEqual(state["storytelling_result"], result)
        self.assertEqual(state["retrieved_documents"], [])

    def test_fort_comparison_intent(self):
        result = {"fort_a": "Raigad", "fort_b": "Sinhagad", "comparison": "comparison"}
        with patch("app.graph.fort_comparison_agent", return_value=result) as agent:
            state = graph.invoke({"intent": "fort_comparison", "fort_a": "Raigad", "fort_b": "Sinhagad"})
        agent.assert_called_once_with("Raigad", "Sinhagad")
        self.assertEqual(state["comparison_result"], result)

    def test_recommendation_result_handoff_to_itinerary(self):
        recommendation = {"recommendations": "Raigad Fort"}
        itinerary = {"destination": "Raigad Fort", "days": 1, "travel_style": "Balanced", "itinerary": "plan"}
        with patch("app.graph.fort_recommendation_agent", return_value=recommendation):
            with patch("app.graph.itinerary_planning_agent", return_value=itinerary) as planner:
                state = graph.invoke({"intent": "recommendation_then_itinerary", "days": 1})
        planner.assert_called_once_with(destination="Raigad Fort", days=1, travel_style="Balanced")
        self.assertEqual(state["recommendation_result"], recommendation)
        self.assertEqual(state["itinerary_result"], itinerary)

    def test_missing_recommendation_destination_is_reported(self):
        recommendation = {"recommendations": "  "}
        with patch("app.graph.fort_recommendation_agent", return_value=recommendation):
            with patch("app.graph.itinerary_planning_agent") as planner:
                state = graph.invoke({"intent": "recommendation_then_itinerary"})
        planner.assert_not_called()
        self.assertIn("No destination", state["error"]["message"])
        self.assertEqual(state["error"]["agent"], "itinerary_planning")

    def test_unknown_intent_returns_error(self):
        state = graph.invoke({"intent": "not_supported"})
        self.assertEqual(state["error"]["agent"], "routing")
        self.assertEqual(state["error"]["message"], "Unknown or missing intent.")

    def test_agent_failure_is_recorded_without_crashing_graph(self):
        with patch("app.graph.storytelling_agent", side_effect=RuntimeError("test failure")):
            state = graph.invoke({"intent": "storytelling", "fort": "Raigad"})
        self.assertEqual(state["error"]["agent"], "storytelling")
        self.assertEqual(state["error"]["details"], "RuntimeError")
        self.assertEqual(state["error"]["message"], "Storytelling agent failed.")


if __name__ == "__main__":
    unittest.main()