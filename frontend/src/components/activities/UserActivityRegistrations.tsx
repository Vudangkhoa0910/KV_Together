'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';

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

export default function UserActivityRegistrations() {
  const { isAuthenticated } = useAuth();
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
      const response = await fetch('http://localhost:8000/api/activity-registrations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setRegistrations(data.data.data || []);
      } else {
        setError(data.message || 'Có lỗi xảy ra khi tải dữ liệu');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Đã xác nhận';
      case 'pending': return 'Chờ xác nhận';
      case 'cancelled': return 'Đã hủy';
      case 'completed': return 'Hoàn thành';
      default: return status;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Vui lòng đăng nhập để xem danh sách đăng ký hoạt động.</p>
        <Link href="/auth/login" className="text-blue-600 hover:text-blue-700">
          Đăng nhập
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchRegistrations}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-500 mb-4">Bạn chưa đăng ký hoạt động nào.</p>
        <Link 
          href="/activities" 
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Khám phá hoạt động
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Hoạt động đã đăng ký</h2>
        <span className="text-sm text-gray-500">{registrations.length} hoạt động</span>
      </div>

      <div className="space-y-4">
        {registrations.map((registration) => (
          <div key={registration.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start gap-4">
                {registration.activity.image_url && (
                  <img
                    src={registration.activity.image_url}
                    alt={registration.activity.title}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Link
                        href={`/activities/${registration.activity.slug}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 block"
                      >
                        {registration.activity.title}
                      </Link>
                      
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>📍 {registration.activity.location}</p>
                        <p>📅 {new Date(registration.activity.event_date).toLocaleDateString('vi-VN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                        <p>💰 Phí tham gia: {registration.activity.registration_fee.toLocaleString()} VND</p>
                      </div>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(registration.status)}`}>
                        {getStatusText(registration.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Ngày đăng ký:</span>
                        <p className="font-medium">{new Date(registration.registered_at).toLocaleDateString('vi-VN')}</p>
                      </div>
                      
                      {registration.confirmed_at && (
                        <div>
                          <span className="text-gray-500">Ngày xác nhận:</span>
                          <p className="font-medium">{new Date(registration.confirmed_at).toLocaleDateString('vi-VN')}</p>
                        </div>
                      )}
                      
                      {registration.cancelled_at && (
                        <div>
                          <span className="text-gray-500">Ngày hủy:</span>
                          <p className="font-medium">{new Date(registration.cancelled_at).toLocaleDateString('vi-VN')}</p>
                        </div>
                      )}
                      
                      <div>
                        <span className="text-gray-500">Thanh toán:</span>
                        <p className="font-medium">
                          {registration.payment_status === 'paid' ? '✅ Đã thanh toán' : 
                           registration.payment_status === 'unpaid' ? '⏳ Chưa thanh toán' : 
                           '🔄 Hoàn tiền'}
                        </p>
                      </div>
                    </div>
                    
                    {registration.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-500 text-sm">Ghi chú:</span>
                        <p className="text-gray-700 text-sm mt-1">{registration.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
