
import React, { useState, useEffect } from "react";
import { API_ROOT } from "../api";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  siteConfig: any;
  onStart: () => void;
};

const texts = [
  "Ngược dòng thời gian...",
  "Khám phá hào khí dân tộc...",
  "Tìm hiểu sử thi Việt Nam...",
].map(s => s.normalize('NFC'));

const heroes = [
  "👑 Gia Long", "⚔️ Quang Trung", "🏹 Trần Hưng Đạo", "📜 Lý Thường Kiệt",
  "🔥 Hai Bà Trưng", "🐉 Lạc Long Quân", "🌊 Âu Cơ", "🛡️ Ngô Quyền",
  "🏯 Đinh Bộ Lĩnh", "📖 Lê Lợi", "🐘 Bà Triệu", "⚡ Phan Bội Châu",
].map(s => s.normalize('NFC'));

const LandingPageMobile: React.FC<Props> = ({ siteConfig, onStart }) => {
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [bubbles, setBubbles] = useState<any[]>([]);

  useEffect(() => {
    let i = 0;
    const current = texts[index];
    const typing = setInterval(() => {
      setDisplayText(Array.from(current).slice(0, i).join(''));
      i++;
      if (i > Array.from(current).length) {
        clearInterval(typing);
        setTimeout(() => setIndex((prev) => (prev + 1) % texts.length), 2000);
      }
    }, 50);
    return () => clearInterval(typing);
  }, [index]);

  useEffect(() => {
    const interval = setInterval(() => {
      const bubble = {
        id: Math.random(),
        left: Math.random() * 85 + 5,
        text: heroes[Math.floor(Math.random() * heroes.length)],
        duration: 4 + Math.random() * 4,
        size: 10 + Math.random() * 10
      };
      setBubbles(prev => [...prev.slice(-15), bubble]);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const bgUrl = siteConfig?.landing_bg && (siteConfig.landing_bg.startsWith("http") ? siteConfig.landing_bg : API_ROOT + siteConfig.landing_bg);
  const logoUrl = siteConfig?.logo_url && (siteConfig.logo_url.startsWith("http") ? siteConfig.logo_url : API_ROOT + siteConfig.logo_url);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#0c0606] text-white">
      
      {/* 📜 VINTAGE PAPER TEXTURE OVERLAY */}
      <div className="absolute inset-0 z-30 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/old-paper.png')]" />

      {/* IMMERSIVE BACKGROUND */}
      <motion.div 
        initial={{ scale: 1.15, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2.5, ease: "easeOut" }}
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: bgUrl ? `url("${bgUrl}")` : 'none' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/10 to-black/95" />
      </motion.div>

      {/* FLOAT BUBBLES - SOFT & DEEP */}
      <AnimatePresence>
        {bubbles.map(b => (
          <motion.div
            key={b.id}
            initial={{ y: "115vh", opacity: 0, x: b.left + "%", scale: 0.8 }}
            animate={{ y: "-20vh", opacity: [0, 0.6, 0.6, 0], scale: [0.8, 1.1, 1.1, 0.8] }}
            exit={{ opacity: 0 }}
            transition={{ duration: b.duration, ease: "linear" }}
            className="absolute z-10 whitespace-nowrap px-4 py-2 bg-amber-900/10 backdrop-blur-[2px] border border-amber-500/10 rounded-full text-[10px] font-bold text-amber-200/40 pointer-events-none"
          >
            {b.text}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* CONTENT LAYER */}
      <div className="relative z-40 h-full flex flex-col items-center justify-between py-12 px-8 text-center">
        
        {/* TOP: LOGO & BRAND */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="relative mb-6">
            <motion.div
               animate={{ 
                boxShadow: ["0 0 20px rgba(185,28,28,0.2)", "0 0 50px rgba(251,191,36,0.2)", "0 0 20px rgba(185,28,28,0.2)"] 
              }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="rounded-[32px] p-0.5 bg-gradient-to-tr from-amber-600/50 to-red-600/50"
            >
              <img
                src={logoUrl || "/default.jpg"}
                className="w-20 h-20 rounded-[30px] border border-white/10 object-cover"
              />
            </motion.div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-700 to-red-900 text-[8px] font-black px-3 py-1 rounded-full shadow-xl border border-white/20 whitespace-nowrap">📜 TRIỀU ĐẠI VIỆT</div>
          </div>
          
          <h1 className="text-[2.75rem] font-historical-premium tracking-tighter bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_8px_8px_rgba(0,0,0,0.8)] leading-none italic">
            {siteConfig?.site_title || "Sử Việt Chatbot"}
          </h1>
          <div className="h-0.5 w-32 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent mt-3" />
        </motion.div>

        {/* MIDDLE: QUOTE & TYPEWRITER */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col items-center gap-4 py-8"
        >
           <div className="text-amber-100/90 font-historical-premium italic text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,1)] min-h-[1.5em] tracking-wide">
            {displayText}
            <motion.span animate={{ opacity: [1,0] }} transition={{ repeat: Infinity }} className="ml-1 inline-block w-0.5 h-5 bg-amber-400 align-middle" />
          </div>
          <div className="flex items-center gap-4 opacity-50">
            <div className="h-px w-8 bg-amber-500/50" />
            <p className="text-amber-200 text-[10px] font-bold uppercase tracking-[0.3em]">
              Hào Khí Ngàn Năm
            </p>
            <div className="h-px w-8 bg-amber-500/50" />
          </div>
        </motion.div>

        {/* BOTTOM: ULTRA-PREMIUM BUTTON */}
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
          className="w-full flex flex-col gap-6"
        >
          <button
            onClick={() => {
              setLoading(true);
              setTimeout(onStart, 800);
            }}
            className="group relative w-full h-[72px] rounded-2xl overflow-hidden transition-all active:scale-[0.97]"
          >
            {/* RED GLASS BASE */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/90 via-red-800 to-red-950 backdrop-blur-md" />
            
            {/* GOLD BORDER INNER */}
            <div className="absolute inset-[1px] rounded-[15px] border border-amber-400/30" />
            
            {/* SHINE & HIGHLIGHTS */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/10" />
            
            <div className="relative flex items-center justify-center gap-4">
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="text-2xl">⚔️</span>
                  <span className="text-xl font-bold tracking-[0.1em] text-white uppercase italic drop-shadow-md">
                    Bắt đầu ngay
                  </span>
                </>
              )}
            </div>
            
            {/* ANIMATED GLOW STRIPE */}
            <motion.div 
              animate={{ left: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-[35deg]"
            />
          </button>
          
          <div className="flex flex-col items-center gap-1 opacity-40">
            <div className="text-[10px] text-amber-100 tracking-[0.4em] font-black uppercase">
              Tri Tuệ Nhân Tạo
            </div>
            <div className="h-1 w-1 bg-amber-500 rounded-full" />
          </div>
        </motion.div>

      </div>

      {/* DUST PARTICLES */}
      <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-screen z-10">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      </div>
    </div>
  );
};

export default LandingPageMobile;
