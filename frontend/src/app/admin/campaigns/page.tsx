'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency, formatDate } from '@/utils/format';

interface Campaign {
  id: number;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  start_date: string;
  end_date: string;
  status: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  category: {
    id: number;
    name: string;
  };
  images: string[];
  image: string | null;
  image_url: string | null;
  images_url: string[];
  documents: {
    id: number;
    name: string;
    url: string;
  }[];
  created_at: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState({
    status: 'all',
    category: 'all',
    search: '',
  });

  useEffect(() => {
    fetchCampaigns();
  }, [filter]);

  const fetchCampaigns = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filter.status !== 'all') queryParams.append('status', filter.status);
      if (filter.category !== 'all') queryParams.append('category', filter.category);
      if (filter.search) queryParams.append('search', filter.search);

      const response = await fetch(`/api/admin/campaigns?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (campaignId: number) => {
    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}/approve`, {
        method: 'POST',
      });

      if (response.ok) {
        setCampaigns((prevCampaigns) =>
          prevCampaigns.map((campaign) =>
            campaign.id === campaignId ? { ...campaign, status: 'active' } : campaign
          )
        );
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error approving campaign:', error);
    }
  };

  const handleReject = async (campaignId: number, reason: string) => {
    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        setCampaigns((prevCampaigns) =>
          prevCampaigns.map((campaign) =>
            campaign.id === campaignId ? { ...campaign, status: 'rejected' } : campaign
          )
        );
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error rejecting campaign:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Đang hoạt động';
      case 'pending':
        return 'Chờ duyệt';
      case 'rejected':
        return 'Đã từ chối';
      case 'completed':
        return 'Đã hoàn thành';
      default:
        return status;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              >
                <option value="all">Tất cả</option>
                <option value="active">Đang hoạt động</option>
                <option value="pending">Chờ duyệt</option>
                <option value="rejected">Đã từ chối</option>
                <option value="completed">Đã hoàn thành</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Danh mục</label>
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                value={filter.category}
                onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              >
                <option value="all">Tất cả</option>
                {/* Add categories dynamically */}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tìm kiếm</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                placeholder="Tên chiến dịch, người tạo..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Campaigns Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chiến dịch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số tiền
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {campaign.images_url && campaign.images_url.length > 0 ? (
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={campaign.images_url[0]}
                              alt={campaign.title}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/placeholder.jpg';
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                              <FlagIcon className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{campaign.title}</div>
                          <div className="text-sm text-gray-500">{campaign.category.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{campaign.user.name}</div>
                      <div className="text-sm text-gray-500">{campaign.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          campaign.status
                        )}`}
                      >
                        {getStatusText(campaign.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-semibold">
                        {formatCurrency(campaign.current_amount)}
                      </div>
                      <div className="text-sm text-gray-500 mb-1">
                        / {formatCurrency(campaign.target_amount)}
                      </div>
                      {campaign.progress_percentage < 100 && (
                        <div className="text-xs text-orange-600">
                          Thiếu: {formatCurrency(campaign.target_amount - campaign.current_amount)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          setShowModal(true);
                        }}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Campaign Details Modal */}
      {showModal && selectedCampaign && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowModal(false)}
            />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Chi tiết chiến dịch
                    </h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Thông tin cơ bản</h4>
                        <div className="mt-2 space-y-2">
                          <p className="text-sm text-gray-900">Tên: {selectedCampaign.title}</p>
                          <p className="text-sm text-gray-900">
                            Danh mục: {selectedCampaign.category.name}
                          </p>
                          <p className="text-sm text-gray-900">
                            Người tạo: {selectedCampaign.user.name}
                          </p>
                          <p className="text-sm text-gray-900">
                            Mục tiêu: {formatCurrency(selectedCampaign.target_amount)}
                          </p>
                          <p className="text-sm text-gray-900">
                            Đã quyên góp: {formatCurrency(selectedCampaign.current_amount)}
                          </p>
                          {selectedCampaign.progress_percentage < 100 && (
                            <p className="text-sm text-orange-600 font-medium">
                              Còn thiếu: {formatCurrency(selectedCampaign.target_amount - selectedCampaign.current_amount)}
                            </p>
                          )}
                          <p className="text-sm text-gray-900">
                            Tiến độ: {selectedCampaign.progress_percentage.toFixed(2)}%
                          </p>
                          <p className="text-sm text-gray-900">
                            Thời gian: {formatDate(selectedCampaign.start_date)} -{' '}
                            {formatDate(selectedCampaign.end_date)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Mô tả</h4>
                        <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                          {selectedCampaign.description}
                        </p>
                      </div>

                      {selectedCampaign.images.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Hình ảnh</h4>
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            {(selectedCampaign.images_url || selectedCampaign.images).map((image, index) => (
                              <img
                                key={index}
                                src={selectedCampaign.images_url ? image : `http://localhost:8000/storage/${image.replace(/\\/g, '')}`}
                                alt={`Hình ảnh ${index + 1}`}
                                className="h-32 w-full rounded-lg object-cover"
                               onError={(e) => {
                                 const target = e.target as HTMLImageElement;
                                 target.src = '/images/placeholder.jpg';
                               }}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedCampaign.documents.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Tài liệu đính kèm</h4>
                          <div className="mt-2 space-y-2">
                            {selectedCampaign.documents.map((doc) => (
                              <a
                                key={doc.id}
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-sm text-orange-600 hover:text-orange-900"
                              >
                                {doc.name}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedCampaign.status === 'pending' && (
                        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                          <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={() => handleApprove(selectedCampaign.id)}
                          >
                            <CheckCircleIcon className="h-5 w-5 mr-2" />
                            Phê duyệt
                          </button>
                          <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:w-auto sm:text-sm"
                            onClick={() => {
                              const reason = prompt('Lý do từ chối:');
                              if (reason) {
                                handleReject(selectedCampaign.id, reason);
                              }
                            }}
                          >
                            <XCircleIcon className="h-5 w-5 mr-2" />
                            Từ chối
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setShowModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
} 