import React, { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { API_ROOT } from "../api";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  BookOpen, Search, ShieldCheck, Zap,
  MessageCircle, Map, Users, ChevronRight,
  Clock, Globe, ArrowRight
} from "lucide-react";
import { GameModal } from "./GameModal";
import SecureImage from "./SecureImage";


type Props = {
  siteConfig: any;
  onStart: () => void;
  user?: any;
};

// --- Subcomponents ---

// Header
const Navbar = ({ logoUrl, siteTitle, onStart, user, onPlayGame, gameEnabled }: any) => {
  const { t } = useLanguage();
  return (
  <nav className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-xl border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-stone-200 group-hover:shadow-md transition-shadow">
          <SecureImage src={logoUrl || "/default.jpg"} alt="Logo" className="w-full h-full object-cover" />
        </div>
        <span className="font-historical-premium text-xl font-bold text-stone-900 group-hover:text-red-800 transition-colors">{siteTitle}</span>
      </div>
      <div className="hidden md:flex items-center gap-1.5 bg-stone-100/80 p-1.5 rounded-full border border-stone-200/60 shadow-inner">
        <a href="#features" className="px-5 py-2 text-sm font-bold text-stone-600 hover:text-red-800 hover:bg-white rounded-full transition-all hover:shadow-sm">{t.nav_features}</a>
        <a href="#eras" className="px-5 py-2 text-sm font-bold text-stone-600 hover:text-red-800 hover:bg-white rounded-full transition-all hover:shadow-sm">{t.nav_eras}</a>
        <a href="#stats" className="px-5 py-2 text-sm font-bold text-stone-600 hover:text-red-800 hover:bg-white rounded-full transition-all hover:shadow-sm">{t.nav_stats}</a>
        {(gameEnabled !== 0 && gameEnabled !== false && gameEnabled !== '0') && (
          <button onClick={onPlayGame} className="px-5 py-2 text-sm font-extrabold text-white bg-gradient-to-r from-red-800 to-amber-600 hover:from-red-900 hover:to-amber-700 rounded-full transition-all hover:shadow-[0_2px_8px_rgba(153,27,27,0.3)] hover:-translate-y-0.5 active:scale-95 duration-200">
            {t.nav_play_game}
          </button>
        )}
      </div>
      <div>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="font-bold text-stone-800 hidden lg:block text-sm">{t.nav_hello} <span className="text-red-800">{user.full_name || user.username}</span>! 👋</span>
            <button onClick={onStart} className="px-6 py-2.5 bg-gradient-to-r from-red-800 to-red-900 text-white font-bold rounded-full transition-all duration-300 shadow-md hover:shadow-[0_0_15px_rgba(153,27,27,0.4)] flex items-center gap-2 text-sm hover:-translate-y-0.5 active:scale-95">
              {user.is_admin ? t.nav_dashboard : t.nav_enter_chat} <ChevronRight size={16} />
            </button>
          </div>
        ) : (
          <button onClick={onStart} className="px-6 py-2.5 bg-gradient-to-r from-red-800 to-red-900 text-white font-bold rounded-full transition-all duration-300 shadow-md hover:shadow-[0_0_15px_rgba(153,27,27,0.4)] flex items-center gap-2 text-sm hover:-translate-y-0.5 active:scale-95">
            {t.nav_start} <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  </nav>
  );
};

// Hero
const HeroSection = ({ onStart, user, heroTitle, heroSubtitle, heroWords }: any) => {
  const { t, language } = useLanguage();

  let displayTitle = heroTitle || '';
  if (!displayTitle || (language === 'en' && displayTitle.trim() === 'Khám phá tinh hoa')) {
    displayTitle = t.hero_default_title;
  }

  let displaySubtitle = heroSubtitle || '';
  if (!displaySubtitle || (language === 'en' && displaySubtitle.trim() === 'Hỏi đáp, tra cứu và tìm hiểu kiến thức lịch sử chính xác thông qua sức mạnh của Trí Tuệ Nhân Tạo. Nền tảng học tập toàn diện cho mọi thế hệ.')) {
    displaySubtitle = t.hero_default_subtitle;
  }

  const words = heroWords && heroWords.trim() && (language !== 'en' || heroWords.trim() !== 'Lịch Sử Việt Nam, Văn Hoá Dân Tộc, Trí Tuệ Cha Ông, Hào Khí Đông A')
    ? heroWords.split(',').map((w: string) => w.trim()).filter(Boolean)
    : t.hero_default_words.split(',').map((w: string) => w.trim());
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [words.length]);

  return (
    <section id="hero" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-transparent">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-amber-100/50 blur-3xl opacity-60"></div>
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[500px] h-[500px] rounded-full bg-red-100/40 blur-3xl opacity-60"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-12">
        <div className="lg:w-1/2 text-center lg:text-left">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-historical-premium font-bold text-stone-900 leading-normal mb-6 min-h-[140px] md:min-h-[160px] lg:min-h-[180px]">
              {displayTitle} <br />
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
              {displaySubtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button onClick={onStart} className="px-8 py-4 w-full sm:w-auto bg-gradient-to-r from-red-800 to-red-900 text-white font-bold rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(153,27,27,0.4)] hover:shadow-[0_0_30px_rgba(153,27,27,0.6)] flex items-center justify-center gap-2 text-lg group hover:-translate-y-1 active:scale-95">
                {user ? (user.is_admin ? t.hero_cta_admin : t.hero_cta_continue) : t.hero_cta_explore}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="mt-10 flex items-center justify-center lg:justify-start gap-4 text-sm text-stone-500 font-medium">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-stone-200 flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <span>{t.hero_users_label}</span>
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
const ProcessSection = ({ sectionTitle, processJson }: any) => {
  const { t, language } = useLanguage();

  let displayTitle = sectionTitle || '';
  if (!displayTitle || (language === 'en' && displayTitle.trim() === 'Một nền tảng vận hành xuyên suốt')) {
    displayTitle = t.process_default_title;
  }

  const defaultSteps = [
    { icon: <MessageCircle size={32} />, title: t.process_step1_title, desc: t.process_step1_desc, color: "text-red-800", bg: "bg-red-50/90", border: "border-red-100" },
    { icon: <Search size={32} />, title: t.process_step2_title, desc: t.process_step2_desc, color: "text-amber-600", bg: "bg-amber-50/90", border: "border-amber-100" },
    { icon: <ShieldCheck size={32} />, title: t.process_step3_title, desc: t.process_step3_desc, color: "text-emerald-700", bg: "bg-emerald-50/90", border: "border-emerald-100" }
  ];

  let steps = defaultSteps;
  if (processJson) {
    try {
      const parsed = JSON.parse(processJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        steps = parsed.map((item: any, idx: number) => ({
          ...item,
          icon: idx === 0 ? <MessageCircle size={32} /> : idx === 1 ? <Search size={32} /> : <ShieldCheck size={32} />,
          color: idx === 0 ? "text-red-800" : idx === 1 ? "text-amber-600" : "text-emerald-700",
          bg: idx === 0 ? "bg-red-50/90" : idx === 1 ? "bg-amber-50/90" : "bg-emerald-50/90",
          border: idx === 0 ? "border-red-100" : idx === 1 ? "border-amber-100" : "border-emerald-100"
        }));
      }
    } catch (e) {}
  }

  return (
    <section className="py-24 bg-gradient-to-b from-transparent to-stone-50/50 relative overflow-hidden" id="process">
      {/* Decorative blurred background circles */}
      <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-red-100/40 rounded-full blur-3xl -translate-y-1/2"></div>
      <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-amber-100/40 rounded-full blur-3xl -translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-5xl font-historical-premium font-bold text-stone-900 mb-6">
            {displayTitle}
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-lg md:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
            {t.process_default_subtitle}
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

const FeaturesSection = ({ onStart, sectionTitle, featuresJson }: any) => {
  const [activeTab, setActiveTab] = useState(0);
  const { t, language } = useLanguage();

  let displayTitle = sectionTitle || '';
  if (!displayTitle || (language === 'en' && displayTitle.trim() === 'Giải pháp toàn diện cho hành trình học tập')) {
    displayTitle = t.features_default_title;
  }

  const defaultTabs = [
    {
      tab: t.features_tab1,
      title: t.features_tab1_title,
      points: [t.features_tab1_p1, t.features_tab1_p2, t.features_tab1_p3]
    },
    {
      tab: t.features_tab2,
      title: t.features_tab2_title,
      points: [t.features_tab2_p1, t.features_tab2_p2, t.features_tab2_p3]
    },
    {
      tab: t.features_tab3,
      title: t.features_tab3_title,
      points: [t.features_tab3_p1, t.features_tab3_p2, t.features_tab3_p3]
    }
  ];

  let tabs = defaultTabs;
  if (featuresJson) {
    try {
      const parsed = JSON.parse(featuresJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        tabs = parsed;
      }
    } catch (e) { }
  }

  const tabIndex = activeTab >= tabs.length ? 0 : activeTab;
  const currentTab = tabs[tabIndex] || defaultTabs[0];

  return (
    <section className="py-24 bg-white overflow-hidden" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-historical-premium font-bold text-stone-900 mb-4">
            {displayTitle}
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="flex bg-stone-100 p-1 rounded-full overflow-x-auto max-w-full" style={{ scrollbarWidth: 'none' }}>
            {tabs.map((tabObj, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${tabIndex === idx ? 'bg-white text-red-800 shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}
              >
                {tabObj.tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-stone-50 rounded-3xl border border-stone-200 p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <AnimatePresence mode="wait">
                <motion.div key={tabIndex} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                  <h3 className="text-2xl font-bold text-stone-900 mb-4">{currentTab.title}</h3>
                  <ul className="space-y-4">
                    {(currentTab.points || []).map((point: string, pidx: number) => (
                      <li key={pidx} className="flex items-start gap-3">
                        {tabIndex === 0 ? (
                          <Zap className="text-amber-500 mt-1 flex-shrink-0" size={20} />
                        ) : tabIndex === 1 ? (
                          <Map className="text-green-500 mt-1 flex-shrink-0" size={20} />
                        ) : (
                          <BookOpen className="text-blue-500 mt-1 flex-shrink-0" size={20} />
                        )}
                        <span className="text-stone-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                  <button onClick={onStart} className="mt-8 px-8 py-3 bg-white border-2 border-red-800 text-red-800 hover:bg-red-800 hover:text-white rounded-full font-bold transition-all duration-300 hover:shadow-[0_0_15px_rgba(153,27,27,0.3)] hover:-translate-y-1 active:scale-95 group flex items-center gap-2">
                    {t.features_explore_btn} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
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
const ErasSection = ({ sectionTitle, erasData }: any) => {
  const [activeEra, setActiveEra] = useState<number | null>(null);
  const { t, language } = useLanguage();

  let displayTitle = sectionTitle || '';
  if (!displayTitle || (language === 'en' && (displayTitle.trim() === 'Thời Kỳ Lịch Sử Việt Nam' || displayTitle.trim() === ''))) {
    displayTitle = t.eras_default_title;
  }

  const defaultEras = [
    { title: t.era1_title, time: t.era1_time, image: "url('/images/era_hong_bang.png')", color: "from-red-900/90 to-stone-900/95", summary: t.era1_summary },
    { title: t.era2_title, time: t.era2_time, image: "url('/images/era_bac_thuoc.png')", color: "from-stone-800/90 to-stone-900/95", summary: t.era2_summary },
    { title: t.era3_title, time: t.era3_time, image: "url('/images/era_ngo_dinh_le.png')", color: "from-stone-700/90 to-stone-900/95", summary: t.era3_summary },
    { title: t.era4_title, time: t.era4_time, image: "url('/images/era_doc_lap.png')", color: "from-amber-900/90 to-stone-900/95", summary: t.era4_summary },
    { title: t.era5_title, time: t.era5_time, image: "url('/images/era_le_trinh_nguyen.png')", color: "from-stone-800/90 to-stone-900/95", summary: t.era5_summary },
    { title: t.era6_title, time: t.era6_time, image: "url('/images/era_tay_son_nguyen.png')", color: "from-red-950/90 to-stone-900/95", summary: t.era6_summary },
    { title: t.era7_title, time: t.era7_time, image: "url('/images/era_phap_thuoc.png')", color: "from-stone-900/90 to-black/95", summary: t.era7_summary },
    { title: t.era8_title, time: t.era8_time, image: "url('/images/era_hien_dai.png')", color: "from-blue-900/90 to-stone-900/95", summary: t.era8_summary },
  ];

  const eras = erasData && erasData.length > 0 ? erasData : defaultEras;
  const defaultColors = [
    "from-red-900/90 to-stone-900/95",
    "from-stone-800/90 to-stone-900/95",
    "from-stone-700/90 to-stone-900/95",
    "from-amber-900/90 to-stone-900/95",
    "from-stone-800/90 to-stone-900/95",
    "from-red-950/90 to-stone-900/95",
    "from-stone-900/90 to-black/95",
    "from-blue-900/90 to-stone-900/95"
  ];

  const getEraBg = (image: string, idx: number) => {
    if (!image) return `url('/images/era_hong_bang.png')`;
    if (image.startsWith('url(')) return image;
    return `url('${image}')`;
  };

  return (
    <section className="py-20 bg-stone-900 text-white relative overflow-hidden" id="eras">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-historical-premium font-bold mb-4">
            {displayTitle}
          </h2>
          <p className="text-stone-400 max-w-2xl mx-auto">{t.eras_subtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {eras.map((era: any, idx: number) => (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} key={idx}
              onClick={() => setActiveEra(idx)}
              className="group relative h-64 rounded-2xl overflow-hidden flex flex-col justify-end p-6 shadow-2xl hover:scale-[1.03] transition-all duration-300 cursor-pointer border border-stone-800"
              style={{ backgroundImage: getEraBg(era.image, idx), backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className={`absolute inset-0 bg-gradient-to-t ${era.color || defaultColors[idx % defaultColors.length]} opacity-90 group-hover:opacity-75 transition-opacity duration-300`}></div>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveEra(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-stone-900 border border-stone-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
              <div className="h-56 w-full relative">
                <div className="absolute inset-0" style={{ backgroundImage: getEraBg(eras[activeEra].image, activeEra), backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent"></div>
                <button onClick={() => setActiveEra(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-red-800 flex items-center justify-center text-white transition-colors backdrop-blur-sm border border-white/20">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
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
                  {t.eras_understood}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

const StatsSection = ({ sectionTitle, statsJson, highlightsJson }: any) => {
  const { t, language } = useLanguage();

  let displayTitle: React.ReactNode = sectionTitle || '';
  if (!displayTitle || (language === 'en' && displayTitle === 'Tại sao nên chọn Sử Việt AI?')) {
    displayTitle = (
      <>Why choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-800 to-amber-700">Sử Việt AI?</span></>
    );
  } else if (!sectionTitle) {
    displayTitle = (
      <>Tại sao nên chọn <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-800 to-amber-700">Sử Việt AI?</span></>
    );
  }

  const defaultStats = [
    { num: 50000, suffix: "+", label: t.stats_s1_label, icon: <Users size={24} className="text-blue-600" /> },
    { num: 1000000, suffix: "+", label: t.stats_s2_label, icon: <MessageCircle size={24} className="text-red-600" /> },
    { num: 99.8, suffix: "%", label: t.stats_s3_label, icon: <ShieldCheck size={24} className="text-emerald-600" /> },
    { num: 24, suffix: "/7", label: t.stats_s4_label, icon: <Clock size={24} className="text-amber-600" /> }
  ];

  let stats = defaultStats;
  if (statsJson) {
    try {
      const parsed = JSON.parse(statsJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        stats = parsed.map((item: any, idx: number) => ({
          ...item,
          icon: idx === 0 
            ? <Users size={24} className="text-blue-600" /> 
            : idx === 1 
            ? <MessageCircle size={24} className="text-red-600" /> 
            : idx === 2 
            ? <ShieldCheck size={24} className="text-emerald-600" /> 
            : <Clock size={24} className="text-amber-600" />
        }));
      }
    } catch (e) {}
  }

  const defaultHighlights = [
    { title: t.stats_h1_title, desc: t.stats_h1_desc },
    { title: t.stats_h2_title, desc: t.stats_h2_desc },
    { title: t.stats_h3_title, desc: t.stats_h3_desc }
  ];

  let highlights = defaultHighlights;
  if (highlightsJson) {
    try {
      const parsed = JSON.parse(highlightsJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        highlights = parsed;
      }
    } catch (e) {}
  }

  return (
    <section className="py-24 bg-white relative overflow-hidden" id="stats">
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-50 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-50 rounded-full blur-3xl opacity-50 -ml-20 -mb-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-red-800 font-bold tracking-[0.2em] uppercase text-xs mb-4 block">{t.stats_label}</motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-5xl font-historical-premium font-bold text-stone-900 mb-6">
            {displayTitle}
          </motion.h2>
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
                <AnimatedNumber value={typeof stat.num === 'string' ? parseFloat(stat.num) || 0 : stat.num} />
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
            <h3 className="text-2xl font-bold font-historical-premium text-stone-900 mb-4">{highlights[0]?.title}</h3>
            <p className="text-stone-600 leading-relaxed mb-8">{highlights[0]?.desc}</p>
            <div className="flex gap-3">
              <span className="px-4 py-1.5 bg-stone-100 text-stone-800 text-xs rounded-full font-bold border border-stone-200">{t.stats_h1_tag1}</span>
              <span className="px-4 py-1.5 bg-red-50 text-red-800 text-xs rounded-full font-bold border border-red-100">{t.stats_h1_tag2}</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="group relative bg-red-900 text-white p-10 rounded-[2.5rem] shadow-2xl shadow-red-900/20 md:-translate-y-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24"></div>
            <div className="w-16 h-16 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-8 group-hover:bg-white group-hover:text-red-900 transition-colors duration-500 shadow-sm">
              <Zap size={32} />
            </div>
            <h3 className="text-2xl font-bold font-historical-premium mb-4">{highlights[1]?.title}</h3>
            <p className="text-white/80 leading-relaxed mb-8">{highlights[1]?.desc}</p>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex gap-3 items-center bg-white/5 p-3 rounded-xl border border-white/10"><ShieldCheck size={20} className="text-amber-400" /> {t.stats_h2_li1}</li>
              <li className="flex gap-3 items-center bg-white/5 p-3 rounded-xl border border-white/10"><ShieldCheck size={20} className="text-amber-400" /> {t.stats_h2_li2}</li>
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="group relative bg-white p-10 rounded-[2.5rem] border border-stone-200 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] transition-all duration-500">
            <div className="w-16 h-16 bg-stone-100 text-stone-800 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-stone-900 group-hover:text-white transition-colors duration-500 shadow-sm">
              <Users size={32} />
            </div>
            <h3 className="text-2xl font-bold font-historical-premium text-stone-900 mb-4">{highlights[2]?.title}</h3>
            <p className="text-stone-600 leading-relaxed mb-8">{highlights[2]?.desc}</p>
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100 text-stone-500 font-bold text-xs uppercase tracking-widest text-center">
              {t.stats_h3_platforms}
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


const CTASection = ({ onStart, user }: any) => {
  const { t } = useLanguage();
  return (
  <section className="py-24 relative px-4 sm:px-6 lg:px-8">
    <div className="max-w-6xl mx-auto relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/30 to-amber-600/30 rounded-[3rem] blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
      <div className="relative bg-gradient-to-br from-stone-900 via-red-950 to-stone-950 rounded-[3rem] p-12 md:p-24 shadow-[0_20px_50px_rgba(153,27,27,0.3)] overflow-hidden text-center text-white border border-white/10">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 border-8 border-white rounded-full -ml-32 -mt-32"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 border-8 border-white rounded-full -mr-48 -mb-48"></div>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-historical-premium font-bold mb-8 leading-tight">
            {user ? (
              <>{t.cta_continue} <span className="text-amber-500 underline decoration-red-800 underline-offset-8">{user.full_name || user.username}</span>!</>
            ) : (
              t.cta_heading_guest
            )}
          </h2>
          <p className="text-xl text-stone-300 mb-12 leading-relaxed max-w-2xl mx-auto">{t.cta_subtext}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button onClick={onStart} className="px-12 py-5 bg-gradient-to-r from-red-800 to-red-600 text-white font-bold rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(153,27,27,0.5)] hover:shadow-[0_0_40px_rgba(153,27,27,0.7)] text-xl flex items-center gap-3 hover:-translate-y-1 active:scale-95 group">
              {user ? (user.is_admin ? t.cta_btn_admin : t.cta_btn_chat) : t.cta_btn_guest}
              <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </button>

            {/* APK Download Button */}
            <a
              href="https://rehydrate-doing-crust.ngrok-free.dev/download/apk"
              download="ChatbotLichSu.apk"
              className="px-8 py-5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full transition-all duration-300 border border-white/20 hover:border-white/40 text-base flex items-center gap-3 hover:-translate-y-1 active:scale-95 backdrop-blur-sm"
            >
              <span className="text-2xl">📲</span>
              <div className="text-left">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/60 leading-none mb-0.5">Tải về</div>
                <div>App Android (APK)</div>
              </div>
            </a>
          </div>

          <div className="flex -space-x-3 items-center justify-center mt-10">
            {[1, 2, 3, 4, 5].map(i => (
              <img key={i} src={`https://i.pravatar.cc/100?img=${i + 20}`} className="w-10 h-10 rounded-full border-2 border-stone-900 shadow-lg" alt="User Avatar" />
            ))}
            <div className="ml-6 text-stone-400 font-bold text-sm">{t.cta_users_label}</div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
  );
};

// Footer
const Footer = ({ onOpenModal, siteConfig }: { onOpenModal: (type: 'about' | 'terms' | 'privacy' | 'contact') => void, siteConfig?: any }) => {
  const { t, language } = useLanguage();
  
  let company = siteConfig?.landing_footer_company || "CÔNG TY TNHH MTV CÔNG NGHỆ KỸ THUẬT TIÊN PHONG";
  if (language === 'en' && (!siteConfig?.landing_footer_company || siteConfig.landing_footer_company.trim() === "CÔNG TY TNHH MTV CÔNG NGHỆ KỸ THUẬT TIÊN PHONG")) {
    company = t.footer_company_name;
  }

  const mst = siteConfig?.landing_footer_mst || "1801526082";

  let representative = siteConfig?.landing_footer_representative || "NGÔ HỒ ANH KHÔI";
  if (language === 'en' && (!siteConfig?.landing_footer_representative || siteConfig.landing_footer_representative.trim() === "NGÔ HỒ ANH KHÔI")) {
    representative = t.footer_representative_value;
  }

  let address = siteConfig?.landing_footer_address || "P16, Đường số 8, KDC lô 49, Khu đô thị Nam Cần Thơ, Phường Cái Răng, TP. Cần Thơ";
  if (language === 'en' && (!siteConfig?.landing_footer_address || siteConfig.landing_footer_address.trim() === "P16, Đường số 8, KDC lô 49, Khu đô thị Nam Cần Thơ, Phường Cái Răng, TP. Cần Thơ")) {
    address = t.footer_address_value;
  }

  const phone = siteConfig?.landing_footer_phone || "0916 416 409";
  const cleanPhone = phone.replace(/\s+/g, '');

  return (
    <footer id="landing-footer" className="bg-white border-t border-stone-200 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
          {/* Cột 1: Thông tin công ty chính */}
          <div className="md:col-span-5">
            <div className="font-historical-premium text-2xl font-bold text-stone-900 mb-4">
              {siteConfig?.site_title || "Sử Việt AI"}
            </div>
            <h3 className="text-stone-900 font-bold mb-2 uppercase">{company}</h3>
            <p className="text-stone-600 text-sm leading-relaxed mb-4 pr-4">{t.footer_company_desc}</p>
            <div className="text-stone-600 text-sm space-y-2">
              <p><strong>{t.footer_mst}</strong> {mst}</p>
              <p><strong>{t.footer_rep}</strong> {representative}</p>
            </div>
          </div>

          {/* Cột 2: Liên kết */}
          <div className="md:col-span-3">
            <h4 className="text-stone-900 font-bold mb-4 uppercase tracking-wider text-sm">{t.footer_quick_links}</h4>
            <ul className="space-y-3 text-sm font-medium text-stone-500">
              <li><a href="#" onClick={(e) => { e.preventDefault(); onOpenModal('about'); }} className="hover:text-red-700 transition-colors flex items-center gap-2"><ChevronRight size={14} /> {t.footer_about_link}</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); onOpenModal('terms'); }} className="hover:text-red-700 transition-colors flex items-center gap-2"><ChevronRight size={14} /> {t.footer_terms_link}</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); onOpenModal('privacy'); }} className="hover:text-red-700 transition-colors flex items-center gap-2"><ChevronRight size={14} /> {t.footer_privacy_link}</a></li>
            </ul>
          </div>

          {/* Cột 3: Liên hệ */}
          <div className="md:col-span-4">
            <h4 className="text-stone-900 font-bold mb-4 uppercase tracking-wider text-sm">{t.footer_connect}</h4>
            <p className="text-stone-600 text-sm leading-relaxed mb-4">
              <strong>{t.footer_address_label}</strong> {address}
            </p>
            <p className="text-stone-600 text-sm mb-6 flex items-center gap-2">
              <strong>{t.footer_hotline_label}</strong> <a href={`tel:${cleanPhone}`} className="text-red-700 font-bold hover:underline text-lg">{phone}</a>
            </p>
            <a href="#" onClick={(e) => { e.preventDefault(); onOpenModal('contact'); }} className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-red-800 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg cursor-pointer">
              <MessageCircle size={18} /> {t.footer_contact_btn}
            </a>
          </div>
        </div>
        <div className="text-center text-stone-400 text-sm pt-8 border-t border-stone-100 flex items-center justify-center gap-2">
          {t.footer_copyright}
        </div>
      </div>
    </footer>
  );
};


const LandingPage: React.FC<Props> = ({ siteConfig, onStart, user }) => {
  const [activeModal, setActiveModal] = useState<'about' | 'terms' | 'privacy' | 'contact' | null>(null);
  const [showGame, setShowGame] = useState(false);
  const { t, language } = useLanguage();

  const company = language === 'en' && (!siteConfig?.landing_footer_company || siteConfig?.landing_footer_company.trim() === "CÔNG TY TNHH MTV CÔNG NGHỆ KỸ THUẬT TIÊN PHONG")
    ? t.footer_company_name
    : (siteConfig?.landing_footer_company || "CÔNG TY TNHH MTV CÔNG NGHỆ KỸ THUẬT TIÊN PHONG");

  const mst = siteConfig?.landing_footer_mst || "1801526082";

  const representative = language === 'en' && (!siteConfig?.landing_footer_representative || siteConfig?.landing_footer_representative.trim() === "NGÔ HỒ ANH KHÔI")
    ? t.footer_representative_value
    : (siteConfig?.landing_footer_representative || "NGÔ HỒ ANH KHÔI");

  const address = language === 'en' && (!siteConfig?.landing_footer_address || siteConfig?.landing_footer_address.trim() === "P16, Đường số 8, KDC lô 49, Khu đô thị Nam Cần Thơ, Phường Cái Răng, TP. Cần Thơ")
    ? t.footer_address_value
    : (siteConfig?.landing_footer_address || "P16, Đường số 8, KDC lô 49, Khu đô thị Nam Cần Thơ, Phường Cái Răng, TP. Cần Thơ");

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

  // Parse custom eras if landing_eras_json is configured
  let erasData = null;
  if (siteConfig?.landing_eras_json) {
    try {
      const parsed = JSON.parse(siteConfig.landing_eras_json);
      if (Array.isArray(parsed)) {
        erasData = parsed;
      }
    } catch (e) {
      console.error("Lỗi parse landing_eras_json:", e);
    }
  }

  return (
    <div className="min-h-screen w-full bg-stone-50 font-sans text-stone-800 overflow-x-hidden selection:bg-red-200 selection:text-red-900 relative">
      {bgUrl && (
        <SecureImage
          src={bgUrl}
          isBackground={true}
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundAttachment: "fixed"
          }}
        >
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px]"></div>
        </SecureImage>
      )}
      <div className="relative z-10">
        <Navbar 
          logoUrl={logoUrl} 
          siteTitle={siteConfig?.site_title || "Sử Việt Chatbot"} 
          onStart={onStart} 
          user={user} 
          onPlayGame={() => setShowGame(true)} 
          gameEnabled={siteConfig?.game_enabled}
        />
        <HeroSection 
          onStart={onStart} 
          user={user} 
          heroTitle={siteConfig?.landing_hero_title}
          heroSubtitle={siteConfig?.landing_hero_subtitle}
          heroWords={siteConfig?.landing_hero_words}
        />
        <ProcessSection 
          sectionTitle={siteConfig?.landing_section_eras_title}
          processJson={siteConfig?.landing_process_json}
        />
        <FeaturesSection 
          onStart={onStart} 
          sectionTitle={siteConfig?.landing_section_features_title}
          featuresJson={siteConfig?.landing_features_json}
        />
        <ErasSection 
          erasData={erasData}
        />
        <StatsSection 
          sectionTitle={siteConfig?.landing_section_stats_title}
          statsJson={siteConfig?.landing_stats_json}
          highlightsJson={siteConfig?.landing_highlights_json}
        />
        <CTASection onStart={onStart} user={user} />
        <Footer onOpenModal={setActiveModal} siteConfig={siteConfig} />
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveModal(null)} className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center p-6 border-b border-stone-100 bg-stone-50/50">
                <h3 className="text-xl font-bold font-historical-premium text-stone-900">
                  {activeModal === 'about' ? t.modal_about_title : activeModal === 'terms' ? t.modal_terms_title : activeModal === 'privacy' ? t.modal_privacy_title : t.modal_contact_title}
                </h3>
                <button onClick={() => setActiveModal(null)} className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-stone-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-8 overflow-y-auto">
                {activeModal === 'about' && (
                  <>
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 bg-red-800 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg text-3xl font-historical-premium font-bold">史</div>
                      <h2 className="text-2xl font-bold text-stone-900">Sử Việt AI</h2>
                      <p className="text-stone-500">{t.modal_about_platform}</p>
                    </div>
                    <div className="space-y-6 text-stone-600 leading-relaxed">
                      <p className="whitespace-pre-line font-medium text-stone-700">
                        {language === 'en' && (!siteConfig?.landing_footer_about_us || siteConfig?.landing_footer_about_us.trim().startsWith("Sử Việt AI được xây dựng"))
                          ? t.footer_about_us_value
                          : (siteConfig?.landing_footer_about_us || t.footer_about_us_value)
                        }
                      </p>
                      <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 space-y-3 text-sm">
                        <h4 className="font-bold text-stone-900 text-base mb-2">{t.modal_about_info_title}</h4>
                        <p><strong>{t.modal_about_legal_name}</strong> {company}</p>
                        <p><strong>{t.modal_about_tax_code}</strong> {mst}</p>
                        <p><strong>{t.modal_about_rep}</strong> {representative}</p>
                        <p><strong>{t.modal_about_address}</strong> {address}</p>
                      </div>
                    </div>
                  </>
                )}
                {activeModal === 'terms' && (
                  <div className="space-y-6 text-stone-600 leading-relaxed whitespace-pre-line">
                    {language === 'en' && (!siteConfig?.landing_footer_terms || siteConfig?.landing_footer_terms.trim().startsWith("1. Chấp nhận điều khoản"))
                      ? t.footer_terms_value
                      : (siteConfig?.landing_footer_terms || t.footer_terms_value)
                    }
                  </div>
                )}
                {activeModal === 'privacy' && (
                  <div className="space-y-6 text-stone-600 leading-relaxed whitespace-pre-line">
                    {language === 'en' && (!siteConfig?.landing_footer_privacy || siteConfig?.landing_footer_privacy.trim().startsWith("1. Thu thập thông tin"))
                      ? t.footer_privacy_value
                      : (siteConfig?.landing_footer_privacy || t.footer_privacy_value)
                    }
                  </div>
                )}
                {activeModal === 'contact' && (
                  <div className="space-y-6 text-stone-600 leading-relaxed text-center">
                    <div className="w-16 h-16 bg-red-800 text-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                      <MessageCircle size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-stone-900 mb-2">{t.modal_contact_btn_label}</h2>
                    <p className="mb-8 text-stone-500">{t.modal_contact_subtitle}</p>

                    <div className="grid gap-4 max-w-sm mx-auto text-left">
                      <a href={`mailto:${siteConfig?.landing_contact_email || "nguyenquocdat888888@gmail.com"}`} className="flex items-center gap-4 p-4 rounded-2xl border border-stone-200 hover:border-red-800 hover:bg-red-50 transition-all group">
                        <div className="w-12 h-12 rounded-full bg-stone-100 group-hover:bg-red-200 flex items-center justify-center flex-shrink-0 text-red-800 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">Email</p>
                          <p className="font-bold text-stone-800 truncate text-sm">{siteConfig?.landing_contact_email || "nguyenquocdat888888@gmail.com"}</p>
                        </div>
                      </a>

                      <a href={siteConfig?.landing_contact_zalo_link || "https://zalo.me/0896498997"} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl border border-stone-200 hover:border-blue-500 hover:bg-blue-50 transition-all group">
                        <div className="w-12 h-12 rounded-full bg-stone-100 group-hover:bg-blue-200 flex items-center justify-center flex-shrink-0 text-blue-600 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">SĐT / Zalo</p>
                          <p className="font-bold text-stone-800 text-sm">{siteConfig?.landing_contact_zalo_num || "0896 498 997"}</p>
                        </div>
                      </a>

                      <a href={siteConfig?.landing_contact_fb_link || "https://www.facebook.com/nguyen.quoc.at.383270"} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl border border-stone-200 hover:border-blue-600 hover:bg-blue-50 transition-all group">
                        <div className="w-12 h-12 rounded-full bg-stone-100 group-hover:bg-blue-200 flex items-center justify-center flex-shrink-0 text-blue-700 transition-colors">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">{language === 'en' ? 'Community' : 'Cộng đồng'}</p>
                          <p className="font-bold text-stone-800 text-sm">Facebook</p>
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

      <GameModal isOpen={showGame} onClose={() => setShowGame(false)} />
    </div>
  );
};

export default LandingPage;