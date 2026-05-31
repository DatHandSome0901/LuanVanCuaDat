import React, { useState } from 'react';
import { Calendar, AlertCircle, Check, X } from 'lucide-react';
import { api, API_ROOT } from '../../api';
import { useLanguage } from '../../contexts/LanguageContext';
import toast from 'react-hot-toast';

const localized = {
  vi: {
    title: "📜 Sổ Sách Phúc Tra Sai Sót (Báo Cáo Sự Cố)",
    subtitle: "Ghi nhận các khiếu nại hoặc sự cố từ sĩ tử",
    col_time: "Điểm Thời Gian",
    col_user: "Nhân Sĩ Báo Cáo",
    col_invoice: "Hóa Đơn",
    col_detail: "Chi Tiết Sự Việc (Mô Tả)",
    col_status: "Trạng Thái",
    col_actions: "Duyệt Sớ",
    empty_records: "Khắp nơi bình yên, chưa ghi nhận sớ phúc tra sự cố nào...",
    status_resolved: "已決 Đã Giải Quyết",
    status_ignored: "罷 Bỏ Qua",
    status_pending: "侍閱 Đang Xét"
  },
  en: {
    title: "📜 Discrepancy Audits Ledger (Incident Reports)",
    subtitle: "Record of disputes or system issues submitted by scholars",
    col_time: "Timestamp",
    col_user: "Reporter",
    col_invoice: "Invoice ID",
    col_detail: "Incident Details (Description)",
    col_status: "Audit Status",
    col_actions: "Audit Actions",
    empty_records: "All quiet across the land, no incident reports found...",
    status_resolved: "已決 Resolved",
    status_ignored: "罷 Ignored",
    status_pending: "侍閱 Under Review"
  }
};

const AvatarImage: React.FC<{ src?: string, alt: string }> = ({ src, alt }) => {
  const [error, setError] = React.useState(false);
  if (!src || error) {
    return (
      <div className="w-6 h-6 rounded bg-[#7f1d1d]/10 flex items-center justify-center text-[#7f1d1d] font-historical font-black text-xs shrink-0">
        {(alt || 'U')[0].toUpperCase()}
      </div>
    );
  }
  const finalSrc = src.startsWith('/') ? `${API_ROOT}${src}` : src;
  return (
    <img 
      src={finalSrc} 
      alt={alt} 
      className="w-6 h-6 rounded object-cover shadow-sm border border-amber-500/20 shrink-0" 
      referrerPolicy="no-referrer" 
      onError={() => setError(true)} 
    />
  );
};

interface ReportsTabProps {
  reports: any[];
  onRefresh?: () => void;
}

const ReportsTab: React.FC<ReportsTabProps> = ({ reports, onRefresh }) => {
  const { language } = useLanguage();
  const tLocal = localized[language] || localized.vi;
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleUpdateStatus = async (reportId: number, status: 'resolved' | 'ignored') => {
    try {
      setUpdatingId(reportId);
      const loadingToast = toast.loading(
        status === 'resolved' 
          ? (language === 'vi' ? 'Đang duyệt và gửi thư phản hồi cho khách hàng...' : 'Approving and sending resolution email...')
          : (language === 'vi' ? 'Đang bỏ qua báo cáo này...' : 'Ignoring report...')
      );
      await api.adminUpdatePaymentReportStatus(reportId, status);
      toast.dismiss(loadingToast);
      toast.success(
        status === 'resolved'
          ? (language === 'vi' ? 'Đã duyệt sớ thành công & gửi email phản hồi!' : 'Ticket resolved successfully & email reply sent!')
          : (language === 'vi' ? 'Đã bỏ qua báo cáo.' : 'Report ignored.')
      );
      if (onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi cập nhật trạng thái');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="paper-texture scroll-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in pb-10">
      <div className="px-6 py-4 bg-gradient-to-r from-[#451a03] to-[#2c1609] border-b border-amber-500/30 flex justify-between items-center">
        <h3 className="font-historical text-lg text-amber-100 flex items-center gap-2">
          <span>📜</span> {tLocal.title}
        </h3>
        <span className="text-xs text-amber-200/70 font-sans italic">{tLocal.subtitle}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#451a03]/20 text-[#7f1d1d] uppercase text-[10px] font-black tracking-widest border-b border-amber-800/10">
            <tr>
              <th className="px-6 py-5 text-left font-historical">{tLocal.col_time}</th>
              <th className="px-6 py-5 text-left font-historical">{tLocal.col_user}</th>
              <th className="px-6 py-5 text-left font-historical">{tLocal.col_invoice}</th>
              <th className="px-6 py-5 text-left font-historical">{tLocal.col_detail}</th>
              <th className="px-6 py-5 text-center font-historical">{tLocal.col_status}</th>
              <th className="px-6 py-5 text-center font-historical">{tLocal.col_actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#b45309]/10">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-20 italic text-amber-900/60 font-serif">
                  {tLocal.empty_records}
                </td>
              </tr>
            ) : (
              reports.map((rep: any, idx: number) => (
                <tr key={rep.id || idx} className="hover:bg-amber-100/30 transition-colors">
                  {/* Thời Gian */}
                  <td className="px-6 py-4 text-stone-500 text-xs font-mono whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-amber-700/60" />
                      {new Date(rep.created_at).toLocaleString()}
                    </div>
                  </td>

                  {/* Người báo cáo */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <AvatarImage src={rep.picture_url} alt={rep.username} />
                      <div>
                        <span className="font-historical font-black text-[#7f1d1d]">{rep.username}</span>
                        <p className="text-[10px] text-stone-500 font-mono leading-none mt-1" title="Email nhận phản hồi">
                          📬 {rep.email || 'N/A'}
                        </p>
                        {rep.user_account_email && rep.user_account_email !== rep.email && (
                          <p className="text-[9px] text-stone-400 font-mono leading-none mt-1" title="Email tài khoản">
                            👤 {rep.user_account_email}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* ID Hóa Đơn */}
                  <td className="px-6 py-4 font-mono text-amber-800 font-bold text-xs">
                    {rep.payment_id ? `#${rep.payment_id}` : '—'}
                  </td>

                  {/* Nội Dung */}
                  <td className="px-6 py-4 text-stone-700 font-serif italic text-xs max-w-xs truncate" title={rep.description}>
                    <div className="flex items-center gap-1">
                      <AlertCircle size={12} className="text-[#7f1d1d]/40 shrink-0" />
                      <span>"{rep.description}"</span>
                    </div>
                  </td>

                  {/* Trạng Thái Stamp */}
                  <td className="px-6 py-4 text-center">
                    {rep.status === 'resolved' && (
                      <span className="inline-block px-3 py-1 bg-green-50 border-2 border-green-600 text-green-700 rounded-sm text-[9px] font-black uppercase tracking-wider shadow-sm font-historical transform rotate-[-2deg] border-double">
                        {tLocal.status_resolved}
                      </span>
                    )}
                    {rep.status === 'ignored' && (
                      <span className="inline-block px-3 py-1 bg-stone-100 border border-stone-400 text-stone-500 rounded-sm text-[9px] font-black uppercase tracking-wider font-historical">
                        {tLocal.status_ignored}
                      </span>
                    )}
                    {rep.status !== 'resolved' && rep.status !== 'ignored' && (
                      <span className="inline-block px-3 py-1 bg-amber-50 border-2 border-amber-500 text-amber-700 rounded-sm text-[9px] font-black uppercase tracking-wider shadow-sm font-historical transform rotate-[1deg] border-double">
                        {tLocal.status_pending}
                      </span>
                    )}
                  </td>

                  {/* Thao tác */}
                  <td className="px-6 py-4 text-center">
                    {rep.status !== 'resolved' && rep.status !== 'ignored' ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          disabled={updatingId !== null}
                          onClick={() => handleUpdateStatus(rep.id, 'resolved')}
                          className="p-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-0.5 text-xs font-semibold px-2 shadow-sm"
                          title="Phê duyệt & Gửi email phản hồi"
                        >
                          <Check size={12} />
                          <span>{language === 'vi' ? 'Duyệt' : 'Resolve'}</span>
                        </button>
                        <button
                          disabled={updatingId !== null}
                          onClick={() => handleUpdateStatus(rep.id, 'ignored')}
                          className="p-1 bg-stone-500 text-white rounded-lg hover:bg-stone-600 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-0.5 text-xs font-semibold px-2 shadow-sm"
                          title="Bỏ qua báo cáo này"
                        >
                          <X size={12} />
                          <span>{language === 'vi' ? 'Bỏ qua' : 'Ignore'}</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-stone-400 font-medium italic">
                        {language === 'vi' ? 'Đã duyệt' : 'Done'}
                      </span>
                    )}
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

export default ReportsTab;
