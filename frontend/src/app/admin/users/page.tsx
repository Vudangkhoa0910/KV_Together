'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { formatDate } from '@/utils/format';
import { toast } from 'react-hot-toast';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: {
    id: number;
    name: string;
    slug: string;
  };
  status: string;
  created_at: string;
  address?: string;
  id_card?: string;
  registration_reason?: string;
  fundraiser_type?: 'personal' | 'organization';
  organization_name?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState({
    role: 'all',
    status: 'all',
    search: '',
  });

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filter.role !== 'all') queryParams.append('role', filter.role);
      if (filter.status !== 'all') queryParams.append('status', filter.status);
      if (filter.search) queryParams.append('search', filter.search);

      const response = await fetch(`/api/admin/users?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'POST',
      });

      if (response.ok) {
        setSelectedUser((prev) => prev ? { ...prev, status: 'active' } : null);
        toast.success('Đã phê duyệt thành công');
      } else {
        toast.error('Có lỗi xảy ra khi phê duyệt');
      }
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Có lỗi xảy ra khi phê duyệt');
    }
  };

  const handleReject = async (userId: number, reason: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        setSelectedUser((prev) => prev ? { ...prev, status: 'rejected' } : null);
        toast.success('Đã từ chối thành công');
      } else {
        toast.error('Có lỗi xảy ra khi từ chối');
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('Có lỗi xảy ra khi từ chối');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Đã duyệt';
      case 'pending':
        return 'Chờ duyệt';
      case 'rejected':
        return 'Đã từ chối';
      default:
        return status;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Vai trò</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                value={filter.role}
                onChange={(e) => setFilter({ ...filter, role: e.target.value })}
              >
                <option value="all">Tất cả</option>
                <option value="user">Người dùng</option>
                <option value="fundraiser">Gây quỹ</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              >
                <option value="all">Tất cả</option>
                <option value="active">Đã duyệt</option>
                <option value="pending">Chờ duyệt</option>
                <option value="rejected">Đã từ chối</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tìm kiếm</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                placeholder="Tên, email, số điện thoại..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow rounded-lg">
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
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-sm text-gray-500">{user.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.role.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          user.status
                        )}`}
                      >
                        {getStatusText(user.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowModal(true);
                        }}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowModal(false)}
            />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Thông tin người dùng
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Thông tin cơ bản</h4>
                        <div className="mt-2 space-y-2">
                          <p className="text-sm text-gray-900">Họ tên: {selectedUser.name}</p>
                          <p className="text-sm text-gray-900">Email: {selectedUser.email}</p>
                          <p className="text-sm text-gray-900">
                            Số điện thoại: {selectedUser.phone}
                          </p>
                        </div>
                      </div>

                      {selectedUser.role.slug === 'fundraiser' && (
                        <>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Thông tin gây quỹ
                            </h4>
                            <div className="mt-2 space-y-2">
                              <p className="text-sm text-gray-900">
                                Loại: {selectedUser.fundraiser_type === 'personal' ? 'Cá nhân' : 'Tổ chức'}
                              </p>
                              {selectedUser.fundraiser_type === 'organization' && (
                                <p className="text-sm text-gray-900">
                                  Tên tổ chức: {selectedUser.organization_name}
                                </p>
                              )}
                              <p className="text-sm text-gray-900">
                                Địa chỉ: {selectedUser.address}
                              </p>
                              <p className="text-sm text-gray-900">
                                {selectedUser.fundraiser_type === 'personal'
                                  ? 'CCCD/CMND'
                                  : 'Mã số thuế'}
                                : {selectedUser.id_card}
                              </p>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Lý do đăng ký:
                                </p>
                                <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">
                                  {selectedUser.registration_reason}
                                </p>
                              </div>
                            </div>
                          </div>

                          {selectedUser.role.slug === 'fundraiser' && selectedUser.status === 'pending' && (
                            <div className="mt-6 flex space-x-3">
                              <button
                                onClick={() => handleApprove(selectedUser.id)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              >
                                <CheckCircleIcon className="h-5 w-5 mr-2" />
                                Phê duyệt
                              </button>
                              <button
                                onClick={() => {
                                  const reason = window.prompt('Nhập lý do từ chối:');
                                  if (reason) {
                                    handleReject(selectedUser.id, reason);
                                  }
                                }}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                <XCircleIcon className="h-5 w-5 mr-2" />
                                Từ chối
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setShowModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
} 