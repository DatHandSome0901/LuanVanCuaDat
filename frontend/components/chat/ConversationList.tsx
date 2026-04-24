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
}

const ConversationList: React.FC<Props> = ({ onSelect, activeId }) => {
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
        headers: { Authorization: `Bearer ${token}` }
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
        if (activeId === id) onSelect(0);
      }
    } catch (err) {
      toast.error("Lỗi khi xóa");
    }
  };

  const pinned = conversations.filter(c => !!c.is_pinned);
  const others = conversations.filter(c => !c.is_pinned);

  return (
    <div className="flex flex-col">
      {conversations.length === 0 ? (
        <div className="py-10 text-center px-4">
          <p className="text-[11px] text-stone-400 font-medium italic">Chưa có đoạn chat nào.</p>
        </div>
      ) : (
        <div className="space-y-[2px]">
          {/* ALL CONVERSATIONS (Pinned first) */}
          {[...pinned, ...others].map(c => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => {
                if (editingId !== c.id) openConversation(c.id);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setMenu({ x: e.pageX, y: e.pageY, id: c.id });
              }}
              className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors
                ${activeId === c.id 
                  ? "bg-stone-100 text-stone-900" 
                  : "hover:bg-stone-50 text-stone-600"}
              `}
            >
              {editingId === c.id ? (
                <input
                  autoFocus
                  className="bg-transparent border-none w-full outline-none text-[13px] font-medium text-stone-900"
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
                  <span className="flex-1 truncate text-[13px] font-medium leading-relaxed">
                    {c.title || "Cuộc trò chuyện mới"}
                  </span>
                  
                  {/* ICONS ON THE RIGHT */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!!c.is_pinned && (
                      <Pin size={12} className="text-stone-400 fill-stone-400" />
                    )}
                    
                    {activeId === c.id && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenu({ x: e.pageX, y: e.pageY, id: c.id });
                        }}
                        className="p-1 hover:bg-stone-200 rounded-md text-stone-500"
                      >
                        <MoreVertical size={14} />
                      </button>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* CONTEXT MENU */}
      {menu && (
        <div 
          className="fixed z-[100] bg-white border border-stone-100 shadow-2xl rounded-2xl p-1.5 min-w-[180px] backdrop-blur-xl bg-white/90"
          style={{ top: menu.y, left: menu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={() => {
              const c = conversations.find(x => x.id === menu.id);
              if (c) handlePin(c.id, !!c.is_pinned);
              setMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-stone-600 hover:bg-amber-50 hover:text-amber-700 rounded-xl transition-all"
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
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 rounded-xl transition-all"
          >
            <Edit3 size={14} /> Đổi tên
          </button>
          
          <div className="h-px bg-stone-100 my-1 mx-2" />
          
          <button 
            onClick={() => {
              setDeleteId(menu.id);
              setMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <Trash2 size={14} /> Xóa hội thoại
          </button>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        open={deleteId !== null}
        message="Hành động này không thể hoàn tác. Tất cả tin nhắn trong cuộc hội thoại này sẽ bị xóa vĩnh viễn."
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
