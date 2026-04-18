import React from 'react';

interface UserDetailModalProps {
  userDetail: any;
  onClose: () => void;
  onEditUser: (userId: number, field: 'full_name' | 'password', currentVal?: string) => void;
  onViewChatDetail: (log: any) => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ 
  userDetail, 
  onClose, 
  onEditUser,
  onViewChatDetail
}) => {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in duration-300">
         <div className="p-8 bg-amber-900 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
                {userDetail.user.picture_url && !imgError ? (
                  <img 
                    src={userDetail.user.picture_url} 
                    alt={userDetail.user.username} 
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-white/20" 
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center font-bold text-xl uppercase">
                      {userDetail.user.username[0]}
                  </div>
                )}
                <div>
                    <h3 className="text-xl font-bold">Chi Tiết Phật Tử</h3>
                    <p className="text-xs text-amber-200/60">{userDetail.user.email}</p>
                </div>
            </div>
            <button onClick={onClose} className="text-white hover:rotate-90 transition-transform p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
         </div>
         
         <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
            {/* Basic Info Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100">
                    <p className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-1">Số dư hiện tại</p>
                    <p className="text-3xl font-black text-amber-600">{userDetail.user.token_balance.toFixed(2)} <span className="text-xs font-normal text-stone-400">Tokens</span></p>
                </div>
                <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100">
                    <p className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-1">Ngày tham gia</p>
                    <p className="text-xl font-bold text-stone-800">{new Date(userDetail.user.created_at).toLocaleDateString()}</p>
                </div>
                <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100">
                    <p className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-1">Họ tên</p>
                    <div className="flex items-center justify-between">
                        <p className="text-xl font-bold text-stone-800">{userDetail.user.full_name || 'Chưa cập nhật'}</p>
                        <button onClick={() => onEditUser(userDetail.user.id, 'full_name', userDetail.user.full_name)} className="text-[10px] font-bold text-amber-600 hover:bg-amber-100 px-2 py-1 rounded">SỬA</button>
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                 <button onClick={() => onEditUser(userDetail.user.id, 'password')} className="bg-white border border-stone-200 text-stone-700 px-6 py-2 rounded-2xl text-xs font-bold hover:bg-stone-50 transition-all shadow-sm">
                    Đổi Mật Khẩu Cho Người Dùng
                 </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Token History */}
                <div>
                    <h4 className="text-sm font-black uppercase text-stone-800 mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
                        Biến động công đức
                    </h4>
                    <div className="space-y-3">
                        {userDetail.token_history.length === 0 ? (
                            <p className="text-xs text-stone-400 italic">Chưa có giao dịch nào.</p>
                        ) : userDetail.token_history.slice(0, 10).map((h: any, i: number) => (
                            <div key={i} className="flex justify-between items-center bg-stone-50/50 p-3 rounded-xl text-xs border border-stone-100">
                                <div>
                                    <p className="font-bold text-stone-700">{h.description}</p>
                                    <p className="text-[10px] text-stone-400">{new Date(h.created_at).toLocaleString()}</p>
                                </div>
                                <span className={`font-black ${h.type === 'in' ? 'text-green-600' : 'text-amber-600'}`}>
                                    {h.type === 'in' ? '+' : '-'}{h.amount}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat History */}
                <div>
                    <h4 className="text-sm font-black uppercase text-stone-800 mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-stone-800 rounded-full"></span>
                        Nhật ký đàm đạo
                    </h4>
                    <div className="space-y-3">
                        {userDetail.chat_logs.length === 0 ? (
                            <p className="text-xs text-stone-400 italic">Chưa có lịch sử chat.</p>
                        ) : userDetail.chat_logs.slice(0, 10).map((log: any, i: number) => (
                            <div key={i} className="bg-stone-50/50 p-3 rounded-xl border border-stone-100 cursor-pointer hover:bg-white transition-all shadow-sm group" onClick={() => onViewChatDetail(log)}>
                                <p className="text-xs font-medium text-stone-800 line-clamp-2 italic">"{log.question}"</p>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-[10px] text-stone-400">{new Date(log.created_at).toLocaleDateString()}</span>
                                    <span className="text-[10px] font-bold text-stone-300 group-hover:text-amber-600 transition-colors uppercaseTracking-widest">Xem lời giải →</span>
                                </div>
                            </div>
                        ))}
                    </div>
            </div>
         </div>
      </div>

         <div className="p-8 bg-stone-50 border-t border-stone-100 shrink-0">
            <button onClick={onClose} className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all active:scale-95">Đóng Chi Tiết</button>
         </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
