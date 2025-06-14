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
  status: 'draft' | 'pending' | 'active' | 'rejected' | 'completed' | 'cancelled';
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
  created_at: string;
  updated_at: string;
  updates?: Update[];
  donations?: Donation[];
  donations_count?: number;
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
  created_at: string;
  updated_at: string;
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
  
  // Backwards compatibility
  projects: number;
  ambassadors: number;
  organizations: number;
  donations_count: number;
  total_amount: number;
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

  async donate(campaignSlug: string, amount: number, message?: string, paymentMethod: string = 'bank_transfer', isAnonymous: boolean = false): Promise<any> {
    try {
      // Input validation
      if (!campaignSlug) {
        throw new Error('Mã chiến dịch không hợp lệ');
      }
      if (!amount || amount < 10000) {
        throw new Error('Số tiền quyên góp tối thiểu là 10,000đ');
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
};