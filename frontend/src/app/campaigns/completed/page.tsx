'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, Campaign, Category } from '@/services/api';
import { CampaignCard } from '@/components/campaigns/CampaignCard';
import { formatCurrency } from '@/utils/format';

const CompletedCampaignsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [totalRaised, setTotalRaised] = useState(0);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [categoriesData, campaignsData] = await Promise.all([
          api.getCategories(),
          api.getCompletedCampaigns({
            category: selectedCategory === 'all' ? undefined : selectedCategory,
            sort: sortBy,
            search: searchQuery || undefined,
            page: currentPage,
            per_page: 12
          })
        ]);

        setCategories(categoriesData);
        setCampaigns(campaignsData.data);
        setTotalPages(campaignsData.meta.last_page);
        setTotalCompleted(campaignsData.meta.total);
        // Only set totalRaised if total_raised exists, otherwise fallback to 0
        setTotalRaised((campaignsData.meta as any).total_raised ?? 0);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [selectedCategory, sortBy, searchQuery, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  if (loading && campaigns.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 inline-flex space-x-2">
            <Link 
              href="/campaigns"
              className="px-6 py-3 rounded-lg text-gray-600 hover:text-orange-600 hover:bg-orange-50 font-medium transition-all duration-200"
            >
              Đang hoạt động
            </Link>
            <Link 
              href="/campaigns/completed"
              className="px-6 py-3 rounded-lg bg-green-600 text-white font-medium transition-all duration-200"
            >
              Đã hoàn thành
            </Link>
            <Link 
              href="/campaigns/ended"
              className="px-6 py-3 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 font-medium transition-all duration-200"
            >
              <span className="text-red-600">Đã kết thúc</span>
            </Link>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Các Chiến Dịch Đã Hoàn Thành
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            Những chiến dịch đã đạt được mục tiêu quyên góp và hoàn thành thành công nhờ sự đóng góp của cộng đồng.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-3xl font-bold text-green-600 mb-2">{totalCompleted}</div>
              <div className="text-gray-600">Chiến dịch hoàn thành</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {formatCurrency(totalRaised)}
              </div>
              <div className="text-gray-600">Tổng số tiền quyên góp</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
            {/* Search */}
            <form onSubmit={handleSearch} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Tìm kiếm
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm chiến dịch..."
                  className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="submit"
                  className="bg-orange-600 text-white px-4 py-2 rounded-r-md hover:bg-orange-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Danh mục
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Sắp xếp
              </label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="amount">Số tiền quyên góp</option>
                <option value="target">Mục tiêu</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Campaigns Grid */}
        {!error && (
          <>
            {campaigns.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="relative">
                      <CampaignCard campaign={campaign} />
                      {/* Completed Badge */}
                      <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                        ✓ Hoàn thành
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 rounded-md ${
                            currentPage === page
                              ? 'bg-orange-600 text-white'
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chưa có chiến dịch nào hoàn thành
                </h3>
                <p className="text-gray-600">
                  {searchQuery || selectedCategory !== 'all' 
                    ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                    : 'Hãy theo dõi các chiến dịch đang diễn ra để ủng hộ!'
                  }
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CompletedCampaignsPage;
