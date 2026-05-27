import React from 'react';

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ input, setInput, isLoading, onSubmit }) => {
  return (
    <footer className="p-4 md:p-8 bg-gradient-to-t from-black/20 to-transparent relative z-10">
      <div className="max-w-4xl mx-auto relative">
        <div className="relative flex items-end gap-3 bg-white/50 backdrop-blur-2xl border-[3px] border-[#451a03] p-2 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] focus-within:border-amber-800 transition-all after:absolute after:inset-0 after:rounded-[28px] after:border after:border-amber-400/20 after:pointer-events-none">
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                if (window.innerWidth > 768) {
                  e.preventDefault();
                  onSubmit(e as any);
                }
              }
            }}
            placeholder="Tìm hiểu sử thi Việt Nam..."
            rows={1}
            spellCheck={false}
            className="flex-1 bg-transparent border-none rounded-2xl py-3 px-4 focus:outline-none text-sm md:text-base text-[#451a03] font-medium placeholder-[#451a03]/40 resize-none min-h-[48px] overflow-y-auto"
            style={{ height: 'auto' }}
          />
          
          <button
            onClick={(e) => onSubmit(e as any)}
            disabled={isLoading || !input.trim()}
            className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-lg ${
              isLoading || !input.trim() 
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
                : 'bg-red-900 text-amber-50 hover:bg-red-950 active:scale-95 shadow-red-900/40 border border-amber-500/30'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-6 h-6 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        
        <p className="text-[9px] text-center text-stone-400 mt-4 uppercase tracking-[0.2em] font-black opacity-50">
          Thông tin mang tính chất tham khảo sử học
        </p>
      </div>
    </footer>
  );
};

export default ChatInput;
