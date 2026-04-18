import React from 'react';

interface HistoryTabProps {
  history: any[];
}

const HistoryTab: React.FC<HistoryTabProps> = ({ history }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden animate-in fade-in">
       <div className="overflow-x-auto">
         <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-500 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5 text-left">Thời Gian</th>
                <th className="px-6 py-5 text-left">Phật Tử</th>
                <th className="px-6 py-5 text-left">Hợp Lễ</th>
                <th className="px-6 py-5 text-right">Lượng</th>
                <th className="px-6 py-5 text-left">Lý Do</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {history.map((h: any, i: number) => (
                <tr key={i} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4 text-stone-400 text-xs whitespace-nowrap">{new Date(h.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-stone-700">{h.username}</span>
                    <p className="text-[10px] text-stone-400">{h.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] uppercase font-bold ${h.type === 'in' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                      {h.type === 'in' ? 'Thu' : 'Chi'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-black ${h.type === 'in' ? 'text-green-600' : 'text-amber-600'}`}>{h.amount}</td>
                  <td className="px-6 py-4 text-stone-500 text-xs italic">"{h.description}"</td>
                </tr>
              ))}
            </tbody>
         </table>
       </div>
    </div>
  );
};

export default HistoryTab;
