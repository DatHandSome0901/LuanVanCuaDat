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
