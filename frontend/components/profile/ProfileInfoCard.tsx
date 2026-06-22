import React, { useState, useRef } from 'react';
import { User } from '../../types';
import { API_ROOT, api } from '../../api';
import { useLanguage } from '../../contexts/LanguageContext';
import toast from 'react-hot-toast';
import { confirmAction } from '../../utils/swal';

interface ProfileInfoCardProps {
  user: User;
  onUpdateUser?: (user: User) => void;
  onChangePassword: () => void;
  onRequestReport?: () => void;
}

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({
  user,
  onUpdateUser,
  onChangePassword,
  onRequestReport,
}) => {
  const { t, language, setLanguage } = useLanguage();
  const [imgError, setImgError] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user.full_name || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarSrc = avatarPreview
    || (user.picture_url && !imgError
      ? (user.picture_url.startsWith('/') ? `${API_ROOT}${user.picture_url}` : user.picture_url)
      : null);

  // ── Avatar upload ──────────────────────────────────────────────
  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show instant preview
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    setIsUploadingAvatar(true);
    try {
      const { picture_url } = await api.uploadAvatar(file);
      if (onUpdateUser) onUpdateUser({ ...user, picture_url });
      toast.success('Đã cập nhật ảnh đại diện!');
    } catch (err: any) {
      toast.error(err.message || 'Tải ảnh thất bại');
      setAvatarPreview(null); // Revert preview on error
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Full name save ─────────────────────────────────────────────
  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === (user.full_name || '')) {
      setIsEditingName(false);
      return;
    }
    setIsSavingName(true);
    try {
      await api.userProfileUpdate({ full_name: trimmed });
      if (onUpdateUser) onUpdateUser({ ...user, full_name: trimmed });
      toast.success('Đã cập nhật họ tên!');
      setIsEditingName(false);
    } catch (err: any) {
      toast.error(err.message || 'Cập nhật thất bại');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleDeleteAccount = async () => {
    const isVi = language === 'vi';
    const title = isVi ? 'Xác nhận xóa tài khoản?' : 'Confirm account deletion?';
    const text = isVi 
      ? 'Toàn bộ dữ liệu tài khoản, lịch sử chat và số dư token của bạn sẽ bị xóa vĩnh viễn và không thể khôi phục!'
      : 'All your account data, chat history, and token balances will be permanently deleted and cannot be recovered!';
    
    const confirmed = await confirmAction(title, text);
    if (!confirmed) return;
    
    try {
      const res = await api.deleteAccount();
      toast.success(res.message || (isVi ? 'Đã xóa tài khoản thành công!' : 'Account deleted successfully!'));
      
      localStorage.removeItem('access_token');
      localStorage.removeItem('conversation_id');
      
      window.location.href = '/';
    } catch (err: any) {
      toast.error(err.message || (isVi ? 'Xóa tài khoản thất bại' : 'Failed to delete account'));
    }
  };

  return (
    <div className="paper-texture scroll-border border-double border-4 border-amber-600/30 rounded-2xl shadow-md p-6 transition-all hover:border-amber-600/50">

      {/* ── Avatar ── */}
      <div className="text-center mb-6">
        <div className="relative inline-block group">
          {/* Avatar image or fallback */}
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={user.username}
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
              referrerPolicy="no-referrer"
              onError={() => { setImgError(true); setAvatarPreview(null); }}
            />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-amber-100 rounded-full flex items-center justify-center text-red-900 text-4xl font-serif mx-auto border-4 border-white shadow-lg">
              {(user?.username || 'U').charAt(0).toUpperCase()}
            </div>
          )}

          {/* Upload overlay */}
          <button
            onClick={handleAvatarClick}
            disabled={isUploadingAvatar}
            className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
          >
            {isUploadingAvatar ? (
              <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-[10px] font-bold mt-1">Đổi ảnh</span>
              </>
            )}
          </button>

          {/* Admin badge */}
          {!!user.is_admin && (
            <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md border-2 border-white">
              ADMIN
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Name row */}
        <div className="mt-4">
          {isEditingName ? (
            <div className="flex items-center gap-2 justify-center">
              <input
                autoFocus
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setIsEditingName(false); }}
                className="text-lg font-bold text-center border-b-2 border-red-800 bg-transparent outline-none w-40"
                placeholder="Họ tên của bạn"
              />
              <button
                onClick={handleSaveName}
                disabled={isSavingName}
                className="text-white bg-red-800 px-2 py-0.5 rounded text-xs font-bold hover:bg-red-900 disabled:opacity-50"
              >
                {isSavingName ? '...' : 'Lưu'}
              </button>
              <button
                onClick={() => { setIsEditingName(false); setNameInput(user.full_name || ''); }}
                className="text-stone-400 text-xs hover:text-stone-600 px-1"
              >
                Hủy
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 mt-1">
              <h3 className="text-xl font-bold">{user.full_name || user.username}</h3>
              <button
                onClick={() => { setIsEditingName(true); setNameInput(user.full_name || ''); }}
                className="text-stone-400 hover:text-red-800 transition-colors"
                title="Sửa họ tên"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          )}
          <p className="text-stone-400 text-sm italic mt-0.5">{user.email}</p>
        </div>
      </div>

      {/* ── Info fields ── */}
      <div className="space-y-4 pt-5 border-t border-stone-100">

        <InfoRow label={t.profile_joined_date}>
          {user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : 'Sơ khởi'}
        </InfoRow>

        <InfoRow label={t.profile_username}>
          {user.username}
        </InfoRow>

        <InfoRow label={t.profile_email}>
          {user.email || <span className="text-stone-300 italic text-xs">Chưa có email</span>}
        </InfoRow>

        <InfoRow label={t.profile_role}>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${user.is_admin ? 'bg-red-800 text-white' : 'bg-stone-100 text-stone-600'}`}>
            {user.is_admin ? t.profile_role_admin : t.profile_role_user}
          </span>
        </InfoRow>

        <InfoRow label={t.profile_acc_type} action={
          <button onClick={onChangePassword} className="text-[10px] font-bold text-stone-400 hover:text-red-800 transition-colors">
            {t.profile_change_pwd}
          </button>
        }>
          {user.picture_url?.includes('googleusercontent.com') ? t.profile_acc_google : t.profile_acc_system}
        </InfoRow>

        {/* Language switcher */}
        <InfoRow label="Ngôn ngữ / Language" action={
          <button
            onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
            className="text-[10px] font-bold text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors"
          >
            {language === 'vi' ? '🇬🇧 English' : '🇻🇳 Tiếng Việt'}
          </button>
        }>
          {language === 'vi' ? 'Tiếng Việt' : 'English'}
        </InfoRow>

        {/* Report */}
        {onRequestReport && (
          <InfoRow label="Hỗ trợ / Support" action={
            <button onClick={onRequestReport} className="text-[10px] font-bold text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors">
              ⚠️ {language === 'vi' ? 'Báo cáo' : 'Report'}
            </button>
          }>
            {language === 'vi' ? 'Góp ý hoặc báo cáo sự cố' : 'Feedback or report issues'}
          </InfoRow>
        )}

        {/* Delete Account */}
        <InfoRow label={language === 'vi' ? 'Quản lý tài khoản' : 'Account Management'} action={
          <button 
            onClick={handleDeleteAccount} 
            className="text-[10px] font-bold text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors uppercase tracking-wider animate-pulse"
          >
            ❌ {language === 'vi' ? 'Xóa tài khoản' : 'Delete Account'}
          </button>
        }>
          {language === 'vi' ? 'Xóa vĩnh viễn tài khoản & dữ liệu' : 'Permanently delete account & data'}
        </InfoRow>

        {/* Token balance */}
        <div className="pt-2">
          <label className="text-stone-400 text-[10px] block mb-1 uppercase tracking-widest font-black">{t.profile_tokens}</label>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-red-800">{(user.token_balance ?? 0).toFixed(2)}</span>
            <span className="text-stone-500 text-xs font-bold uppercase tracking-tighter">Tokens</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper sub-component for each row
const InfoRow: React.FC<{ label: string; children: React.ReactNode; action?: React.ReactNode }> = ({ label, children, action }) => (
  <div>
    <label className="text-stone-400 text-[10px] block mb-1 uppercase tracking-widest font-black">{label}</label>
    <div className="flex items-center justify-between gap-2">
      <p className="text-stone-600 text-sm font-medium flex-1">{children}</p>
      {action}
    </div>
  </div>
);

export default ProfileInfoCard;
