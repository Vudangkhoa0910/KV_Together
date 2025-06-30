// /frontend/src/services/superAdminApi.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

interface TableColumn {
  name: string;
  type: string;
}

interface TableInfo {
  name: string;
  columns: string[];
  records_count: number;
}

interface SystemInfo {
  database_info: {
    total_tables: number;
    tables: TableInfo[];
  };
  models: Record<string, string>;
  system_stats: {
    total_users: number;
    total_campaigns: number;
    total_donations: number;
    total_amount_raised: number;
    total_activities: number;
    total_news: number;
    admin_users: number;
  };
}

interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  last_page: number;
  per_page: number;
  total: number;
}

class SuperAdminAPI {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    console.log('🔍 SuperAdminAPI: Getting auth token...');
    
    // Try to get token from cookies first (used by the app)
    const userCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('user='));
    
    if (userCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
        console.log('📋 SuperAdminAPI: User data from cookie:', userData);
        
        // Check different token locations
        if (userData.token) {
          console.log('✅ SuperAdminAPI: Found token in cookie.token');
          return userData.token;
        }
        if (userData.user && userData.user.token) {
          console.log('✅ SuperAdminAPI: Found token in cookie.user.token');
          return userData.user.token;
        }
      } catch (error) {
        console.error('❌ SuperAdminAPI: Error parsing user cookie:', error);
      }
    }
    
    // Try getting token directly from cookies
    const tokenCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='));
    
    if (tokenCookie) {
      const token = tokenCookie.split('=')[1];
      console.log('✅ SuperAdminAPI: Found token in dedicated token cookie');
      return token;
    }
    
    // Check for auth_token cookie
    const authTokenCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='));
    
    if (authTokenCookie) {
      const token = authTokenCookie.split('=')[1];
      console.log('✅ SuperAdminAPI: Found token in auth_token cookie');
      return token;
    }
    
    // Fallback to localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('📋 SuperAdminAPI: User data from localStorage:', user);
        if (user.token) {
          console.log('✅ SuperAdminAPI: Found token in localStorage');
          return user.token;
        }
      } catch (error) {
        console.error('❌ SuperAdminAPI: Error parsing localStorage user:', error);
      }
    }
    
    // Try getting token directly from localStorage
    const directToken = localStorage.getItem('token') || localStorage.getItem('auth_token');
    if (directToken) {
      console.log('✅ SuperAdminAPI: Found direct token in localStorage');
      return directToken;
    }
    
    console.log('❌ SuperAdminAPI: No token found anywhere');
    console.log('🍪 Available cookies:', document.cookie);
    console.log('💾 Available localStorage keys:', Object.keys(localStorage));
    return null;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getAuthToken();
    
    console.log(`🚀 SuperAdminAPI: Making request to ${endpoint}`);
    console.log(`🔑 SuperAdminAPI: Token available: ${token ? 'YES' : 'NO'}`);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log(`📤 SuperAdminAPI: Added Authorization header`);
    } else {
      console.log(`⚠️ SuperAdminAPI: No token available for request`);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: { ...headers, ...options.headers },
      });

      console.log(`📥 SuperAdminAPI: Response status: ${response.status}`);
      
      const data = await response.json();

      if (!response.ok) {
        console.error(`❌ SuperAdminAPI: Request failed:`, data);
        return { error: data.message || data.error || 'Request failed' };
      }

      console.log(`✅ SuperAdminAPI: Request successful`);
      return { data };
    } catch (error) {
      console.error('❌ SuperAdminAPI: Network error:', error);
      return { error: 'Network error' };
    }
  }

  // System Information
  async getSystemInfo(): Promise<ApiResponse<SystemInfo>> {
    return this.makeRequest<SystemInfo>('/super-admin/system-info');
  }

  async getAnalytics(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/super-admin/analytics');
  }

  // Table Operations
  async getTableData(
    table: string,
    params: {
      page?: number;
      per_page?: number;
      search?: string;
      sort_by?: string;
      sort_order?: 'asc' | 'desc';
      status?: string;
      type?: string;
      date_filter?: string;
    } = {}
  ): Promise<ApiResponse<{ table: string; columns: string[]; data: PaginatedResponse<any> }>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    const query = queryParams.toString();
    return this.makeRequest(`/super-admin/tables/${table}${query ? `?${query}` : ''}`);
  }

  async getRecord(table: string, id: number): Promise<ApiResponse<{ table: string; columns: string[]; record: any }>> {
    return this.makeRequest(`/super-admin/tables/${table}/${id}`);
  }

  async createRecord(table: string, data: any): Promise<ApiResponse<{ message: string; table: string; record: any }>> {
    return this.makeRequest(`/super-admin/tables/${table}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRecord(table: string, id: number, data: any): Promise<ApiResponse<{ message: string; table: string; record: any }>> {
    return this.makeRequest(`/super-admin/tables/${table}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRecord(table: string, id: number): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest(`/super-admin/tables/${table}/${id}`, {
      method: 'DELETE',
    });
  }

  // Bulk Operations
  async bulkUpdate(table: string, ids: number[], data: any): Promise<ApiResponse<{ message: string; affected_rows: number }>> {
    return this.makeRequest(`/super-admin/tables/${table}/bulk-update`, {
      method: 'POST',
      body: JSON.stringify({ ids, data }),
    });
  }

  async bulkDelete(table: string, ids: number[]): Promise<ApiResponse<{ message: string; affected_rows: number }>> {
    return this.makeRequest(`/super-admin/tables/${table}/bulk-delete`, {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  // SQL Queries
  async executeQuery(sql: string): Promise<ApiResponse<{ query: string; results: any[]; count: number }>> {
    return this.makeRequest('/super-admin/query', {
      method: 'POST',
      body: JSON.stringify({ sql }),
    });
  }

  // System Maintenance
  async clearCache(): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest('/super-admin/clear-cache', {
      method: 'POST',
    });
  }

  async getSystemLogs(lines: number = 100): Promise<ApiResponse<{ logs: string[]; total_lines: number; showing_lines: number }>> {
    return this.makeRequest(`/super-admin/logs?lines=${lines}`);
  }
}

export const superAdminAPI = new SuperAdminAPI();
export type { SystemInfo, TableInfo, PaginatedResponse, ApiResponse };
