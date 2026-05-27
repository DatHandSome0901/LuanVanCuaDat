import re
import unicodedata
from dataclasses import dataclass


def normalize_text(text: str) -> str:
    text = (text or "").lower()
    text = unicodedata.normalize("NFD", text)
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    return unicodedata.normalize("NFC", text)


@dataclass(frozen=True)
class TopicKeyword:
    topic: str
    category: str


class VietnameseHistoryTopicDetector:
    """Detects whether a question/answer is related to Vietnamese history."""

    KEYWORD_GROUPS: dict[str, list[str]] = {
        "Lịch sử cổ - trung đại": [
            "Hùng Vương", "An Dương Vương", "Âu Lạc", "Bắc thuộc",
            "Hai Bà Trưng", "Bà Triệu", "Ngô Quyền", "Bạch Đằng 938",
            "nhà Đinh", "Tiền Lê", "nhà Lý", "nhà Trần", "nhà Hồ",
            "Lê sơ", "Lê Lợi", "Nguyễn Trãi", "Lam Sơn",
            "Trịnh Nguyễn phân tranh", "Tây Sơn", "Nguyễn Huệ",
            "Quang Trung", "Nguyễn Ánh", "Gia Long", "nhà Nguyễn",
        ],
        "Lịch sử cận đại": [
            "Pháp xâm lược Việt Nam", "Pháp thuộc", "Cần Vương", "Đông Du",
            "Duy Tân", "Phan Bội Châu", "Phan Châu Trinh",
            "Việt Nam Quốc dân Đảng", "Xô Viết Nghệ Tĩnh",
            "Cách mạng tháng Tám", "Quốc khánh 2/9/1945",
            "Tuyên ngôn Độc lập", "nạn đói 1945",
        ],
        "Chiến tranh và thống nhất đất nước": [
            "Chiến tranh Đông Dương", "Điện Biên Phủ",
            "Hiệp định Genève 1954", "Hiệp định Geneva 1954",
            "chia cắt hai miền", "miền Bắc", "miền Nam",
            "Việt Nam Dân chủ Cộng hòa", "Việt Nam Cộng hòa",
            "Mặt trận Dân tộc Giải phóng miền Nam", "Chiến tranh Việt Nam",
            "kháng chiến chống Mỹ", "chống Mỹ cứu nước", "Vịnh Bắc Bộ",
            "Tết Mậu Thân 1968", "Mỹ Lai", "chất độc da cam",
            "Hiệp định Paris 1973", "30/4/1975",
            "ngày giải phóng miền Nam", "thống nhất đất nước",
            "Hồ Chí Minh", "Chủ tịch Hồ Chí Minh",
        ],
        "Sau năm 1975": [
            "bao cấp", "Đổi Mới 1986",
            "bình thường hóa quan hệ Việt Nam - Hoa Kỳ",
            "hậu chiến", "tái thiết đất nước",
        ],
        "Chủ quyền và đối ngoại": [
            "Hoàng Sa", "Trường Sa", "Biển Đông", "chủ quyền biển đảo",
            "chiến tranh biên giới Tây Nam", "Khmer Đỏ", "Campuchia",
            "chiến tranh biên giới phía Bắc 1979",
            "quan hệ Việt Nam - Trung Quốc", "quan hệ Việt Nam - Hoa Kỳ",
        ],
        "Tên gọi quốc tế cần Việt hóa": [
            "South China Sea", "South China Sea dispute", "Fall of Saigon",
            "Saigon fell", "South Vietnam collapsed",
            "North Vietnam invaded South Vietnam", "Vietnam War",
            "the communist North", "the US-backed South",
            "re-education camps", "boat people",
            "Paracel Islands", "Spratly Islands",
        ],
    }

    def __init__(self) -> None:
        self.keywords = [
            TopicKeyword(topic=keyword, category=category)
            for category, keywords in self.KEYWORD_GROUPS.items()
            for keyword in keywords
        ]

    def detect(self, user_question: str, raw_answer: str = "") -> tuple[bool, list[str]]:
        text = f"{user_question or ''}\n{raw_answer or ''}"
        normalized = normalize_text(text)

        matched: list[str] = []
        for keyword in self.keywords:
            if self._contains_keyword(normalized, keyword.topic):
                label = f"{keyword.category}: {keyword.topic}"
                if label not in matched:
                    matched.append(label)

        return bool(matched), matched

    def _contains_keyword(self, normalized_text: str, keyword: str) -> bool:
        normalized_keyword = normalize_text(keyword)
        if not normalized_keyword:
            return False

        # Avoid over-triggering on short dynasty names inside unrelated words.
        if len(normalized_keyword) <= 3:
            return re.search(rf"\b{re.escape(normalized_keyword)}\b", normalized_text) is not None

        return normalized_keyword in normalized_text
