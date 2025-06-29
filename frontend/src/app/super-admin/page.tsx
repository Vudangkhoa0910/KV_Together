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
    
    try {
      const [systemRes, analyticsRes] = await Promise.all([
        superAdminAPI.getSystemInfo(),
        superAdminAPI.getAnalytics()
      ]);

      if (systemRes.error) {
        throw new Error(`System info error: ${systemRes.error}`);
      }
      
      if (analyticsRes.error) {
        throw new Error(`Analytics error: ${analyticsRes.error}`);
      }

      if (systemRes.data) {
        setSystemInfo(systemRes.data);
      }
      
      if (analyticsRes.data) {
        setAnalytics(analyticsRes.data);
      }
    } catch (error) {
      console.error('❌ Failed to load data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-xl text-gray-700">Đang tải hệ thống quản trị...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg border border-red-200 max-w-md">
          <div className="text-center">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Lỗi hệ thống</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadInitialData}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex">
      {/* Sidebar - Fixed */}
      <AdminSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header - Fixed at top */}
        <AdminHeader 
          title={getTabTitle()}
          onMenuToggle={() => setSidebarOpen(true)}
        />

        {/* Content Area - Scrollable */}
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Chào mừng trở lại!</h1>
                    <p className="text-orange-100 text-lg">
                      Quản lý toàn bộ hệ thống KV Together từ bảng điều khiển này
                    </p>
                  </div>
                  <div className="h-20 w-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Shield className="h-12 w-12 text-white" />
                  </div>
                </div>
              </div>

              {/* System Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {systemInfo?.system_stats.total_users.toLocaleString('vi-VN') || '0'}
                      </p>
                      <p className="text-xs text-green-600 mt-1">↗ +12% tháng này</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Activity className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Chiến dịch</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {systemInfo?.system_stats.total_campaigns.toLocaleString('vi-VN') || '0'}
                      </p>
                      <p className="text-xs text-green-600 mt-1">↗ +8% tháng này</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Tổng quyên góp</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(systemInfo?.system_stats.total_amount_raised || 0)}
                      </p>
                      <p className="text-xs text-green-600 mt-1">↗ +25% tháng này</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Heart className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Hoạt động</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {systemInfo?.system_stats.total_activities.toLocaleString('vi-VN') || '0'}
                      </p>
                      <p className="text-xs text-green-600 mt-1">↗ +5% tháng này</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-orange-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Target className="h-5 w-5 text-orange-500 mr-2" />
                    Thao tác nhanh
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                      onClick={() => setActiveTab('users')}
                      className="p-6 border-2 border-orange-100 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all group"
                    >
                      <Users className="h-8 w-8 text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
                      <div className="text-sm font-medium text-gray-900">Quản lý người dùng</div>
                      <div className="text-xs text-gray-500 mt-1">Xem và chỉnh sửa thông tin người dùng</div>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('campaigns')}
                      className="p-6 border-2 border-orange-100 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all group"
                    >
                      <Activity className="h-8 w-8 text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
                      <div className="text-sm font-medium text-gray-900">Quản lý chiến dịch</div>
                      <div className="text-xs text-gray-500 mt-1">Theo dõi và quản lý các chiến dịch</div>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('donations')}
                      className="p-6 border-2 border-orange-100 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all group"
                    >
                      <DollarSign className="h-8 w-8 text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
                      <div className="text-sm font-medium text-gray-900">Quản lý quyên góp</div>
                      <div className="text-xs text-gray-500 mt-1">Xem và quản lý các giao dịch</div>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('analytics')}
                      className="p-6 border-2 border-orange-100 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all group"
                    >
                      <BarChart3 className="h-8 w-8 text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
                      <div className="text-sm font-medium text-gray-900">Báo cáo & Thống kê</div>
                      <div className="text-xs text-gray-500 mt-1">Xem báo cáo chi tiết hệ thống</div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-orange-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <TrendingUp className="h-5 w-5 text-orange-500 mr-2" />
                    Hoạt động gần đây
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">Người dùng mới đăng ký</p>
                        <p className="text-xs text-gray-500">5 phút trước</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-4 bg-green-50 rounded-lg">
                      <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">Quyên góp mới: {formatCurrency(500000)}</p>
                        <p className="text-xs text-gray-500">10 phút trước</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
                      <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Activity className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">Chiến dịch mới được tạo</p>
                        <p className="text-xs text-gray-500">1 giờ trước</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && <UserManager />}
          {activeTab === 'campaigns' && <CampaignManager />}
          {activeTab === 'news' && <NewsManager />}
          {activeTab === 'activities' && <ActivityManager />}
          {activeTab === 'donations' && <DonationManager />}
          {activeTab === 'analytics' && <AnalyticsManager />}
          {activeTab === 'system' && <SystemManager />}
        </main>
      </div>
    </div>
  );
}
