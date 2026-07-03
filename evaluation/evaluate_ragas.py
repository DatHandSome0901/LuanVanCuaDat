"""
evaluate_ragas.py
=================
Đọc eval_results_all.jsonl và chạy RAGAS evaluation với 4 metric:
  - faithfulness
  - answer_relevancy
  - context_precision
  - context_recall

Xuất ra:
  - ragas_detailed_results.csv   (mỗi dòng là 1 câu hỏi + 4 score)
  - ragas_summary_results.csv    (group theo difficulty × system, lấy mean)

Cài đặt:
  pip install ragas datasets pandas openai langchain-openai langchain-google-vertexai
"""

import os
import sys
import io
import json
import argparse
from pathlib import Path

# Fix Windows PowerShell encoding for Vietnamese text and emojis
if hasattr(sys.stdout, 'buffer') and sys.stdout.encoding and sys.stdout.encoding.lower() not in ('utf-8', 'utf8'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'buffer') and sys.stderr.encoding and sys.stderr.encoding.lower() not in ('utf-8', 'utf8'):
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# ─── Thêm thư mục gốc vào sys.path ───────────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from dotenv import load_dotenv
load_dotenv(PROJECT_ROOT / ".env")

import pandas as pd

# ─── Hằng số ──────────────────────────────────────────────────────────────────
EVAL_DIR      = Path(__file__).resolve().parent
ALL_JSONL     = EVAL_DIR / "eval_results_all.jsonl"
DETAILED_CSV  = EVAL_DIR / "ragas_detailed_results.csv"
SUMMARY_CSV   = EVAL_DIR / "ragas_summary_results.csv"

RAGAS_METRICS_NAMES = [
    "faithfulness",
    "answer_relevancy",
    "context_precision",
    "context_recall",
]


# ═══════════════════════════════════════════════════════════════════════════════
# HELPER: Load JSONL
# ═══════════════════════════════════════════════════════════════════════════════
def load_jsonl(path: Path) -> list[dict]:
    records = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    records.append(json.loads(line))
                except json.JSONDecodeError as e:
                    print(f"  ⚠️  Skip malformed JSON line: {e}")
    print(f"[LOAD] {len(records)} records from {path.name}")
    return records


# ═══════════════════════════════════════════════════════════════════════════════
# HELPER: Khởi tạo RAGAS LLM & Embeddings
# ═══════════════════════════════════════════════════════════════════════════════
def get_ragas_llm_and_embeddings():
    """
    Trả về (llm, embeddings) cho RAGAS evaluator.
    Ưu tiên dùng OpenAI vì RAGAS tương thích tốt nhất với OpenAI.
    Nếu không có KEY_API_OPENAI thì thử dùng Vertex AI.
    """
    openai_key = os.environ.get("KEY_API_OPENAI", "")

    if openai_key and not openai_key.startswith("sk-proj-REPLACE"):
        print("[RAGAS] Using OpenAI for evaluation LLM")
        from langchain_openai import ChatOpenAI, OpenAIEmbeddings
        from ragas.llms import LangchainLLMWrapper
        from ragas.embeddings import LangchainEmbeddingsWrapper

        llm = LangchainLLMWrapper(ChatOpenAI(
            model="gpt-4o-mini",
            api_key=openai_key,
            temperature=0.0,
        ))
        embeddings = LangchainEmbeddingsWrapper(OpenAIEmbeddings(
            openai_api_key=openai_key,
        ))
        return llm, embeddings

    # Fallback: Vertex AI
    print("[RAGAS] Using Vertex AI for evaluation LLM")
    from langchain_google_vertexai import ChatVertexAI, VertexAIEmbeddings
    from ragas.llms import LangchainLLMWrapper
    from ragas.embeddings import LangchainEmbeddingsWrapper
    from chatbot.utils.vertex_helper import get_vertex_config

    project_id, location = get_vertex_config()

    llm = LangchainLLMWrapper(ChatVertexAI(
        model_name=os.environ.get("VERTEX_MODEL_NAME", "gemini-2.5-flash"),
        project=project_id,
        location=location,
        temperature=0.0,
    ))
    embeddings = LangchainEmbeddingsWrapper(VertexAIEmbeddings(
        model_name="text-embedding-004",
        project=project_id,
        location=location,
    ))
    return llm, embeddings


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN EVALUATION FUNCTION
# ═══════════════════════════════════════════════════════════════════════════════
def run_evaluation(input_path: Path = ALL_JSONL):
    """
    Chạy RAGAS evaluation trên toàn bộ records trong input_path.
    """
    print("\n" + "="*60)
    print("RAGAS EVALUATION")
    print("="*60)

    if not input_path.exists():
        print(f"❌ ERROR: Input file not found: {input_path}")
        print("  → Chạy run_ragas_benchmark.py trước, sau đó --merge")
        sys.exit(1)

    records = load_jsonl(input_path)

    if not records:
        print("❌ ERROR: No records found in input file.")
        sys.exit(1)

    # ─── Import RAGAS ────────────────────────────────────────────────────────
    try:
        from ragas import evaluate
        from ragas.metrics import (
            faithfulness,
            answer_relevancy,
            context_precision,
            context_recall,
        )
        from datasets import Dataset
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("  → Chạy: pip install ragas datasets")
        sys.exit(1)

    # ─── Chuẩn bị LLM & Embeddings ──────────────────────────────────────────
    ragas_llm, ragas_embeddings = get_ragas_llm_and_embeddings()

    # ─── Cấu hình metric với LLM/embeddings ─────────────────────────────────
    metrics = [faithfulness, answer_relevancy, context_precision, context_recall]
    for metric in metrics:
        if hasattr(metric, "llm"):
            metric.llm = ragas_llm
        if hasattr(metric, "embeddings"):
            metric.embeddings = ragas_embeddings

    # ─── Tổng hợp kết quả ───────────────────────────────────────────────────
    all_results = []

    # Chạy từng system riêng biệt
    systems = list(set(r.get("system", "unknown") for r in records))
    print(f"[EVAL] Systems found: {systems}")

    for system in systems:
        sys_records = [r for r in records if r.get("system") == system]
        print(f"\n[EVAL] Processing system: {system} ({len(sys_records)} records)")

        # Validate và lọc records hợp lệ
        valid_records = []
        for r in sys_records:
            q   = r.get("question", "").strip()
            a   = r.get("answer", "").strip()
            ctx = r.get("contexts", [])
            gt  = r.get("ground_truth", "").strip()

            if not q or not a or not ctx or not gt:
                print(f"  ⚠️  Skip invalid record: question={q[:40]!r}")
                continue
            if a.startswith("[ERROR") or a.startswith("[EMPTY"):
                print(f"  ⚠️  Skip error record: {a[:60]!r}")
                continue

            valid_records.append(r)

        if not valid_records:
            print(f"  ⚠️  No valid records for {system}, skipping.")
            continue

        # Tạo HuggingFace Dataset đúng schema RAGAS
        dataset_dict = {
            "question":     [r["question"] for r in valid_records],
            "answer":       [r["answer"] for r in valid_records],
            "contexts":     [r["contexts"] for r in valid_records],
            "ground_truth": [r["ground_truth"] for r in valid_records],
        }
        hf_dataset = Dataset.from_dict(dataset_dict)

        print(f"  [EVAL] Running RAGAS on {len(valid_records)} valid records...")

        try:
            result = evaluate(
                dataset=hf_dataset,
                metrics=metrics,
                raise_exceptions=False,
            )
            result_df = result.to_pandas()

            # Thêm metadata
            result_df["system"]     = system
            result_df["difficulty"] = [r["difficulty"] for r in valid_records]

            all_results.append(result_df)
            print(f"  ✅ {system} evaluation complete. Mean scores:")
            for col in RAGAS_METRICS_NAMES:
                if col in result_df.columns:
                    print(f"     {col}: {result_df[col].mean():.4f}")

        except Exception as e:
            print(f"  ❌ ERROR running RAGAS for {system}: {e}")
            import traceback
            traceback.print_exc()

    if not all_results:
        print("\n❌ No results to save. Check errors above.")
        sys.exit(1)

    # ─── Gộp tất cả kết quả ─────────────────────────────────────────────────
    detailed_df = pd.concat(all_results, ignore_index=True)

    # Đảm bảo đủ cột
    for col in RAGAS_METRICS_NAMES:
        if col not in detailed_df.columns:
            detailed_df[col] = None

    # Sắp xếp cột (chỉ lấy các cột tồn tại)
    base_cols = ["system", "difficulty", "question", "answer", "ground_truth"]
    existing_base_cols = [c for c in base_cols if c in detailed_df.columns]
    existing_metrics_cols = [c for c in RAGAS_METRICS_NAMES if c in detailed_df.columns]
    
    cols = existing_base_cols + existing_metrics_cols
    extra_cols = [c for c in detailed_df.columns if c not in cols]
    detailed_df = detailed_df[cols + extra_cols]

    # Lưu detailed
    detailed_df.to_csv(DETAILED_CSV, index=False, encoding="utf-8-sig")
    print(f"\n[EVAL] Detailed results saved to: {DETAILED_CSV}")

    # ─── Summary: group theo difficulty × system ─────────────────────────────
    summary_df = (
        detailed_df
        .groupby(["difficulty", "system"])[RAGAS_METRICS_NAMES]
        .mean()
        .round(4)
        .reset_index()
    )

    # Thêm cột count
    count_df = (
        detailed_df
        .groupby(["difficulty", "system"])
        .size()
        .reset_index(name="count")
    )
    summary_df = summary_df.merge(count_df, on=["difficulty", "system"])

    # Sắp xếp theo difficulty và system
    difficulty_order = {"easy": 0, "medium": 1, "hard": 2}
    summary_df["_order"] = summary_df["difficulty"].map(difficulty_order).fillna(9)
    summary_df = summary_df.sort_values(["_order", "system"]).drop(columns=["_order"])

    summary_df.to_csv(SUMMARY_CSV, index=False, encoding="utf-8-sig")
    print(f"[EVAL] Summary results saved to: {SUMMARY_CSV}")

    # ─── In bảng tóm tắt ─────────────────────────────────────────────────────
    print("\n" + "="*60)
    print("RAGAS EVALUATION SUMMARY")
    print("="*60)
    print(summary_df.to_string(index=False))
    print("\n✅ Evaluation complete!")
    print(f"  Detailed  → {DETAILED_CSV}")
    print(f"  Summary   → {SUMMARY_CSV}")


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════
def main():
    parser = argparse.ArgumentParser(
        description="Evaluate RAGAS metrics on eval_results_all.jsonl"
    )
    parser.add_argument(
        "--input",
        type=Path,
        default=ALL_JSONL,
        help=f"Path to JSONL file (default: {ALL_JSONL})"
    )
    args = parser.parse_args()
    run_evaluation(args.input)


if __name__ == "__main__":
    main()
