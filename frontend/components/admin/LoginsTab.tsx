import React from 'react';
import { Calendar, User, ShieldAlert, Monitor } from 'lucide-react';
import { API_ROOT } from '../../api';
import { useLanguage } from '../../contexts/LanguageContext';

const localized = {
  vi: {
    title: "🛡️ Sổ Sách Giám Sát Truy Cập (Canh Phòng Lối Vào)",
    subtitle: "Giám sát hành tung nhập môn của các nhân sĩ",
    col_time: "Giờ Canh (Thời Gian)",
    col_user: "Nhân Sĩ",
    col_email: "Liên Lạc (Email)",
    col_ip: "Địa Chỉ Mạng (IP)",
    col_device: "Thiết Bị (Thông Tin Hành Trình)",
    empty_records: "Không có sĩ tử nào đăng nhập thời gian này...",
    hidden_ip: "Địa chỉ ẩn",
    unknown: "Không rõ"
  },
  en: {
    title: "🛡️ Access Audit Records (Entrance Watch)",
    subtitle: "Monitor portal access logs of scholars",
    col_time: "Timestamp",
    col_user: "Scholar",
    col_email: "Contact (Email)",
    col_ip: "Network Address (IP)",
    col_device: "Device (User Agent)",
    empty_records: "No scholar logins recorded during this period...",
    hidden_ip: "Hidden IP",
    unknown: "Unknown"
  }
};

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

interface LoginsTabProps {
  logins: any[];
}

const LoginsTab: React.FC<LoginsTabProps> = ({ logins }) => {
  const { language } = useLanguage();
  const tLocal = localized[language] || localized.vi;

  return (
    <div className="paper-texture scroll-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in pb-10">
      <div className="px-6 py-4 bg-gradient-to-r from-[#451a03] to-[#2c1609] border-b border-amber-500/30 flex justify-between items-center">
        <h3 className="font-historical text-lg text-amber-100 flex items-center gap-2">
          <span>🛡️</span> {tLocal.title}
        </h3>
        <span className="text-xs text-amber-200/70 font-sans italic">{tLocal.subtitle}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#451a03]/20 text-[#7f1d1d] uppercase text-[10px] font-black tracking-widest border-b border-amber-800/10">
            <tr>
              <th className="px-6 py-5 text-left font-historical">{tLocal.col_time}</th>
              <th className="px-6 py-5 text-left font-historical">{tLocal.col_user}</th>
              <th className="px-6 py-5 text-left font-historical">{tLocal.col_email}</th>
              <th className="px-6 py-5 text-left font-historical">{tLocal.col_ip}</th>
              <th className="px-6 py-5 text-left font-historical">{tLocal.col_device}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#b45309]/10">
            {logins.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-20 italic text-amber-900/60 font-serif">
                  {tLocal.empty_records}
                </td>
              </tr>
            ) : (
              logins.map((log: any, idx: number) => (
                <tr key={log.id || idx} className="hover:bg-amber-100/30 transition-colors">
                  {/* Thời Gian */}
                  <td className="px-6 py-4 text-stone-500 text-xs font-mono whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-amber-700/60" />
                      {new Date(log.login_time || log.created_at || 0).toLocaleString()}
                    </div>
                  </td>

                  {/* Tên nhân sĩ */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <AvatarImage src={log.picture_url} alt={log.username} />
                      <span className="font-historical font-black text-[#7f1d1d]">{log.username}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 text-stone-605 text-xs font-mono">{log.email}</td>

                  {/* IP Address */}
                  <td className="px-6 py-4 text-amber-900 font-mono text-xs">
                    <div className="flex items-center gap-1">
                      <ShieldAlert size={12} className="text-[#b45309]/50" />
                      {log.ip_address || tLocal.hidden_ip}
                    </div>
                  </td>

                  {/* User Agent */}
                  <td className="px-6 py-4 text-stone-500 text-[10px] max-w-xs truncate" title={log.user_agent}>
                    <div className="flex items-center gap-1">
                      <Monitor size={12} className="text-stone-400 shrink-0" />
                      <span className="truncate">{log.user_agent || tLocal.unknown}</span>
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

export default LoginsTab;
