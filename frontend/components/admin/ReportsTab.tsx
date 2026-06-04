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

const REPLY_TEMPLATES = [
  {
    vi: "Đã rà soát hóa đơn và cộng tokens thành công. Kính chúc sĩ tử học tập tốt!",
    en: "Invoice reviewed and tokens added successfully. Wishing you great studies!"
  },
  {
    vi: "Lỗi kỹ thuật đã được xử lý. Ban quản trị xin tặng sĩ tử thêm tokens để tiếp tục trải nghiệm.",
    en: "Technical issue resolved. The Admin team has granted you extra tokens to continue your experience."
  },
  {
    vi: "Báo cáo của sĩ tử đã được kiểm tra và xử lý thành công. Xin cảm ơn sự đóng góp của sĩ tử!",
    en: "Your report has been verified and resolved. Thank you for your valuable feedback!"
  }
];

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

  // Modal State
  const [showResolveModal, setShowResolveModal] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [tokenAmount, setTokenAmount] = useState<string>('');
  const [adminReplyText, setAdminReplyText] = useState<string>('');

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

  const handleSubmitResolve = async () => {
    if (!selectedReport) return;
    try {
      setUpdatingId(selectedReport.id);
      setShowResolveModal(false);

      const loadingToast = toast.loading(
        language === 'vi' ? 'Đang thực hiện duyệt sớ & gửi thư phản hồi...' : 'Resolving report & sending email...'
      );

      const adjustment = tokenAmount ? parseFloat(tokenAmount) : undefined;

      await api.adminUpdatePaymentReportStatus(
        selectedReport.id,
        'resolved',
        adminReplyText || undefined,
        adjustment
      );

      toast.dismiss(loadingToast);
      toast.success(
        language === 'vi' ? 'Đã duyệt sớ thành công & gửi email phản hồi!' : 'Ticket resolved successfully & email reply sent!'
      );

      if (onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi cập nhật trạng thái');
    } finally {
      setUpdatingId(null);
      setSelectedReport(null);
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
                  <td className="px-6 py-4 text-stone-700 font-sans italic text-xs max-w-xs truncate" title={rep.description?.normalize('NFC')}>
                    <div className="flex items-center gap-1">
                      <AlertCircle size={12} className="text-[#7f1d1d]/40 shrink-0" />
                      <span>"{rep.description?.normalize('NFC')}"</span>
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
                          onClick={() => {
                            setSelectedReport(rep);
                            setTokenAmount('');
                            setAdminReplyText('');
                            setShowResolveModal(true);
                          }}
                          className="p-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-0.5 text-xs font-semibold px-2 shadow-sm"
                          title="Phê duyệt & Cộng token & Gửi email phản hồi"
                        >
                          <Check size={12} />
                          <span>{language === 'vi' ? 'Duyệt' : 'Resolve'}</span>
                        </button>
                        <button
                          disabled={updatingId !== null}
                          onClick={() => {
                            if (window.confirm(language === 'vi' ? 'Bạn có chắc chắn muốn bỏ qua báo cáo này?' : 'Are you sure you want to ignore this report?')) {
                              handleUpdateStatus(rep.id, 'ignored');
                            }
                          }}
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

      {/* Resolve Modal Backdrop & Container */}
      {showResolveModal && selectedReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <div 
            onClick={() => {
              if (updatingId === null) {
                setShowResolveModal(false);
                setSelectedReport(null);
              }
            }}
            className="fixed inset-0 bg-stone-950/85 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Card */}
          <div className="relative bg-[#2c1609] border-2 border-amber-600/40 rounded-3xl w-full max-w-lg max-h-[90vh] md:max-h-[85vh] flex flex-col overflow-hidden shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-200 text-stone-100">
            {/* Top gold header bar decoration */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 shrink-0" />
            
            {/* Header */}
            <div className="flex justify-between items-start mb-4 pb-3 border-b border-amber-900/30 shrink-0">
              <div>
                <h3 className="font-historical text-lg text-amber-100 flex items-center gap-1.5">
                  <span>📜</span> {language === 'vi' ? 'Phê Duyệt & Giải Quyết Báo Cáo' : 'Approve & Resolve Ticket'}
                </h3>
                <p className="text-[10px] text-amber-400/70 font-mono mt-0.5">
                  Report ID: #{selectedReport.id} | Email: {selectedReport.email || 'N/A'}
                </p>
              </div>
              <button
                disabled={updatingId !== null}
                onClick={() => {
                  setShowResolveModal(false);
                  setSelectedReport(null);
                }}
                className="text-stone-400 hover:text-amber-500 transition-colors p-1 rounded-lg hover:bg-amber-950/30"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="space-y-4 text-left overflow-y-auto pr-1.5 flex-1 scrollbar-thin [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-amber-800/40 [&::-webkit-scrollbar-thumb]:rounded-full">
              {/* Report Summary */}
              <div className="p-3.5 rounded-xl bg-amber-50/5 border border-amber-950 text-xs leading-relaxed shadow-inner">
                <div className="font-historical text-[10px] text-amber-500 uppercase tracking-widest mb-1.5">
                  {language === 'vi' ? 'Chi tiết báo cáo sự cố' : 'Incident Details'}
                </div>
                <div className="italic font-sans pl-2 border-l-2 border-amber-700 text-amber-100/90 whitespace-pre-wrap">
                  "{selectedReport.description?.normalize('NFC')}"
                </div>
                {selectedReport.payment_id && (
                  <div className="mt-2 text-[10px] font-mono text-amber-400">
                    💳 {language === 'vi' ? 'Hóa đơn liên quan' : 'Target Invoice'}: #{selectedReport.payment_id}
                  </div>
                )}
              </div>

              {/* Input 1: Token Top-up adjustment */}
              <div>
                <label className="block text-xs font-historical text-amber-100/95 uppercase tracking-wider mb-1.5">
                  🪙 {language === 'vi' ? 'Cộng Token Nhanh (Tùy chọn)' : 'Quick Token Top-up (Optional)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    placeholder={language === 'vi' ? 'Nhập số lượng token...' : 'Enter token amount...'}
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                    disabled={updatingId !== null}
                    className="w-full bg-stone-950 border border-amber-900/40 rounded-xl px-3 py-2 text-amber-200 placeholder-stone-600 focus:outline-none focus:border-amber-500 text-xs font-mono"
                  />
                </div>
                
                {/* Quick select buttons */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    { label: language === 'vi' ? 'Không cộng' : 'None', value: '' },
                    { label: '+200', value: '200' },
                    { label: '+500', value: '500' },
                    { label: '+1000', value: '1000' },
                    { label: '+2000', value: '2000' },
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      type="button"
                      disabled={updatingId !== null}
                      onClick={() => setTokenAmount(btn.value)}
                      className={`px-2.5 py-1 text-[10px] rounded-lg font-historical font-bold border transition-all active:scale-95 ${
                        tokenAmount === btn.value
                          ? 'bg-amber-600 border-amber-500 text-white shadow-md'
                          : 'bg-stone-900/60 border-amber-900/30 text-amber-400/80 hover:border-amber-500 hover:text-white'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input 2: Custom Admin reply message */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-historical text-amber-100/95 uppercase tracking-wider">
                    📬 {language === 'vi' ? 'Nội dung phản hồi (Gửi Email)' : 'Resolution Note (Sent via Email)'}
                  </label>
                  <span className="text-[9px] text-stone-400 font-sans">
                    {language === 'vi' ? 'Gửi trực tiếp đến hòm thư' : 'Will be sent to user email'}
                  </span>
                </div>
                <textarea
                  rows={4}
                  placeholder={
                    language === 'vi' 
                      ? 'Nhập nội dung phản hồi cụ thể cho sĩ tử... Để trống nếu muốn dùng mẫu mặc định.' 
                      : 'Type response message... Leave blank to use default template.'
                  }
                  value={adminReplyText}
                  onChange={(e) => setAdminReplyText(e.target.value)}
                  disabled={updatingId !== null}
                  className="w-full bg-stone-950 border border-amber-900/40 rounded-xl px-3 py-2 text-amber-200 placeholder-stone-600 focus:outline-none focus:border-amber-500 text-xs font-sans leading-relaxed"
                />

                {/* Templates buttons */}
                <div className="mt-2 space-y-1.5">
                  <div className="text-[9px] text-amber-400/60 font-historical font-bold tracking-wider uppercase">
                    💡 {language === 'vi' ? 'Mẫu bút phê nhanh' : 'Quick Templates'}:
                  </div>
                  <div className="flex flex-col gap-1 max-h-[85px] overflow-y-auto pr-1">
                    {REPLY_TEMPLATES.map((tmpl, idx) => {
                      const text = language === 'vi' ? tmpl.vi : tmpl.en;
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={updatingId !== null}
                          onClick={() => setAdminReplyText(text)}
                          className="text-left text-[10px] text-stone-300 hover:text-amber-300 truncate bg-stone-950/40 hover:bg-stone-950/80 border border-stone-900 px-2.5 py-1 rounded transition-all"
                          title={text}
                        >
                          • "{text}"
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-amber-900/20 shrink-0">
              <button
                type="button"
                disabled={updatingId !== null}
                onClick={() => {
                  setShowResolveModal(false);
                  setSelectedReport(null);
                }}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-historical uppercase tracking-wider transition-all disabled:opacity-50"
              >
                {language === 'vi' ? 'Đóng' : 'Close'}
              </button>
              <button
                type="button"
                disabled={updatingId !== null}
                onClick={handleSubmitResolve}
                className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-historical font-black uppercase tracking-wider transition-all shadow-md shadow-amber-900/20 flex items-center gap-1 active:scale-95 disabled:opacity-50"
              >
                <span>{language === 'vi' ? 'Xác Nhận & Duyệt' : 'Confirm & Approve'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsTab;
