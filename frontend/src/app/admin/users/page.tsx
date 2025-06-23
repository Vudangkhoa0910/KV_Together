'use client';

import { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XMarkIcon,
  ShieldCheckIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { adminApi } from '@/services/api';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: {
    id: number;
    name: string;
    slug: string;
  };
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  is_verified?: boolean;
  avatar?: string;
  created_at: string;
  updated_at?: string;
  last_login?: string;
  total_campaigns?: number;
  total_donations?: number;
  // Additional fields from real API
  email_verified_at?: string;
  id_card?: string;
  registration_reason?: string;
  fundraiser_type?: string;
  bio?: string;
  address?: string;
}

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  role_id: number;
  status: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    phone: '',
    role_id: 1,
    status: 'active'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter, roleFilter]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminApi.getUsers().catch(() => null);
      
      if (response?.data) {
        // Laravel paginate returns: { data: [...], current_page: 1, total: 100, ... }
        // Extract the actual data array
        const userData = Array.isArray(response.data) ? response.data : response.data.data || [];
        setUsers(userData);
      } else {
        // Mock data fallback
        const mockUsers: User[] = [
          {
            id: 1,
            name: 'Nguyễn Văn Admin',
            email: 'admin@kvtogether.com',
            phone: '0123456789',
            role: { id: 1, name: 'Quản trị viên', slug: 'admin' },
            status: 'active',
            is_verified: true,
            created_at: '2024-01-01T00:00:00Z',
            last_login: '2024-06-21T10:00:00Z',
            total_campaigns: 0,
            total_donations: 0
          },
          {
            id: 2,
            name: 'Trần Thị Fundraiser',
            email: 'fundraiser@example.com',
            phone: '0987654321',
            role: { id: 2, name: 'Người quyên góp', slug: 'fundraiser' },
            status: 'pending',
            is_verified: false,
            created_at: '2024-06-15T08:30:00Z',
            total_campaigns: 2,
            total_donations: 0
          },
          {
            id: 3,
            name: 'Lê Văn Donor',
            email: 'donor@example.com',
            phone: '0369852147',
            role: { id: 3, name: 'Người ủng hộ', slug: 'donor' },
            status: 'active',
            is_verified: true,
            created_at: '2024-06-10T14:20:00Z',
            last_login: '2024-06-20T16:45:00Z',
            total_campaigns: 0,
            total_donations: 15
          },
          {
            id: 4,
            name: 'Phạm Thị Suspended',
            email: 'suspended@example.com',
            phone: '0741258963',
            role: { id: 2, name: 'Người quyên góp', slug: 'fundraiser' },
            status: 'suspended',
            is_verified: true,
            created_at: '2024-05-20T09:15:00Z',
            last_login: '2024-06-01T11:30:00Z',
            total_campaigns: 1,
            total_donations: 0
          }
        ];
        setUsers(mockUsers);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Không thể tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = Array.isArray(users) ? users : [];

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role.slug === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleCreateUser = () => {
    setModalType('create');
    setFormData({
      name: '',
      email: '',
      phone: '',
      role_id: 1,
      status: 'active'
    });
    setShowModal(true);
  };

  const handleEditUser = (user: User) => {
    setModalType('edit');
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role_id: user.role.id,
      status: user.status
    });
    setShowModal(true);
  };

  const handleViewUser = (user: User) => {
    setModalType('view');
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleApproveUser = async (userId: number) => {
    try {
      await adminApi.approveUser(userId);
      fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const handleSuspendUser = async (userId: number) => {
    try {
      await adminApi.suspendUser(userId);
      fetchUsers();
    } catch (error) {
      console.error('Error suspending user:', error);
    }
  };

  const handleUpdateRole = async (userId: number, roleId: number) => {
    try {
      await adminApi.updateUserRole(userId, roleId);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        // Implement delete API call
        console.log('Delete user:', userId);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalType === 'create') {
        // Implement create user API
        console.log('Create user:', formData);
      } else if (modalType === 'edit' && selectedUser) {
        // Implement update user API
        console.log('Update user:', selectedUser.id, formData);
      }
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'pending': return 'Chờ duyệt';
      case 'suspended': return 'Bị khóa';
      case 'inactive': return 'Không hoạt động';
      default: return status;
    }
  };

  const getRoleBadgeColor = (roleSlug: string) => {
    switch (roleSlug) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'fundraiser': return 'bg-blue-100 text-blue-800';
      case 'donor': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const safeFilteredUsers = Array.isArray(filteredUsers) ? filteredUsers : [];
  const currentItems = safeFilteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(safeFilteredUsers.length / itemsPerPage);

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
            <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
            <p className="mt-1 text-gray-600">Quản lý tài khoản người dùng và phân quyền</p>
          </div>
          <button
            onClick={handleCreateUser}
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors flex items-center"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Thêm người dùng
          </button>
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
                placeholder="Tìm kiếm người dùng..."
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
              <option value="active">Hoạt động</option>
              <option value="pending">Chờ duyệt</option>
              <option value="suspended">Bị khóa</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>
          <div className="w-full sm:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Quản trị viên</option>
              <option value="fundraiser">Người quyên góp</option>
              <option value="donor">Người ủng hộ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thống kê
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tham gia
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                          <span className="text-orange-600 font-medium text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          {user.name}
                          {user.is_verified && (
                            <CheckCircleIcon className="h-4 w-4 text-green-500 ml-1" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.phone && (
                          <div className="text-xs text-gray-400">{user.phone}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role.slug)}`}>
                      {user.role.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                      {getStatusText(user.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <ShieldCheckIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <span>{user.total_campaigns || 0}</span>
                      </div>
                      <div className="flex items-center">
                        <BanknotesIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <span>{user.total_donations || 0}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => handleViewUser(user)}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      {user.status === 'pending' && (
                        <button 
                          onClick={() => handleApproveUser(user.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                      )}
                      {user.status === 'active' && user.role.slug !== 'admin' && (
                        <button 
                          onClick={() => handleSuspendUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      )}
                      {user.role.slug !== 'admin' && (
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
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
                  <span className="font-medium">{Math.min(indexOfLastItem, (filteredUsers || []).length)}</span> trong{' '}
                  <span className="font-medium">{(filteredUsers || []).length}</span> kết quả
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
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {modalType === 'create' && 'Thêm người dùng mới'}
                {modalType === 'edit' && 'Chỉnh sửa người dùng'}
                {modalType === 'view' && 'Chi tiết người dùng'}
              </h3>
              
              {modalType === 'view' && selectedUser ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tên</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.phone || 'Chưa cập nhật'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vai trò</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(selectedUser.role.slug)}`}>
                      {selectedUser.role.name}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser.status)}`}>
                      {getStatusText(selectedUser.status)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ngày tham gia</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedUser.created_at).toLocaleDateString('vi-VN')}</p>
                  </div>
                  {selectedUser.last_login && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Lần đăng nhập cuối</label>
                      <p className="mt-1 text-sm text-gray-900">{new Date(selectedUser.last_login).toLocaleDateString('vi-VN')}</p>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmitForm} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tên</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vai trò</label>
                    <select
                      value={formData.role_id}
                      onChange={(e) => setFormData({...formData, role_id: parseInt(e.target.value)})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value={1}>Quản trị viên</option>
                      <option value={2}>Người quyên góp</option>
                      <option value={3}>Người ủng hộ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="active">Hoạt động</option>
                      <option value="pending">Chờ duyệt</option>
                      <option value="suspended">Bị khóa</option>
                      <option value="inactive">Không hoạt động</option>
                    </select>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
                    >
                      {modalType === 'create' ? 'Tạo' : 'Cập nhật'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              )}
              
              {modalType === 'view' && (
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Đóng
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