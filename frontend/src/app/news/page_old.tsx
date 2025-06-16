'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const NewsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for news categories
  const categories = [
    { id: 'all', name: 'Tất cả' },
    { id: 'community', name: 'Cộng đồng' },
    { id: 'events', name: 'Sự kiện' },
    { id: 'stories', name: 'Câu chuyện' },
    { id: 'updates', name: 'Cập nhật' },
  ];

  // Mock data for news articles
  const news = [
    {
      id: 1,
      title: 'Chương trình từ thiện "Tết cho người nghèo" đạt mục tiêu',
      category: 'events',
      image: '/images/news1.jpg',
      summary: 'Chương trình đã quyên góp được hơn 500 triệu đồng, mang Tết ấm áp đến cho hơn 1000 hộ gia đình khó khăn.',
      author: 'Nguyễn Văn A',
      date: '2024-03-15',
      readTime: '5 phút',
      featured: true
    },
    {
      id: 2,
      title: 'Câu chuyện về những tấm lòng nhân ái trong mùa dịch',
      category: 'stories',
      image: '/images/news2.jpg',
      summary: 'Những câu chuyện cảm động về tinh thần tương thân tương ái của cộng đồng trong thời gian khó khăn.',
      author: 'Trần Thị B',
      date: '2024-03-14',
      readTime: '8 phút'
    },
    // Add more mock news here
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredNews = news.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto py-8">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Tin tức & Cập nhật</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Cập nhật những tin tức mới nhất về các hoạt động thiện nguyện và câu chuyện cảm động từ cộng đồng.
        </p>
      </div>

      {/* Featured Article */}
      {filteredNews.find(article => article.featured) && (
        <div className="mb-12">
          {news.filter(article => article.featured).map(article => (
            <div key={article.id} className="relative h-[500px] rounded-lg overflow-hidden">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent">
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <span className="badge badge-primary mb-4">{categories.find(c => c.id === article.category)?.name}</span>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    <Link href={`/news/${article.id}`} className="hover:text-orange-500">
                      {article.title}
                    </Link>
                  </h2>
                  <p className="text-gray-200 mb-4 line-clamp-2">{article.summary}</p>
                  <div className="flex items-center text-gray-300 text-sm">
                    <span>{article.author}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(article.date)}</span>
                    <span className="mx-2">•</span>
                    <span>{article.readTime} đọc</span>
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

        <div className="w-full md:w-64">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm tin tức..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredNews.filter(article => !article.featured).map((article) => (
          <article key={article.id} className="card animate-fade-in">
            <div className="relative h-48">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover rounded-t-lg"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="badge badge-primary">
                  {categories.find(c => c.id === article.category)?.name}
                </span>
                <span className="text-sm text-gray-500">
                  {article.readTime} đọc
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                <Link href={`/news/${article.id}`} className="hover:text-orange-500">
                  {article.title}
                </Link>
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {article.summary}
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <span>{article.author}</span>
                <span className="mx-2">•</span>
                <span>{formatDate(article.date)}</span>
              </div>
            </div>
          </article>
        ))}
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

export default NewsPage; 