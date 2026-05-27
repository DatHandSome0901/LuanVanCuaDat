from datetime import date, datetime, timedelta
from random import Random
from typing import Optional
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.models.base_db import UserDB
from app.security.security import get_current_user


router = APIRouter(prefix="/qa", tags=["Q&A"])

VN_TZ = ZoneInfo("Asia/Ho_Chi_Minh")
DAILY_QUESTION_COUNT = 5
WEEKDAY_CHECKIN_REWARD = 2
SUNDAY_CHECKIN_REWARD = 5
STREAK_7_REWARD = 10
QUIZ_MILESTONES = (
    {"key": "quiz_correct_3", "target": 3, "amount": 1, "label": "Đúng 3 câu Q&A hôm nay"},
    {"key": "quiz_correct_5", "target": 5, "amount": 2, "label": "Hoàn thành 5 câu Q&A hôm nay"},
)


QUESTION_BANK = [
    {
        "id": "bach_dang_938",
        "era": "Ngô - Đinh - Tiền Lê",
        "difficulty": "easy",
        "question": "Ai là người lãnh đạo chiến thắng Bạch Đằng năm 938?",
        "options": ["Ngô Quyền", "Đinh Bộ Lĩnh", "Lê Hoàn", "Trần Hưng Đạo"],
        "correct": 0,
        "explanation": "Ngô Quyền đánh bại quân Nam Hán trên sông Bạch Đằng năm 938, mở đầu thời kỳ độc lập tự chủ lâu dài.",
    },
    {
        "id": "van_lang_capital",
        "era": "Văn Lang - Âu Lạc",
        "difficulty": "easy",
        "question": "Kinh đô của nước Văn Lang thường được nhắc đến là đâu?",
        "options": ["Phong Châu", "Cổ Loa", "Hoa Lư", "Thăng Long"],
        "correct": 0,
        "explanation": "Phong Châu, thuộc vùng Phú Thọ ngày nay, gắn với thời đại Hùng Vương và nước Văn Lang.",
    },
    {
        "id": "co_loa",
        "era": "Văn Lang - Âu Lạc",
        "difficulty": "easy",
        "question": "Thành Cổ Loa gắn với nhân vật lịch sử nào?",
        "options": ["An Dương Vương", "Lý Thường Kiệt", "Lê Lợi", "Quang Trung"],
        "correct": 0,
        "explanation": "An Dương Vương xây dựng nhà nước Âu Lạc và kinh đô Cổ Loa.",
    },
    {
        "id": "hai_ba_trung_40",
        "era": "Bắc thuộc",
        "difficulty": "easy",
        "question": "Cuộc khởi nghĩa Hai Bà Trưng bùng nổ vào năm nào?",
        "options": ["Năm 40", "Năm 248", "Năm 542", "Năm 722"],
        "correct": 0,
        "explanation": "Khởi nghĩa Hai Bà Trưng nổ ra năm 40, chống lại ách đô hộ của nhà Đông Hán.",
    },
    {
        "id": "ba_trieu",
        "era": "Bắc thuộc",
        "difficulty": "easy",
        "question": "Bà Triệu lãnh đạo cuộc khởi nghĩa chống quân nào vào thế kỷ III?",
        "options": ["Nhà Ngô", "Nhà Minh", "Nhà Tống", "Nhà Thanh"],
        "correct": 0,
        "explanation": "Bà Triệu khởi nghĩa năm 248, chống lại sự cai trị của nhà Ngô.",
    },
    {
        "id": "ly_bi_van_xuan",
        "era": "Bắc thuộc",
        "difficulty": "medium",
        "question": "Lý Bí đặt quốc hiệu nước ta là gì sau khi giành quyền tự chủ?",
        "options": ["Vạn Xuân", "Đại Cồ Việt", "Đại Việt", "Đại Ngu"],
        "correct": 0,
        "explanation": "Lý Bí lên ngôi Lý Nam Đế và đặt quốc hiệu là Vạn Xuân vào thế kỷ VI.",
    },
    {
        "id": "ding_bo_linh",
        "era": "Ngô - Đinh - Tiền Lê",
        "difficulty": "easy",
        "question": "Đinh Bộ Lĩnh nổi tiếng với công lao nào?",
        "options": ["Dẹp loạn 12 sứ quân", "Dời đô ra Thăng Long", "Đánh tan quân Thanh", "Soạn Hịch tướng sĩ"],
        "correct": 0,
        "explanation": "Đinh Bộ Lĩnh thống nhất đất nước sau thời loạn 12 sứ quân và lập nhà Đinh.",
    },
    {
        "id": "dai_co_viet",
        "era": "Ngô - Đinh - Tiền Lê",
        "difficulty": "easy",
        "question": "Quốc hiệu Đại Cồ Việt xuất hiện dưới triều đại nào?",
        "options": ["Nhà Đinh", "Nhà Lý", "Nhà Trần", "Nhà Nguyễn"],
        "correct": 0,
        "explanation": "Đinh Tiên Hoàng đặt quốc hiệu Đại Cồ Việt sau khi thống nhất đất nước.",
    },
    {
        "id": "le_hoan_tong_981",
        "era": "Ngô - Đinh - Tiền Lê",
        "difficulty": "medium",
        "question": "Lê Hoàn lãnh đạo cuộc kháng chiến chống quân Tống vào năm nào?",
        "options": ["981", "938", "1077", "1288"],
        "correct": 0,
        "explanation": "Năm 981, Lê Hoàn chỉ huy quân dân Đại Cồ Việt đánh bại cuộc xâm lược của nhà Tống.",
    },
    {
        "id": "ly_cong_uan_doi_do",
        "era": "Lý - Trần - Hồ",
        "difficulty": "easy",
        "question": "Lý Công Uẩn dời đô từ Hoa Lư ra Đại La vào năm nào?",
        "options": ["1010", "1009", "1075", "1226"],
        "correct": 0,
        "explanation": "Năm 1010, Lý Công Uẩn ban Chiếu dời đô và đổi tên Đại La thành Thăng Long.",
    },
    {
        "id": "ly_thuong_kiet",
        "era": "Lý - Trần - Hồ",
        "difficulty": "medium",
        "question": "Lý Thường Kiệt gắn với phòng tuyến chống Tống trên con sông nào?",
        "options": ["Sông Như Nguyệt", "Sông Bạch Đằng", "Sông Gianh", "Sông Hương"],
        "correct": 0,
        "explanation": "Phòng tuyến sông Như Nguyệt là điểm quyết chiến quan trọng trong kháng chiến chống Tống thế kỷ XI.",
    },
    {
        "id": "nam_quoc_son_ha",
        "era": "Lý - Trần - Hồ",
        "difficulty": "medium",
        "question": "Bài thơ 'Nam quốc sơn hà' thường gắn với cuộc kháng chiến chống quân nào?",
        "options": ["Quân Tống", "Quân Nguyên", "Quân Minh", "Quân Thanh"],
        "correct": 0,
        "explanation": "Bài thơ được truyền tụng trong bối cảnh kháng chiến chống Tống thời Lý.",
    },
    {
        "id": "tran_hung_dao",
        "era": "Lý - Trần - Hồ",
        "difficulty": "easy",
        "question": "Trần Hưng Đạo là vị tướng tiêu biểu trong các cuộc kháng chiến chống quân nào?",
        "options": ["Nguyên - Mông", "Minh", "Thanh", "Xiêm"],
        "correct": 0,
        "explanation": "Trần Hưng Đạo là tổng chỉ huy nổi bật trong ba lần kháng chiến chống Nguyên - Mông thời Trần.",
    },
    {
        "id": "bach_dang_1288",
        "era": "Lý - Trần - Hồ",
        "difficulty": "medium",
        "question": "Chiến thắng Bạch Đằng năm 1288 thuộc triều đại nào?",
        "options": ["Nhà Trần", "Nhà Lý", "Nhà Lê sơ", "Nhà Tây Sơn"],
        "correct": 0,
        "explanation": "Năm 1288, quân dân nhà Trần đánh bại quân Nguyên trên sông Bạch Đằng.",
    },
    {
        "id": "hoi_nghi_dien_hong",
        "era": "Lý - Trần - Hồ",
        "difficulty": "medium",
        "question": "Hội nghị Diên Hồng thể hiện tinh thần gì của thời Trần?",
        "options": ["Quyết tâm chống giặc ngoại xâm", "Cải cách ruộng đất", "Dời đô", "Mở khoa thi đầu tiên"],
        "correct": 0,
        "explanation": "Hội nghị Diên Hồng thể hiện ý chí đoàn kết toàn dân trong kháng chiến chống Nguyên - Mông.",
    },
    {
        "id": "ho_quy_ly",
        "era": "Lý - Trần - Hồ",
        "difficulty": "medium",
        "question": "Nhà Hồ đặt quốc hiệu nước ta là gì?",
        "options": ["Đại Ngu", "Đại Việt", "Vạn Xuân", "Đại Cồ Việt"],
        "correct": 0,
        "explanation": "Sau khi lập nhà Hồ, Hồ Quý Ly đặt quốc hiệu là Đại Ngu.",
    },
    {
        "id": "le_loi_lam_son",
        "era": "Lê sơ",
        "difficulty": "easy",
        "question": "Lê Lợi lãnh đạo cuộc khởi nghĩa nào chống quân Minh?",
        "options": ["Lam Sơn", "Tây Sơn", "Ba Đình", "Yên Thế"],
        "correct": 0,
        "explanation": "Khởi nghĩa Lam Sơn do Lê Lợi lãnh đạo, kết thúc bằng thắng lợi trước quân Minh.",
    },
    {
        "id": "nguyen_trai",
        "era": "Lê sơ",
        "difficulty": "medium",
        "question": "Nguyễn Trãi là tác giả văn kiện lịch sử nào?",
        "options": ["Bình Ngô đại cáo", "Chiếu dời đô", "Hịch tướng sĩ", "Hoàng Lê nhất thống chí"],
        "correct": 0,
        "explanation": "Bình Ngô đại cáo do Nguyễn Trãi thay Lê Lợi viết, tuyên bố thắng lợi kháng Minh.",
    },
    {
        "id": "le_thanh_tong_hong_duc",
        "era": "Lê sơ",
        "difficulty": "medium",
        "question": "Bộ luật Hồng Đức gắn với vị vua nào?",
        "options": ["Lê Thánh Tông", "Lê Lợi", "Lê Hoàn", "Lê Chiêu Thống"],
        "correct": 0,
        "explanation": "Bộ luật Hồng Đức là thành tựu lập pháp tiêu biểu dưới thời Lê Thánh Tông.",
    },
    {
        "id": "tay_son",
        "era": "Tây Sơn",
        "difficulty": "easy",
        "question": "Phong trào Tây Sơn gắn với ba anh em ở vùng nào?",
        "options": ["Bình Định", "Thanh Hóa", "Nghệ An", "Thăng Long"],
        "correct": 0,
        "explanation": "Phong trào Tây Sơn khởi phát ở vùng Tây Sơn, Bình Định.",
    },
    {
        "id": "quang_trung_1789",
        "era": "Tây Sơn",
        "difficulty": "easy",
        "question": "Quang Trung đại phá quân Thanh vào dịp nào năm 1789?",
        "options": ["Tết Kỷ Dậu", "Tết Mậu Thân", "Tết Canh Tý", "Tết Đinh Dậu"],
        "correct": 0,
        "explanation": "Chiến thắng Ngọc Hồi - Đống Đa diễn ra vào dịp Tết Kỷ Dậu năm 1789.",
    },
    {
        "id": "ngoc_hoi_dong_da",
        "era": "Tây Sơn",
        "difficulty": "medium",
        "question": "Chiến thắng Ngọc Hồi - Đống Đa là chiến thắng trước quân nào?",
        "options": ["Quân Thanh", "Quân Minh", "Quân Nguyên", "Quân Xiêm"],
        "correct": 0,
        "explanation": "Ngọc Hồi - Đống Đa là chiến thắng quyết định của Quang Trung trước quân Thanh.",
    },
    {
        "id": "rach_gam_xoai_mut",
        "era": "Tây Sơn",
        "difficulty": "medium",
        "question": "Trận Rạch Gầm - Xoài Mút năm 1785 là chiến thắng trước quân nào?",
        "options": ["Quân Xiêm", "Quân Thanh", "Quân Pháp", "Quân Minh"],
        "correct": 0,
        "explanation": "Nguyễn Huệ chỉ huy trận Rạch Gầm - Xoài Mút, đánh tan quân Xiêm ở Nam Bộ.",
    },
    {
        "id": "nha_nguyen_1802",
        "era": "Nhà Nguyễn",
        "difficulty": "easy",
        "question": "Nhà Nguyễn được thành lập năm 1802 bởi ai?",
        "options": ["Gia Long", "Minh Mạng", "Tự Đức", "Bảo Đại"],
        "correct": 0,
        "explanation": "Nguyễn Ánh lên ngôi Gia Long năm 1802, lập ra triều Nguyễn.",
    },
    {
        "id": "kinh_do_hue",
        "era": "Nhà Nguyễn",
        "difficulty": "easy",
        "question": "Kinh đô của triều Nguyễn đặt tại đâu?",
        "options": ["Huế", "Thăng Long", "Hoa Lư", "Cổ Loa"],
        "correct": 0,
        "explanation": "Triều Nguyễn chọn Huế làm kinh đô trong suốt thời gian tồn tại của vương triều.",
    },
    {
        "id": "phap_da_nang_1858",
        "era": "Pháp thuộc",
        "difficulty": "medium",
        "question": "Liên quân Pháp - Tây Ban Nha nổ súng xâm lược Việt Nam tại Đà Nẵng năm nào?",
        "options": ["1858", "1884", "1945", "1802"],
        "correct": 0,
        "explanation": "Ngày 1/9/1858, liên quân Pháp - Tây Ban Nha tấn công Đà Nẵng, mở đầu quá trình xâm lược Việt Nam.",
    },
    {
        "id": "can_vuong",
        "era": "Pháp thuộc",
        "difficulty": "medium",
        "question": "Phong trào Cần Vương cuối thế kỷ XIX nhằm mục tiêu chính nào?",
        "options": ["Chống Pháp, phò vua", "Dời đô", "Cải cách chữ viết", "Mở cửa thương mại"],
        "correct": 0,
        "explanation": "Phong trào Cần Vương kêu gọi sĩ phu và nhân dân chống Pháp, phò vua Hàm Nghi.",
    },
    {
        "id": "yen_the",
        "era": "Pháp thuộc",
        "difficulty": "medium",
        "question": "Khởi nghĩa Yên Thế gắn với thủ lĩnh nào?",
        "options": ["Hoàng Hoa Thám", "Phan Bội Châu", "Phan Châu Trinh", "Tôn Thất Thuyết"],
        "correct": 0,
        "explanation": "Hoàng Hoa Thám, còn gọi Đề Thám, là thủ lĩnh tiêu biểu của khởi nghĩa Yên Thế.",
    },
    {
        "id": "dang_cong_san_1930",
        "era": "Hiện đại",
        "difficulty": "easy",
        "question": "Đảng Cộng sản Việt Nam được thành lập vào năm nào?",
        "options": ["1930", "1945", "1954", "1975"],
        "correct": 0,
        "explanation": "Đảng Cộng sản Việt Nam được thành lập ngày 3/2/1930.",
    },
    {
        "id": "cach_mang_thang_tam",
        "era": "Hiện đại",
        "difficulty": "easy",
        "question": "Cách mạng Tháng Tám thành công vào năm nào?",
        "options": ["1945", "1930", "1954", "1975"],
        "correct": 0,
        "explanation": "Cách mạng Tháng Tám năm 1945 dẫn tới sự ra đời của nước Việt Nam Dân chủ Cộng hòa.",
    },
    {
        "id": "doc_lap_2_9",
        "era": "Hiện đại",
        "difficulty": "easy",
        "question": "Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập tại đâu ngày 2/9/1945?",
        "options": ["Quảng trường Ba Đình", "Bến Nhà Rồng", "Điện Biên Phủ", "Dinh Độc Lập"],
        "correct": 0,
        "explanation": "Ngày 2/9/1945, Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập tại Quảng trường Ba Đình, Hà Nội.",
    },
    {
        "id": "dien_bien_phu_1954",
        "era": "Hiện đại",
        "difficulty": "medium",
        "question": "Chiến thắng Điện Biên Phủ diễn ra vào năm nào?",
        "options": ["1954", "1945", "1968", "1975"],
        "correct": 0,
        "explanation": "Chiến thắng Điện Biên Phủ năm 1954 kết thúc thắng lợi cuộc kháng chiến chống Pháp.",
    },
    {
        "id": "tong_tien_cong_1975",
        "era": "Hiện đại",
        "difficulty": "easy",
        "question": "Chiến dịch Hồ Chí Minh toàn thắng vào ngày nào?",
        "options": ["30/4/1975", "2/9/1945", "7/5/1954", "19/8/1945"],
        "correct": 0,
        "explanation": "Ngày 30/4/1975, Chiến dịch Hồ Chí Minh toàn thắng, đất nước thống nhất.",
    },
    # --- NEW ADDED QUESTIONS (EXPANDED BANK) ---
    {
        "id": "nam_de_544",
        "era": "Bắc thuộc",
        "difficulty": "medium",
        "question": "Lý Nam Đế lên ngôi Hoàng đế và lập ra nhà nước Vạn Xuân vào năm nào?",
        "options": ["544", "542", "602", "938"],
        "correct": 0,
        "explanation": "Năm 544, sau khi đánh đuổi quân đô hộ nhà Lương, Lý Bí lên ngôi Hoàng đế (Lý Nam Đế) và đặt tên nước là Vạn Xuân.",
    },
    {
        "id": "khuc_thua_du_905",
        "era": "Bắc thuộc",
        "difficulty": "medium",
        "question": "Ai là người giành lại quyền tự chủ cho đất nước từ tay nhà Đường vào năm 905?",
        "options": ["Khúc Thừa Dụ", "Khúc Hạo", "Khúc Thừa Mỹ", "Dương Đình Nghệ"],
        "correct": 0,
        "explanation": "Năm 905, nhân lúc nhà Đường suy yếu, Khúc Thừa Dụ đánh chiếm Tống Bình, tự xưng là Tiết độ sứ, giành lại quyền tự chủ.",
    },
    {
        "id": "le_chi_vien_1442",
        "era": "Lê sơ",
        "difficulty": "medium",
        "question": "Vụ án Lệ Chi Viên xảy ra vào năm 1442 gắn liền với cái chết oan uổng của danh nhân nào?",
        "options": ["Nguyễn Trãi", "Lê Lợi", "Trần Nguyên Hãn", "Phạm Văn Đồng"],
        "correct": 0,
        "explanation": "Vụ án Lệ Chi Viên (năm 1442) dẫn tới án tru di tam tộc oan uổng của Nguyễn Trãi và vợ là Nguyễn Thị Lộ.",
    },
    {
        "id": "ham_nghi_can_vuong",
        "era": "Pháp thuộc",
        "difficulty": "medium",
        "question": "Vị vua nào triều Nguyễn đã ban chiếu Cần Vương kêu gọi nhân dân kháng Pháp?",
        "options": ["Vua Hàm Nghi", "Vua Duy Tân", "Vua Thành Thái", "Vua Đồng Khánh"],
        "correct": 0,
        "explanation": "Năm 1885, sau khi rời kinh thành Huế, vua Hàm Nghi ban chiếu Cần Vương kêu gọi văn thân và nhân dân kháng chiến chống Pháp.",
    },
    {
        "id": "phan_boi_chau_dong_du",
        "era": "Pháp thuộc",
        "difficulty": "medium",
        "question": "Phong trào Đông Du đầu thế kỷ XX do nhà yêu nước nào khởi xướng?",
        "options": ["Phan Bội Châu", "Phan Châu Trinh", "Huỳnh Thúc Kháng", "Nguyễn Thái Học"],
        "correct": 0,
        "explanation": "Phong trào Đông Du (1905–1909) do Phan Bội Châu khởi xướng nhằm đưa thanh niên Việt Nam sang Nhật Bản học tập.",
    },
    {
        "id": "nguyen_ai_quoc_1919",
        "era": "Pháp thuộc",
        "difficulty": "hard",
        "question": "Năm 1919, Nguyễn Ái Quốc gửi Bản yêu sách của nhân dân An Nam tới hội nghị nào?",
        "options": ["Hội nghị Versailles", "Hội nghị Geneva", "Hội nghị Paris", "Hội nghị Yalta"],
        "correct": 0,
        "explanation": "Thay mặt Hội những người yêu nước An Nam, Nguyễn Ái Quốc gửi Bản yêu sách tới Hội nghị Hòa bình Versailles năm 1919.",
    },
    {
        "id": "mat_tran_viet_minh_1941",
        "era": "Hiện đại",
        "difficulty": "medium",
        "question": "Mặt trận Việt Nam Độc lập Đồng minh (Việt Minh) được thành lập vào năm nào?",
        "options": ["1941", "1930", "1945", "1954"],
        "correct": 0,
        "explanation": "Mặt trận Việt Minh được thành lập ngày 19/5/1941 tại Hội nghị Trung ương Đảng lần thứ 8 ở Pác Bó, Cao Bằng.",
    },
    {
        "id": "tran_phu_first_tbt",
        "era": "Hiện đại",
        "difficulty": "medium",
        "question": "Ai là Tổng Bí thư đầu tiên của Đảng Cộng sản Đông Dương?",
        "options": ["Trần Phú", "Nguyễn Văn Cừ", "Hà Huy Tập", "Trường Chinh"],
        "correct": 0,
        "explanation": "Đồng chí Trần Phú được bầu làm Tổng Bí thư đầu tiên của Đảng vào tháng 10 năm 1930.",
    },
    {
        "id": "vo_nguyen_giap_general",
        "era": "Hiện đại",
        "difficulty": "easy",
        "question": "Đại tướng nào là Tổng tư lệnh quân đội nhân dân Việt Nam trong chiến dịch Điện Biên Phủ?",
        "options": ["Võ Nguyên Giáp", "Văn Tiến Dũng", "Lê Trọng Tấn", "Nguyễn Chí Thanh"],
        "correct": 0,
        "explanation": "Đại tướng Võ Nguyên Giáp là tổng chỉ huy chiến dịch Điện Biên Phủ lừng lẫy năm 1954.",
    },
    {
        "id": "kim_dong_leader",
        "era": "Hiện đại",
        "difficulty": "easy",
        "question": "Ai là người đội trưởng đầu tiên của Đội Thiếu niên Tiền phong Hồ Chí Minh?",
        "options": ["Kim Đồng", "Vừa A Dính", "Lê Văn Tám", "Kơ-pa Kơ-lơng"],
        "correct": 0,
        "explanation": "Nông Văn Dền (bí danh Kim Đồng) là người đội trưởng đầu tiên của Đội cứu quốc lập ngày 15/5/1941.",
    },
    {
        "id": "hiep_dinh_paris_1973",
        "era": "Hiện đại",
        "difficulty": "medium",
        "question": "Hiệp định Paris về chấm dứt chiến tranh, lập lại hòa bình ở Việt Nam được ký vào năm nào?",
        "options": ["1973", "1972", "1975", "1954"],
        "correct": 0,
        "explanation": "Hiệp định Paris được ký kết ngày 27/1/1973, buộc quân đội Mỹ phải rút hoàn toàn khỏi Việt Nam.",
    },
    {
        "id": "vua_bao_dai_last",
        "era": "Nhà Nguyễn",
        "difficulty": "easy",
        "question": "Ai là vị hoàng đế cuối cùng của các triều đại phong kiến Việt Nam?",
        "options": ["Vua Bảo Đại", "Vua Khải Định", "Vua Tự Đức", "Vua Hàm Nghi"],
        "correct": 0,
        "explanation": "Vua Bảo Đại thoái vị vào ngày 30/8/1945, chấm dứt triều đại nhà Nguyễn và chế độ phong kiến Việt Nam.",
    },
    {
        "id": "tran_nhan_tong_zen",
        "era": "Lý - Trần - Hồ",
        "difficulty": "medium",
        "question": "Vị hoàng đế nào nhà Trần đã sáng lập ra Thiền phái Trúc Lâm Yên Tử?",
        "options": ["Trần Nhân Tông", "Trần Thái Tông", "Trần Thánh Tông", "Trần Anh Tông"],
        "correct": 0,
        "explanation": "Sau khi nhường ngôi, Trần Nhân Tông xuất gia tu hành tại núi Yên Tử và sáng lập ra Thiền phái Trúc Lâm.",
    },
    {
        "id": "le_loi_lake_sword",
        "era": "Lê sơ",
        "difficulty": "easy",
        "question": "Truyền thuyết về vua Lê Lợi trả lại gươm thần cho Rùa vàng gắn liền với địa danh nào?",
        "options": ["Hồ Gươm (Hồ Hoàn Kiếm)", "Hồ Tây", "Hồ Ba Bể", "Hồ Trị An"],
        "correct": 0,
        "explanation": "Sự tích Hồ Gươm gắn với việc Lê Lợi trả gươm Thuận Thiên sau khi đánh đuổi giặc Minh xâm lược.",
    },
    {
        "id": "binh_thu_yeu_luoc_author",
        "era": "Lý - Trần - Hồ",
        "difficulty": "medium",
        "question": "Tác phẩm quân sự nổi tiếng 'Binh thư yếu lược' do ai biên soạn?",
        "options": ["Trần Hưng Đạo", "Lý Thường Kiệt", "Lê Lợi", "Nguyễn Huệ"],
        "correct": 0,
        "explanation": "Binh thư yếu lược là cuốn sách binh pháp do Hưng Đạo Vương Trần Quốc Tuấn viết để huấn luyện quân sĩ.",
    },
    {
        "id": "ho_citadel_thanh_hoa",
        "era": "Lý - Trần - Hồ",
        "difficulty": "medium",
        "question": "Thành nhà Hồ (Thành Tây Đô) do Hồ Quý Ly xây dựng nằm ở tỉnh nào hiện nay?",
        "options": ["Thanh Hóa", "Nghệ An", "Ninh Bình", "Hà Tĩnh"],
        "correct": 0,
        "explanation": "Thành nhà Hồ, di sản văn hóa thế giới được xây dựng vào năm 1397, nằm tại huyện Vĩnh Lộc, Thanh Hóa.",
    },
    {
        "id": "quang_trung_up_1788",
        "era": "Tây Sơn",
        "difficulty": "medium",
        "question": "Nguyễn Huệ chính thức lên ngôi hoàng đế, lấy niên hiệu là Quang Trung vào năm nào?",
        "options": ["1788", "1789", "1785", "1802"],
        "correct": 0,
        "explanation": "Tháng 12 năm 1788, Nguyễn Huệ lên ngôi hoàng đế tại Núi Bân (Huế) để danh chính ngôn thuận tiến quân ra Bắc phá quân Thanh.",
    },
    {
        "id": "dong_kinh_nghia_thuc_1907",
        "era": "Pháp thuộc",
        "difficulty": "hard",
        "question": "Trường Đông Kinh Nghĩa Thục, phong trào giáo dục yêu nước cải cách, thành lập vào năm nào?",
        "options": ["1907", "1905", "1911", "1919"],
        "correct": 0,
        "explanation": "Đông Kinh Nghĩa Thục được sáng lập vào tháng 3/1907 bởi các sĩ phu yêu nước đứng đầu là Lương Văn Can, Nguyễn Quyền.",
    },
    {
        "id": "xo_viet_nghe_tinh_period",
        "era": "Hiện đại",
        "difficulty": "medium",
        "question": "Phong trào cách mạng Xô Viết Nghệ Tĩnh diễn ra trong giai đoạn nào?",
        "options": ["1930 - 1931", "1936 - 1939", "1940 - 1941", "1945"],
        "correct": 0,
        "explanation": "Phong trào Xô Viết Nghệ Tĩnh là đỉnh cao cách mạng nước ta giai đoạn 1930–1931 chống lại thực dân Pháp.",
    },
    {
        "id": "nam_ky_flag_1940",
        "era": "Hiện đại",
        "difficulty": "hard",
        "question": "Cuộc khởi nghĩa nào năm 1940 xuất hiện lá cờ đỏ sao vàng lần đầu tiên?",
        "options": ["Khởi nghĩa Nam Kỳ", "Khởi nghĩa Bắc Sơn", "Binh biến Đô Lương", "Khởi nghĩa Lam Sơn"],
        "correct": 0,
        "explanation": "Lá cờ đỏ sao vàng năm cánh xuất hiện lần đầu tiên trong cuộc Khởi nghĩa Nam Kỳ nổ ra ngày 23/11/1940.",
    },
    {
        "id": "phan_chau_trinh_duy_tan",
        "era": "Pháp thuộc",
        "difficulty": "medium",
        "question": "Phong trào Duy Tân ở Trung Kỳ đầu thế kỷ XX do nhà yêu nước nào khởi xướng?",
        "options": ["Phan Châu Trinh", "Phan Bội Châu", "Nguyễn Thái Học", "Hoàng Hoa Thám"],
        "correct": 0,
        "explanation": "Phong trào Duy Tân (1906–1908) với khẩu hiệu 'Khai dân trí, chấn dân khí, hậu dân sinh' do Phan Châu Trinh dẫn đầu.",
    },
    {
        "id": "gia_long_hoang_sa",
        "era": "Nhà Nguyễn",
        "difficulty": "hard",
        "question": "Vua Gia Long củng cố chủ quyền trên hai quần đảo Hoàng Sa và Trường Sa bằng hành động nào?",
        "options": ["Cắm cờ chủ quyền và lập đội Hoàng Sa", "Ký hiệp ước với Pháp", "Đặt phủ thừa tuyên", "Mua lại từ thương nhân nước ngoài"],
        "correct": 0,
        "explanation": "Nhà Nguyễn từ thời Gia Long đã củng cố việc ghi nhận cương vực, cử hải đội Hoàng Sa đo đạc, cắm cờ xác lập chủ quyền liên tục.",
    },
    {
        "id": "le_van_huu_history",
        "era": "Lý - Trần - Hồ",
        "difficulty": "hard",
        "question": "Ai là tác giả của 'Đại Việt sử ký', bộ quốc sử đầu tiên của nước ta biên soạn thời nhà Trần?",
        "options": ["Lê Văn Hưu", "Ngô Sĩ Liên", "Phan Phu Tiên", "Trần Trọng Kim"],
        "correct": 0,
        "explanation": "Nhà sử học Lê Văn Hưu hoàn thành bộ quốc sử đầu tiên 'Đại Việt sử ký' gồm 30 quyển vào năm 1272 dâng lên vua Trần Thánh Tông.",
    },
    {
        "id": "y_lan_regent",
        "era": "Lý - Trần - Hồ",
        "difficulty": "hard",
        "question": "Nguyên phi nào triều Lý nổi tiếng với hai lần nhiếp chính giúp đất nước thanh bình?",
        "options": ["Nguyên phi Ỷ Lan", "Hoàng hậu Chiêu Thánh", "Dương Vân Nga", "Ỷ Lan phu nhân"],
        "correct": 0,
        "explanation": "Nguyên phi Ỷ Lan hai lần nhiếp chính thay vua Lý Thánh Tông đi chinh phạt và khi Lý Nhân Tông còn nhỏ tuổi.",
    },
    {
        "id": "chu_van_an_teacher",
        "era": "Lý - Trần - Hồ",
        "difficulty": "medium",
        "question": "Thầy giáo Chu Văn An dưới thời Trần được tôn vinh với danh hiệu cao quý nào?",
        "options": ["Vạn thế sư biểu", "Trạng nguyên sư biểu", "Tể tướng học đường", "Khai quốc công thần"],
        "correct": 0,
        "explanation": "Chu Văn An là nhà sư phạm lỗi lạc, được suy tôn là 'Vạn thế sư biểu' (người thầy của muôn đời) của Việt Nam.",
    },
    {
        "id": "nguyen_hien_youngest",
        "era": "Lý - Trần - Hồ",
        "difficulty": "hard",
        "question": "Ai là vị Trạng nguyên trẻ tuổi nhất trong lịch sử khoa bảng Việt Nam (đỗ Trạng nguyên năm 12 tuổi)?",
        "options": ["Nguyễn Hiền", "Lương Thế Vinh", "Mạc Đĩnh Chi", "Lê Văn Hưu"],
        "correct": 0,
        "explanation": "Nguyễn Hiền đỗ Trạng nguyên năm Đinh Mùi (1247) dưới triều vua Trần Thái Tông khi mới chỉ 12 tuổi.",
    }
]


class AnswerPayload(BaseModel):
    question_key: str
    selected_index: int
    question_date: Optional[str] = None


def _today() -> date:
    return datetime.now(VN_TZ).date()


def _question_public(question: dict) -> dict:
    return {
        "id": question["id"],
        "question_key": question["id"],
        "question": question["question"],
        "options": question["options"],
        "era": question["era"],
        "difficulty": question["difficulty"],
    }


def _daily_questions(db: UserDB, user_id: int, question_date: date) -> list[dict]:
    # 1. Tìm tất cả các câu hỏi đã trả lời trước ngày hôm nay
    db.cursor.execute(
        "SELECT DISTINCT question_key FROM qa_answers WHERE user_id = ? AND question_date < ?",
        (user_id, question_date.isoformat())
    )
    answered_before = {row["question_key"] for row in db.cursor.fetchall()}

    # 2. Lọc ra các câu hỏi chưa từng làm
    available = [q for q in QUESTION_BANK if q["id"] not in answered_before]

    # Nếu sắp hết câu hỏi mới (còn lại ít hơn 5 câu), cho phép lặp lại toàn bộ ngân hàng câu hỏi
    if len(available) < DAILY_QUESTION_COUNT:
        available = QUESTION_BANK

    # 3. Sử dụng seed để đảo ngẫu nhiên và chọn ra 5 câu cho ngày hôm nay
    rng = Random(f"{question_date.isoformat()}:{user_id}:su-viet-qa")
    bank = available.copy()
    rng.shuffle(bank)
    questions = []

    for raw_question in bank[:DAILY_QUESTION_COUNT]:
        question = raw_question.copy()
        option_pairs = list(enumerate(raw_question["options"]))
        rng.shuffle(option_pairs)
        question["options"] = [option for _, option in option_pairs]
        question["correct"] = next(
            index for index, (original_index, _) in enumerate(option_pairs)
            if original_index == raw_question["correct"]
        )
        questions.append(question)

    return questions


def _get_question_for_user(db: UserDB, user_id: int, question_date: date, question_key: str) -> Optional[dict]:
    for question in _daily_questions(db, user_id, question_date):
        if question["id"] == question_key:
            return question
    return None


def _get_balance(db: UserDB, user_id: int) -> float:
    db.cursor.execute("SELECT token_balance FROM users WHERE id = ?", (user_id,))
    row = db.cursor.fetchone()
    return float(row["token_balance"]) if row else 0.0


def _correct_count(db: UserDB, user_id: int, reward_date: str) -> int:
    db.cursor.execute(
        """
        SELECT COUNT(*) AS total
        FROM qa_answers
        WHERE user_id = ? AND question_date = ? AND is_correct = 1
        """,
        (user_id, reward_date),
    )
    row = db.cursor.fetchone()
    return int(row["total"] if row else 0)


def _answered_map(db: UserDB, user_id: int, question_date: str) -> dict[str, dict]:
    db.cursor.execute(
        """
        SELECT question_key, selected_index, is_correct
        FROM qa_answers
        WHERE user_id = ? AND question_date = ?
        """,
        (user_id, question_date),
    )
    return {row["question_key"]: dict(row) for row in db.cursor.fetchall()}


def _reward_exists(db: UserDB, user_id: int, reward_date: str, reward_key: str) -> bool:
    db.cursor.execute(
        """
        SELECT 1 FROM qa_rewards
        WHERE user_id = ? AND reward_date = ? AND reward_key = ?
        LIMIT 1
        """,
        (user_id, reward_date, reward_key),
    )
    return db.cursor.fetchone() is not None


def _record_reward(db: UserDB, user_id: int, reward_date: str, reward_key: str, amount: float) -> bool:
    try:
        db.cursor.execute(
            """
            INSERT INTO qa_rewards (user_id, reward_date, reward_key, amount)
            VALUES (?, ?, ?, ?)
            """,
            (user_id, reward_date, reward_key, amount),
        )
        db.conn.commit()
        return True
    except Exception:
        return False


def _grant_reward(db: UserDB, user_id: int, reward_date: str, reward_key: str, amount: float, description: str) -> Optional[dict]:
    if _reward_exists(db, user_id, reward_date, reward_key):
        return None

    if not _record_reward(db, user_id, reward_date, reward_key, amount):
        return None

    new_balance = db.change_token_balance(user_id, amount, description, "in")
    return {
        "key": reward_key,
        "amount": amount,
        "description": description,
        "new_balance": new_balance,
    }


def _grant_quiz_milestones(db: UserDB, user_id: int, reward_date: str) -> list[dict]:
    correct = _correct_count(db, user_id, reward_date)
    rewards = []
    for milestone in QUIZ_MILESTONES:
        if correct >= milestone["target"]:
            reward = _grant_reward(
                db,
                user_id,
                reward_date,
                milestone["key"],
                milestone["amount"],
                f"Q&A Sử Việt: {milestone['label']} (+{milestone['amount']} token)",
            )
            if reward:
                rewards.append(reward)
    return rewards


def _current_streak(db: UserDB, user_id: int, today: date) -> int:
    db.cursor.execute(
        """
        SELECT checkin_date, streak_count
        FROM qa_checkins
        WHERE user_id = ? AND checkin_date < ?
        ORDER BY checkin_date DESC
        LIMIT 1
        """,
        (user_id, today.isoformat()),
    )
    row = db.cursor.fetchone()
    if not row:
        return 1

    previous_date = date.fromisoformat(row["checkin_date"])
    if previous_date == today - timedelta(days=1):
        return int(row["streak_count"]) + 1
    return 1


def _status_payload(db: UserDB, user_id: int) -> dict:
    today = _today()
    today_key = today.isoformat()
    is_sunday = today.weekday() == 6
    answered = _answered_map(db, user_id, today_key)
    correct_today = sum(1 for answer in answered.values() if int(answer["is_correct"]) == 1)

    db.cursor.execute(
        "SELECT * FROM qa_checkins WHERE user_id = ? AND checkin_date = ?",
        (user_id, today_key),
    )
    checkin = db.cursor.fetchone()

    db.cursor.execute(
        """
        SELECT reward_key, amount
        FROM qa_rewards
        WHERE user_id = ? AND reward_date = ?
        """,
        (user_id, today_key),
    )
    rewards_claimed = [dict(row) for row in db.cursor.fetchall()]

    db.cursor.execute(
        """
        SELECT checkin_date, streak_count
        FROM qa_checkins
        WHERE user_id = ?
        ORDER BY checkin_date DESC
        LIMIT 1
        """,
        (user_id,),
    )
    latest_streak = db.cursor.fetchone()

    return {
        "today": today_key,
        "is_sunday": is_sunday,
        "checkin": {
            "claimed": checkin is not None,
            "reward_today": SUNDAY_CHECKIN_REWARD if is_sunday else WEEKDAY_CHECKIN_REWARD,
            "streak_count": int(checkin["streak_count"]) if checkin else (int(latest_streak["streak_count"]) if latest_streak else 0),
        },
        "quiz": {
            "total_today": DAILY_QUESTION_COUNT,
            "answered_today": len(answered),
            "correct_today": correct_today,
            "milestones": QUIZ_MILESTONES,
            "rewards_claimed": rewards_claimed,
        },
        "token_balance": _get_balance(db, user_id),
    }


@router.get("/status")
def get_qa_status(user=Depends(get_current_user)):
    db = UserDB()
    try:
        return _status_payload(db, user["id"])
    finally:
        db.close()


@router.post("/checkin")
def claim_daily_checkin(user=Depends(get_current_user)):
    db = UserDB()
    try:
        today = _today()
        today_key = today.isoformat()
        db.cursor.execute(
            "SELECT * FROM qa_checkins WHERE user_id = ? AND checkin_date = ?",
            (user["id"], today_key),
        )
        existing = db.cursor.fetchone()
        if existing:
            return {
                "claimed": True,
                "message": "Bạn đã điểm danh hôm nay rồi.",
                "awards": [],
                "status": _status_payload(db, user["id"]),
            }

        reward_amount = SUNDAY_CHECKIN_REWARD if today.weekday() == 6 else WEEKDAY_CHECKIN_REWARD
        streak = _current_streak(db, user["id"], today)

        db.cursor.execute(
            """
            INSERT INTO qa_checkins (user_id, checkin_date, reward_amount, streak_count)
            VALUES (?, ?, ?, ?)
            """,
            (user["id"], today_key, reward_amount, streak),
        )
        db.conn.commit()

        awards = []
        new_balance = db.change_token_balance(
            user["id"],
            reward_amount,
            f"Điểm danh Sử Việt ngày {today_key} (+{reward_amount} token)",
            "in",
        )
        awards.append({
            "key": "daily_checkin",
            "amount": reward_amount,
            "description": "Điểm danh hằng ngày",
            "new_balance": new_balance,
        })

        if streak > 0 and streak % 7 == 0:
            streak_reward = _grant_reward(
                db,
                user["id"],
                today_key,
                f"streak_{streak}",
                STREAK_7_REWARD,
                f"Q&A Sử Việt: chuỗi điểm danh {streak} ngày (+{STREAK_7_REWARD} token)",
            )
            if streak_reward:
                awards.append(streak_reward)

        return {
            "claimed": True,
            "message": "Điểm danh thành công.",
            "awards": awards,
            "status": _status_payload(db, user["id"]),
        }
    finally:
        db.close()


@router.get("/questions")
def get_daily_questions(user=Depends(get_current_user)):
    db = UserDB()
    try:
        today = _today()
        today_key = today.isoformat()
        answered = _answered_map(db, user["id"], today_key)
        questions = []

        for question in _daily_questions(db, user["id"], today):
            public_question = _question_public(question)
            answer = answered.get(question["id"])
            if answer:
                public_question.update({
                    "answered": True,
                    "selected_index": int(answer["selected_index"]),
                    "is_correct": bool(answer["is_correct"]),
                    "correct_answer_index": question["correct"],
                    "explanation": question["explanation"],
                })
            else:
                public_question["answered"] = False
            questions.append(public_question)

        return {
            "question_date": today_key,
            "questions": questions,
            "status": _status_payload(db, user["id"]),
        }
    finally:
        db.close()


@router.post("/answer")
def answer_question(payload: AnswerPayload, user=Depends(get_current_user)):
    db = UserDB()
    try:
        question_date = date.fromisoformat(payload.question_date) if payload.question_date else _today()
        today = _today()
        if question_date != today:
            raise HTTPException(status_code=400, detail="Chỉ nhận thưởng cho bộ câu hỏi hôm nay.")

        question = _get_question_for_user(db, user["id"], question_date, payload.question_key)
        if not question:
            raise HTTPException(status_code=404, detail="Câu hỏi không thuộc thử thách hôm nay.")

        if payload.selected_index < 0 or payload.selected_index >= len(question["options"]):
            raise HTTPException(status_code=400, detail="Đáp án không hợp lệ.")

        question_date_key = question_date.isoformat()
        db.cursor.execute(
            """
            SELECT * FROM qa_answers
            WHERE user_id = ? AND question_date = ? AND question_key = ?
            """,
            (user["id"], question_date_key, question["id"]),
        )
        existing = db.cursor.fetchone()

        if existing:
            rewards = []
            is_correct = bool(existing["is_correct"])
            selected_index = int(existing["selected_index"])
        else:
            selected_index = payload.selected_index
            is_correct = selected_index == question["correct"]
            db.cursor.execute(
                """
                INSERT INTO qa_answers (user_id, question_date, question_key, selected_index, is_correct)
                VALUES (?, ?, ?, ?, ?)
                """,
                (user["id"], question_date_key, question["id"], selected_index, 1 if is_correct else 0),
            )
            db.conn.commit()
            rewards = _grant_quiz_milestones(db, user["id"], question_date_key) if is_correct else []

        return {
            "question_key": question["id"],
            "selected_index": selected_index,
            "is_correct": is_correct,
            "correct_answer_index": question["correct"],
            "explanation": question["explanation"],
            "rewards": rewards,
            "status": _status_payload(db, user["id"]),
            "new_balance": _get_balance(db, user["id"]),
        }
    finally:
        db.close()


@router.get("/leaderboard")
def get_qa_leaderboard(user=Depends(get_current_user)):
    db = UserDB()
    try:
        today = _today()
        # Find current week range (Monday to Sunday)
        current_monday = today - timedelta(days=today.weekday())
        current_sunday = current_monday + timedelta(days=6)
        
        # Last week range
        prev_monday = current_monday - timedelta(days=7)
        prev_sunday = prev_monday + timedelta(days=6)
        
        # Run distribution
        prev_week_key = f"weekly_leaderboard_{prev_monday.isoformat()}"
        db.cursor.execute(
            "SELECT 1 FROM qa_rewards WHERE reward_key LIKE ? LIMIT 1",
            (f"{prev_week_key}%",)
        )
        if db.cursor.fetchone() is None:
            # Let's find top 3 of last week
            db.cursor.execute(
                """
                SELECT 
                    a.user_id,
                    COUNT(*) as correct_count,
                    MAX(a.created_at) as last_correct_time
                FROM qa_answers a
                WHERE a.is_correct = 1
                  AND a.question_date >= ?
                  AND a.question_date <= ?
                GROUP BY a.user_id
                ORDER BY correct_count DESC, last_correct_time ASC
                LIMIT 3
                """,
                (prev_monday.isoformat(), prev_sunday.isoformat())
            )
            winners = db.cursor.fetchall()
            
            rewards = [5.0, 3.0, 1.0]
            for idx, r_win in enumerate(winners):
                win_user_id = r_win["user_id"]
                amount = rewards[idx]
                rank = idx + 1
                reward_key = f"{prev_week_key}_rank_{rank}"
                
                # Check duplication
                db.cursor.execute(
                    "SELECT 1 FROM qa_rewards WHERE reward_key = ?",
                    (reward_key,)
                )
                if db.cursor.fetchone() is None:
                    db.cursor.execute(
                        """
                        INSERT INTO qa_rewards (user_id, reward_date, reward_key, amount)
                        VALUES (?, ?, ?, ?)
                        """,
                        (win_user_id, today.isoformat(), reward_key, amount)
                    )
                    db.change_token_balance(
                        win_user_id,
                        amount,
                        f"Đạt Top {rank} Bảng xếp hạng Tuần {prev_monday.isoformat()} (+{amount} token)",
                        "in"
                    )
            db.conn.commit()

        # 2. Get current week leaderboard
        db.cursor.execute(
            """
            SELECT 
                u.id as user_id,
                u.username,
                u.full_name,
                u.picture_url,
                COUNT(a.id) as correct_count
            FROM users u
            JOIN qa_answers a ON u.id = a.user_id AND a.is_correct = 1
            WHERE a.question_date >= ? AND a.question_date <= ?
            GROUP BY u.id
            ORDER BY correct_count DESC, MAX(a.created_at) ASC
            LIMIT 10
            """,
            (current_monday.isoformat(), current_sunday.isoformat())
        )
        rows = db.cursor.fetchall()
        current_board = []
        for idx, r in enumerate(rows):
            current_board.append({
                "rank": idx + 1,
                "user_id": r["user_id"],
                "username": r["username"],
                "full_name": r["full_name"],
                "picture_url": r["picture_url"],
                "correct_count": r["correct_count"]
            })

        # 3. Get last week's rewarded winners
        db.cursor.execute(
            """
            SELECT 
                r.user_id,
                r.reward_key,
                r.amount,
                u.username,
                u.full_name,
                u.picture_url
            FROM qa_rewards r
            JOIN users u ON r.user_id = u.id
            WHERE r.reward_key LIKE ?
            ORDER BY r.reward_key ASC
            """,
            (f"{prev_week_key}%",)
        )
        win_rows = db.cursor.fetchall()
        last_week_board = []
        for r in win_rows:
            try:
                rank = int(r["reward_key"].split("_rank_")[1])
            except Exception:
                rank = 1
            last_week_board.append({
                "rank": rank,
                "user_id": r["user_id"],
                "username": r["username"],
                "full_name": r["full_name"],
                "picture_url": r["picture_url"],
                "reward_amount": r["amount"]
            })

        return {
            "current_week": {
                "start_date": current_monday.isoformat(),
                "end_date": current_sunday.isoformat(),
                "board": current_board
            },
            "last_week": {
                "start_date": prev_monday.isoformat(),
                "end_date": prev_sunday.isoformat(),
                "board": last_week_board
            }
        }
    finally:
        db.close()

