'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  ChartPieIcon,
  PencilIcon, 
  TrashIcon, 
  PlusIcon, 
  CalendarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  FunnelIcon,
  ClockIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface Campaign {
  id: number;
  title: string;
  slug: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'rejected';
  current_amount: number;
  target_amount: number;
  start_date: string;
  end_date: string;
  progress_percentage: number;
  image_url: string;
  donations_count: number;
  days_remaining: number;
  created_at: string;
}

export default function FundraiserCampaignsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    completedCampaigns: 0,
    pendingCampaigns: 0,
    totalRaised: 0,
    averageDonation: 0
  });
  
  useEffect(() => {
    if (user) {
      fetchFundraiserCampaigns();
    }
  }, [page, statusFilter, sortBy, searchTerm, user]);

  const fetchFundraiserCampaigns = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/fundraiser/campaigns?page=${page}&status=${statusFilter}&sort=${sortBy}&search=${searchTerm}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }
      
      const data = await response.json();
      
      if (data && data.data) {
        setCampaigns(data.data);
        setTotalPages(Math.ceil(data.meta.total / 10));
        
        // Calculate stats
        const allCampaigns = data.data;
        setStats({
          totalCampaigns: data.meta.total,
          activeCampaigns: allCampaigns.filter((c: Campaign) => c.status === 'active').length,
          completedCampaigns: allCampaigns.filter((c: Campaign) => c.status === 'completed').length,
          pendingCampaigns: allCampaigns.filter((c: Campaign) => c.status === 'pending').length,
          totalRaised: allCampaigns.reduce((sum: number, campaign: Campaign) => sum + campaign.current_amount, 0),
          averageDonation: calculateAverageDonation(allCampaigns)
        });
        
        setLoading(false);
        return;
      }
      
      // Fallback to mock data if API fails or returns invalid data
      const mockCampaigns: Campaign[] = [
        {
          id: 1,
          title: 'Hỗ trợ trẻ em vùng cao',
          slug: 'ho-tro-tre-em-vung-cao',
          description: 'Chương trình hỗ trợ trẻ em vùng cao với các nhu yếu phẩm và đồ dùng học tập',
          status: 'active',
          current_amount: 452000000,
          target_amount: 500000000,
          start_date: '2025-04-15',
          end_date: '2025-08-15',
          progress_percentage: 90.4,
          image_url: '/images/campaigns/education.jpg',
          donations_count: 124,
          days_remaining: 59,
          created_at: '2025-04-15'
        },
        {
          id: 2,
          title: 'Xây dựng thư viện số cho trường làng',
          slug: 'xay-dung-thu-vien-so-cho-truong-lang',
          description: 'Dự án xây dựng thư viện số với máy tính và sách điện tử cho các trường học vùng xa',
          status: 'active',
          current_amount: 320000000,
          target_amount: 400000000,
          start_date: '2025-05-01',
          end_date: '2025-09-01',
          progress_percentage: 80,
          image_url: '/images/campaigns/library.jpg',
          donations_count: 87,
          days_remaining: 76,
          created_at: '2025-05-01'
        },
        {
          id: 3,
          title: 'Cứu trợ đồng bào bị lũ lụt',
          slug: 'cuu-tro-dong-bao-bi-lu-lut',
          description: 'Quyên góp để hỗ trợ đồng bào miền Trung đang chịu ảnh hưởng nặng nề từ lũ lụt',
          status: 'completed',
          current_amount: 850000000,
          target_amount: 800000000,
          start_date: '2025-03-10',
          end_date: '2025-05-10',
          progress_percentage: 106.25,
          image_url: '/images/campaigns/flood.jpg',
          donations_count: 432,
          days_remaining: 0,
          created_at: '2025-03-10'
        },
        {
          id: 4,
          title: 'Trang bị y tế cho trạm xá vùng núi',
          slug: 'trang-bi-y-te-cho-tram-xa-vung-nui',
          description: 'Cung cấp trang thiết bị y tế cơ bản cho các trạm xá vùng cao, khó khăn',
          status: 'pending',
          current_amount: 0,
          target_amount: 350000000,
          start_date: '2025-07-01',
          end_date: '2025-10-01',
          progress_percentage: 0,
          image_url: '/images/campaigns/medical.jpg',
          donations_count: 0,
          days_remaining: 106,
          created_at: '2025-06-15'
        },
        {
          id: 5,
          title: 'Học bổng cho sinh viên vượt khó',
          slug: 'hoc-bong-cho-sinh-vien-vuot-kho',
          description: 'Trao học bổng cho các sinh viên có hoàn cảnh khó khăn nhưng nỗ lực học tập',
          status: 'active',
          current_amount: 180000000,
          target_amount: 300000000,
          start_date: '2025-05-15',
          end_date: '2025-08-15',
          progress_percentage: 60,
          image_url: '/images/campaigns/scholarship.jpg',
          donations_count: 73,
          days_remaining: 59,
          created_at: '2025-05-15'
        }
      ];
      
      // Filter campaigns based on status
      let filteredCampaigns = [...mockCampaigns];
      if (statusFilter !== 'all') {
        filteredCampaigns = mockCampaigns.filter(campaign => campaign.status === statusFilter);
      }
      
      // Filter campaigns based on search term
      if (searchTerm) {
        filteredCampaigns = filteredCampaigns.filter(
          campaign => campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                     campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Sort campaigns
      filteredCampaigns.sort((a, b) => {
        switch (sortBy) {
          case 'oldest':
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          case 'amount':
            return b.current_amount - a.current_amount;
          case 'progress':
            return b.progress_percentage - a.progress_percentage;
          case 'deadline':
            return a.days_remaining - b.days_remaining;
          case 'newest':
          default:
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      });
      
      setCampaigns(filteredCampaigns);
      setTotalPages(Math.ceil(filteredCampaigns.length / 5));
      
      // Set stats
      setStats({
        totalCampaigns: mockCampaigns.length,
        activeCampaigns: mockCampaigns.filter(c => c.status === 'active').length,
        completedCampaigns: mockCampaigns.filter(c => c.status === 'completed').length,
        pendingCampaigns: mockCampaigns.filter(c => c.status === 'pending').length,
        totalRaised: mockCampaigns.reduce((sum, campaign) => sum + campaign.current_amount, 0),
        averageDonation: Math.round(
          mockCampaigns.reduce((sum, campaign) => sum + campaign.current_amount, 0) / 
          mockCampaigns.reduce((sum, campaign) => sum + campaign.donations_count, 0) || 1
        )
      });
      
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageDonation = (campaigns: Campaign[]) => {
    const totalDonations = campaigns.reduce((sum, campaign) => sum + (campaign.donations_count || 0), 0);
    const totalAmount = campaigns.reduce((sum, campaign) => sum + (campaign.current_amount || 0), 0);
    return totalDonations > 0 ? totalAmount / totalDonations : 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };
  
  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chiến dịch này?')) return;
    
    try {
      // await fetch(`/api/fundraiser/campaigns/${id}`, {
      //   method: 'DELETE'
      // });
      
      // Simulated delete for development
      setCampaigns(campaigns.filter(campaign => campaign.id !== id));
      alert('Chiến dịch đã được xóa thành công');
      
    } catch (err) {
      console.error('Error deleting campaign:', err);
      alert('Có lỗi xảy ra khi xóa chiến dịch');
    }
  };
  
  const getStatusBadgeClasses = (status: string) => {
    switch(status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusText = (status: string) => {
    switch(status) {
      case 'active':
        return 'Đang hoạt động';
      case 'completed':
        return 'Hoàn thành';
      case 'pending':
        return 'Chờ duyệt';
      case 'rejected':
        return 'Từ chối';
      default:
        return 'Không xác định';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý chiến dịch</h1>
          <p className="text-gray-600">Quản lý và theo dõi tất cả các chiến dịch gây quỹ của bạn</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link 
            href="/fundraiser/campaigns/create" 
            className="inline-flex items-center px-4 py-2 bg-orange-600 border border-transparent rounded-md font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Tạo chiến dịch mới
          </Link>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <ChartPieIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tổng chiến dịch</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalCampaigns}</p>
              <div className="flex items-center mt-1">
                <span className="text-xs font-medium text-green-600">{stats.activeCampaigns} đang hoạt động</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <CurrencyDollarIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tổng quyên góp</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalRaised)}</p>
              <div className="flex items-center mt-1">
                <span className="text-xs font-medium text-green-600">TB: {formatCurrency(stats.averageDonation)}/lượt</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <ChartPieIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Hoàn thành</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completedCampaigns}</p>
              <div className="flex items-center mt-1">
                <span className="text-xs font-medium text-blue-600">
                  {stats.totalCampaigns > 0 
                    ? `${Math.round((stats.completedCampaigns / stats.totalCampaigns) * 100)}% tỷ lệ thành công`
                    : '0% tỷ lệ thành công'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <ClockIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Chờ duyệt</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingCampaigns}</p>
              <div className="flex items-center mt-1">
                <span className="text-xs font-medium text-yellow-600">Chưa được phê duyệt</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">Tìm kiếm</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Tìm kiếm chiến dịch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div>
                <label htmlFor="status" className="sr-only">Trạng thái</label>
                <div className="relative">
                  <select
                    id="status"
                    name="status"
                    className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="rejected">Đã từ chối</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="sort" className="sr-only">Sắp xếp theo</label>
                <div className="relative">
                  <select
                    id="sort"
                    name="sort"
                    className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                    <option value="amount">Số tiền quyên góp</option>
                    <option value="progress">Tiến độ</option>
                    <option value="deadline">Thời hạn</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Campaign List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">
            <svg className="animate-spin h-10 w-10 mx-auto text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto h-20 w-20 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Chưa có chiến dịch nào</h3>
            <p className="mt-1 text-gray-500">Bắt đầu bằng cách tạo chiến dịch mới.</p>
            <div className="mt-6">
              <Link
                href="/fundraiser/campaigns/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Tạo chiến dịch
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chiến dịch
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiến độ
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quyên góp
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-16 rounded overflow-hidden">
                          <img className="h-full w-full object-cover" src={campaign.image_url} alt={campaign.title} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            <Link href={`/campaigns/${campaign.slug}`} className="hover:text-orange-600">
                              {campaign.title}
                            </Link>
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {campaign.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClasses(campaign.status)}`}>
                        {getStatusText(campaign.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${campaign.progress_percentage >= 100 ? 'bg-green-500' : 'bg-orange-500'}`} 
                            style={{ width: `${Math.min(100, campaign.progress_percentage)}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-700">{campaign.progress_percentage.toFixed(1)}%</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatCurrency(campaign.current_amount)} / {formatCurrency(campaign.target_amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <UserGroupIcon className="h-4 w-4 text-gray-400 mr-1" />
                        {formatNumber(campaign.donations_count)} nhà hảo tâm
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
                          {format(new Date(campaign.end_date), 'dd/MM/yyyy', {locale: vi})}
                        </div>
                        <div className="text-xs mt-1">
                          {campaign.days_remaining > 0 
                            ? `Còn ${campaign.days_remaining} ngày` 
                            : 'Đã kết thúc'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link 
                          href={`/fundraiser/campaigns/${campaign.slug}/analytics`}
                          className="text-indigo-600 hover:text-indigo-900 p-2 rounded hover:bg-gray-100"
                          title="Phân tích chiến dịch"
                        >
                          <ChartPieIcon className="h-5 w-5" />
                        </Link>
                        <Link 
                          href={`/fundraiser/campaigns/${campaign.slug}/updates`}
                          className="text-green-600 hover:text-green-900 p-2 rounded hover:bg-gray-100"
                          title="Quản lý cập nhật"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </Link>
                        <Link 
                          href={`/fundraiser/campaigns/${campaign.slug}/edit`}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-gray-100"
                          title="Chỉnh sửa chiến dịch"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(campaign.id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-gray-100"
                          title="Xóa chiến dịch"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {!loading && campaigns.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">{campaigns.length}</span> trong tổng số <span className="font-medium">{campaigns.length}</span> chiến dịch
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronUpIcon className="h-5 w-5 transform -rotate-90" aria-hidden="true" />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                        page === pageNum 
                          ? 'z-10 bg-orange-50 border-orange-500 text-orange-600' 
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronDownIcon className="h-5 w-5 transform -rotate-90" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}