from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, EmailStr


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


#-----------------------------
# Authentication Models
#-----------------------------


class RegisterRequest(BaseModel):
    email: EmailStr
    display_name: Optional[str] = None
    password: str
    device_info: Optional[Dict[str, Any]] = None


class LoginRequest(BaseModel):
    identifier: str
    password: str
    device_info: Optional[Dict[str, Any]] = None


class AuthUserResponse(BaseModel):
    id: str
    email: EmailStr
    display_name: Optional[str] = None
    created_at: Optional[datetime] = None
    last_login_at: Optional[datetime] = None
    device_info: Optional[Dict[str, Any]] = None


class AuthResponse(BaseModel):
    user: AuthUserResponse
    session_token: str
    session_id: str
    session_expires_at: datetime
