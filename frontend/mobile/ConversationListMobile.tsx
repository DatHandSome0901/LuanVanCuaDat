import React, { useEffect, useState } from "react";
import { API_ROOT, updateConversation } from "../api";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Pin, Trash2, Edit3, ChevronRight } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

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
  const { t } = useLanguage();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      const res = await fetch(`${API_ROOT}/api/v1/conversations`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (res.ok) setConversations(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.history_delete_confirm)) return;
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_ROOT}/api/v1/conversation/${id}`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (res.ok) {
        setConversations(prev => prev.filter(c => c.id !== id));
        toast.success(t.history_toast_deleted);
      }
    } catch (err) { toast.error(t.history_toast_delete_err); }
  };

  const handleTogglePin = async (id: number, current: boolean) => {
    try {
      await updateConversation(id, { is_pinned: !current });
      setConversations(prev => {
        const next = prev.map(c => c.id === id ? { ...c, is_pinned: !current } : c);
        return [...next].sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));
      });
      toast.success(!current ? t.history_toast_pinned : t.history_toast_unpinned);
    } catch (err) { toast.error(t.history_toast_pin_err); }
  };

  const saveRename = async () => {
    if (!editingId || !editingTitle.trim()) { setEditingId(null); return; }
    try {
      await updateConversation(editingId, { title: editingTitle });
      setConversations(prev => prev.map(c => c.id === editingId ? { ...c, title: editingTitle } : c));
      setEditingId(null);
      toast.success(t.history_toast_renamed);
    } catch (err) { toast.error(t.history_toast_rename_err); }
  };

  useEffect(() => { loadConversations(); }, []);

  const pinned = conversations.filter(c => !!c.is_pinned);
  const others = conversations.filter(c => !c.is_pinned);

  const renderItem = (c: Conversation) => (
    <div key={c.id} className="relative overflow-hidden rounded-xl bg-stone-100 mb-1.5 shadow-sm">
      {/* ACTION BUTTONS (Hidden behind) */}
      <div className="absolute inset-0 flex justify-end">
        <button 
          onClick={() => {
             setEditingId(c.id);
             setEditingTitle(c.title || "");
          }}
          className="w-14 h-full bg-blue-500 text-white flex items-center justify-center"
        >
          <Edit3 size={18} />
        </button>
        <button 
          onClick={() => handleTogglePin(c.id, !!c.is_pinned)}
          className="w-14 h-full bg-amber-500 text-white flex items-center justify-center border-l border-white/10"
        >
          <Pin size={18} className={c.is_pinned ? 'fill-current' : ''} />
        </button>
        <button 
          onClick={() => handleDelete(c.id)}
          className="w-14 h-full bg-red-600 text-white flex items-center justify-center border-l border-white/10"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* FORGROUND ITEM */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -168, right: 0 }}
        dragElastic={0.1}
        className={`relative z-10 flex items-center justify-between px-3 py-2.5 bg-white border border-stone-100 rounded-xl transition-colors ${activeId === c.id ? 'bg-stone-50 border-stone-200' : ''}`}
        onClick={() => { if (editingId !== c.id) onSelect(c.id); }}
      >
        {editingId === c.id ? (
          <input
            autoFocus
            className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 outline-none text-sm font-medium"
            value={editingTitle}
            onChange={e => setEditingTitle(e.target.value)}
            onBlur={saveRename}
            onKeyDown={e => { if (e.key==='Enter') saveRename(); if (e.key==='Escape') setEditingId(null); }}
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <div className="flex items-center gap-2.5 truncate">
            {!!c.is_pinned && <Pin size={12} className="text-amber-500 fill-amber-500 shrink-0" />}
            <span className={`truncate text-sm font-bold tracking-tight ${activeId === c.id ? 'text-stone-900' : 'text-stone-700'}`}>
              {c.title || t.history_new_chat}
            </span>
          </div>
        )}
        
        <div className="text-stone-300 shrink-0 ml-1">
          <ChevronRight size={16} />
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="flex flex-col p-2 select-none">
      <AnimatePresence initial={false}>
        {conversations.length === 0 ? (
          <div className="py-20 text-center text-stone-400 italic text-xs opacity-60">
            {t.history_empty}
          </div>
        ) : (
          <div className="space-y-4">
            {pinned.length > 0 && (
              <div>
                <p className="px-1 mb-2 text-[10px] font-black text-stone-500 uppercase tracking-widest opacity-60">{t.history_pinned}</p>
                {pinned.map(renderItem)}
              </div>
            )}
            
            <div>
              <p className="px-1 mb-2 text-[10px] font-black text-stone-500 uppercase tracking-widest opacity-60">{t.history_recent}</p>
              {others.map(renderItem)}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConversationListMobile;
