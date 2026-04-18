import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import React from 'react';
import { ChatMessage } from '../../types';
import toast from 'react-hot-toast';

interface ChatMessageItemProps {
  msg: ChatMessage;
  userAvatar?: string;
  botAvatar?: string;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ msg, userAvatar, botAvatar }) => {
  const [imgError, setImgError] = React.useState(false);
  const avatar = msg.role === 'user' ? userAvatar : botAvatar;
  const username = msg.role === 'user' ? 'Gia chủ' : 'Thiền sư AI';

  return (
    <div className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      {/* Avatar */}
      <div className="flex-shrink-0 mb-1">
        {avatar && !imgError ? (
          <img 
            src={avatar} 
            alt={username} 
            className="w-8 h-8 rounded-full border border-stone-100 shadow-sm object-cover" 
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${msg.role === 'user' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-500'}`}>
            {msg.role === 'user' ? 'U' : 'AI'}
          </div>
        )}
      </div>

      <div className={`group relative max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm ${
        msg.role === 'user' 
          ? 'bg-amber-600 text-white rounded-br-none' 
          : 'bg-white border border-stone-100 text-stone-800 rounded-bl-none'
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
          <div className="mt-4 pt-3 border-t border-stone-50">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-[1px] flex-1 bg-stone-100"></div>
              <p className="text-[9px] font-bold text-stone-400 uppercase tracking-[0.2em] px-2">Nguồn trích lục</p>
              <div className="h-[1px] flex-1 bg-stone-100"></div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {msg.sources.map((src, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 bg-stone-50/50 text-stone-500 px-2 py-0.5 rounded-full text-[9px] border border-stone-100 shadow-sm">
                  {src}
                </span>
              ))}
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
