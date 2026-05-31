import React, { useState } from 'react';
import { api } from '../../api';
import toast from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';
import { User } from '../../types';

interface PaymentReportModalProps {
  user: User | null;
  onClose: () => void;
}

const PaymentReportModal: React.FC<PaymentReportModalProps> = ({ user, onClose }) => {
  const { t } = useLanguage();
  const [reportNote, setReportNote] = useState('');
  const [reportPaymentId, setReportPaymentId] = useState('');

  // Check if the user has a linked email (not null/empty and has '@')
  const hasLinkedEmail = !!(user?.email && user.email.trim() && user.email.includes('@'));
  const [email, setEmail] = useState(user?.email || '');

  const handleSubmit = async () => {
    if (!reportPaymentId || !reportNote.trim()) {
      toast.error(t.pay_report_missing_info);
      return;
    }
    if (!email || !email.trim() || !email.includes('@')) {
      toast.error("Vui lòng cung cấp email liên hệ hợp lệ.");
      return;
    }
    const loadingToast = toast.loading(t.pay_report_sending_toast);
    try {
      await api.createPaymentReport(parseInt(reportPaymentId), reportNote, email);
      toast.success(t.pay_report_success);
      onClose();
    } catch (err: any) {
      toast.error(err.message || t.pay_report_err);
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

          <h3 className="text-2xl font-serif font-bold text-amber-900 mb-2">{t.pay_report_title}</h3>
          <p className="text-stone-400 text-[10px] uppercase tracking-widest font-black mb-8 px-1">{t.pay_report_subtitle}</p>

          <div className="space-y-6">
             <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block mb-2 px-1">{t.pay_report_order_id}</label>
                <input 
                  type="number"
                  placeholder={t.pay_report_placeholder_id}
                  className="w-full bg-stone-50 border border-stone-100 rounded-2xl p-4 text-sm focus:outline-none focus:border-amber-500 transition-all font-mono"
                  value={reportPaymentId}
                  onChange={(e) => setReportPaymentId(e.target.value)}
                />
             </div>
             
             <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block mb-2 px-1">
                   {hasLinkedEmail ? "Email liên hệ (Đã liên kết)" : "Email nhận phản hồi"}
                </label>
                <input 
                  type="email"
                  disabled={hasLinkedEmail}
                  placeholder="Nhập email của bạn để nhận phản hồi"
                  className={`w-full bg-stone-50 border border-stone-100 rounded-2xl p-4 text-sm focus:outline-none focus:border-amber-500 transition-all ${hasLinkedEmail ? 'opacity-60 cursor-not-allowed' : ''}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
             </div>

             <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 block mb-2 px-1">{t.pay_report_desc}</label>
                <textarea 
                  rows={3}
                  placeholder={t.pay_report_placeholder_desc}
                  className="w-full bg-stone-50 border border-stone-100 rounded-2xl p-4 text-sm focus:outline-none focus:border-amber-500 transition-all"
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                />
             </div>

             <button 
                onClick={handleSubmit}
                className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all active:scale-95"
             >
                {t.pay_report_submit}
             </button>
          </div>
       </div>
    </div>
  );
};

export default PaymentReportModal;
