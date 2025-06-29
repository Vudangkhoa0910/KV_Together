'use client';

import { useState, useEffect } from 'react';
import { api, Activity } from '@/services/api';
import { Search, Calendar, MapPin, Users, Filter } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const CATEGORIES = {
  event: 'Sự kiện',
  workshop: 'Hội thảo', 
  community: 'Cộng đồng',
  volunteer: 'Tình nguyện'
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchActivities = async (page: number = 1) => {
    try {
      setLoading(true);
      const params: any = { page };
      
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      
      const response = await api.getActivities(params);
      setActivities(response.data);
      setCurrentPage(response.meta.current_page);
      setTotalPages(response.meta.last_page);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(1);
  }, [searchTerm, selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchActivities(1);
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd/MM/yyyy HH:mm', { locale: vi });
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const statuses = [
    { id: 'all', name: 'Tất cả' },
    { id: 'upcoming', name: 'Sắp diễn ra' },
    { id: 'ongoing', name: 'Đang diễn ra' },
    { id: 'completed', name: 'Đã hoàn thành' },
  ];

  // Mock data for activities
  const activities = [
    {
      id: 1,
      title: 'Dọn dẹp bãi biển và trồng rừng ngập mặn',
      category: 'environment',
      status: 'upcoming',
      image: '/images/activities/beach-cleanup.jpg',
      location: 'Bãi biển Vũng Tàu',
      startDate: '2024-04-15',
      endDate: '2024-04-16',
      participants: 45,
      maxParticipants: 100,
      organizer: {
        name: 'CLB Môi trường Xanh',
        avatar: '/images/organizers/green-club.jpg'
      },
      description: 'Hoạt động dọn dẹp bãi biển và trồng rừng ngập mặn nhằm bảo vệ môi trường biển và hệ sinh thái.',
      featured: true
    },
    {
      id: 2,
      title: 'Dạy học cho trẻ em vùng cao',
      category: 'education',
      status: 'ongoing',
      image: '/images/activities/teaching.jpg',
      location: 'Hà Giang',
      startDate: '2024-03-01',
      endDate: '2024-05-30',
      participants: 20,
      maxParticipants: 25,
      organizer: {
        name: 'Quỹ Hy Vọng',
        avatar: '/images/organizers/hope-fund.jpg'
      },
      description: 'Chương trình dạy học tình nguyện cho trẻ em vùng cao, tập trung vào các môn học cơ bản.'
    },
    // Add more activities here
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-600';
      case 'ongoing':
        return 'bg-green-100 text-green-600';
      case 'completed':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusName = (status: string) => {
    return statuses.find(s => s.id === status)?.name || status;
  };

  const filteredActivities = activities.filter(activity => {
    const matchesCategory = selectedCategory === 'all' || activity.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || activity.status === selectedStatus;
    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="container mx-auto py-8">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Hoạt động thiện nguyện</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Tham gia các hoạt động ý nghĩa, chung tay xây dựng cộng đồng và lan tỏa yêu thương.
        </p>
      </div>

      {/* Featured Activity */}
      {filteredActivities.find(activity => activity.featured) && (
        <div className="mb-12">
          {activities.filter(activity => activity.featured).map(activity => (
            <div key={activity.id} className="relative h-[500px] rounded-lg overflow-hidden">
              <Image
                src={activity.image}
                alt={activity.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent">
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex items-center space-x-4 mb-4">
                    <span className={`badge ${getStatusColor(activity.status)}`}>
                      {getStatusName(activity.status)}
                    </span>
                    <span className="badge badge-primary">
                      {categories.find(c => c.id === activity.category)?.name}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    <Link href={`/activities/${activity.id}`} className="hover:text-orange-500">
                      {activity.title}
                    </Link>
                  </h2>
                  <p className="text-gray-200 mb-6 line-clamp-2">{activity.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden">
                        <Image
                          src={activity.organizer.avatar}
                          alt={activity.organizer.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-white font-medium">{activity.organizer.name}</div>
                        <div className="text-gray-300 text-sm">{activity.location}</div>
                      </div>
                    </div>
                    <div className="text-right text-gray-300">
                      <div className="text-sm">
                        {formatDate(activity.startDate)} - {formatDate(activity.endDate)}
                      </div>
                      <div className="text-sm">
                        {activity.participants}/{activity.maxParticipants} người tham gia
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="form-select"
          >
            {statuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm hoạt động..."
              className="w-64 pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredActivities.filter(activity => !activity.featured).map((activity) => (
          <article key={activity.id} className="card animate-fade-in">
            <div className="relative">
              <div className="relative h-48">
                <Image
                  src={activity.image}
                  alt={activity.title}
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
              <div className="absolute top-2 right-2">
                <ActivityOptions
                  activityId={activity.id}
                  userRole="member" // TODO: Get from auth context
                  status={activity.status}
                  onDelete={() => {
                    // TODO: Implement delete functionality
                    console.log('Delete activity:', activity.id);
                  }}
                />
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`badge ${getStatusColor(activity.status)}`}>
                  {getStatusName(activity.status)}
                </span>
                <span className="badge badge-primary">
                  {categories.find(c => c.id === activity.category)?.name}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                <Link href={`/activities/${activity.id}`} className="hover:text-orange-500">
                  {activity.title}
                </Link>
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {activity.description}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <i className="fas fa-map-marker-alt mr-2"></i>
                  {activity.location}
                </div>
                <div>
                  <i className="fas fa-calendar mr-2"></i>
                  {formatDate(activity.startDate)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
                    <Image
                      src={activity.organizer.avatar}
                      alt={activity.organizer.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium">{activity.organizer.name}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {activity.participants}/{activity.maxParticipants} người tham gia
                </div>
              </div>
            </div>
            <div className="card-footer">
              <Link
                href={`/activities/${activity.id}`}
                className="btn btn-primary w-full"
              >
                Xem chi tiết
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Create Activity Button */}
      <div className="text-center mt-12">
        <Link
          href="/activities/create"
          className="btn btn-primary inline-flex items-center"
        >
          <i className="fas fa-plus mr-2"></i>
          Tạo hoạt động mới
        </Link>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-12">
        <nav className="flex items-center space-x-2">
          <button className="p-2 border rounded hover:bg-gray-50">
            <i className="fas fa-chevron-left"></i>
          </button>
          <button className="px-4 py-2 border rounded bg-orange-500 text-white">1</button>
          <button className="px-4 py-2 border rounded hover:bg-gray-50">2</button>
          <button className="px-4 py-2 border rounded hover:bg-gray-50">3</button>
          <button className="p-2 border rounded hover:bg-gray-50">
            <i className="fas fa-chevron-right"></i>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default ActivitiesPage; 