
import React, { useState, useRef, useEffect } from 'react';
import { User, ChatMessage } from '../types';
import { api, API_ROOT } from '../api';
import AuthModal from './AuthModal';
import toast from 'react-hot-toast';
import { confirmDestructive } from '../utils/swal';

import ChatMessageItem from './chat/ChatMessageItem';
import ChatInput from './chat/ChatInput';
import EmptyChatState from './chat/EmptyChatState';
import SourceModal from './chat/SourceModal';

interface ChatViewProps {
  user: User | null;
  onAuthRequired: () => void;
  history: ChatMessage[];
  setHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onBalanceUpdate: (balance: number) => void;
  siteConfig?: { logo_url: string; site_title: string };
}

const ChatView: React.FC<ChatViewProps> = ({
  user,
  history,
  setHistory,
  onBalanceUpdate,
  siteConfig,
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dots, setDots] = useState('');
  useEffect(() => {
  if (!isLoading) return;

  const interval = setInterval(() => {
    setDots((prev) => {
      if (prev === '...') return '';
      return prev + '.';
    });
  }, 400);

  return () => clearInterval(interval);
}, [isLoading]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | import('../types').SourceInfo | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // ===============================
  // LOAD CONVERSATION WHEN PAGE LOAD
  // ===============================

  useEffect(() => {
    const id = localStorage.getItem('conversation_id');

    if (id) {
      const convId = Number(id);
      setConversationId(convId);
      loadMessages(convId);
    }
  }, []);

  // ===============================
  // LOAD MESSAGES
  // ===============================

  const loadMessages = async (convId: number) => {
    try {
      const res = await fetch(`${API_ROOT}/api/v1/messages/${convId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      const data = await res.json();

      const messages = data.map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.created_at),
        sources: m.sources || [],
      }));

      setHistory(messages);
    } catch (err) {
      console.error('loadMessages error', err);
    }
  };

  // ===============================
  // CREATE CONVERSATION
  // ===============================

  const createConversation = async () => {
    const res = await fetch(`${API_ROOT}/api/v1/new_chat`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });

    const data = await res.json();

    const convId = data.conversation_id;

    localStorage.setItem('conversation_id', String(convId));
    setConversationId(convId);

    window.dispatchEvent(new Event('reload_conversations'));

    return convId;
  };

  // ===============================
  // NEW CHAT EVENT
  // ===============================

  useEffect(() => {
    const handler = () => {
      localStorage.removeItem('conversation_id');
      setConversationId(null);
       setInput("") // 🔥 thêm dòng này
      setHistory([]);
    };

    window.addEventListener('new_chat', handler);

    return () => window.removeEventListener('new_chat', handler);
  }, []);

  // ===============================
  // LOAD CONVERSATION FROM SIDEBAR
  // ===============================

  useEffect(() => {
    const handler = () => {
      const id = localStorage.getItem('conversation_id');

      if (id) {
        const convId = Number(id);
        setConversationId(convId);
        loadMessages(convId);
      }
    };

    window.addEventListener('load_conversation', handler);

    return () =>
      window.removeEventListener('load_conversation', handler);
  }, []);

  useEffect(()=>{

  const handler = ()=>{
    setShowAuthModal(true)
  }

  window.addEventListener("open_login",handler)

  return ()=>window.removeEventListener("open_login",handler)

},[])


  // ===============================
  // SEND MESSAGE
  // ===============================

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!input.trim() || isLoading) return;

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setHistory((prev) => [...prev, userMsg]);

    const currentInput = input;

    setInput('');
    setIsLoading(true);

    try {
      let convId = conversationId;

      if (!convId) {
        convId = await createConversation();
      }

      const response = await fetch(`${API_ROOT}/api/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          question: currentInput,
          conversation_id: convId,
        }),
      });

      const data = await response.json();

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        timestamp: new Date(),
        tokens_charged: data.tokens_charged,
        sources: data.sources,
      };

      setHistory((prev) => [...prev, botMsg]);

      onBalanceUpdate(data.user_token_balance);
    } catch (error: any) {
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Cáo lỗi: ${error.message || 'Hệ thống lỗi.'}`,
        timestamp: new Date(),
      };

      setHistory((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // ===============================
  // AUTO SCROLL
  // ===============================

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop =
        scrollRef.current.scrollHeight;
    }
  }, [history, isLoading]);

  // Detection
  const isNative = (window as any).Capacitor?.isNativePlatform?.() || false;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
       
      {/* HEADER */}
      {isNative ? (
        <header className="h-16 flex items-center justify-between px-6 glass-nav border-b border-white/20 sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-800 rounded-lg flex items-center justify-center text-white font-serif text-lg shadow-lg shadow-red-900/20 italic">
               {siteConfig?.site_title?.charAt(0) || '史'}
            </div>
            <h2 className="font-serif text-xl font-black text-red-950 tracking-tight leading-none">
              {siteConfig?.site_title || 'Chatbot Lịch sử'}
            </h2>
          </div>

          {user && (
            <div className="px-3 py-1 bg-red-800/10 rounded-full border border-red-800/20">
               <span className="text-[10px] font-black text-red-800 uppercase tracking-widest">
                  {(user.token_balance ?? 0).toFixed(2)} Tokens
               </span>
            </div>
          )}
        </header>
      ) : (
        <header className="h-16 border-b border-stone-200 bg-white flex items-center justify-between px-4 md:px-8">
          <h2 className="font-serif text-lg font-bold text-red-950">
            {siteConfig?.site_title || 'Chatbot Lịch sử'}
          </h2>

          {user && (
            <div className="text-red-900 font-medium">
              {(user.token_balance ?? 0).toFixed(2)} Tokens
            </div>
          )}
        </header>
      )}

      {/* MESSAGES */}

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
      >
        <div className="max-w-4xl mx-auto w-full p-6 space-y-6">
          {history.length === 0 && !isLoading && (
            <EmptyChatState
              onSuggestClick={(q) => setInput(q)}
            />
          )}

          {history.map((msg) => (
            <ChatMessageItem
              key={msg.id}
              msg={msg}
              userAvatar={user?.picture_url}
              botAvatar={
                siteConfig?.logo_url
                  ? siteConfig.logo_url.startsWith("/")
                    ? `${API_ROOT}${siteConfig.logo_url}`
                    : siteConfig.logo_url
                  : undefined
              }
              onSourceClick={setSelectedSource}
            />
          ))}

          {isLoading && (
            <div className="bg-white border border-stone-100 rounded-3xl p-5 text-stone-400 font-medium shadow-sm animate-pulse flex items-center gap-3">
              <div className="w-2 h-2 bg-red-800 rounded-full animate-bounce" />
              Đang tra cứu sử liệu {dots}
            </div>
          )}
        </div>
      </div>

      {/* INPUT */}

      <ChatInput
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        onSubmit={handleSubmit}
      />

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={(userData, token) => {
            setShowAuthModal(false);
            localStorage.setItem('access_token', token);
            window.location.reload();
          }}
        />
      )}

      {selectedSource && (
        <SourceModal 
          source={selectedSource} 
          onClose={() => setSelectedSource(null)} 
        />
      )}
    </div>

    
  );
  
};



export default ChatView;