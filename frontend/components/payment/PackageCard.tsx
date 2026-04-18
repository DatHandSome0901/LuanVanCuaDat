import React from 'react';
import { PaymentPackage } from '../../types';

interface PackageCardProps {
  pkg: PaymentPackage;
  onSelect: (pkgId: number) => void;
  isProcessing: boolean;
}

const PackageCard: React.FC<PackageCardProps> = ({ pkg, onSelect, isProcessing }) => {
  return (
    <div 
      className="bg-white rounded-3xl border border-stone-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col"
    >
      <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
          <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
          </svg>
      </div>
      <h3 className="text-xl font-bold text-stone-800 mb-2">{pkg.name}</h3>
      <div className="flex items-baseline gap-1 mb-6">
          <span className="text-4xl font-bold text-amber-600">{pkg.tokens}</span>
          <span className="text-stone-400 text-sm font-medium uppercase tracking-widest">Tokens</span>
      </div>
      
      <div className="space-y-3 mb-8 text-sm text-stone-500">
          <p className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Không giới hạn thời gian
          </p>
          <p className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Tốc độ trả lời ưu tiên
          </p>
      </div>

      <button 
        onClick={() => onSelect(pkg.id)}
        disabled={isProcessing}
        className="mt-auto w-full py-3 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 transition-all flex flex-col items-center"
      >
        <span>{pkg.amount_vnd.toLocaleString('vi-VN')} VNĐ</span>
        <span className="text-[10px] opacity-70 font-normal uppercase tracking-tighter">Nạp ngay qua VietQR</span>
      </button>
    </div>
  );
};

export default PackageCard;
