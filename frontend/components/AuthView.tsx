import React, { useState } from 'react';
import { api } from '../api';
import { User } from '../types';
import { Capacitor } from '@capacitor/core';
import { useLanguage } from '../contexts/LanguageContext';
import { BookOpen } from 'lucide-react';

interface AuthViewProps {
  onSuccess: (user: User, token: string) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const { language, t } = useLanguage();
  const isVi = language === 'vi';
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
      setError(err.message || t.auth_err_fail);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const url = await api.getGoogleLoginUrl();
      if (Capacitor.isNativePlatform()) {
        const { Browser } = await import('@capacitor/browser');
        await Browser.open({ url });
      } else {
        window.location.href = url;
      }
    } catch (err) {
      setError(t.auth_err_google);
    }
  };

  return (
    <div className="w-full max-w-md paper-texture p-8 md:p-10 rounded-3xl border-double border-4 border-amber-600/40 shadow-2xl relative overflow-hidden bg-[#fdfbf7]">
      {/* Decorative corner borders */}
      <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-amber-600/40 rounded-tl-sm pointer-events-none" />
      <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-amber-600/40 rounded-tr-sm pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-amber-600/40 rounded-bl-sm pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-amber-600/40 rounded-br-sm pointer-events-none" />

      {/* Emblem: Book Open with concentric circles mimicking Đông Sơn drum */}
      <div className="flex justify-center mb-6">
        <div className="w-14 h-14 bg-amber-50/70 border-2 border-amber-600/40 rounded-full flex items-center justify-center shadow-md text-amber-800 relative select-none">
          <BookOpen className="w-6 h-6 text-[#7f1d1d]" />
          {/* Concentric rings */}
          <div className="absolute inset-1 border border-dashed border-amber-600/20 rounded-full pointer-events-none" />
          <div className="absolute inset-2 border border-amber-600/10 rounded-full pointer-events-none" />
        </div>
      </div>

      <div className="text-center mb-6 relative">
        <h2 className="text-2xl font-historical font-black text-[#7f1d1d] tracking-wide mb-1.5 uppercase">
          {isLogin 
            ? (isVi ? 'Hiền Tài Đăng Nhập' : 'Scholar Sign In') 
            : (isVi ? 'Khai Tông Lập Quốc' : 'Register Scholar')}
        </h2>
        <p className="text-stone-500 italic text-xs font-serif leading-relaxed px-4">
          {isLogin ? t.auth_login_subtitle : t.auth_register_subtitle}
        </p>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-600/30 to-transparent mx-auto mt-4" />
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200/40 text-red-750 text-xs font-semibold rounded-xl font-sans shadow-inner">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 px-1">{t.auth_email_label}</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#faf6eb] border border-amber-800/20 rounded-xl px-4 py-3 focus:bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-sans text-xs font-semibold text-stone-850 shadow-sm placeholder-stone-400/80"
              placeholder="nnguoisu@example.com"
            />
          </div>
        )}
        <div>
          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 px-1">{t.auth_username_label}</label>
          <input
            type="text"
            required
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full bg-[#faf6eb] border border-amber-800/20 rounded-xl px-4 py-3 focus:bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-sans text-xs font-semibold text-stone-850 shadow-sm placeholder-stone-400/80"
            placeholder={isVi ? 'Tên đăng nhập' : 'Username'}
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5 px-1">{t.auth_password_label}</label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full bg-[#faf6eb] border border-amber-800/20 rounded-xl px-4 py-3 focus:bg-white focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-sans text-xs font-semibold text-stone-855 shadow-sm placeholder-stone-400/80"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-gradient-to-r from-[#7f1d1d] to-[#451a03] hover:from-[#b45309] hover:to-[#7f1d1d] text-amber-100 font-historical font-black text-xs uppercase tracking-widest border border-amber-500/40 shadow-md rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-amber-100 border-t-transparent rounded-full animate-spin" />
              <span>{t.auth_btn_processing}</span>
            </>
          ) : (
            <span>{isLogin ? t.auth_btn_login : t.auth_btn_register}</span>
          )}
        </button>
      </form>

      <div className="my-6 flex items-center gap-4 text-stone-300">
        <div className="h-px bg-stone-200 flex-1"></div>
        <span className="text-[10px] uppercase tracking-widest font-black text-stone-400">{t.auth_or}</span>
        <div className="h-px bg-stone-200 flex-1"></div>
      </div>

      <button
        onClick={handleGoogleLogin}
        className="w-full bg-[#fdfbf7] hover:bg-stone-50 border border-amber-700/25 text-stone-750 font-sans font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path fill="#EA4335" d="M12 11.01V13h6.32a5.42 5.42 0 0 1-2.32 3.53l3.65 2.82A11.96 11.96 0 0 0 24 12c0-.68-.07-1.36-.2-2.01H12z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.97-2.91L16.32 18.27A7.14 7.14 0 0 1 12 19.5c-3.13 0-5.83-2.12-6.78-4.97L1.44 17.5A11.94 11.94 0 0 0 12 24z" />
          <path fill="#4285F4" d="M5.22 14.53A7.14 7.14 0 0 1 4.5 12c0-.88.16-1.72.44-2.5l-3.71-2.88A11.93 11.93 0 0 0 0 12c0 2.45.74 4.73 2.01 6.63l3.21-2.1z" />
          <path fill="#FBBC05" d="M12 4.5c1.76 0 3.34.6 4.58 1.78l3.43-3.43A11.95 11.95 0 0 0 12 0 11.94 11.94 0 0 0 1.44 6.62l3.78 2.91c.95-2.85 3.65-4.97 6.78-4.97z" />
        </svg>
        <span>{isVi ? 'Tiếp tục với Google' : 'Continue with Google'}</span>
      </button>

      <p className="mt-6 text-center text-xs font-sans text-stone-500">
        {isLogin ? t.auth_no_account : t.auth_has_account}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="ml-1.5 text-[#7f1d1d] hover:text-[#5c1212] font-bold hover:underline tracking-wide transition-colors"
        >
          {isLogin ? t.auth_register_now : t.auth_login_now}
        </button>
      </p>
    </div>
  );
};

export default AuthView;
