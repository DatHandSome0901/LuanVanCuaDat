import { useEffect, useState, useMemo } from "react";
import { api } from '../../api';
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { confirmDestructive } from "../../utils/swal";
import { 
  CheckCircle, Trash2, Clock, Search, 
  BookOpen, Filter, AlertCircle, Info
} from "lucide-react";

export default function KnowledgeTab() {
    const [pending, setPending] = useState<any[]>([]);
    const [approved, setApproved] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
    const [loading, setLoading] = useState(true);
    const [approvingId, setApprovingId] = useState<number | null>(null);
    const [progress, setProgress] = useState(0);

//   const fetchData = async () => {
//     const res = await api.adminGetKnowledge();
//     setData(res.data);
//   };
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
      
      // Simulate progress bar
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 50);

      try {
        await api.adminApproveKnowledge(id);
        setProgress(100);
        setTimeout(() => {
          toast.success("Đã duyệt tri thức thành công");
          setApprovingId(null);
          fetchData();
        }, 300);
      } catch (err: any) {
        clearInterval(interval);
        setApprovingId(null);
        toast.error(err.message || "Lỗi khi duyệt");
      }
    };

    const remove = async (id: number) => {
      const confirmed = await confirmDestructive("Xóa tri thức", "Bạn có chắc chắn muốn xóa tri thức này khỏi hệ thống? Hành động này không thể hoàn tác.");
      if (confirmed) {
        try {
          await api.adminDeleteKnowledge(id);
          toast.success("Đã xóa tri thức");
          fetchData();
        } catch (err: any) {
          toast.error(err.message || "Lỗi khi xóa");
        }
      }
    };

    useEffect(() => {
      fetchData();
    }, []);

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
    <div className="flex flex-col h-full bg-stone-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 flex items-center gap-3">
            <BookOpen className="text-red-800" /> Tri thức AI
          </h2>
          <p className="text-stone-500 text-sm mt-1">Quản lý và phê duyệt các câu trả lời thông minh của hệ thống.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm tri thức..."
              className="pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-800 transition-all text-sm w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200">
            {(["all", "pending", "approved"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  filter === f 
                    ? "bg-white text-red-800 shadow-sm" 
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                {f === 'all' ? 'Tất cả' : f === 'pending' ? 'Chờ duyệt' : 'Đã duyệt'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-20 text-stone-400">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="mb-4">
            <Clock size={40} />
          </motion.div>
          <p className="font-medium">Đang tải dữ liệu tri thức...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-dashed border-stone-300 text-stone-400">
          <Info size={48} className="mb-4 opacity-20" />
          <p className="font-medium italic">Không tìm thấy dữ liệu tri thức nào phù hợp.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-10">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={`${item.status}-${item.id}`}
                className={`group relative bg-white rounded-[2rem] p-6 border transition-all duration-300 hover:shadow-xl ${
                  item.status === 'pending' 
                    ? 'border-amber-100 shadow-amber-900/5' 
                    : 'border-stone-200 shadow-stone-900/5'
                }`}
              >
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col gap-2">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      item.status === 'pending' 
                        ? 'bg-amber-50 text-amber-700 border-amber-100' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}>
                      {item.status === 'pending' ? (
                        <><Clock size={12} /> Đang chờ duyệt</>
                      ) : (
                        <><CheckCircle size={12} /> Đã phê duyệt</>
                      )}
                    </div>
                    
                    {/* Progress Bar when approving */}
                    {approvingId === item.id && (
                      <div className="w-32 h-1.5 bg-stone-100 rounded-full overflow-hidden mt-1 border border-stone-200">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.status === 'pending' && approvingId !== item.id && (
                      <button 
                        onClick={() => approve(item.id)}
                        className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-90"
                        title="Duyệt tri thức"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => remove(item.id)}
                      disabled={approvingId === item.id}
                      className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-90 disabled:opacity-30"
                      title="Xóa tri thức"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0 text-red-800 border border-stone-200 shadow-sm">
                      <span className="text-xs font-bold font-historical-premium">H</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Câu hỏi</p>
                      <h4 className="text-stone-900 font-bold leading-tight">{item.question}</h4>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-stone-100">
                    <div className="w-8 h-8 rounded-full bg-red-800 flex items-center justify-center flex-shrink-0 text-white shadow-md">
                      <span className="text-xs font-bold font-historical-premium">AI</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Câu trả lời hệ thống</p>
                      <div className="text-stone-600 text-sm leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-100 group-hover:bg-white group-hover:border-red-100 transition-colors">
                        {item.answer}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative hover indicator */}
                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 rounded-full transition-all duration-500 group-hover:w-1/3 ${
                  item.status === 'pending' ? 'bg-amber-400' : 'bg-red-800'
                }`}></div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}