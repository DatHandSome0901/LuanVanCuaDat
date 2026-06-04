import React, { useState, useEffect, useRef } from 'react';
import { api, API_ROOT } from '../../api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLanguage } from '../../contexts/LanguageContext';

interface SupportRoom {
  id: number;
  user_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  username: string;
  email: string;
  picture_url?: string;
  last_message?: string;
  last_message_time?: string;
}

interface Message {
  id: number;
  room_id: number;
  sender_type: 'user' | 'admin' | 'ai';
  sender_id?: number;
  message: string;
  created_at: string;
  username?: string;
  picture_url?: string;
}

const SupportTab: React.FC = () => {
  const { language } = useLanguage();

  const txt = {
    vi: {
      title: '💬 Phòng Hỗ Trợ Đang Mở',
      rooms_count: '{count} phòng',
      loading_rooms: 'Đang tải danh sách phòng...',
      empty_rooms: 'Không có sĩ tử nào cần hỗ trợ.',
      room_id: 'ID Phòng',
      initiated_at: 'Khởi tạo lúc',
      active_status: '🟢 Đang Đàm Đạo',
      sender_you: 'Bạn',
      sender_ai: 'AI Trợ lý',
      input_placeholder: 'Nhập câu trả lời cho sĩ tử...',
      btn_send: 'Gửi phản hồi',
      empty_title: 'Hệ Thống Trò Chuyện Đàm Đạo',
      empty_desc: 'Kính mời các quan chọn phòng của sĩ tử ở danh sách bên trái để đàm thoại.',
      send_error: 'Lỗi khi gửi tin nhắn'
    },
    en: {
      title: '💬 Open Support Rooms',
      rooms_count: '{count} rooms',
      loading_rooms: 'Loading support rooms...',
      empty_rooms: 'No scholars need support.',
      room_id: 'Room ID',
      initiated_at: 'Initiated at',
      active_status: '🟢 Discussing',
      sender_you: 'You',
      sender_ai: 'AI Assistant',
      input_placeholder: 'Type answer for scholar...',
      btn_send: 'Send Response',
      empty_title: 'Support Chat System',
      empty_desc: 'Please select a scholar\'s room from the list on the left to start conversing.',
      send_error: 'Error sending message'
    }
  }[language === 'en' ? 'en' : 'vi'];

  const [rooms, setRooms] = useState<SupportRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<SupportRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch rooms list initially & start polling rooms list
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.adminGetSupportRooms();
        setRooms(res.rooms || []);
      } catch (err: any) {
        console.error('Error fetching support rooms:', err);
      } finally {
        setIsLoadingRooms(false);
      }
    };

    fetchRooms();
    const interval = setInterval(fetchRooms, 5000);

    return () => clearInterval(interval);
  }, []);

  // Poll messages for selected room
  useEffect(() => {
    if (!selectedRoom) {
      setMessages([]);
      return;
    }

    let isSubscribed = true;

    const fetchMessages = async () => {
      try {
        const res = await api.getSupportMessages(selectedRoom.id);
        if (isSubscribed) {
          setMessages(res.messages || []);
        }
      } catch (err: any) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [selectedRoom?.id]);

  // Auto-scroll messages list
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    const text = inputVal.trim();
    if (!text || !selectedRoom) return;

    setInputVal('');
    setIsSending(true);

    // Optimistic local add
    const tempMsg: Message = {
      id: Date.now(),
      room_id: selectedRoom.id,
      sender_type: 'admin',
      message: text,
      created_at: new Date().toISOString(),
      username: txt.sender_you
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await api.adminSendSupportMessage(selectedRoom.id, text);
      const res = await api.getSupportMessages(selectedRoom.id);
      setMessages(res.messages || []);
    } catch (err: any) {
      toast.error(err.message || txt.send_error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 overflow-hidden bg-white rounded-3xl border border-stone-250/20 p-4">
      {/* Rooms Panel */}
      <div className="w-80 border-r border-stone-200/60 flex flex-col min-w-0 pr-4 shrink-0 h-full">
        <div className="pb-3 border-b border-stone-150 flex items-center justify-between shrink-0">
          <h3 className="font-serif font-bold text-amber-950 text-base">
            {txt.title}
          </h3>
          <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full text-[10px]">
            {txt.rooms_count.replace('{count}', String(rooms.length))}
          </span>
        </div>

        {/* Room List scrollable */}
        <div className="flex-1 overflow-y-auto mt-3 space-y-2 chatgpt-scrollbar pr-1">
          {isLoadingRooms ? (
            <div className="text-center py-8 text-stone-400 text-xs font-sans">
              {txt.loading_rooms}
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-8 text-stone-400 text-xs font-sans">
              {txt.empty_rooms}
            </div>
          ) : (
            rooms.map((r) => {
              const isSelected = selectedRoom?.id === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRoom(r)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-600 to-red-800 border-transparent text-amber-50 shadow-md scale-[0.98]'
                      : 'bg-stone-50 border-stone-150 text-stone-700 hover:bg-stone-100 hover:border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold truncate pr-2 ${isSelected ? 'text-white' : 'text-stone-900'}`}>
                      {r.username}
                    </span>
                    <span className={`text-[8px] shrink-0 font-bold ${isSelected ? 'text-amber-200' : 'text-stone-400'}`}>
                      {r.last_message_time
                        ? new Date(r.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : ''}
                    </span>
                  </div>
                  {r.email && (
                    <span className={`text-[9px] truncate block ${isSelected ? 'text-amber-100/70' : 'text-stone-400'}`}>
                      {r.email}
                    </span>
                  )}
                  {r.last_message && (
                    <p className={`text-[10px] truncate italic ${isSelected ? 'text-white/80' : 'text-stone-500 font-medium'}`}>
                      {r.last_message}
                    </p>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area Panel */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {selectedRoom ? (
          <>
            {/* Header info */}
            <div className="px-4 py-3 bg-stone-50 border border-stone-200/50 rounded-2xl flex items-center justify-between shrink-0 mb-3">
              <div>
                <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <span>👤</span> {selectedRoom.username} ({selectedRoom.email})
                </h4>
                <p className="text-[9px] text-stone-400 font-semibold mt-0.5">
                  {txt.room_id}: #{selectedRoom.id} • {txt.initiated_at}: {new Date(selectedRoom.created_at).toLocaleString()}
                </p>
              </div>
              <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 border border-amber-600/10 rounded-lg">
                {txt.active_status}
              </span>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 border border-stone-150 rounded-2xl bg-stone-50/20 space-y-3 chatgpt-scrollbar min-h-0">
              {messages.map((m) => {
                const isUser = m.sender_type === 'user';
                const isAi = m.sender_type === 'ai';
                const isSelf = m.sender_type === 'admin';
                return (
                  <div key={m.id} className={`flex items-start gap-2.5 ${isSelf ? 'justify-end' : 'justify-start'}`}>
                    {!isSelf && (
                      isAi ? (
                        <img 
                          src="/images/su_viet_bot.jpg" 
                          alt="AI Assistant" 
                          className="w-7 h-7 rounded-full object-cover border border-amber-500/30 shadow-md shrink-0"
                        />
                      ) : (
                        m.picture_url ? (
                          <img 
                            src={m.picture_url.startsWith('/') ? `${API_ROOT}${m.picture_url}` : m.picture_url} 
                            alt="User" 
                            className="w-7 h-7 rounded-full object-cover border border-amber-900/20 shadow-sm shrink-0" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-[#7f1d1d] font-sans font-bold text-[10px] shrink-0 border border-amber-900/20 shadow-inner">
                            {selectedRoom?.username ? selectedRoom.username.slice(0, 2).toUpperCase() : 'GD'}
                          </div>
                        )
                      )
                    )}
                    <div className={`max-w-[70%] flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[9px] font-bold text-stone-500">
                          {isSelf ? txt.sender_you : (isAi ? txt.sender_ai : selectedRoom.username)}
                        </span>
                        <span className="text-[8px] text-stone-400">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed shadow-sm font-medium ${
                        isSelf 
                          ? 'bg-gradient-to-r from-amber-600 to-red-800 text-amber-50 rounded-tr-none font-sans' 
                          : (isAi 
                              ? 'bg-amber-100/60 border border-amber-500/20 text-amber-950 rounded-tl-none font-sans' 
                              : 'bg-white border border-stone-200 text-stone-850 rounded-tl-none font-sans')
                      }`}>
                        {isSelf ? (
                          m.message
                        ) : (
                          <div className="prose prose-stone prose-sm max-w-none text-inherit leading-relaxed font-sans">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {m.message}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </div>
                    {isSelf && (
                      m.picture_url ? (
                        <img 
                          src={m.picture_url.startsWith('/') ? `${API_ROOT}${m.picture_url}` : m.picture_url} 
                          alt="Admin" 
                          className="w-7 h-7 rounded-full object-cover border border-amber-900/20 shadow-sm shrink-0" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-[#7f1d1d] font-sans font-bold text-[10px] shrink-0 border border-amber-900/20 shadow-inner">
                          {m.username ? m.username.slice(0, 2).toUpperCase() : 'AD'}
                        </div>
                      )
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="mt-3 flex items-center gap-2 shrink-0">
              <input
                type="text"
                disabled={isSending}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
                placeholder={txt.input_placeholder}
                className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-amber-500 transition-all"
              />
              <button
                disabled={isSending || !inputVal.trim()}
                onClick={handleSend}
                className="px-5 py-3 bg-gradient-to-r from-amber-600 to-red-800 hover:from-amber-700 hover:to-red-900 text-amber-50 text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 shrink-0"
              >
                {txt.btn_send}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-stone-400 font-sans border border-stone-150 rounded-2xl bg-stone-50/10">
            <span className="text-4xl mb-3">💬</span>
            <h4 className="font-bold text-amber-950 text-sm mb-1 font-sans">{txt.empty_title}</h4>
            <p className="text-xs text-stone-500 font-sans">{txt.empty_desc}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportTab;
