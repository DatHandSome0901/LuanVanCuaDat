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

# Optimize web search performance during evaluation to avoid rate limits and slow crawls
os.environ["WEB_MAX_RESULTS"] = "1"
os.environ["WEB_FETCH_TIMEOUT_SECONDS"] = "1"
os.environ["WEB_MAX_WORKERS"] = "8"

BENCHMARK_CSV = PROJECT_ROOT / "data" / "eval" / "vn_feudal_100_questions.csv"
OUT_JSONL = PROJECT_ROOT / "results" / "raw_outputs_talrag.jsonl"
CONFIG_LOG = PROJECT_ROOT / "results" / "logs" / "eval_config.json"

PATH_VECTOR_STORE = os.environ.get("PATH_VECTOR_STORE", "utils/data_vector_new")
EMBEDDING_MODEL = os.environ.get("EMBEDDING_MODEL_NAME", "openai")
LLM_NAME = os.environ.get("LLM_NAME", "openai")
VERTEX_MODEL = os.environ.get("VERTEX_MODEL_NAME", "gemini-2.5-flash")
OPENAI_MODEL = os.environ.get("OPENAI_LLM_MODEL_NAME", "gpt-4o-mini")

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
    print("RUNNING TALRAG EVALUATION ON 100 QUESTIONS")
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

    # Initialize TALRAG FilesChatAgent
    # Add project root to sys.path
    sys.path.insert(0, str(PROJECT_ROOT))
    
    llm = get_llm()
    from chatbot.services.files_rag_chat_agent import FilesChatAgent
    agent = FilesChatAgent(
        llm_model=llm,
        path_vector_store=str(PROJECT_ROOT / PATH_VECTOR_STORE),
        embedding_model_name=EMBEDDING_MODEL,
        allowed_files=["*"],
    )

    workflow = agent.get_workflow()
    app = workflow.compile()

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

        print(f"[{i}/{len(questions)}] Running {qid}: {q_text[:50].encode('ascii', errors='replace').decode('ascii')}...")

        start_time = time.perf_counter()
        
        try:
            # Invoke TALRAG workflow
            result = app.invoke({
                "question": q_text,
                "documents": [],
                "generation": "",
                "chat_history": [],
                "intent": "factual",
                "scores": {},
            })
            
            latency = time.perf_counter() - start_time
            answer = result.get("generation", "").strip()
            
            # Extract retrieved contexts
            raw_docs = result.get("documents", [])
            retrieved_contexts = []
            for doc in raw_docs:
                if hasattr(doc, "page_content"):
                    retrieved_contexts.append(doc.page_content.strip())
                else:
                    retrieved_contexts.append(str(doc).strip())
            
            record = {
                "id": qid,
                "question": q_text,
                "answer": answer,
                "retrieved_contexts": retrieved_contexts,
                "ground_truth": ground_truth,
                "expected_claims": expected_claims,
                "source_url": source_url,
                "evidence_text": evidence_text,
                "difficulty": difficulty,
                "dynasty": dynasty,
                "latency": latency,
                "system_name": "talrag"
            }
            
            # Write to raw_outputs_talrag.jsonl
            with open(OUT_JSONL, "a", encoding="utf-8") as f:
                f.write(json.dumps(record, ensure_ascii=False) + "\n")
                
            print(f"  -> Done! Latency: {latency:.2f}s, Contexts: {len(retrieved_contexts)}")
            
        except Exception as e:
            print(f"  -> ERROR on {qid}: {e}")
            # Save error record so pipeline doesn't hang
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
                "system_name": "talrag"
            }
            with open(OUT_JSONL, "a", encoding="utf-8") as f:
                f.write(json.dumps(record, ensure_ascii=False) + "\n")
                
        # Sleep to avoid rate limits
        time.sleep(1)

    print("\nTALRAG Evaluation Finished successfully!")
    print("=" * 60)

if __name__ == "__main__":
    main()
