

# API Base Project

Dự án cung cấp cấu trúc nền tảng cho việc xây dựng API sử dụng FastAPI.

## Cấu trúc thư mục

Dưới đây là sơ đồ cấu trúc thư mục của dự án (đã lược bỏ các phần không liên quan):

```text
api_base/
├── app/                    # Thư mục chính chứa mã nguồn ứng dụng
│   ├── main.py             # Điểm khởi đầu của ứng dụng (Khởi tạo FastAPI)
│   ├── config.py           # Quản lý cấu hình và biến môi trường (.env)
│   ├── models/             # Định nghĩa các mô hình dữ liệu (DB models, Pydantic schemas)
│   │   ├── base.py
│   │   ├── base_db.py      # Kết nối và thao tác với cơ sở dữ liệu
│   │   └── file_upload.py
│   ├── routers/            # Chứa các file định nghĩa API endpoints (Routes)
│   │   ├── auth.py         # API liên quan đến xác thực
│   │   ├── base.py         # API cơ bản (Health check, v.v.)
│   │   └── file_upload.py  # API xử lý upload file
│   ├── security/           # Logic bảo mật (JWT, password hashing)
│   │   └── security.py
│   └── utils/              # Các hàm bổ trợ (helper functions) của app
│       └── helpers.py
├── utils/                  # Thư mục lưu trữ dữ liệu cục bộ (ngoài app logic)
│   ├── download/           # File tải về tạm thời
│   ├── upload_temp/        # File tải lên tạm thời
├── test/                   # Chứa các file test
├── Dockerfile              # Cấu hình build image Docker
├── docker-compose.yml      # Cấu hình chạy các container (API, DB, ...)
├── requirements.txt        # Danh sách các thư viện Python cần thiết
├── run_api.py              # Script chạy API bằng uvicorn
├── start.sh                # Script khởi động nhanh (thường dùng trong Docker)
└── .env                    # File lưu trữ biến môi trường (Thông tin nhạy cảm)
```

## Chi tiết các thành phần chính

### 1. `app/main.py`
Đây là tệp tin quan trọng nhất, nơi FastAPI được khởi tạo. Nó cấu hình:
- Version API prefix (`/api/v1/`...).
- Middleware (CORS).
- Kết nối các `routers` từ thư mục `routers/`.

### 2. `app/config.py`
Sử dụng thư viện `python-dotenv` để đọc các thông số từ file `.env`. Giúp quản lý tập trung các cấu hình như:
- DB host, user, password.
- API keys, Secret keys.
- Version ứng dụng.

### 3. `app/routers/`
Mỗi file trong này đại diện cho một nhóm chức năng API. Việc chia nhỏ giúp dự án dễ bảo trì và mở rộng.

### 4. `app/models/`
Nơi chứa logic về dữ liệu. `base_db.py` thường chứa các hàm dùng chung để thực thi query SQL hoặc kết nối pool.

### 5. `run_api.py`
Sử dụng `uvicorn` để chạy server. Có thể chạy trực tiếp bằng lệnh:
```bash
python run_api.py
```

## Cách cài đặt và chạy

### Chạy trực tiếp
1. Cài đặt thư viện:
   ```bash
   pip install -r requirements.txt
   ```
2. Chạy ứng dụng:
   ```bash
   python run_api.py
   ```