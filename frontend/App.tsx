import React, { useState, useEffect, useCallback } from 'react';
import { User, View, ChatMessage, SiteConfig } from './types';
import { api, API_ROOT } from './api';
import { Capacitor } from '@capacitor/core';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import AuthView from './components/AuthView';
import PaymentView from './components/PaymentView';
import ProfileView from './components/ProfileView';
import AdminView from './components/AdminView';
import HistoryView from './components/HistoryView';
import QAView from './components/QAView';
import PersonalRagView from './components/PersonalRagView';
import LandingPage from './components/LandingPage';
import LandingPageMobile from './mobile/LandingPageMobile';
import LanguageSelector from './components/LanguageSelector';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import PaymentReportModal from './components/payment/PaymentReportModal';
import { confirmAction } from './utils/swal';
import SecureImage from './components/SecureImage';
import { ScreenOrientation } from '@capacitor/screen-orientation';

// Floating support ticket button (bottom-left)
const ReportFloatBtn: React.FC<{
  onClick: () => void;
  isSidebarOpen: boolean;
  hasSidebar: boolean;
}> = ({ onClick, isSidebarOpen, hasSidebar }) => {
  const { language } = useLanguage();

  const positionClass = hasSidebar
    ? (isSidebarOpen ? "left-6 md:left-[304px]" : "left-6 md:left-[88px]")
    : "left-6";

  return (
    <button
      onClick={onClick}
      title={language === 'vi' ? 'Báo cáo sự cố / Phản ánh' : 'Report Issue / Feedback'}
      className={`hidden md:flex fixed bottom-6 ${positionClass} z-[200] w-12 h-12 rounded-full shadow-xl border-2 items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer bg-gradient-to-r from-red-950 to-stone-900 text-amber-100`}
      style={{ borderColor: 'rgba(180,130,40,0.5)' }}
    >
      <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </button>
  );
};

// Language switcher floating button
const LangSwitcherBtn: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  return (
    <button
      onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
      title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
      className="hidden md:block fixed bottom-6 right-6 z-[200] rounded-full shadow-md border overflow-hidden hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
      style={{ borderColor: 'rgba(180, 130, 40, 0.3)', width: '36px', height: '36px' }}
    >
      {language === 'vi' ? (
        // Show EN flag to switch to English
        <svg viewBox="0 0 60 40" className="w-full h-full">
          <rect width="60" height="40" fill="#012169" />
          <path d="M0,0 L60,40 M60,0 L0,40" stroke="white" strokeWidth="6" />
          <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="4" />
          <path d="M30,0 V40 M0,20 H60" stroke="white" strokeWidth="10" />
          <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="6" />
        </svg>
      ) : (
        // Show VN flag to switch to Vietnamese
        <svg viewBox="0 0 30 20" className="w-full h-full">
          <rect width="30" height="20" fill="#da251d" />
          <polygon points="15,4 11.47,14.85 20.73,8.15 9.27,8.15 18.53,14.85" fill="#ffff00" />
        </svg>
      )}
    </button>
  );
};

const AppInner: React.FC = () => {
  const { hasChosen, setLanguage, language } = useLanguage();
  const isNative = Capacitor.isNativePlatform();
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('landing');
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const id = localStorage.getItem('conversation_id');
    if (id) setActiveConversationId(Number(id));

    // Sync activeConversationId when ChatView creates/changes conversation
    const syncHandler = () => {
      const newId = localStorage.getItem('conversation_id');
      setActiveConversationId(newId ? Number(newId) : null);
    };

    const newChatHandler = () => {
      setActiveConversationId(null);
      setChatHistory([]);
    };

    window.addEventListener('conversation_changed', syncHandler);
    window.addEventListener('new_chat', newChatHandler);
    return () => {
      window.removeEventListener('conversation_changed', syncHandler);
      window.removeEventListener('new_chat', newChatHandler);
    };
  }, []);

  useEffect(() => {
    if (isNative) {
      if (currentView === 'admin') {
        ScreenOrientation.lock({ orientation: 'landscape' }).catch(err => {
          console.error('Failed to lock screen to landscape:', err);
        });
      } else {
        ScreenOrientation.lock({ orientation: 'portrait' }).catch(err => {
          console.error('Failed to lock screen to portrait:', err);
        });
      }
    }
  }, [currentView, isNative]);

  console.log("DEBUG: App State", { isNative, currentView, API_ROOT });

  useEffect(() => {
    if (!isNative) return;
    const initNative = async () => {
      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        const { SplashScreen } = await import('@capacitor/splash-screen');
        const { App: CapApp } = await import('@capacitor/app');
        const { Browser } = await import('@capacitor/browser');

        await StatusBar.setBackgroundColor({ color: '#7c1515' });
        await StatusBar.setStyle({ style: Style.Dark });
        await SplashScreen.hide();

        CapApp.addListener('appUrlOpen', data => {
          if (data.url.includes('token=')) {
            const urlObj = new URL(data.url);
            const token = urlObj.searchParams.get('token');
            if (token) {
              localStorage.setItem('access_token', token);
              Browser.close().catch(() => { });
              window.location.reload();
            }
          }
        });
      } catch (e) {
        console.log('Mobile features skipping...');
      }
    };
    initNative();
  }, [isNative]);

  const [siteConfig, setSiteConfig] = useState<SiteConfig>({
    logo_url: '',
    site_title: 'Chatbot Lịch sử',
    landing_bg: '',
    chat_bg: '',
    favicon_url: '',
    game_enabled: 1,
    landing_hero_title: '',
    landing_hero_subtitle: '',
    landing_section_eras_title: '',
    landing_section_stats_title: '',
    landing_section_features_title: '',
    landing_eras_json: '',
    landing_footer_company: '',
    landing_footer_mst: '',
    landing_footer_representative: '',
    landing_footer_address: '',
    landing_footer_phone: '',
    landing_footer_about_us: '',
    landing_footer_terms: '',
    landing_footer_privacy: '',
    landing_hero_words: '',
    landing_process_json: '',
    landing_features_json: '',
    landing_stats_json: '',
    landing_highlights_json: '',
    landing_contact_email: '',
    landing_contact_zalo_num: '',
    landing_contact_zalo_link: '',
    landing_contact_fb_link: ''
  });

  const fetchSiteConfig = async () => {
    try {
      const config = await api.getPublicSettings();

      // Chuẩn hóa URL ảnh: nếu URL chứa host cũ (IP/localhost khác), thay bằng API_ROOT hiện tại
      const normalizeUrl = (url: string): string => {
        if (!url) return '';

        // Nếu là absolute URL (bắt đầu bằng http)
        if (url.startsWith('http')) {
          try {
            const parsed = new URL(url);
            const currentRoot = new URL(API_ROOT);
            if (parsed.host !== currentRoot.host) {
              // Thay thế host cũ bằng API_ROOT mới, giữ nguyên path
              return API_ROOT.replace(/\/$/, '') + parsed.pathname + parsed.search;
            }
            return url;
          } catch {
            return url;
          }
        }

        // Nếu là relative path
        const path = url.startsWith('/') ? url : '/' + url;
        return API_ROOT.replace(/\/$/, '') + path;
      };

      setSiteConfig({
        logo_url: normalizeUrl(config.logo_url || ""),
        site_title: config.site_title || "Chatbot",
        landing_bg: normalizeUrl(config.landing_bg || ""),
        chat_bg: normalizeUrl(config.chat_bg || ""),
        favicon_url: normalizeUrl(config.favicon_url || ""),
        game_enabled: config.game_enabled !== undefined ? config.game_enabled : 1,
        landing_hero_title: config.landing_hero_title || '',
        landing_hero_subtitle: config.landing_hero_subtitle || '',
        landing_section_eras_title: config.landing_section_eras_title || '',
        landing_section_stats_title: config.landing_section_stats_title || '',
        landing_section_features_title: config.landing_section_features_title || '',
        landing_eras_json: config.landing_eras_json || '',
        landing_footer_company: config.landing_footer_company || '',
        landing_footer_mst: config.landing_footer_mst || '',
        landing_footer_representative: config.landing_footer_representative || '',
        landing_footer_address: config.landing_footer_address || '',
        landing_footer_phone: config.landing_footer_phone || '',
        landing_footer_about_us: config.landing_footer_about_us || '',
        landing_footer_terms: config.landing_footer_terms || '',
        landing_footer_privacy: config.landing_footer_privacy || '',
        landing_hero_words: config.landing_hero_words || '',
        landing_process_json: config.landing_process_json || '',
        landing_features_json: config.landing_features_json || '',
        landing_stats_json: config.landing_stats_json || '',
        landing_highlights_json: config.landing_highlights_json || '',
        landing_contact_email: config.landing_contact_email || '',
        landing_contact_zalo_num: config.landing_contact_zalo_num || '',
        landing_contact_zalo_link: config.landing_contact_zalo_link || '',
        landing_contact_fb_link: config.landing_contact_fb_link || ''
      });
    } catch (err) {
      console.error("Load config lỗi:", err);
    }
  };

  useEffect(() => {
    fetchSiteConfig();

    // Lắng nghe sự kiện cập nhật cấu hình từ Admin
    window.addEventListener('reload_site_config', fetchSiteConfig);
    return () => window.removeEventListener('reload_site_config', fetchSiteConfig);
  }, []);

  // ================= AUTH =================
  const fetchUser = useCallback(async () => {
    try {
      const userData = await api.checkAuth();
      setUser(userData);
      setCurrentView(userData.is_admin ? 'admin' : 'chat');
    } catch {
      setUser(null);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUser();
    } else {
      setIsAuthLoading(false);
    }
  }, [fetchUser]);

  useEffect(() => {
    if (siteConfig?.favicon_url) {
      const faviconUrl = siteConfig.favicon_url.startsWith("http")
        ? siteConfig.favicon_url
        : API_ROOT + siteConfig.favicon_url;
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = faviconUrl + "?v=" + new Date().getTime();
    }
  }, [siteConfig]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("access_token", token);
      window.history.replaceState({}, document.title, "/");
      fetchUser();
    }
  }, [fetchUser]);

  // ================= HANDLERS =================
  const handleLogout = async () => {
    const isVi = language === 'vi';
    const confirmed = await confirmAction(
      isVi ? 'Đăng Xuất Khỏi Điện Đường' : 'Sign Out of Palace',
      isVi 
        ? 'Sĩ tử có chắc chắn muốn đăng xuất khỏi hệ thống không?' 
        : 'Are you sure you want to sign out of the system?'
    );
    if (!confirmed) return;

    localStorage.removeItem('access_token');
    localStorage.removeItem('conversation_id');
    setUser(null);
    setChatHistory([]);
    setActiveConversationId(null);
    setCurrentView('landing');
    fetchSiteConfig();
  };

  const handleLoginSuccess = (userData: User, token: string) => {
    localStorage.setItem('access_token', token);
    setUser(userData);
    setCurrentView(userData.is_admin ? 'admin' : 'chat');
    fetchSiteConfig();
  };

  const updateBalance = (newBalance: number) => {
    if (user) {
      setUser({ ...user, token_balance: newBalance });
    }
  };

  // ================= LOADING =================
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f6f2]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-600 font-serif italic">Đang ngược dòng thời gian...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex w-full ${isNative ? '' : 'h-screen'} ${currentView === 'landing' ? 'bg-black' : 'bg-[#f8f6f2]'} ${isNative ? 'is-native' : ''}`}
      style={isNative ? { height: 'calc(var(--vh, 1vh) * 100)' } : undefined}
    >
      {/* Language Selector Overlay - shown on first visit */}
      <AnimatePresence>
        {!hasChosen && (
          <LanguageSelector onSelect={(lang) => setLanguage(lang)} />
        )}
      </AnimatePresence>
      {/* SIDEBAR */}
      <AnimatePresence>
        {currentView !== 'landing' && currentView !== 'admin' && (
          <Sidebar
            user={user}
            currentView={currentView}
            onViewChange={setCurrentView}
            onLogout={handleLogout}
            siteConfig={siteConfig}
            activeConversationId={activeConversationId}
            onActiveConversationIdChange={setActiveConversationId}
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        )}
      </AnimatePresence>

      {/* MAIN */}
      <main className="flex-1 flex flex-col overflow-hidden min-h-0 relative">

        {/* CONTENT */}
        <div className={`flex-1 ${(currentView === 'chat' || currentView === 'admin') ? 'overflow-hidden' : 'overflow-y-auto'} ${isNative ? 'scrolling-touch' : ''} ${currentView !== 'landing' ? 'with-nav-padding' : ''}`}>
          {currentView === 'landing' ? (
            (isMobile || isNative) ? (
              <LandingPageMobile siteConfig={siteConfig} onStart={() => setCurrentView(user?.is_admin ? 'admin' : 'chat')} user={user} />
            ) : (
              <LandingPage siteConfig={siteConfig} onStart={() => setCurrentView(user?.is_admin ? 'admin' : 'chat')} user={user} />
            )
          ) : !user && currentView !== 'chat' ? (
            <div className="min-h-full w-full flex justify-center items-center py-12 px-4 relative overflow-hidden bg-[#faf6eb]">
              {/* 1. Custom Background if configured, else fallback historical background */}
              {siteConfig?.chat_bg ? (
                <SecureImage 
                  src={siteConfig.chat_bg.startsWith('http') ? siteConfig.chat_bg : `${API_ROOT}${siteConfig.chat_bg.startsWith('/') ? '' : '/'}${siteConfig.chat_bg}`}
                  isBackground={true}
                  className="absolute inset-0 pointer-events-none object-cover w-full h-full"
                  style={{ zIndex: 0 }}
                />
              ) : (
                <div 
                  className="absolute inset-0 pointer-events-none object-cover w-full h-full"
                  style={{ 
                    backgroundImage: "url('/images/historical_bg_hd.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: 0 
                  }} 
                />
              )}

              {/* 2. Paper texture & watermark overlay matching the chat style */}
              <div className="absolute inset-0 paper-texture-only motif-watermark pointer-events-none opacity-60" style={{ zIndex: 1 }} />
              
              {/* 3. Dark overlay to make the login card stand out and be readable */}
              <div className="absolute inset-0 bg-[#1c120c]/40 backdrop-blur-[2px] pointer-events-none" style={{ zIndex: 2 }} />

              {/* 4. Login Card */}
              <div className="relative z-10 w-full flex justify-center">
                <AuthView onSuccess={handleLoginSuccess} />
              </div>
            </div>
          ) : (
            <>
              {currentView === 'chat' && (
                <ChatView
                  user={user}
                  onAuthRequired={() => setCurrentView('chat')}
                  history={chatHistory}
                  setHistory={setChatHistory}
                  onBalanceUpdate={updateBalance}
                  siteConfig={siteConfig}
                  isSidebarOpen={isSidebarOpen}
                />
              )}
              {currentView === 'history' && (
                <HistoryView
                  activeId={activeConversationId}
                  onSelect={(id) => {
                    setActiveConversationId(id === -1 ? null : id);
                    setCurrentView('chat');
                  }}
                  isSidebarOpen={isSidebarOpen}
                />
              )}
              {currentView === 'payment' && <PaymentView user={user} onBalanceUpdate={updateBalance} isSidebarOpen={isSidebarOpen} siteConfig={siteConfig} />}
              {currentView === 'qa' && user && <QAView user={user} onBalanceUpdate={updateBalance} onNavigate={setCurrentView} />}
              {currentView === 'admin' && user?.is_admin && <AdminView user={user} onUpdateUser={setUser} onLogout={handleLogout} isSidebarOpen={isSidebarOpen} onViewChange={setCurrentView} siteConfig={siteConfig} />}
              {currentView === 'profile' && user && (
                <ProfileView
                  user={user}
                  onUpdateUser={setUser}
                  onLogout={handleLogout}
                  isSidebarOpen={isSidebarOpen}
                  onViewChange={setCurrentView}
                  onRequestReport={() => setShowReportForm(true)}
                />
              )}
              {currentView === 'personal-rag' && user && (
                <PersonalRagView
                  user={user}
                  isSidebarOpen={isSidebarOpen}
                />
              )}
            </>
          )}
        </div>
      </main>
      <Toaster position="top-right" />
      {/* Floating language switcher button */}
      {currentView !== 'admin' && <LangSwitcherBtn />}
      {/* Floating report button (bottom-left) */}
      {user && !user.is_admin && (
        <ReportFloatBtn
          onClick={() => setShowReportForm(true)}
          isSidebarOpen={isSidebarOpen}
          hasSidebar={currentView !== 'landing' && currentView !== 'admin'}
        />
      )}
      {showReportForm && (
        <PaymentReportModal
          user={user}
          onClose={() => setShowReportForm(false)}
        />
      )}
    </div>
  );
};

const App: React.FC = () => (
  <LanguageProvider>
    <AppInner />
  </LanguageProvider>
);

export default App;
