"""
viet_history_entities.py
========================
Từ điển trung tâm cho toàn bộ nhân vật / sự kiện / triều đại / địa danh
lịch sử Việt Nam.

Cấu trúc mỗi entry:
    "entity_key": {
        "display"          : Tên hiển thị chuẩn (có dấu)
        "aliases"          : Danh sách tên gọi khác / bí danh
        "related_keywords" : Từ khoá liên quan trực tiếp (địa danh, năm, sự kiện kèm theo)
        "anti_keywords"    : Từ khoá thuộc nhân vật/sự kiện KHÁC — dùng để phạt tài liệu lạc đề
        "period"           : Khoảng năm (start, end) để lọc temporal
    }

Để mở rộng: chỉ cần thêm entry mới vào VIET_HISTORY_ENTITIES.
Không cần sửa bất kỳ logic detect nào khác.
"""

from __future__ import annotations

VIET_HISTORY_ENTITIES: dict[str, dict] = {

    # ── NHÂN VẬT: THỜI BẮC THUỘC ──────────────────────────────────────

    "hai_ba_trung": {
        "display": "Hai Bà Trưng",
        "aliases": [
            "Hai Bà Trưng", "Trưng Trắc", "Trưng Nhị",
            "hai ba trung", "trung trac", "trung nhi",
            "Trưng Vương", "trung vuong",
        ],
        "related_keywords": [
            "Mê Linh", "me linh", "Hát Môn", "hat mon",
            "Mã Viện", "ma vien", "năm 40", "nam 40", "năm 43", "nam 43",
            "sông Hát", "song hat", "hy sinh", "tuẫn tiết",
            "khởi nghĩa Hai Bà Trưng", "kháng Hán",
        ],
        "anti_keywords": [
            "quang trung", "nguyen hue", "tay son", "ngo quyen",
            "tran hung dao", "le loi", "dinh bo linh",
        ],
        "period": (-43, 43),
    },

    "ba_trieu": {
        "display": "Bà Triệu",
        "aliases": [
            "Bà Triệu", "Triệu Thị Trinh", "ba trieu", "trieu thi trinh",
            "Triệu Trinh Nương", "trieu trinh nuong",
        ],
        "related_keywords": [
            "Cửu Chân", "cuu chan", "núi Nưa", "nui nua",
            "năm 248", "nam 248", "chống Ngô", "chong ngo",
        ],
        "anti_keywords": [
            "hai ba trung", "ngo quyen", "quang trung", "le loi",
        ],
        "period": (210, 248),
    },

    # ── NHÂN VẬT: CÁC TRIỀU ĐẠI ─────────────────────────────────────────

    "ngo_quyen": {
        "display": "Ngô Quyền",
        "aliases": [
            "Ngô Quyền", "ngo quyen", "Ngô Vương", "ngo vuong",
        ],
        "related_keywords": [
            "Bạch Đằng", "bach dang", "năm 938", "nam 938",
            "Kiều Công Tiễn", "kieu cong tien",
            "Hoằng Thao", "hoang thao", "Nam Hán", "nam han",
            "cọc gỗ", "coc go", "thủy triều", "thuy trieu",
        ],
        "anti_keywords": [
            "hai ba trung", "tran hung dao", "le loi", "quang trung",
            "1288", "nguyen mong",
        ],
        "period": (898, 944),
    },

    "dinh_bo_linh": {
        "display": "Đinh Bộ Lĩnh",
        "aliases": [
            "Đinh Bộ Lĩnh", "dinh bo linh",
            "Đinh Tiên Hoàng", "dinh tien hoang",
            "Vạn Thắng Vương", "van thang vuong",
        ],
        "related_keywords": [
            "Hoa Lư", "hoa lu", "12 sứ quân", "12 su quan",
            "Đại Cồ Việt", "dai co viet", "năm 968", "nam 968",
            "thống nhất", "thong nhat",
        ],
        "anti_keywords": [
            "le hoan", "ly thai to", "hai ba trung", "quang trung",
        ],
        "period": (924, 979),
    },

    "le_hoan": {
        "display": "Lê Hoàn",
        "aliases": [
            "Lê Hoàn", "le hoan", "Lê Đại Hành", "le dai hanh",
            "Tiền Lê", "tien le",
        ],
        "related_keywords": [
            "kháng Tống", "khang tong", "năm 981", "nam 981",
            "Bạch Đằng", "bach dang", "Chi Lăng", "chi lang",
            "Lê triều", "le trieu",
        ],
        "anti_keywords": [
            "ngo quyen", "dinh bo linh", "ly cong uan", "quang trung",
        ],
        "period": (941, 1005),
    },

    "ly_cong_uan": {
        "display": "Lý Công Uẩn",
        "aliases": [
            "Lý Công Uẩn", "ly cong uan",
            "Lý Thái Tổ", "ly thai to",
            "nhà Lý", "nha ly",
        ],
        "related_keywords": [
            "Thăng Long", "thang long", "Chiếu dời đô", "chieu doi do",
            "Đại Việt", "dai viet", "năm 1009", "nam 1009",
        ],
        "anti_keywords": [
            "le hoan", "dinh bo linh", "tran hung dao", "quang trung",
        ],
        "period": (974, 1028),
    },

    "ly_thuong_kiet": {
        "display": "Lý Thường Kiệt",
        "aliases": [
            "Lý Thường Kiệt", "ly thuong kiet",
            "Lý Thường Kiệt tướng quân",
        ],
        "related_keywords": [
            "Nam quốc sơn hà", "nam quoc son ha",
            "Như Nguyệt", "nhu nguyet", "sông Như Nguyệt",
            "đánh Tống", "danh tong", "Ung Châu", "ung chau",
            "năm 1075", "nam 1075", "năm 1077", "nam 1077",
        ],
        "anti_keywords": [
            "tran hung dao", "ngo quyen", "le loi", "quang trung",
        ],
        "period": (1019, 1105),
    },

    "tran_hung_dao": {
        "display": "Trần Hưng Đạo",
        "aliases": [
            "Trần Hưng Đạo", "tran hung dao",
            "Trần Quốc Tuấn", "tran quoc tuan",
            "Hưng Đạo Đại Vương", "hung dao dai vuong",
            "Hưng Đạo Vương", "hung dao vuong",
        ],
        "related_keywords": [
            "kháng Nguyên Mông", "khang nguyen mong",
            "Nguyên Mông", "nguyen mong",
            "Bạch Đằng 1288", "bach dang 1288", "năm 1288",
            "Hịch tướng sĩ", "hich tuong si",
            "Binh thư yếu lược", "binh thu yeu luoc",
            "Vạn Kiếp", "van kiep",
            "nhà Trần", "nha tran", "triều Trần", "trieu tran", "Trần triều", "tran trieu",
        ],
        "anti_keywords": [
            "ngo quyen", "938", "ly thuong kiet", "le loi", "quang trung",
            "hai ba trung", "voi lua", "tay son",
        ],
        "period": (1228, 1300),
    },

    "tran_nhan_tong": {
        "display": "Trần Nhân Tông",
        "aliases": [
            "Trần Nhân Tông", "tran nhan tong",
            "Phật hoàng", "phat hoang",
            "Điều Ngự Giác Hoàng", "dieu ngu giac hoang",
        ],
        "related_keywords": [
            "Yên Tử", "yen tu", "Trúc Lâm", "truc lam",
            "Thiền phái Trúc Lâm", "thien phai truc lam",
            "nhà Trần", "nha tran", "kháng Nguyên", "khang nguyen",
        ],
        "anti_keywords": [
            "tran hung dao", "ly thuong kiet", "le loi", "quang trung",
        ],
        "period": (1258, 1308),
    },

    "ho_quy_ly": {
        "display": "Hồ Quý Ly",
        "aliases": [
            "Hồ Quý Ly", "ho quy ly",
            "nhà Hồ", "nha ho", "Hồ Hán Thương", "ho han thuong",
        ],
        "related_keywords": [
            "Tây Đô", "tay do", "cải cách Hồ Quý Ly", "canh tan",
            "năm 1400", "nam 1400", "Lam Kinh",
        ],
        "anti_keywords": [
            "le loi", "tran hung dao", "quang trung", "nguyen trai",
        ],
        "period": (1336, 1407),
    },

    "le_loi": {
        "display": "Lê Lợi",
        "aliases": [
            "Lê Lợi", "le loi",
            "Lê Thái Tổ", "le thai to",
            "Bình Định Vương", "binh dinh vuong",
        ],
        "related_keywords": [
            "Lam Sơn", "lam son", "khởi nghĩa Lam Sơn",
            "Nguyễn Trãi", "nguyen trai",
            "Liễu Thăng", "lieu thang", "Chi Lăng", "chi lang",
            "Đông Quan", "dong quan", "đuổi Minh", "duoi minh",
            "năm 1428", "nam 1428",
            "nhà Lê", "nha le", "Hậu Lê", "hau le",
            "nhà Minh", "nha minh", "triều Minh", "trieu minh",
        ],
        "anti_keywords": [
            "tran hung dao", "quang trung", "ho quy ly",
            "dinh bo linh", "hai ba trung",
        ],
        "period": (1385, 1433),
    },

    "nguyen_trai": {
        "display": "Nguyễn Trãi",
        "aliases": [
            "Nguyễn Trãi", "nguyen trai",
            "Ức Trai", "uc trai",
        ],
        "related_keywords": [
            "Bình Ngô đại cáo", "binh ngo dai cao",
            "Lệ Chi Viên", "le chi vien",
            "Lam Sơn", "lam son", "Lê Lợi", "le loi",
            "thơ Nôm", "tho nom",
        ],
        "anti_keywords": [
            "tran hung dao", "quang trung", "hai ba trung",
        ],
        "period": (1380, 1442),
    },

    "quang_trung": {
        "display": "Quang Trung",
        "aliases": [
            "Quang Trung", "quang trung",
            "Nguyễn Huệ", "nguyen hue",
            "Tây Sơn", "tay son",
            "vua Quang Trung", "vua quang trung",
        ],
        "related_keywords": [
            "Ngọc Hồi Đống Đa", "ngoc hoi dong da",
            "Đống Đa", "dong da", "Ngọc Hồi", "ngoc hoi",
            "Kỷ Dậu 1789", "ky dau 1789", "năm 1789", "nam 1789",
            "Sầm Nghi Đống", "sam nghi dong",
            "Tôn Sĩ Nghị", "ton si nghi",
            "đại phá quân Thanh", "dai pha quan thanh",
            "Rạch Gầm Xoài Mút", "rach gam xoai mut",
        ],
        "anti_keywords": [
            "hai ba trung", "tran hung dao", "le loi", "ngo quyen",
            "dinh bo linh", "ly thuong kiet",
        ],
        "period": (1753, 1792),
    },

    "nguyen_anh": {
        "display": "Nguyễn Ánh",
        "aliases": [
            "Nguyễn Ánh", "nguyen anh",
            "Gia Long", "gia long",
            "nhà Nguyễn", "nha nguyen",
        ],
        "related_keywords": [
            "thống nhất", "Phú Xuân", "phu xuan",
            "Huế", "hue", "năm 1802", "nam 1802",
            "Pháp", "Tây Sơn thất bại",
            "Tây Sơn", "tay son", "Nguyễn Huệ", "nguyen hue",
            "chúa Nguyễn", "chua nguyen", "Đàng Trong", "dang trong",
        ],
        "anti_keywords": [
            "quang trung", "tran hung dao", "le loi", "hai ba trung",
        ],
        "period": (1762, 1820),
    },

    "ho_chi_minh": {
        "display": "Hồ Chí Minh",
        "aliases": [
            "Hồ Chí Minh", "ho chi minh",
            "Nguyễn Ái Quốc", "nguyen ai quoc",
            "Bác Hồ", "bac ho",
            "Chủ tịch Hồ Chí Minh",
        ],
        "related_keywords": [
            "Cách mạng tháng Tám", "cach mang thang tam",
            "Tuyên ngôn Độc lập", "tuyen ngon doc lap",
            "năm 1945", "nam 1945",
            "Đảng Cộng sản", "dang cong san",
            "kháng chiến", "Việt Minh", "viet minh",
        ],
        "anti_keywords": [
            "quang trung", "le loi", "tran hung dao",
            "hai ba trung", "dinh bo linh",
        ],
        "period": (1890, 1969),
    },

    "vo_nguyen_giap": {
        "display": "Võ Nguyên Giáp",
        "aliases": [
            "Võ Nguyên Giáp", "vo nguyen giap",
            "Đại tướng Giáp", "dai tuong giap",
            "tướng Giáp", "tuong giap",
        ],
        "related_keywords": [
            "Điện Biên Phủ", "dien bien phu",
            "chiến dịch Điện Biên Phủ", "1954",
            "Pháp", "thực dân Pháp",
            "Quân đội nhân dân", "quan doi nhan dan",
        ],
        "anti_keywords": [
            "ho chi minh chính trị", "quang trung", "le loi",
        ],
        "period": (1911, 2013),
    },

    # ── SỰ KIỆN / CHIẾN DỊCH ───────────────────────────────────────────

    "cach_mang_thang_tam": {
        "display": "Cách mạng tháng Tám",
        "aliases": [
            "Cách mạng tháng Tám", "cach mang thang tam",
            "Cách mạng 1945", "cach mang 1945",
        ],
        "related_keywords": [
            "Tuyên ngôn Độc lập", "tuyen ngon doc lap",
            "Hồ Chí Minh", "ho chi minh",
            "Việt Minh", "viet minh", "năm 1945", "nam 1945",
            "giành chính quyền", "tháng 8 1945",
        ],
        "anti_keywords": [
            "dien bien phu", "quang trung", "tran hung dao",
        ],
        "period": (1945, 1945),
    },

    "tuyen_ngon_doc_lap": {
        "display": "Tuyên ngôn Độc lập 1945",
        "aliases": [
            "Tuyên ngôn Độc lập", "tuyen ngon doc lap",
            "Tuyên ngôn Độc lập 1945",
            "2/9/1945",
        ],
        "related_keywords": [
            "Hồ Chí Minh", "ho chi minh", "Quảng trường Ba Đình",
            "ba dinh", "ngày 2 tháng 9",
        ],
        "anti_keywords": [
            "binh ngo dai cao", "le loi", "nguyen trai",
        ],
        "period": (1945, 1945),
    },

    "dien_bien_phu": {
        "display": "Điện Biên Phủ",
        "aliases": [
            "Điện Biên Phủ", "dien bien phu",
            "chiến dịch Điện Biên Phủ",
            "trận Điện Biên Phủ",
        ],
        "related_keywords": [
            "Võ Nguyên Giáp", "vo nguyen giap",
            "Pháp", "thực dân Pháp", "năm 1954", "nam 1954",
            "Navarre", "De Castries",
            "kháng chiến chống Pháp",
        ],
        "anti_keywords": [
            "quang trung", "tran hung dao", "hai ba trung",
            "chien dich ho chi minh 1975",
        ],
        "period": (1954, 1954),
    },

    "chien_dich_ho_chi_minh": {
        "display": "Chiến dịch Hồ Chí Minh 1975",
        "aliases": [
            "Chiến dịch Hồ Chí Minh", "chien dich ho chi minh",
            "30/4/1975", "thống nhất 1975",
            "giải phóng miền Nam",
        ],
        "related_keywords": [
            "năm 1975", "nam 1975", "thống nhất đất nước",
            "Sài Gòn", "sai gon", "chiến thắng 30/4",
        ],
        "anti_keywords": [
            "dien bien phu", "quang trung", "tran hung dao",
            "hai ba trung",
        ],
        "period": (1975, 1975),
    },

    # ── TRIỀU ĐẠI ─────────────────────────────────────────────────────

    "nha_tran": {
        "display": "Nhà Trần",
        "aliases": [
            "nhà Trần", "nha tran", "triều Trần", "trieu tran",
            "Trần triều", "tran trieu",
        ],
        "related_keywords": [
            "kháng chiến chống Nguyên Mông", "khang chien chong nguyen mong",
            "Trần Hưng Đạo", "tran hung dao",
            "Bạch Đằng", "bach dang", "Đông A", "dong a",
            "1225", "1400",
        ],
        "anti_keywords": [
            "nha ly", "nha le", "nha nguyen", "tay son",
        ],
        "period": (1225, 1400),
    },

    "van_lang_au_lac": {
        "display": "Văn Lang - Âu Lạc",
        "aliases": [
            "Văn Lang", "van lang", "Âu Lạc", "au lac",
            "Hùng Vương", "hung vuong", "thời Hùng Vương",
        ],
        "related_keywords": [
            "Cổ Loa", "co loa", "An Dương Vương", "an duong vuong",
            "Lạc Việt", "lac viet", "Phong Châu", "phong chau",
            "Mỵ Châu Trọng Thủy", "my chau trong thuy",
        ],
        "anti_keywords": [
            "hai ba trung", "ngo quyen", "le loi",
        ],
        "period": (-2879, -179),
    },

    "tay_son": {
        "display": "Tây Sơn",
        "aliases": [
            "Tây Sơn", "tay son", "phong trào Tây Sơn",
            "khởi nghĩa Tây Sơn",
        ],
        "related_keywords": [
            "Nguyễn Huệ", "nguyen hue", "Quang Trung", "quang trung",
            "Quy Nhơn", "quy nhon", "Ngọc Hồi Đống Đa",
            "voi chiến", "voi lua",
        ],
        "anti_keywords": [
            "hai ba trung", "tran hung dao", "le loi",
            "ngo quyen", "dinh bo linh",
        ],
        "period": (1771, 1802),
    },
}


# ── UTILITY FUNCTIONS (không import ngoài để tránh circular) ──────────────

import re
import unicodedata


def _norm(text: str) -> str:
    """Normalize về ASCII lowercase để so sánh."""
    text = (text or "").replace("Đ", "D").replace("đ", "d")
    text = unicodedata.normalize("NFD", text.lower())
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    return re.sub(r"\s+", " ", text).strip()


def _build_alias_lookup() -> dict[str, str]:
    """Tạo bảng tra nhanh: normalized_alias → entity_key."""
    lookup: dict[str, str] = {}
    for key, info in VIET_HISTORY_ENTITIES.items():
        for alias in info["aliases"]:
            lookup[_norm(alias)] = key
    return lookup


# Singleton lookup table — chỉ build 1 lần khi module load
ALIAS_LOOKUP: dict[str, str] = _build_alias_lookup()


def detect_entity_from_text(text: str) -> tuple[str, dict] | tuple[None, None]:
    """
    Phát hiện entity chính trong text.

    Returns:
        (entity_key, entity_info) nếu tìm thấy
        (None, None) nếu không tìm thấy
    """
    norm_text = _norm(text)

    # Pass 1: exact alias match (dài nhất trước để tránh partial match)
    sorted_aliases = sorted(ALIAS_LOOKUP.keys(), key=len, reverse=True)
    for alias_norm in sorted_aliases:
        entity_key = ALIAS_LOOKUP[alias_norm]
        # Dùng word boundary để tránh "ba" match vào "bàn"
        if len(alias_norm) < 4:
            pattern = rf"\b{re.escape(alias_norm)}\b"
            if re.search(pattern, norm_text):
                return entity_key, VIET_HISTORY_ENTITIES[entity_key]
        else:
            if alias_norm in norm_text:
                return entity_key, VIET_HISTORY_ENTITIES[entity_key]

    # Pass 2: related_keywords match
    for key, info in VIET_HISTORY_ENTITIES.items():
        for kw in info.get("related_keywords", []):
            norm_kw = _norm(kw)
            if len(norm_kw) < 4:
                pattern = rf"\b{re.escape(norm_kw)}\b"
                if re.search(pattern, norm_text):
                    return key, info
            elif norm_kw in norm_text:
                return key, info

    return None, None


def entity_score_for_doc(doc_text: str, entity_key: str) -> float:
    """
    Tính điểm bonus/penalty cho một tài liệu dựa trên entity chính.

    Returns:
        > 0  : bonus (tài liệu chứa alias/keyword của entity)
        < 0  : penalty (tài liệu chứa anti_keywords của entity khác)
        0.0  : không có tín hiệu rõ
    """
    if not entity_key or entity_key not in VIET_HISTORY_ENTITIES:
        return 0.0

    info = VIET_HISTORY_ENTITIES[entity_key]
    norm_doc = _norm(doc_text)

    # Kiểm tra aliases
    for alias in info["aliases"]:
        norm_alias = _norm(alias)
        if len(norm_alias) < 4:
            if re.search(rf"\b{re.escape(norm_alias)}\b", norm_doc):
                return 0.35
        elif norm_alias in norm_doc:
            return 0.35

    # Kiểm tra related_keywords
    hits = 0
    for kw in info.get("related_keywords", []):
        norm_kw = _norm(kw)
        if len(norm_kw) < 4:
            if re.search(rf"\b{re.escape(norm_kw)}\b", norm_doc):
                hits += 1
        elif norm_kw in norm_doc:
            hits += 1
    if hits >= 2:
        return 0.20
    if hits == 1:
        return 0.10

    # Kiểm tra anti_keywords
    for anti in info.get("anti_keywords", []):
        norm_anti = _norm(anti)
        if norm_anti in norm_doc:
            return -0.40  # Phạt mạnh tài liệu lạc chủ đề

    return 0.0


def is_source_relevant_to_entity(source_title: str, source_content_preview: str,
                                  entity_key: str) -> bool:
    """
    Kiểm tra xem một nguồn có liên quan đến entity không.
    Dùng để lọc source trước khi hiển thị trên UI.
    """
    if not entity_key or entity_key not in VIET_HISTORY_ENTITIES:
        return True  # Không có entity → giữ lại

    info = VIET_HISTORY_ENTITIES[entity_key]
    combined = _norm(f"{source_title} {source_content_preview}")

    # Kiểm tra alias
    for alias in info["aliases"]:
        norm_alias = _norm(alias)
        if len(norm_alias) < 4:
            if re.search(rf"\b{re.escape(norm_alias)}\b", combined):
                return True
        elif norm_alias in combined:
            return True

    # Kiểm tra related_keywords
    for kw in info.get("related_keywords", []):
        norm_kw = _norm(kw)
        if len(norm_kw) < 4:
            if re.search(rf"\b{re.escape(norm_kw)}\b", combined):
                return True
        elif norm_kw in combined:
            return True

    # Kiểm tra anti_keywords: nếu chứa anti-keyword thì KHÔNG liên quan
    for anti in info.get("anti_keywords", []):
        norm_anti = _norm(anti)
        if norm_anti in combined:
            return False

    # Nếu không trùng cả alias/keyword, coi như không liên quan
    return False
