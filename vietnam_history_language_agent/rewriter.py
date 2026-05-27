import re
from dataclasses import dataclass


@dataclass(frozen=True)
class RewriteRule:
    name: str
    pattern: str
    replacement: str


class VietnameseHistoryAnswerRewriter:
    """Applies deterministic wording rewrites for Vietnamese history context."""

    RULES: tuple[RewriteRule, ...] = (
        RewriteRule(
            "south_china_sea_dispute",
            r"\bSouth China Sea dispute\b",
            "tranh chấp ở Biển Đông",
        ),
        RewriteRule(
            "south_china_sea",
            r"\bSouth China Sea\b",
            "Biển Đông",
        ),
        RewriteRule(
            "fall_of_saigon",
            r"\bFall of Saigon\b",
            "sự kiện 30/4/1975",
        ),
        RewriteRule(
            "saigon_fell",
            r"\bSaigon fell\b",
            "chiến tranh kết thúc vào ngày 30/4/1975",
        ),
        RewriteRule(
            "south_vietnam_collapsed",
            r"\bSouth Vietnam collapsed\b",
            "chính quyền Việt Nam Cộng hòa chấm dứt tồn tại sau sự kiện 30/4/1975",
        ),
        RewriteRule(
            "north_vietnam_invaded_south_vietnam",
            r"\bNorth Vietnam invaded South Vietnam\b",
            "cuộc chiến tranh 1954-1975 diễn ra trong bối cảnh chia cắt đất nước và quá trình thống nhất Việt Nam",
        ),
        RewriteRule(
            "vietnam_war_ended_with_communist_victory",
            r"\bVietnam War ended with communist victory\b",
            "chiến tranh kết thúc năm 1975, đất nước thống nhất",
        ),
        RewriteRule(
            "vietnam_war",
            r"\bVietnam War\b",
            "chiến tranh Việt Nam",
        ),
        RewriteRule(
            "april_30_1975",
            r"\bApril 30, 1975\b",
            "ngày 30/4/1975",
        ),
        RewriteRule(
            "national_reunification",
            r"\bnational reunification\b",
            "thống nhất đất nước",
        ),
        RewriteRule(
            "the_communist_north",
            r"\bthe communist North\b",
            "miền Bắc",
        ),
        RewriteRule(
            "the_us_backed_south",
            r"\bthe US-backed South\b",
            "chính quyền Việt Nam Cộng hòa được Hoa Kỳ hậu thuẫn",
        ),
        RewriteRule(
            "re_education_camps",
            r"\bre-education camps\b",
            "trại cải tạo sau năm 1975",
        ),
        RewriteRule(
            "boat_people",
            r"\bboat people\b",
            "thuyền nhân sau năm 1975",
        ),
        RewriteRule(
            "paracel_islands",
            r"\bParacel Islands\b",
            "quần đảo Hoàng Sa",
        ),
        RewriteRule(
            "spratly_islands",
            r"\bSpratly Islands\b",
            "quần đảo Trường Sa",
        ),
    )

    def rewrite(self, raw_answer: str) -> tuple[str, list[str]]:
        final_answer = raw_answer or ""
        applied_rules: list[str] = []

        for rule in self.RULES:
            final_answer, count = re.subn(
                rule.pattern,
                rule.replacement,
                final_answer,
                flags=re.IGNORECASE,
            )
            if count:
                applied_rules.append(rule.name)

        final_answer = self._polish(final_answer)
        return final_answer, applied_rules

    def _polish(self, text: str) -> str:
        text = re.sub(r"[ \t]+", " ", text)
        text = re.sub(r" +([,.;:!?])", r"\1", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip()
