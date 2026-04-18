import tiktoken
from app.models.base_db import UserDB

class TokenCounter:
    """
    Tiện ích đếm token sử dụng thư viện tiktoken và xử lý trừ phí người dùng.
    """
    def __init__(self, model_name: str = "gpt-3.5-turbo") -> None:
        try:
            self.encoding = tiktoken.encoding_for_model(model_name)
        except KeyError:
            # Nếu không tìm thấy model, sử dụng cl100k_base mặc định
            self.encoding = tiktoken.get_encoding("cl100k_base")
        self.user_db = UserDB()

    def count_tokens(self, text: str) -> int:
        """
        Đếm số lượng token trong văn bản.
        """
        if not text:
            return 0
        return len(self.encoding.encode(text))

    def calculate_cost(self, tokens: int) -> float:
        """
        Tính toán chi phí dựa trên tỷ lệ được cấu hình trong database.
        Mặc định 1000 tokens = 1.0 đơn vị nếu không có cấu hình.
        """
        rate = float(self.user_db.get_setting('rate_per_1000', '1.0'))
        return (tokens / 1000.0) * rate

    def deduct_tokens(self, email: str, tokens: int, description: str = "Chatbot output charge"):
        """
        Trừ token từ tài khoản người dùng.
        """
        if not email:
            print("---CẢNH BÁO: KHÔNG CÓ EMAIL NGƯỜI DÙNG, KHÔNG THỂ TRỪ TOKEN---")
            return None

        # Giả sử 1 token = 1 đơn vị trong DB (hoặc dùng calculate_cost nếu cần)
        token_cost = float(tokens)
        
        user = self.user_db.get_by_email(email)
        if user:
            new_balance = self.user_db.change_token_balance(
                user_id=user["id"],
                amount=token_cost,
                description=f"{description}: {tokens} tokens",
                tx_type="out"
            )
            return new_balance
        else:
            print(f"---LỖI: KHÔNG TÌM THẤY NGƯỜI DÙNG {email}---")
            return None

    def close(self):
        """Đóng kết nối database."""
        if hasattr(self, 'user_db'):
            self.user_db.close()

