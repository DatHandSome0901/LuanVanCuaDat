import React, { useState, useEffect } from 'react';
import { User, UserRagItem } from '../types';
import { getRagItems, saveManualRag, updateRagItem, deleteRagItem } from '../api';
import { useLanguage } from '../contexts/LanguageContext';
import { confirmDestructive, alertSuccess } from '../utils/swal';
import { motion, AnimatePresence } from 'framer-motion';

interface PersonalRagViewProps {
  user: User;
  isSidebarOpen: boolean;
}

const PersonalRagView: React.FC<PersonalRagViewProps> = ({ user, isSidebarOpen }) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [items, setItems] = useState<UserRagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'manual_note' | 'correction'>('all');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<UserRagItem | null>(null);

  // Form states
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('manual_note'); // 'manual_note' or 'correction'
  const [submitting, setSubmitting] = useState(false);

  // Load items on mount
  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await getRagItems();
      setItems(res.items || []);
    } catch (err) {
      console.error('Lỗi khi tải tri thức cá nhân:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setSubmitting(true);
    try {
      await saveManualRag({
        content: noteContent,
        noteType: noteType
      });
      alertSuccess(
        isVi ? 'Thành công' : 'Success',
        isVi ? 'Đã lưu tri thức cá nhân mới và cập nhật bộ nhớ RAG.' : 'Saved new custom knowledge and synchronized RAG.'
      );
      setNoteContent('');
      setShowAddModal(false);
      loadItems();
    } catch (err: any) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (item: UserRagItem) => {
    setEditingItem(item);
    setNoteContent(item.corrected_text || item.content);
    setNoteType(item.content_type);
    setShowEditModal(true);
  };

  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !noteContent.trim()) return;
    setSubmitting(true);
    try {
      await updateRagItem(editingItem.id, {
        content: noteContent,
        noteType: noteType
      });
      alertSuccess(
        isVi ? 'Cập nhật thành công' : 'Updated successfully',
        isVi ? 'Đã lưu thay đổi và đồng bộ lại bộ nhớ RAG.' : 'Saved changes and updated RAG memory.'
      );
      setEditingItem(null);
      setNoteContent('');
      setShowEditModal(false);
      loadItems();
    } catch (err: any) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    const confirmed = await confirmDestructive(
      isVi ? 'Xóa Tri Thức?' : 'Delete Knowledge?',
      isVi 
        ? 'Hành động này sẽ xóa vĩnh viễn ghi chú này khỏi kho tri thức cá nhân của bạn.' 
        : 'This will permanently delete this note from your personal knowledge base.'
    );
    if (!confirmed) return;

    try {
      await deleteRagItem(itemId);
      alertSuccess(
        isVi ? 'Đã xóa' : 'Deleted',
        isVi ? 'Đã xóa và cập nhật bộ nhớ RAG cá nhân.' : 'Deleted and updated personal RAG index.'
      );
      loadItems();
    } catch (err: any) {
      console.error(err);
    }
  };

  // Filter items based on search and tab
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.original_question && item.original_question.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.selected_text && item.selected_text.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.corrected_text && item.corrected_text.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedTab === 'all') return matchesSearch;
    return item.content_type === selectedTab && matchesSearch;
  });

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(isVi ? 'vi-VN' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-full w-full py-8 px-4 md:px-8 bg-[#faf6eb] text-stone-850 relative overflow-hidden font-serif">
      {/* Paper texture overlay */}
      <div className="absolute inset-0 paper-texture-only motif-watermark pointer-events-none opacity-40" />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="border-b border-amber-900/15 pb-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-800 shadow-[0_0_8px_rgba(153,27,27,0.6)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">
                {isVi ? 'CÁ NHÂN HÓA RAG' : 'PERSONALIZED RAG'}
              </span>
            </div>
            <h1 className="text-3xl font-black text-amber-950 font-serif italic tracking-tight">
              {isVi ? 'Kho Tri Thức Cá Nhân' : 'Personal Knowledge Base'}
            </h1>
            <p className="text-sm text-stone-600 font-sans mt-1 max-w-2xl">
              {isVi 
                ? 'Lưu trữ ghi chú, giả thuyết riêng và các sửa lỗi hội thoại của bạn. Chatbot sẽ tự động tham chiếu dữ liệu này để trả lời cá nhân hóa.'
                : 'Store your notes, hypotheses, and conversation corrections. The chatbot will automatically reference this data to personalize answers.'}
            </p>
          </div>

          <button
            onClick={() => {
              setNoteContent('');
              setNoteType('manual_note');
              setShowAddModal(true);
            }}
            className="self-start md:self-center bg-gradient-to-r from-red-950 to-red-900 text-amber-100 hover:from-red-900 hover:to-red-800 py-3 px-6 rounded-xl border border-amber-500/30 font-bold font-sans text-sm shadow-md transition-all flex items-center gap-2 hover:scale-[1.02] cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            {isVi ? 'Thêm Tri Thức' : 'Add Note'}
          </button>
        </div>

        {/* Toolbar & Filter */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-amber-900/10 p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Tabs */}
          <div className="flex gap-1.5 p-1 bg-stone-100/80 rounded-xl w-full md:w-auto font-sans">
            {(['all', 'manual_note', 'correction'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedTab === tab
                    ? 'bg-amber-950 text-amber-100 shadow-sm'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200/50'
                }`}
              >
                {tab === 'all' && (isVi ? 'Tất cả' : 'All')}
                {tab === 'manual_note' && (isVi ? 'Ghi chú' : 'Notes')}
                {tab === 'correction' && (isVi ? 'Đoạn sửa đổi' : 'Corrections')}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80 font-sans">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder={isVi ? 'Tìm kiếm tri thức...' : 'Search notes...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>

        {/* Content List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-red-800 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-stone-500 font-sans text-sm italic">{isVi ? 'Đang tải kho tri thức...' : 'Loading knowledge base...'}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white/50 border border-dashed border-amber-900/10 rounded-2xl py-16 text-center px-4 shadow-inner">
            <svg className="w-16 h-16 text-stone-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-bold text-amber-950 font-serif italic mb-1">
              {isVi ? 'Kho tri thức đang trống' : 'Knowledge base is empty'}
            </h3>
            <p className="text-sm text-stone-500 font-sans max-w-md mx-auto mb-6">
              {isVi 
                ? 'Bạn chưa thêm ghi chú nào hoặc chưa thực hiện lưu văn bản sửa đổi. Hãy bắt đầu ghi chép hoặc lưu chỉnh sửa từ câu trả lời của chatbot.'
                : 'You have not added any notes or saved corrected text. Start recording your notes or click selection edit menu on chatbot answers.'}
            </p>
            <button
              onClick={() => {
                setNoteContent('');
                setNoteType('manual_note');
                setShowAddModal(true);
              }}
              className="bg-amber-950 hover:bg-amber-900 text-amber-100 py-2.5 px-5 rounded-xl text-xs font-bold font-sans shadow transition-all cursor-pointer"
            >
              {isVi ? 'Thêm tri thức đầu tiên' : 'Add your first note'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredItems.map(item => (
              <motion.div
                key={item.id}
                layout
                className="bg-white border border-amber-950/10 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-amber-950/20 transition-all flex flex-col justify-between"
              >
                {/* Meta details */}
                <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4 font-sans text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md font-bold uppercase ${
                      item.content_type === 'correction' 
                        ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                        : 'bg-red-50 text-red-800 border border-red-100'
                    }`}>
                      {item.content_type === 'correction' 
                        ? (isVi ? 'Đoạn Sửa Đổi' : 'Correction') 
                        : (isVi ? 'Ghi Chú' : 'Manual Note')}
                    </span>
                    <span className="text-stone-400">|</span>
                    <span className="text-stone-500 font-medium">{formatDate(item.created_at)}</span>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      title={isVi ? 'Sửa' : 'Edit'}
                      className="p-2 text-stone-500 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      title={isVi ? 'Xóa' : 'Delete'}
                      className="p-2 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Text Content */}
                <div className="flex-1">
                  {item.content_type === 'correction' ? (
                    <div className="space-y-3 font-sans">
                      {item.original_question && (
                        <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                          <p className="text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1">
                            {isVi ? 'CÂU HỎI BAN ĐẦU' : 'ORIGINAL QUESTION'}
                          </p>
                          <p className="text-xs text-stone-700 font-serif italic">"{item.original_question}"</p>
                        </div>
                      )}
                      
                      {item.selected_text && (
                        <div>
                          <p className="text-[10px] font-black uppercase text-stone-400 tracking-wider mb-1">
                            {isVi ? 'ĐOẠN VĂN GỐC TỪ CHATBOT' : 'SELECTED TEXT FROM CHATBOT'}
                          </p>
                          <p className="text-xs text-red-900 bg-red-50/50 p-3 rounded-xl border border-red-100/50 line-through">
                            {item.selected_text}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-[10px] font-black uppercase text-amber-800 tracking-wider mb-1">
                          {isVi ? 'NỘI DUNG SỬA / GHI NHỚ' : 'CORRECTED / REMEMBERED TEXT'}
                        </p>
                        <p className="text-sm font-serif text-stone-900 bg-amber-50/30 p-3.5 rounded-xl border border-amber-900/10 leading-relaxed">
                          {item.content}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm font-serif text-stone-900 whitespace-pre-wrap leading-relaxed">
                      {item.content}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>

      {/* Modal Add & Edit */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-stone-950/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#faf6eb] w-full max-w-lg rounded-3xl border border-amber-900/15 shadow-2xl p-6 relative overflow-hidden font-serif"
            >
              {/* Decorative paper border */}
              <div className="absolute inset-0 paper-texture-only pointer-events-none opacity-40" />

              <div className="relative z-10">
                <h2 className="text-xl font-bold text-amber-950 italic border-b border-amber-900/10 pb-3 mb-4">
                  {showAddModal 
                    ? (isVi ? 'Thêm Tri Thức Cá Nhân' : 'Add Custom Knowledge') 
                    : (isVi ? 'Chỉnh Sửa Tri Thức' : 'Edit Knowledge')}
                </h2>

                <form onSubmit={showAddModal ? handleAddNote : handleUpdateNote} className="space-y-4 font-sans text-sm">
                  {/* Content Type Select (Only for Add) */}
                  {showAddModal && (
                    <div>
                      <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider mb-2 block">
                        {isVi ? 'LOẠI NỘI DUNG' : 'CONTENT TYPE'}
                      </label>
                      <div className="flex gap-2">
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
                      </div>
                    </div>
                  )}

                  {/* Textarea */}
                  <div>
                    <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider mb-2 block">
                      {isVi ? 'NỘI DUNG TRI THỨC' : 'KNOWLEDGE CONTENT'}
                    </label>
                    <textarea
                      required
                      rows={6}
                      placeholder={
                        noteType === 'correction'
                          ? (isVi ? 'Nhập nội dung chỉnh sửa lịch sử mà bạn muốn chatbot ghi nhớ...' : 'Enter corrected history details for the chatbot to remember...')
                          : (isVi ? 'Nhập ghi chú, giả thuyết lịch sử của bạn...' : 'Enter your custom notes, hypotheses...')
                      }
                      value={noteContent}
                      onChange={e => setNoteContent(e.target.value)}
                      className="w-full bg-white border border-stone-200 p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 font-serif leading-relaxed text-stone-800"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 border-t border-amber-900/10 pt-4 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setShowEditModal(false);
                      }}
                      className="flex-1 bg-white hover:bg-stone-50 text-stone-600 py-3 rounded-xl font-bold border border-stone-200 shadow-sm cursor-pointer transition-colors"
                    >
                      {isVi ? 'Hủy' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-gradient-to-r from-red-950 to-red-900 text-amber-100 hover:from-red-900 hover:to-red-800 py-3 rounded-xl font-bold border border-amber-500/30 shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <div className="w-4 h-4 border-2 border-amber-100 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        showAddModal ? (isVi ? 'Lưu Lại' : 'Save') : (isVi ? 'Cập Nhật' : 'Update')
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PersonalRagView;
