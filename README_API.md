# Hướng dẫn Tích hợp API cho Frontend

Tài liệu này cung cấp chi tiết về các endpoint API cần thiết để xây dựng giao diện frontend cho hệ thống Chatbot RAG.

**Base URL:** `http://localhost:2643/api/v1` (Thay đổi tùy theo môi trường config)

---

## 1. Xác thực & Người dùng (Authentication)

### 🔑 Đăng ký tài khoản
*   **Endpoint:** `POST /auth/register`
*   **Body (Form Data):**
    *   `username`: Tên đăng nhập
    *   `password`: Mật khẩu
    *   `email`: Địa chỉ email
*   **Response:** `{"message": "✅ Đăng ký thành công!"}`

### 🔓 Đăng nhập (Username/Password)
*   **Endpoint:** `POST /auth/login`
*   **Body (Form Data):**
    *   `username`: Tên đăng nhập
    *   `password`: Mật khẩu
*   **Response:**
    ```json
    {
      "access_token": "eyJhbG...",
      "token_type": "bearer",
      "user": {
        "id": 1,
        "username": "duyvo",
        "email": "test@example.com",
        "token_balance": 10.0
      }
    }
    ```

### 🌐 Đăng nhập Google
1.  **Lấy URL Google Auth:** `GET /auth/google/login` -> Trả về `auth_url`. Frontend chuyển hướng user tới URL này.
2.  **Xử lý Callback:** Sau khi user chọn tài khoản, Google chuyển hướng về frontend với mã `code`. Frontend gọi:
    *   `GET /auth/google/callback?code=xxxx`
    *   **Response:** Tương tự login (trả về `access_token` và `user`).

### 🧐 Kiểm tra trạng thái đăng nhập
*   **Endpoint:** `GET /auth/check`
*   **Headers:** `Authorization: Bearer <token>`
*   **Sử dụng:** Dùng để lấy lại số dư token mới nhất và thông tin user khi load trang.

---

## 2. Chatbot RAG

### 💬 Gửi tin nhắn chat
*   **Endpoint:** `POST /chat`
*   **Headers:** `Authorization: Bearer <token>`
*   **Body (JSON):**
    ```json
    {
      "question": "Website chuyên cung cấp sản phẩm gì?"
    }
    ```
*   **Response:**
    ```json
    {
      "answer": "Website chuyên cung cấp các sản phẩm về Vườn Sâm...",
      "tokens_charged": 150.0,
      "user_token_balance": 850.0
    }
    ```
    *(Lưu ý: `tokens_charged` là số token thực tế bị trừ cho câu trả lời này)*

---

## 3. Upload & Quản lý File

### 📁 Tải lên File
*   **Endpoint:** `POST /upload-file/upload/`
*   **Headers:** `X-API-Key: <your_api_key>` (Xác thực qua API Key config trong .env)
*   **Body (Multipart):** `file`: Tệp tin cần tải lên.
*   **Response:**
    ```json
    {
      "filename": "uuid-name.png",
      "download_url": "/api/v1/upload-file/download/uuid-name.png"
    }
    ```

---

## 4. Quản lý Token & Nạp tiền (Payment)

### 📦 Lấy danh sách gói nạp
*   **Endpoint:** `GET /payment/packages`
*   **Response:**
    ```json
    {
      "packages": [
        {"id": 1, "name": "Gói khởi đầu", "tokens": 50, "amount_vnd": 50000},
        ...
      ]
    }
    ```

### 💳 Tạo hóa đơn nạp tiền (VietQR)
*   **Endpoint:** `POST /payment/create`
*   **Headers:** `Authorization: Bearer <token>`
*   **Body (Form Data):**
    *   `package_id`: ID của gói muốn nạp
*   **Response:**
    ```json
    {
      "payment_id": 102,
      "amount_vnd": 50000,
      "qr_url": "https://qr.sepay.vn/img?...",
      "note": "NAMEWEB_NAPTOKEN_102"
    }
    ```

### 🔄 Kiểm tra trạng thái thanh toán
*   **Endpoint:** `GET /payment/status/{payment_id}`
*   **Headers:** `Authorization: Bearer <token>`
*   **Response:** `{"status": "completed", "tokens": 50}`

---

## 💡 Lưu ý quan trọng
1.  **Port:** API chạy tại port `2643`.
2.  **Headers:** Mọi request (trừ login/register/download) đều yêu cầu `Authorization: Bearer <access_token>`.
3.  **Tự động trừ tiền:** Token được trừ tự động sau mỗi câu trả lời của Chatbot.
