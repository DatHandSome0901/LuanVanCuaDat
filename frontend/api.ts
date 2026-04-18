
import { AuthResponse, ChatResponse, PaymentPackage, PaymentInvoice, PaymentStatus, User } from './types';

export const API_ROOT = (process.env.API_URL as string) || 'http://localhost:2643';
const BASE_URL = `${API_ROOT}/api/v1`;

const getHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const api = {
  // Auth
  async login(formData: FormData): Promise<AuthResponse> {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Đăng nhập thất bại');
    return response.json();
  },

  async register(formData: FormData): Promise<{ message: string }> {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
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
    const response = await fetch(`${BASE_URL}/auth/google/login`);
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

async getSiteConfig(): Promise<{
  logo_url: string,
  site_title: string,
  landing_bg: string
}> {
  const response = await fetch(`${BASE_URL}/admin/settings`, {
    headers: getHeaders(), // 🔥 cần token admin
  });

  if (!response.ok) throw new Error('Không thể tải cấu hình website');

  return response.json();
},

//
async getPublicSettings() {
  const res = await fetch(`${BASE_URL}/admin/public/settings`);
  return res.json();
},
  // Payment
  async getPackages(): Promise<{ packages: PaymentPackage[] }> {
    const response = await fetch(`${BASE_URL}/payment/packages`);
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
      headers: getHeaders(),
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
    seo_description: string,
    seo_keywords: string,
    seo_author: string,
    favicon_url: string,
    no_answer_fallback: string,
    rate_per_1000: number
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
    site_title?: string,
    seo_description?: string,
    seo_keywords?: string,
    seo_author?: string,
    no_answer_fallback?: string
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

};

// ===============================
// CONVERSATIONS
// ===============================

export const getConversations = async () => {

  const res = await fetch(`${API_ROOT}/api/v1/conversations`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`
    }
  });

  return res.json();
};


export const deleteConversation = async (id: number) => {

  const res = await fetch(`${API_ROOT}/api/v1/conversation/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`
    }
  });

  return res.json();

  
};


 


