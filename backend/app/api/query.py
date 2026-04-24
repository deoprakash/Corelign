import re
from typing import Dict, List, Tuple

from fastapi import APIRouter
import numpy as np
from pydantic import BaseModel

from app.embeddings.embedder import embed
from app.vector_store.index_instance import faiss_index
from app.vector_store import chroma_store
from app.llm.groq_llm import GroqLLM
from app.utils.metrics import metrics
from app.mcp import get_mcp
import time

router = APIRouter()
llm = GroqLLM()


def _chunk_sort_key(chunk_id: str):
    # chunk_id format: <uuid>_<index>
    match = re.search(r"_(\d+)$", chunk_id or "")
    if not match:
        return (1, chunk_id or "")
    return (0, int(match.group(1)))


def _calculate_keyword_similarity(query: str, document: str) -> float:
    """
    Calculate keyword-based similarity using term overlap.
    Returns a score between 0 and 1.
    """
    query_terms = set(query.lower().split())
    doc_terms = set(document.lower().split())
    
    if not query_terms or not doc_terms:
        return 0.0
    
    # Jaccard similarity: intersection / union
    intersection = len(query_terms & doc_terms)
    union = len(query_terms | doc_terms)
    
    return intersection / union if union > 0 else 0.0


def _hybrid_search(
    query: str,
    top_k: int,
    semantic_weight: float = 0.6,
    keyword_weight: float = 0.4
) -> Tuple[List[str], Dict[str, float], Dict[str, Dict]]:
    """
    Perform hybrid search combining semantic and keyword similarity.
    
    Args:
        query: Query text
        top_k: Number of results to return
        semantic_weight: Weight for semantic similarity (0-1)
        keyword_weight: Weight for keyword similarity (0-1)
    
    Returns:
        Tuple of (chunk_ids, hybrid_scores, chunk_details)
    """
    # 1️⃣ Semantic Search via FAISS
    query_embedding = np.array([embed(query)], dtype=np.float32)
    semantic_chunk_ids, semantic_scores = faiss_index.search_with_scores(query_embedding, top_k * 2)
    
    if not semantic_chunk_ids:
        return [], {}, {}
    
    # Fetch documents from Chroma for keyword search
    chroma_results = chroma_store.collection.get(
        ids=semantic_chunk_ids,
        include=["documents", "metadatas"]
    )
    
    semantic_scores_dict = {
        chunk_id: score 
        for chunk_id, score in zip(semantic_chunk_ids, semantic_scores)
    }
    
    # 2️⃣ Calculate Keyword Similarity
    chunk_details = {}
    keyword_scores_dict = {}
    
    for idx, chunk_id in enumerate(chroma_results.get("ids", [])):
        doc = chroma_results.get("documents", [])[idx] if idx < len(chroma_results.get("documents", [])) else ""
        metadata = chroma_results.get("metadatas", [])[idx] if idx < len(chroma_results.get("metadatas", [])) else {}
        
        keyword_score = _calculate_keyword_similarity(query, doc)
        keyword_scores_dict[chunk_id] = keyword_score
        chunk_details[chunk_id] = {
            "document": doc,
            "metadata": metadata,
            "semantic_score": semantic_scores_dict.get(chunk_id, 0.0),
            "keyword_score": keyword_score
        }
    
    # 3️⃣ Combine scores with hybrid weighting
    hybrid_scores = {}
    for chunk_id in chunk_details:
        semantic_score = chunk_details[chunk_id]["semantic_score"]
        keyword_score = chunk_details[chunk_id]["keyword_score"]
        
        # Weighted combination normalized to 0-1
        hybrid_score = (semantic_weight * semantic_score + keyword_weight * keyword_score) / (semantic_weight + keyword_weight)
        hybrid_scores[chunk_id] = hybrid_score
    
    # 4️⃣ Sort by hybrid score and return top_k
    sorted_chunks = sorted(hybrid_scores.items(), key=lambda x: x[1], reverse=True)[:top_k]
    final_chunk_ids = [chunk_id for chunk_id, _ in sorted_chunks]
    final_hybrid_scores = {chunk_id: score for chunk_id, score in sorted_chunks}
    
    return final_chunk_ids, final_hybrid_scores, chunk_details


class QueryRequest(BaseModel):
    query: str
    top_k: int = 7
    use_hybrid: bool = True
    semantic_weight: float = 0.6
    keyword_weight: float = 0.4


@router.post("/query")
async def query_documents(request: QueryRequest):
    original_query = request.query
    if not original_query:
        return {"error": "Query text is required."}

    # ============ MCP PREPROCESSING LAYER ============
    # Resolve ambiguous references using conversation history
    mcp = get_mcp()
    query = mcp.resolve_coreference(original_query)
    
    if query != original_query:
        print(f"DEBUG: MCP rewrite - Original: '{original_query}' -> Rewritten: '{query}'")
    # ================================================

    top_k = request.top_k
    use_hybrid = request.use_hybrid
    semantic_weight = request.semantic_weight
    keyword_weight = request.keyword_weight

    if not faiss_index.has_vectors:
        faiss_index.load_from_disk()

    if not faiss_index.has_vectors:
        return {"error": "Vector index not initialised! Upload a document first."}

    print(f"DEBUG: FAISS index has {faiss_index.index.ntotal} vectors, {len(faiss_index.chunk_ids)} chunk_ids")
    print(f"DEBUG: Chroma has {chroma_store.collection.count()} chunks")
    print(f"DEBUG: Search mode: {'HYBRID' if use_hybrid else 'SEMANTIC'}")

    # Start overall timer
    t_start = time.perf_counter()

    # Perform search (hybrid or semantic only)
    t_retr_start = time.perf_counter()
    
    if use_hybrid:
        chunk_ids, hybrid_scores, chunk_details = _hybrid_search(
            query, 
            top_k,
            semantic_weight,
            keyword_weight
        )
        print(f"DEBUG: Hybrid search returned {len(chunk_ids)} chunk_ids")
    else:
        # Fallback to semantic-only search
        query_embedding = np.array([embed(query)], dtype=np.float32)
        chunk_ids, similarities = faiss_index.search_with_scores(query_embedding, top_k)
        hybrid_scores = {
            chunk_id: score 
            for chunk_id, score in zip(chunk_ids, similarities)
        }
        
        if not chunk_ids:
            chunk_details = {}
        else:
            chroma_results = chroma_store.collection.get(
                ids=chunk_ids,
                include=["documents", "metadatas"]
            )
            
            chunk_details = {}
            for idx, chunk_id in enumerate(chroma_results.get("ids", [])):
                doc = chroma_results.get("documents", [])[idx] if idx < len(chroma_results.get("documents", [])) else ""
                metadata = chroma_results.get("metadatas", [])[idx] if idx < len(chroma_results.get("metadatas", [])) else {}
                chunk_details[chunk_id] = {
                    "document": doc,
                    "metadata": metadata,
                    "semantic_score": hybrid_scores.get(chunk_id, 0.0),
                    "keyword_score": 0.0
                }
        print(f"DEBUG: Semantic search returned {len(chunk_ids)} chunk_ids")

    if not chunk_ids:
        no_results_answer = "I don't have enough information in the provided context to answer that."
        response_data = {
            "query": query,
            "answer": no_results_answer,
            "sources": [],
            "chunks": [],
            "confidence": 0.0,
            "semantic_similarity": 0.0,
            "search_mode": "hybrid" if use_hybrid else "semantic",
        }
        # Add to MCP history even for no-results cases
        mcp.add_to_history(original_query, no_results_answer)
        return response_data

    t_retr_end = time.perf_counter()
    retrieval_time = t_retr_end - t_retr_start

    # Build Context
    rows = []
    for chunk_id in chunk_ids:
        if chunk_id not in chunk_details:
            continue
        
        doc = chunk_details[chunk_id].get("document", "")
        if not doc or not doc.strip():
            continue
        
        metadata = chunk_details[chunk_id].get("metadata", {})
        rows.append((chunk_id, doc.strip(), metadata))

    rows.sort(key=lambda r: _chunk_sort_key(r[0]))

    context = "The following information is extracted from a document:\n\n"

    for i, (_, doc, meta) in enumerate(rows):
        section_label = meta.get("section", f"Section {i+1}") if isinstance(meta, dict) else f"Section {i+1}"
        context += f"{section_label}:\n{doc}\n\n"

    if not context.strip():
        no_results_answer = "I don't have enough information in the provided context to answer that."
        response_data = {
            "query": query,
            "answer": no_results_answer,
            "sources": [],
            "chunks": [],
            "confidence": 0.0,
            "semantic_similarity": 0.0,
            "search_mode": "hybrid" if use_hybrid else "semantic",
        }
        # Add to MCP history even for no-results cases
        mcp.add_to_history(original_query, no_results_answer)
        return response_data

    # Calculate confidence from hybrid scores
    confidence = 0.0
    semantic_similarity = 0.0
    if hybrid_scores:
        avg_score = sum(hybrid_scores.values()) / len(hybrid_scores)
        top_score = max(hybrid_scores.values())
        confidence = round(max(0.0, min(1.0, avg_score)), 3)
        semantic_similarity = round(max(0.0, min(1.0, top_score)), 3)

    score_by_chunk_id = {
        chunk_id: round(max(0.0, min(1.0, score)), 3)
        for chunk_id, score in hybrid_scores.items()
    }

    # Ask Groq
    t_gen_start = time.perf_counter()
    answer = llm.generate_answer(
        context=context,
        question=query
    )
    t_gen_end = time.perf_counter()
    generation_time = t_gen_end - t_gen_start

    # Total response time
    response_time = time.perf_counter() - t_start

    # Record metrics (non-blocking minimal overhead)
    try:
        metrics.record(
            query=query,
            top_k=top_k,
            response_time=response_time,
            retrieval_time=retrieval_time,
            generation_time=generation_time,
        )
    except Exception as e:
        print(f"DEBUG: Failed to write metrics: {e}")

    # Build response with detailed scoring information
    chunks = [{
        "id": row_id,
        "text": doc,
        "meta": meta,
        "hybrid_score": score_by_chunk_id.get(row_id, None),
        "semantic_score": round(chunk_details.get(row_id, {}).get("semantic_score", 0.0), 3),
        "keyword_score": round(chunk_details.get(row_id, {}).get("keyword_score", 0.0), 3),
    } for (row_id, doc, meta) in rows]

    sources = [{
        "id": row_id,
        "metadata": meta,
        "hybrid_score": score_by_chunk_id.get(row_id, None),
        "semantic_score": round(chunk_details.get(row_id, {}).get("semantic_score", 0.0), 3),
        "keyword_score": round(chunk_details.get(row_id, {}).get("keyword_score", 0.0), 3),
    } for (row_id, _, meta) in rows]

    response_data = {
        "query": query,
        "answer": answer,
        "sources": sources,
        "chunks": chunks,
        "confidence": confidence,
        "semantic_similarity": semantic_similarity,
        "search_mode": "hybrid" if use_hybrid else "semantic",
        "weights": {
            "semantic": semantic_weight,
            "keyword": keyword_weight
        } if use_hybrid else None,
    }

    # ============ MCP HISTORY UPDATE ============
    # Add this turn to conversation history for future coreference resolution
    mcp.add_to_history(original_query, answer)
    # ============================================

    return response_data
