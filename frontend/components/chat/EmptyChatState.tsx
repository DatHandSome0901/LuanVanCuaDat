
import React from 'react';
import { motion } from 'framer-motion';

interface EmptyChatStateProps {
  onSuggestClick: (q: string) => void;
}

const suggestions = [
  { text: "Trận Điện Biên Phủ", icon: "⚔️" },
  { text: "Sự tích Hồ Gươm", icon: "🐢" },
  { text: "Trần Hưng Đạo", icon: "🛡️" },
  { text: "Vua Gia Long", icon: "👑" },
  { text: "Hai Bà Trưng", icon: "🐘" },
  { text: "Bản tuyên ngôn độc lập", icon: "📜" },
];

const EmptyChatState: React.FC<EmptyChatStateProps> = ({ onSuggestClick }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto py-12 px-6">
      
      {/* Historical Scroll Icon */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-24 h-24 bg-red-800 text-white rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-red-900/20 rotate-3"
      >
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </motion.div>

      {/* CALLIGRAPHY QUOTE */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative mb-10"
      >
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-red-800/20 text-6xl font-historical-premium">“</div>
        <h3 className="text-3xl md:text-5xl font-historical-premium text-red-950 px-4 leading-tight italic drop-shadow-sm">
          {"Dân ta phải biết sử ta".normalize('NFC')}
        </h3>
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="h-px bg-stone-200 w-12" />
          <span className="text-stone-400 text-xs uppercase tracking-[0.3em] font-black">{"Sử Việt Tri Ân".normalize('NFC')}</span>
          <div className="h-px bg-stone-200 w-12" />
        </div>
      </motion.div>

      <p className="text-stone-500 text-base md:text-lg mb-12 max-w-md mx-auto leading-relaxed">
        {"Tìm hiểu về các triều đại, những trận chiến oai hùng và những vị anh hùng kiệt xuất trong trang sử hào hùng của dân tộc.".normalize('NFC')}
      </p>

      {/* SUGGESTION CHIPS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full">
        {suggestions.map((suggest, idx) => (
          <motion.button
            key={suggest.text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + idx * 0.05 }}
            whileHover={{ scale: 1.03, backgroundColor: "rgb(254 242 242)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSuggestClick(suggest.text.normalize('NFC'))}
            className="flex items-center gap-2 p-3 bg-white border border-stone-100 rounded-2xl text-left shadow-sm hover:border-red-200 transition-all group"
          >
            <span className="text-lg group-hover:scale-125 transition-transform">{suggest.icon}</span>
            <span className="text-xs md:text-sm font-bold text-stone-700 truncate">{suggest.text.normalize('NFC')}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default EmptyChatState;