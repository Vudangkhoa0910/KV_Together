'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import axiosInstance from '@/lib/axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface User {
  id: number;
  name: string;
  email: string;
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
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
    
    // Clear storage
    try {
      localStorage.removeItem('token');
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
    
    // Store token and user data immediately, synchronously
    localStorage.setItem('token', newToken);
    Cookies.set('user', JSON.stringify(userData), { 
      expires: 7, // 7 days
      secure: false, // Set to true in production with HTTPS
      sameSite: 'lax'
    });
    
    // Set token in axios instance
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    
    // Update state after storage is complete
    setUser(userData);
    setToken(newToken);
    setIsAuthenticated(true);
    
    console.log('Auth state setup completed successfully');
    console.log('User data stored in cookie:', JSON.stringify(userData));
    console.log('Token stored in localStorage:', localStorage.getItem('token') ? 'YES' : 'NO');
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

        const storedToken = localStorage.getItem('token');
        const storedUser = Cookies.get('user');

        console.log('Initializing auth...', { 
          hasToken: !!storedToken, 
          hasUser: !!storedUser,
          tokenLength: storedToken?.length || 0,
          tokenPreview: storedToken?.substring(0, 20) + '...'
        });

        if (!storedToken || storedToken === 'null' || storedToken === 'undefined') {
          console.log('No valid token found, clearing auth state');
          clearAuthState();
          return;
        }

        console.log('Token found, checking expiration...');
        if (isTokenExpired(storedToken)) {
          console.log('Token expired, clearing auth state');
          clearAuthState();
          return;
        }

        console.log('Token is valid, setting up axios and fetching user data...');
        // Set up axios defaults
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

        // Try to use stored user data first if available
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            console.log('Using stored user data:', userData);
            setUser(userData);
            setToken(storedToken);
            setIsAuthenticated(true);
          } catch (parseError) {
            console.error('Failed to parse stored user data:', parseError);
          }
        }

        // Validate token by fetching fresh user details
        try {
          const response = await axiosInstance.get(`/auth/user`);
          const userData = response.data.user;

          console.log('User data fetched successfully:', userData);
          
          // Update with fresh data
          setUser(userData);
          setToken(storedToken);
          setIsAuthenticated(true);
          
          // Update stored user data if different
          if (storedUser !== JSON.stringify(userData)) {
            Cookies.set('user', JSON.stringify(userData), { expires: 7 });
          }
        } catch (fetchError: any) {
          console.error('Failed to fetch user data:', fetchError);
          
          // If we have stored user data and it's just a network error, keep using it
          if (storedUser && fetchError.code === 'NETWORK_ERROR') {
            console.log('Network error, but keeping stored auth state');
            return; // Keep the stored state we already set
          }
          
          // For auth errors, clear everything
          if (fetchError.response?.status === 401) {
            console.log('Authentication failed, clearing auth state');
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
  }, []);

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

  const value = {
    isAuthenticated,
    user,
    token,
    loading,
    error,
    login,
    logout,
    registerUser,
    clearError
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