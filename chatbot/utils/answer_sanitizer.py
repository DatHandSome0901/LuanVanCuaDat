import re


_SOURCE_REF = (
    r"(?:nguồn|source)\s*\d+"
    r"(?:\s*(?:,|;|/|&|và|and|-|–|—)\s*(?:nguồn|source)?\s*\d+)*"
)


def strip_inline_source_references(text: str) -> str:
    """Remove user-facing inline source markers while keeping source metadata separate."""
    if not text:
        return text

    cleaned = re.sub(
        rf"\s*[\(\[]\s*{_SOURCE_REF}\s*[\)\]]",
        "",
        text,
        flags=re.IGNORECASE,
    )
    cleaned = re.sub(
        rf"\s*(?:theo|xem|dựa theo|tham khảo)\s+{_SOURCE_REF}\b",
        "",
        cleaned,
        flags=re.IGNORECASE,
    )
    cleaned = re.sub(
        rf"(?im)^\s*{_SOURCE_REF}\s*$",
        "",
        cleaned,
    )
    cleaned = re.sub(
        rf"(?im)^\s*[-*]?\s*{_SOURCE_REF}\s*[:：-].*$",
        "",
        cleaned,
    )
    cleaned = re.sub(
        rf"\s+{_SOURCE_REF}(?=[,.!?;:]|\s*$)",
        "",
        cleaned,
        flags=re.IGNORECASE,
    )
    cleaned = re.sub(r"[ \t]+([,.;:!?])", r"\1", cleaned)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip()


def remap_citations(text: str, documents: list, entity_key: str = None) -> str:
    """Remaps raw inline document citation indexes [i] to match unique source file indexes."""
    if not text or not documents:
        return text

    import os
    import re

    # 1. Build unique_base_names and mapping from doc_idx -> unique_source_idx (1-based)
    doc_base_names = []
    for idx, doc in enumerate(documents):
        # Extract fname logic exactly matching _build_sources
        url = doc.metadata.get("url")
        source_val = doc.metadata.get("source") or ""
        file_name_val = doc.metadata.get("file_name") or ""
        
        is_web = doc.metadata.get("is_web", False)
        if str(source_val).startswith("http://") or str(source_val).startswith("https://"):
            is_web = True
            url = url or str(source_val)
        if str(url).startswith("http://") or str(url).startswith("https://"):
            is_web = True
            
        if is_web:
            fname = file_name_val or source_val or url
        else:
            fname = file_name_val or source_val or doc.metadata.get("filename") or ""
            
        if not fname:
            fname = "Tài liệu lưu trữ hệ thống"
            
        s_str = str(url) if is_web else str(source_val or fname)
        
        if not is_web and s_str == "history":
            approved_q = doc.metadata.get("question")
            if approved_q:
                fname = f"Kiến thức: {approved_q}"
                if len(fname) > 60:
                    fname = fname[:57] + "..."
            else:
                fname = "Kiến thức hệ thống đã duyệt"
        elif is_web:
            if fname.startswith("http://") or fname.startswith("https://"):
                from urllib.parse import urlparse
                fname = urlparse(fname).netloc or fname
        else:
            fname = os.path.basename(fname.rstrip("/"))
            from urllib.parse import unquote
            fname = unquote(fname).replace("_", " ")
            
        base_name = os.path.splitext(fname)[0].replace("_ocred", "")
        doc_base_names.append((idx, base_name, doc))

    # If entity_key is provided, we filter which base_names are kept
    kept_base_names = []
    doc_to_source_index = {}
    for idx, base_name, doc in doc_base_names:
        is_relevant = True
        if entity_key:
            if doc.metadata.get("is_web") or doc.metadata.get("is_pending"):
                is_relevant = True
            else:
                from chatbot.utils.viet_history_entities import is_source_relevant_to_entity
                content_preview = doc.metadata.get("answer") if "answer" in doc.metadata else doc.page_content
                content_preview = (content_preview or "")[:300]
                is_relevant = is_source_relevant_to_entity(base_name, content_preview, entity_key)
            
        if is_relevant:
            if base_name not in kept_base_names:
                kept_base_names.append(base_name)
            source_idx = kept_base_names.index(base_name) + 1
            doc_to_source_index[idx] = source_idx

    # 2. Find all citation numbers in the text to determine if it is 0-based or 1-based
    all_citations = re.findall(r"\[\s*(\d+(?:\s*,\s*\d+)*)\s*\]", text)
    cited_numbers = set()
    for citation in all_citations:
        parts = re.split(r"\s*,\s*", citation)
        for part in parts:
            try:
                cited_numbers.add(int(part))
            except ValueError:
                pass

    # If 0 is in cited numbers, it's 0-based; otherwise we assume 1-based
    is_zero_based = (0 in cited_numbers)

    # 3. Replace citations
    def replace_citation(match):
        content = match.group(1)
        parts = re.split(r"\s*,\s*", content)
        new_parts = []
        for part in parts:
            try:
                val = int(part)
                doc_idx = val if is_zero_based else (val - 1)
                if doc_idx in doc_to_source_index:
                    new_parts.append(str(doc_to_source_index[doc_idx]))
                else:
                    # Filtered out, do not append anything (strip it)
                    pass
            except ValueError:
                new_parts.append(part)
                
        # Deduplicate and sort
        unique_new_parts = []
        for p in new_parts:
            if p not in unique_new_parts:
                unique_new_parts.append(p)
        try:
            unique_new_parts.sort(key=int)
        except ValueError:
            pass
            
        if not unique_new_parts:
            return ""
        return f"[{', '.join(unique_new_parts)}]"

    cleaned = re.sub(r"\[\s*(\d+(?:\s*,\s*\d+)*)\s*\]", replace_citation, text)

    # Remove empty brackets left over (e.g. [] or [ ] or [ , ])
    cleaned = re.sub(r"\[\s*[,]*\s*\]", "", cleaned)

    # 4. Merge adjacent citations like [1][2] -> [1, 2] or [1][1] -> [1]
    def merge_adjacent(match):
        full_match = match.group(0)
        numbers = re.findall(r"\d+", full_match)
        unique_nums = sorted(list(set(int(n) for n in numbers)))
        return f"[{', '.join(str(n) for n in unique_nums)}]"
        
    cleaned = re.sub(r"\[[\d,\s]+\](?:\s*\[[\d,\s]+\])+", merge_adjacent, cleaned)

    # Clean up spacing before punctuation and duplicate spaces
    cleaned = re.sub(r"\s+([,.;:!?])", r"\1", cleaned)
    cleaned = re.sub(r" {2,}", " ", cleaned)

    return cleaned

