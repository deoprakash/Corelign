from fastapi import FastAPI
from app.api import upload, query

app = FastAPI(
    title="RAG Document System",
    description="Document ingestion and retrieval API",
    version="0.1.0"
)

app.include_router(upload.router, prefix="/upload", tags=["Upload"])
app.include_router(query.router, tags=["Query"])

@app.get("/")
def health_check():
    return {"status": "running"}