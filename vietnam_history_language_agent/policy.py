class VietnameseHistoryWordingPolicy:
    """Vietnamese-first wording policy for Vietnamese history answers."""

    RULES: tuple[str, ...] = (
        "Ưu tiên cách gọi phổ biến tại Việt Nam.",
        "Ưu tiên ngữ cảnh lịch sử Việt Nam và cách diễn đạt tự nhiên với người Việt.",
        "Tránh dịch máy từ thuật ngữ tiếng Anh.",
        "Tránh dùng cụm từ tạo cảm giác đứng ngoài lịch sử Việt Nam.",
        "Với sự kiện có tên gọi quốc tế, có thể nhắc phụ nhưng không dùng làm tên chính.",
        "Khi nói về chủ quyền, dùng cách gọi của Việt Nam: Biển Đông, Hoàng Sa, Trường Sa.",
        "Khi nói về 30/4/1975, ưu tiên: ngày giải phóng miền Nam, thống nhất đất nước.",
        "Khi nói về chiến tranh 1954-1975, ưu tiên: kháng chiến chống Mỹ, chiến tranh Việt Nam, hoặc cuộc chiến trong bối cảnh thống nhất đất nước.",
        "Không dùng từ xúc phạm, miệt thị người Việt ở bất kỳ phía nào.",
        "Không kích động thù hằn vùng miền.",
        "Không viết theo kiểu ca ngợi bạo lực.",
        "Không dùng giọng cực đoan hoặc công kích cá nhân/nhóm người.",
    )

    def as_dict(self) -> dict[str, list[str]]:
        return {"rules": list(self.RULES)}

    def as_text(self) -> str:
        return "\n".join(f"- {rule}" for rule in self.RULES)
