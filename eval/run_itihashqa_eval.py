import os
import sys
import io
import json
import csv
import time
from pathlib import Path
from dotenv import load_dotenv

# Fix terminal encoding for Vietnamese print output
if hasattr(sys.stdout, 'buffer') and sys.stdout.encoding and sys.stdout.encoding.lower() not in ('utf-8', 'utf8'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'buffer') and sys.stderr.encoding and sys.stderr.encoding.lower() not in ('utf-8', 'utf8'):
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

EVAL_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = EVAL_DIR.parent

# Load environment configuration
load_dotenv(PROJECT_ROOT / ".env")

BENCHMARK_CSV = PROJECT_ROOT / "data" / "eval" / "vn_feudal_100_questions.csv"
OUT_JSONL = PROJECT_ROOT / "results" / "raw_outputs_itihashqa.jsonl"
CONFIG_LOG = PROJECT_ROOT / "results" / "logs" / "eval_config.json"

PATH_VECTOR_STORE = os.environ.get("PATH_VECTOR_STORE", "utils/data_vector_new")
EMBEDDING_MODEL = os.environ.get("EMBEDDING_MODEL_NAME", "openai")
LLM_NAME = os.environ.get("LLM_NAME", "openai")
VERTEX_MODEL = os.environ.get("VERTEX_MODEL_NAME", "gemini-2.5-flash")
OPENAI_MODEL = os.environ.get("OPENAI_LLM_MODEL_NAME", "gpt-4o-mini")
TOP_K_BASELINE = 5

def get_llm():
    llm_name = LLM_NAME.lower()
    if llm_name == "vertex":
        from langchain_google_vertexai import ChatVertexAI
        return ChatVertexAI(
            model_name=VERTEX_MODEL,
            project=os.environ.get("PROJECT_ID"),
            location=os.environ.get("LOCATION", "us-central1"),
            temperature=0.0,
        )
    elif llm_name == "openai":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=OPENAI_MODEL,
            api_key=os.environ.get("KEY_API_OPENAI"),
            temperature=0.0,
        )
    elif llm_name == "gemini":
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(
            model=os.environ.get("GOOGLE_LLM_MODEL_NAME", "gemini-2.5-flash"),
            google_api_key=os.environ.get("KEY_API_GOOGLE"),
            temperature=0.0,
        )
    else:
        raise ValueError(f"Unsupported LLM_NAME: {llm_name}")

def log_config():
    log_dir = PROJECT_ROOT / "results" / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    
    config_data = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "llm_name": LLM_NAME,
        "llm_model": VERTEX_MODEL if LLM_NAME == "vertex" else OPENAI_MODEL,
        "embedding_name": EMBEDDING_MODEL,
        "temperature": 0.0,
        "vector_store_path": PATH_VECTOR_STORE
    }
    
    # Update existing config if it exists
    if CONFIG_LOG.exists():
        try:
            with open(CONFIG_LOG, "r", encoding="utf-8") as f:
                existing = json.load(f)
                existing.update(config_data)
                config_data = existing
        except:
            pass
            
    with open(CONFIG_LOG, "w", encoding="utf-8") as f:
        json.dump(config_data, f, ensure_ascii=False, indent=2)

def main():
    print("=" * 60)
    print("RUNNING ITIHASHQA BASELINE EVALUATION ON 100 QUESTIONS")
    print("=" * 60)
    
    # Save/update configuration log
    log_config()

    # Load benchmark questions
    if not BENCHMARK_CSV.exists():
        print(f"Error: Benchmark CSV not found at {BENCHMARK_CSV}")
        sys.exit(1)

    questions = []
    with open(BENCHMARK_CSV, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            questions.append(row)
            
    print(f"Loaded {len(questions)} questions from benchmark.")

    # Initialize ItihashQA Baseline components
    # Add project root to sys.path
    sys.path.insert(0, str(PROJECT_ROOT))
    
    from langchain_community.vectorstores import FAISS
    from ingestion.service_manager import ServiceManager
    
    llm = get_llm()
    embedding_model = ServiceManager().get_embedding_model(EMBEDDING_MODEL)
    
    vector_path = PROJECT_ROOT / PATH_VECTOR_STORE
    stores = []
    
    candidate_paths = [
        vector_path,
        vector_path / "vertex",
        vector_path / "openai",
        PROJECT_ROOT / "output",
        PROJECT_ROOT / "output" / "vertex",
        PROJECT_ROOT / "output" / "openai",
    ]
    
    for p in candidate_paths:
        faiss_file = p / "index.faiss"
        if p.exists() and faiss_file.exists():
            try:
                result = FAISS.load_local(
                    str(p),
                    embedding_model,
                    allow_dangerous_deserialization=True,
                )
                store = result[0] if isinstance(result, tuple) else result
                stores.append(store)
                print(f"  [BASELINE] Loaded FAISS vector store: {p}")
            except Exception as e:
                print(f"  [BASELINE] Warning: could not load {p}: {e}")
                
    if not stores:
        raise RuntimeError(
            f"[BASELINE] No FAISS vector store found!\n"
            f"Checked paths: {[str(p) for p in candidate_paths]}\n"
            "Please check PATH_VECTOR_STORE in .env"
        )
        
    print(f"  [BASELINE] Total stores loaded: {len(stores)}")

    BASELINE_PROMPT = (
        "Ban la tro ly lich su Viet Nam. Hay tra loi cau hoi dua tren thong tin duoc cung cap.\n\n"
        "Ngu canh:\n{context}\n\n"
        "Cau hoi: {question}\n\n"
        "Hay tra loi ngan gon, chinh xac dua tren ngu canh tren. "
        "Neu khong co du thong tin, hay noi khong du du lieu."
    )

    # Create raw folder
    raw_dir = PROJECT_ROOT / "results" / "raw"
    raw_dir.mkdir(parents=True, exist_ok=True)
    
    # Check existing outputs for resume
    existing_ids = set()
    if OUT_JSONL.exists():
        with open(OUT_JSONL, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    try:
                        record = json.loads(line)
                        existing_ids.add(record.get("id"))
                    except:
                        pass
        print(f"Found {len(existing_ids)} existing results. Resuming...")

    for i, row in enumerate(questions, 1):
        qid = row["id"]
        q_text = row["question"]
        difficulty = row["difficulty"]
        dynasty = row["dynasty"]
        ground_truth = row["ground_truth"]
        expected_claims = row["expected_claims"]
        source_url = row["source_url"]
        evidence_text = row["evidence_text"]

        if qid in existing_ids:
            print(f"[{i}/{len(questions)}] Skipping {qid} (already done)")
            continue

        print(f"[{i}/{len(questions)}] Running baseline {qid}: {q_text[:50].encode('ascii', errors='replace').decode('ascii')}...")

        start_time = time.perf_counter()
        
        try:
            # Perform similarity search
            raw_results = []
            for store in stores:
                try:
                    res = store.similarity_search(q_text, k=TOP_K_BASELINE)
                    raw_results.extend(res)
                except:
                    pass
            
            contexts = []
            for doc in raw_results:
                txt = doc.page_content.strip() if doc.page_content else ""
                if txt:
                    contexts.append(txt)
            
            # Limit contexts to top-k
            contexts = contexts[:TOP_K_BASELINE]
            
            if not contexts:
                contexts = ["[NO CONTEXT RETRIEVED]"]
                
            context_text = "\n\n".join(contexts)
            prompt = BASELINE_PROMPT.format(context=context_text, question=q_text)
            
            # Invoke LLM
            response = llm.invoke(prompt)
            answer = response.content if hasattr(response, "content") else str(response)
            answer = answer.strip()
            
            latency = time.perf_counter() - start_time
            
            if not answer:
                answer = "[EMPTY ANSWER]"
            
            record = {
                "id": qid,
                "question": q_text,
                "answer": answer,
                "retrieved_contexts": contexts,
                "ground_truth": ground_truth,
                "expected_claims": expected_claims,
                "source_url": source_url,
                "evidence_text": evidence_text,
                "difficulty": difficulty,
                "dynasty": dynasty,
                "latency": latency,
                "system_name": "itihashqa_baseline"
            }
            
            # Write to raw_outputs_itihashqa.jsonl
            with open(OUT_JSONL, "a", encoding="utf-8") as f:
                f.write(json.dumps(record, ensure_ascii=False) + "\n")
                
            print(f"  -> Done! Latency: {latency:.2f}s, Contexts: {len(contexts)}")
            
        except Exception as e:
            print(f"  -> ERROR on {qid}: {e}")
            latency = time.perf_counter() - start_time
            record = {
                "id": qid,
                "question": q_text,
                "answer": f"[ERROR: {str(e)[:200]}]",
                "retrieved_contexts": [],
                "ground_truth": ground_truth,
                "expected_claims": expected_claims,
                "source_url": source_url,
                "evidence_text": evidence_text,
                "difficulty": difficulty,
                "dynasty": dynasty,
                "latency": latency,
                "system_name": "itihashqa_baseline"
            }
            with open(OUT_JSONL, "a", encoding="utf-8") as f:
                f.write(json.dumps(record, ensure_ascii=False) + "\n")
                
        # Sleep to avoid rate limits
        time.sleep(1)

    print("\nItihashQA Baseline Evaluation Finished successfully!")
    print("=" * 60)

if __name__ == "__main__":
    main()
