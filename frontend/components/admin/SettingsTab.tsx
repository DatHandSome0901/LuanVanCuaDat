import React from 'react';
import { API_ROOT } from '../../api';

interface SettingsTabProps {
  data: any;
  onSave: (e: React.FormEvent) => void;
  onSync: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onUploadLogo: (file: File) => Promise<void>;
  onUploadFavicon: (file: File) => Promise<void>;

  onUploadBackground: (file: File) => Promise<void>;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ 
  data, 
  onSave, 
  onSync, 
  onChange, 
  onUploadLogo,
  onUploadFavicon,
  onUploadBackground
}) => {
  return (
    <div className="bg-white rounded-3xl border border-stone-100 p-8 shadow-sm max-w-xl mx-auto animate-in slide-in-from-bottom-4 duration-300">
       <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center shrink-0">
              <svg className="w-8 h-8 text-red-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
          </div>
          <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                  <h3 className="text-xl font-bold text-stone-800">Cấu Hình Website</h3>
                  <button 
                      type="button" 
                      onClick={onSync}
                      className="text-[10px] font-bold text-red-800 hover:bg-red-50 px-3 py-1 rounded-lg border border-red-200 transition-all flex items-center gap-1"
                      title="Lấy nội dung SEO hiện tại từ file index.html"
                  >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Sync từ HTML
                  </button>
              </div>
              <p className="text-xs text-stone-400">Điều chỉnh logo, tiêu đề và SEO hệ thống</p>
          </div>
       </div>

       <form onSubmit={onSave} className="space-y-6">
          <div>
              <label className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-2 block">Tiêu đề Website (SEO Title)</label>
              <input 
                  name="site_title"
                  value={data.site_title || ''}
                  onChange={onChange}
                  className="w-full bg-stone-50 border border-stone-100 p-4 rounded-xl focus:outline-none focus:border-red-800 font-medium"
                  placeholder="Ví dụ: Sử Việt AI - Tra Cứu Lịch Sử Hào Hùng"
              />
          </div>

          <div>
              <label className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-2 block">Mô tả Website (SEO Description)</label>
              <textarea 
                  name="seo_description"
                  value={data.seo_description || ''}
                  onChange={onChange}
                  rows={3}
                  className="w-full bg-stone-50 border border-stone-100 p-4 rounded-xl focus:outline-none focus:border-red-800 font-medium text-sm"
                  placeholder="Nhập mô tả cho công cụ tìm kiếm..."
              />
          </div>

          <div>
              <label className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-2 block">Từ khóa SEO (Keywords)</label>
              <input 
                  name="seo_keywords"
                  value={data.seo_keywords || ''}
                  onChange={onChange}
                  className="w-full bg-stone-50 border border-stone-100 p-4 rounded-xl focus:outline-none focus:border-red-800 font-medium text-sm"
                  placeholder="Từ khóa cách nhau bởi dấu phẩy..."
              />
          </div>

          <div>
              <label className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-2 block">Tác giả (SEO Author)</label>
              <input 
                  name="seo_author"
                  value={data.seo_author || ''}
                  onChange={onChange}
                  className="w-full bg-stone-50 border border-stone-100 p-4 rounded-xl focus:outline-none focus:border-red-800 font-medium text-sm"
                  placeholder="Ví dụ: Chatbot Lịch Sử Team"
              />
          </div>

          <div>
              <label className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-2 block">Logo Website</label>
              <div className="flex gap-4 items-start">
                  <div className="flex-1 space-y-2">
                      <input 
                          name="logo_url"
                          value={data.logo_url || ''}
                          onChange={onChange}
                          className="w-full bg-stone-50 border border-stone-100 p-4 rounded-xl focus:outline-none focus:border-red-800 font-medium text-sm"
                          placeholder="Link ảnh logo..."
                      />
                      <div className="flex items-center gap-3">
                          <label className="cursor-pointer bg-white border border-stone-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-stone-50 transition-all shadow-sm">
                              <span className="flex items-center gap-2">
                                  <svg className="w-4 h-4 text-red-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                  </svg>
                                  Tải ảnh lên
                              </span>
                              <input 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) onUploadLogo(file);
                                  }}
                              />
                          </label>
                          <p className="text-[10px] text-stone-400">Khuyên dùng ảnh vuông, nền trong suốt.</p>
                      </div>
                  </div>
                  {data.logo_url && (
                      <div className="shrink-0 text-center">
                          <p className="text-[10px] font-black uppercase text-stone-400 mb-2">Logo</p>
                          <div className="w-16 h-16 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-center p-2">
                              <img src={data.logo_url.startsWith('/') ? `${API_ROOT}${data.logo_url}` : data.logo_url} className="w-full h-full object-contain" alt="Preview" />
                          </div>
                      </div>
                  )}
              </div>
          </div>
        

          <div>
              <label className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-2 block">Favicon Website (Icon tab trình duyệt)</label>
              <div className="flex gap-4 items-start">
                  <div className="flex-1 space-y-2">
                      <input 
                          name="favicon_url"
                          value={data.favicon_url || ''}
                          onChange={onChange}
                          className="w-full bg-stone-50 border border-stone-100 p-4 rounded-xl focus:outline-none focus:border-red-800 font-medium text-sm"
                          placeholder="Link favicon (.ico, .png, .svg)..."
                      />
                      <div className="flex items-center gap-3">
                          <label className="cursor-pointer bg-white border border-stone-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-stone-50 transition-all shadow-sm">
                              <span className="flex items-center gap-2">
                                  <svg className="w-4 h-4 text-red-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                  </svg>
                                  Tải Favicon
                              </span>
                              <input 
                                  type="file" 
                                  className="hidden" 
                                  accept="image/*"
                                  onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) onUploadFavicon(file);
                                  }}
                              />
                          </label>
                      </div>
                  </div>
                  {data.favicon_url && (
                      <div className="shrink-0 text-center">
                          <p className="text-[10px] font-black uppercase text-stone-400 mb-2">Favicon</p>
                          <div className="w-12 h-12 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-center p-2">
                              <img src={data.favicon_url.startsWith('/') ? `${API_ROOT}${data.favicon_url}` : data.favicon_url} className="w-full h-full object-contain" alt="Favicon" />
                          </div>
                      </div>
                  )}
              </div>
          </div>

          <div>
  <label className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-2 block">
    Background Landing
  </label>

  <div className="flex gap-4 items-start">
    
    {/* LEFT */}
    <div className="flex-1 space-y-2">

      {/* INPUT */}
      <input 
        name="landing_bg"
        value={data.landing_bg || ''}
        onChange={onChange}
        className="w-full bg-stone-50 border border-stone-100 p-4 rounded-xl focus:outline-none focus:border-red-800 font-medium text-sm"
        placeholder="Link background..."
      />

      {/* UPLOAD BUTTON */}
      <div className="flex items-center gap-3">
        <label className="cursor-pointer bg-white border border-stone-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-stone-50 transition-all shadow-sm">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Tải Background
          </span>
          <input 
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUploadBackground(file);
            }}
          />
        </label>

        <p className="text-[10px] text-stone-400">
          Khuyên dùng ảnh ngang (1920x1080)
        </p>
      </div>

    </div>

    {/* PREVIEW */}
    {data.landing_bg && (
      <div className="shrink-0 text-center">
        <p className="text-[10px] font-black uppercase text-stone-400 mb-2">
          Preview
        </p>
        <div className="w-32 h-20 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-center overflow-hidden">
          <img
            src={data.landing_bg.startsWith('/') 
              ? `${API_ROOT}${data.landing_bg}` 
              : data.landing_bg}
            className="w-full h-full object-cover"
            alt="Background"
          />
        </div>
      </div>
    )}

  </div>
</div>

          <div>
              <label className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-2 block">Số Tokens / 1000 Tokens xử lý</label>
              <input 
                  name="rate"
                  type="number"
                  step="0.01"
                  value={data.rate || 0}
                  onChange={onChange}
                  className="w-full bg-stone-50 border border-stone-100 p-4 rounded-xl focus:outline-none focus:border-red-800 font-bold text-red-800"
              />
          </div>

          <div className="border-l-4 border-red-200 pl-4 py-2 italic text-sm text-stone-500">
              Mức phí này bao gồm cả nội dung câu hỏi (Input) và lời giải đáp của hệ thống (Output).
          </div>

          <div className="pt-4 border-t border-stone-100">
              <label className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-2 block">Model LLM (Trí Tuệ Nhân Tạo)</label>
              <select
                  name="llm_name"
                  value={data.llm_name || 'openai'}
                  onChange={onChange as any}
                  className="w-full bg-stone-50 border border-stone-100 p-4 rounded-xl focus:outline-none focus:border-red-800 font-bold text-stone-800"
              >
                  <option value="openai">OpenAI (GPT-4o/GPT-4o-mini)</option>
                  <option value="gemini">Gemini API (Google AI Studio)</option>
                  <option value="vertex">Google Vertex AI (Enterprise)</option>
                  <option value="local">Local (Ollama / Vllm / Llama.cpp)</option>
              </select>
              <p className="text-[10px] text-stone-400 mt-2 italic">Lưu ý: Bạn cần cấu hình các Key API tương ứng trong file .env của backend.</p>
          </div>

          <div className="pt-4 border-t border-stone-100">
              <label className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-2 block">Câu trả lời mặc định (Khi không tìm thấy đáp án)</label>
              <textarea 
                  name="no_answer_fallback"
                  value={data.no_answer_fallback || ''}
                  onChange={onChange}
                  rows={4}
                  className="w-full bg-stone-50 border border-stone-100 p-4 rounded-xl focus:outline-none focus:border-red-800 font-medium text-sm italic text-stone-600"
                  placeholder="Nhập câu cáo lỗi khi hệ thống không tìm thấy thông tin phù hợp..."
              />
          </div>

          <button 
            type="submit"
            className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-stone-800 transition-all active:scale-[0.98]"
          >
            Lưu Thay Đổi Cấu Hình
          </button>
       </form>
    </div>
  );
};

export default SettingsTab;
