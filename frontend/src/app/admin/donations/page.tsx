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
=======
import { useState, useEffect } from 'react';
import { 
  EyeIcon, 
  CheckCircleIcon, 
  XMarkIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UserIcon,
  CurrencyDollarIcon,
  FlagIcon,
  ClockIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { adminApi } from '@/services/api';

interface Donation {
  id: number;
  amount: number;
  message?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: 'momo' | 'vnpay' | 'bank_transfer' | 'cash';
  transaction_id?: string;
  created_at: string;
  is_anonymous?: boolean;
  user?: {
    id: number;
    name: string;
    email: string;
  } | null;
  campaign: {
    id: number;
    title: string;
    slug: string;
  };
}

export default function AdminDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchDonations();
  }, []);

  useEffect(() => {
    filterDonations();
  }, [donations, searchTerm, statusFilter, paymentMethodFilter]);

  const fetchDonations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminApi.getDonations().catch(() => null);
      
      if (response?.data) {
        // Laravel paginate returns: { data: [...], current_page: 1, total: 100, ... }
        // Extract the actual data array
        const donationData = Array.isArray(response.data) ? response.data : response.data.data || [];
        setDonations(donationData);
      } else {
        // Mock data fallback
        const mockDonations: Donation[] = [
          {
            id: 1,
            amount: 500000,
            message: 'Chúc chiến dịch thành công!',
            status: 'completed',
            payment_method: 'momo',
            transaction_id: 'MOMO123456789',
            created_at: '2024-06-21T10:30:00Z',
            is_anonymous: false,
            user: {
              id: 1,
              name: 'Nguyễn Văn A',
              email: 'nguyen.a@example.com'
            },
            campaign: {
              id: 1,
              title: 'Hỗ trợ xây dựng trường học tại vùng sâu',
              slug: 'ho-tro-xay-dung-truong-hoc'
            }
          },
          {
            id: 2,
            amount: 1000000,
            message: 'Ủng hộ cho các em nhỏ',
            status: 'completed',
            payment_method: 'vnpay',
            transaction_id: 'VNPAY987654321',
            created_at: '2024-06-21T08:15:00Z',
            is_anonymous: true,
            user: {
              id: 2,
              name: 'Người ủng hộ ẩn danh',
              email: 'anonymous@kvtogether.com'
            },
            campaign: {
              id: 2,
              title: 'Cứu trợ khẩn cấp sau bão lũ',
              slug: 'cuu-tro-khan-cap-sau-bao-lu'
            }
          },
          {
            id: 3,
            amount: 200000,
            status: 'pending',
            payment_method: 'bank_transfer',
            created_at: '2024-06-21T07:00:00Z',
            is_anonymous: false,
            user: {
              id: 3,
              name: 'Trần Thị B',
              email: 'tran.b@example.com'
            },
            campaign: {
              id: 3,
              title: 'Hỗ trợ điều trị cho trẻ em mắc bệnh hiểm nghèo',
              slug: 'ho-tro-dieu-tri-tre-em'
            }
          },
          {
            id: 4,
            amount: 300000,
            message: 'Chúc các em mạnh khỏe',
            status: 'failed',
            payment_method: 'momo',
            created_at: '2024-06-20T16:45:00Z',
            is_anonymous: false,
            user: {
              id: 4,
              name: 'Lê Văn C',
              email: 'le.c@example.com'
            },
            campaign: {
              id: 1,
              title: 'Hỗ trợ xây dựng trường học tại vùng sâu',
              slug: 'ho-tro-xay-dung-truong-hoc'
            }
          }
        ];
        setDonations(mockDonations);
      }
    } catch (err) {
      console.error('Error fetching donations:', err);
      setError('Không thể tải danh sách quyên góp');
    } finally {
      setIsLoading(false);
    }
  };

  const filterDonations = () => {
    let filtered = donations || [];

    if (searchTerm) {
      filtered = filtered.filter(donation =>
        (donation.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        donation.campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(donation => donation.status === statusFilter);
    }

    if (paymentMethodFilter !== 'all') {
      filtered = filtered.filter(donation => donation.payment_method === paymentMethodFilter);
    }

    setFilteredDonations(filtered);
  };

  const handleViewDonation = (donation: Donation) => {
    setSelectedDonation(donation);
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Thành công';
      case 'pending': return 'Đang xử lý';
      case 'failed': return 'Thất bại';
      case 'refunded': return 'Đã hoàn tiền';
      default: return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'momo': return 'MoMo';
      case 'vnpay': return 'VNPay';
      case 'bank_transfer': return 'Chuyển khoản';
      default: return method;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  const getTotalAmount = () => {
    return filteredDonations
      .filter(d => d.status === 'completed')
      .reduce((sum, d) => sum + d.amount, 0);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = (filteredDonations || []).slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil((filteredDonations || []).length / itemsPerPage);

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
            <h1 className="text-2xl font-bold text-gray-900">Quản lý quyên góp</h1>
            <p className="mt-1 text-gray-600">Theo dõi và quản lý các giao dịch quyên góp</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BanknotesIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Tổng thu</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(getTotalAmount())}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Thành công</p>
              <p className="text-lg font-semibold text-gray-900">
                {filteredDonations.filter(d => d.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Đang xử lý</p>
              <p className="text-lg font-semibold text-gray-900">
                {filteredDonations.filter(d => d.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XMarkIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Thất bại</p>
              <p className="text-lg font-semibold text-gray-900">
                {filteredDonations.filter(d => d.status === 'failed').length}
              </p>
            </div>
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
                placeholder="Tìm kiếm quyên góp..."
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
              <option value="completed">Thành công</option>
              <option value="pending">Đang xử lý</option>
              <option value="failed">Thất bại</option>
              <option value="refunded">Đã hoàn tiền</option>
            </select>
          </div>
          <div className="w-full sm:w-48">
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Tất cả phương thức</option>
              <option value="momo">MoMo</option>
              <option value="vnpay">VNPay</option>
              <option value="bank_transfer">Chuyển khoản</option>
            </select>
          </div>
        </div>
      </div>

      {/* Donations Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người quyên góp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chiến dịch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phương thức
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((donation) => (
                <tr key={donation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-orange-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {donation.is_anonymous || !donation.user ? 'Ẩn danh' : donation.user.name}
                        </div>
                        {donation.user && !donation.is_anonymous && (
                          <div className="text-sm text-gray-500">{donation.user.email}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {donation.campaign.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(donation.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getPaymentMethodText(donation.payment_method)}
                    </div>
                    {donation.transaction_id && (
                      <div className="text-xs text-gray-500">
                        ID: {donation.transaction_id}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(donation.status)}`}>
                      {getStatusText(donation.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(donation.created_at).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleViewDonation(donation)}
                      className="text-orange-600 hover:text-orange-900"
                      title="Xem chi tiết"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
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
                  <span className="font-medium">{Math.min(indexOfLastItem, (filteredDonations || []).length)}</span> trong{' '}
                  <span className="font-medium">{(filteredDonations || []).length}</span> kết quả
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
      </div>

      {/* Modal */}
      {showModal && selectedDonation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-medium text-gray-900">
                  Chi tiết quyên góp
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mã giao dịch</label>
                    <p className="mt-1 text-sm text-gray-900">#{selectedDonation.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedDonation.status)}`}>
                      {getStatusText(selectedDonation.status)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Người quyên góp</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedDonation.is_anonymous || !selectedDonation.user ? 'Ẩn danh' : selectedDonation.user.name}
                  </p>
                  {selectedDonation.user && !selectedDonation.is_anonymous && (
                    <p className="text-xs text-gray-500">{selectedDonation.user.email}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Chiến dịch</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedDonation.campaign.title}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Số tiền</label>
                    <p className="mt-1 text-lg font-semibold text-green-600">
                      {formatCurrency(selectedDonation.amount)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phương thức thanh toán</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {getPaymentMethodText(selectedDonation.payment_method)}
                    </p>
                  </div>
                </div>
                
                {selectedDonation.transaction_id && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mã giao dịch thanh toán</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">
                      {selectedDonation.transaction_id}
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Thời gian</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedDonation.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
                
                {selectedDonation.message && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lời nhắn</label>
                    <div className="mt-1 bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-900">{selectedDonation.message}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3 pt-6 border-t mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
>>>>>>> origin/main
    </div>
  );
}
