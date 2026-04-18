import React from 'react';

interface LoginsTabProps {
  logins: any[];
}

const LoginsTab: React.FC<LoginsTabProps> = ({ logins }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden animate-in fade-in">
       <div className="overflow-x-auto">
         <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-500 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5 text-left">Thời Gian</th>
                <th className="px-6 py-5 text-left">Người Dùng</th>
                <th className="px-6 py-5 text-left">Email</th>
                <th className="px-6 py-5 text-left">IP Address</th>
                <th className="px-6 py-5 text-left">User Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {logins.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-20 italic text-stone-400">Chưa có lượt đăng nhập nào...</td></tr>
              ) : logins.map((log: any) => (
                <tr key={log.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4 text-stone-400 text-xs whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-stone-800">{log.username}</span>
                  </td>
                  <td className="px-6 py-4 text-stone-500 text-xs">{log.email}</td>
                  <td className="px-6 py-4 text-stone-600 font-mono text-xs">{log.ip_address}</td>
                  <td className="px-6 py-4 text-stone-400 text-[10px] max-w-xs truncate" title={log.user_agent}>{log.user_agent}</td>
                </tr>
              ))}
            </tbody>
         </table>
       </div>
    </div>
  );
};

export default LoginsTab;
