'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '@/lib/axios';

import { TokenManager } from '@/lib/tokenManager';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  bio?: string;
  created_at?: string;
  role: {
    slug: string;
    name: string;
  };
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  registerUser: (data: any) => Promise<any>;
  refreshToken: () => Promise<string>;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => void;
  setDevAuth: (userData: User, authToken: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false); // Prevent multiple simultaneous refreshes
  const router = useRouter();

  // Function to refresh token
  const refreshToken = async () => {
    if (refreshing) {
      console.log('Refresh already in progress, skipping...');
      return null;
    }
    
    try {
      setRefreshing(true);
      console.log('Attempting to refresh token...');
      const currentToken = localStorage.getItem('token');
      
      if (!currentToken) {
        throw new Error('No token to refresh');
      }

      const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        const newToken = response.data.token;
        const userData = response.data.user;
        
        console.log('Token refreshed successfully');
        setupAuthState(userData, newToken);
        
        return newToken;
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      
      // Handle different types of errors gracefully
      if (error.response?.status === 429) {
        console.log('Rate limited on refresh, keeping current auth state');
        throw new Error('Rate limiting token refresh');
      } else if (error.response?.status === 401) {
        console.log('Authentication failed during refresh, clearing auth state');
        clearAuthState();
        router.push('/auth/login');
      } else {
        console.log('Network or server error during refresh, keeping auth state for now');
        // For network errors, don't immediately clear auth state
        // Let the user continue using the app with current token
        return null;
      }
      
      throw error;
    } finally {
      setRefreshing(false);
    }
  };

  // Function to validate token expiration
  const isTokenExpired = (token: string) => {
    try {
      // Laravel Sanctum tokens are in format "ID|hash" not JWT
      // Check if it's a Sanctum token format
      if (token.includes('|')) {
        console.log('Sanctum token detected, checking basic format');
        // Basic validation for Sanctum token format
        const parts = token.split('|');
        if (parts.length !== 2 || parts[0].length === 0 || parts[1].length === 0) {
          console.log('Invalid Sanctum token format');
          return true;
        }
        // Sanctum tokens don't have built-in expiration, rely on server validation
        console.log('Sanctum token appears valid, will verify with server');
        return false;
      }

      // If it's a JWT token, decode and check expiration
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.log('Invalid JWT token format: expected 3 parts, got', tokenParts.length);
        return true;
      }

      const decoded: any = jwtDecode(token);
      if (!decoded.exp) {
        console.log('JWT token has no expiration');
        return true;
      }
      
      const isExpired = decoded.exp * 1000 < Date.now();
      console.log('JWT token expiration check:', { 
        exp: decoded.exp, 
        now: Date.now() / 1000, 
        isExpired 
      });
      
      return isExpired;
    } catch (error) {
      console.error('Token validation error:', error);
      return true;
    }
  };

  // Function to clear all auth state
  const clearAuthState = () => {
    console.log('Clearing auth state');
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    
    // Clear storage with TokenManager
    try {
      TokenManager.clearToken();
      sessionStorage.removeItem('token'); // Also clear sessionStorage
      Cookies.remove('user');
      // Clear token from axios instance
      delete axiosInstance.defaults.headers.common['Authorization'];
      console.log('Auth state cleared successfully');
    } catch (error) {
      console.error('Error clearing auth state:', error);
    }
  };

  // Function to set up auth state
  const setupAuthState = (userData: User, newToken: string) => {
    console.log('Setting up auth state:', { userData, tokenLength: newToken.length });
    
    // Store token with timestamp using TokenManager
    TokenManager.setToken(newToken);
    Cookies.set('user', JSON.stringify(userData), { 
      expires: 7, // 7 days
      secure: false, // Set to true in production with HTTPS
      sameSite: 'lax'
    });
    
    // Reset admin view state to admin mode for admin users
    if (userData.role?.slug === 'admin') {
      localStorage.removeItem('adminViewAsUser');
    }
    
    // Set token in axios instance
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    
    // Update state after storage is complete
    setUser(userData);
    setToken(newToken);
    setIsAuthenticated(true);
    
    console.log('Auth state setup completed successfully');
    console.log('User data stored in cookie:', JSON.stringify(userData));
    console.log('Token stored with timestamp:', TokenManager.getTokenInfo());
  };

  // Function to handle API errors
  const handleApiError = (error: any) => {
    console.error('API Error:', error);
    if (error.response) {
      // Server responded with error
      const message = error.response.data.message || 'Something went wrong';
      if (error.response.status === 401) {
        clearAuthState();
        router.push('/auth/login');
      }
      setError(message);
    } else if (error.request) {
      // Request made but no response
      setError('Network error. Please check your connection.');
    } else {
      // Other errors
      setError('An error occurred. Please try again.');
    }
  };

  const clearError = () => setError(null);

  // Debug function to check auth state
  const debugAuthState = () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = Cookies.get('user');
    console.log('=== AUTH DEBUG ===');
    console.log('State:', { isAuthenticated, user: user?.name, token: token?.substring(0, 20) + '...' });
    console.log('Storage:', { 
      hasStoredToken: !!storedToken, 
      hasStoredUser: !!storedUser,
      tokenLength: storedToken?.length
    });
    console.log('Axios header:', axiosInstance.defaults.headers.common['Authorization']);
    console.log('==================');
  };

  // Make debug function available globally in development
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    (window as any).debugAuth = debugAuthState;
  }

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if localStorage is available
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
          console.log('localStorage not available, skipping auth init');
          setLoading(false);
          return;
        }

        // Use TokenManager to check and refresh token if needed
        const currentToken = await TokenManager.refreshTokenIfNeeded();
        const storedUser = Cookies.get('user');

        console.log('Initializing auth...', { 
          hasToken: !!currentToken, 
          hasUser: !!storedUser,
          tokenLength: currentToken?.length || 0,
          tokenPreview: currentToken?.substring(0, 20) + '...'
        });

        if (!currentToken || currentToken === 'null' || currentToken === 'undefined') {
          console.log('No valid token found, clearing auth state');
          clearAuthState();
          return;
        }

        console.log('Token found, checking expiration...');
        if (isTokenExpired(currentToken)) {
          console.log('Token expired, clearing auth state');
          clearAuthState();
          return;
        }

        console.log('Token is valid, setting up axios and using stored user data...');
        // Set up axios defaults
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;

        // Try to use stored user data first if available
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            console.log('Using stored user data:', userData);
            setUser(userData);
            setToken(currentToken);
            setIsAuthenticated(true);
            
            // Only validate token with server occasionally to avoid unnecessary 401 errors
            const lastValidated = Cookies.get('token_last_validated');
            const shouldValidateToken = !lastValidated || 
                                      (Date.now() - parseInt(lastValidated)) > (4 * 60 * 60 * 1000); // 4 hours
            
            if (shouldValidateToken) {
              console.log('Validating token with server (periodic check)...');
              try {
                const response = await axiosInstance.get(`/auth/user`);
                const freshUserData = response.data.user;
                
                // Update with fresh data if different
                if (JSON.stringify(userData) !== JSON.stringify(freshUserData)) {
                  console.log('Updating user data with fresh server data');
                  setUser(freshUserData);
                  Cookies.set('user', JSON.stringify(freshUserData), { expires: 7 });
                }
                
                // Mark token as validated
                Cookies.set('token_last_validated', Date.now().toString(), { expires: 7 });
              } catch (validationError: any) {
                console.log('Token validation failed, but keeping stored auth state:', validationError.response?.status);
                
                // Only clear auth if it's actually a 401 and not a network/server error
                if (validationError.response?.status === 401) {
                  console.log('Authentication invalid, clearing auth state');
                  clearAuthState();
                  return;
                }
                // For other errors (network, 500, etc.), keep the stored state
                console.log('Keeping stored auth state due to server/network error');
              }
            } else {
              console.log('Token validation skipped (recent validation found)');
            }
          } catch (parseError) {
            console.error('Failed to parse stored user data:', parseError);
            clearAuthState();
          }
        } else {
          // No stored user data, need to fetch from server
          try {
            const response = await axiosInstance.get(`/auth/user`);
            const userData = response.data.user;

            console.log('User data fetched successfully:', userData);
            
            // Set up auth state
            setUser(userData);
            setToken(currentToken);
            setIsAuthenticated(true);
            
            // Store user data and validation timestamp
            Cookies.set('user', JSON.stringify(userData), { expires: 7 });
            Cookies.set('token_last_validated', Date.now().toString(), { expires: 7 });
          } catch (fetchError: any) {
            console.error('Failed to fetch user data:', fetchError);
            clearAuthState();
          }
        }
      } catch (error: any) {
        console.error('Auth initialization failed:', error);
        clearAuthState();
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Set up axios interceptor for automatic token refresh
    const interceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Only attempt refresh for auth endpoints and critical requests
        const isAuthEndpoint = originalRequest.url?.includes('/auth/');
        const isAdminEndpoint = originalRequest.url?.includes('/admin/');
        
        if (error.response?.status === 401 && !originalRequest._retry && token && !refreshing && (isAuthEndpoint || isAdminEndpoint)) {
          originalRequest._retry = true;
          
          try {
            console.log('401 error detected on critical endpoint, attempting token refresh...');
            const newToken = await refreshToken();
            if (newToken) {
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              return axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed during interceptor');
            // Don't redirect here, let the component handle it
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axiosInstance.interceptors.response.eject(interceptor);
    };
  }, []);

  // Auto refresh token periodically (every 12 hours since Sanctum tokens last 24 hours)
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const autoRefreshInterval = setInterval(async () => {
      try {
        console.log('Auto-refreshing token (12 hour check)...');
        // Only refresh if we're approaching expiration (TokenManager handles this)
        const refreshedToken = await TokenManager.refreshTokenIfNeeded();
        if (refreshedToken && refreshedToken !== token) {
          console.log('Token was refreshed during periodic check');
          setToken(refreshedToken);
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${refreshedToken}`;
        }
      } catch (error: any) {
        console.error('Auto refresh failed:', error);
        // Don't clear interval for rate limiting or network errors
        if (error.response?.status === 401) {
          clearInterval(autoRefreshInterval);
        }
      }
    }, 12 * 60 * 60 * 1000); // 12 hours

    return () => clearInterval(autoRefreshInterval);
  }, [isAuthenticated, token]);

  // Monitor token changes and ensure persistence
  useEffect(() => {
    if (token && isAuthenticated) {
      const storedToken = localStorage.getItem('token');
      if (storedToken !== token) {
        console.log('Token mismatch detected, updating storage...');
        localStorage.setItem('token', token);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    }
  }, [token, isAuthenticated]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      clearError();

      console.log('Starting login process...');

      // Get CSRF cookie from the correct endpoint
      await axios.get(`${API_URL}/csrf-cookie`);

      // Perform login
      const response = await axiosInstance.post(`/auth/login`, { email, password });
      const { user: userData, token: newToken } = response.data;

      console.log('Login successful, received token:', { 
        tokenLength: newToken?.length, 
        user: userData?.name 
      });

      if (!newToken) {
        throw new Error('No token received from server');
      }

      // Set up auth state with new token
      setupAuthState(userData, newToken);

      // Verify token was stored
      const storedToken = localStorage.getItem('token');
      console.log('Token verification after login:', { 
        tokenStored: !!storedToken, 
        tokensMatch: storedToken === newToken 
      });

      return response.data;
    } catch (error: any) {
      console.error('Login failed:', error);
      handleApiError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (registrationData: any) => {
    try {
      setLoading(true);
      clearError();

      // Get CSRF cookie from the correct endpoint
      await axios.get(`${API_URL}/csrf-cookie`);

      // Register user
      const response = await axiosInstance.post(`/auth/register`, registrationData);
      const { user: userData, token: newToken } = response.data;

      // Set up auth state with new token
      setupAuthState(userData, newToken);

      return response.data;
    } catch (error: any) {
      handleApiError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      if (token) {
        await axiosInstance.post(`/auth/logout`);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthState();
      setLoading(false);
      router.push('/auth/login');
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const setDevAuth = (userData: User, authToken: string) => {
    console.log('Setting dev auth with:', { userData, tokenLength: authToken.length });
    setupAuthState(userData, authToken);
  };

  const value = {
    isAuthenticated,
    user,
    token,
    loading,
    error,
    login,
    logout,
    registerUser,
    refreshToken,
    clearError,
    updateUser,
    setDevAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}