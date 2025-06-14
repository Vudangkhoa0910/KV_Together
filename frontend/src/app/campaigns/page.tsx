'use client';

import React, { useState, useEffect } from 'react';
import { api, Campaign, Category, Stats } from '@/services/api';
import { CampaignCard } from '@/components/campaigns/CampaignCard';
import { formatCurrency, formatCurrencyShort } from '@/utils/format';

const CampaignsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load categories and stats in parallel
        const [categoriesData, statsData] = await Promise.all([
          api.getCategories(),
          api.getStats()
        ]);
        setCategories(categoriesData);
        setStats(statsData);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setLoading(true);
        const { data, meta } = await api.getCampaigns({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          sort: sortBy,
          page: currentPage,
          search: searchQuery,
        });
        setCampaigns(data);
        setTotalPages(meta.last_page);
        setError(null);
      } catch (err) {
        setError('Không thể tải danh sách chiến dịch');
        console.error('Failed to load campaigns:', err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(loadCampaigns, 300);
    return () => clearTimeout(timeoutId);
  }, [selectedCategory, sortBy, currentPage, searchQuery]);

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-blue-50/20">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-gradient-to-br from-orange-200/40 to-yellow-200/40 rounded-full -translate-y-8 -translate-x-8 animate-pulse"></div>
          <div className="absolute top-0 right-1/4 w-24 h-24 bg-gradient-to-bl from-blue-200/40 to-purple-200/40 rounded-full translate-y-4 translate-x-4 animate-pulse delay-1000"></div>
          <div className="absolute -top-16 left-1/2 w-64 h-64 bg-gradient-to-r from-orange-100/30 via-yellow-100/30 to-orange-100/30 rounded-full -translate-x-32 animate-pulse delay-500"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 bg-clip-text text-transparent animate-fadeIn">
              Các chiến dịch gây quỹ
            </h1>
            <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed animate-slideInFromBottom mb-8">
              Cùng chung tay đóng góp và lan tỏa yêu thương đến cộng đồng. Mỗi sự đóng góp của 
              bạn là một hành động ý nghĩa.
            </p>
            
            {/* Statistics bar */}
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeInScale">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-orange-100/50 shadow-lg">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {stats?.active_campaigns || 0}
                </div>
                <div className="text-gray-600 font-medium">Chiến dịch đang hoạt động</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/50 shadow-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {stats?.total_donors ? (stats.total_donors > 100 ? `${Math.floor(stats.total_donors / 100) * 100}+` : `${stats.total_donors}+`) : '0'}
                </div>
                <div className="text-gray-600 font-medium">Người đã đóng góp</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-green-100/50 shadow-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {stats?.total_amount_raised ? formatCurrencyShort(stats.total_amount_raised) : '0đ'}
                </div>
                <div className="text-gray-600 font-medium">VNĐ đã quyên góp</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-orange-100/50 p-8 mb-10 relative overflow-hidden">
          {/* Decorative gradient overlay */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1 md:col-span-3">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm chiến dịch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-400 transition-all duration-300 text-gray-700 placeholder-gray-400 bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Danh mục
                </span>
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-400 transition-all duration-300 bg-white/50 backdrop-blur-sm text-gray-700 font-medium"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                  Sắp xếp theo
                </span>
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-400 transition-all duration-300 bg-white/50 backdrop-blur-sm text-gray-700 font-medium"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="amount">Số tiền quyên góp</option>
                <option value="deadline">Thời gian còn lại</option>
              </select>
            </div>
          </div>
        </div>

        {/* Campaigns Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 h-[450px] animate-pulse overflow-hidden"
              >
                <div className="h-56 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
                <div className="p-6 space-y-4">
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded-full w-16" />
                    <div className="h-6 bg-gray-200 rounded-full w-12" />
                  </div>
                  <div className="h-7 bg-gray-200 rounded w-4/5" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-5 bg-gray-200 rounded w-full" />
                    <div className="h-5 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {campaigns.map((campaign, index) => (
                <div 
                  key={campaign.id} 
                  className="animate-slideInFromBottom"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <CampaignCard campaign={campaign} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-3">
                <div className="flex items-center gap-2">
                  {/* Previous button */}
                  <button
                    onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="group flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-white/80 border-2 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Trước
                  </button>
                  
                  {/* Page numbers */}
                  <div className="flex gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-xl font-semibold transition-all duration-300 transform hover:scale-110 ${
                          currentPage === i + 1
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                            : 'bg-white/80 border-2 border-gray-200 text-gray-600 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 shadow-md'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  
                  {/* Next button */}
                  <button
                    onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="group flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-white/80 border-2 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Tiếp
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* No Results */}
            {campaigns.length === 0 && (
              <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    Không tìm thấy chiến dịch nào
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Vui lòng thử lại với các bộ lọc khác hoặc từ khóa tìm kiếm khác
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSortBy('newest');
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Đặt lại bộ lọc
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CampaignsPage;