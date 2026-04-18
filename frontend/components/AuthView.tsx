
import React, { useState } from 'react';
import { api } from '../api';
import { User } from '../types';
import { Capacitor } from '@capacitor/core';

interface AuthViewProps {
  onSuccess: (user: User, token: string) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '', email: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const data = new FormData();
    data.append('username', formData.username);
    data.append('password', formData.password);
    if (!isLogin) data.append('email', formData.email);

    try {
      if (isLogin) {
        const res = await api.login(data);
        onSuccess(res.user, res.access_token);
      } else {
        await api.register(data);
        const loginRes = await api.login(data);
        onSuccess(loginRes.user, loginRes.access_token);
      }
    } catch (err: any) {
      setError(err.message || 'Thao tác thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const url = await api.getGoogleLoginUrl();
      window.location.href = url;
    } catch (err) {
      setError('Không thể kết nối với Google');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-stone-200/50 border border-stone-100 p-8">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-red-950 mb-2">
                {isLogin ? 'Chào mừng bạn trở lại' : 'Khám phá Sử Việt'}
            </h2>
            <p className="text-stone-500 italic text-sm">
                {isLogin ? 'Hãy đăng nhập để tiếp tục hành trình tìm hiểu lịch sử.' : 'Tạo tài khoản để lưu lại những kiến thức quý báu.'}
            </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1 px-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500/10 focus:border-red-800 outline-none transition-all"
                placeholder="nnguoisu@example.com"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1 px-1">Tên đăng nhập</label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500/10 focus:border-red-800 outline-none transition-all"
              placeholder="Username"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-1 px-1">Mật khẩu</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500/10 focus:border-red-800 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-800/20 hover:bg-red-900 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isLoading ? 'Đang xử lý...' : isLogin ? 'Đăng Nhập' : 'Đăng Ký'}
          </button>
        </form>

        <div className="my-8 flex items-center gap-4 text-stone-300">
            <div className="h-px bg-stone-100 flex-1"></div>
            <span className="text-xs uppercase tracking-widest font-bold">Hoặc</span>
            <div className="h-px bg-stone-100 flex-1"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white border border-stone-200 text-stone-700 font-medium py-3 rounded-xl hover:bg-stone-50 transition-all flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 11.01V13h6.32a5.42 5.42 0 0 1-2.32 3.53l3.65 2.82A11.96 11.96 0 0 0 24 12c0-.68-.07-1.36-.2-2.01H12z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.97-2.91L16.32 18.27A7.14 7.14 0 0 1 12 19.5c-3.13 0-5.83-2.12-6.78-4.97L1.44 17.5A11.94 11.94 0 0 0 12 24z"/>
            <path fill="#4285F4" d="M5.22 14.53A7.14 7.14 0 0 1 4.5 12c0-.88.16-1.72.44-2.5l-3.71-2.88A11.93 11.93 0 0 0 0 12c0 2.45.74 4.73 2.01 6.63l3.21-2.1z"/>
            <path fill="#FBBC05" d="M12 4.5c1.76 0 3.34.6 4.58 1.78l3.43-3.43A11.95 11.95 0 0 0 12 0 11.94 11.94 0 0 0 1.44 6.62l3.78 2.91c.95-2.85 3.65-4.97 6.78-4.97z"/>
          </svg>
          Tiếp tục với Google
        </button>

        <p className="mt-8 text-center text-sm text-stone-500">
          {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-1 text-red-800 font-bold hover:underline"
          >
            {isLogin ? 'Đăng ký ngay' : 'Đăng nhập ngay'}
          </button>
        </p>

        {/* WEB ONLY: DOWNLOAD APK */}
        {!Capacitor.isNativePlatform() && (
          <div className="mt-10 pt-8 border-t border-stone-100">
            <div className="text-center mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
               Trải nghiệm tốt hơn trên Android
            </div>
            <a 
              href="/app-release.apk" 
              download
              className="flex items-center justify-center gap-3 w-full py-4 bg-stone-900 text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-black transition-all active:scale-95"
            >
              <span className="text-xl">📲</span>
              <span>Tải xuống bản App (APK)</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthView;
