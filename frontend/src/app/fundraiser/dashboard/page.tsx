'use client';

import { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/format';

interface FundraiserStats {
  totalCampaigns: number;
  totalPosts: number;
  totalDonors: number;
  totalRaised: number;
}

interface Campaign {
  id: number;
  title: string;
  status: 'active' | 'ended' | 'pending';
  raised_amount: number;
  target_amount: number;
  end_date: string;
}

export default function FundraiserDashboard() {
  const [stats, setStats] = useState<FundraiserStats>({
    totalCampaigns: 0,
    totalPosts: 0,
    totalDonors: 0,
    totalRaised: 0,
  });
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, campaignsResponse] = await Promise.all([
          fetch('/api/fundraiser/stats'),
          fetch('/api/fundraiser/campaigns'),
        ]);

        if (statsResponse.ok && campaignsResponse.ok) {
          const [statsData, campaignsData] = await Promise.all([
            statsResponse.json(),
            campaignsResponse.json(),
          ]);

          setStats(statsData);
          setCampaigns(campaignsData);
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
      name: 'Tổng số chiến dịch',
      value: stats.totalCampaigns,
      icon: ChartBarIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Tổng số bài viết',
      value: stats.totalPosts,
      icon: DocumentTextIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Tổng số người quyên góp',
      value: stats.totalDonors,
      icon: UserGroupIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Tổng số tiền gây quỹ',
      value: formatCurrency(stats.totalRaised),
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
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

      {/* Campaigns List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Chiến dịch của bạn</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Tên chiến dịch
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Trạng thái
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Số tiền gây quỹ
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Mục tiêu
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Ngày kết thúc
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {campaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {campaign.title}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      campaign.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : campaign.status === 'ended'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {campaign.status === 'active' ? 'Đang hoạt động' : 
                       campaign.status === 'ended' ? 'Đã kết thúc' : 'Chờ duyệt'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className="font-medium text-gray-900">
                      {formatCurrency(campaign.raised_amount)}
                    </div>
                    <div className="text-gray-500">
                      / {formatCurrency(campaign.target_amount)}
                    </div>
                    {((campaign.raised_amount || 0) < campaign.target_amount) && (
                      <div className="text-xs text-orange-600">
                        Thiếu: {formatCurrency(campaign.target_amount - (campaign.raised_amount || 0))}
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {formatCurrency(campaign.target_amount)}
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