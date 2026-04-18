import React from 'react';

interface ReportsTabProps {
  reports: any[];
}

const ReportsTab: React.FC<ReportsTabProps> = ({ reports }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden animate-in fade-in">
       <div className="overflow-x-auto">
         <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-500 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5 text-left">Thời Gian</th>
                <th className="px-6 py-5 text-left">Người Dùng</th>
                <th className="px-6 py-5 text-left">Hóa Đơn</th>
                <th className="px-6 py-5 text-left">Mô Tả</th>
                <th className="px-6 py-5 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {reports.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-20 italic text-stone-400">Chưa có báo cáo thanh toán nào...</td></tr>
              ) : reports.map((rep: any) => (
                <tr key={rep.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4 text-stone-400 text-xs whitespace-nowrap">{new Date(rep.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-stone-800">{rep.username}</span>
                    <p className="text-[10px] text-stone-400">{rep.email}</p>
                  </td>
                  <td className="px-6 py-4 font-mono text-stone-500">#{rep.payment_id}</td>
                  <td className="px-6 py-4 text-stone-600 italic">"{rep.description}"</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                        rep.status === 'resolved' ? 'bg-green-50 text-green-600' : 
                        rep.status === 'ignored' ? 'bg-stone-100 text-stone-400' : 'bg-yellow-50 text-yellow-600'
                    }`}>
                      {rep.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
         </table>
       </div>
    </div>
  );
};

export default ReportsTab;
