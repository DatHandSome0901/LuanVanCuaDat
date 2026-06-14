# BỘ GIÁO DỤC VÀ ĐÀO TẠO

# TRƯỜNG ĐẠI HỌC NAM CẦN THƠ

## TRƯỜNG CÔNG NGHỆ KỸ THUẬT SỐ VÀ TRÍ TUỆ NHÂN TẠO

---

# BÁO CÁO TỔNG KẾT VÀ NGHIỆM THU ĐỀ TÀI

## HỆ THỐNG CHATBOT TRẢ LỜI VỀ LỊCH SỬ VIỆT NAM SỬ DỤNG TRÍ TUỆ NHÂN TẠO (AI)

**Chủ nhiệm đề tài:** Nguyễn Quốc Đạt  
**Lớp:** DH22KMT01 - Khóa 10  
**Giảng viên hướng dẫn:** TS. Ngô Hồ Anh Khôi  

**Thành viên thực hiện:** Nguyễn Quốc Đạt, Nguyễn Khoa Lam, Hà Hoàng Phúc, Lê Trí Khanh, Phan Văn Thọ.  

**Đơn vị chủ quản:** Trường Công nghệ Kỹ thuật số và Trí tuệ nhân tạo, Trường Đại học Nam Cần Thơ.  
**Thời gian thực hiện:** Từ tháng 03 năm 2026 đến tháng 09 năm 2026.  
**Kinh phí dự toán:** 10.000.000 đồng.  

**Cần Thơ, năm 2026**

---

# LỜI CAM ĐOAN

Nhóm thực hiện xin cam đoan báo cáo này là kết quả của quá trình nghiên cứu, xây dựng, thử nghiệm và hoàn thiện hệ thống chatbot trả lời về Lịch sử Việt Nam sử dụng trí tuệ nhân tạo. Những nội dung mô tả về chức năng, quy trình xử lý, dữ liệu vận hành và kết quả đánh giá được tổng hợp từ sản phẩm thực tế của đề tài tại thời điểm nghiệm thu. Các kết quả thực nghiệm được trình bày đúng theo dữ liệu đã thu được, bao gồm cả những mặt đạt được và những hạn chế còn tồn tại.

Trong quá trình thực hiện, nhóm có tham khảo các công trình về mô hình ngôn ngữ lớn, truy xuất tăng cường sinh câu trả lời, tìm kiếm ngữ nghĩa, đánh giá hệ thống hỏi đáp và các nghiên cứu có liên quan. Những tài liệu này được ghi nhận trong phần tài liệu tham khảo. Nhóm không sử dụng kết quả của công trình khác để thay thế cho kết quả thực nghiệm của đề tài.

Nhóm cũng xác định rõ hệ thống được xây dựng với mục đích hỗ trợ học tập và tra cứu. Câu trả lời của chatbot giúp người dùng nhanh chóng tiếp cận thông tin, định hướng nội dung cần tìm hiểu và tham khảo nguồn liên quan. Hệ thống không thay thế sách giáo khoa, giáo trình, tài liệu lưu trữ chính thức, ý kiến của giáo viên, giảng viên hoặc kết luận chuyên môn của nhà nghiên cứu lịch sử.

# LỜI CẢM ƠN

Trong suốt quá trình thực hiện đề tài, nhóm đã nhận được sự hướng dẫn, góp ý và hỗ trợ từ nhà trường, giảng viên và các cá nhân tham gia thử nghiệm sản phẩm. Nhóm xin trân trọng cảm ơn Ban Giám hiệu Trường Đại học Nam Cần Thơ và Trường Công nghệ Kỹ thuật số và Trí tuệ nhân tạo đã tạo điều kiện để nhóm được tiếp cận môi trường nghiên cứu, học tập và triển khai một sản phẩm có sự kết hợp giữa công nghệ phần mềm với trí tuệ nhân tạo.

Nhóm xin bày tỏ lòng biết ơn sâu sắc đến TS. Ngô Hồ Anh Khôi, người đã định hướng nội dung nghiên cứu, góp ý về cách xây dựng hệ thống hỏi đáp chuyên biệt, phương pháp tổ chức kho tri thức, cách kiểm soát câu trả lời và phương pháp đánh giá kết quả. Những góp ý này giúp nhóm không dừng lại ở việc tạo ra một giao diện trò chuyện đơn giản mà từng bước hình thành một hệ thống có kiến trúc rõ ràng, có cơ chế kiểm soát tri thức và có khả năng đánh giá bằng số liệu.

Nhóm xin cảm ơn các thành viên đã phối hợp trong việc thu thập tài liệu, xử lý dữ liệu, phát triển máy chủ, xây dựng giao diện, thiết kế ứng dụng di động, xây dựng chức năng quản trị, kiểm thử và hoàn thiện báo cáo. Nhóm cũng cảm ơn những người dùng đã trải nghiệm, đặt câu hỏi, phản hồi về câu trả lời và góp ý cho giao diện. Những phản hồi này giúp nhóm nhìn thấy các vấn đề mà quá trình kiểm thử kỹ thuật đơn thuần khó phát hiện, chẳng hạn cách người dùng đặt câu hỏi nối tiếp, nhu cầu xem lại nguồn, mong muốn lưu ghi chú cá nhân và yêu cầu nhận được câu trả lời nhanh hơn.

Mặc dù đã cố gắng hoàn thiện đề tài trong phạm vi thời gian cho phép, nhóm nhận thức rằng sản phẩm vẫn còn những điểm cần tiếp tục cải tiến. Nhóm rất mong nhận được ý kiến đóng góp từ Hội đồng nghiệm thu và quý thầy cô để hệ thống có thể phát triển theo hướng chính xác, an toàn và hữu ích hơn đối với người học.

# TÓM TẮT

Đề tài “Hệ thống chatbot trả lời về Lịch sử Việt Nam sử dụng trí tuệ nhân tạo” được thực hiện nhằm xây dựng một công cụ hỗ trợ học tập và tra cứu lịch sử bằng ngôn ngữ tự nhiên. Xuất phát từ thực tế tài liệu lịch sử được phân bố ở nhiều nguồn, người học thường mất nhiều thời gian để tìm kiếm, đọc và tổng hợp thông tin. Trong khi đó, các mô hình trí tuệ nhân tạo có khả năng tạo văn bản rất tự nhiên nhưng có thể đưa ra thông tin thiếu căn cứ nếu không được cung cấp nguồn dữ liệu phù hợp. Vì vậy, đề tài lựa chọn hướng kết hợp giữa mô hình ngôn ngữ lớn và cơ chế truy xuất tri thức từ tài liệu.

Khi người dùng gửi câu hỏi, hệ thống không chuyển ngay câu hỏi cho mô hình trí tuệ nhân tạo để tạo câu trả lời. Trước hết, câu hỏi được chuẩn hóa, xác định ngôn ngữ, xem xét mối liên hệ với các lượt trao đổi trước và phân loại theo mục đích. Hệ thống phân biệt câu hỏi hỏi về dữ kiện, thời gian, nguyên nhân, so sánh, câu hỏi không thuộc phạm vi lịch sử và lời chào hỏi thông thường. Sau đó, hệ thống tìm kiếm các đoạn tài liệu có liên quan trong nhiều kho tri thức. Các đoạn tìm được tiếp tục được xem xét theo mức độ gần nghĩa, sự phù hợp về thời gian, quan hệ nguyên nhân - kết quả và thực thể lịch sử. Chỉ những nội dung phù hợp mới được đưa vào làm căn cứ cho mô hình tạo câu trả lời.

Đề tài phát triển cơ chế truy xuất thích nghi mang tên TALRAG. Điểm khác biệt của cơ chế này so với cách tìm kiếm ngữ nghĩa thông thường là mỗi loại câu hỏi được xử lý với mức ưu tiên khác nhau. Câu hỏi về thời gian ưu tiên tài liệu có mốc năm và giai đoạn phù hợp; câu hỏi về nguyên nhân ưu tiên tài liệu có nội dung giải thích quan hệ dẫn đến kết quả; câu hỏi so sánh mở rộng số lượng tài liệu để có đủ thông tin về các đối tượng cần đối chiếu. Hệ thống còn nhận diện các tên gọi khác nhau của nhân vật, triều đại và sự kiện nhằm hạn chế việc truy xuất nhầm nội dung.

Ngoài kho tri thức chung, hệ thống có kho tri thức riêng cho từng người dùng. Người dùng có thể chọn một đoạn trong câu trả lời, sửa lại theo cách hiểu của mình hoặc tự nhập ghi chú. Nội dung này được lưu riêng theo tài khoản và có thể được sử dụng trong những lần hỏi sau. Dữ liệu cá nhân của một người không được dùng để trả lời cho người khác. Chức năng này giúp hệ thống phù hợp hơn với quá trình học tập cá nhân mà không làm thay đổi kho tri thức chung.

Khi kho dữ liệu nội bộ không có đủ thông tin, hệ thống có thể tìm kiếm nội dung bổ sung từ Internet. Tuy nhiên, thông tin tìm được không được đưa trực tiếp vào kho tri thức chính thức. Hệ thống ưu tiên các nguồn có mức độ tin cậy cao, loại bỏ nội dung không liên quan, tạo câu trả lời tạm thời và lưu nội dung ở trạng thái chờ kiểm tra. Người quản trị có thể xem xét, phê duyệt hoặc loại bỏ. Chỉ sau khi được xác nhận, tri thức mới được bổ sung vào bộ nhớ dùng cho những câu hỏi sau. Cách làm này tạo khả năng mở rộng tri thức nhưng vẫn duy trì vai trò kiểm soát của con người.

Sản phẩm được xây dựng dưới dạng một nền tảng hoàn chỉnh. Người dùng có thể đăng ký, đăng nhập bằng tài khoản thông thường hoặc tài khoản Google, quản lý hồ sơ, tạo nhiều cuộc hội thoại, xem lại lịch sử, ghim hoặc đổi tên cuộc trò chuyện, đánh giá câu trả lời, xem nguồn tham khảo và lưu nội dung vào kho cá nhân. Hệ thống còn có chức năng điểm danh, trả lời câu hỏi trắc nghiệm hằng ngày, nhận phần thưởng, tham gia bảng xếp hạng, nạp token bằng mã thanh toán, gửi báo cáo khi giao dịch gặp sự cố và liên hệ hỗ trợ.

Đối với người quản trị, sản phẩm cung cấp bảng điều khiển để theo dõi người dùng, hoạt động hỏi đáp, giao dịch, phản hồi, nội dung chờ duyệt và các thông số vận hành. Người quản trị có thể điều chỉnh nội dung trang giới thiệu, hình ảnh, thông tin liên hệ, cấu hình trí tuệ nhân tạo, thông báo khi không có dữ liệu, các nhóm thời kỳ lịch sử và nhiều thành phần giao diện khác. Hệ thống cũng có khả năng tổng hợp báo cáo hoạt động theo tuần và gửi qua thư điện tử.

Giao diện chính được xây dựng cho nền tảng web và có khả năng thích ứng với màn hình máy tính, máy tính bảng và điện thoại. Sản phẩm có thể được đóng gói thành ứng dụng Android. Bên cạnh đó, nhóm xây dựng một lớp ứng dụng di động có nhiệm vụ hiển thị giao diện web, lưu trạng thái đăng nhập và hỗ trợ quá trình xác thực bằng Google. Đề tài còn tích hợp một trò chơi lịch sử lấy bối cảnh khởi nghĩa Lam Sơn và trận Chi Lăng nhằm tăng tính tương tác cho người học.

Để đánh giá chất lượng, nhóm xây dựng bộ 100 câu hỏi về Lịch sử Việt Nam giai đoạn phong kiến từ năm 939 đến năm 1945. Bộ câu hỏi gồm 40 câu dễ, 35 câu trung bình và 25 câu khó. Hệ thống TALRAG được so sánh với một hệ thống truy xuất tĩnh và ba trợ lý trí tuệ nhân tạo phổ biến. Bốn tiêu chí đánh giá gồm mức độ câu trả lời bám vào tài liệu, mức độ trả lời đúng trọng tâm, mức độ chính xác của ngữ cảnh được truy xuất và mức độ đầy đủ của ngữ cảnh.

Kết quả cho thấy TALRAG đạt 0,4009 về mức độ bám sát tài liệu, 0,4480 về mức độ liên quan của câu trả lời, 0,1972 về độ chính xác của ngữ cảnh và 0,1433 về độ bao phủ ngữ cảnh. So với hệ thống truy xuất tĩnh, mức độ liên quan của câu trả lời tăng 186,9% và độ chính xác của ngữ cảnh tăng nhẹ. Tuy nhiên, hệ thống còn thấp hơn về mức độ bám sát tài liệu, độ bao phủ ngữ cảnh và có thời gian phản hồi cao hơn. Kết quả này cho thấy cơ chế thích nghi giúp câu trả lời tập trung hơn vào yêu cầu của người dùng, nhưng cần tiếp tục cải thiện khả năng thu thập đủ bằng chứng và tối ưu tốc độ xử lý.

Tại thời điểm kiểm tra ngày 13 tháng 06 năm 2026, cơ sở dữ liệu của sản phẩm có 21 tài khoản, 607 cuộc hội thoại, 2.287 tin nhắn và 1.374 lượt ghi nhận hỏi đáp. Kho tri thức đã được chia thành hơn một trăm nghìn đoạn cho mỗi cấu hình biểu diễn ngữ nghĩa chính. Giao diện web và trò chơi đều được biên dịch thành công ở chế độ triển khai. Các thành phần phân loại câu hỏi, đánh giá yếu tố thời gian và nhận diện quan hệ nguyên nhân cho kết quả đúng với các trường hợp kiểm tra.

Kết quả của đề tài cho thấy có thể xây dựng một hệ thống hỏi đáp Lịch sử Việt Nam vừa có khả năng trò chuyện tự nhiên, vừa có cơ chế truy xuất nguồn, cá nhân hóa, mở rộng tri thức và quản trị nội dung. Sản phẩm đã đáp ứng các mục tiêu chính của đề cương ở mức nghiên cứu và trình diễn. Những hướng cần tiếp tục hoàn thiện gồm nâng cao độ tin cậy của câu trả lời, tăng độ bao phủ tài liệu, rút ngắn thời gian chờ, mở rộng kiểm thử và gia cố an toàn khi triển khai cho số lượng lớn người dùng.

**Từ khóa:** Lịch sử Việt Nam, chatbot, trí tuệ nhân tạo, mô hình ngôn ngữ lớn, truy xuất tăng cường sinh câu trả lời, tìm kiếm ngữ nghĩa, học có kiểm soát, đánh giá hệ thống hỏi đáp.

# ABSTRACT

This project develops an artificial intelligence chatbot that supports learning and searching for Vietnamese historical knowledge through natural-language conversations. The system combines a large language model with a document retrieval mechanism so that generated answers can be grounded in historical sources instead of relying entirely on the model's internal knowledge.

User questions are normalized, connected with recent conversation context, classified by purpose, and matched with relevant passages from several knowledge collections. Retrieved passages are reconsidered according to semantic relevance, historical time, causal relationships, and named historical entities. The proposed TALRAG approach changes retrieval priorities for factual, temporal, causal, and comparative questions. The system also supports personal notes, bilingual interaction, semantic answer reuse, controlled web search, human approval of newly acquired knowledge, payment, learning quizzes, support chat, administration, mobile access, and a historical educational game.

The system is evaluated on a benchmark of 100 questions covering Vietnamese feudal history from 939 to 1945. TALRAG improves answer relevancy by 186.9 percent compared with the reproducible static retrieval baseline and slightly improves context precision. However, its faithfulness, context recall, and response time still require further improvement. The project demonstrates the feasibility of building a transparent, controllable, and continuously expandable Vietnamese historical question-answering platform.

**Keywords:** Vietnamese history, artificial intelligence chatbot, large language model, retrieval-augmented generation, adaptive retrieval, controlled knowledge learning.

# DANH MỤC TỪ VIẾT TẮT

| Từ viết tắt | Nội dung |
|---|---|
| AI | Trí tuệ nhân tạo |
| API | Giao diện kết nối giữa các thành phần phần mềm |
| FAISS | Công cụ lưu trữ và tìm kiếm các biểu diễn số của văn bản |
| JWT | Chuỗi xác thực dùng để nhận diện người dùng |
| LLM | Mô hình ngôn ngữ lớn |
| NLP | Xử lý ngôn ngữ tự nhiên |
| OAuth | Cơ chế đăng nhập thông qua một nhà cung cấp bên ngoài |
| QA | Hỏi và trả lời |
| RAG | Phương pháp tạo câu trả lời có kết hợp truy xuất tài liệu |
| RAGAS | Khung đánh giá hệ thống hỏi đáp có truy xuất |
| SSE | Cơ chế gửi liên tục dữ liệu từ máy chủ đến giao diện |
| TALRAG | Phương pháp truy xuất thích nghi theo thời gian và có cơ chế mở rộng tri thức |

# DANH MỤC HÌNH

Hình 3.1. Kiến trúc tổng thể của hệ thống.  
Hình 3.2. Quy trình tiếp nhận và xử lý một câu hỏi.  
Hình 3.3. Quy trình xây dựng kho tri thức.  
Hình 3.4. Quy trình quản lý token, thanh toán và quản trị.  
Hình 3.5. Quy trình tìm kiếm bổ sung và kiểm duyệt tri thức.  
Hình 3.6. Vòng đời của một nội dung tri thức mới.  
Hình 4.1. Giao diện trang giới thiệu.  
Hình 4.2. Giao diện hỏi đáp và hiển thị nguồn.  
Hình 4.2a. Cửa sổ chi tiết nguồn trích dẫn.  
Hình 4.3. Giao diện quản lý lịch sử hội thoại.  
Hình 4.3a. Giao diện chat trên màn hình điện thoại.  
Hình 4.4. Giao diện kho ghi chú cá nhân.  
Hình 4.4a. Cửa sổ thêm tri thức cá nhân.  
Hình 4.5. Giao diện luyện tập và bảng xếp hạng.  
Hình 4.5a. Giải thích sau khi trả lời câu hỏi Q&A.  
Hình 4.6. Giao diện thanh toán.  
Hình 4.6a. Hóa đơn VietQR và nội dung chuyển khoản.  
Hình 4.6b. Báo cáo sự cố thanh toán.  
Hình 4.7. Giao diện quản trị tổng quan.  
Hình 4.7a. Quản lý người dùng và quyền tài khoản.  
Hình 4.7b. Chi tiết một tài khoản người dùng.  
Hình 4.7c. Quản lý gói nạp token.  
Hình 4.7d. Nhật ký token và tiền tệ.  
Hình 4.7e. Quản lý hóa đơn thanh toán.  
Hình 4.7f. Lịch sử chat và thống kê cảm xúc.  
Hình 4.7g. Cột phí và nút mở chi tiết trong lịch sử chat.  
Hình 4.7h. Chi tiết một lượt hỏi đáp trong quản trị.  
Hình 4.7i. Nhật ký truy cập và đăng nhập.  
Hình 4.7j. Danh sách báo cáo sự cố thanh toán.  
Hình 4.7k. Phản hồi câu trả lời cần xem xét.  
Hình 4.7l. Cấu hình hệ thống, SEO và nội dung trang chủ.  
Hình 4.7m. Cấu hình triều đại, AI và chân trang.  
Hình 4.8. Giao diện kiểm duyệt tri thức.  
Hình 4.9. Giao diện hỗ trợ người dùng.  
Hình 4.9a. Giao diện hỗ trợ trực tuyến phía quản trị.  
Hình 4.10. Giao diện trò chơi lịch sử.  
Hình 4.10a. Giao diện khi đang chơi, có sinh lực, kỹ năng và điểm.  
Hình 4.11. So sánh kết quả đánh giá tổng thể.  
Hình 4.12. So sánh kết quả theo mức độ câu hỏi.  
Hình 4.13. So sánh chất lượng câu trả lời.  
Hình 4.14. So sánh chất lượng ngữ cảnh được truy xuất.

# DANH MỤC BẢNG

Bảng 1.1. Mục tiêu và kết quả thực hiện.  
Bảng 2.1. So sánh cách hỏi đáp thông thường với phương pháp của đề tài.  
Bảng 2.2. Mức ưu tiên của các yếu tố theo từng loại câu hỏi.  
Bảng 2.3. Ký hiệu dùng trong mô hình xếp hạng TALRAG.  
Bảng 2.4. Quy đổi khoảng cách năm thành điểm thời gian.  
Bảng 2.5. Quy tắc điều chỉnh theo thực thể lịch sử.  
Bảng 2.6. Cách diễn giải các chỉ số đánh giá hỏi đáp có truy xuất.  
Bảng 3.1. Nhóm người sử dụng và nhu cầu.  
Bảng 3.2. Nhóm chức năng của người dùng.  
Bảng 3.3. Nhóm chức năng của người quản trị.  
Bảng 3.4. Đặc tả quy trình hỏi đáp TALRAG.  
Bảng 3.5. Đặc tả quy trình mở rộng và kiểm duyệt tri thức.  
Bảng 3.6. Quy tắc token và phần thưởng học tập.  
Bảng 3.7. Điều kiện công nhận một giao dịch thanh toán.  
Bảng 3.8. Các nhóm dữ liệu được lưu trữ.  
Bảng 4.1. Trạng thái dữ liệu tại thời điểm nghiệm thu.  
Bảng 4.2. Kết quả kiểm tra kỹ thuật.  
Bảng 4.3. Cấu trúc bộ câu hỏi đánh giá.  
Bảng 4.4. Cách đọc các chỉ số đánh giá.  
Bảng 4.5. Kết quả đánh giá tổng thể.  
Bảng 4.6. Kết quả đánh giá theo độ khó.  
Bảng 4.7. Kết quả kiểm tra các chức năng chính.  
Bảng 4.8. Ma trận kiểm thử nghiệp vụ chi tiết.  
Bảng 4.9. Đối chiếu chức năng với minh chứng giao diện.  
Bảng 5.1. Mức độ hoàn thành sản phẩm.

# DANH MỤC CÔNG THỨC

Công thức 2.1. Điểm xếp hạng thích nghi của TALRAG.  
Công thức 2.2. Điểm gần nghĩa ước lượng từ thứ hạng truy xuất.  
Công thức 2.3. Điểm thời gian dựa trên khoảng cách năm.  
Công thức 2.4. Điểm nhân quả dựa trên từ khóa và cặp quan hệ.  
Công thức 2.5. Điểm điều chỉnh theo thực thể lịch sử.  
Công thức 2.6. Điểm ưu tiên nguồn trực tuyến.  
Công thức 3.1. Số dư token sau một giao dịch.  
Công thức 3.2. Chi phí token của một lượt hỏi đáp.  
Công thức 3.3. Thưởng điểm danh theo ngày và chuỗi ngày.  
Công thức 3.4. Thưởng trả lời đúng câu hỏi hằng ngày.  
Công thức 3.5. Điều kiện công nhận thanh toán tự động.  
Công thức 4.1. Điểm trung bình của một tiêu chí đánh giá.  
Công thức 4.2. Tỷ lệ cải thiện tương đối giữa hai hệ thống.  
Công thức 4.3. Thời gian phản hồi trung bình.

# MỞ ĐẦU

Sự phát triển nhanh chóng của trí tuệ nhân tạo trong những năm gần đây đã làm thay đổi cách con người tìm kiếm và tiếp cận thông tin. Trước đây, khi muốn tìm hiểu một vấn đề, người dùng thường nhập từ khóa vào công cụ tìm kiếm, mở nhiều trang web, đọc từng tài liệu và tự tổng hợp câu trả lời. Ngày nay, các hệ thống trò chuyện thông minh có thể tiếp nhận câu hỏi bằng ngôn ngữ tự nhiên và tạo ra câu trả lời chỉ trong một thời gian ngắn. Sự thay đổi này mở ra nhiều cơ hội cho giáo dục, đặc biệt trong việc xây dựng các công cụ hỗ trợ học tập theo nhu cầu của từng người.

Lịch sử Việt Nam là một lĩnh vực có nguồn tri thức phong phú nhưng cũng đặt ra nhiều khó khăn đối với hệ thống hỏi đáp tự động. Một nhân vật có thể có tên húy, niên hiệu, tước hiệu và nhiều cách gọi khác nhau. Một địa danh có thể thay đổi tên qua từng thời kỳ. Một sự kiện có thể được nhắc đến trong nhiều bối cảnh, còn những trận đánh có cùng địa điểm nhưng xảy ra ở các năm khác nhau. Người học không chỉ hỏi “ai”, “ở đâu” hoặc “năm nào”, mà còn hỏi “vì sao”, “có ý nghĩa gì”, “khác nhau như thế nào” và “nếu đặt trong bối cảnh khác thì điều gì có thể xảy ra”. Vì vậy, một hệ thống trả lời lịch sử không thể chỉ tìm các đoạn văn có từ khóa giống với câu hỏi.

Các mô hình ngôn ngữ lớn có ưu điểm nổi bật về khả năng hiểu cách diễn đạt và tạo văn bản tự nhiên. Tuy nhiên, mô hình có thể tạo ra câu trả lời nghe hợp lý nhưng chứa chi tiết không có trong tài liệu, nhầm lẫn mốc thời gian hoặc gắn một sự kiện với sai nhân vật. Đối với một chủ đề giáo dục, đặc biệt là lịch sử, những sai lệch này ảnh hưởng trực tiếp đến nhận thức của người học. Một câu trả lời hấp dẫn về hình thức nhưng sai bản chất không thể được xem là kết quả phù hợp.

Từ vấn đề đó, đề tài lựa chọn phương pháp tạo câu trả lời có kết hợp truy xuất tài liệu. Trước khi mô hình tạo nội dung, hệ thống tìm những đoạn tri thức có liên quan và đưa chúng vào làm căn cứ. Tuy nhiên, nhóm nhận thấy việc chỉ tìm theo mức độ gần nghĩa vẫn chưa đủ. Nếu câu hỏi nhắc đến chiến thắng Bạch Đằng năm 938, hệ thống cần tránh lấy tài liệu nói về Bạch Đằng năm 1288. Nếu người dùng hỏi nguyên nhân, tài liệu chỉ mô tả diễn biến chưa chắc đã phù hợp. Nếu người dùng yêu cầu so sánh, một đoạn nói riêng về một triều đại không thể cung cấp đủ thông tin.

Trên cơ sở đó, nhóm xây dựng phương pháp truy xuất thích nghi cho câu hỏi lịch sử. Hệ thống xác định câu hỏi thuộc loại nào, nhận diện nhân vật hoặc sự kiện chính, xem xét mốc thời gian và thay đổi cách lựa chọn tài liệu. Sau khi truy xuất, các đoạn văn còn được kiểm tra trước khi chuyển cho mô hình tạo câu trả lời. Khi không có đủ dữ liệu, hệ thống không buộc mô hình phải trả lời bằng mọi giá mà có thể thông báo thiếu thông tin hoặc tìm kiếm nguồn bổ sung.

Đề tài không chỉ tập trung vào thuật toán trả lời. Một sản phẩm có thể sử dụng trong thực tế cần có tài khoản, lịch sử hội thoại, hồ sơ, quản lý lượt sử dụng, phản hồi, hỗ trợ, thanh toán, quản trị và cơ chế kiểm duyệt. Người dùng cũng có nhu cầu lưu lại những nội dung mình quan tâm, chỉnh sửa ghi chú và dùng lại trong quá trình học. Vì vậy, hệ thống được xây dựng theo hướng một nền tảng học tập thay vì một cửa sổ trò chuyện đơn lẻ.

Báo cáo trình bày toàn bộ quá trình từ xác định vấn đề, nghiên cứu cơ sở lý thuyết, phân tích yêu cầu, thiết kế hệ thống, xây dựng từng nhóm chức năng đến thử nghiệm và đánh giá. Nội dung được mô tả dựa trên hành vi thực tế của sản phẩm. Các kết quả chưa tốt cũng được phân tích để làm rõ giới hạn của phương pháp và định hướng cải tiến.

# CHƯƠNG 1. TỔNG QUAN ĐỀ TÀI

## 1.1. Bối cảnh hình thành đề tài

Chuyển đổi số trong giáo dục đang diễn ra theo hướng ngày càng sâu rộng. Nếu giai đoạn đầu chủ yếu tập trung vào việc chuyển tài liệu giấy thành tài liệu điện tử, giai đoạn hiện nay hướng đến các hệ thống có khả năng hỗ trợ người học tương tác với tri thức. Thay vì chỉ đọc một tài liệu theo trình tự cố định, người học muốn đặt câu hỏi trực tiếp, nhận được giải thích phù hợp với vấn đề đang quan tâm, xem nguồn liên quan và tiếp tục hỏi sâu hơn.

Trong chương trình chuyển đổi số quốc gia, giáo dục là một trong những lĩnh vực được ưu tiên. Việc phát triển học liệu số, nền tảng học tập trực tuyến và công cụ ứng dụng trí tuệ nhân tạo không chỉ giúp nâng cao khả năng tiếp cận mà còn tạo điều kiện cá nhân hóa quá trình học. Người học có thể lựa chọn thời gian, tốc độ và nội dung phù hợp với mình. Tuy nhiên, việc ứng dụng trí tuệ nhân tạo trong giáo dục phải đi cùng yêu cầu về tính đúng đắn, khả năng kiểm chứng và trách nhiệm đối với nội dung được cung cấp.

Đối với môn Lịch sử, người học thường gặp hai nhóm khó khăn. Nhóm thứ nhất là khối lượng thông tin lớn, bao gồm nhiều thời kỳ, triều đại, nhân vật, sự kiện và mốc thời gian. Nhóm thứ hai là yêu cầu hiểu mối liên hệ giữa các dữ kiện. Việc học lịch sử không thể chỉ dừng ở ghi nhớ ngày tháng. Người học cần hiểu hoàn cảnh, nguyên nhân, diễn biến, kết quả, ý nghĩa và ảnh hưởng lâu dài của một sự kiện.

Các nguồn thông tin trực tuyến hiện nay rất đa dạng. Bên cạnh sách và tài liệu chính thống, người dùng có thể tìm thấy bài viết phổ biến, video, bài đăng mạng xã hội và nội dung do cộng đồng tạo ra. Sự đa dạng này giúp việc tiếp cận lịch sử trở nên dễ dàng hơn nhưng cũng làm tăng nguy cơ tiếp nhận thông tin thiếu kiểm chứng. Người học, đặc biệt là học sinh và sinh viên ở giai đoạn đầu, không phải lúc nào cũng có đủ kinh nghiệm để đánh giá độ tin cậy của từng nguồn.

Một chatbot chuyên biệt có thể giúp rút ngắn quá trình tìm kiếm. Người dùng chỉ cần đặt câu hỏi theo cách tự nhiên và nhận lại phần giải thích có cấu trúc. Tuy nhiên, nếu chatbot chỉ dựa vào kiến thức đã có sẵn trong mô hình trí tuệ nhân tạo, người dùng khó biết câu trả lời được hình thành từ đâu. Do đó, khả năng truy xuất tài liệu và hiển thị nguồn là điều kiện cần thiết.

Đề tài được hình thành từ mong muốn giải quyết đồng thời ba yêu cầu. Thứ nhất, hệ thống phải dễ sử dụng đối với người học phổ thông. Thứ hai, câu trả lời phải dựa trên nội dung tìm được từ kho tri thức thay vì hoàn toàn dựa trên khả năng ghi nhớ của mô hình. Thứ ba, sản phẩm phải có khả năng mở rộng, quản lý và kiểm duyệt trong quá trình sử dụng.

## 1.2. Lý do chọn Lịch sử Việt Nam làm lĩnh vực ứng dụng

Lịch sử Việt Nam là lĩnh vực có ý nghĩa đặc biệt đối với giáo dục và nhận thức xã hội. Tri thức lịch sử giúp người học hiểu quá trình hình thành quốc gia, những giai đoạn dựng nước và giữ nước, sự phát triển của tổ chức nhà nước, văn hóa, kinh tế và quan hệ đối ngoại. Việc tiếp cận lịch sử một cách có hệ thống góp phần hình thành ý thức về cộng đồng, trách nhiệm công dân và khả năng nhìn nhận các vấn đề hiện tại trong mối liên hệ với quá khứ.

Về mặt kỹ thuật, Lịch sử Việt Nam cũng là một miền tri thức phù hợp để nghiên cứu hệ thống hỏi đáp chuyên biệt. Các câu hỏi lịch sử chứa nhiều tín hiệu có thể phân tích như năm, thế kỷ, triều đại, nhân vật, địa danh, trận đánh và từ ngữ biểu thị nguyên nhân hoặc kết quả. Những tín hiệu này cho phép xây dựng một phương pháp truy xuất có điều chỉnh theo mục đích câu hỏi, thay vì áp dụng một cách tìm kiếm giống nhau cho mọi tình huống.

Lịch sử còn là lĩnh vực dễ xuất hiện nhầm lẫn khi chỉ dựa vào sự giống nhau của từ ngữ. Chẳng hạn, tên “Lê” có thể xuất hiện trong nhiều giai đoạn và nhiều nhân vật. “Bạch Đằng” liên quan đến nhiều trận đánh. Một tài liệu nói về nhà Trần có thể chứa từ “nhà Lý” khi trình bày bối cảnh chuyển giao, nhưng không có nghĩa đó là tài liệu phù hợp nhất cho câu hỏi tập trung vào nhà Lý. Những trường hợp này tạo ra yêu cầu thực tế cho việc nhận diện thực thể và bối cảnh.

Ngoài ra, câu hỏi lịch sử thường mang tính nối tiếp. Sau khi hỏi về một nhân vật, người dùng có thể tiếp tục bằng câu “ông ấy đã làm gì sau đó?” hoặc “việc đó có ảnh hưởng như thế nào?”. Nếu chỉ xử lý từng câu riêng biệt, hệ thống không xác định được “ông ấy” và “việc đó” đang nói đến điều gì. Do đó, lĩnh vực lịch sử cũng phù hợp để nghiên cứu khả năng duy trì ngữ cảnh hội thoại.

## 1.3. Vấn đề cần giải quyết

Vấn đề trung tâm của đề tài là xây dựng một hệ thống có thể trả lời câu hỏi Lịch sử Việt Nam theo cách tự nhiên nhưng vẫn duy trì căn cứ từ tài liệu. Để giải quyết vấn đề này, nhóm phải xử lý nhiều bài toán liên quan với nhau.

Trước hết là bài toán tổ chức dữ liệu. Tài liệu đầu vào có thể dài hàng trăm trang, trong khi một câu hỏi thường chỉ cần một số đoạn nhỏ. Nếu đưa toàn bộ tài liệu vào mô hình, chi phí xử lý cao và nội dung quan trọng dễ bị chìm trong lượng văn bản lớn. Vì vậy, tài liệu cần được làm sạch, chia thành những phần có kích thước phù hợp và chuyển thành dạng có thể tìm kiếm theo ý nghĩa.

Tiếp theo là bài toán hiểu câu hỏi. Hệ thống cần biết người dùng đang yêu cầu một dữ kiện, một mốc thời gian, một lời giải thích nguyên nhân hay một phép so sánh. Cùng một kho dữ liệu nhưng cách chọn tài liệu cho các câu hỏi này không giống nhau. Nếu không phân biệt, hệ thống có thể trả về đoạn văn có nhiều từ giống câu hỏi nhưng không cung cấp đúng loại thông tin người dùng cần.

Bài toán thứ ba là kiểm soát tài liệu truy xuất. Kết quả tìm kiếm ban đầu chỉ là các ứng viên. Một số đoạn có thể gần nghĩa nhưng sai thời kỳ, nói về nhân vật khác hoặc chỉ nhắc thoáng qua chủ đề. Hệ thống cần sắp xếp lại, loại bỏ nội dung yếu và giữ lại những đoạn phù hợp hơn.

Bài toán thứ tư là tạo câu trả lời. Câu trả lời cần rõ ràng, dễ hiểu, không lặp lại nguyên văn toàn bộ tài liệu và không đưa thêm chi tiết không có căn cứ. Khi tài liệu chưa đủ, hệ thống cần thể hiện sự không chắc chắn thay vì tạo ra một đáp án hoàn chỉnh nhưng sai.

Bài toán thứ năm là mở rộng tri thức. Không có kho dữ liệu ban đầu nào bao phủ toàn bộ Lịch sử Việt Nam. Trong quá trình sử dụng, người dùng sẽ đặt những câu hỏi nằm ngoài phạm vi dữ liệu đã chuẩn bị. Hệ thống cần có cách tìm kiếm bổ sung nhưng phải tránh việc đưa nội dung chưa kiểm chứng vào kho dùng chung.

Bài toán cuối cùng là xây dựng sản phẩm. Một thuật toán trả lời tốt nhưng thiếu quản lý tài khoản, lịch sử, phản hồi, giao diện di động và công cụ quản trị sẽ khó sử dụng lâu dài. Đề tài vì vậy phải giải quyết đồng thời yêu cầu nghiên cứu và yêu cầu phát triển phần mềm.

## 1.4. Mục tiêu của đề tài

Mục tiêu tổng quát là xây dựng một hệ thống chatbot có khả năng hỗ trợ học tập và tra cứu Lịch sử Việt Nam, sử dụng trí tuệ nhân tạo để hiểu câu hỏi và tạo câu trả lời, đồng thời sử dụng kho tri thức bên ngoài để tăng tính có căn cứ.

Từ mục tiêu tổng quát, đề tài xác định các mục tiêu cụ thể. Hệ thống cần tiếp nhận câu hỏi bằng tiếng Việt và hỗ trợ thêm tiếng Anh; nhận diện câu hỏi nối tiếp; phân loại mục đích của câu hỏi; tìm kiếm tài liệu theo ngữ nghĩa; xem xét sự phù hợp về thời gian, nguyên nhân và thực thể; tạo câu trả lời có nguồn; lưu lại hội thoại; cho phép người dùng đánh giá; và từ chối những nội dung nằm ngoài phạm vi.

Đề tài cũng đặt mục tiêu xây dựng kho tri thức cá nhân để người dùng có thể lưu lại nội dung, chỉnh sửa và tái sử dụng trong các câu hỏi sau. Cơ chế này phải bảo đảm dữ liệu của mỗi tài khoản được tách biệt.

Một mục tiêu quan trọng khác là xây dựng vòng mở rộng tri thức có kiểm soát. Khi thiếu dữ liệu, hệ thống có thể tham khảo nguồn trực tuyến, nhưng nội dung mới phải được kiểm tra và phê duyệt trước khi trở thành tri thức dùng lâu dài.

Ở cấp độ sản phẩm, hệ thống cần có giao diện web, khả năng sử dụng trên điện thoại, chức năng tài khoản, hồ sơ, lịch sử, quản lý lượt sử dụng, thanh toán, luyện tập, hỗ trợ và quản trị. Cuối cùng, đề tài phải xây dựng được phương pháp đánh giá định lượng để xác định ưu điểm và hạn chế của giải pháp.

## 1.5. Đối tượng nghiên cứu

Đối tượng nghiên cứu chính là quy trình hỏi đáp tự động trong miền Lịch sử Việt Nam. Quy trình này bao gồm cách biểu diễn câu hỏi và tài liệu, cách tìm kiếm những đoạn có liên quan, cách điều chỉnh kết quả theo loại câu hỏi, cách kiểm tra ngữ cảnh, cách tạo câu trả lời và cách thu nhận phản hồi.

Đề tài đồng thời nghiên cứu cách tổ chức một hệ thống phần mềm có nhiều nhóm người dùng. Người dùng thông thường quan tâm đến trải nghiệm hỏi đáp, nguồn tài liệu, lịch sử và các công cụ học tập. Người quản trị quan tâm đến khả năng theo dõi hoạt động, xử lý phản hồi, duyệt tri thức, quản lý giao dịch và điều chỉnh nội dung. Hai nhóm nhu cầu này phải được giải quyết trong cùng một kiến trúc.

## 1.6. Phạm vi nghiên cứu

Phạm vi nội dung của hệ thống tập trung vào Lịch sử Việt Nam. Các câu hỏi có thể liên quan đến nhân vật, sự kiện, triều đại, cuộc khởi nghĩa, trận đánh, chính sách, tổ chức nhà nước, văn hóa, nguyên nhân, diễn biến, kết quả, ý nghĩa và so sánh giữa các giai đoạn. Hệ thống không được thiết kế để trả lời chuyên sâu về lịch sử thế giới hoặc những lĩnh vực không liên quan.

Trong phần thực nghiệm chính, bộ câu hỏi tập trung vào giai đoạn từ năm 939 đến năm 1945. Việc giới hạn này giúp các câu hỏi có chung phạm vi dữ liệu và dễ kiểm chứng hơn. Tuy nhiên, kho tri thức của sản phẩm không chỉ bị giới hạn ở đúng 100 câu hỏi đánh giá.

Về ngôn ngữ, tiếng Việt là ngôn ngữ chính. Hệ thống hỗ trợ người dùng đặt câu hỏi tiếng Anh bằng cách chuyển câu hỏi sang tiếng Việt để truy xuất, sau đó chuyển câu trả lời về ngôn ngữ người dùng. Đây là hỗ trợ song ngữ ở mức ứng dụng, chưa phải một nghiên cứu đầy đủ về hỏi đáp lịch sử đa ngôn ngữ.

Về nền tảng, sản phẩm được xây dựng trước hết cho web. Giao diện có thể thích ứng với màn hình nhỏ và được đóng gói thành ứng dụng Android. Đề tài chưa xây dựng một ứng dụng hoàn toàn riêng biệt cho từng hệ điều hành di động.

Về đánh giá, đề tài sử dụng số liệu tự động và kiểm tra chức năng. Nghiên cứu chưa thực hiện một khảo sát sư phạm dài hạn với lớp học, chưa đo tác động đến kết quả học tập qua nhiều tháng và chưa có đánh giá độc lập từ một hội đồng chuyên gia lịch sử cho toàn bộ kho dữ liệu.

## 1.7. Phương pháp nghiên cứu

Đề tài bắt đầu bằng phương pháp nghiên cứu tài liệu. Nhóm tìm hiểu các hệ thống hỏi đáp, mô hình ngôn ngữ lớn, phương pháp tìm kiếm văn bản theo ý nghĩa, cách lưu trữ biểu diễn số, kỹ thuật tạo câu trả lời có truy xuất, cơ chế sửa lỗi khi thiếu dữ liệu và các tiêu chí đánh giá. Việc nghiên cứu lý thuyết giúp nhóm xác định rằng không thể chỉ dùng một mô hình ngôn ngữ tổng quát cho bài toán lịch sử.

Sau đó, nhóm sử dụng phương pháp phân tích yêu cầu. Các chức năng được xác định từ góc nhìn của người học, người dùng phổ thông và người quản trị. Nhóm không chỉ đặt câu hỏi “chatbot phải trả lời như thế nào” mà còn xem xét người dùng cần đăng nhập ra sao, lưu lại nội dung thế nào, kiểm tra nguồn ở đâu, phản hồi bằng cách nào và nhận hỗ trợ khi gặp sự cố ra sao.

Phương pháp thiết kế hệ thống được sử dụng để chia sản phẩm thành các thành phần có trách nhiệm rõ ràng. Giao diện chịu trách nhiệm tương tác; máy chủ chịu trách nhiệm xác thực và nghiệp vụ; cơ sở dữ liệu lưu tài khoản, hội thoại và giao dịch; kho tri thức lưu các đoạn văn ở dạng có thể tìm kiếm; mô-đun trí tuệ nhân tạo chịu trách nhiệm truy xuất, kiểm tra và sinh câu trả lời.

Trong quá trình xây dựng, nhóm áp dụng phương pháp thực nghiệm lặp. Mỗi chức năng được triển khai, chạy thử, quan sát kết quả và điều chỉnh. Đối với phần hỏi đáp, nhóm thử các dạng câu factual, temporal, causal, comparison, câu nối tiếp và câu ngoài phạm vi. Đối với giao diện, nhóm kiểm tra quá trình nhận dữ liệu từng phần, hiển thị nguồn, lưu hội thoại và thay đổi ngôn ngữ.

Cuối cùng, nhóm sử dụng phương pháp đánh giá định lượng. Bộ câu hỏi được chia theo độ khó, mỗi câu có đáp án tham chiếu. Kết quả của hệ thống được so sánh với các hệ thống khác theo bốn tiêu chí. Ngoài điểm số, nhóm phân tích thời gian phản hồi, trạng thái dữ liệu vận hành, kết quả biên dịch sản phẩm và các hạn chế an toàn.

## 1.8. Ý nghĩa khoa học

Ý nghĩa khoa học của đề tài nằm ở việc điều chỉnh phương pháp truy xuất cho phù hợp với đặc trưng của câu hỏi lịch sử. Thay vì xem mọi câu hỏi là một yêu cầu tìm kiếm giống nhau, hệ thống thay đổi mức ưu tiên theo mục đích. Cách tiếp cận này phản ánh một nhận định quan trọng: chất lượng câu trả lời không chỉ phụ thuộc vào khả năng của mô hình sinh, mà còn phụ thuộc vào việc chọn đúng loại bằng chứng.

Đề tài cũng xây dựng được một vòng đời tri thức có sự tham gia của con người. Nội dung mới có thể được tìm kiếm và xử lý tự động, nhưng quyết định đưa vào kho tin cậy vẫn cần tín hiệu phản hồi hoặc sự phê duyệt. Điều này tạo sự cân bằng giữa khả năng mở rộng và yêu cầu kiểm soát.

Việc đánh giá trên 100 câu hỏi và so sánh với cả hệ thống tái lập lẫn trợ lý thương mại giúp làm rõ vị trí của giải pháp. Kết quả không chỉ cho thấy mặt cải thiện mà còn chỉ ra sự đánh đổi giữa mức độ tập trung, độ bao phủ và thời gian xử lý.

## 1.9. Ý nghĩa thực tiễn

Đối với người học, hệ thống cung cấp một cách tiếp cận lịch sử gần gũi hơn. Người dùng có thể đặt câu hỏi theo cách của mình, tiếp tục hỏi dựa trên câu trả lời trước, xem nguồn và lưu lại phần quan trọng. Chức năng luyện tập, điểm danh và bảng xếp hạng tạo thêm động lực sử dụng.

Đối với giáo viên hoặc người hướng dẫn, hệ thống có thể trở thành công cụ hỗ trợ giải thích ban đầu, gợi ý nội dung đọc và tạo tình huống thảo luận. Tuy nhiên, giáo viên vẫn giữ vai trò xác nhận và mở rộng kiến thức.

Đối với người quản trị, sản phẩm cung cấp khả năng quan sát hoạt động, nhận phản hồi và kiểm soát nội dung mới. Đây là điều kiện quan trọng nếu hệ thống được triển khai cho một trường học, thư viện số hoặc cộng đồng học tập.

Đối với nhóm phát triển, đề tài tạo ra một nền tảng có thể mở rộng sang bản đồ lịch sử, dòng thời gian, tài liệu hình ảnh, văn bản cổ, bài tập theo chương trình và nhiều miền tri thức khác.

## 1.10. Kết quả và sản phẩm

Kết quả của đề tài không chỉ là một mô hình thử nghiệm. Nhóm đã xây dựng một nền tảng có giao diện web, máy chủ xử lý, cơ sở dữ liệu, kho tri thức, ứng dụng Android, chức năng quản trị và bộ công cụ đánh giá. Người dùng có thể thực hiện toàn bộ quá trình từ tạo tài khoản, hỏi đáp, xem nguồn, lưu ghi chú, luyện tập đến thanh toán và liên hệ hỗ trợ.

Phần trí tuệ nhân tạo có khả năng xử lý nhiều loại câu hỏi, dùng lịch sử hội thoại, truy xuất nhiều nguồn, đánh giá ngữ cảnh, dịch hai chiều và tìm kiếm bổ sung. Phần quản trị cho phép quản lý nội dung và theo dõi hoạt động. Bộ 100 câu hỏi cùng kết quả đánh giá tạo cơ sở để tiếp tục so sánh các phiên bản trong tương lai.

**Bảng 1.1. Mục tiêu và kết quả thực hiện**

| Nội dung | Kết quả |
|---|---|
| Hỏi đáp Lịch sử Việt Nam | Đã xây dựng và vận hành |
| Truy xuất tài liệu có điều chỉnh theo câu hỏi | Đã xây dựng |
| Hiển thị và quản lý nguồn | Đã xây dựng |
| Xử lý hội thoại nối tiếp | Đã xây dựng |
| Hỗ trợ tiếng Việt và tiếng Anh | Đã xây dựng |
| Kho ghi chú riêng của người dùng | Đã xây dựng |
| Tìm kiếm bổ sung và kiểm duyệt | Đã xây dựng |
| Giao diện web và ứng dụng Android | Đã xây dựng |
| Quản trị, thanh toán, hỗ trợ và luyện tập | Đã xây dựng |
| Bộ đánh giá định lượng | Đã xây dựng |
| Tối ưu tốc độ và độ bao phủ | Cần tiếp tục hoàn thiện |

## 1.11. Bố cục báo cáo

Ngoài phần mở đầu, kết luận, tài liệu tham khảo và phụ lục, báo cáo gồm năm chương. Chương 1 trình bày bối cảnh, vấn đề, mục tiêu, phạm vi, phương pháp và ý nghĩa của đề tài. Chương 2 trình bày các kiến thức nền tảng và phân tích những hướng nghiên cứu có liên quan. Chương 3 mô tả quá trình phân tích, thiết kế và hoạt động của toàn bộ hệ thống. Chương 4 trình bày quá trình xây dựng sản phẩm, các chức năng thực tế, dữ liệu vận hành, kiểm thử và kết quả đánh giá. Chương 5 tổng kết mức độ hoàn thành, nêu hạn chế và đề xuất hướng phát triển.

# CHƯƠNG 2. CƠ SỞ LÝ THUYẾT VÀ NGHIÊN CỨU LIÊN QUAN

## 2.1. Hệ thống hỏi đáp bằng ngôn ngữ tự nhiên

Hệ thống hỏi đáp là một dạng ứng dụng cho phép người dùng đưa ra câu hỏi và nhận về một câu trả lời cụ thể. Khác với công cụ tìm kiếm truyền thống, hệ thống hỏi đáp không chỉ trả về danh sách tài liệu mà còn cố gắng xác định phần thông tin phù hợp và trình bày lại theo yêu cầu.

Các hệ thống hỏi đáp ban đầu thường dựa trên luật. Người phát triển chuẩn bị trước các mẫu câu hỏi, từ khóa và câu trả lời. Phương pháp này dễ kiểm soát trong phạm vi nhỏ nhưng khó mở rộng. Khi người dùng thay đổi cách diễn đạt, hệ thống có thể không nhận ra ý định dù nội dung câu hỏi không thay đổi.

Sự phát triển của học máy và xử lý ngôn ngữ tự nhiên giúp hệ thống hiểu được nhiều cách diễn đạt hơn. Các mô hình hiện đại có thể phân tích mối liên hệ giữa các từ, xem xét ngữ cảnh và tạo câu trả lời mới. Tuy nhiên, khả năng tạo văn bản không đồng nghĩa với khả năng bảo đảm tính đúng đắn. Vì vậy, các hệ thống chuyên biệt ngày càng có xu hướng kết hợp mô hình sinh với nguồn dữ liệu bên ngoài.

Trong lĩnh vực lịch sử, một hệ thống hỏi đáp cần xử lý ít nhất ba tầng thông tin. Tầng thứ nhất là dữ kiện, chẳng hạn tên nhân vật, năm, địa điểm hoặc kết quả. Tầng thứ hai là quan hệ, chẳng hạn sự kiện nào xảy ra trước, nguyên nhân nào dẫn đến biến đổi và chính sách nào tạo ra ảnh hưởng. Tầng thứ ba là diễn giải, trong đó người dùng yêu cầu đánh giá ý nghĩa hoặc so sánh nhiều giai đoạn. Mỗi tầng đòi hỏi lượng và loại bằng chứng khác nhau.

## 2.2. Chatbot trong giáo dục

Chatbot giáo dục có thể đảm nhận nhiều vai trò như cung cấp thông tin, hướng dẫn thao tác, ôn tập, đặt câu hỏi, giải thích và hỗ trợ người học ngoài giờ. Ưu điểm nổi bật là khả năng phản hồi ngay, không phụ thuộc vào thời gian làm việc của con người. Đối với những câu hỏi lặp lại, chatbot giúp giảm tải cho giáo viên hoặc bộ phận hỗ trợ.

Tuy nhiên, hiệu quả của chatbot giáo dục không chỉ được đánh giá bằng việc hệ thống có trả lời hay không. Câu trả lời cần phù hợp với trình độ người học, tránh gây hiểu sai, khuyến khích kiểm tra nguồn và không tạo cảm giác rằng mọi nội dung do hệ thống sinh ra đều là chân lý. Một chatbot trả lời quá tự tin khi thiếu dữ liệu có thể gây tác động tiêu cực hơn một công cụ tìm kiếm thông thường.

Trong đề tài này, yếu tố giáo dục được thể hiện qua nhiều chức năng. Ngoài hỏi đáp, hệ thống cho phép lưu ghi chú, xem lại hội thoại, luyện tập hằng ngày, đọc lời giải thích và tham gia bảng xếp hạng. Những chức năng này giúp quá trình học không chỉ là một lần hỏi và nhận đáp án, mà có sự lặp lại, ghi nhớ và tương tác.

## 2.3. Đặc điểm của ngôn ngữ tiếng Việt trong câu hỏi lịch sử

Tiếng Việt sử dụng dấu thanh và có nhiều từ ghép được viết cách. Một tên riêng có thể được viết đầy đủ, viết rút gọn hoặc thiếu dấu. Trong lịch sử, cùng một nhân vật còn có thể được gọi bằng tên thật, niên hiệu, tước hiệu hoặc tên quen thuộc. Nếu chỉ tìm theo chuỗi ký tự giống hệt, hệ thống dễ bỏ sót tài liệu.

Câu hỏi tiếng Việt cũng thường lược bỏ chủ ngữ khi ngữ cảnh đã rõ. Sau câu “Lê Lợi lãnh đạo cuộc khởi nghĩa nào?”, người dùng có thể hỏi “sau đó ông lên ngôi ra sao?”. Câu thứ hai không chứa tên nhân vật, nhưng người nghe hiểu nhờ nội dung trước. Hệ thống cần tái tạo đầy đủ ý nghĩa trước khi tìm kiếm.

Một đặc điểm khác là người dùng có thể đặt câu hỏi không hoàn toàn chính xác. Họ có thể nhầm năm, nhầm nhân vật hoặc đưa ra một nhận định sai và yêu cầu xác nhận. Hệ thống không nên tiếp nhận tiền đề đó một cách máy móc. Câu trả lời cần chỉ ra phần chưa đúng, giải thích lại và cung cấp căn cứ.

Để xử lý các vấn đề trên, sản phẩm kết hợp chuẩn hóa văn bản, so khớp không phụ thuộc một phần vào dấu, nhận diện các cách gọi khác nhau và sử dụng nội dung hội thoại gần nhất. Cách làm này không giải quyết hoàn toàn mọi hiện tượng ngôn ngữ, nhưng giúp tăng khả năng hiểu các câu hỏi phổ biến.

## 2.4. Mô hình ngôn ngữ lớn

Mô hình ngôn ngữ lớn được huấn luyện từ lượng văn bản rất lớn để học cách các từ và câu xuất hiện trong ngữ cảnh. Khi nhận một yêu cầu, mô hình dự đoán và tạo ra chuỗi từ phù hợp. Khả năng này cho phép mô hình trả lời câu hỏi, tóm tắt, dịch, phân loại và viết văn bản.

Trong hệ thống của đề tài, mô hình ngôn ngữ không chỉ được dùng ở bước cuối. Tùy cấu hình, mô hình có thể hỗ trợ phân loại câu hỏi khó, đánh giá mức độ liên quan của tài liệu, viết lại câu hỏi tìm kiếm, kiểm tra nội dung web, dịch và tạo câu hỏi gợi ý. Tuy nhiên, nhóm cố gắng sử dụng luật đơn giản ở những bước có thể xác định rõ để giảm chi phí và thời gian.

Hạn chế lớn nhất của mô hình ngôn ngữ là hiện tượng tạo thông tin không có căn cứ. Mô hình được tối ưu để tạo văn bản hợp lý chứ không phải để kiểm chứng mọi mệnh đề. Khi không có dữ liệu hoặc dữ liệu mâu thuẫn, mô hình vẫn có thể tạo ra một câu trả lời trôi chảy. Vì vậy, việc cung cấp ngữ cảnh và giới hạn mô hình trong ngữ cảnh là yêu cầu quan trọng.

## 2.5. Biểu diễn ý nghĩa của văn bản

Để tìm kiếm theo ý nghĩa, hệ thống cần chuyển câu hỏi và tài liệu thành các dãy số. Mỗi dãy số có thể được xem như một vị trí trong không gian nhiều chiều. Hai đoạn văn có ý nghĩa gần nhau thường có vị trí gần nhau hơn so với hai đoạn không liên quan.

Ví dụ, câu hỏi “Ai chỉ huy cuộc khởi nghĩa Lam Sơn?” và đoạn văn “Lê Lợi là người lãnh đạo nghĩa quân Lam Sơn” không có toàn bộ từ giống nhau, nhưng có ý nghĩa gần. Phương pháp biểu diễn số giúp hệ thống nhận ra sự gần gũi này.

Tài liệu lịch sử thường dài nên không được biểu diễn như một khối duy nhất. Nếu một cuốn sách được chuyển thành một biểu diễn chung, hệ thống khó xác định chính xác đoạn nào liên quan đến câu hỏi. Vì vậy, tài liệu được chia thành những đoạn nhỏ hơn. Mỗi đoạn giữ thêm thông tin về nguồn, trang hoặc tiêu đề để có thể hiển thị lại cho người dùng.

Kích thước đoạn là một yếu tố quan trọng. Đoạn quá ngắn có thể mất ngữ cảnh; đoạn quá dài chứa nhiều nội dung không liên quan. Quá trình xây dựng kho tri thức cần cân bằng hai yếu tố này và có phần chồng lấn giữa các đoạn để tránh cắt mất câu hoặc ý quan trọng.

## 2.6. Tìm kiếm trong kho tri thức

Sau khi các đoạn tài liệu được biểu diễn thành số, hệ thống sử dụng công cụ tìm kiếm chuyên dụng để tìm những đoạn gần với câu hỏi. Công cụ này phù hợp với số lượng đoạn lớn và cho phép trả kết quả nhanh hơn so với việc so sánh tuần tự với toàn bộ dữ liệu.

Kết quả tìm kiếm ban đầu được sắp xếp theo mức độ gần trong không gian biểu diễn. Tuy nhiên, thứ hạng này chưa phản ánh đầy đủ yêu cầu của câu hỏi lịch sử. Một đoạn có nhiều từ liên quan có thể đứng cao dù sai năm. Một đoạn khác có thể đúng nguyên nhân nhưng dùng cách diễn đạt khác nên đứng thấp. Do đó, đề tài sử dụng thêm bước xem xét lại kết quả.

## 2.7. Phương pháp tạo câu trả lời có truy xuất tài liệu

Phương pháp tạo câu trả lời có truy xuất gồm hai phần chính. Phần thứ nhất tìm kiếm tài liệu liên quan. Phần thứ hai đưa các tài liệu này cùng câu hỏi vào mô hình ngôn ngữ để tạo câu trả lời. Nhờ có tài liệu, mô hình có cơ sở cụ thể và người dùng có thể xem nguồn.

Ưu điểm của phương pháp này là kho tri thức có thể cập nhật mà không cần huấn luyện lại toàn bộ mô hình. Khi có tài liệu mới, hệ thống chỉ cần xử lý và đưa vào kho tìm kiếm. Điều này phù hợp với sản phẩm cần mở rộng theo thời gian.

Tuy nhiên, phương pháp này phụ thuộc rất nhiều vào chất lượng truy xuất. Nếu tài liệu đưa vào không liên quan, mô hình có thể bị dẫn sai. Nếu thiếu một phần bằng chứng, câu trả lời có thể không đầy đủ. Nếu có quá nhiều đoạn, mô hình khó xác định nội dung quan trọng. Vì vậy, đề tài tập trung nhiều vào bước lựa chọn và kiểm tra ngữ cảnh.

## 2.8. Hạn chế của cách truy xuất giống nhau cho mọi câu hỏi

Một hệ thống đơn giản thường chọn một số lượng cố định các đoạn gần nghĩa nhất cho mọi câu hỏi. Cách làm này dễ triển khai nhưng không phản ánh sự khác nhau giữa các yêu cầu.

Với câu hỏi “Nhà Lý được thành lập năm nào?”, tài liệu chứa mốc năm và sự kiện thành lập là quan trọng nhất. Với câu hỏi “Vì sao nhà Lý dời đô ra Thăng Long?”, đoạn chỉ nêu năm 1010 không đủ; hệ thống cần nội dung về vị trí, điều kiện tự nhiên, chính trị và tầm nhìn phát triển. Với câu hỏi “So sánh tổ chức nhà nước thời Lý và thời Trần”, hệ thống cần thu thập thông tin từ cả hai thời kỳ.

Nếu dùng cùng số lượng và cùng cách xếp hạng, hệ thống có thể lấy quá nhiều nội dung cho câu đơn giản nhưng lại quá ít cho câu tổng hợp. Đề tài vì vậy điều chỉnh cả trọng số lẫn số lượng tài liệu theo loại câu hỏi.

## 2.9. Phân loại mục đích câu hỏi

Hệ thống chia câu hỏi thành các nhóm chính. Nhóm dữ kiện bao gồm những câu hỏi về nhân vật, sự kiện hoặc nội dung trực tiếp. Nhóm thời gian tập trung vào năm, thế kỷ, giai đoạn, thứ tự trước sau hoặc triều đại. Nhóm nguyên nhân tập trung vào lý do, điều kiện dẫn đến, hậu quả hoặc mối liên hệ nhân quả. Nhóm so sánh yêu cầu đối chiếu từ hai đối tượng trở lên.

Ngoài bốn nhóm lịch sử, hệ thống nhận diện lời chào hỏi và câu hỏi ngoài phạm vi. Lời chào được trả lời ngắn gọn mà không cần tìm kiếm kho tài liệu. Câu hỏi không liên quan đến Lịch sử Việt Nam được từ chối hoặc hướng người dùng quay lại chủ đề phù hợp.

Việc phân loại trước giúp giảm thao tác không cần thiết. Một câu chào không cần chạy toàn bộ quá trình truy xuất. Một câu hỏi ngoài phạm vi không nên kích hoạt tìm kiếm web. Một câu hỏi nguyên nhân cần ưu tiên tài liệu có các dấu hiệu giải thích.

## 2.10. Xem xét yếu tố thời gian

Thời gian là một trong những yếu tố quan trọng nhất của tri thức lịch sử. Hệ thống tìm các biểu thức năm trong câu hỏi và tài liệu, sau đó đánh giá mức độ phù hợp. Nếu câu hỏi và tài liệu cùng nhắc đến một năm, mức phù hợp thời gian cao. Nếu hai mốc cách xa nhau, điểm giảm dần.

Ngoài con số năm, hệ thống xem xét các từ chỉ giai đoạn và triều đại. Một tài liệu có thể không nhắc lại đúng năm nhưng vẫn thuộc đúng bối cảnh. Ví dụ, câu hỏi về ba lần kháng chiến chống Mông - Nguyên cần các tài liệu thuộc thời Trần ngay cả khi một đoạn cụ thể chỉ nói “cuộc kháng chiến lần thứ hai”.

Cơ chế thời gian không thay thế cho hiểu biết lịch sử hoàn chỉnh. Nó là một tín hiệu giúp sắp xếp tài liệu. Những trường hợp sử dụng niên hiệu, âm lịch hoặc mốc tương đối vẫn cần được mở rộng trong tương lai.

## 2.11. Xem xét quan hệ nguyên nhân và kết quả

Câu hỏi “vì sao” đòi hỏi tài liệu có nội dung giải thích. Hệ thống nhận diện các từ và cấu trúc thường xuất hiện trong quan hệ nhân quả như “do”, “vì”, “dẫn đến”, “kết quả là”, “hậu quả” và “nguyên nhân”. Khi câu hỏi có mục đích nhân quả, những đoạn chứa quan hệ này được ưu tiên hơn.

Điểm nhân quả hiện dựa trên tín hiệu ngôn ngữ và sự xuất hiện của các cặp biểu đạt. Đây là cách làm dễ giải thích và có tốc độ nhanh. Hạn chế là không phải mọi quan hệ nhân quả đều được diễn đạt bằng từ khóa rõ ràng. Một đoạn văn có thể giải thích nguyên nhân qua nhiều câu mà không dùng từ “vì”. Trong tương lai, có thể bổ sung mô hình nhận diện quan hệ sâu hơn.

## 2.12. Nhận diện nhân vật, triều đại và sự kiện

Trong lịch sử, một thực thể có thể có nhiều cách gọi. Hệ thống xây dựng tập tên thay thế và các dạng viết phổ biến để nhận diện. Khi câu hỏi nhắc đến Quang Trung, hệ thống có thể liên hệ với Nguyễn Huệ trong ngữ cảnh phù hợp. Khi câu hỏi nói “nhà Hậu Lê”, hệ thống cần phân biệt với các giai đoạn khác mang họ Lê.

Thông tin thực thể được dùng để điều chỉnh thứ hạng. Tài liệu có đúng thực thể được tăng ưu tiên; tài liệu nói về một thực thể khác nhưng có từ gần giống bị giảm ưu tiên. Ở bước cuối, nguồn hiển thị cũng được kiểm tra để hạn chế đưa ra tài liệu lạc chủ đề.

Đối với câu hỏi nối tiếp, thực thể vừa xuất hiện trong hội thoại được dùng để làm rõ đại từ hoặc từ chỉ định. Điều này giúp cuộc trò chuyện tự nhiên hơn và giảm yêu cầu người dùng phải lặp lại tên đầy đủ.

## 2.13. Cơ chế truy xuất thích nghi

Sau khi xác định loại câu hỏi, hệ thống kết hợp ba nhóm điểm: mức độ gần nghĩa, mức độ phù hợp thời gian và mức độ phù hợp nhân quả. Tỷ lệ của các nhóm điểm thay đổi theo mục đích.

Đối với câu hỏi dữ kiện, mức độ gần nghĩa giữ vai trò chính vì người dùng cần tìm đoạn nói trực tiếp về đối tượng. Đối với câu hỏi thời gian, yếu tố mốc năm được tăng. Đối với câu hỏi nguyên nhân, tín hiệu nhân quả được tăng. Đối với câu hỏi so sánh, hệ thống lấy nhiều tài liệu hơn để có đủ thông tin về các phía.

**Bảng 2.1. So sánh cách hỏi đáp thông thường với phương pháp của đề tài**

| Nội dung | Cách thông thường | Phương pháp của đề tài |
|---|---|---|
| Hiểu mục đích câu hỏi | Có thể không phân loại | Phân biệt dữ kiện, thời gian, nguyên nhân, so sánh |
| Tìm tài liệu | Chủ yếu dựa vào gần nghĩa | Kết hợp gần nghĩa, thời gian, nhân quả và thực thể |
| Số lượng tài liệu | Cố định | Thay đổi theo loại câu hỏi |
| Câu hỏi nối tiếp | Dễ mất chủ thể | Dùng nội dung hội thoại gần nhất |
| Thiếu dữ liệu | Từ chối hoặc mô hình tự trả lời | Có thể tìm nguồn bổ sung và chờ kiểm duyệt |
| Cập nhật kiến thức | Thường nạp thủ công | Có quy trình thu nhận và phê duyệt |
| Cá nhân hóa | Dùng chung một kho | Có kho ghi chú riêng cho từng tài khoản |

**Bảng 2.2. Mức ưu tiên của các yếu tố theo từng loại câu hỏi**

| Loại câu hỏi | Gần nghĩa | Thời gian | Nguyên nhân | Số tài liệu tối đa |
|---|---:|---:|---:|---:|
| Dữ kiện | 70% | 20% | 10% | 10 |
| Nguyên nhân | 40% | 10% | 50% | 10 |
| Thời gian | 40% | 50% | 10% | 10 |
| So sánh | 60% | 20% | 20% | 15 |

Để trình bày rõ hơn cơ chế này theo dạng luận văn, có thể xem mỗi đoạn tài liệu thu được sau bước tìm kiếm ban đầu là một ứng viên. Hệ thống không chỉ giữ nguyên thứ tự tìm kiếm ban đầu mà tính lại điểm cho từng ứng viên theo loại câu hỏi. Các ký hiệu dùng trong công thức được trình bày ở Bảng 2.3.

**Bảng 2.3. Ký hiệu dùng trong mô hình xếp hạng TALRAG**

| Ký hiệu | Ý nghĩa |
|---|---|
| q | Câu hỏi của người dùng sau khi đã chuẩn hóa và làm rõ ngữ cảnh hội thoại |
| d | Một đoạn tài liệu ứng viên được truy xuất từ kho tri thức |
| i | Loại câu hỏi, gồm dữ kiện, thời gian, nguyên nhân, so sánh, ngoài phạm vi hoặc trò chuyện thông thường |
| S_n(q,d) | Điểm gần nghĩa giữa câu hỏi và tài liệu |
| S_t(q,d) | Điểm phù hợp thời gian giữa câu hỏi và tài liệu |
| S_c(q,d) | Điểm phù hợp quan hệ nguyên nhân - kết quả |
| Δ_e(q,d) | Điểm cộng hoặc điểm trừ theo thực thể lịch sử chính |
| α_i, β_i, γ_i | Trọng số của ba nhóm điểm, thay đổi theo loại câu hỏi |
| k_i | Số tài liệu tối đa được giữ lại sau khi xếp hạng |

Điểm xếp hạng cuối cùng của một tài liệu được mô tả theo Công thức 2.1. Công thức này phản ánh đúng cách hệ thống cộng điểm gần nghĩa, điểm thời gian, điểm nhân quả, sau đó điều chỉnh thêm theo thực thể lịch sử và chặn kết quả trong khoảng từ 0 đến 1.

S_xh(q,d) = min(max(α_i · S_n(q,d) + β_i · S_t(q,d) + γ_i · S_c(q,d) + Δ_e(q,d), 0), 1)     (2.1)

Trong đó, α_i, β_i và γ_i được lấy theo Bảng 2.2. Nếu câu hỏi là câu hỏi dữ kiện, α_i lớn nhất vì hệ thống ưu tiên đoạn văn gần nghĩa trực tiếp. Nếu câu hỏi hỏi năm tháng, β_i tăng lên. Nếu câu hỏi hỏi nguyên nhân, γ_i tăng lên. Nếu câu hỏi là so sánh, hệ thống tăng số tài liệu tối đa để có đủ thông tin của nhiều đối tượng.

Điểm gần nghĩa không được trình bày như một giá trị tuyệt đối từ mô hình, mà được ước lượng từ thứ hạng của tài liệu sau bước tìm kiếm ban đầu. Tài liệu đứng đầu có điểm cao nhất, các tài liệu phía sau giảm dần nhưng không bị đưa về 0 ngay, nhằm tránh loại bỏ quá sớm những đoạn vẫn có khả năng hữu ích.

S_n(q,d_r) = max(1 - r · 0,5/(m - 1), 0,5)     (2.2)

Trong Công thức 2.2, r là vị trí của tài liệu trong danh sách ứng viên, bắt đầu từ 0; m là tổng số tài liệu ứng viên. Khi r = 0, điểm gần nghĩa bằng 1. Khi tài liệu nằm thấp hơn trong danh sách, điểm giảm dần nhưng không thấp hơn 0,5 trong nhóm được xét. Cách làm này phù hợp với sản phẩm vì kết quả tìm kiếm ban đầu đã lọc theo nghĩa, còn bước sau chỉ cần phân biệt mức ưu tiên giữa các tài liệu.

Đối với câu hỏi có mốc năm, điểm thời gian được tính theo khoảng cách giữa năm trong câu hỏi và năm trong tài liệu. Nếu có nhiều năm, hệ thống lấy cặp năm gần nhau nhất. Công thức khái quát được trình bày như sau:

S_t(q,d) = f(min |y_q - y_d|)     (2.3)

Trong đó, y_q là năm xuất hiện trong câu hỏi, y_d là năm xuất hiện trong tài liệu. Hàm f được quy đổi theo Bảng 2.4.

**Bảng 2.4. Quy đổi khoảng cách năm thành điểm thời gian**

| Khoảng cách giữa hai mốc năm | Điểm thời gian |
|---:|---:|
| Cùng năm | 1,00 |
| Không quá 20 năm | 0,85 |
| Không quá 50 năm | 0,70 |
| Không quá 100 năm | 0,50 |
| Không quá 200 năm | 0,30 |
| Không quá 500 năm | 0,15 |
| Xa hơn hoặc không đủ căn cứ | 0,05 |

Khi câu hỏi không chứa năm cụ thể nhưng có từ ngữ chỉ thời gian như “thời kỳ”, “triều đại”, “giai đoạn”, hệ thống không bỏ qua hoàn toàn yếu tố thời gian. Trường hợp này được xử lý bằng cách xem tài liệu có chứa các tín hiệu thời gian tương ứng hay không, nhưng điểm tối đa thấp hơn so với trường hợp có mốc năm rõ ràng.

Đối với câu hỏi nguyên nhân, hệ thống tìm các từ khóa và cặp quan hệ thể hiện nguyên nhân - kết quả trong tài liệu. Điểm nhân quả được mô tả theo Công thức 2.4.

S_c(q,d) = min((0,7 · min(h/5, 1) + b) · m_q, 1)     (2.4)

Trong đó, h là số tín hiệu nhân quả xuất hiện trong tài liệu; b là điểm cộng khi tài liệu có cặp quan hệ rõ như “vì ... nên”, “do ... dẫn đến”, “nhờ ... mà”; m_q là hệ số tăng khi bản thân câu hỏi là câu hỏi nguyên nhân. Trong hệ thống hiện tại, b có giá trị 0,3 khi tìm được cặp quan hệ rõ, còn m_q bằng 1,3 đối với câu hỏi nguyên nhân và bằng 1 đối với trường hợp khác.

Điểm điều chỉnh theo thực thể lịch sử giúp hạn chế nhầm lẫn giữa các nhân vật, triều đại hoặc sự kiện có tên gần giống nhau. Công thức 2.5 mô tả điểm này dưới dạng một hàm rời rạc.

Δ_e(q,d) = g(E_q, d)     (2.5)

**Bảng 2.5. Quy tắc điều chỉnh theo thực thể lịch sử**

| Điều kiện trong tài liệu | Giá trị Δ_e |
|---|---:|
| Có tên chuẩn hoặc tên gọi khác của thực thể chính | +0,35 |
| Có từ khóa liên quan trực tiếp từ hai lần trở lên | +0,20 |
| Có một từ khóa liên quan trực tiếp | +0,10 |
| Có từ khóa thuộc thực thể khác dễ gây nhầm lẫn | -0,40 |
| Không có tín hiệu rõ | 0,00 |

Cách điều chỉnh này đặc biệt quan trọng với các chủ đề như Bạch Đằng, nhà Lê, nhà Trần, Lê Lợi, Lê Hoàn, Trần Hưng Đạo hoặc các sự kiện có nhiều lần xuất hiện trong lịch sử. Nhờ vậy, một tài liệu chỉ gần nghĩa về mặt từ ngữ nhưng sai nhân vật hoặc sai thời kỳ sẽ bị giảm ưu tiên trước khi đưa vào phần tạo câu trả lời.

Sau khi tính điểm cơ sở, hệ thống tiếp tục điều chỉnh dựa trên thực thể lịch sử. Việc tách phần điều chỉnh thực thể khỏi ba tỷ lệ chính giúp hệ thống có thể tăng hoặc giảm thứ hạng khi phát hiện tài liệu đúng hoặc sai đối tượng.

## 2.14. Kiểm tra tài liệu trước khi trả lời

Kết quả tìm kiếm được xem là ứng viên chứ chưa phải bằng chứng cuối cùng. Hệ thống có hai cách kiểm tra. Cách nhanh sử dụng từ khóa, thực thể và thông tin đi kèm của tài liệu. Cách sâu hơn sử dụng mô hình ngôn ngữ để trả lời câu hỏi tài liệu có phù hợp hay không.

Cách nhanh có ưu điểm về tốc độ và chi phí, phù hợp với phần lớn câu hỏi rõ ràng. Cách dùng mô hình có thể xử lý những trường hợp diễn đạt phức tạp nhưng làm tăng thời gian. Sản phẩm cho phép điều chỉnh chế độ để cân bằng chất lượng với hiệu năng.

Việc lọc tài liệu có một sự đánh đổi. Nếu lọc quá lỏng, ngữ cảnh chứa nhiều nội dung không liên quan. Nếu lọc quá chặt, hệ thống có thể loại mất bằng chứng cần thiết. Kết quả thực nghiệm của đề tài cho thấy độ chính xác của ngữ cảnh được cải thiện ở một số nhóm nhưng độ bao phủ còn thấp, phản ánh đúng sự đánh đổi này.

## 2.15. Tạo và kiểm soát câu trả lời

Những tài liệu đạt yêu cầu được ghép thành ngữ cảnh cùng với câu hỏi và một phần hội thoại. Mô hình được yêu cầu trả lời dựa trên nội dung đã cung cấp, sử dụng ngôn ngữ rõ ràng và giữ cách diễn đạt phù hợp với lịch sử Việt Nam.

Hệ thống phân biệt một số kiểu trả lời. Với câu hỏi dữ kiện, câu trả lời cần trực tiếp. Với giả định lịch sử, hệ thống phải nói rõ đây là phân tích giả định. Với nhận định sai, hệ thống cần sửa tiền đề trước khi giải thích. Với câu hỏi mang tính ý kiến, hệ thống trình bày lập luận và tránh biến diễn giải thành sự thật tuyệt đối.

Sau khi mô hình tạo nội dung, câu trả lời được làm sạch và đối chiếu với danh sách nguồn. Những ký hiệu trích dẫn không đúng được điều chỉnh. Các nguồn không phù hợp với thực thể chính có thể bị loại. Câu trả lời, nguồn và thông tin liên quan được lưu vào hội thoại để người dùng xem lại.

## 2.16. Bộ nhớ cho câu hỏi gần giống

Trong quá trình sử dụng, nhiều người có thể đặt những câu hỏi giống hoặc gần giống nhau. Nếu hệ thống thực hiện lại toàn bộ quy trình mỗi lần, thời gian và chi phí tăng. Vì vậy, sản phẩm lưu lại biểu diễn của câu hỏi cùng câu trả lời và nguồn.

Khi có câu hỏi mới, hệ thống so sánh với các câu đã lưu. Nếu mức độ giống vượt ngưỡng và dữ liệu thuộc đúng phạm vi người dùng, kho tri thức và phiên bản, câu trả lời có thể được sử dụng lại. Với người dùng tiếng Anh, nội dung được chuyển ngôn ngữ trước khi hiển thị.

Bộ nhớ được tách theo phạm vi để tránh việc câu trả lời riêng của một tài khoản xuất hiện ở tài khoản khác. Khi kho tri thức thay đổi, phiên bản dữ liệu tăng làm các mục cũ không còn được xem là hợp lệ. Cơ chế này giúp giảm nguy cơ sử dụng câu trả lời lỗi thời.

## 2.17. Mở rộng tri thức từ nguồn trực tuyến

Khi không tìm thấy đủ tài liệu trong kho nội bộ, hệ thống có thể tìm kiếm trên Internet. Trước hết, câu hỏi được chuyển thành một hoặc nhiều truy vấn phù hợp. Kết quả được sắp xếp với sự ưu tiên dành cho cổng thông tin nhà nước, bảo tàng, cơ quan nghiên cứu, báo chí chính thống và nguồn đã được cấu hình là đáng tin cậy.

Điểm ưu tiên nguồn trực tuyến được mô tả theo Công thức 2.6. Công thức này không thay thế việc kiểm tra nội dung, nhưng giúp hệ thống đưa các nguồn có độ tin cậy cao lên trước khi tải và chia đoạn văn bản.

P(u) = 450 nếu u thuộc cổng thông tin nhà nước; 300 nếu u thuộc nguồn nhà nước hoặc báo chí chính thống; 100 nếu u thuộc danh sách nguồn đáng tin cậy; 0 trong các trường hợp còn lại.     (2.6)

Trong công thức trên, u là địa chỉ nguồn. Việc dùng điểm 450, 300, 100 và 0 tạo ra khoảng cách đủ lớn để nguồn chính thống được ưu tiên rõ ràng, đồng thời vẫn cho phép hệ thống dùng nguồn khác trong trường hợp cấu hình cho phép và không tìm được nguồn tốt hơn.

Nội dung trang được tải, loại bỏ phần điều hướng và quảng cáo, chia thành các đoạn rồi lọc theo câu hỏi. Hệ thống không sử dụng mọi kết quả tìm được. Các đoạn không có từ khóa cốt lõi, có dấu hiệu spam hoặc không liên quan đến lịch sử bị loại bỏ.

Những đoạn còn lại được kiểm tra và dùng để tạo câu trả lời tạm thời. Nếu bằng chứng không đủ, hệ thống thông báo chưa thể trả lời đáng tin cậy. Nếu đủ, câu trả lời được đưa cho người dùng nhưng đồng thời được đánh dấu là nội dung đang trong quá trình học từ nguồn bên ngoài.

Điểm quan trọng là nội dung này chưa trở thành tri thức chính thức. Nó được lưu vào khu vực chờ. Người quản trị có thể kiểm tra, còn phản hồi tích cực từ người dùng có thể trở thành một tín hiệu bổ sung. Chỉ khi đạt điều kiện, nội dung mới được biên tập, chia đoạn và đưa vào kho dùng lâu dài.

## 2.18. Vai trò của con người trong quá trình học

Thuật ngữ “tự học” trong đề tài không có nghĩa hệ thống tự thay đổi toàn bộ mô hình mà không có kiểm soát. Hệ thống tự động hóa các bước tìm kiếm, làm sạch, kiểm tra ban đầu, lưu chờ và chuẩn bị dữ liệu. Con người vẫn tham gia ở bước quyết định tri thức có được chấp nhận hay không.

Vai trò này rất quan trọng trong lịch sử. Một nguồn có thể trình bày đúng dữ kiện nhưng mang góc nhìn khác; một câu trả lời có thể phù hợp với câu hỏi nhưng thiếu bối cảnh; một nội dung được nhiều người thích chưa chắc đã chính xác. Vì vậy, phản hồi cộng đồng chỉ là tín hiệu, còn quản trị viên chịu trách nhiệm kiểm tra trước khi bổ sung vào kho chung.

## 2.19. Kho tri thức cá nhân

Mỗi người học có nhu cầu ghi chú khác nhau. Có người muốn lưu một câu trả lời ngắn để ôn tập; có người muốn sửa lại cách diễn đạt; có người muốn thêm nhận xét của giảng viên. Nếu tất cả nội dung này được đưa vào kho chung, chất lượng dữ liệu sẽ khó kiểm soát. Đề tài giải quyết bằng cách tạo vùng tri thức riêng theo tài khoản.

Người dùng có thể chọn một phần câu trả lời, nhập bản sửa hoặc tạo ghi chú mới. Khi lưu, nội dung được chuyển thành dạng có thể tìm kiếm. Trong lần hỏi sau, hệ thống tìm cả kho chung và kho cá nhân. Nội dung cá nhân được ưu tiên vì phản ánh mục tiêu học tập của người đó, nhưng cần được hiển thị với nhãn rõ ràng để không bị hiểu nhầm là tài liệu chính thống.

Việc tách dữ liệu theo tài khoản cũng là một yêu cầu riêng tư. Câu hỏi và ghi chú của người này không được dùng để cá nhân hóa cho người khác. Thiết kế này tạo nền tảng cho các chức năng phát triển sau như bộ thẻ ghi nhớ, lộ trình học và hồ sơ kiến thức cá nhân.

## 2.20. Hỗ trợ hai ngôn ngữ

Kho tài liệu chính tập trung vào tiếng Việt. Khi người dùng hỏi bằng tiếng Anh, hệ thống nhận diện ngôn ngữ và chuyển nội dung sang tiếng Việt trước khi tìm kiếm. Sau khi có câu trả lời, hệ thống chuyển trở lại tiếng Anh. Nguồn và câu hỏi gợi ý cũng có thể được chuyển ngôn ngữ để giao diện thống nhất.

Cách làm này giúp tận dụng cùng một kho tri thức, nhưng đặt ra yêu cầu giữ đúng tên riêng và thuật ngữ. Những tên triều đại, chức danh và địa danh không nên được dịch máy một cách tùy ý. Hệ thống hiện có chính sách ngôn ngữ để giữ cách gọi lịch sử Việt Nam, nhưng vẫn cần tiếp tục xây dựng bảng thuật ngữ song ngữ.

## 2.21. Đánh giá hệ thống hỏi đáp có truy xuất

Đánh giá một chatbot không thể chỉ dựa vào cảm giác câu trả lời “hay” hoặc “dở”. Một câu trả lời có thể rất trôi chảy nhưng không được tài liệu hỗ trợ. Ngược lại, một câu trả lời bám sát nguồn nhưng dài dòng và không đúng trọng tâm cũng chưa tốt.

Đề tài sử dụng bốn tiêu chí. Tiêu chí thứ nhất xem các phát biểu trong câu trả lời có được ngữ cảnh hỗ trợ hay không. Tiêu chí thứ hai xem câu trả lời có trực tiếp giải quyết câu hỏi hay không. Tiêu chí thứ ba xem các đoạn được truy xuất có thật sự hữu ích và được xếp ở vị trí phù hợp hay không. Tiêu chí thứ tư xem ngữ cảnh có bao phủ đủ thông tin cần thiết trong đáp án tham chiếu hay không.

Bốn tiêu chí phản ánh bốn khía cạnh khác nhau. Không nên gộp chúng thành một khái niệm “độ chính xác” duy nhất. Hệ thống có thể đạt điểm cao ở mức độ liên quan nhưng thấp ở độ bao phủ, như kết quả của TALRAG trong thí nghiệm. Việc nhìn từng tiêu chí giúp xác định chính xác phần cần cải thiện.

**Bảng 2.6. Cách diễn giải các chỉ số đánh giá hỏi đáp có truy xuất**

| Chỉ số | Nội dung đo | Ý nghĩa khi điểm cao | Rủi ro khi điểm thấp |
|---|---|---|---|
| Bám sát tài liệu | Mức độ các phát biểu trong câu trả lời được ngữ cảnh hỗ trợ | Câu trả lời ít suy diễn ngoài nguồn | Câu trả lời có thể thêm thông tin không có căn cứ |
| Liên quan câu hỏi | Mức độ câu trả lời đi thẳng vào yêu cầu của người dùng | Câu trả lời đúng trọng tâm, ít lan man | Câu trả lời có thể đúng nguồn nhưng không trả lời câu hỏi |
| Chính xác ngữ cảnh | Mức độ các đoạn truy xuất thật sự hữu ích | Hệ thống chọn được đoạn phù hợp | Kết quả truy xuất có nhiều nhiễu |
| Bao phủ ngữ cảnh | Mức độ ngữ cảnh chứa đủ bằng chứng cần thiết | Hệ thống không bỏ sót thông tin quan trọng | Câu trả lời khó đầy đủ, nhất là câu phân tích |

## 2.22. Các hệ thống dùng để so sánh

Hệ thống đối sánh chính là một quy trình truy xuất tĩnh được điều chỉnh để sử dụng cùng kho tài liệu và cùng mô hình tạo câu trả lời. Hệ thống này tìm các đoạn gần nghĩa nhất và đưa trực tiếp vào mô hình, không có các bước điều chỉnh theo thời gian, nguyên nhân, thực thể và kiểm tra nhiều tầng. Vì có thể chạy bằng chương trình và quan sát ngữ cảnh, đây là đối tượng so sánh khoa học trực tiếp.

Ba trợ lý phổ biến khác được đưa vào để cung cấp góc nhìn thực tế. Chúng có khả năng tạo câu trả lời tốt và được nhiều người dùng sử dụng, nhưng không công khai đầy đủ cách tìm và xếp hạng tài liệu. Vì vậy, kết quả so sánh với chúng chủ yếu phản ánh chất lượng đầu ra, không thể dùng để kết luận chi tiết về thuật toán truy xuất bên trong.

## 2.23. Nhận xét chương

Cơ sở lý thuyết cho thấy xây dựng chatbot lịch sử là một bài toán kết hợp nhiều thành phần. Mô hình ngôn ngữ tạo ra khả năng giao tiếp tự nhiên, nhưng kho tri thức và quy trình truy xuất quyết định mức độ có căn cứ. Yếu tố thời gian, nguyên nhân và thực thể giúp điều chỉnh tìm kiếm theo đặc trưng lịch sử. Bộ nhớ câu hỏi giúp giảm xử lý lặp, trong khi cơ chế kiểm duyệt và kho cá nhân giúp hệ thống mở rộng theo hai hướng khác nhau mà không làm mất kiểm soát.

Những nội dung này là nền tảng cho kiến trúc được trình bày ở Chương 3. Chương tiếp theo sẽ mô tả cách các yêu cầu lý thuyết được chuyển thành một sản phẩm hoàn chỉnh, từ giao diện người dùng đến xử lý câu hỏi, lưu trữ, thanh toán, luyện tập, hỗ trợ và quản trị.

# CHƯƠNG 3. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

## 3.1. Định hướng thiết kế

Ngay từ đầu, hệ thống được định hướng như một nền tảng có thể phục vụ người dùng thật chứ không chỉ là một mô hình thử nghiệm chạy trong môi trường lập trình. Điều này ảnh hưởng trực tiếp đến cách nhóm thiết kế. Nếu chỉ cần chứng minh khả năng hỏi đáp, sản phẩm có thể gồm một ô nhập câu hỏi và một vùng hiển thị câu trả lời. Tuy nhiên, khi đặt trong bối cảnh sử dụng thực tế, hệ thống phải giải quyết thêm nhiều vấn đề như nhận diện người dùng, lưu lịch sử, kiểm soát lượt sử dụng, bảo vệ dữ liệu cá nhân, hỗ trợ khi gặp lỗi và quản lý nội dung.

Nhóm lựa chọn cách tổ chức nhiều lớp. Lớp giao diện chịu trách nhiệm trình bày và nhận thao tác. Lớp xử lý nghiệp vụ chịu trách nhiệm xác thực, quản lý tài khoản, hội thoại, giao dịch và điều phối các yêu cầu. Lớp trí tuệ nhân tạo chịu trách nhiệm phân tích câu hỏi, tìm kiếm tri thức, kiểm tra tài liệu và tạo câu trả lời. Lớp lưu trữ được chia thành dữ liệu vận hành và dữ liệu phục vụ tìm kiếm nội dung.

Cách chia này giúp mỗi thành phần có nhiệm vụ tương đối rõ. Khi thay đổi giao diện, nhóm không cần viết lại quy trình tìm kiếm. Khi thay đổi mô hình trí tuệ nhân tạo, dữ liệu tài khoản và giao dịch vẫn được giữ nguyên. Khi bổ sung một kho tài liệu mới, phần đăng nhập và thanh toán không bị ảnh hưởng.

Một nguyên tắc khác là mọi yêu cầu quan trọng đều đi qua máy chủ. Giao diện không trực tiếp truy cập kho tri thức hoặc cơ sở dữ liệu. Điều này giúp kiểm tra người dùng, quyền truy cập và số dư trước khi thực hiện. Nó cũng giúp thống nhất cách ghi nhận lịch sử và phản hồi.

![Hình 3.1. Kiến trúc tổng thể của hệ thống](figures/hinh_3_1_kien_truc_tong_the.svg)

Hình 3.1 thể hiện người dùng tương tác với giao diện web hoặc ứng dụng di động. Yêu cầu được gửi đến máy chủ. Tại đây, hệ thống kiểm tra tài khoản và điều phối giữa dữ liệu vận hành, kho tri thức và mô hình trí tuệ nhân tạo. Sau khi có kết quả, máy chủ lưu lại những thông tin cần thiết rồi trả về giao diện.

## 3.2. Nhóm người sử dụng

Hệ thống có ba nhóm người sử dụng chính. Nhóm thứ nhất là khách chưa đăng nhập. Họ có thể xem trang giới thiệu, đọc thông tin về sản phẩm, chuyển ngôn ngữ, tải ứng dụng và thực hiện đăng ký hoặc đăng nhập. Việc cho phép khách tiếp cận nội dung giới thiệu giúp người dùng hiểu mục đích hệ thống trước khi cung cấp thông tin tài khoản.

Nhóm thứ hai là người dùng đã đăng nhập. Đây là nhóm sử dụng phần lớn chức năng. Họ có thể tạo cuộc hội thoại, đặt câu hỏi, xem nguồn, lưu nội dung cá nhân, luyện tập, nạp token, xem lịch sử thanh toán, cập nhật hồ sơ và liên hệ hỗ trợ.

Nhóm thứ ba là người quản trị. Ngoài các quyền của người dùng thông thường, người quản trị được phép xem dữ liệu tổng hợp, quản lý tài khoản, xử lý giao dịch, điều chỉnh cấu hình và duyệt tri thức. Quyền quản trị được kiểm tra ở máy chủ chứ không chỉ dựa vào việc giao diện có hiển thị nút hay không.

**Bảng 3.1. Nhóm người sử dụng và nhu cầu**

| Nhóm | Nhu cầu chính |
|---|---|
| Khách | Tìm hiểu sản phẩm, đăng ký, đăng nhập, tải ứng dụng |
| Người dùng | Hỏi đáp, xem nguồn, quản lý lịch sử, học tập, cá nhân hóa và nhận hỗ trợ |
| Quản trị viên | Theo dõi hoạt động, quản lý nội dung, người dùng, giao dịch và cấu hình |

**Bảng 3.2. Nhóm chức năng của người dùng**

| Nhóm chức năng | Nội dung triển khai | Kết quả thể hiện trong sản phẩm |
|---|---|---|
| Tài khoản | Đăng ký, đăng nhập, đăng nhập Google, quản lý hồ sơ và đổi mật khẩu | Người dùng có phiên làm việc riêng, dữ liệu được gắn với tài khoản |
| Hỏi đáp lịch sử | Đặt câu hỏi, nhận câu trả lời theo luồng, xem nguồn, đánh giá câu trả lời | Giao diện chat hiển thị trả lời, nguồn trích dẫn và thao tác phản hồi |
| Lịch sử hội thoại | Tạo nhiều cuộc trò chuyện, ghim, đổi tên, xóa, xem lại nội dung cũ | Người dùng tổ chức câu hỏi theo chủ đề và tiếp tục mạch học tập |
| Cá nhân hóa tri thức | Lưu đoạn trả lời, chỉnh sửa ghi chú, dùng lại trong lần hỏi sau | Kho tri thức riêng không trộn với dữ liệu của tài khoản khác |
| Học tập | Điểm danh, trả lời câu hỏi hằng ngày, xem giải thích và bảng xếp hạng | Người dùng có động lực quay lại và ôn tập theo ngày |
| Thanh toán | Chọn gói token, tạo hóa đơn, quét mã chuyển khoản, xem lịch sử | Quá trình nạp token có trạng thái và nội dung chuyển khoản rõ ràng |
| Hỗ trợ | Mở phòng hỗ trợ, trao đổi với trợ lý hoặc quản trị viên | Vấn đề sử dụng sản phẩm được xử lý trong cùng một hệ thống |

**Bảng 3.3. Nhóm chức năng của người quản trị**

| Nhóm chức năng | Nội dung quản lý | Mục đích nghiệm thu |
|---|---|---|
| Tổng quan hệ thống | Số người dùng, giao dịch, hoạt động chat, biểu đồ doanh thu và lưu lượng | Chứng minh hệ thống có theo dõi vận hành, không chỉ có giao diện hỏi đáp |
| Người dùng | Danh sách tài khoản, chi tiết người dùng, số dư, quyền quản trị | Kiểm soát truy cập và hỗ trợ xử lý tình huống tài khoản |
| Gói và thanh toán | Gói token, hóa đơn, trạng thái chuyển khoản, báo cáo sự cố | Chứng minh luồng token có quản lý và có cơ chế khiếu nại |
| Lịch sử hỏi đáp | Câu hỏi, câu trả lời, nguồn, chi phí, cảm xúc và phản hồi | Phục vụ kiểm tra chất lượng và truy vết lỗi |
| Tri thức | Nội dung chờ duyệt, nội dung đã phê duyệt, phản hồi tiêu cực | Duy trì vai trò kiểm soát của con người trong quá trình học |
| Hỗ trợ | Phòng hỗ trợ, tin nhắn người dùng, phản hồi của quản trị viên | Đảm bảo sản phẩm có kênh chăm sóc người dùng |
| Cấu hình nội dung | Trang chủ, SEO, hình ảnh, triều đại, chân trang và thông báo | Cho phép điều chỉnh sản phẩm mà không cần sửa mã nguồn |

## 3.3. Trang giới thiệu và cấu hình nội dung công khai

Trang giới thiệu là điểm tiếp xúc đầu tiên. Nội dung gồm phần giới thiệu chính, mô tả quy trình hoạt động, nhóm tính năng, các thời kỳ lịch sử, số liệu nổi bật, lời kêu gọi sử dụng và thông tin liên hệ. Thay vì ghi cố định toàn bộ nội dung trong giao diện, nhiều thành phần có thể được người quản trị điều chỉnh.

Thiết kế này giúp sản phẩm linh hoạt khi đổi tên, logo, hình nền, mô tả, đường dẫn mạng xã hội hoặc thông tin liên hệ. Người quản trị không phải sửa chương trình cho những thay đổi nội dung thông thường. Các thông số tìm kiếm như tiêu đề trang, mô tả và hình ảnh chia sẻ cũng có thể được đồng bộ.

Trang giới thiệu còn có vai trò định hướng kỳ vọng. Người dùng cần biết hệ thống chuyên về Lịch sử Việt Nam, câu trả lời có thể dùng để tham khảo và nên kiểm tra nguồn khi sử dụng cho mục đích học thuật. Việc trình bày rõ phạm vi từ đầu giúp giảm những câu hỏi hoàn toàn ngoài chủ đề.

## 3.4. Đăng ký tài khoản

Quá trình đăng ký yêu cầu người dùng cung cấp thông tin cơ bản như tên đăng nhập, thư điện tử và mật khẩu. Trước khi tạo tài khoản, máy chủ kiểm tra dữ liệu có bị trùng hoặc thiếu hay không. Mật khẩu không được lưu trực tiếp mà được chuyển thành một dạng bảo vệ một chiều. Khi người dùng đăng nhập, hệ thống so sánh mật khẩu nhập vào với giá trị đã bảo vệ.

Sau khi đăng ký thành công, người dùng có một số dư ban đầu theo cấu hình và có thể sử dụng các chức năng được cấp. Thời điểm tạo tài khoản được lưu để phục vụ thống kê. Thông tin nhạy cảm không được trả lại giao diện khi kiểm tra trạng thái đăng nhập.

Thiết kế đăng ký đơn giản phù hợp với đối tượng học sinh, sinh viên và người dùng phổ thông. Tuy nhiên, để triển khai rộng, hệ thống cần bổ sung xác thực thư điện tử, chính sách độ mạnh mật khẩu và cơ chế khôi phục mật khẩu.

## 3.5. Đăng nhập bằng tài khoản và Google

Người dùng có thể đăng nhập bằng tên tài khoản và mật khẩu. Khi thông tin hợp lệ, máy chủ tạo một chuỗi xác thực có thời hạn. Chuỗi này được gửi kèm trong các yêu cầu sau để máy chủ biết người đang thao tác.

Ngoài cách đăng nhập thông thường, hệ thống hỗ trợ Google. Người dùng được chuyển đến trang xác thực của Google, chọn tài khoản và đồng ý chia sẻ các thông tin cơ bản. Sau khi nhận kết quả, hệ thống tìm tài khoản theo thư điện tử. Nếu chưa có, một tài khoản mới được tạo; nếu đã có, thông tin như họ tên hoặc ảnh đại diện có thể được cập nhật.

Luồng đăng nhập Google trên điện thoại có khó khăn riêng vì ứng dụng và trình duyệt là hai môi trường khác nhau. Sản phẩm sử dụng một phiên đăng nhập để ứng dụng có thể nhận biết khi quá trình xác thực hoàn thành. Sau đó, trạng thái đăng nhập được đưa trở lại giao diện và lưu cục bộ trên thiết bị.

Mỗi lần đăng nhập, hệ thống ghi nhận thời gian, địa chỉ mạng và thông tin trình duyệt. Dữ liệu này phục vụ theo dõi hoạt động và giúp quản trị viên phát hiện những trường hợp bất thường.

## 3.6. Duy trì trạng thái và phân quyền

Chuỗi xác thực có thời hạn 24 giờ. Khi nhận yêu cầu, máy chủ giải mã chuỗi và đọc lại dữ liệu mới nhất của người dùng. Cách làm này có ý nghĩa vì số dư hoặc quyền có thể thay đổi sau khi chuỗi được tạo. Nếu chỉ tin vào dữ liệu cũ bên trong chuỗi, một người đã bị thu hồi quyền vẫn có thể tiếp tục thao tác.

Quyền quản trị được kiểm tra riêng. Người dùng thông thường không thể truy cập chức năng quản trị dù họ tự thay đổi địa chỉ trên trình duyệt. Khi một yêu cầu không có thông tin xác thực, hết hạn hoặc không đúng quyền, máy chủ từ chối trước khi thực hiện nghiệp vụ.

Ở giao diện, các khu vực chỉ dành cho quản trị viên được ẩn với người dùng thường. Đây là biện pháp hỗ trợ trải nghiệm, nhưng lớp bảo vệ chính vẫn nằm ở máy chủ.

## 3.7. Hồ sơ cá nhân

Sau khi đăng nhập, người dùng có thể cập nhật họ tên, ảnh đại diện, ảnh bìa và mật khẩu. Ảnh đại diện được giới hạn dung lượng và loại tệp để tránh việc tải lên nội dung quá lớn hoặc không phù hợp.

Màn hình hồ sơ còn hiển thị số dư token, lịch sử biến động token và lịch sử thanh toán. Người dùng có thể kiểm tra khi nào token được cộng, trừ và lý do của từng giao dịch. Điều này giúp tăng tính minh bạch, đặc biệt khi hệ thống tính phí theo mức sử dụng.

Việc thay đổi mật khẩu yêu cầu xác nhận thông tin phù hợp. Sau khi cập nhật, mật khẩu mới tiếp tục được bảo vệ theo cùng cơ chế với lúc đăng ký.

## 3.8. Tổ chức cuộc hội thoại

Mỗi người dùng có thể tạo nhiều cuộc hội thoại. Việc tách hội thoại giúp người dùng tổ chức câu hỏi theo chủ đề, chẳng hạn một cuộc về nhà Trần, một cuộc về phong trào Tây Sơn và một cuộc dùng để ôn tập.

Khi tạo cuộc hội thoại mới, hệ thống tạo một bản ghi thuộc về người dùng. Tiêu đề có thể được sinh nhanh từ câu hỏi đầu tiên và được điều chỉnh sau. Người dùng có thể đổi tên để dễ tìm, ghim cuộc hội thoại quan trọng lên trên hoặc xóa khi không còn cần.

Quyền sở hữu được kiểm tra ở mọi thao tác. Một người không thể xem hoặc xóa cuộc hội thoại của tài khoản khác chỉ bằng cách thay đổi mã nhận diện. Khi xóa, các tin nhắn liên quan cũng được xử lý để tránh dữ liệu rời rạc.

Danh sách hội thoại được hiển thị ở thanh bên. Trên màn hình nhỏ, thanh bên có thể thu gọn để dành không gian cho nội dung. Người dùng có thể chuyển nhanh giữa các cuộc trò chuyện mà không mất trạng thái.

## 3.9. Lưu trữ tin nhắn

Mỗi cuộc hội thoại gồm tin nhắn của người dùng và câu trả lời của trợ lý. Ngoài nội dung, hệ thống lưu thời điểm, nguồn, dòng thời gian nếu có, đánh giá và số lượt thích. Cấu trúc này giúp giao diện có thể khôi phục gần như đầy đủ trạng thái khi người dùng mở lại.

Bên cạnh dữ liệu dùng để hiển thị hội thoại, hệ thống có một dạng nhật ký hỏi đáp phục vụ thống kê. Nhật ký ghi câu hỏi, câu trả lời, lượng token, cảm xúc ước tính và thời kỳ lịch sử. Hai dạng dữ liệu có mục đích khác nhau: một bên phục vụ trải nghiệm cá nhân, một bên phục vụ quan sát và báo cáo.

Việc lưu nguồn cùng tin nhắn rất quan trọng. Nếu chỉ lưu câu trả lời mà không lưu tài liệu đã dùng, khi xem lại người dùng không thể kiểm tra căn cứ. Nguồn được chuyển thành dữ liệu có cấu trúc để giao diện hiển thị tên tài liệu, trang, nội dung trích và loại nguồn.

## 3.10. Tiếp nhận câu hỏi

Khi người dùng nhấn gửi, giao diện kiểm tra nội dung không rỗng và trạng thái hệ thống. Câu hỏi được thêm tạm thời vào màn hình để tạo cảm giác phản hồi ngay. Sau đó, yêu cầu được gửi đến máy chủ cùng cuộc hội thoại, ngôn ngữ và các thông tin cần thiết.

Máy chủ kiểm tra tài khoản và số dư. Nếu người dùng không còn đủ token, hệ thống thông báo thay vì bắt đầu một quá trình xử lý tốn tài nguyên. Nếu hợp lệ, câu hỏi được lưu và chuyển vào quy trình trí tuệ nhân tạo.

Để hiểu câu nối tiếp, hệ thống lấy một số tin nhắn gần nhất. Số lượng được giới hạn để tránh đưa toàn bộ lịch sử dài vào mỗi lần xử lý. Sáu tin nhắn gần nhất thường đủ để xác định chủ thể đang được đề cập mà vẫn giữ chi phí ở mức hợp lý.

## 3.11. Chuẩn hóa câu hỏi và ngữ cảnh

Câu hỏi được loại bỏ khoảng trắng thừa và chuẩn hóa một số dạng ký tự. Hệ thống xác định ngôn ngữ và chuyển sang tiếng Việt nếu người dùng hỏi bằng tiếng Anh. Quá trình dịch có tham chiếu đến lịch sử để giảm khả năng dịch sai đại từ hoặc chủ thể.

Tiếp theo, hệ thống kiểm tra câu hỏi có phải là lời nối tiếp hay không. Các từ như “ông ấy”, “triều đại đó”, “sự kiện này” hoặc “sau đó” là tín hiệu. Hệ thống tìm thực thể gần nhất trong hội thoại và viết lại câu hỏi thành dạng đầy đủ hơn.

Ví dụ, sau câu hỏi về Nguyễn Huệ, câu “ông ấy lên ngôi khi nào?” được hiểu thành câu hỏi về thời điểm Nguyễn Huệ lên ngôi. Việc viết lại không được hiển thị thay cho câu gốc của người dùng, mà chỉ phục vụ tìm kiếm.

## 3.12. Kiểm tra câu trả lời đã có

Trước khi truy xuất toàn bộ kho tài liệu, hệ thống kiểm tra xem đã từng xử lý một câu hỏi gần giống hay chưa. Mỗi câu hỏi cũ được lưu ở dạng biểu diễn ngữ nghĩa. Nếu câu mới đủ gần và thuộc đúng phạm vi dữ liệu, hệ thống có thể sử dụng lại câu trả lời.

Cơ chế này đặc biệt hữu ích với các câu phổ biến như “Ai là người lãnh đạo khởi nghĩa Lam Sơn?” hoặc “Nhà Lý thành lập năm nào?”. Việc dùng lại giúp giảm thời gian và chi phí, đồng thời giữ sự nhất quán giữa các lần trả lời.

Tuy nhiên, hệ thống không dùng lại một cách tuyệt đối. Các mục lưu có thời hạn và gắn với phiên bản kho tri thức. Khi người quản trị bổ sung hoặc sửa dữ liệu, phiên bản thay đổi khiến câu trả lời cũ không còn được ưu tiên. Dữ liệu riêng cũng được tách theo người dùng.

## 3.13. Phân loại câu hỏi

Nếu không có câu trả lời phù hợp trong bộ nhớ, hệ thống xác định loại câu hỏi. Một tập từ và mẫu câu được dùng trước vì có tốc độ nhanh. “Tại sao”, “vì sao”, “nguyên nhân” thường thuộc nhóm nguyên nhân; “khi nào”, “năm nào”, “thế kỷ nào” thuộc nhóm thời gian; “so sánh”, “khác nhau”, “giống nhau” thuộc nhóm so sánh.

Những câu không rơi vào các nhóm trên được xem là câu hỏi dữ kiện, trừ khi có dấu hiệu ngoài phạm vi hoặc lời chào. Với trường hợp khó, hệ thống có thể nhờ mô hình ngôn ngữ phân biệt giữa trò chuyện xã giao, câu hỏi không liên quan và câu hỏi lịch sử.

Phân loại không chỉ quyết định trọng số tìm kiếm mà còn quyết định cách trả lời. Câu hỏi ngoài phạm vi được từ chối lịch sự. Lời chào được đáp ngắn. Câu hỏi lịch sử mới đi vào kho tri thức.

## 3.14. Nhận diện thực thể và thời gian

Hệ thống phân tích tên nhân vật, triều đại, sự kiện và các cách gọi thay thế. Một bộ từ điển lịch sử được xây dựng từ các trường hợp phổ biến. Mục tiêu không phải nhận diện mọi thực thể trong toàn bộ tiếng Việt, mà tập trung vào những đối tượng thường xuất hiện trong dữ liệu của đề tài.

Mốc năm được tách từ câu hỏi. Hệ thống cũng xem xét từ chỉ triều đại, thế kỷ và giai đoạn. Những thông tin này được giữ để chấm điểm tài liệu ở bước sau.

Nhận diện thực thể còn giúp lọc nguồn. Nếu câu hỏi tập trung vào Lê Lợi nhưng một tài liệu chủ yếu nói về Lê Hoàn, sự trùng họ không đủ để xem là liên quan. Tên đầy đủ, bí danh và nội dung xung quanh được dùng để giảm nhầm lẫn.

## 3.15. Truy xuất từ nhiều kho tri thức

Hệ thống không chỉ tìm trong một nguồn. Trước hết, nếu người dùng có ghi chú riêng, kho cá nhân được tìm kiếm. Tiếp theo là kho nội dung lịch sử thu thập và quản lý chung. Sau đó là kho tài liệu chính được xây dựng từ các tài liệu đã xử lý. Những tri thức mới đã được duyệt cũng tham gia.

Việc tìm nhiều kho giúp hệ thống linh hoạt. Kho chính cung cấp nền tảng ổn định. Kho mới được duyệt giúp mở rộng. Kho cá nhân cung cấp ngữ cảnh riêng. Tuy nhiên, kết quả từ các kho phải được gắn nhãn để hệ thống và người dùng biết nguồn gốc.

Trong quá trình hợp nhất, các đoạn trùng lặp được loại. Mỗi đoạn giữ thông tin về loại nguồn, tên tài liệu, trang, mức ưu tiên và các dấu hiệu khác. Những thông tin này được dùng cho việc sắp xếp và hiển thị.

## 3.16. Sắp xếp lại kết quả

Kết quả tìm kiếm ban đầu được chấm lại. Mức độ gần nghĩa được ước tính từ thứ hạng tìm kiếm. Điểm thời gian được tính từ sự phù hợp của mốc năm và giai đoạn. Điểm nguyên nhân dựa trên dấu hiệu trong câu hỏi và tài liệu.

Ba điểm được kết hợp theo tỷ lệ đã trình bày ở Chương 2. Sau đó, thực thể được dùng để tăng hoặc giảm điểm. Tài liệu đúng nhân vật được ưu tiên; tài liệu lạc sang nhân vật khác bị đẩy xuống.

Với câu hỏi so sánh, hệ thống giữ nhiều đoạn hơn. Điều này cần thiết vì một câu trả lời so sánh thường phải lấy bằng chứng từ hai hoặc nhiều nguồn. Với lời chào hoặc câu ngoài phạm vi, số tài liệu bằng không để tránh xử lý thừa.

## 3.17. Ưu tiên nguồn cá nhân và nguồn dùng chung

Nội dung cá nhân được ưu tiên cao vì phản ánh ghi chú người dùng chủ động lưu. Tuy nhiên, ưu tiên ở đây là ưu tiên phục vụ nhu cầu cá nhân, không phải khẳng định nội dung đó có giá trị lịch sử cao hơn tài liệu chung.

Sau nội dung cá nhân là các nội dung lịch sử toàn cục đã được thu thập, rồi đến tài liệu chính và tri thức mới đã duyệt. Thứ tự thực tế còn phụ thuộc điểm phù hợp. Một ghi chú cá nhân không liên quan sẽ không được dùng chỉ vì thuộc người dùng.

Ở câu trả lời, hệ thống có thể thêm lời nhắc khi sử dụng ghi chú cá nhân. Điều này giúp người học phân biệt giữa kiến thức được lấy từ tài liệu chung và nội dung do chính mình bổ sung.

## 3.18. Kiểm tra ngữ cảnh

Những đoạn đứng đầu được đưa qua bước kiểm tra. Trong chế độ nhanh, hệ thống so sánh từ quan trọng, thực thể và chủ đề. Những đoạn chỉ nhắc thoáng qua hoặc sai đối tượng bị loại.

Trong chế độ kiểm tra sâu, mô hình ngôn ngữ được hỏi liệu đoạn tài liệu có giúp trả lời câu hỏi hay không. Kết quả được dùng như quyết định giữ hoặc loại. Cách này có thể hiểu nội dung tốt hơn nhưng làm tăng thời gian.

Hệ thống có thể thay đổi chế độ qua cấu hình. Khi triển khai ưu tiên tốc độ, cách kiểm tra nhanh được dùng nhiều hơn. Khi nghiên cứu chất lượng, kiểm tra bằng mô hình có thể được bật.

## 3.19. Sinh câu trả lời

Nếu còn đủ ngữ cảnh, hệ thống đưa câu hỏi, nội dung hội thoại và tài liệu cho mô hình ngôn ngữ. Chỉ dẫn yêu cầu mô hình trả lời trong phạm vi Lịch sử Việt Nam, dùng thông tin có trong ngữ cảnh và không tạo nguồn không tồn tại.

Đối với câu hỏi dữ kiện, câu trả lời bắt đầu bằng đáp án trực tiếp rồi giải thích. Đối với câu hỏi nguyên nhân, hệ thống khuyến khích phân biệt nguyên nhân sâu xa, trực tiếp và điều kiện. Đối với câu hỏi so sánh, nội dung được tổ chức theo tiêu chí. Đối với giả định, câu trả lời phải đánh dấu rõ phần suy luận.

Nếu người dùng đưa ra thông tin sai, câu trả lời không đồng ý theo tiền đề mà sửa lại trước. Ví dụ, nếu người dùng gán một sự kiện cho sai triều đại, hệ thống giải thích điểm sai và cung cấp thông tin đúng.

## 3.20. Hiển thị câu trả lời theo thời gian thực

Một câu trả lời dài có thể mất nhiều giây để tạo. Nếu giao diện chờ đến khi hoàn tất mới hiển thị, người dùng dễ nghĩ hệ thống bị đứng. Vì vậy, nội dung được gửi từng phần.

Giao diện nhận liên tục các đoạn nhỏ và đưa vào hàng đợi. Việc hiển thị được điều tiết để chữ xuất hiện tự nhiên thay vì dồn thành nhiều khối không đều. Khi máy chủ gửi tín hiệu kết thúc, giao diện cập nhật nguồn, câu hỏi liên quan, lượng token và trạng thái cuối.

Trong trường hợp câu trả lời lấy từ bộ nhớ, nội dung đã có sẵn vẫn được chia thành các phần nhỏ để trải nghiệm nhất quán. Nếu phải tìm kiếm web lâu, hệ thống có thể tạo một công việc nền. Giao diện kiểm tra trạng thái định kỳ và cập nhật khi kết quả sẵn sàng.

![Hình 3.2. Quy trình tiếp nhận và xử lý một câu hỏi](figures/hinh_3_2_pipeline_hoi_dap_rag.svg)

**Bảng 3.4. Đặc tả quy trình hỏi đáp TALRAG**

| Bước | Nội dung xử lý | Dữ liệu vào | Dữ liệu ra |
|---:|---|---|---|
| 1 | Tiếp nhận câu hỏi từ giao diện | Câu hỏi, mã hội thoại, ngôn ngữ, thông tin tài khoản | Yêu cầu hợp lệ để xử lý |
| 2 | Kiểm tra phiên đăng nhập và quyền truy cập | Chuỗi xác thực, tài khoản hiện tại | Người dùng hợp lệ hoặc thông báo từ chối |
| 3 | Chuẩn hóa câu hỏi | Văn bản gốc của người dùng | Câu hỏi đã làm sạch, giảm lỗi nhập liệu |
| 4 | Xem xét ngữ cảnh hội thoại | Câu hỏi hiện tại và các lượt trao đổi gần nhất | Câu hỏi được làm rõ khi có đại từ hoặc câu nối tiếp |
| 5 | Nhận diện ngôn ngữ | Câu hỏi đã chuẩn hóa | Quyết định xử lý tiếng Việt trực tiếp hoặc dịch qua lại |
| 6 | Kiểm tra câu trả lời gần giống đã lưu | Câu hỏi, phiên bản kho tri thức, tài khoản | Câu trả lời dùng lại hoặc chuyển sang truy xuất mới |
| 7 | Phân loại mục đích câu hỏi | Câu hỏi đã làm rõ | Nhãn dữ kiện, thời gian, nguyên nhân, so sánh, ngoài phạm vi hoặc trò chuyện |
| 8 | Nhận diện thực thể và mốc thời gian | Câu hỏi và từ điển thực thể lịch sử | Nhân vật, triều đại, sự kiện, địa danh hoặc năm liên quan |
| 9 | Truy xuất nhiều kho tri thức | Câu hỏi, nhãn loại câu hỏi, thông tin tài khoản | Danh sách đoạn ứng viên từ kho chung, kho đã duyệt và kho cá nhân |
| 10 | Xếp hạng lại theo TALRAG | Đoạn ứng viên và các điểm thành phần | Danh sách tài liệu đã sắp xếp theo điểm cuối |
| 11 | Kiểm tra độ phù hợp tài liệu | Tài liệu đã xếp hạng và câu hỏi | Ngữ cảnh đủ điều kiện hoặc nhánh thiếu dữ liệu |
| 12 | Tạo câu trả lời | Câu hỏi, ngữ cảnh, chỉ dẫn trả lời | Câu trả lời theo luồng hiển thị cho người dùng |
| 13 | Làm sạch nguồn và câu hỏi gợi ý | Câu trả lời, danh sách nguồn, thực thể chính | Nguồn hiển thị đúng thứ tự, câu hỏi liên quan |
| 14 | Ghi nhận chi phí và lịch sử | Câu hỏi, câu trả lời, số token, nguồn | Tin nhắn, nhật ký chat, token bị trừ và số dư mới |

Quy trình trên cho thấy TALRAG không phải một lệnh gọi duy nhất đến mô hình trí tuệ nhân tạo. Giá trị của hệ thống nằm ở việc chia nhỏ quá trình hỏi đáp thành các bước có thể kiểm soát, có thể ghi nhận và có thể cải tiến riêng. Khi kết quả chưa tốt, nhóm có thể xác định lỗi thuộc khâu phân loại, truy xuất, xếp hạng, kiểm tra tài liệu hay tạo câu trả lời.

## 3.21. Kiểm soát nguồn và câu hỏi liên quan

Sau khi có câu trả lời, hệ thống đối chiếu ký hiệu trích dẫn với danh sách tài liệu. Nếu mô hình đánh số không đúng, thứ tự được điều chỉnh. Những nguồn không phù hợp với thực thể có thể bị loại trước khi gửi.

Người dùng có thể mở cửa sổ nguồn để xem tên tài liệu, trang và phần nội dung liên quan. Với nguồn trực tuyến, địa chỉ trang và miền được hiển thị. Với ghi chú cá nhân, nhãn nguồn cá nhân được dùng.

Hệ thống còn tạo các câu hỏi gợi ý dựa trên câu vừa hỏi và câu trả lời. Những gợi ý này giúp người dùng tiếp tục khám phá chủ đề. Việc tạo gợi ý được thực hiện sau phần trả lời chính để không làm chậm thời điểm xuất hiện nội dung đầu tiên.

## 3.22. Ghi nhận chi phí sử dụng

Sau khi hoàn tất, hệ thống tính lượng token đã sử dụng theo quy tắc cấu hình. Số dư của người dùng được trừ và lịch sử biến động được ghi lại. Nếu câu trả lời lấy từ bộ nhớ, chi phí có thể thấp hơn vì không phải thực hiện đầy đủ quá trình sinh.

Người dùng có thể xem từng lần cộng hoặc trừ token. Người quản trị cũng có thể kiểm tra tổng mức sử dụng và điều chỉnh khi cần. Việc ghi lịch sử giúp giải quyết khiếu nại và theo dõi bất thường.

Số dư token sau mỗi giao dịch được mô tả theo Công thức 3.1.

T_sau = T_truoc + T_cong - T_tru     (3.1)

Trong đó, T_truoc là số dư trước giao dịch; T_cong là số token được cộng từ nạp tiền, thưởng điểm danh, thưởng bảng xếp hạng hoặc điều chỉnh của quản trị viên; T_tru là số token bị trừ sau khi sử dụng chức năng hỏi đáp. Mỗi lần thay đổi đều được ghi vào lịch sử để người dùng và quản trị viên có thể đối chiếu.

Đối với một lượt hỏi đáp, số token bị trừ không lấy cố định theo một câu hỏi mà phụ thuộc vào độ dài đầu vào, độ dài câu trả lời và tỷ lệ quy đổi đang được cấu hình. Công thức 3.2 mô tả cách tính chi phí này.

C_chat = ((N_vao + N_ra) / 1000) · r     (3.2)

Trong đó, N_vao là số token của câu hỏi, N_ra là số token của câu trả lời, r là đơn giá token trên 1.000 token theo cấu hình hệ thống. Nhờ cách tính này, câu hỏi ngắn và câu trả lời ngắn có chi phí thấp hơn, còn những câu trả lời dài có nhiều bước xử lý sẽ phản ánh đúng hơn lượng tài nguyên đã sử dụng.

## 3.23. Xử lý khi không đủ dữ liệu

Nếu sau bước kiểm tra không còn tài liệu phù hợp, hệ thống xác định câu hỏi có thuộc phạm vi Lịch sử Việt Nam hay không. Nếu không, người dùng nhận thông báo giới hạn chủ đề. Nếu có, quy trình tìm kiếm bổ sung được kích hoạt.

Việc tách hai trường hợp là cần thiết. Hệ thống không nên tìm trên Internet cho câu hỏi về giá vàng hoặc lập trình chỉ vì kho lịch sử không có dữ liệu. Ngược lại, một câu hỏi lịch sử hợp lệ nhưng hiếm không nên bị từ chối ngay.

## 3.24. Tìm kiếm và thu thập nguồn bổ sung

Hệ thống tạo truy vấn từ câu hỏi, thực thể và từ khóa cốt lõi. Nhiều truy vấn có thể được tạo để tăng khả năng tìm nguồn. Kết quả được đánh giá theo miền và tiêu đề.

Các trang được tải song song trong giới hạn để giảm thời gian. Nội dung chính được tách khỏi menu, quảng cáo và phần không liên quan. Văn bản được chuẩn hóa, chia đoạn và so sánh với câu hỏi.

Nguồn có dấu hiệu không an toàn, nội dung quá ngắn, không có từ khóa lịch sử hoặc thuộc miền bị chặn bị loại. Hệ thống không mặc nhiên xem thứ hạng cao trên công cụ tìm kiếm là bằng chứng đáng tin.

## 3.25. Kiểm tra nội dung web và tạo câu trả lời tạm thời

Các đoạn web còn lại được đánh giá theo lô để giảm số lần gọi mô hình. Hệ thống xem chúng có nói đúng chủ đề, có đủ bằng chứng và có mâu thuẫn rõ ràng hay không. Nếu không đủ, người dùng nhận thông báo chưa có dữ liệu đáng tin cậy.

Nếu đạt điều kiện, mô hình tạo câu trả lời tạm thời và giữ danh sách nguồn. Câu trả lời này được đưa cho người dùng với ý nghĩa tham khảo. Đồng thời, nội dung được lưu vào vùng chờ duyệt.

![Hình 3.5. Quy trình tìm kiếm bổ sung và kiểm duyệt tri thức](figures/hinh_3_5_talrag_web_learning.png)

## 3.26. Kiểm duyệt và bổ sung tri thức

Người quản trị có thể xem danh sách nội dung chờ, gồm câu hỏi, câu trả lời, thời điểm và số phản hồi. Khi mở một mục, người quản trị kiểm tra nội dung và quyết định phê duyệt hoặc xóa.

Khi phê duyệt, nội dung được biên tập thành dạng tri thức, chia thành đoạn, chuyển thành biểu diễn số và bổ sung vào kho tìm kiếm. Bộ nhớ truy xuất được làm mới để câu hỏi sau có thể dùng ngay. Phiên bản kho tri thức thay đổi để những câu trả lời lưu trước đó được xem xét lại.

Nếu một câu trả lời trong hội thoại nhận phản hồi tiêu cực, người quản trị có thể chuyển nó thành nội dung cần xem xét. Cơ chế này giúp lỗi thực tế trở thành đầu vào cho quá trình cải tiến.

![Hình 3.6. Vòng đời của một nội dung tri thức mới](figures/hinh_3_6_talrag_trust_aware.jpg)

**Bảng 3.5. Đặc tả quy trình mở rộng và kiểm duyệt tri thức**

| Bước | Tác nhân | Nội dung xử lý | Trạng thái dữ liệu |
|---:|---|---|---|
| 1 | Hệ thống hỏi đáp | Phát hiện câu hỏi thuộc Lịch sử Việt Nam nhưng kho nội bộ chưa đủ bằng chứng | Thiếu dữ liệu |
| 2 | Bộ tạo truy vấn | Tạo truy vấn từ câu hỏi, thực thể, mốc thời gian và từ khóa cốt lõi | Truy vấn tìm kiếm |
| 3 | Bộ tìm nguồn | Ưu tiên nguồn chính thống, bảo tàng, cơ quan nhà nước, báo chí đáng tin cậy | Danh sách nguồn ứng viên |
| 4 | Bộ tải nội dung | Lấy nội dung trang, loại bỏ phần điều hướng, quảng cáo và đoạn quá ngắn | Văn bản thô đã làm sạch bước đầu |
| 5 | Bộ chia đoạn | Chia nội dung thành các đoạn ngắn phù hợp với việc kiểm tra và tạo câu trả lời | Các đoạn web ứng viên |
| 6 | Bộ kiểm tra liên quan | Loại đoạn không chứa thông tin lịch sử hoặc không trả lời câu hỏi | Các đoạn có khả năng dùng làm bằng chứng |
| 7 | Bộ tạo câu trả lời tạm thời | Sinh câu trả lời dựa trên nguồn web đã lọc, kèm danh sách nguồn | Câu trả lời tạm thời |
| 8 | Hệ thống lưu chờ | Lưu câu hỏi, câu trả lời và nguồn vào khu vực chờ duyệt | Tri thức đang chờ |
| 9 | Người dùng | Đánh giá tích cực hoặc tiêu cực với câu trả lời | Tín hiệu phản hồi |
| 10 | Quản trị viên | Đọc, sửa, phê duyệt hoặc xóa nội dung đang chờ | Tri thức được duyệt hoặc bị loại |
| 11 | Bộ cập nhật kho | Đưa nội dung đã duyệt vào kho tìm kiếm và tăng phiên bản kho tri thức | Tri thức hoạt động |
| 12 | Hệ thống hỏi đáp | Sử dụng nội dung đã duyệt cho các câu hỏi tương tự về sau | Câu trả lời có nguồn đã kiểm soát |

Quy trình này giúp tách rõ “tìm thấy trên web” và “được chấp nhận làm tri thức của hệ thống”. Trong bối cảnh lịch sử, ranh giới này rất quan trọng. Một nội dung có thể hữu ích để trả lời tạm thời nhưng vẫn cần con người xem lại trước khi trở thành dữ liệu dùng lâu dài.

## 3.27. Xây dựng kho tri thức ban đầu

Tài liệu đầu vào được đọc theo định dạng phù hợp. Nội dung sau khi đọc được loại bỏ ký tự thừa, sửa một số lỗi xuống dòng và giữ thông tin về nguồn. Văn bản được chia thành các đoạn có độ dài phù hợp với việc tìm kiếm và giới hạn của mô hình.

Mỗi đoạn được gắn thông tin như tên tài liệu, trang, tiêu đề và loại nguồn. Sau đó, đoạn được chuyển thành biểu diễn số. Toàn bộ biểu diễn và thông tin đi kèm được lưu trong kho tìm kiếm.

Hệ thống hỗ trợ nhiều cấu hình biểu diễn. Điều này giúp nhóm thử nghiệm các nhà cung cấp khác nhau, nhưng cũng tạo yêu cầu phải quản lý phiên bản dữ liệu. Nếu hai cấu hình được xây dựng ở thời điểm khác nhau, số đoạn có thể không bằng nhau.

![Hình 3.3. Quy trình xây dựng kho tri thức](figures/hinh_3_3_pipeline_nap_du_lieu.svg)

## 3.28. Kho ghi chú cá nhân

Trong câu trả lời, người dùng có thể bôi chọn một đoạn. Giao diện cung cấp lựa chọn lưu nguyên văn hoặc chỉnh sửa. Khi lưu, hệ thống ghi nhận câu hỏi gốc, câu trả lời, phần được chọn, phần đã sửa và thông tin liên quan.

Người dùng cũng có thể vào màn hình riêng để tạo ghi chú không xuất phát từ một câu trả lời. Mỗi ghi chú có nội dung và loại. Khi thêm, sửa hoặc xóa, kho tìm kiếm cá nhân được đồng bộ lại.

Ở lần hỏi sau, nội dung cá nhân có thể được sử dụng làm ngữ cảnh. Nếu câu trả lời có sử dụng, nguồn được đánh dấu. Người dùng có toàn quyền chỉnh sửa hoặc xóa dữ liệu này.

## 3.29. Điểm danh và câu hỏi hằng ngày

Để tăng tính học tập thường xuyên, hệ thống xây dựng một ngân hàng câu hỏi trắc nghiệm. Ngân hàng hiện có 59 câu tiếng Việt và phiên bản tiếng Anh tương ứng. Mỗi câu có các phương án, đáp án đúng, lời giải thích, thời kỳ và độ khó.

Mỗi ngày, một người dùng nhận năm câu. Việc chọn dựa trên ngày và tài khoản để giữ tính ổn định trong ngày nhưng khác nhau giữa người dùng. Hệ thống cố gắng tránh lặp những câu đã làm cho đến khi số câu chưa gặp còn ít.

Khi người dùng chọn đáp án, kết quả được lưu. Giao diện thông báo đúng hoặc sai và hiển thị giải thích. Câu hỏi đã trả lời không thể được dùng để nhận thưởng lặp lại.

## 3.30. Cơ chế phần thưởng học tập

Điểm danh từ thứ hai đến thứ bảy nhận 2 token; Chủ nhật nhận 5 token. Nếu duy trì chuỗi bảy ngày, người dùng được thưởng thêm 10 token. Cơ chế này khuyến khích quay lại thường xuyên.

Trong năm câu hỏi hằng ngày, đạt ba câu đúng được thưởng 1 token và đạt năm câu đúng được thưởng 2 token. Mỗi mốc chỉ được nhận một lần trong ngày. Giao diện sử dụng hiệu ứng khi đạt mốc để tạo phản hồi tích cực.

Bảng xếp hạng được tính theo tuần. Ba người đứng đầu của tuần trước nhận lần lượt 5, 3 và 1 token. Hệ thống lưu dấu phần thưởng để không cộng lại khi người dùng mở bảng nhiều lần.

**Bảng 3.6. Quy tắc token và phần thưởng học tập**

| Hoạt động | Điều kiện nhận | Số token | Cơ chế chống nhận lặp |
|---|---|---:|---|
| Tạo tài khoản mới | Đăng ký hoặc đăng nhập Google lần đầu | 10 | Gắn trực tiếp vào tài khoản khi tạo |
| Điểm danh ngày thường | Điểm danh từ thứ hai đến thứ bảy | 2 | Một bản ghi điểm danh cho mỗi ngày |
| Điểm danh Chủ nhật | Điểm danh vào Chủ nhật | 5 | Một bản ghi điểm danh cho mỗi ngày |
| Thưởng chuỗi | Số ngày điểm danh liên tục chia hết cho 7 | 10 | Khóa thưởng theo mốc chuỗi ngày |
| Trả lời đúng 3 câu | Trong 5 câu hằng ngày có ít nhất 3 câu đúng | 1 | Mỗi mốc chỉ nhận một lần trong ngày |
| Trả lời đúng 5 câu | Hoàn thành đúng cả 5 câu hằng ngày | 2 | Mỗi mốc chỉ nhận một lần trong ngày |
| Bảng xếp hạng tuần | Top 1, Top 2, Top 3 của tuần trước | 5, 3, 1 | Khóa thưởng theo tuần và hạng |

Thưởng điểm danh được mô tả bằng Công thức 3.3.

R_dd = R_ngay + R_chuoi     (3.3)

Trong đó, R_ngay bằng 2 nếu người dùng điểm danh từ thứ hai đến thứ bảy và bằng 5 nếu điểm danh vào Chủ nhật; R_chuoi bằng 10 khi số ngày điểm danh liên tục là bội số của 7, ngược lại bằng 0.

Thưởng trả lời câu hỏi hằng ngày được mô tả bằng Công thức 3.4.

R_qa = 1 · I(c >= 3) + 2 · I(c = 5)     (3.4)

Trong đó, c là số câu trả lời đúng trong bộ 5 câu của ngày hiện tại; I(điều kiện) bằng 1 nếu điều kiện đúng và bằng 0 nếu điều kiện sai. Công thức này cho thấy người dùng đúng cả 5 câu có thể nhận cả mốc 3 câu và mốc 5 câu, tổng cộng 3 token trong ngày từ hoạt động trả lời câu hỏi.

## 3.31. Thanh toán và nạp token

Người dùng có thể chọn một trong các gói token do người quản trị tạo. Mỗi gói có tên, số token và số tiền. Sau khi chọn, hệ thống tạo một giao dịch đang chờ và cung cấp mã thanh toán.

Mã QR được tạo với số tài khoản, số tiền và nội dung chuyển khoản. Nội dung chứa mã nhận diện để hệ thống đối chiếu. Người dùng có thể quét bằng ứng dụng ngân hàng.

Trong thời gian chờ, giao diện kiểm tra trạng thái. Máy chủ kết nối với dịch vụ đối soát để đọc các giao dịch gần đây. Một khoản thanh toán chỉ được chấp nhận khi nội dung nhận diện đúng, số tiền phù hợp và mã giao dịch chưa từng được xử lý.

Khi thành công, trạng thái chuyển thành hoàn tất, token được cộng và lịch sử được ghi. Nếu giao dịch đã được xử lý, hệ thống không cộng lần hai. Giao dịch đang chờ quá lâu được xem là hết hạn theo quy định thời gian.

**Bảng 3.7. Điều kiện công nhận một giao dịch thanh toán**

| Điều kiện | Ý nghĩa | Cách xử lý khi không đạt |
|---|---|---|
| Nội dung chuyển khoản chứa mã nhận diện hợp lệ | Hệ thống xác định được hóa đơn cần đối soát | Bỏ qua giao dịch vì không biết thuộc hóa đơn nào |
| Số tiền chuyển vào bằng số tiền của hóa đơn | Tránh cộng token khi người dùng chuyển thiếu hoặc sai gói | Không đổi trạng thái, chờ xử lý thủ công |
| Mã giao dịch ngân hàng chưa từng xử lý | Chống cộng token nhiều lần từ cùng một giao dịch | Bỏ qua giao dịch đã ghi nhận |
| Hóa đơn thuộc trạng thái đang chờ hoặc thất bại | Cho phép xử lý cả hóa đơn vừa hết hạn nhưng tiền vẫn về | Không xử lý hóa đơn đã hoàn tất |
| Người dùng xem đúng hóa đơn của mình | Bảo vệ dữ liệu thanh toán giữa các tài khoản | Từ chối truy cập nếu không đúng chủ sở hữu |
| Hóa đơn đang chờ quá 15 phút | Xác định giao dịch có nguy cơ hết hạn | Chuyển trạng thái sang thất bại nếu chưa khớp tiền |

Điều kiện công nhận thanh toán tự động được mô tả theo Công thức 3.5.

V_tt = I(M = 1) · I(A_chuyen = A_hoa_don) · I(S = 0) · I(H ∈ {dang_cho, that_bai})     (3.5)

Trong đó, V_tt là giá trị hợp lệ của giao dịch; M cho biết nội dung chuyển khoản có khớp mã hóa đơn hay không; A_chuyen là số tiền ngân hàng ghi nhận; A_hoa_don là số tiền cần thanh toán; S cho biết mã giao dịch đã từng được xử lý hay chưa; H là trạng thái hóa đơn. Chỉ khi V_tt bằng 1, hệ thống mới chuyển hóa đơn sang hoàn tất và cộng token cho người dùng.

![Hình 3.4. Quy trình quản lý token, thanh toán và quản trị](figures/hinh_3_4_token_quan_tri.svg)

## 3.32. Báo cáo sự cố thanh toán

Trong thực tế, người dùng có thể chuyển khoản nhưng chưa được cộng token, quét mã không thành công hoặc nhập sai nội dung. Màn hình thanh toán có chức năng gửi báo cáo.

Người dùng chọn loại vấn đề, mô tả và cung cấp thông tin liên hệ. Báo cáo được lưu để người quản trị xử lý. Người quản trị có thể thay đổi trạng thái, điều chỉnh token nếu xác minh hợp lệ và gửi thông báo.

Việc tích hợp báo cáo trong sản phẩm giúp người dùng không phải tìm một kênh hỗ trợ bên ngoài. Nó cũng giúp các sự cố được gắn với giao dịch cụ thể.

## 3.33. Hỗ trợ người dùng

Mỗi người dùng có thể mở một phòng hỗ trợ. Tin nhắn được lưu theo thời gian. Người quản trị có màn hình xem danh sách phòng và trả lời.

Hệ thống duy trì trạng thái người quản trị đang trực tuyến. Khi có quản trị viên hoạt động, người dùng được thông báo và chờ phản hồi trực tiếp. Khi không có, một trợ lý tự động có thể trả lời các câu hỏi liên quan đến cách sử dụng sản phẩm, đăng nhập, token, thanh toán, lưu tri thức và các chức năng khác.

Trợ lý hỗ trợ sử dụng nội dung mô tả sản phẩm và lịch sử tin nhắn trong phòng. Nó được tách khỏi chatbot lịch sử để tránh việc một câu hỏi về lỗi thanh toán đi vào kho tri thức lịch sử.

## 3.34. Bảng điều khiển quản trị

Sau khi đăng nhập bằng tài khoản có quyền, người quản trị truy cập bảng điều khiển. Trang tổng quan hiển thị số người dùng, giao dịch, hoạt động chat và các số liệu gần đây. Biểu đồ doanh thu giúp quan sát các khoản hoàn tất theo thời gian. Biểu đồ lưu lượng chat cho biết mức sử dụng. Biểu đồ thời kỳ cho biết câu hỏi tập trung vào nhóm lịch sử nào.

Từ bảng điều khiển, người quản trị chuyển sang các khu vực chi tiết. Giao diện được chia thành tab để tránh đưa quá nhiều dữ liệu vào một màn hình.

## 3.35. Quản lý người dùng

Người quản trị xem danh sách tài khoản, thông tin liên hệ, số dư và quyền. Có thể mở chi tiết một người dùng, sửa thông tin, thay đổi số dư, cấp hoặc thu hồi quyền quản trị và xóa tài khoản khi cần.

Mọi thao tác điều chỉnh token được ghi vào lịch sử với lý do. Điều này giúp kiểm tra lại và hạn chế thay đổi không có dấu vết. Khi xóa tài khoản, hệ thống cần xử lý dữ liệu liên quan theo chính sách.

## 3.36. Quản lý gói và giao dịch

Người quản trị tạo, sửa hoặc xóa gói token. Việc thay đổi gói không làm thay đổi các giao dịch đã tạo trước đó vì số tiền và token của giao dịch được lưu tại thời điểm tạo.

Danh sách thanh toán cho biết người dùng, gói, số tiền, token, trạng thái và mã đối soát. Người quản trị có thể lọc và xem những giao dịch đang chờ, hoàn tất hoặc thất bại.

Khu vực báo cáo sự cố hiển thị mô tả của người dùng. Sau khi kiểm tra, người quản trị cập nhật trạng thái và thực hiện điều chỉnh cần thiết.

## 3.37. Quản lý hoạt động hỏi đáp

Nhật ký chat giúp người quản trị xem câu hỏi, câu trả lời, người dùng, thời gian và lượng token. Dữ liệu này hữu ích để phát hiện những chủ đề thường gặp, câu trả lời quá dài, câu hỏi ngoài phạm vi hoặc trường hợp hệ thống hoạt động không đúng.

Người quản trị cũng có thể xem lịch sử đăng nhập gần đây. Kết hợp địa chỉ mạng và thông tin thiết bị giúp nhận biết một số hành vi bất thường.

Phản hồi tiêu cực được tập hợp riêng. Người quản trị có thể xem câu hỏi và câu trả lời bị đánh giá thấp, sau đó đưa vào danh sách cần bổ sung tri thức.

## 3.38. Quản lý tri thức

Khu vực tri thức chia thành nội dung đang chờ và nội dung đã được duyệt. Người quản trị có thể đọc câu hỏi, câu trả lời, số lượt phản hồi và thời điểm.

Khi phê duyệt, hệ thống thực hiện quá trình bổ sung vào kho tìm kiếm. Khi xóa một nội dung đã duyệt, dữ liệu tương ứng được loại khỏi kho và bộ nhớ được làm mới.

Việc có danh sách đã duyệt giúp người quản trị biết hệ thống đã học thêm những gì. Tuy nhiên, để sử dụng ở quy mô lớn, cần bổ sung lịch sử phiên bản, người duyệt và lý do quyết định.

## 3.39. Quản lý nội dung và cấu hình

Người quản trị có thể thay đổi logo, hình nền, biểu tượng trang, tên, mô tả tìm kiếm và thông tin hiển thị. Nội dung trang giới thiệu như tính năng, số liệu, điểm nổi bật, các thời kỳ và chân trang cũng có thể điều chỉnh.

Phần cấu hình trí tuệ nhân tạo cho phép chọn nhà cung cấp mô hình, mô hình tạo câu trả lời, cách biểu diễn văn bản, nhiệt độ và thông báo khi không có dữ liệu. Chỉ dẫn chung cho trợ lý cũng có thể được chỉnh sửa.

Một cấu hình khác cho phép bật hoặc tắt trò chơi. Việc quản lý bằng cấu hình giúp triển khai sản phẩm ở nhiều bối cảnh mà không cần thay đổi chương trình.

## 3.40. Báo cáo hoạt động theo tuần

Hệ thống có khả năng tổng hợp dữ liệu bảy ngày gần nhất, bao gồm người dùng, thanh toán, hoạt động hỏi đáp và phân bố thời kỳ. Người quản trị có thể yêu cầu tạo báo cáo và gửi đến thư điện tử.

Chức năng này phục vụ vận hành và theo dõi xu hướng. Nếu số câu hỏi về một thời kỳ tăng nhưng tỷ lệ phản hồi tiêu cực cũng tăng, nhóm có thể ưu tiên bổ sung dữ liệu cho thời kỳ đó.

## 3.41. Giao diện web

Giao diện sử dụng cách bố trí thích ứng. Trên máy tính, thanh điều hướng và danh sách hội thoại có thể hiển thị bên cạnh nội dung. Trên điện thoại, các vùng này được thu gọn.

Màu sắc và hình ảnh lấy cảm hứng từ lịch sử và văn hóa Việt Nam. Chuyển động được dùng ở mức vừa phải để tạo cảm giác hiện đại. Các thông báo thành công, lỗi và chờ được hiển thị rõ.

Nội dung câu trả lời được trình bày theo định dạng có tiêu đề, đoạn văn và danh sách khi cần. Tuy nhiên, báo cáo khoa học không phụ thuộc vào phong cách giao diện; điều quan trọng là người dùng đọc được nội dung và nguồn.

## 3.42. Ứng dụng Android

Bản web sau khi hoàn thiện được biên dịch và đóng gói vào ứng dụng Android. Trong chế độ chính thức, tài nguyên giao diện nằm trong ứng dụng nên không cần tải toàn bộ trang từ máy phát triển. Một số chức năng của thiết bị như trạng thái, màn hình khởi động và hướng màn hình được tích hợp.

Ngoài cách đóng gói này, nhóm xây dựng một ứng dụng hiển thị trang web trong khung di động. Ứng dụng lưu chuỗi đăng nhập, đưa nó vào trang khi tải xong và xóa khi người dùng đăng xuất. Các liên kết ngoài phạm vi được chặn để tránh người dùng rời khỏi ứng dụng không chủ ý.

Hai cách tiếp cận phản ánh quá trình thử nghiệm nhiều phương án. Trong tương lai, nhóm nên thống nhất một hướng chính để giảm chi phí bảo trì.

## 3.43. Trò chơi lịch sử

Trò chơi “Hào Khí Sơn Hà: Lam Sơn Khởi Nghĩa” được tích hợp nhằm tạo thêm hình thức tiếp cận. Người chơi điều khiển nhân vật Lê Lợi, vượt qua quân Minh, thu thập vật phẩm và tiến đến trận đối đầu với Liễu Thăng.

Trò chơi có màn hình mở đầu, hướng dẫn, quá trình chiến đấu, thanh sinh lực, tạm dừng, thất bại và chiến thắng. Bản điều khiển cảm ứng giúp sử dụng trên điện thoại.

Nội dung trò chơi có yếu tố hư cấu để tạo gameplay. Vì vậy, phần giới thiệu cần nói rõ đây là mô phỏng lấy cảm hứng từ lịch sử, không phải tái hiện chính xác từng hành động của nhân vật. Những chi tiết như nhân vật trực tiếp đánh bại tướng địch cần được diễn đạt thận trọng.

## 3.44. Thiết kế dữ liệu

Cơ sở dữ liệu vận hành gồm 21 nhóm bảng. Thay vì trình bày tên kỹ thuật, có thể chia theo chức năng. Nhóm tài khoản lưu thông tin người dùng và đăng nhập. Nhóm hội thoại lưu cuộc trò chuyện, tin nhắn và nhật ký. Nhóm giao dịch lưu gói token, thanh toán, báo cáo và lịch sử số dư. Nhóm tri thức lưu nội dung chờ duyệt, phản hồi và bộ nhớ câu hỏi. Nhóm học tập lưu điểm danh, câu trả lời và phần thưởng. Nhóm hỗ trợ lưu phòng và tin nhắn. Nhóm cá nhân hóa lưu ghi chú của từng người.

**Bảng 3.8. Các nhóm dữ liệu được lưu trữ**

| Nhóm dữ liệu | Nội dung |
|---|---|
| Tài khoản | Thông tin cá nhân, quyền, số dư, lần đăng nhập |
| Hội thoại | Cuộc trò chuyện, tin nhắn, nguồn, đánh giá |
| Giao dịch | Gói token, thanh toán, sự cố, biến động số dư |
| Tri thức | Nội dung chờ duyệt, nội dung đã duyệt, phản hồi |
| Học tập | Điểm danh, câu hỏi đã làm, phần thưởng |
| Hỗ trợ | Phòng trao đổi và tin nhắn |
| Cá nhân hóa | Đoạn đã lưu, bản sửa và ghi chú |
| Nội dung trực tuyến | Trang đã thu thập, nguồn, chủ đề và trạng thái |

Dữ liệu vận hành được lưu riêng với kho tìm kiếm. Cách tách này phù hợp vì tài khoản và giao dịch cần thao tác chính xác theo từng dòng, trong khi tài liệu cần tìm theo mức độ gần nghĩa.

## 3.45. Yêu cầu an toàn

Mật khẩu phải được bảo vệ, quyền phải kiểm tra ở máy chủ và dữ liệu cá nhân phải gắn đúng tài khoản. Các giao dịch cần chống xử lý trùng. Nội dung web chưa xác thực không được đưa thẳng vào kho chính.

Tệp do người dùng tải lên cần giới hạn loại và kích thước. Đường dẫn truy cập tệp phải được kiểm tra để ngăn yêu cầu ra ngoài thư mục cho phép. Những thông tin bí mật của dịch vụ ngoài phải nằm trong cấu hình an toàn, không được viết trực tiếp trong chương trình hoặc script thử nghiệm.

Khi triển khai chính thức, danh sách miền được phép gọi máy chủ cần giới hạn theo địa chỉ của ứng dụng. Việc cho phép mọi trang web gửi yêu cầu chỉ phù hợp trong giai đoạn phát triển.

## 3.46. Yêu cầu hiệu năng

Kho tri thức lớn cần được tải trước khi người dùng gửi câu hỏi đầu tiên. Nếu mỗi yêu cầu đều đọc lại toàn bộ dữ liệu, thời gian phản hồi sẽ cao. Hệ thống có cơ chế giữ kho đã tải trong bộ nhớ.

Các bước có thể thực hiện song song như dịch nguồn, tải trang web và xử lý hậu kỳ nên được chạy đồng thời. Câu trả lời được gửi từng phần để giảm cảm giác chờ.

Bộ nhớ câu hỏi giúp xử lý các yêu cầu lặp. Tuy nhiên, bộ nhớ chỉ hiệu quả khi có đủ dữ liệu và chính sách hết hạn phù hợp.

## 3.47. Khả năng mở rộng

Kiến trúc nhiều lớp cho phép bổ sung nguồn dữ liệu, thay đổi mô hình và thêm chức năng. Kho tri thức có thể mở rộng sang bản đồ, hình ảnh và văn bản cổ. Chức năng học tập có thể mở rộng thành bài kiểm tra theo chương.

Hạn chế lớn nhất khi tăng số người dùng là cơ sở dữ liệu hiện tại phù hợp hơn với sản phẩm demo. Khi có nhiều thao tác ghi đồng thời, cần chuyển sang hệ quản trị cơ sở dữ liệu máy chủ. Tệp cần chuyển sang kho lưu trữ riêng, còn quá trình nền cần dùng hàng đợi.

## 3.48. Nhận xét chương

Thiết kế của hệ thống phản ánh mục tiêu xây dựng một sản phẩm đầy đủ. Quy trình hỏi đáp là trung tâm nhưng được bao quanh bởi các chức năng bảo đảm người dùng có thể sử dụng lâu dài. Từ tài khoản, hội thoại, kho cá nhân đến thanh toán và hỗ trợ, mọi phần đều liên kết với nhau thông qua máy chủ và dữ liệu chung.

Điểm nổi bật là việc hệ thống không xem câu trả lời của mô hình là kết quả duy nhất. Trước câu trả lời có các bước hiểu câu hỏi, truy xuất và kiểm tra; sau câu trả lời có nguồn, phản hồi, lưu trữ và khả năng cải tiến. Khi thiếu dữ liệu, quy trình mở rộng tri thức vẫn giữ vai trò kiểm soát của con người.

Chương 4 sẽ trình bày kết quả hiện thực hóa thiết kế này, mô tả giao diện, trạng thái dữ liệu, quá trình kiểm thử và kết quả đánh giá trên bộ 100 câu hỏi.

# CHƯƠNG 4. XÂY DỰNG, THỬ NGHIỆM VÀ ĐÁNH GIÁ HỆ THỐNG

## 4.1. Quá trình xây dựng sản phẩm

Quá trình xây dựng được thực hiện theo từng nhóm chức năng thay vì phát triển toàn bộ trong một lần. Ở giai đoạn đầu, nhóm tập trung tạo máy chủ, cơ sở dữ liệu tài khoản và chức năng hỏi đáp cơ bản. Mục tiêu của giai đoạn này là bảo đảm một người dùng có thể đăng nhập, tạo cuộc hội thoại, gửi câu hỏi và nhận câu trả lời.

Sau khi luồng cơ bản hoạt động, nhóm xây dựng kho tri thức và kết nối cơ chế tìm kiếm. Các tài liệu lịch sử được xử lý thành những đoạn nhỏ và đưa vào hệ thống. Chất lượng câu trả lời được kiểm tra bằng các câu hỏi đơn giản trước, sau đó mở rộng sang câu hỏi thời gian, nguyên nhân và so sánh.

Trong giai đoạn tiếp theo, nhóm bổ sung xử lý câu hỏi nối tiếp, nhận diện thực thể, kiểm tra tài liệu và hiển thị nguồn. Những chức năng này được phát triển dựa trên lỗi quan sát được. Chẳng hạn, khi hệ thống trả nhầm một tài liệu có cùng địa danh nhưng khác năm, nhóm bổ sung điểm thời gian. Khi câu hỏi “vì sao” nhận được đoạn chỉ kể diễn biến, nhóm tăng vai trò của tín hiệu nguyên nhân.

Sau phần hỏi đáp, nhóm hoàn thiện các chức năng sản phẩm như hồ sơ, token, thanh toán, luyện tập, hỗ trợ và quản trị. Giao diện được điều chỉnh để hoạt động trên cả màn hình lớn và điện thoại. Cuối cùng, nhóm xây dựng bộ đánh giá, chạy thí nghiệm, tạo biểu đồ và phân tích kết quả.

Quá trình phát triển có tính lặp. Một số chức năng được sửa nhiều lần sau khi kết nối với các thành phần khác. Ví dụ, luồng trả lời theo thời gian thực không chỉ liên quan đến giao diện mà còn ảnh hưởng đến cách lưu tin nhắn, trừ token, trả nguồn và xử lý lỗi. Tương tự, kho tri thức cá nhân yêu cầu thay đổi cả giao diện, cơ sở dữ liệu, quy trình xây dựng kho tìm kiếm và thứ tự ưu tiên khi trả lời.

## 4.2. Công nghệ và lý do lựa chọn

Máy chủ được xây dựng bằng Python và một khung phát triển giao diện lập trình có khả năng xử lý bất đồng bộ, kiểm tra dữ liệu đầu vào và tự động tạo tài liệu API. Python phù hợp vì có hệ sinh thái mạnh cho trí tuệ nhân tạo, xử lý văn bản và tìm kiếm ngữ nghĩa.

Cơ sở dữ liệu vận hành sử dụng SQLite. Lựa chọn này giúp triển khai nhanh, không cần cài đặt máy chủ dữ liệu riêng và phù hợp với sản phẩm nghiên cứu. Toàn bộ dữ liệu nằm trong một tệp nên dễ sao lưu và chuyển môi trường. Hạn chế là khả năng xử lý nhiều thao tác ghi đồng thời không cao.

Kho tri thức sử dụng FAISS vì có thể tìm kiếm nhanh trong số lượng lớn biểu diễn vector và dễ tích hợp với các công cụ xử lý ngôn ngữ. Hệ thống có thể sử dụng nhiều nhà cung cấp để tạo biểu diễn và câu trả lời, giúp nhóm thay đổi cấu hình trong quá trình thử nghiệm.

Giao diện được xây dựng bằng React và TypeScript. React phù hợp với sản phẩm có nhiều trạng thái như cuộc hội thoại, streaming, cửa sổ nguồn, thanh toán và bảng quản trị. TypeScript giúp kiểm soát cấu trúc dữ liệu giữa các thành phần và giảm lỗi khi dự án lớn dần.

Phần trò chơi sử dụng Phaser, một thư viện chuyên cho trò chơi hai chiều trên web. Ứng dụng Android sử dụng cơ chế đóng gói giao diện web. Một ứng dụng hiển thị web bằng Flutter cũng được thử nghiệm để xử lý đăng nhập và lưu trạng thái.

## 4.3. Kết quả xây dựng trang giới thiệu

Trang giới thiệu được xây dựng với phong cách trực quan và nhấn mạnh bản sắc lịch sử. Phần đầu trang giới thiệu tên sản phẩm, nội dung ngắn gọn và nút bắt đầu. Thanh điều hướng cho phép người dùng chuyển ngôn ngữ, đăng nhập hoặc truy cập chức năng chính.

Phần quy trình mô tả cách hệ thống hoạt động theo cách dễ hiểu: người dùng đặt câu hỏi, hệ thống tìm kiếm tài liệu, kiểm tra nội dung và tạo câu trả lời. Việc trình bày quy trình giúp người dùng biết chatbot không chỉ trả lời từ kiến thức có sẵn của mô hình.

Phần tính năng giới thiệu khả năng hỏi đáp, nguồn, lịch sử, học tập và sử dụng trên thiết bị di động. Phần thời kỳ lịch sử hiển thị các giai đoạn để tạo cảm giác gần gũi với nội dung Việt Nam. Các số liệu và hình ảnh có hiệu ứng xuất hiện khi người dùng cuộn trang.

Nội dung trang có thể thay đổi từ khu vực quản trị. Điều này đã được kiểm tra bằng cách cập nhật tên, mô tả, hình ảnh và các nhóm thông tin, sau đó tải lại trang công khai.

![Hình 4.1. Giao diện trang giới thiệu của hệ thống](hinh_giao_dien/01_trang_gioi_thieu_toan_bo.png)

*Hình 4.1. Giao diện trang giới thiệu của hệ thống.*

## 4.4. Kết quả xây dựng giao diện hỏi đáp

Màn hình hỏi đáp là khu vực được sử dụng nhiều nhất. Trên máy tính, danh sách cuộc hội thoại nằm ở bên trái và nội dung nằm ở phần chính. Trên điện thoại, danh sách được ẩn trong thanh điều hướng để dành không gian.

Khi chưa có tin nhắn, giao diện hiển thị lời chào và gợi ý câu hỏi. Người dùng có thể nhập bằng bàn phím hoặc chọn câu gợi ý. Trong quá trình xử lý, trạng thái chờ được hiển thị. Khi dữ liệu bắt đầu được gửi về, câu trả lời xuất hiện dần.

Câu trả lời hỗ trợ tiêu đề, chữ đậm, danh sách và bảng. Điều này phù hợp với những câu hỏi cần so sánh hoặc trình bày nhiều nguyên nhân. Tuy nhiên, hệ thống hạn chế định dạng quá phức tạp để bảo đảm đọc tốt trên điện thoại.

Sau câu trả lời, người dùng thấy nút đánh giá, danh sách nguồn và câu hỏi liên quan. Nếu bôi chọn một đoạn văn, nút lưu vào kho cá nhân xuất hiện. Người dùng có thể sửa đoạn trước khi lưu.

![Hình 4.2. Giao diện hỏi đáp, nguồn và thao tác đánh giá](hinh_giao_dien/05_hoi_dap_va_nguon.png)

![Hình 4.2a. Cửa sổ chi tiết nguồn trích dẫn](hinh_giao_dien/06_chi_tiet_nguon_trich_dan.png)

*Hình 4.2. Giao diện hỏi đáp, nguồn và thao tác đánh giá.*

## 4.5. Kết quả xây dựng lịch sử hội thoại

Danh sách hội thoại được sắp theo thời gian cập nhật và trạng thái ghim. Cuộc hội thoại ghim nằm ở khu vực ưu tiên. Mỗi mục hiển thị tiêu đề và có thao tác đổi tên hoặc xóa.

Khi chọn một hội thoại, giao diện tải toàn bộ tin nhắn thuộc tài khoản. Tin nhắn giữ nội dung, nguồn và đánh giá cũ. Người dùng có thể tiếp tục đặt câu hỏi và hệ thống sử dụng phần hội thoại gần nhất làm ngữ cảnh.

Chức năng lịch sử được kiểm tra bằng cách tạo nhiều cuộc hội thoại, ghim, đổi tên, tải lại trang và đăng nhập lại. Trạng thái được giữ đúng vì lưu ở máy chủ thay vì chỉ giữ trong trình duyệt.

![Hình 4.3. Danh sách hội thoại, cuộc trò chuyện ghim và nội dung đã lưu](hinh_giao_dien/05_hoi_dap_va_nguon.png)

![Hình 4.3a. Giao diện chat khi hiển thị trên điện thoại](hinh_giao_dien/20_giao_dien_mobile_responsive.png)

*Hình 4.3. Danh sách lịch sử, cuộc hội thoại được ghim và thao tác quản lý.*

## 4.6. Kết quả xử lý câu hỏi nối tiếp

Nhóm thử nghiệm các chuỗi hội thoại có đại từ. Một ví dụ gồm câu đầu hỏi “Ai là người lãnh đạo khởi nghĩa Lam Sơn?” và câu sau hỏi “Ông ấy lên ngôi vào năm nào?”. Hệ thống xác định “ông ấy” là Lê Lợi và tìm thông tin về năm 1428.

Một trường hợp khác hỏi về nhà Trần rồi tiếp tục “triều đại này đã tổ chức kháng chiến như thế nào?”. Hệ thống đưa chủ thể nhà Trần vào câu hỏi tìm kiếm. Cơ chế này hoạt động tốt khi chủ thể xuất hiện rõ ở vài tin nhắn gần nhất.

Khi hội thoại chứa nhiều nhân vật liên tiếp, việc chọn chủ thể có thể khó. Hệ thống ưu tiên thực thể gần nhất, nhưng cách này không luôn đúng nếu người dùng quay lại nhân vật cũ. Đây là hạn chế cần cải thiện bằng mô hình giải quyết đồng tham chiếu hoặc cho phép người dùng sửa chủ thể.

## 4.7. Kết quả phân loại câu hỏi

Các câu thử nghiệm cho thấy hệ thống nhận diện đúng những mẫu phổ biến. Câu “Tại sao nhà Trần thắng quân Mông Cổ?” được xếp vào nhóm nguyên nhân. “Khi nào nhà Lý được thành lập?” thuộc nhóm thời gian. “So sánh nhà Trần và nhà Lý” thuộc nhóm so sánh. “Ai là vị vua đầu tiên của nhà Lý?” thuộc nhóm dữ kiện.

Những câu xã giao ngắn như “xin chào”, “cảm ơn” được trả lời trực tiếp. Các câu hỏi rõ ràng về lập trình, giá vàng hoặc thời tiết được xem là ngoài phạm vi.

Ưu điểm của cách phân loại dựa trên mẫu là tốc độ. Hạn chế là những câu không chứa từ khóa trực tiếp có thể bị xếp vào nhóm dữ kiện. Ví dụ, “Điều gì khiến cuộc khởi nghĩa đó thành công?” mang ý nguyên nhân nhưng không có đúng từ “vì sao”. Tập mẫu cần tiếp tục được mở rộng, còn mô hình ngôn ngữ chỉ nên dùng khi luật không chắc chắn.

## 4.8. Kết quả đánh giá thời gian và nguyên nhân

Trong kiểm tra điểm thời gian, khi câu hỏi và tài liệu cùng nhắc năm 1258, điểm đạt mức cao nhất. Khi câu hỏi nói năm 1285 còn tài liệu nói năm 1009, điểm giảm xuống 0,15. Kết quả này phù hợp với mục tiêu giảm ưu tiên cho tài liệu quá xa mốc.

Trong kiểm tra quan hệ nguyên nhân, đoạn chứa cấu trúc “thắng vì chiến thuật phù hợp, do đó đối phương rút lui” đạt điểm cao. Đoạn chỉ nêu một nhân vật là ai có điểm nhân quả bằng không.

Các phép kiểm tra này chứng minh thuật toán hoạt động đúng theo quy tắc. Tuy nhiên, chúng chưa chứng minh toàn bộ chất lượng hỏi đáp. Một tài liệu đúng năm vẫn có thể không liên quan, và một đoạn giải thích nguyên nhân không nhất thiết chứa các từ khóa quen thuộc. Vì vậy, điểm thời gian và nguyên nhân chỉ là một phần trong quyết định.

## 4.9. Kết quả hiển thị nguồn

Nguồn được hiển thị sau câu trả lời dưới dạng danh sách. Người dùng có thể chọn để mở nội dung chi tiết. Với tài liệu, hệ thống hiển thị tên và trang khi có. Với nguồn trực tuyến, địa chỉ và phần văn bản liên quan được cung cấp.

Trước khi trả nguồn, hệ thống làm sạch ký hiệu trích dẫn và loại những nguồn lạc đối tượng. Trong bộ kết quả đánh giá cuối, tệp kiểm tra cấu trúc nguồn không ghi nhận lỗi. Điều này cho thấy dữ liệu nguồn đáp ứng quy tắc kỹ thuật, nhưng không có nghĩa mọi nội dung đã được chuyên gia lịch sử xác nhận.

Một số tài liệu đầu vào có tên tệp chưa thân thiện. Trong tương lai, cần chuẩn hóa tên hiển thị, bổ sung tác giả, năm xuất bản và loại tài liệu để nguồn có giá trị học thuật cao hơn.

## 4.10. Kết quả xây dựng kho cá nhân

Màn hình kho cá nhân hiển thị các mục đã lưu theo thời gian. Mỗi mục cho biết loại nội dung, phần ghi chú và ngày cập nhật. Người dùng có thể thêm ghi chú mới, sửa và xóa.

Khi lưu một đoạn từ câu trả lời, hệ thống giữ cả câu hỏi gốc và nội dung trợ lý để có bối cảnh. Nếu người dùng sửa, bản sửa là nội dung chính dùng cho lần truy xuất sau, còn phần gốc vẫn được giữ để tham chiếu.

Trong trạng thái dữ liệu nghiệm thu có hai mục kho cá nhân thuộc hai tài khoản. Hai kho tìm kiếm riêng đã được tạo. Khi một người hỏi nội dung liên quan, hệ thống có thể dùng ghi chú của họ; tài khoản khác không truy xuất được.

![Hình 4.4. Giao diện kho tri thức cá nhân](hinh_giao_dien/07_kho_tri_thuc_ca_nhan.png)

![Hình 4.4a. Cửa sổ thêm tri thức cá nhân](hinh_giao_dien/08_them_tri_thuc_ca_nhan.png)

*Hình 4.4. Giao diện lưu, chỉnh sửa và xóa ghi chú cá nhân.*

## 4.11. Kết quả xây dựng chức năng luyện tập

Màn hình luyện tập được thiết kế như một khu vực riêng. Phần đầu hiển thị số token nhận được khi điểm danh, số ngày liên tiếp và nút thực hiện. Nếu đã điểm danh, nút bị khóa.

Năm câu hỏi được hiển thị theo tiến độ. Sau khi chọn, phương án đúng và sai được đánh dấu. Lời giải thích xuất hiện để người dùng hiểu, thay vì chỉ biết kết quả. Khi đạt mốc ba hoặc năm câu đúng, hiệu ứng và thông báo phần thưởng được hiển thị.

Bảng xếp hạng có hai khu vực: tuần hiện tại và tuần trước. Mỗi dòng hiển thị vị trí, người dùng và số câu đúng. Kết quả top ba tuần trước được dùng để trao thưởng.

Trong dữ liệu nghiệm thu có 38 lượt điểm danh, 135 câu trả lời và 27 phần thưởng đã ghi nhận. Số liệu cho thấy chức năng đã được sử dụng, dù quy mô chưa đủ để đánh giá tác động lâu dài.

![Hình 4.5. Giao diện Q&A Token và bảng xếp hạng](hinh_giao_dien/09_qa_token_va_bang_xep_hang.png)

![Hình 4.5a. Giải thích sau khi trả lời câu hỏi Q&A](hinh_giao_dien/10_qa_giai_thich_cau_tra_loi.png)

*Hình 4.5. Giao diện điểm danh, câu hỏi hằng ngày và bảng xếp hạng.*

## 4.12. Kết quả xây dựng thanh toán

Màn hình thanh toán hiển thị các gói dưới dạng thẻ. Sau khi chọn, cửa sổ hóa đơn cho biết số tiền, số token, mã QR, nội dung chuyển khoản và thời gian còn lại.

Giao diện kiểm tra trạng thái định kỳ. Khi giao dịch hoàn tất, cửa sổ thông báo thành công và số dư được cập nhật. Nếu chưa tìm thấy, trạng thái tiếp tục chờ. Khi quá thời gian, người dùng được hướng dẫn tạo giao dịch mới hoặc gửi báo cáo.

Trong dữ liệu nghiệm thu có 107 bản ghi thanh toán, trong đó 11 giao dịch hoàn tất với tổng số tiền 140.000 đồng, 3 giao dịch thất bại và 93 giao dịch đang chờ. Số lượng đang chờ lớn xuất phát từ việc người dùng có thể tạo mã nhưng không chuyển khoản. Vì vậy, không được tính toàn bộ giá trị đang chờ thành doanh thu.

Hệ thống đã ghi nhận 12 báo cáo sự cố thanh toán. Điều này cho thấy chức năng báo cáo có giá trị trong thử nghiệm và cần tiếp tục được hoàn thiện.

![Hình 4.6. Giao diện chọn gói nạp token](hinh_giao_dien/11_cac_goi_nap_token.png)

![Hình 4.6a. Hóa đơn VietQR và nội dung chuyển khoản](hinh_giao_dien/12_hoa_don_vietqr.png)

![Hình 4.6b. Giao diện báo cáo sự cố thanh toán](hinh_giao_dien/13_bao_cao_su_co_thanh_toan.png)

*Hình 4.6. Giao diện chọn gói, mã QR và trạng thái thanh toán.*

## 4.13. Kết quả xây dựng hỗ trợ

Màn hình hỗ trợ cho phép người dùng gửi tin và xem trạng thái người quản trị. Khi người quản trị trực tuyến, giao diện thông báo có thể nhận hỗ trợ trực tiếp. Khi ngoại tuyến, trợ lý tự động trả lời những câu hỏi sử dụng phổ biến.

Khu vực quản trị hiển thị danh sách phòng và tin nhắn. Người quản trị có thể chọn phòng, đọc lịch sử và gửi phản hồi. Trong dữ liệu nghiệm thu có ba phòng và 58 tin nhắn.

Chức năng hỗ trợ giúp tách câu hỏi về sản phẩm khỏi chatbot lịch sử. Điều này giảm nguy cơ kho lịch sử nhận những câu như “tại sao tôi chưa được cộng token?” và cố gắng tìm trong tài liệu.

![Hình 4.9. Giao diện hỗ trợ trực tiếp phía người dùng](hinh_giao_dien/14_ho_tro_truc_tiep_admin_ai.png)

![Hình 4.9a. Giao diện hỗ trợ trực tuyến phía quản trị](hinh_giao_dien/34_admin_ho_tro_truc_tuyen.png)

*Hình 4.9. Giao diện trao đổi hỗ trợ giữa người dùng, trợ lý và quản trị viên.*

## 4.14. Kết quả xây dựng bảng quản trị

Trang tổng quan hiển thị các thẻ số liệu và biểu đồ. Biểu đồ doanh thu tổng hợp giao dịch hoàn tất, không tính đang chờ. Biểu đồ hoạt động chat thể hiện số lượt theo ngày. Biểu đồ thời kỳ dựa trên phân loại đơn giản từ nội dung câu hỏi.

Các khu vực quản lý người dùng, giao dịch, báo cáo, phản hồi và tri thức có bảng dữ liệu, phân trang hoặc tải thêm tùy số lượng. Thao tác nguy hiểm như xóa có bước xác nhận.

Khu vực cấu hình có nhiều nhóm nội dung. Người quản trị có thể thay đổi hình ảnh và xem trước. Các trường lớn như nội dung trang giới thiệu được chia thành phần để dễ chỉnh sửa.

Chức năng gửi báo cáo tuần có trạng thái đang gửi và thông báo kết quả. Báo cáo tổng hợp dữ liệu bảy ngày và gửi đến thư điện tử được cấu hình.

![Hình 4.7. Bảng điều khiển quản trị tổng quan](hinh_giao_dien/21_admin_tong_quan_dashboard.png)

![Hình 4.7a. Quản lý người dùng và quyền tài khoản](hinh_giao_dien/22_admin_quan_ly_nguoi_dung.png)

![Hình 4.7b. Chi tiết một tài khoản người dùng](hinh_giao_dien/23_admin_chi_tiet_nguoi_dung.png)

![Hình 4.7c. Quản lý gói nạp token](hinh_giao_dien/24_admin_goi_nap_token.png)

![Hình 4.7d. Nhật ký token và tiền tệ](hinh_giao_dien/25_admin_lich_su_tien_te_token.png)

![Hình 4.7e. Quản lý hóa đơn thanh toán](hinh_giao_dien/26_admin_hoa_don_thanh_toan.png)

![Hình 4.7f. Lịch sử chat và thống kê cảm xúc](hinh_giao_dien/27_admin_lich_su_chat.png)

![Hình 4.7g. Cột phí và nút mở chi tiết trong lịch sử chat](hinh_giao_dien/27b_admin_lich_su_chat_cot_chi_tiet.png)

![Hình 4.7h. Chi tiết một lượt hỏi đáp trong quản trị](hinh_giao_dien/28_admin_chi_tiet_lich_su_chat.png)

![Hình 4.7i. Nhật ký truy cập và đăng nhập](hinh_giao_dien/29_admin_nhat_ky_truy_cap.png)

![Hình 4.7j. Danh sách báo cáo sự cố thanh toán](hinh_giao_dien/30_admin_bao_cao_su_co_thanh_toan.png)

![Hình 4.7k. Phản hồi câu trả lời cần xem xét](hinh_giao_dien/33_admin_phan_hoi_cau_tra_loi.png)

![Hình 4.7l. Cấu hình hệ thống, SEO và nội dung trang chủ](hinh_giao_dien/35_admin_cau_hinh_he_thong.png)

![Hình 4.7m. Cấu hình triều đại, AI và chân trang](hinh_giao_dien/36_admin_cau_hinh_trieu_dai_footer.png)

*Hình 4.7. Bảng điều khiển quản trị và các biểu đồ hoạt động.*

![Hình 4.8. Giao diện kiểm duyệt tri thức AI](hinh_giao_dien/31_admin_kiem_duyet_tri_thuc_ai.png)

*Hình 4.8. Danh sách tri thức chờ duyệt và thao tác phê duyệt.*

## 4.15. Kết quả xây dựng trò chơi

Trò chơi có màn hình giới thiệu bối cảnh, hướng dẫn điều khiển và nút bắt đầu. Nhân vật có thể di chuyển, nhảy, tấn công và nhận sát thương. Kẻ địch có hành vi tiếp cận và tấn công. Trùm có các đòn riêng.

Giao diện hiển thị sinh lực của nhân vật và trùm, thông báo nhiệm vụ và nút cảm ứng. Khi người chơi thất bại, màn hình kết thúc cho phép chơi lại. Khi chiến thắng, màn hình trình bày kết quả và nội dung liên quan đến khởi nghĩa Lam Sơn.

Trò chơi đã được biên dịch thành công ở chế độ triển khai. Kích thước chương trình tương đối lớn vì thư viện trò chơi và tài nguyên được đưa vào cùng gói. Việc tải trò chơi nên được thực hiện khi người dùng mở, thay vì tải ngay cùng trang chính.

![Hình 4.10. Màn hình bắt đầu trò chơi Hào Khí Lam Sơn](hinh_giao_dien/18_game_man_hinh_bat_dau.png)

![Hình 4.10a. Giao diện khi đang chơi, có sinh lực, kỹ năng và điểm](hinh_giao_dien/19_game_dang_choi.png)

*Hình 4.10. Giao diện trò chơi Hào Khí Sơn Hà.*

## 4.16. Kết quả đóng gói ứng dụng di động

Giao diện web được biên dịch thành tệp triển khai và đóng gói trong ứng dụng Android. Cấu hình nhận diện ứng dụng, màn hình khởi động và quyền cần thiết đã được tạo. Sản phẩm có tệp cài đặt đặt trong khu vực tải công khai.

Ứng dụng hiển thị web bằng Flutter cũng đã được xây dựng về mặt mã nguồn. Nó có màn hình tải, báo lỗi kết nối, lưu trạng thái đăng nhập và mở trình duyệt xác thực Google. Tuy nhiên, trong môi trường kiểm tra ngày 13 tháng 06 năm 2026, công cụ Flutter không có trong đường dẫn hệ thống nên chưa chạy được bước phân tích tự động. Báo cáo vì vậy không khẳng định phần Flutter đã vượt qua kiểm tra của bộ công cụ.


## 4.17. Bộ ảnh giao diện nghiệm thu

Để tiện đối chiếu khi dàn trang Word, nhóm bổ sung hai ảnh tổng hợp thể hiện toàn bộ ảnh giao diện đã chụp từ sản phẩm đang chạy. Nhóm ảnh thứ nhất gồm các chức năng phía người dùng như trang giới thiệu, đăng nhập, đăng ký, chat, nguồn, kho cá nhân, Q&A, thanh toán, hỗ trợ, hồ sơ, đổi ngôn ngữ, trò chơi và giao diện điện thoại. Nhóm ảnh thứ hai gồm các chức năng quản trị như tổng quan, người dùng, gói nạp, token, hóa đơn, lịch sử chat, truy cập, báo cáo, tri thức AI, phản hồi, hỗ trợ và cấu hình hệ thống.

![Bộ ảnh giao diện phía người dùng](hinh_giao_dien/00_contact_sheet_nguoi_dung.png)

![Bộ ảnh giao diện phía quản trị](hinh_giao_dien/00_contact_sheet_quan_tri.png)

## 4.18. Trạng thái dữ liệu vận hành

Số liệu vận hành được lấy từ cơ sở dữ liệu tại thời điểm kiểm tra. Mục đích của số liệu là chứng minh các chức năng đã tạo và được sử dụng. Chúng không đại diện cho quy mô triển khai chính thức.

**Bảng 4.1. Trạng thái dữ liệu tại thời điểm nghiệm thu**

| Nội dung | Số lượng |
|---|---:|
| Tài khoản | 21 |
| Tài khoản quản trị | 1 |
| Cuộc hội thoại | 607 |
| Tin nhắn | 2.287 |
| Tin nhắn người dùng | 1.149 |
| Tin nhắn trợ lý | 1.138 |
| Lượt ghi nhận hỏi đáp | 1.374 |
| Lần đăng nhập được ghi nhận | 597 |
| Biến động token | 1.550 |
| Thanh toán | 107 |
| Báo cáo sự cố thanh toán | 12 |
| Nội dung tri thức chờ/đã duyệt | 102 |
| Nội dung chưa duyệt | 79 |
| Nội dung đã duyệt | 23 |
| Câu trả lời luyện tập | 135 |
| Lượt điểm danh | 38 |
| Phần thưởng học tập | 27 |
| Tin nhắn hỗ trợ | 58 |

Số tin nhắn người dùng và trợ lý gần bằng nhau, phù hợp với cấu trúc một câu hỏi nhận một câu trả lời. Chênh lệch nhỏ có thể do tin nhắn lỗi, quá trình thử hoặc câu hỏi chưa hoàn tất.

Trong 2.287 tin nhắn, phần lớn chưa được đánh giá. Có 17 đánh giá tích cực và một số ít phản hồi tiêu cực. Tỷ lệ đánh giá thấp cho thấy chức năng đã tồn tại nhưng người dùng chưa có thói quen phản hồi. Giao diện có thể cần lời nhắc phù hợp hơn.

Trong 102 nội dung tri thức, 23 mục đã được duyệt. Con số này cho thấy quy trình học có kiểm soát đã được sử dụng. Tuy nhiên, để đánh giá chất lượng, cần kiểm tra từng mục, nguồn và người duyệt.

## 4.19. Quy mô kho tri thức

Kho dùng cấu hình Vertex chứa 138.058 đoạn, còn kho dùng cấu hình OpenAI chứa 107.638 đoạn. Đây là số đoạn sau khi chia tài liệu, không phải số cuốn sách hoặc số nguồn. Hai con số không được cộng lại vì có khả năng biểu diễn lại cùng nội dung theo hai cấu hình.

Kho lịch sử toàn cục có 11 đoạn cho mỗi cấu hình ở thời điểm kiểm tra. Con số này còn nhỏ vì quy trình thu thập trực tuyến mới được sử dụng ở mức thử nghiệm. Kho cá nhân của hai người dùng có kích thước nhỏ tương ứng với hai ghi chú đã lưu.

Sự khác nhau giữa 138.058 và 107.638 đoạn cho thấy hai lần xây dựng kho không hoàn toàn giống nhau. Có thể tài liệu, cách chia hoặc thời điểm cập nhật khác. Để thực hiện nghiên cứu so sánh mô hình biểu diễn, cần xây dựng lại hai kho từ cùng tập đoạn.

## 4.20. Kiểm tra biên dịch và cú pháp

Giao diện web chính được biên dịch ở chế độ triển khai thành công. Quá trình xử lý 2.455 mô-đun và tạo các tệp giao diện, kiểu dáng và chương trình. Không có lỗi làm dừng quá trình.

Trò chơi cũng được biên dịch thành công với 23 mô-đun. Cả hai quá trình có cảnh báo tệp chương trình chính lớn hơn mức khuyến nghị. Giao diện chính khoảng 1,13 MB trước nén, còn trò chơi khoảng 1,55 MB. Khi nén, kích thước giảm đáng kể nhưng vẫn cần chia nhỏ.

Các tệp Python thuộc máy chủ, chatbot, xây dựng kho và đánh giá được kiểm tra cú pháp. Không phát hiện lỗi biên dịch. Kiểm tra cú pháp không thay thế kiểm thử chức năng, nhưng giúp bảo đảm mã có thể được nạp.

**Bảng 4.2. Kết quả kiểm tra kỹ thuật**

| Hạng mục | Kết quả |
|---|---|
| Biên dịch giao diện web | Thành công |
| Biên dịch trò chơi | Thành công |
| Kiểm tra cú pháp phần máy chủ và trí tuệ nhân tạo | Thành công |
| Phân loại câu hỏi mẫu | Đúng kết quả mong đợi |
| Chấm điểm thời gian mẫu | Đúng quy tắc |
| Chấm điểm nguyên nhân mẫu | Đúng quy tắc |
| Kiểm tra cấu trúc nguồn của bộ đánh giá | Không ghi nhận lỗi |
| Phân tích ứng dụng Flutter | Chưa thực hiện do thiếu bộ công cụ |

## 4.21. Xây dựng bộ câu hỏi đánh giá

Bộ đánh giá cuối gồm 100 câu hỏi về lịch sử phong kiến Việt Nam từ năm 939 đến năm 1945. Mỗi câu có nội dung, đáp án tham chiếu, độ khó và nhóm triều đại hoặc chủ đề.

Câu dễ chủ yếu yêu cầu dữ kiện trực tiếp như tên người, năm, sự kiện hoặc địa điểm. Câu trung bình yêu cầu giải thích nguyên nhân, vai trò, chính sách và hệ quả. Câu khó yêu cầu tổng hợp nhiều nguồn, so sánh nhiều triều đại hoặc đánh giá một quá trình dài.

**Bảng 4.3. Cấu trúc bộ câu hỏi đánh giá**

| Mức độ | Số câu | Nội dung chủ yếu |
|---|---:|---|
| Dễ | 40 | Dữ kiện, tên, năm và sự kiện |
| Trung bình | 35 | Nguyên nhân, vai trò, cải cách và hệ quả |
| Khó | 25 | So sánh và tổng hợp nhiều giai đoạn |

Về chủ đề, nhóm Ngô - Đinh - Tiền Lê có 11 câu; Lý - Trần có 20 câu; nhà Hồ có 15 câu; Lê - Mạc - Lê Trung Hưng có 9 câu; Tây Sơn có 11 câu; Nguyễn có 9 câu; tổng hợp phong kiến có 22 câu; tổng hợp phương pháp có 3 câu.

Phân bố này bao phủ nhiều giai đoạn nhưng chưa hoàn toàn cân bằng. Nhóm nhà Hồ có tỷ lệ cao, còn một số triều đại có ít câu hơn. Bộ câu hỏi tổng hợp chiếm tỷ lệ lớn, tạo áp lực đáng kể cho khả năng truy xuất nhiều bằng chứng.

## 4.22. Các hệ thống tham gia thực nghiệm

TALRAG là hệ thống đề xuất với đầy đủ phân loại, điều chỉnh thời gian, nguyên nhân, thực thể, kiểm tra tài liệu và các cơ chế liên quan.

Hệ thống đối sánh ItihashQA được điều chỉnh để chạy với cùng kho lịch sử và mô hình tạo câu trả lời. Nó sử dụng cách tìm kiếm tĩnh theo mức độ gần nghĩa. Vì có thể thu được tài liệu đã truy xuất và thời gian xử lý, đây là so sánh có khả năng tái lập.

NotebookLM được sử dụng như một công cụ nghiên cứu bám theo tài liệu. Gemini Gems được cấu hình thành trợ lý lịch sử. Custom GPT được tạo với tài liệu và chỉ dẫn tương ứng. Ba hệ thống này được dùng để tham khảo chất lượng thực tế, nhưng phần tìm kiếm bên trong không thể quan sát đầy đủ.

## 4.23. Quy trình chạy thực nghiệm

Mỗi câu hỏi được gửi lần lượt đến các hệ thống. Với TALRAG và hệ thống đối sánh, chương trình ghi câu trả lời, danh sách ngữ cảnh và thời gian. Với các trợ lý đóng, câu trả lời và bằng chứng hiển thị được thu thập theo cùng định dạng có thể.

Kết quả được đưa vào khung đánh giá. Mô hình đánh giá xem các phát biểu có được ngữ cảnh hỗ trợ, tạo các câu hỏi ngược để đo mức độ liên quan, so sánh tài liệu với đáp án tham chiếu và tính độ bao phủ.

Kết quả chi tiết từng câu được lưu trước khi tổng hợp. Điểm trung bình được tính theo hệ thống và độ khó. Các biểu đồ được vẽ từ tệp kết quả cuối.

Trong dự án còn tài liệu của một lần thử sơ bộ 30 câu với số liệu khác. Báo cáo này không sử dụng các số cũ làm kết quả chính. Lần 30 câu chỉ được xem là giai đoạn kiểm tra quy trình; kết quả chính là bộ 100 câu được hoàn thành ngày 11 tháng 06 năm 2026.

Điểm trung bình của một tiêu chí đánh giá được tính theo Công thức 4.1.

M_j = (1/n) · Σ m_j(x_l)     (4.1)

Trong đó, M_j là điểm trung bình của tiêu chí j; n là số câu hỏi hợp lệ; x_l là câu hỏi thứ l trong tập đánh giá; m_j(x_l) là điểm của tiêu chí j đối với câu hỏi x_l. Công thức này được dùng khi tổng hợp theo toàn bộ 100 câu hỏi và khi tổng hợp riêng theo từng độ khó.

Khi so sánh TALRAG với hệ thống đối sánh, báo cáo sử dụng tỷ lệ cải thiện tương đối ở Công thức 4.2.

I_j = ((M_j(TALRAG) - M_j(đối_sánh)) / M_j(đối_sánh)) · 100%     (4.2)

Trong đó, I_j là tỷ lệ thay đổi của tiêu chí j. Nếu I_j lớn hơn 0, TALRAG cao hơn hệ thống đối sánh ở tiêu chí đó. Nếu I_j nhỏ hơn 0, TALRAG thấp hơn. Công thức này giúp tránh diễn giải cảm tính khi hai hệ thống có thang điểm giống nhau nhưng mức chênh lệch tuyệt đối nhỏ.

Thời gian phản hồi trung bình được tính theo Công thức 4.3.

L = (1/n) · Σ (t_ket_thuc,l - t_bat_dau,l)     (4.3)

Trong đó, L là thời gian phản hồi trung bình; t_bat_dau,l là thời điểm gửi câu hỏi thứ l; t_ket_thuc,l là thời điểm hệ thống hoàn tất câu trả lời. Các trợ lý đóng không có phép đo tự động tương đương nên báo cáo không dùng giá trị 0 giây cho nhóm này.

**Bảng 4.4. Cách đọc các chỉ số đánh giá**

| Chỉ số | Khoảng giá trị | Cách đọc trong báo cáo |
|---|---:|---|
| Bám sát tài liệu | 0 đến 1 | Càng gần 1 càng cho thấy câu trả lời dựa trên ngữ cảnh đã truy xuất |
| Liên quan câu hỏi | 0 đến 1 | Càng gần 1 càng cho thấy câu trả lời tập trung vào yêu cầu của người dùng |
| Chính xác ngữ cảnh | 0 đến 1 | Càng gần 1 càng cho thấy các đoạn được truy xuất ít nhiễu |
| Bao phủ ngữ cảnh | 0 đến 1 | Càng gần 1 càng cho thấy ngữ cảnh chứa đủ bằng chứng cần thiết |
| Thời gian phản hồi | Giây | Càng thấp càng tốt cho trải nghiệm, nhưng cần xét cùng chất lượng câu trả lời |

## 4.24. Kết quả tổng thể

**Bảng 4.5. Kết quả đánh giá tổng thể**

| Hệ thống | Bám sát tài liệu | Liên quan câu hỏi | Chính xác ngữ cảnh | Bao phủ ngữ cảnh | Thời gian trung bình |
|---|---:|---:|---:|---:|---:|
| TALRAG | 0,4009 | 0,4480 | 0,1972 | 0,1433 | 24,57 giây |
| ItihashQA | 0,4464 | 0,1562 | 0,1769 | 0,2150 | 4,90 giây |
| NotebookLM | 0,2784 | 0,1571 | 0,1841 | 0,2117 | Không đo |
| Gemini Gems | 0,5316 | 0,7685 | 0,1656 | 0,1967 | Không đo |
| Custom GPT | 0,3153 | 0,8642 | 0,1683 | 0,2300 | Không đo |

Trong dữ liệu gốc, thời gian của ba trợ lý đóng được ghi bằng 0 vì không có phép đo tự động. Báo cáo chuyển thành “không đo” để tránh hiểu nhầm rằng chúng trả lời tức thời.

![Hình 4.11. So sánh kết quả đánh giá tổng thể](figures/hinh_4_1_ragas_tong_the.png)

## 4.25. Phân tích mức độ liên quan của câu trả lời

Mức độ liên quan là kết quả nổi bật nhất. TALRAG đạt 0,4480, trong khi hệ thống truy xuất tĩnh đạt 0,1562. Mức tăng tương đối là 186,9%. Điều này cho thấy câu trả lời của TALRAG tập trung vào câu hỏi tốt hơn so với việc chỉ lấy các đoạn gần nghĩa.

Có nhiều nguyên nhân dẫn đến cải thiện này. Việc phân loại giúp chọn đúng loại tài liệu. Câu hỏi nối tiếp được làm rõ trước khi tìm. Thực thể giúp giảm nhầm chủ đề. Tài liệu được kiểm tra trước khi đưa vào mô hình. Chỉ dẫn tạo câu trả lời cũng thay đổi theo tình huống.

Tuy nhiên, Gemini Gems và Custom GPT đạt điểm cao hơn TALRAG. Kết quả này cho thấy các mô hình thương mại mạnh có khả năng tạo đầu ra rất tập trung. Báo cáo không nên tuyên bố TALRAG vượt tất cả. Đóng góp của TALRAG nằm ở tính minh bạch, khả năng kiểm soát và tái lập, trong khi chất lượng ngôn ngữ của hệ thống đóng vẫn có ưu thế.

## 4.26. Phân tích mức độ bám sát tài liệu

TALRAG đạt 0,4009, thấp hơn ItihashQA 0,4464 và Gemini Gems 0,5316. Điều này có nghĩa một tỷ lệ phát biểu trong câu trả lời chưa được ngữ cảnh hỗ trợ tốt bằng các hệ thống đó.

Một nguyên nhân có thể là TALRAG tạo câu trả lời giải thích dài hơn. Khi câu trả lời có nhiều mệnh đề, chỉ cần một số mệnh đề không xuất hiện trong ngữ cảnh là điểm giảm. Việc kết hợp lịch sử hội thoại và nhiều nguồn cũng có thể khiến mô hình nối các ý vượt quá bằng chứng.

Nhánh tìm kiếm web và tri thức cá nhân tạo thêm sự đa dạng nhưng cũng làm khó việc đánh giá. Nội dung cá nhân có thể đúng với mục đích người dùng nhưng không nằm trong đáp án tham chiếu. Nội dung web có thể cung cấp thông tin bổ sung nhưng cách trích xuất chưa hoàn hảo.

Để cải thiện, hệ thống cần ràng buộc câu trả lời ở cấp mệnh đề, yêu cầu trích dẫn sau từng ý quan trọng và thực hiện bước kiểm tra sau sinh. Những câu không được nguồn hỗ trợ nên bị loại hoặc chuyển thành diễn giải có điều kiện.

## 4.27. Phân tích độ chính xác của ngữ cảnh

TALRAG đạt 0,1972, cao hơn ItihashQA 0,1769. Mức tăng không lớn nhưng cho thấy việc sắp xếp lại và kiểm tra tài liệu có tác dụng chọn các đoạn tập trung hơn.

Ở nhóm câu khó, sự khác biệt rõ hơn: TALRAG đạt 0,3738 trong khi ItihashQA đạt 0,1964. Câu khó thường có nhiều từ liên quan đến nhiều triều đại. Cách tìm tĩnh dễ lấy nhiều đoạn rộng nhưng không tập trung. Điểm thời gian, nguyên nhân và thực thể giúp TALRAG ưu tiên đúng hơn.

Ở nhóm trung bình, TALRAG lại thấp hơn. Những câu giải thích thường cần nhiều đoạn nền. Bộ kiểm tra có thể loại một đoạn vì không trả lời trực tiếp, dù đoạn đó cần để xây dựng bối cảnh. Đây là dấu hiệu hệ thống đang thiên về độ chính xác mà bỏ mất một phần bằng chứng.

## 4.28. Phân tích độ bao phủ ngữ cảnh

Độ bao phủ là điểm yếu rõ. TALRAG đạt 0,1433, thấp hơn ItihashQA 0,2150. Việc lọc nhiều tầng có thể làm số tài liệu còn lại quá ít.

Với câu hỏi nguyên nhân, đáp án tham chiếu thường có nhiều yếu tố. Nếu hệ thống chỉ lấy một đoạn nói về nguyên nhân trực tiếp, nó bỏ mất nguyên nhân sâu xa. Với câu so sánh, nếu một phía có nhiều tài liệu hơn, câu trả lời không cân bằng.

Kết quả này cho thấy không thể chỉ tối ưu để loại nhiễu. Một hệ thống lịch sử cần thu thập đủ mảnh bằng chứng. Hướng cải thiện là tách câu hỏi thành các ý nhỏ, tìm tài liệu cho từng ý, hợp nhất kết quả và chỉ lọc sau khi bảo đảm mỗi ý có ít nhất một nguồn.

## 4.29. Phân tích thời gian phản hồi

TALRAG mất trung bình 24,57 giây, trong khi hệ thống tĩnh mất 4,90 giây. Chênh lệch gần năm lần là đáng kể đối với trải nghiệm người dùng.

TALRAG thực hiện nhiều bước hơn: phân loại, nhận diện, tìm nhiều kho, sắp xếp lại, kiểm tra, dịch, tạo câu trả lời, làm sạch nguồn và sinh câu hỏi liên quan. Một số bước có thể gọi mô hình ngôn ngữ. Khi phải tìm kiếm web, thời gian còn tăng.

Điều đáng chú ý là câu dễ có thời gian trung bình 27,67 giây, cao hơn câu khó 19,36 giây. Điều này cho thấy độ khó học thuật không quyết định trực tiếp thời gian. Cache, độ dài tài liệu, số lần gọi mô hình và việc kích hoạt nhánh bổ sung có ảnh hưởng lớn hơn.

Để giảm thời gian, hệ thống cần mặc định dùng cách phân loại và kiểm tra nhanh, chỉ gọi mô hình khi không chắc chắn. Các thao tác hậu kỳ có thể chạy song song. Câu hỏi dữ kiện nên dùng số tài liệu ít hơn. Câu hỏi liên quan có thể được tạo sau khi câu trả lời đã hiển thị hoàn toàn.

## 4.30. Kết quả theo độ khó

**Bảng 4.6. Kết quả đánh giá theo độ khó**

| Độ khó | Hệ thống | Bám sát | Liên quan | Chính xác ngữ cảnh | Bao phủ | Thời gian |
|---|---|---:|---:|---:|---:|---:|
| Dễ | TALRAG | 0,3329 | 0,5638 | 0,0909 | 0,0500 | 27,67 s |
| Dễ | ItihashQA | 0,2125 | 0,0227 | 0,0083 | 0,0250 | 3,93 s |
| Trung bình | TALRAG | 0,4030 | 0,5670 | 0,1925 | 0,1714 | 24,76 s |
| Trung bình | ItihashQA | 0,5290 | 0,2997 | 0,3555 | 0,4000 | 5,33 s |
| Khó | TALRAG | 0,5066 | 0,0962 | 0,3738 | 0,2533 | 19,36 s |
| Khó | ItihashQA | 0,7048 | 0,1688 | 0,1964 | 0,2600 | 5,85 s |

![Hình 4.12. So sánh kết quả theo mức độ câu hỏi](figures/hinh_4_2_ragas_theo_do_kho.png)

Ở câu dễ, TALRAG vượt hệ thống tĩnh ở cả bốn tiêu chí. Điểm liên quan tăng rất mạnh. Điều này chứng tỏ quy trình thích nghi phù hợp với câu trực tiếp. Tuy nhiên, điểm ngữ cảnh tuyệt đối còn thấp, có thể do cách đánh giá nguồn và đáp án tham chiếu.

Ở câu trung bình, TALRAG giữ điểm liên quan cao nhưng thấp hơn về ba tiêu chí còn lại. Câu trung bình thường cần phần giải thích rộng, trong khi cơ chế lọc đang chọn nội dung quá tập trung.

Ở câu khó, TALRAG đạt độ chính xác ngữ cảnh cao nhất trong tất cả các hệ thống thực nghiệm (0,3738, đồng thời cũng là mức cao nhất của chính hệ thống này qua các độ khó) nhưng điểm liên quan giảm mạnh. Một khả năng là hệ thống tìm được các đoạn đúng chủ đề nhưng câu trả lời không tổng hợp thành một đáp án trực tiếp. Khả năng khác là mô hình từ chối hoặc trả lời thiếu do ngữ cảnh không đủ.

Kết quả theo độ khó cho thấy cần điều chỉnh quy trình theo không chỉ loại câu hỏi mà còn mức độ phức tạp. Câu khó cần thu thập rộng và tổng hợp theo từng ý, trong khi câu dễ cần phản hồi nhanh.

## 4.31. So sánh chất lượng câu trả lời với trợ lý thương mại

![Hình 4.13. So sánh chất lượng câu trả lời](figures/hinh_4_3_chi_so_cau_tra_loi.png)

Custom GPT đạt mức liên quan cao nhất 0,8642, còn Gemini Gems đạt mức bám sát tài liệu cao nhất 0,5316. Các kết quả này phản ánh sức mạnh của mô hình nền và quá trình tối ưu thương mại.

NotebookLM có mức liên quan gần hệ thống tĩnh nhưng độ bao phủ tương đối tốt. Công cụ này có xu hướng bám vào tài liệu và thận trọng. Tuy nhiên, cách lấy ngữ cảnh bên trong không được công khai.

TALRAG không dẫn đầu về điểm tuyệt đối, nhưng cho phép quan sát câu hỏi đã được phân loại thế nào, tài liệu nào được chọn, điểm nào được tính và nội dung mới được đưa vào kho ra sao. Đây là ưu điểm đối với nghiên cứu và quản trị.

## 4.32. So sánh chất lượng ngữ cảnh

![Hình 4.14. So sánh chất lượng ngữ cảnh](figures/hinh_4_4_chi_so_ngu_canh.png)

Trong hai hệ thống có thể tái lập, TALRAG có độ chính xác ngữ cảnh cao hơn nhưng độ bao phủ thấp hơn. Đây là sự đánh đổi điển hình giữa việc chọn ít tài liệu chính xác và giữ nhiều tài liệu để không bỏ sót.

Đối với giáo dục lịch sử, cách cân bằng phù hợp phụ thuộc loại câu hỏi. Câu hỏi dữ kiện có thể ưu tiên chính xác. Câu hỏi phân tích cần ưu tiên bao phủ. Hệ thống hiện thay đổi trọng số theo loại câu hỏi nhưng chưa thay đổi đủ mạnh cách lọc và ngưỡng.

## 4.33. Kiểm thử chức năng

Nhóm xây dựng các tình huống kiểm thử theo hành trình người dùng. Đăng ký được kiểm tra với tài khoản mới và tài khoản trùng. Đăng nhập được kiểm tra với mật khẩu đúng, sai và chuỗi hết hạn. Quyền quản trị được kiểm tra bằng cách dùng tài khoản thường truy cập chức năng quản lý.

Hội thoại được kiểm tra bằng việc tạo, đổi tên, ghim, xóa và tải lại. Quyền sở hữu được kiểm tra với mã cuộc hội thoại của tài khoản khác. Hỏi đáp được kiểm tra với các loại câu hỏi, câu nối tiếp, câu ngoài phạm vi và lời chào.

Kho cá nhân được kiểm tra bằng cách lưu, sửa, xóa và hỏi lại. Tài khoản khác được dùng để xác nhận dữ liệu không bị lộ. Bộ nhớ câu hỏi được kiểm tra với câu giống, câu gần giống, thời hạn và thay đổi phiên bản kho tri thức.

Thanh toán được kiểm tra với mã hợp lệ, số tiền sai, mã giao dịch trùng và trạng thái hết hạn. Phần thưởng học tập được kiểm tra để không cộng hai lần. Hỗ trợ được kiểm tra khi người quản trị trực tuyến và ngoại tuyến.

**Bảng 4.7. Kết quả kiểm tra các chức năng chính**

| Nhóm | Nội dung kiểm tra | Kết quả |
|---|---|---|
| Tài khoản | Đăng ký, đăng nhập, Google, hồ sơ | Hoạt động |
| Hội thoại | Tạo, xem, ghim, đổi tên, xóa | Hoạt động |
| Hỏi đáp | Truy xuất, tạo câu trả lời, nguồn, streaming | Hoạt động |
| Câu nối tiếp | Làm rõ chủ thể gần nhất | Hoạt động với trường hợp phổ biến |
| Song ngữ | Chuyển câu hỏi và câu trả lời | Hoạt động |
| Kho cá nhân | Lưu, sửa, xóa, dùng lại | Hoạt động |
| Thanh toán | Tạo mã, kiểm tra, cộng token | Hoạt động |
| Luyện tập | Điểm danh, câu hỏi, thưởng, xếp hạng | Hoạt động |
| Hỗ trợ | Trao đổi với quản trị hoặc trợ lý | Hoạt động |
| Quản trị | Người dùng, giao dịch, tri thức, cấu hình | Hoạt động |
| Ứng dụng Android | Đóng gói giao diện web | Đã có sản phẩm |

Các kết quả trên dựa trên kiểm tra thực tế và đối chiếu mã nguồn. Dự án chưa có bộ kiểm thử tự động bao phủ toàn bộ chức năng. Đây là điểm cần bổ sung để tránh lỗi quay lại khi phát triển tiếp.

**Bảng 4.8. Ma trận kiểm thử nghiệp vụ chi tiết**

| Mã | Tình huống kiểm thử | Kết quả mong đợi | Trạng thái |
|---|---|---|---|
| TC-01 | Đăng ký bằng thông tin hợp lệ | Tạo tài khoản, cấp số dư ban đầu và cho phép đăng nhập | Đạt |
| TC-02 | Đăng ký bằng email hoặc tên đăng nhập đã tồn tại | Từ chối tạo tài khoản và hiển thị thông báo lỗi | Đạt |
| TC-03 | Đăng nhập bằng mật khẩu sai | Không cấp phiên làm việc | Đạt |
| TC-04 | Người dùng thường truy cập đường dẫn quản trị | Máy chủ từ chối do không đủ quyền | Đạt |
| TC-05 | Đặt câu hỏi dữ kiện lịch sử | Hệ thống trả lời trực tiếp, có nguồn và trừ token | Đạt |
| TC-06 | Đặt câu hỏi thời gian | Hệ thống tăng ưu tiên tài liệu có mốc năm phù hợp | Đạt |
| TC-07 | Đặt câu hỏi nguyên nhân | Hệ thống ưu tiên tài liệu có quan hệ nguyên nhân - kết quả | Đạt |
| TC-08 | Đặt câu hỏi so sánh | Hệ thống giữ nhiều tài liệu hơn để tổng hợp các phía | Đạt |
| TC-09 | Đặt câu hỏi ngoài phạm vi lịch sử | Hệ thống từ chối hoặc hướng người dùng về phạm vi phù hợp | Đạt |
| TC-10 | Hỏi nối tiếp bằng đại từ hoặc từ chỉ định | Hệ thống dùng ngữ cảnh hội thoại gần nhất để làm rõ chủ thể | Đạt với trường hợp phổ biến |
| TC-11 | Lưu đoạn trả lời vào kho cá nhân | Nội dung xuất hiện trong kho riêng của tài khoản | Đạt |
| TC-12 | Tài khoản khác truy cập kho cá nhân | Không nhìn thấy dữ liệu riêng của người khác | Đạt |
| TC-13 | Điểm danh hai lần trong cùng ngày | Chỉ cộng token ở lần đầu | Đạt |
| TC-14 | Trả lời lại một câu Q&A đã làm trong ngày | Không cấp thưởng trùng | Đạt |
| TC-15 | Thanh toán đúng mã, đúng tiền | Hóa đơn hoàn tất, token được cộng và ghi lịch sử | Đạt |
| TC-16 | Thanh toán sai số tiền | Không tự cộng token, cần xử lý thủ công | Đạt |
| TC-17 | Dùng lại mã giao dịch đã xử lý | Không cộng token lần hai | Đạt |
| TC-18 | Gửi báo cáo sự cố thanh toán | Báo cáo được lưu và quản trị viên thấy trong màn hình xử lý | Đạt |
| TC-19 | Phê duyệt tri thức đang chờ | Nội dung chuyển sang trạng thái đã duyệt và có thể đưa vào kho tìm kiếm | Đạt |
| TC-20 | Xóa tri thức đã duyệt | Nội dung bị loại khỏi danh sách và kho được làm mới | Đạt |
| TC-21 | Hỗ trợ khi quản trị viên trực tuyến | Người dùng có thể trao đổi trực tiếp | Đạt |
| TC-22 | Hỗ trợ khi quản trị viên ngoại tuyến | Trợ lý hỗ trợ trả lời theo nội dung hướng dẫn sản phẩm | Đạt |
| TC-23 | Chuyển giao diện sang tiếng Anh | Nhãn giao diện và một số nội dung hỗ trợ đổi ngôn ngữ | Đạt |
| TC-24 | Mở giao diện trên màn hình điện thoại | Bố cục thu gọn, các chức năng chính vẫn thao tác được | Đạt |
| TC-25 | Mở trò chơi lịch sử | Trò chơi tải được, có màn hình bắt đầu và trạng thái chơi | Đạt |

**Bảng 4.9. Đối chiếu chức năng với minh chứng giao diện**

| Nhóm chức năng | Hình minh chứng trong báo cáo | Nội dung cần nhấn mạnh khi thuyết minh |
|---|---|---|
| Trang giới thiệu | Hình 4.1 | Sản phẩm có trang công khai, trình bày chức năng, phạm vi và lời kêu gọi sử dụng |
| Đăng nhập và tài khoản | Hình 4.1, Hình 4.7a, Hình 4.7b | Có luồng tài khoản người dùng và công cụ quản trị tài khoản |
| Hỏi đáp lịch sử | Hình 4.2, Hình 4.2a | Câu trả lời có nguồn, có cửa sổ xem chi tiết nguồn và có thao tác phản hồi |
| Lịch sử hội thoại | Hình 4.3 | Người dùng có thể quay lại, quản lý và tiếp tục các cuộc trò chuyện cũ |
| Giao diện di động | Hình 4.3a | Bố cục thích ứng với màn hình nhỏ và hỗ trợ đóng gói ứng dụng |
| Kho tri thức cá nhân | Hình 4.4, Hình 4.4a | Người dùng có thể lưu ghi chú riêng và dùng lại trong quá trình hỏi đáp |
| Luyện tập Q&A | Hình 4.5, Hình 4.5a | Hệ thống có câu hỏi hằng ngày, giải thích đáp án và bảng xếp hạng |
| Thanh toán token | Hình 4.6, Hình 4.6a, Hình 4.6b | Có gói nạp, hóa đơn VietQR, báo cáo sự cố và đối soát giao dịch |
| Bảng quản trị | Hình 4.7 đến Hình 4.7m | Quản trị viên theo dõi người dùng, giao dịch, chat, phản hồi và cấu hình |
| Kiểm duyệt tri thức | Hình 4.8 | Nội dung tự học có trạng thái chờ, không đi thẳng vào kho chính |
| Hỗ trợ người dùng | Hình 4.9, Hình 4.9a | Có kênh hỗ trợ giữa người dùng, trợ lý và quản trị viên |
| Trò chơi lịch sử | Hình 4.10, Hình 4.10a | Sản phẩm có thành phần học tập tương tác ngoài chatbot |
| Đánh giá định lượng | Hình 4.11 đến Hình 4.14 | Kết quả RAGAS được trình bày bằng biểu đồ và bảng số liệu |

## 4.34. Đánh giá an toàn

Hệ thống đã thực hiện một số biện pháp cơ bản như bảo vệ mật khẩu, xác thực yêu cầu, phân quyền quản trị, tách dữ liệu cá nhân và chống cộng token trùng. Nội dung web có vùng chờ, còn ảnh tải lên có giới hạn.

Tuy nhiên, quá trình rà soát phát hiện một script thử nghiệm có chứa khóa truy cập dịch vụ thanh toán được viết trực tiếp. Khóa này cần được thu hồi và thay mới. Tệp phải được loại khỏi kho công khai, còn thông tin bí mật phải chuyển sang cấu hình môi trường. Đây là vấn đề có mức ưu tiên rất cao.

Máy chủ hiện cho phép yêu cầu từ mọi nguồn web để thuận tiện phát triển. Khi triển khai chính thức, phải giới hạn đúng tên miền của sản phẩm. Chức năng xem và tải tệp cần kiểm tra đường dẫn tuyệt đối để ngăn người dùng yêu cầu tệp ngoài vùng cho phép.

Dữ liệu web và ghi chú cá nhân có thể chứa câu lệnh gây ảnh hưởng đến mô hình. Hệ thống cần tách rõ nội dung tham khảo với chỉ dẫn, lọc các câu có tính điều khiển và nhắc mô hình không làm theo lệnh nằm trong tài liệu.

## 4.35. Đánh giá khả năng mở rộng

Với 21 tài khoản và hơn hai nghìn tin nhắn, hệ thống hoạt động phù hợp trong môi trường thử nghiệm. Kho tri thức lớn vẫn có thể được tải và tìm kiếm. Tuy nhiên, khi số người dùng tăng, cơ sở dữ liệu một tệp có thể trở thành điểm nghẽn.

Các công việc tìm kiếm web, gửi thư và xây dựng lại kho cá nhân có thể mất thời gian. Ở quy mô lớn, chúng nên được chuyển sang hàng đợi nền. Bộ nhớ câu hỏi nên dùng một dịch vụ lưu trữ nhanh và chia sẻ giữa nhiều máy chủ.

Tệp tải lên và ảnh giao diện nên được lưu ở dịch vụ lưu trữ đối tượng thay vì cùng máy chủ. Nhật ký cần được tập trung để theo dõi lỗi.

## 4.36. Đánh giá trải nghiệm người dùng

Streaming giúp giảm cảm giác chờ nhưng không giải quyết hoàn toàn độ trễ. Nếu câu trả lời bắt đầu xuất hiện sớm, người dùng có thể chấp nhận tổng thời gian dài hơn. Ngược lại, nếu hệ thống thực hiện nhiều bước trước khi gửi ký tự đầu tiên, trải nghiệm vẫn chậm.

Giao diện có nhiều chức năng, tạo giá trị nhưng cũng có nguy cơ làm người dùng mới bối rối. Trang giới thiệu và menu cần ưu tiên ba hành động chính: hỏi đáp, lịch sử và học tập. Các chức năng nâng cao như kho cá nhân và báo cáo thanh toán cần có hướng dẫn ngắn.

Hệ thống sử dụng một số tên gọi mang phong cách cổ trang trong bảng xếp hạng và quản trị. Cách này tạo bản sắc nhưng phải cân bằng với tính rõ ràng. Người dùng cần hiểu ngay chức năng, không chỉ thấy tên trang trí.

## 4.37. Mức độ đáp ứng đề cương

Đề cương yêu cầu nghiên cứu cơ sở lý thuyết, xây dựng kho tri thức, thiết kế kiến trúc, xây dựng pipeline hỏi đáp, kiểm soát và mở rộng tri thức, phát triển web/mobile, quản trị và đánh giá. Các nội dung này đều có sản phẩm tương ứng.

Kho tri thức đã được tạo với số lượng đoạn lớn. Pipeline hỏi đáp có phân loại, truy xuất, sắp xếp và kiểm tra. Web learning và khu vực chờ đáp ứng yêu cầu mở rộng có kiểm soát. Giao diện web, ứng dụng Android và bảng quản trị đã được xây dựng. Bộ 100 câu và biểu đồ đáp ứng phần đánh giá.

Một số mục còn ở mức demo. Việc triển khai quy mô lớn, công bố chính thức, kiểm thử bảo mật độc lập và đánh giá người học chưa hoàn thành. Báo cáo phân biệt rõ giữa sản phẩm đã có và hướng phát triển.

## 4.38. Nhận xét chung về kết quả

Kết quả cho thấy đề tài đã vượt khỏi phạm vi một chatbot mẫu. Hệ thống có đủ thành phần để trình diễn một quá trình sử dụng hoàn chỉnh, từ đăng nhập đến hỏi đáp, học tập, thanh toán và hỗ trợ. Phần quản trị cho phép kiểm soát hoạt động và tri thức.

Về nghiên cứu, phương pháp thích nghi tạo ra cải thiện rõ rệt về mức độ trả lời đúng trọng tâm so với truy xuất tĩnh. Độ chính xác ngữ cảnh cũng cải thiện nhẹ. Đây là bằng chứng cho thấy việc hiểu loại câu hỏi trước khi tìm kiếm có giá trị.

Mặt khác, kết quả chưa đủ để khẳng định hệ thống tốt hơn toàn diện. Mức độ bám nguồn và bao phủ thấp hơn hệ thống tĩnh, thời gian chờ cao và điểm câu khó không ổn định. Những hạn chế này là cơ sở trực tiếp cho hướng phát triển ở Chương 5.

# CHƯƠNG 5. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

## 5.1. Tổng kết quá trình thực hiện

Đề tài được thực hiện với mục tiêu xây dựng một hệ thống chatbot hỗ trợ hỏi đáp về Lịch sử Việt Nam bằng trí tuệ nhân tạo. Trong quá trình triển khai, nhóm nhận thấy để tạo ra một sản phẩm có giá trị, không thể chỉ tập trung vào khả năng sinh văn bản. Câu trả lời cần có căn cứ, dữ liệu cần được tổ chức, người dùng cần có lịch sử, người quản trị cần có công cụ kiểm soát và tri thức mới cần được xem xét trước khi đưa vào sử dụng lâu dài.

Từ nhận định đó, nhóm đã xây dựng hệ thống theo hướng kết hợp giữa mô hình ngôn ngữ lớn và kho tài liệu lịch sử. Câu hỏi được xử lý qua nhiều bước gồm chuẩn hóa, xác định ngôn ngữ, làm rõ ngữ cảnh, phân loại mục đích, nhận diện nhân vật và thời gian, tìm kiếm nhiều nguồn, sắp xếp lại tài liệu, kiểm tra và tạo câu trả lời.

Phương pháp TALRAG được hình thành để giải quyết hạn chế của cách truy xuất giống nhau cho mọi câu hỏi. Hệ thống thay đổi mức ưu tiên của yếu tố ngữ nghĩa, thời gian và nguyên nhân. Thực thể lịch sử được dùng để giảm nhầm lẫn. Câu hỏi so sánh được giữ nhiều tài liệu hơn. Khi dữ liệu không đủ, hệ thống có thể tìm nguồn trực tuyến và đưa nội dung vào vòng kiểm duyệt.

Bên cạnh phần trí tuệ nhân tạo, nhóm đã xây dựng các thành phần cần thiết của một nền tảng. Người dùng có thể đăng ký, đăng nhập, quản lý hồ sơ, tạo nhiều cuộc hội thoại, xem nguồn, đánh giá, lưu ghi chú, luyện tập, điểm danh, nạp token và nhận hỗ trợ. Người quản trị có thể theo dõi hoạt động, quản lý tài khoản, giao dịch, phản hồi, tri thức và nội dung giao diện.

Sản phẩm có giao diện web thích ứng, có thể đóng gói Android và có một trò chơi lịch sử. Hệ thống lưu lại dữ liệu vận hành, tạo biểu đồ quản trị và tổng hợp báo cáo. Bộ câu hỏi 100 câu cùng kết quả đánh giá giúp nhóm có cơ sở định lượng thay vì chỉ dựa vào một số ví dụ.

## 5.2. Kết quả đạt được về mặt nghiên cứu

Kết quả nghiên cứu quan trọng nhất là việc hiện thực hóa được một cơ chế truy xuất thích nghi cho miền Lịch sử Việt Nam. Phương pháp không dừng ở ý tưởng mà đã được kết nối với kho tri thức, giao diện và quy trình tạo câu trả lời.

Kết quả thực nghiệm cho thấy mức độ liên quan của câu trả lời tăng rõ rệt so với hệ thống truy xuất tĩnh. Mức tăng 186,9% là dấu hiệu cho thấy việc phân loại câu hỏi và lựa chọn tài liệu theo mục đích có giá trị. Độ chính xác ngữ cảnh cũng cải thiện nhẹ ở mức tổng thể và cải thiện rõ ở nhóm câu khó.

Đề tài còn xây dựng được cơ chế mở rộng tri thức có kiểm soát. Nội dung từ Internet không trở thành tri thức chính thức ngay lập tức. Việc lưu chờ, nhận phản hồi và phê duyệt tạo ra một quy trình minh bạch hơn so với cách tự động thu thập không kiểm soát.

Kho tri thức cá nhân là một đóng góp thực tiễn. Nó cho phép hệ thống thích ứng với ghi chú của từng người mà không làm thay đổi dữ liệu dùng chung. Thiết kế này phù hợp với môi trường học tập, nơi mỗi người có cách ghi nhớ và mục tiêu khác nhau.

## 5.3. Kết quả đạt được về mặt sản phẩm

Sản phẩm đã có các luồng sử dụng hoàn chỉnh. Một người dùng mới có thể vào trang giới thiệu, tạo tài khoản, đăng nhập, đặt câu hỏi, tiếp tục hội thoại, xem nguồn, lưu ghi chú, tham gia luyện tập và nạp token. Khi gặp vấn đề, họ có thể gửi báo cáo hoặc liên hệ hỗ trợ.

Người quản trị có thể quản lý hoạt động mà không cần thao tác trực tiếp với cơ sở dữ liệu. Các thông tin về người dùng, thanh toán, câu hỏi, phản hồi và tri thức được trình bày trên giao diện. Nội dung công khai và cấu hình trí tuệ nhân tạo cũng có thể thay đổi.

Tại thời điểm nghiệm thu, cơ sở dữ liệu đã có hàng trăm cuộc hội thoại và hơn hai nghìn tin nhắn. Điều này cho thấy sản phẩm đã được chạy trong quá trình phát triển chứ không chỉ tồn tại ở dạng giao diện tĩnh. Kho tri thức chứa hơn một trăm nghìn đoạn cho mỗi cấu hình chính, đủ để thử nghiệm tìm kiếm ở quy mô đáng kể.

Giao diện web và trò chơi đều biên dịch thành công. Phần máy chủ và trí tuệ nhân tạo không có lỗi cú pháp trong lần kiểm tra. Các phép thử thuật toán cơ bản cho kết quả đúng quy tắc.

## 5.4. Mức độ hoàn thành so với mục tiêu

**Bảng 5.1. Mức độ hoàn thành sản phẩm**

| Nội dung theo mục tiêu | Kết quả | Đánh giá |
|---|---|---|
| Hệ thống hỏi đáp Lịch sử Việt Nam | Có sản phẩm hoạt động | Hoàn thành |
| Kho tài liệu được xử lý và tìm kiếm theo ý nghĩa | Có hai cấu hình kho chính | Hoàn thành |
| Nhận diện thời gian, nguyên nhân và câu so sánh | Đã tích hợp vào quá trình truy xuất | Hoàn thành |
| Hiển thị nguồn và lưu lịch sử | Có trong giao diện và dữ liệu | Hoàn thành |
| Xử lý thiếu dữ liệu | Có thông báo và tìm kiếm bổ sung | Hoàn thành |
| Kiểm duyệt tri thức mới | Có vùng chờ và phê duyệt | Hoàn thành |
| Kho ghi chú cá nhân | Có lưu, sửa, xóa và tìm lại | Hoàn thành |
| Giao diện web và thiết bị di động | Có web và bản Android | Hoàn thành ở mức demo |
| Quản trị hệ thống | Có đầy đủ nhóm quản lý chính | Hoàn thành |
| Đánh giá định lượng | Có bộ 100 câu và biểu đồ | Hoàn thành |
| Tối ưu tốc độ | Thời gian còn cao | Chưa hoàn thiện |
| Kiểm thử bảo mật và tải lớn | Chưa có đánh giá độc lập | Chưa hoàn thiện |

Căn cứ vào bảng trên, các mục tiêu cốt lõi trong đề cương đã có kết quả tương ứng. Những nội dung chưa hoàn thiện chủ yếu thuộc giai đoạn nâng cấp từ sản phẩm nghiên cứu thành hệ thống triển khai quy mô lớn.

## 5.5. Những hạn chế của hệ thống

Hạn chế đầu tiên là chất lượng câu trả lời chưa đồng đều. TALRAG trả lời đúng trọng tâm hơn hệ thống tĩnh, nhưng mức độ bám sát tài liệu và độ bao phủ còn thấp. Đặc biệt, câu hỏi trung bình và khó cần nhiều mảnh bằng chứng, trong khi bộ lọc hiện có xu hướng giữ ít tài liệu.

Hạn chế thứ hai là thời gian xử lý. Trung bình gần 25 giây là dài đối với một ứng dụng trò chuyện. Streaming giúp người dùng thấy nội dung dần, nhưng nếu ký tự đầu tiên xuất hiện chậm thì trải nghiệm vẫn chưa tốt.

Hạn chế thứ ba là việc đánh giá phụ thuộc vào mô hình chấm điểm. Kết quả RAGAS có thể thay đổi khi dùng mô hình hoặc phiên bản khác. Đáp án tham chiếu cũng ảnh hưởng mạnh đến độ bao phủ. Vì vậy, điểm số cần được xem là chỉ báo chứ không phải kết luận tuyệt đối.

Hạn chế thứ tư là bộ câu hỏi chưa cân bằng hoàn toàn theo triều đại và chủ đề. Một số nhóm có nhiều câu hơn, còn nội dung lịch sử hiện đại, văn hóa và lịch sử địa phương chưa được đánh giá đầy đủ.

Hạn chế thứ năm là dữ liệu nguồn chưa có thông tin thư mục chuẩn hóa cho mọi tài liệu. Một số nguồn chỉ có tên tệp và trang. Để dùng trong báo cáo học thuật, cần bổ sung tác giả, nhà xuất bản, năm và loại tài liệu.

Hạn chế thứ sáu là cơ sở dữ liệu phù hợp với demo nhưng chưa phù hợp với lượng truy cập lớn. Hệ thống chưa có cơ chế di chuyển cấu trúc dữ liệu chuyên nghiệp, sao lưu tự động và phục hồi sau sự cố.

Hạn chế thứ bảy là kiểm thử tự động còn ít. Những script hiện có chủ yếu kiểm tra phân loại, điểm thời gian, nguyên nhân và bộ nhớ câu hỏi. Các luồng OAuth, thanh toán, streaming, phân quyền, giao diện và mobile chưa có bộ kiểm thử đầy đủ.

Hạn chế thứ tám liên quan đến an toàn. Một khóa dịch vụ từng xuất hiện trong script thử nghiệm, cấu hình cho phép truy cập từ mọi miền còn rộng và chức năng tệp cần được gia cố. Những vấn đề này phải được xử lý trước khi công khai sản phẩm.

Hạn chế cuối cùng là nội dung trò chơi có sự kết hợp giữa lịch sử và hư cấu. Nếu không gắn nhãn rõ, người chơi có thể nhầm tình tiết gameplay với sự kiện thật.

## 5.6. Hướng cải thiện quá trình truy xuất

Hướng đầu tiên là kết hợp tìm kiếm theo từ khóa với tìm kiếm theo ý nghĩa. Từ khóa có lợi thế với tên riêng, niên hiệu và mốc năm, trong khi tìm kiếm ngữ nghĩa có lợi thế với cách diễn đạt khác nhau. Kết hợp hai cách có thể tăng độ bao phủ mà không làm mất tính chính xác.

Hướng thứ hai là tách câu hỏi phức tạp thành các câu nhỏ. Ví dụ, câu hỏi so sánh hai triều đại có thể tách thành tổ chức nhà nước của từng triều, chính sách quân sự của từng triều và điểm giống/khác. Hệ thống tìm tài liệu cho từng phần rồi tổng hợp.

Hướng thứ ba là thay đổi số lượng tài liệu và độ chặt của bộ lọc theo độ khó. Câu dễ dùng ít tài liệu và trả lời nhanh. Câu khó cần lấy rộng hơn, giữ bằng chứng cho từng ý và chỉ loại những đoạn rõ ràng không liên quan.

Hướng thứ tư là bổ sung một mô hình xếp hạng được huấn luyện hoặc điều chỉnh bằng chính dữ liệu câu hỏi lịch sử. Mô hình này có thể học từ các cặp câu hỏi - tài liệu đã được đánh dấu phù hợp.

Hướng thứ năm là xây dựng đồ thị tri thức. Nhân vật, sự kiện, địa điểm, triều đại và thời gian được biểu diễn thành nút và quan hệ. Đồ thị giúp trả lời câu hỏi về mối liên hệ, chuỗi sự kiện và so sánh tốt hơn.

## 5.7. Hướng cải thiện câu trả lời

Câu trả lời cần gắn nguồn ở cấp ý. Thay vì đặt một danh sách nguồn ở cuối, mỗi mệnh đề quan trọng có thể mang ký hiệu nguồn. Điều này giúp người dùng biết chính xác phần nào dựa trên tài liệu nào.

Sau khi sinh, hệ thống có thể tách câu trả lời thành các phát biểu và kiểm tra từng phát biểu với ngữ cảnh. Phát biểu không được hỗ trợ sẽ bị loại, viết lại hoặc đánh dấu là nhận định.

Hệ thống cũng nên phân biệt rõ dữ kiện, diễn giải và giả định. Một câu trả lời về ý nghĩa lịch sử có thể có phần “dữ kiện được tài liệu ghi nhận” và phần “nhận xét tổng hợp”. Cách trình bày này phù hợp với giáo dục hơn việc trộn tất cả thành một đoạn.

Độ dài câu trả lời nên thay đổi theo yêu cầu. Người dùng có thể chọn trả lời ngắn, giải thích chi tiết hoặc dạng ôn tập. Câu hỏi đơn giản không cần một bài luận dài.

## 5.8. Hướng cải thiện tốc độ

Các kho tri thức và mô hình cần được tải một lần khi khởi động. Kết quả phân loại, dịch và câu hỏi phổ biến có thể được lưu. Những tác vụ không cần thiết cho phần đầu của câu trả lời nên chạy sau.

Hệ thống có thể đo thời gian của từng bước để xác định điểm nghẽn. Nếu phần kiểm tra tài liệu chiếm nhiều thời gian, chỉ dùng mô hình cho trường hợp điểm không rõ. Nếu dịch nguồn chậm, có thể gửi câu trả lời trước và cập nhật nguồn sau.

Tìm kiếm web nên luôn chạy ở nền. Người dùng nhận thông báo rằng hệ thống đang bổ sung dữ liệu và có thể tiếp tục sử dụng chức năng khác. Khi hoàn tất, kết quả xuất hiện trong hội thoại.

Giao diện và trò chơi cần được chia thành các gói tải theo nhu cầu. Người dùng vào trang chat không cần tải toàn bộ chương trình trò chơi và quản trị.

## 5.9. Hướng cải thiện dữ liệu và kiểm duyệt

Mỗi tài liệu cần có hồ sơ nguồn đầy đủ. Những trường như tên tài liệu, tác giả, năm, nhà xuất bản, cơ quan, đường dẫn và ngày truy cập nên được chuẩn hóa. Khi hiển thị, người dùng có thể trích dẫn đúng.

Tri thức mới cần lưu người duyệt, thời điểm, lý do và phiên bản. Nếu phát hiện sai, người quản trị có thể quay lại phiên bản trước. Nội dung nhạy cảm hoặc có nhiều cách giải thích nên yêu cầu hơn một người duyệt.

Hệ thống cần phát hiện mâu thuẫn giữa nội dung mới và dữ liệu hiện có. Thay vì tự chọn một bên, nó có thể đưa ra cảnh báo và yêu cầu người quản trị xem xét.

Danh sách nguồn trực tuyến tin cậy nên được quản lý theo cấp độ. Nguồn cơ quan nhà nước, bảo tàng và công trình học thuật có thể được ưu tiên, nhưng vẫn cần đánh giá nội dung cụ thể.

## 5.10. Hướng cải thiện chức năng học tập

Ngân hàng câu hỏi cần được mở rộng theo thời kỳ và chương trình học. Giáo viên có thể tạo bộ câu hỏi cho lớp, đặt thời hạn và xem kết quả. Mỗi câu nên gắn với bài đọc hoặc nguồn giải thích.

Kho ghi chú cá nhân có thể phát triển thành thẻ ghi nhớ. Hệ thống nhắc lại nội dung theo khoảng thời gian, dựa trên kết quả trả lời để chọn câu cần ôn.

Một dòng thời gian tương tác giúp người dùng xem các sự kiện theo năm. Bản đồ lịch sử có thể hiển thị địa điểm, thay đổi lãnh thổ và đường tiến quân. Hình ảnh hiện vật và tài liệu quét tạo trải nghiệm phong phú hơn.

Đối với trò chơi, mỗi màn nên có phần “lịch sử và hư cấu” để phân biệt. Sau khi hoàn thành, người chơi có thể đọc nguồn về sự kiện thật.

## 5.11. Hướng cải thiện hạ tầng và an toàn

Cơ sở dữ liệu nên chuyển sang một hệ quản trị có khả năng xử lý nhiều người dùng, giao dịch và sao lưu. Việc thay đổi cấu trúc cần có công cụ quản lý phiên bản để triển khai an toàn.

Thông tin bí mật phải được lưu trong môi trường bảo mật và thay đổi định kỳ. Khóa đã từng xuất hiện trong script cần được thu hồi. Lịch sử phiên bản phải được kiểm tra để bảo đảm khóa không còn.

Chính sách truy cập giữa các miền cần giới hạn. Tệp tải lên cần kiểm tra loại thực, quét nội dung và lưu bằng tên ngẫu nhiên. Mọi đường dẫn phải được chuẩn hóa trước khi đọc.

Hệ thống cần bổ sung giới hạn tần suất, theo dõi đăng nhập bất thường, nhật ký quản trị và cảnh báo. Nội dung đưa vào mô hình phải được xem là dữ liệu, không phải chỉ dẫn, để giảm nguy cơ tấn công qua tài liệu.

## 5.12. Hướng cải thiện đánh giá

Bộ 100 câu nên được thẩm định bởi giảng viên hoặc chuyên gia lịch sử. Mỗi đáp án cần có nguồn. Những câu có nhiều cách diễn giải cần quy định tiêu chí chấm thay vì một câu trả lời duy nhất.

Thực nghiệm loại bỏ từng thành phần sẽ giúp xác định đóng góp. Có thể chạy phiên bản không có điểm thời gian, không có điểm nguyên nhân, không có thực thể và không có bộ lọc. So sánh này cho biết phần nào thực sự cải thiện kết quả.

Ngoài điểm tự động, cần đánh giá người dùng. Người tham gia có thể chấm mức dễ hiểu, hữu ích, tin cậy và khả năng tìm nguồn. Giáo viên đánh giá tính chính xác, còn học sinh đánh giá trải nghiệm.

Kiểm thử tải cần đo số người dùng đồng thời, thời gian trung bình và tỷ lệ lỗi. Kiểm thử an toàn cần do một nhóm độc lập thực hiện trước khi triển khai công khai.

## 5.13. Kiến nghị nghiệm thu

Qua quá trình đối chiếu đề cương, mã nguồn, dữ liệu và kết quả thực nghiệm, nhóm nhận thấy đề tài đã hoàn thành các mục tiêu cốt lõi ở mức sản phẩm nghiên cứu và trình diễn. Hệ thống có khả năng hỏi đáp, truy xuất tài liệu, hiển thị nguồn, duy trì hội thoại, cá nhân hóa và mở rộng tri thức có kiểm soát.

Các chức năng hỗ trợ vận hành như tài khoản, lịch sử, thanh toán, luyện tập, hỗ trợ, quản trị và mobile đã được xây dựng. Sản phẩm có dữ liệu sử dụng thực tế và có bộ đánh giá định lượng.

Những hạn chế về độ bao phủ, tốc độ, kiểm thử và an toàn không làm mất đi kết quả đã đạt, nhưng là điều kiện cần xử lý trước khi triển khai quy mô lớn. Nhóm đề nghị Hội đồng nghiệm thu công nhận sản phẩm hoàn thành theo mục tiêu nghiên cứu, đồng thời cho phép tiếp tục phát triển theo các hướng đã trình bày.

## 5.14. Kết luận chung

Đề tài cho thấy việc ứng dụng trí tuệ nhân tạo vào giáo dục lịch sử cần được tiếp cận một cách có kiểm soát. Mô hình ngôn ngữ mang lại khả năng giao tiếp tự nhiên, nhưng tài liệu, truy xuất, nguồn và vai trò của con người mới là những thành phần giúp hệ thống trở nên đáng tin cậy hơn.

TALRAG đã chứng minh khả năng cải thiện mức độ trả lời đúng trọng tâm so với truy xuất tĩnh. Đồng thời, kết quả cũng chỉ ra rằng một quy trình phức tạp không tự động tốt hơn ở mọi mặt. Việc lọc chặt làm giảm độ bao phủ, còn nhiều bước xử lý làm tăng thời gian. Nhận diện được sự đánh đổi này là một kết quả quan trọng của nghiên cứu.

Sản phẩm hiện tại tạo nền tảng cho một hệ thống học tập lịch sử có khả năng phát triển lâu dài. Nếu tiếp tục chuẩn hóa dữ liệu, nâng cao kiểm chứng, tối ưu tốc độ và mở rộng đánh giá, hệ thống có thể trở thành công cụ hỗ trợ hữu ích cho học sinh, sinh viên, giáo viên và những người quan tâm đến Lịch sử Việt Nam.

# TÀI LIỆU THAM KHẢO

[1] P. Lewis và cộng sự, “Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks”, Advances in Neural Information Processing Systems, tập 33, trang 9459-9474, 2020.

[2] V. Karpukhin và cộng sự, “Dense Passage Retrieval for Open-Domain Question Answering”, Proceedings of the 2020 Conference on Empirical Methods in Natural Language Processing, 2020.

[3] J. Johnson, M. Douze và H. Jégou, “Billion-scale Similarity Search with GPUs”, IEEE Transactions on Big Data, tập 7, số 3, trang 535-547, 2019.

[4] N. Reimers và I. Gurevych, “Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks”, Proceedings of EMNLP-IJCNLP, 2019.

[5] Y. Gao và cộng sự, “Retrieval-Augmented Generation for Large Language Models: A Survey”, arXiv:2312.10997, 2024.

[6] A. Asai và cộng sự, “Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection”, International Conference on Learning Representations, 2024.

[7] S. Q. Yan, J. C. Gu, Y. Z. Zhu và Z. H. Ling, “Corrective Retrieval Augmented Generation”, arXiv:2401.15884, 2024.

[8] B. Dhingra và cộng sự, “Time-Aware Language Models as Temporal Knowledge Bases”, Transactions of the Association for Computational Linguistics, tập 10, trang 257-273, 2022.

[9] D. Edge và cộng sự, “From Local to Global: A GraphRAG Approach to Query-Focused Summarization”, arXiv:2404.16130, 2024.

[10] A. Vaswani và cộng sự, “Attention Is All You Need”, Advances in Neural Information Processing Systems, 2017.

[11] J. Devlin, M. W. Chang, K. Lee và K. Toutanova, “BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding”, Proceedings of NAACL-HLT, trang 4171-4186, 2019.

[12] Z. Ji và cộng sự, “Survey of Hallucination in Natural Language Generation”, ACM Computing Surveys, tập 55, số 12, trang 1-38, 2023.

[13] R. Nogueira và K. Cho, “Passage Re-ranking with BERT”, arXiv:1901.04085, 2019.

[14] N. Thakur và cộng sự, “BEIR: A Heterogeneous Benchmark for Zero-shot Evaluation of Information Retrieval Models”, NeurIPS Datasets and Benchmarks, 2021.

[15] E. Riloff và J. Thelen, “A Rule-based Question Answering System for Reading Comprehension Tests”, ANLP/NAACL Workshop, trang 13-21, 2000.

[16] D. Q. Nguyen và A. T. Nguyen, “PhoNLP: A Joint Multi-task Learning Model for Vietnamese Natural Language Processing”, arXiv:2011.01544, 2020.

[17] L. Ouyang và cộng sự, “Training Language Models to Follow Instructions with Human Feedback”, Advances in Neural Information Processing Systems, 2022.

[18] OpenAI, “GPT-4 Technical Report”, arXiv:2303.08774, 2023.

[19] A. D. Himu, M. S. Azad, R. Rahman và M. R. Hasan, “ItihashQA: A Conversational Question Answering System Applied in Bangladeshi Historical Context”, 2024.

[20] Google, “NotebookLM”, tài liệu giới thiệu sản phẩm.

[21] Google, “Gemini Gems”, tài liệu giới thiệu sản phẩm.

[22] A. K. NgoHo, A. K. NgoHo và K. D. Vo, “GVEC: A Vietnamese Large Language Models Chatbot for Economy”, MAPR 2024, Hà Nội, 2024.

[23] A. K. NgoHo, K. D. Vo và A. K. NgoHo, “VQABG: Vietnamese Question/Answers Benchmark Generator for Field-Specific Chatbot Ground-Truth Dataset”, CTU Journal of Innovation and Sustainable Development, tập 16, trang 80-90, 2024.

[24] Thủ tướng Chính phủ, Quyết định số 749/QĐ-TTg ngày 03 tháng 06 năm 2020 về Chương trình Chuyển đổi số quốc gia đến năm 2025, định hướng đến năm 2030.

[25] Thủ tướng Chính phủ, Quyết định số 131/QĐ-TTg ngày 25 tháng 01 năm 2022 về tăng cường ứng dụng công nghệ thông tin và chuyển đổi số trong giáo dục và đào tạo.

# PHỤ LỤC A. PHÂN CÔNG NHIỆM VỤ

Nguyễn Quốc Đạt giữ vai trò chủ nhiệm, chịu trách nhiệm định hướng nghiên cứu, thiết kế kiến trúc tổng thể, tích hợp phương pháp trí tuệ nhân tạo, điều phối công việc và hoàn thiện báo cáo. Nguyễn Khoa Lam phụ trách phần máy chủ, kết nối giao diện, xác thực, hội thoại và dữ liệu vận hành. Hà Hoàng Phúc phụ trách thu thập, xử lý, phân loại tài liệu và xây dựng kho tri thức. Lê Trí Khanh phụ trách giao diện web, trải nghiệm trên thiết bị di động, màn hình chat, hồ sơ và quản trị. Phan Văn Thọ phụ trách xây dựng tình huống kiểm thử, đánh giá câu trả lời, ghi nhận lỗi và đề xuất cải tiến.

Phân công trên được kế thừa từ đề cương. Trong quá trình thực hiện, các thành viên có phối hợp chéo vì nhiều chức năng liên quan đến cả giao diện, máy chủ và dữ liệu.

# PHỤ LỤC B. TIẾN ĐỘ THỰC HIỆN

Giai đoạn tháng 03 đến tháng 04 năm 2026 tập trung vào tổng quan, khảo sát công nghệ, xác định yêu cầu và thiết kế ban đầu. Giai đoạn tháng 04 đến tháng 06 tập trung xây dựng sản phẩm, kho tri thức, quy trình hỏi đáp và thực nghiệm. Từ tháng 06 đến tháng 07, nhóm tổng hợp kết quả, viết báo cáo và hoàn thiện giao diện. Giai đoạn tháng 07 đến tháng 08 theo kế hoạch dành cho hoàn thiện bài báo, đăng ký dự giải và phát triển sản phẩm.

Tại thời điểm ngày 13 tháng 06 năm 2026, sản phẩm, bộ đánh giá 100 câu, biểu đồ và báo cáo nội dung đã được hình thành. Những hoạt động công bố và hoàn thiện sau nghiệm thu tiếp tục thực hiện theo kế hoạch.

# PHỤ LỤC C. KINH PHÍ

Dự toán kinh phí theo đề cương là 10.000.000 đồng. Mã nguồn và hai tài liệu được cung cấp không chứa bảng quyết toán hoặc chứng từ thực chi. Vì vậy, báo cáo không tự đưa ra số liệu tài chính chưa được xác nhận.

Khi hoàn thiện bản Word chính thức, chủ nhiệm đề tài cần bổ sung bảng thực chi theo các nhóm như chi phí sử dụng mô hình và dịch vụ, hạ tầng triển khai, tài liệu, thiết bị kiểm thử, in ấn và công bố. Tổng số phải được đối chiếu với chứng từ và xác nhận của đơn vị quản lý.

# PHỤ LỤC D. KỊCH BẢN TRÌNH DIỄN NGHIỆM THU

Phần trình diễn nên bắt đầu ở trang giới thiệu để nêu mục tiêu và phạm vi. Sau đó, người thực hiện đăng nhập bằng một tài khoản thường, tạo cuộc hội thoại và đặt câu hỏi dữ kiện về khởi nghĩa Lam Sơn. Khi câu trả lời xuất hiện, mở nguồn để chứng minh khả năng truy xuất.

Tiếp theo, đặt câu hỏi nối tiếp sử dụng đại từ để minh họa khả năng giữ ngữ cảnh. Sau đó đặt một câu hỏi nguyên nhân và một câu hỏi so sánh để giải thích cách hệ thống thay đổi phương pháp tìm kiếm.

Người trình diễn bôi chọn một đoạn, lưu vào kho cá nhân, mở màn hình ghi chú và sửa nội dung. Sau đó hỏi lại vấn đề liên quan để minh họa khả năng cá nhân hóa.

Phần học tập gồm điểm danh, trả lời một câu hỏi và mở bảng xếp hạng. Phần thanh toán chỉ cần tạo mã QR và giải thích quy trình đối soát, không cần thực hiện giao dịch thật trong buổi nghiệm thu.

Sau đó, mở bảng quản trị, trình bày biểu đồ, danh sách phản hồi và khu vực tri thức chờ duyệt. Cuối cùng, trình bày bốn biểu đồ đánh giá, nhấn mạnh mức cải thiện về liên quan câu trả lời và thừa nhận hạn chế về độ bao phủ và thời gian.

# PHỤ LỤC E. HƯỚNG DẪN CHÈN HÌNH VÀ DÀN TRANG

Báo cáo nên sử dụng khổ A4, font Times New Roman cỡ 13, giãn dòng từ 1,3 đến 1,5. Lề trái có thể đặt 3,0 đến 3,5 cm, lề phải 2 cm, lề trên và dưới 2 cm. Mỗi chương bắt đầu ở trang mới.

Tiêu đề chương dùng cỡ 16, in đậm và viết hoa. Tiêu đề mục dùng cỡ 14 hoặc 13 đậm. Hình được đặt giữa trang, chú thích ở dưới. Bảng có tên đặt phía trên. Các hình giao diện nên được chụp cùng một tài khoản thử nghiệm, cùng kích thước cửa sổ và ẩn thông tin nhạy cảm.

Mười hình kiến trúc và biểu đồ đã có trong thư mục hình của báo cáo. Các vị trí đánh dấu “chèn ảnh” cần được thay bằng ảnh chụp từ phiên bản chạy tại ngày nộp. Không nên để đường dẫn tệp hoặc tên thư mục xuất hiện trong bản Word.

Với cỡ chữ và giãn dòng nêu trên, nội dung báo cáo cùng hình, bảng, mục lục, danh mục và phụ lục được thiết kế để nằm trong khoảng 60 đến 90 trang tùy kích thước ảnh và quy định của khoa.
