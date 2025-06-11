const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface Campaign {
  id: number;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  image_url: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Stats {
  projects: number;
  ambassadors: number;
  organizations: number;
  donations_count: number;
  total_amount: number;
}

export const api = {
  async getFeaturedCampaigns(): Promise<Campaign[]> {
    try {
      const response = await fetch(`${API_URL}/campaigns/featured`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch featured campaigns');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching featured campaigns:', error);
      throw error;
    }
  },

  async getAllCampaigns(page = 1): Promise<{ data: Campaign[]; meta: any }> {
    const response = await fetch(`${API_URL}/campaigns?page=${page}`);
    if (!response.ok) throw new Error('Failed to fetch campaigns');
    return response.json();
  },

  async getCampaign(id: number): Promise<Campaign> {
    const response = await fetch(`${API_URL}/campaigns/${id}`);
    if (!response.ok) throw new Error('Failed to fetch campaign');
    return response.json();
  },

  async getStats(): Promise<Stats> {
    try {
      const response = await fetch(`${API_URL}/stats`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch stats');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },

  async donate(campaignId: number, amount: number, message?: string): Promise<any> {
    const response = await fetch(`${API_URL}/campaigns/${campaignId}/donate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ amount, message }),
    });
    if (!response.ok) throw new Error('Failed to make donation');
    return response.json();
  },

  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Failed to login');
    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data;
  },

  async register(userData: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ token: string; user: any }> {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to register');
    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data;
  },

  async logout(): Promise<void> {
    const response = await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) throw new Error('Failed to logout');
    localStorage.removeItem('token');
  },
};