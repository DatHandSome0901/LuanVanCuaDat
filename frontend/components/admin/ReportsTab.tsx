import React from 'react';
import { Calendar, User, FileText, AlertCircle } from 'lucide-react';
import { API_ROOT } from '../../api';

const AvatarImage: React.FC<{ src?: string, alt: string }> = ({ src, alt }) => {
  const [error, setError] = React.useState(false);
  if (!src || error) {
    return (
      <div className="w-6 h-6 rounded bg-[#7f1d1d]/10 flex items-center justify-center text-[#7f1d1d] font-historical font-black text-xs shrink-0">
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

interface ReportsTabProps {
  reports: any[];
}

const ReportsTab: React.FC<ReportsTabProps> = ({ reports }) => {
  return (
    <div className="paper-texture scroll-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in pb-10">
      <div className="px-6 py-4 bg-gradient-to-r from-[#451a03] to-[#2c1609] border-b border-amber-500/30 flex justify-between items-center">
        <h3 className="font-historical text-lg text-amber-100 flex items-center gap-2">
          <span>📜</span> Sổ Sách Phúc Tra Sai Sót (Báo Cáo Sự Cố)
        </h3>
        <span className="text-xs text-amber-200/70 font-sans italic">Ghi nhận các khiếu nại hoặc sự cố từ sĩ tử</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#451a03]/20 text-[#7f1d1d] uppercase text-[10px] font-black tracking-widest border-b border-amber-800/10">
            <tr>
              <th className="px-6 py-5 text-left font-historical">Điểm Thời Gian</th>
              <th className="px-6 py-5 text-left font-historical">Nhân Sĩ Báo Cáo</th>
              <th className="px-6 py-5 text-left font-historical">Mã Hóa Đơn</th>
              <th className="px-6 py-5 text-left font-historical">Chi Tiết Sự Việc (Mô Tả)</th>
              <th className="px-6 py-5 text-center font-historical">Trạng Thái Phúc Tra</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#b45309]/10">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-20 italic text-amber-900/60 font-serif">
                  Khắp nơi bình yên, chưa ghi nhận sớ phúc tra sự cố nào...
                </td>
              </tr>
            ) : (
              reports.map((rep: any, idx: number) => (
                <tr key={rep.id || idx} className="hover:bg-amber-100/30 transition-colors">
                  {/* Thời Gian */}
                  <td className="px-6 py-4 text-stone-500 text-xs font-mono whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-amber-700/60" />
                      {new Date(rep.created_at).toLocaleString()}
                    </div>
                  </td>

                  {/* Người báo cáo */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <AvatarImage src={rep.picture_url} alt={rep.username} />
                      <div>
                        <span className="font-historical font-black text-[#7f1d1d]">{rep.username}</span>
                        <p className="text-[10px] text-stone-400 font-mono leading-none mt-0.5">{rep.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* ID Hóa Đơn */}
                  <td className="px-6 py-4 font-mono text-amber-800 font-bold text-xs">
                    #{rep.payment_id}
                  </td>

                  {/* Nội Dung */}
                  <td className="px-6 py-4 text-stone-700 font-serif italic text-xs">
                    <div className="flex items-center gap-1">
                      <AlertCircle size={12} className="text-[#7f1d1d]/40 shrink-0" />
                      <span>"{rep.description}"</span>
                    </div>
                  </td>

                  {/* Trạng Thái Stamp */}
                  <td className="px-6 py-4 text-center">
                    {rep.status === 'resolved' && (
                      <span className="inline-block px-3 py-1 bg-green-50 border-2 border-green-600 text-green-700 rounded-sm text-[9px] font-black uppercase tracking-wider shadow-sm font-historical transform rotate-[-2deg] border-double">
                        已決 Đã Giải Quyết
                      </span>
                    )}
                    {rep.status === 'ignored' && (
                      <span className="inline-block px-3 py-1 bg-stone-100 border border-stone-400 text-stone-500 rounded-sm text-[9px] font-black uppercase tracking-wider font-historical">
                        罷 Bỏ Qua
                      </span>
                    )}
                    {rep.status !== 'resolved' && rep.status !== 'ignored' && (
                      <span className="inline-block px-3 py-1 bg-amber-50 border-2 border-amber-500 text-amber-700 rounded-sm text-[9px] font-black uppercase tracking-wider shadow-sm font-historical transform rotate-[1deg] border-double">
                        侍閱 Đang Xét
                      </span>
                    )}
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

export default ReportsTab;
