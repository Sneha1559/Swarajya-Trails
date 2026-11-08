from langgraph.graph import END, START, StateGraph

from app.agents import (
    fort_comparison_agent,
    fort_recommendation_agent,
    historical_question_agent,
    itinerary_planning_agent,
    storytelling_agent,
)
from app.orchestrator import orchestrator_agent
from app.state import AgentState

COMBINED_INTENT = "recommendation_then_itinerary"


def _error_update(agent: str, message: str, error: Exception | None = None) -> AgentState:
    update: AgentState = {"error": {"message": message, "agent": agent}}
    if error is not None:
        update["error"]["details"] = type(error).__name__
    return update


def _required_text(state: AgentState, key: str) -> str | None:
    value = state.get(key)
    if isinstance(value, str) and value.strip():
        return value.strip()
    return None


def historical_question_node(state: AgentState) -> AgentState:
    question = _required_text(state, "question") or _required_text(state, "query")
    if question is None:
        return _error_update("historical_question", "A question is required.")
    try:
        result = historical_question_agent(question)
        return {
            "historical_answer": result,
            "retrieved_documents": result["documents"],
            "retrieved_context": result["context"],
            "source_names": result["sources"],
            "current_agent_output": result,
        }
    except Exception as exc:
        return _error_update("historical_question", "Historical question agent failed.", exc)


def fort_recommendation_node(state: AgentState) -> AgentState:
    try:
        result = fort_recommendation_agent(
            interests=state.get("interests", "History and heritage"),
            difficulty=state.get("difficulty", "Any"),
            region=state.get("region", "Maharashtra"),
        )
        return {"recommendation_result": result, "current_agent_output": result}
    except Exception as exc:
        return _error_update("fort_recommendation", "Fort recommendation agent failed.", exc)


def itinerary_planning_node(state: AgentState) -> AgentState:
    destination = _required_text(state, "destination")
    if destination is None:
        recommendation = state.get("recommendation_result")
        if isinstance(recommendation, dict):
            destination = _required_text(recommendation, "recommendations")
    if destination is None:
        return _error_update(
            "itinerary_planning",
            "No destination was selected or available in the recommendation result.",
        )
    try:
        result = itinerary_planning_agent(
            destination=destination,
            days=state.get("days", 1),
            travel_style=state.get("travel_style", "Balanced"),
        )
        return {"itinerary_result": result, "current_agent_output": result}
    except Exception as exc:
        return _error_update("itinerary_planning", "Itinerary planning agent failed.", exc)


def storytelling_node(state: AgentState) -> AgentState:
    fort = _required_text(state, "fort")
    if fort is None:
        return _error_update("storytelling", "A fort is required for storytelling.")
    try:
        result = storytelling_agent(fort)
        return {
            "storytelling_result": result,
            "retrieved_documents": result["documents"],
            "retrieved_context": result["context"],
            "source_names": result["sources"],
            "current_agent_output": result,
        }
    except Exception as exc:
        return _error_update("storytelling", "Storytelling agent failed.", exc)


def fort_comparison_node(state: AgentState) -> AgentState:
    fort_a = _required_text(state, "fort_a")
    fort_b = _required_text(state, "fort_b")
    if fort_a is None or fort_b is None:
        return _error_update("fort_comparison", "Two forts are required for comparison.")
    try:
        result = fort_comparison_agent(fort_a, fort_b)
        return {"comparison_result": result, "current_agent_output": result}
    except Exception as exc:
        return _error_update("fort_comparison", "Fort comparison agent failed.", exc)


def orchestrator_node(state: AgentState) -> AgentState:
    query = _required_text(state, "query")
    if query is None:
        return _error_update("orchestrator", "A natural-language query is required.")
    try:
        decision = orchestrator_agent(query)
        update: AgentState = {"orchestration_result": decision}
        if decision.get("needs_clarification") or decision.get("intent") == "clarification":
            clarification = decision.get("clarification_question") or "Could you clarify what you would like help with?"
            update.update({
                "intent": "clarification",
                "clarification_question": clarification,
                "current_agent_output": clarification,
            })
            return update

        update["intent"] = decision["intent"]
        for key in (
            "question", "fort", "fort_a", "fort_b", "days", "travel_style",
            "interests", "difficulty", "region", "destination",
        ):
            if decision.get(key) is not None:
                update[key] = decision[key]
        return update
    except Exception as exc:
        return _error_update("orchestrator", "Orchestrator agent failed.", exc)


def unknown_intent_node(state: AgentState) -> AgentState:
    intent = state.get("intent")
    return _error_update(
        "routing",
        "Unknown or missing intent.",
        ValueError(f"Unsupported intent: {intent!r}"),
    )


def route_intent(state: AgentState) -> str:
    routes = {
        "historical_question": "historical_question",
        "fort_recommendation": "fort_recommendation",
        "itinerary_planning": "itinerary_planning",
        "storytelling": "storytelling",
        "fort_comparison": "fort_comparison",
        COMBINED_INTENT: "fort_recommendation",
    }
    intent = state.get("intent")
    if isinstance(intent, str) and intent in routes:
        return routes[intent]
    if intent is None and _required_text(state, "query"):
        return "orchestrator"
    return "unknown_intent"


def route_after_orchestrator(state: AgentState) -> str:
    if state.get("error") or state.get("clarification_question"):
        return "end"
    return route_intent(state)


def route_after_recommendation(state: AgentState) -> str:
    if state.get("error"):
        return "end"
    if state.get("intent") == COMBINED_INTENT:
        return "itinerary_planning"
    return "end"


def build_graph():
    """Build and compile the standalone multi-agent workflow."""
    workflow = StateGraph(AgentState)
    workflow.add_node("historical_question", historical_question_node)
    workflow.add_node("fort_recommendation", fort_recommendation_node)
    workflow.add_node("itinerary_planning", itinerary_planning_node)
    workflow.add_node("storytelling", storytelling_node)
    workflow.add_node("fort_comparison", fort_comparison_node)
    workflow.add_node("orchestrator", orchestrator_node)
    workflow.add_node("unknown_intent", unknown_intent_node)

    workflow.add_conditional_edges(
        START,
        route_intent,
        {
            "historical_question": "historical_question",
            "fort_recommendation": "fort_recommendation",
            "itinerary_planning": "itinerary_planning",
            "storytelling": "storytelling",
            "fort_comparison": "fort_comparison",
            "recommendation_then_itinerary": "fort_recommendation",
            "orchestrator": "orchestrator",
            "unknown_intent": "unknown_intent",
        },
    )
    workflow.add_conditional_edges(
        "orchestrator",
        route_after_orchestrator,
        {
            "historical_question": "historical_question",
            "fort_recommendation": "fort_recommendation",
            "itinerary_planning": "itinerary_planning",
            "storytelling": "storytelling",
            "fort_comparison": "fort_comparison",
            "recommendation_then_itinerary": "fort_recommendation",
            "unknown_intent": "unknown_intent",
            "end": END,
        },
    )
    workflow.add_conditional_edges(
        "fort_recommendation",
        route_after_recommendation,
        {"itinerary_planning": "itinerary_planning", "end": END},
    )
    for node in (
        "historical_question",
        "itinerary_planning",
        "storytelling",
        "fort_comparison",
        "unknown_intent",
    ):
        workflow.add_edge(node, END)
    return workflow.compile()


graph = build_graph()