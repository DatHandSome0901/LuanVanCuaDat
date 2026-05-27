import React, { useState, useEffect } from 'react';
import { User, View } from '../types';
import { api } from '../api';
import toast from 'react-hot-toast';
import { promptInput } from '../utils/swal';

import ProfileInfoCard from './profile/ProfileInfoCard';
import ProfileHistoryTable from './profile/ProfileHistoryTable';
import TransactionDetailModal from './profile/TransactionDetailModal';

interface ProfileViewProps {
  user: User;
  onUpdateUser?: (user: User) => void;
  onLogout?: () => void;
  isSidebarOpen?: boolean;
  onViewChange?: (view: View) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateUser, onLogout, isSidebarOpen, onViewChange }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  // Detection
  const isNative = (window as any).Capacitor?.isNativePlatform?.() || false;

  const fetchHistory = async () => {
    try {
      const data = await api.getTokenHistory();
      setHistory(data.history);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleUpdateFullName = async () => {
    const newName = await promptInput('Cập nhật Họ tên', 'Nhập họ tên mới của bạn:', user.full_name || '');
    if (newName) {
      try {
        await api.userProfileUpdate({ full_name: newName });
        toast.success('Hồ sơ đã được cập nhật.');
        if (onUpdateUser) {
           const updatedUser = { ...user, full_name: newName };
           onUpdateUser(updatedUser);
        }
      } catch (err: any) {
        toast.error(err.message);
      }
    }
  };

  const handleChangePassword = async () => {
    const currentPassword = await promptInput('Đổi Mật Khẩu', 'Nhập mật khẩu hiện tại (bỏ trống nếu dùng Google):', '', 'password');
    const newPassword = await promptInput('Đổi Mật Khẩu', 'Nhập mật khẩu mới (tối thiểu 6 ký tự):', '', 'password');
    
    if (newPassword) {
      try {
        await api.userProfileUpdate({ current_password: currentPassword, new_password: newPassword });
        toast.success('Mật khẩu đã được thay đổi thành công.');
      } catch (err: any) {
        toast.error(err.message);
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[100%] mx-auto w-full overflow-y-auto pb-24 md:pb-8">
      <header className="mb-8 flex items-center gap-4 border-b border-stone-100 pb-6">
        <div className="w-12 h-12 bg-red-800 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-900/20 shrink-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight uppercase leading-none">Hồ Sơ Cá Nhân</h2>
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.2em] mt-1">Thông tin tài khoản • v1.0</p>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <div className="md:col-span-1 space-y-6">
          <ProfileInfoCard 
            user={user} 
            onUpdateFullName={handleUpdateFullName}
            onChangePassword={handleChangePassword}
          />

          {/* UTILITIES (Admin Only) */}
          {!!user.is_admin && (
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 p-5 space-y-3">
              <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest block">Tính năng & Tiện ích</h4>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => onViewChange?.('admin')}
                  className="flex flex-col items-center justify-center p-3 bg-red-50 hover:bg-red-100/50 border border-red-200/20 rounded-xl text-red-900 transition-all active:scale-95 text-center"
                >
                  <span className="text-xl mb-1">⚙️</span>
                  <span className="text-[11px] font-bold">Quản trị</span>
                </button>
              </div>
            </div>
          )}

          {/* APP DISMISS BUTTON (Mobile Only) */}
          {isNative && onLogout && (
            <div className="pt-4 border-t border-stone-100">
               <button 
                 onClick={onLogout}
                 className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-black uppercase text-xs tracking-widest shadow-sm active:scale-95 transition-all"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                 </svg>
                 Đăng xuất khỏi App
               </button>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <ProfileHistoryTable 
            history={history}
            isLoading={isLoading}
            onViewTx={setSelectedTx}
          />
        </div>
      </div>

      {selectedTx && (
        <TransactionDetailModal 
          tx={selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      )}
    </div>
  );
};

export default ProfileView;
