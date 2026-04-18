from typing import List
from typing_extensions import TypedDict


class GraphState(TypedDict):
    """
    Đại diện cho trạng thái của workflow đơn giản (single-step).

    Dùng trong pipeline cơ bản:
        - Chỉ có question → retrieve → grade → generate.
        - Không cần chia nhỏ câu hỏi.

    Attributes:
        question (str): Câu hỏi người dùng.
        generation (str): Kết quả sinh ra từ LLM.
        documents (List[str]): Danh sách tài liệu liên quan.
        prompt (str): Prompt hệ thống/hướng dẫn kèm theo.
    """

    question: str
    generation: str
    documents: List[str]
