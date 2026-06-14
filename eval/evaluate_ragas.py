import os
import sys
import io
import json
import csv
from pathlib import Path
import pandas as pd
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

RESULTS_DIR = PROJECT_ROOT / "results"
TABLES_DIR = RESULTS_DIR / "tables"
LOGS_DIR = RESULTS_DIR / "logs"

RESULTS_DIR.mkdir(parents=True, exist_ok=True)
TABLES_DIR.mkdir(parents=True, exist_ok=True)
LOGS_DIR.mkdir(parents=True, exist_ok=True)

# Input files
SYSTEM_FILES = {
    "talrag": RESULTS_DIR / "raw_outputs_talrag.jsonl",
    "itihashqa_baseline": RESULTS_DIR / "raw_outputs_itihashqa.jsonl",
    "notebooklm": RESULTS_DIR / "manual_outputs_notebooklm.jsonl",
    "gemini_gems": RESULTS_DIR / "manual_outputs_gemini_gems.jsonl",
    "custom_gpt": RESULTS_DIR / "manual_outputs_custom_gpt.jsonl",
}

# Output files
QUESTION_CSV = RESULTS_DIR / "ragas_scores_by_question.csv"
DIFFICULTY_CSV = RESULTS_DIR / "ragas_scores_by_difficulty.csv"
OVERALL_CSV = RESULTS_DIR / "ragas_scores_overall.csv"
TABLES_MD = TABLES_DIR / "experiment_tables.md"
CONFIG_JSON = LOGS_DIR / "eval_config.json"

RAGAS_METRICS = ["faithfulness", "answer_relevancy", "context_precision", "context_recall"]

def get_ragas_llm_and_embeddings():
    """
    Returns the LLM and Embeddings wrappers for RAGAS.
    First tries OpenAI (best compatibility). If not configured, falls back to Vertex AI.
    """
    openai_key = os.environ.get("KEY_API_OPENAI", "")
    if openai_key and not openai_key.startswith("sk-proj-REPLACE"):
        print("[RAGAS] Configuring OpenAI LLM & Embeddings")
        from langchain_openai import ChatOpenAI, OpenAIEmbeddings
        from ragas.llms import LangchainLLMWrapper
        from ragas.embeddings import LangchainEmbeddingsWrapper

        llm = LangchainLLMWrapper(ChatOpenAI(
            model=os.environ.get("OPENAI_LLM_MODEL_NAME", "gpt-4o-mini"),
            api_key=openai_key,
            temperature=0.0,
        ))
        embeddings = LangchainEmbeddingsWrapper(OpenAIEmbeddings(
            openai_api_key=openai_key,
        ))
        return llm, embeddings
    
    # Fallback to Vertex AI
    print("[RAGAS] Configuring Vertex AI LLM & Embeddings (Fallback)")
    from langchain_google_vertexai import ChatVertexAI, VertexAIEmbeddings
    from ragas.llms import LangchainLLMWrapper
    from ragas.embeddings import LangchainEmbeddingsWrapper

    llm = LangchainLLMWrapper(ChatVertexAI(
        model_name=os.environ.get("VERTEX_MODEL_NAME", "gemini-2.5-flash"),
        project=os.environ.get("PROJECT_ID"),
        location=os.environ.get("LOCATION", "us-central1"),
        temperature=0.0,
    ))
    embeddings = LangchainEmbeddingsWrapper(VertexAIEmbeddings(
        model_name="text-embedding-004",
        project=os.environ.get("PROJECT_ID"),
        location=os.environ.get("LOCATION", "us-central1"),
    ))
    return llm, embeddings

def load_system_records(system_name, file_path):
    records = []
    if not file_path.exists():
        print(f"Warning: File {file_path} for {system_name} not found.")
        return []
    
    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                try:
                    record = json.loads(line)
                    # Normalize system_name and key names
                    record["system"] = system_name
                    # Make sure difficulty is lowercase for aggregation consistency
                    if "difficulty" in record:
                        record["difficulty"] = record["difficulty"].lower()
                    # Ensure contexts are handled correctly
                    if "retrieved_contexts" in record:
                        record["contexts"] = record["retrieved_contexts"]
                    elif "cited_sources_or_contexts" in record:
                        record["contexts"] = record["cited_sources_or_contexts"]
                    elif "contexts" not in record:
                        record["contexts"] = []
                    records.append(record)
                except Exception as e:
                    print(f"Error reading JSON line in {file_path}: {e}")
    return records

def generate_markdown_report(overall_df, difficulty_df, active_systems, pending_systems):
    """Generates the Markdown tables for results/tables/experiment_tables.md."""
    # Build System Information Table
    table1 = (
        "| System | Type | Description | API/Interface | Access |\n"
        "| :--- | :--- | :--- | :--- | :--- |\n"
        "| **TALRAG** | Agentic RAG | Proposed framework with adaptive, temporal/causal logic | Programmatic (LangGraph) | Open-source (local) |\n"
        "| **ItihashQA Baseline** | Static RAG | Standard FAISS similarity search + LLM generation | Programmatic (FAISS) | Open-source (local) |\n"
        "| **Gemini Gems** | Custom Agent | Instruction-tuned custom agent on Google Gemini | Web UI | Closed |\n"
        "| **ChatGPT (Custom GPT)** | Custom GPT | Custom GPT-4o with uploaded corpus and instructions | Web UI | Closed |\n"
        "| **NotebookLM** | Research Assistant | Google's document-anchored workspace research agent | Web UI | Closed |\n"
    )

    # Build Benchmark Construction Criteria Table
    table2 = (
        "| Difficulty | Question Count | Historical Era Coverage | Dynasty Focus | Question Types |\n"
        "| :--- | :---: | :--- | :--- | :--- |\n"
        "| **Easy** | 40 | 939 - 1945 | Ngô, Đinh, Tiền Lê, Lý, Trần, Hồ, Lê, Tây Sơn, Nguyễn | Factual lookups, dates, entities |\n"
        "| **Medium** | 35 | 939 - 1945 | Ngô, Đinh, Tiền Lê, Lý, Trần, Hồ, Lê, Tây Sơn, Nguyễn | Explanatory, causal reasons, roles |\n"
        "| **Hard** | 25 | 939 - 1945 | Cross-dynastic synthesis | Multi-dynasty comparison, synthesis |\n"
        "| **Total** | **100** | **939 - 1945** | **All Feudal Dynasties** | **Balanced Factual & Explanatory** |\n"
    )

    # Helper function to extract a value from dataframe
    def get_val(df, sys, metric, diff=None):
        if sys in pending_systems:
            return "Pending"
        
        if diff:
            sub = df[(df["system"] == sys) & (df["difficulty"] == diff)]
        else:
            sub = df[df["system"] == sys]
            
        if sub.empty or metric not in sub.columns or pd.isna(sub[metric].values[0]):
            return "N/A"
        
        val = sub[metric].values[0]
        return f"{val:.4f}"

    def get_latency(df, sys, diff=None):
        if sys in pending_systems:
            return "N/A"
        if diff:
            sub = df[(df["system"] == sys) & (df["difficulty"] == diff)]
        else:
            sub = df[df["system"] == sys]
        if sub.empty or "latency" not in sub.columns or pd.isna(sub["latency"].values[0]):
            return "N/A"
        return f"{sub['latency'].values[0]:.2f}s"

    # Build Table 3: Overall RAGAS results
    table3 = (
        "| System | Faithfulness | Answer Relevancy | Context Precision | Context Recall | Avg Latency |\n"
        "| :--- | :---: | :---: | :---: | :---: | :---: |\n"
    )
    for sys in ["talrag", "itihashqa_baseline", "notebooklm", "gemini_gems", "custom_gpt"]:
        sys_label = "TALRAG" if sys == "talrag" else "ItihashQA Baseline" if sys == "itihashqa_baseline" else sys.upper() if sys != "custom_gpt" else "Custom GPT"
        table3 += f"| {sys_label} | {get_val(overall_df, sys, 'faithfulness')} | {get_val(overall_df, sys, 'answer_relevancy')} | {get_val(overall_df, sys, 'context_precision')} | {get_val(overall_df, sys, 'context_recall')} | {get_latency(overall_df, sys)} |\n"

    # Build Table 4: RAGAS results by difficulty
    table4 = (
        "| Difficulty | System | Faithfulness | Answer Relevancy | Context Precision | Context Recall | Avg Latency |\n"
        "| :--- | :--- | :---: | :---: | :---: | :---: | :---: |\n"
    )
    for diff in ["easy", "medium", "hard"]:
        diff_label = diff.capitalize()
        for sys in ["talrag", "itihashqa_baseline", "notebooklm", "gemini_gems", "custom_gpt"]:
            sys_label = "TALRAG" if sys == "talrag" else "ItihashQA Baseline" if sys == "itihashqa_baseline" else sys.upper() if sys != "custom_gpt" else "Custom GPT"
            table4 += f"| {diff_label} | {sys_label} | {get_val(difficulty_df, sys, 'faithfulness', diff)} | {get_val(difficulty_df, sys, 'answer_relevancy', diff)} | {get_val(difficulty_df, sys, 'context_precision', diff)} | {get_val(difficulty_df, sys, 'context_recall', diff)} | {get_latency(difficulty_df, sys, diff)} |\n"

    # Build Table 5: Answer-level comparisons
    table5 = (
        "| System | Faithfulness | Answer Relevancy | Improvement (Relevancy) |\n"
        "| :--- | :---: | :---: | :---: |\n"
    )
    baseline_relevancy = None
    if "itihashqa_baseline" in active_systems:
        sub = overall_df[overall_df["system"] == "itihashqa_baseline"]
        if not sub.empty and "answer_relevancy" in sub.columns:
            baseline_relevancy = sub["answer_relevancy"].values[0]

    for sys in ["talrag", "itihashqa_baseline", "notebooklm", "gemini_gems", "custom_gpt"]:
        sys_label = "TALRAG" if sys == "talrag" else "ItihashQA Baseline" if sys == "itihashqa_baseline" else sys.upper() if sys != "custom_gpt" else "Custom GPT"
        relevancy_str = get_val(overall_df, sys, 'answer_relevancy')
        faith_str = get_val(overall_df, sys, 'faithfulness')
        
        improvement_str = "N/A"
        if sys == "talrag" and baseline_relevancy and "talrag" in active_systems:
            tal_sub = overall_df[overall_df["system"] == "talrag"]
            if not tal_sub.empty and "answer_relevancy" in tal_sub.columns:
                tal_relevancy = tal_sub["answer_relevancy"].values[0]
                if baseline_relevancy > 0:
                    pct = ((tal_relevancy - baseline_relevancy) / baseline_relevancy) * 100
                    improvement_str = f"+{pct:.1f}%"
        elif sys == "itihashqa_baseline":
            improvement_str = "Baseline"
            
        table5 += f"| {sys_label} | {faith_str} | {relevancy_str} | {improvement_str} |\n"

    md_content = f"""# Empirical Evaluation Tables — 100-Question Vietnamese Feudal History Benchmark

This document presents the detailed empirical evaluation tables comparing the **TALRAG** system against **ItihashQA Baseline**, **NotebookLM**, **Gemini Gems**, and **ChatGPT (Custom GPT)**.

## Table 1. Baseline Systems Used in the Study

{table1}

## Table 2. Benchmark Construction Criteria

{table2}

## Table 3. Overall RAGAS Results (Average across 100 Questions)

{table3}

## Table 4. RAGAS Results by Difficulty Tier

{table4}

## Table 5. Answer-level Performance and Relevancy Improvements

{table5}
"""
    with open(TABLES_MD, "w", encoding="utf-8") as f:
        f.write(md_content)
    print(f"[REPORT] Generated tables report: {TABLES_MD}")

def main():
    print("=" * 60)
    print("RUNNING RAGAS METRICS EVALUATION PIPELINE")
    print("=" * 60)

    # 1. Load records from all systems
    all_records = []
    active_systems = []
    pending_systems = []

    for sys_name, file_path in SYSTEM_FILES.items():
        records = load_system_records(sys_name, file_path)
        valid_records = [r for r in records if r.get("answer", "").strip() and not r.get("answer").startswith("[ERROR") and not r.get("answer").startswith("[EMPTY")]
        
        if valid_records:
            print(f"Loaded {len(valid_records)} valid records for system: {sys_name}")
            all_records.extend(valid_records)
            active_systems.append(sys_name)
        else:
            print(f"System: {sys_name} has no valid answers. Marked as Pending.")
            pending_systems.append(sys_name)

    if not active_systems:
        print("Error: No active systems found with answers to evaluate!")
        sys.exit(1)

    # 2. Run Ragas Evaluation for each active system
    try:
        from datasets import Dataset
        from ragas import evaluate
        from ragas.metrics import (
            faithfulness,
            answer_relevancy,
            context_precision,
            context_recall,
        )
    except ImportError as e:
        print(f"ImportError: {e}. Please run pip install ragas datasets.")
        sys.exit(1)

    # Configure RAGAS LLM & Embeddings
    ragas_llm, ragas_embeddings = get_ragas_llm_and_embeddings()
    metrics = [faithfulness, answer_relevancy, context_precision, context_recall]
    for metric in metrics:
        if hasattr(metric, "llm"):
            metric.llm = ragas_llm
        if hasattr(metric, "embeddings"):
            metric.embeddings = ragas_embeddings

    # Check existing scores to skip re-evaluating systems
    cached_dfs = []
    skipped_systems = set()
    if QUESTION_CSV.exists():
        try:
            old_df = pd.read_csv(QUESTION_CSV)
            for sys_name in active_systems:
                sys_sub = old_df[old_df["system"] == sys_name].copy()
                # If we have 100 questions, we can reuse it by filling NaNs with 0.0
                if len(sys_sub) == 100:
                    sys_sub[RAGAS_METRICS] = sys_sub[RAGAS_METRICS].fillna(0.0)
                    print(f"System {sys_name} already evaluated in {QUESTION_CSV.name}. Loading cached scores (filled NaNs with 0.0).")
                    cached_dfs.append(sys_sub)
                    skipped_systems.add(sys_name)
        except Exception as e:
            print(f"Error reading existing QUESTION_CSV: {e}")

    evaluation_dataframes = []

    for sys_name in active_systems:
        if sys_name in skipped_systems:
            continue
            
        sys_records = [r for r in all_records if r["system"] == sys_name]
        print(f"\nEvaluating system: {sys_name}...")

        # Setup dataset schema
        # For closed systems, there might not be retrieved contexts, so we pass evidence_text or ground_truth
        dataset_dict = {
            "question": [r["question"] for r in sys_records],
            "answer": [r["answer"] for r in sys_records],
            "contexts": [r["contexts"] if r["contexts"] else [r.get("evidence_text", r.get("ground_truth", ""))] for r in sys_records],
            "ground_truth": [r["ground_truth"] for r in sys_records],
        }

        dataset = Dataset.from_dict(dataset_dict)

        # Run evaluate
        try:
            results = evaluate(
                dataset=dataset,
                metrics=metrics,
                raise_exceptions=False,
            )
            df = results.to_pandas()
            
            # Re-insert system & difficulty & latency fields
            df["system"] = sys_name
            df["difficulty"] = [r["difficulty"] for r in sys_records]
            df["latency"] = [r.get("latency", 0.0) for r in sys_records]
            df["id"] = [r["id"] for r in sys_records]
            
            evaluation_dataframes.append(df)
            print(f"System {sys_name} evaluated successfully.")
        except Exception as ex:
            print(f"Failed to evaluate {sys_name}: {ex}")

    if not evaluation_dataframes and not cached_dfs:
        print("Error: No evaluation data could be generated.")
        sys.exit(1)

    # Combine all results into one DataFrame
    combined_df = pd.concat(cached_dfs + evaluation_dataframes, ignore_index=True)

    # Ensure all metrics are present in DataFrame
    for m in RAGAS_METRICS:
        if m not in combined_df.columns:
            combined_df[m] = None

    # Write detailed CSV
    detailed_cols = ["id", "system", "difficulty", "question", "answer", "ground_truth", "latency"] + RAGAS_METRICS
    # Re-order columns to make readable
    existing_cols = [c for c in detailed_cols if c in combined_df.columns]
    combined_df[existing_cols].to_csv(QUESTION_CSV, index=False, encoding="utf-8-sig")
    print(f"[OUTPUT] Detailed question-level scores saved: {QUESTION_CSV}")

    # Compute Difficulty summary
    difficulty_df = (
        combined_df.groupby(["system", "difficulty"])[RAGAS_METRICS + ["latency"]]
        .mean()
        .reset_index()
    )
    difficulty_df.to_csv(DIFFICULTY_CSV, index=False, encoding="utf-8-sig")
    print(f"[OUTPUT] Difficulty-level summary saved: {DIFFICULTY_CSV}")

    # Compute Overall summary
    overall_df = (
        combined_df.groupby("system")[RAGAS_METRICS + ["latency"]]
        .mean()
        .reset_index()
    )
    overall_df.to_csv(OVERALL_CSV, index=False, encoding="utf-8-sig")
    print(f"[OUTPUT] Overall average summary saved: {OVERALL_CSV}")

    # Generate Markdown Report with all tables
    generate_markdown_report(overall_df, difficulty_df, active_systems, pending_systems)

    print("\n" + "=" * 60)
    print("RAGAS EVALUATION COMPLETED")
    print("=" * 60)

if __name__ == "__main__":
    main()
