import { useEffect, useState, useMemo } from "react";
import { api } from '../../api';
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { confirmDestructive } from "../../utils/swal";
import { CheckCircle, Trash2, Clock, Search, BookOpen, Info, ChevronRight, X } from "lucide-react";
import { useLanguage } from '../../contexts/LanguageContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const stripMarkdown = (text: string): string => {
    if (!text) return "";
    return text
        .replace(/[#*`~_\-]/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/\s+/g, " ")
        .trim();
};

export default function KnowledgeTab() {
    const { language } = useLanguage();

    const txt = {
        vi: {
            title: "Kho Tàng Tri Thức Triều Đình (Tri Thức AI)",
            subtitle: "Biên soạn, phê duyệt và quản lý những áng văn lịch sử thông minh của quốc gia",
            search_placeholder: "Truy tầm tri thức...",
            filter_all: "Tất cả",
            filter_pending: "Chờ duyệt",
            filter_approved: "Đã duyệt",
            loading: "Đang mở hòm tri thức...",
            empty: "Không tìm thấy tri thức nào phù hợp trong thư tịch.",
            lbl_question: "Đề mục câu hỏi",
            lbl_answer: "Lời chép của sử thư hệ thống",
            btn_approve: "Phê Phê Phán (Duyệt)",
            btn_delete: "Bãi Bỏ",
            select_prompt: "Chọn một thiên mục tri thức để tra duyệt thư tịch",
            err_load: "Lỗi khi tải dữ liệu",
            success_approve: "Đã duyệt tri thức thành công",
            err_approve: "Lỗi khi duyệt",
            delete_title: "Xóa tri thức",
            delete_confirm: "Bạn có chắc chắn muốn xóa tri thức này? Hành động này không thể hoàn tác.",
            success_delete: "Đã xóa tri thức",
            err_delete: "Lỗi khi xóa",
            status_pending_stamp: "侍閱 Chờ duyệt",
            status_approved_stamp: "已決 Đã phê duyệt"
        },
        en: {
            title: "Royal Archives of Knowledge (AI Knowledge)",
            subtitle: "Compile, approve, and manage the nation's intelligent historical documents",
            search_placeholder: "Search knowledge...",
            filter_all: "All",
            filter_pending: "Pending",
            filter_approved: "Approved",
            loading: "Opening knowledge vault...",
            empty: "No matching knowledge found in the archives.",
            lbl_question: "Question Subject",
            lbl_answer: "System historical script",
            btn_approve: "Approve",
            btn_delete: "Delete",
            select_prompt: "Select a knowledge entry to browse the archives",
            err_load: "Error loading data",
            success_approve: "Knowledge approved successfully",
            err_approve: "Error approving",
            delete_title: "Delete Knowledge",
            delete_confirm: "Are you sure you want to delete this knowledge? This action cannot be undone.",
            success_delete: "Knowledge deleted",
            err_delete: "Error deleting",
            status_pending_stamp: "PENDING",
            status_approved_stamp: "APPROVED"
        }
    }[language === 'en' ? 'en' : 'vi'];

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
            toast.error(txt.err_load);
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
                toast.success(txt.success_approve);
                setApprovingId(null);
                setSelected(null);
                fetchData();
            }, 300);
        } catch (err: any) {
            clearInterval(interval);
            setApprovingId(null);
            toast.error(err.message || txt.err_approve);
        }
    };

    const remove = async (id: number) => {
        const confirmed = await confirmDestructive(txt.delete_title, txt.delete_confirm);
        if (confirmed) {
            try {
                await api.adminDeleteKnowledge(id);
                toast.success(txt.success_delete);
                setSelected(null);
                fetchData();
            } catch (err: any) {
                toast.error(err.message || txt.err_delete);
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
        <div className="flex flex-col h-full min-h-[500px]">
            {/* Header */}
            <div className="paper-texture scroll-border p-4 rounded-xl mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 text-[#7f1d1d]">
                        <BookOpen size={18} />
                    </div>
                    <div>
                        <h2 className="font-historical text-lg text-[#7f1d1d] font-black uppercase tracking-tight">{txt.title}</h2>
                        <p className="text-[11px] text-stone-500 font-sans italic mt-0.5">{txt.subtitle}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-800/60" size={14} />
                        <input
                            type="text"
                            placeholder={txt.search_placeholder}
                            className="pl-9 pr-3 py-2 bg-white/70 border border-amber-800/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all text-xs w-48 font-sans"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Filter */}
                    <div className="flex bg-[#2c1609] p-1 border border-amber-800/30 rounded-lg gap-0.5 shadow-md">
                        {(["all", "pending", "approved"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded text-[10px] font-historical font-black uppercase tracking-wider transition-all ${
                                    filter === f 
                                    ? "bg-gradient-to-r from-amber-600 to-red-800 text-amber-100 border border-amber-500/30 shadow-md" 
                                    : "text-amber-200/50 hover:text-amber-100"
                                }`}
                            >
                                {f === 'all' && txt.filter_all}
                                {f === 'pending' && txt.filter_pending}
                                {f === 'approved' && txt.filter_approved}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center text-amber-900/60 font-sans gap-3 py-20">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                        <Clock size={20} />
                    </motion.div>
                    <span className="text-sm">{txt.loading}</span>
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-stone-400 gap-2 py-20 paper-texture scroll-border rounded-xl">
                    <Info size={28} className="opacity-30 text-amber-700" />
                    <p className="text-sm font-sans text-stone-600">{txt.empty}</p>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-5 min-h-0">
                    {/* List */}
                    <div className="w-full lg:w-80 shrink-0 flex flex-col gap-1.5 overflow-y-auto max-h-[600px] pr-1">
                        <AnimatePresence mode="popLayout">
                            {filteredItems.map((item) => (
                                <motion.button
                                    layout
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    key={`${item.status}-${item.id}`}
                                    onClick={() => setSelected(item)}
                                    className={`w-full text-left p-3.5 rounded-xl border transition-all group ${
                                        selected?.id === item.id && selected?.status === item.status
                                            ? 'border-[#7f1d1d] bg-[#7f1d1d]/5 shadow-sm'
                                            : 'border-amber-800/10 bg-white hover:border-[#b45309]/30 hover:shadow-sm'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className={`px-2 py-0.5 rounded-sm text-[8px] font-historical font-black uppercase tracking-wider border ${
                                            item.status === 'pending'
                                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                : 'bg-green-50 text-green-700 border-green-200'
                                        }`}>
                                            {item.status === 'pending' ? txt.filter_pending : txt.filter_approved}
                                        </div>
                                        <ChevronRight size={12} className="ml-auto text-stone-300 group-hover:text-stone-500 transition-colors shrink-0" />
                                    </div>
                                    <p className="text-xs font-historical font-black text-[#7f1d1d] line-clamp-1 mb-1">{item.question}</p>
                                    <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed font-sans">{stripMarkdown(item.answer)}</p>
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
                                    className="paper-texture scroll-border rounded-2xl p-6 flex flex-col gap-5 overflow-y-auto max-h-[600px] border-double border-4 border-amber-600/30"
                                >
                                    {/* Detail Header */}
                                    <div className="flex items-start justify-between gap-4 border-b border-amber-800/10 pb-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[9px] font-historical font-black uppercase tracking-wider border border-double border-2 ${
                                                selected.status === 'pending'
                                                    ? 'bg-amber-50 text-amber-700 border-amber-500'
                                                    : 'bg-green-50 text-green-700 border-green-600'
                                            }`}>
                                                {selected.status === 'pending'
                                                    ? <><Clock size={10} /> {txt.status_pending_stamp}</>
                                                    : <><CheckCircle size={10} /> {txt.status_approved_stamp}</>
                                                }
                                            </div>
                                            {approvingId === selected.id && (
                                                <div className="w-24 h-1.5 bg-amber-100 rounded-full overflow-hidden border border-amber-200">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progress}%` }}
                                                        className="h-full bg-green-600"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-amber-100 text-[#b45309]/60 hover:text-[#b45309] transition-colors shrink-0">
                                            <X size={14} />
                                        </button>
                                    </div>

                                    {/* Question */}
                                    <div>
                                        <div className="text-[9px] font-historical font-black uppercase tracking-widest text-[#b45309]/80 mb-2">{txt.lbl_question}</div>
                                        <p className="text-base font-historical font-black text-[#7f1d1d] leading-relaxed">{selected.question}</p>
                                    </div>

                                    {/* Answer */}
                                    <div className="flex-1">
                                        <div className="text-[9px] font-historical font-black uppercase tracking-widest text-[#b45309]/80 mb-2">{txt.lbl_answer}</div>
                                        <div className="p-5 bg-amber-50/40 rounded-xl border border-amber-800/20 text-xs text-stone-750 leading-relaxed font-sans prose prose-stone prose-sm max-w-none">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {selected.answer}
                                            </ReactMarkdown>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-4 border-t border-amber-800/10 flex items-center gap-2">
                                        {selected.status === 'pending' && approvingId !== selected.id && (
                                            <button
                                                onClick={() => approve(selected.id)}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-700 to-emerald-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-historical font-black text-xs uppercase tracking-widest shadow-md hover-lift active:scale-95 transition-all"
                                            >
                                                <CheckCircle size={13} /> {txt.btn_approve}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => remove(selected.id)}
                                            disabled={approvingId === selected.id}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl font-historical font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white hover:border-red-600 active:scale-95 transition-all disabled:opacity-30 hover-lift"
                                        >
                                            <Trash2 size={13} /> {txt.btn_delete}
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
                                    <p className="text-sm font-sans text-stone-600">{txt.select_prompt}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
}