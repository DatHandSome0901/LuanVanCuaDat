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
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="mb-6 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <ThumbsDown size={16} className="text-red-700" />
                </div>
                <div>
                    <h2 className="text-base font-black text-stone-800 uppercase tracking-tight">Phản hồi tiêu cực</h2>
                    <p className="text-[11px] text-stone-400 mt-0.5">Câu trả lời bị đánh giá thấp — xem xét và đưa vào kho kiến thức</p>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center text-stone-400 gap-3">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                        <Clock size={20} />
                    </motion.div>
                    <span className="text-sm">Đang tải...</span>
                </div>
            ) : feedbacks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-stone-400 gap-2">
                    <CheckCircle size={32} className="text-emerald-400 opacity-60" />
                    <p className="text-sm italic">Không có phản hồi tiêu cực nào.</p>
                </div>
            ) : (
                <div className="flex gap-6 h-full min-h-0">
                    {/* List */}
                    <div className="w-80 shrink-0 flex flex-col gap-2 overflow-y-auto pr-1">
                        <AnimatePresence mode="popLayout">
                            {feedbacks.map((item) => (
                                <motion.button
                                    layout
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    key={item.message_id}
                                    onClick={() => setSelected(item)}
                                    className={`w-full text-left p-3.5 rounded-2xl border transition-all group ${
                                        selected?.message_id === item.message_id
                                            ? 'border-red-300 bg-red-50/60 shadow-sm'
                                            : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                                            <User size={11} className="text-stone-500" />
                                        </div>
                                        <span className="text-[11px] font-bold text-stone-600 truncate">{item.username || 'Ẩn danh'}</span>
                                        <ChevronRight size={12} className="ml-auto text-stone-300 group-hover:text-stone-500 transition-colors shrink-0" />
                                    </div>
                                    <p className="text-xs font-semibold text-stone-800 line-clamp-1 mb-1">{item.question || '(Không có câu hỏi)'}</p>
                                    <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">{item.answer}</p>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <Calendar size={10} className="text-stone-300" />
                                        <span className="text-[10px] text-stone-300">{new Date(item.created_at).toLocaleDateString('vi-VN')}</span>
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
                                    className="h-full bg-white rounded-2xl border border-stone-200 p-6 flex flex-col gap-5 overflow-y-auto"
                                >
                                    {/* Detail Header */}
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center">
                                                    <User size={11} className="text-stone-500" />
                                                </div>
                                                <span className="text-xs font-bold text-stone-700">{selected.username || 'Ẩn danh'}</span>
                                                <span className="text-[10px] text-stone-300">•</span>
                                                <span className="text-[10px] text-stone-400">{new Date(selected.created_at).toLocaleString('vi-VN')}</span>
                                            </div>
                                            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 rounded-md border border-red-100">
                                                <ThumbsDown size={10} className="text-red-600" />
                                                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Dislike</span>
                                            </div>
                                        </div>
                                        <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors shrink-0">
                                            <X size={14} />
                                        </button>
                                    </div>

                                    {/* Question */}
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Câu hỏi</div>
                                        <p className="text-sm font-semibold text-stone-900 leading-relaxed">
                                            {selected.question || '(Không tìm thấy câu hỏi gốc)'}
                                        </p>
                                    </div>

                                    {/* Answer */}
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">AI Trả lời</div>
                                        <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">
                                            {selected.answer}
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <div className="mt-auto pt-4 border-t border-stone-100">
                                        <button
                                            onClick={() => handleMoveToPending(selected.message_id)}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-red-800 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md shadow-red-900/20 hover:bg-red-700 active:scale-95 transition-all"
                                        >
                                            Đưa vào kho tri thức <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-full flex flex-col items-center justify-center text-stone-300 gap-2"
                                >
                                    <ChevronRight size={28} className="rotate-180" />
                                    <p className="text-sm">Chọn một mục để xem chi tiết</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
}
