from pydantic import BaseModel
from typing import List, Optional

class UploadResponse(BaseModel):
    document_id: str
    status: str
    message: str

class QueryRequest(BaseModel):
    query_text: str
    document_id: Optional[str] = None
    top_k: int = 7

class QueryResponse(BaseModel):
    answer: str
    retrieved_chunks: List[str]


class DemoRequest(BaseModel):
    name: str
    email: str
    contact_number: str
    message: str


class DemoRequestResponse(BaseModel):
    status: str
    message: str