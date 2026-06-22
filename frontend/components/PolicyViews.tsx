import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  ArrowLeft, Mail, Phone, MapPin, Trash2, HelpCircle, 
  Info, ShieldAlert, ShieldCheck, FileText, Landmark
} from 'lucide-react';
import SecureImage from './SecureImage';
import { API_ROOT } from '../api';

interface PolicyViewsProps {
  page: 'privacy-policy' | 'terms-of-service' | 'data-deletion' | 'support' | 'about';
  siteConfig: any;
  onBack: () => void;
}

export const PolicyViews: React.FC<PolicyViewsProps> = ({ page, siteConfig, onBack }) => {
  const { language, t } = useLanguage();

  const companyName = siteConfig?.landing_footer_company || "CÔNG TY TNHH MTV CÔNG NGHỆ KỸ THUẬT TIÊN PHONG";
  const taxCode = siteConfig?.landing_footer_mst || "1801526082";
  const representative = siteConfig?.landing_footer_representative || "NGÔ HỒ ANH KHÔI";
  const address = siteConfig?.landing_footer_address || "P16, Đường số 8, KDC lô 49, Khu đô thị Nam Cần Thơ, Phường Cái Răng, TP. Cần Thơ";
  const phone = siteConfig?.landing_footer_phone || "0916 416 409";
  const email = siteConfig?.landing_contact_email || "nguyenquocdat888888@gmail.com";
  const siteTitle = siteConfig?.site_title || "Sử Việt AI";

  const logoUrl = siteConfig?.logo_url && (
    siteConfig.logo_url.startsWith("http")
      ? siteConfig.logo_url
      : API_ROOT + siteConfig.logo_url
  );

  const formatPhoneUrl = (p: string) => {
    return `tel:${p.replace(/\s+/g, '')}`;
  };

  const getPageTitle = () => {
    if (language === 'vi') {
      switch (page) {
        case 'privacy-policy': return 'Chính Sách Quyền Riêng Tư (Privacy Policy)';
        case 'terms-of-service': return 'Điều Khoản Sử Dụng (Terms of Service)';
        case 'data-deletion': return 'Chính Sách Xóa Dữ Liệu (Data Deletion Policy)';
        case 'support': return 'Trang Hỗ Trợ & Liên Hệ (Support & Contact)';
        case 'about': return 'Giới Thiệu Về Chúng Tôi (About Us)';
      }
    } else {
      switch (page) {
        case 'privacy-policy': return 'Privacy Policy';
        case 'terms-of-service': return 'Terms of Service';
        case 'data-deletion': return 'Data Deletion Policy';
        case 'support': return 'Support & Contact';
        case 'about': return 'About Us';
      }
    }
  };

  // Render Policy Content
  const renderContent = () => {
    const isVi = language === 'vi';

    switch (page) {
      case 'privacy-policy':
        return isVi ? (
          <div className="space-y-8 text-stone-700 leading-relaxed font-serif text-lg">
            <section className="bg-amber-50/50 p-6 rounded-2xl border border-amber-200/50">
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3 flex items-center gap-2">
                <Info className="text-red-800" size={22} />
                1. Giới thiệu chung
              </h3>
              <p>
                Chào mừng bạn đến với <strong>{siteTitle}</strong>. Chúng tôi vô cùng trân trọng quyền riêng tư của người dùng. Chính sách Quyền riêng tư này giải thích cách chúng tôi thu thập, sử dụng, bảo mật và chia sẻ thông tin cá nhân của bạn khi sử dụng ứng dụng web và di động của chúng tôi.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3">2. Thông tin nhà phát triển & Đơn vị chủ quản</h3>
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3 font-sans text-sm">
                <p><strong>Tên pháp lý:</strong> {companyName}</p>
                <p><strong>Người đại diện:</strong> {representative}</p>
                <p><strong>Mã số thuế:</strong> {taxCode}</p>
                <p><strong>Địa chỉ văn phòng:</strong> {address}</p>
                <p><strong>Hotline:</strong> <a href={formatPhoneUrl(phone)} className="text-red-800 font-semibold hover:underline">{phone}</a></p>
                <p><strong>Email liên hệ:</strong> <a href={`mailto:${email}`} className="text-red-800 font-semibold hover:underline">{email}</a></p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3">3. Dữ liệu chúng tôi thu thập</h3>
              <p className="mb-3">Để cung cấp trải nghiệm tốt nhất và lưu trữ lịch sử cá nhân cho bạn, chúng tôi thu thập một số thông tin sau:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Thông tin tài khoản:</strong> Tên đăng nhập, Địa chỉ Email, và Mật khẩu được mã hóa băm một chiều khi đăng ký qua hệ thống của chúng tôi.</li>
                <li><strong>Thông tin từ nhà cung cấp thứ ba:</strong> Tên, địa chỉ email, ảnh đại diện khi bạn chọn đăng nhập thông qua Google Sign-In hoặc các phương thức OAuth khác.</li>
                <li><strong>Lịch sử hội thoại:</strong> Các câu hỏi và câu trả lời trao đổi giữa bạn và chatbot AI nhằm hiển thị lại lịch sử cuộc chat và hỗ trợ tối ưu hóa thuật toán phản hồi sử liệu.</li>
                <li><strong>Dữ liệu giao dịch nạp tiền:</strong> Lịch sử nạp token, số tiền nạp, mã hóa đơn phục vụ cho việc đối chiếu và nâng cấp tài khoản. Chúng tôi hoàn toàn KHÔNG thu thập và KHÔNG lưu giữ thông tin tài khoản ngân hàng hoặc thẻ tín dụng của bạn.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3">4. Mục đích sử dụng thông tin</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Xác thực danh tính và duy trì trạng thái đăng nhập bảo mật của bạn.</li>
                <li>Cung cấp và duy trì lịch sử hội thoại cá nhân.</li>
                <li>Xử lý và ghi nhận tự động các giao dịch nạp token thông qua hệ thống ngân hàng liên kết.</li>
                <li>Cải thiện và nâng cao độ chính xác của chatbot AI dựa trên các phản hồi ẩn danh từ cộng đồng.</li>
                <li>Hỗ trợ người dùng, giải quyết khiếu nại hoặc sự cố kỹ thuật.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3">5. Chia sẻ thông tin với bên thứ ba</h3>
              <p>
                Chúng tôi cam kết <strong>KHÔNG</strong> bán, trao đổi, cho thuê hoặc chia sẻ dữ liệu cá nhân của bạn cho bất kỳ doanh nghiệp hoặc bên thứ ba nào vì mục đích quảng cáo hoặc thương mại. Dữ liệu chỉ được chia sẻ trong các trường hợp cực kỳ hạn chế sau:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Theo yêu cầu chính thức từ các cơ quan pháp luật có thẩm quyền của Việt Nam phù hợp với quy định của pháp luật.</li>
                <li>Để tích hợp các cổng thanh toán/đối chiếu tự động (như SePay) phục vụ cho việc xác nhận giao dịch của chính bạn.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3">6. Cookies và các công nghệ theo dõi</h3>
              <p>
                Chúng tôi sử dụng <code>LocalStorage</code> trên trình duyệt và các cookie kỹ thuật cần thiết để lưu trữ mã token truy cập (Access Token) và ngôn ngữ bạn đã chọn. Việc này giúp bạn không phải đăng nhập lại mỗi khi mở ứng dụng. Chúng tôi không sử dụng cookies theo dõi quảng cáo liên trang.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3">7. Quyền của người dùng & Xóa dữ liệu</h3>
              <p className="mb-3">Bạn sở hữu toàn bộ dữ liệu của mình và có các quyền sau:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Xem và chỉnh sửa trực tiếp thông tin tài khoản tại trang Hồ sơ.</li>
                <li>Xóa từng cuộc hội thoại hoặc toàn bộ lịch sử trò chuyện trực tiếp tại giao diện chat.</li>
                <li>Yêu cầu xóa tài khoản vĩnh viễn và toàn bộ thông tin liên quan bất cứ lúc nào thông qua chức năng tự xóa trong ứng dụng hoặc gửi email yêu cầu về <a href={`mailto:${email}`} className="text-red-800 hover:underline font-semibold">{email}</a>.</li>
              </ul>
            </section>
          </div>
        ) : (
          <div className="space-y-8 text-stone-700 leading-relaxed font-serif text-lg">
            <section className="bg-amber-50/50 p-6 rounded-2xl border border-amber-200/50">
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3 flex items-center gap-2">
                <Info className="text-red-800" size={22} />
                1. Introduction
              </h3>
              <p>
                Welcome to <strong>{siteTitle}</strong>. We highly value your privacy. This Privacy Policy describes how we collect, use, protect, and share your personal information when you use our web and mobile applications.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3">2. Developer & Company Information</h3>
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3 font-sans text-sm">
                <p><strong>Legal Name:</strong> {companyName}</p>
                <p><strong>Representative:</strong> {representative}</p>
                <p><strong>Tax Code:</strong> {taxCode}</p>
                <p><strong>Office Address:</strong> {address}</p>
                <p><strong>Hotline:</strong> <a href={formatPhoneUrl(phone)} className="text-red-800 font-semibold hover:underline">{phone}</a></p>
                <p><strong>Email:</strong> <a href={`mailto:${email}`} className="text-red-800 font-semibold hover:underline">{email}</a></p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3">3. Data We Collect</h3>
              <p className="mb-3">To provide you with the best experience and to store your personal chat history, we collect the following information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Username, Email, and a one-way hashed password when you sign up directly.</li>
                <li><strong>Third-Party OAuth Data:</strong> Name, email address, and profile picture when you log in via Google Sign-In or other OAuth methods.</li>
                <li><strong>Conversation History:</strong> Queries and responses exchanged with the AI chatbot to store your history and optimize historical RAG model accuracy.</li>
                <li><strong>Transaction Data:</strong> Token deposit logs, amounts paid, and transaction statuses. We <strong>NEVER</strong> collect or store your bank accounts or credit card details.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3">4. How We Use Your Data</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>To authenticate your identity and maintain a secure session.</li>
                <li>To display and store your personal chat history.</li>
                <li>To process and automatically record token deposits through linked banking partners.</li>
                <li>To improve and refine the AI chatbot's historical accuracy using anonymized community feedback.</li>
                <li>To provide technical support and resolve any user issues.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3">5. Data Sharing with Third Parties</h3>
              <p>
                We commit <strong>NEVER</strong> to sell, lease, exchange, or share your personal data with any third-party companies for promotional or advertising purposes. Data is only shared in the following highly restricted situations:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>When formally requested by authorized governmental agencies of Vietnam in compliance with the law.</li>
                <li>To integrate automated payment reconciliation services (such as SePay) to verify your transaction details.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3">6. Cookies & Tracking Technologies</h3>
              <p>
                We use browser <code>LocalStorage</code> and necessary technical cookies to store your secure access tokens and preferred language settings. This prevents you from having to log in repeatedly. We do not use cross-site tracking or advertising cookies.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3">7. User Rights & Data Deletion</h3>
              <p className="mb-3">You own your data and hold the following rights:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>View and edit your personal details directly on the Profile page.</li>
                <li>Delete individual conversations or clear your entire chat history in the chat screen.</li>
                <li>Request permanent account deletion and associated data at any time via the self-deletion feature inside the app, or by emailing us at <a href={`mailto:${email}`} className="text-red-800 hover:underline font-semibold">{email}</a>.</li>
              </ul>
            </section>
          </div>
        );

      case 'terms-of-service':
        return isVi ? (
          <div className="space-y-8 text-stone-700 leading-relaxed font-serif text-lg">
            <section className="bg-amber-50/50 p-6 rounded-2xl border border-amber-200/50">
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3 flex items-center gap-2">
                <FileText className="text-red-800" size={22} />
                1. Chấp nhận các Điều khoản
              </h3>
              <p>
                Bằng việc truy cập, đăng ký tài khoản hoặc sử dụng bất kỳ phần nào của ứng dụng <strong>{siteTitle}</strong>, bạn đồng ý tuân thủ và chịu sự ràng buộc bởi các Điều khoản Sử dụng này. Nếu bạn không đồng ý với bất kỳ phần nào của điều khoản, vui lòng ngừng sử dụng dịch vụ ngay lập tức.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3">2. Quyền và trách nhiệm tài khoản</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Bạn phải tự bảo mật mật khẩu tài khoản cá nhân và tự chịu trách nhiệm về tất cả các hoạt động xảy ra dưới tài khoản của mình.</li>
                <li>Bạn cam kết cung cấp thông tin chính xác (như email đăng ký) để được bảo vệ quyền lợi khi có tranh chấp hoặc sự cố nạp thẻ.</li>
                <li>Chúng tôi có quyền tạm ngừng hoặc khóa vĩnh viễn tài khoản của bạn mà không cần thông báo trước nếu phát hiện hành vi vi phạm nghiêm trọng.</li>
              </ul>
            </section>

            <section className="bg-red-50/50 p-6 rounded-2xl border border-red-200/50">
              <h3 className="text-xl font-bold font-historical text-red-950 mb-3 flex items-center gap-2">
                <ShieldAlert className="text-red-800" size={22} />
                3. CHÍNH SÁCH VÀ MIỄN TRỪ TRÁCH NHIỆM AI (AI Policy)
              </h3>
              <p className="mb-3">
                <strong>{siteTitle}</strong> là một chatbot học thuật ứng dụng Trí Tuệ Nhân Tạo (LLM kết hợp Retrieval-Augmented Generation - RAG) để tìm kiếm và trả lời thông tin lịch sử. Người dùng cần hiểu và đồng ý với các nguyên tắc hoạt động sau:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-stone-850">
                <li><strong>Nội dung không chính xác 100%:</strong> Mặc dù hệ thống luôn ưu tiên trích dẫn các tài liệu sử liệu chính thống, AI có thể gặp hiện tượng "ảo giác" (hallucination) hoặc diễn đạt không hoàn toàn chính xác do tính chất tự nhiên của các mô hình ngôn ngữ lớn.</li>
                <li><strong>Không thay thế chuyên môn:</strong> Nội dung phản hồi của chatbot chỉ mang tính chất tham khảo học thuật. Tuyệt đối không sử dụng thông tin từ chatbot để làm cơ sở pháp lý, chẩn đoán y tế, tư vấn tài chính hoặc bất kỳ mục đích chuyên môn đặc thù nào khác.</li>
                <li><strong>Trách nhiệm kiểm chứng:</strong> Người dùng hoàn toàn tự chịu trách nhiệm đối chiếu, xác minh thông tin từ chatbot với các tài liệu sử học chính thống trước khi sử dụng cho các mục đích nghiên cứu, học tập, xuất bản hoặc giảng dạy. Chúng tôi không chịu trách nhiệm đối với bất kỳ hậu quả nào phát sinh do việc tin cậy tuyệt đối vào nội dung do AI tạo ra.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3">4. Các hành vi bị cấm</h3>
              <p className="mb-2">Người dùng cam kết KHÔNG thực hiện các hành vi sau khi sử dụng ứng dụng:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Cố tình đưa ra các câu hỏi hoặc ép buộc AI tạo ra nội dung kích động bạo lực, thù hận, bôi nhọ anh hùng dân tộc, xuyên tạc lịch sử đất nước, hoặc vi phạm pháp luật nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.</li>
                <li>Sử dụng các công cụ quét tự động, gửi yêu cầu tấn công từ chối dịch vụ (DDoS) hoặc khai thác các lỗ hổng hệ thống API nhằm làm gián đoạn máy chủ.</li>
                <li>Lợi dụng các lỗi bảo mật hoặc kẽ hở logic để hack/cheat token, gian lận trong các câu hỏi thi đấu Q&A để giành phần thưởng.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3">5. Chấm dứt dịch vụ</h3>
              <p>
                Chúng tôi có quyền chấm dứt hoặc đình chỉ tài khoản của bạn ngay lập tức, mà không cần thông báo trước hay chịu trách nhiệm pháp lý, vì bất kỳ lý do gì, bao gồm nhưng không giới hạn ở việc vi phạm các Điều khoản sử dụng này. Sau khi chấm dứt, quyền sử dụng ứng dụng của bạn sẽ bị hủy bỏ ngay lập tức.
              </p>
            </section>
          </div>
        ) : (
          <div className="space-y-8 text-stone-700 leading-relaxed font-serif text-lg">
            <section className="bg-amber-50/50 p-6 rounded-2xl border border-amber-200/50">
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3 flex items-center gap-2">
                <FileText className="text-red-800" size={22} />
                1. Acceptance of Terms
              </h3>
              <p>
                By accessing, registering an account, or using any part of the <strong>{siteTitle}</strong> application, you agree to comply with and be bound by these Terms of Service. If you disagree with any part of these terms, please stop using the service immediately.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3">2. Account Rights and Responsibilities</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are solely responsible for securing your account credentials and for all actions that occur under your account.</li>
                <li>You agree to provide accurate registration details (such as email) to protect your rights in case of dispute or deposit issues.</li>
                <li>We reserve the right to temporarily suspend or permanently block your account without prior notice if a severe violation is identified.</li>
              </ul>
            </section>

            <section className="bg-red-50/50 p-6 rounded-2xl border border-red-200/50">
              <h3 className="text-xl font-bold font-historical text-red-950 mb-3 flex items-center gap-2">
                <ShieldAlert className="text-red-800" size={22} />
                3. AI POLICY & DISCLAIMER OF LIABILITY
              </h3>
              <p className="mb-3">
                <strong>{siteTitle}</strong> is an educational academic chatbot applying Artificial Intelligence (LLM combined with Retrieval-Augmented Generation - RAG) to search and answer history queries. Users must agree to the following operational principles:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-stone-850">
                <li><strong>Not 100% Accurate:</strong> While the system prioritizes citations from authoritative historical texts, the AI may experience "hallucinations" or minor inaccuracies due to the statistical nature of large language models.</li>
                <li><strong>No Professional Reliance:</strong> All chatbot responses are for general reference and educational purposes only. Do not use AI-generated content as a substitute for professional legal, medical, or financial advice.</li>
                <li><strong>Responsibility to Verify:</strong> Users assume full responsibility for verifying information with primary and official historical documents before using it for academic research, publishing, teaching, or official projects. We are not liable for any damages or consequences arising from reliance on AI-generated content.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3">4. Prohibited Behaviors</h3>
              <p className="mb-2">Users commit NOT to perform the following actions when using the app:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Coercing the AI to generate content that incites violence, hatred, defames historical figures, distorts national history, or violates the laws of the Socialist Republic of Vietnam.</li>
                <li>Employing automated scraping tools, launching DDoS attacks, or exploiting API endpoints to disrupt server operations.</li>
                <li>Exploiting security bugs or logical flaws to hack/cheat tokens or manipulate QA leaderboard scores.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3">5. Service Termination</h3>
              <p>
                We reserve the right to terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms of Service. Upon termination, your right to use the service will cease immediately.
              </p>
            </section>
          </div>
        );

      case 'data-deletion':
        return isVi ? (
          <div className="space-y-8 text-stone-700 leading-relaxed font-serif text-lg">
            <section className="bg-amber-50/50 p-6 rounded-2xl border border-amber-200/50">
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3 flex items-center gap-2">
                <Trash2 className="text-red-800" size={22} />
                Quyền tự quyết về Dữ liệu cá nhân
              </h3>
              <p>
                Tuân thủ nghiêm ngặt các quy định về dữ liệu của Google Play Store và Apple App Store, <strong>{siteTitle}</strong> cung cấp cho người dùng các cơ chế rõ ràng và minh bạch để xóa tài khoản và toàn bộ dữ liệu cá nhân liên quan.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3">Cách 1: Xóa tài khoản trực tiếp trong ứng dụng (Khuyên dùng)</h3>
              <p className="mb-3">
                Bạn có thể tự tay thực hiện thao tác xóa dữ liệu của mình ngay lập tức mà không cần thông qua quản trị viên:
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Đăng nhập vào tài khoản của bạn trên ứng dụng <strong>{siteTitle}</strong>.</li>
                <li>Nhấp vào biểu tượng <strong>Hồ sơ</strong> (hoặc góc quản lý cá nhân).</li>
                <li>Cuộn xuống dưới cùng của trang Hồ sơ.</li>
                <li>Nhấp vào nút màu đỏ <strong>"Yêu cầu xóa tài khoản"</strong> (hoặc "Xóa tài khoản vĩnh viễn").</li>
                <li>Xác nhận hộp thoại nhắc nhở của hệ thống.</li>
              </ol>
              <p className="mt-3 text-red-800 font-semibold">
                ⚠️ Lưu ý: Khi tự thực hiện trong app, tài khoản và lịch sử chat của bạn sẽ được xóa ngay lập tức khỏi máy chủ chính.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3">Cách 2: Gửi yêu cầu xóa dữ liệu qua Email</h3>
              <p className="mb-3">
                Nếu bạn không thể đăng nhập vào ứng dụng, hoặc gặp trục trặc kỹ thuật, bạn có thể gửi yêu cầu hỗ trợ thủ công:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Gửi một email tới địa chỉ hòm thư hỗ trợ: <a href={`mailto:${email}`} className="text-red-800 font-bold hover:underline">{email}</a>.</li>
                <li>Tiêu đề Email ghi rõ: <strong>"Yêu cầu xóa dữ liệu tài khoản Sử Việt AI"</strong>.</li>
                <li>Nội dung Email cần cung cấp: <strong>Tên tài khoản (username)</strong> hoặc <strong>Email đăng ký</strong> của tài khoản bạn muốn xóa để chúng tôi xác minh quyền sở hữu hợp pháp.</li>
              </ul>
            </section>

            <section className="bg-red-50/50 p-6 rounded-2xl border border-red-200/50">
              <h3 className="text-xl font-bold font-historical text-red-950 mb-3">Thời gian xử lý & Cam kết</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Đối với các yêu cầu gửi qua Email, chúng tôi sẽ xử lý và phản hồi xác nhận cho bạn trong vòng tối đa <strong>30 ngày</strong> kể từ khi nhận được email hợp lệ.</li>
                <li>Khi tài khoản được xóa, toàn bộ các trường dữ liệu sau sẽ bị hủy vĩnh viễn:
                  <ul className="list-circle pl-6 mt-1 space-y-1 text-sm font-sans">
                    <li>Thông tin hồ sơ (Họ tên, email đăng nhập, ảnh đại diện, mật khẩu băm).</li>
                    <li>Toàn bộ lịch sử tin nhắn trò chuyện với chatbot từ trước đến nay.</li>
                    <li>Lịch sử làm bài thi đấu Q&A và thông tin xếp hạng.</li>
                    <li>Số dư token hiện tại của tài khoản.</li>
                  </ul>
                </li>
                <li>Dữ liệu trong các bản sao lưu hệ thống (backups) cũng sẽ tự động bị xóa đè theo chu kỳ lưu trữ tối đa 30 ngày của hệ thống.</li>
              </ul>
            </section>
          </div>
        ) : (
          <div className="space-y-8 text-stone-700 leading-relaxed font-serif text-lg">
            <section className="bg-amber-50/50 p-6 rounded-2xl border border-amber-200/50">
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3 flex items-center gap-2">
                <Trash2 className="text-red-800" size={22} />
                Your Right to Be Forgotten
              </h3>
              <p>
                Strictly complying with data policies of the Google Play Store and Apple App Store, <strong>{siteTitle}</strong> provides users with clear and transparent mechanisms to delete their accounts and all associated personal data.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3">Method 1: Direct Deletion Inside the Application (Recommended)</h3>
              <p className="mb-3">
                You can instantly delete your data yourself without needing support team intervention:
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Log in to your account on the <strong>{siteTitle}</strong> app.</li>
                <li>Navigate to your <strong>Profile</strong> settings page.</li>
                <li>Scroll down to the bottom of the profile details.</li>
                <li>Click the red <strong>"Delete Account"</strong> button.</li>
                <li>Confirm the security warning modal.</li>
              </ol>
              <p className="mt-3 text-red-800 font-semibold">
                ⚠️ Please note: Account and chat histories will be purged immediately from the active databases.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3">Method 2: Submit a Deletion Request via Email</h3>
              <p className="mb-3">
                If you cannot log in or encounter technical issues, you can request a manual deletion:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Send an email to our support address: <a href={`mailto:${email}`} className="text-red-800 font-bold hover:underline">{email}</a>.</li>
                <li>Email subject must read: <strong>"Request to Delete Sử Việt AI Account Data"</strong>.</li>
                <li>Email body should provide: Your registered <strong>username</strong> or <strong>email address</strong> so we can verify ownership before deletion.</li>
              </ul>
            </section>

            <section className="bg-red-50/50 p-6 rounded-2xl border border-red-200/50">
              <h3 className="text-xl font-bold font-historical text-red-950 mb-3">Processing Timeline & Scope</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>For email requests, data will be purged and confirmed back to you within a maximum of <strong>30 days</strong>.</li>
                <li>Upon deletion, the following data attributes are permanently destroyed:
                  <ul className="list-circle pl-6 mt-1 space-y-1 text-sm font-sans">
                    <li>Profile information (Name, email, avatar, hashed password).</li>
                    <li>Entire chat history logs with the AI chatbot.</li>
                    <li>QA game scores and leaderboard rankings.</li>
                    <li>Current token balances.</li>
                  </ul>
                </li>
                <li>Data stored in system backup archives will be permanently overridden and cleared in accordance with our 30-day backup cycles.</li>
              </ul>
            </section>
          </div>
        );

      case 'support':
        return isVi ? (
          <div className="space-y-8 text-stone-700 leading-relaxed font-serif text-lg">
            <section className="bg-amber-50/50 p-6 rounded-2xl border border-amber-200/50 text-center py-8">
              <div className="w-16 h-16 bg-red-800 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <HelpCircle size={32} />
              </div>
              <h3 className="text-2xl font-bold font-historical text-stone-900 mb-2">Chúng tôi có thể giúp gì cho bạn?</h3>
              <p className="max-w-md mx-auto text-stone-600">
                Hãy đọc qua tài liệu hướng dẫn và các câu hỏi thường gặp bên dưới, hoặc liên hệ trực tiếp với bộ phận hỗ trợ.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-4 flex items-center gap-2">
                <Landmark className="text-red-850" size={24} />
                Hướng dẫn sử dụng cơ bản
              </h3>
              <div className="grid md:grid-cols-2 gap-6 font-sans text-sm text-stone-600">
                <div className="bg-white p-5 rounded-2xl border border-stone-200">
                  <h4 className="font-bold text-stone-900 mb-2 text-base">💬 Hỏi đáp với Sử Việt AI</h4>
                  <p>Nhập các câu hỏi lịch sử vào khung chat để thảo luận với AI. Hệ thống sử dụng công nghệ RAG để đưa ra câu trả lời dựa trên sử liệu chính xác kèm nguồn gốc.</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-stone-200">
                  <h4 className="font-bold text-stone-900 mb-2 text-base">🛡️ Tham gia Q&A nhận Token</h4>
                  <p>Truy cập mục Q&A hằng ngày, trả lời đúng các câu hỏi lịch sử từ ban quản trị để điểm danh và nhận token miễn phí để nâng cấp trí tuệ.</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-4">Các câu hỏi thường gặp (FAQ)</h3>
              <div className="space-y-4">
                <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200">
                  <h4 className="font-bold text-stone-950 mb-2 font-historical">Q: Sử Việt AI lấy thông tin từ nguồn nào? Có đáng tin không?</h4>
                  <p className="text-stone-600">
                    A: Sử Việt AI tìm kiếm và tham chiếu từ các bộ sử liệu nổi tiếng như Đại Việt Sử Ký Toàn Thư, Khâm Định Việt Sử Thông Giám Cương Mục và các công trình nghiên cứu chính thống được công bố của Việt Nam. Hệ thống luôn đính kèm trích dẫn sử liệu ở mỗi câu trả lời để người dùng dễ dàng tra cứu chéo.
                  </p>
                </div>

                <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200">
                  <h4 className="font-bold text-stone-950 mb-2 font-historical">Q: Tại sao tôi bị hết token và làm thế nào để nạp thêm?</h4>
                  <p className="text-stone-600">
                    A: Mỗi phiên hỏi đáp AI tiêu tốn một khoản chi phí máy chủ và điện toán. Chúng tôi hỗ trợ tặng token miễn phí qua điểm danh hằng ngày. Nếu cần hỏi đáp nhiều hơn, bạn có thể truy cập mục "Nạp Tiền" để mua các gói nạp bằng QR ngân hàng.
                  </p>
                </div>

                <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200">
                  <h4 className="font-bold text-stone-950 mb-2 font-historical">Q: Giao dịch nạp tiền bị lỗi, token chưa cộng thì xử lý thế nào?</h4>
                  <p className="text-stone-600">
                    A: Đừng lo lắng! Hệ thống nạp tiền được đối soát tự động. Nếu giao dịch bị nghẽn mạng, hãy nhấp vào nút "Báo cáo sự cố nạp tiền" tại trang Nạp Tiền và điền thông tin mô tả, hoặc gửi email đính kèm ảnh chụp hóa đơn tới <a href={`mailto:${email}`} className="text-red-800 hover:underline font-semibold">{email}</a>. Admin sẽ kiểm tra và cộng tay token cho bạn trong 1-4 giờ.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3">Thông tin liên hệ trực tiếp</h3>
              <div className="grid sm:grid-cols-3 gap-4 font-sans text-sm text-center">
                <div className="bg-white p-5 rounded-2xl border border-stone-200 flex flex-col items-center">
                  <Mail className="text-red-800 mb-2" size={24} />
                  <span className="font-bold text-stone-950 mb-1">Email hỗ trợ</span>
                  <a href={`mailto:${email}`} className="text-red-800 hover:underline font-semibold break-all">{email}</a>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-stone-200 flex flex-col items-center">
                  <Phone className="text-red-800 mb-2" size={24} />
                  <span className="font-bold text-stone-950 mb-1">Hotline điện thoại</span>
                  <a href={formatPhoneUrl(phone)} className="text-red-800 hover:underline font-semibold">{phone}</a>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-stone-200 flex flex-col items-center">
                  <MapPin className="text-red-800 mb-2" size={24} />
                  <span className="font-bold text-stone-950 mb-1">Địa chỉ văn phòng</span>
                  <span className="text-stone-500 text-xs">{address}</span>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-8 text-stone-700 leading-relaxed font-serif text-lg">
            <section className="bg-amber-50/50 p-6 rounded-2xl border border-amber-200/50 text-center py-8">
              <div className="w-16 h-16 bg-red-800 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <HelpCircle size={32} />
              </div>
              <h3 className="text-2xl font-bold font-historical text-stone-900 mb-2">How can we help you?</h3>
              <p className="max-w-md mx-auto text-stone-600">
                Browse our basic guide and FAQ below, or contact support directly.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-4 flex items-center gap-2">
                <Landmark className="text-red-850" size={24} />
                Quick Start Guide
              </h3>
              <div className="grid md:grid-cols-2 gap-6 font-sans text-sm text-stone-600">
                <div className="bg-white p-5 rounded-2xl border border-stone-200">
                  <h4 className="font-bold text-stone-900 mb-2 text-base">💬 AI Chat</h4>
                  <p>Type history queries in the chat window to talk to AI. The system uses RAG to query authenticated materials and appends bibliography sources.</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-stone-200">
                  <h4 className="font-bold text-stone-900 mb-2 text-base">🛡️ QA and Daily Rewards</h4>
                  <p>Access the Q&A page daily, select the correct answers for historical quizzes, claim token rewards, and expand your balance.</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-4">Frequently Asked Questions (FAQ)</h3>
              <div className="space-y-4">
                <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200">
                  <h4 className="font-bold text-stone-950 mb-2 font-historical">Q: Where does Sử Việt AI gather its information? Is it reliable?</h4>
                  <p className="text-stone-600">
                    A: Our database queries primary historic works like "Dai Viet Su Ky Toan Thu" and peer-reviewed historical studies. AI answers display citations so you can cross-verify records yourself.
                  </p>
                </div>

                <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200">
                  <h4 className="font-bold text-stone-950 mb-2 font-historical">Q: Why did I run out of tokens? How do I get more?</h4>
                  <p className="text-stone-600">
                    A: Every AI query consumes GPU processing resources. We credit daily tokens via attendance. You can buy higher capacity packages in the "Deposit" tab with mobile QR transfers.
                  </p>
                </div>

                <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200">
                  <h4 className="font-bold text-stone-950 mb-2 font-historical">Q: What if my payment fails or tokens aren't credited?</h4>
                  <p className="text-stone-600">
                    A: Deposits are automated. If a banking delay occurs, submit a report via the "Report deposit issue" button in the Deposit tab, or email us at <a href={`mailto:${email}`} className="text-red-800 hover:underline font-semibold">{email}</a> with receipt attachments. We manually adjust balances in 1-4 hours.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3">Direct Contact Details</h3>
              <div className="grid sm:grid-cols-3 gap-4 font-sans text-sm text-center">
                <div className="bg-white p-5 rounded-2xl border border-stone-200 flex flex-col items-center">
                  <Mail className="text-red-800 mb-2" size={24} />
                  <span className="font-bold text-stone-950 mb-1">Email Support</span>
                  <a href={`mailto:${email}`} className="text-red-800 hover:underline font-semibold break-all">{email}</a>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-stone-200 flex flex-col items-center">
                  <Phone className="text-red-800 mb-2" size={24} />
                  <span className="font-bold text-stone-950 mb-1">Hotline Phone</span>
                  <a href={formatPhoneUrl(phone)} className="text-red-800 hover:underline font-semibold">{phone}</a>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-stone-200 flex flex-col items-center">
                  <MapPin className="text-red-800 mb-2" size={24} />
                  <span className="font-bold text-stone-950 mb-1">Office Address</span>
                  <span className="text-stone-500 text-xs">{address}</span>
                </div>
              </div>
            </section>
          </div>
        );
      case 'about':
        const aboutUsText = siteConfig?.landing_footer_about_us || "Sử Việt AI được xây dựng và phát triển bởi CÔNG TY TNHH MTV CÔNG NGHỆ KỸ THUẬT TIÊN PHONG với sứ mệnh số hóa và bảo tồn các giá trị lịch sử dân tộc. Nền tảng ứng dụng công nghệ Trí tuệ nhân tạo (AI) hiện đại để tạo ra một chuyên gia lịch sử ảo, giúp học sinh, sinh viên và những người yêu thích lịch sử tiếp cận kiến thức một cách dễ dàng và sinh động.";
        return isVi ? (
          <div className="space-y-8 text-stone-700 leading-relaxed font-serif text-lg">
            <section className="text-center pb-6 border-b border-stone-200">
              <div className="w-24 h-24 bg-red-800 text-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg text-4xl font-historical-premium font-bold">史</div>
              <h3 className="text-2xl font-bold font-historical-premium text-stone-900">{siteTitle}</h3>
              <p className="text-stone-500 font-sans text-sm mt-1">Nền tảng tìm hiểu Lịch sử Việt Nam ứng dụng Trí tuệ nhân tạo</p>
            </section>

            <section className="bg-amber-50/50 p-6 rounded-2xl border border-amber-200/50">
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3 flex items-center gap-2">
                <Landmark className="text-red-800" size={22} />
                Sứ mệnh của chúng tôi
              </h3>
              <p className="whitespace-pre-line text-stone-850">
                {aboutUsText}
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3">Thông tin pháp lý & Đơn vị chủ quản</h3>
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3 font-sans text-sm">
                <p><strong>Tên đơn vị chủ quản:</strong> {companyName}</p>
                <p><strong>Người đại diện pháp luật:</strong> {representative}</p>
                <p><strong>Mã số thuế doanh nghiệp:</strong> {taxCode}</p>
                <p><strong>Địa chỉ trụ sở văn phòng:</strong> {address}</p>
                <p><strong>Hotline hỗ trợ:</strong> <a href={formatPhoneUrl(phone)} className="text-red-800 font-semibold hover:underline">{phone}</a></p>
                <p><strong>Địa chỉ Email liên hệ:</strong> <a href={`mailto:${email}`} className="text-red-800 font-semibold hover:underline">{email}</a></p>
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-8 text-stone-700 leading-relaxed font-serif text-lg">
            <section className="text-center pb-6 border-b border-stone-200">
              <div className="w-24 h-24 bg-red-800 text-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg text-4xl font-historical-premium font-bold">史</div>
              <h3 className="text-2xl font-bold font-historical-premium text-stone-900">{siteTitle}</h3>
              <p className="text-stone-500 font-sans text-sm mt-1">AI-powered Vietnamese History Chatbot Platform</p>
            </section>

            <section className="bg-amber-50/50 p-6 rounded-2xl border border-amber-200/50">
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3 flex items-center gap-2">
                <Landmark className="text-red-800" size={22} />
                Our Mission
              </h3>
              <p className="whitespace-pre-line text-stone-850">
                {siteConfig?.landing_footer_about_us_en || "Sử Việt AI is built and developed by TIEN PHONG TECHNOLOGY ENGINEERING COMPANY LIMITED with the mission of digitizing and preserving national historical values. The platform applies modern Artificial Intelligence (AI) technology to create a virtual history expert, helping students, researchers, and history enthusiasts access knowledge easily and vividly."}
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold font-historical text-stone-900 mb-3">Legal Information & Managing Entity</h3>
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-3 font-sans text-sm">
                <p><strong>Legal Entity Name:</strong> {companyName}</p>
                <p><strong>Legal Representative:</strong> {representative}</p>
                <p><strong>Business Tax Code:</strong> {taxCode}</p>
                <p><strong>Office Address:</strong> {address}</p>
                <p><strong>Support Hotline:</strong> <a href={formatPhoneUrl(phone)} className="text-red-800 font-semibold hover:underline">{phone}</a></p>
                <p><strong>Contact Email:</strong> <a href={`mailto:${email}`} className="text-red-800 font-semibold hover:underline">{email}</a></p>
              </div>
            </section>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f4] text-stone-800 py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-red-200 selection:text-red-900">
      {/* Decorative Vintage Gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-100/30 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden relative z-10">
        
        {/* Banner Header with Logo */}
        <div className="bg-gradient-to-r from-red-950 to-stone-900 text-amber-100 p-8 border-b-2 border-amber-600/30 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-white/5 p-0.5 shadow-md flex-shrink-0">
              <SecureImage src={logoUrl || "/images/su_viet_bot.jpg"} alt="Logo" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div>
              <h1 className="font-historical-premium text-2xl font-bold tracking-tight text-white">{siteTitle}</h1>
              <p className="text-xs text-amber-400 font-medium tracking-widest uppercase mt-0.5">
                {language === 'vi' ? 'Sử Thuyết & Trí Tuệ' : 'History & Wisdom'}
              </p>
            </div>
          </div>

          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            <ArrowLeft size={16} />
            {language === 'vi' ? 'Quay lại Trang chủ' : 'Back to Home'}
          </button>
        </div>

        {/* Page Title & Language Switcher */}
        <div className="px-8 py-6 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-stone-50/50">
          <h2 className="text-2xl font-bold font-historical-premium text-stone-900 text-center sm:text-left">
            {getPageTitle()}
          </h2>
          
          {/* Simple toggle for translations in policy view */}
          <div className="flex items-center gap-2 text-xs font-semibold bg-stone-200/60 p-1 rounded-lg">
            <span className="text-stone-500 px-2 uppercase">{language === 'vi' ? 'Ngôn ngữ:' : 'Language:'}</span>
            <button 
              onClick={() => window.location.reload()} 
              className="text-stone-700 bg-white shadow-sm px-3 py-1 rounded font-bold"
              title="Click language flag in footer to toggle language"
            >
              {language === 'vi' ? 'Tiếng Việt 🇻🇳' : 'English 🇬🇧'}
            </button>
          </div>
        </div>

        {/* Main Text Content */}
        <div className="p-8 sm:p-10">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="bg-stone-50 border-t border-stone-100 p-6 text-center text-xs text-stone-500">
          <p>© 2026 {companyName}. {language === 'vi' ? 'Bảo lưu mọi quyền.' : 'All rights reserved.'}</p>
        </div>
      </div>
    </div>
  );
};
