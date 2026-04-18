import React from 'react';


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
  if (error) return <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center text-stone-500 font-bold uppercase">{alt[0]}</div>;
  return <img src={src} alt={alt} className="w-8 h-8 rounded-lg object-cover shadow-sm" onError={() => setError(true)} />;
};

const UsersTab: React.FC<UsersTabProps> = ({ 
  users, 
  isLoading, 
  onViewDetail, 
  onUpdateBalance, 
  onToggleAdmin, 
  onDeleteUser 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden animate-in fade-in duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-black tracking-widest">
            <tr>
              <th className="px-6 py-5 text-left">Người Dùng</th>
              <th className="px-6 py-5 text-left">Email</th>
              <th className="px-6 py-5 text-right">Công Đức (Tokens)</th>
              <th className="px-6 py-5 text-center">Vai Trò</th>
              <th className="px-6 py-5 text-center">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-20 italic text-stone-400">Đang tra cứu tàng kinh các...</td></tr>
            ) : users.map((u: any) => (
              <tr key={u.id} className="hover:bg-amber-50/30 transition-colors">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        {u.picture_url ? (
                          <AvatarImage src={u.picture_url} alt={u.username} />
                        ) : (
                          <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center text-stone-500 font-bold uppercase">{u.username[0]}</div>
                        )}
                        <span className="font-bold text-stone-800">{u.username}</span>
                    </div>
                </td>
                <td className="px-6 py-4 text-stone-500">{u.email}</td>
                <td className="px-6 py-4 text-right">
                    <span className={`font-black text-lg ${(u.token_balance ?? 0) < 5 ? 'text-red-500' : 'text-amber-600'}`}>
                        {(u.token_balance ?? 0).toFixed(2)}
                    </span>
                </td>
                <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${u.is_admin ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-400'}`}>
                        {u.is_admin ? 'Admin' : 'User'}
                    </span>
                </td>
                <td className="px-6 py-4 text-center space-x-2 whitespace-nowrap">
                   <button onClick={() => onViewDetail(u.id)} className="text-[10px] font-bold uppercase bg-stone-100 text-stone-600 px-3 py-1.5 rounded-lg hover:bg-stone-200 transition-all">Chi tiết</button>
                   <button onClick={() => onUpdateBalance(u.id, u.token_balance)} className="text-[10px] font-bold uppercase bg-white border border-stone-200 px-3 py-1.5 rounded-lg hover:border-amber-400 transition-all">Sửa dư</button>
                   
                   {/* Toggle Admin */}
                   <button 
                      onClick={() => onToggleAdmin(u.id, !!u.is_admin)} 
                      className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg transition-all ${
                          u.is_admin 
                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                          : 'bg-stone-900 text-white hover:bg-stone-800'
                      }`}
                   >
                       {u.is_admin ? 'Hạ cấp' : 'Thăng admin'}
                   </button>

                   {/* Delete protection */}
                   {!u.is_admin && (
                      <button onClick={() => onDeleteUser(u.id)} className="text-[10px] font-bold uppercase bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-600 hover:text-white transition-all">Xóa</button>
                   )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTab;
