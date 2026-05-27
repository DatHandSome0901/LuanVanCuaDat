
import { Capacitor } from '@capacitor/core';
import {
  AuthResponse,
  ChatResponse,
  ChatJobStatus,
  PaymentPackage,
  PaymentInvoice,
  PaymentStatus,
  User,
  SiteConfig,
  QAStatus,
  QAQuestionsResponse,
  QACheckinResponse,
  QAAnswerResponse
} from './types';

const isNative = Capacitor.isNativePlatform();
const isDev = import.meta.env.DEV;

// Lấy IP từ URL hiện tại nếu đang chạy Web để hỗ trợ mạng LAN
const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(currentHostname);

// IP mặc định cho điện thoại thật (Dùng trực tiếp IP LAN để ổn định nhất)
const DEFAULT_NATIVE_API = 'https://rehydrate-doing-crust.ngrok-free.dev';

// Logic chọn API URL:
// - LAN access (isIP=true, e.g. 192.168.1.8:3000): dùng cùng IP, cổng 2643
// - localhost: dùng localhost:2643 (dev)
// - Vercel/production: dùng VITE_API_URL (set trong Vercel env vars)
const getDefaultWebApi = (): string => {
  if (isIP) {
    // Truy cập qua LAN → dùng IP hiện tại với cổng backend
    return `http://${currentHostname}:2643`;
  }
  if (currentHostname === 'localhost' || isDev) {
    return 'http://localhost:2643';
  }
  // Production (Vercel, public domain) → phải dùng VITE_API_URL
  return '';
};

// @ts-ignore
const envApiUrl = import.meta.env.VITE_API_URL || process.env.API_URL;

export const API_ROOT = isNative 
  ? ((envApiUrl && envApiUrl !== 'http://localhost') ? envApiUrl : DEFAULT_NATIVE_API) 
  : (envApiUrl || getDefaultWebApi());

console.log("DEBUG: Connection Details", { 
  isNative, 
  isDev, 
  API_ROOT,
  vite_api_env: import.meta.env.VITE_API_URL 
});

const BASE_URL = `${API_ROOT}/api/v1`;

const getHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'cf-skip-tunnel-reminder': 'true', // Bỏ qua trang cảnh báo của Cloudflare Tunnel
    'ngrok-skip-browser-warning': 'true', // 🔥 Bỏ qua trang cảnh báo của Ngrok
  };
};

export const api = {
  // Auth
  async login(formData: FormData): Promise<AuthResponse> {
    const url = `${BASE_URL}/auth/login`;
    console.warn("DEBUG: Mobile Gọi API -> ", url);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'cf-skip-tunnel-reminder': 'true',
          'ngrok-skip-browser-warning': 'true' 
        },
        body: formData,
      });
      if (!response.ok) throw new Error('Đăng nhập thất bại (Server error)');
      return response.json();
    } catch (err: any) {
      console.error("Fetch Error:", err);
      throw new Error(`Không thể kết nối tới Backend tại: ${url}. (Lỗi: ${err.message})`);
    }
  },

  async register(formData: FormData): Promise<{ message: string }> {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 
        'cf-skip-tunnel-reminder': 'true',
        'ngrok-skip-browser-warning': 'true' 
      },
      body: formData,
    });
    if (!response.ok) throw new Error('Đăng ký thất bại');
    return response.json();
  },

  async checkAuth(): Promise<User> {
    const response = await fetch(`${BASE_URL}/auth/check`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Phiên làm việc hết hạn');
    const data = await response.json();
    return data.user;
  },

  async getGoogleLoginUrl(): Promise<string> {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    // Nếu chạy trên App (Capacitor), dùng deep link chatbot://callback để Android OS tự bắt lại
    const redirectTarget = isNative ? 'chatbot://callback' : origin;
    const response = await fetch(`${BASE_URL}/auth/google/login?frontend_url=${encodeURIComponent(redirectTarget)}`, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    const data = await response.json();
    return data.auth_url;
  },

  // Chat
  async sendMessage(question: string): Promise<ChatResponse> {
    const response = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Không thể gửi tin nhắn');
    }
    return response.json();
  },

  async getChatJobStatus(jobId: string): Promise<ChatJobStatus> {
    const response = await fetch(`${BASE_URL}/chat/jobs/${jobId}`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Không thể kiểm tra trạng thái công việc');
    }
    return response.json();
  },

  async getChatHistory(): Promise<{ history: any[] }> {
    const response = await fetch(`${BASE_URL}/history`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Không thể tải lịch sử chat');
    return response.json();
  },

  async deleteChatHistory(): Promise<{ message: string }> {
    const response = await fetch(`${BASE_URL}/history`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Không thể xóa lịch sử chat');
    return response.json();
  },

  async rateMessage(messageId: number, rating: number): Promise<{ status: string; likes_count?: number; note?: string }> {
    const response = await fetch(`${BASE_URL}/message/${messageId}/rate`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rating }),
    });
    if (!response.ok) throw new Error('Không thể gửi đánh giá');
    return response.json();
  },

async getSiteConfig(): Promise<{
  logo_url: string,
  site_title: string,
  landing_bg: string,
  chat_bg: string
}> {
  const response = await fetch(`${BASE_URL}/admin/settings`, {
    headers: getHeaders(), // 🔥 cần token admin
  });

  if (!response.ok) throw new Error('Không thể tải cấu hình website');

  return response.json();
},

//
  async getPublicSettings(): Promise<SiteConfig> {
    const res = await fetch(`${BASE_URL}/admin/public/settings`, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    return res.json();
  },
  // Payment
  async getPackages(): Promise<{ packages: PaymentPackage[] }> {
    const response = await fetch(`${BASE_URL}/payment/packages`, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    if (!response.ok) throw new Error('Không thể tải gói nạp');
    return response.json();
  },

  async createInvoice(packageId: number): Promise<PaymentInvoice> {
    const formData = new FormData();
    formData.append('package_id', packageId.toString());
    const response = await fetch(`${BASE_URL}/payment/create`, {
      method: 'POST',
      headers: getHeaders(),
      body: formData,
    });
    if (!response.ok) throw new Error('Không thể tạo hóa đơn');
    return response.json();
  },

  async getPaymentStatus(paymentId: number): Promise<PaymentStatus> {
    const response = await fetch(`${BASE_URL}/payment/status/${paymentId}`, {
      headers: { ...getHeaders() },
    });
    if (!response.ok) throw new Error('Không thể kiểm tra trạng thái');
    return response.json();
  },

  async getTokenHistory(): Promise<{ history: any[] }> {
    const response = await fetch(`${BASE_URL}/auth/tokens/history`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Không thể tải lịch sử giao dịch');
    return response.json();
  },

  async getQAStatus(): Promise<QAStatus> {
    const response = await fetch(`${BASE_URL}/qa/status`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Không thể tải thử thách Q&A');
    return response.json();
  },

  async claimQACheckin(): Promise<QACheckinResponse> {
    const response = await fetch(`${BASE_URL}/qa/checkin`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Không thể điểm danh');
    }
    return response.json();
  },

  async getQAQuestions(): Promise<QAQuestionsResponse> {
    const response = await fetch(`${BASE_URL}/qa/questions`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Không thể tải câu hỏi Q&A');
    return response.json();
  },

  async answerQAQuestion(payload: { question_key: string; selected_index: number; question_date?: string }): Promise<QAAnswerResponse> {
    const response = await fetch(`${BASE_URL}/qa/answer`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Không thể gửi câu trả lời');
    }
    return response.json();
  },

  async getQALeaderboard(): Promise<any> {
    const response = await fetch(`${BASE_URL}/qa/leaderboard`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Không thể tải bảng xếp hạng Q&A');
    return response.json();
  },

  // Admin
  async adminGetUsers(): Promise<{ users: any[] }> {
    const response = await fetch(`${BASE_URL}/admin/users`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Không thể tải danh sách người dùng');
    return response.json();
  },

  async adminUpdateUserBalance(userId: number, adjustment: number | { type: string, amount: number }): Promise<any> {
    const body = typeof adjustment === 'number' ? { token_balance: adjustment } : adjustment;
    const response = await fetch(`${BASE_URL}/admin/users/${userId}/balance`, {
      method: 'POST',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error('Cập nhật số dư thất bại');
    return response.json();
  },

  async adminDeleteUser(userId: number): Promise<any> {
    const response = await fetch(`${BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Xóa người dùng thất bại');
    return response.json();
  },

  async adminGetUserDetail(userId: number): Promise<{ user: any, token_history: any[], chat_logs: any[] }> {
    const response = await fetch(`${BASE_URL}/admin/users/${userId}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Không thể tải chi tiết người dùng');
    return response.json();
  },

  async adminUpdateUser(userId: number, data: { full_name?: string, password?: string, token_balance?: number, is_admin?: number }): Promise<any> {
    const response = await fetch(`${BASE_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Cập nhật người dùng thất bại');
    return response.json();
  },

  async userProfileUpdate(data: { full_name?: string, picture_url?: string, current_password?: string, new_password?: string }): Promise<any> {
    const response = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.detail || 'Cập nhật hồ sơ thất bại');
    }
    return response.json();
  },

  async adminGetPackages(): Promise<{ packages: PaymentPackage[] }> {
    const response = await fetch(`${BASE_URL}/admin/packages`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Không thể tải danh sách gói nạp');
    return response.json();
  },

  async adminCreatePackage(pkg: { name: string, tokens: number, amount_vnd: number }): Promise<any> {
    const response = await fetch(`${BASE_URL}/admin/packages`, {
      method: 'POST',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(pkg),
    });
    if (!response.ok) throw new Error('Tạo gói nạp thất bại');
    return response.json();
  },

  async adminDeletePackage(packageId: number): Promise<any> {
    const response = await fetch(`${BASE_URL}/admin/packages/${packageId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Xóa gói nạp thất bại');
    return response.json();
  },

  async adminUpdatePackage(packageId: number, pkg: { name: string, tokens: number, amount_vnd: number }): Promise<any> {
    const response = await fetch(`${BASE_URL}/admin/packages/${packageId}`, {
      method: 'PUT',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(pkg),
    });
    if (!response.ok) throw new Error('Cập nhật gói nạp thất bại');
    return response.json();
  },

  async adminGetTokenHistory(): Promise<{ history: any[] }> {
    const response = await fetch(`${BASE_URL}/admin/token-history`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Không thể tải lịch sử token toàn hệ thống');
    return response.json();
  },

  async adminGetPayments(): Promise<{ payments: any[] }> {
    const response = await fetch(`${BASE_URL}/admin/payments`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Không thể tải lịch sử thanh toán');
    return response.json();
  },

  async adminGetChatLogs(): Promise<{ logs: any[] }> {
    const response = await fetch(`${BASE_URL}/admin/chat-logs`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Không thể tải lịch sử chat');
    return response.json();
  },

  async adminGetSettings(): Promise<{
    rate: number,
    logo_url: string,
    site_title: string,
    landing_bg: string,
    chat_bg: string,
    seo_description: string,
    seo_keywords: string,
    seo_author: string,
    favicon_url: string,
    no_answer_fallback: string,
    rate_per_1000: number,
    llm_name: string
  }> {
    const response = await fetch(`${BASE_URL}/admin/settings`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Không thể tải cấu hình hệ thống');
    return response.json();
  },

  async adminSyncFromHtml(): Promise<any> {
    const response = await fetch(`${BASE_URL}/admin/sync-from-html`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Đồng bộ từ link HTML thất bại');
    return response.json();
  },

  async adminUpdateSettings(settings: {
    rate_per_1000?: number,
    logo_url?: string,
    favicon_url?: string,
    landing_bg?: string,
    chat_bg?: string,
    site_title?: string,
    seo_description?: string,
    seo_keywords?: string,
    seo_author?: string,
    no_answer_fallback?: string,
    llm_name?: string
  }): Promise<any> {
    const response = await fetch(`${BASE_URL}/admin/settings`, {
      method: 'POST',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!response.ok) throw new Error('Cập nhật cấu hình thất bại');
    return response.json();
  },

  async adminUploadLogo(file: File): Promise<{ logo_url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${BASE_URL}/admin/upload-logo`, {
      method: 'POST',
      headers: getHeaders(),
      body: formData,
    });
    if (!response.ok) throw new Error('Tải lên logo thất bại');
    return response.json();
  },

  async adminGetActiveUsers(): Promise<{ logins: any[] }> {
    const response = await fetch(`${BASE_URL}/admin/active-users`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Không thể tải danh sách người dùng online');
    return response.json();
  },

  async adminGetPaymentReports(): Promise<{ reports: any[] }> {
    const response = await fetch(`${BASE_URL}/admin/payment-reports`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Không thể tải danh sách báo cáo thanh toán');
    return response.json();
  },

  async createPaymentReport(paymentId: number, description?: string): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append('payment_id', paymentId.toString());
    if (description) formData.append('description', description);

    const response = await fetch(`${BASE_URL}/payment/report`, {
      method: 'POST',
      headers: getHeaders(),
      body: formData,
    });
    if (!response.ok) throw new Error('Không thể gửi báo cáo thanh toán');
    return response.json();
  },
  // ===============================
    // KNOWLEDGE
    // ===============================

//     async adminGetKnowledge(): Promise<{ data: any[] }> {
//       const response = await fetch(`${BASE_URL}/admin/knowledge/pending`, {
//         headers: getHeaders(),
//       });
//       if (!response.ok) throw new Error('Không thể tải knowledge');
//       return response.json();
//     },

//     async adminApproveKnowledge(id: number): Promise<any> {
//       const response = await fetch(`${BASE_URL}/admin/knowledge/approve/${id}`, {
//         method: 'POST',
//         headers: getHeaders(),
//       });
//       if (!response.ok) throw new Error('Duyệt thất bại');
//       return response.json();
//     },

//     async adminDeleteKnowledge(id: number): Promise<any> {
//       const response = await fetch(`${BASE_URL}/admin/knowledge/${id}`, {
//         method: 'DELETE',
//         headers: getHeaders(),
//       });
//       if (!response.ok) throw new Error('Xóa thất bại');
//       return response.json();
//     },
      
// };
// ===============================
// KNOWLEDGE
// ===============================

  async adminGetKnowledge(): Promise<{ data: any[] }> {
    const response = await fetch(`${BASE_URL}/admin/knowledge/pending`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Không thể tải knowledge');
    return response.json();
  },

  async adminGetApprovedKnowledge(): Promise<{ data: any[] }> {
    const response = await fetch(`${BASE_URL}/admin/knowledge/approved`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Không thể tải lịch sử');
    return response.json();
  },

  async adminApproveKnowledge(id: number): Promise<any> {
    const response = await fetch(`${BASE_URL}/admin/knowledge/approve/${id}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Duyệt thất bại');
    }
    return response.json();
  },

  async adminDeleteKnowledge(id: number): Promise<any> {
    const response = await fetch(`${BASE_URL}/admin/knowledge/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Xóa thất bại');
    return response.json();
  },

  // Feedback Management
  async adminGetNegativeFeedback(): Promise<any[]> {
    const response = await fetch(`${BASE_URL}/admin/feedback/negative`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Không thể tải danh sách phản hồi tiêu cực');
    return response.json();
  },

  async adminMoveToPending(messageId: number): Promise<{ msg: string }> {
    const response = await fetch(`${BASE_URL}/admin/feedback/${messageId}/to-pending`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Chuyển sang hàng chờ thất bại');
    return response.json();
  },

};

// ===============================
// CONVERSATIONS
// ===============================

export const getConversations = async () => {
  const token = localStorage.getItem("access_token");
  if (!token) return { history: [] };
  
  const res = await fetch(`${API_ROOT}/api/v1/conversations`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    }
  });
  if (!res.ok) return { history: [] };
  return res.json();
};

export const deleteConversation = async (id: number) => {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API_ROOT}/api/v1/conversation/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    }
  });
  return res.json();
};

export const updateConversation = async (id: number, data: {title?: string, note?: string, is_pinned?: boolean}) => {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API_ROOT}/api/v1/conversation/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    },
    body: JSON.stringify(data)
  });
  return res.json();
};


 


