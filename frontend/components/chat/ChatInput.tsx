import React from 'react';

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ input, setInput, isLoading, onSubmit }) => {
  return (
    <footer className="p-4 md:p-8 bg-gradient-to-t from-stone-50 to-transparent">
      <div className="max-w-4xl mx-auto relative">
        <div className="relative flex items-end gap-3 bg-white border border-stone-200 p-2 rounded-[28px] shadow-xl shadow-stone-200/40 focus-within:border-red-400 focus-within:ring-4 focus-within:ring-red-800/5 transition-all">
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
            className="flex-1 bg-transparent border-none rounded-2xl py-3 px-4 focus:outline-none text-sm md:text-base text-stone-800 resize-none min-h-[48px] overflow-y-auto"
            style={{ height: 'auto' }}
          />
          
          <button
            onClick={(e) => onSubmit(e as any)}
            disabled={isLoading || !input.trim()}
            className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-lg ${
              isLoading || !input.trim() 
                ? 'bg-stone-50 text-stone-300 cursor-not-allowed' 
                : 'bg-red-800 text-white hover:bg-red-900 active:scale-95 shadow-red-900/20'
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
