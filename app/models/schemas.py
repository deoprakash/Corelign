from pydantic import BaseModel
from typing import List, Optional

class UploadResponse(BaseModel):
    document_id: str
    status: str
    message: str

class QueryRequest(BaseModel):
    query_text: str
    document_id: Optional[str] = None
    top_k: int = 5

class QueryResponse(BaseModel):
    answer: str
    retrieved_chunks: List[str]