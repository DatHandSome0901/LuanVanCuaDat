import React, { useEffect, useState } from "react";
import { API_ROOT } from "../../api";
import toast from "react-hot-toast";
import ConfirmModal from "../../ConfirmModal";
interface Conversation {
  id: number;
  title: string;
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

    }catch(err){

      console.error(err)

    }

  }

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

  return (

    <div className="space-y-1 relative">

      {conversations.map(c=>(

        <div
          key={c.id}

          onClick={()=> openConversation(c.id)}

          onContextMenu={(e)=>{

            e.preventDefault()

            setMenu({
              x:e.pageX,
              y:e.pageY,
              id:c.id
            })

          }}

          // className="px-3 py-2 text-sm hover:bg-stone-100 rounded-lg cursor-pointer truncate"
                  className={`px-3 py-2 text-sm rounded-lg cursor-pointer truncate transition-all
          ${
            activeId === c.id
              ? "bg-red-100 text-red-900 font-semibold shadow-sm"
              : "hover:bg-stone-100 text-stone-600"
          }
        `}
        >
          {c.title || "New Chat"}
        </div>

      ))}

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
            // onClick={()=>{

            //   deleteConversation(menu.id)

            //   setMenu(null)

            // }}
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



