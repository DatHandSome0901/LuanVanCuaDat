import React, { useState, useEffect } from 'react';
import { api, API_ROOT } from '../api';
import toast from 'react-hot-toast';
import { confirmDestructive, promptInput, confirmAction, promptTokenAdjustment } from '../utils/swal';

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

// type AdminTab = 'users' | 'packages' | 'history' | 'payments' | 'chatlogs' | 'settings' | 'logins' | 'reports';
type AdminTab = 'users' | 'packages' | 'history' | 'payments' | 'chatlogs' | 'settings' | 'logins' | 'reports' | 'knowledge';

const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>(
    (localStorage.getItem('adminActiveTab') as AdminTab) || 'users'
  );
  const [paymentFilter, setPaymentFilter] = useState<'completed' | 'pending' | 'failed'>('completed');
  const [data, setData] = useState<any>({ 
    users: [], packages: [], history: [], payments: [], chatlogs: [], 
    rate: 1.0, logins: [], reports: [],
    site_title: '', seo_description: '', seo_keywords: '', seo_author: '', favicon_url: '',landing_bg: '',
    no_answer_fallback: '', llm_name: 'openai'
  } as any);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState<any | null>(null);

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
    const title = field === 'full_name' ? 'Sửa Họ tên' : 'Đổi Mật khẩu';
    const label = field === 'full_name' ? 'Nhập họ tên mới:' : 'Nhập mật khẩu mới (tối thiểu 6 ký tự):';
    
    const newVal = await promptInput(title, label, currentVal || '');
    if (newVal) {
        try {
            await api.adminUpdateUser(userId, { [field]: newVal });
            toast.success('Cập nhật người dùng thành công.');
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
      if (activeTab === 'users') {
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
          seo_description: res.seo_description,
          seo_keywords: res.seo_keywords,
          seo_author: res.seo_author,
          favicon_url: res.favicon_url,
          no_answer_fallback: res.no_answer_fallback,
          llm_name: res.llm_name
        }));
      } else if (activeTab === 'logins') {
        const res = await api.adminGetActiveUsers();
        setData((prev: any) => ({ ...prev, logins: res?.logins || [] }));
      } else if (activeTab === 'reports') {
        const res = await api.adminGetPaymentReports();
        setData((prev: any) => ({ ...prev, reports: res?.reports || [] }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBalance = async (userId: number, currentBalance: number) => {
    const user = data.users.find((u: any) => u.id === userId);
    const adjustment = await promptTokenAdjustment('Điều chỉnh số dư', user?.username || 'N/A');
    
    if (adjustment) {
      try {
        await api.adminUpdateUserBalance(userId, adjustment);
        toast.success('Đã điều chỉnh số dư thành công.');
        fetchData();
      } catch (err: any) {
        toast.error(err.message);
      }
    }
  };

  const handleDeleteUser = async (userId: number) => {
    // Basic frontend check, backend also enforces this
    const user = data.users.find((u: any) => u.id === userId);
    if (user?.is_admin) {
        toast.error('Không thể xóa tài khoản Admin.');
        return;
    }

    const confirmed = await confirmDestructive('Xóa người dùng', 'Bạn có chắc muốn xóa người dùng này khỏi hệ thống?');
    if (confirmed) {
      try {
        await api.adminDeleteUser(userId);
        toast.success('Đã xóa người dùng khỏi hệ thống.');
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
                toast.error('Bạn không thể tự hạ cấp quyền Admin của chính mình.');
                return;
            }
        }
    } catch (e) {
        console.error("Error checking current user", e);
    }

    const action = currentStatus ? 'hạ cấp' : 'thăng cấp';
    const confirmed = await confirmAction(
        `${currentStatus ? 'Hạ cấp' : 'Thăng cấp'} Admin`, 
        `Bạn có chắc muốn ${action} người dùng này?`
    );
    
    if (confirmed) {
        try {
            await api.adminUpdateUser(userId, { is_admin: currentStatus ? 0 : 1 });
            toast.success(`Đã ${action} thành công.`);
            fetchData();
        } catch (err: any) {
            toast.error(err.message);
        }
    }
  };

  const handleCreatePackage = async () => {
    const name = await promptInput('Tạo gói nạp', 'Tên gói:');
    if (!name) return;
    const tokens = await promptInput('Tạo gói nạp', 'Số lượng tokens:');
    if (!tokens) return;
    const amount = await promptInput('Tạo gói nạp', 'Số tiền (VNĐ):');
    
    if (name && tokens && amount) {
      try {
        await api.adminCreatePackage({ name, tokens: parseInt(tokens), amount_vnd: parseInt(amount) });
        toast.success('Gói nạp mới đã được tạo.');
        fetchData();
      } catch (err: any) {
        toast.error(err.message);
      }
    }
  };

  const handleDeletePackage = async (id: number) => {
    const confirmed = await confirmDestructive('Xóa gói nạp', 'Bạn có chắc muốn xóa gói nạp này?');
    if (confirmed) {
      try {
        await api.adminDeletePackage(id);
        toast.success('Đã xóa gói nạp.');
        fetchData();
      } catch (err: any) {
        toast.error(err.message);
      }
    }
  };

  const handleUpdatePackage = async (pkg: any) => {
    const name = await promptInput('Sửa gói nạp', 'Tên gói:', pkg.name);
    if (!name) return;
    const tokens = await promptInput('Sửa gói nạp', 'Số lượng tokens:', pkg.tokens.toString());
    if (!tokens) return;
    const amount = await promptInput('Sửa gói nạp', 'Số tiền (VNĐ):', pkg.amount_vnd.toString());
    
    if (name && tokens && amount) {
      try {
        await api.adminUpdatePackage(pkg.id, { 
          name, 
          tokens: parseInt(tokens), 
          amount_vnd: parseInt(amount) 
        });
        toast.success('Gói nạp đã được cập nhật.');
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
        favicon_url: data.favicon_url,
        site_title: data.site_title,
        seo_description: data.seo_description,
        seo_keywords: data.seo_keywords,
        seo_author: data.seo_author,
        no_answer_fallback: data.no_answer_fallback,
        llm_name: data.llm_name
    };

    try {
        await api.adminUpdateSettings(settings);
        toast.success('Cấu hình hệ thống đã được cập nhật thành công.');
        fetchData();
    } catch (err: any) {
        toast.error(err.message);
    }
  };

  const handleSyncFromFile = async () => {
    try {
        const loadingToast = toast.loading('Đang lấy dữ liệu từ file HTML...');
        const res = await api.adminSyncFromHtml();
        setData((prev: any) => ({ ...prev, ...res }));
        toast.dismiss(loadingToast);
        toast.success('Đã tải SEO từ file HTML vào giao diện.');
    } catch (err: any) {
        toast.error(err.message);
    }
  };

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-100 overflow-hidden relative">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-4 md:px-8 py-4 shrink-0 shadow-sm z-10">
        {/* <h2 className="text-2xl font-serif font-bold text-red-950 uppercase tracking-tight">HỆ THỐNG QUẢN TRỊ SỬ VIỆT</h2> */}
        <h2
        className="text-2xl font-bold text-red-950"
        style={{ fontFamily: 'Inter, Roboto, sans-serif', letterSpacing: 'normal' }}
      >
        HỆ THỐNG QUẢN TRỊ SỬ VIỆT
      </h2>
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {(['users', 'packages', 'history', 'payments', 'chatlogs', 'settings', 'logins', 'reports', 'knowledge'] as AdminTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-red-800 text-white shadow-lg shadow-red-200' : 'bg-stone-50 text-stone-400 hover:bg-stone-200 hover:text-stone-600'
              }`}
            >
              {tab === 'users' && 'Người Dùng'}
              {tab === 'packages' && 'Gói Nạp'}
              {tab === 'history' && 'Lịch Sử Tiền'}
              {tab === 'payments' && 'Hóa Đơn'}
              {tab === 'chatlogs' && 'Nhật Ký Chat'}
              {tab === 'settings' && 'Cấu Hình Hệ Thống'}
              {tab === 'logins' && 'Đăng Nhập'}
              {tab === 'reports' && 'Báo Cáo TT'}
              {tab === 'knowledge' && 'Tri Thức AI'}
            </button>
          ))}
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        {activeTab === 'settings' && (
          <SettingsTab 
            data={data}
            onSave={handleSaveSettings}
            onSync={handleSyncFromFile}
            onChange={handleSettingChange}
            onUploadLogo={async (file) => {
                try {
                    const loadingToast = toast.loading('Đang tải lên logo...');
                    const res = await api.adminUploadLogo(file);
                    // 🔥 THÊM DÒNG NÀY (QUAN TRỌNG NHẤT)
                    // await api.adminUpdateSettings({
                    //   logo_url: res.logo_url
                    // });

                    toast.dismiss(loadingToast);
                    toast.success('Đã tải hình ảnh lên thành công.');
                    setData((prev: any) => ({ ...prev, logo_url: res.logo_url }));
                } catch (err: any) {
                    toast.error(err.message);
                }
            }}
            onUploadFavicon={async (file) => {
                try {
                    const loadingToast = toast.loading('Đang tải lên favicon...');
                    const res = await api.adminUploadLogo(file);
                  //   await api.adminUpdateSettings({
                  //   favicon_url: res.logo_url
                  // });
                    toast.dismiss(loadingToast);
                    toast.success('Đã tải favicon lên thành công.');
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
                  //  await api.adminUpdateSettings({
                  //   landing_bg: res.logo_url // 🔥 FIX Ở ĐÂY
                  // });

                  toast.success("Upload background thành công");
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
          <ReportsTab reports={data.reports} />
        )}
        {activeTab === 'knowledge' && (
          <KnowledgeTab  />
)}
      </div>

      {/* Modals */}
      {selectedChat && (
        <ChatLogDetailModal 
          chat={selectedChat}
          onClose={() => setSelectedChat(null)}
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
