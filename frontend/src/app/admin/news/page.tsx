'use client';

<<<<<<< HEAD
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new super admin dashboard
    router.push('/super-admin');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to Super Admin Dashboard...</p>
      </div>
=======
import { useState, useEffect } from 'react';
import { 
  EyeIcon, 
  CheckCircleIcon, 
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UserIcon,
  DocumentTextIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { adminApi } from '@/services/api';

interface News {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  author: {
    id: number;
    name: string;
    email: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
  };
  image?: string;
  views?: number;
  featured: boolean;
}

export default function AdminNews() {
  const [news, setNews] = useState<News[]>([]);
  const [filteredNews, setFilteredNews] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'create'>('view');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    filterNews();
  }, [news, searchTerm, statusFilter, categoryFilter]);

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminApi.getNews().catch(() => null);
      
      if (response?.data) {
        // Laravel paginate returns: { data: [...], current_page: 1, total: 100, ... }
        // Extract the actual data array
        const newsData = Array.isArray(response.data) ? response.data : response.data.data || [];
        setNews(newsData);
      } else {
        // Mock data fallback
        const mockNews: News[] = [
          {
            id: 1,
            title: 'KV Together ra mắt tính năng mới hỗ trợ quyên góp',
            content: 'Chúng tôi rất vui mừng thông báo về việc ra mắt tính năng mới giúp việc quyên góp trở nên dễ dàng và minh bạch hơn...',
            excerpt: 'KV Together giới thiệu tính năng mới giúp cải thiện trải nghiệm quyên góp',
            status: 'published',
            created_at: '2024-06-20T00:00:00Z',
            updated_at: '2024-06-20T00:00:00Z',
            author: {
              id: 1,
              name: 'Admin',
              email: 'admin@kvtogether.com'
            },
            category: {
              id: 1,
              name: 'Thông báo',
              slug: 'announcement'
            },
            views: 1250,
            featured: true
          },
          {
            id: 2,
            title: 'Báo cáo tình hình quyên góp tháng 6/2024',
            content: 'Trong tháng 6/2024, KV Together đã hỗ trợ thành công nhiều chiến dịch quyên góp ý nghĩa...',
            excerpt: 'Tổng kết hoạt động quyên góp trong tháng 6/2024',
            status: 'published',
            created_at: '2024-06-15T00:00:00Z',
            updated_at: '2024-06-15T00:00:00Z',
            author: {
              id: 1,
              name: 'Admin',
              email: 'admin@kvtogether.com'
            },
            category: {
              id: 2,
              name: 'Báo cáo',
              slug: 'report'
            },
            views: 890,
            featured: false
          },
          {
            id: 3,
            title: 'Hướng dẫn tạo chiến dịch quyên góp hiệu quả',
            content: 'Bài viết này sẽ hướng dẫn bạn cách tạo một chiến dịch quyên góp thành công...',
            excerpt: 'Các bước tạo chiến dịch quyên góp thu hút sự quan tâm',
            status: 'draft',
            created_at: '2024-06-10T00:00:00Z',
            updated_at: '2024-06-18T00:00:00Z',
            author: {
              id: 2,
              name: 'Editor',
              email: 'editor@kvtogether.com'
            },
            category: {
              id: 3,
              name: 'Hướng dẫn',
              slug: 'guide'
            },
            views: 0,
            featured: false
          },
          {
            id: 4,
            title: 'Câu chuyện cảm động từ các nhà hảo tâm',
            content: 'Những câu chuyện đầy cảm xúc từ cộng đồng quyên góp KV Together...',
            excerpt: 'Chia sẻ những khoảnh khắc ý nghĩa từ cộng đồng',
            status: 'archived',
            created_at: '2024-05-01T00:00:00Z',
            updated_at: '2024-05-01T00:00:00Z',
            author: {
              id: 2,
              name: 'Editor',
              email: 'editor@kvtogether.com'
            },
            category: {
              id: 4,
              name: 'Câu chuyện',
              slug: 'story'
            },
            views: 2150,
            featured: false
          }
        ];
        setNews(mockNews);
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Không thể tải danh sách tin tức');
    } finally {
      setIsLoading(false);
    }
  };

  const filterNews = () => {
    let filtered = news || [];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.author.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category.slug === categoryFilter);
    }

    setFilteredNews(filtered);
  };

  const handlePublishNews = async (newsId: number) => {
    try {
      await adminApi.publishNews(newsId);
      fetchNews();
    } catch (error) {
      console.error('Error publishing news:', error);
    }
  };

  const handleArchiveNews = async (newsId: number) => {
    try {
      await adminApi.archiveNews(newsId);
      fetchNews();
    } catch (error) {
      console.error('Error archiving news:', error);
    }
  };

  const handleDeleteNews = async (newsId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      try {
        // await adminApi.deleteNews(newsId);
        console.log('Delete news:', newsId);
        fetchNews();
      } catch (error) {
        console.error('Error deleting news:', error);
      }
    }
  };

  const handleViewNews = (newsItem: News) => {
    setSelectedNews(newsItem);
    setModalType('view');
    setShowModal(true);
  };

  const handleEditNews = (newsItem: News) => {
    setSelectedNews(newsItem);
    setModalType('edit');
    setShowModal(true);
  };

  const handleCreateNews = () => {
    setSelectedNews(null);
    setModalType('create');
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Đã xuất bản';
      case 'draft': return 'Bản nháp';
      case 'archived': return 'Đã lưu trữ';
      default: return status;
    }
  };

  const getCategoryColor = (categorySlug: string) => {
    switch (categorySlug) {
      case 'announcement': return 'bg-blue-100 text-blue-800';
      case 'report': return 'bg-purple-100 text-purple-800';
      case 'guide': return 'bg-green-100 text-green-800';
      case 'story': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = (filteredNews || []).slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil((filteredNews || []).length / itemsPerPage);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6 bg-gray-50">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý tin tức</h1>
            <p className="mt-1 text-gray-600">Tạo và quản lý các bài viết tin tức</p>
          </div>
          <button
            onClick={handleCreateNews}
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors flex items-center"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Tạo bài viết
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="published">Đã xuất bản</option>
              <option value="draft">Bản nháp</option>
              <option value="archived">Đã lưu trữ</option>
            </select>
          </div>
          <div className="w-full sm:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Tất cả danh mục</option>
              <option value="announcement">Thông báo</option>
              <option value="report">Báo cáo</option>
              <option value="guide">Hướng dẫn</option>
              <option value="story">Câu chuyện</option>
            </select>
          </div>
        </div>
      </div>

      {/* News Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bài viết
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tác giả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lượt xem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((newsItem) => (
                <tr key={newsItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-12 w-12">
                        {newsItem.image ? (
                          <img 
                            src={newsItem.image} 
                            alt={newsItem.title}
                            className="h-12 w-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center">
                          <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                            {newsItem.title}
                          </h3>
                          {newsItem.featured && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                              Nổi bật
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                          {newsItem.excerpt}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(newsItem.category.slug)}`}>
                      {newsItem.category.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(newsItem.status)}`}>
                      {getStatusText(newsItem.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {newsItem.author.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {newsItem.views?.toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(newsItem.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => handleViewNews(newsItem)}
                        className="text-orange-600 hover:text-orange-900"
                        title="Xem chi tiết"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditNews(newsItem)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Chỉnh sửa"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      {newsItem.status === 'draft' && (
                        <button 
                          onClick={() => handlePublishNews(newsItem.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Xuất bản"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                      )}
                      {newsItem.status === 'published' && (
                        <button 
                          onClick={() => handleArchiveNews(newsItem.id)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Lưu trữ"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteNews(newsItem.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{indexOfFirstItem + 1}</span> đến{' '}
                  <span className="font-medium">{Math.min(indexOfLastItem, (filteredNews || []).length)}</span> trong{' '}
                  <span className="font-medium">{(filteredNews || []).length}</span> kết quả
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-medium text-gray-900">
                  {modalType === 'create' && 'Tạo bài viết mới'}
                  {modalType === 'edit' && 'Chỉnh sửa bài viết'}
                  {modalType === 'view' && 'Chi tiết bài viết'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              {modalType === 'view' && selectedNews ? (
                <div className="space-y-6">
                  {selectedNews.image && (
                    <div>
                      <img 
                        src={selectedNews.image} 
                        alt={selectedNews.title}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedNews.title}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedNews.status)}`}>
                          {getStatusText(selectedNews.status)}
                        </span>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Danh mục</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(selectedNews.category.slug)}`}>
                          {selectedNews.category.name}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tác giả</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedNews.author.name}</p>
                        <p className="text-xs text-gray-500">{selectedNews.author.email}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Lượt xem</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedNews.views?.toLocaleString() || 0}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Ngày tạo</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(selectedNews.created_at).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Cập nhật lần cuối</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(selectedNews.updated_at).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tóm tắt</label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-900">{selectedNews.excerpt}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung</label>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {selectedNews.content}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 pt-4 border-t">
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Tính năng tạo/chỉnh sửa bài viết đang được phát triển</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
>>>>>>> origin/main
    </div>
  );
}
