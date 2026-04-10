from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from app.api import upload, query

app = FastAPI(
    title="RAG Document System",
    description="Document ingestion and retrieval API",
    version="0.1.0"
)

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
allowed_origins = [origin.strip() for origin in cors_origins.split(",") if origin.strip()]
cors_origin_regex = os.getenv(
    "CORS_ORIGIN_REGEX",
    r"^https://.*\.vercel\.app$|^http://localhost:5173$|^http://127\.0\.0\.1:5173$",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/upload", tags=["Upload"])
app.include_router(query.router, tags=["Query"])

@app.get("/")
def health_check():
    return {"status": "running"}