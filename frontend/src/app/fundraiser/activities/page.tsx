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
  AlertCircle,
  Star,
  TrendingUp,
  Filter,
  Download
} from 'lucide-react';

export default function FundraiserActivitiesPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFundraiserActivities();
  }, [page, filter, categoryFilter, searchTerm, user]);

  const fetchFundraiserActivities = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: '10',
        sort_by: 'created_at',
        sort_order: 'desc'
      });
      
      if (filter !== 'all') {
        queryParams.append('status', filter);
      }
      
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fundraiser/activities?${queryParams}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      
      const data = await response.json();
      setActivities(data.data);
      setTotalPages(data.last_page);
    } catch (error) {
      console.error('Error fetching fundraiser activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (activityId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa hoạt động này?')) return;
    
    try {
      await deleteActivity(activityId);
      fetchFundraiserActivities();
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

  const categories = [
    { value: 'all', label: 'Tất cả loại' },
    { value: 'event', label: 'Sự kiện' },
    { value: 'workshop', label: 'Hội thảo' },
    { value: 'community', label: 'Cộng đồng' },
    { value: 'volunteer', label: 'Tình nguyện' }
  ];

  // Calculate statistics
  const totalActivities = activities.length;
  const publishedActivities = activities.filter(a => a.status === 'published').length;
  const totalParticipants = activities.reduce((sum, a) => sum + a.current_participants, 0);
  const totalViews = activities.reduce((sum, a) => sum + a.views_count, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý hoạt động</h1>
            <p className="text-gray-600 mt-2">
              Quản lý và theo dõi các hoạt động của bạn
            </p>
          </div>
          <Link
            href="/fundraiser/activities/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Tạo hoạt động mới
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng hoạt động</p>
                <p className="text-2xl font-bold text-gray-900">{totalActivities}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã xuất bản</p>
                <p className="text-2xl font-bold text-green-600">{publishedActivities}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Star className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng người tham gia</p>
                <p className="text-2xl font-bold text-purple-600">{totalParticipants}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng lượt xem</p>
                <p className="text-2xl font-bold text-orange-600">{totalViews}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <TrendingUp className="text-orange-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm hoạt động..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="published">Đã xuất bản</option>
                <option value="draft">Bản nháp</option>
                <option value="pending">Chờ duyệt</option>
                <option value="rejected">Bị từ chối</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>

              <button className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                <Download size={16} />
                Xuất báo cáo
              </button>
            </div>
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
              Tạo hoạt động đầu tiên để bắt đầu kết nối với cộng đồng
            </p>
            <Link
              href="/fundraiser/activities/create"
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
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Image */}
                      {activity.image && (
                        <div className="w-20 h-20 flex-shrink-0">
                          <img 
                            src={`http://localhost:8000/storage/${activity.image}`} 
                            alt={activity.title}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {activity.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {activity.summary}
                        </p>
                      </div>
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
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded-full">
                        {categories.find(c => c.value === activity.category)?.label}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-sm text-gray-600">
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
                    <div className="flex items-center">
                      <DollarSign size={16} className="mr-1" />
                      {activity.registration_fee > 0 
                        ? `${new Intl.NumberFormat('vi-VN').format(activity.registration_fee)} VNĐ`
                        : 'Miễn phí'
                      }
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Đã đăng ký</span>
                      <span>{activity.max_participants ? Math.round((activity.current_participants / activity.max_participants) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${activity.max_participants ? Math.min((activity.current_participants / activity.max_participants) * 100, 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Eye size={16} className="mr-1" />
                        {activity.views_count} lượt xem
                      </div>
                      <span>•</span>
                      <span>Còn {activity.days_until_event} ngày</span>
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
                        href={`/fundraiser/activities/edit/${activity.slug}`}
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
