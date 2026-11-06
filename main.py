from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.llm import get_llm
from app.agents import (
    fort_comparison_agent,
    fort_recommendation_agent,
    historical_question_agent,
    itinerary_planning_agent,
    storytelling_agent,
)
from app.retrieval import KnowledgeBaseNotFoundError


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
        result = historical_question_agent(question)
        return {
            "question": result["question"],
            "answer": result["answer"],
            "sources": result["sources"],
        }
    except KnowledgeBaseNotFoundError:
        raise HTTPException(
            status_code=500,
            detail="Knowledge base not found. Run build_knowledge_base.py first.",
        )
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
        result = fort_recommendation_agent(
            interests=request.interests,
            difficulty=request.difficulty,
            region=request.region,
        )
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
        return itinerary_planning_agent(
            destination=request.destination,
            days=request.days,
            travel_style=request.travel_style,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Itinerary generation failed: {exc}")

class StoryRequest(BaseModel):
    fort: str = Field(min_length=2, max_length=200)


@app.post("/tell-story")
def tell_story(request: StoryRequest):
    try:
        result = storytelling_agent(fort=request.fort)
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
        return fort_comparison_agent(
            fort_a=request.fort_a,
            fort_b=request.fort_b,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Fort comparison failed: {exc}")
