import React from 'react';
import { User } from '../../types';

interface ProfileInfoCardProps {
  user: User;
  onUpdateFullName: () => void;
  onChangePassword: () => void;
}

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({ 
  user, 
  onUpdateFullName, 
  onChangePassword 
}) => {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
      <div className="text-center mb-6">
          <div className="relative inline-block">
            {user.picture_url && !imgError ? (
              <img 
                src={user.picture_url} 
                alt={user.username}
                className="w-20 h-20 rounded-full border-4 border-white shadow-sm object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-900 text-3xl font-serif mx-auto border-4 border-white shadow-sm">
                  {(user?.username || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            {user.is_admin && (
              <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md border-2 border-white">
                ADMIN
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mt-4">
              <h3 className="text-xl font-bold">{user.full_name || user.username}</h3>
              <button 
                onClick={onUpdateFullName} 
                className="text-[10px] font-bold text-red-800 hover:bg-red-50 px-2 py-1 rounded"
              >
                SỬA
              </button>
          </div>
          <p className="text-stone-400 text-sm italic">{user.email}</p>
      </div>
      
      <div className="space-y-4 pt-6 border-t border-stone-50">
          <div>
              <label className="text-stone-400 text-[10px] block mb-1 uppercase tracking-widest font-black">Ngày gia nhập</label>
              <p className="text-stone-600 text-sm font-medium">
                {user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : 'Sơ khởi'}
              </p>
          </div>

          <div>
              <label className="text-stone-400 text-[10px] block mb-1 uppercase tracking-widest font-black">Tên đăng nhập / Username</label>
              <p className="text-stone-600 text-sm font-medium">{user.username}</p>
          </div>

          <div>
              <label className="text-stone-400 text-[10px] block mb-1 uppercase tracking-widest font-black">Địa chỉ Email</label>
              <p className="text-stone-600 text-sm font-medium">{user.email}</p>
          </div>

          <div>
              <label className="text-stone-400 text-[10px] block mb-1 uppercase tracking-widest font-black">Quyền hạn hệ thống</label>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${user.is_admin ? 'bg-red-800 text-white' : 'bg-stone-100 text-stone-500'}`}>
                  {user.is_admin ? 'Quản trị viên (Admin)' : 'Người dùng (User)'}
                </span>
              </div>
          </div>

          <div>
              <label className="text-stone-400 text-[10px] block mb-1 uppercase tracking-widest font-black">Loại tài khoản</label>
              <div className="flex items-center justify-between">
                  <p className="text-stone-600 text-sm font-medium">
                    {user.picture_url?.includes('googleusercontent.com') ? 'Liên kết Google' : 'Tài khoản Hệ thống'}
                  </p>
                  <button 
                    onClick={onChangePassword} 
                    className="text-[10px] font-bold text-stone-400 hover:text-red-800 transition-colors"
                  >
                    ĐỔI MẬT KHẨU
                  </button>
              </div>
          </div>

          <div className="pt-2">
              <label className="text-stone-400 text-[10px] block mb-1 uppercase tracking-widest font-black">Tokens đang có</label>
              <div className="flex items-center gap-2">
                  <span className="text-3xl font-black text-red-800">{(user.token_balance ?? 0).toFixed(2)}</span>
                  <span className="text-stone-500 text-xs font-bold uppercase tracking-tighter">Tokens</span>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ProfileInfoCard;
