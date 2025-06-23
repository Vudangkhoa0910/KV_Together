'use client';

import { useState, useEffect } from 'react';
import { 
  WalletIcon,
  CreditCardIcon,
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
  GiftIcon,
  TrophyIcon,
  ChartBarIcon,
  EyeIcon,
  PlusIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { api, walletApi } from '@/services/api';

interface WalletData {
  balance: number;
  formatted_balance: string;
  total_earned: number;
  total_spent: number;
  tier: string;
  tier_display_name: string;
  tier_benefits: {
    transaction_fee_discount: number;
    priority_support: boolean;
    beta_access: boolean;
    consultation: boolean;
  };
  last_activity: string | null;
}

interface Transaction {
  id: number;
  type: string;
  display_type: string;
  amount: number;
  formatted_amount: string;
  description: string;
  source_type: string;
  display_source_type: string;
  balance_before: number;
  balance_after: number;
  created_at: string;
  metadata: any;
}

interface WalletStats {
  current_balance: number;
  formatted_balance: string;
  total_earned: number;
  total_spent: number;
  monthly_earnings: number;
  monthly_spending: number;
  tier: string;
  tier_display_name: string;
  tier_benefits: any;
  top_spending_categories: Array<{
    category: string;
    display_name: string;
    amount: number;
    formatted_amount: string;
  }>;
  transactions_count: number;
}

export default function VirtualWalletDashboard() {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'statistics'>('overview');

  useEffect(() => {
    fetchWalletData();
    fetchTransactions();
    fetchWalletStats();
  }, []);

  // Auto-set admin token for development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const token = localStorage.getItem('token');
      if (!token) {
        import('@/utils/dev-tokens').then(({ ADMIN_TOKEN }) => {
          localStorage.setItem('token', ADMIN_TOKEN);
          console.log('🔧 Auto-set admin token for development');
        });
      }
    }
  }, []);

  const fetchWalletData = async () => {
    try {
      const response = await walletApi.getWallet();
      if (response.data.success) {
        setWalletData(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError('Không thể tải thông tin ví');
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await walletApi.getTransactions({ per_page: 10 });
      if (response.data.success) {
        setTransactions(response.data.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const fetchWalletStats = async () => {
    try {
      const response = await walletApi.getStatistics();
      if (response.data.success) {
        setWalletStats(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching wallet stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'from-purple-400 to-purple-600';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'silver': return 'from-gray-300 to-gray-500';
      default: return 'from-orange-400 to-orange-600';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum': return '💎';
      case 'gold': return '🏆';
      case 'silver': return '🥈';
      default: return '🥉';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin ví...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <WalletIcon className="h-8 w-8 mr-3 text-orange-600" />
            Ví thiện nguyện KV Credits
          </h1>
          <p className="mt-2 text-gray-600">
            Quản lý Credits thiện nguyện của bạn và ủng hộ các chiến dịch từ thiện
          </p>
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Lưu ý:</strong> KV Credits là ví ảo dành riêng cho mục đích thiện nguyện. 
              Credits chỉ có thể sử dụng để ủng hộ các chiến dịch từ thiện và không thể chuyển đổi thành tiền mặt.
            </p>
          </div>
        </div>

        {/* Wallet Overview Card */}
        <div className={`bg-gradient-to-r ${getTierColor(walletData?.tier || 'bronze')} rounded-2xl p-6 text-white mb-8 shadow-lg`}>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">{getTierIcon(walletData?.tier || 'bronze')}</span>
                <span className="text-lg font-medium opacity-90">
                  Hạng {walletData?.tier_display_name}
                </span>
              </div>
              <div className="text-4xl font-bold mb-1">
                {walletData?.formatted_balance || '0 Credits'}
              </div>
              <div className="text-sm opacity-80">
                Số dư hiện tại
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-80">
                Dành cho thiện nguyện
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white border-opacity-20">
            <div>
              <div className="text-2xl font-semibold">
                {new Intl.NumberFormat('vi-VN').format(walletData?.total_earned || 0)}
              </div>
              <div className="text-sm opacity-80">Tổng đã nhận</div>
            </div>
            <div>
              <div className="text-2xl font-semibold">
                {new Intl.NumberFormat('vi-VN').format(walletData?.total_spent || 0)}
              </div>
              <div className="text-sm opacity-80">Tổng đã chi tiêu</div>
            </div>
          </div>
        </div>

        {/* Disclaimer về bản chất thiện nguyện */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-600 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-green-800 mb-2">
                Thông tin quan trọng về KV Credits thiện nguyện
              </h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• KV Credits là ví ảo dành riêng cho hoạt động thiện nguyện, không mang tính thương mại</li>
                <li>• Credits <strong>không thể chuyển đổi thành tiền mặt</strong> hoặc sử dụng cho mục đích khác ngoài từ thiện</li>
                <li>• Chỉ được sử dụng để ủng hộ các chiến dịch thiện nguyện được xác minh trên nền tảng</li>
                <li>• Việc tích lũy Credits nhằm khuyến khích sự tham gia lâu dài vào hoạt động thiện nguyện</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Thông tin hạng thành viên thiện nguyện */}
        {walletData?.tier && (
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <TrophyIcon className="h-6 w-6 mr-2 text-orange-600" />
              Hạng thành viên thiện nguyện: {walletData.tier_display_name}
            </h2>
            <div className="flex items-center space-x-4">
              <div className="text-3xl">{getTierIcon(walletData.tier)}</div>
              <div>
                <p className="text-gray-600">
                  Cảm ơn bạn đã tham gia tích cực vào các hoạt động thiện nguyện trên nền tảng. 
                  Hạng thành viên thể hiện mức độ đóng góp của bạn cho cộng đồng.
                </p>
                <div className="mt-2 text-sm text-gray-500">
                  Tổng đã ủng hộ: <span className="font-medium text-orange-600">
                    {new Intl.NumberFormat('vi-VN').format(walletData.total_spent)} Credits
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { key: 'overview', label: 'Tổng quan', icon: WalletIcon },
              { key: 'transactions', label: 'Lịch sử giao dịch', icon: ArrowRightIcon },
              { key: 'statistics', label: 'Thống kê', icon: ChartBarIcon }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center px-3 py-2 font-medium text-sm rounded-md transition-colors ${
                  activeTab === key
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Lịch sử giao dịch gần đây</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <div key={transaction.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                          transaction.type.includes('earn') || transaction.type.includes('transfer_in') || transaction.type.includes('bonus')
                            ? 'bg-green-100'
                            : 'bg-red-100'
                        }`}>
                          {transaction.type.includes('earn') || transaction.type.includes('transfer_in') || transaction.type.includes('bonus') ? (
                            <ArrowDownLeftIcon className="h-5 w-5 text-green-600" />
                          ) : (
                            <ArrowUpRightIcon className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.display_type}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.description}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(transaction.created_at).toLocaleString('vi-VN')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-semibold ${
                          transaction.type.includes('earn') || transaction.type.includes('transfer_in') || transaction.type.includes('bonus')
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {transaction.formatted_amount}
                        </div>
                        <div className="text-xs text-gray-500">
                          Số dư: {new Intl.NumberFormat('vi-VN').format(transaction.balance_after)} Credits
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  Chưa có giao dịch nào
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'statistics' && walletStats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Stats */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Thống kê tháng này</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Credits nhận được</span>
                  <span className="font-semibold text-green-600">
                    +{new Intl.NumberFormat('vi-VN').format(walletStats.monthly_earnings)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Credits đã chi tiêu</span>
                  <span className="font-semibold text-red-600">
                    -{new Intl.NumberFormat('vi-VN').format(walletStats.monthly_spending)}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tổng giao dịch</span>
                    <span className="font-semibold">
                      {walletStats.transactions_count}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Spending Categories */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Chi tiêu theo danh mục</h3>
              <div className="space-y-3">
                {walletStats.top_spending_categories.length > 0 ? (
                  walletStats.top_spending_categories.map((category, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-600">{category.display_name}</span>
                      <span className="font-semibold text-red-600">
                        {category.formatted_amount}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Chưa có dữ liệu chi tiêu</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hành động chính */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GiftIcon className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ủng hộ chiến dịch thiện nguyện</h3>
              <p className="text-gray-600 mb-4">Sử dụng Credits để ủng hộ các chiến dịch từ thiện đang cần hỗ trợ</p>
              <button 
                onClick={() => window.location.href = '/campaigns'}
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
              >
                Khám phá chiến dịch
              </button>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Lịch sử đóng góp</h3>
              <p className="text-gray-600 mb-4">Xem lại các chiến dịch bạn đã ủng hộ và tác động đã tạo ra</p>
              <button 
                onClick={() => setActiveTab('transactions')}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Xem lịch sử
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
