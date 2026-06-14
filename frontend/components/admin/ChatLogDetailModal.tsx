import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLanguage } from '../../contexts/LanguageContext';

const localized = {
  vi: {
    modal_title: "Chi Tiết Cuộc Đàm Đạo",
    lbl_question: "Câu hỏi từ người dùng",
    lbl_answer: "LỜI GIẢI ĐÁP TỪ HỆ THỐNG",
    lbl_token: "Token sử dụng",
    lbl_verified: "Xác thực tại"
  },
  en: {
    modal_title: "Dialogue Details",
    lbl_question: "Scholar's Inquiry",
    lbl_answer: "SYSTEM HISTORICAL RESPONSE",
    lbl_token: "Tokens Consumed",
    lbl_verified: "Logged at"
  }
};

interface ChatLogDetailModalProps {
  chat: any;
  onClose: () => void;
}

const TimelineItem: React.FC<{
  title: string;
  status: 'success' | 'warning' | 'info' | 'error' | 'pending';
  active: boolean;
  time?: string;
  isLast?: boolean;
  children?: React.ReactNode;
}> = ({ title, status, active, time, isLast = false, children }) => {
  const statusColorMap = {
    success: 'bg-emerald-500 border-emerald-200 text-white',
    warning: 'bg-amber-500 border-amber-200 text-white',
    error: 'bg-rose-500 border-rose-200 text-white',
    info: 'bg-sky-500 border-sky-250 text-white',
    pending: 'bg-stone-300 border-stone-100 text-stone-600',
  };

  const statusColor = statusColorMap[status] || statusColorMap.pending;

  return (
    <div className="relative pl-8 pb-6 last:pb-0">
      {/* Connector line */}
      {!isLast && (
        <div className="absolute left-[9px] top-4 bottom-0 w-0.5 bg-stone-200" />
      )}
      
      {/* Node Dot */}
      <div className={`absolute left-0 top-1.5 w-[20px] h-[20px] rounded-full border-4 border-white flex items-center justify-center shadow-sm ${statusColor}`}>
        <span className="w-1.5 h-1.5 bg-white rounded-full" />
      </div>

      <div className={`transition-all duration-200 ${active ? 'opacity-100' : 'opacity-60'}`}>
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-stone-850 uppercase tracking-wider">{title}</h4>
          {time && <span className="text-[10px] text-stone-400 font-mono">{time}</span>}
        </div>
        {active && children && (
          <div className="mt-2 bg-stone-50 border border-stone-150 rounded-2xl p-4 text-xs text-stone-600 space-y-1.5 leading-relaxed shadow-sm">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

const ChatLogDetailModal: React.FC<ChatLogDetailModalProps> = ({ chat, onClose }) => {
  const { language } = useLanguage();
  const tLocal = localized[language] || localized.vi;
  const [isTraceOpen, setIsTraceOpen] = React.useState(false);

  const trace = React.useMemo(() => {
    if (!chat.trace_log) return null;
    try {
      return typeof chat.trace_log === 'string' ? JSON.parse(chat.trace_log) : chat.trace_log;
    } catch (e) {
      console.error("Error parsing trace_log", e);
      return null;
    }
  }, [chat.trace_log]);

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in duration-300">
         <div className="p-8 bg-stone-900 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center font-bold text-xl">問</div>
                <div>
                    <h3 className="text-xl font-bold">{tLocal.modal_title}</h3>
                    <p className="text-xs text-stone-400">ID: #{chat.id} • {chat.username}</p>
                </div>
            </div>
            <button onClick={onClose} className="text-white hover:rotate-90 transition-transform p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
         </div>
         
         <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 bg-stone-50 px-2 py-1 rounded">{tLocal.lbl_question}</label>
                <div className="bg-amber-50 p-6 rounded-3xl border-l-4 border-amber-400 text-stone-800 font-medium italic shadow-inner">
                    "{chat.question}"
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 bg-stone-50 px-2 py-1 rounded">{tLocal.lbl_answer}</label>
                <div className="bg-white border border-stone-100 p-6 rounded-3xl shadow-sm text-stone-700 leading-relaxed markdown-body">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            h1: ({children}) => <h1 className="text-xl font-bold text-stone-800 mb-3 mt-4 border-b border-stone-200 pb-2">{children}</h1>,
                            h2: ({children}) => <h2 className="text-lg font-bold text-stone-800 mb-2 mt-4">{children}</h2>,
                            h3: ({children}) => <h3 className="text-base font-semibold text-amber-800 mb-2 mt-3">{children}</h3>,
                            p: ({children}) => <p className="mb-3 text-sm leading-relaxed">{children}</p>,
                            strong: ({children}) => <strong className="font-bold text-stone-900">{children}</strong>,
                            em: ({children}) => <em className="italic text-stone-700">{children}</em>,
                            ul: ({children}) => <ul className="list-disc list-inside mb-3 space-y-1 text-sm">{children}</ul>,
                            ol: ({children}) => <ol className="list-decimal list-inside mb-3 space-y-1 text-sm">{children}</ol>,
                            li: ({children}) => <li className="text-stone-700 leading-relaxed">{children}</li>,
                            blockquote: ({children}) => <blockquote className="border-l-4 border-amber-400 pl-4 italic text-stone-600 my-3 bg-amber-50 py-2 rounded-r-lg">{children}</blockquote>,
                            code: ({children}) => <code className="bg-stone-100 text-red-700 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,
                            hr: () => <hr className="border-stone-200 my-4" />,
                        }}
                    >
                        {chat.answer || ''}
                    </ReactMarkdown>
                </div>
            </div>

            {/* ⚙️ BACKEND EXECUTION TRACE VIEW */}
            {trace ? (
              <div className="border border-stone-200 rounded-3xl overflow-hidden bg-white shadow-sm">
                <button 
                  onClick={() => setIsTraceOpen(!isTraceOpen)} 
                  className="w-full p-5 flex justify-between items-center bg-stone-50 hover:bg-stone-100/80 transition-colors text-stone-700 text-xs font-black tracking-wider border-b border-stone-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">⚙️</span>
                    <span className="uppercase">{language === 'vi' ? 'HÀNH VẾT VẬN HÀNH BACKEND' : 'BACKEND PIPELINE TRACE'}</span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      trace.semantic_cache?.hit 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : (trace.web_fallback?.triggered ? 'bg-amber-100 text-amber-850' : 'bg-sky-100 text-sky-800')
                    }`}>
                      {trace.semantic_cache?.hit 
                        ? 'Cache Hit' 
                        : (trace.web_fallback?.triggered ? 'Web Fallback' : 'Standard RAG')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-stone-400 font-mono">
                      {trace.step_times?.total_elapsed_ms ? `${(trace.step_times.total_elapsed_ms / 1000).toFixed(2)}s` : ''}
                    </span>
                    <svg className={`w-4 h-4 transform transition-transform ${isTraceOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isTraceOpen && (
                  <div className="p-6 bg-stone-50/40 space-y-6 overflow-hidden">
                    {/* Visual Graph Header */}
                    <div className="bg-[#1e1e1a] text-stone-300 p-4 rounded-2xl flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono border border-stone-200/50 shadow-inner">
                      <div>
                        <span className="text-stone-500">LLM MODEL:</span> <span className="text-amber-400 font-bold">{trace.metadata?.llm_name || 'unknown'}</span>
                      </div>
                      <div>
                        <span className="text-stone-500">EMBEDDING:</span> <span className="text-amber-400 font-bold">{trace.metadata?.embedding_model_name || 'unknown'}</span>
                      </div>
                      {!trace.semantic_cache?.hit && (
                        <div>
                          <span className="text-stone-500">INTENT:</span> <span className="text-sky-400 font-bold uppercase">{trace.langgraph_workflow?.intent_detected || 'factual'}</span>
                        </div>
                      )}
                    </div>

                    {/* Timeline Flow */}
                    <div className="relative pl-1">
                      {/* Step 1: User Query */}
                      <TimelineItem 
                        title={language === 'vi' ? '1. Nhận Câu Hỏi (User Query)' : '1. User Query Input'}
                        status="success" 
                        active={true}
                      >
                        <div><span className="font-semibold text-stone-700">{language === 'vi' ? 'Câu hỏi thô' : 'Raw question'}:</span> "{trace.context_normalization?.raw_question || chat.question}"</div>
                        <div><span className="font-semibold text-stone-700">{language === 'vi' ? 'Ngôn ngữ' : 'Language'}:</span> <span className="uppercase font-bold">{trace.context_normalization?.query_language || 'vi'}</span></div>
                      </TimelineItem>

                      {/* Step 2: FastAPI Chat Router */}
                      <TimelineItem 
                        title={language === 'vi' ? '2. Định Tuyến FastAPI (FastAPI Chat Router)' : '2. FastAPI Chat Router'}
                        status="success" 
                        active={true}
                      >
                        <div><span className="font-semibold text-stone-700">JWT Authentication:</span> Verified (Active Session)</div>
                        <div><span className="font-semibold text-stone-700">{language === 'vi' ? 'Chi phí đàm đạo' : 'Charged tokens'}:</span> <span className="text-amber-600 font-bold">{chat.tokens_charged} credits</span></div>
                      </TimelineItem>

                      {/* Step 3: Context Normalization */}
                      <TimelineItem 
                        title={language === 'vi' ? '3. Chuẩn Hóa Lịch Sử (Context Normalization)' : '3. Context Normalization'}
                        status="success" 
                        active={true}
                      >
                        <div><span className="font-semibold text-stone-700">{language === 'vi' ? 'Câu hỏi ngữ cảnh' : 'Contextualized question'}:</span> "{trace.context_normalization?.resolved_question || chat.question}"</div>
                        {trace.context_normalization?.translation_applied && (
                          <div className="text-amber-600 font-semibold mt-1">🔄 {language === 'vi' ? 'Đã dịch từ EN sang VI để tìm kiếm RAG' : 'Translated from EN to VI for RAG search'}</div>
                        )}
                      </TimelineItem>

                      {/* Step 4: Semantic Cache Lookup */}
                      <TimelineItem 
                        title={language === 'vi' ? '4. Kiểm Tra Bộ Nhớ Đệm (Semantic Cache Lookup)' : '4. Semantic Cache Lookup'}
                        status={trace.semantic_cache?.hit ? "success" : "info"} 
                        active={true}
                        time={trace.step_times?.cache_lookup_ms ? `${trace.step_times.cache_lookup_ms.toFixed(0)}ms` : undefined}
                      >
                        <div>
                          <span className="font-semibold text-stone-700">{language === 'vi' ? 'Kết quả trùng khớp' : 'Cache status'}:</span>{' '}
                          <span className={`px-2 py-0.5 rounded font-bold ${trace.semantic_cache?.hit ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-800'}`}>
                            {trace.semantic_cache?.hit ? 'HIT (TRÙNG KHỚP)' : 'MISS (HỤT)'}
                          </span>
                        </div>
                        {trace.semantic_cache?.hit && (
                          <div className="mt-2 space-y-1 border-t border-stone-200/65 pt-2">
                            <div className="text-stone-500 italic">{language === 'vi' ? 'Lối tắt: Đã lấy trực tiếp câu trả lời từ Cache và kết thúc.' : 'Shortcut: Response fetched directly from cache, pipeline terminated.'}</div>
                            <div><span className="font-semibold text-stone-700">{language === 'vi' ? 'Độ tương đồng cosine' : 'Cosine similarity'}:</span> {(trace.semantic_cache.similarity * 100).toFixed(1)}%</div>
                          </div>
                        )}
                      </TimelineItem>

                      {/* Steps 5-8 are only relevant if Cache MISS */}
                      {!trace.semantic_cache?.hit && (
                        <>
                          {/* Step 5: LangGraph Workflow START */}
                          <TimelineItem 
                            title={language === 'vi' ? '5. Phân Loại & Thực Thể (Retrieve: Classification + Entity)' : '5. Retrieve: Classification & Entity'}
                            status="success" 
                            active={true}
                          >
                            <div><span className="font-semibold text-stone-700">{language === 'vi' ? 'Ý định đàm đạo (Intent)' : 'Intent detected'}:</span> <span className="font-bold text-sky-700 uppercase">{trace.langgraph_workflow?.intent_detected}</span></div>
                            {trace.langgraph_workflow?.detailed_intent && (
                              <div><span className="font-semibold text-stone-700">{language === 'vi' ? 'Ý định chi tiết' : 'Detailed intent'}:</span> {trace.langgraph_workflow.detailed_intent}</div>
                            )}
                            {trace.langgraph_workflow?.entity_detected && (
                              <div><span className="font-semibold text-stone-700">{language === 'vi' ? 'Thực thể nhận dạng' : 'Entity detected'}:</span> <span className="font-bold text-amber-700">{trace.langgraph_workflow.entity_display || trace.langgraph_workflow.entity_detected}</span></div>
                            )}
                          </TimelineItem>

                          {/* Step 6: Multi-source FAISS Retrieval */}
                          <TimelineItem 
                            title={language === 'vi' ? '6. Truy Xuất FAISS Đa Nguồn (Multi-source FAISS Retrieval)' : '6. Multi-source FAISS Retrieval'}
                            status="success" 
                            active={true}
                          >
                            <div className="mb-2">
                              <span className="font-semibold text-stone-700">{language === 'vi' ? 'Số đoạn tài liệu tìm thấy' : 'Retrieved chunks count'}:</span>{' '}
                              <span className="font-bold text-stone-850">{trace.langgraph_workflow?.retrieved_documents?.length || 0}</span>
                            </div>
                            {trace.langgraph_workflow?.retrieved_documents && trace.langgraph_workflow.retrieved_documents.length > 0 && (
                              <div className="space-y-2 max-h-[200px] overflow-y-auto border border-stone-200 rounded-xl p-3 bg-white scrollbar-hide">
                                {trace.langgraph_workflow.retrieved_documents.map((doc: any, i: number) => {
                                  let tag = language === 'vi' ? 'HỆ THỐNG' : 'SYSTEM';
                                  let tagColor = 'bg-stone-100 text-stone-700';
                                  if (doc.is_user_rag) {
                                    tag = language === 'vi' ? 'GHI CHÚ RIÊNG' : 'USER NOTE';
                                    tagColor = 'bg-rose-100 text-rose-700';
                                  } else if (doc.is_global_history) {
                                    tag = language === 'vi' ? 'TƯ LIỆU SỬ' : 'HISTORY INDEX';
                                    tagColor = 'bg-amber-100 text-amber-700';
                                  } else if (doc.is_pending) {
                                    tag = language === 'vi' ? 'ĐANG TỰ HỌC' : 'SELF-LEARNING';
                                    tagColor = 'bg-indigo-100 text-indigo-700';
                                  }
                                  
                                  return (
                                    <div key={i} className="text-[11px] pb-2 last:pb-0 border-b border-stone-100 last:border-0">
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-stone-700 truncate max-w-[220px]">
                                          [{i+1}] {doc.source} {doc.page ? `(Trang ${doc.page})` : ''}
                                        </span>
                                        <div className="flex gap-1.5 items-center shrink-0">
                                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${tagColor}`}>{tag}</span>
                                          <span className="text-[10px] text-stone-400 font-mono">{(doc.score * 100).toFixed(0)}%</span>
                                        </div>
                                      </div>
                                      <p className="text-stone-500 leading-normal italic line-clamp-2">"{doc.content}"</p>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </TimelineItem>

                          {/* Step 7: Adaptive Re-ranking & Filtering */}
                          <TimelineItem 
                            title={language === 'vi' ? '7. Đánh Giá & Tái Sắp Xếp (Adaptive Re-ranking & Grading)' : '7. Adaptive Re-ranking & Grading'}
                            status="success" 
                            active={true}
                          >
                            <div><span className="font-semibold text-stone-700">{language === 'vi' ? 'Trọng số đánh giá' : 'Grading parameters'}:</span> final = α•semantic + β•temporal + γ•causal</div>
                            <div><span className="font-semibold text-stone-700">{language === 'vi' ? 'Bộ lọc thực thể/từ khóa' : 'Entity/Keyword Filter'}:</span> Applied (Entity-aware bonus/penalty check)</div>
                          </TimelineItem>

                          {/* Step 8: Decision Point: Suitable Documents Available? */}
                          <TimelineItem 
                            title={language === 'vi' ? '8. Đủ Tư Liệu Khả Tín? (Suitable Documents Available?)' : '8. Suitable Documents Available?'}
                            status={trace.langgraph_workflow?.suitable_documents_available ? "success" : "warning"} 
                            active={true}
                          >
                            <div>
                              <span className="font-semibold text-stone-755">{language === 'vi' ? 'Trạng thái tư liệu' : 'Knowledge availability'}:</span>{' '}
                              <span className={`px-2 py-0.5 rounded font-bold ${
                                trace.langgraph_workflow?.suitable_documents_available 
                                  ? 'bg-emerald-105 text-emerald-800' 
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {trace.langgraph_workflow?.suitable_documents_available 
                                  ? (language === 'vi' ? 'Đủ tài liệu chính thống (Internal Knowledge)' : 'Internal Knowledge Available')
                                  : (language === 'vi' ? 'Thiếu tài liệu -> Kích hoạt Web Fallback' : 'Insufficient Data -> Web Fallback')
                                }
                              </span>
                            </div>

                            {/* Sub-flow A: Generate RAG Answer */}
                            {trace.langgraph_workflow?.suitable_documents_available && (
                              <div className="mt-3 space-y-1.5 border-t border-stone-200/60 pt-3 text-[11px] text-stone-600">
                                <div className="font-bold text-stone-700 text-xs uppercase tracking-wider mb-1">🌿 {language === 'vi' ? 'Nhánh A: Tạo Câu Trả Lời RAG' : 'Branch A: Generate RAG Response'}</div>
                                <div><span className="font-semibold text-stone-700">AnswerGenerator:</span> Context injected with chat history.</div>
                                <div><span className="font-semibold text-stone-700">Quality Control:</span> Citation remapping [i] & VietnamHistoryLanguageAgent guardrails checked.</div>
                              </div>
                            )}

                            {/* Sub-flow B: Web Learning Fallback */}
                            {trace.web_fallback?.triggered && (
                              <div className="mt-3 space-y-2 border-t border-stone-200/60 pt-3 text-[11px] text-stone-600">
                                <div className="font-bold text-amber-800 text-xs uppercase tracking-wider mb-1">🔥 {language === 'vi' ? 'Nhánh B: Tự Học Từ Web (Web Learning Agent)' : 'Branch B: Web Learning Agent'}</div>
                                <div><span className="font-semibold text-stone-700">{language === 'vi' ? 'Đầu tìm kiếm' : 'Web Crawler status'}:</span> Search & Crawl activated (DuckDuckGo Search)</div>
                                
                                {trace.web_fallback.crawled_urls && trace.web_fallback.crawled_urls.length > 0 && (
                                  <div>
                                    <span className="font-semibold text-stone-700">{language === 'vi' ? 'Các URL đã duyệt' : 'Crawled URLs'}:</span>
                                    <ul className="list-disc list-inside mt-1 pl-1 space-y-0.5 text-stone-500 font-mono text-[10px]">
                                      {trace.web_fallback.crawled_urls.map((url: string, i: number) => (
                                        <li key={i} className="truncate max-w-md">{url}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                <div>
                                  <span className="font-semibold text-stone-700">{language === 'vi' ? 'Độ tin cậy của Web' : 'Web data reliability'}:</span>{' '}
                                  <span className={`px-1.5 py-0.5 rounded font-bold ${
                                    trace.web_fallback.web_data_reliable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                  }`}>
                                    {trace.web_fallback.web_data_reliable 
                                      ? (language === 'vi' ? 'KHẢ TÍN (Lưu chờ duyệt)' : 'RELIABLE (Save pending)') 
                                      : (language === 'vi' ? 'CHƯA RÕ (Từ chối trả lời)' : 'UNRELIABLE (Refused)')
                                    }
                                  </span>
                                </div>

                                {trace.web_fallback.is_pending_knowledge && (
                                  <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-2xl text-indigo-800 italic mt-1.5 leading-relaxed">
                                    💡 {language === 'vi' ? 'Câu hỏi và câu trả lời tự học đã được gửi tới mục Tri Thức Chờ Duyệt (pending_knowledge) để Admin duyệt.' : 'Awaiting admin approval. Query & response added to pending_knowledge.'}
                                  </div>
                                )}
                              </div>
                            )}
                          </TimelineItem>
                        </>
                      )}

                      {/* Step 9: Save & Return */}
                      <TimelineItem 
                        title={language === 'vi' ? '9. Lưu Trữ & SSE Stream (Save and Return)' : '9. Save and Return'}
                        status="success" 
                        active={true}
                        isLast={true}
                        time={trace.step_times?.total_elapsed_ms ? `${(trace.step_times.total_elapsed_ms / 1000).toFixed(2)}s` : undefined}
                      >
                        <div><span className="font-semibold text-stone-700">{language === 'vi' ? 'Tổng thời gian chạy' : 'Total processing time'}:</span> <span className="font-bold text-stone-850">{trace.step_times?.total_elapsed_ms ? `${trace.step_times.total_elapsed_ms.toFixed(0)}ms` : 'N/A'}</span></div>
                        <div>
                          <span className="font-semibold text-stone-700">{language === 'vi' ? 'Chế độ hoàn trả' : 'Response delivery'}:</span>{' '}
                          <span className="font-bold uppercase text-stone-750">
                            {trace.semantic_cache?.hit 
                              ? 'Semantic Cache' 
                              : (trace.web_fallback?.triggered ? 'Web Fallback Learning' : 'Standard RAG SSE')}
                          </span>
                        </div>
                        <div><span className="font-semibold text-stone-700">{language === 'vi' ? 'Độ dài câu trả lời' : 'Answer length'}:</span> {chat.answer?.length || 0} kí tự / characters</div>
                      </TimelineItem>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                <div className="flex gap-6">
                    <div className="text-center">
                        <p className="text-[10px] text-stone-400 font-bold uppercase">{tLocal.lbl_token}</p>
                        <p className="text-xl font-black text-amber-600">{chat.tokens_charged}</p>
                    </div>
                    {chat.sentiment && (
                        <div className="text-left border-l border-stone-100 pl-6">
                            <p className="text-[10px] text-stone-400 font-bold uppercase">
                                {language === 'vi' ? 'Khí sắc / Thái độ' : 'Sentiment'}
                            </p>
                            <p className="text-xs font-bold text-stone-700 mt-1 flex items-center gap-1.5">
                                {chat.sentiment === 'positive' && '😊 Tích cực / Hài lòng'}
                                {chat.sentiment === 'frustrated' && '😡 Tiêu cực / Bực bội'}
                                {chat.sentiment === 'inquisitive' && '🤔 Nghi vấn / Tầm sư'}
                                {chat.sentiment === 'jailbreak' && '🚨 Phá hoại / Jailbreak'}
                                {chat.sentiment === 'neutral' && '😐 Bình thường'}
                                {chat.sentiment_score !== undefined && chat.sentiment_score !== 0 && (
                                    <span className="text-[10px] text-stone-400 font-mono">
                                        ({chat.sentiment_score > 0 ? '+' : ''}{chat.sentiment_score.toFixed(1)})
                                    </span>
                                )}
                            </p>
                        </div>
                    )}
                </div>
                <div className="text-right text-xs text-stone-400 italic">
                    {tLocal.lbl_verified} {new Date(chat.created_at).toLocaleString()}
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ChatLogDetailModal;
