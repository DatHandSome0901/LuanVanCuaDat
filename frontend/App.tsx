
import React, { useState, useEffect, useCallback } from 'react';
import { User, View, ChatMessage } from './types';
import { api, API_ROOT } from './api';

import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import AuthView from './components/AuthView';
import PaymentView from './components/PaymentView';
import ProfileView from './components/ProfileView';
import AdminView from './components/AdminView';
import HistoryView from './components/HistoryView';
import LandingPage from './components/LandingPage';
import LandingPageMobile from './mobile/LandingPageMobile';
import { Toaster } from 'react-hot-toast';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('landing');
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('conversation_id');
    if (id) setActiveConversationId(Number(id));
  }, []);

  // ================= NATIVE DETECTION & INIT =================
  const isNative = (window as any).Capacitor?.isNativePlatform?.() || false;

  useEffect(() => {
    if (!isNative) return;
    const initNative = async () => {
      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        const { SplashScreen } = await import('@capacitor/splash-screen');
        await StatusBar.setBackgroundColor({ color: '#7c1515' });
        await StatusBar.setStyle({ style: Style.Dark });
        await SplashScreen.hide();
      } catch (e) {
        console.log('Mobile features skipping...');
      }
    };
    initNative();
  }, [isNative]);

  const [siteConfig, setSiteConfig] = useState<{
    logo_url: string;
    site_title: string;
    landing_bg: string;
    favicon_url: string;
  }>({
    logo_url: '',
    site_title: 'Chatbot Lịch sử',
    landing_bg: '',
    favicon_url: ''
  });

  const fetchSiteConfig = async () => {
    try {
      const config = await api.getPublicSettings();
      setSiteConfig({
        logo_url: config.logo_url || "",
        site_title: config.site_title || "Chatbot",
        landing_bg: config.landing_bg || "",
        favicon_url: config.favicon_url || ""
      });
    } catch (err) {
      console.error("Load config lỗi:", err);
    }
  };

  useEffect(() => {
    fetchSiteConfig();
  }, []);

  // ================= AUTH =================
  const fetchUser = useCallback(async () => {
    try {
      const userData = await api.checkAuth();
      setUser(userData);
      setCurrentView('chat');
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
  const handleLogout = () => {
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
    setCurrentView('chat');
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
    <div className={`flex h-screen ${currentView === 'landing' ? 'bg-black' : 'bg-[#f8f6f2]'} ${isNative ? 'is-native' : ''}`}>
      {/* SIDEBAR */}
      {currentView !== 'landing' && (
        <Sidebar
          user={user}
          currentView={currentView}
          onViewChange={setCurrentView}
          onLogout={handleLogout}
          siteConfig={siteConfig}
          activeConversationId={activeConversationId}
          onActiveConversationIdChange={setActiveConversationId}
        />
      )}

      {/* MAIN */}
      <main className="flex-1 flex flex-col overflow-hidden min-h-0 relative">
        {/* CONTENT */}
        <div className={`flex-1 overflow-y-auto ${isNative ? 'scrolling-touch' : ''} ${isNative && currentView !== 'landing' ? 'with-nav-padding' : ''}`}>
          {currentView === 'landing' ? (
            isNative ? (
              <LandingPageMobile siteConfig={siteConfig} onStart={() => setCurrentView('chat')} />
            ) : (
              <LandingPage siteConfig={siteConfig} onStart={() => setCurrentView('chat')} />
            )
          ) : !user && currentView !== 'chat' ? (
            <AuthView onSuccess={handleLoginSuccess} />
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
                />
              )}
              {currentView === 'history' && (
                <HistoryView 
                  activeId={activeConversationId} 
                  onSelect={(id) => {
                    setActiveConversationId(id);
                    setCurrentView('chat');
                  }} 
                />
              )}
              {currentView === 'payment' && <PaymentView onBalanceUpdate={updateBalance} />}
              {currentView === 'admin' && user?.is_admin && <AdminView />}
              {currentView === 'profile' && user && <ProfileView user={user} onUpdateUser={setUser} onLogout={handleLogout} />}
            </>
          )}
        </div>
      </main>
      <Toaster position="top-right" />
    </div>
  );
};

export default App;