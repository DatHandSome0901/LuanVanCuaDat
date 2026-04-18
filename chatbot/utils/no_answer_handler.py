from chatbot.utils.custom_prompt import CustomPrompt  # noqa: I001
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableSequence
from langchain_core.output_parsers import StrOutputParser


class NoAnswerHandler:
    """
    NoAnswerHandler:
        - Lớp xử lý khi hệ thống không tìm thấy câu trả lời phù hợp.
        - Trả về một thông điệp hướng dẫn người dùng nhập lại câu hỏi.

    Use case:
        - Khi pipeline RAG không truy xuất được tài liệu liên quan.
        - Khi LLM không sinh được câu trả lời thỏa đáng.
    """

    def __init__(self, llm) -> None:
        """
        Khởi tạo NoAnswerHandler với LLM.

        Args:
            llm: Mô hình ngôn ngữ (LLM) đã được khởi tạo sẵn.
        """
        # Prompt bao gồm:
        # - system: hướng dẫn xử lý khi không có câu trả lời
        # - human: truyền câu hỏi gốc của user vào để LLM phản hồi
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", CustomPrompt.HANDLE_NO_ANSWER),
                ("human", " User question: {question}"),
            ]
        )

        # Tạo chain: prompt → llm → parser (chuỗi)
        self.chain = prompt | llm | StrOutputParser()

    def get_chain(self) -> RunnableSequence:
        """
        Lấy runnable chain để thực thi.

        Returns:
            RunnableSequence: Pipeline prompt → LLM → output_parser.
        """
        return self.chain
