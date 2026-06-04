import React from 'react';
import AuthView from './AuthView';
import { User } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: User, token: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  return (
    <>
      {/* Backdrop - separate layer under the scrollable content */}
      <div
        className="fixed inset-0 z-[60] bg-stone-950/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Scrollable container above the backdrop - click here closes the modal */}
      <div 
        className="fixed inset-0 z-[61] overflow-y-auto pt-6 pb-16 px-4 flex justify-center items-start cursor-pointer"
        onClick={onClose}
      >
        <div 
          className="relative w-full max-w-md cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          <AuthView onSuccess={onSuccess} />
        </div>
      </div>
    </>
  );
};

export default AuthModal;
