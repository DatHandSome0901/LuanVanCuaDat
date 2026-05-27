import os

def add_to_vector_store(question, answer, llm_name="vertex"):

    from langchain_community.vectorstores import FAISS
    from ingestion.service_manager import ServiceManager
    from chatbot.utils.question_normalizer import normalize_question

    # 🔥 Determine embedding model based on llm_name
    embedding_model_name = "vertex"
    if llm_name == "openai":
        embedding_model_name = "openai"
    
    embedding_model = ServiceManager().get_embedding_model(embedding_model_name)

    question = normalize_question(question).lower().strip()
    text = question + "\n" + answer

    # 🔥 Target path is output/{llm_name}
    target_path = os.path.join("output", llm_name)

    # 🔥 nếu chưa có index → tạo mới
    if not os.path.exists(target_path):
        os.makedirs(target_path, exist_ok=True)
        db = FAISS.from_texts(
            [text],
            embedding_model,
            metadatas=[{
                "question": question,
                "answer": answer,
                "type": "qa"
            }]
        )
    else:
        db = FAISS.load_local(
            target_path,
            embedding_model,
            allow_dangerous_deserialization=True
        )

        db.add_texts(
            [text],
            metadatas=[{
                "question": question,
                "answer": answer,
                "type": "qa"
            }]
        )

    db.save_local(target_path)
    from ingestion.retriever import clear_faiss_cache
    clear_faiss_cache()

def remove_from_vector_store(question, llm_name="vertex"):
    from langchain_community.vectorstores import FAISS
    from ingestion.service_manager import ServiceManager
    from chatbot.utils.question_normalizer import normalize_question

    embedding_model_name = "vertex"
    if llm_name == "openai":
        embedding_model_name = "openai"
    
    embedding_model = ServiceManager().get_embedding_model(embedding_model_name)
    question = normalize_question(question).lower().strip()
    target_path = os.path.join("output", llm_name)

    if not os.path.exists(target_path):
        return False

    db = FAISS.load_local(
        target_path,
        embedding_model,
        allow_dangerous_deserialization=True
    )

    # Tìm các ID của documents có câu hỏi khớp
    ids_to_delete = []
    for doc_id, doc in db.docstore._dict.items():
        if doc.metadata.get("question") == question:
            ids_to_delete.append(doc_id)

    if ids_to_delete:
        db.delete(ids_to_delete)
        db.save_local(target_path)
        from ingestion.retriever import clear_faiss_cache
        clear_faiss_cache()
        print(f"🗑️ Đã xóa {len(ids_to_delete)} bản ghi khỏi FAISS ({llm_name}) cho câu hỏi: {question}")
        return True
    
    return False
