
from typer.cli import state

from chatbot.utils.question_normalizer import normalize_question
from ingestion.retriever import Retriever
from chatbot.utils.document_grader import DocumentGrader
from chatbot.utils.answer_generator import AnswerGenerator
from chatbot.utils.no_answer_handler import NoAnswerHandler

from langgraph.graph import END, StateGraph, START
from chatbot.utils.graph_state import GraphState
from typing import Dict, Any
import os
import re
from concurrent.futures import ThreadPoolExecutor


class FilesChatAgent:

    def __init__(self, llm_model, path_vector_store, allowed_files=["*"]) -> None:
        self.allowed_files = allowed_files
        self.path_vector_store = path_vector_store

        self.llm = llm_model
        self.document_grader = DocumentGrader(self.llm)
        self.answer_generator = AnswerGenerator(self.llm)
        self.no_answer_handler = NoAnswerHandler(self.llm)

   

    def handle_no_answer(self, state: GraphState) -> Dict[str, Any]:

        from app.models.base_db import UserDB

        
        question = normalize_question(state["question"]).lower().strip()

        print("=== NO DOC → LLM + SAVE DB ===")

        db = UserDB()

        # 🔥 1. CHECK pending
        pending = db.get_pending_by_question(question)

        if pending:
            print("⚠️ CÂU CHƯA DUYỆT")

            answer = pending.get("answer", "")

            db.close()

            return {
                    "generation": (
                        "👉 Xin lỗi, hệ thống chưa có dữ liệu.\n"
                        "(Dưới đây là câu trả lời tham khảo):\n\n"
                        + answer
                    )
                }
        # 🔥 2. CHƯA CÓ → GỌI LLM
        response = self.no_answer_handler.get_chain().invoke({
            "question": question
        })

        generation = response.content if hasattr(response, "content") else str(response)

        generation = re.sub(r"<.*?>", "", generation).strip()

        # 🔥 3. LƯU DB (chỉ lưu câu trả lời)
        db.save_pending_knowledge(question, generation)
        db.close()

        # 🔥 4. TRẢ RA UI (có xin lỗi + tham khảo)
        return {
            "generation": (
                "👉 Xin lỗi, hệ thống chưa có dữ liệu.\n"
                "(Dưới đây là câu trả lời tham khảo):\n\n"
                + generation
            )
        }

  
    def generate(self, state: GraphState) -> Dict[str, Any]:

        question = state["question"]
        documents = state["documents"]

        # 🔥 1. KHÔNG CÓ DOC → FALLBACK
        if not documents:
            return self.handle_no_answer(state)

        # 🔥 2. TẠO CONTEXT
        # context = "\n\n".join(
        #     getattr(doc, "page_content", str(doc)) for doc in documents
        # )

        context_list = []

        for doc in documents:
            # 🔥 ưu tiên answer nếu có
            if "answer" in doc.metadata:
                context_list.append(doc.metadata["answer"])
            else:
                context_list.append(doc.page_content)

        context = "\n\n".join(context_list)

        # 🔥 3. GỌI LLM
        response = self.answer_generator.get_chain().invoke({
            "question": question,
            "context": context
        })

        generation = response.content if hasattr(response, "content") else str(response)
        generation = re.sub(r"<tool_call>.*?<tool_call>", "", generation, flags=re.DOTALL).strip()
        clean_gen = generation.lower().strip()

        if any(x in clean_gen for x in [
            "khong_co_du_lieu",
            "không có dữ liệu",
            "khong co du lieu"
        ]):
            print("⚠️ RAG FAIL → FALLBACK AI")
            return self.handle_no_answer(state)

        return {
            "generation": generation,
            "documents": documents
        }
    # =================================
    # RETRIEVE + SMART SCORING
    # =================================
    def retrieve(self, state: GraphState) -> Dict[str, Any]:

        question = normalize_question(state["question"]).lower().strip()

        # ===== YEAR =====
        years = re.findall(r"\b(1[0-9]{3}|20[0-9]{2})\b", question)
        year_filter = int(years[0]) if years else None

        if year_filter:
            print(f"--- YEAR: {year_filter} ---")

        # ===== DYNASTY =====
        dynasty_map = {
            "văn lang": (-700, -258),
            "âu lạc": (-257, -179),
            "bắc thuộc": (-179, 938),

            "ngô": (939, 965),
            "đinh": (968, 980),
            "tiền lê": (980, 1009),

            "lý": (1009, 1225),
            "trần": (1225, 1400),
            "hồ": (1400, 1407),
            "minh thuộc": (1407, 1427),

            "hậu lê": (1428, 1789),
            "nam bắc triều": (1533, 1592),
            "trịnh nguyễn": (1627, 1775),

            "tây sơn": (1771, 1802),
            "nguyễn": (1802, 1945),

            "pháp thuộc": (1858, 1945),
        }

        range_filter = None
        dynasty_key = None

        for key, (start, end) in dynasty_map.items():
            if key in question:
                range_filter = (start, end)
                dynasty_key = key
                print(f"--- DYNASTY: {key} ({start}-{end}) ---")
                break

        # retriever_main = Retriever(
        #     embedding_model_name=os.environ["EMBEDDING_MODEL_NAME"]
        # ).set_retriever(
        #     path_vector_store=self.path_vector_store
        # )

        import os

        path = f"{self.path_vector_store}/{os.getenv('LLM_NAME')}"

        print("👉 ĐANG LOAD VECTOR:", path)

        retriever_main = Retriever(
            embedding_model_name=os.environ["EMBEDDING_MODEL_NAME"]
        ).set_retriever(
            path_vector_store=path
        )

        docs_main = retriever_main.get_documents(
            query=question,
            num_doc=int(os.environ.get("NUMDOCS", 10))
        )

        # ===== VECTOR HỌC THÊM =====
        docs_extra = []

        if os.path.exists("output"):
            retriever_extra = Retriever(
                embedding_model_name=os.environ["EMBEDDING_MODEL_NAME"]
            ).set_retriever(
                path_vector_store="output"
            )

            docs_extra = retriever_extra.get_documents(
                query=question,
                num_doc=10
            )

        # ===== GỘP =====
        raw_docs = docs_main + docs_extra

        # 🔥 ƯU TIÊN QA (CỰC QUAN TRỌNG)
        qa_docs = [d for d in raw_docs if d.metadata.get("type") == "qa"]
        normal_docs = [d for d in raw_docs if d.metadata.get("type") != "qa"]

        # nếu QA ít → không ưu tiên nữa
        if len(qa_docs) >= 3:
            documents = qa_docs[:5] + normal_docs[:5]
        else:
            documents = raw_docs[:10]

        print("MAIN:", len(docs_main))
        print("EXTRA:", len(docs_extra))
        print("TOTAL:", len(raw_docs))


        # ===== FALLBACK =====
        if not documents:
            print("❌ KHÔNG CÓ DOCUMENT")
            return {
                "documents": [],
                "question": question
    }

        # ===== DEBUG =====
        print("===== FINAL DOCUMENTS =====")
        print("Total:", len(documents))

        for d in documents[:3]:
            print(d.page_content[:100])
            print("META:", d.metadata)

        return {
            "documents": documents,
            "question": question
        }

    # =================================
    # DECISION
    # =================================
    def decide_to_generate(self, state: GraphState) -> str:

        if not state["documents"]:
            print("--- NO DOCUMENT ---")
            return "no_document"

        return "generate"

    # =================================
    # GRADE DOCUMENT
    def grade_documents(self, state: GraphState) -> Dict[str, Any]:

        question = state["question"]
        documents = state["documents"]

        def grade(doc):

            # 🔥 FIX 1: lấy đúng content
            document_text = doc.metadata.get("answer", doc.page_content)

            response = self.document_grader.get_chain().invoke({
                "question": question,
                "document": document_text
            })

            content = response.content if hasattr(response, "content") else str(response)

            content = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip().lower()

            # 🔥 FIX 2: check YES mềm
            if "yes" in content:
                return doc

            return None

        with ThreadPoolExecutor() as executor:
            results = list(executor.map(grade, documents))

        filtered_docs = [d for d in results if d]

        return {
            "documents": filtered_docs,
            "question": question
        }

    # =================================
    # WORKFLOW
    # =================================
    def get_workflow(self):

        workflow = StateGraph(GraphState)

        workflow.add_node("retrieve", self.retrieve)
        workflow.add_node("grade_documents", self.grade_documents)
        workflow.add_node("generate", self.generate)
        workflow.add_node("handle_no_answer", self.handle_no_answer)

        workflow.add_edge(START, "retrieve")
        workflow.add_edge("retrieve", "grade_documents")

        workflow.add_conditional_edges(
            "grade_documents",
            self.decide_to_generate,
            {
                "no_document": "handle_no_answer",
                "generate": "generate",
            },
        )

        workflow.add_edge("generate", END)
        workflow.add_edge("handle_no_answer", END)

        return workflow

