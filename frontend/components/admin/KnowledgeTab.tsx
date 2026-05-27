import { useEffect, useState, useMemo } from "react";
import { api } from '../../api';
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { confirmDestructive } from "../../utils/swal";
import { CheckCircle, Trash2, Clock, Search, BookOpen, Info, ChevronRight, X } from "lucide-react";

export default function KnowledgeTab() {
    const [pending, setPending] = useState<any[]>([]);
    const [approved, setApproved] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
    const [loading, setLoading] = useState(true);
    const [approvingId, setApprovingId] = useState<number | null>(null);
    const [progress, setProgress] = useState(0);
    const [selected, setSelected] = useState<any | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const p = await api.adminGetKnowledge();
            const a = await api.adminGetApprovedKnowledge();
            setPending(p.data || []);
            setApproved(a.data || []);
        } catch (error) {
            toast.error("Lỗi khi tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const approve = async (id: number) => {
        setApprovingId(id);
        setProgress(0);
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 95) { clearInterval(interval); return 95; }
                return prev + 5;
            });
        }, 50);
        try {
            await api.adminApproveKnowledge(id);
            setProgress(100);
            setTimeout(() => {
                toast.success("Đã duyệt tri thức thành công");
                setApprovingId(null);
                setSelected(null);
                fetchData();
            }, 300);
        } catch (err: any) {
            clearInterval(interval);
            setApprovingId(null);
            toast.error(err.message || "Lỗi khi duyệt");
        }
    };

    const remove = async (id: number) => {
        const confirmed = await confirmDestructive("Xóa tri thức", "Bạn có chắc chắn muốn xóa tri thức này? Hành động này không thể hoàn tác.");
        if (confirmed) {
            try {
                await api.adminDeleteKnowledge(id);
                toast.success("Đã xóa tri thức");
                setSelected(null);
                fetchData();
            } catch (err: any) {
                toast.error(err.message || "Lỗi khi xóa");
            }
        }
    };

    useEffect(() => { fetchData(); }, []);

    const filteredItems = useMemo(() => {
        const all = [
            ...pending.map(i => ({ ...i, status: 'pending' })),
            ...approved.map(i => ({ ...i, status: 'approved' }))
        ];
        return all
            .filter(item => {
                const matchesSearch =
                    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.answer.toLowerCase().includes(searchTerm.toLowerCase());
                if (filter === "all") return matchesSearch;
                return matchesSearch && item.status === filter;
            })
            .sort((a, b) => b.id - a.id);
    }, [pending, approved, searchTerm, filter]);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                        <BookOpen size={16} className="text-red-800" />
                    </div>
                    <div>
                        <h2 className="text-base font-black text-stone-800 uppercase tracking-tight">Tri thức AI</h2>
                        <p className="text-[11px] text-stone-400 mt-0.5">Quản lý và phê duyệt các câu trả lời thông minh</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800 transition-all text-xs w-48"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Filter */}
                    <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200 gap-0.5">
                        {(["all", "pending", "approved"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                                    filter === f ? "bg-white text-red-800 shadow-sm" : "text-stone-400 hover:text-stone-600"
                                }`}
                            >
                                {f === 'all' ? 'Tất cả' : f === 'pending' ? 'Chờ duyệt' : 'Đã duyệt'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center text-stone-400 gap-3">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                        <Clock size={20} />
                    </motion.div>
                    <span className="text-sm">Đang tải...</span>
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-stone-400 gap-2">
                    <Info size={28} className="opacity-30" />
                    <p className="text-sm italic">Không tìm thấy tri thức nào phù hợp.</p>
                </div>
            ) : (
                <div className="flex gap-5 h-full min-h-0">
                    {/* List */}
                    <div className="w-80 shrink-0 flex flex-col gap-1.5 overflow-y-auto pr-1">
                        <AnimatePresence mode="popLayout">
                            {filteredItems.map((item) => (
                                <motion.button
                                    layout
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    key={`${item.status}-${item.id}`}
                                    onClick={() => setSelected(item)}
                                    className={`w-full text-left p-3.5 rounded-2xl border transition-all group ${
                                        selected?.id === item.id && selected?.status === item.status
                                            ? 'border-red-300 bg-red-50/60 shadow-sm'
                                            : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                            item.status === 'pending'
                                                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                                : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                        }`}>
                                            {item.status === 'pending' ? 'Chờ duyệt' : 'Đã duyệt'}
                                        </div>
                                        <ChevronRight size={12} className="ml-auto text-stone-300 group-hover:text-stone-500 transition-colors shrink-0" />
                                    </div>
                                    <p className="text-xs font-semibold text-stone-800 line-clamp-1 mb-1">{item.question}</p>
                                    <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">{item.answer}</p>
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Detail Panel */}
                    <div className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            {selected ? (
                                <motion.div
                                    key={`${selected.status}-${selected.id}`}
                                    initial={{ opacity: 0, x: 16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -16 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    className="h-full bg-white rounded-2xl border border-stone-200 p-6 flex flex-col gap-5 overflow-y-auto"
                                >
                                    {/* Detail Header */}
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                                                selected.status === 'pending'
                                                    ? 'bg-amber-50 text-amber-700 border-amber-100'
                                                    : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            }`}>
                                                {selected.status === 'pending'
                                                    ? <><Clock size={10} /> Chờ duyệt</>
                                                    : <><CheckCircle size={10} /> Đã phê duyệt</>
                                                }
                                            </div>
                                            {approvingId === selected.id && (
                                                <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progress}%` }}
                                                        className="h-full bg-emerald-500"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors shrink-0">
                                            <X size={14} />
                                        </button>
                                    </div>

                                    {/* Question */}
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Câu hỏi</div>
                                        <p className="text-sm font-semibold text-stone-900 leading-relaxed">{selected.question}</p>
                                    </div>

                                    {/* Answer */}
                                    <div className="flex-1">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Câu trả lời hệ thống</div>
                                        <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">
                                            {selected.answer}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-4 border-t border-stone-100 flex items-center gap-2">
                                        {selected.status === 'pending' && approvingId !== selected.id && (
                                            <button
                                                onClick={() => approve(selected.id)}
                                                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-md shadow-emerald-900/15 hover:bg-emerald-700 active:scale-95 transition-all"
                                            >
                                                <CheckCircle size={13} /> Phê duyệt
                                            </button>
                                        )}
                                        <button
                                            onClick={() => remove(selected.id)}
                                            disabled={approvingId === selected.id}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 border border-red-100 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 active:scale-95 transition-all disabled:opacity-30"
                                        >
                                            <Trash2 size={13} /> Xóa
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