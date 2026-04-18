import React from 'react';
import ConversationList from './chat/ConversationList';
import ConversationListMobile from '../mobile/ConversationListMobile';
import { Capacitor } from '@capacitor/core';
import { motion } from 'framer-motion';

const isNative = Capacitor.isNativePlatform();

interface HistoryViewProps {
  onSelect: (id: number) => void;
  activeId?: number | null;
}

const HistoryView: React.FC<HistoryViewProps> = ({ onSelect, activeId }) => {
  const handleNewChat = () => {
    localStorage.removeItem("conversation_id");
    window.dispatchEvent(new Event("new_chat"));
    onSelect(-1); // special ID for new chat
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f6f2] animate-in fade-in duration-500">
      {/* HEADER */}
      <header className="h-16 border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6">
        <h2 className="font-historical-premium text-xl font-bold text-red-950">Lịch sử</h2>
        {isNative && (
           <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleNewChat}
            className="p-2 bg-red-100 text-red-800 rounded-xl"
           >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
           </motion.button>
        )}
      </header>

      {/* LIST CONTAINER */}
      <div className="flex-1 overflow-y-auto p-4">
        {isNative && (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleNewChat}
            className="w-full mb-4 p-4 bg-gradient-to-br from-red-800 to-red-950 text-white rounded-2xl shadow-lg flex items-center justify-center gap-3 font-bold italic"
          >
            🚀 Tạo cuộc trò chuyện mới
          </motion.button>
        )}

        <div className={isNative ? "" : "bg-white rounded-3xl shadow-sm border border-stone-100 p-2"}>
            {isNative ? (
              <ConversationListMobile onSelect={onSelect} activeId={activeId} />
            ) : (
              <ConversationList onSelect={onSelect} activeId={activeId} />
            )}
        </div>
        
        {/* EMPTY HINT */}
        <p className="text-center text-stone-400 text-[10px] mt-8 mb-4 uppercase tracking-widest font-black opacity-50">
          Sử Việt Tri Ân • Lưu trữ lịch sử
        </p>
      </div>
    </div>
  );
};

export default HistoryView;
