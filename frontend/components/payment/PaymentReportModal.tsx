import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import toast from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';
import { User } from '../../types';

interface PaymentReportModalProps {
  user: User | null;
  onClose: () => void;
}

const PaymentReportModal: React.FC<PaymentReportModalProps> = ({ user, onClose }) => {
  const { language, t } = useLanguage();
  const isVi = language === 'vi';

  // Form states
  const [myPayments, setMyPayments] = useState<any[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  
  const [reportPaymentId, setReportPaymentId] = useState('');
  const [isManualId, setIsManualId] = useState(false);
  const [issueType, setIssueType] = useState('no_tokens');
  const [transferredAmount, setTransferredAmount] = useState('');
  const [transactionTime, setTransactionTime] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [reportNote, setReportNote] = useState('');
  
  const hasLinkedEmail = !!(user?.email && user.email.trim() && user.email.includes('@'));
  const [email, setEmail] = useState(user?.email || '');

  const isPaymentIssue = ['no_tokens', 'wrong_amount', 'qr_issue'].includes(issueType);

  // Fetch user's recent payments (only if they are logged in)
  useEffect(() => {
    if (!user) {
      setIsLoadingPayments(false);
      setIsManualId(true);
      return;
    }
    const fetchPayments = async () => {
      try {
        const res = await api.getMyPayments();
        setMyPayments(res.payments || []);
        if (res.payments && res.payments.length > 0) {
          setReportPaymentId(res.payments[0].id.toString());
        } else {
          setIsManualId(true);
        }
      } catch (err) {
        console.error('Error fetching payments:', err);
        setIsManualId(true);
      } finally {
        setIsLoadingPayments(false);
      }
    };
    fetchPayments();
  }, [user]);

  const handleSubmit = async () => {
    if (isPaymentIssue && !reportPaymentId) {
      toast.error(isVi ? "Vui lòng chọn hoặc nhập mã hóa đơn." : "Please select or enter an invoice ID.");
      return;
    }
    if (!reportNote.trim()) {
      toast.error(isVi ? "Vui lòng nhập mô tả chi tiết sự cố." : "Please provide a detailed description.");
      return;
    }
    if (!email || !email.trim() || !email.includes('@')) {
      toast.error(isVi ? "Vui lòng cung cấp email liên hệ hợp lệ." : "Please enter a valid contact email.");
      return;
    }

    const issueLabels: Record<string, string> = {
      no_tokens: isVi ? "Nạp tiền - Đã chuyển tiền nhưng chưa nhận được tokens" : "Billing - Transferred but tokens not received",
      wrong_amount: isVi ? "Nạp tiền - Chuyển tiền sai số tiền / sai cú pháp" : "Billing - Wrong amount or transfer content",
      qr_issue: isVi ? "Nạp tiền - Không quét được mã QR VietQR" : "Billing - Could not scan QR / QR loading error",
      chatbot_answer: isVi ? "Trò chuyện - AI trả lời không chính xác" : "Chat - AI response is incorrect",
      game_qa: isVi ? "Sử Quán Q&A - Lỗi câu hỏi / Điểm danh / Chuỗi ngày" : "Q&A - Question, check-in, or streak issue",
      layout_bug: isVi ? "Giao diện - Lỗi hiển thị / Vỡ layout / Chức năng đơ" : "Layout/UI - Display bug or functional freeze",
      other: isVi ? "Khác / Ý kiến đóng góp nâng cấp" : "Other / Feedback and Suggestions"
    };

    let formattedDescription = '';
    const selectedLabel = issueLabels[issueType] || issueType;

    if (isPaymentIssue) {
      formattedDescription = `【BÁO CÁO PHÚC TRA SAI SÓT NẠP TIỀN】
• Loại sự cố: ${selectedLabel}
• Số tiền chuyển khoản thực tế: ${transferredAmount ? `${parseInt(transferredAmount).toLocaleString()} VND` : "Chưa cung cấp"}
• Thời gian giao dịch: ${transactionTime || "Chưa cung cấp"}
• Cú pháp / Mã GD ngân hàng: ${transferNote || "Chưa cung cấp"}
• Nội dung mô tả sự việc: 
${reportNote.trim()}`;
    } else {
      formattedDescription = `【BÁO CÁO PHẢN ÁNH SỰ CỐ HỆ THỐNG / GÓP Ý】
• Phân loại sự cố: ${selectedLabel}
• Nội dung chi tiết phản ánh:
${reportNote.trim()}`;
    }

    const loadingToast = toast.loading(t.pay_report_sending_toast);
    try {
      const pId = isPaymentIssue && reportPaymentId ? parseInt(reportPaymentId) : null;
      await api.createPaymentReport(pId, formattedDescription, email);
      toast.success(isVi ? "Gửi báo cáo thành công! Ban quản trị sẽ rà soát và phản hồi sớm qua email." : "Report submitted successfully! The admin will review and reply via email.");
      onClose();
    } catch (err: any) {
      toast.error(err.message || t.pay_report_err);
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[210] overflow-y-auto">
       <div className="bg-white rounded-[40px] p-6 md:p-8 max-w-2xl w-full relative animate-in zoom-in duration-300 shadow-2xl my-8">
          {/* Close button */}
          <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-stone-400 hover:text-stone-600 transition-transform hover:rotate-90"
          >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
          </button>

          {/* Form Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#7f1d1d]/10 rounded-full flex items-center justify-center text-[#7f1d1d]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-serif font-bold text-amber-900 leading-tight">
                {isVi ? "📜 Sớ Phúc Tra Báo Lỗi & Phản Ánh" : "📜 Ticket Audit & Bug Report"}
              </h3>
              <p className="text-stone-400 text-[10px] uppercase tracking-widest font-black mt-1">
                {isVi ? "Tâm nguyện của bạn sẽ được ban quản trị rà soát ngay lập tức" : "The board of admins will audit and resolve your ticket immediately"}
              </p>
            </div>
          </div>

          <div className="space-y-5">
             {/* Row 1: Issue Type & conditional invoice picker */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-[#7f1d1d] block mb-2 px-1">
                     {isVi ? "Chọn loại sự cố / Yêu cầu" : "Choose issue category"}
                   </label>
                   <select
                     className="w-full bg-stone-50 border border-stone-200/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-all font-semibold"
                     value={issueType}
                     onChange={(e) => setIssueType(e.target.value)}
                   >
                     {/* Payment Related */}
                     <optgroup label={isVi ? "Thanh toán & Nạp tiền" : "Payments & Billing"}>
                       <option value="no_tokens">{isVi ? "Chuyển khoản đúng nhưng chưa nhận tokens" : "Transferred but tokens not received"}</option>
                       <option value="wrong_amount">{isVi ? "Chuyển khoản sai số tiền / sai nội dung" : "Wrong amount or transfer content"}</option>
                       <option value="qr_issue">{isVi ? "Không hiển thị / không quét được mã QR" : "QR display or scanning issue"}</option>
                     </optgroup>
                     
                     {/* System Related */}
                     <optgroup label={isVi ? "Trải nghiệm hệ thống" : "System Experience"}>
                       <option value="chatbot_answer">{isVi ? "Trò chuyện - AI trả lời chưa chuẩn xác" : "Chat - AI response incorrect"}</option>
                       <option value="game_qa">{isVi ? "Q&A - Lỗi câu hỏi, điểm danh, streak" : "Q&A - Question or check-in issue"}</option>
                       <option value="layout_bug">{isVi ? "Giao diện - Lỗi hiển thị, đơ chức năng" : "UI/Layout - Display or freeze bug"}</option>
                       <option value="other">{isVi ? "Khác / Góp ý nâng cấp" : "Other / Feedback & Suggestion"}</option>
                     </optgroup>
                   </select>
                </div>

                {isPaymentIssue ? (
                  <div>
                     <label className="text-[10px] font-black uppercase tracking-widest text-[#7f1d1d] block mb-2 px-1">
                       {isVi ? "Chọn Hóa Đơn Bị Sự Cố" : "Select Disputed Invoice"}
                     </label>
                     
                     {isLoadingPayments ? (
                       <div className="h-12 bg-stone-50 border border-stone-100 rounded-xl animate-pulse flex items-center px-4 text-xs text-stone-400">
                         {isVi ? "Đang tìm hóa đơn gần đây..." : "Finding recent invoices..."}
                       </div>
                     ) : (
                       <div className="space-y-2">
                         {!isManualId && myPayments.length > 0 ? (
                           <select
                             className="w-full bg-stone-50 border border-stone-200/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-all font-medium"
                             value={reportPaymentId}
                             onChange={(e) => {
                               if (e.target.value === 'manual') {
                                 setIsManualId(true);
                                 setReportPaymentId('');
                               } else {
                                 setReportPaymentId(e.target.value);
                               }
                             }}
                           >
                             {myPayments.map((p) => {
                               const name = p.package_name || `${p.tokens} Tokens`;
                               const statusText = p.status === 'pending'
                                 ? (isVi ? 'Chờ' : 'Pending')
                                 : p.status === 'completed'
                                 ? (isVi ? 'Thành công' : 'Done')
                                 : (isVi ? 'Lỗi' : 'Failed');
                               return (
                                 <option key={p.id} value={p.id.toString()}>
                                   #{p.id} - {name} ({p.amount_vnd.toLocaleString()}đ) [{statusText}]
                                 </option>
                               );
                             })}
                             <option value="manual">✍️ {isVi ? "Nhập mã hóa đơn thủ công" : "Enter ID manually"}</option>
                           </select>
                         ) : (
                           <div className="relative">
                             <input 
                               type="number"
                               placeholder={isVi ? "Nhập ID hóa đơn (ví dụ: 7)" : "Enter numeric invoice ID (e.g. 7)"}
                               className="w-full bg-stone-50 border border-stone-200/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-all font-mono"
                               value={reportPaymentId}
                               onChange={(e) => setReportPaymentId(e.target.value)}
                             />
                             {!isLoadingPayments && myPayments.length > 0 && (
                               <button
                                 type="button"
                                 onClick={() => {
                                   setIsManualId(false);
                                   setReportPaymentId(myPayments[0].id.toString());
                                 }}
                                 className="absolute right-3 top-2.5 text-xs text-amber-800 hover:underline font-bold"
                               >
                                 {isVi ? "Chọn từ danh sách" : "Select from list"}
                               </button>
                             )}
                           </div>
                         )}
                       </div>
                     )}
                  </div>
                ) : (
                  <div className="bg-stone-50/50 border border-dashed border-stone-200 rounded-xl p-3 flex items-center justify-center text-xs text-stone-400 italic">
                    {isVi ? "Không cần đính kèm hóa đơn đối với sự cố này." : "No invoice attachment needed for this category."}
                  </div>
                )}
             </div>

             {/* Row 2: Optional Bank details helper (Only for payment issues) */}
             {isPaymentIssue && (
               <div className="bg-amber-50/40 border border-amber-600/10 rounded-2xl p-4 space-y-3">
                  <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-amber-900/10 pb-2">
                    <span>🏦</span> {isVi ? "Thông Tin Giao Dịch Thực Tế (Không bắt buộc nhưng khuyên dùng)" : "Actual Bank Transfer Info (Optional but recommended)"}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                     <div>
                        <label className="text-[9px] font-bold text-stone-500 block mb-1">
                          {isVi ? "Số tiền chuyển thực tế (VND)" : "Actual Transferred Amount (VND)"}
                        </label>
                        <input 
                          type="number"
                          placeholder="Ví dụ: 50000"
                          className="w-full bg-white border border-stone-200/50 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 transition-all"
                          value={transferredAmount}
                          onChange={(e) => setTransferredAmount(e.target.value)}
                        />
                     </div>
                     <div>
                        <label className="text-[9px] font-bold text-stone-500 block mb-1">
                          {isVi ? "Thời gian giao dịch" : "Date & Time of Transaction"}
                        </label>
                        <input 
                          type="text"
                          placeholder={isVi ? "Ví dụ: 19:30 ngày 31/05" : "E.g., 19:30 on 31/05"}
                          className="w-full bg-white border border-stone-200/50 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 transition-all"
                          value={transactionTime}
                          onChange={(e) => setTransactionTime(e.target.value)}
                        />
                     </div>
                     <div>
                        <label className="text-[9px] font-bold text-stone-500 block mb-1">
                          {isVi ? "Cú pháp chuyển / Mã giao dịch" : "Transfer Code / Bank Transaction ID"}
                        </label>
                        <input 
                          type="text"
                          placeholder="Ví dụ: FT261515..."
                          className="w-full bg-white border border-stone-200/50 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 transition-all font-mono"
                          value={transferNote}
                          onChange={(e) => setTransferNote(e.target.value)}
                        />
                     </div>
                  </div>
               </div>
             )}

             {/* Row 3: Email Input */}
             <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#7f1d1d] block mb-2 px-1">
                   {hasLinkedEmail 
                     ? (isVi ? "Email nhận phản hồi (Đã liên kết tài khoản)" : "Email for reply (Account linked)") 
                     : (isVi ? "Email liên hệ nhận phản hồi" : "Contact Email for reply")
                   }
                </label>
                <div className="relative">
                  <input 
                    type="email"
                    disabled={hasLinkedEmail}
                    placeholder={isVi ? "Nhập email của bạn để chúng tôi gửi phản hồi kết quả" : "Enter email to receive support resolution updates"}
                    className={`w-full bg-stone-50 border border-stone-200/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-all pl-10 ${
                      hasLinkedEmail ? 'opacity-65 cursor-not-allowed bg-stone-100 text-stone-500 font-medium' : 'font-medium'
                    }`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <span className="absolute left-3.5 top-3.5 text-stone-400">
                    📬
                  </span>
                </div>
             </div>

             {/* Row 4: Description */}
             <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#7f1d1d] block mb-2 px-1">
                  {isVi ? "Nội dung phản ánh chi tiết sự cố" : "Detailed issue description"}
                </label>
                <textarea 
                  rows={3}
                  placeholder={
                    isPaymentIssue
                      ? (isVi ? "Ghi chú thêm thông tin chi tiết (Ví dụ: tên ngân hàng, nội dung chuyển bị sai ra sao...)" : "Provide additional details (e.g. your bank name, what went wrong during transfer...)")
                      : (isVi ? "Hãy mô tả chi tiết lỗi gặp phải hoặc ý kiến phản ánh để chúng tôi khắc phục tốt nhất..." : "Describe the bug, response error, or layout glitch you experienced...")
                  }
                  className="w-full bg-stone-50 border border-stone-200/60 rounded-xl p-4 text-sm focus:outline-none focus:border-amber-500 transition-all min-h-[80px]"
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                />
             </div>

             {/* Submit Button */}
             <button 
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-red-950 to-stone-900 hover:from-red-900 hover:to-stone-850 text-amber-100 py-3.5 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2 tracking-wide uppercase text-xs shrink-0"
             >
                <span>⚔️</span> {isVi ? "Gửi Sớ Khai Báo Sự Cố" : "Submit Issue Ticket"}
             </button>
          </div>
       </div>
    </div>
  );
};

export default PaymentReportModal;
