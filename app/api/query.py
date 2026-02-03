# from fastapi import APIRouter
# from pydantic import BaseModel

# from app.embeddings.embedder import Embedder
# from app.vector_store import chroma_store
# from app.vector_store.index_instance import faiss_index


# router = APIRouter()
# embedder = Embedder()

# class QueryRequest(BaseModel):
#     query: str
#     top_k: int = 5

# @router.post("/query")
# def query_document(request: QueryRequest):
#     if faiss_index is None:
#         return {"error": "Vector index not initialised!"}

#     # Embed query
#     query_embedding = embedder.embed_texts([request.query])

#     # search FAISS and get chunk IDs directly
#     chunk_ids = faiss_index.search(
#         query_embedding, top_k=request.top_k
#     )

#     # fetch chunks from chroma
#     results = chroma_store.get_chunks_by_ids(chunk_ids)

#     return {
#         "query": request.query,
#         "results": results 
#     }

from fastapi import APIRouter
from pydantic import BaseModel

from app.embeddings.embedder import Embedder
from app.vector_store.index_instance import faiss_index
from app.vector_store import chroma_store

router = APIRouter()
embedder = Embedder()


class QueryRequest(BaseModel):
    query: str
    top_k: int = 5


@router.post("/query")
async def query_documents(request: QueryRequest):
    query = request.query
    if not query:
        return {"error": "Query text is required."}

    top_k = request.top_k

    if not faiss_index.has_vectors:
        faiss_index.load_from_disk()

    if not faiss_index.has_vectors:
        return {"error": "Vector index not initialised! Upload a document first."}

    print(f"DEBUG: FAISS index has {faiss_index.index.ntotal} vectors, {len(faiss_index.chunk_ids)} chunk_ids")
    print(f"DEBUG: Chroma has {chroma_store.collection.count()} chunks")
    print(f"DEBUG: First 5 chunk_ids in FAISS: {faiss_index.chunk_ids[:5]}")

    # 1️⃣ Embed query
    query_embedding = embedder.embed_texts([query])

    # 2️⃣ FAISS similarity search (returns chunk_ids directly)
    chunk_ids = faiss_index.search(query_embedding, top_k)
    print(f"DEBUG: FAISS returned {len(chunk_ids)} chunk_ids: {chunk_ids}")

    if not chunk_ids:
        return {"results": [], "debug": "No chunk_ids from FAISS search"}

    # 3️⃣ Fetch documents from Chroma
    results = chroma_store.collection.get(
        ids=chunk_ids
    )
    print(f"DEBUG: Chroma returned {len(results['ids'])} results")

    return {
        "query": query,
        "results": results
    }
