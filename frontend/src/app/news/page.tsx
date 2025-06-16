'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { News, api } from '@/services/api';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  Calendar, 
  User,
  Clock,
  Eye,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Star,
  Newspaper,
  Megaphone,
  Users,
  Calendar as CalendarIcon,
  BookOpen
} from 'lucide-react';

const categoryIcons = {
  community: Users,
  event: CalendarIcon,
  story: BookOpen,
  announcement: Megaphone,
};

const categoryColors = {
  community: 'bg-blue-100 text-blue-800',
  event: 'bg-green-100 text-green-800',
  story: 'bg-purple-100 text-purple-800',
  announcement: 'bg-orange-100 text-orange-800',
};

export default function NewsPage() {
  const searchParams = useSearchParams();
  const [news, setNews] = useState<News[]>([]);
  const [featuredNews, setFeaturedNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<{id: string; name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(''); // Thêm state tạm cho input
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Read query parameters from URL
  useEffect(() => {
    if (searchParams) {
      const categoryFromUrl = searchParams.get('category');
      const searchFromUrl = searchParams.get('search');
      const featuredFromUrl = searchParams.get('featured');
      
      console.log('URL params:', { categoryFromUrl, searchFromUrl, featuredFromUrl });
      
      if (categoryFromUrl) {
        setSelectedCategory(categoryFromUrl);
      }
      if (searchFromUrl) {
        setSearchQuery(searchFromUrl);
        setSearchInput(searchFromUrl);
      }
      if (featuredFromUrl === 'true') {
        // Handle featured news filter
        // For now, we'll just load featured news
      }
    }
  }, [searchParams]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    console.log('useEffect triggered. selectedCategory:', selectedCategory, 'searchQuery:', searchQuery, 'currentPage:', currentPage);
    loadNews();
  }, [selectedCategory, searchQuery, currentPage]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [featuredData, categoriesData] = await Promise.all([
        api.getFeaturedNews(3),
        api.getNewsCategories()
      ]);
      
      console.log('Categories loaded:', categoriesData); // Debug log
      setFeaturedNews(featuredData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    }
  };

  const loadNews = async () => {
    try {
      // Chỉ hiển thị loading cho trang đầu tiên, không hiển thị khi search/filter
      if (currentPage === 1 && !searchQuery && selectedCategory === 'all') {
        setLoading(true);
      }
      const params: any = {
        page: currentPage,
      };

      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      console.log('Loading news with params:', params); // Debug log
      console.log('Selected category:', selectedCategory); // Debug log

      const response = await api.getNews(params);
      setNews(response.data);
      setTotalPages(response.meta.last_page);
      setTotalCount(response.meta.total);
    } catch (err) {
      console.error('Error loading news:', err);
      setError('Không thể tải tin tức. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchQuery(searchInput); // Chỉ cập nhật searchQuery khi submit
    // Giữ focus vào ô input sau khi submit
    const inputElement = e.currentTarget.querySelector('input[type="text"]') as HTMLInputElement;
    if (inputElement) {
      setTimeout(() => inputElement.focus(), 100);
    }
  };

  const handleCategoryChange = (category: string) => {
    console.log('Category clicked:', category); // Debug log
    console.log('Previous selectedCategory:', selectedCategory); // Debug log
    console.log('handleCategoryChange called!'); // Additional debug
    setSelectedCategory(category);
    setCurrentPage(1);
    // Không scroll khi chọn danh mục
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Chỉ scroll lên đầu khi thực sự chuyển trang (không phải khi search hoặc filter)
    if (page !== currentPage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy', { locale: vi });
    } catch {
      return 'N/A';
    }
  };

  const getCategoryIcon = (category: string) => {
    const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || Newspaper;
    return <IconComponent className="w-4 h-4" />;
  };

  const getCategoryColor = (category: string) => {
    return categoryColors[category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800';
  };

  useEffect(() => {
    setSearchInput(searchQuery); // Khi searchQuery thay đổi (ví dụ khi reset filter), cập nhật lại input
  }, [searchQuery]);

  if (loading && currentPage === 1) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tin Tức & Thông Tin
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Cập nhật những tin tức mới nhất về hoạt động từ thiện và các sự kiện cộng đồng
          </p>
        </div>

        {/* Featured News Section */}
        {featuredNews.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-900">Tin Nổi Bật</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {featuredNews.map((item, index) => (
                <Link
                  key={item.id}
                  href={`/news/${item.slug}`}
                  className={`group relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 ${
                    index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''
                  }`}
                >
                  <div className={`aspect-video ${index === 0 ? 'lg:aspect-[2/1]' : ''} relative overflow-hidden`}>
                    <img
                      src={item.image_url || '/images/news-placeholder.jpg'}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {/* Category badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                        {getCategoryIcon(item.category)}
                        {categories.find(cat => cat.id === item.category)?.name || item.category}
                      </span>
                    </div>

                    {/* Content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className={`font-bold mb-2 line-clamp-2 ${index === 0 ? 'text-xl lg:text-2xl' : 'text-lg'}`}>
                        {item.title}
                      </h3>
                      
                      <p className={`text-gray-200 line-clamp-2 mb-3 ${index === 0 ? 'text-base' : 'text-sm'}`}>
                        {item.summary}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-300">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(item.published_date)}</span>
                        </div>
                        
                        {item.author_name && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{item.author_name}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{item.views_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tin tức..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </form>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors lg:hidden"
            >
              <Filter className="w-5 h-5" />
              Bộ lọc
            </button>
          </div>

          {/* Category Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block mt-4 pt-4 border-t`}>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  console.log('All button clicked');
                  handleCategoryChange('all');
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả
              </button>
              
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Button clicked for category:', category.id);
                    console.log('Event:', e);
                    handleCategoryChange(category.id);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                    selectedCategory === category.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {getCategoryIcon(category.id)}
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Hiển thị {news.length} tin tức {totalCount > 0 && `/ ${totalCount} kết quả`}
            {selectedCategory !== 'all' && ` - Danh mục: ${categories.find(cat => cat.id === selectedCategory)?.name || selectedCategory}`}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 text-red-800">
              <div className="w-6 h-6 rounded-full bg-red-200 flex items-center justify-center">
                <span className="text-sm font-bold">!</span>
              </div>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* News Grid */}
        {news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {news.map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.slug}`}
                className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={item.image_url || '/images/news-placeholder.jpg'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Category badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                      {getCategoryIcon(item.category)}
                      {categories.find(cat => cat.id === item.category)?.name || item.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                    {item.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {item.summary}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(item.published_date)}</span>
                      </div>
                      
                      {item.read_time && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{item.read_time}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{item.views_count || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : !loading && (
          <div className="text-center py-12">
            <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy tin tức</h3>
            <p className="text-gray-500">
              {searchQuery || selectedCategory !== 'all'
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                : 'Chưa có tin tức nào được đăng tải'
              }
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Trước
            </button>

            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    currentPage === pageNum
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}