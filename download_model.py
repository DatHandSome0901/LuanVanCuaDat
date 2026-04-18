from langchain_community.embeddings import HuggingFaceEmbeddings
import os

def download_phobert_model():
    model_name = "VoVanPhuc/sup-SimCSE-VietNamese-phobert-base"
    cache_folder = "utils/model/"
    
    print(f"--- Đang tải mô hình: {model_name} ---")
    print(f"--- Thư mục lưu trữ: {os.path.abspath(cache_folder)} ---")
    
    try:
        # Khởi tạo model để kích hoạt quá trình tải về
        model_kwargs = {'device': 'cpu'}
        encode_kwargs = {'normalize_embeddings': False}
        
        embeddings = HuggingFaceEmbeddings(
            model_name=model_name,
            cache_folder=cache_folder,
            model_kwargs=model_kwargs,
            encode_kwargs=encode_kwargs
        )
        
        print("--- Tải mô hình thành công! ---")
        return True
    except Exception as e:
        print(f"--- Lỗi khi tải mô hình: {str(e)} ---")
        return False

if __name__ == "__main__":
    # Đảm bảo thư mục tồn tại nếu cần (HuggingFaceEmbeddings tự tạo nhưng tốt nhất là kiểm tra)
    if not os.path.exists("utils/model/"):
        os.makedirs("utils/model/", exist_ok=True)
        
    download_phobert_model()
