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
        y: -10,
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(180, 83, 9, 0.15)"
      }}
      className="bg-white rounded-3xl border border-stone-100 p-8 shadow-sm transition-all flex flex-col group relative overflow-hidden"
    >
      {/* Popular Badge for middle package */}
      {pkg.tokens === 350 && (
        <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest shadow-md z-10">
          Phổ biến nhất
        </div>
      )}

      <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-100 transition-colors">
          <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(251,191,36,0.5)] border border-amber-300">
            <span className="text-xs font-black text-red-950 font-serif">史</span>
          </div>
      </div>
      
      <h3 className="text-xl font-black text-stone-800 mb-2 tracking-tight">{pkg.name}</h3>
      <div className="flex items-baseline gap-1 mb-6">
          <span className="text-4xl font-black text-amber-600">{pkg.tokens}</span>
          <span className="text-stone-400 text-sm font-black uppercase tracking-widest">Tokens</span>
      </div>
      
      <div className="space-y-3 mb-8 text-sm text-stone-500 font-medium">
          <p className="flex items-center gap-2 group-hover:text-stone-700 transition-colors">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Không giới hạn thời gian
          </p>
          <p className="flex items-center gap-2 group-hover:text-stone-700 transition-colors">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Tốc độ trả lời ưu tiên
          </p>
      </div>

      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelect(pkg.id)}
        disabled={isProcessing}
        className="mt-auto w-full py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-black hover:from-amber-700 hover:to-orange-700 shadow-lg shadow-amber-900/20 transition-all flex flex-col items-center group/btn relative overflow-hidden"
      >
        <span className="relative z-10">{pkg.amount_vnd.toLocaleString('vi-VN')} VNĐ</span>
        <span className="relative z-10 text-[9px] opacity-80 font-bold uppercase tracking-tighter">Nạp ngay qua VietQR</span>
        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500" />
      </motion.button>
    </motion.div>
  );
};

export default PackageCard;
