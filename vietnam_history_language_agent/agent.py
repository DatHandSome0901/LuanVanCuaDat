from dataclasses import asdict, dataclass

from .detector import VietnameseHistoryTopicDetector
from .policy import VietnameseHistoryWordingPolicy
from .rewriter import VietnameseHistoryAnswerRewriter


@dataclass
class VietnamHistoryLanguageResult:
    isVietnamHistoryTopic: bool
    matchedTopics: list[str]
    appliedRules: list[str]
    originalAnswer: str
    finalAnswer: str

    def to_dict(self) -> dict:
        return asdict(self)


class VietnamHistoryLanguageAgent:
    """
    Post-processes Vietnamese history answers for Vietnamese readers.

    This agent is intentionally deterministic: it detects Vietnamese history
    context and rewrites sensitive/internationalized terms into natural
    Vietnamese wording without adding new historical claims.
    """

    def __init__(
        self,
        detector: VietnameseHistoryTopicDetector | None = None,
        policy: VietnameseHistoryWordingPolicy | None = None,
        rewriter: VietnameseHistoryAnswerRewriter | None = None,
    ) -> None:
        self.detector = detector or VietnameseHistoryTopicDetector()
        self.policy = policy or VietnameseHistoryWordingPolicy()
        self.rewriter = rewriter or VietnameseHistoryAnswerRewriter()

    def process(self, userQuestion: str, rawAnswer: str) -> VietnamHistoryLanguageResult:
        is_topic, matched_topics = self.detector.detect(userQuestion, rawAnswer)

        if not is_topic:
            return VietnamHistoryLanguageResult(
                isVietnamHistoryTopic=False,
                matchedTopics=[],
                appliedRules=[],
                originalAnswer=rawAnswer,
                finalAnswer=rawAnswer,
            )

        final_answer, applied_rules = self.rewriter.rewrite(rawAnswer)
        return VietnamHistoryLanguageResult(
            isVietnamHistoryTopic=True,
            matchedTopics=matched_topics,
            appliedRules=applied_rules,
            originalAnswer=rawAnswer,
            finalAnswer=final_answer,
        )

    def wording_policy(self) -> dict[str, list[str]]:
        return self.policy.as_dict()
