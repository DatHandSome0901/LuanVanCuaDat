# Developer Guidelines & Project Documentation

Chào mừng bạn đến với tài liệu kỹ thuật dành cho lập trình viên dự án **Chatbot Phật Giáo**. Dự án này được xây dựng trên nền tảng **FastAPI (Python)** và **React (TypeScript)** với kiến trúc module hóa cao.

## 🚀 Cấu trúc dự án (Project Overview)

### Backend (Python/FastAPI)
- `app/main.py`: Khởi tạo ứng dụng, middleware và các routers.
- `app/routers/`: Chứa các API endpoints (auth, chatbot, payment, admin, profile).
- `app/models/base_db.py`: Lớp trừu tượng cho thao tác với SQLite, bao gồm logic tính toán token và quản lý người dùng.
- `app/config.py`: Quản lý cấu hình từ file `.env` qua class `Settings`.
- `chatbot/`: Chứa nhân xử lý AI, RAG Pipeline và LangGraph workflow.

### Frontend (React/TypeScript/Vite)
- `frontend/App.tsx`: Main entry, xử lý xác thực và điều hướng view.
- `frontend/api.ts`: Service layer kết nối với Backend.
- `frontend/components/`: Thư mục chứa các UI components được chia theo module:
  - `admin/`: Các tab quản lý (Users, Settings, Payments, ChatLogs...).
  - `chat/`: Input area, Message items, Emptystate.
  - `payment/`: Package cards, Invoice modals, Report forms.
  - `profile/`: Info cards, Transaction history table.

---

## 📚 Tài liệu chi tiết cho Lập trình viên

### 1. [Hướng dẫn Cấu trúc Chatbot (AI Engine)](./ROUTER_CHATBOT.md)
*Tìm hiểu về RAG, LangGraph, Question Router và cơ chế tính phí Token.*

### 2. [Hướng dẫn Hệ thống Thanh toán (Fintech)](./PAYMENT_GUIDE.md)
*Cơ chế đối soát tự động SePay, mã hóa ID đơn hàng và quy trình báo cáo sự cố.*

### 3. [Hướng dẫn Xác thực & Bảo mật](./SECURITY_GUIDE.md)
*Phân quyền JWT, Gravatar integration và bảo vệ tài liệu.*

### 4. [Hướng dẫn Google OAuth 2.0 (New Flow)](./GOOGLE_LOGIN_GUIDE.md)
*Luồng đăng nhập mới sử dụng Backend Redirect và Token URL Handling.*

### 5. [Hướng dẫn SEO & Quản trị Website](./SEO_GUIDE.md)
*Cơ chế đồng bộ hóa dữ liệu SEO trực tiếp từ Database vào file vật lý `index.html`.*

---

## 🛠 Nguyên tắc phát triển (Coding Standards)

1. **Component-Based UI**: Luôn chia nhỏ các View lớn thành các folder components riêng biệt (ví dụ: `profile/`, `admin/`).
2. **Type Safety**: Tất cả các giao tiếp API và dữ liệu người dùng phải được định nghĩa trong `frontend/types.ts`.
3. **Error Handling**: 
   - Backend: Sử dụng `HTTPException`.
   - Frontend: Sử dụng `react-hot-toast` để hiển thị lỗi và `onError` fallback cho ảnh (avatar).
4. **Environment Variables**: Không bao giờ hardcode token hoặc API Key. Luôn khai báo trong `.env` và truy cập qua `settings` (Backend) hoặc Vite Env (Frontend).