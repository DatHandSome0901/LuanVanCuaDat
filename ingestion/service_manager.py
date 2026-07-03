# from langchain_openai import OpenAIEmbeddings
# from langchain_community.embeddings import HuggingFaceEmbeddings
# import os
# # from app.config import settings


# class ServiceManager:
#     def __init__(self) -> None:
#         pass

#     def get_embedding_model(self, embedding_model_name: str = "openai"):
        
#         print(f"Using embedding model: {embedding_model_name}")
#         embeddings = None

#         if embedding_model_name == "openai":
#             embeddings = OpenAIEmbeddings(openai_api_key=os.environ["KEY_API_OPENAI"])

#         elif embedding_model_name == "local":
#             embeddings = OpenAIEmbeddings(
#                 api_key=os.environ["API_KEY_OLLAMA"],
#                 base_url=os.environ["URL_OLLAMA"],
#                 model=os.environ["MODEL_EMBEDDINGS_OLLAMA"],
#             )
        
#         elif embedding_model_name == "phobert":
#             # Set the cache folder for downloading the model
#             model_kwargs = {'device': 'cpu'}
#             encode_kwargs = {'normalize_embeddings': False}
#             embeddings = HuggingFaceEmbeddings(
#                 model_name="VoVanPhuc/sup-SimCSE-VietNamese-phobert-base",
#                 cache_folder="utils/model/",
#                 model_kwargs=model_kwargs,
#                 encode_kwargs=encode_kwargs
#             )

#         return embeddings
from langchain_openai import OpenAIEmbeddings
from langchain_community.embeddings import HuggingFaceEmbeddings, VertexAIEmbeddings
from langchain_google_vertexai import VertexAIEmbeddings
import os


_embedding_model_cache = {}


class ServiceManager:
    def __init__(self) -> None:
        pass

    def get_embedding_model(self, embedding_model_name: str = "openai"):

        print(f"Using embedding model: {embedding_model_name}")

        cache_parts = [embedding_model_name]
        project_id, location = "", ""
        if embedding_model_name == "vertex":
            from chatbot.utils.vertex_helper import get_vertex_config
            project_id, location = get_vertex_config()
            cache_parts.extend([
                project_id,
                location,
                "text-embedding-004",
            ])
        elif embedding_model_name == "openai":
            cache_parts.append(os.environ.get("OPENAI_EMBEDDING_MODEL_NAME", "default"))
        elif embedding_model_name == "local":
            cache_parts.extend([
                os.environ.get("URL_OLLAMA", ""),
                os.environ.get("MODEL_EMBEDDINGS_OLLAMA", ""),
            ])

        cache_key = "::".join(cache_parts)
        if cache_key in _embedding_model_cache:
            print(f"⚡ EMBEDDING CACHE HIT: {embedding_model_name}")
            return _embedding_model_cache[cache_key]

        embeddings = None

        # ================= OPENAI =================
        if embedding_model_name == "openai":
            embeddings = OpenAIEmbeddings(
                openai_api_key=os.environ["KEY_API_OPENAI"]
            )

        # ================= VERTEX AI =================
        elif embedding_model_name == "vertex":

            embeddings = VertexAIEmbeddings(
                model_name="text-embedding-004",
                project=project_id,
                location=location
            )

        # ================= LOCAL OLLAMA =================
        elif embedding_model_name == "local":
            embeddings = OpenAIEmbeddings(
                api_key=os.environ["API_KEY_OLLAMA"],
                base_url=os.environ["URL_OLLAMA"],
                model=os.environ["MODEL_EMBEDDINGS_OLLAMA"],
            )

        # ================= PHOBERT =================
        elif embedding_model_name == "phobert":

            model_kwargs = {'device': 'cpu'}
            encode_kwargs = {'normalize_embeddings': False}

            embeddings = HuggingFaceEmbeddings(
                model_name="VoVanPhuc/sup-SimCSE-VietNamese-phobert-base",
                cache_folder="utils/model/",
                model_kwargs=model_kwargs,
                encode_kwargs=encode_kwargs
            )

        else:
            raise ValueError(f"Embedding model not supported: {embedding_model_name}")

        _embedding_model_cache[cache_key] = embeddings
        return embeddings
