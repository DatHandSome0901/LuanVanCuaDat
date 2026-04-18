import React from 'react';

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ input, setInput, isLoading, onSubmit }) => {
  return (
    <footer className="p-3 md:p-8 bg-white/50 border-t border-stone-100">
      <div className="max-w-4xl mx-auto relative flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            // Auto-resize
            e.target.style.height = 'auto';
            e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              e.preventDefault();
              onSubmit(e as any);
            }
          }}
          placeholder="Đặt câu hỏi..."
          rows={1}
          className="flex-1 bg-white border border-stone-200 rounded-2xl py-3 pl-4 pr-4 shadow-lg shadow-stone-200/30 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm md:text-base text-stone-800 resize-none min-h-[48px] overflow-y-auto"
          style={{ height: 'auto' }}
        />
        <button
          onClick={(e) => onSubmit(e as any)}
          disabled={isLoading || !input.trim()}
          className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-lg ${
            isLoading || !input.trim() 
              ? 'bg-stone-100 text-stone-300 cursor-not-allowed' 
              : 'bg-amber-600 text-white hover:bg-amber-700 active:scale-95 shadow-amber-600/20'
          }`}
        >
          <svg className="w-6 h-6 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
      <p className="hidden md:block text-[10px] text-center text-stone-400 mt-3 uppercase tracking-tighter">
        Nhấn Enter để xuống hàng • Ctrl + Enter để gửi
      </p>
    </footer>
  );
};

export default ChatInput;
