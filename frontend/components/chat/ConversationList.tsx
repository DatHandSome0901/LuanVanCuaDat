import React, { useEffect, useState } from "react";
import { API_ROOT } from "../../api";
import toast from "react-hot-toast";
import ConfirmModal from "../../ConfirmModal";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, Pin, PinOff, Edit3, 
  Trash2, MoreVertical, History
} from "lucide-react";
import { updateConversation } from "../../api";

interface Conversation {
  id: number;
  title: string;
  is_pinned?: boolean;
}

interface Props {
  onSelect: (id: number) => void;
  activeId?: number | null;
  dark?: boolean;
}

const ConversationList: React.FC<Props> = ({ onSelect, activeId, dark = false }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [menu, setMenu] = useState<{ x: number; y: number; id: number } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setConversations([]);
        return;
      }
      const res = await fetch(`${API_ROOT}/api/v1/conversations`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (!res.ok) return;
      const data = await res.json();
      setConversations(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadConversations();
    const handler = () => loadConversations();
    window.addEventListener("reload_conversations", handler);
    window.addEventListener("clear_conversations", () => setConversations([]));
    return () => {
      window.removeEventListener("reload_conversations", handler);
      window.removeEventListener("clear_conversations", () => setConversations([]));
    };
  }, []);

  useEffect(() => {
    const close = () => setMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const openConversation = (id: number) => {
    localStorage.setItem("conversation_id", String(id));
    window.dispatchEvent(new Event("load_conversation"));
    onSelect(id);
  };

  const handlePin = async (id: number, currentStatus: boolean) => {
    try {
      await updateConversation(id, { is_pinned: !currentStatus });
      toast.success(!currentStatus ? "Đã ghim hội thoại" : "Đã bỏ ghim");
      loadConversations();
    } catch (err) {
      toast.error("Không thể thực hiện thao tác");
    }
  };

  const handleRename = async () => {
    if (!editingId || !editingTitle.trim()) return;
    try {
      await updateConversation(editingId, { title: editingTitle });
      setEditingId(null);
      loadConversations();
      toast.success("Đã đổi tên");
    } catch (err) {
      toast.error("Lỗi khi đổi tên");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API_ROOT}/api/v1/conversation/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
      });
      if (res.ok) {
        toast.success("Đã xóa hội thoại");
        loadConversations();
        if (activeId === id) {
          localStorage.removeItem("conversation_id");
          window.dispatchEvent(new Event("new_chat"));
          onSelect(0);
        }
      }
    } catch (err) {
      toast.error("Lỗi khi xóa");
    }
  };

  const pinned = conversations.filter(c => !!c.is_pinned);
  const others = conversations.filter(c => !c.is_pinned);

  const renderItem = (c: Conversation) => (
    <motion.div
      key={c.id}
      onClick={() => {
        if (editingId !== c.id) openConversation(c.id);
      }}
      className={`group relative flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all duration-150 mb-1
        ${dark 
          ? activeId === c.id 
            ? "bg-white/10 text-white font-bold" 
            : "hover:bg-white/5 text-stone-400 hover:text-stone-100"
          : activeId === c.id
            ? "bg-red-50 text-red-900 font-bold border border-red-100/50"
            : "hover:bg-stone-50 text-stone-700 hover:text-stone-900 border border-transparent"}
      `}
    >
      {editingId === c.id ? (
        <input
          autoFocus
          className={`bg-transparent border-none w-full outline-none text-sm font-medium py-0 ${dark ? 'text-white' : 'text-stone-900'}`}
          value={editingTitle}
          onChange={(e) => setEditingTitle(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRename();
            if (e.key === "Escape") setEditingId(null);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <>
          <span className={`flex-1 truncate text-sm font-medium leading-tight py-0.5 ${dark ? 'text-inherit' : activeId === c.id ? 'text-red-950' : 'text-stone-800'}`}>
            {c.title || "Cuộc trò chuyện mới"}
          </span>
          
          <div className="flex items-center shrink-0 ml-1">
            {!!c.is_pinned && (
              <Pin size={10} className={`${dark ? activeId === c.id ? 'text-white' : 'text-stone-500' : activeId === c.id ? 'text-red-700' : 'text-stone-400'} fill-current mr-1 opacity-70`} />
            )}
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setMenu({ x: e.clientX, y: e.clientY, id: c.id });
              }}
              className={`p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition-opacity 
                ${dark 
                  ? activeId === c.id 
                    ? 'opacity-100 text-white' 
                    : 'text-stone-500 hover:text-white md:opacity-0 md:group-hover:opacity-100'
                  : activeId === c.id
                    ? 'opacity-100 text-red-800'
                    : 'text-stone-400 hover:text-stone-800 md:opacity-0 md:group-hover:opacity-100'
                }
              `}
            >
              <MoreVertical size={14} />
            </button>
          </div>
        </>
      )}
    </motion.div>
  );

  return (
    <div className="flex flex-col select-none px-1">
      {conversations.length === 0 ? (
        <div className="py-8 text-center px-4">
          <p className="text-[10px] text-stone-500 font-medium italic opacity-50">Lịch sử trống</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pinned.length > 0 && (
            <div>
              <p className="px-3 mb-1 text-[10px] font-black text-stone-600 uppercase tracking-widest opacity-60">Đã ghim</p>
              <div className="space-y-px">{pinned.map(renderItem)}</div>
            </div>
          )}
          
          <div>
            <p className="px-3 mb-1 text-[10px] font-black text-stone-600 uppercase tracking-widest opacity-60">Gần đây</p>
            <div className="space-y-px">{others.map(renderItem)}</div>
          </div>
        </div>
      )}

      {/* CONTEXT MENU */}
      <AnimatePresence>
        {menu && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed z-[100] border shadow-2xl rounded-2xl p-1.5 min-w-[180px] backdrop-blur-xl ${
              dark 
                ? 'bg-[#212121]/95 border-white/10 text-white' 
                : 'bg-white/95 border-stone-200 text-stone-950'
            }`}
            style={{ 
              top: Math.min(menu.y, window.innerHeight - 160), 
              left: Math.min(menu.x, window.innerWidth - 200) 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => {
                const c = conversations.find(x => x.id === menu.id);
                if (c) handlePin(c.id, !!c.is_pinned);
                setMenu(null);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                dark 
                  ? 'text-stone-300 hover:bg-white/10 hover:text-white' 
                  : 'text-stone-700 hover:bg-stone-100 hover:text-stone-950'
              }`}
            >
              {conversations.find(x => x.id === menu.id)?.is_pinned ? (
                <><PinOff size={14} /> Bỏ ghim</>
              ) : (
                <><Pin size={14} /> Ghim hội thoại</>
              )}
            </button>
            
            <button 
              onClick={() => {
                const c = conversations.find(x => x.id === menu.id);
                if (c) {
                  setEditingId(c.id);
                  setEditingTitle(c.title);
                }
                setMenu(null);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                dark 
                  ? 'text-stone-300 hover:bg-white/10 hover:text-white' 
                  : 'text-stone-700 hover:bg-stone-100 hover:text-stone-950'
              }`}
            >
              <Edit3 size={14} /> Đổi tên
            </button>
            
            <div className={`h-px my-1 mx-2 ${dark ? 'bg-white/5' : 'bg-stone-100'}`} />
            
            <button 
              onClick={() => {
                setDeleteId(menu.id);
                setMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all"
            >
              <Trash2 size={14} /> Xóa hội thoại
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={deleteId !== null}
        message="Xóa vĩnh viễn cuộc hội thoại này?"
        onConfirm={() => {
          if (deleteId !== null) handleDelete(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default ConversationList;
