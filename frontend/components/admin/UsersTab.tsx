import React from 'react';
import { API_ROOT } from '../../api';
import { Shield, User, Coins, Trash2, Edit2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface UsersTabProps {
  users: any[];
  isLoading: boolean;
  onViewDetail: (userId: number) => void;
  onUpdateBalance: (userId: number, currentBalance: number) => void;
  onToggleAdmin: (userId: number, currentStatus: boolean) => void;
  onDeleteUser: (userId: number) => void;
}

const AvatarImage: React.FC<{ src: string, alt: string }> = ({ src, alt }) => {
  const [error, setError] = React.useState(false);
  if (error) return <div className="w-8 h-8 bg-amber-100/50 border border-amber-200 rounded-lg flex items-center justify-center text-[#7f1d1d] font-historical font-black uppercase">{alt[0]}</div>;
  const finalSrc = src.startsWith('/') ? `${API_ROOT}${src}` : src;
  return <img src={finalSrc} alt={alt} className="w-8 h-8 rounded-lg object-cover shadow-sm border border-amber-500/20" referrerPolicy="no-referrer" onError={() => setError(true)} />;
};
const UsersTab: React.FC<UsersTabProps> = ({ 
  users, 
  isLoading, 
  onViewDetail, 
  onUpdateBalance, 
  onToggleAdmin, 
  onDeleteUser 
}) => {
  const { language } = useLanguage();

  const txt = {
    vi: {
      title: 'Danh Tịch Sĩ Tử Đăng Khoa',
      subtitle: 'Đang ghi nhận {count} nhân sĩ',
      col_scholar: 'Nhân Sĩ',
      col_email: 'Địa Chỉ Liên Lạc (Email)',
      col_tokens: 'Công Đức (Tokens)',
      col_rank: 'Chức Tước',
      col_action: 'Triều Đình Hành Sự',
      searching: 'Đang tra cứu Tàng Kinh Các, xin nhân sĩ kiên tâm đợi...',
      no_scholars: 'Không tìm thấy nhân sĩ nào...',
      rank_admin: 'Quan Lại',
      rank_user: 'Sĩ Tử',
      action_detail: 'Bản Sớ',
      action_gift: 'Tặng Tệ',
      action_demote: 'Hạ Chức',
      action_promote: 'Sắc Phong',
      action_ban: 'Bãi Bỏ'
    },
    en: {
      title: 'Register of Scholars',
      subtitle: 'Recording {count} scholars',
      col_scholar: 'Scholar',
      col_email: 'Contact Email',
      col_tokens: 'Merit Tokens',
      col_rank: 'Rank & Title',
      col_action: 'Court Actions',
      searching: 'Searching library archives, please wait...',
      no_scholars: 'No scholars found...',
      rank_admin: 'Official',
      rank_user: 'Scholar',
      action_detail: 'Petition',
      action_gift: 'Gift Tokens',
      action_demote: 'Demote',
      action_promote: 'Promote',
      action_ban: 'Dismiss'
    }
  }[language === 'en' ? 'en' : 'vi'];

  return (
    <div className="paper-texture scroll-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in duration-300">
      <div className="px-6 py-4 bg-gradient-to-r from-[#451a03] to-[#2c1609] border-b border-amber-500/30 flex justify-between items-center">
        <h3 className="font-historical text-lg text-amber-100 flex items-center gap-2">
          <span className="text-amber-400">📜</span> {txt.title}
        </h3>
        <span className="text-xs text-amber-200/70 font-sans italic">{txt.subtitle.replace('{count}', String(users.length))}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#451a03]/20 text-[#7f1d1d] uppercase text-[10px] font-black tracking-widest border-b border-amber-800/10">
            <tr>
              <th className="px-4 py-4 text-left font-historical">{txt.col_scholar}</th>
              <th className="px-4 py-4 text-left font-historical">{txt.col_email}</th>
              <th className="px-4 py-4 text-right font-historical">{txt.col_tokens}</th>
              <th className="px-4 py-4 text-center font-historical">{txt.col_rank}</th>
              <th className="px-4 py-4 text-center font-historical">{txt.col_action}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#b45309]/10">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-20 italic text-amber-900/60 font-serif">
                  {txt.searching}
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-20 italic text-stone-400 font-serif">
                  {txt.no_scholars}
                </td>
              </tr>
            ) : (
              users.map((u: any) => (
                <tr key={u.id} className="hover:bg-amber-100/30 transition-colors">
                  {/* Nhân Sĩ */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {u.picture_url ? (
                        <AvatarImage src={u.picture_url} alt={u.username} />
                      ) : (
                        <div className="w-8 h-8 bg-amber-100/50 border border-amber-300/30 rounded-lg flex items-center justify-center text-[#7f1d1d] font-historical font-black uppercase">
                          {u.username[0]}
                        </div>
                      )}
                      <div>
                        <span className="font-historical font-black text-[#7f1d1d] text-base block leading-none mb-1">{u.username}</span>
                        <span className="text-[10px] text-amber-800/60 font-serif italic">ID: #{u.id}</span>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3 text-stone-700 font-mono text-xs max-w-[160px] truncate" title={u.email}>{u.email}</td>

                  {/* Tokens */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Coins size={14} className="text-amber-600" />
                      <span className={`font-historical font-black text-lg ${(u.token_balance ?? 0) < 5 ? 'text-red-600' : 'text-amber-800'}`}>
                        {(u.token_balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </td>

                  {/* Chức Tước (Role Badge styled as Stamp) */}
                  <td className="px-4 py-3 text-center">
                    {u.is_admin ? (
                      <span className="inline-block px-3 py-1 bg-red-100 border border-red-600 text-red-700 rounded-sm text-[10px] font-black uppercase tracking-wider shadow-sm font-historical transform rotate-[-2deg] border-double">
                        印 {txt.rank_admin}
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 bg-amber-50 border border-amber-600/30 text-amber-800 rounded-sm text-[10px] font-bold uppercase tracking-wider font-historical">
                        {txt.rank_user}
                      </span>
                    )}
                  </td>

                  {/* Hành Sự */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-wrap gap-1.5 justify-center max-w-[200px] mx-auto">
                      {/* Chi tiết */}
                      <button 
                        onClick={() => onViewDetail(u.id)} 
                        className="text-[10px] font-bold uppercase bg-[#451a03]/5 hover:bg-[#451a03]/10 text-[#451a03] border border-[#451a03]/20 px-2 py-1 rounded-lg transition-all hover-lift active:scale-95 shrink-0"
                      >
                        {txt.action_detail}
                      </button>

                      {/* Sửa dư */}
                      <button 
                        onClick={() => onUpdateBalance(u.id, u.token_balance)} 
                        className="text-[10px] font-bold uppercase bg-amber-50 hover:bg-amber-100 text-[#b45309] border border-amber-400/40 px-2 py-1 rounded-lg transition-all hover-lift active:scale-95 shrink-0"
                      >
                        {txt.action_gift}
                      </button>
                      
                      {/* Toggle Admin */}
                      <button 
                        onClick={() => onToggleAdmin(u.id, !!u.is_admin)} 
                        className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg transition-all hover-lift active:scale-95 shrink-0 ${
                          u.is_admin 
                          ? 'bg-red-50 text-red-700 border border-red-300 hover:bg-red-100' 
                          : 'bg-[#7f1d1d] text-amber-100 border border-red-900 hover:bg-red-900'
                        }`}
                      >
                        {u.is_admin ? txt.action_demote : txt.action_promote}
                      </button>

                      {/* Delete protection */}
                      {!u.is_admin && (
                        <button 
                          onClick={() => onDeleteUser(u.id)} 
                          className="text-[10px] font-bold uppercase bg-stone-100 hover:bg-red-600 hover:text-white text-stone-500 border border-stone-200 hover:border-red-700 px-2 py-1 rounded-lg transition-all hover-lift active:scale-95 shrink-0"
                        >
                          {txt.action_ban}
                        </button>
                      )}
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
};export default UsersTab;
