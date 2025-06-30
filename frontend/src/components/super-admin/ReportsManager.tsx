'use client';

import { useState, useEffect } from 'react';
import { superAdminAPI } from '@/services/superAdminApi';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp,
  Users,
  Activity,
  DollarSign,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';

const COLORS = ['#ea580c', '#fb923c', '#fed7aa', '#c2410c', '#9a3412'];

export default function ReportsManager() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>({});
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load multiple data sources
      const [userResponse, campaignResponse, activityResponse, donationResponse] = await Promise.all([
        superAdminAPI.getTableData('users', { per_page: 1000 }),
        superAdminAPI.getTableData('campaigns', { per_page: 1000 }),
        superAdminAPI.getTableData('activities', { per_page: 1000 }),
        superAdminAPI.getTableData('donations', { per_page: 1000 })
      ]);

      const users = userResponse.data?.data?.data || [];
      const campaigns = campaignResponse.data?.data?.data || [];
      const activities = activityResponse.data?.data?.data || [];
      const donations = donationResponse.data?.data?.data || [];

      // Process data for charts
      const processedData = processDataForCharts(users, campaigns, activities, donations);
      setDashboardData(processedData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processDataForCharts = (users: any[], campaigns: any[], activities: any[], donations: any[]) => {
    // User role distribution
    const userRoles = [
      { name: 'Admin', value: users.filter(u => u.role_id === 1).length, color: '#ea580c' },
      { name: 'Fundraiser', value: users.filter(u => u.role_id === 2).length, color: '#fb923c' },
      { name: 'User', value: users.filter(u => u.role_id === 3).length, color: '#fed7aa' }
    ];

    // Campaign status distribution
    const campaignStatus = [
      { name: 'Đang hoạt động', value: campaigns.filter(c => c.status === 'active').length, color: '#10b981' },
      { name: 'Hoàn thành', value: campaigns.filter(c => c.status === 'completed').length, color: '#3b82f6' },
      { name: 'Tạm dừng', value: campaigns.filter(c => c.status === 'paused').length, color: '#f59e0b' },
      { name: 'Đã hủy', value: campaigns.filter(c => c.status === 'cancelled').length, color: '#ef4444' }
    ];

    // Activity type distribution
    const activityTypes = [
      { name: 'Tình nguyện', value: activities.filter(a => a.type === 'volunteer').length, color: '#ea580c' },
      { name: 'Sự kiện', value: activities.filter(a => a.type === 'event').length, color: '#8b5cf6' },
      { name: 'Cộng đồng', value: activities.filter(a => a.type === 'community').length, color: '#10b981' },
      { name: 'Hội thảo', value: activities.filter(a => a.type === 'workshop').length, color: '#3b82f6' }
    ];

    // Monthly growth data (simulated)
    const monthlyData = [
      { month: 'Jan', users: 120, campaigns: 15, activities: 8, donations: 25000000 },
      { month: 'Feb', users: 150, campaigns: 18, activities: 12, donations: 32000000 },
      { month: 'Mar', users: 180, campaigns: 22, activities: 15, donations: 45000000 },
      { month: 'Apr', users: 220, campaigns: 28, activities: 20, donations: 58000000 },
      { month: 'May', users: 280, campaigns: 35, activities: 25, donations: 72000000 },
      { month: 'Jun', users: 350, campaigns: 42, activities: 30, donations: 89000000 }
    ];

    // Donation trends
    const donationTrends = donations.reduce((acc: any, donation: any) => {
      const date = new Date(donation.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, amount: 0, count: 0 };
      }
      
      acc[monthKey].amount += parseFloat(donation.amount) || 0;
      acc[monthKey].count += 1;
      
      return acc;
    }, {});

    const donationData = Object.values(donationTrends).map((item: any) => ({
      ...item,
      amount: item.amount / 1000000 // Convert to millions
    }));

    return {
      userRoles,
      campaignStatus,
      activityTypes,
      monthlyData,
      donationData,
      summary: {
        totalUsers: users.length,
        totalCampaigns: campaigns.length,
        totalActivities: activities.length,
        totalDonations: donations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0)
      }
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatMillions = (value: number) => {
    return `${value.toFixed(1)}M VND`;
  };

  const exportData = () => {
    // Simple CSV export
    const csvData = [
      ['Loại', 'Giá trị'],
      ...dashboardData.userRoles?.map((item: any) => [item.name, item.value]) || []
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bao_cao_thong_ke.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
        <span className="ml-2 text-lg text-gray-700">Đang tải dữ liệu báo cáo...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Báo cáo thống kê</h2>
          <p className="text-gray-600">Tổng quan và phân tích dữ liệu hệ thống</p>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="week">7 ngày qua</option>
            <option value="month">30 ngày qua</option>
            <option value="quarter">3 tháng qua</option>
            <option value="year">1 năm qua</option>
          </select>
          <button
            onClick={exportData}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.summary?.totalUsers?.toLocaleString('vi-VN') || 0}
              </p>
              <p className="text-xs text-green-600">+12% so với tháng trước</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chiến dịch</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.summary?.totalCampaigns?.toLocaleString('vi-VN') || 0}
              </p>
              <p className="text-xs text-green-600">+8% so với tháng trước</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hoạt động</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.summary?.totalActivities?.toLocaleString('vi-VN') || 0}
              </p>
              <p className="text-xs text-green-600">+15% so với tháng trước</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng quyên góp</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(dashboardData.summary?.totalDonations || 0)}
              </p>
              <p className="text-xs text-green-600">+25% so với tháng trước</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Biểu đồ thống kê</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setChartType('bar')}
              className={`p-2 rounded-lg transition-colors ${
                chartType === 'bar' 
                  ? 'bg-orange-100 text-orange-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`p-2 rounded-lg transition-colors ${
                chartType === 'pie' 
                  ? 'bg-orange-100 text-orange-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <PieChartIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`p-2 rounded-lg transition-colors ${
                chartType === 'line' 
                  ? 'bg-orange-100 text-orange-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LineChartIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Roles Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân bố vai trò người dùng</h3>
          <ResponsiveContainer width="100%" height={300}>
            {chartType === 'pie' ? (
              <PieChart>
                <Pie
                  data={dashboardData.userRoles}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {dashboardData.userRoles?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : (
              <BarChart data={dashboardData.userRoles}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#ea580c" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Campaign Status Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái chiến dịch</h3>
          <ResponsiveContainer width="100%" height={300}>
            {chartType === 'pie' ? (
              <PieChart>
                <Pie
                  data={dashboardData.campaignStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {dashboardData.campaignStatus?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : (
              <BarChart data={dashboardData.campaignStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Monthly Growth Trend */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-100 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Xu hướng tăng trưởng theo tháng</h3>
          <ResponsiveContainer width="100%" height={300}>
            {chartType === 'line' ? (
              <LineChart data={dashboardData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#ea580c" name="Người dùng" />
                <Line type="monotone" dataKey="campaigns" stroke="#10b981" name="Chiến dịch" />
                <Line type="monotone" dataKey="activities" stroke="#3b82f6" name="Hoạt động" />
              </LineChart>
            ) : (
              <AreaChart data={dashboardData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="users" stackId="1" stroke="#ea580c" fill="#ea580c" name="Người dùng" />
                <Area type="monotone" dataKey="campaigns" stackId="1" stroke="#10b981" fill="#10b981" name="Chiến dịch" />
                <Area type="monotone" dataKey="activities" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Hoạt động" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Activity Types */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Loại hoạt động</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.activityTypes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donation Trends */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Xu hướng quyên góp (triệu VND)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dashboardData.donationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatMillions} />
              <Tooltip formatter={(value) => [`${value} triệu VND`, 'Số tiền']} />
              <Area type="monotone" dataKey="amount" stroke="#f59e0b" fill="#fbbf24" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-orange-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Tóm tắt dữ liệu</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Người dùng theo vai trò</h4>
              <div className="space-y-2">
                {dashboardData.userRoles?.map((role: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: role.color }}
                      ></div>
                      <span className="text-sm text-gray-600">{role.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{role.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Chiến dịch theo trạng thái</h4>
              <div className="space-y-2">
                {dashboardData.campaignStatus?.map((status: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: status.color }}
                      ></div>
                      <span className="text-sm text-gray-600">{status.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{status.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Hoạt động theo loại</h4>
              <div className="space-y-2">
                {dashboardData.activityTypes?.map((type: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: type.color }}
                      ></div>
                      <span className="text-sm text-gray-600">{type.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{type.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
