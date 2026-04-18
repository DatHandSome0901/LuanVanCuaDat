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
import os

router = APIRouter(tags=["Chatbot"])


# ===============================
# REQUEST / RESPONSE
# ===============================

class ChatRequest(BaseModel):
    question: str
    conversation_id: int | None = None


class ChatResponse(BaseModel):
    answer: str
    tokens_charged: float
    user_token_balance: float
    sources: list[str] = []


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

        llm_name = os.environ.get("LLM_NAME", "openai")

        path_vector_store = os.environ.get("PATH_VECTOR_STORE")

        # llm = LLM().get_llm(llm_name)
        llm = LLM().get_llm()   # ✅

        agent = FilesChatAgent(
            llm_model=llm,
            path_vector_store=path_vector_store,
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
        sources = []

        for doc in documents:
            source = doc.metadata.get("source") or doc.metadata.get("filename")
            if source:
                sources.append(os.path.basename(source))

        sources = list(set(sources))

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
        # SOURCES
        # ===============================

        sources = []

        for doc in documents:

            source = doc.metadata.get("source") or doc.metadata.get("filename")

            if source:
                sources.append(os.path.basename(source))

        sources = list(set(sources))


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

    llm_name = os.environ.get("LLM_NAME", "openai")

    path_vector_store = os.environ.get("PATH_VECTOR_STORE")

    # llm = LLM().get_llm(llm_name)
    llm = LLM().get_llm()   # ✅

    agent = FilesChatAgent(
        llm_model=llm,
        path_vector_store=path_vector_store,
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