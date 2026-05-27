import React from 'react';
import { User, View, SiteConfig } from '../types';
import { API_ROOT } from '../api';
import ConversationList from "./chat/ConversationList";
import { motion, AnimatePresence } from 'framer-motion';
import SecureImage from './SecureImage';

interface SidebarProps {
  user: User | null;
  currentView: View;
  onViewChange: (view: View) => void;
  onLogout: () => void;
  siteConfig?: SiteConfig;
  activeConversationId: number | null;
  onActiveConversationIdChange: (id: number | null) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  user, currentView, onViewChange, onLogout, 
  siteConfig, activeConversationId, onActiveConversationIdChange,
  isOpen, onToggle 
}) => {
  const [imgError, setImgError] = React.useState(false);
  const [mobileImgError, setMobileImgError] = React.useState(false);
  
  // Defensive Detection
  const isNative = (window as any).Capacitor?.isNativePlatform?.() || false;

  const navItems = [
    { id: 'landing' as View, label: 'Trang chủ', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'chat' as View, label: 'Sử Việt', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    { id: 'history' as View, label: 'Lịch sử', icon: 'M12 8v4l3 2m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'new_chat' as View, label: 'Đoạn chat mới', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    { id: 'payment' as View, label: 'Nạp Tiền', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    ...(user ? [{ id: 'qa' as View, label: 'Q&A Token', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' }] : []),
    ...(user?.is_admin ? [{ id: 'admin' as View, label: 'ADMIN', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' }] : []),
  ];

  const handleNavClick = (id: View) => {
    if (id === "new_chat") {
      localStorage.removeItem("conversation_id");
      window.dispatchEvent(new Event("new_chat"));
      window.dispatchEvent(new Event("reload_conversations"));
      onActiveConversationIdChange(null);
      onViewChange("chat");
    } else {
      onViewChange(id);
    }
  };

  return (
    <>
      {/* Desktop Sidebar (Original) */}
      <motion.aside 
        initial={false}
        animate={{ width: isOpen ? 288 : 72 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="hidden md:flex bg-[#171717] border-r border-white/10 flex-col h-screen shrink-0 relative overflow-hidden"
      >
        <div className={`flex-1 flex flex-col min-h-0 ${isOpen ? 'p-6' : 'p-3'} overflow-y-auto chatgpt-scrollbar`}>
          <div className={`flex items-center ${isOpen ? 'justify-between' : 'justify-center'} mb-8 shrink-0`}>
            {isOpen && (
              <div 
                onClick={() => onViewChange('landing')}
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 bg-red-800 rounded-xl flex items-center justify-center text-white shadow-xl shadow-red-900/40 shrink-0 border border-amber-500/30 overflow-hidden">
                   {siteConfig?.logo_url ? (
                      <SecureImage 
                        src={siteConfig.logo_url.startsWith('/') ? `${API_ROOT}${siteConfig.logo_url}` : siteConfig.logo_url} 
                        alt="Logo" 
                        className="w-full h-full object-cover" 
                      />
                   ) : (
                      <span className="text-xl font-serif italic font-black">{siteConfig?.site_title?.charAt(0) || '史'}</span>
                   )}
                </div>
                <div>
                  <h1 className="text-xl font-black text-white tracking-tighter uppercase leading-none italic font-serif">
                    {siteConfig?.site_title || 'Sử Việt AI'}
                  </h1>
                  <p className="text-[8px] text-amber-500/60 font-bold uppercase tracking-[0.3em] mt-0.5">Tri thức ngàn năm</p>
                </div>
              </div>
            )}

            <button 
              onClick={onToggle}
              className={`p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-lg transition-all ${!isOpen ? 'mt-2' : ''}`}
              title={isOpen ? "Thu gọn" : "Mở rộng"}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          <nav className="space-y-2 shrink-0">
            {navItems.filter(i => i.id !== 'history').map((item) => {
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full group relative flex items-center ${isOpen ? 'gap-3 px-4 py-3' : 'justify-center p-3'} rounded-2xl transition-all ${
                    isActive 
                      ? 'bg-white/10 text-white font-bold' 
                      : 'text-stone-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <svg className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-stone-500 group-hover:text-stone-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  {isOpen && <span>{item.label}</span>}
                  
                  {isOpen && isActive && (
                    <motion.div 
                      layoutId="desktopActive"
                      className="absolute left-0 w-1 h-6 bg-red-800 rounded-r-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {user && (
            <div className={`mt-8 ${!isOpen ? 'items-center flex flex-col' : ''}`}>
              {isOpen && (
                <div className="px-5 mb-4">
                  <p className="text-[11px] font-black text-stone-500 uppercase tracking-widest opacity-40">Lịch sử hội thoại</p>
                </div>
              )}
              <div className={!isOpen ? 'hidden' : ''}>
                <ConversationList 
                  dark
                  onSelect={(id:number)=>{onActiveConversationIdChange(id)}}
                  activeId={activeConversationId}
                />
              </div>
              {!isOpen && (
                <div className="pt-2">
                   <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                   </svg>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={`mt-auto ${isOpen ? 'p-4' : 'p-2'} border-t border-white/5`}>
          {user ? (
            <div className="space-y-4">
              <div 
                onClick={() => onViewChange('profile')}
                className={`flex items-center ${isOpen ? 'gap-3 p-2' : 'justify-center p-2'} rounded-xl border border-white/5 hover:bg-white/5 cursor-pointer transition-all group`}
              >
                {user.picture_url ? (
                  <SecureImage 
                    src={user.picture_url.startsWith('/') ? `${API_ROOT}${user.picture_url}` : user.picture_url} 
                    alt={user.username} 
                    className="w-10 h-10 rounded-full border-2 border-white/10 shadow-sm object-cover" 
                  />
                ) : (
                  <div className={`w-10 h-10 ${isOpen ? 'bg-red-900/20 text-red-100' : 'bg-red-800 text-white'} rounded-full flex items-center justify-center font-serif shadow-sm`}>
                    {(user.username || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                {isOpen && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate mb-1">{user.full_name || user.username}</p>
                    {/* ROYAL TOKEN BADGE (Lệnh bài) */}
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      onClick={(e) => { e.stopPropagation(); onViewChange('payment'); }}
                      className="relative overflow-hidden bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 p-[1px] rounded-lg shadow-[0_0_15px_rgba(251,191,36,0.3)] cursor-pointer"
                    >
                      <div className="bg-[#171717]/90 rounded-[7px] px-2 py-1 flex items-center gap-1.5 border border-white/5">
                        <div className="w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(251,191,36,0.5)]">
                          <span className="text-[10px] font-black text-red-950">史</span>
                        </div>
                        <span className="text-[10px] text-amber-100 font-black uppercase tracking-tighter">
                          {(user.token_balance ?? 0).toFixed(2)} <span className="text-amber-400">Tokens</span>
                        </span>
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>

              {isOpen ? (
                <button 
                  onClick={() => {
                    localStorage.removeItem("access_token")
                    localStorage.removeItem("conversation_id")
                    window.dispatchEvent(new Event("clear_conversations"))
                    onLogout()
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Đăng xuất
                </button>
              ) : (
                <button 
                  onClick={() => {
                    localStorage.removeItem("access_token")
                    onLogout()
                  }}
                  className="w-full flex justify-center p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  title="Đăng xuất"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              )}
            </div>
          ) : (
            <div className={`p-2 text-center ${!isOpen ? 'flex flex-col items-center' : ''}`}>
              {isOpen && <p className="text-xs text-stone-500 mb-2">Đăng nhập ngay</p>}
              <button 
                onClick={() => onViewChange('profile')}
                className={`bg-red-800 text-white text-sm ${isOpen ? 'w-full py-2 px-4' : 'p-2'} rounded-lg font-medium hover:bg-red-900 transition-colors flex items-center justify-center`}
                title="Bắt đầu ngay"
                >
                  {isOpen ? 'Bắt đầu ngay' : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  )}
              </button>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Mobile Bottom Nav - PREMIUM GLASSMORPHISM */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 px-2 pb-[calc(1rem+var(--sab))] pt-3 flex justify-around items-center z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] transition-all ${isNative ? 'glass-nav backdrop-blur-3xl' : 'bg-white/90 backdrop-blur-md border-t border-stone-100'}`}>
        {navItems
          .filter(item => item.id !== 'new_chat' && item.id !== 'admin')
          .map((item) => (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleNavClick(item.id)}
            className={`relative flex flex-col items-center gap-1.5 min-w-[52px] py-1 transition-colors ${
              currentView === item.id ? 'text-red-800' : 'text-stone-400'
            }`}
          >
            <div className={`p-2 rounded-2xl transition-all ${currentView === item.id ? 'bg-red-50' : ''}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
            </div>
            <span className={`text-[9px] font-black uppercase tracking-wider ${currentView === item.id ? 'opacity-100' : 'opacity-60'}`}>
              {item.label}
            </span>
            {currentView === item.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-1 bg-red-800 rounded-full"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        ))}

        {/* PROFILE / LOGIN TAB */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onViewChange('profile')}
          className={`relative flex flex-col items-center gap-1.5 min-w-[52px] py-1 transition-colors ${
            currentView === 'profile' ? 'text-red-800' : 'text-stone-400'
          }`}
        >
          <div className={`p-2 rounded-2xl transition-all ${currentView === 'profile' ? 'bg-red-50' : ''}`}>
            {user ? (
               user.picture_url ? (
                <SecureImage 
                  src={user.picture_url.startsWith('/') ? `${API_ROOT}${user.picture_url}` : user.picture_url} 
                  alt={user.username} 
                  className={`w-6 h-6 rounded-full object-cover border-2 ${currentView === 'profile' ? 'border-red-400' : 'border-stone-200'}`} 
                />
              ) : (
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${currentView === 'profile' ? 'bg-red-800 text-white' : 'bg-stone-200 text-stone-500'}`}>
                  {(user.username || 'U').charAt(0).toUpperCase()}
                </div>
              )
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          <span className={`text-[9px] font-black uppercase tracking-wider ${currentView === 'profile' ? 'opacity-100' : 'opacity-60'}`}>
            {user ? 'Tôi' : 'Đăng nhập'}
          </span>
          {currentView === 'profile' && (
            <motion.div 
              layoutId="activeTab"
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-1 bg-red-800 rounded-full"
            />
          )}
        </motion.button>
      </nav>
    </>
  );
};

export default Sidebar;
