import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeartPulse, Keyboard, Swords, X } from "lucide-react";
import { ScreenOrientation } from "@capacitor/screen-orientation";
import { Capacitor } from "@capacitor/core";

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GameModal: React.FC<GameModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handleOrientation = async () => {
      try {
        if (isOpen) {
          await ScreenOrientation.lock({ orientation: "landscape" });
        } else {
          await ScreenOrientation.unlock();
        }
      } catch (err) {
        console.error("ScreenOrientation error:", err);
      }
    };

    handleOrientation();

    return () => {
      if (Capacitor.isNativePlatform()) {
        ScreenOrientation.unlock().catch(() => {});
      }
    };
  }, [isOpen]);
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#090504] overflow-hidden select-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_20%,rgba(180,83,9,0.22),transparent_34%),radial-gradient(circle_at_20%_80%,rgba(127,29,29,0.2),transparent_30%),#090504]"
          />

          <motion.div
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative z-10 flex h-full w-full flex-col items-center justify-center px-5 py-7 md:px-10 md:py-9"
          >
            <div className="pointer-events-none absolute left-5 right-5 top-5 z-50 flex items-center justify-between gap-4 md:left-10 md:right-10 md:top-7">
              <div className="hidden items-center gap-2 rounded-full border border-amber-500/25 bg-stone-950/82 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.22em] text-amber-300 shadow-lg backdrop-blur-md md:flex">
                <Swords size={15} />
                Hào Khí Lam Sơn
              </div>

              <div className="hidden items-center gap-3 rounded-full border border-amber-500/20 bg-stone-950/82 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-stone-200 shadow-lg backdrop-blur-md lg:flex">
                <span className="inline-flex items-center gap-1.5">
                  <Keyboard size={14} /> ESC tạm dừng
                </span>
                <span className="h-4 w-px bg-amber-500/25" />
                <span>J đánh</span>
                <span>K kỹ năng</span>
                <span className="inline-flex items-center gap-1.5 text-sky-300">L đỡ đòn</span>
                <span className="inline-flex items-center gap-1.5">
                  <HeartPulse size={14} className="text-red-400" /> E dùng bình máu
                </span>
              </div>

              <button
                onClick={onClose}
                className="pointer-events-auto ml-auto flex h-12 w-12 items-center justify-center rounded-full border border-red-400/35 bg-red-950/90 text-white shadow-lg backdrop-blur-md transition-all duration-200 hover:bg-red-800 hover:shadow-[0_0_18px_rgba(239,68,68,0.55)] active:scale-95 md:h-14 md:w-14"
                aria-label="Đóng trò chơi"
              >
                <X size={28} />
              </button>
            </div>

            <div className="relative aspect-[16/9] w-full max-w-[min(1560px,calc(100vw-48px))] max-h-[calc(100vh-76px)] overflow-hidden rounded-[28px] border border-amber-500/35 bg-black shadow-[0_28px_80px_rgba(0,0,0,0.92),0_0_0_1px_rgba(251,191,36,0.08)]">
              <div className="pointer-events-none absolute inset-0 z-10 rounded-[28px] ring-1 ring-inset ring-amber-200/12" />
              <iframe
                src="/game/index.html"
                className="block h-full w-full border-0"
                title="Hào Khí Lam Sơn Game"
                allow="autoplay; gamepad"
                allowFullScreen
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
