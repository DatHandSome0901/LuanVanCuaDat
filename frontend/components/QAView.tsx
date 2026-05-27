import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Flame,
  Gift,
  Loader2,
  Sparkles,
  Target,
  Trophy,
  XCircle,
  ChevronRight,
  Award
} from 'lucide-react';
import { api, API_ROOT } from '../api';
import { QAQuestion, QAStatus, User, View } from '../types';

const LeaderboardAvatar: React.FC<{ src: string; username: string }> = ({ src, username }) => {
  const [error, setError] = useState(false);
  if (error || !src) {
    return (
      <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center text-xs font-black uppercase text-stone-500 border border-stone-200">
        {username ? username[0] : '?'}
      </div>
    );
  }
  const finalSrc = src.startsWith('/') ? `${API_ROOT}${src}` : src;
  return (
    <img 
      src={finalSrc} 
      alt={username} 
      className="w-8 h-8 rounded-lg object-cover border border-stone-200" 
      referrerPolicy="no-referrer"
      onError={() => setError(true)} 
    />
  );
};

interface QAViewProps {
  user: User;
  onBalanceUpdate: (balance: number) => void;
  onNavigate?: (view: View) => void;
}

const difficultyLabel: Record<string, string> = {
  easy: 'Dễ',
  medium: 'Vừa',
  hard: 'Khó'
};

const difficultyColor: Record<string, string> = {
  easy: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  medium: 'bg-amber-50 text-amber-700 border-amber-100',
  hard: 'bg-rose-50 text-rose-700 border-rose-100'
};

const fireConfetti = () => {
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.75 },
    colors: ['#a81d1d', '#d97706', '#047857', '#1d4ed8']
  });
};

const fireMilestoneConfetti = () => {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 35, spread: 360, ticks: 60, zIndex: 1000 };

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval: any = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
  }, 250);
};

const QAView: React.FC<QAViewProps> = ({ user, onBalanceUpdate, onNavigate }) => {
  const [status, setStatus] = useState<QAStatus | null>(null);
  const [questions, setQuestions] = useState<QAQuestion[]>([]);
  const [questionDate, setQuestionDate] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [answeringKey, setAnsweringKey] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<'current' | 'last'>('current');

  const activeQuestion = questions[activeIndex];
  const currentBalance = status?.token_balance ?? user.token_balance ?? 0;

  const claimedRewardKeys = useMemo(() => {
    return new Set(status?.quiz.rewards_claimed.map((reward) => reward.reward_key) || []);
  }, [status]);

  const loadQA = async () => {
    setIsLoading(true);
    try {
      const data = await api.getQAQuestions();
      setQuestions(data.questions);
      setQuestionDate(data.question_date);
      setStatus(data.status);
      onBalanceUpdate(data.status.token_balance);

      const firstOpen = data.questions.findIndex((question) => !question.answered);
      setActiveIndex(firstOpen >= 0 ? firstOpen : 0);
      try {
        const boardData = await api.getQALeaderboard();
        setLeaderboard(boardData);
      } catch (boardErr) {
        console.error("Lỗi khi tải bảng xếp hạng:", boardErr);
      }
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải Q&A');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQA();
  }, []);

  const handleCheckin = async () => {
    setIsCheckingIn(true);
    try {
      const data = await api.claimQACheckin();
      setStatus(data.status);
      onBalanceUpdate(data.status.token_balance);

      if (data.awards.length > 0) {
        const total = data.awards.reduce((sum, award) => sum + award.amount, 0);
        toast.success(`Điểm danh thành công: +${total} token`);
        fireConfetti();
      } else {
        toast('Bạn đã điểm danh hôm nay rồi.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Điểm danh thất bại');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleAnswer = async (question: QAQuestion, selectedIndex: number) => {
    if (question.answered || answeringKey) return;

    setAnsweringKey(question.question_key);
    try {
      const data = await api.answerQAQuestion({
        question_key: question.question_key,
        selected_index: selectedIndex,
        question_date: questionDate
      });

      setQuestions((prev) =>
        prev.map((item) =>
          item.question_key === question.question_key
            ? {
              ...item,
              answered: true,
              selected_index: data.selected_index,
              is_correct: data.is_correct,
              correct_answer_index: data.correct_answer_index,
              explanation: data.explanation
            }
            : item
        )
      );

      setStatus(data.status);
      onBalanceUpdate(data.new_balance);

      if (data.is_correct) {
        toast.success('Chính xác!');
        fireConfetti();
        try {
          const boardData = await api.getQALeaderboard();
          setLeaderboard(boardData);
        } catch (boardErr) {
          console.error(boardErr);
        }
      } else {
        toast.error('Chưa đúng rồi.');
      }

      if (data.rewards.length > 0) {
        const total = data.rewards.reduce((sum, reward) => sum + reward.amount, 0);
        toast.success(`Mốc thưởng Q&A: +${total} token`);
        setTimeout(() => {
          fireMilestoneConfetti();
        }, 400);
      }
    } catch (err: any) {
      toast.error(err.message || 'Không thể gửi câu trả lời');
    } finally {
      setAnsweringKey(null);
    }
  };

  const goNextOpen = () => {
    const nextOpen = questions.findIndex((question, index) => index > activeIndex && !question.answered);
    if (nextOpen >= 0) {
      setActiveIndex(nextOpen);
      return;
    }

    const firstOpen = questions.findIndex((question) => !question.answered);
    if (firstOpen >= 0) setActiveIndex(firstOpen);
  };

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center p-8 bg-stone-50/50">
        <div className="flex flex-col items-center gap-3 text-stone-500 font-bold">
          <Loader2 className="w-10 h-10 animate-spin text-red-800" />
          <span className="text-sm tracking-wide">Đang mở Sử Quán Q&A...</span>
        </div>
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-8 max-w-[1440px] mx-auto w-full overflow-y-auto pb-24 md:pb-8 bg-stone-50/20"
    >
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col gap-5 border-b border-stone-200 pb-6 lg:flex-row lg:items-center lg:justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-red-800 to-red-950 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-900/10 shrink-0">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight uppercase leading-none">
              Sử Quán Q&A
            </h2>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.2em] mt-1.5 flex items-center gap-1.5">
              <span>Hỏi đáp lịch sử Việt Nam</span>
              <span className="inline-block w-1 h-1 rounded-full bg-stone-300"></span>
              <span className="text-red-800">Nhận token miễn phí hằng ngày</span>
            </p>
          </div>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => onNavigate?.('payment')}
          className="flex items-center gap-3.5 rounded-2xl border border-amber-200 bg-amber-50/80 backdrop-blur-sm px-5 py-3.5 text-amber-950 shadow-sm cursor-pointer group/balance"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center text-red-950 font-serif font-black shadow-[0_0_10px_rgba(251,191,36,0.5)] border border-amber-300 shrink-0">
            史
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-black text-amber-600">Số dư tài khoản</p>
            <p className="text-2xl font-black leading-tight text-amber-900">{currentBalance.toFixed(2)} <span className="text-xs font-bold">token</span></p>
          </div>
        </motion.div>
      </motion.header>

      {/* Grid of status stats */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-5 lg:grid-cols-3"
      >
        {/* Daily Checkin */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-stone-400">Điểm danh hôm nay</p>
              <h3 className="mt-2 text-3xl font-black text-stone-900 flex items-baseline gap-1">
                +{status?.checkin.reward_today || 0}
                <span className="text-xs font-bold text-stone-500 uppercase">token</span>
              </h3>
              <div className="mt-2.5 flex items-center gap-1.5 bg-red-50 text-red-800 px-2.5 py-1 rounded-lg text-xs font-bold w-fit">
                <Flame className="w-3.5 h-3.5 fill-red-800" />
                Chuỗi hiện tại: {status?.checkin.streak_count || 0} ngày
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-800 group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-6 h-6" />
            </div>
          </div>

          <button
            onClick={handleCheckin}
            disabled={status?.checkin.claimed || isCheckingIn}
            className={`mt-6 w-full rounded-xl px-4 py-3.5 text-sm font-black uppercase tracking-widest transition-all ${status?.checkin.claimed
              ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
              : 'bg-red-800 text-white hover:bg-red-900 shadow-md shadow-red-800/10 active:scale-[0.98]'
              }`}
          >
            {isCheckingIn ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Đang nhận...
              </span>
            ) : status?.checkin.claimed ? (
              'Đã nhận hôm nay'
            ) : (
              'Nhận điểm danh'
            )}
          </button>
        </motion.div>

        {/* Progress Q&A */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-stone-400">Tiến độ Q&A hôm nay</p>
              <h3 className="mt-2 text-3xl font-black text-stone-900">
                {status?.quiz.correct_today || 0}/{status?.quiz.total_today || 0}
                <span className="text-xs font-bold text-stone-500 uppercase ml-1">Đúng</span>
              </h3>
              <p className="mt-2 text-xs font-semibold text-stone-500">
                Đã trả lời {status?.quiz.answered_today || 0} / {status?.quiz.total_today || 5} câu hỏi
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-6">
            <div className="h-2.5 overflow-hidden rounded-full bg-stone-100 border border-stone-50">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(100, ((status?.quiz.correct_today || 0) / Math.max(1, status?.quiz.total_today || 1)) * 100)}%`
                }}
                transition={{ type: 'spring' as const, stiffness: 80, damping: 15 }}
                className="h-full rounded-full bg-gradient-to-r from-red-800 to-amber-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Milestones */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-stone-400">Mốc thưởng đặc biệt</p>
              <h3 className="mt-2 text-3xl font-black text-stone-900 flex items-baseline gap-1">
                Quiz
                <span className="text-xs font-bold text-stone-500 uppercase">Hôm nay</span>
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 group-hover:scale-110 transition-transform">
              <Gift className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {status?.quiz.milestones.map((milestone) => {
              const claimed = claimedRewardKeys.has(milestone.key);
              return (
                <div
                  key={milestone.key}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2 text-xs transition-colors ${claimed
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-100/50'
                    : 'bg-stone-50 text-stone-700 border border-stone-100'
                    }`}
                >
                  <span className="font-bold flex items-center gap-1.5">
                    {claimed ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <Award className="w-4 h-4 text-stone-400 shrink-0" />}
                    {milestone.target} câu đúng
                  </span>
                  <span className={`font-black ${claimed ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {claimed ? 'Đã nhận' : `+${milestone.amount} token`}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.section>

      {/* Main content grid */}
      <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        {/* Left column: Question Board */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm flex flex-col justify-between min-h-[480px]">
          <AnimatePresence mode="wait">
            {activeQuestion ? (
              <motion.div
                key={activeQuestion.question_key}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex flex-col justify-between"
              >
                <div>
                  <div className="mb-6 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-red-50 border border-red-100 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-red-800">
                      Câu {activeIndex + 1}/{questions.length}
                    </span>
                    <span className="rounded-full bg-amber-50 border border-amber-100 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-700">
                      {activeQuestion.era}
                    </span>
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${difficultyColor[activeQuestion.difficulty] || 'bg-stone-100 text-stone-600'}`}>
                      {difficultyLabel[activeQuestion.difficulty] || activeQuestion.difficulty}
                    </span>
                  </div>

                  <h3 className="text-xl md:text-2xl font-black leading-snug text-stone-900 pr-4">
                    {activeQuestion.question}
                  </h3>

                  <div className="mt-8 grid grid-cols-1 gap-3.5 md:grid-cols-2">
                    {activeQuestion.options.map((option, index) => {
                      const isAnswered = activeQuestion.answered;
                      const isSelected = activeQuestion.selected_index === index;
                      const isCorrect = activeQuestion.correct_answer_index === index;
                      const isWrongSelected = isAnswered && isSelected && !isCorrect;
                      const isCorrectAnswer = isAnswered && isCorrect;

                      return (
                        <motion.button
                          key={option}
                          disabled={isAnswered || answeringKey === activeQuestion.question_key}
                          onClick={() => handleAnswer(activeQuestion, index)}
                          whileHover={!isAnswered ? { scale: 1.015, y: -2 } : {}}
                          whileTap={!isAnswered ? { scale: 0.985 } : {}}
                          animate={isWrongSelected ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                          transition={isWrongSelected ? { duration: 0.4 } : {}}
                          className={`min-h-[76px] rounded-2xl border-2 px-5 py-4 text-left transition-all flex items-center justify-between gap-4 ${isCorrectAnswer
                            ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 shadow-sm shadow-emerald-100'
                            : isWrongSelected
                              ? 'border-rose-500 bg-rose-50/50 text-rose-950 shadow-sm shadow-rose-100'
                              : isAnswered
                                ? 'border-stone-100 bg-stone-50/30 text-stone-400 cursor-default'
                                : 'border-stone-200 bg-white text-stone-800 hover:border-red-300 hover:bg-red-50/10 cursor-pointer shadow-sm hover:shadow'
                            }`}
                        >
                          <div className="flex items-start gap-3.5">
                            <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black transition-colors ${isCorrectAnswer
                              ? 'bg-emerald-600 text-white'
                              : isWrongSelected
                                ? 'bg-rose-600 text-white'
                                : 'bg-stone-100 text-stone-600'
                              }`}>
                              {String.fromCharCode(65 + index)}
                            </span>
                            <span className="font-bold leading-relaxed text-sm md:text-base">{option}</span>
                          </div>

                          <div className="shrink-0">
                            {isCorrectAnswer && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                                <CheckCircle2 className="h-4.5 w-4.5" />
                              </motion.div>
                            )}
                            {isWrongSelected && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full bg-rose-600 flex items-center justify-center text-white">
                                <XCircle className="h-4.5 w-4.5" />
                              </motion.div>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {answeringKey === activeQuestion.question_key && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 flex items-center gap-2 text-sm font-black text-amber-700 bg-amber-50 border border-amber-100/60 rounded-xl px-4 py-3 w-fit"
                    >
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sử Quán Agent đang chấm đáp án...
                    </motion.div>
                  )}
                </div>

                {/* Explanation Card */}
                {activeQuestion.answered && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    transition={{ type: 'spring' as const, stiffness: 90 }}
                    className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-inner"
                  >
                    <div className="flex items-center gap-2 text-amber-800">
                      <Sparkles className="w-4 h-4" />
                      <p className="text-[11px] font-black uppercase tracking-widest">Giải thích lịch sử</p>
                    </div>
                    <p className="mt-2 text-sm font-semibold leading-relaxed text-stone-700">
                      {activeQuestion.explanation}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={goNextOpen}
                      className="mt-5 rounded-xl bg-stone-900 hover:bg-red-800 px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition-colors flex items-center gap-1.5 shadow-md shadow-stone-900/10"
                    >
                      Câu tiếp theo <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-stone-400 font-bold text-center">
                <Trophy className="w-14 h-14 text-stone-300 mb-3" />
                <p>Chưa có câu hỏi hôm nay.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Right column: Question list sidebar */}
        <aside className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm flex flex-col justify-between h-fit">
          <div>
            <div className="mb-5 flex items-center gap-2 border-b border-stone-100 pb-3">
              <Trophy className="w-5 h-5 text-amber-600" />
              <h3 className="font-black text-stone-950 text-base">Bộ câu hỏi hôm nay</h3>
            </div>

            <div className="space-y-2.5">
              {questions.map((question, index) => {
                const isActive = activeIndex === index;
                return (
                  <motion.button
                    key={question.question_key}
                    onClick={() => setActiveIndex(index)}
                    whileHover={{ x: 3 }}
                    className={`w-full rounded-xl border p-3 text-left transition-all flex items-center justify-between gap-3 ${isActive
                      ? 'border-red-300 bg-red-50/50 shadow-sm shadow-red-50'
                      : 'border-stone-150 bg-stone-50 hover:border-stone-300'
                      }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black transition-colors ${isActive ? 'bg-red-800 text-white' : 'bg-white text-stone-600 border border-stone-100'
                        }`}>
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-black text-stone-800">{question.era}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mt-0.5">
                          {question.answered ? (question.is_correct ? 'Đúng' : 'Chưa đúng') : 'Chưa trả lời'}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {question.answered && (
                        question.is_correct
                          ? <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          : <XCircle className="h-5 w-5 text-rose-600" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-stone-100 bg-stone-50/50 p-4">
            <div className="flex items-center gap-2 text-stone-900">
              <Flame className="w-5 h-5 text-red-600 fill-red-50" />
              <span className="font-black text-sm">Thưởng chuỗi ngày</span>
            </div>
            <p className="mt-2 text-xs font-semibold leading-relaxed text-stone-500">
              Điểm danh liên tục mỗi 7 ngày để nhận quà tặng đặc biệt <span className="text-red-800 font-bold">+10 token</span>!
            </p>
          </div>
        </aside>
      </section>

      {/* Bảng Xếp Hạng Tuần */}
      <motion.section
        variants={itemVariants}
        className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-100 pb-5 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-stone-900 text-lg uppercase tracking-tight">Bảng Xếp Hạng Đại Cát</h3>
              <p className="text-[11px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">Xếp hạng Q&A theo tuần • Thưởng lớn cho Top 3</p>
            </div>
          </div>

          <div className="flex items-center bg-stone-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setActiveLeaderboardTab('current')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeLeaderboardTab === 'current'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-400 hover:text-stone-600'
                }`}
            >
              Tuần này
            </button>
            <button
              onClick={() => setActiveLeaderboardTab('last')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeLeaderboardTab === 'last'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-400 hover:text-stone-600'
                }`}
            >
              Tuần trước (Vinh danh)
            </button>
          </div>
        </div>

        {leaderboard ? (
          <div>
            {activeLeaderboardTab === 'current' ? (
              <div>
                <div className="bg-amber-50/50 border border-amber-100/50 rounded-xl px-4 py-3 text-xs font-semibold text-amber-900 mb-4 flex items-center justify-between">
                  <span>Tuần này: <strong>{new Date(leaderboard.current_week.start_date).toLocaleDateString()}</strong> đến <strong>{new Date(leaderboard.current_week.end_date).toLocaleDateString()}</strong></span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg">Cập nhật liên tục</span>
                </div>

                {leaderboard.current_week.board.length === 0 ? (
                  <div className="py-8 text-center text-stone-400 font-bold text-xs italic">
                    Chưa có sử gia nào trả lời đúng câu hỏi trong tuần này. Hãy là người đầu tiên!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-stone-100 text-[10px] font-black uppercase text-stone-400 tracking-wider">
                          <th className="pb-3 text-center w-12">Hạng</th>
                          <th className="pb-3">Sử gia</th>
                          <th className="pb-3 text-center">Đúng tuần này</th>
                          <th className="pb-3 text-right">Mức thưởng dự kiến</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.current_week.board.map((row: any) => {
                          const rewardText = row.rank === 1 ? '+5 Token' : row.rank === 2 ? '+3 Token' : row.rank === 3 ? '+1 Token' : '-';
                          const rewardColor = row.rank === 1 ? 'text-amber-600 font-black' : row.rank === 2 ? 'text-stone-600 font-bold' : row.rank === 3 ? 'text-amber-800 font-bold' : 'text-stone-400';
                          return (
                            <tr key={row.user_id} className={`border-b border-stone-50 last:border-0 hover:bg-stone-50/40 transition-colors ${row.user_id === user.id ? 'bg-red-50/20' : ''}`}>
                              <td className="py-4 text-center">
                                {row.rank === 1 ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-black text-xs">🥇</span>
                                ) : row.rank === 2 ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-stone-100 text-stone-700 font-black text-xs">🥈</span>
                                ) : row.rank === 3 ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-850 font-black text-xs">🥉</span>
                                ) : (
                                  <span className="text-stone-400 font-bold text-xs">{row.rank}</span>
                                )}
                              </td>
                              <td className="py-4">
                                <div className="flex items-center gap-3">
                                  <LeaderboardAvatar src={row.picture_url} username={row.username} />
                                  <div>
                                    <p className="text-xs font-black text-stone-900">{row.full_name || row.username}</p>
                                    <p className="text-[10px] text-stone-400">@{row.username} {row.user_id === user.id && <span className="text-red-800 font-bold">(Bạn)</span>}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 text-center font-bold text-xs text-stone-800">
                                {row.correct_count} câu
                              </td>
                              <td className={`py-4 text-right text-xs ${rewardColor}`}>
                                {rewardText}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-xl px-4 py-3 text-xs font-semibold text-emerald-950 mb-4 flex items-center justify-between">
                  <span>Tuần trước: <strong>{new Date(leaderboard.last_week.start_date).toLocaleDateString()}</strong> đến <strong>{new Date(leaderboard.last_week.end_date).toLocaleDateString()}</strong></span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">Đã phát thưởng tự động</span>
                </div>

                {leaderboard.last_week.board.length === 0 ? (
                  <div className="py-8 text-center text-stone-400 font-bold text-xs italic">
                    Không có người chiến thắng tuần trước.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-stone-100 text-[10px] font-black uppercase text-stone-400 tracking-wider">
                          <th className="pb-3 text-center w-12">Hạng</th>
                          <th className="pb-3">Sử gia</th>
                          <th className="pb-3 text-right">Phần thưởng đã nhận</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.last_week.board.map((row: any) => {
                          return (
                            <tr key={row.user_id} className={`border-b border-stone-50 last:border-0 hover:bg-stone-50/40 transition-colors ${row.user_id === user.id ? 'bg-red-50/20' : ''}`}>
                              <td className="py-4 text-center">
                                {row.rank === 1 ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-black text-xs">🏆 1</span>
                                ) : row.rank === 2 ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-stone-100 text-stone-700 font-black text-xs">🥈 2</span>
                                ) : row.rank === 3 ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-800 font-black text-xs">🥉 3</span>
                                ) : (
                                  <span className="text-stone-400 font-bold text-xs">{row.rank}</span>
                                )}
                              </td>
                              <td className="py-4">
                                <div className="flex items-center gap-3">
                                  <LeaderboardAvatar src={row.picture_url} username={row.username} />
                                  <div>
                                    <p className="text-xs font-black text-stone-900">{row.full_name || row.username}</p>
                                    <p className="text-[10px] text-stone-400">@{row.username} {row.user_id === user.id && <span className="text-red-800 font-bold">(Bạn)</span>}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 text-right text-xs text-emerald-600 font-black">
                                +{row.reward_amount} Token
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-stone-400 font-bold text-xs flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-red-800" />
            Đang tải dữ liệu bảng xếp hạng...
          </div>
        )}
      </motion.section>
    </motion.div>
  );
};

export default QAView;
