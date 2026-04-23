
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
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokens_charged?: number;
  sources?: (string | SourceInfo)[];
}

export interface ChatResponse {
  answer: string;
  tokens_charged: number;
  user_token_balance: number;
  sources?: SourceInfo[];
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

export type View = 'chat' | 'payment' | 'admin' | 'profile' | 'new_chat' | 'landing' | 'history';