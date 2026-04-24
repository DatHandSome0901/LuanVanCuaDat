import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, PenTool, Book, Shield, Crown, ScrollText, History } from 'lucide-react';

interface EmptyChatStateProps {
  onSuggestClick: (q: string) => void;
}

const suggestions = [
  { text: "Trận Điện Biên Phủ", icon: <History className="text-red-800" size={18} /> },
  { text: "Sự tích Hồ Gươm", icon: <Sparkles className="text-amber-600" size={18} /> },
  { text: "Trần Hưng Đạo", icon: <Shield className="text-blue-700" size={18} /> },
  { text: "Vua Gia Long", icon: <Crown className="text-amber-500" size={18} /> },
  { text: "Hai Bà Trưng", icon: <ScrollText className="text-orange-700" size={18} /> },
  { text: "Tuyên ngôn Độc lập", icon: <Book className="text-emerald-700" size={18} /> },
];

const EmptyChatState: React.FC<EmptyChatStateProps> = ({ onSuggestClick }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center max-w-3xl mx-auto py-12 px-6 relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-[0.03] overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 border-[16px] border-red-900 rounded-full -ml-32 -mt-32"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 border-[16px] border-red-900 rounded-full -mr-48 -mb-48"></div>
      </div>

      {/* Historical Scroll Icon */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          y: [0, -10, 0] 
        }}
        transition={{ 
          scale: { duration: 0.5 },
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
        className="w-24 h-24 bg-gradient-to-br from-red-800 to-red-950 text-white rounded-[2rem] flex items-center justify-center mb-10 shadow-2xl shadow-red-950/40 border-4 border-white/10"
      >
        <PenTool size={40} className="drop-shadow-lg" />
      </motion.div>
 
      {/* CALLIGRAPHY QUOTE */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative mb-8"
      >
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-red-800/10 text-8xl font-historical-premium select-none pointer-events-none opacity-50">“</div>
        <h3 className="text-4xl md:text-6xl font-historical-premium text-red-950 px-4 leading-[1.1] drop-shadow-sm mb-6">
          {"Dân ta phải biết sử ta".normalize('NFC')}
        </h3>
        <div className="flex items-center justify-center gap-5">
          <div className="h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent flex-1 w-20 md:w-32" />
          <span className="text-stone-500 text-[10px] md:text-xs uppercase tracking-[0.4em] font-black whitespace-nowrap">{"Sử Việt Tri Ân".normalize('NFC')}</span>
          <div className="h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent flex-1 w-20 md:w-32" />
        </div>
      </motion.div>

      <p className="text-stone-600 text-sm md:text-lg mb-12 max-w-xl mx-auto leading-relaxed font-medium">
        {"Khám phá hào khí ngàn năm, những triều đại huy hoàng và những vị anh hùng đã làm nên hồn thiêng sông núi Việt Nam.".normalize('NFC')}
      </p>

      {/* SUGGESTION CHIPS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
        {suggestions.map((suggest, idx) => (
          <motion.button
            key={suggest.text}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + idx * 0.05 }}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSuggestClick(suggest.text.normalize('NFC'))}
            className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm border border-stone-200 rounded-[1.5rem] text-left shadow-sm hover:shadow-xl hover:shadow-red-900/5 hover:border-red-200 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-stone-50 group-hover:bg-red-50 flex items-center justify-center flex-shrink-0 transition-colors">
              {suggest.icon}
            </div>
            <span className="text-xs md:text-sm font-bold text-stone-700 truncate">{suggest.text.normalize('NFC')}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default EmptyChatState;