import re

def normalize_question(question: str) -> str:

    question = question.lower().strip()
    question = question.replace("?", "")

    remove_patterns = [
        "cho tôi biết",
        "hãy cho biết",
        "hãy nói về",
        "hãy kể về",
        "hãy giải thích",
        "giải thích",
        "tìm hiểu về",
        "thông tin về",
        "nói về",
        "kể về",
        "cho biết",
        "lịch sử của",
        "tiểu sử",
        "ai là",
        "là ai",
        "là gì",
        "là",
        "có phải",
        "ở đâu",
        "khi nào",
        "vì sao",
        "tại sao",
        "nguyên nhân",
        "diễn biến",
        "ý nghĩa",
        "tóm tắt",
        "trình bày",
        "phân tích",
        "mô tả",
        "giới thiệu",
        "sự kiện",
        "nhân vật",
        "về",
        "của",
        "Năm nào"
    ]

    for p in remove_patterns:
        question = question.replace(p, "")

    question = re.sub(r"\s+", " ", question).strip()

    return question




def normalize_question(q):
    q = q.lower().strip()

    # 🔥 bỏ mấy từ vô nghĩa
    q = re.sub(r"(là gì|cho biết|trình bày|nêu|giải thích)", "", q)

    return q.strip()