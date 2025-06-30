'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
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
  ChevronDownIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { requestCampaignDeletion, getFundraiserCampaigns, Campaign } from '@/services/api';

export default function FundraiserCampaignsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  
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
      
      const data = await getFundraiserCampaigns({
        page,
        status: statusFilter === 'all' ? undefined : statusFilter,
        sort_by: sortBy === 'newest' ? 'created_at' : 
                 sortBy === 'oldest' ? 'created_at' :
                 sortBy === 'amount' ? 'current_amount' :
                 sortBy === 'progress' ? 'progress_percentage' :
                 sortBy === 'deadline' ? 'end_date' : 'created_at',
        sort_order: sortBy === 'oldest' ? 'asc' : 'desc',
        search: searchTerm || undefined,
        per_page: 10
      });
      
      if (data && data.data) {
        setCampaigns(data.data);
        setTotalPages(data.last_page);
        
        // Calculate stats from all campaigns (you might want to add a separate API for this)
        const allCampaigns = data.data;
        setStats({
          totalCampaigns: data.total,
          activeCampaigns: allCampaigns.filter((c: Campaign) => c.status === 'active').length,
          completedCampaigns: allCampaigns.filter((c: Campaign) => c.status === 'completed').length,
          pendingCampaigns: allCampaigns.filter((c: Campaign) => c.status === 'pending').length,
          totalRaised: allCampaigns.reduce((sum: number, campaign: Campaign) => sum + campaign.current_amount, 0),
          averageDonation: calculateAverageDonation(allCampaigns)
        });
        
        setLoading(false);
        return;
      }
      
      // This should not happen with the new API, but keep as fallback
      setCampaigns([]);
      setStats({
        totalCampaigns: 0,
        activeCampaigns: 0,
        completedCampaigns: 0,
        pendingCampaigns: 0,
        totalRaised: 0,
        averageDonation: 0
      });
      
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      
      // Show empty state when API fails
      setCampaigns([]);
      setTotalPages(1);
      setStats({
        totalCampaigns: 0,
        activeCampaigns: 0,
        completedCampaigns: 0,
        pendingCampaigns: 0,
        totalRaised: 0,
        averageDonation: 0
      });
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
    // Handle NaN, Infinity, and null/undefined values
    const safeAmount = isNaN(amount) || !isFinite(amount) || amount == null ? 0 : amount;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(safeAmount);
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
      toast.success('Chiến dịch đã được xóa thành công', {
        icon: '✅',
        duration: 5000,
      });
      
    } catch (err) {
      console.error('Error deleting campaign:', err);
      toast.error('Có lỗi xảy ra khi xóa chiến dịch', {
        icon: '❌',
        duration: 5000,
      });
    }
  };

  const handleDeleteClick = (campaign: Campaign) => {
    setCampaignToDelete(campaign);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!campaignToDelete || !deleteReason.trim()) {
      toast.error('Vui lòng nhập lý do xóa chiến dịch', {
        icon: '⚠️',
        duration: 4000,
        style: {
          background: '#F59E0B',
          color: '#fff',
          fontWeight: '500',
          padding: '12px 16px',
          borderRadius: '8px',
        },
      });
      return;
    }

    setIsDeleting(true);
    try {
      await requestCampaignDeletion(campaignToDelete.slug, deleteReason.trim());
      
      // Cập nhật campaign trong danh sách để hiển thị trạng thái deletion_requested
      setCampaigns(prev => 
        prev.map(c => 
          c.id === campaignToDelete.id 
            ? { ...c, deletion_requested: true, deletion_status: 'pending' as const }
            : c
        )
      );
      
      // Đóng modal và reset state
      setShowDeleteModal(false);
      setCampaignToDelete(null);
      setDeleteReason('');
      
      // Show success notification
      setShowSuccessNotification(true);
      
      // Custom success toast with better styling
      toast.success(
        (t) => (
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-3">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-green-900">Yêu cầu đã được gửi!</p>
              <p className="text-sm text-green-700">Admin sẽ xem xét và phê duyệt yêu cầu của bạn</p>
            </div>
          </div>
        ),
        {
          duration: 6000,
          style: {
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: '#fff',
            padding: '16px',
            borderRadius: '12px',
            maxWidth: '500px',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
          },
        }
      );
      
      // Hide success notification after 3 seconds
      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 3000);
      
    } catch (error: any) {
      console.error('Error requesting campaign deletion:', error);
      toast.error(
        (t) => (
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-red-900">Có lỗi xảy ra!</p>
              <p className="text-sm text-red-700">
                {error.message || 'Vui lòng thử lại sau hoặc liên hệ admin.'}
              </p>
            </div>
          </div>
        ),
        {
          duration: 6000,
          style: {
            background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
            color: '#fff',
            padding: '16px',
            borderRadius: '12px',
            maxWidth: '500px',
            boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
          },
        }
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setCampaignToDelete(null);
    setDeleteReason('');
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
      {/* Success Notification Overlay */}
      {showSuccessNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 transform animate-in zoom-in-95 duration-300">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4 animate-bounce">
                <CheckCircleIcon className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Yêu cầu đã được gửi thành công!
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Yêu cầu xóa chiến dịch <span className="font-medium text-gray-900">"{campaignToDelete?.title}"</span> đã được gửi thành công. 
                Admin sẽ xem xét và phản hồi trong thời gian sớm nhất.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-green-800 font-medium mb-1">Lưu ý quan trọng:</p>
                    <p className="text-sm text-green-700">
                      Chiến dịch sẽ vẫn hoạt động bình thường cho đến khi được admin phê duyệt xóa.
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowSuccessNotification(false)}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

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
      
      {/* Campaign List - Card Layout */}
      {loading ? (
        <div className="p-10 text-center">
          <svg className="animate-spin h-10 w-10 mx-auto text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <div className="mx-auto h-20 w-20 text-gray-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có chiến dịch nào</h3>
          <p className="text-gray-500 mb-8">Bắt đầu bằng cách tạo chiến dịch đầu tiên của bạn để gây quỹ cho những mục đích ý nghĩa.</p>
          <Link
            href="/fundraiser/campaigns/create"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Tạo chiến dịch đầu tiên
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {/* Campaign Image */}
              <div className="relative h-48">
                <img 
                  className="w-full h-full object-cover" 
                  src={campaign.image_url || '/images/default-campaign.jpg'} 
                  alt={campaign.title}
                />
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClasses(campaign.status)}`}>
                    {getStatusText(campaign.status)}
                  </span>
                  {campaign.deletion_requested && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                      Chờ duyệt xóa
                    </span>
                  )}
                </div>
                
                {/* Action Buttons Overlay */}
                <div className="absolute top-3 right-3 flex flex-col gap-1">
                  <Link 
                    href={`/fundraiser/campaigns/${campaign.slug}/edit`}
                    className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 text-orange-600 hover:text-orange-700 rounded-full shadow-sm transition-all duration-200"
                    title="Chỉnh sửa chiến dịch"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(campaign)}
                    disabled={campaign.deletion_requested}
                    className={`p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-sm transition-all duration-200 ${
                      campaign.deletion_requested 
                        ? 'text-orange-400 cursor-not-allowed' 
                        : 'text-red-500 hover:text-red-600'
                    }`}
                    title={campaign.deletion_requested ? 'Yêu cầu xóa đang chờ phê duyệt' : 'Yêu cầu xóa chiến dịch'}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Campaign Content */}
              <div className="p-6">
                {/* Title and Description */}
                <div className="mb-4">
                  <Link href={`/campaigns/${campaign.slug}`} className="block group">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors duration-200 line-clamp-2 mb-2">
                      {campaign.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {campaign.description}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-orange-600">
                      {campaign.progress_percentage.toFixed(1)}% hoàn thành
                    </span>
                    <span className="text-sm text-gray-500">
                      {campaign.days_remaining > 0 ? `${campaign.days_remaining} ngày còn lại` : 'Đã kết thúc'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        campaign.progress_percentage >= 100 ? 'bg-green-500' : 'bg-orange-500'
                      }`} 
                      style={{ width: `${Math.min(100, campaign.progress_percentage)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Amount Information */}
                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Đã quyên góp:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(campaign.current_amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Mục tiêu:</span>
                    <span className="text-sm font-medium text-gray-700">
                      {formatCurrency(campaign.target_amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Lượt quyên góp:</span>
                    <span className="text-sm font-medium text-gray-700">
                      {formatNumber(campaign.donations_count || 0)} lượt
                    </span>
                  </div>
                </div>

                {/* End Date */}
                <div className="mb-4 flex items-center text-sm text-gray-500">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Kết thúc: {format(new Date(campaign.end_date), 'dd/MM/yyyy', {locale: vi})}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Link 
                    href={`/fundraiser/campaigns/${campaign.slug}/analytics`}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-orange-300 text-sm font-medium rounded-md text-orange-700 bg-orange-50 hover:bg-orange-100 transition-colors duration-200"
                  >
                    <ChartPieIcon className="h-4 w-4 mr-1" />
                    Phân tích
                  </Link>
                  <Link 
                    href={`/fundraiser/campaigns/${campaign.slug}/updates`}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    Cập nhật
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && campaigns.length > 0 && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center">
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

      {/* Delete Campaign Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform animate-in zoom-in-95 duration-300">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-100 mr-3">
                    <TrashIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Yêu cầu xóa chiến dịch
                  </h3>
                </div>
                <button
                  onClick={handleDeleteCancel}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              {/* Content */}
              <div className="mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium mb-1">Lưu ý quan trọng:</p>
                      <p className="text-sm text-yellow-700">
                        Yêu cầu xóa sẽ được gửi đến admin để phê duyệt. Chiến dịch sẽ tiếp tục hoạt động cho đến khi được phê duyệt.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">
                    Chiến dịch: 
                  </p>
                  <p className="font-semibold text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {campaignToDelete?.title}
                  </p>
                </div>
                
                <div>
                  <label htmlFor="deleteReason" className="block text-sm font-medium text-gray-700 mb-2">
                    Lý do xóa chiến dịch <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="deleteReason"
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    rows={4}
                    placeholder="Vui lòng mô tả lý do tại sao bạn muốn xóa chiến dịch này..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Thông tin này sẽ được gửi đến admin để xem xét yêu cầu của bạn.
                  </p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteCancel}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting || !deleteReason.trim()}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center justify-center"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang gửi...
                    </>
                  ) : 'Gửi yêu cầu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Request Alert */}
      {campaigns.some(c => c.deletion_requested) && (
        <div className="mb-6 bg-orange-50 border border-orange-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">
                Có chiến dịch đang chờ phê duyệt xóa
              </h3>
              <div className="mt-2 text-sm text-orange-700">
                <p>
                  Bạn có {campaigns.filter(c => c.deletion_requested).length} chiến dịch đang chờ admin phê duyệt xóa. 
                  Vui lòng kiên nhẫn chờ admin xem xét yêu cầu của bạn.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}