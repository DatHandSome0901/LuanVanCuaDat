import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import React from 'react';
import { ChatMessage } from '../../types';
import toast from 'react-hot-toast';
import { API_ROOT, saveSelectionRag } from '../../api';
import SecureImage from '../SecureImage';
import { useLanguage } from '../../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cleanVietnameseSelection } from '../../utils/text';
import { createPortal } from 'react-dom';


interface ChatMessageItemProps {
  msg: ChatMessage;
  userAvatar?: string;
  botAvatar?: string;
  userName?: string;
  onSourceClick?: (source: string | import('../../types').SourceInfo) => void;
  onRateClick?: (messageId: string | number, rating: number) => void;
  onRelatedQuestionClick?: (question: string) => void; // ✅ [MỚI]
  onTypingFrame?: () => void;
  isSpeaking?: boolean;
  onSpeakToggle?: (id: string, text: string) => void;
  previousMessageContent?: string;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ 
  msg, 
  userAvatar, 
  botAvatar, 
  userName, 
  onSourceClick, 
  onRateClick, 
  onRelatedQuestionClick, 
  onTypingFrame,
  isSpeaking = false,
  onSpeakToggle,
  previousMessageContent
}) => {
  const { t } = useLanguage();
  const [imgError, setImgError] = React.useState(false);
  const [currentRating, setCurrentRating] = React.useState(msg.rating || 0);

  const [selectionRange, setSelectionRange] = React.useState<{ x: number; y: number; text: string } | null>(null);
  const [selectedText, setSelectedText] = React.useState('');
  const [showCorrectionModal, setShowCorrectionModal] = React.useState(false);
  const [correctedText, setCorrectedText] = React.useState('');
  const [noteType, setNoteType] = React.useState('correction');
  const [savingSelection, setSavingSelection] = React.useState(false);

  const isVi = t.sidebar_personal_rag === 'Kho tri thức';

  const handleMouseUp = (e: React.MouseEvent) => {
    if (msg.role !== 'assistant' || showCursor) return;
    
    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection) return;
      const rawText = selection.toString().trim();
      const cleanedText = cleanVietnameseSelection(rawText);
      
      if (cleanedText.length > 3) {
        try {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setSelectionRange({
            x: rect.left + rect.width / 2,
            y: rect.top - 40,
            text: cleanedText
          });
        } catch (err) {
          setSelectionRange({
            x: e.clientX,
            y: e.clientY - 40,
            text: cleanedText
          });
        }
      } else {
        setSelectionRange(null);
      }
    }, 10);
  };

  const handleSaveSelection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedText || !correctedText.trim()) return;
    
    setSavingSelection(true);
    try {
      const conversationIdStr = localStorage.getItem("conversation_id");
      const conversationId = conversationIdStr ? Number(conversationIdStr) : undefined;
      const msgIdNum = typeof msg.id === 'number' ? msg.id : undefined;

      await saveSelectionRag({
        conversationId,
        messageId: msgIdNum,
        originalQuestion: previousMessageContent ? cleanVietnameseSelection(previousMessageContent) : undefined,
        assistantAnswer: cleanVietnameseSelection(msg.content || ''),
        selectedText: cleanVietnameseSelection(selectedText),
        correctedText: cleanVietnameseSelection(correctedText),
        noteType: noteType
      });

      toast.success(isVi ? 'Đã lưu đính chính vào RAG cá nhân!' : 'Saved correction to personal RAG!');
      setShowCorrectionModal(false);
      setSelectionRange(null);
      setSelectedText('');
      setCorrectedText('');
    } catch (err: any) {
      toast.error(err.message || 'Không thể lưu tri thức');
    } finally {
      setSavingSelection(false);
    }
  };

  React.useEffect(() => {
    const handleDocClick = () => {
      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.toString().trim() === '') {
          setSelectionRange(null);
        }
      }, 100);
    };
    document.addEventListener('mouseup', handleDocClick);
    return () => document.removeEventListener('mouseup', handleDocClick);
  }, []);

  // isStreaming = true → content arrives live from SSE, display directly
  // animate = true  → content is already complete, fake typewriter it
  const isStreamingMsg = msg.role === 'assistant' && Boolean(msg.isStreaming);
  const shouldAnimateText = msg.role === 'assistant' && Boolean(msg.animate) && !isStreamingMsg;

  const [displayContent, setDisplayContent] = React.useState(
    shouldAnimateText ? '' : (msg.content || '').normalize('NFC')
  );
  const [isTypingText, setIsTypingText] = React.useState(shouldAnimateText);

  // For streaming messages: always keep displayContent in sync with msg.content
  React.useEffect(() => {
    if (isStreamingMsg) {
      setDisplayContent((msg.content || '').normalize('NFC'));
      return;
    }

    if (!shouldAnimateText) {
      setDisplayContent((msg.content || '').normalize('NFC'));
      setIsTypingText(false);
      return;
    }

    const fullText = (msg.content || '').normalize('NFC');
    let index = 0;
    let cancelled = false;

    setDisplayContent('');
    setIsTypingText(fullText.length > 0);

    if (!fullText) {
      return;
    }

    const tick = () => {
      if (cancelled) return;

      const remaining = fullText.length - index;
      const chunkSize = remaining > 2000 ? 30 : remaining > 1000 ? 20 : remaining > 400 ? 12 : 6;
      index = Math.min(fullText.length, index + chunkSize);

      setDisplayContent(fullText.slice(0, index));
      onTypingFrame?.();

      if (index < fullText.length) {
        window.setTimeout(tick, 25);
      } else {
        setIsTypingText(false);
        onTypingFrame?.();
      }
    };

    const startTimer = window.setTimeout(tick, 80);

    return () => {
      cancelled = true;
      window.clearTimeout(startTimer);
    };
  }, [msg.id, msg.content, shouldAnimateText, isStreamingMsg, onTypingFrame]);

  // Show blinking cursor while streaming OR while fake-typing
  const showCursor = isStreamingMsg || isTypingText;


  const handleRate = (rating: number) => {
    if (onRateClick && msg.id) {
      const newRating = currentRating === rating ? 0 : rating;
      setCurrentRating(newRating);
      onRateClick(msg.id, newRating);
    }
  };

  const avatar = msg.role === 'user' 
    ? (userAvatar?.startsWith('/') ? `${API_ROOT}${userAvatar}` : userAvatar) 
    : botAvatar;
  const username = msg.role === 'user' ? (userName || 'Gia chủ') : 'Sử Gia Lạc Việt';

  // Detection
  const isNative = (window as any).Capacitor?.isNativePlatform?.() || false;

  // Check if any source is from web
  const hasWebSource = msg.sources?.some(src => typeof src !== 'string' && src.is_web);

  return (
    <>
    <div className={`flex items-end gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-3 duration-500`}>
      {/* Avatar */}
      <div className="flex-shrink-0 mb-0.5">
        {avatar ? (
          <SecureImage 
            src={avatar} 
            alt={username} 
            className={`w-8 h-8 rounded-full border shadow-sm object-cover ${isNative ? 'border-red-100' : 'border-stone-100'}`} 
          />
        ) : (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black shadow-lg ${
            msg.role === 'user' 
              ? 'bg-amber-100 text-amber-700 border border-amber-200' 
              : 'bg-red-700 text-amber-400 border-2 border-amber-500/40 rotate-3 shadow-red-900/40'
          }`}>
            {msg.role === 'user' ? (userName ? userName.slice(0, 3) : 'Gia') : <span className="text-lg">史</span>}
          </div>
        )}
      </div>

      <div className={`group relative max-w-[85%] md:max-w-[80%] p-6 md:p-8 ${
        msg.role === 'user' 
          ? 'bg-gradient-to-br from-red-900/90 to-red-950/95 text-red-50 rounded-3xl rounded-br-none border border-amber-500/30 shadow-xl shadow-red-950/20 backdrop-blur-sm' 
          : 'bg-[#fdf6e3] border-[3px] border-double border-amber-900/30 text-stone-900 rounded-3xl rounded-bl-none shadow-2xl shadow-stone-900/20 relative'
      }`}>
        {/* Historical Motifs for Assistant Messages */}
        {msg.role === 'assistant' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[inherit]">
            {/* Lac Bird Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04] select-none w-64 h-64">
               <svg viewBox="0 0 100 100" className="w-full h-full fill-red-900">
                  <path d="M50,10 C27.9,10 10,27.9 10,50 C10,72.1 27.9,90 50,90 C72.1,90 90,72.1 90,50 C90,27.9 72.1,10 50,10 Z M50,80 C33.4,80 20,66.6 20,50 C20,33.4 33.4,20 50,20 C66.6,20 80,33.4 80,50 C80,66.6 66.6,80 50,80 Z"/>
                  <path d="M55,40 L45,40 L45,50 L35,50 L35,60 L45,60 L45,70 L55,70 L55,60 L65,60 L65,50 L55,50 Z"/>
               </svg>
            </div>
            {/* Corner Cloud Motifs (Simplified representations) */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-900/20 rounded-tl-xl m-1 opacity-40" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-900/20 rounded-tr-xl m-1 opacity-40" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-900/20 rounded-bl-xl m-1 opacity-40" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-900/20 rounded-br-xl m-1 opacity-40" />
          </div>
        )}

        {/* Copy Button */}
        {!showCursor && (
        <button 
          onClick={() => {
            navigator.clipboard.writeText((msg.content || '').normalize('NFC'));
            toast.success('Đã chép vào bộ nhớ.');
          }}
          className={`absolute ${
            msg.role === 'user' 
              ? '-left-12 bottom-2' // User: Lơ lửng bên trái, phía dưới
              : '-right-12 bottom-2' // Assistant: Lơ lửng bên phải, phía dưới
          } p-2.5 bg-white border border-stone-100 rounded-xl text-stone-400 hover:text-red-700 hover:border-red-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center z-20`}
          title="Sao chép tin nhắn"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
        </button>
        )}

        {/* Speak Button (Floating above Copy Button) */}
        {!showCursor && msg.role === 'assistant' && onSpeakToggle && (
        <button 
          onClick={() => onSpeakToggle(String(msg.id), (msg.content || '').normalize('NFC'))}
          className={`absolute -right-12 bottom-14 p-2.5 bg-white border border-stone-100 rounded-xl transition-all shadow-sm opacity-0 group-hover:opacity-100 flex items-center justify-center z-20 ${
            isSpeaking 
              ? 'bg-red-50 border-red-200 text-red-700 hover:text-red-800' 
              : 'text-stone-400 hover:text-red-700 hover:border-red-200'
          }`}
          title={isSpeaking ? "Dừng đọc" : "Đọc thành tiếng"}
        >
          {isSpeaking ? (
            <svg className="w-4 h-4 text-red-700 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1.5" strokeWidth={2} />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18.75V5.25L7.75 9.5H4.5v5h3.25L12 18.75z" />
            </svg>
          )}
        </button>
        )}


        <div 
          onMouseUp={handleMouseUp}
          className={`prose prose-sm md:prose-base max-w-none leading-[1.9] overflow-x-hidden relative z-10 ${msg.role === 'user' ? 'prose-invert font-medium' : 'prose-stone prose-headings:text-red-900 prose-headings:font-historical-premium prose-strong:text-red-950 prose-p:text-stone-800'}`}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {displayContent}
          </ReactMarkdown>
          {showCursor && (
            <span className="inline-block w-2 h-5 ml-1 align-middle bg-red-800/70 rounded-sm animate-pulse" />
          )}
        </div>

        {!showCursor && msg.sources && msg.sources.length > 0 && (
          <div className="mt-10 pt-6 border-t border-amber-900/10 relative z-10">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1.5 h-5 bg-red-800 rounded-full shadow-sm" />
              <h4 className="font-black text-[10px] md:text-[11px] text-amber-900/60 uppercase tracking-[0.3em]">
                {hasWebSource ? t.chat_sources_web : t.chat_sources_docs}
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {msg.sources.map((src, i) => {
                const filename = typeof src === 'string' ? src : src.filename;
                const isWeb = typeof src !== 'string' && src.is_web;
                return (
                  <button 
                    key={i} 
                    onClick={() => {
                      if (isWeb && typeof src !== 'string' && src.url) {
                        window.open(src.url, '_blank');
                      } else if (onSourceClick) {
                        onSourceClick(src);
                      }
                    }}
                    className={`group flex items-center gap-3 ${isWeb ? 'bg-blue-50/30' : 'bg-stone-200/30'} hover:bg-white text-stone-600 hover:text-red-900 px-4 py-3 rounded-2xl text-[11px] font-black border border-amber-900/5 hover:border-red-200 shadow-sm transition-all text-left`}
                  >
                    <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-white group-hover:bg-red-50 text-stone-400 group-hover:text-red-600 shadow-sm border border-stone-100 transition-colors shrink-0">
                       {isWeb ? (
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h18" />
                         </svg>
                       ) : (
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                         </svg>
                       )}
                    </div>
                    <div className="flex flex-col flex-1 truncate">
                      <span className="truncate tracking-tight">{filename}</span>
                      {typeof src !== 'string' && src.page && (
                        <span className="text-[9px] text-red-800/60 font-medium italic">
                          {t.chat_sources_page.replace("{page}", String(src.page))}
                        </span>
                      )}
                      {isWeb && (
                        <span className="text-[9px] text-blue-600/60 font-medium italic">{t.chat_sources_web_label}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!showCursor && (
        <div className={`mt-5 flex items-center justify-between border-t pt-4 relative z-10 ${msg.role === 'user' ? 'border-white/10 text-amber-100' : 'border-amber-900/10 text-stone-400'}`}>
          <div className="flex items-center gap-4">
            <span className="font-black text-[10px] uppercase tracking-[0.2em] opacity-60">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            {msg.tokens_charged !== undefined && msg.role === "assistant" && (
              <span className="px-3 py-1 rounded-lg bg-red-900/5 text-red-900 text-[9px] font-black uppercase tracking-widest border border-red-900/10">
                -{msg.tokens_charged} tokens
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {msg.role === 'assistant' && (
              <div className="flex items-center gap-1 mr-2">

                <button 
                  onClick={() => handleRate(1)}
                  className={`p-1.5 rounded-lg transition-colors ${currentRating === 1 ? 'bg-green-100 text-green-600' : 'hover:bg-stone-100 text-stone-400'}`}
                  title="Hữu ích"
                >
                  <svg className="w-4 h-4" fill={currentRating === 1 ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.708C19.746 10 20.621 10.875 20.5 12c-.121 1.125-1.125 7-1.125 7s-1.5 1.5-3.5 1.5H8.5c-2 0-3-1-3-3V11c0-1 1-2 2-2h1.5s1-2.5 3-4c1.125-.844 2.5-1 3-1 1.125 0 2 .875 2 2v4z" />
                  </svg>
                </button>
                <button 
                  onClick={() => handleRate(-1)}
                  className={`p-1.5 rounded-lg transition-colors ${currentRating === -1 ? 'bg-red-100 text-red-600' : 'hover:bg-stone-100 text-stone-400'}`}
                  title="Không hữu ích"
                >
                  <svg className="w-4 h-4" fill={currentRating === -1 ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.292C4.254 14 3.379 13.125 3.5 12c.121-1.125 1.125-7 1.125-7s1.5-1.5 3.5-1.5h7.375c2 0 3 1 3 3v8c0 1-1 2-2 2h-1.5s-1 2.5-3 4c-1.125.844-2.5 1-3 1-1.125 0-2-.875-2-2v-4z" />
                  </svg>
                </button>
              </div>
            )}
            {msg.role === 'assistant' && (
               <div className="w-6 h-6 bg-red-800 rounded flex items-center justify-center text-white text-[10px] font-serif shadow-md border border-amber-500/30 opacity-60">
                  史
               </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>

    {/* ✅ [MỚI] RELATED QUESTIONS — Chỉ hiện cho tin nhắn của Bot */}
    {!showCursor && msg.role === 'assistant' && msg.related_questions && msg.related_questions.length > 0 && (
      <div className="ml-12 mt-2 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {msg.related_questions.map((q, i) => (
          <button
            key={i}
            onClick={() => onRelatedQuestionClick?.(q)}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50/80 border border-amber-900/15 text-stone-600 hover:text-red-900 hover:bg-amber-100 hover:border-red-300 text-[11px] font-semibold transition-all shadow-sm"
          >
            <svg className="w-3 h-3 text-amber-600 group-hover:text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {q}
          </button>
        ))}
      </div>
    )}

    {/* Floating Tooltip */}
    {selectionRange && (
      <div 
        className="fixed z-[999] -translate-x-1/2 flex items-center bg-stone-900 text-amber-100 text-xs px-3 py-2 rounded-xl shadow-lg border border-amber-500/30 cursor-pointer select-none font-sans font-bold hover:bg-stone-800 transition-colors animate-in fade-in zoom-in-95 duration-100"
        style={{ top: `${selectionRange.y}px`, left: `${selectionRange.x}px` }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedText(selectionRange.text);
          setCorrectedText(selectionRange.text);
          setShowCorrectionModal(true);
        }}
      >
        <svg className="w-3.5 h-3.5 mr-1.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        {isVi ? 'Sửa & Ghi nhớ' : 'Correct & Remember'}
      </div>
    )}

    {/* Correction Modal */}
    {createPortal(
      <AnimatePresence>
        {showCorrectionModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-stone-950/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#faf6eb] w-full max-w-lg rounded-3xl border border-amber-900/15 shadow-2xl p-6 relative overflow-hidden font-sans"
              onClick={e => e.stopPropagation()}
            >
              {/* Decorative paper border */}
              <div className="absolute inset-0 paper-texture-only pointer-events-none opacity-40" />

              <div className="relative z-10">
                <h2 className="text-xl font-bold text-amber-950 italic border-b border-amber-900/10 pb-3 mb-4">
                  {isVi ? 'Cá Nhân Hóa Tri Thức' : 'Personalize Knowledge'}
                </h2>

                <form onSubmit={handleSaveSelection} className="space-y-4 font-sans text-sm">
                  {/* Selected Text Reference */}
                  <div>
                    <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1 block">
                      {isVi ? 'ĐOẠN TRÍCH GỐC' : 'SELECTED TEXT REFERENCE'}
                    </label>
                    <p className="text-xs text-red-900 bg-red-50/50 p-3 rounded-xl border border-red-100/50 font-sans italic max-h-24 overflow-y-auto">
                      "{selectedText}"
                    </p>
                  </div>

                  {/* Note Type selection */}
                  <div>
                    <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider mb-2 block">
                      {isVi ? 'LOẠI TRI THỨC' : 'KNOWLEDGE TYPE'}
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setNoteType('correction')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          noteType === 'correction'
                            ? 'bg-amber-950 text-amber-100 border-amber-950'
                            : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {isVi ? 'Đoạn đính chính' : 'Correction'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setNoteType('manual_note')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          noteType === 'manual_note'
                            ? 'bg-amber-950 text-amber-100 border-amber-950'
                            : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {isVi ? 'Ghi chú tự do' : 'Free Note'}
                      </button>
                    </div>
                  </div>

                  {/* Corrected Text area */}
                  <div>
                    <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider mb-2 block">
                      {isVi ? 'NỘI DUNG CHỈNH SỬA / GHI NHỚ' : 'YOUR MEMORIZATION / CORRECTION'}
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={correctedText}
                      onChange={e => setCorrectedText(e.target.value)}
                      placeholder={
                        noteType === 'correction'
                          ? (isVi ? 'Nhập nội dung đã đính chính chính xác để chatbot ghi nhớ...' : 'Enter the corrected facts for chatbot to remember...')
                          : (isVi ? 'Nhập quan điểm, giả thuyết hoặc phản hồi của bạn...' : 'Enter your perspective or notes...')
                      }
                      className="w-full bg-white border border-stone-200 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 font-sans leading-relaxed text-stone-850"
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-2 border-t border-amber-900/10 pt-4 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCorrectionModal(false);
                        setSelectedText('');
                        setCorrectedText('');
                      }}
                      className="flex-1 bg-white hover:bg-stone-50 text-stone-600 py-3 rounded-xl font-bold border border-stone-200 shadow-sm cursor-pointer transition-colors"
                    >
                      {isVi ? 'Hủy' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={savingSelection}
                      className="flex-1 bg-gradient-to-r from-red-950 to-red-900 text-amber-100 hover:from-red-900 hover:to-red-800 py-3 rounded-xl font-bold border border-amber-500/30 shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
                    >
                      {savingSelection ? (
                        <div className="w-4 h-4 border-2 border-amber-100 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        isVi ? 'Lưu & Ghi nhớ' : 'Save & Remember'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )}

  </>);
};

export default React.memo(ChatMessageItem, (prev, next) => {
  return (
    prev.msg.id === next.msg.id &&
    prev.msg.content === next.msg.content &&
    prev.msg.isStreaming === next.msg.isStreaming &&
    prev.msg.animate === next.msg.animate &&
    prev.msg.rating === next.msg.rating &&
    prev.msg.tokens_charged === next.msg.tokens_charged &&
    prev.userAvatar === next.userAvatar &&
    prev.userName === next.userName &&
    prev.botAvatar === next.botAvatar &&
    prev.msg.sources?.length === next.msg.sources?.length &&
    prev.msg.related_questions?.length === next.msg.related_questions?.length &&
    prev.isSpeaking === next.isSpeaking &&
    prev.onSpeakToggle === next.onSpeakToggle
  );
});
