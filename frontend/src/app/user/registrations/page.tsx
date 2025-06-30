'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Eye,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface Registration {
  id: number;
  status: string;
  full_name: string;
  email: string;
  phone: string;
  notes: string;
  amount_paid: number;
  payment_status: string;
  registered_at: string;
  confirmed_at: string | null;
  cancelled_at: string | null;
  activity: {
    id: number;
    title: string;
    slug: string;
    location: string;
    event_date: string;
    registration_fee: number;
    image_url: string;
  };
}

export default function UserRegistrationsPage() {
  const { isAuthenticated, user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    fetchRegistrations();
  }, [isAuthenticated]);

  const fetchRegistrations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/activity-registrations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setRegistrations(data.data);
      } else {
        setError(data.message || 'Không thể tải danh sách đăng ký');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi tải danh sách đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (registrationId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đăng ký này?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/activity-registrations/${registrationId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        // Update local state
        setRegistrations(registrations.map(reg => 
          reg.id === registrationId 
            ? { ...reg, status: 'cancelled', cancelled_at: new Date().toISOString() }
            : reg
        ));
        alert('Đã hủy đăng ký thành công.');
      } else {
        alert(data.message || 'Có lỗi xảy ra khi hủy đăng ký');
      }
    } catch (err) {
      alert('Có lỗi xảy ra khi hủy đăng ký. Vui lòng thử lại.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'cancelled':
        return 'Đã hủy';
      case 'pending':
        return 'Chờ xác nhận';
      default:
        return 'Không xác định';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Vui lòng đăng nhập
          </h1>
          <p className="text-gray-600 mb-4">
            Bạn cần đăng nhập để xem danh sách đăng ký hoạt động
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hoạt động đã đăng ký
          </h1>
          <p className="text-gray-600">
            Quản lý các hoạt động bạn đã đăng ký tham gia
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Registrations List */}
        {registrations.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có hoạt động nào
            </h3>
            <p className="text-gray-600 mb-4">
              Bạn chưa đăng ký tham gia hoạt động nào.
            </p>
            <Link
              href="/activities"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Khám phá hoạt động
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {registrations.map((registration) => (
              <div key={registration.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {registration.activity.title}
                        </h3>
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(registration.status)}`}>
                          {getStatusIcon(registration.status)}
                          {getStatusText(registration.status)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(new Date(registration.activity.event_date), 'EEEE, dd MMMM yyyy, HH:mm', { locale: vi })}
                          </span>
                        </div>
                        {registration.activity.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{registration.activity.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatPrice(registration.activity.registration_fee)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            Đăng ký: {format(new Date(registration.registered_at), 'dd/MM/yyyy HH:mm')}
                          </span>
                        </div>
                      </div>

                      {registration.notes && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600">
                            <strong>Ghi chú:</strong> {registration.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-4 lg:mt-0">
                      <Link
                        href={`/activities/${registration.activity.slug}`}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        Xem chi tiết
                      </Link>
                      
                      {registration.status === 'pending' && (
                        <button
                          onClick={() => handleCancelRegistration(registration.id)}
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                          Hủy đăng ký
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
