'use client';

import { useState, useEffect } from 'react';
import { superAdminAPI } from '@/services/superAdminApi';
import { 
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  MapPin,
  Award,
  Activity,
  DollarSign,
  Heart
} from 'lucide-react';

interface UserViewModalProps {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserViewModal({ userId, isOpen, onClose }: UserViewModalProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      loadUserDetails();
    }
  }, [isOpen, userId]);

  const loadUserDetails = async () => {
    setLoading(true);
    try {
      const response = await superAdminAPI.getRecord('users', userId);
      if (response.data?.record) {
        setUser(response.data.record);
      }
    } catch (error) {
      console.error('Failed to load user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getRoleBadge = (role_id: number) => {
    const roleMap: { [key: number]: { color: string; label: string; icon: any } } = {
      1: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Quản trị viên', icon: Shield },
      2: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Người gây quỹ', icon: Award },
      3: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Người dùng', icon: User }
    };

    const roleInfo = roleMap[role_id] || { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Không rõ', icon: User };
    const IconComponent = roleInfo.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${roleInfo.color}`}>
        <IconComponent className="h-4 w-4 mr-2" />
        {roleInfo.label}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { color: string; label: string } } = {
      'active': { color: 'bg-green-100 text-green-800 border-green-200', label: 'Hoạt động' },
      'inactive': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Không hoạt động' },
      'banned': { color: 'bg-red-100 text-red-800 border-red-200', label: 'Bị cấm' },
      'pending': { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Chờ xét duyệt' }
    };

    const statusInfo = statusMap[status] || { color: 'bg-gray-100 text-gray-800 border-gray-200', label: status };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Chi tiết người dùng</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <span className="ml-2 text-gray-600">Đang tải thông tin...</span>
            </div>
          ) : user ? (
            <div className="space-y-6">
              {/* User Info Header */}
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6">
                <div className="flex items-center space-x-6">
                  <div className="h-20 w-20 rounded-full overflow-hidden bg-orange-200">
                    {user.avatar ? (
                      <img 
                        className="h-20 w-20 object-cover" 
                        src={user.avatar} 
                        alt={user.name}
                      />
                    ) : (
                      <div className="h-20 w-20 flex items-center justify-center bg-orange-500 text-white text-2xl font-bold">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
                    <div className="flex items-center space-x-4 mt-2">
                      {getRoleBadge(user.role_id)}
                      {getStatusBadge(user.status)}
                    </div>
                    <p className="text-gray-600 mt-2">ID: {user.id}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Mail className="h-5 w-5 text-orange-500 mr-2" />
                    Thông tin liên hệ
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-900">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-3" />
                        <span className="text-gray-900">{user.phone}</span>
                      </div>
                    )}
                    {user.address && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                        <span className="text-gray-900">{user.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 text-orange-500 mr-2" />
                    Thông tin tài khoản
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-500">Ngày tham gia:</span>
                      <div className="text-gray-900">{formatDate(user.created_at)}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Cập nhật lần cuối:</span>
                      <div className="text-gray-900">{formatDate(user.updated_at)}</div>
                    </div>
                    {user.email_verified_at && (
                      <div>
                        <span className="text-sm text-gray-500">Email xác thực:</span>
                        <div className="text-green-600">✓ Đã xác thực</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-900">{user.campaigns_count || 0}</div>
                  <div className="text-sm text-blue-600">Chiến dịch tạo</div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-900">
                    {formatCurrency(user.total_donated || 0)}
                  </div>
                  <div className="text-sm text-green-600">Tổng quyên góp</div>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
                  <Heart className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-900">{user.activities_joined || 0}</div>
                  <div className="text-sm text-purple-600">Hoạt động tham gia</div>
                </div>
              </div>

              {/* Biography */}
              {user.bio && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Tiểu sử</h4>
                  <p className="text-gray-700 leading-relaxed">{user.bio}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Đóng
                </button>
                <button
                  onClick={() => window.open(`/profile/${user.id}`, '_blank')}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Xem trang công khai
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Không thể tải thông tin người dùng</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
