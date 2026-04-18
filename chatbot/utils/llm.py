
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_google_vertexai import ChatVertexAI
import os


class LLM:
    """
    Lớp tiện ích để khởi tạo các mô hình LLM khác nhau
    (OpenAI, Gemini API, Vertex Gemini, Local/Ollama).
    """

    def __init__(self, temperature: float = 0.01, max_tokens: int = 4096, n_ctx: int = 4096) -> None:
        self.temperature = temperature
        self.n_ctx = n_ctx
        self.max_tokens = max_tokens
        self.model = ""

    # ================= OPENAI =================

    def open_ai(self):

        llm = ChatOpenAI(
            openai_api_key=os.environ["KEY_API_OPENAI"],
            model=os.environ["OPENAI_LLM_MODEL_NAME"],
            temperature=self.temperature,
        )

        return llm

    # ================= LOCAL (OLLAMA) =================

    def local_ai(self):

        llm = ChatOpenAI(
            base_url=os.environ["URL_OLLAMA"],
            model=os.environ["MODEL_CHAT_OLLAMA"],
            api_key=os.environ["API_KEY_OLLAMA"],
            temperature=self.temperature,
        )

        return llm

    # ================= GEMINI API =================

    def gemini(self):

        llm = ChatGoogleGenerativeAI(
            google_api_key=os.environ["KEY_API_GOOGLE"],
            model=os.environ["GOOGLE_LLM_MODEL_NAME"],
            temperature=self.temperature,
        )

        return llm

    # ================= VERTEX GEMINI =================

    def vertex(self):

        llm = ChatVertexAI(
        model=os.environ["VERTEX_MODEL_NAME"],  
            project=os.environ["PROJECT_ID"],
            location=os.environ["LOCATION"],
            temperature=self.temperature,
        )

        return llm

    # # ================= GET LLM =================

    # def get_llm(self, llm_name: str):

    #     if llm_name == "openai":
    #         return self.open_ai()

    #     if llm_name == "gemini":
    #         return self.gemini()

    #     if llm_name == "vertex":
    #         return self.vertex()

    #     if llm_name == "local":
    #         return self.local_ai()

    #     raise ValueError(f"LLM not supported: {llm_name}")
    def get_llm(self, llm_name: str = None):
        if not llm_name:
            llm_name = os.getenv("LLM_NAME", "openai")

        if llm_name == "openai":
            return self.open_ai()

        elif llm_name == "gemini":
            return self.gemini()

        elif llm_name == "vertex":
            return self.vertex()

        elif llm_name == "local":
            return self.local_ai()

        raise ValueError(f"LLM not supported: {llm_name}")