import React, { useState } from 'react';
import {
  Users, DollarSign, MessageSquare, ShieldCheck,
  Activity, ArrowRight, TrendingUp, AlertTriangle, UserCheck
} from 'lucide-react';
import { API_ROOT } from '../../api';

interface DashboardTabProps {
  users: any[];
  payments: any[];
  chatlogs: any[];
  logins: any[];
  negativeFeedback?: any[];
  onTabChange: (tab: any) => void;
  llmName?: string;
}

// Helper Avatar Component for User Profile Pictures or Initials
const UserAvatar: React.FC<{ username?: string, email?: string, pictureUrl?: string }> = ({ username = '', email = '', pictureUrl }) => {
  const [error, setError] = React.useState(false);
  const alt = username || email || '?';
  const initial = alt.charAt(0).toUpperCase();

  if (pictureUrl && !error) {
    const finalSrc = pictureUrl.startsWith('/') ? `${API_ROOT}${pictureUrl}` : pictureUrl;
    return (
      <img
        src={finalSrc}
        alt={alt}
        className="w-9 h-9 rounded-full object-cover border border-amber-500/20 shadow-sm shrink-0"
        referrerPolicy="no-referrer"
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-300 text-[#7f1d1d] flex items-center justify-center font-historical font-black text-sm shrink-0 shadow-inner">
      {initial}
    </div>
  );
};

// Collapsible Feedback Item Component
const FeedbackItem: React.FC<{ fb: any }> = ({ fb }) => {
  const [expanded, setExpanded] = React.useState(false);
  const maxLength = 100;
  const isLong = fb.answer && fb.answer.length > maxLength;
  const displayText = expanded
    ? fb.answer
    : (isLong ? `${fb.answer.slice(0, maxLength)}...` : fb.answer);

  return (
    <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-250/20 flex flex-col gap-1 text-xs hover:border-amber-400/40 transition-colors">
      <div className="flex justify-between items-center mb-1">
        <span className="font-historical font-black text-amber-900">{fb.username || 'Sĩ tử ẩn danh'}</span>
        <span className="text-[9px] text-stone-400 font-mono">{new Date(fb.created_at).toLocaleString()}</span>
      </div>
      <p className="text-stone-600 font-serif italic mb-0.5">
        <strong className="text-amber-800">Câu hỏi:</strong> "{fb.question}"
      </p>
      <div>
        <p className="text-stone-750 font-serif leading-relaxed">
          <strong className="text-red-800 font-historical font-black">Trả lời:</strong> {displayText}
        </p>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-[9px] text-[#b45309] font-historical font-black uppercase tracking-widest mt-1.5 hover:underline flex items-center gap-0.5"
          >
            {expanded ? 'Thu gọn tấu chương' : 'Đọc thêm tấu chương'}
          </button>
        )}
      </div>
      {fb.feedback_note && (
        <p className="text-stone-500 font-serif border-l-2 border-red-300/60 pl-2 mt-1.5 italic">
          <strong>Lý do:</strong> {fb.feedback_note}
        </p>
      )}
    </div>
  );
};

// ==========================================
// Custom SVG Chart Components for Admin Dashboard
// ==========================================

const RevenueChart: React.FC<{ data: { date: string; amount: number }[] }> = ({ data }) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const width = 500;
  const height = 180;
  const paddingX = 45;
  const paddingY = 25;

  const maxAmount = Math.max(...data.map(d => d.amount), 10000);

  // Calculate points
  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - (d.amount / maxAmount) * (height - paddingY * 2);
    return { x, y, val: d.amount, date: d.date };
  });

  // Create path command
  const linePath = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : '';

  return (
    <div className="relative paper-texture scroll-border rounded-2xl p-6 shadow-md border border-amber-800/10">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-historical text-[#7f1d1d] text-sm font-black flex items-center gap-1.5">
          📈 Ngân Khố Doanh Thu (7 Ngày Qua)
        </h4>
        <span className="text-[10px] text-stone-400 font-mono">Đơn vị: VNĐ</span>
      </div>

      <div className="w-full overflow-x-auto scrollbar-hide">
        <div className="min-w-[400px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#b45309" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#b45309" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = paddingY + ratio * (height - paddingY * 2);
              const val = Math.round(maxAmount * (1 - ratio));
              return (
                <g key={i} className="opacity-20">
                  <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#7f1d1d" strokeDasharray="3,3" />
                  <text x={paddingX - 8} y={y + 4} textAnchor="end" className="text-[9px] font-mono fill-stone-600 font-bold">
                    {val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                  </text>
                </g>
              );
            })}

            {/* Area & Line */}
            {points.length > 0 && (
              <>
                <path d={areaPath} fill="url(#revGrad)" />
                <path d={linePath} fill="none" stroke="#7f1d1d" strokeWidth="2.5" strokeLinecap="round" />
              </>
            )}

            {/* X Axis labels */}
            {points.map((p, i) => {
              const dateObj = new Date(p.date);
              const label = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
              return (
                <text key={i} x={p.x} y={height - 4} textAnchor="middle" className="text-[9px] font-mono fill-stone-600 font-bold">
                  {label}
                </text>
              );
            })}

            {/* Dots */}
            {points.map((p, i) => (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoveredPoint === i ? 6 : 4}
                  className="fill-[#b45309] stroke-[#f4f1ea] stroke-2 cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredPoint(i)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Floating Tooltip inside container */}
      {hoveredPoint !== null && (
        <div className="absolute top-4 right-6 bg-[#171717]/95 border border-amber-500/30 text-amber-100 px-3 py-1.5 rounded-xl shadow-xl text-[10px] pointer-events-none transition-all duration-150 z-10 font-mono">
          <p className="text-amber-500 font-bold">{new Date(points[hoveredPoint].date).toLocaleDateString('vi-VN')}</p>
          <p className="text-white text-xs mt-0.5">{points[hoveredPoint].val.toLocaleString()} VNĐ</p>
        </div>
      )}
    </div>
  );
};

const ChatTrafficChart: React.FC<{ data: { date: string; count: number }[] }> = ({ data }) => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const width = 500;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  const maxCount = Math.max(...data.map(d => d.count), 5);

  const barWidth = 24;
  const chartWidth = width - paddingX * 2;
  const step = chartWidth / (data.length - 1);

  return (
    <div className="relative paper-texture scroll-border rounded-2xl p-6 shadow-md border border-amber-800/10">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-historical text-[#7f1d1d] text-sm font-black flex items-center gap-1.5">
          💬 Tần Suất Đàm Luận (7 Ngày Qua)
        </h4>
        <span className="text-[10px] text-stone-400 font-mono">Đơn vị: Lượt chat</span>
      </div>

      <div className="w-full overflow-x-auto scrollbar-hide">
        <div className="min-w-[400px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7f1d1d" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = paddingY + ratio * (height - paddingY * 2);
              const val = Math.round(maxCount * (1 - ratio));
              return (
                <g key={i} className="opacity-20">
                  <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#7f1d1d" strokeDasharray="3,3" />
                  <text x={paddingX - 8} y={y + 4} textAnchor="end" className="text-[9px] font-mono fill-stone-600 font-bold">
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {data.map((d, i) => {
              const x = paddingX + i * step - barWidth / 2;
              const barHeight = (d.count / maxCount) * (height - paddingY * 2);
              const y = height - paddingY - barHeight;

              return (
                <g key={i}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={Math.max(barHeight, 2)}
                    rx={4}
                    fill="url(#barGrad)"
                    className={`cursor-pointer transition-all duration-200 ${hoveredBar === i ? 'opacity-100 filter brightness-125' : 'opacity-85'
                      }`}
                    onMouseEnter={() => setHoveredBar(i)}
                    onMouseLeave={() => setHoveredBar(null)}
                  />
                  {/* X Axis Date label */}
                  <text
                    x={x + barWidth / 2}
                    y={height - 4}
                    textAnchor="middle"
                    className="text-[9px] font-mono fill-stone-600 font-bold"
                  >
                    {(() => {
                      const dateObj = new Date(d.date);
                      return `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;
                    })()}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Floating Tooltip inside container */}
      {hoveredBar !== null && (
        <div className="absolute top-4 right-6 bg-[#171717]/95 border border-amber-500/30 text-amber-100 px-3 py-1.5 rounded-xl shadow-xl text-[10px] pointer-events-none transition-all duration-150 z-10 font-mono">
          <p className="text-amber-500 font-bold">{new Date(data[hoveredBar].date).toLocaleDateString('vi-VN')}</p>
          <p className="text-white text-xs mt-0.5">{data[hoveredBar].count} Lượt đàm luận</p>
        </div>
      )}
    </div>
  );
};

const DashboardTab: React.FC<DashboardTabProps> = ({
  users = [],
  payments = [],
  chatlogs = [],
  logins = [],
  negativeFeedback = [],
  onTabChange,
  llmName = 'openai'
}) => {
  // Tính toán số liệu
  const totalUsers = users.length;
  const adminCount = users.filter((u: any) => u.is_admin).length;
  const regularUsersCount = totalUsers - adminCount;

  // Tính tổng doanh thu từ hóa đơn trạng thái completed
  const completedPayments = payments.filter((p: any) => p.status === 'completed');
  const totalRevenue = completedPayments.reduce((sum: number, p: any) => sum + (p.amount_vnd || 0), 0);
  const totalTokensSold = completedPayments.reduce((sum: number, p: any) => sum + (p.tokens || 0), 0);

  const totalChatMessages = chatlogs.length;
  const activeUsersTodayCount = logins.length;

  // Lấy 5 giao dịch gần đây nhất
  const recentTransactions = [...payments]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Lấy 5 lượt truy cập gần đây nhất
  const recentLogins = [...logins]
    .sort((a, b) => new Date(b.login_time || b.created_at || 0).getTime() - new Date(a.login_time || a.created_at || 0).getTime())
    .slice(0, 5);

  // Lấy dữ liệu 7 ngày qua để vẽ biểu đồ
  const getPastNDays = (n: number) => {
    const dates = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const last7Days = getPastNDays(7);

  // 1. Phân tích doanh thu theo ngày
  const revenueTrend = last7Days.map(dateStr => {
    const dayPayments = payments.filter((p: any) => {
      if (p.status !== 'completed') return false;
      const pDateStr = new Date(p.created_at).toISOString().split('T')[0];
      return pDateStr === dateStr;
    });
    const amount = dayPayments.reduce((sum: number, p: any) => sum + (p.amount_vnd || 0), 0);
    return { date: dateStr, amount };
  });

  // 2. Phân tích số lượt chat theo ngày
  const chatTrafficTrend = last7Days.map(dateStr => {
    const dayChats = chatlogs.filter((c: any) => {
      const cDateStr = new Date(c.created_at).toISOString().split('T')[0];
      return cDateStr === dateStr;
    });
    return { date: dateStr, count: dayChats.length };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-10">
      {/* Khung Chào Mừng Triều Đình (Imperial Welcome Banner) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7f1d1d] to-[#451a03] text-white p-6 md:p-8 shadow-2xl border-2 border-amber-500/30">
        {/* Dong Son Bronze Drum Watermark Pattern */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none w-72 h-72 md:w-96 md:h-96">
          <svg viewBox="0 0 200 200" className="w-full h-full text-amber-300 fill-none stroke-current">
            <defs>
              {/* Stylized Chim Lạc (Lac Bird) flying counter-clockwise */}
              <g id="lac-bird">
                <path
                  d="M -20,4 C -12,4 -6,1 0,-3 C 6,-7 15,-10 24,-10 C 14,-7 8,-3 4,1 C 6,4 9,8 12,11 C 6,7 3,3 1,0 C -2,2 -5,3 -9,3 C -13,3 -17,1 -20,4 Z M -25,1 C -21,1 -17,-1 -15,-4 C -17,-2 -20,-1 -25,-1 C -30,-1 -33,-3 -35,-6 C -33,-4 -29,-1 -25,1 Z"
                  fill="currentColor"
                  stroke="none"
                />
              </g>
            </defs>

            {/* Outer Rim */}
            <circle cx="100" cy="100" r="96" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="92" strokeWidth="0.8" strokeDasharray="2,2" />

            {/* Concentric rings with different historical patterns */}
            <circle cx="100" cy="100" r="86" strokeWidth="1" />
            <circle cx="100" cy="100" r="82" strokeWidth="1.2" strokeDasharray="3,3" />

            {/* Birds Ring (r = 74) */}
            <circle cx="100" cy="100" r="74" strokeWidth="0.8" />
            <circle cx="100" cy="100" r="66" strokeWidth="0.8" />

            {/* Placing 6 Chim Lạc birds flying around the ring */}
            <use href="#lac-bird" transform="translate(100, 100) rotate(0) translate(0, -70) scale(0.65)" />
            <use href="#lac-bird" transform="translate(100, 100) rotate(60) translate(0, -70) scale(0.65)" />
            <use href="#lac-bird" transform="translate(100, 100) rotate(120) translate(0, -70) scale(0.65)" />
            <use href="#lac-bird" transform="translate(100, 100) rotate(180) translate(0, -70) scale(0.65)" />
            <use href="#lac-bird" transform="translate(100, 100) rotate(240) translate(0, -70) scale(0.65)" />
            <use href="#lac-bird" transform="translate(100, 100) rotate(300) translate(0, -70) scale(0.65)" />

            {/* Mid Ring with tiny circles/dots */}
            <circle cx="100" cy="100" r="58" strokeWidth="1" />
            <circle cx="100" cy="100" r="54" strokeWidth="1.5" strokeDasharray="1,4" />
            <circle cx="100" cy="100" r="50" strokeWidth="1" />

            {/* Inner Ring with geometric chevrons */}
            <circle cx="100" cy="100" r="42" strokeWidth="0.8" />
            <circle cx="100" cy="100" r="38" strokeWidth="1" strokeDasharray="3,2" />
            <circle cx="100" cy="100" r="34" strokeWidth="0.8" />

            {/* Center Star (12-point Dong Son Sun) */}
            <polygon
              points="100,74 102.6,89.3 112.5,77.4 107.1,91.9 121.7,86.5 109.7,96.4 126,99 109.7,101.6 121.7,111.5 107.1,106.1 112.5,120.7 102.6,108.7 100,124 97.4,108.7 87.5,120.7 92.9,106.1 78.3,111.5 90.3,101.6 74,99 90.3,96.4 78.3,86.5 92.9,91.9 87.5,77.4 97.4,89.3"
              fill="currentColor"
              stroke="none"
            />
            {/* Core Sun Circle */}
            <circle cx="100" cy="100" r="12" strokeWidth="0.8" />
          </svg>
        </div>

        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 bg-amber-500/20 border border-amber-400/30 rounded-full text-xs font-historical font-black uppercase tracking-[0.2em] text-amber-300">
            Ngự Tiền Khái Lược
          </span>
          <h1 className="text-3xl md:text-4xl font-black font-historical text-amber-100 tracking-tight mt-3">
            Hệ Thống Quản Trị Sử Việt
          </h1>
          <p className="text-amber-100/70 text-sm mt-2 font-sans italic">
            "Dân ta phải biết sử ta, cho tường gốc tích nước nhà Việt Nam." Giám sát hoạt động tri thức, quản lý sĩ tử đăng khoa và thống kê ngân khố quốc gia.
          </p>

          <div className="flex flex-wrap gap-4 mt-6">
            <div className="bg-black/20 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/5">
              <p className="text-[9px] text-amber-200/60 uppercase tracking-widest font-historical font-black">Hộ Bộ (Quản trị)</p>
              <p className="text-base font-black text-amber-300 font-historical">{adminCount} Quan lại</p>
            </div>
            <div className="bg-black/20 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/5">
              <p className="text-[9px] text-amber-200/60 uppercase tracking-widest font-historical font-black">Nhà Cung Cấp LLM</p>
              <p className="text-base font-black text-amber-300 uppercase tracking-wider font-mono">{llmName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bản Đồ Chỉ Số - 4 Thẻ KPI Sáng Tạo Phong Cách Sử Việt (Bản chỉ số giấy đó) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* CARD 1: Tổng Sĩ Tử */}
        <div className="paper-texture scroll-border rounded-2xl p-6 shadow-lg border border-stone-200 hover-lift relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[9px] text-stone-400 font-historical font-black uppercase tracking-wider">Sĩ Tử Đăng Khoa</p>
              <h3 className="text-2xl font-black font-historical text-[#7f1d1d] mt-1">{totalUsers.toLocaleString()}</h3>
            </div>
            <div className="p-2.5 bg-red-50 text-[#7f1d1d] rounded-xl border border-red-100">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-800/10 flex items-center justify-between text-xs">
            <span className="text-stone-500 font-serif">Thường dân: <strong className="text-stone-700 font-bold">{regularUsersCount}</strong></span>
            <button
              onClick={() => onTabChange('users')}
              className="text-[#b45309] font-historical font-black hover:underline flex items-center gap-0.5"
            >
              Xem tấu chương <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* CARD 2: Doanh Thu Ngân Khố */}
        <div className="paper-texture scroll-border rounded-2xl p-6 shadow-lg border border-stone-200 hover-lift relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[9px] text-stone-400 font-historical font-black uppercase tracking-wider">Ngân Khố Quốc Gia</p>
              <h3 className="text-2xl font-black font-historical text-amber-850 mt-1">{totalRevenue.toLocaleString()} đ</h3>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-800/10 flex items-center justify-between text-xs">
            <span className="text-stone-500 font-serif">Tokens: <strong className="text-amber-800 font-bold">{(totalTokensSold / 1000).toFixed(1)}k</strong></span>
            <button
              onClick={() => onTabChange('payments')}
              className="text-[#b45309] font-historical font-black hover:underline flex items-center gap-0.5"
            >
              Kê khai ngân quỹ <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* CARD 3: Thư Tịch Đối Thoại */}
        <div className="paper-texture scroll-border rounded-2xl p-6 shadow-lg border border-stone-200 hover-lift relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[9px] text-stone-400 font-historical font-black uppercase tracking-wider">Thư Tịch Đối Thoại</p>
              <h3 className="text-2xl font-black font-historical text-[#7f1d1d] mt-1">{totalChatMessages.toLocaleString()}</h3>
            </div>
            <div className="p-2.5 bg-red-50 text-[#7f1d1d] rounded-xl border border-red-100">
              <MessageSquare size={16} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-800/10 flex items-center justify-between text-xs">
            <span className="text-stone-500 font-serif">Lịch sử đàm luận</span>
            <button
              onClick={() => onTabChange('chatlogs')}
              className="text-[#b45309] font-historical font-black hover:underline flex items-center gap-0.5"
            >
              Tra cứu thư văn <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* CARD 4: Trực Tuyến Đương Thời */}
        <div className="paper-texture scroll-border rounded-2xl p-6 shadow-lg border border-stone-200 hover-lift relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[9px] text-stone-400 font-historical font-black uppercase tracking-wider">Trực Tuyến Đương Thời</p>
              <h3 className="text-2xl font-black font-historical text-green-700 mt-1">{activeUsersTodayCount}</h3>
            </div>
            <div className="p-2.5 bg-green-50 text-green-700 rounded-xl border border-green-100">
              <Activity size={16} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-800/10 flex items-center justify-between text-xs">
            <span className="text-stone-500 font-serif flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
              Đang đàm luận
            </span>
            <button
              onClick={() => onTabChange('logins')}
              className="text-[#b45309] font-historical font-black hover:underline flex items-center gap-0.5"
            >
              Giám sát <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Thống Kê Biểu Đồ Hoạt Động & Doanh Thu */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenueTrend} />
        <ChatTrafficChart data={chatTrafficTrend} />
      </div>

      {/* Lối tắt hành sự & Hoạt động gần đây */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* CỘT 1 & 2: Ngân khố và Tấu chương */}
        <div className="lg:col-span-2 space-y-6">

          {/* MỤC 1: Ngân Khố Mới Nhận */}
          <div className="paper-texture scroll-border rounded-2xl shadow-md border border-amber-850/10 overflow-hidden">
            <div className="px-6 py-4 bg-amber-50/40 border-b border-amber-800/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#7f1d1d] rounded-full"></span>
                <h3 className="font-historical text-[#7f1d1d] text-base font-black">Ngân Khố Mới Nhận (Thu Chi Gần Đây)</h3>
              </div>
              <button
                onClick={() => onTabChange('payments')}
                className="text-xs text-[#b45309] font-historical font-black flex items-center gap-0.5 hover:underline"
              >
                Xem tất cả ({payments.length})
              </button>
            </div>

            <div className="divide-y divide-amber-800/10">
              {recentTransactions.length === 0 ? (
                <p className="p-6 text-center text-xs text-stone-450 italic font-serif">Chưa có giao dịch nạp tệ nào...</p>
              ) : (
                recentTransactions.map((tx: any) => (
                  <div key={tx.id} className="p-4 hover:bg-amber-50/20 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Render User Avatar instead of standard Dollar icon */}
                      <UserAvatar username={tx.username} email={tx.email} pictureUrl={tx.picture_url || tx.avatar_url} />
                      <div>
                        <p className="text-xs font-historical font-black text-[#7f1d1d]">{tx.username}</p>
                        <p className="text-[10px] text-stone-400 font-mono">{tx.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-historical font-black text-amber-900">{tx.amount_vnd.toLocaleString()} đ</p>
                      <p className="text-[9px] font-historical font-black text-amber-600">+{tx.tokens} Tokens</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* MỤC 2: Tấu Chương Góp Ý (Feedback tiêu cực) */}
          <div className="paper-texture scroll-border rounded-2xl shadow-md border border-amber-850/10 overflow-hidden">
            <div className="px-6 py-4 bg-amber-50/40 border-b border-amber-800/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-5 bg-[#7f1d1d] rounded-full"></span>
                <h3 className="font-historical text-[#7f1d1d] text-base font-black flex items-center gap-1.5">
                  Hòm Thư Tấu Góp Ý <span className="text-xs font-sans px-2 py-0.5 bg-red-100 text-[#7f1d1d] rounded-full font-black">{negativeFeedback.length}</span>
                </h3>
              </div>
              <button
                onClick={() => onTabChange('feedback')}
                className="text-xs text-[#b45309] font-historical font-black flex items-center gap-0.5 hover:underline"
              >
                Xử lý sớ tấu <ArrowRight size={12} />
              </button>
            </div>

            <div className="divide-y divide-amber-800/10 p-2 space-y-2">
              {negativeFeedback.length === 0 ? (
                <div className="p-6 text-center text-xs text-stone-450 italic font-serif">
                  Khắp nơi thái bình thịnh trị. Chưa nhận được tấu chương phản hồi tiêu cực nào.
                </div>
              ) : (
                negativeFeedback.slice(0, 3).map((fb: any) => (
                  <FeedbackItem key={fb.id} fb={fb} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* CỘT 3: Trạng sĩ đăng nhập & Liên kết nhanh */}
        <div className="space-y-6">
          {/* Lối tắt hành động */}
          <div className="paper-texture scroll-border rounded-2xl p-6 shadow-md border border-stone-200">
            <h3 className="font-historical text-[#7f1d1d] text-base font-black border-b border-amber-800/10 pb-3 mb-4">
              Lối Tắt Hành Sự
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => onTabChange('settings')}
                className="flex items-center justify-between p-3.5 bg-white hover:bg-amber-50/30 border border-amber-800/10 rounded-xl text-left transition-all hover-lift group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-[#7f1d1d] flex items-center justify-center border border-red-100 shrink-0">
                    <ShieldCheck size={14} />
                  </div>
                  <span className="text-xs font-historical font-black text-amber-900">Thiết Lập Triều Đình</span>
                </div>
                <ArrowRight size={12} className="text-stone-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onTabChange('knowledge')}
                className="flex items-center justify-between p-3.5 bg-white hover:bg-amber-50/30 border border-amber-800/10 rounded-xl text-left transition-all hover-lift group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 shrink-0">
                    <UserCheck size={14} />
                  </div>
                  <span className="text-xs font-historical font-black text-amber-900">Phê Phán Tri Thức AI</span>
                </div>
                <ArrowRight size={12} className="text-stone-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onTabChange('packages')}
                className="flex items-center justify-between p-3.5 bg-white hover:bg-amber-50/30 border border-amber-800/10 rounded-xl text-left transition-all hover-lift group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-green-50 text-green-700 flex items-center justify-center border border-green-100 shrink-0">
                    <TrendingUp size={14} />
                  </div>
                  <span className="text-xs font-historical font-black text-amber-900">Quốc Khố Gói Nạp</span>
                </div>
                <ArrowRight size={12} className="text-stone-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Trạng sĩ đăng nhập */}
          <div className="paper-texture scroll-border rounded-2xl shadow-md border border-amber-850/10 overflow-hidden">
            <div className="px-5 py-4 bg-amber-50/40 border-b border-amber-800/10 flex justify-between items-center">
              <h3 className="font-historical text-[#7f1d1d] text-sm font-black">Sĩ Tử Đăng Nhập Gần Đây</h3>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
            </div>

            <div className="p-4 space-y-4">
              {recentLogins.length === 0 ? (
                <p className="text-center text-xs text-stone-450 italic font-serif py-4">Chưa ghi nhận sĩ tử nào truy cập...</p>
              ) : (
                recentLogins.map((lg: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 text-xs border-b border-amber-800/5 pb-2.5 last:border-0 last:pb-0">
                    <UserAvatar username={lg.username} email={lg.email} pictureUrl={lg.picture_url || lg.avatar_url} />
                    <div className="flex-1 min-w-0">
                      <p className="font-historical font-black text-amber-900 truncate">{lg.username}</p>
                      <p className="text-[9px] text-stone-400 font-mono truncate">IP: {lg.ip_address || '127.0.0.1'}</p>
                    </div>
                    <span className="text-[9px] text-stone-405 font-serif italic whitespace-nowrap">
                      {lg.login_time ? new Date(lg.login_time).toLocaleTimeString() : 'Vừa xong'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
