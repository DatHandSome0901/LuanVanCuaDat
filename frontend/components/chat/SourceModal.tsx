import React, { useState, useEffect } from 'react';
import { API_ROOT } from '../../api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';

import { SourceInfo } from '../../types';

interface SourceModalProps {
  source: string | SourceInfo;
  onClose: () => void;
}

const SourceModal: React.FC<SourceModalProps> = ({ source, onClose }) => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFormatting, setIsFormatting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const filename = typeof source === 'string' ? source : source.filename;

  useEffect(() => {
    if (typeof source === 'object') {
      setContent(source.content);
      setIsLoading(false);
    } else {
      fetchSourceContent();
    }
  }, [source]);

  const fetchSourceContent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`${API_ROOT}/api/v1/source/${filename}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!res.ok) {
        throw new Error('Không thể tải tài liệu nguồn.');
      }

      const data = await res.json();
      setContent(data.content);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormatText = async () => {
    try {
      setIsFormatting(true);
      toast.loading('AI đang sửa lại chữ...', { id: 'format-toast' });
      const res = await fetch(`${API_ROOT}/api/v1/source/format`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ text: content }),
      });

      if (!res.ok) {
        throw new Error('Lỗi khi biên tập văn bản.');
      }

      const data = await res.json();
      setContent(data.formatted_text);
      toast.success('Đã sửa xong!', { id: 'format-toast' });
    } catch (err: any) {
      toast.error(err.message || 'Lỗi định dạng.', { id: 'format-toast' });
    } finally {
      setIsFormatting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-100">
          <h3 className="font-serif text-lg font-bold text-red-950 flex-1 truncate pr-4">
            {filename}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleFormatText}
              disabled={isLoading || isFormatting || !!error}
              className="px-3 py-1.5 text-xs font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center gap-1 shadow-sm"
            >
              {isFormatting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang sửa...
                </>
              ) : (
                <>✨ Sửa chữ bằng AI</>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-50/50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-stone-400 gap-3">
              <div className="w-8 h-8 border-4 border-red-800/20 border-t-red-800 rounded-full animate-spin" />
              <p className="font-medium text-sm">Đang tải nội dung gốc...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 p-4 bg-red-50 rounded-xl border border-red-100">
              {error}
            </div>
          ) : (
            <div className="prose prose-stone prose-sm max-w-none bg-white p-6 rounded-xl border border-stone-100 shadow-sm leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SourceModal;
