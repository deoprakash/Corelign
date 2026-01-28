from fastapi import APIRouter, UploadFile, File
import uuid
import os

from app.ingestion.docx_loader import extract_text_from_docx, detect_headings, assign_contextual_levels
from app.ingestion.chunking import create_semantic_chunks, merge_empty_parent_chunks
from app.embeddings.embedder import Embedder
from app.vector_store import chroma_store

from app.vector_store.faiss_index import FaissIndex
# from app.chunking.semantic_chunker import create_semantic_chunks

router = APIRouter()
embedder = Embedder()

faiss_index = None

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
        source_file=file.filename
    )
    chunks = merge_empty_parent_chunks(chunks)

    # ✅ Filter out title-level chunks ONCE
    chunks_to_embed = [c for c in chunks if c["section_level"] != 0]

    # ✅ Prepare text for embedding
    texts = [" ".join(c["content"]) for c in chunks_to_embed]
    embeddings = embedder.embed_texts(texts)

    # ✅ Initialize FAISS once
    global faiss_index
    if faiss_index is None:
        faiss_index = FaissIndex(dim=embeddings.shape[1])

    # ✅ Add vectors WITH chunk IDs
    faiss_index.add_vectors(
        vectors=embeddings,
        ids=[c["chunk_id"] for c in chunks_to_embed]
    )

    # ✅ Store metadata + text in Chroma
    chroma_store.add_chunks(chunks_to_embed)

    print("\n--- Semantic Chunks ---")
    for chunk in chunks:
        print(f"\n[Chunk {chunk['chunk_id']}] {chunk['section']}")
        for line in chunk["content"]:
            print("-", line)

    return {
        "document_id": document_id,
        "status": "uploaded",
        "chunks_created": len(chunks)
    }