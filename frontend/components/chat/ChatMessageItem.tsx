import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import React from 'react';
import { ChatMessage } from '../../types';
import toast from 'react-hot-toast';

interface ChatMessageItemProps {
  msg: ChatMessage;
  userAvatar?: string;
  botAvatar?: string;
  onSourceClick?: (source: string | import('../../types').SourceInfo) => void;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ msg, userAvatar, botAvatar, onSourceClick }) => {
  const [imgError, setImgError] = React.useState(false);
  const avatar = msg.role === 'user' ? userAvatar : botAvatar;
  const username = msg.role === 'user' ? 'Gia chủ' : 'Thiền sư AI';

  // Detection
  const isNative = (window as any).Capacitor?.isNativePlatform?.() || false;

  return (
    <div className={`flex items-end gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-3 duration-500`}>
      {/* Avatar */}
      <div className="flex-shrink-0 mb-0.5">
        {avatar && !imgError ? (
          <img 
            src={avatar} 
            alt={username} 
            className={`w-8 h-8 rounded-full border shadow-sm object-cover ${isNative ? 'border-red-100' : 'border-stone-100'}`} 
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${msg.role === 'user' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-500'}`}>
            {msg.role === 'user' ? 'U' : 'AI'}
          </div>
        )}
      </div>

      <div className={`group relative max-w-[85%] md:max-w-[70%] p-4 ${
        isNative 
          ? `rounded-3xl shadow-md ${msg.role === 'user' ? 'bg-amber-600 text-white rounded-br-none' : 'bg-white border border-stone-100 text-stone-800 rounded-bl-none'}`
          : `rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-amber-600 text-white rounded-br-none' : 'bg-white border border-stone-100 text-stone-800 rounded-bl-none'}`
      }`}>
        {/* Copy Button - Hidden on mobile, shown on group hover for desktop */}
        <button 
          onClick={() => {
            navigator.clipboard.writeText(msg.content);
            toast.success('Đã chép vào bộ nhớ.');
          }}
          className={`absolute hidden md:flex ${msg.role === 'user' ? '-left-12' : '-right-12'} top-2 p-2.5 bg-white border border-stone-100 rounded-xl text-stone-400 hover:text-amber-600 hover:border-amber-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all items-center justify-center`}
          title="Sao chép tin nhắn"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
        </button>

        {/* <div className="prose prose-sm max-w-none prose-stone whitespace-pre-wrap leading-relaxed overflow-x-hidden">
          {msg.content}
        </div> */}
        <div className="prose prose-sm max-w-none prose-stone leading-relaxed overflow-x-hidden">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {msg.content}
          </ReactMarkdown>
        </div>
        {/* <div className="prose prose-sm max-w-none prose-stone leading-relaxed overflow-x-hidden whitespace-pre-line">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {msg.content}
          </ReactMarkdown>
        </div> */}
        {msg.sources && msg.sources.length > 0 && (
          <div className="mt-5 pt-4 border-t border-stone-100/60">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-amber-700 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h4 className="font-serif text-[11px] font-bold text-amber-900 uppercase tracking-widest">Tài liệu tham khảo</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {msg.sources.map((src, i) => {
                const filename = typeof src === 'string' ? src : src.filename;
                return (
                  <button 
                    key={i} 
                    onClick={() => onSourceClick && onSourceClick(src)}
                    className="group relative flex items-center gap-2 bg-stone-50 hover:bg-white text-stone-600 hover:text-amber-800 px-3 py-1.5 rounded-lg text-xs font-medium border border-stone-200 hover:border-amber-300 shadow-sm hover:shadow transition-all"
                    title="Nhấn để xem tài liệu gốc"
                  >
                    <div className="w-5 h-5 flex items-center justify-center rounded bg-stone-200/50 group-hover:bg-amber-100/50 text-stone-400 group-hover:text-amber-600 transition-colors">
                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                       </svg>
                    </div>
                    <span className="truncate max-w-[200px]">{filename}</span>
                    <svg className="w-3 h-3 text-stone-300 group-hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className={`mt-2 flex items-center justify-between gap-2 text-[10px] ${msg.role === 'user' ? 'text-amber-100' : 'text-stone-400'}`}>
          <div className="flex items-center gap-2">
            <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            {/* {msg.tokens_charged !== undefined && (
              <span className={`px-1.5 py-0.5 rounded italic ${msg.role === 'user' ? 'bg-amber-500/30' : 'bg-amber-50 text-amber-700'}`}>
                 -{msg.tokens_charged} tokens
              </span>
            )} */}
            {msg.tokens_charged !== undefined && msg.role === "assistant" && (
              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-medium">
                -{msg.tokens_charged} tokens
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessageItem;
