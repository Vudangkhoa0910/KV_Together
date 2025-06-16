'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { formatCurrency } from '@/utils/format';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DonationStats {
  totalAmount: number;
  totalCount: number;
  averageAmount: number;
  monthlyDonations: {
    month: string;
    amount: number;
    count: number;
  }[];
}

interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  successRate: number;
  categoryDistribution: {
    name: string;
    count: number;
  }[];
  monthlyCreated: {
    month: string;
    count: number;
  }[];
}

interface UserStats {
  totalUsers: number;
  totalFundraisers: number;
  monthlyRegistrations: {
    month: string;
    users: number;
    fundraisers: number;
  }[];
}

export default function AnalyticsPage() {
  const [donationStats, setDonationStats] = useState<DonationStats | null>(null);
  const [campaignStats, setCampaignStats] = useState<CampaignStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('year');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const [donationsRes, campaignsRes, usersRes] = await Promise.all([
        fetch(`/api/admin/analytics/donations?range=${timeRange}`),
        fetch(`/api/admin/analytics/campaigns?range=${timeRange}`),
        fetch(`/api/admin/analytics/users?range=${timeRange}`),
      ]);

      if (donationsRes.ok && campaignsRes.ok && usersRes.ok) {
        const [donationsData, campaignsData, usersData] = await Promise.all([
          donationsRes.json(),
          campaignsRes.json(),
          usersRes.json(),
        ]);

        setDonationStats(donationsData);
        setCampaignStats(campaignsData);
        setUserStats(usersData);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const donationChartData = {
    labels: donationStats?.monthlyDonations.map((d) => d.month) || [],
    datasets: [
      {
        label: 'Số tiền quyên góp',
        data: donationStats?.monthlyDonations.map((d) => d.amount) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Số lượt quyên góp',
        data: donationStats?.monthlyDonations.map((d) => d.count) || [],
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const campaignChartData = {
    labels: campaignStats?.monthlyCreated.map((d) => d.month) || [],
    datasets: [
      {
        label: 'Chiến dịch mới',
        data: campaignStats?.monthlyCreated.map((d) => d.count) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  };



  const userChartData = {
    labels: userStats?.monthlyRegistrations.map((d) => d.month) || [],
    datasets: [
      {
        label: 'Người dùng mới',
        data: userStats?.monthlyRegistrations.map((d) => d.users) || [],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Fundraiser mới',
        data: userStats?.monthlyRegistrations.map((d) => d.fundraisers) || [],
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
      },
    ],
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Time Range Filter */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex-auto">
              <h1 className="text-xl font-semibold text-gray-900">Thống kê</h1>
              <p className="mt-2 text-sm text-gray-700">
                Xem tổng quan về hoạt động của nền tảng
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="year">12 tháng qua</option>
                <option value="month">30 ngày qua</option>
                <option value="week">7 ngày qua</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Donation Stats */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">Quyên góp</h3>
            <dl className="mt-5 grid grid-cols-1 gap-5">
              <div>
                <dt className="text-sm font-medium text-gray-500">Tổng số tiền</dt>
                <dd className="mt-1 text-3xl font-semibold text-orange-600">
                  {formatCurrency(donationStats?.totalAmount || 0)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Số lượt quyên góp</dt>
                <dd className="mt-1 text-3xl font-semibold text-orange-600">
                  {donationStats?.totalCount || 0}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Trung bình mỗi lượt</dt>
                <dd className="mt-1 text-3xl font-semibold text-orange-600">
                  {formatCurrency(donationStats?.averageAmount || 0)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Campaign Stats */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">Chiến dịch</h3>
            <dl className="mt-5 grid grid-cols-1 gap-5">
              <div>
                <dt className="text-sm font-medium text-gray-500">Tổng số chiến dịch</dt>
                <dd className="mt-1 text-3xl font-semibold text-orange-600">
                  {campaignStats?.totalCampaigns || 0}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Đang hoạt động</dt>
                <dd className="mt-1 text-3xl font-semibold text-orange-600">
                  {campaignStats?.activeCampaigns || 0}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Tỷ lệ thành công</dt>
                <dd className="mt-1 text-3xl font-semibold text-orange-600">
                  {campaignStats?.successRate || 0}%
                </dd>
              </div>
            </dl>
          </div>

          {/* User Stats */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">Người dùng</h3>
            <dl className="mt-5 grid grid-cols-1 gap-5">
              <div>
                <dt className="text-sm font-medium text-gray-500">Tổng số người dùng</dt>
                <dd className="mt-1 text-3xl font-semibold text-orange-600">
                  {userStats?.totalUsers || 0}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Số Fundraiser</dt>
                <dd className="mt-1 text-3xl font-semibold text-orange-600">
                  {userStats?.totalFundraisers || 0}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Donation Trends */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Xu hướng quyên góp</h3>
            <div className="h-80">
              <Line
                data={donationChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>



          {/* Campaign Trends */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Chiến dịch mới</h3>
            <div className="h-80">
              <Bar
                data={campaignChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* User Registration Trends */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Đăng ký mới</h3>
            <div className="h-80">
              <Bar
                data={userChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 