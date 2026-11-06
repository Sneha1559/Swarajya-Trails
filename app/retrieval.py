from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

PROJECT_ROOT = Path(__file__).resolve().parent.parent
INDEX_FOLDER = PROJECT_ROOT / "data" / "faiss_index"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
RETRIEVAL_COUNT = 4


class KnowledgeBaseNotFoundError(FileNotFoundError):
    """Raised when the persisted FAISS index directory is missing."""


@dataclass(frozen=True)
class RetrievalResult:
    documents: list
    context: str
    sources: list[str]


@lru_cache(maxsize=1)
def _load_vector_store():
    if not INDEX_FOLDER.exists():
        raise KnowledgeBaseNotFoundError(str(INDEX_FOLDER))

    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
    return FAISS.load_local(
        str(INDEX_FOLDER),
        embeddings,
        allow_dangerous_deserialization=True,
    )


def retrieve_history(question: str) -> RetrievalResult:
    """Retrieve historical documents and formatted context for a question."""
    retrieved_docs = _load_vector_store().similarity_search(
        question,
        k=RETRIEVAL_COUNT,
    )
    context = (chr(10) * 2).join(doc.page_content for doc in retrieved_docs)
    sources = list(dict.fromkeys(
        str(doc.metadata.get("source", "Unknown source"))
        for doc in retrieved_docs
    ))
    return RetrievalResult(
        documents=retrieved_docs,
        context=context,
        sources=sources,
    )