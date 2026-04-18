import os

def add_to_vector_store(question, answer):

    from langchain_community.vectorstores import FAISS
    from ingestion.service_manager import ServiceManager
    from chatbot.utils.question_normalizer import normalize_question

    embedding_model = ServiceManager().get_embedding_model("vertex")

    question = normalize_question(question).lower().strip()
    combined_text = question + "\n" + answer
    text = question + "\n" + answer

    # 🔥 nếu chưa có index → tạo mới
    if not os.path.exists("output"):
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
            "output",
            embedding_model,
            allow_dangerous_deserialization=True
        )

        combined_text = question + "\n" + answer

        db.add_texts(
            [combined_text],
            metadatas=[{
                "question": question,
                "answer": answer,
                "type": "qa"
            }]
        )

    db.save_local("output")