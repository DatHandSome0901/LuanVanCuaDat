import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const localized = {
  vi: {
    modal_title: "Chi Tiết Cuộc Đàm Đạo",
    lbl_question: "Câu hỏi từ người dùng",
    lbl_answer: "LỜI GIẢI ĐÁP TỪ HỆ THỐNG",
    lbl_token: "Token sử dụng",
    lbl_verified: "Xác thực tại"
  },
  en: {
    modal_title: "Dialogue Details",
    lbl_question: "Scholar's Inquiry",
    lbl_answer: "SYSTEM HISTORICAL RESPONSE",
    lbl_token: "Tokens Consumed",
    lbl_verified: "Logged at"
  }
};

interface ChatLogDetailModalProps {
  chat: any;
  onClose: () => void;
}

const ChatLogDetailModal: React.FC<ChatLogDetailModalProps> = ({ chat, onClose }) => {
  const { language } = useLanguage();
  const tLocal = localized[language] || localized.vi;

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in duration-300">
         <div className="p-8 bg-stone-900 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center font-bold text-xl">問</div>
                <div>
                    <h3 className="text-xl font-bold">{tLocal.modal_title}</h3>
                    <p className="text-xs text-stone-404">ID: #{chat.id} • {chat.username}</p>
                </div>
            </div>
            <button onClick={onClose} className="text-white hover:rotate-90 transition-transform p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
         </div>
         
         <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 bg-stone-50 px-2 py-1 rounded">{tLocal.lbl_question}</label>
                <div className="bg-amber-50 p-6 rounded-3xl border-l-4 border-amber-400 text-stone-800 font-medium italic shadow-inner">
                    "{chat.question}"
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 bg-stone-50 px-2 py-1 rounded">{tLocal.lbl_answer}</label>
                <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed bg-white border border-stone-100 p-6 rounded-3xl shadow-sm">
                    {chat.answer}
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                <div className="flex gap-6">
                    <div className="text-center">
                        <p className="text-[10px] text-stone-400 font-bold uppercase">{tLocal.lbl_token}</p>
                        <p className="text-xl font-black text-amber-600">{chat.tokens_charged}</p>
                    </div>
                    {chat.sentiment && (
                        <div className="text-left border-l border-stone-100 pl-6">
                            <p className="text-[10px] text-stone-400 font-bold uppercase">
                                {language === 'vi' ? 'Khí sắc / Thái độ' : 'Sentiment'}
                            </p>
                            <p className="text-xs font-bold text-stone-700 mt-1 flex items-center gap-1.5">
                                {chat.sentiment === 'positive' && '😊 Tích cực / Hài lòng'}
                                {chat.sentiment === 'frustrated' && '😡 Tiêu cực / Bực bội'}
                                {chat.sentiment === 'inquisitive' && '🤔 Nghi vấn / Tầm sư'}
                                {chat.sentiment === 'jailbreak' && '🚨 Phá hoại / Jailbreak'}
                                {chat.sentiment === 'neutral' && '😐 Bình thường'}
                                {chat.sentiment_score !== undefined && chat.sentiment_score !== 0 && (
                                    <span className="text-[10px] text-stone-400 font-mono">
                                        ({chat.sentiment_score > 0 ? '+' : ''}{chat.sentiment_score.toFixed(1)})
                                    </span>
                                )}
                            </p>
                        </div>
                    )}
                </div>
                <div className="text-right text-xs text-stone-400 italic">
                    {tLocal.lbl_verified} {new Date(chat.created_at).toLocaleString()}
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ChatLogDetailModal;
