import React, { useState } from 'react';
import { api } from '../../api';
import toast from 'react-hot-toast';

interface PaymentReportModalProps {
  onClose: () => void;
}

const PaymentReportModal: React.FC<PaymentReportModalProps> = ({ onClose }) => {
  const [reportNote, setReportNote] = useState('');
  const [reportPaymentId, setReportPaymentId] = useState('');

  const handleSubmit = async () => {
    if (!reportPaymentId || !reportNote.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    const loadingToast = toast.loading('Đang gửi tâm nguyện...');
    try {
      await api.createPaymentReport(parseInt(reportPaymentId), reportNote);
      toast.success('Gửi thành công! Admin sẽ kiểm tra sớm.');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Không thể gửi báo cáo');
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
       <div className="bg-white rounded-[40px] p-8 max-w-md w-full relative animate-in zoom-in duration-300 shadow-2xl">
          <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-stone-400 hover:text-stone-600 transition-transform hover:rotate-90"
          >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
          </button>

          <h3 className="text-2xl font-serif font-bold text-amber-900 mb-2">Báo Cáo Sự Cố</h3>
          <p className="text-stone-400 text-[10px] uppercase tracking-widest font-black mb-8 px-1">Tâm nguyện của bạn sẽ được giải quyết sớm</p>

          <div className="space-y-6">
             <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block mb-2 px-1">Mã đơn hàng (ID)</label>
                <input 
                  type="number"
                  placeholder="Ví dụ: 7"
                  className="w-full bg-stone-50 border border-stone-100 rounded-2xl p-4 text-sm focus:outline-none focus:border-amber-500 transition-all font-mono"
                  value={reportPaymentId}
                  onChange={(e) => setReportPaymentId(e.target.value)}
                />
             </div>
             <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block mb-2 px-1">Mô tả chi tiết</label>
                <textarea 
                  rows={3}
                  placeholder="Mô tả sự cố bạn gặp phải..."
                  className="w-full bg-stone-50 border border-stone-100 rounded-2xl p-4 text-sm focus:outline-none focus:border-amber-500 transition-all"
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                />
             </div>

             <button 
                onClick={handleSubmit}
                className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all active:scale-95"
             >
                Gửi Báo Cáo
             </button>
          </div>
       </div>
    </div>
  );
};

export default PaymentReportModal;
