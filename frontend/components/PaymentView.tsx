
import React, { useState, useEffect } from 'react';
import { api } from '../api';
import toast from 'react-hot-toast';
import { PaymentPackage, PaymentInvoice } from '../types';

import PackageCard from './payment/PackageCard';
import PaymentReportModal from './payment/PaymentReportModal';
import PaymentInvoiceModal from './payment/PaymentInvoiceModal';

interface PaymentViewProps {
  onBalanceUpdate: (balance: number) => void;
}

const PaymentView: React.FC<PaymentViewProps> = ({ onBalanceUpdate }) => {
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
    <div className="p-8 max-w-6xl mx-auto w-full">
      <header className="mb-12">
        <h2 className="text-4xl font-serif font-bold text-red-950 mb-2">Nạp Token Sử Việt</h2>
        <p className="text-stone-500 italic">Nạp tokens để tiếp tục hành trình nghiên cứu sử liệu và hỗ trợ duy trì hệ thống.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {packages.map((pkg) => (
          <PackageCard 
            key={pkg.id} 
            pkg={pkg} 
            onSelect={handleCreateInvoice}
            isProcessing={isProcessing}
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
