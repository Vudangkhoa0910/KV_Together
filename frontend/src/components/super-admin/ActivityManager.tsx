'use client';

import { useState, useEffect } from 'react';
import { superAdminAPI } from '@/services/superAdminApi';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Calendar,
  MapPin,
  Users,
  Activity as ActivityIcon,
  Clock,
  CheckCircle
} from 'lucide-react';

export default function ActivityManager() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedActivities, setSelectedActivities] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadActivities();
  }, [currentPage, statusFilter, typeFilter]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        per_page: 20,
        search: searchTerm
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }

      const response = await superAdminAPI.getTableData('activities', params);

      if (response.data?.data) {
        setActivities(response.data.data.data || []);
        setTotalPages(response.data.data.last_page || 1);
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadActivities();
  };

  const handleStatusChange = async (activityId: number, newStatus: string) => {
    try {
      await superAdminAPI.updateRecord('activities', activityId, { status: newStatus });
      loadActivities();
      alert('Trạng thái hoạt động đã được cập nhật');
    } catch (error) {
      console.error('Failed to update activity status:', error);
      alert('Không thể cập nhật trạng thái');
    }
  };

  const handleDeleteActivity = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa hoạt động này?')) return;
    
    try {
      await superAdminAPI.deleteRecord('activities', id);
      loadActivities();
      alert('Hoạt động đã được xóa');
    } catch (error) {
      console.error('Failed to delete activity:', error);
      alert('Không thể xóa hoạt động');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { color: string; label: string } } = {
      'upcoming': { color: 'bg-blue-100 text-blue-800', label: 'Sắp diễn ra' },
      'ongoing': { color: 'bg-green-100 text-green-800', label: 'Đang diễn ra' },
      'completed': { color: 'bg-gray-100 text-gray-800', label: 'Hoàn thành' },
      'cancelled': { color: 'bg-red-100 text-red-800', label: 'Đã hủy' },
      'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'Chờ duyệt' }
    };

    const statusInfo = statusMap[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeMap: { [key: string]: { color: string; label: string } } = {
      'volunteer': { color: 'bg-orange-100 text-orange-800', label: 'Tình nguyện' },
      'event': { color: 'bg-purple-100 text-purple-800', label: 'Sự kiện' },
      'community': { color: 'bg-green-100 text-green-800', label: 'Cộng đồng' },
      'workshop': { color: 'bg-blue-100 text-blue-800', label: 'Hội thảo' },
      'education': { color: 'bg-indigo-100 text-indigo-800', label: 'Giáo dục' }
    };

    const typeInfo = typeMap[type] || { color: 'bg-gray-100 text-gray-800', label: type };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
        {typeInfo.label}
      </span>
    );
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (!content) return '';
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  // Calculate statistics
  const upcomingActivities = activities.filter(a => a.status === 'upcoming');
  const ongoingActivities = activities.filter(a => a.status === 'ongoing');
  const completedActivities = activities.filter(a => a.status === 'completed');
  const totalParticipants = activities.reduce((sum, a) => sum + (a.participants_count || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
        <span className="ml-2 text-lg text-gray-700">Đang tải dữ liệu hoạt động...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ActivityIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng hoạt động</p>
              <p className="text-2xl font-bold text-gray-900">{activities.length.toLocaleString('vi-VN')}</p>
              <p className="text-xs text-blue-600 mt-1">Tất cả hoạt động</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đang diễn ra</p>
              <p className="text-2xl font-bold text-gray-900">{ongoingActivities.length.toLocaleString('vi-VN')}</p>
              <p className="text-xs text-green-600 mt-1">Hoạt động hiện tại</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sắp diễn ra</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingActivities.length.toLocaleString('vi-VN')}</p>
              <p className="text-xs text-purple-600 mt-1">Trong tương lai</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng tham gia</p>
              <p className="text-2xl font-bold text-gray-900">{totalParticipants.toLocaleString('vi-VN')}</p>
              <p className="text-xs text-yellow-600 mt-1">Người tham gia</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-100">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <form onSubmit={handleSearch} className="flex-1 flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm hoạt động..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Tìm kiếm
            </button>
          </form>
          
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="upcoming">Sắp diễn ra</option>
              <option value="ongoing">Đang diễn ra</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
              <option value="pending">Chờ duyệt</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Tất cả loại</option>
              <option value="volunteer">Tình nguyện</option>
              <option value="event">Sự kiện</option>
              <option value="community">Cộng đồng</option>
              <option value="workshop">Hội thảo</option>
              <option value="education">Giáo dục</option>
            </select>
            
            <button
              onClick={loadActivities}
              className="p-2 text-gray-600 hover:text-orange-600 border border-gray-300 rounded-lg hover:border-orange-300 transition-colors"
              title="Làm mới"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            
            <button
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
              title="Thêm hoạt động mới"
            >
              <Plus className="h-4 w-4" />
              Thêm mới
            </button>
          </div>
        </div>
      </div>

      {/* Activities Table */}
      <div className="bg-white rounded-lg shadow-sm border border-orange-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-orange-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedActivities(activities.map(a => a.id));
                      } else {
                        setSelectedActivities([]);
                      }
                    }}
                    checked={selectedActivities.length === activities.length && activities.length > 0}
                    className="focus:ring-orange-500 text-orange-600"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hoạt động
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Địa điểm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tham gia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày diễn ra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activities.map((activity) => (
                <tr key={activity.id} className="hover:bg-orange-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedActivities.includes(activity.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedActivities([...selectedActivities, activity.id]);
                        } else {
                          setSelectedActivities(selectedActivities.filter(id => id !== activity.id));
                        }
                      }}
                      className="focus:ring-orange-500 text-orange-600"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-4">
                      {activity.image_url && (
                        <img 
                          className="h-16 w-16 rounded-lg object-cover flex-shrink-0" 
                          src={activity.image_url} 
                          alt={activity.title}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {activity.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {truncateContent(activity.description)}
                        </div>
                        <div className="flex items-center mt-2 text-xs text-gray-400">
                          <Calendar className="h-4 w-4 mr-1" />
                          Tạo: {formatDate(activity.created_at)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTypeBadge(activity.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(activity.status)}
                      <select
                        value={activity.status}
                        onChange={(e) => handleStatusChange(activity.id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="upcoming">Sắp diễn ra</option>
                        <option value="ongoing">Đang diễn ra</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                        <option value="pending">Chờ duyệt</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {activity.location || 'Chưa xác định'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {(activity.participants_count || 0).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      {activity.event_date ? formatDate(activity.event_date) : 'Chưa xác định'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.open(`/activities/${activity.id}`, '_blank')}
                        className="text-orange-600 hover:text-orange-900 transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteActivity(activity.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {activities.length === 0 && (
          <div className="text-center py-12">
            <ActivityIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có hoạt động</h3>
            <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách tạo hoạt động mới.</p>
            <div className="mt-6">
              <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Tạo hoạt động mới
              </button>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Trang <span className="font-medium">{currentPage}</span> trên{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedActivities.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              Đã chọn {selectedActivities.length} hoạt động
            </span>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                Phê duyệt
              </button>
              <button className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700">
                Tạm dừng
              </button>
              <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">
                Xóa
              </button>
            </div>
            <button
              onClick={() => setSelectedActivities([])}
              className="text-gray-400 hover:text-gray-600"
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}