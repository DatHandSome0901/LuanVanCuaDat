import React from 'react';

interface PaymentsTabProps {
  payments: any[];
  paymentFilter: 'completed' | 'pending' | 'failed';
  setPaymentFilter: (filter: 'completed' | 'pending' | 'failed') => void;
}

const PaymentsTab: React.FC<PaymentsTabProps> = ({ 
  payments, 
  paymentFilter, 
  setPaymentFilter 
}) => {
  return (
    <div className="space-y-6 animate-in fade-in">
       <div className="flex bg-stone-100 p-1.5 rounded-2xl w-fit">
          {(['completed', 'pending', 'failed'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setPaymentFilter(filter)}
              className={`px-6 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                paymentFilter === filter 
                ? 'bg-white text-stone-900 shadow-sm' 
                : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              {filter === 'completed' ? 'Thành công' : filter === 'pending' ? 'Chờ Duyệt' : 'Bị Hủy'}
            </button>
          ))}
       </div>

       <div className="bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-500 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5 text-left">Mã</th>
                <th className="px-6 py-5 text-left">Phật Tử</th>
                <th className="px-6 py-5 text-right">Cúng Dường</th>
                <th className="px-6 py-5 text-left">Hiện Vật</th>
                <th className="px-6 py-5 text-center">Thực Tế</th>
                <th className="px-6 py-5 text-right">Khởi Tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {payments
                .filter((pm: any) => pm.status === paymentFilter)
                .map((pm: any) => (
                <tr key={pm.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-stone-400">#{pm.id}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-stone-800">{pm.username}</p>
                    <p className="text-[10px] text-stone-400">{pm.email}</p>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-stone-800">{pm.amount_vnd.toLocaleString()} đ</td>
                  <td className="px-6 py-4 font-bold text-amber-600">+{pm.tokens} Tokens</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-sm ${
                      pm.status === 'completed' ? 'bg-green-600 text-white' : 
                      pm.status === 'pending' ? 'bg-yellow-400 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {pm.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-stone-400 text-xs">{new Date(pm.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentsTab;
