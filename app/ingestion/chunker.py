def attach_section_context(paragraphs: list) -> list:
    """
    Attaches section title and level to each non-heading paragraph
    based on the most recent heading encountered.

    """

    current_section = None

    for p in paragraphs:
        #if paragraph is heading, update current section
        if p.get("is_heading"):
            current_section = {
                "title": p["text"],
                "level": p["heading_level"]
            }
            #Heading also get their own section metadata
            p["section"] = p["text"]
            p["section_level"] = p["heading_level"]

        else:
            #Normal paragraph inherits section context
            p["section"] = current_section["title"] if current_section else "Unknown"
            p["section_level"] = current_section["level"] if current_section else "Unknown"
    
    return paragraphs