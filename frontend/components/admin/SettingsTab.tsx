import React, { useState, useRef, useEffect } from 'react';
import { API_ROOT } from '../../api';
import LandingPage from '../LandingPage';
import { 
  Settings, RefreshCw, Upload, FileText, Image, DollarSign, 
  Brain, Save, Gamepad2, Layout, Edit, Check, Eye, Minimize2, Maximize2 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../api';

interface SettingsTabProps {
  data: any;
  onSave: (e: React.FormEvent) => void;
  onSync: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onUploadLogo: (file: File) => Promise<void>;
  onUploadFavicon: (file: File) => Promise<void>;
  onUploadBackground: (file: File) => Promise<void>;
  onUploadChatBackground: (file: File) => Promise<void>;
}

interface EraCard {
  title: string;
  time: string;
  image: string;
  color?: string;
  summary: string;
}

const defaultEras: EraCard[] = [
  { title: "Văn Lang - Âu Lạc", time: "2879 TCN - 207 TCN", image: "/images/era_hong_bang.png", color: "from-red-900/90 to-stone-900/95", summary: "Thời kỳ bình minh của dân tộc với truyền thuyết con Rồng cháu Tiên, 18 đời Hùng Vương dựng nước và cuộc kháng chiến chống quân Tần của Thục Phán An Dương Vương. Nền văn hóa Đông Sơn rực rỡ với trống đồng là biểu tượng vĩ đại." },
  { title: "Bắc Thuộc", time: "207 TCN - 938 SCN", image: "/images/era_bac_thuoc.png", color: "from-stone-800/90 to-stone-900/95", summary: "Kéo dài hơn 1000 năm đau thương nhưng vô cùng oanh liệt. Bắt đầu từ khi Triệu Đà thôn tính Âu Lạc đến chiến thắng Bạch Đằng lịch sử. Nổi bật với các cuộc khởi nghĩa bất khuất của Hai Bà Trưng, Bà Triệu, Lý Bí." },
  { title: "Ngô - Đinh - Tiền Lê", time: "938 - 1009", image: "/images/era_ngo_dinh_le.png", color: "from-stone-700/90 to-stone-900/95", summary: "Giai đoạn đặt nền móng vững chắc cho kỷ nguyên độc lập tự chủ. Ngô Quyền xưng vương, Đinh Bộ Lĩnh dẹp loạn 12 sứ quân lập ra nước Đại Cồ Việt, Lê Hoàn đánh Tống bình Chiêm bảo vệ bờ cõi." },
  { title: "Lý - Trần - Hồ", time: "1009 - 1407", image: "/images/era_doc_lap.png", color: "from-amber-900/90 to-stone-900/95", summary: "Kỷ nguyên phát triển rực rỡ nhất của nền văn minh Đại Việt. Đời Lý dời đô về Thăng Long. Đời Trần ba lần đánh tan đế quốc Mông Nguyên hùng mạnh nhất thế giới. Đời Hồ nổi bật với những cải cách táo bạo." },
  { title: "Lê Sơ & Phân Tranh", time: "1428 - 1788", image: "/images/era_le_trinh_nguyen.png", color: "from-stone-800/90 to-stone-900/95", summary: "Bắt đầu bằng chiến thắng quân Minh hiển hách của Lê Lợi. Thời Lê Thánh Tông chứng kiến sự phồn thịnh tột bậc. Sau đó là sự suy vi dẫn đến thời kỳ Trịnh - Nguyễn phân tranh dai dẳng." },
  { title: "Tây Sơn & Nhà Nguyễn", time: "1788 - 1884", image: "/images/era_tay_son_nguyen.png", color: "from-red-950/90 to-stone-900/95", summary: "Khởi nghĩa nông dân Tây Sơn như vũ bão dẹp thù trong giặc ngoài (đánh tan quân Xiêm, quân Thanh), vua Quang Trung lên ngôi. Sau đó Nguyễn Ánh thống nhất đất nước, lập ra triều Nguyễn đóng đô ở Huế." },
  { title: "Pháp Thuộc", time: "1884 - 1945", image: "/images/era_phap_thuoc.png", color: "from-stone-900/90 to-black/95", summary: "Thực dân Pháp xâm lược và biến Việt Nam thành thuộc địa. Thời kỳ đau thương nhưng cũng là lúc các phong trào yêu nước, các tư tưởng tiến bộ phương Tây du nhập dọn đường cho Cách mạng." },
  { title: "Hiện Đại", time: "1945 - Nay", image: "/images/era_hien_dai.png", color: "from-blue-900/90 to-stone-900/95", summary: "Bắt đầu từ Cách mạng tháng Tám (1945), khai sinh nước Việt Nam Dân Chủ Cộng Hòa. Trải qua 2 cuộc kháng chiến chống Pháp và chống Mỹ gian khổ, Việt Nam hoàn toàn độc lập và bước vào kỷ nguyên đổi mới." },
];

const defaultProcessSteps = [
  { title: "Hỏi đáp AI", desc: "Tương tác tự nhiên với AI để tra cứu mọi thông tin lịch sử." },
  { title: "Tìm kiếm thông minh", desc: "Trích xuất thông tin nhanh chóng từ kho tài liệu khổng lồ." },
  { title: "Xác thực nguồn gốc", desc: "Mọi thông tin đều được tham chiếu rõ ràng từ sử liệu uy tín." }
];

const defaultFeaturesTabs = [
  {
    tab: "Cho Học Sinh",
    title: "Trợ thủ ôn tập thông minh",
    points: [
      "Tóm tắt sự kiện lịch sử ngắn gọn, dễ hiểu.",
      "Giải đáp câu hỏi trắc nghiệm và tự luận.",
      "Hệ thống hóa kiến thức theo sơ đồ tư duy."
    ]
  },
  {
    tab: "Cho Giáo Viên",
    title: "Công cụ hỗ trợ giảng dạy",
    points: [
      "Tạo giáo án và câu hỏi ôn tập tự động.",
      "Trích xuất tư liệu lịch sử làm phong phú bài giảng.",
      "So sánh, đối chiếu các nguồn sử liệu khác nhau."
    ]
  },
  {
    tab: "Cho Nhà Nghiên Cứu",
    title: "Tra cứu chuyên sâu",
    points: [
      "Tiếp cận kho tàng văn bản cổ và phân tích chi tiết.",
      "Hỗ trợ đối chiếu dữ liệu lịch sử độ chính xác cao.",
      "Khám phá các góc khuất lịch sử ít người biết đến."
    ]
  }
];

const defaultStatsItems = [
  { num: 50000, suffix: "+", label: "Người dùng tin tưởng" },
  { num: 1000000, suffix: "+", label: "Câu hỏi được giải đáp" },
  { num: 99.8, suffix: "%", label: "Độ chính xác dữ liệu" },
  { num: 24, suffix: "/7", label: "Hỗ trợ tra cứu" }
];

const defaultHighlightsItems = [
  { title: "Dữ liệu chuẩn xác", desc: "Mọi câu trả lời được tham chiếu từ các bộ sử liệu chính thống như Đại Việt Sử Ký Toàn Thư, Khâm Định Việt Sử Thông Giám Cương Mục." },
  { title: "AI Thông Minh", desc: "Công nghệ RAG tiên tiến giúp hiểu chính xác ngữ cảnh văn hóa Việt, phản hồi ngay lập tức với ngôn từ trau chuốt, tinh tế." },
  { title: "Đa thiết bị", desc: "Thiết kế đáp ứng hoàn hảo cho cả Web, Android và iOS. Giao diện tối giản, tập trung tối đa vào trải nghiệm đọc và học." }
];

const SettingsTab: React.FC<SettingsTabProps> = ({ 
  data, 
  onSave, 
  onSync, 
  onChange, 
  onUploadLogo,
  onUploadFavicon,
  onUploadBackground,
  onUploadChatBackground
}) => {
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [selectedEraIdx, setSelectedEraIdx] = useState<number>(0);
  const [eras, setEras] = useState<EraCard[]>(defaultEras);
  const [uploadingEraImage, setUploadingEraImage] = useState(false);

  const [processSteps, setProcessSteps] = useState(defaultProcessSteps);
  const [featuresTabs, setFeaturesTabs] = useState(defaultFeaturesTabs);
  const [statsItems, setStatsItems] = useState<Array<{ num: number | string; suffix: string; label: string; }>>(defaultStatsItems);
  const [highlightsItems, setHighlightsItems] = useState(defaultHighlightsItems);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const elementStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.drag-handle')) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      elementStart.current = { ...dragPosition };
      e.preventDefault();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      const maxLimitX = window.innerWidth - 320;
      const maxLimitY = window.innerHeight - 260;
      setDragPosition({
        x: Math.min(maxLimitX, Math.max(10, elementStart.current.x - dx)),
        y: Math.min(maxLimitY, Math.max(10, elementStart.current.y - dy))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Initialize eras from data.landing_eras_json if valid
  useEffect(() => {
    if (data.landing_eras_json) {
      try {
        const parsed = JSON.parse(data.landing_eras_json);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEras(parsed);
        }
      } catch (e) {
        console.error("Lỗi khi khôi phục landing_eras_json:", e);
      }
    }
  }, [data.landing_eras_json]);

  useEffect(() => {
    if (data.landing_process_json) {
      try {
        const parsed = JSON.parse(data.landing_process_json);
        if (Array.isArray(parsed) && parsed.length > 0) setProcessSteps(parsed);
      } catch (e) { }
    }
    if (data.landing_features_json) {
      try {
        const parsed = JSON.parse(data.landing_features_json);
        if (Array.isArray(parsed) && parsed.length > 0) setFeaturesTabs(parsed);
      } catch (e) { }
    }
    if (data.landing_stats_json) {
      try {
        const parsed = JSON.parse(data.landing_stats_json);
        if (Array.isArray(parsed) && parsed.length > 0) setStatsItems(parsed);
      } catch (e) { }
    }
    if (data.landing_highlights_json) {
      try {
        const parsed = JSON.parse(data.landing_highlights_json);
        if (Array.isArray(parsed) && parsed.length > 0) setHighlightsItems(parsed);
      } catch (e) { }
    }
  }, [data.landing_process_json, data.landing_features_json, data.landing_stats_json, data.landing_highlights_json]);

  // Handle scrolling preview pane to focused section
  const scrollToSection = (sectionId: string) => {
    if (previewContainerRef.current) {
      const element = previewContainerRef.current.querySelector(`#${sectionId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add a temporary subtle highlight effect
        element.classList.add('ring-4', 'ring-red-600/40', 'transition-all');
        setTimeout(() => {
          element.classList.remove('ring-4', 'ring-red-600/40');
        }, 1500);
      }
    }
  };

  // Era property change handler
  const handleEraChange = (field: keyof EraCard, val: string) => {
    const updated = [...eras];
    updated[selectedEraIdx] = {
      ...updated[selectedEraIdx],
      [field]: val
    };
    setEras(updated);

    // Update parent state as serialized JSON
    onChange({
      target: {
        name: 'landing_eras_json',
        value: JSON.stringify(updated)
      }
    } as any);
  };

  // Upload era image handler
  const handleUploadEraImage = async (file: File) => {
    try {
      setUploadingEraImage(true);
      const loadingToast = toast.loading(`Đang tải ảnh thời kỳ lên...`);
      const res = await api.adminUploadLogo(file);
      toast.dismiss(loadingToast);
      toast.success('Đã tải hình ảnh thời kỳ lên thành công.');
      handleEraChange('image', res.logo_url);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi tải ảnh lên');
    } finally {
      setUploadingEraImage(false);
    }
  };

  // Construct site config snapshot for LandingPage preview
  const previewSiteConfig = {
    site_title: data.site_title || "Sử Việt Chatbot",
    logo_url: data.logo_url,
    landing_bg: data.landing_bg,
    chat_bg: data.chat_bg,
    game_enabled: data.game_enabled,
    landing_hero_title: data.landing_hero_title,
    landing_hero_subtitle: data.landing_hero_subtitle,
    landing_section_eras_title: data.landing_section_eras_title,
    landing_section_stats_title: data.landing_section_stats_title,
    landing_section_features_title: data.landing_section_features_title,
    landing_eras_json: JSON.stringify(eras),
    landing_footer_company: data.landing_footer_company,
    landing_footer_mst: data.landing_footer_mst,
    landing_footer_representative: data.landing_footer_representative,
    landing_footer_address: data.landing_footer_address,
    landing_footer_phone: data.landing_footer_phone,
    landing_footer_about_us: data.landing_footer_about_us,
    landing_footer_terms: data.landing_footer_terms,
    landing_footer_privacy: data.landing_footer_privacy,
    landing_hero_words: data.landing_hero_words,
    landing_process_json: JSON.stringify(processSteps),
    landing_features_json: JSON.stringify(featuresTabs),
    landing_stats_json: JSON.stringify(statsItems),
    landing_highlights_json: JSON.stringify(highlightsItems),
    landing_contact_email: data.landing_contact_email,
    landing_contact_zalo_num: data.landing_contact_zalo_num,
    landing_contact_zalo_link: data.landing_contact_zalo_link,
    landing_contact_fb_link: data.landing_contact_fb_link
  };

  return (
    <div className="w-full max-w-[1500px] mx-auto px-2 lg:px-4 py-2 animate-in fade-in slide-in-from-bottom-2 duration-350">
      {/* Tab Header with Sync button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-100 border border-amber-300 rounded-xl flex items-center justify-center shrink-0 text-[#7f1d1d] shadow-inner font-historical font-black text-xl">
            設
          </div>
          <div>
            <h2 className="text-xl font-historical font-black text-[#7f1d1d] leading-none mb-1">Cấu Hồi Hệ Thống</h2>
            <p className="text-xs text-stone-500 font-sans italic">Thiết lập giao diện landing page, thời kỳ lịch sử và cài đặt SEO</p>
          </div>
        </div>

        <button 
          type="button" 
          onClick={onSync}
          className="text-xs font-historical font-black text-amber-800 bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-lg border border-amber-400/40 transition-all flex items-center gap-1.5 hover-lift shadow-sm"
          title="Đồng bộ nội dung SEO trực tiếp từ index.html"
        >
          <RefreshCw size={12} className="animate-spin-hover" />
          Đồng Bộ Từ HTML
        </button>
      </div>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        {/* LEFT COLUMN: Controls Form */}
        <form onSubmit={onSave} className={`${isPreviewExpanded ? 'lg:col-span-5' : 'lg:col-span-12'} bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden flex flex-col max-h-[calc(100vh-160px)] transition-all duration-300`}>
          <div className="p-5 md:p-6 overflow-y-auto space-y-6 flex-1 min-h-[400px]">
            {/* --- SECTION 1: CÀI ĐẶT CHUNG (SEO) --- */}
            <div className="space-y-4">
              <h4 className="font-historical text-[#7f1d1d] font-black border-b border-stone-100 pb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Layout size={16} /> Cấu Hình SEO & Thương Hiệu
              </h4>

              {/* Site Title */}
              <div>
                <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider mb-1 block">Tên Website (SEO Title)</label>
                <input 
                  name="site_title"
                  value={data.site_title || ''}
                  onChange={onChange}
                  onFocus={() => scrollToSection('hero')}
                  className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-sans text-xs"
                  placeholder="Ví dụ: Sử Việt - Tra Cứu Lịch Sử Việt Nam"
                />
              </div>

              {/* SEO Description */}
              <div>
                <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider mb-1 block">Khái Lược Mô Tả (SEO Description)</label>
                <textarea 
                  name="seo_description"
                  value={data.seo_description || ''}
                  onChange={onChange}
                  rows={2}
                  className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-sans text-xs leading-relaxed"
                  placeholder="Nhập mô tả tìm kiếm ngắn..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Keywords */}
                <div>
                  <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider mb-1 block">Từ Khóa SEO (Keywords)</label>
                  <input 
                    name="seo_keywords"
                    value={data.seo_keywords || ''}
                    onChange={onChange}
                    className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-sans text-xs"
                    placeholder="Lịch sử, AI, Sử Việt..."
                  />
                </div>
                {/* Author */}
                <div>
                  <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider mb-1 block">Soạn Giả (SEO Author)</label>
                  <input 
                    name="seo_author"
                    value={data.seo_author || ''}
                    onChange={onChange}
                    className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-sans text-xs"
                    placeholder="Ví dụ: Triều Đình Sử Việt"
                  />
                </div>
              </div>

              {/* Logo / Favicon Upload */}
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  {/* Logo Upload */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider block">Logo Website</label>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer bg-stone-50 border border-stone-300 hover:bg-stone-100 p-2 rounded-lg text-xs font-bold shadow-sm transition-all hover-lift flex items-center gap-1.5 w-full justify-center">
                        <Upload size={12} className="text-[#7f1d1d]" />
                        <span>Tải Logo</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onUploadLogo(file);
                          }}
                        />
                      </label>
                      {data.logo_url && (
                        <div className="w-8 h-8 rounded border border-stone-200 flex items-center justify-center p-0.5 shrink-0 bg-stone-50 overflow-hidden">
                          <img src={data.logo_url.startsWith('/') ? `${API_ROOT}${data.logo_url}` : data.logo_url} className="w-full h-full object-contain" alt="Logo" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Favicon Upload */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider block">Favicon</label>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer bg-stone-50 border border-stone-300 hover:bg-stone-100 p-2 rounded-lg text-xs font-bold shadow-sm transition-all hover-lift flex items-center gap-1.5 w-full justify-center">
                        <Upload size={12} className="text-[#7f1d1d]" />
                        <span>Tải Favicon</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onUploadFavicon(file);
                          }}
                        />
                      </label>
                      {data.favicon_url && (
                        <div className="w-8 h-8 rounded border border-stone-200 flex items-center justify-center p-0.5 shrink-0 bg-stone-50 overflow-hidden">
                          <img src={data.favicon_url.startsWith('/') ? `${API_ROOT}${data.favicon_url}` : data.favicon_url} className="w-full h-full object-contain" alt="Favicon" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Landing BG Upload */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider block">Nền Landing Page</label>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer bg-stone-50 border border-stone-300 hover:bg-stone-100 p-2 rounded-lg text-xs font-bold shadow-sm transition-all hover-lift flex items-center gap-1.5 w-full justify-center">
                        <Upload size={12} className="text-[#7f1d1d]" />
                        <span>Tải Nền</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onUploadBackground(file);
                          }}
                        />
                      </label>
                      {data.landing_bg && (
                        <div className="w-8 h-8 rounded border border-stone-200 flex items-center justify-center p-0.5 shrink-0 bg-stone-50 overflow-hidden">
                          <img src={data.landing_bg.startsWith('/') ? `${API_ROOT}${data.landing_bg}` : data.landing_bg} className="w-full h-full object-cover" alt="Landing BG" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chat BG Upload */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider block">Nền Trò Chuyện (Chat)</label>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer bg-stone-50 border border-stone-300 hover:bg-stone-100 p-2 rounded-lg text-xs font-bold shadow-sm transition-all hover-lift flex items-center gap-1.5 w-full justify-center">
                        <Upload size={12} className="text-[#7f1d1d]" />
                        <span>Tải Nền Chat</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onUploadChatBackground(file);
                          }}
                        />
                      </label>
                      {data.chat_bg && (
                        <div className="w-8 h-8 rounded border border-stone-200 flex items-center justify-center p-0.5 shrink-0 bg-stone-50 overflow-hidden">
                          <img src={data.chat_bg.startsWith('/') ? `${API_ROOT}${data.chat_bg}` : data.chat_bg} className="w-full h-full object-cover" alt="Chat BG" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* --- SECTION 2: CẤU HÌNH TRANG LANDING (BẢN ĐỒ/HÌNH ẢNH) --- */}
            <div className="space-y-4 border-t border-stone-100 pt-4">
              <h4 className="font-historical text-[#7f1d1d] font-black border-b border-stone-100 pb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
                <FileText size={16} /> Nội Dung Trang Chủ (Real-time)
              </h4>

              {/* Phaser Game Toggle Switch */}
              <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="text-amber-800" size={18} />
                  <div>
                    <span className="text-xs font-historical font-black text-stone-800 block">Kích Hoạt Trò Chơi Lịch Sử</span>
                    <span className="text-[10px] text-stone-500 font-sans">Hiển thị nút "Chơi Game" trên thanh điều hướng</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={data.game_enabled === 1}
                    onChange={(e) => {
                      onChange({
                        target: {
                          name: 'game_enabled',
                          value: e.target.checked ? 1 : 0
                        }
                      } as any);
                    }}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-800"></div>
                </label>
              </div>

              {/* Hero Title */}
              <div>
                <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider mb-1 block">Tiêu Đề Chính (Hero Title)</label>
                <input 
                  name="landing_hero_title"
                  value={data.landing_hero_title || ''}
                  onChange={onChange}
                  onFocus={() => scrollToSection('hero')}
                  className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-sans text-xs"
                  placeholder="Tiêu đề to chính diện trang chủ..."
                />
              </div>

              {/* Hero Subtitle */}
              <div>
                <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider mb-1 block">Mô Tả Phụ (Hero Subtitle)</label>
                <textarea 
                  name="landing_hero_subtitle"
                  value={data.landing_hero_subtitle || ''}
                  onChange={onChange}
                  onFocus={() => scrollToSection('hero')}
                  rows={2}
                  className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-sans text-xs leading-relaxed"
                  placeholder="Đoạn văn giới thiệu ngắn dưới tiêu đề chính..."
                />
              </div>

              {/* Hero Words (sliding keywords) */}
              <div>
                <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider mb-1 block">Từ Khoá Chạy Chữ (Hero Words)</label>
                <input 
                  name="landing_hero_words"
                  value={data.landing_hero_words || ''}
                  onChange={onChange}
                  onFocus={() => scrollToSection('hero')}
                  className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-sans text-xs"
                  placeholder="Cách nhau bằng dấu phẩy, ví dụ: Lịch Sử Việt Nam, Văn Hoá Dân Tộc..."
                />
              </div>

              {/* Process Steps Section */}
              <div className="space-y-3">
                <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider block">Các Bước Quy Trình (Process Steps)</label>
                <div className="grid grid-cols-3 gap-2">
                  {processSteps.map((step, idx) => (
                    <div key={idx} className="bg-stone-50 border border-stone-200 p-2 rounded-lg space-y-1.5">
                      <div className="text-[9px] font-historical font-black text-[#7f1d1d]">Bước {idx + 1}</div>
                      <input 
                        type="text"
                        value={step.title}
                        onChange={(e) => {
                          const updated = [...processSteps];
                          updated[idx].title = e.target.value;
                          setProcessSteps(updated);
                          onChange({ target: { name: 'landing_process_json', value: JSON.stringify(updated) } } as any);
                        }}
                        placeholder="Tiêu đề..."
                        className="w-full bg-white border border-stone-200 p-1.5 rounded focus:outline-none text-[10px] font-bold"
                      />
                      <textarea 
                        value={step.desc}
                        rows={2}
                        onChange={(e) => {
                          const updated = [...processSteps];
                          updated[idx].desc = e.target.value;
                          setProcessSteps(updated);
                          onChange({ target: { name: 'landing_process_json', value: JSON.stringify(updated) } } as any);
                        }}
                        placeholder="Mô tả..."
                        className="w-full bg-white border border-stone-200 p-1.5 rounded focus:outline-none text-[9px] leading-snug"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Features Tabs Section */}
              <div className="space-y-3">
                <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider block">Tính Năng Dành Cho Nhóm Đối Tượng</label>
                <div className="space-y-2.5">
                  {featuresTabs.map((item, idx) => (
                    <div key={idx} className="bg-stone-50 border border-stone-200 p-3 rounded-lg space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-historical font-black text-[#7f1d1d]">Nhóm {idx + 1}</span>
                        <input 
                          type="text"
                          value={item.tab}
                          onChange={(e) => {
                            const updated = [...featuresTabs];
                            updated[idx].tab = e.target.value;
                            setFeaturesTabs(updated);
                            onChange({ target: { name: 'landing_features_json', value: JSON.stringify(updated) } } as any);
                          }}
                          className="bg-white border border-stone-200 px-2 py-0.5 rounded text-[10px] font-bold text-stone-700 w-32 focus:outline-none"
                          placeholder="Tên nhóm..."
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-stone-500 font-sans block mb-0.5">Tiêu đề chính của nhóm</label>
                        <input 
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const updated = [...featuresTabs];
                            updated[idx].title = e.target.value;
                            setFeaturesTabs(updated);
                            onChange({ target: { name: 'landing_features_json', value: JSON.stringify(updated) } } as any);
                          }}
                          className="w-full bg-white border border-stone-200 p-1.5 rounded focus:outline-none text-[11px]"
                          placeholder="Tiêu đề..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-stone-500 font-sans block">Các điểm tính năng nổi bật (Gạch đầu dòng)</label>
                        {item.points.map((pt, pidx) => (
                          <input 
                            key={pidx}
                            type="text"
                            value={pt}
                            onChange={(e) => {
                              const updated = [...featuresTabs];
                              updated[idx].points[pidx] = e.target.value;
                              setFeaturesTabs(updated);
                              onChange({ target: { name: 'landing_features_json', value: JSON.stringify(updated) } } as any);
                            }}
                            className="w-full bg-white border border-stone-200 p-1.5 rounded focus:outline-none text-[10px]"
                            placeholder={`Điểm ${pidx + 1}...`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats Numbers Section */}
              <div className="space-y-3">
                <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider block">Các Số Liệu Thống Kê</label>
                <div className="grid grid-cols-4 gap-2">
                  {statsItems.map((stat, idx) => (
                    <div key={idx} className="bg-stone-50 border border-stone-200 p-2 rounded-lg space-y-1.5">
                      <div className="text-[9px] font-historical font-black text-amber-800">Cột {idx + 1}</div>
                      <div>
                        <input 
                          type="text"
                          value={stat.num}
                          onChange={(e) => {
                            const updated = [...statsItems];
                            updated[idx].num = isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value);
                            setStatsItems(updated);
                            onChange({ target: { name: 'landing_stats_json', value: JSON.stringify(updated) } } as any);
                          }}
                          placeholder="Số..."
                          className="w-full bg-white border border-stone-200 p-1 rounded focus:outline-none text-[10px] text-center font-bold"
                        />
                      </div>
                      <div>
                        <input 
                          type="text"
                          value={stat.suffix}
                          onChange={(e) => {
                            const updated = [...statsItems];
                            updated[idx].suffix = e.target.value;
                            setStatsItems(updated);
                            onChange({ target: { name: 'landing_stats_json', value: JSON.stringify(updated) } } as any);
                          }}
                          placeholder="Hậu tố..."
                          className="w-full bg-white border border-stone-200 p-1 rounded focus:outline-none text-[10px] text-center"
                        />
                      </div>
                      <div>
                        <input 
                          type="text"
                          value={stat.label}
                          onChange={(e) => {
                            const updated = [...statsItems];
                            updated[idx].label = e.target.value;
                            setStatsItems(updated);
                            onChange({ target: { name: 'landing_stats_json', value: JSON.stringify(updated) } } as any);
                          }}
                          placeholder="Nhãn..."
                          className="w-full bg-white border border-stone-200 p-1 rounded focus:outline-none text-[10px] text-center"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats Highlights Section */}
              <div className="space-y-3">
                <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider block">Các Khối Điểm Nổi Bật (Highlights)</label>
                <div className="space-y-2">
                  {highlightsItems.map((highlight, idx) => (
                    <div key={idx} className="bg-stone-50 border border-stone-200 p-2.5 rounded-lg space-y-1.5">
                      <div className="text-[9px] font-historical font-black text-[#7f1d1d]">Mục {idx + 1}</div>
                      <input 
                        type="text"
                        value={highlight.title}
                        onChange={(e) => {
                          const updated = [...highlightsItems];
                          updated[idx].title = e.target.value;
                          setHighlightsItems(updated);
                          onChange({ target: { name: 'landing_highlights_json', value: JSON.stringify(updated) } } as any);
                        }}
                        placeholder="Tiêu đề..."
                        className="w-full bg-white border border-stone-200 p-1.5 rounded focus:outline-none text-[10px] font-bold"
                      />
                      <textarea 
                        value={highlight.desc}
                        rows={2}
                        onChange={(e) => {
                          const updated = [...highlightsItems];
                          updated[idx].desc = e.target.value;
                          setHighlightsItems(updated);
                          onChange({ target: { name: 'landing_highlights_json', value: JSON.stringify(updated) } } as any);
                        }}
                        placeholder="Nội dung chi tiết..."
                        className="w-full bg-white border border-stone-200 p-1.5 rounded focus:outline-none text-[9px]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Section Titles */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider mb-1 block">Tiêu đề Tiến Trình</label>
                  <input 
                    name="landing_section_eras_title"
                    value={data.landing_section_eras_title || ''}
                    onChange={onChange}
                    onFocus={() => scrollToSection('process')}
                    className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-sans text-xs"
                    placeholder="Ví dụ: Một nền tảng xuyên suốt..."
                  />
                </div>
                <div>
                  <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider mb-1 block">Tiêu đề Giải Pháp</label>
                  <input 
                    name="landing_section_features_title"
                    value={data.landing_section_features_title || ''}
                    onChange={onChange}
                    onFocus={() => scrollToSection('features')}
                    className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-sans text-xs"
                    placeholder="Ví dụ: Giải pháp toàn diện..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider mb-1 block">Tiêu đề Thống Kê</label>
                  <input 
                    name="landing_section_stats_title"
                    value={data.landing_section_stats_title || ''}
                    onChange={onChange}
                    onFocus={() => scrollToSection('stats')}
                    className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-sans text-xs"
                    placeholder="Ví dụ: Tại sao chọn Sử Việt AI?"
                  />
                </div>
                <div>
                  {/* Empty field for spacing alignment */}
                </div>
              </div>
            </div>

            {/* --- SECTION 3: EDIT ERA CARDS (SESSIONS) --- */}
            <div className="space-y-4 border-t border-stone-100 pt-4">
              <h4 className="font-historical text-[#7f1d1d] font-black border-b border-stone-100 pb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Image size={16} /> Biên Tập Triều Đại (8 Thời Kỳ)
              </h4>

              {/* Era Selector Cards */}
              <div className="grid grid-cols-4 gap-2 bg-stone-100 p-1.5 rounded-xl border border-stone-200">
                {eras.map((era, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedEraIdx(idx);
                      scrollToSection('eras');
                    }}
                    className={`text-[9px] font-bold py-2 rounded-lg transition-all text-center line-clamp-1 border ${
                      selectedEraIdx === idx 
                        ? 'bg-red-800 text-white shadow border-red-900' 
                        : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-200'
                    }`}
                  >
                    Kỳ {idx + 1}
                  </button>
                ))}
              </div>

              {/* Detailed Era Form */}
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 space-y-3.5 relative">
                <div className="absolute top-3 right-3 text-[10px] font-historical font-black text-amber-800 bg-amber-100/50 px-2 py-0.5 rounded-full border border-amber-300/30">
                  Thời Kỳ Số {selectedEraIdx + 1}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  {/* Era Title */}
                  <div>
                    <label className="text-[9px] font-historical font-black text-[#7f1d1d] mb-1 block">Tên Thời Kỳ</label>
                    <input
                      type="text"
                      value={eras[selectedEraIdx]?.title || ''}
                      onChange={(e) => handleEraChange('title', e.target.value)}
                      className="w-full bg-white border border-stone-200 p-2 rounded-lg focus:outline-none text-xs"
                    />
                  </div>
                  {/* Era Time duration */}
                  <div>
                    <label className="text-[9px] font-historical font-black text-[#7f1d1d] mb-1 block">Niên Đại (Thời gian)</label>
                    <input
                      type="text"
                      value={eras[selectedEraIdx]?.time || ''}
                      onChange={(e) => handleEraChange('time', e.target.value)}
                      className="w-full bg-white border border-stone-200 p-2 rounded-lg focus:outline-none text-xs"
                    />
                  </div>
                </div>

                {/* Era Image URL and Upload button */}
                <div>
                  <label className="text-[9px] font-historical font-black text-[#7f1d1d] mb-1 block">Hình Ảnh Đại Diện</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={eras[selectedEraIdx]?.image || ''}
                      onChange={(e) => handleEraChange('image', e.target.value)}
                      className="w-full bg-white border border-stone-200 p-2 rounded-lg focus:outline-none text-xs font-mono"
                      placeholder="Đường dẫn hoặc tải ảnh lên..."
                    />
                    <label className="cursor-pointer bg-stone-900 hover:bg-stone-800 text-white p-2 rounded-lg text-xs font-bold transition-all flex items-center shrink-0">
                      <Upload size={12} />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        disabled={uploadingEraImage}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadEraImage(file);
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Era Summary */}
                <div>
                  <label className="text-[9px] font-historical font-black text-[#7f1d1d] mb-1 block">Tóm Tắt Sử Sử Liệu</label>
                  <textarea
                    value={eras[selectedEraIdx]?.summary || ''}
                    onChange={(e) => handleEraChange('summary', e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-stone-200 p-2 rounded-lg focus:outline-none text-xs leading-relaxed"
                    placeholder="Mô tả sự kiện, nét chính của thời kỳ..."
                  />
                </div>
              </div>
            </div>

            {/* --- SECTION 4: THUẾ SUẤT & LLM FALLBACK --- */}
            <div className="space-y-4 border-t border-stone-100 pt-4">
              <h4 className="font-historical text-[#7f1d1d] font-black border-b border-stone-100 pb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Brain size={16} /> Định Cấu Hình Trí Tuệ & Chi Phí
              </h4>

              <div className="grid grid-cols-2 gap-3">
                {/* Tokens rate */}
                <div>
                  <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider mb-1 block">Đơn Giá (Tokens/1000)</label>
                  <input 
                    name="rate"
                    type="number"
                    step="0.01"
                    value={data.rate || 0}
                    onChange={onChange}
                    className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-historical font-black text-amber-800 text-xs"
                  />
                </div>

                {/* LLM Model Select */}
                <div>
                  <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider mb-1 block">Mô Hình Trí Tuệ (LLM)</label>
                  <select
                    name="llm_name"
                    value={data.llm_name || 'openai'}
                    onChange={onChange}
                    className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-sans text-xs text-[#7f1d1d]"
                  >
                    <option value="openai">OpenAI (GPT-4o)</option>
                    <option value="gemini">Gemini API</option>
                    <option value="vertex">Google Vertex AI</option>
                    <option value="local">Nội Địa (Ollama)</option>
                  </select>
                </div>
              </div>

              {/* No Answer Fallback */}
              <div>
                <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider mb-1 block">Lời Cáo Lỗi Khi Mất Kết Nối Tri Thức</label>
                <textarea 
                  name="no_answer_fallback"
                  value={data.no_answer_fallback || ''}
                  onChange={onChange}
                  rows={2}
                  className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-sans text-xs italic text-stone-600 leading-relaxed"
                  placeholder="Lời cáo lỗi khi AI không tìm được câu trả lời..."
                />
              </div>
            </div>

            {/* --- SECTION 5: CẤU HÌNH FOOTER --- */}
            <div className="space-y-4 border-t border-stone-100 pt-4">
              <h4 className="font-historical text-[#7f1d1d] font-black border-b border-stone-100 pb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
                <FileText size={16} /> Cấu Hình Thông Tin Chân Trang (Footer)
              </h4>

              {/* Company name */}
              <div>
                <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider mb-1 block">Tên Công Ty / Chủ Thể</label>
                <input 
                  name="landing_footer_company"
                  value={data.landing_footer_company || ''}
                  onChange={onChange}
                  onFocus={() => scrollToSection('landing-footer')}
                  className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-sans text-xs"
                  placeholder="Ví dụ: CÔNG TY TNHH MTV CÔNG NGHỆ KỸ THUẬT TIÊN PHONG"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* MST */}
                <div>
                  <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider mb-1 block">Mã Số Thuế (MST)</label>
                  <input 
                    name="landing_footer_mst"
                    value={data.landing_footer_mst || ''}
                    onChange={onChange}
                    onFocus={() => scrollToSection('landing-footer')}
                    className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-sans text-xs"
                    placeholder="MST..."
                  />
                </div>
                {/* Representative */}
                <div>
                  <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider mb-1 block">Người Đại Diện</label>
                  <input 
                    name="landing_footer_representative"
                    value={data.landing_footer_representative || ''}
                    onChange={onChange}
                    onFocus={() => scrollToSection('landing-footer')}
                    className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-sans text-xs"
                    placeholder="Tên người đại diện..."
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider mb-1 block">Địa Chỉ Liên Hệ</label>
                <input 
                  name="landing_footer_address"
                  value={data.landing_footer_address || ''}
                  onChange={onChange}
                  onFocus={() => scrollToSection('landing-footer')}
                  className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-sans text-xs"
                  placeholder="Địa chỉ công ty..."
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider mb-1 block">Số Điện Thoại Hotline</label>
                <input 
                  name="landing_footer_phone"
                  value={data.landing_footer_phone || ''}
                  onChange={onChange}
                  onFocus={() => scrollToSection('landing-footer')}
                  className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-sans text-xs"
                  placeholder="Ví dụ: 0916 416 409"
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-3">
                {/* Contact Email */}
                <div>
                  <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider mb-1 block">Email Liên Hệ</label>
                  <input 
                    name="landing_contact_email"
                    value={data.landing_contact_email || ''}
                    onChange={onChange}
                    onFocus={() => scrollToSection('landing-footer')}
                    className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-sans text-xs"
                    placeholder="nguyenquocdat888888@gmail.com"
                  />
                </div>
                {/* Zalo phone number */}
                <div>
                  <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider mb-1 block">Số Điện Thoại Zalo</label>
                  <input 
                    name="landing_contact_zalo_num"
                    value={data.landing_contact_zalo_num || ''}
                    onChange={onChange}
                    onFocus={() => scrollToSection('landing-footer')}
                    className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-sans text-xs"
                    placeholder="0896 498 997"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Zalo chat link */}
                <div>
                  <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider mb-1 block">Đường Dẫn Zalo (Chat Link)</label>
                  <input 
                    name="landing_contact_zalo_link"
                    value={data.landing_contact_zalo_link || ''}
                    onChange={onChange}
                    onFocus={() => scrollToSection('landing-footer')}
                    className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-sans text-xs"
                    placeholder="https://zalo.me/..."
                  />
                </div>
                {/* FB Link */}
                <div>
                  <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider mb-1 block">Đường Dẫn Facebook</label>
                  <input 
                    name="landing_contact_fb_link"
                    value={data.landing_contact_fb_link || ''}
                    onChange={onChange}
                    onFocus={() => scrollToSection('landing-footer')}
                    className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-sans text-xs"
                    placeholder="https://www.facebook.com/..."
                  />
                </div>
              </div>

              {/* About us modal content */}
              <div>
                <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider mb-1 block">Nội dung "Về chúng tôi" (Giới thiệu chung)</label>
                <textarea 
                  name="landing_footer_about_us"
                  value={data.landing_footer_about_us || ''}
                  onChange={onChange}
                  onFocus={() => scrollToSection('landing-footer')}
                  className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-sans text-xs min-h-[80px]"
                  placeholder="Giới thiệu về Sử Việt AI..."
                />
              </div>

              {/* Terms of service modal content */}
              <div>
                <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider mb-1 block">Nội dung "Điều khoản dịch vụ"</label>
                <textarea 
                  name="landing_footer_terms"
                  value={data.landing_footer_terms || ''}
                  onChange={onChange}
                  onFocus={() => scrollToSection('landing-footer')}
                  className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-sans text-xs min-h-[100px]"
                  placeholder="Các điều khoản sử dụng dịch vụ..."
                />
              </div>

              {/* Privacy policy modal content */}
              <div>
                <label className="text-[10px] font-historical font-black uppercase text-amber-900 tracking-wider mb-1 block">Nội dung "Chính sách bảo mật"</label>
                <textarea 
                  name="landing_footer_privacy"
                  value={data.landing_footer_privacy || ''}
                  onChange={onChange}
                  onFocus={() => scrollToSection('landing-footer')}
                  className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 font-sans text-xs min-h-[100px]"
                  placeholder="Chính sách bảo mật dữ liệu..."
                />
              </div>
            </div>
          </div>

          {/* Form Action Submit */}
          <div className="p-4 border-t border-stone-200 bg-stone-50 shrink-0">
            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-[#7f1d1d] to-[#451a03] hover:from-[#b45309] hover:to-[#7f1d1d] text-amber-100 border border-amber-500/40 py-3 rounded-xl font-historical font-black text-xs uppercase tracking-widest shadow-md hover-lift active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Save size={14} />
              Lưu Thư Văn Cấu Hình
            </button>
          </div>
        </form>

        {/* RIGHT COLUMN: Live Interactive Landing Preview */}
        {isPreviewExpanded ? (
          <div className="lg:col-span-7 bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-stone-850 flex flex-col h-[calc(100vh-160px)] animate-in fade-in zoom-in duration-300">
            {/* Preview Window Header */}
            <div className="bg-stone-900 px-4 py-3 border-b border-stone-850 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
                <span className="text-[10px] text-stone-500 font-mono ml-4 select-none bg-stone-950 px-3 py-1 rounded-full border border-stone-850">
                  http://localhost:5173/preview
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-stone-400 font-bold text-[10px] font-historical uppercase">
                  <Eye size={12} className="text-amber-500" />
                  <span>Xem Trước Realtime</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPreviewExpanded(false)}
                  className="bg-stone-800 hover:bg-red-800 text-stone-300 hover:text-white px-2.5 py-1 rounded-lg text-[9px] font-historical font-black uppercase tracking-wider transition-all flex items-center gap-1"
                >
                  <Minimize2 size={10} />
                  <span>Thu nhỏ</span>
                </button>
              </div>
            </div>

            {/* Embedded React Component Preview Pane */}
            <div 
              ref={previewContainerRef}
              className="flex-1 overflow-y-auto bg-stone-50 scale-95 origin-top rounded-2xl border border-stone-200"
            >
              <LandingPage 
                siteConfig={previewSiteConfig as any} 
                onStart={() => {}} 
                user={null} 
              />
            </div>
          </div>
        ) : (
          <div 
            onMouseDown={handleMouseDown}
            onDoubleClick={() => setIsPreviewExpanded(true)}
            style={{ 
              right: `${dragPosition.x}px`, 
              bottom: `${dragPosition.y}px` 
            }}
            className="fixed w-[280px] h-[210px] z-50 bg-stone-900 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-2 border-stone-700 hover:border-amber-500 flex flex-col overflow-hidden transition-colors duration-300 group select-none"
            title="Kéo thanh tiêu đề để di chuyển • Đúp chuột để phóng to"
          >
            {/* Header / Drag Handle */}
            <div className="bg-stone-950 px-3 py-2 border-b border-stone-850 flex items-center justify-between shrink-0 drag-handle cursor-move select-none">
              <span className="text-[9px] text-amber-500 font-historical font-black uppercase tracking-wider flex items-center gap-1">
                <Eye size={10} /> Xem trước Realtime
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPreviewExpanded(true);
                }}
                className="text-stone-400 hover:text-amber-500 transition-colors p-1"
                title="Phóng to"
              >
                <Maximize2 size={10} />
              </button>
            </div>
            {/* Miniature Preview Screen - Scrollable! */}
            <div className="flex-1 bg-stone-50 overflow-y-auto relative scrollbar-thin [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-stone-300 [&::-webkit-scrollbar-thumb]:rounded-full">
              <div className="absolute inset-0 pointer-events-none bg-black/5 group-hover:bg-transparent z-10 transition-colors"></div>
              <div className="w-[1120px] origin-top-left scale-[0.25] pointer-events-none">
                <LandingPage 
                  siteConfig={previewSiteConfig as any} 
                  onStart={() => {}} 
                  user={null} 
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsTab;
