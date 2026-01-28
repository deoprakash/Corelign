def create_semantic_chunks(paragraphs, document_id, source_file):
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

    return chunks

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
