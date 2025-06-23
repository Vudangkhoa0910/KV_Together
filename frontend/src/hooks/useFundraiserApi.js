'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.withCredentials = true;

// Helper function to get CSRF token
const getCsrfToken = async () => {
  await axios.get('/sanctum/csrf-cookie');
};

export const useFundraiserApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get dashboard stats
  const getDashboardStats = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await getCsrfToken();
      const response = await axios.get('/api/fundraiser/stats');
      setIsLoading(false);
      return response.data;
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Không thể tải dữ liệu bảng điều khiển. Vui lòng thử lại sau.');
      setIsLoading(false);
      return null;
    }
  };

  // Get campaigns with filtering
  const getCampaigns = async (params = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await getCsrfToken();
      const response = await axios.get('/api/fundraiser/campaigns', { params });
      setIsLoading(false);
      return response.data;
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('Không thể tải danh sách chiến dịch. Vui lòng thử lại sau.');
      setIsLoading(false);
      return { data: [], meta: { current_page: 1, last_page: 1, total: 0 } };
    }
  };

  // Get a single campaign by slug
  const getCampaign = async (slug) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await getCsrfToken();
      const response = await axios.get(`/api/campaigns/${slug}`);
      setIsLoading(false);
      return response.data;
    } catch (err) {
      console.error('Error fetching campaign details:', err);
      setError('Không thể tải thông tin chiến dịch. Vui lòng thử lại sau.');
      setIsLoading(false);
      return null;
    }
  };

  // Create a new campaign
  const createCampaign = async (formData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await getCsrfToken();
      const response = await axios.post('/api/fundraiser/campaigns', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setIsLoading(false);
      return response.data;
    } catch (err) {
      console.error('Error creating campaign:', err);
      
      if (err.response && err.response.data && err.response.data.errors) {
        // Format validation errors
        const errors = Object.values(err.response.data.errors).flat();
        setError(errors.join('<br>'));
      } else {
        setError('Không thể tạo chiến dịch. Vui lòng thử lại sau.');
      }
      
      setIsLoading(false);
      throw err;
    }
  };

  // Update a campaign
  const updateCampaign = async (slug, formData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await getCsrfToken();
      const response = await axios.post(`/api/fundraiser/campaigns/${slug}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setIsLoading(false);
      return response.data;
    } catch (err) {
      console.error('Error updating campaign:', err);
      
      if (err.response && err.response.data && err.response.data.errors) {
        // Format validation errors
        const errors = Object.values(err.response.data.errors).flat();
        setError(errors.join('<br>'));
      } else {
        setError('Không thể cập nhật chiến dịch. Vui lòng thử lại sau.');
      }
      
      setIsLoading(false);
      throw err;
    }
  };

  // Delete a campaign
  const deleteCampaign = async (id) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await getCsrfToken();
      const response = await axios.delete(`/api/fundraiser/campaigns/${id}`);
      setIsLoading(false);
      return response.data;
    } catch (err) {
      console.error('Error deleting campaign:', err);
      setError('Không thể xóa chiến dịch. Vui lòng thử lại sau.');
      setIsLoading(false);
      throw err;
    }
  };

  // Get campaign performance data
  const getCampaignPerformance = async (slug, days = 30) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await getCsrfToken();
      const response = await axios.get(`/api/fundraiser/campaigns/${slug}/performance`, {
        params: { days }
      });
      setIsLoading(false);
      return response.data;
    } catch (err) {
      console.error('Error fetching campaign performance:', err);
      setError('Không thể tải dữ liệu phân tích. Vui lòng thử lại sau.');
      setIsLoading(false);
      return { donations: [], amounts: [], dates: [] };
    }
  };

  // Get campaign donations
  const getCampaignDonations = async (slug, page = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await getCsrfToken();
      const response = await axios.get(`/api/fundraiser/campaigns/${slug}/donations`, {
        params: { page }
      });
      setIsLoading(false);
      return response.data;
    } catch (err) {
      console.error('Error fetching campaign donations:', err);
      setError('Không thể tải danh sách quyên góp. Vui lòng thử lại sau.');
      setIsLoading(false);
      return { data: [], meta: { current_page: 1, last_page: 1, total: 0 } };
    }
  };

  // Create campaign update
  const createCampaignUpdate = async (slug, data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await getCsrfToken();
      const response = await axios.post(`/api/fundraiser/campaigns/${slug}/updates`, data);
      setIsLoading(false);
      return response.data;
    } catch (err) {
      console.error('Error creating campaign update:', err);
      setError('Không thể tạo cập nhật. Vui lòng thử lại sau.');
      setIsLoading(false);
      throw err;
    }
  };

  // Get report data
  const getReportData = async (params = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await getCsrfToken();
      const response = await axios.get('/api/fundraiser/reports', { params });
      setIsLoading(false);
      return response.data;
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Không thể tải dữ liệu báo cáo. Vui lòng thử lại sau.');
      setIsLoading(false);
      return null;
    }
  };

  return {
    isLoading,
    error,
    getDashboardStats,
    getCampaigns,
    getCampaign,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    getCampaignPerformance,
    getCampaignDonations,
    createCampaignUpdate,
    getReportData,
  };
};
