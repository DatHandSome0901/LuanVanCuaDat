
import React, { useState, useEffect } from "react";
import { API_ROOT } from "../api";

type Props = {
  siteConfig: any;
  onStart: () => void;
};

const texts = [
  "Hỏi về chiến tranh Việt Nam...",
  "Tìm hiểu các triều đại...",
  "Khám phá nhân vật lịch sử...",
];

const heroes = [
  "👑 Gia Long",
  "⚔️ Quang Trung",
  "🏹 Trần Hưng Đạo",
  "📜 Lý Thường Kiệt",
  "🔥 Hai Bà Trưng",
  "🐉 Lạc Long Quân",
  "🌊 Âu Cơ",
  "🛡️ Ngô Quyền",
  "🏯 Đinh Bộ Lĩnh",
  "📖 Lê Lợi",
  "🐘 Bà Triệu",
  "⚡ Phan Bội Châu",
  "🧠 Hồ Chí Minh",
  "📚 Nguyễn Trãi",
  "🎖️ Võ Nguyên Giáp",
];

const LandingPage: React.FC<Props> = ({ siteConfig, onStart }) => {
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [effects, setEffects] = useState<any[]>([]);

  // 🎈 ADD
  const [bubbles, setBubbles] = useState<any[]>([]);
  const [showText, setShowText] = useState("");

  useEffect(() => {
    let i = 0;
    const current = texts[index];

    const typing = setInterval(() => {
      setDisplayText(current.slice(0, i));
      i++;
      if (i > current.length) {
        clearInterval(typing);
        setTimeout(() => {
          setIndex((prev) => (prev + 1) % texts.length);
        }, 1500);
      }
    }, 35);

    return () => clearInterval(typing);
  }, [index]);

  // 🎈 AUTO BUBBLE
  useEffect(() => {
    const interval = setInterval(() => {
      const hero = heroes[Math.floor(Math.random() * heroes.length)];

      const bubble = {
        id: Date.now() + Math.random(),
        left: Math.random() * 90,
        text: hero,
        color: Math.random() * 360, // 🎨 random màu
      };

      setBubbles((prev) => [...prev, bubble]);

      setTimeout(() => {
        setBubbles((prev) => prev.filter((b) => b.id !== bubble.id));
      }, 5000);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  const bgUrl =
    siteConfig?.landing_bg &&
    (siteConfig.landing_bg.startsWith("http")
      ? siteConfig.landing_bg
      : API_ROOT + siteConfig.landing_bg);

  const logoUrl =
    siteConfig?.logo_url &&
    (siteConfig.logo_url.startsWith("http")
      ? siteConfig.logo_url
      : API_ROOT + siteConfig.logo_url);

  const handleStart = () => {
    setLoading(true);
    setTimeout(() => onStart(), 600);
  };

  // 🎮 CODE GỐC
  const spawnEffect = (x: number, y: number) => {
    const text = heroes[Math.floor(Math.random() * heroes.length)];

    const newItem = {
      id: Date.now() + Math.random(),
      x,
      y,
      text,
    };

    setEffects((prev) => [...prev, newItem]);

    setTimeout(() => {
      setEffects((prev) => prev.filter((i) => i.id !== newItem.id));
    }, 2000);
  };

  return (
    <div
      onClick={(e) => spawnEffect(e.clientX, e.clientY)}
      className="h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: bgUrl ? `url("${bgUrl}")` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* CSS */}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0px) scale(0.8); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-200px) scale(1.2); opacity: 0; }
        }

        @keyframes floatBubble {
          0% {
            transform: translateY(100vh) scale(0.7);
            opacity: 0;
          }
          20% { opacity: 1; }
          100% {
            transform: translateY(-20vh) scale(1.1);
            opacity: 0;
          }
        }

        .floating-item {
          position: absolute;
          padding: 6px 12px;
          background: rgba(255,255,255,0.1);
          border-radius: 999px;
          font-size: 12px;
          color: #fff;
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255,255,255,0.2);
          animation: floatUp 2s ease forwards;
          pointer-events: none;
          z-index: 50;
        }

        .bubble {
          position: absolute;
          bottom: 0;
          padding: 10px 14px;
          border-radius: 999px;
          color: white;
          font-size: 14px;
          font-weight: bold;
          border: 2px solid rgba(255,255,255,0.7);
          backdrop-filter: blur(6px);
          animation: floatBubble 5s linear forwards;
          cursor: pointer;
          z-index: 999;
          box-shadow: 0 0 15px rgba(255,255,255,0.5);
        }

        .bubble:hover {
          transform: scale(1.2);
          box-shadow: 0 0 25px rgba(255,255,255,1);
        }

        .popup-text {
          position: absolute;
          top: 15%;
          left: 50%;
          transform: translateX(-50%);
          font-size: 28px;
          color: white;
          font-weight: bold;
          z-index: 1000;
          animation: floatUp 1s ease;
          text-shadow: 0 0 10px rgba(255,255,255,0.8);
        }

        @keyframes gradientMove {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }

        @keyframes float {
          0% { transform: translateY(0px) }
          50% { transform: translateY(-10px) }
          100% { transform: translateY(0px) }
        }

        @keyframes blink {
          0%,100% { opacity: 1 }
          50% { opacity: 0 }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientMove 10s ease infinite;
        }

        .float {
          animation: float 4s ease-in-out infinite;
        }

        .blink {
          animation: blink 1s infinite;
          color: #ff4d4f;
        }

        .text-gradient {
          background: linear-gradient(270deg, #ff4d4f, #ff7a45, #ff4d4f);
          background-size: 200% 200%;
          animation: gradientMove 6s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 via-transparent to-orange-900/20 animate-gradient" />
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px]" />

      {/* CARD */}
      <div className="relative z-10 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 md:p-14 shadow-[0_0_60px_rgba(0,0,0,0.6)] text-center max-w-2xl w-full transition duration-500 hover:scale-[1.02]">

        <img
          src={logoUrl || "/default.jpg"}
          className="w-20 mx-auto mb-6 rounded-2xl shadow-xl border border-white/10 float"
        />

        <h1 className="text-5xl md:text-6xl font-extrabold mb-3 text-gradient">
          {siteConfig?.site_title || "Chatbot Historical"}
        </h1>

        <p className="text-red-300 text-lg mb-6 h-6 font-medium tracking-wide">
          {displayText}
          <span className="ml-1 blink">|</span>
        </p>

        <p className="text-white/70 text-base mb-8">
          Hỏi đáp lịch sử Việt Nam bằng AI thông minh
        </p>

        <button
          onClick={handleStart}
          className="relative px-10 py-4 rounded-2xl text-lg font-semibold text-white bg-gradient-to-r from-red-600 via-red-500 to-orange-500 shadow-lg hover:scale-105 transition"
        >
          {loading ? "Đang vào..." : "🚀 Bắt đầu trò chuyện"}
        </button>
      </div>

      {/* EFFECT */}
      {effects.map((item) => (
        <div
          key={item.id}
          className="floating-item"
          style={{ left: item.x, top: item.y }}
        >
          {item.text}
        </div>
      ))}

      {/* 🎈 BUBBLE */}
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="bubble"
          style={{
            left: b.left + "%",
            background: `hsl(${b.color}, 80%, 60%)`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            setShowText(b.text);
            setTimeout(() => setShowText(""), 1000);
          }}
        >
          🎈
        </div>
      ))}

      {/* TEXT */}
      {showText && (
        <div className="popup-text">
          {showText}
        </div>
      )}

      {/* FOOTER */}
      <div className="absolute bottom-4 w-full text-center text-white/50 text-xs">
        © 2026 - AI Chatbot Lịch sử Việt Nam
      </div>
    </div>
  );
};

export default LandingPage;