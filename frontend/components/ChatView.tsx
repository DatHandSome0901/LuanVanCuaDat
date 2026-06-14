
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { User, ChatMessage, ChatResponse, SiteConfig } from '../types';
import { api, API_ROOT } from '../api';
import AuthModal from './AuthModal';
import toast from 'react-hot-toast';
import { confirmDestructive } from '../utils/swal';

import ChatMessageItem from './chat/ChatMessageItem';
import ChatInput from './chat/ChatInput';
import EmptyChatState from './chat/EmptyChatState';
import SourceModal from './chat/SourceModal';
import SecureImage from './SecureImage';
import { useLanguage } from '../contexts/LanguageContext';

interface ChatViewProps {
  user: User | null;
  onAuthRequired: () => void;
  history: ChatMessage[];
  setHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onBalanceUpdate: (balance: number) => void;
  siteConfig?: SiteConfig;
  isSidebarOpen?: boolean;
}

const ChatView: React.FC<ChatViewProps> = ({
  user,
  history,
  setHistory,
  onBalanceUpdate,
  siteConfig,
  isSidebarOpen,
}) => {
  const { t } = useLanguage();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreamingActive, setIsStreamingActive] = useState(false); // true while SSE tokens are flowing
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const currentlySpeakingIdRef = useRef<string | null>(null);
  const setCurrentlySpeaking = useCallback((id: string | null) => {
    currentlySpeakingIdRef.current = id;
    setCurrentlySpeakingId(id);
  }, []);

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
  const isSubmittingRef = useRef(false);
  const lastScrollTimeRef = useRef(0);

  const scrollToBottom = useCallback((force = false) => {
    const now = Date.now();
    if (!force && now - lastScrollTimeRef.current < 100) {
      return;
    }
    lastScrollTimeRef.current = now;
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        // Scroll only if forced (new message) or if the user is already close to the bottom
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
        
        if (force || isNearBottom) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }
    });
  }, []);

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

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      window.speechSynthesis.getVoices();
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      };
    }
  }, []);



  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setCurrentlySpeaking(null);
  }, [setCurrentlySpeaking]);

  const speakText = useCallback((id: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !window.speechSynthesis) {
      toast.error('Trình duyệt của bạn không hỗ trợ đọc văn bản (TTS).');
      return;
    }

    if (currentlySpeakingIdRef.current === id) {
      window.speechSynthesis.cancel();
      setCurrentlySpeaking(null);
      return;
    }

    // Clean markdown characters for cleaner reading
    const cleanText = text
      .replace(/```[\s\S]*?```/g, '') // remove code blocks
      .replace(/`([^`]+)`/g, '$1')     // remove inline code
      .replace(/[*#_~]/g, '')          // remove markdown formatting
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // remove markdown links, keeping text
      .replace(/<\/?[^>]+(>|$)/g, ""); // remove HTML tags

    if (!cleanText.trim()) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'vi-VN';

    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang.startsWith('vi'));
    if (viVoice) {
      utterance.voice = viVoice;
    }

    utterance.onend = () => {
      setCurrentlySpeaking(null);
    };

    utterance.onerror = (e) => {
      console.error('TTS error:', e);
      setCurrentlySpeaking(null);
    };

    const isSpeakingActive = window.speechSynthesis.speaking || window.speechSynthesis.pending;

    if (isSpeakingActive) {
      window.speechSynthesis.cancel();
      setCurrentlySpeaking(null);
      // Use a small timeout to avoid Chrome/Edge speechSynthesis cancel-speak bug
      setTimeout(() => {
        setCurrentlySpeaking(id);
        window.speechSynthesis.speak(utterance);
      }, 100);
    } else {
      // Direct call preserves user gesture activation perfectly!
      setCurrentlySpeaking(id);
      window.speechSynthesis.speak(utterance);
    }
  }, [setCurrentlySpeaking]);

  // ===============================
  // LOAD MESSAGES
  // ===============================

  const loadMessages = async (convId: number) => {
    try {
      const res = await fetch(`${API_ROOT}/api/v1/messages/${convId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'ngrok-skip-browser-warning': 'true' // 🔥 Thêm chìa khóa
        },
      });

      const data = await res.json();

      const messages = data.map((m: any) => ({
        id: m.id,
        role: m.role,
        content: (m.content || '').normalize('NFC'),
        timestamp: new Date(m.created_at),
        sources: (m.sources || []).map((s: any) => ({
          ...s,
          filename: (s.filename || '').normalize('NFC'),
          content: (s.content || '').normalize('NFC'),
        })),
        rating: m.rating || 0,
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
        'ngrok-skip-browser-warning': 'true' // 🔥 Thêm chìa khóa
      },
    });

    const data = await res.json();

    const convId = data.conversation_id;

    localStorage.setItem('conversation_id', String(convId));
    setConversationId(convId);

    window.dispatchEvent(new Event('reload_conversations'));
    window.dispatchEvent(new Event('conversation_changed'));

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


  const pollChatJob = async (jobId: string): Promise<ChatResponse> => {
    const maxAttempts = 90;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, attempt < 5 ? 1000 : 2000));

      const job = await api.getChatJobStatus(jobId);
      if (job.status === 'completed' && job.result) {
        return job.result;
      }

      if (job.status === 'failed') {
        throw new Error(job.error || 'Tra cứu web thất bại.');
      }
    }

    throw new Error('Tra cứu web quá thời gian chờ. Vui lòng thử lại sau.');
  };


  // ===============================
  // SEND MESSAGE
  // ===============================

  const handleSubmit = async (e?: React.FormEvent, questionOverride?: string) => {
    if (e) e.preventDefault();

    const questionToSend = questionOverride ?? input;

    if (!questionToSend.trim() || isLoading || isSubmittingRef.current) return;

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // Stop any ongoing speech when user submits a new message
    stopSpeaking();

    isSubmittingRef.current = true;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: questionToSend,
      timestamp: new Date(),
    };

    setHistory((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Streaming message placeholder
    const streamingId = (Date.now() + 1).toString();

    try {
      let convId = conversationId;
      if (!convId) {
        convId = await createConversation();
      }

      // Add an empty streaming message immediately so the cursor blinks right away
      const placeholderMsg: ChatMessage = {
        id: streamingId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        animate: false,
        isStreaming: true, // show blinking cursor while streaming
      };
      setHistory((prev) => [...prev, placeholderMsg]);
      setIsStreamingActive(true); // hide the 'Đang tra cứu...' spinner

      const response = await fetch(`${API_ROOT}/api/v1/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          question: questionToSend,
          conversation_id: convId,
          language_instruction: t.llm_language_instruction,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Không thể kết nối streaming.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      // ── Display Queue: tokens arrive fast, we drain slowly for smooth effect ──
      // receivedBuffer = raw text arrived from SSE (not yet shown)
      // displayedSoFar = text already shown to user
      let receivedBuffer = '';
      let displayedSoFar  = '';
      let streamDone      = false; // true when SSE [DONE] received
      let doneMetaRef: any = null; // store [DONE] metadata to apply after queue drains

      // Animation loop — runs every frame, drains receivedBuffer char by char
      let animFrameId: number | null = null;
      let lastTickTime = 0;

      const CHAR_DELAY_MS = 30;   // ms between each character group update

      const drainQueue = (timestamp: number) => {
        const elapsed = timestamp - lastTickTime;

        // Calculate backlog
        const backlog = receivedBuffer.length - displayedSoFar.length;
        
        let charsPerTick = 1;
        if (backlog > 300) {
          charsPerTick = Math.min(backlog, Math.ceil(backlog / 6));
        } else if (backlog > 100) {
          charsPerTick = Math.min(backlog, 8);
        } else if (backlog > 30) {
          charsPerTick = 4;
        } else if (backlog > 10) {
          charsPerTick = 2;
        } else {
          charsPerTick = 1;
        }

        if (elapsed >= CHAR_DELAY_MS && backlog > 0) {
          lastTickTime = timestamp;
          const nextChunk = receivedBuffer.slice(
            displayedSoFar.length,
            displayedSoFar.length + charsPerTick,
          );
          displayedSoFar += nextChunk;

          setHistory((prev) =>
            prev.map((m) =>
              m.id === streamingId ? { ...m, content: displayedSoFar } : m,
            ),
          );
          scrollToBottom();
        }

        // Keep looping while there's still content to drain OR stream isn't done yet
        if (!streamDone || displayedSoFar.length < receivedBuffer.length) {
          animFrameId = requestAnimationFrame(drainQueue);
        } else {
          // Queue fully drained + stream finished → apply metadata
          animFrameId = null;
          if (doneMetaRef) {
            applyDoneMeta(doneMetaRef);
          }
          scrollToBottom(false);
        }
      };

      // Start the animation loop immediately
      animFrameId = requestAnimationFrame(drainQueue);

      // Apply [DONE] metadata — only called after queue is fully drained
      const applyDoneMeta = (meta: any) => {
        const finalMsgId = String(meta.message_id || streamingId);
        if (meta._isWebFallback) {
          // Web-fallback path: content already set by pollChatJob
          onBalanceUpdate(meta.user_token_balance);
        } else {
          setHistory((prev) =>
            prev.map((m) =>
              m.id === streamingId
                ? {
                    ...m,
                    id: finalMsgId,
                    content: meta.answer !== undefined ? meta.answer : m.content,
                    tokens_charged: meta.tokens_charged,
                    sources: meta.sources || [],
                    related_questions: meta.related_questions || [],
                    rating: 0,
                    isStreaming: false,
                  }
                : m,
            ),
          );
          if (meta.user_token_balance !== undefined) {
            onBalanceUpdate(meta.user_token_balance);
          }
        }
        window.dispatchEvent(new Event('reload_conversations'));

      };

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE events are separated by double newlines
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';

        for (const event of events) {
          const line = event.trim();
          if (!line.startsWith('data: ')) continue;

          const payload = line.slice('data: '.length);

          if (payload.startsWith('[DONE]')) {
            try {
              const meta = JSON.parse(payload.slice('[DONE] '.length));

              if (meta.status === 'queued' && meta.job_id) {
                // Web-fallback: poll until done, then stream the real answer
                const finalData = await pollChatJob(meta.job_id);

                // ── RESET display state so we start fresh ──
                // displayedSoFar still holds the old placeholder text;
                // reset it to '' so animation loop re-drains from char 0
                displayedSoFar = '';
                receivedBuffer = finalData.answer;

                // Clear the content in history & keep cursor blinking
                setHistory((prev) =>
                  prev.map((m) =>
                    m.id === streamingId
                      ? { ...m, content: '', isStreaming: true }
                      : m,
                  ),
                );

                // doneMetaRef carries the full metadata applied AFTER drain finishes
                doneMetaRef = {
                  _isWebFallback: false, // use normal path so sources/tokens all appear
                  message_id: finalData.message_id,
                  tokens_charged: finalData.tokens_charged,
                  user_token_balance: finalData.user_token_balance,
                  sources: finalData.sources || [],
                  related_questions: finalData.related_questions || [],
                };
              } else {
                doneMetaRef = meta;
              }
            } catch (parseErr) {
              console.error('Failed to parse [DONE] metadata', parseErr);
            }
            streamDone = true;
            break;
          }


          if (payload.startsWith('[ERROR]')) {
            streamDone = true;
            if (animFrameId !== null) {
              cancelAnimationFrame(animFrameId);
              animFrameId = null;
            }
            try {
              const errData = JSON.parse(payload.slice('[ERROR] '.length));
              setHistory((prev) =>
                prev.map((m) =>
                  m.id === streamingId
                    ? { ...m, content: `Cáo lỗi: ${errData.error || 'Hệ thống lỗi.'}`, isStreaming: false }
                    : m,
                ),
              );
            } catch {
              setHistory((prev) =>
                prev.map((m) =>
                  m.id === streamingId ? { ...m, content: 'Cáo lỗi: Hệ thống lỗi.', isStreaming: false } : m,
                ),
              );
            }
            break;
          }

          // Normal token — push into receivedBuffer (animation loop will drain it)
          try {
            const token = JSON.parse(payload);
            receivedBuffer += token;
          } catch {
            // Ignore malformed chunk
          }
        }
      }

      // If animation loop is still running when reader finishes (shouldn't normally happen
      // without streamDone being set), mark done so it can finish
      if (!streamDone) {
        streamDone = true;
      }

    } catch (error: any) {
      setHistory((prev) =>
        prev.map((m) =>
          m.id === streamingId
            ? { ...m, content: `Cáo lỗi: ${error.message || 'Hệ thống lỗi.'}`, isStreaming: false }
            : m,
        ),
      );
    } finally {
      isSubmittingRef.current = false;
      setIsLoading(false);
      setIsStreamingActive(false);
    }
  };



  // ===============================
  // AUTO SCROLL
  // ===============================

  useEffect(() => {
    // 🔥 Chỉ tự động cuộn xuống nếu có tin nhắn hoặc đang tải câu trả lời
    if (scrollRef.current && (history.length > 0 || isLoading)) {
      scrollToBottom(true);
    }
  }, [history.length, isLoading, scrollToBottom]);

  // Detection
  const isNative = (window as any).Capacitor?.isNativePlatform?.() || false;

  const handleRateClick = async (message_id: string | number, rating: number) => {
    try {
      const res = await api.rateMessage(Number(message_id), rating);
      setHistory(prev => prev.map(m => m.id === message_id ? { ...m, rating } : m));
      if (rating === 1) {
        // ✅ Hiển thị Like Progress Bar nếu có thông tin likes_count
        const likesCount = res?.likes_count;
        if (likesCount !== undefined && likesCount < 5) {
          toast.success(`❤️ ${likesCount}/5 lượt xác nhận! Thêm ${5 - likesCount} người nữa để hệ thống tự học.`, { duration: 3000 });
        } else if (likesCount !== undefined && likesCount >= 5) {
          toast.success('🚀 Đủ 5 lượt xác nhận! Hệ thống đang tự học kiến thức này...', { duration: 4000 });
        } else {
          toast.success('Cảm ơn bạn đã đánh giá hữu ích!');
        }
      } else if (rating === -1) {
        toast.success('Cảm ơn bạn, chúng tôi sẽ cải thiện câu trả lời.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Không thể gửi đánh giá');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
       
      {/* HEADER */}
      {/* HEADER - COMPACT FOR MOBILE */}
      {isNative ? (
        <header className="h-12 md:hidden flex items-center justify-between px-4 md:px-6 glass-nav border-b border-white/20 sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 md:w-8 md:h-8 bg-red-800 rounded-lg flex items-center justify-center text-white font-serif text-base md:text-lg shadow-lg shadow-red-900/20 italic shrink-0">
               {siteConfig?.site_title?.charAt(0) || '史'}
            </div>
            <h2 className="font-serif text-lg md:text-xl font-black text-red-950 tracking-tight leading-none truncate max-w-[150px] md:max-w-none">
              {siteConfig?.site_title || 'Chatbot Lịch sử'}
            </h2>
          </div>

          {user && (
            <div className="px-2 md:px-3 py-0.5 md:py-1 bg-red-800/10 rounded-full border border-red-800/20 shrink-0">
               <span className="text-[9px] md:text-[10px] font-black text-red-800 uppercase tracking-widest">
                  {(user.token_balance ?? 0).toFixed(0)} TK
               </span>
            </div>
          )}
        </header>
      ) : (
      <header className="md:hidden h-14 flex items-center justify-between px-4 z-50 relative bg-black/20 backdrop-blur-md border-b border-white/5">
        <h2 className="font-historical-premium text-xl text-amber-200 italic">
          {siteConfig?.site_title || 'Sử Việt'}
        </h2>
        {user && (
          <div className="px-2 py-0.5 bg-amber-500/20 rounded-full border border-amber-500/30">
             <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                {(user.token_balance ?? 0).toFixed(0)} TK
             </span>
          </div>
        )}
      </header>
      )}

      {/* MESSAGES */}

    <div className="flex-1 flex flex-col h-full relative overflow-hidden">
      {/* 1. Fixed Base Background (Custom or Default Paper Color) */}
      {siteConfig?.chat_bg ? (
        <SecureImage 
          src={siteConfig.chat_bg.startsWith('http') ? siteConfig.chat_bg : `${API_ROOT}${siteConfig.chat_bg.startsWith('/') ? '' : '/'}${siteConfig.chat_bg}`}
          isBackground={true}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 0 }}
        />
      ) : (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: 'var(--color-giay-do)',
            zIndex: 0
          }}
        />
      )}

      {/* 2. Fixed Texture & Watermark Overlays */}
      <div className="absolute inset-0 paper-texture-only motif-watermark pointer-events-none opacity-60" style={{ zIndex: 1 }} />

      {/* 3. Scrollable Content Layer */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto relative z-10"
      >
        <div className="max-w-4xl mx-auto w-full p-6 space-y-6 relative">
          {history.length === 0 && !isLoading && (
            <EmptyChatState
              onSuggestClick={(q) => setInput(q)}
            />
          )}

          {history.map((msg, index) => (
            <ChatMessageItem
              key={msg.id}
              msg={msg}
              userAvatar={user?.picture_url}
              userName={user?.full_name || user?.username}
              botAvatar={
                siteConfig?.logo_url
                  ? siteConfig.logo_url.startsWith("/")
                    ? `${API_ROOT}${siteConfig.logo_url}`
                    : siteConfig.logo_url
                  : undefined
              }
              onSourceClick={setSelectedSource}
              onRateClick={handleRateClick}
              onRelatedQuestionClick={(q) => {
                // ✅ Truyền thẳng q vào handleSubmit, không phụ thuộc vào state
                handleSubmit(undefined, q);
              }}
              onTypingFrame={scrollToBottom}
              isSpeaking={currentlySpeakingId === String(msg.id)}
              onSpeakToggle={speakText}
              previousMessageContent={index > 0 ? history[index - 1].content : undefined}
            />
          ))}

          {isLoading && !isStreamingActive && (
            <div className="bg-white/80 backdrop-blur-sm border border-amber-900/10 rounded-3xl p-5 text-amber-900/60 font-serif italic shadow-sm animate-pulse flex items-center gap-3">
              <div className="w-2 h-2 bg-red-900 rounded-full animate-bounce" />
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
    </div>
  );
  
};



export default ChatView;
