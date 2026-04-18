# Kỹ thuật chuyên sâu: Hệ thống Thanh toán (Polling & Sync)

Tài liệu này giải thích chi tiết cách thức hoạt động của luồng nạp tiền tự động không qua Webhook.

## 1. Luồng xử lý (Payment Flow Sequence)

1. **Khởi tạo**: Frontend gọi `POST /api/v1/payment/create` với `package_id`.
2. **Backend**: 
   - Tạo record trong bảng `payments` (status: `pending`).
   - Trả về `HEX_ID` (ID hóa đơn đã XOR bảo mật).
3. **Frontend**: Hiển thị QR Code ngân hàng kèm nội dung chuyển khoản: `{NAME_WEB}NAPTOKEN{HEX_ID}`.
4. **Polling (Vòng lặp)**:
   - Frontend gọi `GET /api/v1/payment/status/{id}` mỗi 5-10 giây.
   - Backend nhận request -> Gọi SePay API lấy lịch sử giao dịch.
   - Backend quét (Iterate) từng giao dịch SePay trả về.
   - **SO KHỚP**: Nếu tìm thấy giao dịch có `content` chứa mã nạp và `amount` khớp -> XỬ LÝ THÀNH CÔNG.

## 2. Logic So khớp (Reconciliation Logic)
Backend sử dụng Regex để bóc tách mã nạp từ nội dung tin nhắn ngân hàng (thường rất lộn xộn).

```python
# app/routers/payment.py
import re

# 1. Regex bóc tách mã Hex từ nội dung chuyển khoản
prefix = settings.NAME_WEB + "NAPTOKEN"
pattern = rf"{prefix}([A-Fa-f0-9]+)"

def check_sepay_transactions(payment_record):
    target_hex = encode_payment_id(payment_record['id'])
    
    # Gọi SePay API
    history = sepay_api.get_last_20_transactions()
    
    for tx in history:
        content = tx.get('content', '')
        amount = float(tx.get('amount_in', 0))
        
        # Kiểm tra nội dung chứa mã nạp
        match = re.search(pattern, content, re.IGNORECASE)
        if match:
            found_hex = match.group(1).upper()
            if found_hex == target_hex and amount >= payment_record['amount_vnd']:
                return True, tx.get('id') # Trùng khớp!
    return False, None
```

## 3. Quản lý trạng thái (State Machine)
- **`pending`**: Đang chờ tiền về.
- **`completed`**: Đã nhận đủ tiền, đã nạp token cho user.
- **`failed`**: Hóa đơn hết hạn (thường sau 60p) hoặc bị hủy.

**Lưu ý kỹ thuật**: Ngay cả khi hóa đơn ở trạng thái `failed`, nếu hệ thống quét thấy tiền về sau đó, nó vẫn có thể tự động chuyển sang `completed` và nạp tiền cho user (logic linh hoạt).

## 4. Bảo mật Token nạp (XOR Obfuscation)
Chúng tôi không dùng ID thuần (1, 2, 3...) để tránh việc người dùng đoán được ID của người khác.
```python
SECRET_XOR_KEY = 0x5EAFB # Thay đổi key này cho mỗi dự án

def encode_payment_id(p_id: int) -> str:
    return hex(p_id ^ SECRET_XOR_KEY)[2:].upper()

def decode_payment_id(hex_str: str) -> int:
    return int(hex_str, 16) ^ SECRET_XOR_KEY
```

## 5. Cấu hình SePay Dashboard
Để hệ thống hoạt động, bạn cần cấu hình tại [SePay.vn](https://sepay.vn):
1. Thêm ngân hàng (MB, Vietcombank...).
2. Cài App ngân hàng trên điện thoại (để SePay quét được thông báo biến động số dư).
3. Lấy API Key điền vào file `.env`.

---
*Ghi chú: Luồng Polling giúp hệ thống hoạt động tốt trên cả VPS localhost mà không cần mở Port/NAT/Domain (Webhook).*
