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
  // Deletion fields
  deletion_requested?: boolean;
  deletion_reason?: string;
  deletion_requested_at?: string;
  deletion_status?: 'pending' | 'approved' | 'rejected';
  deletion_admin_note?: string;
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

  async getPopularCampaigns(type: 'donations' | 'random' = 'donations', limit: number = 5): Promise<Campaign[]> {
    try {
      const response = await axiosInstance.get('/campaigns/popular', {
        params: { type, limit }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch popular campaigns');
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
      console.log('Stats API response:', response.data);
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

  async createCampaign(data: FormData): Promise<Campaign> {
    try {
      const response = await axiosInstance.post('/campaigns', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  async updateCampaign(slug: string, data: FormData | Partial<{
    title: string;
    description: string;
    content: string;
    target_amount: number;
    end_date: string;
    category_id: number;
    organizer_name?: string;
    organizer_contact?: string;
    image?: File;
    images?: File[];
    is_featured?: boolean;
    status?: string;
  }>): Promise<Campaign> {
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

      const response = await axiosInstance.put(`/campaigns/${slug}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  async deleteCampaign(slug: string): Promise<void> {
    try {
      await axiosInstance.delete(`/campaigns/${slug}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete campaign');
    }
  },

  async getFundraiserCampaigns(params: {
    status?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    search?: string;
    page?: number;
    per_page?: number;
  } = {}): Promise<{
    data: Campaign[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
    per_page: number;
  }> {
    try {
      const response = await axiosInstance.get('/fundraiser/campaigns', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch fundraiser campaigns');
    }
  },

  async requestCampaignDeletion(slug: string, reason: string): Promise<{message: string, data?: any}> {
    try {
      const response = await axiosInstance.post(`/campaigns/${slug}/request-deletion`, {
        reason
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to request campaign deletion');
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

  // User Profile
  async updateProfile(data: {
    name: string;
    phone?: string;
    address?: string;
    bio?: string;
    avatar?: File;
  }): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.phone) formData.append('phone', data.phone);
      if (data.address) formData.append('address', data.address);
      if (data.bio) formData.append('bio', data.bio);
      if (data.avatar) formData.append('avatar', data.avatar);

      const response = await axiosInstance.put('/user/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  async changePassword(data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<any> {
    try {
      const response = await axiosInstance.put('/user/password', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  },

  // Activity Registrations
  async getActivityRegistrations(params: {
    page?: number;
    status?: 'pending' | 'confirmed' | 'cancelled';
  } = {}): Promise<{
    data: any[];
    meta: {
      current_page: number;
      last_page: number;
      total: number;
    };
  }> {
    try {
      const response = await axiosInstance.get('/activity-registrations', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch activity registrations');
    }
  },

  async cancelActivityRegistration(registrationId: number): Promise<void> {
    try {
      await axiosInstance.patch(`/activity-registrations/${registrationId}/cancel`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel activity registration');
    }
  },

  async registerForActivity(activityId: number, data: { notes?: string } = {}): Promise<any> {
    try {
      const response = await axiosInstance.post(`/activity-registrations/activities/${activityId}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to register for activity');
    }
  },

  // Utility methods for direct API calls
  get: (url: string, config?: any) => axiosInstance.get(url, config),
  post: (url: string, data?: any, config?: any) => axiosInstance.post(url, data, config),
  put: (url: string, data?: any, config?: any) => axiosInstance.put(url, data, config),
  patch: (url: string, data?: any, config?: any) => axiosInstance.patch(url, data, config),
  delete: (url: string, config?: any) => axiosInstance.delete(url, config),
};

// Admin API functions
export const adminApi = {
  // Dashboard
  getStats: () => axiosInstance.get('/admin/stats'),
  getActivities: () => axiosInstance.get('/admin/recent-activities'),
  getPendingApprovals: () => axiosInstance.get('/admin/pending-approvals'),
  
  // Quick approvals
  quickApproveFundraiser: (id: number) => axiosInstance.post(`/admin/quick-approve-fundraiser/${id}`),
  quickApproveCampaign: (id: number) => axiosInstance.post(`/admin/quick-approve-campaign/${id}`),
  
  // Users
  getUsers: (params?: {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
  }) => axiosInstance.get('/admin/users', { params }),
  
  createUser: (data: any) => axiosInstance.post('/admin/users', data),
  updateUser: (id: number, data: any) => axiosInstance.put(`/admin/users/${id}`, data),
  deleteUser: (id: number) => axiosInstance.delete(`/admin/users/${id}`),
  
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
  
  createCampaign: (data: any) => axiosInstance.post('/admin/campaigns', data),
  updateCampaign: (id: number, data: any) => axiosInstance.put(`/admin/campaigns/${id}`, data),
  deleteCampaign: (id: number) => axiosInstance.delete(`/admin/campaigns/${id}`),
  
  approveCampaign: (id: number) => axiosInstance.post(`/admin/campaigns/${id}/approve`),
  rejectCampaign: (id: number, reason?: string) => 
    axiosInstance.post(`/admin/campaigns/${id}/reject`, { reason }),
  
  // Activities  
  getAdminActivities: (params?: {
    status?: string;
    category?: string;
    search?: string;
    page?: number;
  }) => axiosInstance.get('/admin/activities', { params }),
  
  createActivity: (data: any) => axiosInstance.post('/admin/activities', data),
  updateActivity: (id: number, data: any) => axiosInstance.put(`/admin/activities/${id}`, data),
  deleteActivity: (id: number) => axiosInstance.delete(`/admin/activities/${id}`),
  
  approveActivity: (id: number) => axiosInstance.post(`/admin/activities/${id}/approve`),
  rejectActivity: (id: number, reason?: string) => 
    axiosInstance.post(`/admin/activities/${id}/reject`, { reason }),

  // News
  getNews: (params?: {
    status?: string;
    category?: string;
    search?: string;
    page?: number;
  }) => axiosInstance.get('/admin/news', { params }),
  
  createNews: (data: any) => axiosInstance.post('/admin/news', data),
  updateNews: (id: number, data: any) => axiosInstance.put(`/admin/news/${id}`, data),
  deleteNews: (id: number) => axiosInstance.delete(`/admin/news/${id}`),
  
  publishNews: (id: number) => axiosInstance.post(`/admin/news/${id}/publish`),
  archiveNews: (id: number) => axiosInstance.post(`/admin/news/${id}/archive`),

  // Donations
  getDonations: (params?: {
    status?: string;
    payment_method?: string;
    search?: string;
    page?: number;
  }) => axiosInstance.get('/admin/donations', { params }),
  
  updateDonationStatus: (id: number, status: string) => 
    axiosInstance.put(`/admin/donations/${id}/status`, { status }),
  
  refundDonation: (id: number, reason?: string) => 
    axiosInstance.post(`/admin/donations/${id}/refund`, { reason }),
  
  // Analytics
  getAnalytics: (params?: {
    start_date?: string;
    end_date?: string;
  }) => axiosInstance.get('/admin/analytics', { params }),

  // Settings
  getSettings: () => axiosInstance.get('/admin/settings'),
  updateSettings: (settings: any) => axiosInstance.put('/admin/settings', settings),
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

// Export individual functions for easier import
export const { 
  createCampaign, 
  updateCampaign, 
  deleteCampaign,
  getFundraiserCampaigns,
  requestCampaignDeletion,
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity
} = api;