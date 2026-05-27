import sys
import io
import os
import json
import argparse
import csv
import time
from pathlib import Path

# Fix Windows PowerShell encoding for Vietnamese text
if hasattr(sys.stdout, 'buffer') and sys.stdout.encoding and sys.stdout.encoding.lower() not in ('utf-8', 'utf8'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'buffer') and sys.stderr.encoding and sys.stderr.encoding.lower() not in ('utf-8', 'utf8'):
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# ─── Add project root to sys.path ─────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

# ─── Load .env ────────────────────────────────────────────────────────────────
from dotenv import load_dotenv
load_dotenv(PROJECT_ROOT / ".env")

# ─── Constants ────────────────────────────────────────────────────────────────
EVAL_DIR       = Path(__file__).resolve().parent
BENCHMARK_CSV  = EVAL_DIR / "benchmark_questions.csv"
TALRAG_JSONL   = EVAL_DIR / "eval_results_talrag.jsonl"
BASELINE_JSONL = EVAL_DIR / "eval_results_baseline.jsonl"
ALL_JSONL      = EVAL_DIR / "eval_results_all.jsonl"

PATH_VECTOR_STORE = os.environ.get("PATH_VECTOR_STORE", "utils/data_vector_new")
EMBEDDING_MODEL   = os.environ.get("EMBEDDING_MODEL_NAME", "openai")
TOP_K_BASELINE    = 5
SLEEP_BETWEEN     = 2


# =============================================================================
# HELPERS
# =============================================================================

def load_benchmark(csv_path: Path) -> list:
    rows = []
    with open(csv_path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append({
                "difficulty":   row["difficulty"].strip(),
                "question":     row["question"].strip(),
                "ground_truth": row["ground_truth"].strip(),
            })
    print(f"[BENCHMARK] Loaded {len(rows)} questions from {csv_path}")
    return rows


def write_jsonl(record: dict, out_path: Path):
    with open(out_path, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


def safe_preview(text: str, n: int = 60) -> str:
    """Return ASCII-safe preview of Vietnamese text for console logging."""
    return text[:n].encode('ascii', errors='replace').decode('ascii')


def get_llm():
    """Return LLM instance based on LLM_NAME env var."""
    llm_name = os.environ.get("LLM_NAME", "openai").lower()

    if llm_name == "vertex":
        from langchain_google_vertexai import ChatVertexAI
        return ChatVertexAI(
            model_name=os.environ.get("VERTEX_MODEL_NAME", "gemini-2.5-flash"),
            project=os.environ.get("PROJECT_ID"),
            location=os.environ.get("LOCATION", "us-central1"),
            temperature=0.0,
        )
    elif llm_name == "openai":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=os.environ.get("OPENAI_LLM_MODEL_NAME", "gpt-4o-mini"),
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


# =============================================================================
# RUN TALRAG SYSTEM
# =============================================================================

def run_talrag(questions: list, out_path: Path):
    """
    Run each question through the full TALRAG pipeline (FilesChatAgent).

    Contexts are taken AFTER the DocumentGrader node (filtered documents).
    answer   = result["generation"]
    contexts = [doc.page_content for doc in result["documents"]]
    """
    print("\n" + "=" * 60)
    print("RUNNING TALRAG SYSTEM")
    print("=" * 60)

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

    existing_questions = set()
    if out_path.exists():
        with open(out_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    try:
                        data = json.loads(line)
                        existing_questions.add(data.get("question", ""))
                    except:
                        pass
        print(f"[TALRAG] Found {len(existing_questions)} existing results. Resuming...")

    for i, row in enumerate(questions, 1):
        question     = row["question"]
        ground_truth = row["ground_truth"]
        difficulty   = row["difficulty"]

        if question in existing_questions:
            print(f"\n[TALRAG {i}/{len(questions)}] ({difficulty}) SKIPPING - Already evaluated: {safe_preview(question)}...")
            continue

        print(f"\n[TALRAG {i}/{len(questions)}] ({difficulty}) {safe_preview(question)}...")

        try:
            result = app.invoke({
                "question":     question,
                "documents":    [],
                "generation":   "",
                "chat_history": [],
                "intent":       "factual",
                "scores":       {},
            })

            answer   = result.get("generation", "").strip()
            raw_docs = result.get("documents", [])

            contexts = []
            for doc in raw_docs:
                if hasattr(doc, "metadata"):
                    if doc.metadata.get("is_web") or doc.metadata.get("is_pending"):
                        src = doc.metadata.get("source", "")
                        if src:
                            contexts.append(f"[Web source]: {src}")
                    else:
                        ctx = doc.page_content.strip() if doc.page_content else ""
                        if ctx:
                            contexts.append(ctx)
                else:
                    ctx = str(doc).strip()
                    if ctx:
                        contexts.append(ctx)

            if not answer:
                print(f"  [WARN] Empty answer for question {i}")
                answer = "[EMPTY ANSWER]"

            if not contexts:
                print(f"  [WARN] No contexts retrieved for question {i}")
                contexts = ["[NO CONTEXT RETRIEVED]"]

            record = {
                "difficulty":   difficulty,
                "system":       "talrag",
                "question":     question,
                "answer":       answer,
                "contexts":     contexts,
                "ground_truth": ground_truth,
            }
            write_jsonl(record, out_path)
            print(f"  [OK] contexts={len(contexts)}, answer={safe_preview(answer, 80)!r}...")

        except Exception as e:
            print(f"  [ERROR] {str(e)[:200]}")
            record = {
                "difficulty":   difficulty,
                "system":       "talrag",
                "question":     question,
                "answer":       f"[ERROR: {str(e)[:200]}]",
                "contexts":     ["[ERROR DURING RETRIEVAL]"],
                "ground_truth": ground_truth,
            }
            write_jsonl(record, out_path)

        if i < len(questions):
            time.sleep(SLEEP_BETWEEN)

    print(f"\n[TALRAG] Done! Results saved to {out_path.name}")


# =============================================================================
# RUN ITIHASHQA BASELINE (Static RAG)
# =============================================================================

def run_baseline(questions: list, out_path: Path):
    """
    ItihashQA-style baseline: FAISS top-k + LLM only.

    NO intent classification, temporal/causal scoring, adaptive reranking,
    DocumentGrader, Web Learning Agent, Pending Knowledge, Auto Learning.
    """
    print("\n" + "=" * 60)
    print("RUNNING ITIHASHQA BASELINE (Static RAG)")
    print("=" * 60)

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
                print(f"  [BASELINE] Loaded FAISS: {p}")
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

    existing_questions = set()
    if out_path.exists():
        with open(out_path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    try:
                        data = json.loads(line)
                        existing_questions.add(data.get("question", ""))
                    except:
                        pass
        print(f"[BASELINE] Found {len(existing_questions)} existing results. Resuming...")

    for i, row in enumerate(questions, 1):
        question     = row["question"]
        ground_truth = row["ground_truth"]
        difficulty   = row["difficulty"]

        if question in existing_questions:
            print(f"\n[BASELINE {i}/{len(questions)}] ({difficulty}) SKIPPING - Already evaluated: {safe_preview(question)}...")
            continue

        print(f"\n[BASELINE {i}/{len(questions)}] ({difficulty}) {safe_preview(question)}...")

        try:
            raw_results = []
            for store in stores:
                try:
                    res = store.similarity_search(question, k=TOP_K_BASELINE)
                    raw_results.extend(res)
                except:
                    pass
            
            contexts = []
            for doc in raw_results:
                txt = doc.page_content.strip()
                if txt:
                    contexts.append(txt)
            
            contexts = contexts[:TOP_K_BASELINE]

            if not contexts:
                print(f"  [WARN] No contexts for question {i}")
                contexts = ["[NO CONTEXT RETRIEVED]"]

            context_text = "\n\n".join(contexts)
            prompt = BASELINE_PROMPT.format(context=context_text, question=question)

            response = llm.invoke(prompt)
            answer = response.content if hasattr(response, "content") else str(response)
            answer = answer.strip()

            if not answer:
                answer = "[EMPTY ANSWER]"

            record = {
                "difficulty":   difficulty,
                "system":       "itihashqa_baseline",
                "question":     question,
                "answer":       answer,
                "contexts":     contexts,
                "ground_truth": ground_truth,
            }
            write_jsonl(record, out_path)
            print(f"  [OK] contexts={len(contexts)}, answer={safe_preview(answer, 80)!r}...")

        except Exception as e:
            print(f"  [ERROR] {str(e)[:200]}")
            record = {
                "difficulty":   difficulty,
                "system":       "itihashqa_baseline",
                "question":     question,
                "answer":       f"[ERROR: {str(e)[:200]}]",
                "contexts":     ["[ERROR DURING RETRIEVAL]"],
                "ground_truth": ground_truth,
            }
            write_jsonl(record, out_path)

        if i < len(questions):
            time.sleep(SLEEP_BETWEEN)

    print(f"\n[BASELINE] Done! Results saved to {out_path.name}")


# =============================================================================
# MERGE RESULTS
# =============================================================================

def merge_results():
    print("\n" + "=" * 60)
    print("MERGING RESULTS -> eval_results_all.jsonl")
    print("=" * 60)

    files_to_merge = [TALRAG_JSONL, BASELINE_JSONL]
    count = 0

    if ALL_JSONL.exists():
        ALL_JSONL.unlink()

    for src in files_to_merge:
        if not src.exists():
            print(f"  [WARN] {src.name} not found, skipping.")
            continue
        with open(src, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    with open(ALL_JSONL, "a", encoding="utf-8") as out:
                        out.write(line + "\n")
                    count += 1
        print(f"  [MERGE] Added records from {src.name}")

    print(f"\n[MERGE] Total records in {ALL_JSONL.name}: {count}")


# =============================================================================
# MAIN
# =============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Run RAGAS benchmark for TALRAG and ItihashQA Baseline"
    )
    parser.add_argument(
        "--system",
        choices=["talrag", "baseline"],
        help="Which system to run: 'talrag' or 'baseline'"
    )
    parser.add_argument(
        "--merge",
        action="store_true",
        help="Merge talrag + baseline JSONL files into eval_results_all.jsonl"
    )
    args = parser.parse_args()

    if args.merge:
        merge_results()
        return

    if not args.system:
        parser.print_help()
        sys.exit(1)

    if not BENCHMARK_CSV.exists():
        print(f"[ERROR] Benchmark file not found: {BENCHMARK_CSV}")
        sys.exit(1)

    questions = load_benchmark(BENCHMARK_CSV)

    if args.system == "talrag":
        run_talrag(questions, TALRAG_JSONL)
    elif args.system == "baseline":
        run_baseline(questions, BASELINE_JSONL)


if __name__ == "__main__":
    main()
