'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ActivityRegistration {
  id: number;
  activity: {
    id: number;
    title: string;
    slug: string;
    description: string;
    image_url?: string;
    start_date: string;
    end_date: string;
    location: string;
    max_participants?: number;
    current_participants: number;
    categories: Array<{
      id: number;
      name: string;
      slug: string;
    }>;
    organizer: {
      id: number;
      name: string;
      avatar_url?: string;
    };
  };
  registration_date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  attendance_status?: 'not_attended' | 'attended' | 'partially_attended';
  notes?: string;
}

export default function ActivityRegistrationsPage() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<ActivityRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

  useEffect(() => {
    async function loadRegistrations() {
      try {
        setLoading(true);
        const response = await api.getActivityRegistrations();
        setRegistrations(Array.isArray(response.data) ? response.data : []);
        setError(null);
      } catch (error) {
        console.error('Error loading activity registrations:', error);
        setError('Không thể tải danh sách hoạt động đã đăng ký');
        setRegistrations([]);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadRegistrations();
    }
  }, [user]);

  const handleCancelRegistration = async (registrationId: number) => {
    if (!confirm('Bạn có chắc chắn muốn hủy đăng ký hoạt động này?')) {
      return;
    }

    try {
      await api.cancelActivityRegistration(registrationId);
      setRegistrations(prev => 
        prev.map(reg => 
          reg.id === registrationId 
            ? { ...reg, status: 'cancelled' as const }
            : reg
        )
      );
    } catch (error) {
      console.error('Error cancelling registration:', error);
      alert('Không thể hủy đăng ký. Vui lòng thử lại.');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    const labels = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      cancelled: 'Đã hủy'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getAttendanceStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const badges = {
      not_attended: 'bg-gray-100 text-gray-800 border-gray-200',
      attended: 'bg-blue-100 text-blue-800 border-blue-200',
      partially_attended: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    const labels = {
      not_attended: 'Vắng mặt',
      attended: 'Có mặt',
      partially_attended: 'Tham gia một phần'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const filteredRegistrations = registrations.filter(reg => {
    if (filter === 'all') return true;
    return reg.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải danh sách hoạt động...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Hoạt động đã đăng ký
          </h1>
          <p className="text-gray-600">
            Quản lý các hoạt động bạn đã đăng ký tham gia
          </p>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Tất cả' },
              { key: 'pending', label: 'Chờ xác nhận' },
              { key: 'confirmed', label: 'Đã xác nhận' },
              { key: 'cancelled', label: 'Đã hủy' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === key
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Thử lại
            </button>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'Chưa có hoạt động nào' : `Không có hoạt động ${filter === 'pending' ? 'chờ xác nhận' : filter === 'confirmed' ? 'đã xác nhận' : 'đã hủy'}`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'Bạn chưa đăng ký tham gia hoạt động nào. Hãy khám phá các hoạt động thú vị!'
                : 'Thay đổi bộ lọc để xem các hoạt động khác.'
              }
            </p>
            {filter === 'all' && (
              <Link
                href="/activities"
                className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Khám phá hoạt động
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredRegistrations.map((registration) => (
              <div key={registration.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(registration.status)}
                      {getAttendanceStatusBadge(registration.attendance_status)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Đăng ký {formatDistanceToNow(new Date(registration.registration_date), { addSuffix: true, locale: vi })}
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Activity Image */}
                    <div className="lg:w-64 h-48 flex-shrink-0">
                      <div className="relative w-full h-full rounded-lg overflow-hidden">
                        <Image
                          src={registration.activity.image_url || '/images/bg.jpeg'}
                          alt={registration.activity.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>

                    {/* Activity Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <Link 
                          href={`/activities/${registration.activity.slug}`}
                          className="text-xl font-semibold text-gray-900 hover:text-orange-600 transition-colors"
                        >
                          {registration.activity.title}
                        </Link>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {registration.activity.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(registration.activity.start_date).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {registration.activity.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {registration.activity.current_participants}/{registration.activity.max_participants || '∞'} người tham gia
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {registration.activity.organizer.name}
                        </div>
                      </div>

                      {/* Categories */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {registration.activity.categories.map((category) => (
                          <span 
                            key={category.id}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>

                      {/* Notes */}
                      {registration.notes && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-4">
                          <p className="text-sm text-gray-600">
                            <strong>Ghi chú:</strong> {registration.notes}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={`/activities/${registration.activity.slug}`}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                        >
                          Xem chi tiết
                        </Link>
                        {registration.status === 'pending' && (
                          <button
                            onClick={() => handleCancelRegistration(registration.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                          >
                            Hủy đăng ký
                          </button>
                        )}
                      </div>
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
