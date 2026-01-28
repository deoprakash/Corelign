import chromadb
from chromadb.config import Settings
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
CHROMA_PATH = os.path.join(BASE_DIR, "data", "chroma_db")


class ChromaStore:
    def __init__(self, collection_name="documents"):
        self.client = chromadb.Client(
            Settings(
                persist_directory=CHROMA_PATH,
                anonymized_telemetry=False
            )
        )

        self.collection = self.client.get_or_create_collection(
            name=collection_name
        )

    def add_chunks(self, chunks: list):
        documents, metadatas, ids = [], [], []

        for c in chunks:
            documents.append("\n".join(c["content"]))
            metadatas.append({
                "document_id": c["document_id"],
                "section": c["section"],
                "section_level": c["section_level"],
                "source_file": c["source_file"]
            })
            ids.append(f"{c['document_id']}::chunk::{c['chunk_id']}")

        self.collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )

    def get_chunks_by_ids(self, ids: list):
        return self.collection.get(ids=ids)
