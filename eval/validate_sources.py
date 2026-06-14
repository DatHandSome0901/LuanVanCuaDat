import os
import csv
import sys
import io
import requests
from pathlib import Path

# Fix terminal encoding for Vietnamese print output
if hasattr(sys.stdout, 'buffer') and sys.stdout.encoding and sys.stdout.encoding.lower() not in ('utf-8', 'utf8'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'buffer') and sys.stderr.encoding and sys.stderr.encoding.lower() not in ('utf-8', 'utf8'):
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

EVAL_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = EVAL_DIR.parent
BENCHMARK_CSV = PROJECT_ROOT / "data" / "eval" / "vn_feudal_100_questions.csv"
ERRORS_CSV = PROJECT_ROOT / "results" / "source_validation_errors.csv"

def validate_url(url: str) -> tuple[bool, str]:
    if not url:
        return False, "URL is empty"
    
    # Simple check for format
    if not (url.startswith("http://") or url.startswith("https://")):
        return False, f"Invalid URL format: {url}"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    }
    
    try:
        # Try HEAD request first for efficiency
        response = requests.head(url, headers=headers, timeout=5, allow_redirects=True)
        if response.status_code == 200:
            return True, "OK"
        
        # Fallback to GET if HEAD failed (some servers return 405 Method Not Allowed or 403 Forbidden for HEAD)
        response = requests.get(url, headers=headers, timeout=5, allow_redirects=True)
        if response.status_code == 200:
            return True, "OK"
            
        return False, f"HTTP Status {response.status_code}"
    except requests.exceptions.RequestException as e:
        return False, str(e)

def main():
    print("=" * 60)
    print("RUNNING BENCHMARK DATA VALIDATION")
    print("=" * 60)

    # Ensure results folder exists
    results_dir = PROJECT_ROOT / "results"
    results_dir.mkdir(parents=True, exist_ok=True)

    if not BENCHMARK_CSV.exists():
        print(f"Error: Benchmark CSV not found at {BENCHMARK_CSV}")
        sys.exit(1)

    errors = []
    
    with open(BENCHMARK_CSV, mode="r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        
    print(f"Loaded {len(rows)} questions from benchmark.")
    
    for i, row in enumerate(rows, 1):
        qid = row.get("id") or f"ROW_{i}"
        question = row.get("question") or ""
        difficulty = row.get("difficulty") or ""
        dynasty = row.get("dynasty") or ""
        ground_truth = row.get("ground_truth") or ""
        expected_claims = row.get("expected_claims") or ""
        evidence_text = row.get("evidence_text") or ""
        source_url = row.get("source_url") or ""

        print(f"[{i}/{len(rows)}] Validating {qid}...", end="\r", flush=True)

        # 1. Ground truth check
        if not ground_truth.strip():
            errors.append({
                "id": qid,
                "question": question,
                "difficulty": difficulty,
                "dynasty": dynasty,
                "error_type": "Missing Ground Truth",
                "details": "ground_truth field is empty"
            })
            
        # 2. Expected claims check
        if not expected_claims.strip():
            errors.append({
                "id": qid,
                "question": question,
                "difficulty": difficulty,
                "dynasty": dynasty,
                "error_type": "Missing Expected Claims",
                "details": "expected_claims field is empty"
            })

        # 3. Evidence text check
        if not evidence_text.strip():
            errors.append({
                "id": qid,
                "question": question,
                "difficulty": difficulty,
                "dynasty": dynasty,
                "error_type": "Missing Evidence",
                "details": "evidence_text field is empty"
            })

        # 4. URL accessibility check
        if not source_url.strip():
            errors.append({
                "id": qid,
                "question": question,
                "difficulty": difficulty,
                "dynasty": dynasty,
                "error_type": "Missing Source URL",
                "details": "source_url field is empty"
            })
        else:
            is_valid, url_details = validate_url(source_url.strip())
            if not is_valid:
                errors.append({
                    "id": qid,
                    "question": question,
                    "difficulty": difficulty,
                    "dynasty": dynasty,
                    "error_type": "Inaccessible Source URL",
                    "details": f"URL {source_url} - {url_details}"
                })

    print("\n" + "-"*60)
    print(f"Validation complete. Found {len(errors)} issues.")

    # Write errors to CSV
    with open(ERRORS_CSV, mode="w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["id", "question", "difficulty", "dynasty", "error_type", "details"])
        writer.writeheader()
        writer.writerows(errors)

    print(f"Errors log written to: {ERRORS_CSV}")
    print("=" * 60)

if __name__ == "__main__":
    main()
