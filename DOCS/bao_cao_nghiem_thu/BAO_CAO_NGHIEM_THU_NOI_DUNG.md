# BỘ GIÁO DỤC VÀ ĐÀO TẠO

# TRƯỜNG ĐẠI HỌC NAM CẦN THƠ

## TRƯỜNG CÔNG NGHỆ KỸ THUẬT SỐ VÀ TRÍ TUỆ NHÂN TẠO

---

# BÁO CÁO TỔNG KẾT VÀ NGHIỆM THU ĐỀ TÀI

## HỆ THỐNG CHATBOT TRẢ LỜI VỀ LỊCH SỬ VIỆT NAM SỬ DỤNG TRÍ TUỆ NHÂN TẠO (AI)

**Chủ nhiệm đề tài:** Nguyễn Quốc Đạt  
**Lớp:** DH22KMT01 - Khóa 10  
**Giảng viên hướng dẫn:** TS. Ngô Hồ Anh Khôi  

**Thành viên thực hiện:**

1. Nguyễn Quốc Đạt - Chủ nhiệm đề tài.
2. Nguyễn Khoa Lam - Thành viên.
3. Hà Hoàng Phúc - Thành viên.
4. Lê Trí Khanh - Thành viên.
5. Phan Văn Thọ - Thành viên.

**Đơn vị chủ quản:** Trường Công nghệ Kỹ thuật số và Trí tuệ nhân tạo, Trường Đại học Nam Cần Thơ.  
**Thời gian thực hiện theo đề cương:** Từ ngày 01/03/2026 đến ngày 01/09/2026.  
**Dự toán kinh phí theo đề cương:** 10.000.000 đồng.  
**Địa điểm:** Cần Thơ, năm 2026.

---

# LỜI CAM ĐOAN

Nhóm thực hiện cam đoan nội dung báo cáo này phản ánh trung thực quá trình nghiên cứu, thiết kế, xây dựng và đánh giá hệ thống chatbot trả lời về Lịch sử Việt Nam sử dụng trí tuệ nhân tạo. Các kết quả thực nghiệm, số liệu vận hành và chức năng phần mềm được tổng hợp từ mã nguồn, cơ sở dữ liệu và bộ kết quả đánh giá tại thời điểm nghiệm thu. Những công trình, mô hình và tài liệu của các tác giả khác được tham khảo đều được trình bày trong phần tài liệu tham khảo.

Nhóm thực hiện chịu trách nhiệm về tính trung thực của nội dung báo cáo, đồng thời xác định rõ hệ thống được xây dựng với mục tiêu hỗ trợ học tập và tra cứu, không thay thế sách giáo khoa, giáo trình, tài liệu lưu trữ chính thức, ý kiến của giáo viên hoặc kết luận của các nhà nghiên cứu lịch sử.

# LỜI CẢM ƠN

Nhóm thực hiện xin trân trọng cảm ơn Ban Giám hiệu Trường Đại học Nam Cần Thơ, Trường Công nghệ Kỹ thuật số và Trí tuệ nhân tạo cùng quý thầy cô đã tạo điều kiện về chuyên môn và môi trường học tập để đề tài được triển khai. Đặc biệt, nhóm xin gửi lời cảm ơn sâu sắc đến TS. Ngô Hồ Anh Khôi đã định hướng nội dung nghiên cứu, góp ý về kiến trúc hệ thống, phương pháp Retrieval-Augmented Generation và quy trình đánh giá.

Nhóm cũng cảm ơn các thành viên đã phối hợp trong các công việc thu thập dữ liệu, xây dựng backend, phát triển giao diện web và di động, thiết kế kho tri thức, kiểm thử chức năng, xây dựng bộ câu hỏi đánh giá và hoàn thiện sản phẩm. Những góp ý từ người dùng thử là nguồn thông tin quan trọng để nhóm nhận diện hạn chế và tiếp tục cải tiến hệ thống.

# TÓM TẮT

Đề tài xây dựng một hệ thống chatbot chuyên biệt hỗ trợ hỏi đáp, học tập và tra cứu Lịch sử Việt Nam bằng ngôn ngữ tự nhiên. Thay vì để mô hình ngôn ngữ lớn trả lời hoàn toàn dựa trên tri thức tham số, hệ thống áp dụng kiến trúc Retrieval-Augmented Generation (RAG), trong đó câu hỏi được truy xuất trên kho tri thức lịch sử đã được chia đoạn, vector hóa và lưu trong FAISS. Các đoạn tài liệu ứng viên tiếp tục được tái xếp hạng theo ý định câu hỏi, độ phù hợp ngữ nghĩa, tính nhất quán thời gian, quan hệ nguyên nhân và thực thể lịch sử trước khi được dùng làm ngữ cảnh sinh câu trả lời.

Trên nền RAG, đề tài phát triển khung TALRAG (Self-Learning Temporal-Adaptive RAG) cho hỏi đáp Lịch sử Việt Nam. TALRAG kết hợp phân loại câu hỏi sự kiện, thời gian, nguyên nhân và so sánh; truy xuất đa nguồn từ kho tri thức chung, kho tri thức động, lịch sử toàn cục và kho RAG cá nhân; đánh giá tài liệu; bộ nhớ đệm ngữ nghĩa; xử lý câu hỏi nối tiếp; hỗ trợ tiếng Việt và tiếng Anh; tìm kiếm web khi thiếu dữ liệu; cùng cơ chế tri thức chờ duyệt và nạp lại vào FAISS sau xác thực. Cơ chế này giúp hệ thống mở rộng tri thức có kiểm soát thay vì tự động đưa mọi nội dung web vào kho tin cậy.

Sản phẩm được triển khai theo kiến trúc nhiều lớp. Backend sử dụng FastAPI và SQLite, cung cấp API xác thực JWT, Google OAuth, quản lý hội thoại, hỏi đáp theo luồng SSE, quản lý token, thanh toán VietQR/SePay, hỏi đáp luyện tập, hỗ trợ người dùng, quản trị và kiểm duyệt tri thức. Frontend sử dụng React, TypeScript và Vite, hỗ trợ giao diện song ngữ, trang giới thiệu, chat, lịch sử, hồ sơ, thanh toán, RAG cá nhân, trò chơi kiến thức, bảng xếp hạng và bảng điều khiển quản trị. Hệ thống có thể đóng gói Android bằng Capacitor; một lớp Flutter WebView cũng được xây dựng để tải ứng dụng web, lưu token và hỗ trợ luồng đăng nhập Google trên thiết bị di động.

Đánh giá khoa học được thực hiện trên 100 câu hỏi Lịch sử Việt Nam giai đoạn phong kiến 939-1945, gồm 40 câu dễ, 35 câu trung bình và 25 câu khó. TALRAG được so sánh với ItihashQA Baseline, NotebookLM, Gemini Gems và Custom GPT bằng bốn chỉ số RAGAS: Faithfulness, Answer Relevancy, Context Precision và Context Recall. Kết quả trung bình của TALRAG lần lượt là 0,4009; 0,4480; 0,1972 và 0,1433, với độ trễ trung bình 24,57 giây. So với ItihashQA Baseline, TALRAG cải thiện 186,9% về Answer Relevancy và cải thiện nhẹ Context Precision, nhưng còn thấp hơn về Faithfulness, Context Recall và tốc độ. Kết quả cho thấy cơ chế thích nghi có khả năng tạo câu trả lời tập trung hơn, đồng thời chỉ ra yêu cầu tiếp tục tối ưu truy xuất, độ bao phủ ngữ cảnh và độ trễ.

Tại thời điểm khảo sát nghiệm thu ngày 13/06/2026, cơ sở dữ liệu vận hành có 21 tài khoản, 607 hội thoại, 2.287 tin nhắn, 1.374 bản ghi hỏi đáp và 102 mục tri thức chờ duyệt/đã duyệt. Kho FAISS chứa 138.058 đoạn tri thức trong chỉ mục Vertex và 107.638 đoạn trong chỉ mục OpenAI. Kết quả build production của frontend chính và mini-game đều thành công; mã Python trong các module chính được kiểm tra cú pháp thành công; các phép thử phân loại ý định, điểm thời gian và điểm nhân quả cho kết quả đúng kỳ vọng.

**Từ khóa:** Chatbot Lịch sử Việt Nam; Retrieval-Augmented Generation; TALRAG; FAISS; mô hình ngôn ngữ lớn; truy xuất thích nghi; suy luận thời gian; tự học có kiểm duyệt; RAGAS.

# ABSTRACT

This project develops a domain-specific artificial intelligence chatbot for Vietnamese historical question answering, learning, and information retrieval. Instead of relying solely on the parametric knowledge of a large language model, the system adopts Retrieval-Augmented Generation. Historical documents are processed into text chunks, converted into embeddings, and indexed in FAISS. Retrieved candidates are subsequently reranked according to query intent, semantic relevance, temporal consistency, causal alignment, and historical entity relevance before answer generation.

The project introduces TALRAG, a self-learning temporal-adaptive RAG framework for Vietnamese historical question answering. TALRAG integrates intent classification, multi-source retrieval, document grading, semantic caching, conversational follow-up resolution, bilingual processing, web fallback, pending knowledge moderation, user feedback, administrator approval, and controlled FAISS ingestion. The complete product includes a FastAPI backend, SQLite operational storage, React/TypeScript frontend, Android packaging, personal RAG, payment and token management, learning quizzes, support chat, historical game content, and an administrative dashboard.

The framework is evaluated on a 100-question benchmark covering Vietnamese feudal history from 939 to 1945. The benchmark contains 40 easy, 35 medium, and 25 hard questions. RAGAS-based evaluation compares TALRAG with the ItihashQA baseline, NotebookLM, Gemini Gems, and Custom GPT. TALRAG obtains average scores of 0.4009 for Faithfulness, 0.4480 for Answer Relevancy, 0.1972 for Context Precision, and 0.1433 for Context Recall, with an average latency of 24.57 seconds. Compared with the reproducible ItihashQA baseline, TALRAG improves Answer Relevancy by 186.9% and slightly improves Context Precision, while still requiring further improvement in faithfulness, recall, and latency.

**Keywords:** Vietnamese historical chatbot; Retrieval-Augmented Generation; TALRAG; FAISS; large language models; temporal adaptive retrieval; human-in-the-loop learning; RAGAS.

# DANH MỤC TỪ VIẾT TẮT

| Từ viết tắt | Diễn giải |
|---|---|
| AI | Artificial Intelligence - Trí tuệ nhân tạo |
| API | Application Programming Interface - Giao diện lập trình ứng dụng |
| CORS | Cross-Origin Resource Sharing |
| DB | Database - Cơ sở dữ liệu |
| DPR | Dense Passage Retrieval |
| FAISS | Facebook AI Similarity Search |
| HITL | Human-in-the-Loop - Con người tham gia vòng kiểm soát |
| HTTP | Hypertext Transfer Protocol |
| JWT | JSON Web Token |
| LLM | Large Language Model - Mô hình ngôn ngữ lớn |
| NLP | Natural Language Processing - Xử lý ngôn ngữ tự nhiên |
| OAuth | Open Authorization |
| QA | Question Answering - Hỏi đáp |
| RAG | Retrieval-Augmented Generation |
| RAGAS | Retrieval-Augmented Generation Assessment |
| RBAC | Role-Based Access Control |
| SSE | Server-Sent Events |
| TALRAG | Self-Learning Temporal-Adaptive Retrieval-Augmented Generation |
| UI/UX | User Interface/User Experience |
| URL | Uniform Resource Locator |

# DANH MỤC HÌNH

1. Hình 3.1. Kiến trúc tổng thể của hệ thống.
2. Hình 3.2. Pipeline hỏi đáp RAG.
3. Hình 3.3. Pipeline nạp dữ liệu vào kho tri thức.
4. Hình 3.4. Pipeline token, thanh toán và quản trị.
5. Hình 3.5. Pipeline TALRAG và học từ web có kiểm duyệt.
6. Hình 3.6. Kiến trúc tự học dựa trên đánh giá độ tin cậy.
7. Hình 4.1. So sánh RAGAS tổng thể giữa năm hệ thống.
8. Hình 4.2. So sánh RAGAS theo độ khó.
9. Hình 4.3. So sánh chỉ số cấp câu trả lời.
10. Hình 4.4. So sánh chỉ số cấp ngữ cảnh.
11. Hình 4.5. Giao diện trang chủ hệ thống.
12. Hình 4.6. Giao diện chat và hiển thị nguồn.
13. Hình 4.7. Giao diện kho RAG cá nhân.
14. Hình 4.8. Giao diện hỏi đáp luyện tập và bảng xếp hạng.
15. Hình 4.9. Giao diện thanh toán bằng VietQR.
16. Hình 4.10. Giao diện bảng điều khiển quản trị.
17. Hình 4.11. Giao diện quản trị tri thức chờ duyệt.
18. Hình 4.12. Giao diện mini-game Hào Khí Sơn Hà.

# DANH MỤC BẢNG

1. Bảng 1.1. Đối chiếu mục tiêu và kết quả thực hiện.
2. Bảng 2.1. So sánh RAG truyền thống và TALRAG.
3. Bảng 2.2. Trọng số tái xếp hạng theo ý định câu hỏi.
4. Bảng 2.3. Công nghệ sử dụng trong hệ thống.
5. Bảng 3.1. Nhóm tác nhân của hệ thống.
6. Bảng 3.2. Yêu cầu chức năng.
7. Bảng 3.3. Yêu cầu phi chức năng.
8. Bảng 3.4. Nhóm API của hệ thống.
9. Bảng 3.5. Thiết kế các nhóm bảng dữ liệu.
10. Bảng 3.6. Quy tắc ưu tiên nguồn tri thức.
11. Bảng 4.1. Các chức năng đã xây dựng.
12. Bảng 4.2. Trạng thái dữ liệu vận hành tại thời điểm nghiệm thu.
13. Bảng 4.3. Cấu trúc bộ benchmark 100 câu.
14. Bảng 4.4. Kết quả RAGAS tổng thể.
15. Bảng 4.5. Kết quả RAGAS theo độ khó.
16. Bảng 4.6. Kết quả kiểm tra kỹ thuật.
17. Bảng 4.7. Kịch bản kiểm thử nghiệm thu.
18. Bảng 4.8. Các tồn tại và mức độ ưu tiên khắc phục.
19. Bảng 5.1. Mức độ hoàn thành sản phẩm theo đề cương.

# MỞ ĐẦU

Chuyển đổi số trong giáo dục không chỉ là số hóa tài liệu mà còn là quá trình thay đổi phương thức tiếp cận, tổ chức và khai thác tri thức. Trong lĩnh vực Lịch sử Việt Nam, người học phải làm việc với nhiều nhân vật, sự kiện, triều đại, địa danh, mốc thời gian và quan hệ nguyên nhân - kết quả. Thông tin thường phân tán ở sách giáo khoa, giáo trình, chuyên khảo, bài viết, cổng thông tin, tài liệu lưu trữ và nhiều nguồn trực tuyến khác nhau. Nếu chỉ tìm kiếm bằng từ khóa, người học phải tự đọc và đối chiếu nhiều tài liệu; nếu dùng mô hình ngôn ngữ lớn tổng quát, câu trả lời có thể trôi chảy nhưng thiếu căn cứ hoặc sai lệch dữ kiện.

Đề tài “Hệ thống chatbot trả lời về Lịch sử Việt Nam sử dụng trí tuệ nhân tạo (AI)” được triển khai nhằm xây dựng một nền tảng hỏi đáp chuyên biệt, có khả năng tiếp nhận câu hỏi bằng ngôn ngữ tự nhiên, tìm kiếm tri thức liên quan, tạo câu trả lời dễ hiểu và hiển thị nguồn tham khảo. Hệ thống được thiết kế như một sản phẩm hoàn chỉnh gồm lớp giao diện, API nghiệp vụ, cơ sở dữ liệu, kho tri thức vector, pipeline AI, quản trị, thanh toán, hỗ trợ người dùng và các chức năng học tập.

Điểm nghiên cứu trọng tâm của đề tài là TALRAG, một hướng RAG thích nghi theo đặc trưng lịch sử. Hệ thống không chỉ sử dụng độ tương đồng ngữ nghĩa mà còn xem xét mốc thời gian, quan hệ nhân quả, thực thể lịch sử và loại câu hỏi. Khi dữ liệu nội bộ không đủ, hệ thống có thể tìm kiếm web, nhưng nội dung mới phải đi qua đánh giá độ tin cậy, vùng chờ duyệt, phản hồi người dùng hoặc phê duyệt của quản trị viên trước khi trở thành bộ nhớ vector tin cậy.

Báo cáo này trình bày cơ sở hình thành đề tài, nền tảng lý thuyết, phân tích và thiết kế, quá trình xây dựng sản phẩm, kết quả thực nghiệm, đánh giá nghiệm thu, các hạn chế còn tồn tại và hướng phát triển.

# CHƯƠNG 1. TỔNG QUAN ĐỀ TÀI

## 1.1. Lý do chọn đề tài

Lịch sử Việt Nam có khối lượng tri thức lớn, trải dài qua nhiều thời kỳ và được trình bày dưới nhiều dạng tài liệu. Người học không chỉ cần nhớ dữ kiện mà còn phải hiểu bối cảnh, diễn biến, nguyên nhân, kết quả, ý nghĩa và mối liên hệ giữa các sự kiện. Những câu hỏi như “Vì sao nhà Trần ba lần đánh thắng quân Mông - Nguyên?”, “Chiến thắng Bạch Đằng năm 938 có ý nghĩa gì?” hoặc “So sánh tổ chức nhà nước thời Lý và thời Trần” đòi hỏi hệ thống phải chọn đúng loại bằng chứng, đúng thời kỳ và đúng thực thể.

Các công cụ tìm kiếm phổ biến trả về danh sách liên kết và để người dùng tự tổng hợp. Các mô hình ngôn ngữ lớn có thể tạo câu trả lời trực tiếp nhưng tồn tại nguy cơ ảo giác, đặc biệt khi câu hỏi có dữ kiện gần giống nhau hoặc nhiều sự kiện trùng tên. Một tài liệu có từ “Bạch Đằng” có thể nói về năm 938, 981 hoặc 1288; một hệ thống chỉ dựa vào tương đồng bề mặt dễ đưa nhầm ngữ cảnh. Vì vậy, bài toán cần một cơ chế kết hợp mô hình sinh với kho tri thức kiểm soát và các tín hiệu lịch sử.

RAG giúp gắn câu trả lời với tài liệu bên ngoài, nhưng RAG tĩnh vẫn có ba hạn chế chính: truy xuất chủ yếu theo ngữ nghĩa; kho tri thức ít thay đổi sau triển khai; và chưa có cơ chế minh bạch để chuyển phản hồi đã xác thực thành tri thức mới. Đề tài lựa chọn hướng RAG thích nghi, có nhận thức thời gian, nhân quả, thực thể và vòng kiểm duyệt nhằm giải quyết các hạn chế trên.

Về giá trị thực tiễn, một chatbot Lịch sử Việt Nam có thể hỗ trợ học sinh, sinh viên, giáo viên và người quan tâm tra cứu nhanh; tạo điểm bắt đầu để đọc sâu hơn; hỗ trợ luyện tập; lưu lại quá trình học; và khuyến khích tiếp cận sử liệu có nguồn. Việc triển khai đồng thời trên web và thiết bị di động giúp tăng khả năng tiếp cận trong môi trường học tập số.

## 1.2. Vấn đề nghiên cứu

Đề tài tập trung giải quyết câu hỏi tổng quát: làm thế nào xây dựng một hệ thống hỏi đáp Lịch sử Việt Nam có khả năng trả lời tự nhiên, truy xuất đúng ngữ cảnh, thể hiện nguồn tham khảo, xử lý đặc trưng thời gian - nhân quả, mở rộng tri thức có kiểm soát và đủ chức năng để vận hành như một sản phẩm phần mềm?

Từ câu hỏi tổng quát, các vấn đề cụ thể gồm:

1. Làm thế nào tổ chức tài liệu lịch sử thành kho vector có thể truy xuất nhanh?
2. Làm thế nào phân biệt câu hỏi sự kiện, thời gian, nguyên nhân, so sánh, ngoài phạm vi và trò chuyện xã giao?
3. Làm thế nào tái xếp hạng tài liệu để tránh nhầm mốc thời gian, triều đại hoặc nhân vật?
4. Làm thế nào tạo câu trả lời dựa trên ngữ cảnh và giữ nguồn tham khảo?
5. Làm thế nào xử lý câu hỏi nối tiếp phụ thuộc vào hội thoại trước?
6. Làm thế nào mở rộng tri thức từ web mà không làm ô nhiễm kho dữ liệu tin cậy?
7. Làm thế nào tách kho ghi chú cá nhân giữa các tài khoản?
8. Làm thế nào đánh giá định lượng chất lượng một hệ thống RAG lịch sử?
9. Làm thế nào tích hợp xác thực, thanh toán, quản trị, hỗ trợ và chức năng học tập vào cùng sản phẩm?

## 1.3. Mục tiêu nghiên cứu

### 1.3.1. Mục tiêu tổng quát

Xây dựng và đánh giá một hệ thống chatbot AI hỗ trợ hỏi đáp Lịch sử Việt Nam dựa trên RAG, có truy xuất thích nghi theo thời gian và quan hệ nhân quả, có khả năng học từ nguồn mới dưới sự kiểm soát của người dùng và quản trị viên, đồng thời cung cấp đầy đủ chức năng cần thiết cho một nền tảng web/mobile.

### 1.3.2. Mục tiêu cụ thể

1. Xây dựng kho tri thức Lịch sử Việt Nam bằng quy trình đọc tài liệu, làm sạch, chia đoạn, tạo embedding và lập chỉ mục FAISS.
2. Xây dựng backend API quản lý tài khoản, hội thoại, tin nhắn, token, thanh toán, hỗ trợ, hỏi đáp luyện tập và quản trị.
3. Xây dựng pipeline TALRAG gồm chuẩn hóa câu hỏi, nhận diện ngôn ngữ, xử lý câu nối tiếp, phân loại ý định, truy xuất đa nguồn, tái xếp hạng, lọc tài liệu, sinh câu trả lời và kiểm soát nguồn.
4. Xây dựng cơ chế tìm kiếm web khi thiếu dữ liệu, lưu tri thức chờ duyệt và nạp lại vào FAISS sau khi được xác nhận.
5. Xây dựng kho RAG cá nhân theo tài khoản, cho phép lưu đoạn trả lời, bản hiệu chỉnh và ghi chú riêng.
6. Xây dựng giao diện web song ngữ và lớp ứng dụng Android.
7. Xây dựng chức năng quản trị, báo cáo, phản hồi và kiểm duyệt.
8. Xây dựng bộ benchmark 100 câu và đánh giá bằng RAGAS.
9. Kiểm tra khả năng build, tính đúng của các mô-đun thuật toán và trạng thái vận hành của sản phẩm.

## 1.4. Câu hỏi nghiên cứu

RQ1: Việc điều chỉnh trọng số truy xuất theo ý định câu hỏi có giúp câu trả lời tập trung hơn so với RAG tĩnh hay không?

RQ2: Việc bổ sung điểm thời gian, điểm nhân quả và điều chỉnh theo thực thể có cải thiện chất lượng lựa chọn ngữ cảnh lịch sử hay không?

RQ3: Kiến trúc tự học có kiểm duyệt có thể mở rộng tri thức mà vẫn duy trì ranh giới giữa dữ liệu tạm thời và dữ liệu tin cậy hay không?

RQ4: Hệ thống có thể tích hợp các chức năng sản phẩm như tài khoản, lịch sử, thanh toán, hỗ trợ, quản trị, RAG cá nhân và học tập mà không tách rời pipeline AI hay không?

RQ5: Những điểm mạnh và hạn chế của TALRAG thể hiện như thế nào qua Faithfulness, Answer Relevancy, Context Precision, Context Recall và độ trễ?

## 1.5. Đối tượng và phạm vi nghiên cứu

### 1.5.1. Đối tượng nghiên cứu

Đối tượng nghiên cứu gồm hệ thống hỏi đáp bằng ngôn ngữ tự nhiên; mô hình RAG; truy xuất vector; mô hình ngôn ngữ lớn; phân loại câu hỏi lịch sử; xử lý thời gian, nhân quả và thực thể; cơ chế tự học có kiểm duyệt; đánh giá RAGAS; và kiến trúc phần mềm phục vụ người dùng cuối.

### 1.5.2. Phạm vi nội dung

Hệ thống ưu tiên Lịch sử Việt Nam, tập trung vào nhân vật, triều đại, sự kiện, trận đánh, địa danh, mốc thời gian, diễn biến, nguyên nhân, kết quả, ý nghĩa và câu hỏi so sánh. Bộ benchmark chính giới hạn ở giai đoạn phong kiến 939-1945 để giảm độ lệch chủ đề và tạo điều kiện kiểm chứng bằng cùng kho tài liệu.

Những câu hỏi ngoài Lịch sử Việt Nam được nhận diện để từ chối hoặc định hướng lại. Hệ thống không nhằm đưa ra kết luận sử học mới, không thay thế tài liệu chính thống và không chịu vai trò của một cơ quan thẩm định lịch sử.

### 1.5.3. Phạm vi ngôn ngữ

Tiếng Việt là ngôn ngữ chính. Hệ thống có cơ chế nhận diện và dịch câu hỏi tiếng Anh sang tiếng Việt để truy xuất, sau đó dịch câu trả lời và nội dung hiển thị cần thiết sang tiếng Anh. Phạm vi song ngữ hiện tập trung Việt - Anh.

### 1.5.4. Phạm vi nền tảng

Sản phẩm chính là ứng dụng web responsive. Ứng dụng Android được đóng gói bằng Capacitor từ bản web production. Dự án cũng có lớp Flutter WebView phục vụ tải giao diện web, quản lý token cục bộ, cookie nhận diện môi trường app và luồng Google OAuth. Đây là kiến trúc ứng dụng lai, không phải toàn bộ giao diện được viết native.

### 1.5.5. Phạm vi đánh giá

Đánh giá khoa học sử dụng bộ 100 câu và bốn chỉ số RAGAS. Các kiểm thử phần mềm tập trung vào build, cú pháp, mô-đun truy xuất thích nghi và đối chiếu chức năng với mã nguồn. Việc kiểm thử tải lớn, kiểm thử xâm nhập độc lập, đánh giá sư phạm dài hạn và thử nghiệm có nhóm đối chứng người học chưa nằm trong phạm vi hoàn tất của giai đoạn này.

## 1.6. Phương pháp nghiên cứu

Đề tài sử dụng kết hợp các phương pháp sau:

**Nghiên cứu tài liệu:** khảo sát chatbot giáo dục, mô hình ngôn ngữ lớn, RAG, dense retrieval, FAISS, adaptive retrieval, Corrective RAG, Self-RAG, hỏi đáp lịch sử, xử lý tiếng Việt và RAGAS.

**Phân tích yêu cầu:** xác định nhu cầu của khách truy cập, người dùng đã đăng nhập, quản trị viên và người vận hành; từ đó xây dựng nhóm chức năng và các ràng buộc bảo mật, dữ liệu, hiệu năng.

**Thiết kế hệ thống:** phân lớp frontend, backend, cơ sở dữ liệu, pipeline AI, kho vector và tích hợp dịch vụ; thiết kế luồng dữ liệu cho hỏi đáp, thanh toán, hỗ trợ, kiểm duyệt và RAG cá nhân.

**Thực nghiệm phần mềm:** xây dựng sản phẩm theo mô-đun, chạy thử trên dữ liệu thật, ghi log, quan sát lỗi và điều chỉnh pipeline.

**Thực nghiệm RAGAS:** tạo bộ câu hỏi có đáp án tham chiếu, chạy các hệ thống, thu câu trả lời và ngữ cảnh, tính bốn chỉ số chất lượng, tổng hợp theo hệ thống và độ khó.

**Đối chiếu nghiệm thu:** kiểm tra mã nguồn, cơ sở dữ liệu, chỉ mục vector, kết quả build và các phép thử thuật toán; đối chiếu kết quả thực tế với nội dung và sản phẩm đã đăng ký trong đề cương.

## 1.7. Ý nghĩa khoa học và thực tiễn

Về khoa học, đề tài cụ thể hóa truy xuất thích nghi cho miền Lịch sử Việt Nam. Câu hỏi không được xử lý đồng nhất mà được phân loại để thay đổi trọng số ngữ nghĩa, thời gian, nhân quả và số lượng tài liệu. Đề tài cũng xây dựng vòng đời tri thức từ truy xuất nội bộ, fallback web, xác thực, chờ duyệt, phản hồi, phê duyệt đến nạp vector.

Về thực tiễn, hệ thống hình thành một nền tảng có thể sử dụng để hỏi đáp, luyện tập, lưu lịch sử, quản lý ghi chú, xem nguồn, thanh toán và nhận hỗ trợ. Dữ liệu quản trị cho phép theo dõi người dùng, hội thoại, phản hồi, doanh thu, phân bố chủ đề và chất lượng nội dung. Kiến trúc web/mobile tạo điều kiện triển khai cho nhiều nhóm người dùng.

## 1.8. Sản phẩm của đề tài

1. Hệ thống chatbot Lịch sử Việt Nam hoạt động trên web.
2. Backend FastAPI và 77 khai báo endpoint nghiệp vụ.
3. Giao diện React/TypeScript responsive và song ngữ.
4. Ứng dụng Android đóng gói bằng Capacitor.
5. Lớp Flutter WebView hỗ trợ đăng nhập và lưu token.
6. Kho tri thức FAISS cho OpenAI, Vertex, tri thức toàn cục và RAG cá nhân.
7. Cơ sở dữ liệu SQLite gồm 21 bảng.
8. Pipeline TALRAG thích nghi theo ý định, thời gian, nhân quả và thực thể.
9. Cơ chế semantic cache, web fallback và tri thức chờ duyệt.
10. Module quản trị, thanh toán, hỗ trợ, hỏi đáp luyện tập và mini-game lịch sử.
11. Bộ benchmark 100 câu và bộ kết quả RAGAS.
12. Bài báo “TALRAG: A Self-Learning Temporal-Adaptive RAG Framework”.

## 1.9. Đối chiếu mục tiêu và kết quả

**Bảng 1.1. Đối chiếu mục tiêu và kết quả thực hiện**

| Mục tiêu theo đề cương | Kết quả hiện có | Đánh giá |
|---|---|---|
| Hỏi đáp Lịch sử Việt Nam bằng ngôn ngữ tự nhiên | Có chat REST, SSE streaming, lịch sử và nguồn | Hoàn thành |
| Kho tri thức vector | Có FAISS OpenAI, Vertex, global history, user RAG | Hoàn thành |
| Xử lý thời gian, nhân quả, so sánh | Có classifier, temporal score, causal score, adaptive weights | Hoàn thành |
| Kiểm soát thiếu dữ liệu | Có document grading, no-answer, web fallback | Hoàn thành |
| Tự học có kiểm duyệt | Có pending knowledge, phản hồi, admin approve, FAISS ingestion | Hoàn thành ở mức sản phẩm nghiên cứu |
| RAG cá nhân | Có lưu lựa chọn, sửa nội dung, ghi chú và chỉ mục riêng | Hoàn thành |
| Giao diện web/mobile | Có React responsive, Capacitor Android, Flutter WebView | Hoàn thành |
| Quản trị | Có quản lý người dùng, token, payment, log, settings, knowledge, support | Hoàn thành |
| Đánh giá định lượng | Có benchmark 100 câu và RAGAS năm hệ thống | Hoàn thành |
| Tối ưu độ trễ và độ bao phủ | Kết quả còn hạn chế về latency và context recall | Cần tiếp tục |

## 1.10. Bố cục báo cáo

Chương 1 trình bày tổng quan, mục tiêu, phạm vi, phương pháp và sản phẩm. Chương 2 trình bày cơ sở lý thuyết, công trình liên quan và mô hình TALRAG. Chương 3 phân tích yêu cầu, kiến trúc, cơ sở dữ liệu và các pipeline. Chương 4 trình bày quá trình xây dựng, chức năng sản phẩm, số liệu vận hành, kiểm thử và kết quả RAGAS. Chương 5 tổng kết mức độ hoàn thành, hạn chế và hướng phát triển.

# CHƯƠNG 2. CƠ SỞ LÝ THUYẾT VÀ NGHIÊN CỨU LIÊN QUAN

## 2.1. Chatbot và hệ thống hỏi đáp

Chatbot là hệ thống phần mềm cho phép người dùng tương tác bằng ngôn ngữ tự nhiên. Các chatbot thế hệ đầu thường dựa trên luật, từ khóa và cây hội thoại. Ưu điểm của phương pháp luật là dễ kiểm soát, nhưng khả năng bao phủ thấp và khó xử lý cách diễn đạt đa dạng. Chatbot hiện đại sử dụng mô hình học sâu và mô hình ngôn ngữ lớn để hiểu ngữ cảnh và sinh câu trả lời linh hoạt hơn.

Hệ thống hỏi đáp khác công cụ tìm kiếm ở chỗ đầu ra kỳ vọng là một câu trả lời tổng hợp thay vì danh sách tài liệu. Đối với lịch sử, hệ thống hỏi đáp phải đồng thời xử lý dữ kiện, mốc thời gian, tên riêng, quan hệ giữa sự kiện và góc nhìn diễn giải. Do đó, yêu cầu về căn cứ và khả năng truy xuất nguồn cao hơn chatbot xã giao.

## 2.2. Xử lý ngôn ngữ tự nhiên tiếng Việt

Xử lý tiếng Việt có một số đặc điểm như dấu thanh, từ ghép viết cách, tên riêng có nhiều biến thể, cách viết Hán - Việt và hiện tượng lược bỏ chủ thể trong hội thoại. Câu hỏi lịch sử còn chứa niên hiệu, tước hiệu, tên húy, tên gọi khác nhau của cùng nhân vật hoặc triều đại. Ví dụ Nguyễn Huệ và Quang Trung cùng chỉ một nhân vật trong những ngữ cảnh nhất định.

Hệ thống sử dụng chuẩn hóa chuỗi, nhận diện từ khóa, loại bỏ khác biệt dấu trong một số phép so khớp, từ điển bí danh thực thể và mô hình ngôn ngữ khi cần. Với câu hỏi nối tiếp, hệ thống khai thác sáu tin nhắn gần nhất và thực thể vừa xuất hiện để viết lại câu hỏi thành dạng độc lập hơn trước khi truy xuất.

## 2.3. Mô hình ngôn ngữ lớn

Mô hình ngôn ngữ lớn được huấn luyện trên lượng văn bản lớn và có khả năng sinh văn bản, tóm tắt, dịch, phân loại và đối thoại. Trong hệ thống này, LLM đảm nhiệm các công việc như sinh câu trả lời, phân loại bổ sung khi luật chưa đủ rõ, đánh giá tài liệu ở chế độ cấu hình tương ứng, tạo truy vấn web, xác thực nội dung và dịch.

Hạn chế quan trọng của LLM là khả năng tạo thông tin hợp lý về ngôn ngữ nhưng không đúng thực tế. Với lịch sử, sai một năm, tên nhân vật hoặc quan hệ sự kiện có thể làm thay đổi bản chất câu trả lời. Vì vậy, LLM phải được đặt trong pipeline có truy xuất và kiểm soát thay vì được xem là nguồn dữ liệu duy nhất.

## 2.4. Embedding và tìm kiếm vector

Embedding là biểu diễn văn bản dưới dạng vector số. Những văn bản có ý nghĩa gần nhau thường có vector gần nhau trong không gian embedding. Quy trình tìm kiếm vector gồm chuyển câu hỏi thành vector, so sánh với vector tài liệu và lấy các đoạn gần nhất.

Tìm kiếm vector khắc phục một phần hạn chế của từ khóa vì có thể tìm được đoạn liên quan dù cách diễn đạt không trùng hoàn toàn. Tuy nhiên, độ gần ngữ nghĩa không bảo đảm đúng thời gian hoặc đúng quan hệ nhân quả. Đây là lý do cần lớp tái xếp hạng sau FAISS.

## 2.5. FAISS

FAISS là thư viện tìm kiếm tương đồng vector có khả năng làm việc với tập vector lớn. Trong đề tài, FAISS được dùng cho bốn nhóm chỉ mục:

1. Chỉ mục tài liệu lịch sử chính theo mô hình embedding OpenAI.
2. Chỉ mục tài liệu lịch sử chính theo mô hình embedding Vertex.
3. Chỉ mục lịch sử toàn cục thu thập từ nguồn được cấu hình.
4. Chỉ mục RAG cá nhân theo từng người dùng và mô hình embedding.

Tại thời điểm nghiệm thu, chỉ mục Vertex có 138.058 chunk, chỉ mục OpenAI có 107.638 chunk và chỉ mục global history có 11 chunk cho mỗi mô hình. Hai chỉ mục chính là các cách biểu diễn khác nhau của kho dữ liệu phục vụ các cấu hình embedding, không nên cộng lại để tuyên bố số tài liệu gốc.

## 2.6. Retrieval-Augmented Generation

RAG kết hợp hai bước: truy xuất tài liệu và sinh câu trả lời. Với câu hỏi \(q\), retriever lấy tập tài liệu \(D_q\) từ kho tri thức. Mô hình ngôn ngữ sinh câu trả lời có điều kiện theo câu hỏi và tài liệu:

\[
A = LLM(q, D_q, H)
\]

trong đó \(H\) là lịch sử hội thoại. Chất lượng RAG phụ thuộc đồng thời vào chất lượng kho dữ liệu, embedding, chiến lược truy xuất, số lượng chunk, lọc tài liệu, prompt và mô hình sinh.

## 2.7. Hạn chế của RAG tĩnh

RAG tĩnh thường sử dụng một cấu hình top-k cho mọi câu hỏi. Cách này chưa phù hợp với lịch sử vì các loại câu hỏi có nhu cầu bằng chứng khác nhau. Câu hỏi “ai” ưu tiên dữ kiện trực tiếp; câu hỏi “khi nào” cần mốc thời gian; câu hỏi “vì sao” cần nội dung nguyên nhân; câu hỏi so sánh cần đủ tài liệu cho hai hay nhiều đối tượng.

RAG tĩnh cũng gặp khó khăn khi kho tri thức chưa có dữ liệu. Nếu hệ thống vẫn buộc LLM trả lời, nguy cơ ảo giác tăng. Nếu hệ thống luôn từ chối, phạm vi sử dụng khó mở rộng. TALRAG giải quyết bằng nhánh fallback web và vòng kiểm duyệt tri thức.

## 2.8. Truy xuất thích nghi của TALRAG

TALRAG phân loại câu hỏi thành factual, causal, temporal, comparison, unrelated hoặc chitchat. Với bốn loại lịch sử chính, hệ thống áp dụng công thức:

\[
S_{base}(d,q) = \alpha S_{semantic} + \beta S_{temporal} + \gamma S_{causal}
\]

Sau đó, nếu phát hiện thực thể lịch sử, hệ thống áp dụng phần điều chỉnh:

\[
S_{final} = clip(S_{base} + \Delta_{entity}, 0, 1)
\]

Trong triển khai hiện tại, điểm thực thể được áp dụng như bonus hoặc penalty sau điểm cơ sở, không phải một thành phần trọng số \(\delta\) độc lập. Cách mô tả này phản ánh đúng mã nguồn và làm rõ hơn biểu diễn khái niệm trong bài báo.

**Bảng 2.1. So sánh RAG truyền thống và TALRAG**

| Tiêu chí | RAG tĩnh | TALRAG |
|---|---|---|
| Phân loại câu hỏi | Không bắt buộc | Có |
| Trọng số truy xuất | Cố định | Thay đổi theo ý định |
| Thời gian | Không tách riêng | Có temporal score |
| Nhân quả | Không tách riêng | Có causal score |
| Thực thể lịch sử | Phụ thuộc embedding | Có từ điển alias và điều chỉnh |
| Nguồn truy xuất | Thường một kho | Cá nhân, global, offline, dynamic |
| Lọc tài liệu | Có thể không có | Fast grading hoặc LLM grading |
| Thiếu dữ liệu | Từ chối hoặc sinh tự do | Web fallback có xác thực |
| Cập nhật tri thức | Nạp thủ công | Pending, phản hồi, admin, ingestion |
| Cache | Không bắt buộc | Semantic cache có scope và phiên bản KB |

**Bảng 2.2. Trọng số tái xếp hạng theo ý định câu hỏi**

| Ý định | Alpha ngữ nghĩa | Beta thời gian | Gamma nhân quả | Top-k |
|---|---:|---:|---:|---:|
| Factual | 0,70 | 0,20 | 0,10 | 10 |
| Causal | 0,40 | 0,10 | 0,50 | 10 |
| Temporal | 0,40 | 0,50 | 0,10 | 10 |
| Comparison | 0,60 | 0,20 | 0,20 | 15 |
| Unrelated | 0,00 | 0,00 | 0,00 | 0 |
| Chitchat | 0,00 | 0,00 | 0,00 | 0 |

Semantic score trong lớp tái xếp hạng hiện được ước tính từ thứ hạng FAISS, giảm dần từ tài liệu đứng đầu. Temporal score xem xét năm, độ gần mốc thời gian và từ khóa thời kỳ. Causal score xem xét tín hiệu nguyên nhân - kết quả và tăng trọng số khi truy vấn có dạng “tại sao”, “vì sao”, “nguyên nhân”, “dẫn đến” hoặc “hậu quả”.

## 2.9. Nhận diện thực thể lịch sử

Hệ thống xây dựng tập bí danh cho nhân vật, triều đại, sự kiện và địa danh. Từ điển này hỗ trợ:

1. Nhận diện thực thể chính trong câu hỏi.
2. Viết lại câu hỏi nối tiếp có đại từ.
3. Tăng điểm tài liệu chứa đúng thực thể.
4. Giảm điểm hoặc loại nguồn lạc sang thực thể gần tên.
5. Lọc nguồn trước khi trả về giao diện.

Đối với tài liệu RAG cá nhân, hệ thống giữ quyền ưu tiên để nội dung người dùng chủ động lưu có thể tham gia trả lời, nhưng vẫn gắn nhãn nguồn cá nhân để tránh nhầm với sử liệu chung.

## 2.10. Đánh giá và lọc tài liệu

Sau truy xuất, tài liệu ứng viên được đánh giá bằng luật nhanh hoặc LLM tùy cấu hình. Chế độ nhanh dựa trên từ khóa, thực thể, độ liên quan và metadata để giảm chi phí. Chế độ LLM dùng prompt yes/no để xác định tài liệu có phù hợp với câu hỏi hay không.

Việc lọc tài liệu nhằm giảm nhiễu trước khi sinh câu trả lời. Tuy nhiên, lọc quá mạnh có thể làm giảm Context Recall. Kết quả thực nghiệm của TALRAG cho thấy đây là vấn đề cần cân bằng: Context Precision nhỉnh hơn baseline nhưng Context Recall thấp hơn.

## 2.11. Semantic cache

Semantic cache lưu câu hỏi, câu trả lời, nguồn, embedding, mô hình embedding, tenant, user, knowledge base, phiên bản kho tri thức và thời hạn. Khi một câu hỏi mới có cosine similarity vượt ngưỡng mặc định 0,88 với mục cache cùng scope, hệ thống có thể dùng lại câu trả lời.

Cache giúp giảm thời gian và chi phí cho câu hỏi lặp hoặc gần nghĩa. Cơ chế scope ngăn dữ liệu riêng của người này bị trả cho người khác. Khi kho tri thức được cập nhật, phiên bản KB tăng làm cache cũ mất hiệu lực, tránh dùng lại câu trả lời dựa trên dữ liệu đã thay đổi.

## 2.12. Tự học có kiểm duyệt

Khi dữ liệu nội bộ không đủ, WebLearningAgent tạo truy vấn tìm kiếm, ưu tiên nguồn cơ quan nhà nước, bảo tàng, cơ quan nghiên cứu, báo chí chính thống và các miền tin cậy đã cấu hình. Crawler thu nội dung, loại nhiễu, chia đoạn và đánh giá liên quan. Wikipedia bị loại khỏi nhánh nguồn ưu tiên trong cấu hình crawler hiện tại.

Nội dung web không được nạp trực tiếp vào kho chính. Câu trả lời đủ điều kiện được lưu vào `pending_knowledge`. Người dùng có thể phản hồi; quản trị viên có thể phê duyệt; AutoLearningAgent tinh chỉnh, chia đoạn, tạo embedding và nạp vào `output/{embedding_model}`. Sau cập nhật, cache retriever được xóa và phiên bản kho tri thức có thể được tăng.

Đây là cơ chế HITL vì con người tham gia quyết định tri thức nào trở thành bộ nhớ dài hạn. “Tự học” trong báo cáo được hiểu là tự động hóa pipeline thu thập - xử lý - nạp sau tín hiệu tin cậy, không phải mô hình tự huấn luyện lại trọng số.

## 2.13. RAG cá nhân

RAG cá nhân cho phép người dùng lưu:

1. Đoạn được chọn từ câu trả lời.
2. Phiên bản đã hiệu chỉnh của đoạn trả lời.
3. Ghi chú nhập thủ công.
4. Câu hỏi gốc, câu trả lời, tag và metadata liên quan.

Dữ liệu được lưu trong `user_rag_items` và đồng bộ thành chỉ mục riêng tại `utils/data_vector_new/user_rag_{user_id}/{embedding_model}`. Khi truy xuất, tài liệu cá nhân được gắn metadata `is_user_rag` và được ưu tiên trước global history, tài liệu PDF và các nguồn khác. Thiết kế này cá nhân hóa quá trình học mà không làm thay đổi kho chung.

## 2.14. Xử lý song ngữ

TranslationAgent phát hiện ngôn ngữ câu hỏi, chuyển câu hỏi tiếng Anh sang tiếng Việt để dùng cùng kho tri thức, sau đó dịch câu trả lời, nguồn và câu hỏi liên quan sang tiếng Anh nếu cần. Frontend có LanguageContext với bộ nhãn tiếng Việt và tiếng Anh cho các màn hình chính.

Cách tiếp cận dịch trước truy xuất giúp tránh phải duy trì hai kho vector hoàn toàn độc lập. Hạn chế là chất lượng phụ thuộc vào dịch tên riêng, tước hiệu và thuật ngữ lịch sử; do đó hệ thống cần tiếp tục bổ sung từ điển thuật ngữ song ngữ.

## 2.15. RAGAS

RAGAS là khung đánh giá hệ thống RAG bằng các chỉ số:

**Faithfulness:** mức độ các phát biểu trong câu trả lời được hỗ trợ bởi ngữ cảnh.

**Answer Relevancy:** mức độ câu trả lời tập trung và liên quan đến câu hỏi.

**Context Precision:** tỷ lệ và thứ tự các đoạn ngữ cảnh truy xuất thực sự hữu ích.

**Context Recall:** mức độ ngữ cảnh truy xuất bao phủ thông tin cần thiết trong đáp án tham chiếu.

Bốn chỉ số đo các khía cạnh khác nhau, không nên gọi chung là “độ chính xác”. Một hệ thống có thể trả lời đúng trọng tâm nhưng chưa đủ bằng chứng, hoặc có nhiều bằng chứng nhưng lẫn nhiễu.

## 2.16. Các hệ thống đối sánh

**ItihashQA Baseline:** kiến trúc RAG tĩnh được điều chỉnh để sử dụng cùng kho Lịch sử Việt Nam. Baseline dùng truy xuất semantic top-k và đưa ngữ cảnh trực tiếp vào LLM, không có toàn bộ lớp thích nghi của TALRAG.

**NotebookLM:** công cụ nghiên cứu dựa trên tài liệu tải lên. Cơ chế nội bộ đóng nên chỉ có thể đánh giá đầu ra và bằng chứng hiển thị.

**Gemini Gems:** trợ lý tùy chỉnh trong hệ sinh thái Gemini. Hệ thống có khả năng sinh câu trả lời tốt nhưng pipeline retrieval không mở hoàn toàn cho tái lập.

**Custom GPT:** trợ lý tùy chỉnh bằng tài liệu và chỉ dẫn. Tương tự, retrieval nội bộ không minh bạch như pipeline mã nguồn mở.

Việc đưa ba hệ thống đóng vào so sánh cho thấy tương quan thực tế, nhưng các chỉ số context của chúng phải được hiểu thận trọng vì không thể quan sát toàn bộ xếp hạng nội bộ.

## 2.17. Công nghệ sử dụng

**Bảng 2.3. Công nghệ sử dụng trong hệ thống**

| Thành phần | Công nghệ |
|---|---|
| Backend | Python, FastAPI, Pydantic |
| Xác thực | JWT HS256, bcrypt, Google OAuth 2.0 |
| Điều phối AI | LangChain, LangGraph |
| Vector database | FAISS |
| Embedding | OpenAI hoặc Vertex AI theo cấu hình |
| LLM | OpenAI/Vertex theo cấu hình runtime |
| Cơ sở dữ liệu | SQLite |
| Web crawler | DuckDuckGo Search, trafilatura, BeautifulSoup |
| Frontend | React 19, TypeScript, Vite |
| Giao diện/chuyển động | CSS, Framer Motion, Lucide |
| Streaming | Server-Sent Events |
| Thanh toán | SePay, VietQR |
| Mobile | Capacitor Android, Flutter WebView |
| Trò chơi | Phaser |
| Đánh giá | RAGAS, pandas, matplotlib |

## 2.18. Khoảng trống nghiên cứu và đóng góp

Từ tổng quan có thể xác định ba khoảng trống. Thứ nhất, RAG thông thường chưa xử lý rõ đặc trưng thời gian và nhân quả của câu hỏi lịch sử. Thứ hai, nhiều hệ thống hoạt động với kho dữ liệu tĩnh và không có vòng đời tri thức dựa trên phản hồi. Thứ ba, các trợ lý đóng khó tái lập cơ chế retrieval và cập nhật bộ nhớ.

Đề tài đóng góp một kiến trúc tích hợp gồm truy xuất theo ý định, điểm thời gian - nhân quả, thực thể lịch sử, semantic cache, đa nguồn FAISS, web fallback, pending knowledge, RAG cá nhân và quản trị. Đóng góp không chỉ nằm ở thuật toán mà còn ở việc hiện thực hóa thành sản phẩm có luồng dữ liệu và chức năng vận hành hoàn chỉnh.

# CHƯƠNG 3. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

## 3.1. Phân tích tác nhân

Hệ thống có bốn nhóm tác nhân chính.

**Bảng 3.1. Nhóm tác nhân của hệ thống**

| Tác nhân | Quyền và nhu cầu chính |
|---|---|
| Khách chưa đăng nhập | Xem trang giới thiệu, cấu hình công khai, tải ứng dụng, đăng ký, đăng nhập |
| Người dùng | Hỏi đáp, xem nguồn, quản lý hội thoại, RAG cá nhân, hồ sơ, token, thanh toán, Q&A, hỗ trợ, trò chơi |
| Quản trị viên | Toàn bộ quyền người dùng và quyền quản lý tài khoản, tri thức, thanh toán, phản hồi, cấu hình, báo cáo |
| Dịch vụ ngoài | Google OAuth, LLM/embedding, SePay/VietQR, công cụ tìm kiếm và website nguồn |

Người dùng là chủ thể trung tâm. Mọi dữ liệu hội thoại, RAG cá nhân, thanh toán và hỗ trợ được gắn với `user_id`. Quản trị viên được xác định qua trường `is_admin` và dependency kiểm tra quyền ở backend. Các dịch vụ ngoài không truy cập trực tiếp cơ sở dữ liệu mà được gọi qua module tích hợp.

## 3.2. Yêu cầu chức năng

**Bảng 3.2. Yêu cầu chức năng**

| Mã | Yêu cầu |
|---|---|
| FR-01 | Đăng ký tài khoản bằng tên đăng nhập, email và mật khẩu |
| FR-02 | Đăng nhập bằng tài khoản thường hoặc Google OAuth |
| FR-03 | Phát hành và xác thực JWT cho request cần bảo vệ |
| FR-04 | Cập nhật hồ sơ, ảnh đại diện, ảnh bìa và mật khẩu |
| FR-05 | Tạo, đổi tên, ghim và xóa cuộc hội thoại |
| FR-06 | Gửi câu hỏi và nhận câu trả lời theo thời gian thực |
| FR-07 | Hiển thị nguồn, timeline, câu hỏi liên quan và điểm nội bộ |
| FR-08 | Đánh giá thích/không thích câu trả lời |
| FR-09 | Truy xuất kho tri thức chính, global history, dynamic và RAG cá nhân |
| FR-10 | Phân loại câu hỏi và tái xếp hạng theo thời gian, nhân quả, thực thể |
| FR-11 | Xử lý câu hỏi nối tiếp dựa trên lịch sử |
| FR-12 | Hỗ trợ hỏi đáp tiếng Việt và tiếng Anh |
| FR-13 | Dùng semantic cache cho câu hỏi gần nghĩa |
| FR-14 | Tìm kiếm web khi thiếu dữ liệu |
| FR-15 | Lưu tri thức web vào vùng chờ duyệt |
| FR-16 | Cho phép quản trị viên phê duyệt và nạp tri thức vào FAISS |
| FR-17 | Lưu đoạn được chọn, bản sửa và ghi chú vào RAG cá nhân |
| FR-18 | Quản lý số dư, lịch sử token và mức tiêu thụ |
| FR-19 | Tạo thanh toán VietQR/SePay, kiểm tra trạng thái và cộng token |
| FR-20 | Tiếp nhận báo cáo sự cố thanh toán |
| FR-21 | Cung cấp điểm danh, năm câu hỏi mỗi ngày, phần thưởng và bảng xếp hạng |
| FR-22 | Cung cấp hỗ trợ người dùng; AI trả lời khi admin ngoại tuyến |
| FR-23 | Cung cấp mini-game Lịch sử Việt Nam |
| FR-24 | Quản trị người dùng, gói token, thanh toán, chat log và đăng nhập |
| FR-25 | Quản trị phản hồi, tri thức, hỗ trợ, nội dung landing và cấu hình AI |
| FR-26 | Gửi báo cáo tuần qua email cho quản trị viên |
| FR-27 | Cung cấp endpoint tải APK |

## 3.3. Yêu cầu phi chức năng

**Bảng 3.3. Yêu cầu phi chức năng**

| Nhóm | Yêu cầu |
|---|---|
| Bảo mật | Mật khẩu phải được băm; API riêng tư yêu cầu JWT; admin có RBAC |
| Riêng tư | RAG cá nhân và cache cá nhân phải tách theo user |
| Tin cậy | Tri thức web không tự động trở thành tri thức chính thức |
| Khả dụng | Giao diện responsive, có web và Android |
| Hiệu năng | Streaming để giảm cảm nhận chờ; semantic cache giảm tính toán lặp |
| Mở rộng | Tách router, service, ingestion và vector store theo mô-đun |
| Bảo trì | Cấu hình LLM, embedding, giao diện và chính sách được tách khỏi UI chính |
| Quan sát | Có chat log, login log, token history, payment status và dashboard |
| Ngôn ngữ | Giao diện và hỏi đáp hỗ trợ tiếng Việt/tiếng Anh |
| Tính đúng miền | Từ chối hoặc định hướng câu hỏi ngoài Lịch sử Việt Nam |

## 3.4. Kiến trúc tổng thể

Hệ thống được thiết kế theo sáu lớp:

1. **Lớp trình bày:** React web, giao diện quản trị, Capacitor Android và Flutter WebView.
2. **Lớp API:** FastAPI tiếp nhận request, xác thực, kiểm tra quyền và trả dữ liệu.
3. **Lớp nghiệp vụ:** tài khoản, hội thoại, token, thanh toán, Q&A, hỗ trợ, cài đặt và báo cáo.
4. **Lớp AI:** FilesChatAgent, LangGraph, classifier, retriever, grader, generator, translator và web learning.
5. **Lớp dữ liệu:** SQLite cho dữ liệu giao dịch và FAISS cho dữ liệu vector.
6. **Lớp dịch vụ ngoài:** LLM, embedding, Google OAuth, SePay, VietQR, tìm kiếm web và nguồn nội dung.

![Hình 3.1. Kiến trúc tổng thể của hệ thống](figures/hinh_3_1_kien_truc_tong_the.svg)

**Thuyết minh Hình 3.1:** Frontend không gọi trực tiếp FAISS hoặc LLM. Mọi yêu cầu đi qua FastAPI để kiểm tra JWT, số dư và quyền. Backend đọc/ghi SQLite, điều phối pipeline AI, truy xuất FAISS và kết nối dịch vụ ngoài. Cách tách lớp giúp thay đổi mô hình AI hoặc giao diện mà không phải viết lại toàn bộ hệ thống.

## 3.5. Thiết kế API

Backend đặt prefix chung `/api/v1`. Mỗi router có prefix riêng khi cần. Mã nguồn hiện có 75 endpoint trong tám router và hai endpoint ở ứng dụng chính, tổng cộng 77 khai báo endpoint.

**Bảng 3.4. Nhóm API của hệ thống**

| Nhóm | Prefix | Số endpoint | Chức năng |
|---|---|---:|---|
| Auth | `/api/v1/auth` | 9 | Đăng ký, đăng nhập, Google OAuth, token, hồ sơ |
| Chatbot | `/api/v1` | 15 | Hội thoại, chat, SSE, nguồn, cấu hình |
| Admin | `/api/v1/admin` | 27 | Người dùng, gói, payment, log, settings, knowledge |
| Payment | `/api/v1/payment` | 5 | Gói token, tạo giao dịch, trạng thái, lịch sử, báo cáo |
| Q&A | `/api/v1/qa` | 5 | Trạng thái, điểm danh, câu hỏi, trả lời, xếp hạng |
| Support | `/api/v1/support` | 6 | Trạng thái admin, phòng hỗ trợ, gửi/nhận tin |
| User RAG | `/api/v1/user-rag` | 5 | Lưu lựa chọn, ghi chú, sửa, xóa, danh sách |
| File upload | `/api/v1/upload-file` | 3 | Tải lên, tải xuống, xem file |
| App main | `/api/v1/`, `/download/apk` | 2 | Health/root và tải APK |

FastAPI tự sinh OpenAPI tại `/api/v1/openapi.json`, Swagger tại `/api/v1/docs` và ReDoc tại `/api/v1/redoc`. Điều này hỗ trợ kiểm thử và tích hợp frontend.

## 3.6. Pipeline xác thực và phân quyền

Khi đăng ký, backend kiểm tra thông tin trùng, băm mật khẩu bằng bcrypt và thêm người dùng vào SQLite. Khi đăng nhập thường, mật khẩu được kiểm tra bằng bcrypt; nếu hợp lệ, hệ thống tạo JWT HS256 có thời hạn 24 giờ.

Khi đăng nhập Google, backend chuyển người dùng đến trang OAuth, nhận callback, lấy thông tin hồ sơ và tạo hoặc cập nhật tài khoản. Luồng web có thể chuyển về frontend kèm token. Luồng di động có session riêng để trình duyệt xác thực và ứng dụng nhận trạng thái.

Với mỗi API được bảo vệ, dependency giải mã JWT, lấy người dùng mới nhất từ cơ sở dữ liệu và từ chối nếu token không hợp lệ. Dependency admin kiểm tra `is_admin`. Cơ chế lấy lại dữ liệu người dùng mỗi request giúp thay đổi quyền hoặc số dư có hiệu lực mà không chờ JWT hết hạn.

## 3.7. Pipeline hội thoại và hỏi đáp

Người dùng tạo hội thoại hoặc chọn hội thoại cũ. Frontend gửi câu hỏi, `conversation_id`, ngôn ngữ và metadata đến endpoint chat. Backend thực hiện:

1. Kiểm tra JWT và số dư token.
2. Lấy sáu tin nhắn gần nhất.
3. Chuẩn hóa câu hỏi và xử lý nối tiếp.
4. Nhận diện ngôn ngữ và dịch sang tiếng Việt nếu cần.
5. Tra semantic cache theo scope.
6. Nếu cache hit, trả nội dung và nguồn bằng SSE.
7. Nếu cache miss, gọi FilesChatAgent.
8. Lưu tin nhắn người dùng và trợ lý.
9. Lưu chat log, nguồn, timeline, rating mặc định và lượng token.
10. Sinh tiêu đề cuộc hội thoại và câu hỏi liên quan.
11. Dịch đầu ra khi người dùng dùng tiếng Anh.
12. Trả kết quả theo REST, job polling hoặc SSE.

![Hình 3.2. Pipeline hỏi đáp RAG](figures/hinh_3_2_pipeline_hoi_dap_rag.svg)

SSE được dùng ở endpoint `/api/v1/chat/stream`. Frontend đọc từng event, đưa token vào hàng đợi hiển thị và cập nhật dần nội dung. Với cache hit, câu trả lời hoàn chỉnh được chia thành các đoạn nhỏ để tạo trải nghiệm streaming nhất quán. Với web fallback dài, backend có thể tạo job nền và frontend thăm dò endpoint trạng thái.

## 3.8. Pipeline TALRAG

Workflow LangGraph chính gồm các nút `retrieve`, `grade_documents`, `generate` và `handle_no_answer`. Luồng chi tiết:

1. Phân biệt chitchat, ngoài phạm vi và câu hỏi lịch sử.
2. Nhận diện loại factual, causal, temporal hoặc comparison.
3. Nhận diện thực thể, năm và triều đại.
4. Truy xuất tri thức đang chờ nếu có câu tương ứng.
5. Truy xuất user RAG.
6. Truy xuất global history.
7. Truy xuất kho dynamic đã phê duyệt.
8. Truy xuất kho chính Vertex hoặc OpenAI theo runtime.
9. Có thể truy xuất chỉ mục OpenAI cũ nếu cờ cấu hình bật.
10. Hợp nhất, loại trùng và gắn metadata nguồn.
11. Tái xếp hạng theo trọng số intent và entity.
12. Ưu tiên user RAG, global history, PDF và nguồn còn lại.
13. Lọc nghiêm ngặt theo thực thể khi cần.
14. Grade tài liệu bằng luật nhanh hoặc LLM.
15. Sinh câu trả lời theo mode phù hợp.
16. Làm sạch trích dẫn, remap nguồn và tạo danh sách source.
17. Nếu không có đủ dữ liệu, chuyển `handle_no_answer`.

Các mode trả lời gồm factual, hypothetical/counterfactual, user challenge, false claim correction và opinion analysis. Thiết kế mode giúp prompt không dùng một kiểu trả lời cho mọi câu hỏi.

## 3.9. Pipeline học từ web

Nhánh `handle_no_answer` chỉ kích hoạt web learning cho câu hỏi thuộc phạm vi lịch sử. WebLearningAgent:

1. Sinh truy vấn bằng luật và có thể dùng LLM.
2. Tìm kiếm qua DuckDuckGo.
3. Chấm ưu tiên miền nhà nước, cơ quan, bảo tàng và nguồn tin cậy.
4. Tải song song các trang trong giới hạn.
5. Trích nội dung bằng trafilatura hoặc BeautifulSoup.
6. Loại trang spam, nội dung hành chính không liên quan và nguồn bị chặn.
7. Chia nội dung thành chunk.
8. Lọc theo từ khóa và đánh giá liên quan theo lô.
9. Xác thực bằng LLM và sinh câu trả lời tạm thời.
10. Lưu vào pending knowledge khi độ tin cậy đạt yêu cầu.

![Hình 3.5. Pipeline TALRAG và học từ web có kiểm duyệt](figures/hinh_3_5_talrag_web_learning.png)

![Hình 3.6. Kiến trúc tự học dựa trên đánh giá độ tin cậy](figures/hinh_3_6_talrag_trust_aware.jpg)

Trong triển khai hiện tại, chỉ kết quả web có cờ confidence đạt điều kiện mới được lưu. Quản trị viên xem câu hỏi và câu trả lời, phê duyệt vào FAISS hoặc xóa. Phản hồi tiêu cực của tin nhắn cũng có thể được chuyển thành mục chờ để hiệu chỉnh.

## 3.10. Pipeline nạp dữ liệu

Ingestion đọc tài liệu, chuẩn hóa văn bản, chia đoạn có nhận thức tiếng Việt, gắn metadata và tạo embedding. Metadata có thể chứa tên file, nguồn, trang, tiêu đề, loại tài liệu và thông tin bổ sung. FAISS lưu vector trong `index.faiss`; docstore và ánh xạ được lưu trong `index.pkl`.

Pipeline hỗ trợ tạo mới, cập nhật và loại bỏ dữ liệu. Retriever có cache để tránh tải lại chỉ mục lớn; khi admin phê duyệt tri thức hoặc user RAG thay đổi, cache liên quan được làm mới.

![Hình 3.3. Pipeline nạp dữ liệu vào kho tri thức](figures/hinh_3_3_pipeline_nap_du_lieu.svg)

## 3.11. Thiết kế RAG cá nhân

Khi người dùng bôi chọn một đoạn trong câu trả lời, frontend mở thao tác lưu. Người dùng có thể giữ nguyên hoặc sửa nội dung. Backend xác minh quyền sở hữu message và conversation, lưu bản ghi, sau đó xây dựng lại chỉ mục cá nhân.

Người dùng cũng có thể tạo ghi chú thủ công từ màn hình Personal RAG. Mỗi lần thêm, sửa hoặc xóa, chỉ mục của đúng user được đồng bộ. Dữ liệu tài khoản này không được truy xuất cho tài khoản khác vì đường dẫn và truy vấn DB đều có `user_id`.

Thiết kế ưu tiên RAG cá nhân phục vụ mục tiêu học tập tùy biến, nhưng nội dung này được xem là ghi chú do người dùng cung cấp. Giao diện nguồn cần tiếp tục làm nổi bật nhãn “tri thức cá nhân” để tránh người dùng hiểu đó là nguồn sử học đã thẩm định.

## 3.12. Pipeline thanh toán và token

Người dùng chọn một gói token. Backend tạo payment trạng thái `pending`, sinh nội dung chuyển khoản có mã nhận diện và URL VietQR. Khi frontend kiểm tra trạng thái, backend gọi SePay để đối soát các giao dịch gần đây.

Một giao dịch chỉ được hoàn tất khi nội dung nhận diện phù hợp, số tiền đúng, `sepay_id` chưa được dùng và payment chưa hoàn tất. Sau đó hệ thống cập nhật trạng thái, cộng token và ghi token history. Payment pending hết hạn sau 15 phút theo logic ứng dụng. Người dùng có thể xem lịch sử và gửi báo cáo sự cố; admin xử lý, thay đổi trạng thái và có thể điều chỉnh token.

![Hình 3.4. Pipeline token, thanh toán và quản trị](figures/hinh_3_4_token_quan_tri.svg)

## 3.13. Module hỏi đáp luyện tập

Ngân hàng hiện có 59 câu hỏi tiếng Việt và 59 bản dịch tiếng Anh. Mỗi ngày hệ thống chọn năm câu theo user và ngày, hạn chế lặp lại cho đến khi ngân hàng gần cạn. Mỗi câu có đáp án, lời giải thích, thời kỳ và độ khó.

Cơ chế phần thưởng:

1. Điểm danh từ thứ hai đến thứ bảy: cộng 2 token.
2. Điểm danh Chủ nhật: cộng 5 token.
3. Chuỗi bảy ngày: thưởng thêm 10 token.
4. Đạt ba câu đúng: cộng 1 token.
5. Đạt năm câu đúng: cộng 2 token.
6. Bảng xếp hạng tuần: hạng nhất 5 token, hạng nhì 3 token, hạng ba 1 token.

Các khóa reward và unique constraint ngăn cộng trùng phần thưởng.

## 3.14. Module hỗ trợ

Người dùng có thể mở phòng hỗ trợ và gửi tin. Backend duy trì trạng thái admin online bằng heartbeat trong bộ nhớ. Nếu admin trực tuyến, tin nhắn được chuyển cho admin. Nếu admin ngoại tuyến, trợ lý AI hỗ trợ dựa trên lịch sử phòng và thông tin chức năng hệ thống.

Admin có danh sách phòng, xem hội thoại và gửi phản hồi. Đây là hỗ trợ vận hành sản phẩm, không dùng chung với pipeline hỏi đáp lịch sử để tránh trộn vai trò.

## 3.15. Module quản trị

Trang admin gồm các nhóm:

1. Dashboard thống kê người dùng, doanh thu, lưu lượng chat và thời kỳ lịch sử.
2. Quản lý người dùng, quyền admin và số dư.
3. Quản lý gói token.
4. Quản lý thanh toán.
5. Lịch sử token.
6. Chat log và hội thoại.
7. Login log.
8. Báo cáo sự cố thanh toán.
9. Phản hồi tiêu cực.
10. Tri thức chờ duyệt và đã duyệt.
11. Hỗ trợ người dùng.
12. Cấu hình hệ thống, SEO, landing page, prompt, AI và giao diện.
13. Gửi báo cáo hoạt động bảy ngày qua qua email.

Settings cho phép cấu hình logo, favicon, hình nền, tên website, SEO, token rate, no-answer message, game, tám thời kỳ, features, stats, highlights, footer, contact, system prompt và landing content.

## 3.16. Thiết kế cơ sở dữ liệu

SQLite được sử dụng vì phù hợp sản phẩm demo, dễ triển khai và sao lưu. Cơ sở dữ liệu có 21 bảng.

**Bảng 3.5. Thiết kế các nhóm bảng dữ liệu**

| Nhóm | Bảng | Vai trò |
|---|---|---|
| Tài khoản | `users`, `login_logs` | Hồ sơ, quyền, token, lịch sử đăng nhập |
| Token và payment | `packages`, `payments`, `payment_reports`, `token_history` | Gói, giao dịch, sự cố, biến động |
| Hội thoại | `conversations`, `messages`, `chat_logs` | Cuộc chat, tin nhắn, nguồn, rating, log |
| Cấu hình | `settings`, `base` | Key-value và bảng tương thích |
| Tri thức | `pending_knowledge`, `user_knowledge_likes`, `semantic_cache` | Chờ duyệt, lượt thích, cache |
| Học tập | `qa_checkins`, `qa_answers`, `qa_rewards` | Điểm danh, đáp án, thưởng |
| Hỗ trợ | `support_rooms`, `support_messages` | Phòng và tin hỗ trợ |
| Cá nhân hóa | `user_rag_items` | Ghi chú và nội dung RAG cá nhân |
| Web lịch sử | `global_history_items` | Nội dung crawler, hash, trạng thái và metadata |

Các bảng `messages` và `chat_logs` có mục đích khác nhau. `messages` phục vụ hiển thị hội thoại và chứa source/rating/timeline; `chat_logs` phục vụ thống kê hoạt động hỏi đáp, token, sentiment và era.

`global_history_items` có index cho topic, domain, content hash và URL để hỗ trợ chống trùng và truy vấn theo nguồn. `semantic_cache` lưu embedding dưới dạng dữ liệu tuần tự cùng scope và phiên bản KB.

## 3.17. Thiết kế ưu tiên nguồn

**Bảng 3.6. Quy tắc ưu tiên nguồn tri thức**

| Mức ưu tiên | Nguồn | Lý do |
|---:|---|---|
| 1 | RAG cá nhân | Người dùng chủ động lưu cho nhu cầu riêng |
| 2 | Global history | Nội dung đã crawl và gắn metadata |
| 3 | Kho tài liệu lịch sử chính | Nguồn PDF/DOCX/TXT đã ingestion |
| 4 | Dynamic/approved output | Tri thức mới đã phê duyệt |
| 5 | Web tạm thời | Chỉ dùng khi nội bộ thiếu, chưa mặc nhiên tin cậy |

Thứ tự thực tế còn phụ thuộc entity filter, score và cấu hình. Việc ưu tiên RAG cá nhân không đồng nghĩa nội dung đó chính xác hơn sử liệu; đây là ưu tiên cá nhân hóa và phải được gắn nhãn.

## 3.18. Thiết kế frontend

`App.tsx` điều phối các view: landing, chat, history, payment, Q&A, personal RAG, profile và admin. Sidebar cung cấp điều hướng. LanguageContext quản lý nhãn Việt/Anh. API module tập trung các request và header JWT.

`ChatView` quản lý hội thoại, SSE, job polling, hàng đợi token, trạng thái typing và câu hỏi liên quan. `ChatMessageItem` hiển thị Markdown, nguồn, đánh giá và thao tác lưu đoạn vào RAG cá nhân. `SourceModal` tải và định dạng nguồn.

`LandingPage` có hero, quy trình, tính năng, tám thời kỳ, thống kê, CTA và footer. `ProfileView` quản lý hồ sơ, avatar, mật khẩu, token và payment. `PaymentView` quản lý gói, hóa đơn, QR và báo cáo. `QAView` hiển thị điểm danh, câu hỏi, giải thích, hiệu ứng và bảng xếp hạng. `AdminView` chia tab theo các nhóm quản trị.

## 3.19. Thiết kế mobile

Capacitor dùng `webDir: dist` để đóng gói bản React đã build vào APK. Cấu hình production dùng tài nguyên cục bộ; dev mode có thể tải Vite server. App ID là `com.historical.chatbot`.

Flutter WebView là phương án wrapper khác. Ứng dụng:

1. Tải token từ SharedPreferences.
2. Tạo WebView có JavaScript.
3. Đặt cookie nhận diện mobile.
4. Chỉ cho điều hướng trong miền ứng dụng, callback, token hoặc Google.
5. Nhận message qua FlutterBridge.
6. Mở Google login bằng Custom Tab.
7. Tiêm token vào `localStorage` và phát event cho web.
8. Xóa token và cookie khi logout.
9. Hiển thị progress và màn hình thử lại khi mất kết nối.

## 3.20. Thiết kế mini-game

Sản phẩm có mini-game “Hào Khí Sơn Hà: Lam Sơn Khởi Nghĩa” xây dựng bằng Phaser. Người chơi điều khiển Lê Lợi, vượt qua quân Minh, thu thập vật phẩm, tiến đến ải Chi Lăng và đối đầu Liễu Thăng. Game có menu, preload, gameplay, UI, pause, game over và victory; bản tích hợp frontend còn sinh asset bằng canvas.

Mini-game có mục tiêu tăng tính tương tác và hứng thú. Nội dung game mang tính mô phỏng giáo dục, không được dùng thay cho mô tả sử học chính xác. Một số chi tiết cốt truyện cần được chú thích rõ giữa truyền thuyết và sự kiện.

## 3.21. Nhận xét thiết kế

Kiến trúc đã bao phủ cả nghiên cứu AI và yêu cầu sản phẩm. Điểm mạnh là tách rõ API, dữ liệu giao dịch, vector store và service AI; có vòng kiểm duyệt tri thức; có cá nhân hóa theo user; và có nhiều kênh tương tác.

Điểm cần tiếp tục hoàn thiện là tách SQLite sang DB server khi tải tăng, chuẩn hóa migration, tăng kiểm thử tự động, giảm bundle frontend, khóa CORS theo domain triển khai, gia cố endpoint file, quản lý secret tập trung và thống nhất một hướng đóng gói mobile để giảm chi phí bảo trì.

# CHƯƠNG 4. XÂY DỰNG, THỰC NGHIỆM VÀ ĐÁNH GIÁ HỆ THỐNG

## 4.1. Môi trường triển khai

Backend được phát triển bằng Python và FastAPI. Dữ liệu nghiệp vụ lưu trong SQLite; dữ liệu vector lưu trong FAISS. Pipeline AI dùng LangChain/LangGraph và lựa chọn LLM, embedding theo biến môi trường. Kết quả benchmark cuối sử dụng cấu hình LLM `vertex`, model `gemini-2.5-flash`, embedding `vertex`, temperature 0, vector store `utils/data_vector_new`.

Frontend dùng React 19, TypeScript và Vite 6. Các thư viện chính gồm Framer Motion, Lucide React, React Markdown, SweetAlert2, canvas-confetti và Phaser. Bản Android sử dụng Capacitor 8. Flutter wrapper khai báo Dart SDK 3.10.7, `webview_flutter`, `flutter_web_auth_2`, `shared_preferences` và `http`.

Hệ thống được kiểm tra nghiệm thu trong workspace ngày 13/06/2026. Bộ kết quả RAGAS cuối được ghi nhận ngày 11/06/2026.

## 4.2. Các chức năng đã xây dựng

**Bảng 4.1. Các chức năng đã xây dựng**

| Nhóm | Chức năng cụ thể | Trạng thái |
|---|---|---|
| Tài khoản | Đăng ký, đăng nhập, logout, Google OAuth | Đã xây dựng |
| Hồ sơ | Họ tên, avatar, ảnh bìa, mật khẩu | Đã xây dựng |
| Bảo mật | bcrypt, JWT, admin dependency | Đã xây dựng |
| Hội thoại | Tạo, xem, ghim, đổi tên, xóa | Đã xây dựng |
| Chat | REST, SSE, job polling, lịch sử gần | Đã xây dựng |
| RAG | FAISS, multi-source, adaptive rerank | Đã xây dựng |
| Lịch sử | Temporal, causal, entity, follow-up | Đã xây dựng |
| Nguồn | Lưu, lọc, remap, modal xem nội dung | Đã xây dựng |
| Cache | Semantic cache, TTL, scope, KB version | Đã xây dựng |
| Song ngữ | Giao diện Việt/Anh, dịch query/answer | Đã xây dựng |
| Web learning | Search, crawl, filter, verify, pending | Đã xây dựng |
| Tri thức | Approve, delete, negative feedback | Đã xây dựng |
| RAG cá nhân | Save selection, correction, note, CRUD | Đã xây dựng |
| Token | Số dư, trừ theo chat, lịch sử | Đã xây dựng |
| Thanh toán | Package, QR, SePay, status, report | Đã xây dựng |
| Q&A | 59 câu, 5 câu/ngày, check-in, reward | Đã xây dựng |
| Xếp hạng | Bảng tuần và thưởng top 3 | Đã xây dựng |
| Hỗ trợ | Phòng chat, admin, AI khi offline | Đã xây dựng |
| Quản trị | Dashboard và các tab nghiệp vụ | Đã xây dựng |
| Báo cáo | Email tổng hợp bảy ngày | Đã xây dựng |
| Mini-game | Lam Sơn - Chi Lăng bằng Phaser | Đã xây dựng |
| Mobile | Capacitor Android, Flutter WebView | Đã xây dựng |
| Đánh giá | Benchmark 100 câu, năm hệ thống | Đã xây dựng |

## 4.3. Giao diện sản phẩm

### 4.3.1. Trang giới thiệu

Trang giới thiệu trình bày giá trị của chatbot, quy trình sử dụng, nhóm tính năng, các thời kỳ lịch sử, số liệu nổi bật, nút bắt đầu và thông tin liên hệ. Nội dung và hình ảnh có thể cấu hình từ admin.

**[CHÈN HÌNH 4.5 TẠI ĐÂY]**  
*Hình 4.5. Giao diện trang chủ hệ thống.*  
Gợi ý ảnh chụp: phần hero có tên hệ thống, thanh điều hướng và nút bắt đầu.

### 4.3.2. Giao diện chat

Màn hình chat gồm sidebar hội thoại, vùng tin nhắn, ô nhập câu hỏi, trạng thái streaming, nguồn, đánh giá và câu hỏi gợi ý. Tin nhắn hỗ trợ Markdown. Người dùng có thể bôi chọn một đoạn để lưu vào RAG cá nhân.

**[CHÈN HÌNH 4.6 TẠI ĐÂY]**  
*Hình 4.6. Giao diện chat, câu trả lời streaming và nguồn tham khảo.*  
Gợi ý ảnh chụp: một câu hỏi lịch sử có tối thiểu hai nguồn và nút đánh giá.

### 4.3.3. Giao diện RAG cá nhân

Màn hình RAG cá nhân hiển thị ghi chú, đoạn đã lưu và bản hiệu chỉnh. Người dùng có thể thêm ghi chú thủ công, sửa hoặc xóa. Mỗi thao tác đồng bộ lại chỉ mục riêng.

**[CHÈN HÌNH 4.7 TẠI ĐÂY]**  
*Hình 4.7. Giao diện quản lý kho RAG cá nhân.*

### 4.3.4. Giao diện Q&A

Màn hình Q&A hiển thị điểm danh, chuỗi ngày, năm câu hỏi, đáp án, lời giải thích, tiến độ, phần thưởng và bảng xếp hạng tuần. Giao diện dùng hiệu ứng confetti khi đạt mốc.

**[CHÈN HÌNH 4.8 TẠI ĐÂY]**  
*Hình 4.8. Giao diện hỏi đáp luyện tập và bảng xếp hạng.*

### 4.3.5. Giao diện thanh toán

Người dùng chọn gói, xem hóa đơn, QR VietQR, nội dung chuyển khoản và trạng thái. Nếu có lỗi, modal báo cáo cho phép chọn loại sự cố, mô tả và liên hệ hỗ trợ.

**[CHÈN HÌNH 4.9 TẠI ĐÂY]**  
*Hình 4.9. Giao diện thanh toán bằng VietQR và kiểm tra trạng thái.*

### 4.3.6. Giao diện quản trị

Dashboard hiển thị thống kê, biểu đồ doanh thu, lưu lượng chat và phân bố thời kỳ. Các tab cho phép quản lý người dùng, gói token, thanh toán, chat log, login log, báo cáo, feedback, knowledge, support và settings.

**[CHÈN HÌNH 4.10 TẠI ĐÂY]**  
*Hình 4.10. Bảng điều khiển quản trị với các biểu đồ hoạt động.*

**[CHÈN HÌNH 4.11 TẠI ĐÂY]**  
*Hình 4.11. Giao diện quản trị tri thức chờ duyệt.*

### 4.3.7. Mini-game

Mini-game tái hiện không khí khởi nghĩa Lam Sơn theo hướng trò chơi hành động. Người chơi sử dụng bàn phím hoặc điều khiển cảm ứng, theo dõi sinh lực, đánh quân địch và boss.

**[CHÈN HÌNH 4.12 TẠI ĐÂY]**  
*Hình 4.12. Giao diện mini-game Hào Khí Sơn Hà: Lam Sơn Khởi Nghĩa.*

## 4.4. Trạng thái dữ liệu vận hành

Số liệu sau là ảnh chụp trạng thái database cục bộ ngày 13/06/2026. Đây là số liệu vận hành thử, không phải số liệu benchmark.

**Bảng 4.2. Trạng thái dữ liệu vận hành tại thời điểm nghiệm thu**

| Hạng mục | Số lượng |
|---|---:|
| Bảng dữ liệu | 21 |
| Tài khoản | 21 |
| Tài khoản quản trị | 1 |
| Tài khoản thường | 20 |
| Cuộc hội thoại | 607 |
| Tin nhắn | 2.287 |
| Tin nhắn người dùng | 1.149 |
| Tin nhắn trợ lý | 1.138 |
| Chat log | 1.374 |
| Login log | 597 |
| Lịch sử token | 1.550 |
| Payment | 107 |
| Payment hoàn tất | 11 |
| Tổng tiền payment hoàn tất | 140.000 đồng |
| Báo cáo payment | 12 |
| Pending knowledge | 102 |
| Pending chưa duyệt | 79 |
| Pending đã duyệt | 23 |
| Semantic cache | 4 |
| QA answer | 135 |
| QA check-in | 38 |
| QA reward | 27 |
| Support room | 3 |
| Support message | 58 |
| User RAG item | 2 |
| Global history item | 2 |

Có 93 payment ở trạng thái pending với tổng giá trị khai báo lớn; các payment này không được tính là doanh thu. Đây là hệ quả tự nhiên của việc người dùng tạo QR nhưng không hoàn tất hoặc bản ghi chưa hết vòng đời dọn dẹp.

Rating tin nhắn gồm 17 lượt tích cực, 4 lượt tiêu cực, 1 lượt ở mức -2 và phần lớn ở giá trị mặc định 0. Tỷ lệ phản hồi còn thấp so với tổng số tin nhắn, vì vậy chưa đủ để kết luận chắc chắn về mức hài lòng.

## 4.5. Quy mô kho vector

Kết quả đọc docstore FAISS:

| Chỉ mục | Số chunk | Dung lượng thư mục xấp xỉ |
|---|---:|---:|
| OpenAI | 107.638 | 824,6 MB |
| Vertex | 138.058 | 581,9 MB |
| Global history OpenAI | 11 | Một phần trong 143 KB |
| Global history Vertex | 11 | Một phần trong 143 KB |
| User RAG 21 - Vertex | Chỉ mục nhỏ | 4,1 KB |
| User RAG 22 - Vertex | Chỉ mục nhỏ | 4,1 KB |

Sự khác nhau về số chunk giữa OpenAI và Vertex cho thấy hai chỉ mục không hoàn toàn đồng nhất về lần ingestion hoặc cấu hình chia đoạn. Khi đánh giá so sánh mô hình embedding, cần kiểm soát cùng tập chunk để tránh nhiễu do corpus.

## 4.6. Thiết kế benchmark

Bộ benchmark cuối có 100 câu về lịch sử phong kiến Việt Nam từ năm 939 đến 1945. Mỗi câu gồm ID, độ khó, nhóm triều đại/chủ đề, câu hỏi và đáp án tham chiếu.

**Bảng 4.3. Cấu trúc bộ benchmark 100 câu**

| Mức độ | Số câu | Đặc trưng |
|---|---:|---|
| Easy | 40 | Dữ kiện, nhân vật, mốc thời gian |
| Medium | 35 | Giải thích nguyên nhân, vai trò, hệ quả |
| Hard | 25 | Tổng hợp, so sánh nhiều triều đại hoặc sự kiện |
| Tổng | 100 | Phủ các nhóm chính của lịch sử phong kiến |

Phân bố chủ đề:

| Nhóm | Số câu |
|---|---:|
| Ngô - Đinh - Tiền Lê | 11 |
| Lý - Trần | 20 |
| Hồ | 15 |
| Lê - Mạc - Lê Trung Hưng | 9 |
| Tây Sơn | 11 |
| Nguyễn | 9 |
| Tổng hợp phong kiến | 22 |
| Tổng hợp phương pháp | 3 |

Việc có 22 câu tổng hợp phong kiến làm tăng yêu cầu tổng hợp đa nguồn. Nhóm Hồ có 15 câu, cao hơn một số triều đại khác; do đó benchmark chưa hoàn toàn cân bằng theo triều đại, nhưng cân bằng theo ba mức độ.

## 4.7. Quy trình thực nghiệm

Quy trình gồm:

1. Chạy TALRAG trên 100 câu và lưu câu trả lời, context, source, latency.
2. Chạy ItihashQA Baseline trên cùng corpus và LLM.
3. Thu đầu ra từ NotebookLM, Gemini Gems và Custom GPT theo cùng câu hỏi.
4. Kiểm tra source validation.
5. Dùng RAGAS tính Faithfulness, Answer Relevancy, Context Precision và Context Recall.
6. Tổng hợp theo hệ thống và độ khó.
7. Vẽ biểu đồ.

File `source_validation_errors.csv` chỉ có dòng tiêu đề, nghĩa là không ghi nhận lỗi source validation trong lần tổng hợp cuối. Điều này không đồng nghĩa mọi nguồn đúng về mặt sử học; nó cho biết cấu trúc nguồn đáp ứng quy tắc kiểm tra tự động.

Tài liệu `evaluation/README_EVALUATION.md` và `SECTION_4_RAGAS_EVALUATION.md` còn mô tả thí nghiệm sơ bộ 30 câu với số liệu cũ. Báo cáo này dùng `results/ragas_scores_*.csv`, `results/tables/experiment_tables.md` và bài báo Ver 4 làm nguồn kết quả cuối. Bộ 30 câu chỉ được xem là giai đoạn thử nghiệm pipeline.

## 4.8. Kết quả RAGAS tổng thể

**Bảng 4.4. Kết quả RAGAS tổng thể**

| Hệ thống | Faithfulness | Answer Relevancy | Context Precision | Context Recall | Độ trễ TB |
|---|---:|---:|---:|---:|---:|
| TALRAG | 0,4009 | 0,4480 | 0,1972 | 0,1433 | 24,57 giây |
| ItihashQA Baseline | 0,4464 | 0,1562 | 0,1769 | 0,2150 | 4,90 giây |
| NotebookLM | 0,2784 | 0,1571 | 0,1841 | 0,2117 | Không đo |
| Gemini Gems | 0,5316 | 0,7685 | 0,1656 | 0,1967 | Không đo |
| Custom GPT | 0,3153 | 0,8642 | 0,1683 | 0,2300 | Không đo |

Trong file CSV, latency của ba hệ thống đóng được ghi 0 vì không có số đo chương trình, không phải thời gian phản hồi thực bằng 0 giây.

![Hình 4.1. So sánh RAGAS tổng thể giữa năm hệ thống](figures/hinh_4_1_ragas_tong_the.png)

TALRAG tăng Answer Relevancy từ 0,1562 của ItihashQA lên 0,4480, tương ứng:

\[
\frac{0,4480 - 0,1562}{0,1562} \times 100\% \approx 186,9\%
\]

Context Precision tăng từ 0,1769 lên 0,1972, tương đương khoảng 11,5%. Tuy nhiên, Faithfulness giảm khoảng 10,2%, Context Recall giảm khoảng 33,3% và latency cao gấp khoảng 5 lần baseline.

## 4.9. Kết quả theo độ khó

**Bảng 4.5. Kết quả RAGAS theo độ khó**

| Độ khó | Hệ thống | Faithfulness | Answer Relevancy | Context Precision | Context Recall | Latency |
|---|---|---:|---:|---:|---:|---:|
| Easy | TALRAG | 0,3329 | 0,5638 | 0,0909 | 0,0500 | 27,67 s |
| Easy | ItihashQA | 0,2125 | 0,0227 | 0,0083 | 0,0250 | 3,93 s |
| Easy | NotebookLM | 0,0625 | 0,0229 | 0,0000 | 0,0250 | Không đo |
| Easy | Gemini Gems | 0,3964 | 0,7875 | 0,0083 | 0,0000 | Không đo |
| Easy | Custom GPT | 0,1159 | 0,8543 | 0,0083 | 0,0000 | Không đo |
| Medium | TALRAG | 0,4030 | 0,5670 | 0,1925 | 0,1714 | 24,76 s |
| Medium | ItihashQA | 0,5290 | 0,2997 | 0,3555 | 0,4000 | 5,33 s |
| Medium | NotebookLM | 0,4491 | 0,2987 | 0,3762 | 0,4571 | Không đo |
| Medium | Gemini Gems | 0,6256 | 0,8055 | 0,3476 | 0,4286 | Không đo |
| Medium | Custom GPT | 0,4619 | 0,8680 | 0,3248 | 0,5143 | Không đo |
| Hard | TALRAG | 0,5066 | 0,0962 | 0,3738 | 0,2533 | 19,36 s |
| Hard | ItihashQA | 0,7048 | 0,1688 | 0,1964 | 0,2600 | 5,85 s |
| Hard | NotebookLM | 0,3847 | 0,1734 | 0,2096 | 0,1667 | Không đo |
| Hard | Gemini Gems | 0,6239 | 0,6792 | 0,1626 | 0,1867 | Không đo |
| Hard | Custom GPT | 0,4290 | 0,8747 | 0,2053 | 0,2000 | Không đo |

![Hình 4.2. So sánh RAGAS theo độ khó](figures/hinh_4_2_ragas_theo_do_kho.png)

## 4.10. Phân tích kết quả

### 4.10.1. Answer Relevancy

Đây là điểm mạnh rõ nhất của TALRAG so với baseline tái lập. Ở câu dễ và trung bình, TALRAG đạt khoảng 0,56, trong khi baseline lần lượt 0,02 và 0,30. Phân loại intent, xử lý nối tiếp và prompt theo mode giúp câu trả lời đi thẳng vào yêu cầu hơn.

Ở câu khó, Answer Relevancy của TALRAG giảm còn 0,0962. Điều này cho thấy pipeline hiện chưa ổn định với câu tổng hợp đa triều đại. Một khả năng là entity filter hoặc document grading loại quá nhiều context; khả năng khác là câu trả lời chuyển sang dạng thiếu dữ liệu hoặc dùng nguồn không đủ để tổng hợp. Cần phân tích lỗi theo từng câu thay vì chỉ nhìn trung bình.

### 4.10.2. Faithfulness

TALRAG không vượt ItihashQA về Faithfulness tổng thể. Ở câu dễ, TALRAG tốt hơn baseline; nhưng ở medium và hard thấp hơn. Pipeline phức tạp có thể đưa thêm nguồn dynamic/web/personal hoặc sinh diễn giải dài, làm tăng số mệnh đề cần được context hỗ trợ.

Để cải thiện, cần yêu cầu trích dẫn ở cấp mệnh đề, giảm nội dung suy rộng, thêm entailment check sau generation và thực hiện ablation để xác định thành phần nào làm giảm faithfulness.

### 4.10.3. Context Precision

TALRAG đạt Context Precision tổng thể 0,1972, nhỉnh hơn baseline. Ở câu hard, TALRAG đạt 0,3738, gần gấp đôi baseline 0,1964. Đây là tín hiệu tốt cho adaptive reranking trong truy vấn phân tích.

Tuy nhiên, ở câu medium, TALRAG thấp hơn baseline. Trọng số hoặc entity rule có thể ưu tiên tài liệu rất sát một thực thể nhưng bỏ qua đoạn giải thích nền. Cần adaptive top-k và threshold theo confidence thay vì chỉ top-k cố định.

### 4.10.4. Context Recall

Context Recall là hạn chế chính. Tổng thể TALRAG 0,1433 thấp hơn baseline 0,2150. Việc lọc tài liệu nhiều tầng làm giảm nhiễu nhưng có thể bỏ mất bằng chứng cần thiết. Câu medium đặc biệt cho thấy baseline 0,40 trong khi TALRAG 0,1714.

Hướng cải thiện gồm truy xuất nhiều nhánh, query expansion, hybrid BM25-vector, merge theo sub-question, reciprocal rank fusion và nới grader cho câu hỏi cần tổng hợp.

### 4.10.5. Độ trễ

TALRAG có latency 24,57 giây, cao hơn baseline 4,90 giây. Chi phí đến từ phân loại bằng LLM khi cần, nhiều kho FAISS, grader, dịch, source processing, generation, web fallback và related question generation.

Đáng chú ý, câu dễ có latency cao nhất 27,67 giây, câu khó thấp nhất 19,36 giây. Điều này cho thấy độ trễ không chỉ phụ thuộc độ khó mà còn phụ thuộc cache, số nhánh, độ dài tài liệu và fallback.

Hướng tối ưu:

1. Mặc định classifier và grader dùng luật nhanh.
2. Chỉ dùng LLM grader khi confidence thấp.
3. Tải trước FAISS và giữ singleton.
4. Chạy dịch nguồn, related question và một số bước hậu xử lý song song.
5. Cache kết quả dịch và query classification.
6. Dùng adaptive top-k nhỏ cho câu factual.
7. Chuyển fallback web hoàn toàn sang job nền.
8. Theo dõi latency từng node thay vì chỉ tổng thời gian.

### 4.10.6. So sánh với hệ thống đóng

Gemini Gems và Custom GPT có Answer Relevancy cao hơn TALRAG. Gemini Gems cũng có Faithfulness cao nhất trong bảng tổng thể. Kết quả này bác bỏ phát biểu tuyệt đối rằng TALRAG “vượt tất cả hệ thống” trên mọi chỉ số.

Ưu thế của TALRAG nằm ở tính minh bạch, khả năng tái lập, quyền kiểm soát corpus, truy xuất đa nguồn và vòng cập nhật tri thức. Hệ thống đóng có ưu thế mô hình nền và tối ưu nội bộ, nhưng khó phân tích hoặc sửa retrieval. Báo cáo vì vậy kết luận TALRAG vượt baseline RAG tĩnh rõ rệt về Answer Relevancy, không kết luận vượt toàn diện các trợ lý thương mại.

![Hình 4.3. So sánh chỉ số cấp câu trả lời](figures/hinh_4_3_chi_so_cau_tra_loi.png)

![Hình 4.4. So sánh chỉ số cấp ngữ cảnh](figures/hinh_4_4_chi_so_ngu_canh.png)

## 4.11. Kiểm tra kỹ thuật

**Bảng 4.6. Kết quả kiểm tra kỹ thuật ngày 13/06/2026**

| Hạng mục | Kết quả | Ghi chú |
|---|---|---|
| Build frontend React production | Thành công | 2.455 module được transform |
| Build mini-game Phaser | Thành công | 23 module được transform |
| Cú pháp Python | Thành công | `compileall` trên app/chatbot/ingestion/eval |
| Phân loại intent | Thành công | Causal, temporal, comparison, factual đúng mẫu |
| Temporal score | Thành công | Cùng năm = 1,0; cách 276 năm = 0,15 |
| Causal score | Thành công | Mẫu nhân quả = 1,0; mẫu factual = 0,0 |
| Source validation file | Không có lỗi ghi nhận | File chỉ có header |
| Flutter analyze | Chưa thực hiện | Flutter SDK không có trong PATH |

Frontend build có cảnh báo chunk JavaScript chính khoảng 1.133 KB trước gzip, vượt ngưỡng 500 KB. Mini-game có chunk khoảng 1.552 KB trước gzip. Đây là cảnh báo hiệu năng, không làm build thất bại. Cần code splitting, lazy import Phaser và manual chunks.

## 4.12. Kịch bản kiểm thử nghiệm thu

**Bảng 4.7. Kịch bản kiểm thử nghiệm thu**

| Mã | Kịch bản | Kết quả mong đợi |
|---|---|---|
| TC-01 | Đăng ký tài khoản mới | Tạo user, mật khẩu được băm |
| TC-02 | Đăng nhập sai mật khẩu | Trả lỗi, không phát JWT |
| TC-03 | Đăng nhập đúng | Trả JWT và hồ sơ an toàn |
| TC-04 | Google OAuth | Tạo/cập nhật user và chuyển về app |
| TC-05 | Truy cập admin bằng user thường | Bị từ chối |
| TC-06 | Tạo hội thoại | Sinh conversation thuộc đúng user |
| TC-07 | Hỏi factual | Trả lời có nguồn và lưu message |
| TC-08 | Hỏi temporal | Tăng trọng số thời gian |
| TC-09 | Hỏi causal | Tăng trọng số nhân quả |
| TC-10 | Hỏi comparison | Top-k bằng 15 |
| TC-11 | Hỏi ngoài phạm vi | Từ chối hoặc định hướng |
| TC-12 | Hỏi nối tiếp dùng “ông ấy” | Viết lại theo thực thể trước |
| TC-13 | Câu hỏi gần cache | Cache hit đúng scope |
| TC-14 | Cập nhật KB | Cache phiên bản cũ bị vô hiệu |
| TC-15 | Thiếu dữ liệu nội bộ | Kích hoạt web fallback |
| TC-16 | Web result chưa duyệt | Chỉ nằm trong pending |
| TC-17 | Admin approve | Nạp FAISS, cập nhật trạng thái |
| TC-18 | Lưu đoạn vào user RAG | Chỉ mục đúng user được cập nhật |
| TC-19 | User khác hỏi cùng nội dung | Không thấy RAG riêng của user trước |
| TC-20 | Tạo payment | Có mã QR và payment pending |
| TC-21 | Giao dịch đúng | Payment completed và cộng token một lần |
| TC-22 | SePay ID trùng | Không cộng token lần hai |
| TC-23 | Điểm danh hai lần/ngày | Lần hai không được thưởng |
| TC-24 | Đạt mốc quiz | Cộng đúng reward, không trùng |
| TC-25 | Admin offline trong support | AI hỗ trợ trả lời |
| TC-26 | SSE | Nội dung hiển thị dần và kết thúc đúng |
| TC-27 | Xóa hội thoại | Chỉ chủ sở hữu được xóa |
| TC-28 | Tải file không hợp lệ | Bị từ chối theo loại/kích thước |
| TC-29 | Chuyển ngôn ngữ English | UI và answer chuyển sang tiếng Anh |
| TC-30 | Build Android | APK tạo được và tải qua endpoint |

Các kịch bản trên là bộ nghiệm thu đề xuất. Trong lần rà soát hiện tại, build và thuật toán lõi đã được chạy; toàn bộ 30 kịch bản chưa được tự động hóa thành test suite CI.

## 4.13. Đánh giá an toàn và rủi ro

### 4.13.1. Điểm đã thực hiện

1. Mật khẩu dùng bcrypt.
2. API riêng dùng JWT.
3. Quyền admin được kiểm tra tại backend.
4. RAG cá nhân có `user_id`.
5. Payment có kiểm tra số tiền, mã giao dịch và chống cộng trùng.
6. Tri thức web có vùng pending.
7. Avatar giới hạn loại file và 5 MB.
8. Semantic cache có tenant, KB và user scope.

### 4.13.2. Vấn đề cần khắc phục

**Thông tin bí mật trong script thử nghiệm:** một script phụ trợ hiện chứa credential SePay dạng hard-code. Credential này phải được thu hồi/rotate, xóa khỏi lịch sử Git nếu đã commit và chuyển sang biến môi trường. Không được sử dụng script đó trong báo cáo trình diễn hoặc kho mã công khai.

**CORS quá rộng:** backend đang dùng `allow_origins=["*"]`. Khi triển khai production cần giới hạn đúng domain web/app.

**Đường dẫn file:** endpoint download/view ghép `filename` vào thư mục. Cần dùng `Path.resolve()`, kiểm tra đường dẫn nằm trong thư mục cho phép và chỉ dùng tên file đã cấp phát để ngăn path traversal.

**SQLite:** phù hợp demo nhưng hạn chế khi có nhiều request ghi đồng thời. Nên chuyển PostgreSQL và migration Alembic khi triển khai nhiều người dùng.

**Secret và URL:** các URL ngrok, frontend và cấu hình mobile đang viết cố định trong file. Cần build flavor và biến môi trường.

**Test cache:** script semantic cache thao tác trực tiếp database chính, xóa cache và tăng KB version. Cần dùng database tạm trong test.

**Web content:** kiểm tra độ tin cậy hiện phụ thuộc luật và LLM; vẫn cần admin và danh sách nguồn được quản lý.

**Prompt injection:** nội dung web và user RAG có thể chứa chỉ dẫn độc hại. Cần tách data/prompt, lọc instruction và đặt policy rõ trong system prompt.

**Upload:** cần quét malware, chuẩn hóa MIME thực và hạn chế quyền truy cập.

## 4.14. Các tồn tại

**Bảng 4.8. Các tồn tại và mức độ ưu tiên khắc phục**

| Vấn đề | Tác động | Ưu tiên |
|---|---|---|
| Credential trong script thử nghiệm | Rò rỉ dịch vụ/thanh toán | Rất cao |
| CORS wildcard | Bề mặt truy cập rộng | Cao |
| File path chưa canonicalize chặt | Nguy cơ đọc file ngoài thư mục | Cao |
| Context Recall thấp | Thiếu bằng chứng | Cao |
| Latency 24,57 giây | Trải nghiệm chậm | Cao |
| Thiếu test tự động toàn diện | Dễ hồi quy | Cao |
| Bundle frontend/game lớn | Tải chậm trên mobile | Trung bình |
| SQLite | Hạn chế mở rộng | Trung bình |
| Hai hướng mobile | Tăng chi phí bảo trì | Trung bình |
| Tài liệu đánh giá cũ 30 câu | Dễ gây mâu thuẫn báo cáo | Trung bình |
| Tên package/title cũ ở một số cấu hình | Giảm tính chuyên nghiệp | Thấp |
| Nội dung game có hư cấu hóa | Có thể gây hiểu sai lịch sử | Trung bình |

## 4.15. Đánh giá chung chương

Hệ thống đã được xây dựng vượt phạm vi của một chatbot đơn giản. Sản phẩm có đầy đủ luồng tài khoản, hội thoại, AI, dữ liệu, thanh toán, học tập, hỗ trợ, quản trị và mobile. TALRAG chứng minh lợi ích rõ về Answer Relevancy so với baseline tĩnh và đạt Context Precision tốt ở nhóm câu khó.

Kết quả đồng thời cho thấy hệ thống chưa đạt trạng thái tối ưu. Faithfulness, Context Recall và latency cần được xem là mục tiêu kỹ thuật tiếp theo. Việc thừa nhận và định lượng các hạn chế giúp kết quả nghiên cứu có giá trị hơn so với chỉ báo cáo các trường hợp thành công.

# CHƯƠNG 5. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

## 5.1. Kết luận

Đề tài đã xây dựng được hệ thống chatbot Lịch sử Việt Nam sử dụng trí tuệ nhân tạo theo kiến trúc RAG và phát triển thành một sản phẩm phần mềm có khả năng vận hành. Hệ thống tiếp nhận câu hỏi tự nhiên, truy xuất tri thức từ FAISS, xử lý ngữ cảnh hội thoại, tạo câu trả lời, streaming về giao diện, lưu lịch sử, hiển thị nguồn và nhận phản hồi.

Về mặt nghiên cứu, TALRAG mở rộng RAG tĩnh bằng phân loại ý định và tái xếp hạng theo ngữ nghĩa, thời gian, nhân quả và thực thể. Hệ thống có nhiều nguồn tri thức gồm kho chính, global history, dynamic knowledge và RAG cá nhân. Khi thiếu dữ liệu, hệ thống có thể tìm kiếm web và đưa kết quả vào vòng kiểm duyệt trước khi nạp thành bộ nhớ dài hạn.

Về mặt sản phẩm, đề tài đã tích hợp xác thực JWT, Google OAuth, hồ sơ, hội thoại, token, thanh toán SePay/VietQR, Q&A, phần thưởng, bảng xếp hạng, hỗ trợ, admin dashboard, cấu hình giao diện, báo cáo tuần, mini-game và ứng dụng Android. Việc tích hợp này chứng minh khả năng chuyển một pipeline nghiên cứu thành nền tảng phục vụ người dùng.

Về thực nghiệm, TALRAG cải thiện rõ Answer Relevancy so với ItihashQA Baseline, với mức tăng 186,9%, đồng thời cải thiện nhẹ Context Precision. Kết quả xác nhận giá trị của truy xuất theo ý định và chọn lọc ngữ cảnh. Tuy nhiên, Faithfulness và Context Recall chưa vượt baseline, còn độ trễ cao. Vì vậy, kết luận phù hợp là TALRAG cải thiện tính tập trung của câu trả lời và khả năng chọn context, nhưng cần tối ưu cân bằng bằng chứng và hiệu năng.

## 5.2. Mức độ hoàn thành theo đề cương

**Bảng 5.1. Mức độ hoàn thành sản phẩm theo đề cương**

| Sản phẩm dự kiến | Minh chứng | Mức độ |
|---|---|---|
| Chatbot AI Lịch sử Việt Nam | Backend, frontend, chat REST/SSE | Hoàn thành |
| Kho tri thức lịch sử số | FAISS OpenAI/Vertex, hơn 100 nghìn chunk mỗi chỉ mục | Hoàn thành |
| Hệ thống quản trị | 27 endpoint admin và giao diện nhiều tab | Hoàn thành |
| Cơ chế kiểm duyệt tri thức | Pending, approve, delete, feedback | Hoàn thành |
| Web/mobile | React web, Capacitor APK, Flutter wrapper | Hoàn thành |
| RAG cá nhân | CRUD và chỉ mục tách user | Hoàn thành |
| Đánh giá khoa học | Benchmark 100 câu, RAGAS năm hệ thống | Hoàn thành |
| Công bố khoa học | Bản thảo TALRAG Ver 4 | Đã có sản phẩm |
| Demo/chuyển giao | Có build production và APK trong dự án | Đạt mức demo |
| Tối ưu quy mô production | Chưa có load test, DB server, security audit độc lập | Chưa hoàn tất |

## 5.3. Đóng góp chính

1. Xây dựng một hệ thống hỏi đáp chuyên biệt cho Lịch sử Việt Nam có nguồn.
2. Hiện thực hóa adaptive retrieval theo ý định factual, causal, temporal và comparison.
3. Kết hợp temporal score, causal score và entity-aware adjustment.
4. Xây dựng multi-source RAG và quy tắc ưu tiên nguồn.
5. Xây dựng semantic cache có scope, TTL và KB version.
6. Xây dựng self-learning có kiểm duyệt từ web, phản hồi và admin.
7. Xây dựng RAG cá nhân tách theo tài khoản.
8. Tích hợp song ngữ Việt - Anh và xử lý câu hỏi nối tiếp.
9. Xây dựng sản phẩm web/mobile có quản trị, thanh toán và học tập.
10. Xây dựng benchmark 100 câu và đánh giá có đối sánh.

## 5.4. Hạn chế

Thứ nhất, kết quả RAGAS chưa đồng đều. TALRAG tập trung tốt vào câu hỏi nhưng còn thiếu bằng chứng, đặc biệt ở nhóm medium và hard. Context Recall thấp cho thấy grader hoặc entity filter có thể quá chặt.

Thứ hai, độ trễ trung bình cao. Pipeline nhiều bước tạo chi phí đáng kể so với baseline. Semantic cache mới có ít dữ liệu trong ảnh chụp vận hành nên chưa phát huy tối đa.

Thứ ba, corpus và metadata chưa được mô tả đầy đủ ở cấp tài liệu gốc. Hai chỉ mục embedding có số chunk khác nhau, gây khó cho thí nghiệm so sánh tuyệt đối.

Thứ tư, đánh giá dùng RAGAS phụ thuộc LLM judge. Điểm số có thể thay đổi theo model, phiên bản và prompt. Ba hệ thống đóng không công khai retrieval nên context metrics không hoàn toàn tương đương.

Thứ năm, kiểm thử tự động chưa bao phủ toàn bộ 77 endpoint và các luồng thanh toán, OAuth, SSE, mobile. Flutter chưa được analyze trong môi trường nghiệm thu vì thiếu SDK.

Thứ sáu, hệ thống còn vấn đề hardening: credential trong script phụ trợ, CORS rộng, file path cần bảo vệ, cấu hình URL cố định và SQLite chưa phù hợp tải lớn.

Thứ bảy, mini-game sử dụng một số tình tiết hư cấu hóa để tạo gameplay. Nội dung như việc nhân vật trực tiếp tiêu diệt tướng địch cần được gắn nhãn mô phỏng; phần thuyết minh phải phân biệt sử kiện, truyền thuyết và sáng tạo.

## 5.5. Hướng phát triển

### 5.5.1. Cải tiến retrieval

1. Kết hợp BM25 và vector retrieval.
2. Dùng reciprocal rank fusion cho nhiều query.
3. Tách câu hỏi khó thành sub-question.
4. Dùng adaptive top-k, threshold và grader strength theo độ khó.
5. Bổ sung reranker học máy sử dụng dữ liệu đánh giá.
6. Chuẩn hóa temporal metadata ở cấp chunk.
7. Xây dựng knowledge graph nhân vật - sự kiện - địa điểm - thời gian.

### 5.5.2. Cải tiến generation

1. Trích dẫn ở cấp câu hoặc mệnh đề.
2. Thêm post-generation entailment check.
3. Tách fact, interpretation và hypothesis trong output.
4. Hạn chế sinh nội dung ngoài context.
5. Bổ sung chế độ trả lời ngắn, học tập và nghiên cứu.

### 5.5.3. Cải tiến self-learning

1. Chấm độ tin cậy nguồn bằng nhiều tín hiệu.
2. Lưu provenance đầy đủ cho mỗi chunk.
3. Yêu cầu hai quản trị viên duyệt với nội dung nhạy cảm.
4. Phát hiện mâu thuẫn giữa tri thức mới và kho hiện có.
5. Cho phép rollback theo phiên bản knowledge base.
6. Xây dựng dashboard theo dõi vòng đời pending.

### 5.5.4. Cải tiến hiệu năng

1. Dùng singleton cho model và FAISS.
2. Bất đồng bộ hóa source translation và related question.
3. Cache nhiều lớp bằng Redis.
4. Lazy load mini-game và admin.
5. Chia bundle frontend.
6. Theo dõi p50, p95, p99 latency theo node.
7. Giới hạn độ dài context bằng token budget động.

### 5.5.5. Cải tiến hạ tầng

1. Chuyển SQLite sang PostgreSQL.
2. Dùng Alembic migration.
3. Dùng object storage cho file.
4. Đóng gói Docker và CI/CD.
5. Quản lý secret bằng secret manager.
6. Thêm backup và disaster recovery.
7. Thêm monitoring, alert và audit log.

### 5.5.6. Cải tiến đánh giá

1. Mở rộng benchmark theo thời kỳ hiện đại, văn hóa, địa phương.
2. Cân bằng số câu theo triều đại.
3. Mời giảng viên lịch sử thẩm định ground truth.
4. Đánh giá factual error ở cấp mệnh đề.
5. Thực hiện ablation cho temporal, causal, entity, grader và cache.
6. Đánh giá người dùng về hữu ích, dễ hiểu và niềm tin.
7. Chạy load test và security test.

### 5.5.7. Mở rộng giáo dục

1. Bản đồ lịch sử tương tác.
2. Timeline theo triều đại.
3. Truy xuất hình ảnh, bản đồ, văn bản Hán Nôm và hiện vật.
4. Lộ trình học cá nhân.
5. Bộ đề theo chương trình phổ thông.
6. Chế độ dành cho giáo viên để tạo lớp và bài tập.
7. Giải thích thuật ngữ và liên kết đọc thêm.

## 5.6. Kiến nghị nghiệm thu

Căn cứ vào mã nguồn, chức năng đã xây dựng, dữ liệu vận hành, kết quả build và bộ đánh giá 100 câu, nhóm thực hiện đề nghị công nhận đề tài đã hoàn thành các mục tiêu cốt lõi theo đề cương ở mức sản phẩm nghiên cứu và demo ứng dụng. Hệ thống đủ điều kiện trình diễn các luồng chính gồm đăng nhập, hỏi đáp có nguồn, RAG cá nhân, thanh toán, Q&A, quản trị và kiểm duyệt tri thức.

Đề tài cần tiếp tục được hoàn thiện trước khi triển khai production quy mô lớn, đặc biệt ở bảo mật secret, CORS, file access, cơ sở dữ liệu, kiểm thử tự động, độ trễ và Context Recall. Những công việc này được xem là giai đoạn nâng cấp sản phẩm, không phủ nhận kết quả nghiên cứu và khối lượng chức năng đã hoàn thành.

# TÀI LIỆU THAM KHẢO

[1] P. Lewis et al., “Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks,” *Advances in Neural Information Processing Systems*, vol. 33, pp. 9459-9474, 2020.

[2] V. Karpukhin et al., “Dense Passage Retrieval for Open-Domain Question Answering,” *Proceedings of EMNLP*, 2020.

[3] J. Johnson, M. Douze, and H. Jégou, “Billion-scale Similarity Search with GPUs,” *IEEE Transactions on Big Data*, vol. 7, no. 3, pp. 535-547, 2019.

[4] N. Reimers and I. Gurevych, “Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks,” *Proceedings of EMNLP-IJCNLP*, 2019.

[5] Y. Gao et al., “Retrieval-Augmented Generation for Large Language Models: A Survey,” arXiv:2312.10997, 2024.

[6] A. Asai et al., “Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection,” *ICLR*, 2024.

[7] S. Q. Yan, J. C. Gu, Y. Z. Zhu, and Z. H. Ling, “Corrective Retrieval Augmented Generation,” arXiv:2401.15884, 2024.

[8] B. Dhingra et al., “Time-Aware Language Models as Temporal Knowledge Bases,” *Transactions of the Association for Computational Linguistics*, vol. 10, pp. 257-273, 2022.

[9] D. Edge et al., “From Local to Global: A GraphRAG Approach to Query-Focused Summarization,” arXiv:2404.16130, 2024.

[10] A. Vaswani et al., “Attention Is All You Need,” *Advances in Neural Information Processing Systems*, 2017.

[11] J. Devlin, M. W. Chang, K. Lee, and K. Toutanova, “BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding,” *Proceedings of NAACL-HLT*, pp. 4171-4186, 2019.

[12] Z. Ji et al., “Survey of Hallucination in Natural Language Generation,” *ACM Computing Surveys*, vol. 55, no. 12, pp. 1-38, 2023.

[13] R. Nogueira and K. Cho, “Passage Re-ranking with BERT,” arXiv:1901.04085, 2019.

[14] N. Thakur et al., “BEIR: A Heterogeneous Benchmark for Zero-shot Evaluation of Information Retrieval Models,” *NeurIPS Datasets and Benchmarks*, 2021.

[15] E. Riloff and J. Thelen, “A Rule-based Question Answering System for Reading Comprehension Tests,” *ANLP/NAACL Workshop*, pp. 13-21, 2000.

[16] D. Q. Nguyen and A. T. Nguyen, “PhoNLP: A Joint Multi-task Learning Model for Vietnamese Part-of-Speech Tagging, Named Entity Recognition and Dependency Parsing,” arXiv:2011.01544, 2020.

[17] L. Ouyang et al., “Training Language Models to Follow Instructions with Human Feedback,” *Advances in Neural Information Processing Systems*, 2022.

[18] OpenAI, “GPT-4 Technical Report,” arXiv:2303.08774, 2023.

[19] A. D. Himu, M. S. Azad, R. Rahman, and M. R. Hasan, “ItihashQA: A Conversational Question Answering System Applied in Bangladeshi Historical Context,” GitHub repository, 2024.

[20] Google, “NotebookLM,” https://notebooklm.google/.

[21] Google, “Gemini Gems,” https://gemini.google.com/.

[22] A. K. NgoHo, A. K. NgoHo, and K. D. Vo, “GVEC: A Vietnamese Large Language Models Chatbot for Economy,” *MAPR 2024*, Hanoi, Vietnam, 2024.

[23] A. K. NgoHo, K. D. Vo, and A. K. NgoHo, “VQABG: Vietnamese Question/Answers Benchmark Generator,” *CTU Journal of Innovation and Sustainable Development*, vol. 16, pp. 80-90, 2024.

[24] Chính phủ Việt Nam, Quyết định số 749/QĐ-TTg ngày 03/06/2020 về Chương trình Chuyển đổi số quốc gia.

[25] Chính phủ Việt Nam, Quyết định số 131/QĐ-TTg ngày 25/01/2022 về tăng cường ứng dụng công nghệ thông tin và chuyển đổi số trong giáo dục và đào tạo.

# PHỤ LỤC A. DANH SÁCH ENDPOINT

## A.1. Auth

| Method | Endpoint | Chức năng |
|---|---|---|
| POST | `/api/v1/auth/register` | Đăng ký |
| POST | `/api/v1/auth/login` | Đăng nhập |
| GET | `/api/v1/auth/google/login` | Bắt đầu Google OAuth |
| GET | `/api/v1/auth/google/callback` | Nhận callback |
| GET | `/api/v1/auth/tokens/history` | Lịch sử token |
| POST | `/api/v1/auth/tokens/transaction` | Điều chỉnh token theo quyền |
| PUT | `/api/v1/auth/profile` | Cập nhật hồ sơ |
| POST | `/api/v1/auth/upload-avatar` | Tải avatar |
| GET | `/api/v1/auth/check` | Kiểm tra đăng nhập |

## A.2. Chatbot

| Method | Endpoint | Chức năng |
|---|---|---|
| POST | `/api/v1/new_chat` | Tạo hội thoại |
| GET | `/api/v1/conversations` | Danh sách hội thoại |
| GET | `/api/v1/messages/{conversation_id}` | Tin nhắn |
| DELETE | `/api/v1/conversation/{conversation_id}` | Xóa |
| PUT | `/api/v1/conversation/{conversation_id}` | Đổi tên/ghim |
| POST | `/api/v1/message/{message_id}/rate` | Đánh giá |
| POST | `/api/v1/chat` | Chat REST |
| GET | `/api/v1/chat/jobs/{job_id}` | Trạng thái job |
| POST | `/api/v1/chat_stream` | Streaming phiên bản cũ |
| POST | `/api/v1/chat/stream` | SSE phiên bản hiện tại |
| GET | `/api/v1/history` | Lịch sử chat log |
| DELETE | `/api/v1/history` | Xóa lịch sử |
| GET | `/api/v1/config` | Cấu hình site |
| GET | `/api/v1/source/{filename}` | Nội dung nguồn |
| POST | `/api/v1/source/format` | Định dạng nguồn |

## A.3. Payment

| Method | Endpoint | Chức năng |
|---|---|---|
| GET | `/api/v1/payment/packages` | Danh sách gói |
| POST | `/api/v1/payment/create` | Tạo payment |
| GET | `/api/v1/payment/status/{payment_id}` | Kiểm tra |
| GET | `/api/v1/payment/my-payments` | Lịch sử |
| POST | `/api/v1/payment/report` | Báo cáo sự cố |

## A.4. Q&A

| Method | Endpoint | Chức năng |
|---|---|---|
| GET | `/api/v1/qa/status` | Trạng thái học |
| POST | `/api/v1/qa/checkin` | Điểm danh |
| GET | `/api/v1/qa/questions` | Năm câu mỗi ngày |
| POST | `/api/v1/qa/answer` | Nộp đáp án |
| GET | `/api/v1/qa/leaderboard` | Xếp hạng tuần |

## A.5. Support

| Method | Endpoint | Chức năng |
|---|---|---|
| GET | `/api/v1/support/status` | Admin online |
| GET | `/api/v1/support/room` | Mở/lấy phòng |
| GET | `/api/v1/support/messages/{room_id}` | Tin nhắn |
| POST | `/api/v1/support/send` | User gửi |
| GET | `/api/v1/support/admin/rooms` | Admin xem phòng |
| POST | `/api/v1/support/admin/send` | Admin trả lời |

## A.6. User RAG

| Method | Endpoint | Chức năng |
|---|---|---|
| POST | `/api/v1/user-rag/save-selection` | Lưu đoạn |
| POST | `/api/v1/user-rag/save-manual` | Lưu ghi chú |
| PUT | `/api/v1/user-rag/item/{item_id}` | Sửa |
| DELETE | `/api/v1/user-rag/item/{item_id}` | Xóa |
| GET | `/api/v1/user-rag/items` | Danh sách |

## A.7. File

| Method | Endpoint | Chức năng |
|---|---|---|
| POST | `/api/v1/upload-file/upload/` | Upload |
| GET | `/api/v1/upload-file/download/{filename}` | Download |
| GET | `/api/v1/upload-file/view/{filename}` | Xem |

## A.8. Admin

| Nhóm | Endpoint tiêu biểu |
|---|---|
| User | `/admin/users`, `/admin/users/{id}`, `/balance` |
| Package | `/admin/packages`, `/admin/packages/{id}` |
| Token/Payment | `/admin/token-history`, `/admin/payments` |
| Log | `/admin/chat-logs`, `/admin/active-users` |
| Settings | `/admin/settings`, `/admin/public/settings`, `/admin/upload-logo` |
| Payment report | `/admin/payment-reports`, `/status` |
| Knowledge | `/admin/knowledge/pending`, `/approved`, `/approve/{id}`, `/{id}` |
| Feedback | `/admin/feedback/negative`, `/{message_id}/to-pending` |
| Report | `/admin/send-weekly-report` |
| SEO | `/admin/sync-from-html` |

# PHỤ LỤC B. LƯỢC ĐỒ DỮ LIỆU

| Bảng | Các trường chính |
|---|---|
| `users` | id, username, password, email, full_name, picture_url, cover_url, is_admin, token_balance, created_at |
| `token_history` | id, user_id, type, amount, description, created_at |
| `packages` | id, name, tokens, amount_vnd, created_at |
| `payments` | id, user_id, package_id, amount_vnd, tokens, status, sepay_id, created_at |
| `chat_logs` | id, user_id, question, answer, tokens_charged, sentiment, sentiment_score, era, created_at |
| `settings` | key, value |
| `payment_reports` | id, user_id, payment_id, description, email, status, created_at |
| `login_logs` | id, user_id, ip_address, user_agent, created_at |
| `conversations` | id, user_id, title, note, is_pinned, created_at |
| `messages` | id, conversation_id, role, content, sources, rating, timeline, likes_count, created_at |
| `pending_knowledge` | id, question, answer, approved, likes_count, created_at |
| `user_knowledge_likes` | id, user_id, question_normalized, created_at |
| `qa_checkins` | id, user_id, checkin_date, reward_amount, streak_count, created_at |
| `qa_answers` | id, user_id, question_date, question_key, selected_index, is_correct, created_at |
| `qa_rewards` | id, user_id, reward_date, reward_key, amount, created_at |
| `semantic_cache` | id, question, answer, sources, embedding, embedding_model, tenant_id, user_id, knowledge_base_id, kb_version, expires_at, created_at |
| `support_rooms` | id, user_id, status, created_at, updated_at |
| `support_messages` | id, room_id, sender_type, sender_id, message, created_at |
| `user_rag_items` | id, user_id, conversation_id, message_id, original_question, assistant_answer, selected_text, corrected_text, content, content_type, tags, metadata_json, created_at, updated_at |
| `global_history_items` | id, title, url, domain, topic, period, entity_person, event, source_type, raw_content, content_hash, status, error_message, crawled_at, updated_at |
| `base` | Bảng tương thích/khởi tạo cũ, hiện không có dữ liệu vận hành |

# PHỤ LỤC C. MA TRẬN CHỨC NĂNG THEO VAI TRÒ

| Chức năng | Khách | User | Admin |
|---|:---:|:---:|:---:|
| Xem landing | X | X | X |
| Đăng ký/đăng nhập | X |  |  |
| Chat lịch sử |  | X | X |
| Xem nguồn |  | X | X |
| Quản lý hội thoại |  | X | X |
| RAG cá nhân |  | X | X |
| Thanh toán |  | X | X |
| Q&A và bảng xếp hạng |  | X | X |
| Hỗ trợ |  | X | X |
| Hồ sơ |  | X | X |
| Mini-game | X hoặc X theo cấu hình | X | X |
| Quản lý user |  |  | X |
| Quản lý package/payment |  |  | X |
| Xem chat/login log |  |  | X |
| Duyệt tri thức |  |  | X |
| Xử lý feedback/report |  |  | X |
| Sửa settings/SEO/landing |  |  | X |
| Gửi báo cáo tuần |  |  | X |

# PHỤ LỤC D. CHECKLIST TRÌNH DIỄN NGHIỆM THU

1. Mở trang landing và giới thiệu mục tiêu hệ thống.
2. Chuyển ngôn ngữ Việt/Anh.
3. Đăng nhập bằng tài khoản thường.
4. Tạo cuộc hội thoại mới.
5. Hỏi câu factual: “Ai là người lãnh đạo khởi nghĩa Lam Sơn?”
6. Mở nguồn của câu trả lời.
7. Hỏi nối tiếp: “Ông ấy lên ngôi năm nào?”
8. Hỏi causal: “Vì sao nhà Trần thắng quân Mông - Nguyên?”
9. Hỏi comparison: “So sánh nhà Lý và nhà Trần.”
10. Bôi chọn đoạn trả lời và lưu vào RAG cá nhân.
11. Mở Personal RAG, sửa ghi chú.
12. Hỏi lại câu liên quan để minh họa ưu tiên dữ liệu cá nhân.
13. Mở lịch sử, ghim và đổi tên hội thoại.
14. Mở Q&A, điểm danh và trả lời một câu.
15. Mở payment, chọn gói và hiển thị QR.
16. Mở mini-game.
17. Đăng nhập admin.
18. Mở dashboard và các biểu đồ.
19. Mở knowledge pending và minh họa phê duyệt.
20. Mở feedback/payment report/support.
21. Trình bày bốn biểu đồ RAGAS.
22. Kết luận bằng trade-off: relevancy tăng, recall/latency cần cải thiện.

# PHỤ LỤC E. DANH SÁCH HÌNH CÓ SẴN

Các hình đã được tập hợp trong thư mục `DOCS/bao_cao_nghiem_thu/figures`:

1. `hinh_3_1_kien_truc_tong_the.svg`
2. `hinh_3_2_pipeline_hoi_dap_rag.svg`
3. `hinh_3_3_pipeline_nap_du_lieu.svg`
4. `hinh_3_4_token_quan_tri.svg`
5. `hinh_3_5_talrag_web_learning.png`
6. `hinh_3_6_talrag_trust_aware.jpg`
7. `hinh_4_1_ragas_tong_the.png`
8. `hinh_4_2_ragas_theo_do_kho.png`
9. `hinh_4_3_chi_so_cau_tra_loi.png`
10. `hinh_4_4_chi_so_ngu_canh.png`

Các Hình 4.5 đến 4.12 cần chụp trực tiếp từ bản chạy để phản ánh đúng giao diện tại ngày nộp báo cáo.

# PHỤ LỤC F. GỢI Ý DÀN TRANG WORD

1. Khổ A4; lề trái 3,0-3,5 cm; lề phải 2,0 cm; trên 2,0 cm; dưới 2,0 cm.
2. Font Times New Roman 13; giãn dòng 1,3-1,5.
3. Tiêu đề chương 16 đậm, in hoa; mục cấp 1 cỡ 14 đậm.
4. Caption hình đặt dưới hình; caption bảng đặt trên bảng.
5. Đánh số hình và bảng theo chương.
6. Dùng Heading 1, Heading 2, Heading 3 để tạo mục lục tự động.
7. Tạo danh mục hình và bảng bằng Insert Caption.
8. Công thức đánh số bên phải nếu khoa yêu cầu.
9. Mỗi chương bắt đầu ở trang mới.
10. Với số thập phân trong báo cáo tiếng Việt, dùng dấu phẩy; trong tên file/CSV giữ dấu chấm.

# PHỤ LỤC G. PHÂN CÔNG, TIẾN ĐỘ VÀ KINH PHÍ

## G.1. Phân công nhiệm vụ

| TT | Thành viên | Nhiệm vụ theo đề cương | Kết quả/minh chứng |
|---:|---|---|---|
| 1 | Nguyễn Quốc Đạt | Chủ trì nghiên cứu; thiết kế kiến trúc; tích hợp AI/RAG; điều phối; báo cáo | Kiến trúc TALRAG, pipeline AI, bài báo, báo cáo tổng kết |
| 2 | Nguyễn Khoa Lam | Backend, API, xác thực, hội thoại, cơ sở dữ liệu | FastAPI, router, JWT, SQLite, chatbot API |
| 3 | Hà Hoàng Phúc | Thu thập, làm sạch, phân loại, vector hóa và kiểm tra nguồn | Kho FAISS, ingestion, dữ liệu và metadata |
| 4 | Lê Trí Khanh | Frontend web/mobile, chat, lịch sử, hồ sơ, quản trị, UX | React/TypeScript, Capacitor, giao diện chức năng |
| 5 | Phan Văn Thọ | Kịch bản kiểm thử, đánh giá câu trả lời, hiệu năng, lỗi | Benchmark, RAGAS, biểu đồ và nội dung kiểm thử |

Bảng trên kế thừa phân công trong đề cương. Khi nộp bản chính thức, nhóm nên bổ sung tỷ lệ đóng góp hoặc xác nhận của từng thành viên nếu biểu mẫu nghiệm thu yêu cầu.

## G.2. Tiến độ

| TT | Công việc | Kế hoạch | Kết quả đến 13/06/2026 |
|---:|---|---|---|
| 1 | Tổng quan đề tài | 03/2026-04/2026 | Đã hoàn thành cơ sở lý thuyết và yêu cầu |
| 2 | Thực nghiệm | 04/2026-06/2026 | Đã có hệ thống, benchmark và kết quả ngày 11/06/2026 |
| 3 | Viết báo cáo | 06/2026-07/2026 | Đã hình thành báo cáo tổng kết |
| 4 | Viết bài, đăng báo, dự giải, phát triển | 07/2026-08/2026 | Đã có bản thảo bài báo TALRAG Ver 4; các hoạt động công bố tiếp tục theo kế hoạch |

## G.3. Kinh phí

Kinh phí dự toán trong đề cương là **10.000.000 đồng**. Hai tài liệu nguồn và mã nguồn không cung cấp bảng chi thực tế hoặc chứng từ, vì vậy báo cáo không tự suy đoán số đã chi.

| Nhóm chi | Dự toán/Thực chi | Ghi chú |
|---|---:|---|
| API LLM và embedding | [Bổ sung theo chứng từ] | OpenAI/Vertex hoặc dịch vụ liên quan |
| Hạ tầng triển khai, domain, tunnel | [Bổ sung theo chứng từ] | Nếu có |
| Thu thập, xử lý dữ liệu | [Bổ sung theo chứng từ] | Sách, tài liệu, số hóa |
| Kiểm thử, thiết bị, đóng gói mobile | [Bổ sung theo chứng từ] | Nếu có |
| Hội thảo, in ấn, công bố | [Bổ sung theo chứng từ] | Nếu có |
| Khác | [Bổ sung theo chứng từ] | Theo quy định |
| **Tổng** | **[Bổ sung, không vượt hồ sơ được duyệt]** | Đối chiếu hóa đơn/chứng từ |

Phần quyết toán phải được thay bằng số liệu tài chính do chủ nhiệm đề tài và đơn vị quản lý xác nhận.
