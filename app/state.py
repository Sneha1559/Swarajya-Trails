from typing import Any, Literal, NotRequired, TypedDict


class RetrievedDocument(TypedDict):
    """Document shape returned by the existing retrieval-backed agents."""

    page_content: str
    metadata: dict[str, Any]


class HistoricalAnswerResult(TypedDict):
    question: str
    answer: str
    context: str
    sources: list[str]
    documents: list[RetrievedDocument]


class FortRecommendationResult(TypedDict):
    recommendations: str


class ItineraryResult(TypedDict):
    destination: str
    days: int
    travel_style: str
    itinerary: str


class StorytellingResult(TypedDict):
    fort: str
    story: str
    context: str
    sources: list[str]
    documents: list[RetrievedDocument]


class FortComparisonResult(TypedDict):
    fort_a: str
    fort_b: str
    comparison: str


AgentResult = (
    HistoricalAnswerResult
    | FortRecommendationResult
    | ItineraryResult
    | StorytellingResult
    | FortComparisonResult
)
AgentOutput = AgentResult | str
AgentIntent = Literal[
    "historical_question",
    "fort_recommendation",
    "itinerary_planning",
    "storytelling",
    "fort_comparison",
    "recommendation_then_itinerary",
    "clarification",
]


class StateError(TypedDict):
    message: str
    agent: NotRequired[str]
    details: NotRequired[str]


class AgentState(TypedDict, total=False):
    """Shared optional state for individual requests and combined workflows."""

    intent: AgentIntent
    query: str
    orchestration_result: dict[str, Any]
    clarification_question: str
    question: str
    interests: str
    difficulty: str
    region: str
    constraints: list[str]
    destination: str
    days: int
    travel_style: str
    fort: str
    fort_a: str
    fort_b: str
    retrieved_documents: list[RetrievedDocument]
    retrieved_context: str
    source_names: list[str]
    recommendation_result: FortRecommendationResult
    itinerary_result: ItineraryResult
    historical_answer: HistoricalAnswerResult
    storytelling_result: StorytellingResult
    comparison_result: FortComparisonResult
    current_agent_output: AgentOutput
    error: StateError