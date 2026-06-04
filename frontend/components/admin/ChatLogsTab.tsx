import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, User, MessageSquare, ArrowRight, Play, Square, Search, RefreshCw, AlertTriangle, Smile, Frown, HelpCircle, Meh } from 'lucide-react';
import { api, API_ROOT } from '../../api';
import { useLanguage } from '../../contexts/LanguageContext';

const localized = {
  vi: {
    title: "💬 Thư Tịch Đối Thoại & Ngự Tiền Minh Sát",
    subtitle: "Ghi chép và giám sát cảm xúc đàm đạo thời gian thực",
    col_time: "Can Chi (Thời Gian)",
    col_user: "Nhân Sĩ Đàm Luận",
    col_question: "Câu Hỏi (Tầm Sư Học Đạo)",
    col_sentiment: "Thái Độ (Cảm Xúc)",
    col_fee: "Phí Giao Dịch",
    col_action: "Chi Tiết Thư Văn",
    empty_records: "Chưa có nhật ký đàm đạo nào được ghi chép trong sử thư...",
    anonymous: "Sĩ tử ẩn danh",
    tokens_unit: "Tệ",
    btn_open: "Mở Sớ",
    live_monitoring: "Đang kết nối sa bàn (Giám sát Live)...",
    live_start: "Khởi Động Giám Sát",
    live_stop: "Tạm Ngưng Giám Sát",
    search_placeholder: "Tìm nhân sĩ, câu hỏi hoặc lời giải...",
    filter_all: "Tất cả thái độ",
    filter_positive: "😊 Tích cực / Hài lòng",
    filter_frustrated: "😡 Tiêu cực / Bực bội",
    filter_inquisitive: "🤔 Nghi vấn / Tầm sư",
    filter_jailbreak: "🚨 Phá hoại / Jailbreak",
    filter_neutral: "😐 Bình thường",
    stats_title: "Thống Kê Khí Sắc Học Đường",
    total_chats: "Tổng Số Sớ",
    score_lbl: "Chỉ số: "
  },
  en: {
    title: "💬 Dialogue Ledger & Live Chat Audit",
    subtitle: "Real-time conversation logs and sentiment analytics dashboard",
    col_time: "Timestamp",
    col_user: "Scholar",
    col_question: "Inquiry (Question)",
    col_sentiment: "Sentiment",
    col_fee: "Cost",
    col_action: "View Detail",
    empty_records: "No chat history recorded in the scrolls...",
    anonymous: "Anonymous Scholar",
    tokens_unit: "Credits",
    btn_open: "Open Scroll",
    live_monitoring: "Live stream connected (Monitoring)...",
    live_start: "Start Live Audit",
    live_stop: "Pause Live Audit",
    search_placeholder: "Search scholars, questions or answers...",
    filter_all: "All Sentiments",
    filter_positive: "😊 Positive / Satisfied",
    filter_frustrated: "😡 Negative / Frustrated",
    filter_inquisitive: "🤔 Inquisitive / Asking",
    filter_jailbreak: "🚨 Jailbreak Attempt",
    filter_neutral: "😐 Neutral",
    stats_title: "Scholar Sentiment Statistics",
    total_chats: "Total Inquiries",
    score_lbl: "Score: "
  }
};

const AvatarImage: React.FC<{ src?: string, alt: string }> = ({ src, alt }) => {
  const [error, setError] = React.useState(false);
  if (!src || error) {
    return (
      <div className="w-6 h-6 rounded bg-[#7f1d1d]/10 flex items-center justify-center text-[#7f1d1d] font-historical font-black text-xs shrink-0">
        {(alt || 'S')[0].toUpperCase()}
      </div>
    );
  }
  const finalSrc = src.startsWith('/') ? `${API_ROOT}${src}` : src;
  return (
    <img 
      src={finalSrc} 
      alt={alt} 
      className="w-6 h-6 rounded object-cover shadow-sm border border-amber-500/20 shrink-0" 
      referrerPolicy="no-referrer" 
      onError={() => setError(true)} 
    />
  );
};

interface ChatLogsTabProps {
  chatlogs: any[];
  onSelectChat: (log: any) => void;
}

const ChatLogsTab: React.FC<ChatLogsTabProps> = ({ chatlogs, onSelectChat }) => {
  const { language } = useLanguage();
  const tLocal = localized[language] || localized.vi;

  const [localLogs, setLocalLogs] = useState<any[]>(chatlogs);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Sync props to local logs
  useEffect(() => {
    setLocalLogs(chatlogs);
  }, [chatlogs]);

  // Polling for live monitor
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.adminGetChatLogs();
        if (res && res.logs) {
          setLocalLogs(res.logs);
        }
      } catch (err) {
        console.error("Live monitoring error:", err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isLive]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.adminGetChatLogs();
      if (res && res.logs) {
        setLocalLogs(res.logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    let positive = 0;
    let frustrated = 0;
    let inquisitive = 0;
    let jailbreak = 0;
    let neutral = 0;

    localLogs.forEach((log) => {
      const sent = log.sentiment || 'neutral';
      if (sent === 'positive') positive++;
      else if (sent === 'frustrated') frustrated++;
      else if (sent === 'inquisitive') inquisitive++;
      else if (sent === 'jailbreak') jailbreak++;
      else neutral++;
    });

    return { positive, frustrated, inquisitive, jailbreak, neutral, total: localLogs.length };
  }, [localLogs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return localLogs.filter((log) => {
      const normQ = (log.question || '').normalize('NFC').toLowerCase();
      const normA = (log.answer || '').normalize('NFC').toLowerCase();
      const normU = (log.username || '').normalize('NFC').toLowerCase();
      const normSearch = searchTerm.normalize('NFC').toLowerCase();

      const matchSearch = 
        normQ.includes(normSearch) || 
        normA.includes(normSearch) || 
        normU.includes(normSearch);

      const matchSentiment = sentimentFilter === 'all' || (log.sentiment || 'neutral') === sentimentFilter;

      return matchSearch && matchSentiment;
    });
  }, [localLogs, searchTerm, sentimentFilter]);

  return (
    <div className="space-y-6">
      {/* Real-time Sentiment Analytics Dashboard */}
      <div className="bg-[#2c1609] border-2 border-amber-600/40 rounded-3xl p-5 text-stone-100 shadow-2xl relative overflow-hidden">
        {/* Decorative Top Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 pb-3 border-b border-amber-900/30">
          <div>
            <h4 className="font-historical text-base text-amber-100 flex items-center gap-2">
              <span>📊</span> {tLocal.stats_title}
            </h4>
            {isLive && (
              <p className="text-[10px] text-green-400 font-sans mt-0.5 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                {tLocal.live_monitoring}
              </p>
            )}
          </div>

          {/* Action Panel */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-historical font-bold uppercase transition-all active:scale-95 border ${
                isLive 
                  ? 'bg-green-900/20 border-green-500 text-green-400' 
                  : 'bg-amber-600 border-amber-500 text-white hover:bg-amber-500'
              }`}
            >
              {isLive ? <Square size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
              <span>{isLive ? tLocal.live_stop : tLocal.live_start}</span>
            </button>
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-2 bg-stone-900/60 hover:bg-stone-900 border border-amber-900/30 rounded-xl text-amber-400/80 hover:text-white transition-colors active:scale-95 disabled:opacity-50"
              title="Làm mới thủ công"
            >
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Total */}
          <div className="bg-stone-950/40 border border-amber-900/20 rounded-2xl p-3 text-center">
            <div className="text-[9px] font-historical text-amber-500/70 uppercase tracking-wider">{tLocal.total_chats}</div>
            <div className="text-xl font-historical font-black text-amber-100 mt-1">{stats.total}</div>
          </div>

          {/* Positive */}
          <div className="bg-green-950/20 border border-green-900/30 rounded-2xl p-3 text-center flex flex-col items-center justify-center">
            <Smile size={18} className="text-green-500" />
            <div className="text-[9px] font-historical text-green-400/70 uppercase tracking-wider mt-1">Hài lòng</div>
            <div className="text-lg font-historical font-black text-green-400 mt-0.5">{stats.positive}</div>
          </div>

          {/* Neutral */}
          <div className="bg-stone-950/40 border border-stone-900/30 rounded-2xl p-3 text-center flex flex-col items-center justify-center">
            <Meh size={18} className="text-stone-400" />
            <div className="text-[9px] font-historical text-stone-400 uppercase tracking-wider mt-1">Bình thường</div>
            <div className="text-lg font-historical font-black text-stone-300 mt-0.5">{stats.neutral}</div>
          </div>

          {/* Inquisitive */}
          <div className="bg-blue-950/20 border border-blue-900/30 rounded-2xl p-3 text-center flex flex-col items-center justify-center">
            <HelpCircle size={18} className="text-blue-400" />
            <div className="text-[9px] font-historical text-blue-400 uppercase tracking-wider mt-1">Tầm sư</div>
            <div className="text-lg font-historical font-black text-blue-400 mt-0.5">{stats.inquisitive}</div>
          </div>

          {/* Frustrated */}
          <div className="bg-red-950/20 border border-red-900/30 rounded-2xl p-3 text-center flex flex-col items-center justify-center">
            <Frown size={18} className="text-red-500" />
            <div className="text-[9px] font-historical text-red-400/80 uppercase tracking-wider mt-1">Bực bội</div>
            <div className="text-lg font-historical font-black text-red-400 mt-0.5">{stats.frustrated}</div>
          </div>

          {/* Jailbreak */}
          <div className="bg-yellow-950/20 border border-yellow-900/30 rounded-2xl p-3 text-center flex flex-col items-center justify-center animate-pulse">
            <AlertTriangle size={18} className="text-yellow-500" />
            <div className="text-[9px] font-historical text-yellow-500 uppercase tracking-wider mt-1">Phá hoại</div>
            <div className="text-lg font-historical font-black text-yellow-400 mt-0.5">{stats.jailbreak}</div>
          </div>
        </div>
      </div>

      {/* Main Table Paper */}
      <div className="paper-texture scroll-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in pb-10">
        {/* Header & Filter Row */}
        <div className="px-6 py-5 bg-[#451a03]/5 border-b border-amber-500/20 flex flex-col md:flex-row justify-between items-center gap-3">
          <h3 className="font-historical text-base text-[#7f1d1d] flex items-center gap-2">
            <span>📜</span> {tLocal.title}
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-amber-800/40">
                <Search size={14} />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={tLocal.search_placeholder}
                className="w-full bg-white/60 border border-amber-900/20 rounded-xl pl-9 pr-3 py-1.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-600 focus:bg-white"
              />
            </div>

            {/* Sentiment dropdown */}
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="w-full sm:w-auto bg-white/60 border border-amber-900/20 rounded-xl px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-amber-600 focus:bg-white"
            >
              <option value="all">{tLocal.filter_all}</option>
              <option value="positive">😊 {tLocal.filter_positive}</option>
              <option value="neutral">😐 {tLocal.filter_neutral}</option>
              <option value="inquisitive">🤔 {tLocal.filter_inquisitive}</option>
              <option value="frustrated">😡 {tLocal.filter_frustrated}</option>
              <option value="jailbreak">🚨 {tLocal.filter_jailbreak}</option>
            </select>
          </div>
        </div>

        {/* Table logs */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#451a03]/20 text-[#7f1d1d] uppercase text-[10px] font-black tracking-widest border-b border-amber-800/10">
              <tr>
                <th className="px-6 py-5 text-left font-historical">{tLocal.col_time}</th>
                <th className="px-6 py-5 text-left font-historical">{tLocal.col_user}</th>
                <th className="px-6 py-5 text-left font-historical">{tLocal.col_question}</th>
                <th className="px-6 py-5 text-center font-historical">{tLocal.col_sentiment}</th>
                <th className="px-6 py-5 text-right font-historical">{tLocal.col_fee}</th>
                <th className="px-6 py-5 text-center font-historical">{tLocal.col_action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#b45309]/10">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20 italic text-amber-900/60 font-serif">
                    {tLocal.empty_records}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-amber-100/30 transition-colors">
                    {/* Thời Gian */}
                    <td className="px-6 py-4 text-stone-500 text-xs font-mono whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-amber-700/60" />
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </td>

                    {/* Người Hỏi */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <AvatarImage src={log.picture_url} alt={log.username} />
                        <span className="font-historical font-black text-[#7f1d1d]">{log.username || tLocal.anonymous}</span>
                      </div>
                    </td>

                    {/* Câu Hỏi */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 max-w-[280px] truncate text-stone-700 font-sans italic text-xs" title={log.question?.normalize('NFC')}>
                        <MessageSquare size={12} className="text-[#b45309]/50 shrink-0" />
                        <span>"{log.question?.normalize('NFC')}"</span>
                      </div>
                    </td>

                    {/* Sentiment Stamp Badge */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {log.sentiment === 'positive' && (
                        <span className="inline-block px-2.5 py-1 bg-green-50 border-2 border-green-600 text-green-700 rounded-sm text-[9px] font-black uppercase tracking-wider shadow-sm font-historical transform rotate-[-1deg] border-double">
                          😊 {language === 'vi' ? 'Hài lòng' : 'Satisfied'}
                        </span>
                      )}
                      {log.sentiment === 'frustrated' && (
                        <span className="inline-block px-2.5 py-1 bg-red-50 border-2 border-red-600 text-red-700 rounded-sm text-[9px] font-black uppercase tracking-wider shadow-sm font-historical transform rotate-[1deg] border-double animate-bounce">
                          😡 Bực bội
                        </span>
                      )}
                      {log.sentiment === 'inquisitive' && (
                        <span className="inline-block px-2.5 py-1 bg-blue-50 border border-blue-500 text-blue-700 rounded-sm text-[9px] font-black uppercase tracking-wider font-historical">
                          🤔 Tầm sư
                        </span>
                      )}
                      {log.sentiment === 'jailbreak' && (
                        <span className="inline-block px-2.5 py-1 bg-yellow-50 border-2 border-yellow-600 text-yellow-800 rounded-sm text-[9px] font-black uppercase tracking-wider shadow-sm font-historical transform rotate-[-2deg] border-double animate-pulse">
                          🚨 Phá hoại
                        </span>
                      )}
                      {(log.sentiment === 'neutral' || !log.sentiment) && (
                        <span className="inline-block px-2.5 py-1 bg-stone-100 border border-stone-400 text-stone-500 rounded-sm text-[9px] font-black uppercase tracking-wider font-historical">
                          😐 Bình thường
                        </span>
                      )}
                      {log.sentiment_score !== undefined && log.sentiment_score !== 0 && (
                        <span className="text-[9px] text-stone-400 font-mono ml-1.5">
                          ({log.sentiment_score > 0 ? '+' : ''}{log.sentiment_score.toFixed(1)})
                        </span>
                      )}
                    </td>

                    {/* Phí charged */}
                    <td className="px-6 py-4 text-right">
                      <span className="font-historical font-black text-red-700 text-base">
                        -{log.tokens_charged?.toLocaleString() || 0} {tLocal.tokens_unit}
                      </span>
                    </td>

                    {/* Chi tiết */}
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => onSelectChat(log)} 
                        className="text-[10px] font-bold uppercase bg-amber-50 hover:bg-[#7f1d1d] hover:text-amber-100 text-[#b45309] border border-amber-300/60 px-3.5 py-1.5 rounded-lg transition-all hover-lift active:scale-95 flex items-center gap-1 mx-auto"
                      >
                        {tLocal.btn_open} <ArrowRight size={10} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ChatLogsTab;
