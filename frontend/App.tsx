
import React, { useState, useEffect, useCallback } from 'react';
import { User, View, ChatMessage } from './types';
import { api, API_ROOT } from './api';

import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import AuthView from './components/AuthView';
import PaymentView from './components/PaymentView';
import ProfileView from './components/ProfileView';
import AdminView from './components/AdminView';
import LandingPage from './components/LandingPage';

import { Toaster } from 'react-hot-toast';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('landing');
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // const [siteConfig, setSiteConfig] = useState({
  //   logo_url: '',
  //   site_title: 'Chatbot Lịch sử'
    
  // });
      const [siteConfig, setSiteConfig] = useState<{
      logo_url: string;
      site_title: string;
      landing_bg: string;
      favicon_url: string; // 🔥 THÊM
    }>({
      logo_url: '',
      site_title: 'Chatbot Lịch sử',
      landing_bg: '', // 🔥 THÊM
      favicon_url: '' // 🔥 THÊM
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

    // 🔥 thêm timestamp để tránh cache
    link.href = faviconUrl + "?v=" + new Date().getTime();
  }
}, [siteConfig]);


useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (token) {
    // 🔥 LƯU TOKEN
    localStorage.setItem("access_token", token);

    // 🔥 XÓA TOKEN KHỎI URL (cho đẹp + tránh loop)
    window.history.replaceState({}, document.title, "/");

    // 🔥 CALL AUTH
    fetchUser();
  }
}, [fetchUser]);

  // ================= HANDLERS =================
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('conversation_id');

    setUser(null);
    setChatHistory([]);
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
          <p className="text-stone-600 font-serif italic">
            Đang ngược dòng thời gian...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8f6f2]">

      {/* SIDEBAR */}
      {currentView !== 'landing' && (
        <Sidebar
          user={user}
          currentView={currentView}
          onViewChange={setCurrentView}
          onLogout={handleLogout}
          siteConfig={siteConfig}
        />
      )}

      {/* MAIN */}
      <main className="flex-1 flex flex-col overflow-hidden min-h-0">

        {/* CONTENT */}
        <div className="flex-1 overflow-auto">

          {currentView === 'landing' && (
            <LandingPage
              siteConfig={siteConfig}
              onStart={() => setCurrentView('chat')}
            />
          )}

          {!user && currentView !== 'chat' && currentView !== 'landing' ? (
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

              {currentView === 'payment' && (
                <PaymentView onBalanceUpdate={updateBalance} />
              )}

              {currentView === 'admin' && user?.is_admin && (
                <AdminView />
              )}

              {currentView === 'profile' && user && (
                <ProfileView user={user} onUpdateUser={setUser} />
              )}
            </>
          )}

        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  );
};

export default App;