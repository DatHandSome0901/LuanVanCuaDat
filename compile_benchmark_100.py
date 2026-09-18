import json
import pandas as pd
from pathlib import Path

# Paths
results_dir = Path("results")
eval_dir = Path("evaluation")

# 1. Read base questions
questions_path = eval_dir / "vn_feudal_100_questions.csv"
if not questions_path.exists():
    print(f"Error: {questions_path} does not exist.")
    exit(1)

df_base = pd.read_csv(questions_path)
print(f"Loaded {len(df_base)} base questions.")

# Keep only key metadata columns from base questions
# Columns in base: id, question, difficulty, period, dynasty, question_type, ground_truth, expected_claims, source_title, source_url, evidence_text
metadata_cols = ["id", "question", "difficulty", "period", "dynasty", "ground_truth"]
df_master = df_base[metadata_cols].copy()

# 2. Load model answers
model_files = {
    "talrag": results_dir / "raw_outputs_talrag.jsonl",
    "itihashqa": results_dir / "raw_outputs_itihashqa.jsonl",
    "notebooklm": results_dir / "manual_outputs_notebooklm.jsonl",
    "gemini_gems": results_dir / "manual_outputs_gemini_gems.jsonl",
    "custom_gpt": results_dir / "manual_outputs_custom_gpt.jsonl"
}

answers = {model: {} for model in model_files}

for model, path in model_files.items():
    if not path.exists():
        print(f"Warning: {path} not found.")
        continue
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                try:
                    obj = json.loads(line)
                    qid = obj.get("id")
                    ans = obj.get("answer")
                    if qid:
                        answers[model][qid] = ans
                except Exception as e:
                    print(f"Error parsing line in {path}: {e}")

print("Loaded answers for all models.")

# 3. Load RAGAS scores
scores_path = results_dir / "ragas_scores_by_question.csv"
scores_dict = {}

if scores_path.exists():
    df_scores = pd.read_csv(scores_path)
    # The system column names in ragas_scores_by_question.csv are:
    # talrag, itihashqa_baseline, notebooklm, gemini_gems, custom_gpt
    # Let's map itihashqa_baseline to itihashqa
    df_scores["system"] = df_scores["system"].replace("itihashqa_baseline", "itihashqa")
    
    for _, row in df_scores.iterrows():
        qid = row["id"]
        system = row["system"]
        scores_dict[(qid, system)] = {
            "faithfulness": row.get("faithfulness"),
            "answer_relevancy": row.get("answer_relevancy"),
            "context_precision": row.get("context_precision"),
            "context_recall": row.get("context_recall"),
            "latency": row.get("latency")
        }
    print(f"Loaded scores from {scores_path}.")
else:
    print(f"Warning: {scores_path} not found.")

# 4. Merge all together
new_columns = {}
for model in model_files.keys():
    # Answers
    new_columns[f"{model}_answer"] = [answers[model].get(qid, "") for qid in df_master["id"]]
    
    # RAGAS scores and latency
    faithfulness_col = []
    relevancy_col = []
    precision_col = []
    recall_col = []
    latency_col = []
    
    for qid in df_master["id"]:
        score_data = scores_dict.get((qid, model), {})
        faithfulness_col.append(score_data.get("faithfulness", ""))
        relevancy_col.append(score_data.get("answer_relevancy", ""))
        precision_col.append(score_data.get("context_precision", ""))
        recall_col.append(score_data.get("context_recall", ""))
        latency_col.append(score_data.get("latency", ""))
        
    new_columns[f"{model}_faithfulness"] = faithfulness_col
    new_columns[f"{model}_answer_relevancy"] = relevancy_col
    new_columns[f"{model}_context_precision"] = precision_col
    new_columns[f"{model}_context_recall"] = recall_col
    new_columns[f"{model}_latency"] = latency_col

# Assign to df_master
for col_name, data in new_columns.items():
    df_master[col_name] = data

# Rename columns to make them clean and readable
rename_dict = {
    "id": "Question ID",
    "question": "Question",
    "difficulty": "Difficulty",
    "period": "Period",
    "dynasty": "Dynasty",
    "ground_truth": "Ground Truth",
    
    "talrag_answer": "TALRAG Answer",
    "talrag_faithfulness": "TALRAG Faithfulness",
    "talrag_answer_relevancy": "TALRAG Answer Relevancy",
    "talrag_context_precision": "TALRAG Context Precision",
    "talrag_context_recall": "TALRAG Context Recall",
    "talrag_latency": "TALRAG Latency (s)",
    
    "itihashqa_answer": "ItihashQA Answer",
    "itihashqa_faithfulness": "ItihashQA Faithfulness",
    "itihashqa_answer_relevancy": "ItihashQA Answer Relevancy",
    "itihashqa_context_precision": "ItihashQA Context Precision",
    "itihashqa_context_recall": "ItihashQA Context Recall",
    "itihashqa_latency": "ItihashQA Latency (s)",
    
    "notebooklm_answer": "NotebookLM Answer",
    "notebooklm_faithfulness": "NotebookLM Faithfulness",
    "notebooklm_answer_relevancy": "NotebookLM Answer Relevancy",
    "notebooklm_context_precision": "NotebookLM Context Precision",
    "notebooklm_context_recall": "NotebookLM Context Recall",
    "notebooklm_latency": "NotebookLM Latency (s)",
    
    "gemini_gems_answer": "Gemini Gems Answer",
    "gemini_gems_faithfulness": "Gemini Gems Faithfulness",
    "gemini_gems_answer_relevancy": "Gemini Gems Answer Relevancy",
    "gemini_gems_context_precision": "Gemini Gems Context Precision",
    "gemini_gems_context_recall": "Gemini Gems Context Recall",
    "gemini_gems_latency": "Gemini Gems Latency (s)",
    
    "custom_gpt_answer": "Custom GPT Answer",
    "custom_gpt_faithfulness": "Custom GPT Faithfulness",
    "custom_gpt_answer_relevancy": "Custom GPT Answer Relevancy",
    "custom_gpt_context_precision": "Custom GPT Context Precision",
    "custom_gpt_context_recall": "Custom GPT Context Recall",
    "custom_gpt_latency": "Custom GPT Latency (s)"
}

df_master = df_master.rename(columns=rename_dict)

# Output paths
output_csv_eval = eval_dir / "benchmark_full_100_answers_scores.csv"
output_csv_results = results_dir / "benchmark_full_100_answers_scores.csv"

# Save with utf-8-sig for Vietnamese compatibility in Excel
df_master.to_csv(output_csv_eval, index=False, encoding="utf-8-sig")
df_master.to_csv(output_csv_results, index=False, encoding="utf-8-sig")

print(f"Master benchmark saved successfully to:\n- {output_csv_eval}\n- {output_csv_results}")
