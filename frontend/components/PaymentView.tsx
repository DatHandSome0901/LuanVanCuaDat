
import React, { useState, useEffect } from 'react';
import { api } from '../api';
import toast from 'react-hot-toast';
import { PaymentPackage, PaymentInvoice } from '../types';

import PackageCard from './payment/PackageCard';
import PaymentReportModal from './payment/PaymentReportModal';
import PaymentInvoiceModal from './payment/PaymentInvoiceModal';

interface PaymentViewProps {
  onBalanceUpdate: (balance: number) => void;
  isSidebarOpen?: boolean;
}

const PaymentView: React.FC<PaymentViewProps> = ({ onBalanceUpdate, isSidebarOpen }) => {
  const [packages, setPackages] = useState<PaymentPackage[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<PaymentInvoice | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const data = await api.getPackages();
        setPackages(data.packages);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPackages();
  }, []);

  // Poll for payment status
  useEffect(() => {
    let interval: any;
    if (selectedInvoice) {
      interval = setInterval(async () => {
        try {
          const res = await api.getPaymentStatus(selectedInvoice.payment_id);
          if (res.status === 'completed') {
            handlePaymentSuccess(res.tokens);
            clearInterval(interval);
          }
        } catch (err) {
          console.error('Status check error', err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [selectedInvoice, onBalanceUpdate]);

  const handlePaymentSuccess = async (tokens: number) => {
    toast.success(`Chúc mừng! Bạn đã nạp thành công ${tokens} tokens!`, { duration: 5000 });
    setStatusMsg(`Nạp thành công ${tokens} tokens!`);
    
    // Lấy lại thông tin user mới nhất để cập nhật số dư tổng
    try {
      const updatedUser = await api.checkAuth();
      onBalanceUpdate(updatedUser.token_balance);
    } catch (authErr) {
      console.error('Failed to refresh user after payment', authErr);
    }

    setTimeout(() => {
        setSelectedInvoice(null);
        setStatusMsg('');
    }, 5000);
  };

  const handleCreateInvoice = async (packageId: number) => {
    setIsProcessing(true);
    try {
      const invoice = await api.createInvoice(packageId);
      setSelectedInvoice(invoice);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi tạo hóa đơn');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse text-stone-400 font-serif italic">Đang tải danh sách gói nạp...</div>;
  }

  return (
    <div className="paper-texture motif-watermark p-4 md:p-8 max-w-[100%] mx-auto w-full overflow-y-auto pb-24 md:pb-8 border border-stone-200/50 rounded-3xl shadow-sm min-h-screen">
      <header className="mb-8 flex items-center gap-4 border-b border-amber-600/20 pb-6">
        <div className="w-12 h-12 bg-red-800 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-900/20 shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
            <path d="M6 20V9c0-3 2-5 6-5s6 2 6 5v11H6z" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2" />
            <circle cx="12" cy="7.5" r="1" />
            <path d="M9 12h6v4H9z" />
            <path d="M12 13v2M11 14h2" />
            <path d="M6 17.5c2-1 4-1 6 0s4 1 6 0" />
          </svg>
        </div>
        <div>
          <h2 className="text-4xl md:text-5xl font-calligraphy font-bold text-stone-900 leading-normal">Nạp Token Sử Việt</h2>
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.2em] mt-3">Giao dịch an toàn</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {packages.map((pkg, index) => (
          <PackageCard 
            key={pkg.id} 
            pkg={pkg} 
            onSelect={handleCreateInvoice}
            isProcessing={isProcessing}
            index={index}
          />
        ))}
      </div>

      <div className="mt-16 pt-8 border-t border-stone-100 text-center">
         <button 
           onClick={() => setShowReportForm(true)}
           className="text-stone-400 text-xs hover:text-red-800 transition-colors flex items-center gap-2 mx-auto"
         >
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           Bạn gặp sự cố nạp tiền? Nhấn vào đây để báo cáo
         </button>
      </div>

      {showReportForm && (
        <PaymentReportModal onClose={() => setShowReportForm(false)} />
      )}

      {selectedInvoice && (
        <PaymentInvoiceModal 
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default PaymentView;
