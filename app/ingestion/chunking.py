def create_semantic_chunks(
        paragraphs: list,
        document_id: str,
        source_file: str
) -> list:
    """
    Groups paragraph-level output into section aware semantic chunks.

    """

    chunks = []
    current_chunk = None
    chunk_index = 0

    for p in paragraphs:
        # Start new chunk when a heading appears
        if p.get("is_heading"):
            if current_chunk:
                chunks.append(current_chunk)

            chunk_index +=1
            current_chunk = {
                "document_id": document_id,
                "chunk_id" : chunk_index,
                "section": p["text"],
                "section_level": p["heading_level"],
                "content": [],
                "source_file": source_file
            }
            continue
        #Normal paragraph -> attach to current chunk
        if current_chunk:
            current_chunk["content"].append(p["text"])
    
    #Add last chunk
    if current_chunk:
        chunks.append(current_chunk)
    
    return chunks
