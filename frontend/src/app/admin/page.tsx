'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  CurrencyDollarIcon,
  UserGroupIcon,
  FlagIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency, formatDate } from '@/utils/format';
import { useRouter } from 'next/navigation';

interface Stats {
  totalUsers: number;
  totalCampaigns: number;
  totalDonations: number;
  totalAmount: number;
  pendingFundraisers: number;
  pendingCampaigns: number;
}

interface PendingFundraiser {
  id: number;
  name: string;
  fundraiser_type: 'personal' | 'organization';
  created_at: string;
}

interface RecentActivity {
  id: number;
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
  const [pendingFundraisers, setPendingFundraisers] = useState<PendingFundraiser[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, pendingResponse] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/users?status=pending&role=fundraiser'),
        ]);

        if (statsResponse.ok && pendingResponse.ok) {
          const statsData = await statsResponse.json();
          const pendingData = await pendingResponse.json();
          setStats(statsData);
          setPendingFundraisers(pendingData.users);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, activitiesResponse] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/activities'),
        ]);

        if (statsResponse.ok && activitiesResponse.ok) {
          const [statsData, activitiesData] = await Promise.all([
            statsResponse.json(),
            activitiesResponse.json(),
          ]);

          setStats(statsData);
          setRecentActivities(activitiesData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      name: 'Tổng số người dùng',
      value: stats.totalUsers,
      icon: UserGroupIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Tổng số chiến dịch',
      value: stats.totalCampaigns,
      icon: FlagIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Tổng số quyên góp',
      value: stats.totalDonations,
      icon: ChartBarIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Tổng số tiền',
      value: formatCurrency(stats.totalAmount),
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <div
              key={stat.name}
              className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6"
            >
              <dt>
                <div className={`absolute rounded-md ${stat.color} p-3`}>
                  <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
              </dt>
              <dd className="ml-16 flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </dd>
            </div>
          ))}
        </div>

        {/* Pending Approvals */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Pending Fundraisers */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Chờ duyệt Fundraiser</h2>
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-0.5 text-sm font-medium text-yellow-800">
                  {stats.pendingFundraisers} đang chờ
                </span>
              </div>
              <div className="mt-4">
                <div className="flow-root">
                  <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead>
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                              Tên
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Loại
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Ngày đăng ký
                            </th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {pendingFundraisers.map((user) => (
                            <tr key={user.id}>
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                                {user.name}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {user.fundraiser_type === 'personal' ? 'Cá nhân' : 'Tổ chức'}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {formatDate(user.created_at)}
                              </td>
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                <button
                                  onClick={() => router.push(`/admin/users?id=${user.id}`)}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  Xem chi tiết
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Campaigns */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Chờ duyệt Chiến dịch</h2>
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-0.5 text-sm font-medium text-yellow-800">
                  {stats.pendingCampaigns} đang chờ
                </span>
              </div>
              <div className="mt-4">
                {/* Add pending campaigns list here */}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900">Hoạt động gần đây</h2>
            <div className="mt-4 flow-root">
              <ul role="list" className="-mb-8">
                {recentActivities.map((activity, index) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {index !== recentActivities.length - 1 && (
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
                                ? 'bg-blue-500'
                                : activity.type === 'campaign_created'
                                ? 'bg-green-500'
                                : 'bg-purple-500'
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
                            <time dateTime={activity.timestamp}>
                              {new Date(activity.timestamp).toLocaleString('vi-VN')}
                            </time>
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
      </div>
    </AdminLayout>
  );
} 