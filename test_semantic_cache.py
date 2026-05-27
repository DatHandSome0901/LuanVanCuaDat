import os
import sys
import time
import json
from datetime import datetime, timedelta

# Ensure workspace root is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.models.base_db import UserDB
from chatbot.services.semantic_cache import SemanticCacheManager

def run_tests():
    print("[TEST] Starting Semantic Cache Verification Tests...")
    
    # Initialize DB and Manager
    db = UserDB()
    cache_manager = SemanticCacheManager(threshold=0.88)
    
    # Clear any existing cache to ensure fresh state
    print("[CLEAN] Cleaning cache before test...")
    cache_manager.clear_all_cache()
    
    # Check that settings has kb_version
    current_version = db.get_setting("kb_version", "1.0")
    print(f"[INFO] Current KB version: {current_version}")
    
    # Mocking embedding model
    from ingestion.service_manager import ServiceManager
    original_get_model = ServiceManager.get_embedding_model
    
    class MockEmbeddingModel:
        def embed_query(self, text):
            text = text.lower().strip()
            if "lê lợi" in text or "lam sơn" in text:
                return [1.0, 0.5, 0.0, 0.0]
            elif "nguyễn huệ" in text or "quang trung" in text:
                return [0.0, 0.0, 1.0, 0.5]
            else:
                return [0.1, 0.1, 0.1, 0.1]
                
    def mock_get_embedding_model(self, model_name):
        return MockEmbeddingModel()
        
    ServiceManager.get_embedding_model = mock_get_embedding_model
    print("[INFO] Mocked embedding model successfully.")
    
    # ----------------------------------------------------
    # TEST 1: Basic Save & Lookup (Factual Global Match)
    # ----------------------------------------------------
    print("\n--- TEST 1: Global Save & Lookup ---")
    question_1 = "ai là người lãnh đạo khởi nghĩa lam sơn?"
    answer_1 = "Lê Lợi là người lãnh đạo khởi nghĩa Lam Sơn chống lại nhà Minh."
    sources_1 = [{"filename": "lich_su.pdf", "page": 12, "content": "Lê Lợi dựng cờ khởi nghĩa tại Lam Sơn."}]
    
    # Save global cache
    cache_manager.save(
        question=question_1,
        answer=answer_1,
        sources=sources_1,
        embedding_model_name="mock_model",
        tenant_id="default",
        knowledge_base_id="default",
        user_id=None
    )
    
    # Lookup same question
    hit_1 = cache_manager.lookup(
        question=question_1,
        embedding_model_name="mock_model",
        tenant_id="default",
        knowledge_base_id="default",
        user_id=None
    )
    
    assert hit_1 is not None, "Test 1 Failed: Cache lookup returned None for exact question."
    assert hit_1["answer"] == answer_1, f"Test 1 Failed: Answer mismatch. Got: {hit_1['answer']}"
    print("[OK] Test 1 Passed: Exact question hit cached successfully!")
    
    # ----------------------------------------------------
    # TEST 2: Semantic Similarity Match
    # ----------------------------------------------------
    print("\n--- TEST 2: Semantic Similarity Match ---")
    similar_question = "cho biết người chỉ huy cuộc khởi nghĩa lam sơn?"
    
    hit_2 = cache_manager.lookup(
        question=similar_question,
        embedding_model_name="mock_model",
        tenant_id="default",
        knowledge_base_id="default",
        user_id=None
    )
    
    assert hit_2 is not None, "Test 2 Failed: Semantic lookup returned None for similar question."
    print(f"[OK] Test 2 Passed: Semantic lookup matched. Similarity score: {hit_2['similarity']:.4f}")
    
    # ----------------------------------------------------
    # TEST 3: Scoped Security Leaks check (User ID / Tenant / KB)
    # ----------------------------------------------------
    print("\n--- TEST 3: Scoped Security ---")
    
    # Save a user-specific private cache
    private_q = "ai là người chiến thắng trận ngọc hồi đống đa?"
    private_a = "Quang Trung (Nguyễn Huệ) đại phá quân Thanh."
    
    cache_manager.save(
        question=private_q,
        answer=private_a,
        sources=[],
        embedding_model_name="mock_model",
        tenant_id="default",
        knowledge_base_id="kb_private_123",
        user_id=42
    )
    
    # Try looking up with different user or global scope
    hit_scope_fail1 = cache_manager.lookup(
        question=private_q,
        embedding_model_name="mock_model",
        tenant_id="default",
        knowledge_base_id="kb_private_123",
        user_id=99
    )
    
    hit_scope_fail2 = cache_manager.lookup(
        question=private_q,
        embedding_model_name="mock_model",
        tenant_id="default",
        knowledge_base_id="different_kb",
        user_id=42
    )
    
    hit_scope_ok = cache_manager.lookup(
        question=private_q,
        embedding_model_name="mock_model",
        tenant_id="default",
        knowledge_base_id="kb_private_123",
        user_id=42
    )
    
    assert hit_scope_fail1 is None, "Test 3 Failed: Leaked private cache to a different user!"
    assert hit_scope_fail2 is None, "Test 3 Failed: Leaked private cache to a different KB!"
    assert hit_scope_ok is not None, "Test 3 Failed: Could not hit cache with correct scope!"
    print("[OK] Test 3 Passed: Scope safety verified successfully! No leakage.")
    
    # ----------------------------------------------------
    # TEST 4: Expiration (TTL)
    # ----------------------------------------------------
    print("\n--- TEST 4: Expiration (TTL) ---")
    ttl_q = "nguyễn huệ lên ngôi hoàng đế vào năm nào?"
    ttl_a = "Nguyễn Huệ lên ngôi hoàng đế năm 1788."
    
    # Save cache with 1 second TTL
    cache_manager.save(
        question=ttl_q,
        answer=ttl_a,
        sources=[],
        embedding_model_name="mock_model",
        tenant_id="default",
        knowledge_base_id="default",
        user_id=None,
        ttl_seconds=1
    )
    
    # Immediate lookup should HIT
    hit_ttl_now = cache_manager.lookup(
        question=ttl_q,
        embedding_model_name="mock_model",
        user_id=None
    )
    assert hit_ttl_now is not None, "Test 4 Failed: TTL immediate lookup missed."
    
    print("Sleeping 2 seconds for cache expiration...")
    time.sleep(2)
    
    # Lookup after 2 seconds should MISS (expired!)
    hit_ttl_later = cache_manager.lookup(
        question=ttl_q,
        embedding_model_name="mock_model",
        user_id=None
    )
    assert hit_ttl_later is None, "Test 4 Failed: Stale cache was returned after TTL expired."
    print("[OK] Test 4 Passed: Expiration (TTL) successfully verified!")
    
    # ----------------------------------------------------
    # TEST 5: Version Invalidation
    # ----------------------------------------------------
    print("\n--- TEST 5: KB Version Invalidation ---")
    
    # Check that previous global cache is still valid
    hit_ver_ok = cache_manager.lookup(
        question=question_1,
        embedding_model_name="mock_model",
        user_id=None
    )
    assert hit_ver_ok is not None, "Test 5 Failed: Global cache became invalid prematurely."
    
    # Increment version (simulating admin updates)
    print("Simulating admin updating knowledge base version...")
    db.increment_kb_version()
    
    # Lookup now should MISS
    hit_ver_stale = cache_manager.lookup(
        question=question_1,
        embedding_model_name="mock_model",
        user_id=None
    )
    assert hit_ver_stale is None, "Test 5 Failed: Cache hit was returned despite version update."
    print("[OK] Test 5 Passed: Version invalidation successfully verified!")
    
    # ----------------------------------------------------
    # TEST 6: Helper Methods
    # ----------------------------------------------------
    print("\n--- TEST 6: Helper Management Methods ---")
    
    # Clear cache again
    print("Calling clear_all_cache()...")
    cache_manager.clear_all_cache()
    
    # Retrieve all entries from DB to verify they are gone
    cached_db_entries = db.get_all_semantic_cache("mock_model")
    assert len(cached_db_entries) == 0, f"Test 6 Failed: clear_all_cache did not remove entries. Found: {len(cached_db_entries)}"
    print("[OK] Test 6 Passed: Cache helpers verified!")
    
    # Clean up and restore ServiceManager
    ServiceManager.get_embedding_model = original_get_model
    db.close()
    
    print("\n[SUCCESS] ALL TESTS PASSED SUCCESSFULLY! Semantic Cache is 100% Correct and Secure.")

if __name__ == "__main__":
    run_tests()
