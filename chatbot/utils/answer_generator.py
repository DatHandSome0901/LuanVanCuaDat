from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableSequence
from langchain_core.output_parsers import StrOutputParser

from chatbot.utils.custom_prompt import CustomPrompt


class AnswerGenerator:
    """
    Lớp AnswerGenerator:
        - Sinh câu trả lời dựa trên câu hỏi và ngữ cảnh (RAG).
        - Áp dụng prompt hệ thống + câu hỏi người dùng + context.
    """

    def __init__(self, llm) -> None:
        # Tạo prompt: hệ thống → human
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", CustomPrompt.GENERATE_ANSWER_PROMPT),
                ("human", "User question: {question} \n\n Context: {context}"),
            ]
        )
        # Xây dựng chain: prompt → LLM → parser (chuỗi)
        self.chain = prompt | llm | StrOutputParser()

    def get_chain(self) -> RunnableSequence:
        """Trả về chain để có thể invoke()."""
        return self.chain
