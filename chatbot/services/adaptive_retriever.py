"""
adaptive_retriever.py
======================
Orchestrator tái xếp hạng (re-ranking) tài liệu sau khi FAISS trả về kết quả thô.

Pipeline:
    FAISS docs (raw) → AdaptiveRetriever.rerank() → docs đã sắp xếp lại

Công thức:
    final_score = alpha * semantic_score
                + beta  * temporal_score(query, doc)
                + gamma * causal_score(query, doc)

Trọng số (alpha, beta, gamma) và top_k thay đổi theo intent:
    | Intent     | alpha | beta | gamma | top_k |
    |------------|-------|------|-------|-------|
    | factual    | 0.70  | 0.20 | 0.10  |  10   |
    | causal     | 0.40  | 0.10 | 0.50  |  10   |
    | temporal   | 0.40  | 0.50 | 0.10  |  10   |
    | comparison | 0.60  | 0.20 | 0.20  |  15   |

Phục vụ luận văn:
    - Log rõ ràng theo format chuẩn
    - Trả về score breakdown từng tài liệu để debug
"""

import logging
from dataclasses import dataclass, field
from typing import Any

from chatbot.services.causal_engine import causal_score, temporal_score
from chatbot.services.query_classifier import get_weights

# ─────────────────────────────────────────────
# LOGGER
# ─────────────────────────────────────────────
logger = logging.getLogger("adaptive_retriever")


# ─────────────────────────────────────────────
# DATA CLASSES
# ─────────────────────────────────────────────

@dataclass
class ScoredDoc:
    """Tài liệu đã được chấm điểm đầy đủ."""
    doc: Any                  # LangChain Document
    semantic_score: float     # Cosine similarity ước tính từ FAISS rank
    temporal: float           # temporal_score()
    causal: float             # causal_score()
    final_score: float        # alpha*sem + beta*temp + gamma*caus

    @property
    def score_dict(self) -> dict[str, float]:
        return {
            "semantic": round(self.semantic_score, 4),
            "temporal": round(self.temporal, 4),
            "causal":   round(self.causal, 4),
            "final":    round(self.final_score, 4),
        }


# ─────────────────────────────────────────────
# ADAPTIVE RETRIEVER
# ─────────────────────────────────────────────

class AdaptiveRetriever:
    """
    Tái xếp hạng tài liệu từ FAISS dựa trên intent của câu hỏi.

    Không thay thế FAISS, chỉ là post-processing layer.

    Usage:
        ar = AdaptiveRetriever()
        ranked_docs, score_summary = ar.rerank(
            query="Tại sao nhà Trần thắng?",
            docs=faiss_docs,   # list[Document]
            intent="causal"
        )
    """

    def rerank(
        self,
        query: str,
        docs: list,
        intent: str,
        entity_key: str | None = None,
    ) -> tuple[list, dict]:
        """
        Tái xếp hạng tài liệu theo công thức multi-score + entity-aware bonus/penalty.

        Args:
            query      (str):   Câu hỏi đã normalize.
            docs       (list):  Tài liệu thô từ FAISS (thứ tự giảm dần theo similarity).
            intent     (str):   Kết quả từ classify_query().
            entity_key (str):   Entity key từ viet_history_entities (None = bỏ qua).

        Returns:
            tuple:
                - list[Document]: Tài liệu đã re-rank, cắt theo top_k
                - dict: Score tổng hợp của 3 tài liệu đầu (cho debug response)
        """
        if not docs:
            return [], {}

        weights = get_weights(intent)  # type: ignore[arg-type]
        alpha: float = weights["alpha"]   # type: ignore[assignment]
        beta:  float = weights["beta"]    # type: ignore[assignment]
        gamma: float = weights["gamma"]   # type: ignore[assignment]
        top_k: int   = weights["top_k"]   # type: ignore[assignment]

        logger.info("[INTENT] %s | weights α=%.2f β=%.2f γ=%.2f top_k=%d",
                    intent, alpha, beta, gamma, top_k)
        print(f"[INTENT] {intent} | α={alpha} β={beta} γ={gamma} top_k={top_k}")

        # Load entity scorer nếu có entity
        entity_scorer = None
        if entity_key:
            try:
                from chatbot.utils.viet_history_entities import entity_score_for_doc
                entity_scorer = entity_score_for_doc
                print(f"[ENTITY RERANK] Using entity-aware scoring for: {entity_key}")
            except ImportError:
                pass

        scored: list[ScoredDoc] = []

        # Tìm max_rank để chuẩn hóa
        max_rank = 1
        for d in docs:
            if hasattr(d, "metadata") and d.metadata and "original_rank" in d.metadata:
                max_rank = max(max_rank, d.metadata["original_rank"])

        for rank, doc in enumerate(docs):
            # Ước tính semantic score từ vị trí FAISS (rank 0 = cao nhất)
            orig_rank = rank
            denom = max(len(docs) - 1, 1)
            if hasattr(doc, "metadata") and doc.metadata and "original_rank" in doc.metadata:
                orig_rank = doc.metadata["original_rank"]
                denom = max_rank
            
            sem = max(1.0 - orig_rank * (0.5 / denom), 0.5)

            text = self._get_doc_text(doc)

            t_score = temporal_score(query, text)
            c_score = causal_score(query, text)

            final = (alpha * sem) + (beta * t_score) + (gamma * c_score)

            # Entity-aware delta: bonus nếu doc chứa entity, penalty nếu lạc đề
            if entity_scorer and not doc.metadata.get("is_user_rag"):
                # Kết hợp title + content để score
                doc_meta_text = (
                    str(doc.metadata.get("file_name", "")) + " " +
                    str(doc.metadata.get("source", ""))
                )
                entity_delta = entity_scorer(doc_meta_text + " " + text, entity_key)
                final = final + entity_delta
                if entity_delta != 0.0:
                    print(f"   [ENTITY DELTA] doc[{rank}] entity_delta={entity_delta:+.2f}")

            final = round(min(max(final, 0.0), 1.0), 4)

            sd = ScoredDoc(
                doc=doc,
                semantic_score=round(sem, 4),
                temporal=t_score,
                causal=c_score,
                final_score=final,
            )
            scored.append(sd)

            # Log chi tiết từng doc
            print(
                f"[SCORES] doc[{rank}]: "
                f"semantic={sem:.4f} temporal={t_score:.4f} "
                f"causal={c_score:.4f} final={final:.4f} "
                f"| {text[:60].strip()!r}"
            )

        # ── Sắp xếp lại theo final_score giảm dần ────────────
        scored.sort(key=lambda x: x.final_score, reverse=True)

        # ── Lấy top_k ─────────────────────────────────────────
        top = scored[:top_k]

        print(f"[SELECTED] {len(top)} docs after rerank")

        # ── Score summary: trung bình của top-3 để trả response ─
        summary = self._build_summary(top[:3])

        return [sd.doc for sd in top], summary


    @staticmethod
    def _get_doc_text(doc: Any) -> str:
        """Lấy text từ LangChain Document (ưu tiên answer trong metadata nếu có)."""
        if hasattr(doc, "metadata") and "answer" in doc.metadata:
            return str(doc.metadata["answer"])
        if hasattr(doc, "page_content"):
            return str(doc.page_content)
        return str(doc)

    @staticmethod
    def _build_summary(top_docs: list[ScoredDoc]) -> dict:
        """
        Tổng hợp điểm trung bình của top-3 tài liệu đã re-rank.
        Dùng trong debug response trả về client.
        """
        if not top_docs:
            return {"semantic": 0.0, "temporal": 0.0, "causal": 0.0}

        n = len(top_docs)
        return {
            "semantic": round(sum(d.semantic_score for d in top_docs) / n, 4),
            "temporal": round(sum(d.temporal for d in top_docs) / n, 4),
            "causal":   round(sum(d.causal   for d in top_docs) / n, 4),
        }
