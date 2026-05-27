import re

def normalize_question(q: str) -> str:
    q = q.lower().strip()
    # Loại bỏ dấu câu ở cuối
    q = re.sub(r"[?!.]+$", "", q)
    
    # Những từ để hỏi/mệnh lệnh không mang giá trị ngữ nghĩa tìm kiếm
    stopwords = [
        "cho tôi biết", "hãy cho biết", "hãy nói về", "hãy kể về", 
        "hãy giải thích", "giải thích", "tìm hiểu về", "thông tin chi tiết về", "thông tin về", 
        "nói về", "kể về", "cho biết", "lịch sử của", "tiểu sử của", "tiểu sử", 
        "ai là", "là ai", "là gì", "là", "có phải", "ở đâu", "khi nào", "năm nào", 
        "vì sao", "tại sao", "nguyên nhân", "diễn biến", "ý nghĩa", "tóm tắt", 
        "trình bày", "phân tích", "mô tả", "giới thiệu", "sự kiện", "nhân vật", "nêu"
    ]
    
    # Sắp xếp dài trước ngắn sau để replace không bị lầm
    stopwords.sort(key=len, reverse=True)
    
    for word in stopwords:
        # Dùng regex để thay thế đúng cụm từ đứng độc lập, không dính vào chữ khác
        pattern = r'(?:\s|^)' + re.escape(word) + r'(?:\s|$)'
        # Replace lặp lại 2 lần để xử lý các từ sát nhau bị overlap space
        q = re.sub(pattern, ' ', q)
        q = re.sub(pattern, ' ', q)
        
    q = re.sub(r"\s+", " ", q).strip()
    return q