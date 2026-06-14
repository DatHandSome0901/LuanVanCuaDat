import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '../../api';
import { useLanguage } from '../../contexts/LanguageContext';
import { Terminal, Send, AlertTriangle, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';


interface RagPlaygroundTabProps {
  initialQuestion?: string;
  onQuestionConsumed?: () => void;
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
      {!isLast && (
        <div className="absolute left-[9px] top-4 bottom-0 w-0.5 bg-stone-200" />
      )}
      
      <div className={`absolute left-0 top-1.5 w-[20px] h-[20px] rounded-full border-4 border-white flex items-center justify-center shadow-sm ${statusColor}`}>
        <span className="w-1.5 h-1.5 bg-white rounded-full" />
      </div>

      <div className={`transition-all duration-200 ${active ? 'opacity-100' : 'opacity-60'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-[11px] font-black text-stone-850 uppercase tracking-wider">{title}</h4>
            {subtitle && <p className="text-[9px] text-stone-400 italic mt-0.5">{subtitle}</p>}
          </div>
          {time && <span className="text-[9px] text-stone-400 font-mono font-bold">{time}</span>}
        </div>
        {active && children && (
          <div className="mt-2 bg-stone-50 border border-stone-150 rounded-2xl p-4 text-[11px] text-stone-600 space-y-1.5 leading-relaxed shadow-sm">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

const RagPlaygroundTab: React.FC<RagPlaygroundTabProps> = ({ initialQuestion = '', onQuestionConsumed }) => {
  const { language } = useLanguage();
  const [question, setQuestion] = useState(initialQuestion);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'json'>('timeline');


  useEffect(() => {
    if (initialQuestion) {
      setQuestion(initialQuestion);
      // Auto run if seeded
      handleTest(initialQuestion);
      if (onQuestionConsumed) onQuestionConsumed();
    }
  }, [initialQuestion]);

  const handleTest = async (testQuery: string) => {
    const q = testQuery || question;
    if (!q.trim()) return;

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Send message using the REST API to get direct trace_log
      const res = await api.sendMessage(q);
      setResponse(res);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Có lỗi xảy ra khi chạy RAG Pipeline.');
    } finally {
      setIsLoading(false);
    }
  };

  const trace = response?.trace_log;

  // Document counter helper
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-stone-200/60 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-red-800 rounded-2xl flex items-center justify-center text-white shadow-md">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-850">
              {language === 'vi' ? 'Sân Chơi Thử Nghiệm RAG' : 'RAG Playground & Sandbox'}
            </h2>
            <p className="text-xs text-stone-400">
              {language === 'vi' 
                ? 'Gửi câu hỏi và theo dõi trực quan luồng xử lý và vết chạy backend theo thời gian thực.' 
                : 'Send queries and watch backend processing flow in real time.'}
            </p>
          </div>
        </div>
      </div>

      {/* Input query bar */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/60 shadow-sm space-y-4">
        <label className="text-xs font-black uppercase tracking-wider text-stone-500 block">
          {language === 'vi' ? 'Nhập câu hỏi thử nghiệm' : 'Enter Test Query'}
        </label>
        <div className="flex gap-4">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTest(question)}
            placeholder={language === 'vi' ? 'Ví dụ: 2 bà trưng còn sống đúng không?...' : 'Enter inquiry...'}
            disabled={isLoading}
            className="flex-1 px-5 py-4 bg-stone-50 border border-stone-250 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm disabled:opacity-50"
          />
          <button
            onClick={() => handleTest(question)}
            disabled={isLoading || !question.trim()}
            className="px-6 py-4 bg-gradient-to-r from-amber-600 to-red-800 text-white rounded-2xl hover:scale-102 hover:shadow-md transition-all active:scale-98 flex items-center gap-2 font-bold text-sm disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{language === 'vi' ? 'Chạy thử nghiệm' : 'Test Query'}</span>
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-rose-50 border border-rose-150 p-6 rounded-3xl flex items-start gap-4 text-rose-900 shadow-sm">
          <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">{language === 'vi' ? 'Có lỗi xảy ra' : 'Error execution'}</h4>
            <p className="text-xs mt-1 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Results Workspace */}
      {(isLoading || response) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* Left Column: Response Output */}
          <div className="bg-white rounded-3xl border border-stone-200/60 shadow-sm p-6 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-stone-500 border-b border-stone-100 pb-3 flex items-center justify-between">
              <span>{language === 'vi' ? 'Lời giải đáp kết quả' : 'Answer response'}</span>
              {response && (
                <span className="text-[10px] font-mono text-stone-400 lowercase">
                  charged: {response.tokens_charged} credits • balance: {response.user_token_balance} credits
                </span>
              )}
            </h3>

            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-stone-400 italic">Đang chạy qua các tác vụ RAG...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-6 bg-stone-50 rounded-2xl text-stone-850 leading-relaxed text-sm shadow-inner markdown-body">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({children}) => <p className="mb-3 text-xs leading-relaxed">{children}</p>,
                      strong: ({children}) => <strong className="font-bold text-stone-900">{children}</strong>,
                      em: ({children}) => <em className="italic text-stone-700">{children}</em>,
                      ul: ({children}) => <ul className="list-disc list-inside mb-3 space-y-1 text-xs">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal list-inside mb-3 space-y-1 text-xs">{children}</ol>,
                      blockquote: ({children}) => <blockquote className="border-l-4 border-amber-400 pl-4 italic text-stone-600 my-3 bg-amber-50 py-2 rounded-r-lg">{children}</blockquote>,
                    }}
                  >
                    {response.answer || ''}
                  </ReactMarkdown>
                </div>

                {/* Sources list */}
                {response.sources && response.sources.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-wider text-stone-400">
                      {language === 'vi' ? 'Nguồn dẫn chứng' : 'Cited Sources'}
                    </label>
                    <div className="space-y-2">
                      {response.sources.map((src: any, index: number) => (
                        <div key={index} className="p-3 bg-stone-50 border border-stone-150 rounded-xl text-xs flex justify-between items-center gap-4">
                          <div className="truncate">
                            <span className="font-bold text-amber-800">[{index + 1}]</span>{' '}
                            <span className="font-bold text-stone-700">{src.filename}</span>
                            {src.page && <span className="text-stone-400 ml-1">(Trang {src.page})</span>}
                            <p className="text-[10px] text-stone-400 truncate italic mt-0.5">"{src.content}"</p>
                          </div>
                          {src.is_web && src.url && (
                            <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline shrink-0 font-bold text-[10px] uppercase">
                              link
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Execution Trace Timeline */}
          <div className="bg-white rounded-3xl border border-stone-200/60 shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-stone-500">
                {language === 'vi' ? 'Hành vết vận hành chi tiết' : 'Pipeline execution trace'}
              </h3>
              {trace && (
                <div className="flex bg-stone-100 p-1 rounded-xl text-[10px] font-bold">
                  <button
                    onClick={() => setViewMode('timeline')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'timeline' ? 'bg-white text-stone-850 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                  >
                    {language === 'vi' ? 'Sơ đồ luồng' : 'Timeline'}
                  </button>
                  <button
                    onClick={() => setViewMode('json')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'json' ? 'bg-white text-stone-850 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                  >
                    {language === 'vi' ? 'Dữ liệu JSON' : 'JSON Trace'}
                  </button>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-stone-400 italic">Đang thu thập dữ liệu hành vết...</p>
              </div>
            ) : trace ? (
              viewMode === 'json' ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-stone-400 italic font-sans">
                      {language === 'vi' ? 'Dữ liệu JSON hạn vết thô từ Backend' : 'Raw JSON trace logs from Backend'}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(trace, null, 2));
                        toast.success(language === 'vi' ? 'Đã sao chép vào bộ nhớ tạm!' : 'Copied JSON trace to clipboard!');
                      }}
                      className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-800 rounded-lg text-[9px] font-bold transition-all cursor-pointer"
                    >
                      {language === 'vi' ? 'Sao chép JSON' : 'Copy JSON'}
                    </button>
                  </div>
                  <pre className="bg-[#1e1e1a] text-amber-200/90 p-5 rounded-2xl text-[10px] font-mono overflow-auto max-h-[500px] border border-stone-200/50 shadow-inner scrollbar-thin">
                    {JSON.stringify(trace, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-300">

                
                {/* Node info box */}
                <div className="bg-[#1e1e1a] text-stone-300 p-4 rounded-xl flex flex-wrap gap-x-6 gap-y-2 text-[9px] font-mono border border-stone-200/50 shadow-inner">
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

                <div className="relative pl-1">
                  
                  {/* Step 1: User Query */}
                  <TimelineItem 
                    title="User Query" 
                    subtitle={language === 'vi' ? 'Nhận câu hỏi từ Frontend' : 'Inquiry request from Client'}
                    status="success" 
                    active={true}
                  >
                    <div><span className="font-semibold text-stone-700">{language === 'vi' ? 'Truy vấn thô' : 'Raw question'}:</span> "{trace.context_normalization?.raw_question || question}"</div>
                    <div><span className="font-semibold text-stone-700">API Endpoint:</span> <code className="bg-stone-200/60 px-1 py-0.5 rounded text-[9px] font-mono">/api/v1/chat</code></div>
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
                    <div><span className="font-semibold text-stone-700">{language === 'vi' ? 'Trừ phí đàm đạo' : 'Deducted credit'}:</span> <span className="text-amber-600 font-bold">-{response.tokens_charged} Tệ</span></div>
                    <div><span className="font-semibold text-stone-700">History Context:</span> Fetched last 6 messages from SQLite</div>
                  </TimelineItem>

                  {/* Step 3: Context Normalization */}
                  <TimelineItem 
                    title="Context Normalization" 
                    subtitle={language === 'vi' ? 'Dịch thuật & Làm rõ đại từ lịch sử' : 'Translation check & Coreference resolution'}
                    status="success" 
                    active={true}
                  >
                    <div><span className="font-semibold text-stone-700">{language === 'vi' ? 'Câu hỏi chuẩn hóa' : 'Resolved standalone question'}:</span> "{trace.context_normalization?.resolved_question || question}"</div>
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
                      <span className={`px-2 py-0.5 rounded font-black text-[9px] ${
                        trace.semantic_cache?.hit ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-800'
                      }`}>
                        {trace.semantic_cache?.hit ? 'CACHE HIT (TRÙNG KHỚP)' : 'CACHE MISS (HỤT)'}
                      </span>
                    </div>
                    {trace.semantic_cache?.hit && (
                      <div className="mt-2 space-y-1.5 border-t border-stone-200 pt-2 text-stone-600">
                        <div className="text-emerald-700 italic">⚡ Lối tắt: Trả trực tiếp câu trả lời trong bộ nhớ đệm, bỏ qua các bước sau.</div>
                        <div><span className="font-semibold text-stone-700">Cosine Similarity:</span> {(trace.semantic_cache.similarity * 100).toFixed(1)}%</div>
                      </div>
                    )}
                  </TimelineItem>

                  {!trace.semantic_cache?.hit && (
                    <>
                      {/* Step 5: LangGraph Workflow */}
                      <TimelineItem 
                        title="LangGraph Workflow" 
                        subtitle={language === 'vi' ? 'Khởi động máy trạng thái LangGraph' : 'Init LangGraph state engine flow'}
                        status="success" 
                        active={true}
                      >
                        <div className="font-mono text-[9px] text-stone-500">START → retrieve → grade_documents → generate / handle_no_answer</div>
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
                          <div><span className="font-semibold text-stone-700">Detailed intent:</span> <code className="bg-stone-150 px-1 py-0.5 rounded font-mono text-[9px]">{trace.langgraph_workflow.detailed_intent}</code></div>
                        )}
                        <div>
                          <span className="font-semibold text-stone-700">Entity Resolved:</span>{' '}
                          {trace.langgraph_workflow?.entity_detected 
                            ? <span className="font-bold text-amber-700">{trace.langgraph_workflow.entity_display || trace.langgraph_workflow.entity_detected}</span>
                            : <span className="text-stone-400">None</span>
                          }
                        </div>
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
                          <div className="space-y-2 max-h-[150px] overflow-y-auto border border-stone-200 rounded-xl p-3 bg-white scrollbar-hide">
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
                                <div key={i} className="text-[10px] pb-2 last:pb-0 border-b border-stone-100 last:border-0">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-stone-700 truncate max-w-[150px]">
                                      [{i+1}] {doc.source} {doc.page ? `(Trang ${doc.page})` : ''}
                                    </span>
                                    <div className="flex gap-1 items-center shrink-0">
                                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-black ${tagColor}`}>{tag}</span>
                                      <span className="text-[9px] text-stone-400 font-mono">{(doc.score * 100).toFixed(0)}%</span>
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
                        <div className="font-mono text-[9px] text-stone-600 bg-stone-150 p-2 rounded-lg border border-stone-200">
                          final = α•semantic + β•temporal + γ•causal
                        </div>
                        <div><span className="font-semibold text-stone-700">Entity-aware weighting:</span> Applied (+15% bonus/penalty check)</div>
                      </TimelineItem>

                      {/* Step 9: Grade & Filter Documents */}
                      <TimelineItem 
                        title="Grade & Filter Documents" 
                        subtitle={language === 'vi' ? 'Bộ lọc độ tin cậy và sự phù hợp' : 'Keyword overlap & relevance check'}
                        status="success" 
                        active={true}
                      >
                        <div><span className="font-semibold text-stone-700">Grading Mode:</span> Fast Keyword/Entity Filter (Default)</div>
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
                          <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase ${
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

                        {trace.langgraph_workflow?.suitable_documents_available && (
                          <div className="mt-3 space-y-2 border-t border-stone-200/60 pt-3 text-[10px]">
                            <div className="text-stone-850 font-bold uppercase tracking-wider">🌿 Nhánh A: Generate RAG Answer</div>
                            <div><span className="font-semibold text-stone-700">AnswerGenerator:</span> Injected retrieved contexts.</div>
                            <div><span className="font-semibold text-stone-700">Quality Control:</span> Stripped source metadata and remapped references.</div>
                          </div>
                        )}

                        {trace.web_fallback?.triggered && (
                          <div className="mt-3 space-y-2 border-t border-stone-200/60 pt-3 text-[10px]">
                            <div className="text-amber-800 font-bold uppercase tracking-wider">🔥 Nhánh B: Web Learning Agent</div>
                            <div className="pl-2 border-l-2 border-amber-300 space-y-1.5 mt-2">
                              <div>
                                <span className="font-bold text-stone-700 uppercase text-[8px] block">1. Search & Crawl Sources</span>
                                <span className="text-stone-500">DuckDuckGo Search queries resolved.</span>
                                {trace.web_fallback.crawled_urls && trace.web_fallback.crawled_urls.length > 0 && (
                                  <ul className="list-disc list-inside mt-1 pl-1 space-y-0.5 text-stone-500 font-mono text-[8px]">
                                    {trace.web_fallback.crawled_urls.map((url: string, i: number) => (
                                      <li key={i} className="truncate max-w-[200px]">{url}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                              <div className="pt-1.5 border-t border-stone-200/50">
                                <span className="font-bold text-stone-700 uppercase text-[8px] block">2. LLM Verification</span>
                                <span className="text-stone-500">Cross-checked crawled chunks.</span>
                              </div>
                              <div className="pt-1.5 border-t border-stone-200/50">
                                <span className="font-bold text-stone-700 uppercase text-[8px] block">3. Web Data Reliable?</span>
                                <div>
                                  <span className="text-stone-500">{language === 'vi' ? 'Kết quả xác minh' : 'Verification score'}:</span>{' '}
                                  <span className={`px-1.5 py-0.5 rounded font-bold text-[8px] ${
                                    trace.web_fallback.web_data_reliable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                  }`}>
                                    {trace.web_fallback.web_data_reliable 
                                      ? (language === 'vi' ? 'KHẢ TÍN' : 'RELIABLE') 
                                      : (language === 'vi' ? 'KHÔNG ĐỦ BẰNG CHỨNG' : 'UNRELIABLE')
                                    }
                                  </span>
                                </div>
                              </div>
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
                    <div><span className="font-semibold text-stone-700">Database Log:</span> <span className="text-emerald-700 font-bold">✓ Saved</span></div>
                    <div><span className="font-semibold text-stone-700">Response Mode:</span> <span className="font-bold text-stone-750 uppercase">{trace.semantic_cache?.hit ? 'Cache (Bypass)' : (trace.web_fallback?.triggered ? 'Web Fallback' : 'Standard RAG')}</span></div>
                  </TimelineItem>

                </div>
              </div>
            )) : (

              <div className="py-20 flex flex-col items-center justify-center space-y-4 text-stone-400 italic">
                <HelpCircle className="w-8 h-8" />
                <p className="text-xs">{language === 'vi' ? 'Gửi câu hỏi để tạo vết chạy' : 'Submit a query to generate trace'}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RagPlaygroundTab;
