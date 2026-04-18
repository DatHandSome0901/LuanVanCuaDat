import React from 'react';

interface PackagesTabProps {
  packages: any[];
  onCreatePackage: () => void;
  onUpdatePackage: (pkg: any) => void;
  onDeletePackage: (id: number) => void;
}

const PackagesTab: React.FC<PackagesTabProps> = ({ 
  packages, 
  onCreatePackage, 
  onUpdatePackage, 
  onDeletePackage 
}) => {
  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center">
          <h3 className="text-xl font-serif font-bold text-amber-900 italic">"Gieo hạt lành, gặt quả ngọt"</h3>
          <button onClick={onCreatePackage} className="bg-amber-600 text-white px-6 py-2.5 rounded-2xl font-bold shadow-lg hover:bg-amber-700 active:scale-95 transition-all">Tạo Gói Nạp Mới</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((p: any) => (
          <div key={p.id} className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm relative group hover:shadow-xl transition-all">
            <div className="absolute top-4 right-4 flex gap-2">
              <button onClick={() => onUpdatePackage(p)} className="text-stone-300 hover:text-amber-600 font-bold transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
              </button>
              <button onClick={() => onDeletePackage(p.id)} className="text-stone-300 hover:text-red-500 font-bold transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
              </button>
            </div>
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-4 text-amber-600 font-bold">蓮</div>
            <h4 className="font-bold text-stone-800 mb-1">{p.name}</h4>
            <div className="text-3xl font-black text-amber-600 mb-4">{p.tokens} <span className="text-xs font-normal text-stone-400">token</span></div>
            <div className="bg-stone-50 py-2 px-3 rounded-xl inline-block text-xs font-bold text-stone-500">{p.amount_vnd.toLocaleString()} VNĐ</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PackagesTab;
