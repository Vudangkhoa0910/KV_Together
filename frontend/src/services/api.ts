import axiosInstance from '@/lib/axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export interface Campaign {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  target_amount: number;
  current_amount: number;
  start_date: string;
  end_date: string;
  image: string | null;
  images: string[];
  image_url: string | null;
  images_url: string[];
  status: 'draft' | 'pending' | 'active' | 'rejected' | 'completed' | 'cancelled' | 'ended_partial' | 'ended_failed';
  rejection_reason?: string;
  is_featured: boolean;
  organizer: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    avatar_url?: string;
    bio?: string;
    phone?: string;
    address?: string;
    fundraiser_type?: string;
    status?: string;
  };
  organizer_details?: {
    name?: string;
    description?: string;
    website?: string;
    address?: string;
    hotline?: string;
    contact?: string;
  };
  categories: Category[];
  progress_percentage: number;
  days_remaining: number;
  // New status fields for better display control
  display_status?: 'completed' | 'stopped' | 'expired' | 'active' | 'pending' | 'rejected' | 'draft';
  status_color?: 'green' | 'yellow' | 'orange' | 'blue' | 'gray' | 'red';
  was_stopped_before_target?: boolean;
  created_at: string;
  updated_at: string;
  updates?: Update[];
  donations?: Donation[];
  donations_count?: number;
  time_left?: number; // For urgent campaigns
  urgency_level?: 'critical' | 'high' | 'medium'; // For urgent campaigns
}

export interface Update {
  id: number;
  content: string;
  created_at: string;
  image?: string;
}

export interface Donation {
  id: number;
  campaign_id: number;
  user_id: number;
  amount: number;
  message?: string;
  is_anonymous: boolean;
  funding_preference: string;
  rollover_consent: boolean;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  is_stats: number;
  payment_method: 'momo' | 'vnpay' | 'bank_transfer' | 'credits';
  transaction_id?: string;
  bank_name?: string;
  account_number?: string;
  bank_id?: number;
  created_at: string;
  updated_at: string;
  campaign: Campaign;
  donor?: {
    id: number;
    name: string;
    avatar?: string;
    avatar_url?: string;
  };
}

export interface Stats {
  // Thống kê chính cho campaigns page
  active_campaigns: number;
  total_donors: number;
  total_amount_raised: number;
  
  // Thống kê chi tiết cho admin
  total_campaigns: number;
  active_campaigns_count: number;
  completed_campaigns: number;
  pending_campaigns: number;
  total_donations_count: number;
  
  // Thống kê nâng cao mới
  avg_donation_amount: number;
  success_rate: number;
  this_month_donations: number;
  this_month_donors: number;
  completed_campaigns_amount: number;
  
  // Backwards compatibility
  projects: number;
  ambassadors: number;
  organizations: number;
  donations_count: number;
  total_amount: number;
}

export interface MonthlyStats {
  month: string;
  month_vi: string; // Backend trả về thêm trường này
  donations: number;
  amount: string | number; // Backend trả về string, cần convert
  donors: number;
  campaigns: number;
  start_date: string;
  end_date: string;
  top_donors: Array<{
    name: string;
    amount: number;
    created_at: string;
  }>;
}

export interface MonthlyStatsSummary {
  total_donations: number;
  total_amount: number;
  total_donors: number; // Đây là số unique donors thực tế
  total_campaigns: number;
  period_months: number;
  avg_donation_per_month: number;
  avg_amount_per_month: number;
}

export interface TopDonor {
  id: number;
  name: string;
  avatar_url?: string;
  total_donated: number;
  donations_count: number;
  last_donation_date: string;
  rank: number;
}

export interface TopOrganization {
  id: number;
  name: string;
  avatar_url?: string;
  bio?: string;
  address?: string;
  campaigns_count: number;
  total_raised: number;
  total_donations: number;
  rank: number;
}

export interface News {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  image?: string;
  image_url?: string;
  images?: string[];
  images_url?: string[];
  author_name?: string;
  author_id?: number;
  author?: {
    id: number;
    name: string;
    avatar_url?: string;
  };
  category: 'community' | 'event' | 'story' | 'announcement';
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  source?: string;
  published_date: string;
  views_count: number;
  excerpt?: string;
  read_time?: string;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  description: string;
  image?: string;
  image_url?: string;
  images?: string[];
  images_url?: string[];
  organizer_id: number;
  organizer_name?: string;
  organizer?: {
    id: number;
    name: string;
    avatar_url?: string;
  };
  category: 'event' | 'workshop' | 'community' | 'volunteer';
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  is_featured: boolean;
  location?: string;
  event_date: string;
  registration_deadline?: string;
  max_participants?: number;
  current_participants: number;
  registration_fee: number;
  contact_email?: string;
  contact_phone?: string;
  views_count: number;
  is_full: boolean;
  days_until_event: number;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar_url?: string;
  content: string;
  campaign?: {
    title: string;
    amount_raised: number;
  };
  rating: number;
}

export const api = {
  async getCategories(): Promise<Category[]> {
    try {
      const response = await axiosInstance.get('/categories');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch categories');
    }
  },

  async getCampaigns(params: {
    category?: string;
    sort?: string;
    search?: string;
    page?: number;
    per_page?: number;
  } = {}): Promise<{
    data: Campaign[];
    meta: {
      current_page: number;
      last_page: number;
      total: number;
    };
  }> {
    try {
      const response = await axiosInstance.get('/campaigns', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch campaigns');
    }
  },

  async getFeaturedCampaigns(): Promise<Campaign[]> {
    try {
      const response = await axiosInstance.get('/campaigns/featured');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch featured campaigns');
    }
  },

  async getCampaignBySlug(slug: string): Promise<Campaign> {
    try {
      console.log('Using getCampaignBySlug with slug:', slug);
      const response = await axiosInstance.get(`/campaigns/${slug}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch campaign');
    }
  },

  async getAllCampaigns(page = 1): Promise<{ data: Campaign[]; meta: any }> {
    try {
      const response = await axiosInstance.get('/campaigns', { params: { page } });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch campaigns');
    }
  },

  // Alias for getCampaignBySlug for backward compatibility
  async getCampaign(slug: string): Promise<Campaign> {
    console.log('Using getCampaign with slug:', slug);
    return this.getCampaignBySlug(slug);
  },

  async getStats(): Promise<Stats> {
    try {
      const response = await axiosInstance.get('/stats');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch stats');
    }
  },

  async getMonthlyStats(): Promise<{data: MonthlyStats[], summary: MonthlyStatsSummary}> {
    try {
      const response = await axiosInstance.get('/stats/monthly');
      return response.data; // API trả về {data: [...], summary: {...}}
    } catch (error: any) {
      console.error('Error fetching monthly stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch monthly stats');
    }
  },

  async getTopDonors(limit: number = 10, period: string = 'all'): Promise<{ data: TopDonor[]; period: string; total_donors: number }> {
    try {
      const response = await axiosInstance.get('/top-donors', { 
        params: { limit, period } 
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch top donors');
    }
  },

  async getTopOrganizations(limit: number = 10): Promise<{ data: TopOrganization[]; total_organizations: number }> {
    try {
      const response = await axiosInstance.get('/top-organizations', { 
        params: { limit } 
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch top organizations');
    }
  },

  async getRecentSuccessfulCampaigns(limit: number = 6): Promise<Campaign[]> {
    try {
      const response = await axiosInstance.get('/campaigns/recent-successful', { 
        params: { limit } 
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch recent successful campaigns');
    }
  },

  async getUrgentCampaigns(limit: number = 4): Promise<Campaign[]> {
    try {
      const response = await axiosInstance.get('/campaigns/urgent', { 
        params: { limit } 
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch urgent campaigns');
    }
  },

  async donate(campaignSlug: string, amount: number, message?: string, paymentMethod: string = 'bank_transfer', isAnonymous: boolean = false): Promise<any> {
    try {
      // Input validation
      if (!campaignSlug) {
        throw new Error('Mã chiến dịch không hợp lệ');
      }
      if (!amount || amount < 20000) {
        throw new Error('Số tiền quyên góp tối thiểu là 20,000đ');
      }
      if (message && message.length > 500) {
        throw new Error('Lời nhắn không được vượt quá 500 ký tự');
      }
      if (!['momo', 'vnpay', 'bank_transfer'].includes(paymentMethod)) {
        throw new Error('Phương thức thanh toán không hợp lệ');
      }

      // Get campaign and validate it exists
      const campaign = await this.getCampaignBySlug(campaignSlug);
      if (!campaign || !campaign.id) {
        throw new Error('Không tìm thấy chiến dịch');
      }

      // Check campaign status
      if (campaign.status !== 'active') {
        if (campaign.status === 'completed') {
          throw new Error('Chiến dịch đã đạt đủ mục tiêu. Cảm ơn tấm lòng của bạn! Vui lòng xem các chiến dịch khác đang cần hỗ trợ.');
        } else {
          throw new Error('Chiến dịch này hiện không nhận quyên góp');
        }
      }

      // Check if campaign is full or would exceed target
      const remainingAmount = campaign.target_amount - campaign.current_amount;
      if (remainingAmount <= 0) {
        throw new Error('Chiến dịch đã đạt đủ mục tiêu. Cảm ơn tấm lòng của bạn! Vui lòng xem các chiến dịch khác đang cần hỗ trợ.');
      }
      if (amount > remainingAmount) {
        throw new Error(`Chiến dịch chỉ còn cần ${new Intl.NumberFormat('vi-VN').format(remainingAmount)}đ để đạt mục tiêu. Vui lòng điều chỉnh số tiền quyên góp hoặc xem các chiến dịch khác.`);
      }

      // Send donation request with proper data validation
      const response = await axiosInstance.post(`/donations/${campaign.id}`, {
        amount: Math.floor(amount), // Ensure amount is an integer
        message: message?.trim(),
        payment_method: paymentMethod,
        is_anonymous: !!isAnonymous // Ensure boolean
      });

      return response.data;
    } catch (error: any) {
      // Improved error handling with specific messages
      if (error.response?.status === 401) {
        throw new Error('Vui lòng đăng nhập để quyên góp');
      } else if (error.response?.status === 400) {
        // Handle validation errors from server
        const message = error.response.data.message || 
                       (error.response.data.errors && Object.values(error.response.data.errors)[0]) ||
                       'Không thể quyên góp vào lúc này';
        throw new Error(message);
      } else if (error.response?.status === 403) {
        throw new Error('Bạn không có quyền thực hiện quyên góp');
      } else {
        throw new Error(error.message || 'Có lỗi xảy ra, vui lòng thử lại sau');
      }
    }
  },

  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    try {
      const response = await axiosInstance.post(`/auth/login`, { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to login');
    }
  },

  async register(userData: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ token: string; user: any }> {
    try {
      const response = await axiosInstance.post(`/auth/register`, userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to register');
    }
  },

  async logout(): Promise<void> {
    try {
      await axiosInstance.post(`/auth/logout`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to logout');
    } finally {
      localStorage.removeItem('token');
    }
  },

  async getNews(params: {
    category?: string;
    search?: string;
    featured?: boolean;
    page?: number;
  } = {}): Promise<{
    data: News[];
    meta: {
      current_page: number;
      last_page: number;
      total: number;
    };
  }> {
    try {
      const response = await axiosInstance.get('/news', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch news');
    }
  },

  async getFeaturedNews(limit: number = 3): Promise<News[]> {
    try {
      const response = await axiosInstance.get('/news/featured', { params: { limit } });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch featured news');
    }
  },

  async getNewsArticle(slug: string): Promise<{
    news: News;
    related: News[];
  }> {
    try {
      const response = await axiosInstance.get(`/news/${slug}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch news article');
    }
  },

  async getNewsCategories(): Promise<{id: string; name: string}[]> {
    try {
      const response = await axiosInstance.get('/news/categories');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch news categories');
    }
  },

  async createNews(data: FormData | {
    title: string;
    summary: string;
    content: string;
    category: string;
    image?: File;
    is_featured?: boolean;
    status?: string;
  }): Promise<News> {
    try {
      let formData: FormData;
      
      if (data instanceof FormData) {
        formData = data;
      } else {
        formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined) {
            if (value instanceof File) {
              formData.append(key, value);
            } else {
              formData.append(key, value.toString());
            }
          }
        });
      }

      const response = await axiosInstance.post('/news', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.news;
    } catch (error: any) {
      throw error;
    }
  },

  async updateNews(id: number, data: FormData | Partial<{
    title: string;
    summary: string;
    content: string;
    category: string;
    image?: File;
    is_featured?: boolean;
    status?: string;
  }>): Promise<News> {
    try {
      let formData: FormData;
      
      if (data instanceof FormData) {
        formData = data;
        formData.append('_method', 'PUT');
      } else {
        formData = new FormData();
        formData.append('_method', 'PUT');
        
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined) {
            if (value instanceof File) {
              formData.append(key, value);
            } else {
              formData.append(key, value.toString());
            }
          }
        });
      }

      const response = await axiosInstance.post(`/news/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.news;
    } catch (error: any) {
      throw error;
    }
  },

  async deleteNews(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`/news/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete news');
    }
  },

  // Activities API
  async getActivities(params: {
    category?: string;
    search?: string;
    featured?: boolean;
    author_id?: string;
    status?: string;
    page?: number;
  } = {}): Promise<{
    data: Activity[];
    meta: {
      current_page: number;
      last_page: number;
      total: number;
    };
  }> {
    try {
      const response = await axiosInstance.get('/activities', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch activities');
    }
  },

  async getFeaturedActivities(limit: number = 3): Promise<Activity[]> {
    try {
      const response = await axiosInstance.get('/activities/featured', { params: { limit } });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch featured activities');
    }
  },

  async getActivity(slug: string): Promise<Activity> {
    try {
      const response = await axiosInstance.get(`/activities/${slug}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch activity');
    }
  },

  async getActivityCategories(): Promise<{id: string; name: string}[]> {
    try {
      const response = await axiosInstance.get('/activities/categories');
      return Object.entries(response.data).map(([id, name]) => ({ id, name: name as string }));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch activity categories');
    }
  },

  async createActivity(data: FormData | {
    title: string;
    summary?: string;
    description: string;
    category: string;
    location: string;
    event_date: string;
    registration_deadline?: string;
    max_participants?: number;
    registration_fee?: number;
    contact_email?: string;
    contact_phone?: string;
    image?: File;
    images?: File[];
    is_featured?: boolean;
    status?: string;
  }): Promise<Activity> {
    try {
      let formData: FormData;
      
      if (data instanceof FormData) {
        formData = data;
      } else {
        formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined) {
            if (value instanceof File) {
              formData.append(key, value);
            } else if (Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
              value.forEach((file, index) => {
                formData.append(`${key}[${index}]`, file);
              });
            } else {
              formData.append(key, value.toString());
            }
          }
        });
      }

      const response = await axiosInstance.post('/activities', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  async updateActivity(slug: string, data: FormData | Partial<{
    title: string;
    summary?: string;
    description: string;
    category: string;
    location: string;
    event_date: string;
    registration_deadline?: string;
    max_participants?: number;
    registration_fee?: number;
    contact_email?: string;
    contact_phone?: string;
    image?: File;
    images?: File[];
    is_featured?: boolean;
    status?: string;
  }>): Promise<Activity> {
    try {
      let formData: FormData;
      
      if (data instanceof FormData) {
        formData = data;
        formData.append('_method', 'PUT');
      } else {
        formData = new FormData();
        formData.append('_method', 'PUT');
        
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined) {
            if (value instanceof File) {
              formData.append(key, value);
            } else if (Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
              value.forEach((file, index) => {
                formData.append(`${key}[${index}]`, file);
              });
            } else {
              formData.append(key, value.toString());
            }
          }
        });
      }

      const response = await axiosInstance.put(`/activities/${slug}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  async deleteActivity(slug: string): Promise<void> {
    try {
      await axiosInstance.delete(`/activities/${slug}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete activity');
    }
  },

  async getCompletedCampaigns(params: {
    category?: string;
    sort?: string;
    search?: string;
    page?: number;
    per_page?: number;
  } = {}): Promise<{
    data: Campaign[];
    meta: {
      current_page: number;
      last_page: number;
      total: number;
    };
  }> {
    try {
      const response = await axiosInstance.get('/campaigns/completed', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch completed campaigns');
    }
  },

  async getUserDonations(params: {
    page?: number;
    status?: string;
    payment_method?: string;
  } = {}): Promise<{
    data: Donation[];
    meta: {
      current_page: number;
      last_page: number;
      total: number;
    };
  }> {
    try {
      const response = await axiosInstance.get('/user/donations', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user donations');
    }
  },
};

// Admin API functions
export const adminApi = {
  // Dashboard
  getStats: () => axiosInstance.get('/admin/stats'),
  getActivities: () => axiosInstance.get('/admin/activities'),
  
  // Users
  getUsers: (params?: {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
  }) => axiosInstance.get('/admin/users', { params }),
  
  approveUser: (id: number) => axiosInstance.post(`/admin/users/${id}/approve`),
  suspendUser: (id: number) => axiosInstance.post(`/admin/users/${id}/suspend`),
  updateUserRole: (id: number, roleId: number) => 
    axiosInstance.put(`/admin/users/${id}/role`, { role_id: roleId }),
  
  // Campaigns
  getCampaigns: (params?: {
    status?: string;
    category?: string;
    search?: string;
    page?: number;
  }) => axiosInstance.get('/admin/campaigns', { params }),
  
  approveCampaign: (id: number) => axiosInstance.post(`/admin/campaigns/${id}/approve`),
  rejectCampaign: (id: number, reason?: string) => 
    axiosInstance.post(`/admin/campaigns/${id}/reject`, { reason }),
  
  // News
  getNews: (params?: {
    status?: string;
    category?: string;
    search?: string;
    page?: number;
  }) => axiosInstance.get('/admin/news', { params }),
  
  publishNews: (id: number) => axiosInstance.post(`/admin/news/${id}/publish`),
  archiveNews: (id: number) => axiosInstance.post(`/admin/news/${id}/archive`),
  deleteNews: (id: number) => axiosInstance.delete(`/admin/news/${id}`),
  
  // Donations
  getDonations: (params?: {
    status?: string;
    search?: string;
    page?: number;
  }) => axiosInstance.get('/admin/donations', { params }),
  
  // Analytics
  getAnalytics: (params?: {
    start_date?: string;
    end_date?: string;
  }) => axiosInstance.get('/admin/analytics', { params }),
};

// Wallet API functions
export const walletApi = {
  getWallet: () => axiosInstance.get('/wallet'),
  getTransactions: (params?: { per_page?: number; type?: string; start_date?: string; end_date?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    
    return axiosInstance.get(`/wallet/transactions?${queryParams.toString()}`);
  },
  getStatistics: () => axiosInstance.get('/wallet/statistics'),
  useCredits: (data: { campaign_id: number; amount: number; message?: string; is_anonymous?: boolean }) => 
    axiosInstance.post('/wallet/use-credits', data),
  transferCredits: (data: { recipient_email: string; amount: number; message?: string }) => 
    axiosInstance.post('/wallet/transfer', data),
};