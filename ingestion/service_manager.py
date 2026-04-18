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


class ServiceManager:
    def __init__(self) -> None:
        pass

    def get_embedding_model(self, embedding_model_name: str = "openai"):

        print(f"Using embedding model: {embedding_model_name}")

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
            project=os.environ["PROJECT_ID"],
            location=os.environ["LOCATION"]
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

        return embeddings