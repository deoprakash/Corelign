from fastapi import APIRouter, UploadFile, File, HTTPException, status
import uuid
import os
from typing import List, Optional
import numpy as np

from app.ingestion.docx_loader import (
    extract_text_from_docx,
    detect_headings,
    assign_contextual_levels,
)
from app.ingestion.pdf_loader import extract_text_from_pdf

from app.ingestion.chunking import (
    create_semantic_chunks,
    merge_empty_parent_chunks,
)

from app.embeddings.embedder import embed
from app.vector_store import chroma_store

from app.vector_store.index_instance import faiss_index
# from app.vector_store.faiss_index import FaissIndex


router = APIRouter()

DATA_DIR = os.getenv("DATA_DIR", "data")
UPLOAD_DIR = os.path.join(DATA_DIR, "raw_docs")
os.makedirs(UPLOAD_DIR, exist_ok=True)
CHUNK_SIZE = 500
CHUNK_OVERLAP = 120
MIN_SECTION_CHARS = 600


async def _ingest_single_file(file: UploadFile):
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file upload.",
        )

    document_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{document_id}_{file.filename}")

    with open(file_path, "wb") as f:
        f.write(await file.read())

    # ---------------------------
    # 2. Ingestion pipeline (DOCX or PDF)
    # ---------------------------
    filename_lower = file.filename.lower()

    if filename_lower.endswith(".pdf"):
        paragraphs = extract_text_from_pdf(file_path)
    elif filename_lower.endswith(".docx"):
        try:
            paragraphs = extract_text_from_docx(file_path)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(exc),
            ) from exc
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Only PDF and DOCX files are supported.",
        )

    paragraphs = detect_headings(paragraphs)
    paragraphs = assign_contextual_levels(paragraphs)

    # ---------------------------
    # 3. Semantic chunking
    # ---------------------------
    chunks = create_semantic_chunks(
        paragraphs=paragraphs,
        document_id=document_id,
        source_file=file.filename,
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        min_section_chars=MIN_SECTION_CHARS,
    )

    chunks = merge_empty_parent_chunks(chunks)

    chunks_to_embed = [c for c in chunks if c["section_level"] != 0]

    # Debug output (optional)
    print("\n--- Semantic Chunks ---")
    for chunk in chunks:
        print(f"\n[Chunk {chunk['chunk_id']}] {chunk['section']}")
        for line in chunk["content"]:
            print("-", line)

    return {
        "document_id": document_id,
        "file_name": file.filename,
        "status": "uploaded" if chunks_to_embed else "uploaded_no_embeddings",
        "chunks_created": len(chunks),
        "chunks_embedded": len(chunks_to_embed),
        "message": "No embeddable chunks found" if not chunks_to_embed else "Indexed successfully",
    }, chunks_to_embed


@router.post("/upload")
async def upload_document(
    files: Optional[List[UploadFile]] = File(None),
    file: Optional[UploadFile] = File(None),
):
    normalized_files: List[UploadFile] = []
    if files:
        normalized_files.extend(files)
    if file:
        normalized_files.append(file)

    if not normalized_files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No files uploaded. Provide one or more PDF/DOCX files.",
        )

    indexed_chunks = []
    document_results = []

    for uploaded_file in normalized_files:
        result, chunks_to_embed = await _ingest_single_file(uploaded_file)
        indexed_chunks.extend(chunks_to_embed)
        document_results.append(result)

    if indexed_chunks:
        texts = [" ".join(c["content"]) for c in indexed_chunks]
        embeddings = np.array([embed(text) for text in texts], dtype=np.float32)

        faiss_index.add_vectors(
            embeddings,
            chunk_ids=[c["chunk_id"] for c in indexed_chunks],
        )
        faiss_index.save_to_disk()
        chroma_store.add_chunks(indexed_chunks)

    print("Chroma count:", chroma_store.collection.count())

    return {
        "status": "uploaded",
        "files_received": len(normalized_files),
        "files_indexed": len([d for d in document_results if d["chunks_embedded"] > 0]),
        "total_chunks_embedded": len(indexed_chunks),
        "documents": document_results,
    }
