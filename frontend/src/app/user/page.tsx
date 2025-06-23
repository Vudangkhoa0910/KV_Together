'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserIcon, EnvelopeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function UserProfilePage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vui lòng đăng nhập</h1>
          <p className="text-gray-600">Bạn cần đăng nhập để xem trang này.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement update user profile
    console.log('Update profile:', formData);
    setIsEditing(false);
  };

  const getRoleDisplayName = (roleSlug: string) => {
    const roleMap: { [key: string]: string } = {
      'admin': 'Quản trị viên',
      'staff': 'Nhân viên', 
      'fundraiser': 'Người tổ chức',
      'user': 'Người dùng'
    };
    return roleMap[roleSlug] || roleSlug;
  };

  const getRoleColor = (roleSlug: string) => {
    const colorMap: { [key: string]: string } = {
      'admin': 'bg-red-100 text-red-800',
      'staff': 'bg-blue-100 text-blue-800',
      'fundraiser': 'bg-green-100 text-green-800', 
      'user': 'bg-gray-100 text-gray-800'
    };
    return colorMap[roleSlug] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <UserIcon className="h-8 w-8 mr-3 text-orange-600" />
            Tài khoản của tôi
          </h1>
          <p className="mt-2 text-gray-600">Quản lý thông tin cá nhân và cài đặt tài khoản</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Thông tin cá nhân</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  {isEditing ? 'Hủy' : 'Chỉnh sửa'}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-50 disabled:text-gray-600"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Lưu thay đổi
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Account Info Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-2 text-green-600" />
                Trạng thái tài khoản
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Vai trò</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role?.slug || 'user')}`}>
                    {getRoleDisplayName(user.role?.slug || 'user')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Trạng thái</span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Đã xác thực
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ngày tham gia</span>
                  <span className="text-sm text-gray-900">
                    Đang cập nhật
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
              <div className="space-y-3">
                <a
                  href="/wallet"
                  className="flex items-center p-3 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <i className="fas fa-wallet w-5 text-orange-600 mr-3"></i>
                  Xem ví thiện nguyện
                </a>
                <a
                  href="/user/donations"
                  className="flex items-center p-3 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <i className="fas fa-heart w-5 text-red-600 mr-3"></i>
                  Lịch sử đóng góp
                </a>
                <a
                  href="/campaigns"
                  className="flex items-center p-3 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <i className="fas fa-search w-5 text-blue-600 mr-3"></i>
                  Tìm chiến dịch
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
