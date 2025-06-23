import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { jwtDecode } from "jwt-decode";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Extend AxiosRequestConfig to include custom properties
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Define the validation error response structure
interface ValidationErrorResponse {
  errors?: Record<string, string[]>;
}

// Create an Axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true // Enable credentials for cross-origin requests
});

// Type guard to check if error is AxiosError
function isAxiosError(error: any): error is AxiosError {
  return error.isAxiosError === true;
}

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    // Get token from localStorage or session storage - check if we're in browser
    const token = typeof window !== 'undefined' 
      ? (localStorage.getItem('token') || sessionStorage.getItem('token'))
      : null;
    
    if (token && config.headers) {
      try {
        // Check if token is a Laravel Sanctum token (format: number|hash)
        if (token.includes('|')) {
          // Sanctum token format is valid, just use it
          config.headers.Authorization = `Bearer ${token}`;
        }
        // Check if it's a JWT token
        else {
          const tokenParts = token.split('.');
          if (tokenParts.length !== 3) {
            console.warn('Invalid token format, removing token');
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            return config;
          }

          // Don't auto-refresh token on every request to avoid loops
          // Only perform token refresh in response interceptor when 401 occurs
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Token validation error:', error);
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
      }
    }

    // Add CSRF token if available
    const csrfToken = getCookie('XSRF-TOKEN');
    if (csrfToken && config.headers) {
      config.headers['X-XSRF-TOKEN'] = csrfToken;
    }
    
    return config;
  },
  (error: Error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Add a response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: Error) => {
    if (!isAxiosError(error) || !error.config) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as CustomAxiosRequestConfig;
    
    // If the error is due to an invalid/expired token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;          // Add debounce mechanism to prevent rapid refresh attempts
          const lastRefreshAttempt = sessionStorage.getItem('lastTokenRefresh');
          const now = Date.now();
          
          if (lastRefreshAttempt && now - parseInt(lastRefreshAttempt) < 10000) {
            // If we tried to refresh less than 10 seconds ago, prevent another refresh
            isRefreshing = false;
            return Promise.reject({ message: 'Rate limiting token refresh' });
          }
          
          // Store the current timestamp
          sessionStorage.setItem('lastTokenRefresh', now.toString());
          
          try {
            // Try to refresh the token or get a new one
            const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
              withCredentials: true,
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });

          const newToken = response.data.token;

          // Store the new token
          if (newToken) {
            localStorage.setItem('token', newToken);
            
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }

            // Process any requests that were waiting
            processQueue(null, newToken);

            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError as Error, null);
          // If refresh fails, redirect to login without preserving the current URL to avoid loops
          // Only redirect if we're not already on the login page
          if (!window.location.pathname.includes('/auth/login')) {
            window.location.href = '/auth/login';
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // If we're already refreshing, add the request to the queue
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(token => {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return axiosInstance(originalRequest);
      }).catch(err => Promise.reject(err));
    }

    if (error.response?.status === 422) {
      const errorResponse = error.response.data as ValidationErrorResponse;
      // Handle validation errors
      return Promise.reject({
        ...error,
        errors: errorResponse.errors || {}
      });
    }

    // For server errors (500), include more details if available
    if (error.response?.status === 500) {
      const serverError = error.response.data as { message?: string; error?: string };
      return Promise.reject({
        ...error,
        message: serverError?.message || 'Có lỗi xảy ra, vui lòng thử lại sau',
        details: serverError?.error || undefined
      });
    }

    return Promise.reject(error);
  }
);

// Helper function to get cookies
function getCookie(name: string): string | null {
  if (typeof window === 'undefined') {
    return null; // Return null during server-side rendering
  }
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export default axiosInstance;
