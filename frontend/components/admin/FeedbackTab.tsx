import { useEffect, useState } from "react";
import { api } from '../../api';
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsDown, ArrowRight, Clock, User, Calendar, CheckCircle, ChevronRight, X } from "lucide-react";
import { confirmAction } from "../../utils/swal";

export default function FeedbackTab() {
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<any | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await api.adminGetNegativeFeedback();
            setFeedbacks(data || []);
        } catch (error) {
            toast.error("Lỗi khi tải dữ liệu phản hồi");
        } finally {
            setLoading(false);
        }
    };

    const handleMoveToPending = async (messageId: number) => {
        const confirmed = await confirmAction(
            "Chuyển sang hàng chờ duyệt",
            "Câu hỏi và câu trả lời này sẽ được đưa vào danh sách Tri thức AI để bạn có thể biên tập và phê duyệt. Tiếp tục?"
        );
        if (confirmed) {
            try {
                await api.adminMoveToPending(messageId);
                toast.success("Đã chuyển sang danh sách chờ duyệt tri thức");
                setSelected(null);
                fetchData();
            } catch (err: any) {
                toast.error(err.message || "Lỗi khi chuyển đổi");
            }
        }
    };

    useEffect(() => { fetchData(); }, []);

    return (
        <div className="flex flex-col h-full min-h-[500px]">
            {/* Header */}
            <div className="paper-texture scroll-border p-4 rounded-xl mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center shrink-0 text-red-700">
                    <ThumbsDown size={18} />
                </div>
                <div>
                    <h2 className="font-historical text-lg text-[#7f1d1d] font-black uppercase tracking-tight">Hòm Thư Tấu Góp Ý (Phản Hồi Tiêu Cực)</h2>
                    <p className="text-[11px] text-stone-500 font-sans italic mt-0.5">Những câu trả lời bị sĩ tử chê trách — Xem xét để biên chép lại vào kho kiến thức</p>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center text-amber-900/60 font-sans gap-3 py-20">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                        <Clock size={20} />
                    </motion.div>
                    <span className="text-sm">Đang tra cứu tấu chương...</span>
                </div>
            ) : feedbacks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-stone-400 gap-2 py-20 paper-texture scroll-border rounded-xl">
                    <CheckCircle size={32} className="text-green-700 opacity-60" />
                    <p className="text-sm font-sans italic text-stone-600">Khắp nơi bình yên, chưa nhận được tấu chương góp ý tiêu cực nào.</p>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-6 min-h-0">
                    {/* List */}
                    <div className="w-full lg:w-80 shrink-0 flex flex-col gap-2 overflow-y-auto max-h-[600px] pr-1">
                        <AnimatePresence mode="popLayout">
                            {feedbacks.map((item) => (
                                <motion.button
                                    layout
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    key={item.message_id}
                                    onClick={() => setSelected(item)}
                                    className={`w-full text-left p-3.5 rounded-xl border transition-all group ${
                                        selected?.message_id === item.message_id
                                            ? 'border-[#7f1d1d] bg-[#7f1d1d]/5 shadow-sm'
                                            : 'border-amber-800/10 bg-white hover:border-[#b45309]/30 hover:shadow-sm'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                            <User size={11} className="text-[#b45309]" />
                                        </div>
                                        <span className="text-[11px] font-historical font-black text-amber-900 truncate">
                                            {item.username || 'Sĩ tử ẩn danh'}
                                        </span>
                                        <ChevronRight size={12} className="ml-auto text-stone-300 group-hover:text-stone-500 transition-colors shrink-0" />
                                    </div>
                                    <p className="text-xs font-historical font-black text-[#7f1d1d] line-clamp-1 mb-1">
                                        {item.question || '(Không tìm thấy câu hỏi gốc)'}
                                    </p>
                                    <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed font-sans">
                                        {item.answer}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-stone-100">
                                        <Calendar size={10} className="text-stone-400" />
                                        <span className="text-[9px] font-mono text-stone-400">
                                            {new Date(item.created_at).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Detail Panel */}
                    <div className="flex-1 min-w-0">
                      <AnimatePresence mode="wait">
                        {selected ? (
                          <motion.div
                            key={selected.message_id}
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -16 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="paper-texture scroll-border rounded-2xl p-6 flex flex-col gap-5 overflow-y-auto max-h-[600px] border-double border-4 border-amber-600/30"
                          >
                            {/* Detail Header */}
                            <div className="flex items-start justify-between gap-4 border-b border-amber-800/10 pb-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
                                    <User size={11} className="text-[#b45309]" />
                                  </div>
                                  <span className="text-xs font-historical font-black text-amber-900">
                                    {selected.username || 'Sĩ tử ẩn danh'}
                                  </span>
                                  <span className="text-[10px] text-stone-300">•</span>
                                  <span className="text-[10px] font-mono text-stone-500">
                                    {new Date(selected.created_at).toLocaleString('vi-VN')}
                                  </span>
                                </div>
                                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-50 border border-red-200 rounded text-[9px] font-black uppercase text-red-700 tracking-wider">
                                  Sớ Chê Trách (Disliked)
                                </div>
                              </div>
                              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-amber-100 text-[#b45309]/60 hover:text-[#b45309] transition-colors shrink-0">
                                <X size={14} />
                              </button>
                            </div>

                            {/* Question */}
                            <div>
                              <div className="text-[9px] font-historical font-black uppercase tracking-widest text-[#b45309]/80 mb-2">Đề văn sĩ tử hỏi</div>
                              <p className="text-base font-historical font-black text-[#7f1d1d] leading-relaxed">
                                {selected.question || '(Không tìm thấy câu hỏi gốc)'}
                              </p>
                            </div>

                            {/* Answer */}
                            <div>
                              <div className="text-[9px] font-historical font-black uppercase tracking-widest text-[#b45309]/80 mb-2">Lời Trả Lời từ AI Sử Việt</div>
                              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-800/20 text-xs font-sans text-stone-700 leading-relaxed whitespace-pre-wrap">
                                {selected.answer}
                              </div>
                            </div>

                            {/* Lý do tấu */}
                            {selected.feedback_note && (
                              <div>
                                <div className="text-[9px] font-historical font-black uppercase tracking-widest text-[#b45309]/80 mb-2">Lý do dâng sớ chê trách</div>
                                <div className="p-3 bg-red-50/40 rounded-xl border border-red-200 text-xs font-sans text-red-800 italic">
                                  "{selected.feedback_note}"
                                </div>
                              </div>
                            )}

                            {/* Action */}
                            <div className="mt-auto pt-4 border-t border-amber-800/10">
                              <button
                                onClick={() => handleMoveToPending(selected.message_id)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7f1d1d] to-[#451a03] hover:from-[#b45309] hover:to-[#7f1d1d] text-amber-100 border border-amber-500/40 rounded-xl font-historical font-black text-xs uppercase tracking-widest shadow-md hover-lift active:scale-95 transition-all"
                              >
                                Đưa vào Tri thức Chờ Duyệt <ArrowRight size={14} />
                              </button>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full min-h-[300px] flex flex-col items-center justify-center text-amber-900/40 gap-2 border border-dashed border-amber-800/20 rounded-2xl"
                          >
                            <ChevronRight size={28} className="rotate-180 text-amber-700/30" />
                            <p className="text-sm font-sans italic text-stone-600">Chọn một bức tấu chương để xem chi tiết lý sự</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
}
