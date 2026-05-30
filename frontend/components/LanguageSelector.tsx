import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '../contexts/LanguageContext';

interface LanguageSelectorProps {
  onSelect: (lang: Language) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelect }) => {
  const [hovered, setHovered] = useState<Language | null>(null);
  const [selected, setSelected] = useState<Language | null>(null);

  const handleChoose = (lang: Language) => {
    setSelected(lang);
    setTimeout(() => onSelect(lang), 700);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f0505 0%, #1a0808 30%, #0d1117 70%, #050a0f 100%)',
      }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              width: Math.random() * 300 + 50,
              height: Math.random() * 300 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 2 === 0
                ? 'radial-gradient(circle, rgba(153,27,27,0.4) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(180,130,40,0.3) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.25, 0.1],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Dragon/Seal watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
        <svg viewBox="0 0 200 200" className="w-[600px] h-[600px]">
          <circle cx="100" cy="100" r="95" stroke="#b45309" strokeWidth="3" fill="none" />
          <circle cx="100" cy="100" r="85" stroke="#b45309" strokeWidth="1" fill="none" />
          <text x="100" y="115" textAnchor="middle" fontSize="80" fill="#b45309" fontFamily="serif">史</text>
        </svg>
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-4">
        {/* Logo / Icon */}
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mb-8"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-800 to-red-950 border-2 border-amber-500/50 flex items-center justify-center shadow-[0_0_60px_rgba(153,27,27,0.6)] mx-auto mb-4">
            <span className="text-amber-300 font-serif text-4xl font-bold italic">史</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-2"
        >
          <h1 className="text-white text-3xl md:text-4xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Chào mừng · Welcome
          </h1>
          <p className="text-stone-400 text-sm md:text-base">
            Chọn ngôn ngữ của bạn &nbsp;/&nbsp; Choose your language
          </p>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-48 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent mb-10"
        />

        {/* Language Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl"
        >
          {/* Vietnamese */}
          <AnimatePresence>
            <motion.button
              key="vi"
              onClick={() => handleChoose('vi')}
              onHoverStart={() => setHovered('vi')}
              onHoverEnd={() => setHovered(null)}
              whileTap={{ scale: 0.97 }}
              animate={selected === 'vi' ? { scale: 1.05, opacity: 1 } : selected === 'en' ? { opacity: 0.3 } : {}}
              className="relative group overflow-hidden rounded-3xl border-2 transition-all duration-300 p-7 text-left cursor-pointer"
              style={{
                background: hovered === 'vi' || selected === 'vi'
                  ? 'linear-gradient(135deg, rgba(153,27,27,0.25) 0%, rgba(20,5,5,0.9) 100%)'
                  : 'rgba(255,255,255,0.04)',
                borderColor: hovered === 'vi' || selected === 'vi' ? 'rgba(220,38,38,0.7)' : 'rgba(255,255,255,0.1)',
                boxShadow: hovered === 'vi' || selected === 'vi' ? '0 0 40px rgba(153,27,27,0.35), inset 0 0 30px rgba(153,27,27,0.1)' : 'none',
              }}
            >
              {/* Flag */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-10 rounded-lg overflow-hidden shadow-lg border border-white/20 shrink-0">
                  <svg viewBox="0 0 30 20" className="w-full h-full">
                    <rect width="30" height="20" fill="#da251d" />
                    <polygon points="15,4 11.47,14.85 20.73,8.15 9.27,8.15 18.53,14.85" fill="#ffff00" />
                  </svg>
                </div>
                <div>
                  <div className="text-white font-bold text-xl leading-tight">Tiếng Việt</div>
                  <div className="text-stone-400 text-xs">Vietnamese</div>
                </div>
              </div>

              <p className="text-stone-400 text-sm leading-relaxed">
                Giao diện và trợ lý AI sẽ hoàn toàn bằng <strong className="text-amber-400">Tiếng Việt</strong>. Câu hỏi và câu trả lời đều dùng tiếng Việt.
              </p>

              {/* Select indicator */}
              <motion.div
                className="mt-5 flex items-center gap-2 text-red-400 font-semibold text-sm"
                animate={{ x: hovered === 'vi' ? 4 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <span>Chọn Tiếng Việt</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </motion.div>

              {/* Glow corner */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-800/10 rounded-full -mr-16 -mt-16 pointer-events-none group-hover:bg-red-800/20 transition-colors" />
            </motion.button>

            {/* English */}
            <motion.button
              key="en"
              onClick={() => handleChoose('en')}
              onHoverStart={() => setHovered('en')}
              onHoverEnd={() => setHovered(null)}
              whileTap={{ scale: 0.97 }}
              animate={selected === 'en' ? { scale: 1.05, opacity: 1 } : selected === 'vi' ? { opacity: 0.3 } : {}}
              className="relative group overflow-hidden rounded-3xl border-2 transition-all duration-300 p-7 text-left cursor-pointer"
              style={{
                background: hovered === 'en' || selected === 'en'
                  ? 'linear-gradient(135deg, rgba(30,58,138,0.25) 0%, rgba(5,10,30,0.9) 100%)'
                  : 'rgba(255,255,255,0.04)',
                borderColor: hovered === 'en' || selected === 'en' ? 'rgba(59,130,246,0.7)' : 'rgba(255,255,255,0.1)',
                boxShadow: hovered === 'en' || selected === 'en' ? '0 0 40px rgba(59,130,246,0.25), inset 0 0 30px rgba(59,130,246,0.08)' : 'none',
              }}
            >
              {/* Flag */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-10 rounded-lg overflow-hidden shadow-lg border border-white/20 shrink-0">
                  <svg viewBox="0 0 60 40" className="w-full h-full">
                    <rect width="60" height="40" fill="#012169" />
                    <path d="M0,0 L60,40 M60,0 L0,40" stroke="white" strokeWidth="6" />
                    <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="4" />
                    <path d="M30,0 V40 M0,20 H60" stroke="white" strokeWidth="10" />
                    <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="6" />
                  </svg>
                </div>
                <div>
                  <div className="text-white font-bold text-xl leading-tight">English</div>
                  <div className="text-stone-400 text-xs">Tiếng Anh</div>
                </div>
              </div>

              <p className="text-stone-400 text-sm leading-relaxed">
                The interface and AI assistant will be entirely in <strong className="text-blue-400">English</strong>. All questions and answers will use English only.
              </p>

              {/* Select indicator */}
              <motion.div
                className="mt-5 flex items-center gap-2 text-blue-400 font-semibold text-sm"
                animate={{ x: hovered === 'en' ? 4 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <span>Select English</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </motion.div>

              {/* Glow corner */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-900/10 rounded-full -mr-16 -mt-16 pointer-events-none group-hover:bg-blue-900/20 transition-colors" />
            </motion.button>
          </AnimatePresence>
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-stone-600 text-xs mt-8 text-center"
        >
          Bạn có thể thay đổi ngôn ngữ bất cứ lúc nào &nbsp;·&nbsp; You can change language anytime
        </motion.p>
      </div>
    </motion.div>
  );
};

export default LanguageSelector;
