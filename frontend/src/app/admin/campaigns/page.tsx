'use client';

<<<<<<< HEAD
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new super admin dashboard
    router.push('/super-admin');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to Super Admin Dashboard...</p>
      </div>
    </div>
  );
}
=======
import { useState, useEffect } from 'react';
import { 
  EyeIcon, 
  CheckCircleIcon, 
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  ChartBarIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { adminApi } from '@/services/api';

interface Campaign {
  id: number;
  title: string;
  description: string;
  goal_amount: number;
  current_amount: number;
  status: 'pending' | 'active' | 'completed' | 'rejected';
  created_at: string;
  end_date: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
  };
  image?: string;
  location?: string;
  donations_count?: number;
}

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'approve' | 'reject'>('view');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    filterCampaigns();
  }, [campaigns, searchTerm, statusFilter, categoryFilter]);

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminApi.getCampaigns().catch(() => null);
      
      if (response?.data) {
        // Laravel paginate returns: { data: [...], current_page: 1, total: 100, ... }
        // Extract the actual data array
        const campaignData = Array.isArray(response.data) ? response.data : response.data.data || [];
        setCampaigns(campaignData);
      } else {
        // Mock data fallback
        const mockCampaigns: Campaign[] = [
          {
            id: 1,
            title: 'Hỗ trợ xây dựng trường học tại vùng sâu',
            description: 'Quyên góp xây dựng trường học cho trẻ em vùng sâu vùng xa',
            goal_amount: 500000000,
            current_amount: 250000000,
            status: 'active',
            created_at: '2024-06-01T00:00:00Z',
            end_date: '2024-12-31T00:00:00Z',
            user: {
              id: 2,
              name: 'Trần Thị Fundraiser',
              email: 'fundraiser@example.com'
            },
            category: {
              id: 1,
              name: 'Giáo dục',
              slug: 'education'
            },
            location: 'Cao Bằng',
            donations_count: 125
          },
          {
            id: 2,
            title: 'Cứu trợ khẩn cấp sau bão lũ',
            description: 'Hỗ trợ khẩn cấp cho người dân bị ảnh hưởng bởi thiên tai',
            goal_amount: 1000000000,
            current_amount: 750000000,
            status: 'pending',
            created_at: '2024-06-15T00:00:00Z',
            end_date: '2024-08-31T00:00:00Z',
            user: {
              id: 3,
              name: 'Nguyễn Văn Cứu Trợ',
              email: 'rescue@example.com'
            },
            category: {
              id: 2,
              name: 'Thiên tai',
              slug: 'disaster'
            },
            location: 'Quảng Bình',
            donations_count: 300
          },
          {
            id: 3,
            title: 'Hỗ trợ điều trị cho trẻ em mắc bệnh hiểm nghèo',
            description: 'Quyên góp chi phí điều trị cho các em nhỏ mắc bệnh hiểm nghèo',
            goal_amount: 200000000,
            current_amount: 200000000,
            status: 'completed',
            created_at: '2024-05-01T00:00:00Z',
            end_date: '2024-06-30T00:00:00Z',
            user: {
              id: 4,
              name: 'Lê Thị Y Tế',
              email: 'medical@example.com'
            },
            category: {
              id: 3,
              name: 'Y tế',
              slug: 'medical'
            },
            location: 'Hồ Chí Minh',
            donations_count: 80
          },
          {
            id: 4,
            title: 'Chiến dịch spam không được duyệt',
            description: 'Đây là một chiến dịch spam không tuân thủ quy định',
            goal_amount: 50000000,
            current_amount: 0,
            status: 'rejected',
            created_at: '2024-06-20T00:00:00Z',
            end_date: '2024-12-31T00:00:00Z',
            user: {
              id: 5,
              name: 'Người Dùng Spam',
              email: 'spam@example.com'
            },
            category: {
              id: 4,
              name: 'Khác',
              slug: 'other'
            },
            donations_count: 0
          }
        ];
        setCampaigns(mockCampaigns);
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('Không thể tải danh sách chiến dịch');
    } finally {
      setIsLoading(false);
    }
  };

  const filterCampaigns = () => {
    let filtered = Array.isArray(campaigns) ? campaigns : [];

    if (searchTerm) {
      filtered = filtered.filter(campaign =>
        campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(campaign => campaign.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(campaign => campaign.category.slug === categoryFilter);
    }

    setFilteredCampaigns(filtered);
  };

  const handleApproveCampaign = async (campaignId: number) => {
    try {
      await adminApi.approveCampaign(campaignId);
      fetchCampaigns();
      setShowModal(false);
    } catch (error) {
      console.error('Error approving campaign:', error);
    }
  };

  const handleRejectCampaign = async (campaignId: number) => {
    try {
      await adminApi.rejectCampaign(campaignId);
      fetchCampaigns();
      setShowModal(false);
    } catch (error) {
      console.error('Error rejecting campaign:', error);
    }
  };

  const handleDeleteCampaign = async (campaignId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chiến dịch này?')) {
      try {
        // await adminApi.deleteCampaign(campaignId);
        console.log('Delete campaign:', campaignId);
        fetchCampaigns();
      } catch (error) {
        console.error('Error deleting campaign:', error);
      }
    }
  };

  const handleViewCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setModalType('view');
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Đang hoạt động';
      case 'pending': return 'Chờ duyệt';
      case 'completed': return 'Hoàn thành';
      case 'rejected': return 'Bị từ chối';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  const calculateProgress = (current: number, goal: number) => {
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const safeFilteredCampaigns = Array.isArray(filteredCampaigns) ? filteredCampaigns : [];
  const currentItems = safeFilteredCampaigns.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(safeFilteredCampaigns.length / itemsPerPage);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6 bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý chiến dịch</h1>
            <p className="mt-1 text-gray-600">Duyệt và quản lý các chiến dịch quyên góp</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors flex items-center">
              <PlusIcon className="w-4 h-4 mr-2" />
              Tạo chiến dịch
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm chiến dịch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="active">Đang hoạt động</option>
              <option value="completed">Hoàn thành</option>
              <option value="rejected">Bị từ chối</option>
            </select>
          </div>
          <div className="w-full sm:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Tất cả danh mục</option>
              <option value="education">Giáo dục</option>
              <option value="medical">Y tế</option>
              <option value="disaster">Thiên tai</option>
              <option value="environment">Môi trường</option>
              <option value="children">Trẻ em</option>
              <option value="elderly">Người già</option>
              <option value="community">Cộng đồng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
        {currentItems.map((campaign) => (
          <div key={campaign.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
              {campaign.image ? (
                <img 
                  src={campaign.image} 
                  alt={campaign.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                  <HeartIcon className="w-12 h-12 text-orange-400" />
                </div>
              )}
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                  {getStatusText(campaign.status)}
                </span>
                <span className="text-xs text-gray-500">{campaign.category.name}</span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {campaign.title}
              </h3>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {campaign.description}
              </p>
              
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Đã quyên góp</span>
                  <span>{calculateProgress(campaign.current_amount, campaign.goal_amount)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculateProgress(campaign.current_amount, campaign.goal_amount)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="font-medium text-orange-600">
                    {formatCurrency(campaign.current_amount)}
                  </span>
                  <span className="text-gray-500">
                    / {formatCurrency(campaign.goal_amount)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <div className="flex items-center">
                  <UserIcon className="w-3 h-3 mr-1" />
                  <span>{campaign.user.name}</span>
                </div>
                <div className="flex items-center">
                  <HeartIcon className="w-3 h-3 mr-1" />
                  <span>{campaign.donations_count || 0} lượt ủng hộ</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-gray-500">
                  <CalendarIcon className="w-3 h-3 mr-1" />
                  <span>Hết hạn: {new Date(campaign.end_date).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleViewCampaign(campaign)}
                    className="text-orange-600 hover:text-orange-900"
                    title="Xem chi tiết"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  {campaign.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleApproveCampaign(campaign.id)}
                        className="text-green-600 hover:text-green-900"
                        title="Duyệt"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleRejectCampaign(campaign.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Từ chối"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => handleDeleteCampaign(campaign.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Xóa"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị <span className="font-medium">{indexOfFirstItem + 1}</span> đến{' '}
                <span className="font-medium">{Math.min(indexOfLastItem, filteredCampaigns.length)}</span> trong{' '}
                <span className="font-medium">{filteredCampaigns.length}</span> kết quả
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === page
                        ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedCampaign && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-medium text-gray-900">
                  Chi tiết chiến dịch
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  {selectedCampaign.image ? (
                    <img 
                      src={selectedCampaign.image} 
                      alt={selectedCampaign.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center rounded-lg">
                      <HeartIcon className="w-16 h-16 text-orange-400" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedCampaign.title}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedCampaign.status)}`}>
                      {getStatusText(selectedCampaign.status)}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Danh mục</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedCampaign.category.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Người tạo</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedCampaign.user.name}</p>
                    <p className="text-xs text-gray-500">{selectedCampaign.user.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mục tiêu quyên góp</label>
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedCampaign.goal_amount)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Đã quyên góp</label>
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedCampaign.current_amount)}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full"
                        style={{ width: `${calculateProgress(selectedCampaign.current_amount, selectedCampaign.goal_amount)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Thời hạn</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedCampaign.end_date).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {selectedCampaign.description}
                  </p>
                </div>
              </div>
              
              {selectedCampaign.status === 'pending' && (
                <div className="flex space-x-3 pt-6 border-t">
                  <button
                    onClick={() => handleApproveCampaign(selectedCampaign.id)}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Duyệt chiến dịch
                  </button>
                  <button
                    onClick={() => handleRejectCampaign(selectedCampaign.id)}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <XMarkIcon className="w-4 h-4 mr-2" />
                    Từ chối
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
>>>>>>> origin/main
