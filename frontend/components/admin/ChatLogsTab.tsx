import React from 'react';

interface ChatLogsTabProps {
  chatlogs: any[];
  onSelectChat: (log: any) => void;
}

const ChatLogsTab: React.FC<ChatLogsTabProps> = ({ chatlogs, onSelectChat }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden animate-in fade-in">
       <div className="overflow-x-auto">
         <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-500 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5 text-left">Thời Gian</th>
                <th className="px-6 py-5 text-left">Người Hỏi</th>
                <th className="px-6 py-5 text-left">Câu Hỏi</th>
                <th className="px-6 py-5 text-right">Phí</th>
                <th className="px-6 py-5 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {chatlogs.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-20 italic text-stone-400">Chưa có nhật ký đàm đạo nào được ghi lại...</td></tr>
              ) : chatlogs.map((log: any) => (
                <tr key={log.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4 text-stone-400 text-xs">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-stone-800">{log.username}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-[300px] truncate italic text-stone-600">"{log.question}"</div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-red-400">-{log.tokens_charged}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => onSelectChat(log)} className="text-[10px] font-bold uppercase bg-stone-100 text-stone-600 px-3 py-1.5 rounded-lg hover:bg-stone-200 transition-all">Chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
         </table>
       </div>
    </div>
  );
};

export default ChatLogsTab;
