
export interface User {
  id: number;
  username: string;
  email: string;
  token_balance: number;
  is_admin: boolean;
  full_name?: string;
  picture_url?: string;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface SourceInfo {
  filename: string;
  content: string;
  page?: string | number;
  is_web?: boolean;
  url?: string;
}

export interface ChatMessage {
  id: string | number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokens_charged?: number;
  sources?: (string | SourceInfo)[];
  rating?: number;
  likes_count?: number;       // Số like toàn cục (cho progress bar)
  related_questions?: string[]; // Câu hỏi gợi ý liên quan
  animate?: boolean;
  isStreaming?: boolean;       // Đang nhận SSE token theo thời gian thực
}

export interface ChatResponse {
  answer: string;
  message_id?: number;
  tokens_charged: number;
  user_token_balance: number;
  sources?: SourceInfo[];
  related_questions?: string[]; // Câu hỏi gợi ý liên quan
  conversation_id?: number;
  status?: 'completed' | 'queued' | 'running' | 'failed';
  job_id?: string;
  progress?: number;
}

export interface ChatJobStatus {
  job_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | string;
  progress: number;
  message?: string;
  result?: ChatResponse | null;
  error?: string | null;
}

export interface PaymentPackage {
  id: number;
  name: string;
  tokens: number;
  amount_vnd: number;
}

export interface PaymentInvoice {
  payment_id: number;
  amount_vnd: number;
  qr_url: string;
  note: string;
}

export interface PaymentStatus {
  status: 'pending' | 'completed' | 'failed';
  tokens: number;
}

export interface QAReward {
  key: string;
  amount: number;
  description: string;
  new_balance?: number;
}

export interface QAStatus {
  today: string;
  is_sunday: boolean;
  checkin: {
    claimed: boolean;
    reward_today: number;
    streak_count: number;
  };
  quiz: {
    total_today: number;
    answered_today: number;
    correct_today: number;
    milestones: Array<{
      key: string;
      target: number;
      amount: number;
      label: string;
    }>;
    rewards_claimed: Array<{
      reward_key: string;
      amount: number;
    }>;
  };
  token_balance: number;
}

export interface QAQuestion {
  id: string;
  question_key: string;
  question: string;
  options: string[];
  era: string;
  difficulty: 'easy' | 'medium' | 'hard' | string;
  answered?: boolean;
  selected_index?: number;
  is_correct?: boolean;
  correct_answer_index?: number;
  explanation?: string;
}

export interface QAQuestionsResponse {
  question_date: string;
  questions: QAQuestion[];
  status: QAStatus;
}

export interface QACheckinResponse {
  claimed: boolean;
  message: string;
  awards: QAReward[];
  status: QAStatus;
}

export interface QAAnswerResponse {
  question_key: string;
  selected_index: number;
  is_correct: boolean;
  correct_answer_index: number;
  explanation: string;
  rewards: QAReward[];
  status: QAStatus;
  new_balance: number;
}

export type View = 'chat' | 'payment' | 'admin' | 'profile' | 'new_chat' | 'landing' | 'history' | 'qa' | 'personal-rag';
 
export interface SiteConfig {
  logo_url: string;
  site_title: string;
  landing_bg: string;
  chat_bg: string;
  favicon_url: string;
  game_enabled?: number;
  landing_hero_title?: string;
  landing_hero_subtitle?: string;
  landing_section_eras_title?: string;
  landing_section_stats_title?: string;
  landing_section_features_title?: string;
  landing_eras_json?: string;
  landing_footer_company?: string;
  landing_footer_mst?: string;
  landing_footer_representative?: string;
  landing_footer_address?: string;
  landing_footer_phone?: string;
  landing_footer_about_us?: string;
  landing_footer_terms?: string;
  landing_footer_privacy?: string;
  landing_hero_words?: string;
  landing_process_json?: string;
  landing_features_json?: string;
  landing_stats_json?: string;
  landing_highlights_json?: string;
  landing_contact_email?: string;
  landing_contact_zalo_num?: string;
  landing_contact_zalo_link?: string;
  landing_contact_fb_link?: string;
  app_landing_texts?: string;
  app_landing_heroes?: string;
  app_landing_badge?: string;
  app_landing_motto?: string;
}

export interface UserRagItem {
  id: number;
  user_id: number;
  conversation_id?: number;
  message_id?: number;
  original_question?: string;
  assistant_answer?: string;
  selected_text?: string;
  corrected_text?: string;
  content: string;
  content_type: string; // 'manual_note' | 'correction' | 'personal_context' | etc.
  tags?: string;
  metadata_json?: string;
  created_at: string;
  updated_at: string;
}

