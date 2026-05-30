import React from 'react';
import { Calendar, CreditCard, ShieldAlert, Award } from 'lucide-react';
import { API_ROOT } from '../../api';
import { useLanguage } from '../../contexts/LanguageContext';

const localized = {
  vi: {
    completed: 'Đã Nạp Ngân',
    pending: 'Đang Chờ Duyệt',
    failed: 'Đã Bãi Bỏ',
    col_code: "Mã Công Văn",
    col_user: "Nhân Sĩ Công Đức",
    col_amount: "Ngân Tệ Nạp (VNĐ)",
    col_tokens: "Được Hưởng (Tokens)",
    col_status: "Trạng Thái",
    col_created: "Khởi Tạo",
    empty_records: "Chưa ghi nhận công văn giao dịch nào trong sổ sách này...",
    status_completed: "已納 Đã Nạp",
    status_pending: "侍閱 Chờ Duyệt",
    status_failed: "駁回 Bãi Bỏ",
    tokens_unit: "Tệ"
  },
  en: {
    completed: 'Completed',
    pending: 'Pending Approval',
    failed: 'Failed / Cancelled',
    col_code: "Transaction Code",
    col_user: "Scholars / Donors",
    col_amount: "VND Amount",
    col_tokens: "Tokens Granted",
    col_status: "Status",
    col_created: "Created At",
    empty_records: "No transaction logs registered in this ledger...",
    status_completed: "已納 Paid",
    status_pending: "侍閱 Pending",
    status_failed: "駁回 Revoked",
    tokens_unit: "Credits"
  }
};

const AvatarImage: React.FC<{ src?: string, alt: string }> = ({ src, alt }) => {
  const [error, setError] = React.useState(false);
  if (!src || error) {
    return (
      <div className="w-7 h-7 bg-amber-100/50 border border-amber-200 rounded flex items-center justify-center text-[#7f1d1d] font-historical font-black text-xs shrink-0">
        {(alt || 'U')[0].toUpperCase()}
      </div>
    );
  }
  const finalSrc = src.startsWith('/') ? `${API_ROOT}${src}` : src;
  return (
    <img 
      src={finalSrc} 
      alt={alt} 
      className="w-7 h-7 rounded object-cover shadow-sm border border-amber-500/20 shrink-0" 
      referrerPolicy="no-referrer" 
      onError={() => setError(true)} 
    />
  );
};

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
  const { language } = useLanguage();
  const tLocal = localized[language] || localized.vi;

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      {/* Thanh Bộ Lọc Bộ Hộ (Silk Banner Filters) */}
      <div className="flex bg-[#2c1609] p-1.5 border border-amber-800/30 rounded-xl w-fit gap-1 shadow-md">
        {(['completed', 'pending', 'failed'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setPaymentFilter(filter)}
            className={`px-6 py-2 rounded-lg text-xs font-historical font-black uppercase tracking-wider transition-all hover-lift active:scale-95 ${
              paymentFilter === filter 
              ? 'bg-gradient-to-r from-amber-600 to-red-800 text-amber-100 border border-amber-500/50 shadow-md shadow-amber-900/20' 
              : 'text-amber-200/60 hover:text-amber-100'
            }`}
          >
            {tLocal[filter]}
          </button>
        ))}
      </div>

      {/* Danh Tịch Hóa Đơn (Ledger Table) */}
      <div className="paper-texture scroll-border rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#451a03]/20 text-[#7f1d1d] uppercase text-[10px] font-black tracking-widest border-b border-amber-800/10">
              <tr>
                <th className="px-6 py-5 text-left font-historical">{tLocal.col_code}</th>
                <th className="px-6 py-5 text-left font-historical">{tLocal.col_user}</th>
                <th className="px-6 py-5 text-right font-historical">{tLocal.col_amount}</th>
                <th className="px-6 py-5 text-left font-historical">{tLocal.col_tokens}</th>
                <th className="px-6 py-5 text-center font-historical">{tLocal.col_status}</th>
                <th className="px-6 py-5 text-right font-historical">{tLocal.col_created}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#b45309]/10">
              {payments.filter((pm: any) => pm.status === paymentFilter).length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20 italic text-amber-900/60 font-serif">
                    {tLocal.empty_records}
                  </td>
                </tr>
              ) : (
                payments
                  .filter((pm: any) => pm.status === paymentFilter)
                  .map((pm: any) => (
                    <tr key={pm.id} className="hover:bg-amber-100/30 transition-colors">
                      {/* Mã hóa đơn */}
                      <td className="px-6 py-4 font-mono text-amber-800 font-bold text-xs">
                        #{pm.id}
                      </td>

                      {/* Người nạp */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <AvatarImage src={pm.picture_url} alt={pm.username} />
                          <div>
                            <p className="font-historical font-black text-[#7f1d1d] leading-none mb-0.5">{pm.username}</p>
                            <p className="text-[10px] text-stone-405 font-mono leading-none">{pm.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Số tiền */}
                      <td className="px-6 py-4 text-right font-historical font-black text-amber-900 text-base">
                        {pm.amount_vnd.toLocaleString()} VNĐ
                      </td>

                      {/* Số Token nhận */}
                      <td className="px-6 py-4 text-amber-800 font-historical font-black text-sm">
                        +{pm.tokens.toLocaleString()} {tLocal.tokens_unit}
                      </td>

                      {/* Ấn Chương Trạng Thái (Seal Stamps) */}
                      <td className="px-6 py-4 text-center">
                        {pm.status === 'completed' && (
                          <span className="inline-block px-3 py-1 bg-green-50 border-2 border-green-600 text-green-700 rounded-sm text-[9px] font-black uppercase tracking-wider shadow-sm font-historical transform rotate-[-2deg] border-double">
                            {tLocal.status_completed}
                          </span>
                        )}
                        {pm.status === 'pending' && (
                          <span className="inline-block px-3 py-1 bg-amber-50 border-2 border-amber-500 text-amber-700 rounded-sm text-[9px] font-black uppercase tracking-wider shadow-sm font-historical transform rotate-[1deg] border-double">
                            {tLocal.status_pending}
                          </span>
                        )}
                        {pm.status === 'failed' && (
                          <span className="inline-block px-3 py-1 bg-red-50 border-2 border-red-600 text-red-700 rounded-sm text-[9px] font-black uppercase tracking-wider shadow-sm font-historical transform rotate-[-1deg] border-double">
                            {tLocal.status_failed}
                          </span>
                        )}
                      </td>

                      {/* Ngày Tạo */}
                      <td className="px-6 py-4 text-right text-stone-500 text-xs font-mono">
                        <div className="flex items-center justify-end gap-1">
                          <Calendar size={12} className="text-amber-800/40" />
                          {new Date(pm.created_at).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentsTab;
