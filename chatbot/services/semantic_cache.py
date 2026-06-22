import os
import json
from datetime import datetime
from ingestion.service_manager import ServiceManager
from app.models.base_db import UserDB
from chatbot.utils.question_normalizer import normalize_question

class SemanticCacheManager:
    def __init__(self, threshold: float = None):
        self.threshold = threshold or float(os.environ.get("SEMANTIC_CACHE_THRESHOLD", "0.88"))

    def dot_product(self, v1, v2):
        return sum(x * y for x, y in zip(v1, v2))

    def magnitude(self, v):
        return sum(x * x for x in v) ** 0.5

    def cosine_similarity(self, v1, v2):
        mag1 = self.magnitude(v1)
        mag2 = self.magnitude(v2)
        if mag1 == 0 or mag2 == 0:
            return 0.0
        return self.dot_product(v1, v2) / (mag1 * mag2)

    def _safe_str(self, text: str) -> str:
        """Encodes string to ascii with replacement to prevent console crashes in Windows standard shell."""
        try:
            return text.encode('ascii', 'replace').decode('ascii')
        except Exception:
            return "unknown_string"

    def lookup(
        self,
        question: str,
        embedding_model_name: str,
        tenant_id: str = "default",
        knowledge_base_id: str = "default",
        user_id: int = None,
        strict_user_id: bool = False
    ) -> dict | None:
        """
        Looks up a question in the scoped semantic cache.
        Returns the cached answer and sources if it satisfies all security & invalidation conditions.
        """
        try:
            db = UserDB()
            current_kb_version = db.get_setting("kb_version", "1.0")
            cached_entries = db.get_all_semantic_cache(
                embedding_model=embedding_model_name,
                tenant_id=tenant_id,
                knowledge_base_id=knowledge_base_id,
                user_id=user_id,
                strict_user_id=strict_user_id
            )
            db.close()
        except Exception as e:
            print(f"[WARN] Error reading semantic cache from DB: {e}")
            return None

        if not cached_entries:
            return None

        now = datetime.utcnow()
        valid_entries = []
        for entry in cached_entries:
            # 1. Expiration check
            expires_at_str = entry.get("expires_at")
            if expires_at_str:
                try:
                    expires_at = datetime.fromisoformat(expires_at_str.replace("Z", "+00:00")).replace(tzinfo=None)
                    if expires_at < now:
                        q_safe = self._safe_str(entry.get('question', ''))
                        print(f"[EXPIRED] Cache expired for: '{q_safe}' (expired at {expires_at_str})")
                        continue
                except Exception as exp:
                    print(f"[WARN] Error checking expiration: {exp}")
            
            # 2. KB version check
            if entry.get("kb_version") != current_kb_version:
                q_safe = self._safe_str(entry.get('question', ''))
                print(f"[STALE] Stale cache version detected for: '{q_safe}' ({entry['kb_version']} vs current {current_kb_version}). Invalidating.")
                continue

            valid_entries.append(entry)

        if not valid_entries:
            return None

        norm_q = normalize_question(question).lower().strip()

        try:
            embedding_model = ServiceManager().get_embedding_model(embedding_model_name)
            query_vector = embedding_model.embed_query(norm_q)
        except Exception as e:
            print(f"[WARN] Error embedding query for cache lookup: {e}")
            return None

        best_match = None
        best_score = -1.0

        for entry in valid_entries:
            try:
                cached_vector = json.loads(entry["embedding"])
                score = self.cosine_similarity(query_vector, cached_vector)
                if score > best_score:
                    best_score = score
                    best_match = entry
            except Exception as e:
                print(f"[WARN] Similarity calculation error: {e}")
                continue

        print(f"[INFO] [Semantic Cache] Best score: {best_score:.4f} (Threshold: {self.threshold})")
        if best_match and best_score >= self.threshold:
            q_safe = self._safe_str(best_match['question'])
            print(f"[HIT] [Semantic Cache HIT] Match: '{q_safe}' (Score: {best_score:.4f})")
            return {
                "answer": best_match["answer"],
                "sources": json.loads(best_match["sources"]),
                "similarity": best_score,
                "cached_question": best_match["question"]
            }

        return None

    def save(
        self,
        question: str,
        answer: str,
        sources: list,
        embedding_model_name: str,
        tenant_id: str = "default",
        knowledge_base_id: str = "default",
        user_id: int = None,
        ttl_seconds: int = None
    ):
        """
        Saves a query, its embedding, and the response with metadata and scoping parameters.
        """
        norm_q = normalize_question(question).lower().strip()
        try:
            embedding_model = ServiceManager().get_embedding_model(embedding_model_name)
            vector = embedding_model.embed_query(norm_q)
            vector_json = json.dumps(vector)
            sources_json = json.dumps(sources)

            expires_at = None
            if ttl_seconds:
                from datetime import timedelta
                expires_at = (datetime.utcnow() + timedelta(seconds=ttl_seconds)).isoformat() + "Z"

            db = UserDB()
            kb_version = db.get_setting("kb_version", "1.0")
            db.add_semantic_cache(
                question=norm_q,
                answer=answer,
                sources_json=sources_json,
                embedding_json=vector_json,
                embedding_model=embedding_model_name,
                tenant_id=tenant_id,
                user_id=user_id,
                knowledge_base_id=knowledge_base_id,
                kb_version=kb_version,
                expires_at=expires_at
            )
            db.close()
            q_safe = self._safe_str(norm_q)
            print(f"[SAVE] [Semantic Cache SAVED] Question: '{q_safe}' successfully cached (tenant={tenant_id}, kb={knowledge_base_id}, user={user_id}, ttl={ttl_seconds}s).")
        except Exception as e:
            print(f"[WARN] Error saving to semantic cache: {e}")

    # Management Helpers
    def delete_cache_by_kb(self, knowledge_base_id: str):
        try:
            db = UserDB()
            db.delete_cache_by_kb(knowledge_base_id)
            db.close()
            print(f"[DELETE] [Semantic Cache] Cache cleared for KB: {knowledge_base_id}")
        except Exception as e:
            print(f"[WARN] Error deleting cache by KB: {e}")

    def delete_cache_by_user(self, user_id: int):
        try:
            db = UserDB()
            db.delete_cache_by_user(user_id)
            db.close()
            print(f"[DELETE] [Semantic Cache] Cache cleared for User: {user_id}")
        except Exception as e:
            print(f"[WARN] Error deleting cache by User: {e}")

    def delete_expired_cache(self):
        try:
            db = UserDB()
            db.delete_expired_cache()
            db.close()
            print(f"[CLEAN] [Semantic Cache] Cleaned all expired cache entries.")
        except Exception as e:
            print(f"[WARN] Error deleting expired cache: {e}")

    def clear_all_cache(self):
        try:
            db = UserDB()
            db.clear_all_cache()
            db.close()
            print(f"[CLEAN] [Semantic Cache] Cleared entire semantic cache table.")
        except Exception as e:
            print(f"[WARN] Error clearing entire semantic cache: {e}")
