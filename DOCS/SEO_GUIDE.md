# Kỹ thuật chuyên sâu: Quản lý SEO & Website Sync

Dự án này sử dụng một cơ chế đặc biệt để quản lý SEO: **Dynamic HTML Modification**. Thay vì chỉ render meta tags bằng Javascript (vốn không tốt cho SEO Bot của Facebook/Zalo), hệ thống thực hiện ghi trực tiếp vào file vật lý `index.html`.

## 1. Cơ chế Đồng bộ Hai chiều (Two-way Synchronization)

### A. Từ Database xuống File HTML (Push)
Khi Admin nhấn lưu, hệ thống thực hiện 2 việc:
1. Lưu vào bảng `settings` trong DB để lưu giữ cấu hình.
2. Dùng Regex để "phẫu thuật" file `frontend/index.html` và thay thế các giá trị cũ bằng giá trị mới.

**Mã nguồn xử lý (Backend):**
```python
# app/routers/admin.py
import re

def update_index_html_seo(site_title, description, keywords, author, favicon_url, logo_url):
    path = "frontend/index.html"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Thay đổi thẻ Title
    content = re.sub(r'<title>.*?</title>', f'<title>{site_title}</title>', content)

    # 2. Thay đổi các thẻ Meta (Name & Property)
    meta_maps = {
        "description": description,
        "keywords": keywords,
        "author": author,
        "og:title": site_title,
        "og:description": description,
        "twitter:title": site_title,
        "twitter:description": description
    }

    for key, value in meta_maps.items():
        # Regex tìm kiếm thẻ meta có name hoặc property tương ứng
        pattern = fr'<(meta\s+[^>]*?(?:name|property)=["\']{re.escape(key)}["\'][^>]*?content=)["\'].*?["\']([^>]*?)>'
        replacement = fr'<\1"{value}"\2>'
        content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)

    # 3. Thay đổi Favicon & Logo (Link tags)
    content = re.sub(r'<link\s+rel=["\']icon["\'][^>]*?href=["\'].*?["\']', f'<link rel="icon" href="{favicon_url}"', content)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
```

### B. Từ File HTML lên UI (Pull/Sync)
Nếu lập trình viên sửa `index.html` thủ công, Admin có thể nhấn nút **"Sync từ HTML"** để đưa các giá trị đó vào Database.
```python
def extract_seo_from_index_html():
    # Sử dụng Regex để trích xuất content từ meta tags
    # Trả về một dictionary để Frontend hiển thị lên Form
    title = re.search(r'<title>(.*?)</title>', content).group(1)
    # ... logic tương tự cho các meta tags ...
```

## 2. Quản lý Tài nguyên (Static Files)
Khi tải lên Logo hoặc Favicon, hệ thống thực hiện:
1. **Sanitize Filename**: Sử dụng `uuid.uuid4()` để tránh trùng tên và `os.path.basename()` để chống Path Traversal.
2. **Storage**: Lưu vào thư mục `utils/download/`.
3. **URL Mapping**: Trả về URL dạng `/api/v1/download/{filename}` để Frontend hiển thị.

## 3. SEO Checklist cho Lập trình viên
- **Thẻ Canonical**: Đảm bảo thẻ `<link rel="canonical" href="..." />` được cập nhật đúng domain production.
- **Thẻ Robot**: Kiểm tra thẻ `<meta name="robots" content="index, follow" />` không bị vô tình config thành `noindex`.
- **Dung lượng Logo**: Backend không nén ảnh, vì vậy hãy nhắc người dùng upload ảnh Logo < 500KB để tốc độ load trang và chia sẻ link nhanh nhất.

---
*Ghi chú: Luồng xử lý này giúp Website đạt điểm SEO tối ưu vì thông tin meta đã nằm sẵn trong HTML khi Server trả về, không phụ thuộc vào việc thực thi Javascript của Bot.*
