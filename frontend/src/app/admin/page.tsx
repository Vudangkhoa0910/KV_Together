'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  FlagIcon, 
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { adminApi } from '@/services/api';

interface Stats {
  totalUsers: number;
  totalCampaigns: number;
  totalDonations: number;
  totalAmount: number;
  pendingFundraisers: number;
  pendingCampaigns: number;
  todayStats?: {
    newUsers: number;
    newDonations: number;
    newCampaigns: number;
    donationAmount: number;
  };
}

interface Activity {
  id: string;
  type: 'user_registered' | 'campaign_created' | 'donation_received';
  message: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCampaigns: 0,
    totalDonations: 0,
    totalAmount: 0,
    pendingFundraisers: 0,
    pendingCampaigns: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch stats and activities in parallel
        const [statsResponse, activitiesResponse] = await Promise.all([
          adminApi.getStats().catch(() => null),
          adminApi.getActivities().catch(() => null),
        ]);

        // Set stats (with fallback to mock data)
        if (statsResponse?.data) {
          setStats(statsResponse.data);
        } else {
          // Fallback to mock data
          setStats({
            totalUsers: 1250,
            totalCampaigns: 89,
            totalDonations: 3456,
            totalAmount: 2450000000,
            pendingFundraisers: 12,
            pendingCampaigns: 8,
            todayStats: {
              newUsers: 45,
              newDonations: 128,
              newCampaigns: 3,
              donationAmount: 25000000,
            },
          });
        }

        // Set activities (with fallback to mock data)
        if (activitiesResponse?.data) {
          setActivities(activitiesResponse.data);
        } else {
          // Fallback to mock activities
          setActivities([
            {
              id: '1',
              type: 'user_registered',
              message: 'Nguyễn Văn A đã đăng ký tài khoản',
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            },
            {
              id: '2',
              type: 'donation_received',
              message: 'Nhận được quyên góp 500,000 VND cho chiến dịch "Hỗ trợ trẻ em vùng cao"',
              timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            },
            {
              id: '3',
              type: 'campaign_created',
              message: 'Chiến dịch "Xây dựng trường học" đã được tạo',
              timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            },
          ]);
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Không thể tải dữ liệu dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const statCards = [
    {
      name: 'Tổng số người dùng',
      value: stats.totalUsers.toLocaleString(),
      icon: UserGroupIcon,
      color: 'bg-orange-500',
      change: '+12%',
      href: '/admin/users',
    },
    {
      name: 'Tổng số chiến dịch',
      value: stats.totalCampaigns.toLocaleString(),
      icon: FlagIcon,
      color: 'bg-orange-600',
      change: '+8%',
      href: '/admin/campaigns',
    },
    {
      name: 'Tổng số quyên góp',
      value: stats.totalDonations.toLocaleString(),
      icon: ChartBarIcon,
      color: 'bg-orange-700',
      change: '+23%',
      href: '/admin/donations',
    },
    {
      name: 'Tổng số tiền',
      value: formatCurrency(stats.totalAmount),
      icon: CurrencyDollarIcon,
      color: 'bg-orange-800',
      change: '+18%',
      href: '/admin/analytics',
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Lỗi tải dữ liệu</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Quản Trị</h1>
            <p className="mt-2 text-gray-600">Tổng quan hệ thống và quản lý nhanh</p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/admin/campaigns"
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors flex items-center"
            >
              <FlagIcon className="w-4 h-4 mr-2" />
              Quản lý chiến dịch
            </Link>
            <Link
              href="/admin/users"
              className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors flex items-center"
            >
              <UserGroupIcon className="w-4 h-4 mr-2" />
              Quản lý người dùng
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="relative overflow-hidden rounded-lg bg-white px-6 py-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center">
              <div className={`rounded-md ${stat.color} p-3 group-hover:scale-110 transition-transform duration-200`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500 truncate">{stat.name}</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <p className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    {stat.change}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Today's Stats */}
      {stats.todayStats && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Thống kê hôm nay</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center p-4 bg-orange-50 rounded-lg">
              <UserGroupIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Người dùng mới</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.todayStats.newUsers}</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-orange-100 rounded-lg">
              <ChartBarIcon className="h-8 w-8 text-orange-700" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Quyên góp mới</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.todayStats.newDonations}</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-orange-200 rounded-lg">
              <FlagIcon className="h-8 w-8 text-orange-800" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Chiến dịch mới</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.todayStats.newCampaigns}</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-orange-300 rounded-lg">
              <CurrencyDollarIcon className="h-8 w-8 text-orange-900" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Số tiền hôm nay</p>
                <p className="text-xl font-semibold text-gray-900">{formatCurrency(stats.todayStats.donationAmount)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Thao tác nhanh</h2>
          <div className="space-y-4">
            <Link
              href="/admin/users?status=pending"
              className="flex items-center justify-between p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors group"
            >
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Chờ duyệt</p>
                  <p className="text-2xl font-semibold text-orange-600">
                    {stats.pendingFundraisers + stats.pendingCampaigns}
                  </p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>

            <Link
              href="/admin/analytics"
              className="flex items-center justify-between p-4 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors group"
            >
              <div className="flex items-center">
                <CheckCircleIcon className="h-6 w-6 text-orange-700" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Hoàn thành hôm nay</p>
                  <p className="text-2xl font-semibold text-orange-700">
                    {stats.todayStats?.newDonations || 0}
                  </p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Hoạt động gần đây</h2>
            <Link
              href="/admin/activities"
              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              {activities.slice(0, 5).map((activity, index) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {index !== activities.length - 1 && index !== 4 && (
                      <span
                        className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            activity.type === 'user_registered'
                              ? 'bg-orange-500'
                              : activity.type === 'campaign_created'
                              ? 'bg-orange-600'
                              : 'bg-orange-700'
                          } ring-8 ring-white`}
                        >
                          {activity.type === 'user_registered' ? (
                            <UserGroupIcon className="h-5 w-5 text-white" />
                          ) : activity.type === 'campaign_created' ? (
                            <FlagIcon className="h-5 w-5 text-white" />
                          ) : (
                            <CurrencyDollarIcon className="h-5 w-5 text-white" />
                          )}
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div>
                          <p className="text-sm text-gray-500">{activity.message}</p>
                        </div>
                        <div className="whitespace-nowrap text-right text-sm text-gray-500">
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            <time dateTime={activity.timestamp}>
                              {new Date(activity.timestamp).toLocaleString('vi-VN')}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Management Links */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Quản lý hệ thống</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/users"
            className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors group"
          >
            <UserGroupIcon className="h-8 w-8 text-orange-600 group-hover:scale-110 transition-transform duration-200" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900">Quản lý người dùng</p>
              <p className="text-xs text-gray-500">Xem và quản lý tài khoản</p>
            </div>
          </Link>
          
          <Link
            href="/admin/campaigns"
            className="flex items-center p-4 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors group"
          >
            <FlagIcon className="h-8 w-8 text-orange-700 group-hover:scale-110 transition-transform duration-200" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900">Quản lý chiến dịch</p>
              <p className="text-xs text-gray-500">Duyệt và quản lý chiến dịch</p>
            </div>
          </Link>
          
          <Link
            href="/admin/donations"
            className="flex items-center p-4 bg-orange-150 rounded-lg hover:bg-orange-250 transition-colors group"
          >
            <CurrencyDollarIcon className="h-8 w-8 text-orange-800 group-hover:scale-110 transition-transform duration-200" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900">Quản lý quyên góp</p>
              <p className="text-xs text-gray-500">Theo dõi các giao dịch</p>
            </div>
          </Link>
          
          <Link
            href="/admin/analytics"
            className="flex items-center p-4 bg-orange-200 rounded-lg hover:bg-orange-300 transition-colors group"
          >
            <ChartBarIcon className="h-8 w-8 text-orange-900 group-hover:scale-110 transition-transform duration-200" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900">Thống kê & Báo cáo</p>
              <p className="text-xs text-gray-500">Xem dữ liệu chi tiết</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
