import React from 'react';
import { Calendar, User, MessageSquare, Key, ArrowRight } from 'lucide-react';
import { API_ROOT } from '../../api';

const AvatarImage: React.FC<{ src?: string, alt: string }> = ({ src, alt }) => {
  const [error, setError] = React.useState(false);
  if (!src || error) {
    return (
      <div className="w-6 h-6 rounded bg-[#7f1d1d]/10 flex items-center justify-center text-[#7f1d1d] font-historical font-black text-xs shrink-0">
        {(alt || 'S')[0].toUpperCase()}
      </div>
    );
  }
  const finalSrc = src.startsWith('/') ? `${API_ROOT}${src}` : src;
  return (
    <img 
      src={finalSrc} 
      alt={alt} 
      className="w-6 h-6 rounded object-cover shadow-sm border border-amber-500/20 shrink-0" 
      referrerPolicy="no-referrer" 
      onError={() => setError(true)} 
    />
  );
};

interface ChatLogsTabProps {
  chatlogs: any[];
  onSelectChat: (log: any) => void;
}

const ChatLogsTab: React.FC<ChatLogsTabProps> = ({ chatlogs, onSelectChat }) => {
  return (
    <div className="paper-texture scroll-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in pb-10">
      <div className="px-6 py-4 bg-gradient-to-r from-[#451a03] to-[#2c1609] border-b border-amber-500/30 flex justify-between items-center">
        <h3 className="font-historical text-lg text-amber-100 flex items-center gap-2">
          <span>💬</span> Thư Tịch Đối Thoại (Nhật Ký Đàm Đạo)
        </h3>
        <span className="text-xs text-amber-200/70 font-sans italic">Ghi chép toàn bộ hội thoại giữa sĩ tử và Tri thức Sử Việt</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#451a03]/20 text-[#7f1d1d] uppercase text-[10px] font-black tracking-widest border-b border-amber-800/10">
            <tr>
              <th className="px-6 py-5 text-left font-historical">Can Chi (Thời Gian)</th>
              <th className="px-6 py-5 text-left font-historical">Nhân Sĩ Đàm Luận</th>
              <th className="px-6 py-5 text-left font-historical">Câu Hỏi (Tầm Sư Học Đạo)</th>
              <th className="px-6 py-5 text-right font-historical">Phí Giao Dịch</th>
              <th className="px-6 py-5 text-center font-historical">Chi Tiết Thư Văn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#b45309]/10">
            {chatlogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-20 italic text-amber-900/60 font-serif animate-pulse">
                  Chưa có nhật ký đàm đạo nào được ghi chép trong sử thư...
                </td>
              </tr>
            ) : (
              chatlogs.map((log: any) => (
                <tr key={log.id} className="hover:bg-amber-100/30 transition-colors">
                  {/* Thời Gian */}
                  <td className="px-6 py-4 text-stone-500 text-xs font-mono whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-amber-700/60" />
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </td>

                  {/* Người Hỏi */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <AvatarImage src={log.picture_url} alt={log.username} />
                      <span className="font-historical font-black text-[#7f1d1d]">{log.username || 'Sĩ tử ẩn danh'}</span>
                    </div>
                  </td>

                  {/* Câu Hỏi */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 max-w-[320px] truncate text-stone-700 font-serif italic text-xs">
                      <MessageSquare size={12} className="text-[#b45309]/50 shrink-0" />
                      <span>"{log.question}"</span>
                    </div>
                  </td>

                  {/* Phí charged */}
                  <td className="px-6 py-4 text-right">
                    <span className="font-historical font-black text-red-700 text-base">
                      -{log.tokens_charged?.toLocaleString() || 0} Tệ
                    </span>
                  </td>

                  {/* Chi tiết */}
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => onSelectChat(log)} 
                      className="text-[10px] font-bold uppercase bg-amber-50 hover:bg-[#7f1d1d] hover:text-amber-100 text-[#b45309] border border-amber-300/60 px-3.5 py-1.5 rounded-lg transition-all hover-lift active:scale-95 flex items-center gap-1 mx-auto"
                    >
                      Mở Sớ <ArrowRight size={10} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChatLogsTab;
