import React from 'react';
import { User, View } from '../types';
import { API_ROOT } from '../api';
import ConversationList from "./chat/ConversationList";
interface SidebarProps {
  user: User | null;
  currentView: View;
  onViewChange: (view: View) => void;
  onLogout: () => void;
  siteConfig?: { logo_url: string, site_title: string };
}

const Sidebar: React.FC<SidebarProps> = ({ user, currentView, onViewChange, onLogout, siteConfig }) => {
  const [imgError, setImgError] = React.useState(false);
  const [mobileImgError, setMobileImgError] = React.useState(false);

  const navItems = [
    { id: 'chat' as View, label: 'Sử Việt', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },  { id: 'new_chat' as View, label: 'Chat mới', icon: 'M12 4v16m8-8H4' },
    { id: 'payment' as View, label: 'Nạp Tiền', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    ...(user?.is_admin ? [{ id: 'admin' as View, label: 'ADMIN', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' }] : []),
    { id: 'profile' as View, label: 'Hồ Sơ', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  ];

const [activeConversationId, setActiveConversationId] = React.useState<number | null>(null);
React.useEffect(()=>{
  const id = localStorage.getItem("conversation_id")
  if(id) setActiveConversationId(Number(id))
},[])
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-stone-200 flex-col h-full shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
              {siteConfig?.logo_url ? (
                  <img 
                    src={siteConfig.logo_url.startsWith('/') ? `${API_ROOT}${siteConfig.logo_url}` : siteConfig.logo_url} 
                    alt="Logo" 
                    className="w-10 h-10 object-contain rounded-full shadow-lg shadow-red-100" 
                  />
              ) : (
                  <div className="w-10 h-10 bg-red-800 rounded-full flex items-center justify-center text-white font-serif text-xl shadow-lg shadow-red-100 italic">
                      {siteConfig?.site_title?.charAt(0) || '史'}
                  </div>
              )}
              <h1 className="text-xl font-serif font-bold text-red-950 leading-none">
                  {siteConfig?.site_title || 'Chatbot Lịch sử'}
              </h1>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                // onClick={() => onViewChange(item.id)}
                    onClick={() => {
                  if (item.id === "new_chat") {
                    localStorage.removeItem("conversation_id")
                    window.dispatchEvent(new Event("new_chat"))
                    window.dispatchEvent(new Event("reload_conversations"))
                    onViewChange("chat")
                  } else {
                    onViewChange(item.id)
                  }
                }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  currentView === item.id 
                    ? 'bg-red-50 text-red-900 font-medium shadow-sm' 
                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
                  {/* =======================
                  CHAT HISTORY
                  =======================  */}


              {user && (
                <>
                  {/* TITLE */}
                  <p className="px-4 mt-4 mb-2 text-xs text-stone-400">
                    Các đoạn chat
                  </p>

                  {/* LIST */}
                  <div className="flex-1 overflow-y-auto px-3">
                    {/* <ConversationList onSelect={()=>{}} /> */}
                    <ConversationList 
                        onSelect={(id:number)=>{
                          setActiveConversationId(id)
                        }}
                        activeId={activeConversationId}
                      />
                      

                      
                  </div>
                </>
              )}

                    {/* {/* <div className="mt-6 flex-1 flex flex-col overflow-hidden"> */}

              {/* <button
                // onClick={()=>{
                //   localStorage.removeItem("conversation_id")
                //   window.dispatchEvent(new Event("new_chat"))
                //   window.dispatchEvent(new Event("reload_conversations"))
                // }}
                 onClick={() => {
                      localStorage.removeItem("conversation_id")

                      // reset chat
                      window.dispatchEvent(new Event("new_chat"))

                      // reload list
                      window.dispatchEvent(new Event("reload_conversations"))

                      // 🔥 QUAN TRỌNG: chuyển sang màn chat
                      onViewChange("chat")
                    }}
                className="w-full mb-2 bg-red-800 text-white text-sm py-2 rounded-lg"
              >
                + Chat mới
              </button> */} 

              {/* <div className="flex-1 overflow-y-auto pr-1">
                <ConversationList onSelect={()=>{}} />
              </div>

            </div> */} 
        <div className="mt-auto p-4 border-t border-stone-100">
          {user ? (
            <div className="space-y-4">
              {/* User Profile Section */}
              <div 
                onClick={() => onViewChange('profile')}
                className="flex items-center gap-3 p-2 rounded-xl border border-stone-50 hover:bg-stone-50 cursor-pointer transition-all group"
              >
                {user.picture_url && !imgError ? (
                  <img 
                    src={user.picture_url} 
                    alt={user.username} 
                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover" 
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-900 font-serif shadow-sm">
                    {(user.username || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-stone-800 truncate">{user.full_name || user.username}</p>
                  <p className="text-[10px] text-stone-400 truncate uppercase tracking-widest font-black">{(user.token_balance ?? 0).toFixed(2)} Tokens</p>
                </div>
              </div>

              {/* <button 
                onClick={onLogout} */}
                <button 
               onClick={() => {

                localStorage.removeItem("access_token")
                localStorage.removeItem("conversation_id")

                window.dispatchEvent(new Event("clear_conversations"))

                onLogout()



                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="p-2 text-center">
              <p className="text-xs text-stone-400 mb-2">Đăng nhập để lưu lịch sử</p>
              {/* <button 
                onClick={() => onViewChange('chat')}
                className="w-full bg-red-800 text-white text-sm py-2 rounded-lg font-medium hover:bg-red-900 transition-colors"
              >
                Bắt đầu ngay
              </button> */}
              <button 
                onClick={() => {
                    window.dispatchEvent(new Event("open_login"))
                  }}
                  className="w-full bg-red-800 text-white text-sm py-2 rounded-lg font-medium hover:bg-red-900 transition-colors"
                >
                  Bắt đầu ngay
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 px-2 py-1 flex justify-around items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] pb-safe-offset-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex flex-col items-center gap-1 p-2 min-w-[64px] transition-all ${
              currentView === item.id 
                ? 'text-red-800' 
                : 'text-stone-400'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
        {user && (
           <button
             onClick={() => onViewChange('profile')}
             className="flex flex-col items-center gap-1 p-2 min-w-[64px]"
           >
             {user.picture_url && !mobileImgError ? (
               <img 
                 src={user.picture_url} 
                 alt={user.username} 
                 className="w-6 h-6 rounded-full border border-stone-100 object-cover" 
                 onError={() => setMobileImgError(true)}
               />
             ) : (
               <div className="w-6 h-6 bg-red-50 rounded-full flex items-center justify-center text-red-900 text-[10px] font-bold">
                 {(user.username || 'U').charAt(0).toUpperCase()}
               </div>
             )}
             <span className="text-[10px] font-bold uppercase tracking-tighter text-stone-400">Tôi</span>
           </button>
        )}
      </nav>
    </>
  );
};

export default Sidebar;

