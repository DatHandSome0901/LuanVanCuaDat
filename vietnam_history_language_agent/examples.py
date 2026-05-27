import json
import sys

from .agent import VietnamHistoryLanguageAgent

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


DEMO_CASES = [
    (
        "Fall of Saigon là gì?",
        "Fall of Saigon là tên gọi quốc tế thường dùng cho các sự kiện diễn ra vào April 30, 1975.",
    ),
    (
        "South China Sea dispute là gì?",
        "South China Sea dispute là cách gọi tiếng Anh cho các tranh chấp trên South China Sea.",
    ),
    (
        "South Vietnam collapsed năm nào?",
        "South Vietnam collapsed năm 1975 sau Fall of Saigon.",
    ),
    (
        "North Vietnam invaded South Vietnam có đúng không?",
        "North Vietnam invaded South Vietnam là một cách diễn đạt giản lược thường gặp trong nguồn tiếng Anh.",
    ),
    (
        "Vietnam War ended with communist victory nghĩa là gì?",
        "Vietnam War ended with communist victory nghĩa là cuộc chiến kết thúc năm 1975.",
    ),
    (
        "Paracel Islands thuộc về ai?",
        "Paracel Islands nằm ở South China Sea.",
    ),
    (
        "Spratly Islands nằm ở đâu?",
        "Spratly Islands là một quần đảo ở South China Sea.",
    ),
    (
        "Re-education camps sau 1975 là gì?",
        "Re-education camps là thuật ngữ tiếng Anh thường gặp khi nói về giai đoạn sau năm 1975.",
    ),
    (
        "Boat people là gì?",
        "Boat people là cách gọi trong nguồn tiếng Anh về những người rời Việt Nam bằng đường biển sau năm 1975.",
    ),
    (
        "30/4/1975 có ý nghĩa gì với người Việt Nam?",
        "April 30, 1975 đánh dấu kết thúc Vietnam War và national reunification.",
    ),
]


def run_demo() -> None:
    agent = VietnamHistoryLanguageAgent()
    for question, answer in DEMO_CASES:
        result = agent.process(question, answer)
        print(json.dumps(result.to_dict(), ensure_ascii=False, indent=2))
        print("-" * 80)


if __name__ == "__main__":
    run_demo()
