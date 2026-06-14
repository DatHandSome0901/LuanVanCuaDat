import React, { useState, useEffect } from 'react';
import { api, API_ROOT } from '../api';
import toast from 'react-hot-toast';
import {
  Users as UsersIcon, Box, History as HistoryIcon, FileText, MessageSquare,
  Settings as SettingsIcon, LogIn, BarChart3, BookOpen, LayoutDashboard,
  ShieldCheck, ArrowLeft, LogOut, ThumbsDown, MessageCircle, Terminal
} from 'lucide-react';
import { confirmDestructive, promptInput, confirmAction, promptTokenAdjustment } from '../utils/swal';
import { motion } from 'framer-motion';
import SecureImage from './SecureImage';
import { useLanguage } from '../contexts/LanguageContext';

import UsersTab from './admin/UsersTab';
import PackagesTab from './admin/PackagesTab';
import HistoryTab from './admin/HistoryTab';
import PaymentsTab from './admin/PaymentsTab';
import ChatLogsTab from './admin/ChatLogsTab';
import SettingsTab from './admin/SettingsTab';
import LoginsTab from './admin/LoginsTab';
import ReportsTab from './admin/ReportsTab';
import ChatLogDetailModal from './admin/ChatLogDetailModal';
import UserDetailModal from './admin/UserDetailModal';
import KnowledgeTab from './admin/KnowledgeTab';
import FeedbackTab from './admin/FeedbackTab';
import DashboardTab from './admin/DashboardTab';
import SupportTab from './admin/SupportTab';
import RagPlaygroundTab from './admin/RagPlaygroundTab';

type AdminTab = 'dashboard' | 'users' | 'packages' | 'history' | 'payments' | 'chatlogs' | 'settings' | 'logins' | 'reports' | 'knowledge' | 'feedback' | 'support' | 'rag_playground';


interface AdminViewProps {
  user?: any;
  onUpdateUser?: (user: any) => void;
  onLogout?: () => void;
  isSidebarOpen?: boolean;
  onViewChange?: (view: any) => void;
  siteConfig?: any;
}

const AdminView: React.FC<AdminViewProps> = ({ user, onUpdateUser, onLogout, isSidebarOpen, onViewChange, siteConfig }) => {
  const { language, t } = useLanguage();
  const isVi = language === 'vi';
  const [activeTab, setActiveTab] = useState<AdminTab>(
    (localStorage.getItem('adminActiveTab') as AdminTab) || 'dashboard'
  );
  const [isAdminSidebarOpen, setIsAdminSidebarOpen] = useState(() => {
    return localStorage.getItem('isAdminSidebarOpen') !== 'false';
  });
  const [paymentFilter, setPaymentFilter] = useState<'completed' | 'pending' | 'failed'>('completed');
  const [data, setData] = useState<any>({
    users: [], packages: [], history: [], payments: [], chatlogs: [],
    rate: 1.0, logins: [], reports: [], negativeFeedback: [],
    site_title: '', seo_description: '', seo_keywords: '', seo_author: '', favicon_url: '', landing_bg: '', chat_bg: '',
    no_answer_fallback: '', llm_name: 'openai',
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
    system_prompt: ''
  } as any);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState<any | null>(null);
  const [preseedPlaygroundQuestion, setPreseedPlaygroundQuestion] = useState<string>('');

  useEffect(() => {
    fetchData();
    localStorage.setItem('adminActiveTab', activeTab);
  }, [activeTab]);

  const handleViewUserDetail = async (userId: number) => {
    try {
      const res = await api.adminGetUserDetail(userId);
      setSelectedUserDetail(res);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleEditUser = async (userId: number, field: 'full_name' | 'password', currentVal?: string) => {
    const title = field === 'full_name' ? t.admin_edit_name_title : t.admin_edit_pwd_title;
    const label = field === 'full_name' ? t.admin_edit_name_label : t.admin_edit_pwd_label;

    const newVal = await promptInput(title, label, currentVal || '');
    if (newVal) {
      try {
        await api.adminUpdateUser(userId, { [field]: newVal });
        toast.success(t.admin_update_user_success);
        if (activeTab === 'users') fetchData();
        if (selectedUserDetail) handleViewUserDetail(userId);
      } catch (err: any) {
        toast.error(err.message);
      }
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const [usersRes, paymentsRes, chatlogsRes, loginsRes, settingsRes, feedbackRes] = await Promise.all([
          api.adminGetUsers().catch(() => ({ users: [] })),
          api.adminGetPayments().catch(() => ({ payments: [] })),
          api.adminGetChatLogs().catch(() => ({ logs: [] })),
          api.adminGetActiveUsers().catch(() => ({ logins: [] })),
          api.adminGetSettings().catch(() => ({} as any)),
          api.adminGetNegativeFeedback().catch(() => [])
        ]);
        setData((prev: any) => ({
          ...prev,
          users: usersRes?.users || [],
          payments: paymentsRes?.payments || [],
          chatlogs: chatlogsRes?.logs || [],
          logins: loginsRes?.logins || [],
          rate: settingsRes.rate_per_1000,
          logo_url: settingsRes.logo_url,
          site_title: settingsRes.site_title,
          landing_bg: settingsRes.landing_bg,
          chat_bg: settingsRes.chat_bg,
          seo_description: settingsRes.seo_description,
          seo_keywords: settingsRes.seo_keywords,
          seo_author: settingsRes.seo_author,
          favicon_url: settingsRes.favicon_url,
          no_answer_fallback: settingsRes.no_answer_fallback,
          llm_name: settingsRes.llm_name || 'openai',
          game_enabled: settingsRes.game_enabled,
          landing_hero_title: settingsRes.landing_hero_title,
          landing_hero_subtitle: settingsRes.landing_hero_subtitle,
          landing_section_eras_title: settingsRes.landing_section_eras_title,
          landing_section_stats_title: settingsRes.landing_section_stats_title,
          landing_section_features_title: settingsRes.landing_section_features_title,
          landing_eras_json: settingsRes.landing_eras_json,
          landing_footer_company: settingsRes.landing_footer_company,
          landing_footer_mst: settingsRes.landing_footer_mst,
          landing_footer_representative: settingsRes.landing_footer_representative,
          landing_footer_address: settingsRes.landing_footer_address,
          landing_footer_phone: settingsRes.landing_footer_phone,
          system_prompt: settingsRes.system_prompt,
          negativeFeedback: feedbackRes || []
        }));
      } else if (activeTab === 'users') {
        const res = await api.adminGetUsers();
        setData((prev: any) => ({ ...prev, users: res?.users || [] }));
      } else if (activeTab === 'packages') {
        const res = await api.adminGetPackages();
        setData((prev: any) => ({ ...prev, packages: res?.packages || [] }));
      } else if (activeTab === 'history') {
        const res = await api.adminGetTokenHistory();
        setData((prev: any) => ({ ...prev, history: res?.history || [] }));
      } else if (activeTab === 'payments') {
        const res = await api.adminGetPayments();
        setData((prev: any) => ({ ...prev, payments: res?.payments || [] }));
      } else if (activeTab === 'chatlogs') {
        const res = await api.adminGetChatLogs();
        setData((prev: any) => ({ ...prev, chatlogs: res?.logs || [] }));
      } else if (activeTab === 'settings') {
        const res = await api.adminGetSettings();
        setData((prev: any) => ({
          ...prev,
          rate: res.rate_per_1000,
          logo_url: res.logo_url,
          site_title: res.site_title,
          landing_bg: res.landing_bg,
          chat_bg: res.chat_bg,
          seo_description: res.seo_description,
          seo_keywords: res.seo_keywords,
          seo_author: res.seo_author,
          favicon_url: res.favicon_url,
          no_answer_fallback: res.no_answer_fallback,
          llm_name: res.llm_name,
          game_enabled: res.game_enabled,
          landing_hero_title: res.landing_hero_title,
          landing_hero_subtitle: res.landing_hero_subtitle,
          landing_section_eras_title: res.landing_section_eras_title,
          landing_section_stats_title: res.landing_section_stats_title,
          landing_section_features_title: res.landing_section_features_title,
          landing_eras_json: res.landing_eras_json,
          landing_footer_company: res.landing_footer_company,
          landing_footer_mst: res.landing_footer_mst,
          landing_footer_representative: res.landing_footer_representative,
          landing_footer_address: res.landing_footer_address,
          landing_footer_phone: res.landing_footer_phone,
          landing_footer_about_us: res.landing_footer_about_us,
          landing_footer_terms: res.landing_footer_terms,
          landing_footer_privacy: res.landing_footer_privacy,
          system_prompt: res.system_prompt
        }));
      } else if (activeTab === 'logins') {
        const res = await api.adminGetActiveUsers();
        setData((prev: any) => ({ ...prev, logins: res?.logins || [] }));
      } else if (activeTab === 'reports') {
        const res = await api.adminGetPaymentReports();
        setData((prev: any) => ({ ...prev, reports: res?.reports || [] }));
      } else if (activeTab === 'feedback') {
        // Handled within the component itself or can fetch here if needed
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBalance = async (userId: number, currentBalance: number) => {
    const targetUser = data.users.find((u: any) => u.id === userId);
    const adjustment = await promptTokenAdjustment(t.admin_adjust_bal_title, targetUser?.username || 'N/A');

    if (adjustment) {
      try {
        await api.adminUpdateUserBalance(userId, adjustment);
        toast.success(t.admin_adjust_bal_success);
        fetchData();

        // Cập nhật state chung nếu admin tự thay đổi số dư của mình
        if (user && user.id === userId && onUpdateUser) {
          const delta = adjustment.type === 'in' ? adjustment.amount : -adjustment.amount;
          onUpdateUser({ ...user, token_balance: user.token_balance + delta });
        }
      } catch (err: any) {
        toast.error(err.message);
      }
    }
  };

  const handleDeleteUser = async (userId: number) => {
    // Basic frontend check, backend also enforces this
    const user = data.users.find((u: any) => u.id === userId);
    if (user?.is_admin) {
      toast.error(t.admin_delete_admin_err);
      return;
    }

    const confirmed = await confirmDestructive(t.admin_delete_user_title, t.admin_delete_user_desc);
    if (confirmed) {
      try {
        await api.adminDeleteUser(userId);
        toast.success(t.admin_delete_user_success);
        fetchData();
      } catch (err: any) {
        toast.error(err.message);
      }
    }
  };

  const handleToggleAdmin = async (userId: number, currentStatus: boolean) => {
    // Prevent self-demotion
    try {
      const currentUserStr = localStorage.getItem('user');
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        if (currentUser.id === userId && currentStatus) {
          toast.error(t.admin_self_demote_err);
          return;
        }
      }
    } catch (e) {
      console.error("Error checking current user", e);
    }

    const confirmed = await confirmAction(
      currentStatus ? t.admin_demote_title : t.admin_promote_title,
      currentStatus ? t.admin_demote_desc : t.admin_promote_desc
    );

    if (confirmed) {
      try {
        await api.adminUpdateUser(userId, { is_admin: currentStatus ? 0 : 1 });
        toast.success(currentStatus ? t.admin_demote_success : t.admin_promote_success);
        fetchData();
      } catch (err: any) {
        toast.error(err.message);
      }
    }
  };

  const handleCreatePackage = async () => {
    const name = await promptInput(t.admin_create_pkg_title, t.admin_pkg_name_label);
    if (!name) return;
    const tokens = await promptInput(t.admin_create_pkg_title, t.admin_pkg_tokens_label);
    if (!tokens) return;
    const amount = await promptInput(t.admin_create_pkg_title, t.admin_pkg_amount_label);

    if (name && tokens && amount) {
      try {
        await api.adminCreatePackage({ name, tokens: parseInt(tokens), amount_vnd: parseInt(amount) });
        toast.success(t.admin_pkg_create_success);
        fetchData();
      } catch (err: any) {
        toast.error(err.message);
      }
    }
  };

  const handleDeletePackage = async (id: number) => {
    const confirmed = await confirmDestructive(t.admin_pkg_delete_title, t.admin_pkg_delete_desc);
    if (confirmed) {
      try {
        await api.adminDeletePackage(id);
        toast.success(t.admin_pkg_delete_success);
        fetchData();
      } catch (err: any) {
        toast.error(err.message);
      }
    }
  };

  const handleUpdatePackage = async (pkg: any) => {
    const name = await promptInput(t.admin_pkg_edit_title, t.admin_pkg_name_label, pkg.name);
    if (!name) return;
    const tokens = await promptInput(t.admin_pkg_edit_title, t.admin_pkg_tokens_label, pkg.tokens.toString());
    if (!tokens) return;
    const amount = await promptInput(t.admin_pkg_edit_title, t.admin_pkg_amount_label, pkg.amount_vnd.toString());

    if (name && tokens && amount) {
      try {
        await api.adminUpdatePackage(pkg.id, {
          name,
          tokens: parseInt(tokens),
          amount_vnd: parseInt(amount)
        });
        toast.success(t.admin_pkg_update_success);
        fetchData();
      } catch (err: any) {
        toast.error(err.message);
      }
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const settings = {
      rate_per_1000: data.rate,
      logo_url: data.logo_url,
      landing_bg: data.landing_bg,
      chat_bg: data.chat_bg,
      favicon_url: data.favicon_url,
      site_title: data.site_title,
      seo_description: data.seo_description,
      seo_keywords: data.seo_keywords,
      seo_author: data.seo_author,
      no_answer_fallback: data.no_answer_fallback,
      llm_name: data.llm_name,
      game_enabled: data.game_enabled,
      landing_hero_title: data.landing_hero_title,
      landing_hero_subtitle: data.landing_hero_subtitle,
      landing_section_eras_title: data.landing_section_eras_title,
      landing_section_stats_title: data.landing_section_stats_title,
      landing_section_features_title: data.landing_section_features_title,
      landing_eras_json: data.landing_eras_json,
      landing_footer_company: data.landing_footer_company,
      landing_footer_mst: data.landing_footer_mst,
      landing_footer_representative: data.landing_footer_representative,
      landing_footer_address: data.landing_footer_address,
      landing_footer_phone: data.landing_footer_phone,
      landing_footer_about_us: data.landing_footer_about_us,
      landing_footer_terms: data.landing_footer_terms,
      landing_footer_privacy: data.landing_footer_privacy,
      system_prompt: data.system_prompt
    };

    try {
      await api.adminUpdateSettings(settings);
      toast.success(t.admin_settings_update_success);

      // 🔥 Phát tín hiệu để App.tsx cập nhật lại siteConfig
      window.dispatchEvent(new Event('reload_site_config'));

      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSyncFromFile = async () => {
    try {
      const loadingToast = toast.loading(t.admin_settings_sync_loading);
      const res = await api.adminSyncFromHtml();
      setData((prev: any) => ({ ...prev, ...res }));
      toast.dismiss(loadingToast);
      toast.success(t.admin_settings_sync_success);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData((prev: any) => ({ ...prev, [name]: value }));
  };

  const navItems = [
    { id: 'dashboard' as AdminTab, label: t.admin_nav_dashboard, icon: LayoutDashboard },
    { id: 'users' as AdminTab, label: t.admin_nav_users, icon: UsersIcon },
    { id: 'packages' as AdminTab, label: t.admin_nav_packages, icon: Box },
    { id: 'history' as AdminTab, label: t.admin_nav_history, icon: HistoryIcon },
    { id: 'payments' as AdminTab, label: t.admin_nav_payments, icon: FileText },
    { id: 'chatlogs' as AdminTab, label: t.admin_nav_chatlogs, icon: MessageSquare },
    { id: 'rag_playground' as AdminTab, label: isVi ? 'Thử nghiệm RAG' : 'RAG Playground', icon: Terminal },
    { id: 'settings' as AdminTab, label: t.admin_nav_settings, icon: SettingsIcon },
    { id: 'logins' as AdminTab, label: t.admin_nav_logins, icon: LogIn },
    { id: 'reports' as AdminTab, label: t.admin_nav_reports, icon: BarChart3 },
    { id: 'knowledge' as AdminTab, label: t.admin_nav_knowledge, icon: BookOpen },
    { id: 'feedback' as AdminTab, label: t.admin_nav_feedback, icon: ThumbsDown },
    { id: 'support' as AdminTab, label: isVi ? 'Hỗ trợ trực tuyến' : 'Live Support', icon: MessageCircle },
  ];


  return (
    <div className="flex-1 flex h-full bg-[#f4f1ea] overflow-hidden relative">
      {/* Collapsible Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isAdminSidebarOpen ? 280 : 72 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bg-[#171717] border-r border-white/10 flex flex-col h-full shrink-0 relative overflow-hidden z-25 text-amber-100"
      >
        <div className={`flex-1 flex flex-col min-h-0 ${isAdminSidebarOpen ? 'p-6' : 'p-3'} overflow-y-auto chatgpt-scrollbar`}>
          {/* Logo & Toggle Header */}
          <div className={`flex items-center ${isAdminSidebarOpen ? 'justify-between' : 'justify-center'} mb-8 shrink-0`}>
            {isAdminSidebarOpen && (
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-[#7f1d1d] to-[#b45309] rounded-xl flex items-center justify-center text-amber-100 shadow-lg border border-amber-500/30 overflow-hidden shrink-0">
                  {(siteConfig?.logo_url || data.logo_url) ? (
                    <SecureImage
                      src={siteConfig?.logo_url || (data.logo_url.startsWith('/') ? `${API_ROOT}${data.logo_url}` : data.logo_url)}
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-serif italic font-black">
                      {siteConfig?.site_title ? siteConfig.site_title.charAt(0) : (data.site_title ? data.site_title.charAt(0) : '史')}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-lg font-black text-white tracking-tighter uppercase leading-none italic font-serif">
                    {siteConfig?.site_title || data.site_title || 'Sử Việt'} Admin
                  </h1>
                  <p className="text-[8px] text-amber-500/60 font-bold uppercase tracking-[0.3em] mt-0.5">{t.admin_sidebar_motto}</p>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                const next = !isAdminSidebarOpen;
                setIsAdminSidebarOpen(next);
                localStorage.setItem('isAdminSidebarOpen', String(next));
              }}
              className={`p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-lg transition-all ${!isAdminSidebarOpen ? 'mt-2' : ''}`}
              title={isAdminSidebarOpen ? t.admin_sidebar_collapse : t.admin_sidebar_expand}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isAdminSidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 shrink-0">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full group relative flex items-center ${isAdminSidebarOpen ? 'gap-3 px-4 py-3' : 'justify-center p-3'} rounded-2xl transition-all ${isActive
                      ? 'bg-gradient-to-r from-amber-600 to-red-800 text-amber-100 font-bold shadow-md'
                      : 'text-stone-450 hover:bg-white/5 hover:text-white'
                    }`}
                  title={!isAdminSidebarOpen ? item.label : undefined}
                >
                  <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-amber-100' : 'text-stone-500 group-hover:text-stone-300'}`} />
                  {isAdminSidebarOpen && <span className="text-[11px] uppercase font-sans font-semibold tracking-wider">{item.label}</span>}

                  {isAdminSidebarOpen && isActive && (
                    <motion.div
                      layoutId="adminDesktopActive"
                      className="absolute left-0 w-1 h-6 bg-amber-400 rounded-r-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Back and Logout Actions in Sidebar */}
        <div className={`mt-auto ${isAdminSidebarOpen ? 'p-4' : 'p-2'} border-t border-white/5 space-y-2`}>
          {onViewChange && (
            <button
              onClick={() => onViewChange('chat')}
              className={`w-full flex items-center ${isAdminSidebarOpen ? 'gap-2 px-4 py-2.5 text-[11px] font-sans font-semibold uppercase tracking-wider' : 'justify-center p-2'} text-amber-200 hover:bg-white/5 rounded-xl transition-all`}
              title={t.admin_back_to_chat}
            >
              <ArrowLeft size={16} />
              {isAdminSidebarOpen && <span>{t.admin_back_to_chat}</span>}
            </button>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              className={`w-full flex items-center ${isAdminSidebarOpen ? 'gap-2 px-4 py-2.5 text-[11px] font-sans font-semibold uppercase tracking-wider' : 'justify-center p-2'} text-red-400 hover:bg-red-400/10 rounded-xl transition-all`}
              title={t.admin_logout}
            >
              <LogOut size={16} />
              {isAdminSidebarOpen && <span>{t.admin_logout}</span>}
            </button>
          )}
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="plaque-header px-6 md:px-8 py-5 shrink-0 z-10 flex items-center justify-between border-b border-[#b45309]/20 bg-gradient-to-r from-[#451a03] to-[#2c1609]">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl md:text-2xl font-calligraphy font-bold text-amber-100 leading-normal">
                {t.admin_header_title}
              </h2>
              <p className="text-[9px] text-amber-500/80 font-sans font-black uppercase tracking-[0.25em] mt-1">
                {navItems.find(i => i.id === activeTab)?.label || 'Quản trị'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 text-xs">
            {onViewChange && (
              <button
                onClick={() => onViewChange('chat')}
                className="md:hidden p-2 text-amber-200 hover:bg-white/10 rounded-lg transition-all"
                title={t.admin_back_to_chat}
              >
                <ArrowLeft size={18} />
              </button>
            )}
            {onLogout && (
              <button
                onClick={onLogout}
                className="md:hidden p-2 text-red-400 hover:bg-red-450/10 rounded-lg transition-all"
                title={t.admin_logout}
              >
                <LogOut size={18} />
              </button>
            )}
            <span className="text-amber-200/50 hidden md:inline">{t.admin_session_label}</span>
            <span className="font-mono text-[#b45309] px-2.5 py-1 bg-amber-950/40 border border-amber-900/30 rounded-lg">
              {t.admin_role_label.replace('{name}', user?.username || 'Admin')}
            </span>
          </div>
        </header>

        {/* Content Pane */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {activeTab === 'dashboard' && (
            <DashboardTab
              users={data.users}
              payments={data.payments}
              chatlogs={data.chatlogs}
              logins={data.logins}
              negativeFeedback={data.negativeFeedback}
              onTabChange={setActiveTab}
              llmName={data.llm_name}
              onViewChange={onViewChange}
              onLogout={onLogout}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              data={data}
              onSave={handleSaveSettings}
              onSync={handleSyncFromFile}
              onChange={handleSettingChange}
              onUploadLogo={async (file) => {
                try {
                  const loadingToast = toast.loading(t.admin_upload_logo_loading);
                  const res = await api.adminUploadLogo(file);
                  toast.dismiss(loadingToast);
                  toast.success(t.admin_upload_logo_success);
                  setData((prev: any) => ({ ...prev, logo_url: res.logo_url }));
                } catch (err: any) {
                  toast.error(err.message);
                }
              }}
              onUploadFavicon={async (file) => {
                try {
                  const loadingToast = toast.loading(t.admin_upload_favicon_loading);
                  const res = await api.adminUploadLogo(file);
                  toast.dismiss(loadingToast);
                  toast.success(t.admin_upload_favicon_success);
                  setData((prev: any) => ({ ...prev, favicon_url: res.logo_url }));
                } catch (err: any) {
                  toast.error(err.message);
                }
              }}
              onUploadBackground={async (file: File) => {
                try {
                  const res = await api.adminUploadLogo(file);
                  setData((prev: any) => ({
                    ...prev,
                    landing_bg: res.logo_url
                  }));
                  toast.success(t.admin_upload_bg_landing_success);
                } catch (err: any) {
                  toast.error(err.message);
                }
              }}
              onUploadChatBackground={async (file: File) => {
                try {
                  const res = await api.adminUploadLogo(file);
                  setData((prev: any) => ({
                    ...prev,
                    chat_bg: res.logo_url
                  }));
                  toast.success(t.admin_upload_bg_chat_success);
                } catch (err: any) {
                  toast.error(err.message);
                }
              }}
            />
          )}

          {activeTab === 'users' && (
            <UsersTab
              users={data.users}
              isLoading={isLoading}
              onViewDetail={handleViewUserDetail}
              onUpdateBalance={handleUpdateBalance}
              onToggleAdmin={handleToggleAdmin}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === 'packages' && (
            <PackagesTab
              packages={data.packages}
              onCreatePackage={handleCreatePackage}
              onUpdatePackage={handleUpdatePackage}
              onDeletePackage={handleDeletePackage}
            />
          )}

          {activeTab === 'history' && (
            <HistoryTab history={data.history} />
          )}

          {activeTab === 'payments' && (
            <PaymentsTab
              payments={data.payments}
              paymentFilter={paymentFilter}
              setPaymentFilter={setPaymentFilter}
            />
          )}

          {activeTab === 'chatlogs' && (
            <ChatLogsTab
              chatlogs={data.chatlogs}
              onSelectChat={setSelectedChat}
            />
          )}

          {activeTab === 'logins' && (
            <LoginsTab logins={data.logins} />
          )}

          {activeTab === 'reports' && (
            <ReportsTab reports={data.reports} onRefresh={fetchData} />
          )}
          {activeTab === 'knowledge' && (
            <KnowledgeTab />
          )}
          {activeTab === 'feedback' && (
            <FeedbackTab />
          )}
          {activeTab === 'support' && (
            <SupportTab siteConfig={siteConfig} />
          )}
          {activeTab === 'rag_playground' && (
            <RagPlaygroundTab 
              initialQuestion={preseedPlaygroundQuestion} 
              onQuestionConsumed={() => setPreseedPlaygroundQuestion('')} 
            />
          )}
        </div>
      </div>


      {/* Modals */}
      {selectedChat && (
        <ChatLogDetailModal
          chat={selectedChat}
          onClose={() => setSelectedChat(null)}
          onOpenTestPage={(question) => {
            setSelectedChat(null);
            setPreseedPlaygroundQuestion(question);
            setActiveTab('rag_playground');
          }}
        />
      )}

      {selectedUserDetail && (
        <UserDetailModal
          userDetail={selectedUserDetail}
          onClose={() => setSelectedUserDetail(null)}
          onEditUser={handleEditUser}
          onViewChatDetail={setSelectedChat}
        />
      )}
    </div>
  );
};

export default AdminView;
