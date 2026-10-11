import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

PROJECT_ROOT = Path(__file__).resolve().parent
load_dotenv(PROJECT_ROOT / ".env", override=True)
INDEX_FOLDER = PROJECT_ROOT / "data" / "faiss_index"

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


def get_llm(temperature: float = 0.3):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is missing. Check the .env file in the project root.",
        )
    return ChatGroq(
        model="openai/gpt-oss-120b",
        temperature=temperature,
        api_key=api_key,
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
    if not INDEX_FOLDER.exists():
        raise HTTPException(
            status_code=500,
            detail="Knowledge base not found. Run build_knowledge_base.py first.",
        )

    try:
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        vector_store = FAISS.load_local(
            str(INDEX_FOLDER),
            embeddings,
            allow_dangerous_deserialization=True,
        )
        retrieved_docs = vector_store.similarity_search(question, k=4)

        if not retrieved_docs:
            return {
                "question": question,
                "answer": "I could not find relevant information in the historical documents.",
                "sources": [],
            }

        context = "\n\n".join(doc.page_content for doc in retrieved_docs)
        prompt = f"""
You are शिवदूत (Shivdoot), the historical AI guide for Swarajya Trails.
Answer the user's question using only the historical context below.
If the context does not contain the answer, say that the provided
documents do not contain enough information. Do not invent historical facts.

Historical context:
{context}

User question:
{question}

Give a clear, easy-to-understand answer.
"""
        response = get_llm(0.2).invoke(prompt)
        sources = list(dict.fromkeys(
            str(doc.metadata.get("source", "Unknown source"))
            for doc in retrieved_docs
        ))
        return {
            "question": question,
            "answer": response.content,
            "sources": sources,
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
        prompt = f"""
You are Swarajya Trails, a heritage travel assistant for Maharashtra.
Recommend three suitable forts based on these preferences:
Interests: {request.interests}
Trekking difficulty: {request.difficulty}
Preferred region: {request.region}

For each fort, provide its name and location if known, historical
significance, why it matches the preferences, and a practical travel
consideration. Do not invent exact opening hours, ticket prices, or
current travel conditions. Mark details that need verification.
"""
        response = get_llm(0.3).invoke(prompt)
        return {
            "preferences": request.model_dump(),
            "recommendations": response.content,
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
        prompt = f"""
You are Swarajya Trails, a Maharashtra heritage travel assistant.
Create a practical {request.days}-day itinerary for {request.destination}.
Travel style: {request.travel_style}

For each day, suggest morning, afternoon and evening activities,
relevant historical attractions, a sensible visit order, short historical
explanations, and practical travel and safety tips. Do not invent exact
opening hours, ticket prices, travel times, or current transport availability.
Mention details travellers should verify. Format with headings and bullets.
"""
        response = get_llm(0.4).invoke(prompt)
        return {
            "destination": request.destination,
            "days": request.days,
            "travel_style": request.travel_style,
            "itinerary": response.content,
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
        prompt = f"""
Create an engaging historical narrative about {request.fort} in Maharashtra.
Include historical background, strategic importance, and notable events or
people when supported by reliable knowledge. Do not invent quotations,
conversations, or historical events. Label imagined scenes as creative
reconstructions. Use accessible English and a suitable title.
"""
        response = get_llm(0.5).invoke(prompt)
        return {"fort": request.fort, "story": response.content}
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
        prompt = f"""
Compare these two Maharashtra forts for a heritage traveller:
Fort A: {request.fort_a}
Fort B: {request.fort_b}

Compare historical significance, architecture, heritage experience,
trekking difficulty if reliably known, and the type of traveller each
fort may suit. Summarise the differences. Do not invent historical facts,
current conditions, or exact distances. Mention information needing verification.
Use a clear table if suitable.
"""
        response = get_llm(0.3).invoke(prompt)
        return {
            "fort_a": request.fort_a,
            "fort_b": request.fort_b,
            "comparison": response.content,
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Fort comparison failed: {exc}")
