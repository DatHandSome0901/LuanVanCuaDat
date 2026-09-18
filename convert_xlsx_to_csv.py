import pandas as pd
from pathlib import Path
import shutil

# Paths
xlsx_path = Path("evaluation/benchmark_evaluation_results.xlsx")
eval_dir = Path("evaluation")
results_dir = Path("results")
artifacts_dir = Path(r"C:\Users\DAT HANDSOME\AppData\Local\Temp" if not Path(r"C:\Users\DAT HANDSOME\.gemini\antigravity\brain\0dc13d6c-c945-4f83-a08a-153bc13033e8\artifacts").exists() else r"C:\Users\DAT HANDSOME\.gemini\antigravity\brain\0dc13d6c-c945-4f83-a08a-153bc13033e8\artifacts")

if not xlsx_path.exists():
    print(f"Error: {xlsx_path} does not exist.")
    exit(1)

# Read the sheets
xls = pd.ExcelFile(xlsx_path)
print("Available sheets:", xls.sheet_names)

# We want to convert all sheets to CSV with UTF-8 BOM (utf-8-sig) to avoid font/accent errors in Excel
sheet_mapping = {
    "Overall Summary": "benchmark_overall_summary.csv",
    "Results by Difficulty": "benchmark_results_by_difficulty.csv",
    "100 Questions Benchmark": "benchmark_100_questions.csv"
}

for sheet_name, csv_filename in sheet_mapping.items():
    if sheet_name in xls.sheet_names:
        # Read sheet, skipping the first row because it contains our custom formatted title
        # Let's inspect if the first row is indeed just the title. Yes, in create_academic_excel.py we wrote the title on row 1, then an empty row on row 2, and headers on row 3.
        # So we should skip the first 2 rows to get a clean table.
        df = pd.read_excel(xlsx_path, sheet_name=sheet_name, skiprows=2)
        
        # Save path
        out_eval = eval_dir / csv_filename
        out_results = results_dir / csv_filename
        out_artifact = artifacts_dir / csv_filename
        
        # Save as UTF-8 BOM
        df.to_csv(out_eval, index=False, encoding="utf-8-sig")
        df.to_csv(out_results, index=False, encoding="utf-8-sig")
        df.to_csv(out_artifact, index=False, encoding="utf-8-sig")
        
        print(f"Sheet '{sheet_name}' converted and saved to:")
        print(f"  - {out_eval}")
        print(f"  - {out_results}")
        print(f"  - {out_artifact}")
