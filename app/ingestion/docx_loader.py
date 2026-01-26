from docx import Document
import re


def extract_text_from_docx(file_path: str) -> list:
    """
    Extracts text from DOC/DOCX file paragraph-wise
    with robust handling of multi-run paragraphs.
    """

    document = Document(file_path)
    paragraphs = []

    for para in document.paragraphs:
        text = para.text.strip()
        if not text:
            continue

        style = para.style.name if para.style else "NoStyle"

        # ---- FIX: handle multiple runs safely ----
        font_sizes = []
        bold_found = False

        for run in para.runs:
            if run.font.size:
                font_sizes.append(run.font.size.pt)
            if run.font.bold:
                bold_found = True

        font_size = max(font_sizes) if font_sizes else None
        bold = bold_found

        paragraphs.append({
            "text": text,
            "style": style,
            "font_size": font_size,
            "bold": bold
        })

    return paragraphs


def compute_average_font_size(paragraphs: list) -> float:
    sizes = [p["font_size"] for p in paragraphs if p["font_size"]]
    return sum(sizes) / len(sizes) if sizes else 12.0


def detect_headings(paragraphs: list) -> list:
    avg_font = compute_average_font_size(paragraphs)

    for p in paragraphs:
        text = p["text"].strip()

        # ---- Defaults ----
        p["is_heading"] = False
        p["heading_type"] = "normal"
        p["heading_level"] = None

        # ---- NEW: list item detection ----
        style = p.get("style", "").lower()
        p["is_list_item"] = "list" in style

        # ---- STYLE-BASED HEADINGS (MOST RELIABLE) ----
        if style == "heading 1":
            p["is_heading"] = True
            p["heading_type"] = "section"
            p["heading_level"] = 1
            continue

        if style == "heading 2":
            p["is_heading"] = True
            p["heading_type"] = "subsection"
            p["heading_level"] = 2
            continue

        if style == "heading 3":
            p["is_heading"] = True
            p["heading_type"] = "subsubsection"
            p["heading_level"] = 3
            continue

        # ---- REGEX SUBSECTIONS (1.1, 2.3) ----
        if re.match(r"^\d+\.\d+", text):
            p["is_heading"] = True
            p["heading_type"] = "subsection"
            p["heading_level"] = 2
            continue

        # ---- REGEX SECTIONS (1., (A)) ----
        if re.match(r"^\([A-Z]\)\s+|^\d+\.\s+", text):
            p["is_heading"] = True
            p["heading_type"] = "section"
            p["heading_level"] = 1
            continue

        # ---- DOCUMENT TITLE (FONT-BASED, LAST) ----
        if (
            p["bold"]
            and p["font_size"]
            and p["font_size"] >= avg_font + 1.5
            and len(text) > 10
        ):
            p["is_heading"] = True
            p["heading_type"] = "title"
            p["heading_level"] = 0
            continue

    return paragraphs


def assign_contextual_levels(paragraphs: list) -> list:
    current_section = None
    current_level = None

    for p in paragraphs:
        if p["is_heading"]:
            current_section = p["text"]
            current_level = p["heading_level"]

            p["section"] = current_section
            p["section_level"] = current_level
        else:
            p["section"] = current_section
            p["section_level"] = current_level

    return paragraphs
