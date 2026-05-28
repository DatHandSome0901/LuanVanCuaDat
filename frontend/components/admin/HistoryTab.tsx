import React from 'react';
import { Calendar, User, ArrowUpRight, ArrowDownLeft, FileText } from 'lucide-react';
import { API_ROOT } from '../../api';

const AvatarImage: React.FC<{ src?: string, alt: string }> = ({ src, alt }) => {
  const [error, setError] = React.useState(false);
  if (!src || error) {
    return (
      <div className="w-6 h-6 rounded bg-[#b45309]/10 flex items-center justify-center text-[#b45309] font-historical font-black text-xs shrink-0">
        {(alt || 'U')[0].toUpperCase()}
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

interface HistoryTabProps {
  history: any[];
}

const HistoryTab: React.FC<HistoryTabProps> = ({ history }) => {
  return (
    <div className="paper-texture scroll-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in pb-10">
      <div className="px-6 py-4 bg-gradient-to-r from-[#451a03] to-[#2c1609] border-b border-amber-500/30 flex justify-between items-center">
        <h3 className="font-historical text-lg text-amber-100 flex items-center gap-2">
          <span>📜</span> {"Nhật Ký Lưu Chuyển Ngân Tệ".normalize('NFC')}
        </h3>
        <span className="text-xs text-amber-200/70 font-sans italic">{"Ghi nhận việc luân chuyển linh tệ trên triều đình".normalize('NFC')}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#451a03]/20 text-[#7f1d1d] uppercase text-[10px] font-black tracking-widest border-b border-amber-800/10">
            <tr>
              <th className="px-6 py-5 text-left font-historical">{"Điểm Thời Gian".normalize('NFC')}</th>
              <th className="px-6 py-5 text-left font-historical">{"Nhân Sĩ Cực Lạc".normalize('NFC')}</th>
              <th className="px-6 py-5 text-center font-historical">{"Hình Thức".normalize('NFC')}</th>
              <th className="px-6 py-5 text-right font-historical">{"Số Lượng (Tệ)".normalize('NFC')}</th>
              <th className="px-6 py-5 text-left font-historical">{"Sự Tích (Lý Do)".normalize('NFC')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#b45309]/10">
            {history.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-20 italic text-amber-900/60 font-serif">
                  {"Không tìm thấy ghi chép luân chuyển nào trong thư văn...".normalize('NFC')}
                </td>
              </tr>
            ) : (
              history.map((h: any, i: number) => (
                <tr key={i} className="hover:bg-amber-100/30 transition-colors">
                  {/* Thời Gian */}
                  <td className="px-6 py-4 text-stone-500 text-xs font-mono whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-amber-700/60" />
                      {new Date(h.created_at).toLocaleString()}
                    </div>
                  </td>

                  {/* Người Dùng */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <AvatarImage src={h.picture_url} alt={h.username} />
                      <div>
                        <span className="font-historical font-black text-[#7f1d1d]">{h.username}</span>
                        <p className="text-[10px] text-stone-400 font-mono leading-none">{h.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Loại (Thu / Chi) */}
                  <td className="px-6 py-4 text-center">
                    {h.type === 'in' ? (
                      <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 bg-green-50 border border-green-600/30 text-green-700 rounded-sm text-[9px] font-black font-historical transform rotate-[-1deg]">
                        <ArrowDownLeft size={10} /> {"納 Thu Vực".normalize('NFC')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 bg-red-50 border border-red-600/30 text-red-700 rounded-sm text-[9px] font-black font-historical transform rotate-[1deg]">
                        <ArrowUpRight size={10} /> {"支 Chi Xuất".normalize('NFC')}
                      </span>
                    )}
                  </td>

                  {/* Lượng tệ */}
                  <td className={`px-6 py-4 text-right font-historical font-black text-base ${h.type === 'in' ? 'text-green-700' : 'text-red-700'}`}>
                    {h.type === 'in' ? '+' : '-'}{h.amount.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                  </td>

                  {/* Lý Do */}
                  <td className="px-6 py-4 text-stone-700 text-xs font-serif italic">
                    <div className="flex items-center gap-1.5">
                      <FileText size={12} className="text-amber-800/40 shrink-0" />
                      <span>"{h.description}"</span>
                    </div>
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

export default HistoryTab;
