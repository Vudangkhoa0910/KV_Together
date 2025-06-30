'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CampaignCard } from '@/components/campaigns/CampaignCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Campaign } from '@/services/api';

interface EndedCampaignsResponse {
  data: Campaign[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'amount', label: 'Số tiền cao nhất' },
  { value: 'progress', label: 'Tiến độ cao nhất' },
];

export default function EndedCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCampaigns, setTotalCampaigns] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');

  const loadCampaigns = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        per_page: '9',
        page: page.toString(),
        ...(search && { search }),
        ...(sort && { sort }),
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campaigns/ended?${params}`);
      
      if (!response.ok) {
        throw new Error('Không thể tải danh sách chiến dịch');
      }

      const data: EndedCampaignsResponse = await response.json();
      
      setCampaigns(data.data || []);
      setCurrentPage(data.meta?.current_page || 1);
      setTotalPages(data.meta?.last_page || 1);
      setTotalCampaigns(data.meta?.total || 0);
    } catch (err) {
      console.error('Error loading ended campaigns:', err);
      setError('Có lỗi xảy ra khi tải danh sách chiến dịch đã kết thúc');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns(currentPage);
  }, [currentPage, search, sort]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadCampaigns(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Đang tải chiến dịch đã kết thúc..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-2">Có lỗi xảy ra</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={() => loadCampaigns(currentPage)}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              className="px-6 py-3 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 font-medium transition-all duration-200"
            >
              Đã hoàn thành
            </Link>
            <Link 
              href="/campaigns/ended"
              className="px-6 py-3 rounded-lg bg-red-600 text-white font-medium transition-all duration-200"
            >
              Đã kết thúc
            </Link>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Chiến dịch đã kết thúc
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Danh sách các chiến dịch đã kết thúc, bao gồm thành công, thất bại và hoàn thành một phần
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tìm kiếm
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm chiến dịch..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sắp xếp
                </label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Tìm kiếm
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Kết quả ({totalCampaigns} chiến dịch)
            </h2>
          </div>
        </div>

        {/* Campaigns Grid */}
        {!error && (
          <>
            {campaigns.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="relative">
                      <CampaignCard campaign={campaign} />
                      {/* Ended Badge */}
                      <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                        ✗ Đã kết thúc
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
                              ? 'bg-red-600 text-white'
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
                      Tiếp
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chưa có chiến dịch nào đã kết thúc
                </h3>
                <p className="text-gray-600">
                  {search 
                    ? 'Thử thay đổi từ khóa tìm kiếm'
                    : 'Chưa có chiến dịch nào kết thúc'
                  }
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
