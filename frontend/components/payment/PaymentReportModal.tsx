import React, { useState, useEffect, useRef } from 'react';
import { api, API_ROOT } from '../../api';
import toast from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';
import { User } from '../../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PaymentReportModalProps {
  user: User | null;
  onClose: () => void;
}

const PaymentReportModal: React.FC<PaymentReportModalProps> = ({ user, onClose }) => {
  const { language, t } = useLanguage();
  const isVi = language === 'vi';

  // Tabs state: 'report' or 'chat'
  const [activeTab, setActiveTab] = useState<'report' | 'chat'>('report');

  // Form states
  const [myPayments, setMyPayments] = useState<any[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  
  const [reportPaymentId, setReportPaymentId] = useState('');
  const [issueType, setIssueType] = useState('no_tokens');
  const [transferredAmount, setTransferredAmount] = useState('');
  const [transactionTime, setTransactionTime] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [reportNote, setReportNote] = useState('');
  
  const hasLinkedEmail = !!(user?.email && user.email.trim() && user.email.includes('@'));
  const [email, setEmail] = useState(user?.email || '');

  // Live Chat states
  const [supportRoom, setSupportRoom] = useState<any>(null);
  const [supportMessages, setSupportMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAdminOnline, setIsAdminOnline] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [zaloLink, setZaloLink] = useState('https://zalo.me/0896498997');
  const [fbLink, setFbLink] = useState('https://www.facebook.com/nguyen.quoc.at.383270');

  const isPaymentIssue = ['no_tokens', 'wrong_amount', 'qr_issue'].includes(issueType);

  // Fetch packages list and site settings on mount
  useEffect(() => {
    const fetchPackagesAndSettings = async () => {
      try {
        const res = await api.getPackages();
        setPackages(res.packages || []);
        if (res.packages && res.packages.length > 0) {
          setSelectedPackageId(res.packages[0].id.toString());
        }
      } catch (err) {
        console.error('Error fetching packages:', err);
      }

      try {
        const config = await api.getPublicSettings();
        if (config.landing_contact_zalo_link) {
          setZaloLink(config.landing_contact_zalo_link);
        }
        if (config.landing_contact_fb_link) {
          setFbLink(config.landing_contact_fb_link);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    fetchPackagesAndSettings();
  }, []);

  // Fetch user's recent payments (only if they are logged in)
  useEffect(() => {
    if (!user) {
      setIsLoadingPayments(false);
      return;
    }
    const fetchPayments = async () => {
      try {
        const res = await api.getMyPayments();
        const paymentsList = res.payments || [];
        setMyPayments(paymentsList);
        if (paymentsList.length > 0) {
          const pendingPay = paymentsList.find((p: any) => p.status === 'pending');
          if (pendingPay) {
            setReportPaymentId(pendingPay.id.toString());
          } else {
            setReportPaymentId(paymentsList[0].id.toString());
          }
        }
      } catch (err) {
        console.error('Error fetching payments:', err);
      } finally {
        setIsLoadingPayments(false);
      }
    };
    fetchPayments();
  }, [user]);

  // Synchronize package selection when user changes selected invoice
  useEffect(() => {
    if (!reportPaymentId || myPayments.length === 0 || packages.length === 0) return;
    const pObj = myPayments.find(p => p.id.toString() === reportPaymentId);
    if (pObj) {
      const matchedPkg = packages.find(pkg => 
        pkg.name === pObj.package_name || 
        pkg.amount_vnd === pObj.amount_vnd
      );
      if (matchedPkg) {
        setSelectedPackageId(matchedPkg.id.toString());
      }
    }
  }, [reportPaymentId, myPayments, packages]);

  // Live Chat: fetch support room status and messages + start polling
  useEffect(() => {
    if (activeTab !== 'chat') return;

    let isSubscribed = true;

    const checkStatusAndRoom = async () => {
      try {
        const statusRes = await api.checkAdminOnlineStatus();
        if (isSubscribed) setIsAdminOnline(statusRes.admin_online);

        const roomRes = await api.getSupportRoom();
        if (isSubscribed) {
          setSupportRoom(roomRes);
          // Load messages initially
          const msgRes = await api.getSupportMessages(roomRes.id);
          if (isSubscribed) {
            setSupportMessages(msgRes.messages || []);
          }
        }
      } catch (err) {
        console.error('Error loading chat info:', err);
      }
    };

    checkStatusAndRoom();

    // Check status & poll messages every 3 seconds
    const interval = setInterval(async () => {
      try {
        const statusRes = await api.checkAdminOnlineStatus();
        if (isSubscribed) setIsAdminOnline(statusRes.admin_online);
      } catch {}

      if (!supportRoom) return;

      try {
        const msgRes = await api.getSupportMessages(supportRoom.id);
        if (isSubscribed) {
          setSupportMessages(msgRes.messages || []);
        }
      } catch (err) {
        console.error('Error polling messages:', err);
      }
    }, 3000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [activeTab, supportRoom?.id]);

  // Auto-scroll to bottom of messages list
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [supportMessages, isSending]);

  const handleSubmit = async () => {
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
      const pkgObj = packages.find(pkg => pkg.id.toString() === selectedPackageId);
      const pkgNameStr = pkgObj 
        ? `${pkgObj.name} (${pkgObj.amount_vnd.toLocaleString()}đ) - ${pkgObj.tokens} Tokens`
        : "Chưa xác định";

      formattedDescription = `【BÁO CÁO PHÚC TRA SAI SÓT NẠP TIỀN】
• Loại sự cố: ${selectedLabel}
• Gói nạp báo cáo: ${pkgNameStr}
• Hóa đơn liên quan: ${reportPaymentId ? `#${reportPaymentId}` : "Không tìm thấy trên hệ thống (Thanh toán mới/Chưa ghi nhận)"}
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
      const res = await api.createPaymentReport(pId, formattedDescription, email);
      const ticketCode = res.report_id ? `#${res.report_id}` : '';
      toast.success(
        isVi 
          ? `Gửi báo cáo thành công! Mã sớ báo cáo: ${ticketCode}. Ban quản trị sẽ rà soát và phản hồi sớm qua email.` 
          : `Report submitted successfully! Ticket Code: ${ticketCode}. The admin will review and reply via email.`
      );
      onClose();
    } catch (err: any) {
      toast.error(err.message || t.pay_report_err);
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const handleSendChat = async () => {
    const text = chatInput.trim();
    if (!text || !supportRoom) return;

    setChatInput('');
    setIsSending(true);

    // Optimistic local add
    const tempUserMsg = {
      id: Date.now(),
      sender_type: 'user',
      sender_id: user?.id,
      message: text,
      created_at: new Date().toISOString(),
      username: user?.username || 'Bạn',
      picture_url: user?.picture_url
    };
    setSupportMessages(prev => [...prev, tempUserMsg]);

    try {
      await api.sendSupportMessage(supportRoom.id, text);
      const msgRes = await api.getSupportMessages(supportRoom.id);
      setSupportMessages(msgRes.messages || []);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi gửi tin nhắn');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[210]">
       <div className="bg-white rounded-[32px] p-6 md:p-8 max-w-2xl w-full h-[650px] max-h-[90vh] flex flex-col relative animate-in zoom-in duration-300 shadow-2xl">
          {/* Close button */}
          <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-stone-400 hover:text-stone-600 transition-transform hover:rotate-90 z-10"
          >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
          </button>

          {/* Form Header */}
          <div className="flex items-center gap-3 mb-2 shrink-0">
            <div className="w-10 h-10 bg-[#7f1d1d]/10 rounded-full flex items-center justify-center text-[#7f1d1d] shrink-0">
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

          {/* Tabs Navigation */}
          <div className="flex border-b border-stone-200 mb-4 shrink-0">
            <button
              onClick={() => setActiveTab('report')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'report'
                  ? 'border-[#7f1d1d] text-[#7f1d1d]'
                  : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              📜 {isVi ? 'Khai Báo Sự Cố' : 'Report Incident'}
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'chat'
                  ? 'border-[#7f1d1d] text-[#7f1d1d]'
                  : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              💬 {isVi ? 'Trực Tiếp Với Admin / AI' : 'Live Support Chat'}
            </button>
          </div>

          {activeTab === 'report' ? (
            <>
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 my-2 chatgpt-scrollbar min-h-0">
                 {/* Row 1: Issue Type */}
                 <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#7f1d1d] block mb-2 px-1">
                      {isVi ? "Chọn loại sự cố / Yêu cầu" : "Choose issue category"}
                    </label>
                    <select
                      className="w-full bg-stone-50 border border-stone-200/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-all font-semibold"
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                    >
                      <optgroup label={isVi ? "Thanh toán & Nạp tiền" : "Payments & Billing"}>
                        <option value="no_tokens">{isVi ? "Chuyển khoản đúng nhưng chưa nhận tokens" : "Transferred but tokens not received"}</option>
                        <option value="wrong_amount">{isVi ? "Chuyển khoản sai số tiền / sai nội dung" : "Wrong amount or transfer content"}</option>
                        <option value="qr_issue">{isVi ? "Không hiển thị / không quét được mã QR" : "QR display or scanning issue"}</option>
                      </optgroup>
                      
                      <optgroup label={isVi ? "Trải nghiệm hệ thống" : "System Experience"}>
                        <option value="chatbot_answer">{isVi ? "Trò chuyện - AI trả lời chưa chuẩn xác" : "Chat - AI response incorrect"}</option>
                        <option value="game_qa">{isVi ? "Q&A - Lỗi câu hỏi, điểm danh, streak" : "Q&A - Question or check-in issue"}</option>
                        <option value="layout_bug">{isVi ? "Giao diện - Lỗi hiển thị, đơ chức năng" : "UI/Layout - Display or freeze bug"}</option>
                        <option value="other">{isVi ? "Khác / Góp ý nâng cấp" : "Other / Feedback & Suggestion"}</option>
                      </optgroup>
                    </select>
                 </div>

                 {/* Row 1.5: Gói nạp selector */}
                 {isPaymentIssue && packages.length > 0 && (
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-[#7f1d1d] block mb-2 px-1">
                         {isVi ? "Gói nạp cần báo cáo" : "Disputed Package"}
                       </label>
                       <select
                         className="w-full bg-stone-50 border border-stone-200/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-all font-semibold"
                         value={selectedPackageId}
                         onChange={(e) => setSelectedPackageId(e.target.value)}
                       >
                         {packages.map((pkg) => (
                           <option key={pkg.id} value={pkg.id.toString()}>
                             {pkg.name} ({pkg.amount_vnd.toLocaleString()}đ) — {pkg.tokens.toLocaleString()} Tokens
                           </option>
                         ))}
                       </select>
                    </div>
                  )}

                 {/* Row 2: Optional Bank details helper */}
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

                 {/* Row 5: Direct Chat Option */}
                 <div className="bg-amber-50/40 border border-amber-600/10 rounded-2xl p-4 text-center mt-2">
                    <p className="text-xs text-amber-900 font-bold mb-3 flex items-center justify-center gap-1.5">
                      <span>💬</span>
                      <span>{isVi ? "Hoặc trò chuyện trực tiếp qua Zalo / Facebook Messenger:" : "Or chat directly via Zalo / Facebook Messenger:"}</span>
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <a
                        href={zaloLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0068ff] hover:bg-[#0057d6] text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 text-center"
                      >
                        <span>💬</span> Zalo Chat
                      </a>
                      <a
                        href={fbLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1877f2] hover:bg-[#166fe5] text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 text-center"
                      >
                        <span>📘</span> Messenger
                      </a>
                    </div>
                 </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-stone-100 shrink-0">
                 <button 
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-red-950 to-stone-900 hover:from-red-900 hover:to-stone-850 text-amber-100 py-3.5 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2 tracking-wide uppercase text-xs"
                 >
                    <span>⚔️</span> {isVi ? "Gửi Sớ Khai Báo Sự Cố" : "Submit Issue Ticket"}
                 </button>
              </div>
            </>
          ) : (
            /* Live Chat Interface Tab */
            <div className="flex-1 flex flex-col min-h-0 bg-stone-50 rounded-2xl border border-stone-200/60 overflow-hidden my-2">
               {/* Online Status Header */}
               <div className="px-4 py-2.5 bg-white border-b border-stone-150 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-2">
                   <span className={`w-2 h-2 rounded-full shrink-0 ${isAdminOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                   <span className="text-xs font-bold text-stone-700">
                     {isAdminOnline 
                       ? (isVi ? 'Ban Quản Trị Đang Trực Tuyến' : 'Admin is Online') 
                       : (isVi ? 'Trợ Lý AI (Admin Đang Vắng Mặt)' : 'AI Assistant (Admin Offline)')
                     }
                   </span>
                 </div>
                 <span className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">
                   Sử Việt AI Live Support
                 </span>
               </div>

               {/* Messages List */}
               <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 chatgpt-scrollbar bg-stone-50/30">
                 {supportMessages.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400 font-serif">
                     <span className="text-3xl mb-2">💬</span>
                     <p className="text-xs italic">
                       {isVi 
                         ? 'Khởi sự phòng đàm đạo hỗ trợ. Kính mời sĩ tử nhắn tin để bắt đầu.' 
                         : 'Initiating support room. Please type a message to start.'}
                     </p>
                   </div>
                 ) : (
                   supportMessages.map((m: any) => {
                     const isUser = m.sender_type === 'user';
                     const isAi = m.sender_type === 'ai';
                     return (
                       <div key={m.id} className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                         {!isUser && (
                           isAi ? (
                             <img 
                               src="/images/su_viet_bot.jpg" 
                               alt="AI Assistant" 
                               className="w-7 h-7 rounded-full object-cover border border-amber-500/30 shadow-md shrink-0"
                             />
                           ) : (
                             m.picture_url ? (
                               <img 
                                 src={m.picture_url.startsWith('/') ? `${API_ROOT}${m.picture_url}` : m.picture_url} 
                                 alt="Admin" 
                                 className="w-7 h-7 rounded-full object-cover border border-amber-900/20 shadow-sm shrink-0" 
                                 referrerPolicy="no-referrer"
                               />
                             ) : (
                               <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-[#7f1d1d] font-sans font-bold text-[10px] shrink-0 border border-amber-900/20 shadow-inner">
                                 {m.username ? m.username.slice(0, 2).toUpperCase() : 'AD'}
                               </div>
                             )
                           )
                         )}
                         <div className={`max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                           <div className="flex items-center gap-1.5 mb-0.5">
                             <span className="text-[9px] font-bold text-stone-500">
                               {isUser ? (isVi ? 'Bạn' : 'You') : (isAi ? (isVi ? 'AI Trợ Lý' : 'AI Agent') : (isVi ? 'Admin' : 'Admin'))}
                             </span>
                             <span className="text-[8px] text-stone-400">
                               {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </span>
                           </div>
                           <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed shadow-sm font-medium ${
                             isUser 
                               ? 'bg-gradient-to-r from-red-950 to-stone-900 text-amber-100 rounded-tr-none font-sans' 
                               : (isAi 
                                   ? 'bg-amber-100/70 border border-amber-500/25 text-amber-950 rounded-tl-none font-sans' 
                                   : 'bg-white border border-stone-200 text-stone-850 rounded-tl-none font-sans')
                           }`}>
                             {isUser ? (
                               m.message
                             ) : (
                               <div className="prose prose-stone prose-sm max-w-none text-inherit leading-relaxed font-sans">
                                 <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                   {m.message}
                                 </ReactMarkdown>
                                </div>
                             )}
                           </div>
                         </div>
                         {isUser && (
                           user?.picture_url ? (
                             <img 
                               src={user.picture_url.startsWith('/') ? `${API_ROOT}${user.picture_url}` : user.picture_url} 
                               alt="User" 
                               className="w-7 h-7 rounded-full object-cover border border-amber-900/20 shadow-sm" 
                               referrerPolicy="no-referrer"
                             />
                           ) : (
                             <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-[#7f1d1d] font-sans font-bold text-[10px] shrink-0 border border-amber-900/20 shadow-inner">
                               {user?.username ? user.username.slice(0, 2).toUpperCase() : 'GD'}
                             </div>
                           )
                         )}
                       </div>
                     );
                   })
                 )}
                 {isSending && (
                   <div className="flex items-start gap-2.5 justify-start animate-pulse">
                     <img 
                       src="/images/su_viet_bot.jpg" 
                       alt="AI Assistant" 
                       className="w-7 h-7 rounded-full object-cover border border-amber-500/30 shadow-md shrink-0"
                     />
                     <div className="max-w-[75%] flex flex-col items-start">
                       <div className="flex items-center gap-1.5 mb-0.5">
                         <span className="text-[9px] font-bold text-stone-500">
                           {isVi ? 'AI Trợ Lý' : 'AI Agent'}
                         </span>
                         <span className="text-[8px] text-stone-400">
                           {isVi ? 'Đang soạn sớ...' : 'Thinking...'}
                         </span>
                       </div>
                       <div className="px-3 py-2 rounded-2xl text-xs leading-relaxed shadow-sm font-medium bg-amber-100/50 border border-amber-500/20 text-stone-600 rounded-tl-none font-sans flex items-center gap-1.5">
                         <span>{isVi ? 'Đang suy nghĩ' : 'Thinking'}</span>
                         <span className="flex gap-1">
                           <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                           <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                           <span className="w-1.5 h-1.5 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                         </span>
                       </div>
                     </div>
                   </div>
                 )}
                 <div ref={messagesEndRef} />
               </div>

               {/* Chat Input Bar */}
               <div className="p-3 bg-white border-t border-stone-150 flex items-center gap-2 shrink-0">
                 <input
                   type="text"
                   disabled={isSending || !supportRoom}
                   value={chatInput}
                   onChange={(e) => setChatInput(e.target.value)}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') handleSendChat();
                   }}
                   placeholder={
                     !supportRoom 
                       ? (isVi ? 'Đang kết nối phòng đàm đạo...' : 'Connecting to chatroom...') 
                       : (isVi ? 'Nhập tin nhắn để đàm đạo với Admin/AI...' : 'Type message to talk to Admin/AI...')
                   }
                   className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-amber-500 transition-all"
                 />
                 <button
                   disabled={isSending || !chatInput.trim() || !supportRoom}
                   onClick={handleSendChat}
                   className="px-4 py-2.5 bg-gradient-to-r from-red-950 to-stone-900 hover:from-red-900 hover:to-stone-850 text-amber-100 text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 shrink-0"
                 >
                   {isVi ? 'Gửi sớ' : 'Send'}
                 </button>
               </div>
            </div>
          )}
       </div>
    </div>
  );
};

export default PaymentReportModal;
