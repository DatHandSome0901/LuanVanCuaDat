import React from 'react';
import { Box, Plus, Edit2, Trash2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const localized = {
  vi: {
    title: "Ngân Bản Gói Nạp (Gói Tệ Công Đức)",
    subtitle: '"Sách ngọc khắc chữ vàng, nghìn năm còn lưu dấu tích." Điều chỉnh linh dược công đức cho sĩ tử.',
    new_package: "Thiết Lập Gói Nạp Mới",
    no_packages: "Chưa có gói nạp tệ nào được thiết lập...",
    edit_package: "Sửa sắc văn",
    delete_package: "Bãi bỏ gói",
    tokens_unit: "Tệ",
    price_label: "Trị giá:"
  },
  en: {
    title: "Coin Packages (Donation & Credits)",
    subtitle: '"Golden letters carved in jade books, traces remain for a thousand years." Adjust credits for scholars.',
    new_package: "Create New Package",
    no_packages: "No coin packages have been configured yet...",
    edit_package: "Edit Package",
    delete_package: "Delete Package",
    tokens_unit: "Credits",
    price_label: "Price:"
  }
};

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
  const { language } = useLanguage();
  const tLocal = localized[language] || localized.vi;

  return (
    <div className="space-y-8 animate-in fade-in pb-10">
      <div className="paper-texture scroll-border p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-historical text-xl text-[#7f1d1d] font-black">
            {tLocal.title}
          </h3>
          <p className="text-xs text-stone-500 font-sans italic mt-1">
            {tLocal.subtitle}
          </p>
        </div>
        <button 
          onClick={onCreatePackage} 
          className="bg-gradient-to-r from-[#7f1d1d] to-[#451a03] hover:from-[#b45309] hover:to-[#7f1d1d] text-amber-100 border border-amber-500/40 px-6 py-2.5 rounded-xl font-historical font-black text-xs uppercase tracking-widest shadow-md hover-lift active:scale-95 transition-all flex items-center gap-2 shrink-0"
        >
          <Plus size={16} />
          {tLocal.new_package}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.length === 0 ? (
          <div className="col-span-full paper-texture scroll-border py-16 text-center text-stone-450 italic font-serif">
            {tLocal.no_packages}
          </div>
        ) : (
          packages.map((p: any) => (
            <div 
              key={p.id} 
              className="paper-texture scroll-border p-6 rounded-2xl border-double border-4 border-amber-600/30 shadow-md relative group hover:shadow-xl hover:border-amber-600/60 transition-all flex flex-col justify-between min-h-[220px]"
            >
              {/* Hành động (Sửa/Xóa) */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => onUpdatePackage(p)} 
                  className="p-1.5 bg-amber-50/80 hover:bg-amber-100 text-[#b45309] border border-amber-300/40 rounded-lg transition-all hover-lift"
                  title={tLocal.edit_package}
                >
                  <Edit2 size={12} />
                </button>
                <button 
                  onClick={() => onDeletePackage(p.id)} 
                  className="p-1.5 bg-red-50/80 hover:bg-red-100 text-red-600 border border-red-200/50 rounded-lg transition-all hover-lift"
                  title={tLocal.delete_package}
                >
                  <Trash2 size={12} />
                </button>
              </div>

              {/* Icon & Title */}
              <div>
                <div className="w-10 h-10 bg-amber-100/50 border border-amber-300 rounded-xl flex items-center justify-center mb-4 text-[#7f1d1d] font-historical font-black shadow-inner">
                  敕
                </div>
                <h4 className="font-historical font-black text-[#7f1d1d] text-lg leading-tight mb-1">{p.name}</h4>
                <div className="text-3xl font-historical font-black text-amber-800 flex items-baseline gap-1">
                  {p.tokens.toLocaleString()}
                  <span className="text-xs font-serif text-amber-900/60 uppercase tracking-widest font-normal">{tLocal.tokens_unit}</span>
                </div>
              </div>

              {/* Price Tag */}
              <div className="mt-6 pt-4 border-t border-amber-800/10 flex justify-between items-center">
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">{tLocal.price_label}</span>
                <div className="bg-[#7f1d1d]/10 hover:bg-[#7f1d1d]/20 text-[#7f1d1d] font-historical font-black py-1 px-3 rounded-lg border border-amber-800/20 text-sm">
                  {p.amount_vnd.toLocaleString()} VNĐ
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PackagesTab;
