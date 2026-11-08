import os

from fastapi import HTTPException
from langchain_groq import ChatGroq


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
