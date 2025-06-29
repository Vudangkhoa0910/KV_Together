'use client';

import { useState, useEffect } from 'react';
import { superAdminAPI } from '@/services/superAdminApi';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  PieChart
} from 'lucide-react';

export default function AnalyticsManager() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<string>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [analyticsRes, systemRes] = await Promise.all([
        superAdminAPI.getAnalytics(),
        superAdminAPI.getSystemInfo()
      ]);

      if (analyticsRes.data) {
        setAnalytics(analyticsRes.data);
      }
      
      if (systemRes.data) {
        setSystemInfo(systemRes.data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
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

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Đang tải dữ liệu thống kê...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Báo cáo & Thống kê</h2>
          <div className="flex gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">7 ngày qua</option>
              <option value="30d">30 ngày qua</option>
              <option value="90d">3 tháng qua</option>
              <option value="1y">1 năm qua</option>
            </select>
            
            <button
              onClick={loadAnalytics}
              className="p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            
            <button
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              <span>Xuất báo cáo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
              <p className="text-3xl font-bold text-gray-900">
                {systemInfo?.system_stats?.total_users?.toLocaleString() || '0'}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+12.5% so với tháng trước</span>
              </div>
            </div>
            <Users className="h-12 w-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng quyên góp</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(systemInfo?.system_stats?.total_amount_raised || 0)}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+24.8% so với tháng trước</span>
              </div>
            </div>
            <DollarSign className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chiến dịch hoạt động</p>
              <p className="text-3xl font-bold text-gray-900">
                {systemInfo?.system_stats?.total_campaigns?.toLocaleString() || '0'}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+8.2% so với tháng trước</span>
              </div>
            </div>
            <Activity className="h-12 w-12 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hoạt động tình nguyện</p>
              <p className="text-3xl font-bold text-gray-900">
                {systemInfo?.system_stats?.total_activities?.toLocaleString() || '0'}
              </p>
              <div className="flex items-center mt-2">
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600">-2.1% so với tháng trước</span>
              </div>
            </div>
            <Calendar className="h-12 w-12 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Tăng trưởng người dùng</h3>
            <BarChart3 className="h-5 w-5 text-gray-500" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Biểu đồ tăng trưởng người dùng</p>
              <p className="text-sm text-gray-400">Sẽ được tích hợp với thư viện biểu đồ</p>
            </div>
          </div>
        </div>

        {/* Donation Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Quyên góp theo thời gian</h3>
            <TrendingUp className="h-5 w-5 text-gray-500" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Biểu đồ quyên góp theo thời gian</p>
              <p className="text-sm text-gray-400">Sẽ được tích hợp với thư viện biểu đồ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Analytics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Thống kê người dùng</h3>
          <div className="space-y-4">
            {analytics?.users?.by_role?.map((role: any) => (
              <div key={role.slug} className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    role.slug === 'admin' ? 'bg-red-500' :
                    role.slug === 'fundraiser' ? 'bg-blue-500' :
                    role.slug === 'volunteer' ? 'bg-purple-500' : 'bg-green-500'
                  }`}></div>
                  <span className="text-sm text-gray-600">{role.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{role.count}</div>
                  <div className="text-xs text-gray-500">
                    {((role.count / (analytics?.users?.total || 1)) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center text-gray-500 py-4">
                Không có dữ liệu người dùng
              </div>
            )}
          </div>
        </div>

        {/* Campaign Analytics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Thống kê chiến dịch</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Chiến dịch hoạt động</span>
              <span className="text-sm font-medium text-gray-900">
                {analytics?.campaigns?.active || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Chiến dịch hoàn thành</span>
              <span className="text-sm font-medium text-gray-900">
                {analytics?.campaigns?.completed || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tỉ lệ thành công</span>
              <span className="text-sm font-medium text-green-600">
                {analytics?.campaigns?.success_rate || 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Trung bình mục tiêu</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(analytics?.campaigns?.avg_goal || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Donation Analytics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Thống kê quyên góp</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tổng lượt quyên góp</span>
              <span className="text-sm font-medium text-gray-900">
                {analytics?.donations?.total?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tổng số tiền</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(analytics?.donations?.total_amount || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Quyên góp trung bình</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(analytics?.donations?.avg_amount || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Quyên góp cao nhất</span>
              <span className="text-sm font-medium text-green-600">
                {formatCurrency(analytics?.donations?.max_amount || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Hoạt động gần đây</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Quyên góp mới: 500,000 VND cho chiến dịch "Xây trường học"</p>
                <p className="text-xs text-gray-500">2 phút trước</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Người dùng mới đăng ký: Nguyễn Văn A</p>
                <p className="text-xs text-gray-500">5 phút trước</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Activity className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Chiến dịch mới được tạo: "Hỗ trợ người cao tuổi"</p>
                <p className="text-xs text-gray-500">15 phút trước</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Calendar className="h-4 w-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Hoạt động tình nguyện "Dọn vệ sinh bãi biển" đã hoàn thành</p>
                <p className="text-xs text-gray-500">1 giờ trước</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
              Xem tất cả hoạt động
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
