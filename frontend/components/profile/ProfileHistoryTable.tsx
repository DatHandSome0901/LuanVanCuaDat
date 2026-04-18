import React from 'react';

interface ProfileHistoryTableProps {
  history: any[];
  isLoading: boolean;
  onViewTx: (tx: any) => void;
}

const ProfileHistoryTable: React.FC<ProfileHistoryTableProps> = ({ 
  history, 
  isLoading, 
  onViewTx 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-stone-50 bg-stone-50/50">
          <h3 className="font-bold text-stone-800">Lịch sử tu tập (Giao dịch)</h3>
      </div>
      
      <div className="overflow-x-auto">
          <table className="w-full text-sm">
              <thead className="bg-stone-50 text-stone-400">
                  <tr>
                      <th className="px-4 md:px-6 py-3 text-left font-medium uppercase tracking-wider">Ngày</th>
                      <th className="px-4 md:px-6 py-3 text-left font-medium uppercase tracking-wider">Loại</th>
                      <th className="px-4 md:px-6 py-3 text-right font-medium uppercase tracking-wider">Số lượng</th>
                      <th className="hidden md:table-cell px-6 py-3 text-left font-medium uppercase tracking-wider">Nội dung</th>
                      <th className="px-4 md:px-6 py-3 text-center font-medium uppercase tracking-wider">Thao tác</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                  {isLoading ? (
                      <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-stone-400 italic">Đang tải lịch sử...</td>
                      </tr>
                  ) : history.length === 0 ? (
                      <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-stone-400 italic">Chưa có giao dịch nào.</td>
                      </tr>
                  ) : (
                      history.map((h, i) => (
                          <tr 
                              key={i} 
                              onClick={() => onViewTx(h)}
                              className="hover:bg-amber-50/50 transition-colors cursor-pointer group"
                          >
                              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-stone-500">
                                  {new Date(h.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-4 md:px-6 py-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                      h.type === 'in' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                                  }`}>
                                      {h.type === 'in' ? 'Nhận' : 'Chi'}
                                  </span>
                              </td>
                              <td className={`px-4 md:px-6 py-4 text-right font-bold ${
                                  h.type === 'in' ? 'text-green-600' : 'text-amber-600'
                              }`}>
                                  {h.type === 'in' ? '+' : '-'}{h.amount}
                              </td>
                              <td className="hidden md:table-cell px-6 py-4 text-stone-600 max-w-[150px] truncate">
                                  {h.description}
                              </td>
                              <td className="px-4 md:px-6 py-4 text-center">
                                  <button className="text-[10px] font-bold uppercase text-amber-600 bg-amber-50 px-2 py-1 rounded hover:bg-amber-600 hover:text-white transition-all">
                                      Xem
                                  </button>
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

export default ProfileHistoryTable;
