'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ActivityRegistrationForm from './ActivityRegistrationForm';

interface ActivityRegistrationButtonProps {
  activity: {
    id: number;
    slug: string;
    title: string;
    registration_fee: number;
    max_participants?: number;
    current_participants: number;
    registration_deadline?: string;
    event_date: string;
    status: string;
  };
  className?: string;
}

interface Registration {
  id: number;
  status: string;
  registered_at: string;
  full_name: string;
  email: string;
  phone: string;
}

export default function ActivityRegistrationButton({ activity, className = '' }: ActivityRegistrationButtonProps) {
  const { isAuthenticated, user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);

  const checkRegistration = async () => {
    if (!isAuthenticated) {
      setCheckingRegistration(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/activity-registrations/activities/${activity.id}/check`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success && data.is_registered) {
        setRegistration(data.registration);
      }
    } catch (err) {
      console.error('Error checking registration:', err);
    } finally {
      setCheckingRegistration(false);
    }
  };

  useEffect(() => {
    checkRegistration();
  }, [activity.id, isAuthenticated]);

  const handleCancelRegistration = async () => {
    if (!registration || !window.confirm('Bạn có chắc chắn muốn hủy đăng ký?')) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/activity-registrations/${registration.id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setRegistration(null);
        alert('Đã hủy đăng ký thành công.');
        window.location.reload(); // Refresh to update participant count
      } else {
        alert(data.message || 'Có lỗi xảy ra khi hủy đăng ký');
      }
    } catch (err) {
      alert('Có lỗi xảy ra khi hủy đăng ký. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSuccess = () => {
    checkRegistration();
    window.location.reload(); // Refresh to update participant count
  };

  if (checkingRegistration) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-lg h-12 ${className}`}></div>
    );
  }

  // Check if activity is available for registration
  const isDeadlinePassed = activity.registration_deadline ? new Date(activity.registration_deadline) < new Date() : false;
  const isFull = activity.max_participants ? activity.current_participants >= activity.max_participants : false;
  const isNotPublished = activity.status !== 'published';

  if (!isAuthenticated) {
    return (
      <div className={`text-center ${className}`}>
        <a
          href="/auth/login"
          className="inline-block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Đăng nhập để đăng ký
        </a>
      </div>
    );
  }

  if (registration) {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'confirmed': return 'bg-green-50 text-green-700 border-green-200';
        case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
        case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
        case 'completed': return 'bg-blue-50 text-blue-700 border-blue-200';
        default: return 'bg-gray-50 text-gray-700 border-gray-200';
      }
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case 'confirmed': return '✅ Đã xác nhận';
        case 'pending': return '⏳ Chờ xác nhận';
        case 'cancelled': return '❌ Đã hủy';
        case 'completed': return '🎉 Hoàn thành';
        default: return status;
      }
    };

    const canCancel = registration.status === 'pending' || registration.status === 'confirmed';
    const eventSoon = new Date(activity.event_date).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000; // 24 hours

    return (
      <div className={`space-y-3 ${className}`}>
        <div className={`p-4 border rounded-lg ${getStatusColor(registration.status)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{getStatusText(registration.status)}</p>
              <p className="text-sm opacity-75">
                Đăng ký lúc: {new Date(registration.registered_at).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
        </div>
        
        {canCancel && !eventSoon && (
          <button
            onClick={handleCancelRegistration}
            disabled={loading}
            className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 font-medium"
          >
            {loading ? 'Đang hủy...' : 'Hủy đăng ký'}
          </button>
        )}

        {eventSoon && canCancel && (
          <p className="text-sm text-gray-500 text-center">
            Không thể hủy đăng ký trong vòng 24 giờ trước sự kiện
          </p>
        )}
      </div>
    );
  }

  if (isNotPublished) {
    return (
      <div className={`${className}`}>
        <div className="w-full px-6 py-3 bg-gray-100 text-gray-500 rounded-lg text-center font-medium">
          Hoạt động chưa được công bố
        </div>
      </div>
    );
  }

  if (isDeadlinePassed) {
    return (
      <div className={`${className}`}>
        <div className="w-full px-6 py-3 bg-yellow-100 text-yellow-700 rounded-lg text-center font-medium">
          ⏰ Đã hết hạn đăng ký
        </div>
      </div>
    );
  }

  if (isFull) {
    return (
      <div className={`${className}`}>
        <div className="w-full px-6 py-3 bg-red-100 text-red-700 rounded-lg text-center font-medium">
          👥 Đã đủ số lượng người tham gia
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <button
        onClick={() => setShowForm(true)}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
      >
        🎯 Đăng ký tham gia
      </button>

      {showForm && (
        <ActivityRegistrationForm
          activity={activity}
          onSuccess={handleRegistrationSuccess}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
