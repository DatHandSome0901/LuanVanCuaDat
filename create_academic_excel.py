import pandas as pd
from pathlib import Path
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# Define paths
results_dir = Path("results")
eval_dir = Path("evaluation")

# 1. Load Data
df_overall = pd.read_csv(results_dir / "ragas_scores_overall.csv")
df_diff = pd.read_csv(results_dir / "ragas_scores_by_difficulty.csv")
df_benchmark = pd.read_csv(eval_dir / "benchmark_full_100_answers_scores.csv")

# Clean system names function
def clean_sys_name(name):
    mapping = {
        "talrag": "TALRAG (Proposed)",
        "itihashqa_baseline": "ItihashQA Baseline",
        "notebooklm": "NotebookLM (Google)",
        "gemini_gems": "Gemini Gems (Google)",
        "custom_gpt": "Custom GPT (OpenAI)"
    }
    return mapping.get(name, name)

df_overall["system"] = df_overall["system"].apply(clean_sys_name)
df_diff["system"] = df_diff["system"].apply(clean_sys_name)

# Order systems for sheet 1
system_order = [
    "TALRAG (Proposed)",
    "ItihashQA Baseline",
    "NotebookLM (Google)",
    "Gemini Gems (Google)",
    "Custom GPT (OpenAI)"
]
df_overall["system"] = pd.Categorical(df_overall["system"], categories=system_order, ordered=True)
df_overall = df_overall.sort_values("system").reset_index(drop=True)

# Order difficulty and systems for sheet 2
diff_order = ["easy", "medium", "hard"]
df_diff["difficulty"] = pd.Categorical(df_diff["difficulty"], categories=diff_order, ordered=True)
df_diff["system"] = pd.Categorical(df_diff["system"], categories=system_order, ordered=True)
df_diff = df_diff.sort_values(["difficulty", "system"]).reset_index(drop=True)
# Capitalize difficulty for display
df_diff["difficulty"] = df_diff["difficulty"].str.capitalize()

# Create excel workbook
wb = openpyxl.Workbook()
# remove default sheet
default_sheet = wb.active
wb.remove(default_sheet)

# Style definitions
font_family = "Arial"
title_font = Font(name=font_family, size=16, bold=True, color="1B365D")
section_font = Font(name=font_family, size=12, bold=True, color="1B365D")
header_font = Font(name=font_family, size=10, bold=True, color="FFFFFF")
data_font = Font(name=font_family, size=9, bold=False, color="000000")
bold_data_font = Font(name=font_family, size=9, bold=True, color="000000")

# Fills
header_fill = PatternFill(start_color="1B365D", end_color="1B365D", fill_type="solid")
zebra_fill = PatternFill(start_color="F2F4F7", end_color="F2F4F7", fill_type="solid")
white_fill = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")
accent_fill = PatternFill(start_color="E6EEF8", end_color="E6EEF8", fill_type="solid") # for proposed system

# Borders
thin_border_side = Side(style='thin', color='D3D3D3')
double_border_side = Side(style='double', color='1B365D')
thin_border = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=thin_border_side)
header_border = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=Side(style='medium', color='1B365D'))

# Alignments
align_center = Alignment(horizontal="center", vertical="center", wrap_text=True)
align_left = Alignment(horizontal="left", vertical="center", wrap_text=True)
align_right = Alignment(horizontal="right", vertical="center", wrap_text=True)

# Helper function to style table
def format_sheet(ws, title_text, col_headers, df_data, formats=None, text_wrap_cols=None):
    ws.views.sheetView[0].showGridLines = True
    
    # 1. Add title
    ws.append([title_text])
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=len(col_headers))
    ws.row_dimensions[1].height = 35
    cell = ws.cell(row=1, column=1)
    cell.font = title_font
    cell.alignment = Alignment(horizontal="left", vertical="center")
    
    ws.append([]) # empty row
    ws.row_dimensions[2].height = 10
    
    # 2. Add headers
    ws.append(col_headers)
    header_row_idx = 3
    ws.row_dimensions[header_row_idx].height = 26
    for col_idx in range(1, len(col_headers) + 1):
        c = ws.cell(row=header_row_idx, column=col_idx)
        c.font = header_font
        c.fill = header_fill
        c.alignment = align_center
        c.border = header_border
        
    # 3. Add data
    start_data_row = 4
    for r_idx, row_values in enumerate(df_data.values):
        ws.append(list(row_values))
        curr_row = start_data_row + r_idx
        ws.row_dimensions[curr_row].height = 22
        
        # Zebra pattern and styling
        is_even = (r_idx % 2 == 0)
        row_fill = white_fill if is_even else zebra_fill
        
        # Check if the row belongs to the proposed system (TALRAG) to give it a subtle accent highlight
        is_talrag = False
        for val in row_values:
            if isinstance(val, str) and "TALRAG" in val:
                is_talrag = True
                break
        
        if is_talrag:
            row_fill = accent_fill
            
        for col_idx in range(1, len(row_values) + 1):
            c = ws.cell(row=curr_row, column=col_idx)
            c.border = thin_border
            c.fill = row_fill
            c.font = bold_data_font if is_talrag else data_font
            
            # Format types
            val = row_values[col_idx - 1]
            col_letter = get_column_letter(col_idx)
            
            # Alignment and number formats
            if isinstance(val, (int, float)):
                c.alignment = align_center
                if formats and col_letter in formats:
                    c.number_format = formats[col_letter]
            else:
                if text_wrap_cols and col_letter in text_wrap_cols:
                    c.alignment = align_left
                else:
                    c.alignment = align_center
                    
    # Auto-fit column widths
    for col in ws.columns:
        col_letter = get_column_letter(col[0].column)
        if text_wrap_cols and col_letter in text_wrap_cols:
            # Set fixed width for columns with wrapped text
            ws.column_dimensions[col_letter].width = text_wrap_cols[col_letter]
        else:
            max_len = 0
            # skip title row when calculating width
            for cell in col[2:]:
                if cell.value:
                    max_len = max(max_len, len(str(cell.value)))
            # add safety margin
            ws.column_dimensions[col_letter].width = max(max_len + 4, 12)

# =============================================================================
# SHEET 1: Overall Summary
# =============================================================================
ws1 = wb.create_sheet(title="Overall Summary")
headers1 = ["System", "Faithfulness", "Answer Relevancy", "Context Precision", "Context Recall", "Avg Latency (s)"]
# format columns B, C, D, E to 4 decimal places, F to 2 decimal places
formats1 = {
    "B": "0.0000",
    "C": "0.0000",
    "D": "0.0000",
    "E": "0.0000",
    "F": "0.00"
}
format_sheet(ws1, "Table 1. Overall RAGAS Results (Average across 100 Questions)", headers1, df_overall, formats1)

# =============================================================================
# SHEET 2: Results by Difficulty
# =============================================================================
ws2 = wb.create_sheet(title="Results by Difficulty")
headers2 = ["Difficulty", "System", "Faithfulness", "Answer Relevancy", "Context Precision", "Context Recall", "Avg Latency (s)"]
# Reorder columns in df_diff to match headers2 (difficulty, system, faithfulness, answer_relevancy, context_precision, context_recall, latency)
df_diff_reordered = df_diff[["difficulty", "system", "faithfulness", "answer_relevancy", "context_precision", "context_recall", "latency"]]
formats2 = {
    "C": "0.0000",
    "D": "0.0000",
    "E": "0.0000",
    "F": "0.0000",
    "G": "0.00"
}
format_sheet(ws2, "Table 2. RAGAS Results by Difficulty Tier (Easy / Medium / Hard)", headers2, df_diff_reordered, formats2)

# =============================================================================
# SHEET 3: 100 Questions Benchmark
# =============================================================================
ws3 = wb.create_sheet(title="100 Questions Benchmark")
ws3.views.sheetView[0].showGridLines = True

# Rename columns for Excel headers
headers3 = list(df_benchmark.columns)

# Define column width constraints for wrapped text columns in the massive sheet
# Columns with text description should be wrapped and kept within readable width
# Let's map column letters to widths
# A: ID, B: Question, C: Difficulty, D: Period, E: Dynasty, F: Ground Truth,
# G: TALRAG Answer, H: TALRAG Faithfulness, ...
text_wrap_widths = {
    "A": 10,  # ID
    "B": 35,  # Question
    "C": 12,  # Difficulty
    "D": 12,  # Period
    "E": 15,  # Dynasty
    "F": 35,  # Ground Truth
    "G": 45,  # TALRAG Answer
    "M": 45,  # ItihashQA Answer
    "S": 45,  # NotebookLM Answer
    "Y": 45,  # Gemini Gems Answer
    "AE": 45, # Custom GPT Answer
}

# Number formatting for all the score columns
# Scores are located in: H, I, J, K (TALRAG), N, O, P, Q (ItihashQA), T, U, V, W (NotebookLM), Z, AA, AB, AC (Gemini Gems), AF, AG, AH, AI (Custom GPT)
# Latencies are: L (TALRAG), R (ItihashQA), X (NotebookLM), AD (Gemini Gems), AJ (Custom GPT)
formats3 = {}
score_cols = ["H", "I", "J", "K", "N", "O", "P", "Q", "T", "U", "V", "W", "Z", "AA", "AB", "AC", "AF", "AG", "AH", "AI"]
latency_cols = ["L", "R", "X", "AD", "AJ"]
for col in score_cols:
    formats3[col] = "0.0000"
for col in latency_cols:
    formats3[col] = "0.00"

format_sheet(
    ws3, 
    "Table 3. Detailed Answers and RAGAS Scores for 100 Vietnamese Feudal History Questions", 
    headers3, 
    df_benchmark, 
    formats3, 
    text_wrap_widths
)

# Save Workbook
output_path_eval = eval_dir / "benchmark_evaluation_results.xlsx"
output_path_results = results_dir / "benchmark_evaluation_results.xlsx"

wb.save(output_path_eval)
wb.save(output_path_results)

print(f"Academic Excel file created successfully at:\n- {output_path_eval}\n- {output_path_results}")
