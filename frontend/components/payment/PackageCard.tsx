import React from 'react';
import { PaymentPackage } from '../../types';
import { motion } from 'framer-motion';

interface PackageCardProps {
  pkg: PaymentPackage;
  onSelect: (pkgId: number) => void;
  isProcessing: boolean;
  index: number;
}

const PackageCard: React.FC<PackageCardProps> = ({ pkg, onSelect, isProcessing, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ 
        y: -5,
        scale: 1.01,
        boxShadow: "0 20px 40px -12px rgba(127, 29, 29, 0.15)"
      }}
      className="paper-texture scroll-border p-6 rounded-2xl border-double border-4 border-amber-600/30 shadow-md transition-all flex flex-col group relative overflow-hidden min-h-[300px]"
    >
      {/* Popular Badge for middle package */}
      {pkg.tokens === 350 && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-[#7f1d1d] to-[#451a03] text-amber-100 text-[8px] font-historical font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-widest shadow-md z-10 border-l border-b border-amber-500/40">
          Phổ biến nhất
        </div>
      )}

      {/* Decree Mark Icon */}
      <div className="w-12 h-12 bg-amber-100/50 border border-amber-300 rounded-2xl flex items-center justify-center mb-6 shadow-inner font-historical font-black text-[#7f1d1d] text-lg shrink-0">
        敕
      </div>
      
      {/* Title */}
      <h3 className="text-lg font-sans font-black text-[#7f1d1d] mb-1.5 tracking-wide leading-tight">{pkg.name}</h3>
      
      {/* Tokens */}
      <div className="flex items-baseline gap-1 mb-5">
          <span className="text-4xl font-historical font-black text-amber-800">{pkg.tokens}</span>
          <span className="text-amber-900/60 text-xs font-sans uppercase tracking-widest font-normal">Tệ</span>
      </div>
      
      {/* Features list */}
      <div className="space-y-2 mb-8 text-xs text-stone-500 font-sans leading-relaxed italic">
          <p className="flex items-center gap-2 group-hover:text-stone-700 transition-colors">
              <svg className="w-3.5 h-3.5 text-green-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
              Không giới hạn thời hạn sử dụng
          </p>
          <p className="flex items-center gap-2 group-hover:text-stone-700 transition-colors">
              <svg className="w-3.5 h-3.5 text-green-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
              Tốc độ trả lời ưu tiên
          </p>
      </div>

      {/* Nạp Button */}
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelect(pkg.id)}
        disabled={isProcessing}
        className="mt-auto w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7f1d1d] to-[#451a03] hover:from-[#b45309] hover:to-[#7f1d1d] text-amber-100 font-historical font-black text-xs uppercase tracking-widest border border-amber-500/40 shadow-lg transition-all flex flex-col items-center group/btn relative overflow-hidden"
      >
        <span className="relative z-10 font-bold">{pkg.amount_vnd.toLocaleString('vi-VN')} VNĐ</span>
        <span className="relative z-10 text-[8px] opacity-80 font-bold uppercase tracking-widest mt-0.5">Nạp ngay qua VietQR</span>
        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500" />
      </motion.button>
    </motion.div>
  );
};

export default PackageCard;
