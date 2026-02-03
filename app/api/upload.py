# from fastapi import APIRouter, UploadFile, File
# import uuid
# import os

# from app.ingestion.docx_loader import extract_text_from_docx, detect_headings, assign_contextual_levels
# from app.ingestion.chunking import create_semantic_chunks, merge_empty_parent_chunks
# from app.embeddings.embedder import Embedder
# from app.vector_store import chroma_store, faiss_store

# from app.vector_store.index_instance import faiss_index
# from app.vector_store.faiss_index import FaissIndex


# # from app.chunking.semantic_chunker import create_semantic_chunks

# router = APIRouter()
# embedder = Embedder()

# UPLOAD_DIR = "data/raw_docs"
# os.makedirs(UPLOAD_DIR, exist_ok=True)

# @router.post("/upload")
# async def upload_document(file: UploadFile = File(...)):
#     # ---------------------------
#     # 1. Save uploaded file
#     # ---------------------------
#     document_id = str(uuid.uuid4())
#     file_path = os.path.join(UPLOAD_DIR, f"{document_id}_{file.filename}")

#     with open(file_path, "wb") as f:
#         f.write(await file.read())

#     # ---------------------------
#     # 2. DOCX ingestion pipeline
#     # ---------------------------
#     paragraphs = extract_text_from_docx(file_path)
#     paragraphs = detect_headings(paragraphs)
#     paragraphs = assign_contextual_levels(paragraphs)

#     # ---------------------------
#     # 3. Semantic chunking
#     # ---------------------------
#     chunks = create_semantic_chunks(
#         paragraphs=paragraphs,
#         document_id=document_id,
#         source_file=file.filename,
#     )

#     chunks = merge_empty_parent_chunks(chunks)

#     # ---------------------------
#     # 4. Filter chunks for embedding
#     # (skip title-level chunks)
#     # ---------------------------
#     chunks_to_embed = [c for c in chunks if c["section_level"] != 0]

#     if not chunks_to_embed:
#         return {
#             "document_id": document_id,
#             "status": "uploaded",
#             "message": "No embeddable chunks found",
#         }

#     # ---------------------------
#     # 5. Generate embeddings
#     # ---------------------------
#     texts = [" ".join(c["content"]) for c in chunks_to_embed]
#     embeddings = embedder.embed_texts(texts)

#     # ---------------------------
#     # 6. Initialize shared FAISS
#     # ---------------------------
#     # if faiss_store.faiss_index is None:
#     #     faiss_store.faiss_index = FaissIndex(dim=embeddings.shape[1])

#     # ---------------------------
#     # 7. Add vectors to FAISS
#     # ---------------------------
#     faiss_index.add_vectors(
#         embeddings,
#         chunk_ids=[c["chunk_id"] for c in chunks_to_embed],
#     )

#     # ---------------------------
#     # 8. Store metadata in Chroma
#     # ---------------------------
#     chroma_store.add_chunks(chunks_to_embed)

#     # ---------------------------
#     # 9. Debug output (optional)
#     # ---------------------------
#     print("\n--- Semantic Chunks ---")
#     for chunk in chunks:
#         print(f"\n[Chunk {chunk['chunk_id']}] {chunk['section']}")
#         for line in chunk["content"]:
#             print("-", line)

#     print("Chroma count:", chroma_store.collection.count())

#     # ---------------------------
#     # 10. API response
#     # ---------------------------
#     return {
#         "document_id": document_id,
#         "status": "uploaded",
#         "chunks_created": len(chunks),
#         "chunks_embedded": len(chunks_to_embed),
#     }


from fastapi import APIRouter, UploadFile, File
import uuid
import os

from app.ingestion.docx_loader import (
    extract_text_from_docx,
    detect_headings,
    assign_contextual_levels,
)

from app.ingestion.chunking import (
    create_semantic_chunks,
    merge_empty_parent_chunks,
)

from app.embeddings.embedder import Embedder
from app.vector_store import chroma_store, faiss_store

from app.vector_store.index_instance import faiss_index
# from app.vector_store.faiss_index import FaissIndex


router = APIRouter()
embedder = Embedder()

UPLOAD_DIR = "data/raw_docs"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    # ---------------------------
    # 1. Save uploaded file
    # ---------------------------
    document_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{document_id}_{file.filename}")

    with open(file_path, "wb") as f:
        f.write(await file.read())

    # ---------------------------
    # 2. DOCX ingestion pipeline
    # ---------------------------
    paragraphs = extract_text_from_docx(file_path)
    paragraphs = detect_headings(paragraphs)
    paragraphs = assign_contextual_levels(paragraphs)

    # ---------------------------
    # 3. Semantic chunking
    # ---------------------------
    chunks = create_semantic_chunks(
        paragraphs=paragraphs,
        document_id=document_id,
        source_file=file.filename,
    )

    chunks = merge_empty_parent_chunks(chunks)

    # ---------------------------
    # 4. Filter chunks for embedding
    # (skip title-level chunks)
    # ---------------------------
    chunks_to_embed = [c for c in chunks if c["section_level"] != 0]

    if not chunks_to_embed:
        return {
            "document_id": document_id,
            "status": "uploaded",
            "message": "No embeddable chunks found",
        }

    # ---------------------------
    # 5. Generate embeddings
    # ---------------------------
    texts = [" ".join(c["content"]) for c in chunks_to_embed]
    embeddings = embedder.embed_texts(texts)

    # ---------------------------
    # 6. Initialize shared FAISS
    # ---------------------------
    # if faiss_store.faiss_index is None:
    #     faiss_store.faiss_index = FaissIndex(dim=embeddings.shape[1])

    # ---------------------------
    # 7. Add vectors to FAISS
    # ---------------------------
    faiss_index.add_vectors(
        embeddings,
        chunk_ids=[c["chunk_id"] for c in chunks_to_embed],
    )
    faiss_index.save_to_disk()

    # ---------------------------
    # 8. Store metadata in Chroma
    # ---------------------------
    chroma_store.add_chunks(chunks_to_embed)

    # ---------------------------
    # 9. Debug output (optional)
    # ---------------------------
    print("\n--- Semantic Chunks ---")
    for chunk in chunks:
        print(f"\n[Chunk {chunk['chunk_id']}] {chunk['section']}")
        for line in chunk["content"]:
            print("-", line)

    print("Chroma count:", chroma_store.collection.count())

    # ---------------------------
    # 10. API response
    # ---------------------------
    return {
        "document_id": document_id,
        "status": "uploaded",
        "chunks_created": len(chunks),
        "chunks_embedded": len(chunks_to_embed),
    }
