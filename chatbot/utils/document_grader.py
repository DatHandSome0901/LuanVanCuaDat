
from langchain_core.prompts import ChatPromptTemplate
from chatbot.utils.custom_prompt import CustomPrompt
from langchain_core.runnables import RunnableSequence
from langchain_core.output_parsers import StrOutputParser


class DocumentGrader:
    """
    Kiểm tra document có liên quan tới câu hỏi hay không.
    Trả về: "yes" hoặc "no"
    """

    def __init__(self, llm) -> None:

        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", CustomPrompt.GRADE_DOCUMENT_PROMPT),
                (
                    "human",
                    "Retrieved document:\n\n{document}\n\nUser question: {question}",
                ),
            ]
        )

        # pipeline LLM
        self.chain = prompt | llm | StrOutputParser()

    def get_chain(self) -> RunnableSequence:
        return self.chain