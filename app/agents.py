from app.llm import get_llm
from app.retrieval import retrieve_history


def _document_metadata(retrieval):
    return [
        {
            "page_content": document.page_content,
            "metadata": dict(document.metadata),
        }
        for document in retrieval.documents
    ]


def historical_question_agent(question: str) -> dict:
    """Answer a historical question using retrieved knowledge-base context."""
    retrieval = retrieve_history(question)
    if not retrieval.documents:
        return {
            "question": question,
            "answer": "I could not find relevant information in the historical documents.",
            "context": retrieval.context,
            "sources": [],
            "documents": [],
        }

    prompt = f"""
You are \u0936\u093f\u0935\u0926\u0942\u0924 (Shivdoot), the historical AI guide for Swarajya Trails.
Answer the user's question using only the historical context below.
If the context does not contain the answer, say that the provided
documents do not contain enough information. Do not invent historical facts.

Historical context:
{retrieval.context}

User question:
{question}

Give a clear, easy-to-understand answer.
"""
    response = get_llm(0.2).invoke(prompt)
    return {
        "question": question,
        "answer": response.content,
        "context": retrieval.context,
        "sources": retrieval.sources,
        "documents": _document_metadata(retrieval),
    }


def fort_recommendation_agent(
    interests: str = "History and heritage",
    difficulty: str = "Any",
    region: str = "Maharashtra",
) -> dict:
    """Recommend forts using the current preference-based prompt."""
    prompt = f"""
You are Swarajya Trails, a heritage travel assistant for Maharashtra.
Recommend three suitable forts based on these preferences:
Interests: {interests}
Trekking difficulty: {difficulty}
Preferred region: {region}

For each fort, provide its name and location if known, historical
significance, why it matches the preferences, and a practical travel
consideration. Do not invent exact opening hours, ticket prices, or
current travel conditions. Mark details that need verification.
"""
    response = get_llm(0.3).invoke(prompt)
    return {"recommendations": response.content}


def itinerary_planning_agent(
    destination: str,
    days: int = 1,
    travel_style: str = "Balanced",
) -> dict:
    """Generate the current practical itinerary for a destination."""
    prompt = f"""
You are Swarajya Trails, a Maharashtra heritage travel assistant.
Create a practical {days}-day itinerary for {destination}.
Travel style: {travel_style}

For each day, suggest morning, afternoon and evening activities,
relevant historical attractions, a sensible visit order, short historical
explanations, and practical travel and safety tips. Do not invent exact
opening hours, ticket prices, travel times, or current transport availability.
Mention details travellers should verify. Format with headings and bullets.
"""
    response = get_llm(0.4).invoke(prompt)
    return {
        "destination": destination,
        "days": days,
        "travel_style": travel_style,
        "itinerary": response.content,
    }


def storytelling_agent(fort: str) -> dict:
    """Create a historical fort story and include retrieved context when available."""
    sources = []
    documents = []
    context = ""
    try:
        retrieval = retrieve_history(fort)
        if retrieval.documents:
            sources = retrieval.sources
            documents = _document_metadata(retrieval)
            context = retrieval.context
    except Exception:
        # Story generation remains available if the optional knowledge base is unavailable.
        pass

    prompt = f"""
Create an engaging historical narrative about {fort} in Maharashtra.
Include historical background, strategic importance, and notable events or
people when supported by reliable knowledge. Do not invent quotations,
conversations, or historical events. Label imagined scenes as creative
reconstructions. Use accessible English and a suitable title.
"""
    if context:
        prompt += f"""
Use the following historical context for factual grounding where relevant:
{context}
"""

    response = get_llm(0.5).invoke(prompt)
    return {
        "fort": fort,
        "story": response.content,
        "context": context,
        "sources": sources,
        "documents": documents,
    }


def fort_comparison_agent(fort_a: str, fort_b: str) -> dict:
    """Compare two forts using the current heritage-traveller criteria."""
    prompt = f"""
Compare these two Maharashtra forts for a heritage traveller:
Fort A: {fort_a}
Fort B: {fort_b}

Compare historical significance, architecture, heritage experience,
trekking difficulty if reliably known, and the type of traveller each
fort may suit. Summarise the differences. Do not invent historical facts,
current conditions, or exact distances. Mention information needing verification.
Use a clear table if suitable.
"""
    response = get_llm(0.3).invoke(prompt)
    return {
        "fort_a": fort_a,
        "fort_b": fort_b,
        "comparison": response.content,
    }