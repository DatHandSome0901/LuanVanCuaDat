"""
Router Chatbot API Endpoint

Endpoint này sử dụng FilesChatAgent để:
1. Truy xuất tài liệu (Retrieval)
2. Chấm điểm và lọc tài liệu (Filtering)
3. Sinh câu trả lời (Generation)
4. Tính phí token output và trừ số dư người dùng
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from transformers import generation
from app.security.security import get_current_user
from chatbot.services.files_rag_chat_agent import FilesChatAgent
from chatbot.utils.llm import LLM
from chatbot.utils.token_counter import TokenCounter
from app.models.base_db import UserDB
from ingestion.retriever import Retriever
import os

router = APIRouter(tags=["Chatbot"])


# ===============================
# REQUEST / RESPONSE
# ===============================

class ChatRequest(BaseModel):
    question: str
    conversation_id: int | None = None

class SourceInfo(BaseModel):
    filename: str
    content: str

class ChatResponse(BaseModel):
    answer: str
    tokens_charged: float
    user_token_balance: float
    sources: list[SourceInfo] = []


# ===============================
# CREATE NEW CHAT
# ===============================

@router.post("/new_chat")
async def new_chat(current_user: dict = Depends(get_current_user)):

    db = UserDB()

    conversation_id = db.create_conversation(current_user["id"])

    db.close()

    return {"conversation_id": conversation_id}


# ===============================
# SIDEBAR CHATS
# ===============================

@router.get("/conversations")
async def get_conversations(current_user: dict = Depends(get_current_user)):

    db = UserDB()

    conversations = db.get_conversations(current_user["id"])

    db.close()

    return conversations


# ===============================
# LOAD CHAT MESSAGES
# ===============================

@router.get("/messages/{conversation_id}")
async def get_messages(conversation_id: int):

    db = UserDB()

    messages = db.get_messages(conversation_id)

    db.close()

    return messages


class UpdateConversationRequest(BaseModel):
    title: str | None = None
    note: str | None = None
    is_pinned: bool | None = None


# ===============================
# DELETE CHAT
# ===============================

@router.delete("/conversation/{conversation_id}")
async def delete_chat(conversation_id: int):

    db = UserDB()

    db.delete_conversation(conversation_id)

    db.close()

    return {"status": "deleted"}


# ===============================
# UPDATE CHAT (TITLE / NOTE / PIN)
# ===============================

@router.put("/conversation/{conversation_id}")
async def update_conversation(
    conversation_id: int,
    request: UpdateConversationRequest,
    current_user: dict = Depends(get_current_user)
):

    db = UserDB()

    db.update_conversation(
        conversation_id,
        title=request.title,
        note=request.note,
        is_pinned=request.is_pinned
    )

    db.close()

    return {"status": "updated"}


# ===============================
# MAIN CHAT (RAG)
# ===============================

@router.post("/chat", response_model=ChatResponse)
async def chat_with_router(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):

    token_counter = TokenCounter()

    try:

        email = current_user.get("email")

        user = token_counter.user_db.get_by_email(email)

        if not user or user.get("token_balance", 0) <= 0:
            raise HTTPException(status_code=402, detail="Số dư token không đủ.")

        db = UserDB()
        llm_name = db.get_setting("llm_name", os.environ.get("LLM_NAME", "openai"))
        db.close() # Nhớ đóng DB

        # DYNAMIC VECTOR PATH logic
        base_vector_path = os.environ.get("PATH_VECTOR_STORE")
        path_vector_store = base_vector_path
        if base_vector_path:
            model_specific_path = os.path.join(base_vector_path, llm_name)
            if os.path.exists(model_specific_path):
                path_vector_store = model_specific_path
        
        # llm = LLM().get_llm(llm_name)
        llm = LLM().get_llm(llm_name)   # ✅

        # DYNAMIC EMBEDDING logic
        embedding_model_name = os.environ.get("EMBEDDING_MODEL_NAME", "openai")
        if llm_name == "openai":
            embedding_model_name = "openai"
        elif llm_name in ["vertex", "gemini"]:
            embedding_model_name = "vertex"

        agent = FilesChatAgent(
            llm_model=llm,
            path_vector_store=path_vector_store,
            embedding_model_name=embedding_model_name,
            allowed_files=["*"]
        )

        pipeline = agent.get_workflow().compile()

        user_db = UserDB()

        conversation_id = request.conversation_id

        if not conversation_id:

            conversation_id = user_db.create_conversation(current_user["id"])


        # SAVE USER MESSAGE
        user_db.save_message(conversation_id, "user", request.question)


        # ===============================
        # RAG PIPELINE
        # ===============================

        result = pipeline.invoke({
            "question": request.question
        })

        generation = result.get("generation", "_null_")
        documents = result.get("documents", [])

        # ===============================
        # SOURCES (TẠO TRƯỚC)
        # ===============================
        source_dict = {}
        for doc in documents:
            source = doc.metadata.get("source") or doc.metadata.get("filename")
            if source:
                fname = os.path.basename(source)
                if fname not in source_dict:
                    source_dict[fname] = []
                source_dict[fname].append(doc.page_content)
                
        sources = []
        for fname, chunks in source_dict.items():
            content = f"### Tài liệu: {fname}\n\n"
            for i, chunk in enumerate(chunks):
                content += f"**[Đoạn {i+1}]**\n{chunk}\n\n"
            sources.append({
                "filename": fname,
                "content": content.strip()
            })

        # ===============================
        # SAVE AI MESSAGE (SAU KHI CÓ sources)
        # ===============================
        user_db.save_message(
            conversation_id,
            "assistant",
            generation,
            sources
        )


        # ===============================
        # AUTO TITLE CHAT
        # ===============================

        messages = user_db.get_messages(conversation_id)

        if len(messages) <= 2:

            title_prompt = f"""
            Tạo tiêu đề ngắn 3-5 từ cho câu hỏi sau.
            Chỉ trả về tiêu đề.

            Câu hỏi: {request.question}
            """

            title = llm.invoke(title_prompt).content.strip()

            user_db.cursor.execute(
                "UPDATE conversations SET title=? WHERE id=?",
                (title, conversation_id)
            )

            user_db.conn.commit()


        # ===============================
        # SOURCES (Bỏ qua vì đã xử lý ở trên)
        # ===============================


        # ===============================
        # TOKEN COST
        # ===============================

        tokens_in = token_counter.count_tokens(request.question)

        tokens_out = token_counter.count_tokens(generation)

        total_tokens = tokens_in + tokens_out

        cost = token_counter.calculate_cost(total_tokens)

        q_brief = (request.question[:30] + '...') if len(request.question) > 30 else request.question

        new_balance = token_counter.deduct_tokens(
            email=email,
            tokens=cost,
            description=f"Hỏi đáp: {q_brief}"
        )

        if new_balance is None:

            user = user_db.get_by_email(email)

            new_balance = user.get("token_balance", 0.0) if user else 0.0


        # SAVE CHAT LOG
        user_db.save_chat_log(user['id'], request.question, generation, cost)

        user_db.close()


        return ChatResponse(
            answer=generation,
            tokens_charged=float(cost),
            user_token_balance=float(new_balance),
            sources=sources
        )

    except HTTPException:
        raise

    # except Exception as e:
    #     raise HTTPException(status_code=500, detail=f"Lỗi xử lý chatbot: {str(e)}")
    except Exception as e:
        import traceback
        print("🔥🔥🔥 PIPELINE ERROR 🔥🔥🔥")
        traceback.print_exc()
        print("🔥🔥🔥 END ERROR 🔥🔥🔥")

        raise HTTPException(status_code=500, detail=str(e))

    finally:
        token_counter.close()


# ===============================
# STREAMING CHAT
# ===============================

def stream_answer(agent, question):

    for chunk in agent.stream(question):

        yield chunk


@router.post("/chat_stream")
async def chat_stream(request: ChatRequest):

    db = UserDB()
    llm_name = db.get_setting("llm_name", os.environ.get("LLM_NAME", "openai"))
    db.close()

    base_vector_path = os.environ.get("PATH_VECTOR_STORE")
    path_vector_store = base_vector_path
    if base_vector_path:
        model_specific_path = os.path.join(base_vector_path, llm_name)
        if os.path.exists(model_specific_path):
            path_vector_store = model_specific_path

    # llm = LLM().get_llm(llm_name)
    llm = LLM().get_llm(llm_name)   # ✅

    # DYNAMIC EMBEDDING logic
    embedding_model_name = os.environ.get("EMBEDDING_MODEL_NAME", "openai")
    if llm_name == "openai":
        embedding_model_name = "openai"
    elif llm_name in ["vertex", "gemini"]:
        embedding_model_name = "vertex"

    agent = FilesChatAgent(
        llm_model=llm,
        path_vector_store=path_vector_store,
        embedding_model_name=embedding_model_name,
        allowed_files=["*"]
    )

    return StreamingResponse(
        stream_answer(agent, request.question),
        media_type="text/event-stream"
    )


# ===============================
# OLD HISTORY (BACKUP)
# ===============================

@router.get("/history")
async def get_chat_history(current_user: dict = Depends(get_current_user)):

    user_db = UserDB()

    logs = user_db.get_user_chat_logs(current_user["id"])

    user_db.close()

    history = []

    for log in logs:

        history.append({
            "id": f"q-{log['id']}",
            "role": "user",
            "content": log["question"],
            "timestamp": log["created_at"]
        })

        history.append({
            "id": f"a-{log['id']}",
            "role": "assistant",
            "content": log["answer"],
            "timestamp": log["created_at"],
            "tokens_charged": log["tokens_charged"]
        })

    return {"history": history}


@router.delete("/history")
async def delete_chat_history(current_user: dict = Depends(get_current_user)):

    user_db = UserDB()

    user_db.delete_user_chat_logs(current_user["id"])

    user_db.close()

    return {"message": "Đã xóa lịch sử chat thành công"}


# ===============================
# SITE CONFIG
# ===============================

@router.get("/config")
async def get_site_config():

    db = UserDB()

    logo_url = db.get_setting("logo_url", "")

    site_title = db.get_setting("site_title", "Chatbot Phật Giáo")

    db.close()

    return {
        "logo_url": logo_url,
        "site_title": site_title
    }

# ===============================
# SOURCE CONTENT & FORMATTING
# ===============================

@router.get("/source/{filename}")
async def get_source_content(filename: str, current_user: dict = Depends(get_current_user)):
    db = UserDB()
    llm_name = db.get_setting("llm_name", os.environ.get("LLM_NAME", "openai"))
    db.close()
    
    base_vector_path = os.environ.get("PATH_VECTOR_STORE")
    path_vector_store = base_vector_path
    if base_vector_path:
        model_specific_path = os.path.join(base_vector_path, llm_name)
        if os.path.exists(model_specific_path):
            path_vector_store = model_specific_path

    embedding_model_name = os.environ.get("EMBEDDING_MODEL_NAME", "openai")
    if llm_name == "openai":
        embedding_model_name = "openai"
    elif llm_name in ["vertex", "gemini"]:
        embedding_model_name = "vertex"

    try:
        retriever_instance = Retriever(
            embedding_model_name=embedding_model_name
        ).set_retriever(
            path_vector_store=path_vector_store
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    all_docs = list(retriever_instance.retriever.docstore._dict.values())
    
    matching_docs = []
    for doc in all_docs:
        source = doc.metadata.get("source") or doc.metadata.get("filename")
        if source and os.path.basename(source) == filename:
            matching_docs.append(doc)
            
    if not matching_docs:
        raise HTTPException(status_code=404, detail="Source not found in vector store.")
        
    content = f"### Tài liệu: {filename}\n\n"
    for i, doc in enumerate(matching_docs):
        content += f"**[Đoạn {i+1}]**\n{doc.page_content}\n\n"
        
    return {"filename": filename, "content": content.strip()}


class FormatRequest(BaseModel):
    text: str

@router.post("/source/format")
async def format_source_content(request: FormatRequest, current_user: dict = Depends(get_current_user)):
    db = UserDB()
    llm_name = db.get_setting("llm_name", os.environ.get("LLM_NAME", "openai"))
    db.close()
    
    llm = LLM().get_llm(llm_name)
    prompt = f"""Bạn là một chuyên gia biên tập văn bản.
Dưới đây là nội dung văn bản được trích xuất từ tài liệu (có thể bị lỗi xuống dòng, dính chữ, hoặc định dạng xấu do OCR/PDF extract).
Nhiệm vụ của bạn là:
1. Sửa lại lỗi chính tả hoặc nối các câu bị đứt gãy do lỗi extract.
2. Trình bày lại cho đẹp mắt, dễ đọc (sử dụng Markdown: in đậm, gạch đầu dòng, chia đoạn hợp lý).
Tuyệt đối KHÔNG thay đổi ý nghĩa gốc, KHÔNG tự bịa thêm thông tin ngoài lề. Chỉ biên tập lại văn bản này.

NỘI DUNG GỐC:
{request.text}

NỘI DUNG ĐÃ BIÊN TẬP:"""

    try:
        response = llm.invoke(prompt)
        content = response.content if hasattr(response, "content") else str(response)
        
        # Strip thinking tags if using reasoning models
        import re
        content = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()
        content = re.sub(r"<\|think\|>.*?<\|/think\|>", "", content, flags=re.DOTALL).strip()
        
        return {"formatted_text": content.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM formatting error: {str(e)}")