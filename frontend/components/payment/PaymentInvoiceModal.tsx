import React from 'react';
import { PaymentInvoice } from '../../types';
import { api } from '../../api';
import toast from 'react-hot-toast';

interface PaymentInvoiceModalProps {
  invoice: PaymentInvoice;
  onClose: () => void;
  onSuccess: (tokens: number) => void;
  statusMsg?: string;
}

const PaymentInvoiceModal: React.FC<PaymentInvoiceModalProps> = ({ 
  invoice, 
  onClose, 
  onSuccess,
  statusMsg 
}) => {
  const handleCheck = async () => {
    const loadingToast = toast.loading('Đang kiểm tra giao dịch...');
    try {
      const res = await api.getPaymentStatus(invoice.payment_id);
      if (res.status === 'completed') {
        toast.success('Hệ thống đã ghi nhận công đức!');
        // Trigger reload in parent
        onSuccess(res.tokens);
      } else {
        toast.error('Giao dịch chưa được tìm thấy hoặc đang xử lý.', { icon: '⏳' });
      }
    } catch (err) {
      toast.error('Lỗi khi kiểm tra thanh toán');
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative animate-in zoom-in duration-300">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        
        <h3 className="text-xl font-bold text-amber-900 mb-1">Thanh Toán</h3>
        <p className="text-xs text-stone-400 mb-6 font-serif italic">"Gieo hạt lành, tâm an yên"</p>
        
        <div className="bg-stone-50 p-4 rounded-2xl mb-6 inline-block shadow-inner">
            <img src={invoice.qr_url} alt="QR Code" className="w-full h-auto rounded-lg" />
        </div>

        <div className="text-left space-y-2 mb-6 text-sm">
            <div className="flex justify-between">
                <span className="text-stone-400">Mã đơn hàng:</span>
                <span className="font-bold text-stone-800">#{invoice.payment_id}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-stone-400">Số tiền:</span>
                <span className="font-bold text-stone-800">{invoice.amount_vnd.toLocaleString('vi-VN')} VNĐ</span>
            </div>
            <div className="flex justify-between">
                <span className="text-stone-400">Nội dung:</span>
                <span className="font-bold text-amber-600">{invoice.note}</span>
            </div>
        </div>

        <div className="space-y-3">
          <button 
            onClick={handleCheck}
            className="w-full bg-amber-600 text-white font-bold py-3 rounded-xl hover:bg-amber-700 transition-all shadow-lg active:scale-95"
          >
            Kiểm tra thanh toán
          </button>
        </div>
        
        {statusMsg && (
          <div className="mt-4 p-3 bg-green-50 text-green-600 text-sm font-medium rounded-xl border border-green-100">
            {statusMsg}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentInvoiceModal;
