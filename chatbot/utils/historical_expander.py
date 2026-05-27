
import re
from typing import List

class HistoricalExpander:
    """
    Xử lý gộp các tên gọi khác nhau của cùng một nhân vật lịch sử.
    Giúp tăng độ chính xác khi tìm kiếm (Retrieval).
    """
    
    # Từ điển các nhân vật phổ biến để xử lý nhanh không cần LLM
    COMMON_ALIASES = {
        "hồ chí minh": ["nguyễn tất thành", "nguyễn ái quốc", "bác hồ", "văn ba"],
        "nguyễn tất thành": ["hồ chí minh", "nguyễn ái quốc", "bác hồ"],
        "nguyễn ái quốc": ["hồ chí minh", "nguyễn tất thành", "bác hồ"],
        "võ nguyên giáp": ["đại tướng giáp", "anh văn"],
        "trần hưng đạo": ["trần quốc tuấn", "hưng đạo vương"],
        "quang trung": ["nguyễn huệ", "bắc bình vương"],
        "nguyễn huệ": ["quang trung", "bắc bình vương"],
        "lê lợi": ["lê thái tổ"],
        "nguyễn trãi": ["ức trai"],
        "gia long": ["nguyễn ánh"],
        "nguyễn ánh": ["gia long"],
        "minh mạng": ["nguyễn phúc đảm"],
        "đinh bộ lĩnh": ["đinh tiên hoàng", "vạn thắng vương"],
        "lý công uẩn": ["lý thái tổ"],
        "phạm văn đồng": ["anh tô"],
        "trường chinh": ["đặng xuân khu"],
    }

    def __init__(self, llm=None):
        self.llm = llm

    def expand_query(self, query: str) -> str:
        """
        Mở rộng câu truy vấn bằng cách thêm các tên gọi khác của nhân vật.
        """
        q_lower = query.lower()
        found_aliases = []

        # 1. Kiểm tra nhanh bằng từ điển
        for name, aliases in self.COMMON_ALIASES.items():
            if name in q_lower:
                for alias in aliases:
                    if alias not in q_lower:
                        found_aliases.append(alias)
        
        # 2. Nếu chưa thấy trong từ điển, dùng LLM để phát hiện nhân vật khác
        if not found_aliases and self.llm:
            try:
                prompt = f"""Bạn là một chuyên gia lịch sử Việt Nam. 
                Hãy xác định xem trong câu hỏi sau có nhắc đến nhân vật lịch sử nào không. 
                Nếu có, hãy liệt kê tất cả các tên gọi khác, bí danh hoặc tên khai sinh của họ.
                Câu hỏi: "{query}"
                Chỉ trả về các tên gọi khác, cách nhau bởi dấu phẩy. Nếu không có nhân vật nào hoặc không biết tên khác, hãy trả về "none".
                Ví dụ: "Nguyễn Ái Quốc là ai?" -> "Hồ Chí Minh, Nguyễn Tất Thành, Văn Ba, Bác Hồ"
                """
                response = self.llm.invoke(prompt)
                content = response.content if hasattr(response, "content") else str(response)
                
                # Làm sạch kết quả
                import re
                content = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()
                
                if content.lower() != "none" and len(content) > 2:
                    llm_aliases = [a.strip() for a in content.split(",") if a.strip()]
                    found_aliases.extend(llm_aliases)
            except Exception as e:
                print(f"⚠️ Expansion LLM Error: {e}")

        if found_aliases:
            # Loại bỏ trùng lặp
            unique_aliases = list(set(found_aliases))
            expansion = " " + " ".join(unique_aliases)
            print(f"--- QUERY EXPANSION: Added {unique_aliases} ---")
            return query + expansion
            
        return query
