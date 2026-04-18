import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../api';
import toast from 'react-hot-toast';
import { promptInput } from '../utils/swal';

interface ProfileViewProps {
  user: User;
  onUpdateUser?: (user: User) => void;
}

import ProfileInfoCard from './profile/ProfileInfoCard';
import ProfileHistoryTable from './profile/ProfileHistoryTable';
import TransactionDetailModal from './profile/TransactionDetailModal';

interface ProfileViewProps {
  user: User;
  onUpdateUser?: (user: User) => void;
  onLogout?: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateUser, onLogout }) => {
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
      <h2 className="text-2xl md:text-3xl font-serif mb-6 md:mb-8 text-red-950 border-b pb-4">Hồ Sơ Cá Nhân</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <div className="md:col-span-1 space-y-6">
          <ProfileInfoCard 
            user={user} 
            onUpdateFullName={handleUpdateFullName}
            onChangePassword={handleChangePassword}
          />

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
