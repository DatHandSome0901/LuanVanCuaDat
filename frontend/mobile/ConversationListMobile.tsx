
import React, { useEffect, useState } from "react";
import { API_ROOT, updateConversation } from "../api";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface Conversation {
  id: number;
  title: string;
  is_pinned?: boolean;
}

interface Props {
  onSelect: (id: number) => void;
  activeId?: number | null;
}

const ConversationListMobile: React.FC<Props> = ({ onSelect, activeId }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      const res = await fetch(`${API_ROOT}/api/v1/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setConversations(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa đoạn chat này?")) return;
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_ROOT}/api/v1/conversation/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setConversations(prev => prev.filter(c => c.id !== id));
        toast.success("Đã xóa");
      }
    } catch (err) { toast.error("Lỗi xóa chat"); }
  };

  const handleTogglePin = async (id: number, current: boolean) => {
    try {
      await updateConversation(id, { is_pinned: !current });
      setConversations(prev => {
        const next = prev.map(c => c.id === id ? { ...c, is_pinned: !current } : c);
        return [...next].sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));
      });
      toast.success(!current ? "Đã ghim" : "Đã bỏ ghim");
    } catch (err) { toast.error("Lỗi ghim"); }
  };

  const saveRename = async () => {
    if (!editingId || !editingTitle.trim()) { setEditingId(null); return; }
    try {
      await updateConversation(editingId, { title: editingTitle });
      setConversations(prev => prev.map(c => c.id === editingId ? { ...c, title: editingTitle } : c));
      setEditingId(null);
      toast.success("Đã đổi tên");
    } catch (err) { toast.error("Lỗi đổi tên"); }
  };

  useEffect(() => { loadConversations(); }, []);

  return (
    <div className="flex flex-col gap-2 p-2">
      <AnimatePresence initial={false}>
        {conversations.map((c) => (
          <div key={c.id} className="relative overflow-hidden rounded-2xl bg-stone-100 group">
            
            {/* ACTION BUTTONS (Hidden behind) */}
            <div className="absolute inset-0 flex justify-end">
              <button 
                onClick={() => {
                   setEditingId(c.id);
                   setEditingTitle(c.title || "");
                }}
                className="w-16 h-full bg-blue-500 text-white flex items-center justify-center"
              >
                ✏️
              </button>
              <button 
                onClick={() => handleTogglePin(c.id, !!c.is_pinned)}
                className="w-16 h-full bg-amber-500 text-white flex items-center justify-center border-l border-white/10"
              >
                {c.is_pinned ? "🔓" : "📌"}
              </button>
              <button 
                onClick={() => handleDelete(c.id)}
                className="w-16 h-full bg-red-600 text-white flex items-center justify-center border-l border-white/10"
              >
                🗑️
              </button>
            </div>

            {/* FORGROUND ITEM */}
            <motion.div
              drag="x"
              dragConstraints={{ left: -192, right: 0 }}
              dragElastic={0.1}
              className={`relative z-10 flex items-center justify-between p-4 bg-white border border-stone-100 rounded-2xl shadow-sm transition-colors ${activeId === c.id ? 'bg-red-50 border-red-200' : ''}`}
              onClick={() => { if (editingId !== c.id) onSelect(c.id); }}
            >
              {editingId === c.id ? (
                <input
                  autoFocus
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-1 outline-none font-medium"
                  value={editingTitle}
                  onChange={e => setEditingTitle(e.target.value)}
                  onBlur={saveRename}
                  onKeyDown={e => { if (e.key==='Enter') saveRename(); if (e.key==='Escape') setEditingId(null); }}
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <div className="flex items-center gap-3 truncate">
                  <div className={`w-2 h-2 rounded-full ${c.is_pinned ? 'bg-amber-500' : 'bg-stone-300'}`} />
                  <span className={`truncate text-sm font-bold ${activeId === c.id ? 'text-red-900' : 'text-stone-700'}`}>
                    {c.title || "Cuộc trò chuyện mới"}
                  </span>
                </div>
              )}
              
              <div className="text-stone-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.div>
          </div>
        ))}
      </AnimatePresence>

      {conversations.length === 0 && (
        <div className="py-20 text-center text-stone-400 italic text-sm">
          Chưa có lịch sử trò chuyện nào.
        </div>
      )}
    </div>
  );
};

export default ConversationListMobile;
