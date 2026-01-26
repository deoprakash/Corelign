from fastapi import APIRouter, UploadFile, File
import uuid
import os

from app.ingestion.docx_loader import extract_text_from_docx, detect_headings, assign_contextual_levels
from app.ingestion.chunker import attach_section_context
from app.ingestion.chunking import create_semantic_chunks

router = APIRouter()

UPLOAD_DIR = "data/raw_docs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    document_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{document_id}_{file.filename}")

    with open(file_path, "wb") as f:
        f.write(await file.read())

    paragraphs = extract_text_from_docx(file_path)
    paragraphs = detect_headings(paragraphs)
    paragraphs = assign_contextual_levels(paragraphs)
    chunks = create_semantic_chunks(
        paragraphs=paragraphs,
        document_id=document_id,
        source_file = file.filename
    )

    print("\n--- Semantic Chunks ---")
    for chunk in chunks:
        print(f"\n[Chunk {chunk['chunk_id']}] {chunk['section']}")
        for line in chunk["content"]:
            print("-", line)

    return{
        "document_id": document_id,
        "status": "uploaded",
        "chunks_created": len(chunks)
    }