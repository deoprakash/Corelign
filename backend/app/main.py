import asyncio
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import upload, query, demo
from app.utils.storage_reset import ensure_storage_reset, storage_reset_loop


@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_storage_reset()
    reset_task = asyncio.create_task(storage_reset_loop())
    try:
        yield
    finally:
        reset_task.cancel()
        try:
            await reset_task
        except asyncio.CancelledError:
            pass

app = FastAPI(
    title="RAG Document System",
    description="Document ingestion and retrieval API",
    version="0.1.0",
    lifespan=lifespan,
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
app.include_router(demo.router, tags=["Demo"])

@app.get("/")
def health_check():
    return {"status": "running"}