import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Book, Shield, Crown, ScrollText, History } from 'lucide-react';

interface EmptyChatStateProps {
  onSuggestClick: (q: string) => void;
}

const suggestions = [
  { text: "Trận Điện Biên Phủ", icon: History, color: "text-red-500", bg: "hover:bg-red-500/10", border: "group-hover:border-red-500/50", glow: "rgba(239, 68, 68, 0.4)" },
  { text: "Sự tích Hồ Gươm", icon: Sparkles, color: "text-amber-500", bg: "hover:bg-amber-500/10", border: "group-hover:border-amber-500/50", glow: "rgba(245, 158, 11, 0.4)" },
  { text: "Trần Hưng Đạo", icon: Shield, color: "text-blue-500", bg: "hover:bg-blue-500/10", border: "group-hover:border-blue-500/50", glow: "rgba(59, 130, 246, 0.4)" },
  { text: "Vua Gia Long", icon: Crown, color: "text-yellow-500", bg: "hover:bg-yellow-500/10", border: "group-hover:border-yellow-500/50", glow: "rgba(234, 179, 8, 0.4)" },
  { text: "Hai Bà Trưng", icon: ScrollText, color: "text-orange-500", bg: "hover:bg-orange-500/10", border: "group-hover:border-orange-500/50", glow: "rgba(249, 115, 22, 0.4)" },
  { text: "Tuyên ngôn Độc lập", icon: Book, color: "text-emerald-500", bg: "hover:bg-emerald-500/10", border: "group-hover:border-emerald-500/50", glow: "rgba(16, 185, 129, 0.4)" },
];

const EmptyChatState: React.FC<EmptyChatStateProps> = ({ onSuggestClick }) => {
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
          {"Dân ta phải biết sử ta".normalize('NFC')}
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
        {"Khám phá hào khí ngàn năm và những vị anh hùng đã làm nên hồn thiêng sông núi Việt Nam.".normalize('NFC')}
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
                  {suggest.text.normalize('NFC')}
                </span>
                <span className="hidden md:block text-[9px] text-white/40 uppercase tracking-widest mt-1 group-hover:text-white/60 transition-colors">
                  Khám phá ngay
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