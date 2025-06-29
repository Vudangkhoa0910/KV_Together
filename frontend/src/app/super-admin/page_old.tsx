'use client';

import { useState, useEffect } from 'react';
import { superAdminAPI, SystemInfo } from '@/services/superAdminApi';
import { useAuth } from '@/contexts/AuthContext';
import AdminHeader from '@/components/super-admin/AdminHeader';
import AdminSidebar from '@/components/super-admin/AdminSidebar';
import CampaignManager from '@/components/super-admin/CampaignManager';
import NewsManager from '@/components/super-admin/NewsManager';
import ActivityManager from '@/components/super-admin/ActivityManager';
import DonationManager from '@/components/super-admin/DonationManager';
import UserManager from '@/components/super-admin/UserManager';
import AnalyticsManager from '@/components/super-admin/AnalyticsManager';
import SystemManager from '@/components/super-admin/SystemManager';
import { 
  Database, 
  Users, 
  Activity, 
  DollarSign, 
  BarChart3, 
  Settings, 
  FileText,
  Calendar,
  TrendingUp,
  Heart,
  Target,
  RefreshCw,
  Shield,
  Home,
  Eye,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth();
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'campaigns' | 'news' | 'activities' | 'donations' | 'analytics' | 'system'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    
    console.log('🔄 Loading initial data for Super Admin Dashboard...');
    console.log('👤 Current user:', user);
    
    try {
      console.log('📡 Fetching system info and analytics...');
      
      const [systemRes, analyticsRes] = await Promise.all([
        superAdminAPI.getSystemInfo(),
        superAdminAPI.getAnalytics()
      ]);

      console.log('📊 System info response:', systemRes);
      console.log('📈 Analytics response:', analyticsRes);

      if (systemRes.error) {
        throw new Error(`System info error: ${systemRes.error}`);
      }
      
      if (analyticsRes.error) {
        throw new Error(`Analytics error: ${analyticsRes.error}`);
      }

      if (systemRes.data) {
        setSystemInfo(systemRes.data);
        console.log('✅ System info loaded successfully');
      }
      
      if (analyticsRes.data) {
        setAnalytics(analyticsRes.data);
        console.log('✅ Analytics loaded successfully');
      }
    } catch (error) {
      console.error('❌ Failed to load data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      const response = await superAdminAPI.clearCache();
      if (response.data) {
        alert('Cache đã được xóa thành công');
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
      alert('Không thể xóa cache');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getTabTitle = () => {
    const titles = {
      overview: 'Tổng quan hệ thống',
      users: 'Quản lý người dùng',
      campaigns: 'Quản lý chiến dịch',
      news: 'Quản lý tin tức',
      activities: 'Quản lý hoạt động',
      donations: 'Quản lý quyên góp',
      analytics: 'Báo cáo & Thống kê',
      system: 'Cài đặt hệ thống'
    };
    return titles[activeTab];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-xl font-medium">Đang tải Super Admin Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center p-6 border-b border-gray-200">
          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div className="ml-3">
            <h1 className="text-xl font-bold text-gray-900">KV Admin</h1>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4">
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-medium">
                K
              </div>
              <div className="ml-3">
                <div className="font-medium text-gray-900">{user?.name || 'Khoa Admin'}</div>
                <div className="text-sm text-orange-600">Admin</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4">
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                activeTab === 'overview' 
                  ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="h-5 w-5 mr-3" />
              Dashboard
            </button>
            
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                activeTab === 'users'
                  ? 'bg-orange-100 text-orange-700 border border-orange-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="h-5 w-5 mr-3" />
              Quản lý người dùng
            </button>
            
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                activeTab === 'campaigns'
                  ? 'bg-orange-100 text-orange-700 border border-orange-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Activity className="h-5 w-5 mr-3" />
              Quản lý chiến dịch
            </button>
            
            <button
              onClick={() => setActiveTab('news')}
              className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                activeTab === 'news'
                  ? 'bg-orange-100 text-orange-700 border border-orange-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Database className="h-5 w-5 mr-3" />
              Quản lý tin tức
            </button>
            
            <button
              onClick={() => setActiveTab('activities')}
              className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                activeTab === 'activities'
                  ? 'bg-orange-100 text-orange-700 border border-orange-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Activity className="h-5 w-5 mr-3" />
              Quản lý hoạt động
            </button>
            
            <button
              onClick={() => setActiveTab('donations')}
              className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                activeTab === 'donations'
                  ? 'bg-orange-100 text-orange-700 border border-orange-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <DollarSign className="h-5 w-5 mr-3" />
              Quản lý quyên góp
            </button>
            
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-orange-100 text-orange-700 border border-orange-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="h-5 w-5 mr-3" />
              Báo cáo & Thống kê
            </button>
            
            <button
              onClick={() => setActiveTab('system')}
              className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                activeTab === 'system'
                  ? 'bg-orange-100 text-orange-700 border border-orange-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Settings className="h-5 w-5 mr-3" />
              Cài đặt hệ thống
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeTab === 'overview' && 'Dashboard'}
                  {activeTab === 'users' && 'Quản lý người dùng'}
                  {activeTab === 'campaigns' && 'Quản lý chiến dịch'}
                  {activeTab === 'news' && 'Quản lý tin tức'}
                  {activeTab === 'activities' && 'Quản lý hoạt động'}
                  {activeTab === 'donations' && 'Quản lý quyên góp'}
                  {activeTab === 'analytics' && 'Báo cáo & Thống kê'}
                  {activeTab === 'system' && 'Cài đặt hệ thống'}
                </h2>
              </div>
              <div className="flex items-center space-x-4">
                <a 
                  href="/"
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <Home className="h-4 w-4" />
                  <span>Trang chủ</span>
                </a>
                <button
                  onClick={clearCache}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Xóa cache</span>
                </button>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* System Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {systemInfo?.system_stats.total_users.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <Activity className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Chiến dịch</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {systemInfo?.system_stats.total_campaigns.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Quyên góp</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {systemInfo?.system_stats.total_donations.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <Database className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Tổng số bảng</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {systemInfo?.database_info.total_tables.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Thao tác nhanh</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                      onClick={() => setActiveTab('users')}
                      className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
                    >
                      <Users className="h-8 w-8 text-orange-600 mb-2" />
                      <div className="text-sm font-medium text-gray-900">Quản lý người dùng</div>
                    </button>
                    <button
                      onClick={() => setActiveTab('campaigns')}
                      className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
                    >
                      <Activity className="h-8 w-8 text-orange-600 mb-2" />
                      <div className="text-sm font-medium text-gray-900">Quản lý chiến dịch</div>
                    </button>
                    <button
                      onClick={() => setActiveTab('analytics')}
                      className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
                    >
                      <BarChart3 className="h-8 w-8 text-orange-600 mb-2" />
                      <div className="text-sm font-medium text-gray-900">Báo cáo & Thống kê</div>
                    </button>
                    <button
                      onClick={() => setActiveTab('system')}
                      className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
                    >
                      <Settings className="h-8 w-8 text-orange-600 mb-2" />
                      <div className="text-sm font-medium text-gray-900">Cài đặt hệ thống</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <UserManager />
          )}

          {activeTab === 'campaigns' && (
            <CampaignManager />
          )}

          {activeTab === 'news' && (
            <NewsManager />
          )}

          {activeTab === 'activities' && (
            <ActivityManager />
          )}

          {activeTab === 'donations' && (
            <DonationManager />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsManager />
          )}

          {activeTab === 'system' && (
            <SystemManager />
          )}
        </div>
      </div>
    </div>
  );
}
