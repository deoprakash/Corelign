# from sentence_transformers import SentenceTransformer



# class Embedder:
#     def __init__(self, model_name = "all-MiniLM-L6-v2"):
#         self.model = SentenceTransformer(model_name)
    
#     def embed_texts(self, texts: list) -> list:
#         return self.model.encode(texts, convert_to_numpy = True)

#     def embed_query(self, query: str):
#         return self.model.encode([query], convert_to_numpy=True)
    
        
import os
from pathlib import Path

from dotenv import load_dotenv
from huggingface_hub import InferenceClient

load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")

HF_TOKEN = os.getenv("HF_TOKEN")
MODEL_ID = "sentence-transformers/all-MiniLM-L6-v2"


def _normalize_embedding(result):
    if hasattr(result, "tolist"):
        result = result.tolist()

    if isinstance(result, list) and result:
        first = result[0]
        if isinstance(first, list):
            return first
        if isinstance(first, (int, float)):
            return result
    raise RuntimeError(f"Unexpected Hugging Face embedding format: {result}")


def embed(text):
    if not HF_TOKEN:
        raise RuntimeError("HF_TOKEN is not set. Configure it in your environment.")

    client = InferenceClient(api_key=HF_TOKEN, timeout=30)
    result = client.feature_extraction(text, model=MODEL_ID)
    return _normalize_embedding(result)