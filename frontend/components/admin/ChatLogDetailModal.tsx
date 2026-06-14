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
  onOpenTestPage?: (question: string) => void;
}

const TimelineItem: React.FC<{
  title: string;
  subtitle?: string;
  status: 'success' | 'warning' | 'info' | 'error' | 'pending';
  active: boolean;
  time?: string;
  isLast?: boolean;
  children?: React.ReactNode;
}> = ({ title, subtitle, status, active, time, isLast = false, children }) => {
  const statusColorMap = {
    success: 'bg-emerald-500 border-emerald-250 text-white',
    warning: 'bg-amber-500 border-amber-250 text-white',
    error: 'bg-rose-500 border-rose-250 text-white',
    info: 'bg-sky-500 border-sky-250 text-white',
    pending: 'bg-stone-300 border-stone-100 text-stone-600',
  };

  const statusColor = statusColorMap[status] || statusColorMap.pending;

  return (
    <div className="relative pl-8 pb-5 last:pb-0">
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
          <div>
            <h4 className="text-xs font-black text-stone-850 uppercase tracking-wider">{title}</h4>
            {subtitle && <p className="text-[10px] text-stone-450 italic mt-0.5">{subtitle}</p>}
          </div>
          {time && <span className="text-[10px] text-stone-400 font-mono font-bold">{time}</span>}
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

const ChatLogDetailModal: React.FC<ChatLogDetailModalProps> = ({ chat, onClose, onOpenTestPage }) => {
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

  // Count documents retrieved from different sources
  const documentSourcesCount = React.useMemo(() => {
    if (!trace || !trace.langgraph_workflow?.retrieved_documents) return { userRag: 0, globalHist: 0, systemRag: 0 };
    let userRag = 0;
    let globalHist = 0;
    let systemRag = 0;
    trace.langgraph_workflow.retrieved_documents.forEach((doc: any) => {
      if (doc.is_user_rag) userRag++;
      else if (doc.is_global_history) globalHist++;
      else systemRag++;
    });
    return { userRag, globalHist, systemRag };
  }, [trace]);

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
            <div className="flex items-center">
                {onOpenTestPage && (
                  <button 
                    onClick={() => onOpenTestPage(chat.question)}
                    className="px-4 py-2 bg-gradient-to-r from-amber-600 to-red-800 hover:from-amber-500 hover:to-red-750 text-white rounded-xl text-xs font-bold hover:scale-105 transition-all shadow-sm shrink-0 mr-4 cursor-pointer"
                  >
                    {language === 'vi' ? '🧪 Thử nghiệm RAG' : '🧪 Test RAG'}
                  </button>
                )}
                <button onClick={onClose} className="text-white hover:rotate-90 transition-transform p-2 cursor-pointer">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
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

            {/* ⚙️ DETAILED RAG PIPELINE EXECUTION TRACE */}
            {trace ? (
              <div className="border border-stone-250 rounded-3xl overflow-hidden bg-white shadow-md">
                <button 
                  onClick={() => setIsTraceOpen(!isTraceOpen)} 
                  className="w-full p-5 flex justify-between items-center bg-stone-50 hover:bg-stone-100 transition-colors text-stone-700 text-xs font-black tracking-wider border-b border-stone-200"
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
                        <span className="text-stone-500">LLM MODEL:</span> <span className="text-amber-400 font-bold">{trace.metadata?.llm_name || 'openai'}</span>
                      </div>
                      <div>
                        <span className="text-stone-500">EMBEDDING:</span> <span className="text-amber-400 font-bold">{trace.metadata?.embedding_model_name || 'vertex'}</span>
                      </div>
                      {!trace.semantic_cache?.hit && (
                        <div>
                          <span className="text-stone-500">INTENT:</span> <span className="text-sky-400 font-bold uppercase">{trace.langgraph_workflow?.intent_detected || 'factual'}</span>
                        </div>
                      )}
                    </div>

                    {/* Step-by-Step Pipeline Flow */}
                    <div className="relative pl-1">
                      
                      {/* Step 1: User Query */}
                      <TimelineItem 
                        title="User Query" 
                        subtitle={language === 'vi' ? 'Nhận câu hỏi từ Frontend' : 'Inquiry request from Client'}
                        status="success" 
                        active={true}
                      >
                        <div><span className="font-semibold text-stone-700">{language === 'vi' ? 'Truy vấn thô' : 'Raw question'}:</span> "{trace.context_normalization?.raw_question || chat.question}"</div>
                        <div><span className="font-semibold text-stone-700">API Endpoint:</span> <code className="bg-stone-200/60 px-1 py-0.5 rounded text-[10px] font-mono">/api/v1/chat/stream (SSE)</code></div>
                        <div><span className="font-semibold text-stone-700">{language === 'vi' ? 'Khớp ngôn ngữ' : 'Language matched'}:</span> <span className="uppercase font-bold text-stone-800">{trace.context_normalization?.query_language || 'vi'}</span></div>
                      </TimelineItem>

                      {/* Step 2: FastAPI Chat Router */}
                      <TimelineItem 
                        title="FastAPI Chat Router" 
                        subtitle={language === 'vi' ? 'Định tuyến & Kiểm tra quyền' : 'Route verification & User limits'}
                        status="success" 
                        active={true}
                      >
                        <div><span className="font-semibold text-stone-700">JWT Token:</span> <span className="text-emerald-700 font-bold">✓ Valid (Ủy quyền thành công)</span></div>
                        <div><span className="font-semibold text-stone-700">User Identity:</span> {chat.username}</div>
                        <div><span className="font-semibold text-stone-700">{language === 'vi' ? 'Trừ phí đàm đạo' : 'Deducted credit'}:</span> <span className="text-amber-600 font-bold">-{chat.tokens_charged} Tệ</span></div>
                        <div><span className="font-semibold text-stone-700">History Context:</span> Fetched last 6 messages from SQLite</div>
                      </TimelineItem>

                      {/* Step 3: Context Normalization */}
                      <TimelineItem 
                        title="Context Normalization" 
                        subtitle={language === 'vi' ? 'Dịch thuật & Làm rõ đại từ lịch sử' : 'Translation check & Coreference resolution'}
                        status="success" 
                        active={true}
                      >
                        <div><span className="font-semibold text-stone-700">{language === 'vi' ? 'Câu hỏi chuẩn hóa' : 'Resolved standalone question'}:</span> "{trace.context_normalization?.resolved_question || chat.question}"</div>
                        <div>
                          <span className="font-semibold text-stone-700">{language === 'vi' ? 'Dịch thuật song ngữ' : 'Bilingual translator'}:</span>{' '}
                          {trace.context_normalization?.translation_applied 
                            ? <span className="text-amber-700 font-bold">🔄 Đã dịch từ EN &rarr; VI để tối ưu hóa FAISS</span>
                            : <span>Không cần dịch (VI)</span>
                          }
                        </div>
                      </TimelineItem>

                      {/* Step 4: Semantic Cache Lookup */}
                      <TimelineItem 
                        title="Semantic Cache Lookup" 
                        subtitle={language === 'vi' ? 'Kiểm tra bộ nhớ đệm ngữ nghĩa' : 'Check stored QA vector database'}
                        status={trace.semantic_cache?.hit ? "success" : "info"} 
                        active={true}
                        time={trace.step_times?.cache_lookup_ms ? `${trace.step_times.cache_lookup_ms.toFixed(0)}ms` : undefined}
                      >
                        <div>
                          <span className="font-semibold text-stone-700">{language === 'vi' ? 'Trạng thái cache' : 'Cache status'}:</span>{' '}
                          <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                            trace.semantic_cache?.hit ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-800'
                          }`}>
                            {trace.semantic_cache?.hit ? 'CACHE HIT (TRÙNG KHỚP)' : 'CACHE MISS (HỤT)'}
                          </span>
                        </div>
                        {trace.semantic_cache?.hit && (
                          <div className="mt-2 space-y-1.5 border-t border-stone-200 pt-2 text-stone-600">
                            <div className="text-emerald-700 italic">⚡ Lối tắt: Trả trực tiếp câu trả lời trong bộ nhớ đệm, bỏ qua các bước sau.</div>
                            <div><span className="font-semibold text-stone-700">Cosine Similarity:</span> {(trace.semantic_cache.similarity * 100).toFixed(1)}%</div>
                            {trace.semantic_cache.cached_sources && (
                              <div><span className="font-semibold text-stone-700">Cached Sources:</span> {trace.semantic_cache.cached_sources.length} sources</div>
                            )}
                          </div>
                        )}
                      </TimelineItem>

                      {/* Standard RAG Workflow steps (Only if Cache MISS) */}
                      {!trace.semantic_cache?.hit && (
                        <>
                          {/* Step 5: LangGraph Workflow */}
                          <TimelineItem 
                            title="LangGraph Workflow" 
                            subtitle={language === 'vi' ? 'Khởi động máy trạng thái LangGraph' : 'Init LangGraph state engine flow'}
                            status="success" 
                            active={true}
                          >
                            <div className="font-mono text-[10px] text-stone-500">START → retrieve → grade_documents → generate / handle_no_answer</div>
                            <div className="text-emerald-700 font-semibold mt-1">✓ State graph initialized.</div>
                          </TimelineItem>

                          {/* Step 6: Retrieve: Classification & Entity */}
                          <TimelineItem 
                            title="Retrieve: Classification + Entity" 
                            subtitle={language === 'vi' ? 'Nhận dạng ý đồ & Thực thể lịch sử' : 'Intent categorization & entity extraction'}
                            status="success" 
                            active={true}
                          >
                            <div><span className="font-semibold text-stone-700">Intent category:</span> <span className="font-bold text-sky-700 uppercase">{trace.langgraph_workflow?.intent_detected || 'factual'}</span></div>
                            {trace.langgraph_workflow?.detailed_intent && (
                              <div><span className="font-semibold text-stone-700">Detailed intent:</span> <code className="bg-stone-150 px-1 py-0.5 rounded font-mono text-[10px]">{trace.langgraph_workflow.detailed_intent}</code></div>
                            )}
                            <div>
                              <span className="font-semibold text-stone-700">Entity Resolved:</span>{' '}
                              {trace.langgraph_workflow?.entity_detected 
                                ? <span className="font-bold text-amber-700">{trace.langgraph_workflow.entity_display || trace.langgraph_workflow.entity_detected}</span>
                                : <span className="text-stone-400">None</span>
                              }
                            </div>
                            <div><span className="font-semibold text-stone-700">Priority:</span> prioritized pending_knowledge (unapproved) checked</div>
                          </TimelineItem>

                          {/* Step 7: Multi-source FAISS Retrieval */}
                          <TimelineItem 
                            title="Multi-source FAISS Retrieval" 
                            subtitle={language === 'vi' ? 'Truy xuất tài liệu đa nguồn' : 'FAISS search across various indexes'}
                            status="success" 
                            active={true}
                          >
                            <div className="flex gap-4 mb-2 text-stone-500 font-bold">
                              <div>{language === 'vi' ? 'Ghi chú riêng' : 'User Notes'}: <span className="text-rose-700">{documentSourcesCount.userRag}</span></div>
                              <div>{language === 'vi' ? 'Lịch sử sử liệu' : 'History Index'}: <span className="text-amber-700">{documentSourcesCount.globalHist}</span></div>
                              <div>{language === 'vi' ? 'Tài liệu hệ thống' : 'System PDF'}: <span className="text-stone-750">{documentSourcesCount.systemRag}</span></div>
                            </div>
                            
                            {trace.langgraph_workflow?.retrieved_documents && trace.langgraph_workflow.retrieved_documents.length > 0 ? (
                              <div className="space-y-2 max-h-[180px] overflow-y-auto border border-stone-200 rounded-xl p-3 bg-white scrollbar-hide">
                                {trace.langgraph_workflow.retrieved_documents.map((doc: any, i: number) => {
                                  let tag = language === 'vi' ? 'HỆ THỐNG' : 'SYSTEM';
                                  let tagColor = 'bg-stone-100 text-stone-700';
                                  if (doc.is_user_rag) {
                                    tag = language === 'vi' ? 'GHI CHÚ RIÊNG' : 'USER NOTE';
                                    tagColor = 'bg-rose-100 text-rose-700';
                                  } else if (doc.is_global_history) {
                                    tag = language === 'vi' ? 'TƯ LIỆU SỬ' : 'HISTORY INDEX';
                                    tagColor = 'bg-amber-100 text-amber-750';
                                  } else if (doc.is_pending) {
                                    tag = language === 'vi' ? 'ĐANG TỰ HỌC' : 'SELF-LEARNING';
                                    tagColor = 'bg-indigo-100 text-indigo-700';
                                  }
                                  
                                  return (
                                    <div key={i} className="text-[11px] pb-2 last:pb-0 border-b border-stone-100 last:border-0">
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-stone-700 truncate max-w-[200px]">
                                          [{i+1}] {doc.source} {doc.page ? `(Trang ${doc.page})` : ''}
                                        </span>
                                        <div className="flex gap-1.5 items-center shrink-0">
                                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${tagColor}`}>{tag}</span>
                                          <span className="text-[10px] text-stone-400 font-mono">{(doc.score * 100).toFixed(0)}%</span>
                                        </div>
                                      </div>
                                      <p className="text-stone-500 leading-normal italic line-clamp-1">"{doc.content}"</p>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-stone-400 italic">{language === 'vi' ? 'Không tìm thấy tài liệu nào' : 'No documents retrieved'}</div>
                            )}
                          </TimelineItem>

                          {/* Step 8: Adaptive Re-ranking */}
                          <TimelineItem 
                            title="Adaptive Re-ranking" 
                            subtitle={language === 'vi' ? 'Tái sắp xếp độ ưu tiên ngữ nghĩa và lịch sử' : 'Calculate combined relevance score'}
                            status="success" 
                            active={true}
                          >
                            <div className="font-mono text-[10px] text-stone-600 bg-stone-150 p-2 rounded-lg border border-stone-200">
                              final = α•semantic + β•temporal + γ•causal
                            </div>
                            <div><span className="font-semibold text-stone-700">Entity-aware weighting:</span> Applied (+15% bonus for target historical figures/eras)</div>
                            <div><span className="font-semibold text-stone-700">Personal Knowledge priority:</span> Prioritized User RAG chunks first.</div>
                          </TimelineItem>

                          {/* Step 9: Grade & Filter Documents */}
                          <TimelineItem 
                            title="Grade & Filter Documents" 
                            subtitle={language === 'vi' ? 'Bộ lọc độ tin cậy và sự phù hợp' : 'Keyword overlap & relevance check'}
                            status="success" 
                            active={true}
                          >
                            <div><span className="font-semibold text-stone-700">Grading Mode:</span> Fast Keyword/Entity Filter (Default)</div>
                            <div><span className="font-semibold text-stone-700">LLM DocumentGrader:</span> Checked (Verified context relatedness)</div>
                          </TimelineItem>

                          {/* Step 10: Suitable Documents Available? */}
                          <TimelineItem 
                            title="Suitable Documents Available?" 
                            subtitle={language === 'vi' ? 'Quyết định lựa chọn luồng tri thức' : 'Decision point for response strategy'}
                            status={trace.langgraph_workflow?.suitable_documents_available ? "success" : "warning"} 
                            active={true}
                          >
                            <div>
                              <span className="font-semibold text-stone-700">{language === 'vi' ? 'Trạng thái tài liệu' : 'Documents status'}:</span>{' '}
                              <span className={`px-2 py-0.5 rounded font-black text-[10px] uppercase ${
                                trace.langgraph_workflow?.suitable_documents_available 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {trace.langgraph_workflow?.suitable_documents_available 
                                  ? (language === 'vi' ? 'CÓ (Sử dụng tri thức nội bộ)' : 'YES (Internal Knowledge)')
                                  : (language === 'vi' ? 'KHÔNG (Kích hoạt Web Fallback)' : 'NO (Trigger Web Fallback)')
                                }
                              </span>
                            </div>

                            {/* Branch A: Generate RAG Answer */}
                            {trace.langgraph_workflow?.suitable_documents_available && (
                              <div className="mt-3 space-y-2 border-t border-stone-200/60 pt-3 text-[11px]">
                                <div className="text-stone-850 font-bold uppercase tracking-wider">🌿 Nhánh A: Generate RAG Answer</div>
                                <div><span className="font-semibold text-stone-700">AnswerGenerator:</span> Injected retrieved contexts and last 6 messages.</div>
                                <div><span className="font-semibold text-stone-700">Quality Control:</span> Stripped source metadata and remapped references to sequential brackets [i].</div>
                                <div><span className="font-semibold text-stone-700">Bilingual check:</span> VietnamHistoryLanguageAgent checked (VI target grammar).</div>
                              </div>
                            )}

                            {/* Branch B: Web Learning Fallback */}
                            {trace.web_fallback?.triggered && (
                              <div className="mt-3 space-y-2 border-t border-stone-200/60 pt-3 text-[11px]">
                                <div className="text-amber-800 font-bold uppercase tracking-wider">🔥 Nhánh B: Web Learning Agent</div>
                                
                                <div className="pl-2 border-l-2 border-amber-300 space-y-1.5 mt-2">
                                  {/* Web Crawler */}
                                  <div>
                                    <span className="font-bold text-stone-700 uppercase text-[9px] block">1. Search & Crawl Sources</span>
                                    <span className="text-stone-500">DuckDuckGo Search queries resolved. Prioritized Vietnamese history sites (<code className="font-mono text-[10px]">.gov.vn</code>, museums).</span>
                                    {trace.web_fallback.crawled_urls && trace.web_fallback.crawled_urls.length > 0 && (
                                      <ul className="list-disc list-inside mt-1 pl-1 space-y-0.5 text-stone-500 font-mono text-[9px]">
                                        {trace.web_fallback.crawled_urls.map((url: string, i: number) => (
                                          <li key={i} className="truncate max-w-[420px]">{url}</li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>

                                  {/* LLM Verification */}
                                  <div className="pt-1.5 border-t border-stone-200/50">
                                    <span className="font-bold text-stone-700 uppercase text-[9px] block">2. LLM Verification</span>
                                    <span className="text-stone-500">Cross-checked crawled chunks for contradictions or hallucination elements.</span>
                                  </div>

                                  {/* Web Data Reliable? */}
                                  <div className="pt-1.5 border-t border-stone-200/50">
                                    <span className="font-bold text-stone-700 uppercase text-[9px] block">3. Web Data Reliable?</span>
                                    <div>
                                      <span className="text-stone-500">{language === 'vi' ? 'Kết quả xác minh' : 'Verification score'}:</span>{' '}
                                      <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${
                                        trace.web_fallback.web_data_reliable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                      }`}>
                                        {trace.web_fallback.web_data_reliable 
                                          ? (language === 'vi' ? 'KHẢ TÍN (Reliable)' : 'RELIABLE') 
                                          : (language === 'vi' ? 'KHÔNG ĐỦ BẰNG CHỨNG (Unreliable)' : 'UNRELIABLE / INSUFFICIENT')
                                        }
                                      </span>
                                    </div>
                                  </div>

                                  {/* pending_knowledge */}
                                  {trace.web_fallback.is_pending_knowledge && (
                                    <div className="bg-indigo-50 border border-indigo-150 p-2.5 rounded-xl text-indigo-900 italic mt-2">
                                      💡 **pending_knowledge**: Đã tự động lưu câu hỏi và câu trả lời vào kho chờ duyệt để Admin kiểm duyệt và đưa vào FAISS tự học.
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </TimelineItem>
                        </>
                      )}

                      {/* Step 11: Save and Return */}
                      <TimelineItem 
                        title="Save and Return" 
                        subtitle={language === 'vi' ? 'Lưu trữ log, cập nhật cache và trả kết quả' : 'Deduct token, cache QA and stream SSE'}
                        status="success" 
                        active={true}
                        isLast={true}
                        time={trace.step_times?.total_elapsed_ms ? `${(trace.step_times.total_elapsed_ms / 1000).toFixed(2)}s` : undefined}
                      >
                        <div><span className="font-semibold text-stone-700">Database Log:</span> <span className="text-emerald-700 font-bold">✓ Saved</span> (chat_logs table updated)</div>
                        {!trace.semantic_cache?.hit && (
                          <div><span className="font-semibold text-stone-700">Semantic Cache Update:</span> QA embedding stored for future search</div>
                        )}
                        <div><span className="font-semibold text-stone-700">SSE Stream:</span> [DONE] payload pushed to Client</div>
                        <div>
                          <span className="font-semibold text-stone-700">{language === 'vi' ? 'Hình thức phản hồi' : 'Response mode'}:</span>{' '}
                          <span className="font-bold text-stone-750 uppercase">
                            {trace.semantic_cache?.hit 
                              ? 'Semantic Cache (Bypass)' 
                              : (trace.web_fallback?.triggered ? 'Web Fallback Agent' : 'Standard RAG System')}
                          </span>
                        </div>
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
