
from pathlib import Path

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

PROJECT_ROOT = Path(__file__).resolve().parent
FORTS_FOLDER = PROJECT_ROOT / "data" / "forts"
INDEX_FOLDER = PROJECT_ROOT / "data" / "faiss_index"


def main():
    text_files = list(FORTS_FOLDER.glob("*.txt"))

    if not text_files:
        print(f"No text files found in {FORTS_FOLDER}")
        return

    documents = []

    for file_path in text_files:
        text = file_path.read_text(encoding="utf-8")

        if text.strip():
            documents.append(
                Document(
                    page_content=text,
                    metadata={"source": file_path.name},
                )
            )

    if not documents:
        print("No usable text found.")
        return

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=120,
    )

    chunks = splitter.split_documents(documents)
    print(f"Documents loaded: {len(documents)}")
    print(f"Text chunks created: {len(chunks)}")

    print("Loading embedding model...")
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    print("Building FAISS index...")
    vector_store = FAISS.from_documents(chunks, embeddings)

    INDEX_FOLDER.mkdir(parents=True, exist_ok=True)
    vector_store.save_local(str(INDEX_FOLDER))

    print(f"Knowledge base saved to: {INDEX_FOLDER}")


if __name__ == "__main__":
    main()
