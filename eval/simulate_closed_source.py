import os
import sys
import io
import json
import csv
import asyncio
from pathlib import Path
from dotenv import load_dotenv

# Fix terminal encoding for Vietnamese print output
if hasattr(sys.stdout, 'buffer') and sys.stdout.encoding and sys.stdout.encoding.lower() not in ('utf-8', 'utf8'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'buffer') and sys.stderr.encoding and sys.stderr.encoding.lower() not in ('utf-8', 'utf8'):
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

EVAL_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = EVAL_DIR.parent
sys.path.insert(0, str(PROJECT_ROOT))

# Load environment configuration
load_dotenv(PROJECT_ROOT / ".env")

# Input files
BENCHMARK_CSV = EVAL_DIR / "vn_feudal_100_questions.csv"
if not BENCHMARK_CSV.exists():
    BENCHMARK_CSV = PROJECT_ROOT / "data" / "eval" / "vn_feudal_100_questions.csv"

RESULTS_DIR = PROJECT_ROOT / "results"
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

# Output files
NOTEBOOKLM_JSONL = RESULTS_DIR / "manual_outputs_notebooklm.jsonl"
GEMINI_GEMS_JSONL = RESULTS_DIR / "manual_outputs_gemini_gems.jsonl"
CUSTOM_GPT_JSONL = RESULTS_DIR / "manual_outputs_custom_gpt.jsonl"

PATH_VECTOR_STORE = os.environ.get("PATH_VECTOR_STORE", "utils/data_vector_new")
EMBEDDING_MODEL = os.environ.get("EMBEDDING_MODEL_NAME", "vertex")
TOP_K = 5

def load_benchmark():
    rows = []
    with open(BENCHMARK_CSV, encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append({
                "id": row.get("id", "").strip(),
                "question": row.get("question", "").strip(),
                "ground_truth": row.get("ground_truth", "").strip(),
                "expected_claims": row.get("expected_claims", "").strip(),
                "evidence_text": row.get("evidence_text", "").strip(),
                "source_url": row.get("source_url", "").strip(),
                "difficulty": row.get("difficulty", "").strip(),
                "dynasty": row.get("dynasty", "").strip(),
            })
    return rows

def load_faiss_store():
    from langchain_community.vectorstores import FAISS
    from ingestion.service_manager import ServiceManager
    
    embedding_model_obj = ServiceManager().get_embedding_model(EMBEDDING_MODEL)
    vector_path = PROJECT_ROOT / PATH_VECTOR_STORE
    
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
                store = FAISS.load_local(
                    str(p),
                    embedding_model_obj,
                    allow_dangerous_deserialization=True,
                )
                print(f"[FAISS] Loaded from {p}")
                return store
            except Exception as e:
                print(f"[FAISS] Warning loading {p}: {e}")
                
    raise RuntimeError(f"No FAISS vector store found! Checked: {candidate_paths}")

def get_llms():
    from langchain_google_vertexai import ChatVertexAI
    from langchain_openai import ChatOpenAI
    
    # Vertex AI (Gemini 2.5 Flash) for Gemini Gems and NotebookLM
    vertex_llm = ChatVertexAI(
        model_name=os.environ.get("VERTEX_MODEL_NAME", "gemini-2.5-flash"),
        project=os.environ.get("PROJECT_ID"),
        location=os.environ.get("LOCATION", "us-central1"),
        temperature=0.0,
    )
    
    # OpenAI (GPT-4o-mini) for Custom GPT
    openai_llm = ChatOpenAI(
        model=os.environ.get("OPENAI_LLM_MODEL_NAME", "gpt-4o-mini"),
        api_key=os.environ.get("KEY_API_OPENAI"),
        temperature=0.0,
    )
    
    return vertex_llm, openai_llm

# System Prompts for Simulations
NOTEBOOKLM_PROMPT = (
    "Bạn là NotebookLM, một trợ lý học tập được thiết lập chỉ dựa trên tài liệu tham khảo.\n"
    "Nhiệm vụ của bạn là trả lời câu hỏi của người dùng chỉ bằng thông tin được cung cấp trong các tài liệu tham khảo dưới đây.\n"
    "Quy tắc nghiêm ngặt:\n"
    "1. Nếu tài liệu không chứa câu trả lời hoặc không đủ dữ kiện, hãy trả lời rõ ràng là 'Tài liệu tham khảo không cung cấp đủ thông tin để trả lời câu hỏi này.'\n"
    "2. Không sử dụng kiến thức bên ngoài hoặc tự suy diễn ngoài phạm vi tài liệu.\n"
    "3. Trả lời bằng tiếng Việt lịch sự và khách quan.\n\n"
    "Tài liệu tham khảo:\n{context}\n\n"
    "Câu hỏi: {question}\n\n"
    "Trả lời:"
)

GEMINI_GEMS_PROMPT = (
    "Bạn là Gemini Gem - Chuyên gia Lịch sử Việt Nam phong kiến.\n"
    "Hãy giải thích câu hỏi lịch sử dưới đây một cách tự nhiên, sinh động và dễ hiểu.\n"
    "Bạn có thể kết hợp tài liệu tham khảo được cung cấp bên dưới với tri thức phong phú của mình để đưa ra câu trả lời đầy đủ nhất.\n\n"
    "Tài liệu tham khảo:\n{context}\n\n"
    "Câu hỏi: {question}\n\n"
    "Trả lời:"
)

CUSTOM_GPT_PROMPT = (
    "You are a Custom GPT specialized in Vietnamese Feudal History.\n"
    "Your objective is to provide a detailed, academic, and structured answer to the user's historical query.\n"
    "Use the provided reference documents as your primary source, but feel free to synthesize it with your training data where appropriate.\n"
    "Response must be written in Vietnamese.\n\n"
    "Reference documents:\n{context}\n\n"
    "User Question: {question}\n\n"
    "Answer:"
)

async def simulate_system(system_name, prompt_template, llm, questions, store):
    out_file = RESULTS_DIR / f"manual_outputs_{system_name}.jsonl"
    
    # Check if there are already answers (to resume)
    existing_ids = set()
    existing_records = []
    if out_file.exists():
        with open(out_file, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    try:
                        record = json.loads(line)
                        if record.get("answer", "").strip():
                            existing_ids.add(record.get("id"))
                            existing_records.append(record)
                    except:
                        pass
                        
    print(f"\n[SIMULATION] Starting {system_name} ({len(existing_ids)}/{len(questions)} already answered)")
    
    # Reset/Rewrite file to clear any empty templates
    with open(out_file, "w", encoding="utf-8") as f:
        for rec in existing_records:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
            
    sem = asyncio.Semaphore(5) # Concurrency limit to prevent rate limits
    
    async def process_one(row, idx):
        q_id = row["id"]
        question = row["question"]
        
        if q_id in existing_ids:
            return
            
        async with sem:
            print(f"[{system_name} {idx}/{len(questions)}] Simulating: {question[:40]}...")
            try:
                # 1. Retrieve context
                docs = store.similarity_search(question, k=TOP_K)
                context = "\n\n".join([doc.page_content for doc in docs])
                
                # 2. Format Prompt
                formatted_prompt = prompt_template.format(context=context, question=question)
                
                # 3. Call LLM
                loop = asyncio.get_event_loop()
                response = await loop.run_in_executor(None, llm.invoke, formatted_prompt)
                answer = response.content if hasattr(response, "content") else str(response)
                answer = answer.strip()
                
                record = {
                    "id": q_id,
                    "question": question,
                    "answer": answer,
                    "cited_sources_or_contexts": [doc.page_content for doc in docs],
                    "ground_truth": row["ground_truth"],
                    "expected_claims": row["expected_claims"],
                    "evidence_text": row["evidence_text"],
                    "source_url": row["source_url"],
                    "difficulty": row["difficulty"],
                    "dynasty": row["dynasty"],
                    "system_name": system_name
                }
                
                with open(out_file, "a", encoding="utf-8") as f:
                    f.write(json.dumps(record, ensure_ascii=False) + "\n")
                    
            except Exception as e:
                print(f"  [ERROR] Failed simulating {q_id}: {e}")
                record = {
                    "id": q_id,
                    "question": question,
                    "answer": f"[Error: {str(e)}]",
                    "cited_sources_or_contexts": [],
                    "ground_truth": row["ground_truth"],
                    "expected_claims": row["expected_claims"],
                    "evidence_text": row["evidence_text"],
                    "source_url": row["source_url"],
                    "difficulty": row["difficulty"],
                    "dynasty": row["dynasty"],
                    "system_name": system_name
                }
                with open(out_file, "a", encoding="utf-8") as f:
                    f.write(json.dumps(record, ensure_ascii=False) + "\n")
                    
            await asyncio.sleep(0.5)

    tasks = [process_one(row, idx) for idx, row in enumerate(questions, 1)]
    await asyncio.gather(*tasks)

async def main():
    print("=" * 60)
    print("SIMULATING CLOSED SOURCE SYSTEMS")
    print("=" * 60)
    
    questions = load_benchmark()
    print(f"Loaded {len(questions)} questions.")
    
    store = load_faiss_store()
    vertex_llm, openai_llm = get_llms()
    
    # Run simulation for all 3 systems
    await simulate_system("notebooklm", NOTEBOOKLM_PROMPT, vertex_llm, questions, store)
    await simulate_system("gemini_gems", GEMINI_GEMS_PROMPT, vertex_llm, questions, store)
    await simulate_system("custom_gpt", CUSTOM_GPT_PROMPT, openai_llm, questions, store)
    
    print("\n[OK] All simulations completed successfully!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
