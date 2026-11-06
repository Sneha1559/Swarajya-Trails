from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.llm import get_llm
from app.graph import graph


PROJECT_ROOT = Path(__file__).resolve().parent
load_dotenv(PROJECT_ROOT / ".env", override=True)

app = FastAPI(
    title="Swarajya Trails API",
    description="AI-powered Heritage Travel Assistant for Maharashtra",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
def _graph_result(state, result_key: str, operation: str, status_code: int):
    error = state.get("error")
    if error:
        details = error.get("details")
        if details == "KnowledgeBaseNotFoundError":
            raise HTTPException(
                status_code=500,
                detail="Knowledge base not found. Run build_knowledge_base.py first.",
            )
        if details == "HTTPException":
            raise HTTPException(
                status_code=500,
                detail="GROQ_API_KEY is missing. Check the .env file in the project root.",
            )
        raise HTTPException(
            status_code=status_code,
            detail=f"{operation}: {details or error.get('message', 'Agent graph failed.')}",
        )

    result = state.get(result_key)
    if not isinstance(result, dict):
        raise HTTPException(
            status_code=status_code,
            detail=f"{operation}: graph returned no result.",
        )
    return result

@app.get("/")
def home():
    return {
        "message": "Welcome to Swarajya Trails!",
        "status": "Backend is running successfully",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/test-ai")
def test_ai():
    try:
        response = get_llm(0.3).invoke(
            "In two sentences, introduce the historical forts of Maharashtra."
        )
        return {"answer": response.content}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Groq AI request failed: {exc}")


@app.get("/ask-history")
def ask_history(question: str = Query(..., min_length=3, max_length=1000)):
    try:
        state = graph.invoke({"intent": "historical_question", "question": question})
        result = _graph_result(
            state,
            "historical_answer",
            "Historical question answering failed",
            500,
        )
        return {
            "question": result["question"],
            "answer": result["answer"],
            "sources": result["sources"],
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Historical question answering failed: {exc}",
        )

class FortRecommendationRequest(BaseModel):
    interests: str = "History and heritage"
    difficulty: str = "Any"
    region: str = "Maharashtra"


@app.post("/recommend-forts")
def recommend_forts(request: FortRecommendationRequest):
    try:
        state = graph.invoke({
            "intent": "fort_recommendation",
            "interests": request.interests,
            "difficulty": request.difficulty,
            "region": request.region,
        })
        result = _graph_result(state, "recommendation_result", "Fort recommendation failed", 502)
        return {
            "preferences": request.model_dump(),
            "recommendations": result["recommendations"],
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Fort recommendation failed: {exc}")

class ItineraryRequest(BaseModel):
    destination: str = Field(min_length=2, max_length=200)
    days: int = Field(default=1, ge=1, le=14)
    travel_style: str = Field(default="Balanced", max_length=100)


@app.post("/plan-itinerary")
def plan_itinerary(request: ItineraryRequest):
    try:
        state = graph.invoke({
            "intent": "itinerary_planning",
            "destination": request.destination,
            "days": request.days,
            "travel_style": request.travel_style,
        })
        result = _graph_result(state, "itinerary_result", "Itinerary generation failed", 502)
        return {
            "destination": result["destination"],
            "days": result["days"],
            "travel_style": result["travel_style"],
            "itinerary": result["itinerary"],
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Itinerary generation failed: {exc}")

class StoryRequest(BaseModel):
    fort: str = Field(min_length=2, max_length=200)


@app.post("/tell-story")
def tell_story(request: StoryRequest):
    try:
        state = graph.invoke({"intent": "storytelling", "fort": request.fort})
        result = _graph_result(state, "storytelling_result", "Story generation failed", 502)
        return {"fort": result["fort"], "story": result["story"]}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Story generation failed: {exc}")

class CompareFortsRequest(BaseModel):
    fort_a: str = Field(min_length=2, max_length=200)
    fort_b: str = Field(min_length=2, max_length=200)


@app.post("/compare-forts")
def compare_forts(request: CompareFortsRequest):
    try:
        state = graph.invoke({
            "intent": "fort_comparison",
            "fort_a": request.fort_a,
            "fort_b": request.fort_b,
        })
        result = _graph_result(state, "comparison_result", "Fort comparison failed", 502)
        return {
            "fort_a": result["fort_a"],
            "fort_b": result["fort_b"],
            "comparison": result["comparison"],
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Fort comparison failed: {exc}")
