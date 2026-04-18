import React from 'react';

interface TransactionDetailModalProps {
  tx: any;
  onClose: () => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ tx, onClose }) => {
  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-amber-600 p-6 text-white flex justify-between items-center">
            <h3 className="text-xl font-serif font-bold">Chi Tiết Giao Dịch</h3>
            <button onClick={onClose} className="hover:opacity-80 transition-opacity">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-end border-b pb-4">
                <div>
                    <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-1">Thời gian</p>
                    <p className="text-stone-800 font-medium">{new Date(tx.created_at).toLocaleString('vi-VN')}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-1">Trạng thái</p>
                    <span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full uppercase">Thành công</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-stone-50 p-4 rounded-2xl">
                    <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-1">Loại hình</p>
                    <p className={`font-bold ${tx.type === 'in' ? 'text-green-600' : 'text-amber-600'}`}>
                        {tx.type === 'in' ? 'Tăng Công Đức' : 'Khai Phóng Trí Tuệ'}
                    </p>
                </div>
                <div className="bg-stone-50 p-4 rounded-2xl">
                    <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-1">Số lượng</p>
                    <p className={`text-xl font-bold ${tx.type === 'in' ? 'text-green-600' : 'text-amber-600'}`}>
                        {tx.type === 'in' ? '+' : '-'}{tx.amount} <span className="text-[10px] font-normal text-stone-400">Tokens</span>
                    </p>
                </div>
            </div>

            <div>
                <p className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-2">Nội dung chi tiết</p>
                <div className="bg-stone-50 p-4 rounded-2xl text-stone-700 text-sm leading-relaxed italic">
                    "{tx.description}"
                </div>
            </div>

            <button 
                onClick={onClose}
                className="w-full bg-stone-800 text-white font-bold py-4 rounded-2xl hover:bg-stone-900 transition-colors shadow-lg active:scale-[0.98]"
            >
                Đóng Cửa Sổ
            </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailModal;
