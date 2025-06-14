'use client';

import { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  HeartIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/format';

interface UserStats {
  totalDonations: number;
  totalAmount: number;
  followedCampaigns: number;
}

interface DonationHistory {
  id: number;
  campaign_title: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

interface FollowedCampaign {
  id: number;
  title: string;
  raised_amount: number;
  target_amount: number;
  end_date: string;
  status: 'active' | 'ended';
}

export default function UserDashboard() {
  const [stats, setStats] = useState<UserStats>({
    totalDonations: 0,
    totalAmount: 0,
    followedCampaigns: 0,
  });
  const [donations, setDonations] = useState<DonationHistory[]>([]);
  const [followedCampaigns, setFollowedCampaigns] = useState<FollowedCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, donationsResponse, campaignsResponse] = await Promise.all([
          fetch('/api/user/stats'),
          fetch('/api/user/donations'),
          fetch('/api/user/followed-campaigns'),
        ]);

        if (statsResponse.ok && donationsResponse.ok && campaignsResponse.ok) {
          const [statsData, donationsData, campaignsData] = await Promise.all([
            statsResponse.json(),
            donationsResponse.json(),
            campaignsResponse.json(),
          ]);

          setStats(statsData);
          setDonations(donationsData);
          setFollowedCampaigns(campaignsData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      name: 'Tổng số lần quyên góp',
      value: stats.totalDonations,
      icon: HeartIcon,
      color: 'bg-pink-500',
    },
    {
      name: 'Tổng số tiền đã quyên góp',
      value: formatCurrency(stats.totalAmount),
      icon: CurrencyDollarIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Chiến dịch đang theo dõi',
      value: stats.followedCampaigns,
      icon: ClockIcon,
      color: 'bg-blue-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Trang cá nhân</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
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

      {/* Recent Donations */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Lịch sử quyên góp gần đây</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Chiến dịch
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Số tiền
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Ngày
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {donations.map((donation) => (
                <tr key={donation.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {donation.campaign_title}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {formatCurrency(donation.amount)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {new Date(donation.date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      donation.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : donation.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {donation.status === 'completed' ? 'Hoàn thành' :
                       donation.status === 'pending' ? 'Đang xử lý' : 'Thất bại'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Followed Campaigns */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Chiến dịch đang theo dõi</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Tên chiến dịch
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Số tiền đã gây quỹ
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Mục tiêu
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Trạng thái
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Ngày kết thúc
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {followedCampaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {campaign.title}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {formatCurrency(campaign.raised_amount)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {formatCurrency(campaign.target_amount)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {campaign.status === 'active' ? 'Đang hoạt động' : 'Đã kết thúc'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {new Date(campaign.end_date).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 