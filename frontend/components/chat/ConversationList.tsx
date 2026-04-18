import React, { useEffect, useState } from "react";
import { API_ROOT } from "../../api";
import toast from "react-hot-toast";
import ConfirmModal from "../../ConfirmModal";
import { motion, AnimatePresence } from "framer-motion";
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

// const ConversationList: React.FC<Props> = ({ onSelect }) => {
  const ConversationList: React.FC<Props> = ({ onSelect, activeId }) => {
  const [conversations,setConversations] = useState<Conversation[]>([])
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [menu,setMenu] = useState<{
    x:number
    y:number
    id:number
  } | null>(null)

  // NEW STATES
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  // ===============================
  
const loadConversations = async ()=>{

  try{

    const token = localStorage.getItem("access_token")

    if(!token){
      setConversations([])   // ⭐ thêm dòng này
      return
    }

    const res = await fetch(`${API_ROOT}/api/v1/conversations`,{
      headers:{
        Authorization:`Bearer ${token}`
      }
    })

    if(!res.ok) return

    const data = await res.json()

    setConversations(data)

  }catch(err){

    console.error(err)

  }

}

  // ===============================
  // DELETE CHAT
  // ===============================
const confirmDelete = (onConfirm: () => void) => {
  toast.custom((t) => (
    <div className="bg-white shadow-xl rounded-xl p-4 w-[300px] border">
      <p className="text-sm font-medium text-gray-800 mb-4">
        Xóa đoạn chat này?
      </p>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
        >
          Hủy
        </button>

        <button
          onClick={() => {
            toast.dismiss(t.id);
            onConfirm();
          }}
          className="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700"
        >
          Xóa
        </button>
      </div>
    </div>
  ));
};
  const deleteConversation = async (id:number)=>{

    try{

      const token = localStorage.getItem("access_token")

      if(!token) return

      

      const res = await fetch(`${API_ROOT}/api/v1/conversation/${id}`,{
        method:"DELETE",
        headers:{
          Authorization:`Bearer ${token}`
        }
      })

      if(res.ok){

        setConversations(prev=>prev.filter(c=>c.id !== id))

        const current = localStorage.getItem("conversation_id")

        if(current === String(id)){

          localStorage.removeItem("conversation_id")

          window.dispatchEvent(new Event("new_chat"))

        }
           toast.success("Đã xóa đoạn chat")
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRename = async () => {
    if (!editingId || !editingTitle.trim()) {
      setEditingId(null);
      return;
    }
    try {
      await updateConversation(editingId, { title: editingTitle });
      setConversations(prev => prev.map(c => c.id === editingId ? { ...c, title: editingTitle } : c));
      setEditingId(null);
      toast.success("Đã đổi tên");
    } catch (err) {
      toast.error("Lỗi khi đổi tên");
    }
  };

  const handleTogglePin = async (id: number, currentPinned: boolean) => {
    try {
      await updateConversation(id, { is_pinned: !currentPinned });
      setConversations(prev => {
        const updated = prev.map(c => c.id === id ? { ...c, is_pinned: !currentPinned } : c);
        // Sort by is_pinned and then keep order (since we want pinned at top)
        return [...updated].sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));
      });
      toast.success(!currentPinned ? "Đã ghim đoạn chat" : "Đã bỏ ghim");
    } catch (err) {
      toast.error("Lỗi khi ghim đoạn chat");
    }
  };

  // ===============================
  // INITIAL LOAD
  // ===============================

  useEffect(()=>{

    loadConversations()

  },[])

  // ===============================
  // AUTO RELOAD WHEN NEW CHAT
  // ===============================

  useEffect(()=>{

    const handler = ()=> loadConversations()

    window.addEventListener("reload_conversations",handler)

    return ()=>window.removeEventListener("reload_conversations",handler)

  },[])

  // ===============================
  // CLOSE MENU WHEN CLICK OUTSIDE
  // ===============================

  useEffect(()=>{

    const close = ()=> setMenu(null)

    window.addEventListener("click",close)

    return ()=>window.removeEventListener("click",close)

  },[])


  useEffect(() => {

  const handler = () => {

    setConversations([])

    loadConversations()

  }

  window.addEventListener("clear_conversations", handler)

  return () => window.removeEventListener("clear_conversations", handler)

}, [])

  // ===============================
  // OPEN CHAT
  // ===============================

  const openConversation = (id:number)=>{

    localStorage.setItem("conversation_id",String(id))

    window.dispatchEvent(new Event("load_conversation"))

    onSelect(id)

  }

  // ===============================
  // UI
  // ===============================

  const pinned = conversations.filter(c => !!c.is_pinned);
  const others = conversations.filter(c => !c.is_pinned);

  return (
    <div className="space-y-4">
      {/* PINNED SECTION (STICKY) */}
      {pinned.length > 0 && (
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm pt-1 pb-2 space-y-1 mb-2 border-b border-stone-100/50">
          <p className="px-3 mb-1 text-[10px] font-black uppercase tracking-widest text-red-800/50">
            📌 Đã ghim
          </p>
          <AnimatePresence initial={false}>
            {pinned.map(c => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50, height: 0, marginBottom: 0, padding: 0, overflow: 'hidden' }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={() => {
                  if (editingId !== c.id) openConversation(c.id);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setMenu({ x: e.pageX, y: e.pageY, id: c.id });
                }}
                className={`group flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer truncate transition-all
                  ${activeId === c.id ? "bg-red-100 text-red-900 font-semibold shadow-sm" : "hover:bg-red-50/50 text-stone-700"}
                `}
              >
                {editingId === c.id ? (
                  <input
                    autoFocus
                    className="bg-white border border-red-200 rounded px-1 w-full outline-none"
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
                    <span className="flex-1 truncate">{c.title || "New Chat"}</span>
                    <div className="w-3.5 h-3.5 text-red-800 shrink-0 opacity-70">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* OTHERS SECTION */}
      <div className="space-y-1">
        <AnimatePresence initial={false}>
          {others.map(c => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50, height: 0, marginBottom: 0, padding: 0, overflow: 'hidden' }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={() => {
                if (editingId !== c.id) openConversation(c.id);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setMenu({ x: e.pageX, y: e.pageY, id: c.id });
              }}
              className={`group flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer truncate transition-all
                ${activeId === c.id ? "bg-red-100 text-red-900 font-semibold shadow-sm" : "hover:bg-stone-50 text-stone-600"}
              `}
            >
              {editingId === c.id ? (
                <input
                  autoFocus
                  className="bg-white border border-red-200 rounded px-1 w-full outline-none"
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
                <span className="flex-1 truncate">{c.title || "New Chat"}</span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* RIGHT CLICK MENU */}

      {menu && (

        <div
          style={{
            position:"fixed",
            top:menu.y,
            left:menu.x
          }}
          className="bg-white border shadow-lg rounded-md text-sm z-50"
        >

          <button
            onClick={()=>{
              const target = conversations.find(c => c.id === menu.id);
              if (target) {
                setEditingId(menu.id);
                setEditingTitle(target.title || "");
              }
              setMenu(null)
            }}
            className="block w-full text-left px-4 py-2 hover:bg-stone-50 text-stone-700 border-b border-stone-100"
          >
            ✏️ Đổi tên
          </button>

          <button
            onClick={()=>{
              const target = conversations.find(c => c.id === menu.id);
              if (target) {
                handleTogglePin(menu.id, !!target.is_pinned);
              }
              setMenu(null)
            }}
            className="block w-full text-left px-4 py-2 hover:bg-stone-50 text-stone-700 border-b border-stone-100"
          >
            {conversations.find(c => c.id === menu.id)?.is_pinned ? "🔓 Bỏ ghim" : "📌 Ghim đoạn chat"}
          </button>

          <button
            onClick={()=>{
              setDeleteId(menu.id)   // mở modal
              setMenu(null)
            }}
            className="block w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
          >
            🗑 Xóa đoạn chat
          </button>

        </div>
      )}
      
      <ConfirmModal
        open={deleteId !== null}
        message="Xóa đoạn chat này?"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteConversation(deleteId);
          setDeleteId(null);
        }}
      />
    </div>

  )

}

export default ConversationList



