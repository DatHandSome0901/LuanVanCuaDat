
import React from 'react';
import AuthView from './AuthView';
import { User } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: User, token: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md animate-in zoom-in fade-in duration-300">
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 text-white flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-xs uppercase tracking-widest font-bold">Đóng</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <AuthView onSuccess={onSuccess} />
      </div>
    </div>
  );
};

export default AuthModal;
