'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Activity, api } from '@/services/api';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Search, 
  Filter,
  DollarSign,
  Star,
  Eye
} from 'lucide-react';

export default function ActivitiesPage() {
  const searchParams = useSearchParams();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [featuredActivities, setFeaturedActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<{id: string; name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Read query parameters from URL
  useEffect(() => {
    if (searchParams) {
      const categoryFromUrl = searchParams.get('category');
      const searchFromUrl = searchParams.get('search');
      const statusFromUrl = searchParams.get('status');
      
      if (categoryFromUrl) {
        setSelectedCategory(categoryFromUrl);
      }
      if (searchFromUrl) {
        setSearchTerm(searchFromUrl);
      }
      if (statusFromUrl) {
        // Handle status filter - you can extend this based on your needs
        // For now, we'll just include it in the API call
      }
    }
  }, [searchParams]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [page, searchTerm, selectedCategory]);

  const fetchInitialData = async () => {
    try {
      const [featuredResponse, categoriesResponse] = await Promise.all([
        api.getFeaturedActivities(),
        api.getActivityCategories()
      ]);
      
      setFeaturedActivities(featuredResponse);
      setCategories(categoriesResponse);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params: any = { page };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      
      const response = await api.getActivities(params);
      setActivities(response.data);
      setTotalPages(response.meta.last_page);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchActivities();
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'event': 'Sự kiện',
      'workshop': 'Hội thảo',
      'community': 'Cộng đồng',
      'volunteer': 'Tình nguyện'
    };
    return categoryMap[category] || category;
  };

  if (loading && activities.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Hoạt động cộng đồng
          </h1>
          <p className="text-xl text-gray-600">
            Tham gia các hoạt động ý nghĩa và kết nối với cộng đồng
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Featured Activities */}
        {featuredActivities.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Star className="mr-2 text-yellow-500" size={24} />
              Hoạt động nổi bật
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredActivities.slice(0, 3).map((activity) => (
                <div key={activity.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative">
                    {activity.image_url && (
                      <img
                        src={activity.image_url}
                        alt={activity.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-yellow-500 text-white px-2 py-1 text-xs font-medium rounded-full">
                        Nổi bật
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded">
                        {getCategoryLabel(activity.category)}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {activity.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {activity.summary}
                    </p>
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
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
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-green-600">
                        {activity.registration_fee > 0 
                          ? `${new Intl.NumberFormat('vi-VN').format(activity.registration_fee)} VNĐ`
                          : 'Miễn phí'
                        }
                      </span>
                      <Link
                        href={`/activities/${activity.slug}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Search and Filter */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Tìm kiếm hoạt động..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Filter size={20} />
                Lọc
              </button>
            </div>
          </form>
        </div>

        {/* Activities Grid */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Tất cả hoạt động
          </h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-64 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search size={48} className="mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Không tìm thấy hoạt động nào
              </h3>
              <p className="text-gray-600">
                Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map((activity) => (
                <div key={activity.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    {activity.image_url && (
                      <img
                        src={activity.image_url}
                        alt={activity.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    {activity.is_featured && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-yellow-500 text-white px-2 py-1 text-xs font-medium rounded-full">
                          Nổi bật
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded">
                        {getCategoryLabel(activity.category)}
                      </span>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Eye size={14} className="mr-1" />
                        {activity.views_count}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {activity.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {activity.summary}
                    </p>
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-2" />
                        {format(new Date(activity.event_date), 'dd/MM/yyyy', { locale: vi })}
                      </div>
                      <div className="flex items-center">
                        <MapPin size={14} className="mr-2" />
                        {activity.location}
                      </div>
                      <div className="flex items-center">
                        <Users size={14} className="mr-2" />
                        {activity.current_participants}/{activity.max_participants}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-green-600">
                        {activity.registration_fee > 0 
                          ? `${new Intl.NumberFormat('vi-VN').format(activity.registration_fee)} VNĐ`
                          : 'Miễn phí'
                        }
                      </span>
                      <Link
                        href={`/activities/${activity.slug}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
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