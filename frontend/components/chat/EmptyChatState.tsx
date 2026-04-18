
// export default EmptyChatState;
import React from 'react';

interface EmptyChatStateProps {
  onSuggestClick: (q: string) => void;
}

const EmptyChatState: React.FC<EmptyChatStateProps> = ({ onSuggestClick }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-8">
      
      <div className="w-16 h-16 md:w-20 md:h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <svg className="w-8 h-8 md:w-10 md:h-10 text-red-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.247 18.477 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>

      {/* 🔥 FIX FONT + TEXT */}
      <h3
        className="text-xl md:text-2xl text-stone-800 mb-3 italic px-4"
        style={{ fontFamily: 'Inter, Roboto, sans-serif' }}
      >
        “Dân ta phải biết sử ta”
      </h3>

      <p className="text-sm text-stone-500 mb-8 px-4">
        Hãy đặt câu hỏi về các triều đại, sự kiện lịch sử hoặc những vị anh hùng hào kiệt của dân tộc Việt Nam.
      </p>

    </div>
  );
};

export default EmptyChatState;