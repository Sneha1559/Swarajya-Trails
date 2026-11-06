import unittest

from app.state import AgentState, ItineraryResult, FortRecommendationResult


class AgentStateTests(unittest.TestCase):
    def test_individual_request_state_initialization(self):
        state: AgentState = {
            "intent": "historical_question",
            "question": "What is Raigad Fort known for?",
        }

        self.assertEqual(state["intent"], "historical_question")
        self.assertIn("question", state)
        self.assertNotIn("recommendation_result", state)

    def test_recommendation_result_can_become_itinerary_input(self):
        state: AgentState = {
            "intent": "recommendation_then_itinerary",
            "interests": "Maratha history",
            "difficulty": "Easy",
            "region": "Pune",
        }
        state["recommendation_result"] = FortRecommendationResult(
            recommendations="Raigad Fort"
        )

        # The workflow can set the chosen result as the itinerary destination.
        state["destination"] = state["recommendation_result"]["recommendations"]
        self.assertEqual(state["destination"], "Raigad Fort")

        state["itinerary_result"] = ItineraryResult(
            destination=state["destination"],
            days=2,
            travel_style="Heritage",
            itinerary="Day 1 ...",
        )
        self.assertEqual(
            state["itinerary_result"]["destination"],
            state["recommendation_result"]["recommendations"],
        )
        self.assertEqual(state["itinerary_result"]["days"], 2)

    def test_state_accepts_retrieval_and_error_updates(self):
        state: AgentState = {}
        state["retrieved_documents"] = [
            {"page_content": "Fort history", "metadata": {"source": "forts.txt"}}
        ]
        state["retrieved_context"] = "Fort history"
        state["source_names"] = ["forts.txt"]
        state["error"] = {"message": "Agent failed", "agent": "history"}

        self.assertEqual(state["retrieved_documents"][0]["metadata"]["source"], "forts.txt")
        self.assertEqual(state["source_names"], ["forts.txt"])
        self.assertEqual(state["error"]["agent"], "history")


if __name__ == "__main__":
    unittest.main()