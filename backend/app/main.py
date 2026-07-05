import sys

# Prefer pysqlite3 if available (packaging on some hosts). Fall back to
# the stdlib `sqlite3` when it's not installed to avoid crashing startup.
try:
    import pysqlite3  # type: ignore
    # Replace the stdlib sqlite3 module with pysqlite3 implementation
    # so downstream code can import `sqlite3` as usual.
    sys.modules["sqlite3"] = sys.modules.pop("pysqlite3")
except Exception:
    # pysqlite3 not available — continue using stdlib sqlite3
    pass

import asyncio
import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import upload, query, demo, analytics, auth
from app.utils.storage_reset import ensure_storage_reset, storage_reset_loop


load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / '.env')

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

cors_origins = os.getenv(
    "CORS_ORIGINS",
    "https://corelign-k4hs.vercel.app,http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174",
)
allowed_origins = [origin.strip() for origin in cors_origins.split(",") if origin.strip()]
cors_origin_regex = os.getenv(
    "CORS_ORIGIN_REGEX",
    r"^https://.*\.vercel\.app$|^https://.*\.railway\.app$|^https://.*$|^http://localhost:5173$|^http://127\.0\.0\.1:5173$|^http://localhost:5174$|^http://127\.0\.0\.1:5174$|^http://192\.168\.\d+\.\d+:517[34]$|^http://172\.28\.\d+\.\d+:517[34]$",
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
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])

@app.get("/")
def health_check():
    return {"status": "running"}