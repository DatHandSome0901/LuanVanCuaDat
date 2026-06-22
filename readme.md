# TALRAG: Hệ Thống Chatbot Hỏi Đáp Lịch Sử Việt Nam

TALRAG (*Temporal-Adaptive Multi-Score RAG for Vietnamese Historical QA*) là hệ thống Chatbot thông minh hỗ trợ trả lời các câu hỏi về Lịch sử Việt Nam dựa trên kiến trúc RAG nâng cao kết hợp vòng lặp tự học (Self-Learning Loop) và phân loại ý định người dùng (Intent Classification).

Dự án bao gồm:
1. **Backend**: FastAPI (Python) tích hợp LangGraph, FAISS và SQLite.
2. **Frontend**: React (Vite + TypeScript + Tailwind/Vanilla CSS).
3. **Mobile App**: Ứng dụng Android xây dựng bằng Capacitor, hỗ trợ đồng bộ thời gian thực.

---

## 🛠️ Yêu Cầu Hệ Thống

Trước khi bắt đầu cài đặt, hãy đảm bảo máy tính của bạn đã được cài đặt:
- **Python**: Phiên bản `3.10` trở lên.
- **Node.js**: Phiên bản `18.x` hoặc `20.x` trở lên (kèm theo `npm`).
- **Java JDK**: Phiên bản `21` (yêu cầu để biên dịch ứng dụng Android).
- **Ngrok** *(Tùy chọn)*: Để tạo tunnel công khai giúp test ứng dụng di động ngoài mạng LAN.

---

## 📂 Cấu Trúc Thư Mục Chính

```text
api_web_chatbot_historicalchatbot v2/
├── app/                    # Mã nguồn FastAPI (Routers, Models, Security, Config)
│   ├── main.py             # File khởi chạy ứng dụng chính
│   ├── config.py           # Đọc & cấu hình biến môi trường từ .env
│   ├── routers/            # Các endpoint API (auth, chatbot, payment, admin, etc.)
│   └── models/             # Kết nối SQLite và định nghĩa schema cơ sở dữ liệu
├── chatbot/                # Công cụ RAG Engine nâng cao (LangGraph, Retriever, Engines)
│   ├── services/           # Logic xử lý RAG, Causal Engine, Web Crawler, Auto-Learning
│   └── prompts.py          # Tập hợp các prompt hệ thống cho LLM
├── frontend/               # Mã nguồn giao diện React (Vite + TSX)
│   ├── components/         # Các Component giao diện (Chat, Admin, Payment, v.v.)
│   ├── android/            # Project Android tạo bởi Capacitor
│   └── package.json        # Các thư viện frontend cần cài đặt
├── database.db             # Cơ sở dữ liệu SQLite của hệ thống
├── run_api.py              # Script tự động đồng bộ mạng, build frontend và chạy Backend
├── set_admin.py            # Script cấp quyền Admin cho người dùng
├── requirements.txt        # Danh sách thư viện Python cần thiết
└── .env                    # Lưu trữ các API key, tài khoản SMTP và cấu hình hệ thống
```

---

## 🚀 Hướng Dẫn Cài Đặt Chi Tiết

### Bước 1: Cài đặt và cấu hình Backend (FastAPI)

1. **Tạo và kích hoạt môi trường ảo Python (Virtual Environment):**
   ```bash
   python -m venv venv
   # Trên Windows:
   venv\Scripts\activate
   # Trên macOS/Linux:
   source venv/bin/activate
   ```

2. **Cài đặt các thư viện cần thiết:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Cấu hình file biến môi trường `.env`:**
   Tạo file `.env` ở thư mục gốc (hoặc chỉnh sửa file `.env` có sẵn) và điền các thông tin sau:
   - **Cấu hình LLM**: Chọn giữa `openai`, `gemini`, hoặc `vertex`. Điền API Key tương ứng.
     ```env
     LLM_NAME=openai
     OPENAI_LLM_MODEL_NAME=gpt-4o-mini
     KEY_API_OPENAI=your_openai_api_key_here
     ```
   - **Cấu hình Đăng nhập bằng Google (Google OAuth)**:
     ```env
     GOOGLE_CLIENT_ID=your_google_client_id
     GOOGLE_CLIENT_SECRET=your_google_client_secret
     GOOGLE_REDIRECT_URI=http://localhost:2643/api/v1/auth/google/callback
     ```
   - **Cấu hình Thanh toán (Sepay VietQR)**:
     ```env
     SEPAY_API_KEY=your_sepay_api_key
     SEPAY_ACCOUNT_NUMBER=your_bank_account_number
     SEPAY_BANK_BRAND=your_bank_brand (Ví dụ: VietinBank)
     ```
   - **Cấu hình SMTP gửi mail báo lỗi (Gmail App Password)**:
     ```env
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_USERNAME=your_gmail@gmail.com
     SMTP_PASSWORD=your_app_password
     ```

4. **Khởi tạo và cấp quyền Admin:**
   Đăng ký tài khoản trên giao diện web hoặc thông qua API, sau đó cấp quyền Admin bằng lệnh:
   ```bash
   python set_admin.py <email_cua_ban>
   ```

---

### Bước 2: Cài đặt Giao Diện (React Frontend)

1. **Di chuyển vào thư mục frontend:**
   ```bash
   cd frontend
   ```

2. **Cài đặt các gói thư viện Node.js:**
   ```bash
   npm install
   ```

---

## 🏃 Hướng Dẫn Khởi Chạy Hệ Thống

Dự án hỗ trợ chạy song song cả Backend và Frontend cực kỳ nhanh chóng.

### Cách 1: Khởi chạy thủ công từng phần

1. **Khởi chạy Backend (FastAPI - Cổng 2643):**
   ```bash
   # Kích hoạt venv trước nếu chưa kích hoạt
   python run_api.py
   ```
   *Lưu ý: `run_api.py` sẽ tự động thực hiện các thao tác: khởi động Ngrok (nếu có), kiểm tra IP mạng cục bộ, cập nhật cấu hình API mới vào `frontend/api.ts`, đồng bộ assets sang Android và chạy uvicorn.*

2. **Khởi chạy Giao diện Frontend (React - Cổng 5173):**
   Mở một terminal mới:
   ```bash
   cd frontend
   npm run dev
   ```

---

### Cách 2: Khởi chạy nhanh bằng File Script có sẵn

Bạn có thể chạy file script hàng loạt được thiết kế cho hệ điều hành Windows:
- **Khởi chạy toàn bộ hệ thống bằng Ngrok & FastAPI:** Nhấp đúp hoặc chạy file `start_all.bat`.

---

## 📱 Biên Dịch Ứng Dụng Di Động Android (Capacitor)

Hệ thống tích hợp công cụ tự động hóa quá trình đóng gói và biên dịch APK thông qua `update_mobile_ip.py` (được gọi bên trong `run_api.py`).

Khi chạy `python run_api.py`, nếu phát hiện cấu hình IP mạng hoặc Ngrok thay đổi, hệ thống sẽ:
1. Tự động dọn dẹp các bản build cũ.
2. Build phiên bản web mới (`npm run build`).
3. Đồng bộ code sang thư mục Android (`npx cap copy android`).
4. Sử dụng Gradle để biên dịch file APK mới (`gradlew assembleDebug`).
5. Copy file APK đã biên dịch thành công ra thư mục gốc với tên `app-debug.apk`.

### Cách tải APK đã biên dịch:
Người dùng có thể tải ứng dụng trực tiếp từ trình duyệt thông qua endpoint:
`http://localhost:2643/download/apk` (hoặc domain Ngrok tương ứng).

---

## 💡 Các Tính Năng Nổi Bật của Hệ Thống

### 1. Kiến trúc RAG Thích Ứng Thời Gian (Temporal-Adaptive RAG)
- **Tự động phân loại ý định (Intent Classification)**: Hệ thống nhận diện câu hỏi thuộc loại so sánh, nhân quả, thời gian hay dữ kiện lịch sử.
- **Trọng số động (Adaptive Weighting)**: Điều chỉnh các hệ số ưu tiên tìm kiếm dựa trên ý định câu hỏi để mang lại tài liệu chính xác nhất.
- **Causal & Temporal Engines**: Chấm điểm mức độ liên quan dựa trên mốc thời gian và quan hệ nguyên nhân - kết quả.

### 2. Vòng Lặp Tự Học (Self-Learning Loop)
- **Crawl fallback từ Web**: Khi không tìm thấy tài liệu trong cơ sở dữ liệu FAISS, hệ thống sẽ sử dụng DuckDuckGo để tìm kiếm thông tin, sau đó dùng LLM để tổng hợp và lọc dữ liệu đáng tin cậy.
- **Tích lũy tri thức**: Các câu hỏi tự học thành công sẽ được đưa vào hàng đợi duyệt (Pending Knowledge).
- **Cơ chế Crowdsourced (Đám đông)**: Nếu câu trả lời nhận được từ **5 lượt thích (Like)** trở lên từ phía người dùng, hệ thống sẽ tự động nhúng (Embed) kiến thức này vào Vector DB (FAISS) ngay lập tức mà không cần quản trị viên duyệt thủ công.

### 3. Cổng Thanh Toán & Quản Lý Token
- Tích hợp cổng thanh toán ngân hàng qua **VietQR (Sepay)**. Khách hàng quét mã QR để nạp token. Hệ thống tự động kiểm tra trạng thái giao dịch qua webhook/API và cộng số dư token tương ứng để người dùng tiếp tục sử dụng dịch vụ.