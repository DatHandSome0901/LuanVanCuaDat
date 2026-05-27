# README — RAGAS Evaluation Pipeline for TALRAG

Hướng dẫn chạy đầy đủ bộ đánh giá RAGAS cho hệ thống TALRAG (Vietnamese Historical Chatbot).

---

## Cấu trúc thư mục `evaluation/`

```
evaluation/
├── benchmark_questions.csv          # 30 câu hỏi (10 easy + 10 medium + 10 hard)
├── run_ragas_benchmark.py           # Chạy benchmark → tạo JSONL
├── evaluate_ragas.py                # Chạy RAGAS → tạo CSV kết quả
├── plot_ragas_results.py            # Vẽ biểu đồ Figure 2
├── eval_results_talrag.jsonl        # (sau khi chạy) kết quả TALRAG
├── eval_results_baseline.jsonl      # (sau khi chạy) kết quả Baseline
├── eval_results_all.jsonl           # (sau khi merge) tất cả kết quả
├── ragas_detailed_results.csv       # (sau khi evaluate) điểm từng câu
├── ragas_summary_results.csv        # (sau khi evaluate) điểm tổng hợp
└── Figure_2_RAGAS_Performance_Comparison.png  # (sau khi plot) biểu đồ
```

---

## Yêu cầu cài đặt

```bash
pip install ragas datasets pandas matplotlib openai langchain-openai langchain-google-vertexai
```

> **Lưu ý:** RAGAS dùng LLM để tính `faithfulness` và `answer_relevancy`. Đảm bảo `.env` có `KEY_API_OPENAI` hoặc cấu hình Vertex AI.

---

## Bước 1 — Kiểm tra FAISS vector store

Trước khi chạy, kiểm tra vector store đã tồn tại:

```bash
# Kiểm tra đường dẫn trong .env
cat .env | grep PATH_VECTOR_STORE
# Nên thấy: PATH_VECTOR_STORE=utils/data_vector_new

# Kiểm tra file FAISS tồn tại
ls utils/data_vector_new/vertex/
# Phải có: index.faiss  index.pkl
```

Nếu chưa có, chạy ingestion pipeline trước.

---

## Bước 2 — Kiểm tra/chỉnh sửa benchmark_questions.csv

File `benchmark_questions.csv` có 30 câu hỏi mẫu, cột gồm:

| Cột | Mô tả |
|-----|-------|
| `difficulty` | `easy` / `medium` / `hard` |
| `question` | Câu hỏi lịch sử Việt Nam |
| `ground_truth` | Đáp án chuẩn do bạn kiểm chứng |

> **Quan trọng:** Hãy tự kiểm chứng lại các `ground_truth` trước khi chạy để đảm bảo độ chính xác.

Thêm câu hỏi của bạn theo format:
```
easy,Câu hỏi?,Đáp án chuẩn.
```

---

## Bước 3 — Chạy TALRAG

```bash
cd "d:\api_web_chatbot_historicalchatbot v2"
python evaluation/run_ragas_benchmark.py --system talrag
```

Script sẽ:
- Khởi tạo `FilesChatAgent` với LangGraph pipeline đầy đủ
- Chạy từng câu qua: `retrieve → grade_documents → generate`
- Lấy `contexts` SAU bước `DocumentGrader` (documents đã được lọc)
- Lưu kết quả vào `eval_results_talrag.jsonl`

---

## Bước 4 — Chạy ItihashQA Baseline

```bash
python evaluation/run_ragas_benchmark.py --system baseline
```

Script sẽ:
- Chỉ dùng FAISS top-5 retrieval thuần túy
- Không có: intent classification, temporal/causal scoring, reranking, DocumentGrader, Web Agent...
- Lưu kết quả vào `eval_results_baseline.jsonl`

---

## Bước 5 — Gộp kết quả

```bash
python evaluation/run_ragas_benchmark.py --merge
```

Tạo ra `eval_results_all.jsonl` chứa kết quả của cả hai hệ thống.

---

## Bước 6 — Chạy RAGAS evaluation

```bash
python evaluation/evaluate_ragas.py
```

Script chạy 4 metric RAGAS:

| Metric | Ý nghĩa |
|--------|---------|
| `faithfulness` | Câu trả lời có trung thực với context không? |
| `answer_relevancy` | Câu trả lời có liên quan đến câu hỏi không? |
| `context_precision` | Context được retrieve có chính xác không? |
| `context_recall` | Context có đầy đủ thông tin cần thiết không? |

Xuất ra:
- `ragas_detailed_results.csv` — điểm từng câu hỏi
- `ragas_summary_results.csv` — trung bình theo `difficulty × system`

---

## Bước 7 — Vẽ biểu đồ Figure 2

```bash
python evaluation/plot_ragas_results.py
```

Tạo ra `Figure_2_RAGAS_Performance_Comparison.png`:
- 2×2 grid, mỗi subplot = 1 metric RAGAS
- X-axis: Easy / Medium / Hard
- Màu xám: ItihashQA Baseline
- Màu xanh: TALRAG
- Label phần trăm trên từng cột
- Caption: *Figure 2. RAGAS performance comparison between the ItihashQA baseline and the proposed TALRAG framework.*

---

## Toàn bộ pipeline một lệnh

```bash
cd "d:\api_web_chatbot_historicalchatbot v2"

# Chạy cả hai hệ thống
python evaluation/run_ragas_benchmark.py --system talrag
python evaluation/run_ragas_benchmark.py --system baseline

# Gộp + đánh giá + vẽ biểu đồ
python evaluation/run_ragas_benchmark.py --merge
python evaluation/evaluate_ragas.py
python evaluation/plot_ragas_results.py
```

---

## Cấu trúc JSONL output

Mỗi dòng trong JSONL có format:

```json
{
  "difficulty": "easy|medium|hard",
  "system": "talrag|itihashqa_baseline",
  "question": "...",
  "answer": "...",
  "contexts": ["retrieved context 1", "retrieved context 2"],
  "ground_truth": "..."
}
```

---

## Xử lý lỗi phổ biến

### Lỗi FAISS không tìm thấy
```
RuntimeError: No FAISS vector store found!
```
→ Kiểm tra `PATH_VECTOR_STORE` trong `.env` và đảm bảo có file `index.faiss`.

### Lỗi Rate Limit (OpenAI/Vertex)
→ Tăng `SLEEP_BETWEEN` trong `run_ragas_benchmark.py` (mặc định 2 giây).

### Lỗi RAGAS ImportError
```
pip install ragas datasets
```

### Câu trả lời [ERROR]
→ Xem log chi tiết, kiểm tra kết nối API và đảm bảo LLM đang hoạt động.

---

## Ghi chú quan trọng cho báo cáo

- **Không** dùng từ "Accuracy" — dùng 4 metric RAGAS-based evaluation
- **Không** dùng tên "EkattorQA" trong biểu đồ — chỉ dùng "ItihashQA Baseline"
- **Phân tích** kết quả TALRAG tốt hơn baseline dựa trên:
  - Adaptive retrieval (intent-aware scoring)
  - Temporal-causal scoring
  - LLM DocumentGrader lọc context
  - Trust-aware self-learning
  - Feedback-guided FAISS ingestion
