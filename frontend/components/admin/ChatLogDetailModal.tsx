import React from 'react';

interface ChatLogDetailModalProps {
  chat: any;
  onClose: () => void;
}

const ChatLogDetailModal: React.FC<ChatLogDetailModalProps> = ({ chat, onClose }) => {
  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in duration-300">
         <div className="p-8 bg-stone-900 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center font-bold text-xl">問</div>
                <div>
                    <h3 className="text-xl font-bold">Chi Tiết Cuộc Đàm Đạo</h3>
                    <p className="text-xs text-stone-400">ID: #{chat.id} • {chat.username}</p>
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
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 bg-stone-50 px-2 py-1 rounded">Câu hỏi từ phật tử</label>
                <div className="bg-amber-50 p-6 rounded-3xl border-l-4 border-amber-400 text-stone-800 font-medium italic shadow-inner">
                    "{chat.question}"
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 bg-stone-50 px-2 py-1 rounded">LỜI GIẢI ĐÁP TỪ HỆ THỐNG</label>
                <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed bg-white border border-stone-100 p-6 rounded-3xl shadow-sm">
                    {chat.answer}
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                <div className="flex gap-4">
                    <div className="text-center">
                        <p className="text-[10px] text-stone-400 font-bold uppercase">Token sử dụng</p>
                        <p className="text-xl font-black text-amber-600">{chat.tokens_charged}</p>
                    </div>
                </div>
                <div className="text-right text-xs text-stone-400 italic">
                    Xác thực tại {new Date(chat.created_at).toLocaleString()}
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ChatLogDetailModal;
