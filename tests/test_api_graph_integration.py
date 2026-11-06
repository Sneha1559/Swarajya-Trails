import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

import main


class ApiGraphIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(main.app)

    def test_ask_history_graph_input_and_response_shape(self):
        result = {"question": "q", "answer": "a", "context": "internal", "sources": ["s"], "documents": []}
        with patch.object(main.graph, "invoke", return_value={"historical_answer": result}) as invoke:
            response = self.client.get("/ask-history", params={"question": "What happened?"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"question": "q", "answer": "a", "sources": ["s"]})
        invoke.assert_called_once_with({"intent": "historical_question", "question": "What happened?"})

    def test_recommend_forts_graph_input_and_response_shape(self):
        result = {"recommendations": "Raigad Fort"}
        with patch.object(main.graph, "invoke", return_value={"recommendation_result": result}) as invoke:
            response = self.client.post("/recommend-forts", json={"interests": "history", "difficulty": "Easy", "region": "Pune"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {
            "preferences": {"interests": "history", "difficulty": "Easy", "region": "Pune"},
            "recommendations": "Raigad Fort",
        })
        invoke.assert_called_once_with({
            "intent": "fort_recommendation", "interests": "history", "difficulty": "Easy", "region": "Pune"
        })

    def test_plan_itinerary_graph_input_and_response_shape(self):
        result = {"destination": "Pune", "days": 3, "travel_style": "Heritage", "itinerary": "Plan"}
        with patch.object(main.graph, "invoke", return_value={"itinerary_result": result}) as invoke:
            response = self.client.post("/plan-itinerary", json={"destination": "Pune", "days": 3, "travel_style": "Heritage"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), result)
        invoke.assert_called_once_with({
            "intent": "itinerary_planning", "destination": "Pune", "days": 3, "travel_style": "Heritage"
        })

    def test_tell_story_graph_input_and_response_shape(self):
        result = {"fort": "Raigad", "story": "Chronicle", "context": "internal", "sources": ["s"], "documents": []}
        with patch.object(main.graph, "invoke", return_value={"storytelling_result": result}) as invoke:
            response = self.client.post("/tell-story", json={"fort": "Raigad"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"fort": "Raigad", "story": "Chronicle"})
        invoke.assert_called_once_with({"intent": "storytelling", "fort": "Raigad"})

    def test_compare_forts_graph_input_and_response_shape(self):
        result = {"fort_a": "Raigad", "fort_b": "Sinhagad", "comparison": "Differences"}
        with patch.object(main.graph, "invoke", return_value={"comparison_result": result}) as invoke:
            response = self.client.post("/compare-forts", json={"fort_a": "Raigad", "fort_b": "Sinhagad"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), result)
        invoke.assert_called_once_with({
            "intent": "fort_comparison", "fort_a": "Raigad", "fort_b": "Sinhagad"
        })

    def test_graph_errors_use_endpoint_error_contracts(self):
        cases = [
            ("GET", "/ask-history?question=What%20happened%3F", 500, "Historical question answering failed:"),
            ("POST", "/recommend-forts", 502, "Fort recommendation failed:"),
            ("POST", "/plan-itinerary", 502, "Itinerary generation failed:"),
            ("POST", "/tell-story", 502, "Story generation failed:"),
            ("POST", "/compare-forts", 502, "Fort comparison failed:"),
        ]
        error_state = {"error": {"message": "Agent failed", "agent": "test", "details": "RuntimeError"}}
        request_bodies = {
            "/recommend-forts": {},
            "/plan-itinerary": {"destination": "Pune"},
            "/tell-story": {"fort": "Raigad"},
            "/compare-forts": {"fort_a": "Raigad", "fort_b": "Sinhagad"},
        }
        for method, path, status, prefix in cases:
            with self.subTest(path=path), patch.object(main.graph, "invoke", return_value=error_state):
                response = (
                    self.client.get(path)
                    if method == "GET"
                    else self.client.post(path, json=request_bodies[path])
                )
                self.assertEqual(response.status_code, status)
                self.assertTrue(response.json()["detail"].startswith(prefix))

    def test_missing_knowledge_base_keeps_history_error(self):
        error_state = {"error": {"message": "Historical question agent failed.", "agent": "historical_question", "details": "KnowledgeBaseNotFoundError"}}
        with patch.object(main.graph, "invoke", return_value=error_state):
            response = self.client.get("/ask-history", params={"question": "What happened?"})
        self.assertEqual(response.status_code, 500)
        self.assertEqual(response.json()["detail"], "Knowledge base not found. Run build_knowledge_base.py first.")

    def test_graph_http_exception_preserves_server_error(self):
        error_state = {"error": {"message": "Agent failed", "agent": "fort_recommendation", "details": "HTTPException"}}
        with patch.object(main.graph, "invoke", return_value=error_state):
            response = self.client.post("/recommend-forts", json={})
        self.assertEqual(response.status_code, 500)
        self.assertEqual(
            response.json()["detail"],
            "GROQ_API_KEY is missing. Check the .env file in the project root.",
        )

    def test_missing_graph_result_is_not_success(self):
        with patch.object(main.graph, "invoke", return_value={}):
            response = self.client.post("/recommend-forts", json={})
        self.assertEqual(response.status_code, 502)
        self.assertTrue(response.json()["detail"].startswith("Fort recommendation failed:"))
    def test_existing_root_and_health_endpoints(self):
        root_response = self.client.get("/")
        health_response = self.client.get("/health")
        self.assertEqual(root_response.status_code, 200)
        self.assertEqual(root_response.json()["status"], "Backend is running successfully")
        self.assertEqual(health_response.status_code, 200)
        self.assertEqual(health_response.json(), {"status": "healthy"})


if __name__ == "__main__":
    unittest.main()