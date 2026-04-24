import React, { useState } from "react";
import { API_ROOT } from "../api";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { 
  BookOpen, Search, ShieldCheck, Zap, 
  MessageCircle, Map, Users, ChevronRight, 
  Clock, Globe, ArrowRight
} from "lucide-react";

type Props = {
  siteConfig: any;
  onStart: () => void;
  user?: any;
};

// --- Subcomponents ---

// Header
const Navbar = ({ logoUrl, siteTitle, onStart, user }: any) => (
  <nav className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-xl border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-stone-200 group-hover:shadow-md transition-shadow">
          <img 
            src={logoUrl || "/default.jpg"} 
            alt="Logo" 
            className="w-full h-full object-cover"
            onError={(e: any) => { e.target.src = 'https://ui-avatars.com/api/?name=Sử+Việt&background=991b1b&color=fff' }}
          />
        </div>
        <span className="font-historical-premium text-xl font-bold text-stone-900 group-hover:text-red-800 transition-colors">{siteTitle}</span>
      </div>
      <div className="hidden md:flex items-center gap-1 bg-stone-100/80 p-1.5 rounded-full border border-stone-200/60 shadow-inner">
        <a href="#features" className="px-5 py-2 text-sm font-bold text-stone-600 hover:text-red-800 hover:bg-white rounded-full transition-all hover:shadow-sm">Tính năng</a>
        <a href="#eras" className="px-5 py-2 text-sm font-bold text-stone-600 hover:text-red-800 hover:bg-white rounded-full transition-all hover:shadow-sm">Triều đại</a>
        <a href="#stats" className="px-5 py-2 text-sm font-bold text-stone-600 hover:text-red-800 hover:bg-white rounded-full transition-all hover:shadow-sm">Thống kê</a>
      </div>
      <div>
        {user ? (
          <div className="flex items-center gap-4">
             <span className="font-bold text-stone-800 hidden lg:block text-sm">Xin chào, <span className="text-red-800">{user.full_name || user.username}</span>! 👋</span>
             <button onClick={onStart} className="px-6 py-2.5 bg-gradient-to-r from-red-800 to-red-900 text-white font-bold rounded-full transition-all duration-300 shadow-md hover:shadow-[0_0_15px_rgba(153,27,27,0.4)] flex items-center gap-2 text-sm hover:-translate-y-0.5 active:scale-95">
               Vào Chat <ChevronRight size={16} />
             </button>
          </div>
        ) : (
          <button onClick={onStart} className="px-6 py-2.5 bg-gradient-to-r from-red-800 to-red-900 text-white font-bold rounded-full transition-all duration-300 shadow-md hover:shadow-[0_0_15px_rgba(153,27,27,0.4)] flex items-center gap-2 text-sm hover:-translate-y-0.5 active:scale-95">
            Bắt đầu <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  </nav>
);

// Hero
const HeroSection = ({ onStart, user }: any) => {
  const words = ["Lịch Sử Việt Nam", "Văn Hoá Dân Tộc", "Trí Tuệ Cha Ông", "Hào Khí Đông A"];
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-transparent">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-amber-100/50 blur-3xl opacity-60"></div>
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[500px] h-[500px] rounded-full bg-red-100/40 blur-3xl opacity-60"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-12">
        <div className="lg:w-1/2 text-center lg:text-left">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-historical-premium font-bold text-stone-900 leading-normal mb-6 min-h-[140px] md:min-h-[160px] lg:min-h-[180px]">
              Khám phá tinh hoa <br/>
              <AnimatePresence mode="wait">
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-red-800 to-amber-600 mt-2 py-2"
                >
                  {words[index]}
                </motion.span>
              </AnimatePresence>
            </h1>
            <p className="text-lg md:text-xl text-stone-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Hỏi đáp, tra cứu và tìm hiểu kiến thức lịch sử chính xác thông qua sức mạnh của Trí Tuệ Nhân Tạo. Nền tảng học tập toàn diện cho mọi thế hệ.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button onClick={onStart} className="px-8 py-4 w-full sm:w-auto bg-gradient-to-r from-red-800 to-red-900 text-white font-bold rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(153,27,27,0.4)] hover:shadow-[0_0_30px_rgba(153,27,27,0.6)] flex items-center justify-center gap-2 text-lg group hover:-translate-y-1 active:scale-95">
                {user ? 'Tiếp tục trò chuyện' : 'Trải nghiệm ngay'}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="mt-10 flex items-center justify-center lg:justify-start gap-4 text-sm text-stone-500 font-medium">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-stone-200 flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <span>Hơn 10,000+ người đang sử dụng</span>
            </div>
          </motion.div>
        </div>
        <div className="lg:w-1/2">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/30 to-red-600/30 rounded-3xl blur-3xl transform rotate-3 animate-pulse"></div>
            <div className="relative bg-white border border-stone-200 rounded-3xl shadow-2xl p-2 overflow-hidden hover:scale-[1.02] transition-transform duration-500">
              <div className="bg-stone-50 rounded-2xl border border-stone-100 h-[400px] md:h-[500px] flex flex-col">
                {/* Hero Image Mockup */}
                <img src="/images/hero_mockup.png" alt="Chatbot History Mockup" className="w-full h-full object-cover rounded-xl" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Process
const ProcessSection = () => {
  const steps = [
    { icon: <MessageCircle size={32} />, title: "Hỏi đáp AI", desc: "Tương tác tự nhiên với AI để tra cứu mọi thông tin lịch sử.", color: "text-red-800", bg: "bg-red-50/90", border: "border-red-100" },
    { icon: <Search size={32} />, title: "Tìm kiếm thông minh", desc: "Trích xuất thông tin nhanh chóng từ kho tài liệu khổng lồ.", color: "text-amber-600", bg: "bg-amber-50/90", border: "border-amber-100" },
    { icon: <ShieldCheck size={32} />, title: "Xác thực nguồn gốc", desc: "Mọi thông tin đều được tham chiếu rõ ràng từ sử liệu uy tín.", color: "text-emerald-700", bg: "bg-emerald-50/90", border: "border-emerald-100" }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-transparent to-stone-50/50 relative overflow-hidden" id="process">
      {/* Decorative blurred background circles */}
      <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-red-100/40 rounded-full blur-3xl -translate-y-1/2"></div>
      <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-amber-100/40 rounded-full blur-3xl -translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-5xl font-historical-premium font-bold text-stone-900 mb-6">
            Một nền tảng vận hành <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-800 to-amber-600">xuyên suốt</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-lg md:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
            Tối ưu hóa hành trình khám phá và tiếp thu kiến thức lịch sử thông qua quy trình đơn giản, thông minh.
          </motion.p>
        </div>
        <div className="relative">
          {/* Animated Connecting line */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-red-200 to-transparent z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, index) => (
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.2 }} key={index} className="text-center flex flex-col items-center group cursor-default">
                <div className="relative mb-8">
                  {/* Step Number Badge */}
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-stone-900 text-white font-bold flex items-center justify-center shadow-lg z-20 transform group-hover:scale-110 group-hover:bg-red-800 transition-all duration-300">
                    {index + 1}
                  </div>
                  {/* Icon Circle */}
                  <div className={`w-24 h-24 ${step.bg} backdrop-blur-sm rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.04)] border-4 border-white ${step.color} relative z-10 group-hover:shadow-[0_15px_40px_rgba(153,27,27,0.15)] group-hover:-translate-y-2 transition-all duration-500`}>
                    <div className="transform group-hover:scale-110 transition-transform duration-500">
                      {step.icon}
                    </div>
                  </div>
                  {/* Pulse Ring */}
                  <div className={`absolute inset-0 rounded-full border border-stone-200 scale-150 opacity-0 group-hover:animate-ping transition-opacity`}></div>
                </div>
                <h3 className="text-2xl font-bold font-historical-premium text-stone-900 mb-3 group-hover:text-red-800 transition-colors">{step.title}</h3>
                <p className="text-stone-600 px-2 leading-relaxed text-lg">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
};

// Features
const FeaturesSection = ({ onStart }: any) => {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ["Cho Học Sinh", "Cho Giáo Viên", "Cho Nhà Nghiên Cứu"];
  
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-historical-premium font-bold text-stone-900 mb-4">Giải pháp toàn diện cho <span className="text-amber-600">hành trình học tập</span></h2>
        </div>
        
        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="flex bg-stone-100 p-1 rounded-full overflow-x-auto max-w-full" style={{ scrollbarWidth: 'none' }}>
            {tabs.map((tab, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveTab(idx)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeTab === idx ? 'bg-white text-red-800 shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-stone-50 rounded-3xl border border-stone-200 p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                  {activeTab === 0 && (
                    <>
                      <h3 className="text-2xl font-bold text-stone-900 mb-4">Trợ thủ ôn tập thông minh</h3>
                      <ul className="space-y-4">
                        <li className="flex items-start gap-3"><Zap className="text-amber-500 mt-1 flex-shrink-0" size={20} /> <span className="text-stone-700">Tóm tắt sự kiện lịch sử ngắn gọn, dễ hiểu.</span></li>
                        <li className="flex items-start gap-3"><Zap className="text-amber-500 mt-1 flex-shrink-0" size={20} /> <span className="text-stone-700">Giải đáp câu hỏi trắc nghiệm và tự luận.</span></li>
                        <li className="flex items-start gap-3"><Zap className="text-amber-500 mt-1 flex-shrink-0" size={20} /> <span className="text-stone-700">Hệ thống hóa kiến thức theo sơ đồ tư duy.</span></li>
                      </ul>
                    </>
                  )}
                  {activeTab === 1 && (
                    <>
                      <h3 className="text-2xl font-bold text-stone-900 mb-4">Công cụ hỗ trợ giảng dạy</h3>
                      <ul className="space-y-4">
                        <li className="flex items-start gap-3"><Map className="text-green-500 mt-1 flex-shrink-0" size={20} /> <span className="text-stone-700">Tạo giáo án và câu hỏi ôn tập tự động.</span></li>
                        <li className="flex items-start gap-3"><Map className="text-green-500 mt-1 flex-shrink-0" size={20} /> <span className="text-stone-700">Trích xuất tư liệu lịch sử làm phong phú bài giảng.</span></li>
                        <li className="flex items-start gap-3"><Map className="text-green-500 mt-1 flex-shrink-0" size={20} /> <span className="text-stone-700">So sánh, đối chiếu các nguồn sử liệu khác nhau.</span></li>
                      </ul>
                    </>
                  )}
                  {activeTab === 2 && (
                    <>
                      <h3 className="text-2xl font-bold text-stone-900 mb-4">Tra cứu chuyên sâu</h3>
                      <ul className="space-y-4">
                        <li className="flex items-start gap-3"><BookOpen className="text-blue-500 mt-1 flex-shrink-0" size={20} /> <span className="text-stone-700">Tiếp cận kho tàng văn bản cổ và phân tích chi tiết.</span></li>
                        <li className="flex items-start gap-3"><BookOpen className="text-blue-500 mt-1 flex-shrink-0" size={20} /> <span className="text-stone-700">Hỗ trợ đối chiếu dữ liệu lịch sử độ chính xác cao.</span></li>
                        <li className="flex items-start gap-3"><BookOpen className="text-blue-500 mt-1 flex-shrink-0" size={20} /> <span className="text-stone-700">Khám phá các góc khuất lịch sử ít người biết đến.</span></li>
                      </ul>
                    </>
                  )}
                  <button onClick={onStart} className="mt-8 px-8 py-3 bg-white border-2 border-red-800 text-red-800 hover:bg-red-800 hover:text-white rounded-full font-bold transition-all duration-300 hover:shadow-[0_0_15px_rgba(153,27,27,0.3)] hover:-translate-y-1 active:scale-95 group flex items-center gap-2">
                    Khám phá ngay <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="md:w-1/2 w-full">
               <div className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden h-[300px] flex items-center justify-center relative">
                 <div className="absolute inset-0 bg-amber-50/50"></div>
                 <div className="relative text-center w-full h-full p-2 flex flex-col items-center">
                    <img src="/images/dashboard_mockup.png" alt="Educational Dashboard" className="w-full h-full object-cover rounded-xl" />
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Eras Section
const ErasSection = () => {
  const [activeEra, setActiveEra] = useState<number | null>(null);

  const eras = [
    { title: "Văn Lang - Âu Lạc", time: "2879 TCN - 207 TCN", image: "url('/images/era_hong_bang.png')", color: "from-red-900/90 to-stone-900/95", summary: "Thời kỳ bình minh của dân tộc với truyền thuyết con Rồng cháu Tiên, 18 đời Hùng Vương dựng nước và cuộc kháng chiến chống quân Tần của Thục Phán An Dương Vương. Nền văn hóa Đông Sơn rực rỡ với trống đồng là biểu tượng vĩ đại." },
    { title: "Bắc Thuộc", time: "207 TCN - 938 SCN", image: "url('/images/era_bac_thuoc.png')", color: "from-stone-800/90 to-stone-900/95", summary: "Kéo dài hơn 1000 năm đau thương nhưng vô cùng oanh liệt. Bắt đầu từ khi Triệu Đà thôn tính Âu Lạc đến chiến thắng Bạch Đằng lịch sử. Nổi bật với các cuộc khởi nghĩa bất khuất của Hai Bà Trưng, Bà Triệu, Lý Bí." },
    { title: "Ngô - Đinh - Tiền Lê", time: "938 - 1009", image: "url('/images/era_ngo_dinh_le.png')", color: "from-stone-700/90 to-stone-900/95", summary: "Giai đoạn đặt nền móng vững chắc cho kỷ nguyên độc lập tự chủ. Ngô Quyền xưng vương, Đinh Bộ Lĩnh dẹp loạn 12 sứ quân lập ra nước Đại Cồ Việt, Lê Hoàn đánh Tống bình Chiêm bảo vệ bờ cõi." },
    { title: "Lý - Trần - Hồ", time: "1009 - 1407", image: "url('/images/era_doc_lap.png')", color: "from-amber-900/90 to-stone-900/95", summary: "Kỷ nguyên phát triển rực rỡ nhất của nền văn minh Đại Việt. Đời Lý dời đô về Thăng Long. Đời Trần ba lần đánh tan đế quốc Mông Nguyên hùng mạnh nhất thế giới. Đời Hồ nổi bật với những cải cách táo bạo." },
    { title: "Lê Sơ & Phân Tranh", time: "1428 - 1788", image: "url('/images/era_le_trinh_nguyen.png')", color: "from-stone-800/90 to-stone-900/95", summary: "Bắt đầu bằng chiến thắng quân Minh hiển hách của Lê Lợi. Thời Lê Thánh Tông chứng kiến sự phồn thịnh tột bậc. Sau đó là sự suy vi dẫn đến thời kỳ Trịnh - Nguyễn phân tranh dai dẳng." },
    { title: "Tây Sơn & Nhà Nguyễn", time: "1788 - 1884", image: "url('/images/era_tay_son_nguyen.png')", color: "from-red-950/90 to-stone-900/95", summary: "Khởi nghĩa nông dân Tây Sơn như vũ bão dẹp thù trong giặc ngoài (đánh tan quân Xiêm, quân Thanh), vua Quang Trung lên ngôi. Sau đó Nguyễn Ánh thống nhất đất nước, lập ra triều Nguyễn đóng đô ở Huế." },
    { title: "Pháp Thuộc", time: "1884 - 1945", image: "url('/images/era_phap_thuoc.png')", color: "from-stone-900/90 to-black/95", summary: "Thực dân Pháp xâm lược và biến Việt Nam thành thuộc địa. Thời kỳ đau thương nhưng cũng là lúc các phong trào yêu nước, các tư tưởng tiến bộ phương Tây du nhập dọn đường cho Cách mạng." },
    { title: "Hiện Đại", time: "1945 - Nay", image: "url('/images/era_hien_dai.png')", color: "from-blue-900/90 to-stone-900/95", summary: "Bắt đầu từ Cách mạng tháng Tám (1945), khai sinh nước Việt Nam Dân Chủ Cộng Hòa. Trải qua 2 cuộc kháng chiến chống Pháp và chống Mỹ gian khổ, Việt Nam hoàn toàn độc lập và bước vào kỷ nguyên đổi mới." },
  ];
  return (
    <section className="py-20 bg-stone-900 text-white relative overflow-hidden" id="eras">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-historical-premium font-bold mb-4">Nền tảng toàn diện <span className="text-amber-500">đáp ứng mọi thời kỳ</span></h2>
          <p className="text-stone-400 max-w-2xl mx-auto">Khám phá chiều dài lịch sử hàng ngàn năm của dân tộc thông qua các bộ dữ liệu được hệ thống hóa chuyên sâu.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
           {eras.map((era, idx) => (
             <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} key={idx} 
               onClick={() => setActiveEra(idx)}
               className="group relative h-64 rounded-2xl overflow-hidden flex flex-col justify-end p-6 shadow-2xl hover:scale-[1.03] transition-all duration-300 cursor-pointer border border-stone-800"
               style={{ backgroundImage: era.image, backgroundSize: 'cover', backgroundPosition: 'center' }}>
               <div className={`absolute inset-0 bg-gradient-to-t ${era.color} opacity-90 group-hover:opacity-75 transition-opacity duration-300`}></div>
               <div className="relative z-10 transform group-hover:-translate-y-2 transition-transform duration-300">
                 <Clock size={28} className="mb-4 text-white/70" />
                 <h4 className="font-bold text-xl mb-1 text-white">{era.title}</h4>
                 <span className="text-sm font-bold text-amber-500 drop-shadow-md">{era.time}</span>
               </div>
             </motion.div>
           ))}
        </div>
      </div>

      {/* Chi tiết từng Thời kỳ Modal */}
      <AnimatePresence>
        {activeEra !== null && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setActiveEra(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
             <motion.div initial={{opacity:0, scale:0.95, y:20}} animate={{opacity:1, scale:1, y:0}} exit={{opacity:0, scale:0.95, y:20}} className="relative w-full max-w-2xl bg-stone-900 border border-stone-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                <div className="h-56 w-full relative">
                  <div className="absolute inset-0" style={{ backgroundImage: eras[activeEra].image, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent"></div>
                  <button onClick={() => setActiveEra(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-red-800 flex items-center justify-center text-white transition-colors backdrop-blur-sm border border-white/20">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
                <div className="p-8 -mt-20 relative z-10 text-center">
                  <div className="bg-stone-800/80 backdrop-blur-md border border-stone-600 px-6 py-2 rounded-full inline-block mb-4 shadow-lg text-amber-400 font-bold text-sm">
                    {eras[activeEra].time}
                  </div>
                  <h3 className="text-3xl font-bold font-historical-premium text-white mb-6">
                    {eras[activeEra].title}
                  </h3>
                  <p className="text-stone-300 leading-relaxed text-lg mb-8 px-4">
                    {eras[activeEra].summary}
                  </p>
                  <button onClick={() => setActiveEra(null)} className="px-10 py-3 bg-red-800 text-white rounded-full font-bold hover:bg-red-700 transition-colors shadow-[0_0_15px_rgba(153,27,27,0.4)] hover:scale-105 active:scale-95">
                    Đã hiểu
                  </button>
                </div>
             </motion.div>
           </div>
        )}
      </AnimatePresence>
    </section>
  )
};

// Stats
const StatsSection = () => {
  const stats = [
    { num: 50000, suffix: "+", label: "Người dùng tin tưởng", icon: <Users size={24} className="text-blue-600" /> },
    { num: 1000000, suffix: "+", label: "Câu hỏi được giải đáp", icon: <MessageCircle size={24} className="text-red-600" /> },
    { num: 99.8, suffix: "%", label: "Độ chính xác dữ liệu", icon: <ShieldCheck size={24} className="text-emerald-600" /> },
    { num: 24, suffix: "/7", label: "Hỗ trợ tra cứu", icon: <Clock size={24} className="text-amber-600" /> }
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden" id="stats">
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-50 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-50 rounded-full blur-3xl opacity-50 -ml-20 -mb-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-red-800 font-bold tracking-[0.2em] uppercase text-xs mb-4 block">Thống kê ấn tượng</motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-5xl font-historical-premium font-bold text-stone-900 mb-6">Tại sao nên chọn <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-800 to-amber-700">Sử Việt AI?</span></motion.h2>
        </div>
        
        {/* Numbers with Counter Animation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {stats.map((stat, idx) => (
             <motion.div 
               initial={{ opacity: 0, y: 20 }} 
               whileInView={{ opacity: 1, y: 0 }} 
               viewport={{ once: true }} 
               transition={{ delay: idx * 0.1 }} 
               key={idx} 
               className="bg-stone-50/50 backdrop-blur-sm p-8 rounded-[2rem] border border-stone-200/60 hover:border-red-200 hover:bg-white hover:shadow-2xl hover:shadow-red-900/5 transition-all duration-500 group text-center"
             >
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500 border border-stone-100">
                {stat.icon}
              </div>
              <div className="text-4xl md:text-5xl font-black text-stone-900 mb-2 font-historical-premium flex justify-center items-baseline">
                <AnimatedNumber value={stat.num} />
                <span className="text-2xl text-red-800 ml-1">{stat.suffix}</span>
              </div>
              <div className="text-stone-500 font-medium text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-10">
           <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="group relative bg-white p-10 rounded-[2.5rem] border border-stone-200 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] transition-all duration-500">
             <div className="w-16 h-16 bg-red-50 text-red-800 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-red-800 group-hover:text-white transition-colors duration-500 shadow-sm">
                <Globe size={32} />
             </div>
             <h3 className="text-2xl font-bold font-historical-premium text-stone-900 mb-4">Dữ liệu chuẩn xác</h3>
             <p className="text-stone-600 leading-relaxed mb-8">Mọi câu trả lời được tham chiếu từ các bộ sử liệu chính thống như Đại Việt Sử Ký Toàn Thư, Khâm Định Việt Sử Thông Giám Cương Mục.</p>
             <div className="flex gap-3">
               <span className="px-4 py-1.5 bg-stone-100 text-stone-800 text-xs rounded-full font-bold border border-stone-200">Chính thống</span>
               <span className="px-4 py-1.5 bg-red-50 text-red-800 text-xs rounded-full font-bold border border-red-100">Cập nhật</span>
             </div>
           </motion.div>
           
           <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="group relative bg-red-900 text-white p-10 rounded-[2.5rem] shadow-2xl shadow-red-900/20 md:-translate-y-6 overflow-hidden">
             <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24"></div>
             <div className="w-16 h-16 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-8 group-hover:bg-white group-hover:text-red-900 transition-colors duration-500 shadow-sm">
                <Zap size={32} />
             </div>
             <h3 className="text-2xl font-bold font-historical-premium mb-4">AI Thông Minh</h3>
             <p className="text-white/80 leading-relaxed mb-8">Công nghệ RAG tiên tiến giúp hiểu chính xác ngữ cảnh văn hóa Việt, phản hồi ngay lập tức với ngôn từ trau chuốt, tinh tế.</p>
             <ul className="space-y-4 text-sm font-medium">
               <li className="flex gap-3 items-center bg-white/5 p-3 rounded-xl border border-white/10"><ShieldCheck size={20} className="text-amber-400"/> Phản hồi tức thì trong 1 giây</li>
               <li className="flex gap-3 items-center bg-white/5 p-3 rounded-xl border border-white/10"><ShieldCheck size={20} className="text-amber-400"/> Am hiểu ngôn ngữ cổ học</li>
             </ul>
           </motion.div>

           <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="group relative bg-white p-10 rounded-[2.5rem] border border-stone-200 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] transition-all duration-500">
             <div className="w-16 h-16 bg-stone-100 text-stone-800 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-stone-900 group-hover:text-white transition-colors duration-500 shadow-sm">
                <Users size={32} />
             </div>
             <h3 className="text-2xl font-bold font-historical-premium text-stone-900 mb-4">Đa thiết bị</h3>
             <p className="text-stone-600 leading-relaxed mb-8">Thiết kế đáp ứng hoàn hảo cho cả Web, Android và iOS. Giao diện tối giản, tập trung tối đa vào trải nghiệm đọc và học.</p>
             <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100 text-stone-500 font-bold text-xs uppercase tracking-widest text-center">
               Hỗ trợ Web • Mobile App • Tablet
             </div>
           </motion.div>
        </div>
      </div>
    </section>
  )
}

// Helper for animated numbers
const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const nodeRef = React.useRef(null);
  const isInView = useInView(nodeRef, { once: true });

  React.useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const duration = 2000;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setDisplayValue(end);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return <span ref={nodeRef}>{displayValue.toLocaleString()}</span>;
};


// CTA
const CTASection = ({ onStart, user }: any) => (
  <section className="py-24 relative px-4 sm:px-6 lg:px-8">
    <div className="max-w-6xl mx-auto relative group">
      {/* Dynamic Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/30 to-amber-600/30 rounded-[3rem] blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
      
      <div className="relative bg-gradient-to-br from-stone-900 via-red-950 to-stone-950 rounded-[3rem] p-12 md:p-24 shadow-[0_20px_50px_rgba(153,27,27,0.3)] overflow-hidden text-center text-white border border-white/10">
        {/* Abstract decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 border-8 border-white rounded-full -ml-32 -mt-32"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 border-8 border-white rounded-full -mr-48 -mb-48"></div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-historical-premium font-bold mb-8 leading-tight">
            {user ? (
              <>Tiếp tục hành trình học sử, <span className="text-amber-500 underline decoration-red-800 underline-offset-8">{user.full_name || user.username}</span>!</>
            ) : (
              <>Hào khí dân tộc trong tầm tay <span className="text-amber-500">của bạn</span></>
            )}
          </h2>
          <p className="text-xl text-stone-300 mb-12 leading-relaxed max-w-2xl mx-auto">
            Gia nhập cộng đồng 50,000+ người Việt đang khám phá cội nguồn dân tộc mỗi ngày cùng AI Chatbot Lịch sử.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button onClick={onStart} className="px-12 py-5 bg-gradient-to-r from-red-800 to-red-600 text-white font-bold rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(153,27,27,0.5)] hover:shadow-[0_0_40px_rgba(153,27,27,0.7)] text-xl flex items-center gap-3 hover:-translate-y-1 active:scale-95 group">
              {user ? 'Vào Trò Chuyện' : 'Khám Phá Miễn Phí'} 
              <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </button>
            <div className="flex -space-x-3 items-center ml-4">
              {[1,2,3,4,5].map(i => (
                <img key={i} src={`https://i.pravatar.cc/100?img=${i+20}`} className="w-10 h-10 rounded-full border-2 border-stone-900 shadow-lg" alt="User Avatar" />
              ))}
              <div className="ml-6 text-stone-400 font-bold text-sm">+50k Users</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

// Footer
const Footer = ({ onOpenModal }: { onOpenModal: (type: 'about' | 'terms' | 'privacy' | 'contact') => void }) => (
  <footer className="bg-white border-t border-stone-200 pt-16 pb-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
        {/* Cột 1: Thông tin công ty chính */}
        <div className="md:col-span-5">
          <div className="font-historical-premium text-2xl font-bold text-stone-900 mb-4">Sử Việt AI</div>
          <h3 className="text-stone-900 font-bold mb-2">CÔNG TY TNHH MTV CÔNG NGHỆ KỸ THUẬT TIÊN PHONG</h3>
          <p className="text-stone-600 text-sm leading-relaxed mb-4 pr-4">
            Chuyên cung cấp giải pháp công nghệ kỹ thuật cao và xuất nhập khẩu các mặt hàng công nghệ tiên tiến.
          </p>
          <div className="text-stone-600 text-sm space-y-2">
            <p><strong>MST:</strong> 1801526082</p>
            <p><strong>Đại diện:</strong> NGÔ HỒ ANH KHÔI</p>
            <p><strong>Ngày hoạt động:</strong> 05/04/2017</p>
          </div>
        </div>

        {/* Cột 2: Liên kết */}
        <div className="md:col-span-3">
          <h4 className="text-stone-900 font-bold mb-4 uppercase tracking-wider text-sm">Liên kết nhanh</h4>
          <ul className="space-y-3 text-sm font-medium text-stone-500">
            <li><a href="#" onClick={(e) => { e.preventDefault(); onOpenModal('about'); }} className="hover:text-red-700 transition-colors flex items-center gap-2"><ChevronRight size={14}/> Về chúng tôi</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onOpenModal('terms'); }} className="hover:text-red-700 transition-colors flex items-center gap-2"><ChevronRight size={14}/> Điều khoản dịch vụ</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onOpenModal('privacy'); }} className="hover:text-red-700 transition-colors flex items-center gap-2"><ChevronRight size={14}/> Chính sách bảo mật</a></li>
          </ul>
        </div>

        {/* Cột 3: Liên hệ */}
        <div className="md:col-span-4">
          <h4 className="text-stone-900 font-bold mb-4 uppercase tracking-wider text-sm">Kết nối với chúng tôi</h4>
          <p className="text-stone-600 text-sm leading-relaxed mb-4">
            <strong>Địa chỉ:</strong> P16, Đường số 8, KDC lô 49, Khu đô thị Nam Cần Thơ, Phường Cái Răng, TP. Cần Thơ
          </p>
          <p className="text-stone-600 text-sm mb-6 flex items-center gap-2">
            <strong>Hotline:</strong> <a href="tel:0916416409" className="text-red-700 font-bold hover:underline text-lg">0916 416 409</a>
          </p>
          <a href="#" onClick={(e) => { e.preventDefault(); onOpenModal('contact'); }} className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-red-800 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg cursor-pointer">
            <MessageCircle size={18} /> Liên hệ hỗ trợ
          </a>
        </div>
      </div>
      <div className="text-center text-stone-400 text-sm pt-8 border-t border-stone-100 flex items-center justify-center gap-2">
        © 2026 Bản quyền thuộc về AI Chatbot Lịch sử Việt Nam.
      </div>
    </div>
  </footer>
);


const LandingPage: React.FC<Props> = ({ siteConfig, onStart, user }) => {
  const [activeModal, setActiveModal] = useState<'about' | 'terms' | 'privacy' | 'contact' | null>(null);

  const logoUrl =
    siteConfig?.logo_url &&
    (siteConfig.logo_url.startsWith("http")
      ? siteConfig.logo_url
      : API_ROOT + siteConfig.logo_url);
      
  const bgUrl =
    siteConfig?.landing_bg &&
    (siteConfig.landing_bg.startsWith("http")
      ? siteConfig.landing_bg
      : API_ROOT + siteConfig.landing_bg);

  return (
    <div className="min-h-screen w-full bg-stone-50 font-sans text-stone-800 overflow-x-hidden selection:bg-red-200 selection:text-red-900 relative">
      {bgUrl && (
        <div 
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `url("${bgUrl}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed"
          }}
        >
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px]"></div>
        </div>
      )}
      <div className="relative z-10">
        <Navbar logoUrl={logoUrl} siteTitle={siteConfig?.site_title || "Sử Việt Chatbot"} onStart={onStart} user={user} />
        <HeroSection onStart={onStart} user={user} />
        <ProcessSection />
        <FeaturesSection onStart={onStart} />
        <ErasSection />
        <StatsSection />
        <CTASection onStart={onStart} user={user} />
        <Footer onOpenModal={setActiveModal} />
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {activeModal && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setActiveModal(null)} className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />
             <motion.div initial={{opacity:0, scale:0.95, y:20}} animate={{opacity:1, scale:1, y:0}} exit={{opacity:0, scale:0.95, y:20}} className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-stone-100 bg-stone-50/50">
                  <h3 className="text-xl font-bold font-historical-premium text-stone-900">
                    {activeModal === 'about' ? 'Về Chúng Tôi' : activeModal === 'terms' ? 'Điều Khoản Dịch Vụ' : activeModal === 'privacy' ? 'Chính Sách Bảo Mật' : 'Thông Tin Liên Hệ'}
                  </h3>
                  <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-stone-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
                <div className="p-8 overflow-y-auto">
                  {activeModal === 'about' && (
                    <>
                      <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-red-800 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg text-3xl font-historical-premium font-bold">史</div>
                        <h2 className="text-2xl font-bold text-stone-900">Sử Việt AI</h2>
                        <p className="text-stone-500">Nền tảng học tập Lịch Sử bằng AI tiên phong</p>
                      </div>
                      <div className="space-y-6 text-stone-600 leading-relaxed">
                        <p>Sử Việt AI được xây dựng và phát triển bởi <strong>CÔNG TY TNHH MTV CÔNG NGHỆ KỸ THUẬT TIÊN PHONG</strong> với sứ mệnh số hóa và bảo tồn các giá trị lịch sử dân tộc. Nền tảng ứng dụng công nghệ Trí tuệ nhân tạo (AI) hiện đại để tạo ra một chuyên gia lịch sử ảo, giúp học sinh, sinh viên và những người yêu thích lịch sử tiếp cận kiến thức một cách dễ dàng và sinh động.</p>
                        <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 space-y-3 text-sm">
                          <h4 className="font-bold text-stone-900 text-base mb-2">Thông tin công ty</h4>
                          <p><strong>Tên pháp lý:</strong> CÔNG TY TNHH MỘT THÀNH VIÊN CÔNG NGHỆ KỸ THUẬT TIÊN PHONG</p>
                          <p><strong>Mã số thuế:</strong> 1801526082</p>
                          <p><strong>Người đại diện:</strong> NGÔ HỒ ANH KHÔI</p>
                          <p><strong>Ngày hoạt động:</strong> 05/04/2017</p>
                          <p><strong>Địa chỉ:</strong> P16, Đường số 8, KDC lô 49, Khu đô thị Nam Cần Thơ, Phường Cái Răng, TP. Cần Thơ</p>
                        </div>
                      </div>
                    </>
                  )}
                  {activeModal === 'terms' && (
                    <div className="space-y-6 text-stone-600 leading-relaxed">
                      <h4 className="text-lg font-bold text-stone-900">1. Chấp nhận điều khoản</h4>
                      <p>Bằng việc truy cập và sử dụng Sử Việt AI, bạn đồng ý tuân thủ các điều khoản và điều kiện dưới đây. Nếu không đồng ý, vui lòng ngừng sử dụng dịch vụ.</p>
                      <h4 className="text-lg font-bold text-stone-900">2. Quyền và trách nhiệm người dùng</h4>
                      <p>Bạn cam kết sử dụng dịch vụ vào mục đích học tập, nghiên cứu hợp pháp. Không sử dụng AI để tạo ra, phát tán các nội dung xuyên tạc lịch sử, chống phá nhà nước hoặc vi phạm thuần phong mỹ tục Việt Nam.</p>
                      <h4 className="text-lg font-bold text-stone-900">3. Giới hạn trách nhiệm</h4>
                      <p>Mặc dù Sử Việt AI đã được huấn luyện bằng các nguồn sử liệu chính thống, nhưng vì bản chất của Trí tuệ nhân tạo, đôi khi hệ thống có thể cung cấp thông tin thiếu sót hoặc chưa hoàn toàn chính xác. Người dùng nên tham khảo và đối chiếu thông tin khi dùng cho các mục đích học thuật quan trọng.</p>
                      <h4 className="text-lg font-bold text-stone-900">4. Bản quyền</h4>
                      <p>Toàn bộ thiết kế, logo, mã nguồn và hệ thống thuộc bản quyền của CÔNG TY TNHH MTV CÔNG NGHỆ KỸ THUẬT TIÊN PHONG. Nghiêm cấm sao chép dưới mọi hình thức.</p>
                    </div>
                  )}
                  {activeModal === 'privacy' && (
                    <div className="space-y-6 text-stone-600 leading-relaxed">
                      <h4 className="text-lg font-bold text-stone-900">1. Thu thập thông tin</h4>
                      <p>Chúng tôi chỉ thu thập các thông tin cơ bản khi bạn đăng nhập (Tên, Email) và nội dung các đoạn chat để phục vụ cho việc cải thiện chất lượng của AI cũng như lưu trữ lịch sử hội thoại cho cá nhân bạn.</p>
                      <h4 className="text-lg font-bold text-stone-900">2. Bảo mật dữ liệu</h4>
                      <p>Tất cả dữ liệu của bạn đều được mã hóa và lưu trữ an toàn trên máy chủ của chúng tôi. Chúng tôi cam kết không bán, không trao đổi hoặc chia sẻ thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào vì mục đích thương mại.</p>
                      <h4 className="text-lg font-bold text-stone-900">3. Quyền kiểm soát của người dùng</h4>
                      <p>Bạn có toàn quyền xem lại, xóa lịch sử chat hoặc yêu cầu xóa toàn bộ tài khoản và dữ liệu cá nhân bất cứ lúc nào thông qua chức năng Quản lý tài khoản.</p>
                    </div>
                  )}
                  {activeModal === 'contact' && (
                    <div className="space-y-6 text-stone-600 leading-relaxed text-center">
                      <div className="w-16 h-16 bg-red-800 text-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                         <MessageCircle size={28} />
                      </div>
                      <h2 className="text-2xl font-bold text-stone-900 mb-2">Liên hệ với chúng tôi</h2>
                      <p className="mb-8 text-stone-500">Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy liên hệ qua các kênh dưới đây:</p>
                      
                      <div className="grid gap-4 max-w-sm mx-auto text-left">
                        <a href="mailto:nguyenquocdat888888@gmail.com" className="flex items-center gap-4 p-4 rounded-2xl border border-stone-200 hover:border-red-800 hover:bg-red-50 transition-all group">
                          <div className="w-12 h-12 rounded-full bg-stone-100 group-hover:bg-red-200 flex items-center justify-center flex-shrink-0 text-red-800 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">Email</p>
                            <p className="font-bold text-stone-800 truncate text-sm">nguyenquocdat888888@gmail.com</p>
                          </div>
                        </a>

                        <a href="https://zalo.me/0896498997" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl border border-stone-200 hover:border-blue-500 hover:bg-blue-50 transition-all group">
                          <div className="w-12 h-12 rounded-full bg-stone-100 group-hover:bg-blue-200 flex items-center justify-center flex-shrink-0 text-blue-600 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">SĐT / Zalo</p>
                            <p className="font-bold text-stone-800 text-sm">0896 498 997</p>
                          </div>
                        </a>

                        <a href="https://www.facebook.com/nguyen.quoc.at.383270" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl border border-stone-200 hover:border-blue-600 hover:bg-blue-50 transition-all group">
                          <div className="w-12 h-12 rounded-full bg-stone-100 group-hover:bg-blue-200 flex items-center justify-center flex-shrink-0 text-blue-700 transition-colors">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">Cộng đồng</p>
                            <p className="font-bold text-stone-800 text-sm">Facebook Group</p>
                          </div>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-stone-100 bg-stone-50 flex justify-end">
                  <button onClick={() => setActiveModal(null)} className="px-8 py-2.5 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors shadow-md hover:shadow-lg">Đã hiểu & Đóng</button>
                </div>
             </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;