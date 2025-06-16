'use client';

import { useState, useEffect } from 'react';
import { Activity } from '@/services/api';
import { getActivities, deleteActivity } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Edit, 
  Trash2, 
  Plus, 
  Eye,
  DollarSign,
  AlertCircle
} from 'lucide-react';

export default function UserActivitiesPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchUserActivities();
  }, [page, filter, user]);

  const fetchUserActivities = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const params: any = {
        page,
        organizer_id: user.id
      };
      
      if (filter !== 'all') {
        params.status = filter;
      }
      
      const response = await getActivities(params);
      setActivities(response.data);
      setTotalPages(response.last_page);
    } catch (error) {
      console.error('Error fetching user activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (activityId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa hoạt động này?')) return;
    
    try {
      await deleteActivity(activityId);
      fetchUserActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Có lỗi xảy ra khi xóa hoạt động');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
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
      case 'published':
        return 'Đã xuất bản';
      case 'draft':
        return 'Bản nháp';
      case 'pending':
        return 'Chờ duyệt';
      case 'rejected':
        return 'Bị từ chối';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Hoạt động của tôi</h1>
          <Link
            href="/user/activities/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Tạo hoạt động mới
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {[
              { value: 'all', label: 'Tất cả' },
              { value: 'published', label: 'Đã xuất bản' },
              { value: 'draft', label: 'Bản nháp' },
              { value: 'pending', label: 'Chờ duyệt' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setFilter(option.value);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activities List */}
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có hoạt động nào
            </h3>
            <p className="text-gray-500 mb-6">
              Tạo hoạt động đầu tiên để bắt đầu
            </p>
            <Link
              href="/user/activities/create"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Tạo hoạt động mới
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {activities.map((activity) => (
              <div key={activity.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {activity.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {activity.summary}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                        {getStatusText(activity.status)}
                      </span>
                      {activity.is_featured && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs font-medium rounded-full">
                          Nổi bật
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2" />
                      {format(new Date(activity.event_date), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </div>
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-2" />
                      {activity.location}
                    </div>
                    <div className="flex items-center">
                      <Users size={16} className="mr-2" />
                      {activity.current_participants}/{activity.max_participants} người
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Eye size={16} className="mr-1" />
                        {activity.views_count} lượt xem
                      </div>
                      <div className="flex items-center">
                        <DollarSign size={16} className="mr-1" />
                        {activity.registration_fee > 0 
                          ? `${new Intl.NumberFormat('vi-VN').format(activity.registration_fee)} VNĐ`
                          : 'Miễn phí'
                        }
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Link
                        href={`/activities/${activity.slug}`}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Xem hoạt động"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        href={`/user/activities/edit/${activity.slug}`}
                        className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(activity.id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${
                    page === i + 1
                      ? 'text-blue-600 bg-blue-50 border border-blue-300'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
