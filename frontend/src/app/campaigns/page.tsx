'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api, Campaign, Category } from '@/services/api';
import { formatCurrency } from '@/utils/format';

const CampaignsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await api.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setLoading(true);
        const { data, meta } = await api.getCampaigns({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          sort: sortBy,
          page: currentPage,
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
    loadCampaigns();
  }, [selectedCategory, sortBy, currentPage]);

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filter and Sort Section */}
      <div className="mb-8 flex flex-wrap gap-4 justify-between items-center">
        <div className="flex gap-4 items-center">
          <span className="text-gray-600">Danh mục:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="all">Tất cả</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-4 items-center">
          <span className="text-gray-600">Sắp xếp:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="amount">Số tiền quyên góp</option>
            <option value="deadline">Thời gian còn lại</option>
          </select>
        </div>
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Link
              key={campaign.id}
              href={`/campaigns/${campaign.slug}`}
              className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48">
                <Image
                  src={
                    campaign.images_url && campaign.images_url.length > 0
                      ? campaign.images_url[0]
                      : campaign.image_url
                      ? campaign.image_url
                      : '/images/placeholder.jpg'
                  }
                  alt={campaign.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  priority={false}
                  quality={75}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/placeholder.jpg';
                    target.onerror = null; // Prevent infinite error loop
                  }}
                />
                {campaign.is_featured && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-sm">
                    Nổi bật
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 line-clamp-2">{campaign.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{campaign.description}</p>
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${campaign.progress_percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{formatCurrency(campaign.current_amount)} / {formatCurrency(campaign.target_amount)}</span>
                    <span>{campaign.progress_percentage}%</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{campaign.days_remaining} ngày còn lại</span>
                    <span>{campaign.categories.map(c => c.name).join(', ')}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 rounded ${
                currentPage === i + 1
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignsPage;