'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, type Donation } from '@/services/api';
import { HeartIcon, CalendarIcon, CreditCardIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/solid';

export default function UserDonationsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDonations();
    }
  }, [isAuthenticated, user]);

  const fetchDonations = async () => {
    try {
      setIsLoading(true);
      const response = await api.getUserDonations({ 
        page: 1,
        status: filter !== 'all' ? filter : undefined 
      });
      setDonations(response.data);
    } catch (error) {
      console.error('Failed to fetch donations:', error);
      setDonations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'credits':
        return <CreditCardIcon className="h-5 w-5 text-orange-600" />;
      case 'vnpay':
      case 'momo':
      case 'bank_transfer':
        return <BanknotesIcon className="h-5 w-5 text-green-600" />;
      default:
        return <BanknotesIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPaymentMethodName = (method: string) => {
    const methodMap: { [key: string]: string } = {
      'credits': 'KV Credits thiện nguyện',
      'vnpay': 'VNPay',
      'momo': 'MoMo',
      'bank_transfer': 'Chuyển khoản ngân hàng'
    };
    return methodMap[method] || method;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusName = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'completed': 'Thành công',
      'pending': 'Đang xử lý',
      'failed': 'Thất bại'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'completed': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'failed': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredDonations = donations.filter(donation => {
    if (filter === 'all') return true;
    return donation.status === filter;
  });

  const totalAmount = donations
    .filter(d => d.status === 'completed')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalDonations = donations.filter(d => d.status === 'completed').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vui lòng đăng nhập</h1>
          <p className="text-gray-600">Bạn cần đăng nhập để xem lịch sử đóng góp.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <HeartIcon className="h-8 w-8 mr-3 text-red-600" />
            Lịch sử đóng góp
          </h1>
          <p className="mt-2 text-gray-600">Theo dõi các khoản đóng góp thiện nguyện của bạn</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <HeartIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng đóng góp</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat('vi-VN').format(totalAmount)} VND
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Số lần đóng góp</p>
                <p className="text-2xl font-bold text-gray-900">{totalDonations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <CreditCardIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Chiến dịch ủng hộ</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(donations.map(d => d.campaign.id)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Tất cả' },
              { key: 'completed' as const, label: 'Thành công' },
              { key: 'pending' as const, label: 'Đang xử lý' },
              { key: 'failed' as const, label: 'Thất bại' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as typeof filter)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Donations List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
            </div>
          ) : filteredDonations.length === 0 ? (
            <div className="p-8 text-center">
              <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có đóng góp nào</h3>
              <p className="text-gray-600">Hãy bắt đầu ủng hộ các chiến dịch thiện nguyện!</p>
              <a
                href="/campaigns"
                className="inline-block mt-4 px-6 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
              >
                Khám phá chiến dịch
              </a>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredDonations.map((donation) => (
                <div key={donation.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <a
                          href={`/campaigns/${donation.campaign.slug}`}
                          className="text-lg font-medium text-gray-900 hover:text-orange-600 transition-colors"
                        >
                          {donation.campaign.title}
                        </a>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(donation.status)}`}>
                          {getStatusName(donation.status)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          {getPaymentMethodIcon(donation.payment_method)}
                          <span>{getPaymentMethodName(donation.payment_method)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>
                            {new Date(donation.created_at).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        {donation.transaction_id && (
                          <div className="text-xs text-gray-500">
                            ID: {donation.transaction_id}
                          </div>
                        )}
                      </div>
                      
                      {donation.message && (
                        <p className="text-sm text-gray-700 italic">"{donation.message}"</p>
                      )}
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="text-xl font-bold text-gray-900">
                        {new Intl.NumberFormat('vi-VN').format(donation.amount)} 
                        {donation.payment_method === 'credits' ? ' Credits' : ' VND'}
                      </div>
                      <div className="flex items-center justify-end mt-1">
                        {getStatusIcon(donation.status)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
