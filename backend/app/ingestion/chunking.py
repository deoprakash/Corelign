def _split_text_with_overlap(text, chunk_size, chunk_overlap):
    """
    Split text into chunks of approximately chunk_size characters,
    using word boundaries to avoid breaking words.
    
    Args:
        text: Text to split
        chunk_size: Target character count per chunk
        chunk_overlap: Number of characters to overlap between chunks
    
    Returns:
        List of text chunks split at word boundaries
    """
    if chunk_size <= 0:
        raise ValueError("chunk_size must be > 0")
    if chunk_overlap < 0:
        raise ValueError("chunk_overlap must be >= 0")

    # Prevent infinite loops when overlap is too large.
    safe_overlap = min(chunk_overlap, chunk_size - 1) if chunk_size > 1 else 0

    # Split text into words (preserving spaces for reconstruction)
    words = text.split()
    
    if not words:
        return []
    
    parts = []
    current_chunk_words = []
    current_chunk_length = 0
    
    for word in words:
        word_length = len(word) + 1  # +1 for the space
        
        # If adding this word exceeds chunk_size, finalize current chunk
        if current_chunk_length + word_length > chunk_size and current_chunk_words:
            chunk_text = " ".join(current_chunk_words)
            parts.append(chunk_text)
            
            # Calculate overlap in words from the end of current chunk
            overlap_length = 0
            overlap_words = []
            for w in reversed(current_chunk_words):
                w_length = len(w) + 1
                if overlap_length + w_length <= safe_overlap:
                    overlap_words.insert(0, w)
                    overlap_length += w_length
                else:
                    break
            
            current_chunk_words = overlap_words
            current_chunk_length = overlap_length
        
        current_chunk_words.append(word)
        current_chunk_length += word_length
    
    # Don't forget the last chunk
    if current_chunk_words:
        chunk_text = " ".join(current_chunk_words)
        parts.append(chunk_text)
    
    return parts


def _section_text_len(chunk):
    return len(" ".join(chunk.get("content", [])).strip())


def _merge_small_sections(chunks, min_section_chars):
    if min_section_chars <= 0:
        return chunks

    merged = []
    i = 0
    while i < len(chunks):
        current = {
            **chunks[i],
            "content": list(chunks[i].get("content", [])),
        }

        # Keep document-title/root chunks independent.
        if current.get("section_level") == 0:
            merged.append(current)
            i += 1
            continue

        j = i
        while (
            _section_text_len(current) < min_section_chars
            and (j + 1) < len(chunks)
            and chunks[j + 1].get("section_level") != 0
        ):
            next_chunk = chunks[j + 1]
            current["content"].extend(next_chunk.get("content", []))
            current["section"] = f"{current['section']} + {next_chunk['section']}"
            j += 1

        merged.append(current)
        i = j + 1

    return merged


def create_semantic_chunks(
    paragraphs,
    document_id,
    source_file,
    chunk_size=500,
    chunk_overlap=120,
    min_section_chars=600,
):
    # Quick exit for empty input — return a single no-content root chunk so
    # upstream code can report "uploaded_no_embeddings" instead of failing.
    if not paragraphs:
        return [
            {
                "document_id": document_id,
                "chunk_id": f"{document_id}_1",
                "section": "Document",
                "section_level": 0,
                "content": [],
                "source_file": source_file,
            }
        ]

    # If there are no detected headings, treat the whole document as a single
    # section so plain text files still get split and embedded.
    if not any(p.get("is_heading") for p in paragraphs):
        full_content = [p.get("text", "") for p in paragraphs if p.get("text")]
        chunks = [
            {
                "document_id": document_id,
                "chunk_id": f"{document_id}_1",
                "section": "Document",
                "section_level": 1,
                "content": full_content,
                "source_file": source_file,
            }
        ]
    else:
        chunks = []
        current_chunk = None
        chunk_index = 0

        for p in paragraphs:
            if p.get("is_heading"):
                # START new chunk ONLY if section actually changes
                if (
                    current_chunk
                    and p["text"] == current_chunk["section"]
                    and p["heading_level"] == current_chunk["section_level"]
                ):
                    continue  # same section, ignore duplicate heading

                if current_chunk:
                    chunks.append(current_chunk)

                chunk_index += 1
                current_chunk = {
                    "document_id": document_id,
                    "chunk_id": f"{document_id}_{chunk_index}",
                    "section": p["text"],
                    "section_level": p["heading_level"],
                    "content": [],
                    "source_file": source_file
                }
                continue

            if current_chunk:
                current_chunk["content"].append(p["text"])

        if current_chunk:
            chunks.append(current_chunk)

        chunks = _merge_small_sections(chunks, min_section_chars)

    final_chunks = []
    final_index = 0

    for chunk in chunks:
        section_text = " ".join(chunk["content"]).strip()

        if not section_text:
            final_index += 1
            final_chunks.append(
                {
                    **chunk,
                    "chunk_id": f"{document_id}_{final_index}",
                    "content": [],
                }
            )
            continue

        parts = _split_text_with_overlap(section_text, chunk_size, chunk_overlap)
        for part in parts:
            final_index += 1
            final_chunks.append(
                {
                    **chunk,
                    "chunk_id": f"{document_id}_{final_index}",
                    "content": [part],
                }
            )

    return final_chunks

def merge_empty_parent_chunks(chunks):
    merged = []
    i = 0

    while i < len(chunks):
        chunk = chunks[i]

        # ❗ DO NOT MERGE DOCUMENT TITLE
        if chunk["section_level"] == 0:
            merged.append(chunk)
            i += 1
            continue

        # Merge only empty non-root headings
        if not chunk["content"]:
            j = i + 1
            while (
                j < len(chunks)
                and chunks[j]["section_level"] > chunk["section_level"]
            ):
                chunk["content"].extend(chunks[j]["content"])
                j += 1

            merged.append(chunk)
            i = j
        else:
            merged.append(chunk)
            i += 1

    return merged
