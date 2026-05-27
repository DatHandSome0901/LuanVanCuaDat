from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnableSequence
from langchain_core.output_parsers import StrOutputParser
from langchain_core.messages import HumanMessage, AIMessage

from chatbot.utils.custom_prompt import CustomPrompt


class AnswerGenerator:
    """
    Lớp AnswerGenerator:
        - Sinh câu trả lời dựa trên câu hỏi và ngữ cảnh (RAG).
        - Áp dụng prompt hệ thống + lịch sử hội thoại + câu hỏi + context.
        - ✅ [MỚI] Hỗ trợ Conversation Memory (nhớ ngữ cảnh trước đó).
    """

    def __init__(self, llm) -> None:
        # Tạo prompt với MessagesPlaceholder để nhúng lịch sử hội thoại
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", CustomPrompt.GENERATE_ANSWER_PROMPT),
                MessagesPlaceholder(variable_name="chat_history", optional=True),
                ("human", "User question: {question} \n\n Context: {context}"),
            ]
        )
        # Xây dựng chain: prompt → LLM → parser (chuỗi)
        self.chain = prompt | llm | StrOutputParser()

    def get_chain(self) -> RunnableSequence:
        """Trả về chain để có thể invoke()."""
        return self.chain

    def format_history(self, chat_history: list) -> list:
        """
        Chuyển đổi raw chat history thành LangChain message objects.
        Input:  [{"role": "user", "content": "..."}, ...]
        Output: [HumanMessage(...), AIMessage(...), ...]
        """
        messages = []
        for msg in chat_history or []:
            if msg.get("role") == "user":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg.get("role") == "assistant":
                messages.append(AIMessage(content=msg["content"]))
        return messages
