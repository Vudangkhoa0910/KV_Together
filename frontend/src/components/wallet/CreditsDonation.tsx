'use client';

import { useState, useEffect } from 'react';
import { 
  CreditCardIcon,
  WalletIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { walletApi } from '@/services/api';

interface CreditsDonationProps {
  campaign: {
    id: number;
    title: string;
    target_amount: number;
    current_amount: number;
    status: string;
  };
  onSuccess?: () => void;
}

interface WalletData {
  balance: number;
  formatted_balance: string;
  tier: string;
  tier_display_name: string;
  tier_benefits: {
    transaction_fee_discount: number;
  };
}

export default function CreditsDonation({ campaign, onSuccess }: CreditsDonationProps) {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDonating, setIsDonating] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showDonationForm, setShowDonationForm] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const response = await walletApi.getWallet();
      if (response.data.success) {
        setWalletData(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching wallet data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletData || !donationAmount) return;

    const amount = parseFloat(donationAmount);
    if (amount <= 0) {
      alert('Số tiền ủng hộ phải lớn hơn 0');
      return;
    }

    if (amount > walletData.balance) {
      alert('Số dư Credits không đủ');
      return;
    }

    setIsDonating(true);
    try {
      const response = await walletApi.useCredits({
        campaign_id: campaign.id,
        amount: amount,
        message: message || undefined,
        is_anonymous: isAnonymous
      });

      if (response.data.success) {
        alert(response.data.message || 'Cảm ơn bạn đã ủng hộ chiến dịch bằng KV Credits thiện nguyện!');
        setShowDonationForm(false);
        setDonationAmount('');
        setMessage('');
        setIsAnonymous(false);
        fetchWalletData(); // Refresh wallet data
        onSuccess?.();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi ủng hộ');
    } finally {
      setIsDonating(false);
    }
  };

  const suggestedAmounts = [10000, 50000, 100000, 500000];

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!walletData || walletData.balance <= 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-center text-gray-500">
          <WalletIcon className="h-5 w-5 mr-2" />
          <span className="text-sm">Bạn chưa có Credits để ủng hộ</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Credits sẽ được cấp khi chiến dịch bạn ủng hộ không thành công
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {!showDonationForm ? (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                <CreditCardIcon className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Ủng hộ bằng KV Credits thiện nguyện</h3>
                <p className="text-sm text-gray-600">
                  Số dư: <span className="font-medium text-orange-600">{walletData.formatted_balance}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Hạng {walletData.tier_display_name}</div>
              {walletData.tier_benefits.transaction_fee_discount > 0 && (
                <div className="text-xs text-green-600">
                  Giảm {walletData.tier_benefits.transaction_fee_discount}% phí
                </div>
              )}
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <CheckCircleIcon className="h-5 w-5 text-orange-600 mr-2 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-orange-800 mb-1">Ưu điểm ủng hộ bằng Credits:</p>
                <ul className="text-orange-700 text-xs space-y-1">
                  <li>• Không mất phí giao dịch</li>
                  <li>• Xử lý ngay lập tức</li>
                  <li>• Hỗ trợ phát triển cộng đồng</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowDonationForm(true)}
            className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            Ủng hộ bằng Credits
          </button>
        </div>
      ) : (
        <form onSubmit={handleDonation} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Ủng hộ bằng KV Credits thiện nguyện</h3>
            <button
              type="button"
              onClick={() => setShowDonationForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Số lượng Credits
              </label>
              <span className="text-xs text-gray-500">
                Có sẵn: {walletData.formatted_balance}
              </span>
            </div>
            <input
              type="number"
              min="1000"
              max={walletData.balance}
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder="Nhập số Credits muốn ủng hộ"
              required
            />
            
            {/* Suggested amounts */}
            <div className="mt-2 flex flex-wrap gap-2">
              {suggestedAmounts
                .filter(amount => amount <= walletData.balance)
                .map(amount => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setDonationAmount(amount.toString())}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  {new Intl.NumberFormat('vi-VN').format(amount)}
                </button>
              ))}
              {walletData.balance >= 10000 && (
                <button
                  type="button"
                  onClick={() => setDonationAmount(walletData.balance.toString())}
                  className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors"
                >
                  Tất cả
                </button>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lời nhắn (tùy chọn)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              rows={3}
              placeholder="Chia sẻ lời động viên cho chiến dịch..."
              maxLength={500}
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-gray-700">Ủng hộ ẩn danh</span>
            </label>
          </div>

          {parseFloat(donationAmount) > walletData.balance && (
            <div className="mb-4 p-3 bg-red-50 rounded-md">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-sm text-red-800">
                  Số Credits không đủ. Bạn có thể ủng hộ tối đa {walletData.formatted_balance}
                </span>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setShowDonationForm(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isDonating || !donationAmount || parseFloat(donationAmount) > walletData.balance}
              className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDonating ? 'Đang xử lý...' : 'Xác nhận ủng hộ'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
