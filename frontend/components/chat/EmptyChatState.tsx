import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

interface EmptyChatStateProps {
  onSuggestClick: (q: string) => void;
}

// Icon Cờ Thần / Cờ Ngũ Sắc
const IconCoThan = ({ className, size = 24 }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M4 2v20" strokeLinecap="round" />
    <path d="M4 4h12l2 2l-2 2h-12" fill="currentColor" fillOpacity="0.2" />
    <rect x="7" y="6" width="4" height="4" />
    <rect x="5.5" y="4.5" width="7" height="7" />
    <path d="M16 4v6M18 6v4" strokeLinecap="round" />
  </svg>
);

// Icon Gươm Báu
const IconGuomBau = ({ className, size = 24 }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M12 3v13M12 4v11" strokeLinecap="round" />
    <path d="M8 15c1-0.5 2-1 4-1s3 0.5 4 1c0.5 0.5 0.5 1 0 1.5c-1 0.5-2 1-4 1s-3-0.5-4-1c-0.5-0.5-0.5-1 0-1.5z" fill="currentColor" fillOpacity="0.2" />
    <path d="M12 16v4" strokeLinecap="round" />
    <circle cx="12" cy="20.5" r="0.5" />
  </svg>
);

// Icon Khiên Mây
const IconKhienMay = ({ className, size = 24 }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.2" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v18M3 12h18" strokeDasharray="1 1" />
  </svg>
);

// Icon Mũ Bình Thiên
const IconMuBinhThien = ({ className, size = 24 }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M7 16h10v2H7z" fill="currentColor" fillOpacity="0.2" />
    <path d="M4 10h16v1.5H4z" />
    <path d="M9 11.5v4.5M15 11.5v4.5M12 11.5v4.5" />
    <path d="M4.5 11.5v4M19.5 11.5v4" strokeLinecap="round" strokeDasharray="1 1" />
    <circle cx="4.5" cy="16" r="0.5" fill="currentColor" />
    <circle cx="19.5" cy="16" r="0.5" fill="currentColor" />
  </svg>
);

// Icon Cuốn Thư
const IconCuonThu = ({ className, size = 24 }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <rect x="3" y="4" width="2" height="16" rx="0.5" />
    <rect x="19" y="4" width="2" height="16" rx="0.5" />
    <path d="M5 6h14M5 18h14M5 9h14M5 12h10M5 15h12" strokeLinecap="round" />
  </svg>
);

const suggestions = [
  { text: "Trận Điện Biên Phủ", icon: IconCoThan, color: "text-red-500", bg: "hover:bg-red-500/10", border: "group-hover:border-red-500/50", glow: "rgba(239, 68, 68, 0.4)" },
  { text: "Sự tích Hồ Gươm", icon: IconGuomBau, color: "text-amber-500", bg: "hover:bg-amber-500/10", border: "group-hover:border-amber-500/50", glow: "rgba(245, 158, 11, 0.4)" },
  { text: "Trần Hưng Đạo", icon: IconKhienMay, color: "text-blue-500", bg: "hover:bg-blue-500/10", border: "group-hover:border-blue-500/50", glow: "rgba(59, 130, 246, 0.4)" },
  { text: "Vua Gia Long", icon: IconMuBinhThien, color: "text-yellow-500", bg: "hover:bg-yellow-500/10", border: "group-hover:border-yellow-500/50", glow: "rgba(234, 179, 8, 0.4)" },
  { text: "Hai Bà Trưng", icon: IconCoThan, color: "text-orange-500", bg: "hover:bg-orange-500/10", border: "group-hover:border-orange-500/50", glow: "rgba(249, 115, 22, 0.4)" },
  { text: "Tuyên ngôn Độc lập", icon: IconCuonThu, color: "text-emerald-500", bg: "hover:bg-emerald-500/10", border: "group-hover:border-emerald-500/50", glow: "rgba(16, 185, 129, 0.4)" },
];

const EmptyChatState: React.FC<EmptyChatStateProps> = ({ onSuggestClick }) => {
  const { t } = useLanguage();
  let suggestions: Array<{ text: string; icon: any; color: string; bg: string; border: string; glow: string }> = [];
  try {
    const raw = JSON.parse(t.chat_suggestions);
    const colors = [
      { color: "text-red-500", bg: "hover:bg-red-500/10", border: "group-hover:border-red-500/50", glow: "rgba(239,68,68,0.4)", icon: IconCoThan },
      { color: "text-amber-500", bg: "hover:bg-amber-500/10", border: "group-hover:border-amber-500/50", glow: "rgba(245,158,11,0.4)", icon: IconGuomBau },
      { color: "text-blue-500", bg: "hover:bg-blue-500/10", border: "group-hover:border-blue-500/50", glow: "rgba(59,130,246,0.4)", icon: IconKhienMay },
      { color: "text-yellow-500", bg: "hover:bg-yellow-500/10", border: "group-hover:border-yellow-500/50", glow: "rgba(234,179,8,0.4)", icon: IconMuBinhThien },
      { color: "text-orange-500", bg: "hover:bg-orange-500/10", border: "group-hover:border-orange-500/50", glow: "rgba(249,115,22,0.4)", icon: IconCoThan },
      { color: "text-emerald-500", bg: "hover:bg-emerald-500/10", border: "group-hover:border-emerald-500/50", glow: "rgba(16,185,129,0.4)", icon: IconCuonThu },
    ];
    suggestions = raw.map((s: any, i: number) => ({ ...colors[i % colors.length], text: s.text }));
  } catch { }
  return (
    <div className="h-full flex flex-col items-center justify-center text-center max-w-4xl mx-auto py-8 md:py-16 px-4 md:px-8 relative overflow-hidden">
      
      {/* National Flag Icon */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, y: [0, -5, 0] }}
        transition={{ scale: { duration: 0.5 }, y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
        className="w-20 md:w-32 h-14 md:h-24 bg-red-600 rounded-2xl flex items-center justify-center mb-6 md:mb-12 shadow-[0_0_50px_rgba(220,38,38,0.4)] border-2 border-amber-400 overflow-hidden relative shrink-0"
      >
        <svg viewBox="0 0 30 20" className="w-full h-full shadow-inner">
          <rect width="30" height="20" fill="#da251d"/>
          <polygon points="15,4 11.47,14.85 20.73,8.15 9.27,8.15 18.53,14.85" fill="#ffff00"/>
        </svg>
      </motion.div>
 
      {/* CALLIGRAPHY QUOTE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative mb-6 md:mb-10"
      >
        <h3 className="text-3xl md:text-7xl font-historical-premium text-white px-4 leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] mb-2 md:mb-8 italic tracking-wide">
          {t.chat_empty_title}
        </h3>
        <div className="flex items-center justify-center gap-4 md:gap-8">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent flex-1 w-12 md:w-40" />
          <span className="text-amber-300 text-[8px] md:text-sm uppercase tracking-[0.3em] md:tracking-[0.6em] font-black whitespace-nowrap drop-shadow-lg">
            {"Sử Việt Tri Ân".normalize('NFC')}
          </span>
          <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent flex-1 w-12 md:w-40" />
        </div>
      </motion.div>

      <p className="text-amber-50/90 text-xs md:text-xl mb-8 md:mb-16 max-w-[320px] md:max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-md">
        {t.chat_empty_subtitle}
      </p>

      {/* SUGGESTION CHIPS - Premium Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 w-full max-w-4xl">
        {suggestions.map((suggest, idx) => {
          const Icon = suggest.icon;
          return (
            <motion.button
              key={suggest.text}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                delay: 0.5 + idx * 0.08,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: `0 0 25px ${suggest.glow}`,
                backgroundColor: "rgba(255, 255, 255, 0.15)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSuggestClick(suggest.text.normalize('NFC'))}
              className={`flex flex-col md:flex-row items-center gap-2 md:gap-4 p-3 md:p-5 bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-[2rem] text-center md:text-left transition-all group overflow-hidden relative`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/20 group-hover:border-white/40 transition-colors shadow-inner`}>
                <Icon className={`${suggest.color} group-hover:scale-110 transition-transform`} size={24} />
              </div>
              
              <div className="flex flex-col">
                <span className="text-[11px] md:text-base font-bold text-white group-hover:text-amber-200 transition-colors tracking-tight leading-tight">
                  {suggest.text}
                </span>
                <span className="hidden md:block text-[9px] text-white/40 uppercase tracking-widest mt-1 group-hover:text-white/60 transition-colors">
                  {t.chat_suggest_label}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default EmptyChatState;