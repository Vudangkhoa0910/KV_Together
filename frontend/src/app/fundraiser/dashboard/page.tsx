'use client';

import { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserGroupIcon,
  CalendarIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/format';
import Link from 'next/link';

interface FundraiserStats {
  totalCampaigns: number;
  totalActivities: number;
  totalNews: number;
  totalDonors: number;
  totalRaised: number;
  walletBalance: number;
}

interface Campaign {
  id: number;
  title: string;
  status: 'active' | 'completed' | 'ended_partial';
  current_amount: number;
  target_amount: number;
  end_date: string;
  slug: string;
}

interface Activity {
  id: number;
  title: string;
  status: string;
  event_date: string;
  current_participants: number;
  max_participants: number;
  slug: string;
}

interface News {
  id: number;
  title: string;
  status: string;
  published_date: string;
  views_count: number;
  category: string;
  slug: string;
}

export default function FundraiserDashboard() {
  const [stats, setStats] = useState<FundraiserStats>({
    totalCampaigns: 5,
    totalActivities: 3,
    totalNews: 4,
    totalDonors: 156,
    totalRaised: 370000000,
    walletBalance: 5000000,
  });
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 1,
      title: 'Giúp đỡ trẻ em vùng cao có cơ hội đến trường',
      status: 'active',
      current_amount: 45000000,
      target_amount: 50000000,
      end_date: '2025-07-11',
      slug: 'giup-do-tre-em-vung-cao-co-co-hoi-den-truong',
    },
    {
      id: 2,
      title: 'Xây dựng thư viện cho trường tiểu học vùng sâu',
      status: 'active',
      current_amount: 25000000,
      target_amount: 80000000,
      end_date: '2025-07-26',
      slug: 'xay-dung-thu-vien-cho-truong-tieu-hoc-vung-sau',
    },
    {
      id: 3,
      title: 'Phẫu thuật tim miễn phí cho trẻ em nghèo',
      status: 'completed',
      current_amount: 200000000,
      target_amount: 200000000,
      end_date: '2025-06-21',
      slug: 'phau-thuat-tim-mien-phi-cho-tre-em-ngheo',
    },
  ]);

  const [activities, setActivities] = useState<Activity[]>([
    {
      id: 1,
      title: 'Tình nguyện dạy học cho trẻ em vùng cao',
      status: 'published',
      event_date: '2025-07-06',
      current_participants: 35,
      max_participants: 50,
      slug: 'tinh-nguyen-day-hoc-cho-tre-em-vung-cao',
    },
    {
      id: 2,
      title: 'Làm sạch bãi biển và bảo vệ môi trường',
      status: 'published',
      event_date: '2025-07-01',
      current_participants: 78,
      max_participants: 100,
      slug: 'lam-sach-bai-bien-va-bao-ve-moi-truong',
    },
  ]);

  const [news, setNews] = useState<News[]>([
    {
      id: 1,
      title: 'Kết quả chiến dịch "Phẫu thuật tim miễn phí" - 50 em nhỏ được cứu sống',
      status: 'published',
      published_date: '2025-06-23',
      views_count: 1250,
      category: 'story',
      slug: 'ket-qua-chien-dich-phau-thuat-tim-mien-phi-50-em-nho-duoc-cuu-song',
    },
    {
      id: 2,
      title: 'Khai trương thư viện mới tại trường tiểu học vùng sâu',
      status: 'published',
      published_date: '2025-06-19',
      views_count: 890,
      category: 'story',
      slug: 'khai-truong-thu-vien-moi-tai-truong-tieu-hoc-vung-sau',
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simulate loading real data 
    setIsLoading(false);
  }, []);

  const statCards = [
    {
      name: 'Tổng số chiến dịch',
      value: stats.totalCampaigns,
      icon: ChartBarIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Tổng số hoạt động',
      value: stats.totalActivities,
      icon: CalendarIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Tổng số tin tức',
      value: stats.totalNews,
      icon: DocumentTextIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Số dư ví Credits',
      value: formatCurrency(stats.walletBalance),
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'ended_partial':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Đang hoạt động';
      case 'completed':
        return 'Hoàn thành';
      case 'ended_partial':
        return 'Kết thúc một phần';
      case 'published':
        return 'Đã xuất bản';
      default:
        return status;
    }
  };

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

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Campaigns List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Chiến dịch gần đây</h2>
            <Link 
              href="/fundraiser/campaigns" 
              className="text-sm text-orange-600 hover:text-orange-500"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="overflow-hidden">
            <div className="space-y-3 p-4">
              {campaigns.slice(0, 3).map((campaign) => (
                <div key={campaign.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {campaign.title}
                    </h3>
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(campaign.status)}`}>
                      {getStatusText(campaign.status)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Đã gây quỹ</span>
                      <span>{formatCurrency(campaign.current_amount)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full" 
                        style={{ width: `${Math.min((campaign.current_amount / campaign.target_amount) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{Math.round((campaign.current_amount / campaign.target_amount) * 100)}% hoàn thành</span>
                      <span>Mục tiêu: {formatCurrency(campaign.target_amount)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activities List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Hoạt động sắp tới</h2>
            <Link 
              href="/fundraiser/activities" 
              className="text-sm text-orange-600 hover:text-orange-500"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="overflow-hidden">
            <div className="space-y-3 p-4">
              {activities.map((activity) => (
                <div key={activity.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </h3>
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(activity.status)}`}>
                      {getStatusText(activity.status)}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>Ngày tổ chức</span>
                      <span>{new Date(activity.event_date).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Người tham gia</span>
                      <span>{activity.current_participants}/{activity.max_participants}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* News List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Tin tức mới nhất</h2>
            <Link 
              href="/fundraiser/news" 
              className="text-sm text-orange-600 hover:text-orange-500"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="overflow-hidden">
            <div className="space-y-3 p-4">
              {news.map((article) => (
                <div key={article.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {article.title}
                    </h3>
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(article.status)}`}>
                      {getStatusText(article.status)}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>Ngày xuất bản</span>
                      <span>{new Date(article.published_date).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Lượt xem</span>
                      <span>{article.views_count.toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Hành động nhanh</h2>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <Link 
                href="/fundraiser/campaigns/create"
                className="flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <ChartBarIcon className="h-4 w-4 mr-2" />
                Tạo chiến dịch mới
              </Link>
              <Link 
                href="/fundraiser/activities/create"
                className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Tạo hoạt động mới
              </Link>
              <Link 
                href="/fundraiser/news/create"
                className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Viết tin tức mới
              </Link>
              <Link 
                href="/fundraiser/notifications"
                className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <BellIcon className="h-4 w-4 mr-2" />
                Xem thông báo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 