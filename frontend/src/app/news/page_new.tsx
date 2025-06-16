'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { api, News } from '@/services/api';

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [featuredNews, setFeaturedNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = [
    { id: 'all', name: 'Tất cả' },
    { id: 'community', name: 'Cộng đồng' },
    { id: 'event', name: 'Sự kiện' },
    { id: 'story', name: 'Câu chuyện' },
    { id: 'announcement', name: 'Thông báo' },
  ];

  useEffect(() => {
    fetchNews();
    fetchFeaturedNews();
  }, [selectedCategory, searchQuery, currentPage]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
      };
      
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      
      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await api.getNews(params);
      setNews(response.data);
      setTotalPages(response.meta.last_page);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedNews = async () => {
    try {
      const featuredData = await api.getFeaturedNews(2);
      setFeaturedNews(featuredData);
    } catch (error) {
      console.error('Error fetching featured news:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading && news.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải tin tức...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Tin tức & Cập nhật</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Cập nhật những tin tức mới nhất về các hoạt động thiện nguyện và câu chuyện cảm động từ cộng đồng.
        </p>
      </div>

      {/* Featured Articles */}
      {featuredNews.length > 0 && (
        <div className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredNews.map((article) => (
              <div key={article.id} className="relative h-[400px] rounded-lg overflow-hidden">
                <Image
                  src={article.image_url || '/images/bg.jpeg'}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="inline-block bg-orange-500 text-white px-3 py-1 rounded-full text-sm mb-4">
                      {categories.find(c => c.id === article.category)?.name}
                    </span>
                    <h2 className="text-2xl font-bold text-white mb-3">
                      <Link href={`/news/${article.slug}`} className="hover:text-orange-400">
                        {article.title}
                      </Link>
                    </h2>
                    <p className="text-gray-200 mb-3 line-clamp-2">{article.summary}</p>
                    <div className="flex items-center text-gray-300 text-sm">
                      <span>{article.author_name || article.author?.name}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(article.published_date)}</span>
                      <span className="mx-2">•</span>
                      <span>{article.read_time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
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

        <div className="w-full md:w-64">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Tìm kiếm tin tức..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {news.map((article) => (
          <article key={article.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <div className="relative h-48">
              <Image
                src={article.image_url || '/images/bg.jpeg'}
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-block bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm">
                  {categories.find(c => c.id === article.category)?.name}
                </span>
                <span className="text-sm text-gray-500">
                  {article.read_time}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                <Link href={`/news/${article.slug}`} className="hover:text-orange-500">
                  {article.title}
                </Link>
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {article.summary}
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <span>{article.author_name || article.author?.name}</span>
                <span className="mx-2">•</span>
                <span>{formatDate(article.published_date)}</span>
                <span className="mx-2">•</span>
                <span>{article.views_count} lượt xem</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {loading && news.length > 0 && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
        </div>
      )}

      {/* No results message */}
      {!loading && news.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">Không tìm thấy tin tức nào.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-12">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNumber = i + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-4 py-2 border rounded ${
                    currentPage === pageNumber
                      ? 'bg-orange-500 text-white'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
