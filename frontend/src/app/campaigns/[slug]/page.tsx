'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { api, Campaign } from '@/services/api';
import { formatCurrency, formatDate, formatTimeLeft } from '@/utils/format';
import { useAuth } from '@/contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-hot-toast';
import VietQRDonation from '@/components/donations/VietQRDonation';
import Progress from '@/components/Progress';
import ShareModal from '@/components/modals/ShareModal';
import DonationCertificate from '@/components/donations/DonationCertificate';
import type { Donation, DonationResponse } from '@/types/donation';
import '@/styles/campaign-details.css';

const CampaignDetails = () => {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const slug = params?.slug as string;
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number>(100000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donationMessage, setDonationMessage] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [donating, setDonating] = useState(false);
  const [showVietQR, setShowVietQR] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('bank_transfer');
  const [amountError, setAmountError] = useState<string>('');

  // Debug logging for state changes
  useEffect(() => {
    console.log('State change - showVietQR:', showVietQR, 'paymentInfo:', !!paymentInfo);
  }, [showVietQR, paymentInfo]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showAllDonations, setShowAllDonations] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [currentDonation, setCurrentDonation] = useState<Donation | null>(null);

  const suggestedAmounts = [50000, 100000, 200000, 500000]; // Điều chỉnh để phù hợp với số tiền tối thiểu 20k

  useEffect(() => {
    const loadCampaign = async () => {
      try {
        setLoading(true);
        const data = await api.getCampaignBySlug(slug);
        setCampaign(data);
        setError(null);
      } catch (err) {
        setError('Không thể tải thông tin chiến dịch');
        console.error('Failed to load campaign:', err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) {
      loadCampaign();
    }
  }, [slug]);

  // Check if campaign is completed and show appropriate message
  const checkCampaignStatus = () => {
    if (!campaign) return null;
    
    if (campaign.status === 'completed') {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-green-800">🎉 Chiến dịch đã hoàn thành!</h3>
              <p className="text-green-700">
                Cảm ơn sự đóng góp của tất cả mọi người. Chiến dịch đã nhận được {formatCurrency(campaign.current_amount)}.
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    if (campaign.days_remaining <= 3 && campaign.days_remaining > 0) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">⏰ Chiến dịch sắp kết thúc!</h3>
              <p className="text-yellow-700">
                Chỉ còn {campaign.days_remaining} ngày để góp phần vào chiến dịch ý nghĩa này.
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  // Handle donation logic
  const handleDonate = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để quyên góp');
      router.push('/auth/login');
      return;
    }

    if (!campaign) return;

    // Clear any previous amount errors
    setAmountError('');

    // Calculate the final amount - prioritize custom amount if entered
    let finalAmount = 0;
    if (customAmount && customAmount.trim()) {
      // Remove formatting and convert to number
      const numericAmount = parseInt(customAmount.replace(/[^0-9]/g, ''));
      console.log('Custom amount entered:', customAmount, 'parsed to:', numericAmount);
      if (!numericAmount || isNaN(numericAmount)) {
        setAmountError('Vui lòng nhập số tiền hợp lệ');
        toast.error('Vui lòng nhập số tiền hợp lệ');
        return;
      }
      finalAmount = numericAmount;
    } else if (selectedAmount) {
      finalAmount = selectedAmount;
    }

    console.log('Final amount calculated:', finalAmount);
    console.log('Donation message:', donationMessage);

    if (!finalAmount || finalAmount < 20000) {
      console.log('Amount validation failed:', { finalAmount, isLessThan20k: finalAmount < 20000 });
      setAmountError('Số tiền quyên góp tối thiểu là 20,000 VNĐ');
      toast.error('Số tiền quyên góp tối thiểu là 20,000 VNĐ');
      return;
    }

    // Kiểm tra không vượt quá số tiền còn thiếu - Bỏ check này để cho phép ủng hộ vượt quá
    // const remainingAmount = campaign.target_amount - campaign.current_amount;
    // if (finalAmount > remainingAmount) {
    //   setAmountError(`Số tiền vượt quá số tiền còn thiếu. Chiến dịch chỉ còn cần ${formatCurrency(remainingAmount)}`);
    //   toast.error(`Chiến dịch chỉ còn cần ${formatCurrency(remainingAmount)} để đạt mục tiêu`);
    //   return;
    // }

    if (!paymentMethod) {
      toast.error('Vui lòng chọn phương thức thanh toán');
      return;
    }

    try {
      setDonating(true);
      console.log('Donating with params:', { 
        campaignSlug: campaign.slug, 
        amount: finalAmount, 
        message: donationMessage, 
        paymentMethod 
      });

      const response: DonationResponse = await api.donate(
        campaign.slug, 
        finalAmount, 
        donationMessage, 
        paymentMethod
      );
      
      console.log('Donation response received:', response);

      if (paymentMethod === 'bank_transfer' && response.payment_info) {
        console.log('Setting up VietQR modal with payment info:', response.payment_info);
        console.log('QR URL from response:', response.payment_info.qr_url);
        setPaymentInfo(response.payment_info);
        
        // Create a temporary donation object for certificate display
        const tempDonation: Donation = {
          id: Date.now().toString(), // Temporary ID
          amount: finalAmount,
          message: donationMessage,
          created_at: new Date().toISOString(),
          status: 'pending',
          is_anonymous: false,
          payment_method: 'bank_transfer',
          campaign: {
            id: campaign.id.toString(),
            title: campaign.title,
            organizer: {
              name: campaign.organizer?.name || 'KV Together'
            }
          },
          donor: {
            id: user?.id?.toString() || '1',
            name: user?.name || 'Người quyên góp'
          }
        };
        setCurrentDonation(tempDonation);
        
        setShowVietQR(true);
        console.log('VietQR modal should be visible now, showVietQR:', true);
      } else if (response.payment_url) {
        console.log('Redirecting to payment URL:', response.payment_url);
        window.location.href = response.payment_url;
      } else {
        console.error('No payment_info or payment_url in response:', response);
      }
      
    } catch (err: any) {
      console.error('Failed to donate:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi quyên góp';
      toast.error(errorMessage);
    } finally {
      setDonating(false);
      console.log('Donation process completed, donating state reset to false');
    }
  };

  const handleShare = (platform: 'facebook' | 'twitter') => {
    const url = window.location.href;
    const text = `Cùng chung tay ủng hộ chiến dịch "${campaign?.title}" tại KV Together`;
    
    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const displayedDonations = useMemo(() => {
    if (!campaign?.donations) return [];
    return showAllDonations ? campaign.donations : campaign.donations.slice(0, 5);
  }, [campaign?.donations, showAllDonations]);

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    console.log('Custom amount input changed:', e.target.value, '→ processed:', value);
    
    // Clear previous error
    setAmountError('');
    
    if (value) {
      const numericValue = parseInt(value);
      
      // Validate amount in real-time and set error message
      if (numericValue < 20000) {
        setAmountError('Số tiền quyên góp tối thiểu là 20,000 VNĐ');
        console.log('Amount below minimum (20,000), showing error message');
      } else if (campaign) {
        // Bỏ check vượt quá số tiền còn thiếu để cho phép ủng hộ tự do
        // const remainingAmount = campaign.target_amount - campaign.current_amount;
        // if (numericValue > remainingAmount) {
        //   setAmountError(`Số tiền vượt quá số tiền còn thiếu. Chiến dịch chỉ còn cần ${formatCurrency(remainingAmount)}`);
        //   console.log('Amount exceeds remaining amount:', { numericValue, remainingAmount });
        // }
      }
      
      const formattedValue = numericValue.toLocaleString('vi-VN');
      console.log('Setting custom amount to:', formattedValue);
      setCustomAmount(formattedValue);
      setSelectedAmount(0); // Clear selected amount when custom amount is entered
    } else {
      console.log('Clearing custom amount');
      setCustomAmount('');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="campaign-skeleton">
            <div className="skeleton-shine">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="h-[400px] bg-gray-200 rounded-lg mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
                <div className="bg-white rounded-lg p-6 h-[400px]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">
            {error || 'Không tìm thấy chiến dịch'}
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Campaign Status Alert */}
        {checkCampaignStatus()}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Image Gallery */}
            <div>
              <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
                <Image
                  src={campaign.image_url || (Array.isArray(campaign.images) ? campaign.images[selectedImage] : null) || '/images/placeholder.jpg'}
                  alt={campaign.title}
                  fill
                  className="object-cover cursor-pointer"
                  onClick={() => Array.isArray(campaign.images) && setZoomedImage(campaign.images[selectedImage])}
                />
              </div>

              {Array.isArray(campaign.images) && campaign.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {campaign.images.map((image, index) => (
                    <div
                      key={index}
                      className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer ${
                        selectedImage === index ? 'ring-2 ring-orange-500' : ''
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <Image
                        src={image}
                        alt={`${campaign.title} - ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Campaign Info */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">Thông tin chiến dịch</h2>
              <div className="prose max-w-none">
                <ReactMarkdown>{campaign.description}</ReactMarkdown>
              </div>
            </div>

            {/* Donations List */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Danh sách quyên góp</h2>
                <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-full font-medium">
                  {campaign.donations?.length || 0} lượt quyên góp
                </div>
              </div>

              <div className="space-y-4">
                {displayedDonations.map((donation, index) => (
                  <div
                    key={donation.id}
                    className="bg-white p-4 rounded-lg shadow-sm"
                    style={{ animation: `fadeIn 0.5s ease forwards ${index * 0.1}s` }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{donation.donor?.name || 'Nhà hảo tâm'}</p>
                        <p className="text-sm text-gray-500">{formatDate(donation.created_at)}</p>
                      </div>
                      <p className="font-semibold text-orange-600">{formatCurrency(donation.amount)}</p>
                    </div>
                    {donation.message && (
                      <p className="mt-2 text-gray-700">{donation.message}</p>
                    )}
                  </div>
                ))}
              </div>

              {campaign.donations && campaign.donations.length > 5 && (
                <button
                  onClick={() => setShowAllDonations(!showAllDonations)}
                  className="mt-6 w-full py-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
                >
                  {showAllDonations ? 'Thu gọn' : 'Xem tất cả'}
                </button>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              {/* Progress Bar */}
              <div className="mb-6">
                <Progress value={campaign.current_amount} max={campaign.target_amount} />
                <div className="mt-4 flex justify-between items-end">
                  <div>
                    <p className="text-sm text-gray-600">Đã quyên góp được</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatCurrency(campaign.current_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mục tiêu</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {formatCurrency(campaign.target_amount)}
                    </p>
                  </div>
                </div>
                
                {/* Remaining amount needed */}
                {campaign.progress_percentage < 100 && (
                  <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-orange-600 font-medium">Còn thiếu để đạt mục tiêu</p>
                        <p className="text-xl font-bold text-orange-700">
                          {formatCurrency(campaign.target_amount - campaign.current_amount)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-orange-600">Đã đạt được</p>
                        <p className="text-lg font-semibold text-orange-700">
                          {campaign.progress_percentage.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Donation Form or Login Prompt */}
              {!isAuthenticated ? (
                <div className="space-y-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-orange-800">Yêu cầu đăng nhập</h3>
                        <div className="mt-2 text-sm text-orange-700">
                          <p>Vui lòng đăng nhập để thực hiện quyên góp và nhận các đặc quyền:</p>
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Chứng chỉ quyên góp điện tử</li>
                            <li>Huy hiệu người quyên góp</li>
                            <li>Theo dõi lịch sử quyên góp</li>
                            <li>Chia sẻ thành tích quyên góp</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/auth/login')}
                    className="w-full py-4 rounded-lg font-medium text-white bg-orange-600 hover:bg-orange-700 transition-all flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Đăng nhập để quyên góp
                  </button>
                </div>
              ) : campaign.status === 'completed' || campaign.current_amount >= campaign.target_amount ? (
                /* Campaign Completed State */
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <div className="flex items-center justify-center mb-4">
                      <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-green-800 mb-2">Chiến dịch đã hoàn thành!</h3>
                    <p className="text-green-700 mb-4">
                      Cảm ơn tất cả những người đã đóng góp. Chiến dịch đã đạt được mục tiêu {formatCurrency(campaign.target_amount)}.
                    </p>
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Tổng đã quyên góp:</span>
                        <span className="font-semibold text-green-800">{formatCurrency(campaign.current_amount)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-2">
                        <span className="text-gray-600">Số người đóng góp:</span>
                        <span className="font-semibold text-green-800">{campaign.donations_count || 0} người</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <button
                      onClick={() => router.push('/campaigns')}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Xem các chiến dịch khác
                    </button>
                  </div>
                </div>
              ) : (
                /* Active Campaign Donation Form */
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Số tiền quyên góp</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {suggestedAmounts.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => {
                            setSelectedAmount(amount);
                            setCustomAmount('');
                            setAmountError(''); // Clear any amount errors
                          }}
                          className={`p-4 rounded-lg font-medium transition-all ${
                            selectedAmount === amount && !customAmount
                              ? 'bg-orange-600 text-white'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          {formatCurrency(amount)}
                        </button>
                      ))}
                    </div>

                    <div className="mt-4">
                      <input
                        type="text"
                        value={customAmount}
                        onChange={handleCustomAmountChange}
                        placeholder="Hoặc nhập số tiền khác..."
                        className={`w-full p-4 border rounded-lg focus:ring-2 focus:ring-orange-500 transition-colors ${
                          amountError 
                            ? 'border-red-300 focus:border-red-500 bg-red-50' 
                            : 'border-gray-200 focus:border-orange-500'
                        }`}
                      />
                      {amountError && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {amountError}
                        </p>
                      )}
                      <div className="mt-2 flex justify-between text-xs text-gray-500">
                        <span>Số tiền tối thiểu: 20,000 VNĐ</span>
                        <span>Tối đa: {formatCurrency(campaign.target_amount - campaign.current_amount)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Lời nhắn</h3>
                    <textarea
                      value={donationMessage}
                      onChange={(e) => setDonationMessage(e.target.value)}
                      placeholder="Gửi lời nhắn đến người gây quỹ..."
                      rows={3}
                      className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Phương thức thanh toán</h3>
                    <div className="space-y-3">
                      <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bank_transfer"
                          checked={paymentMethod === 'bank_transfer'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-3 text-orange-600 focus:ring-orange-500"
                        />
                        <div>
                          <div className="font-medium">Chuyển khoản ngân hàng</div>
                          <div className="text-sm text-gray-500">Quét mã QR để chuyển khoản nhanh chóng</div>
                        </div>
                      </label>
                      
                      <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="momo"
                          checked={paymentMethod === 'momo'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-3 text-orange-600 focus:ring-orange-500"
                        />
                        <div>
                          <div className="font-medium">Ví MoMo</div>
                          <div className="text-sm text-gray-500">Thanh toán qua ví điện tử MoMo</div>
                        </div>
                      </label>
                      
                      <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="vnpay"
                          checked={paymentMethod === 'vnpay'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-3 text-orange-600 focus:ring-orange-500"
                        />
                        <div>
                          <div className="font-medium">VNPay</div>
                          <div className="text-sm text-gray-500">Thanh toán qua cổng VNPay</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleDonate}
                    disabled={donating}
                    className={`w-full py-4 rounded-lg font-medium text-white transition-all
                      ${donating ? 'bg-orange-400' : 'bg-orange-600 hover:bg-orange-700'}`}
                  >
                    {donating ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Đang xử lý...
                      </div>
                    ) : (
                      'Quyên góp ngay'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          onShare={handleShare}
          onCopyLink={handleCopyLink}
          isCopied={isCopied}
        />

        {showCertificate && currentDonation && (
          <DonationCertificate
            isOpen={showCertificate}
            onClose={() => setShowCertificate(false)}
            donation={currentDonation}
          />
        )}

        {showVietQR && paymentInfo && (
          <>
            {console.log('Rendering VietQR modal', { showVietQR, paymentInfo })}
            <VietQRDonation
              paymentInfo={paymentInfo}
              onClose={() => {
                console.log('VietQR modal onClose called');
                setShowVietQR(false);
              }}
              onPaymentConfirmed={() => {
                console.log('Payment confirmed, showing certificate');
                setShowVietQR(false);
                setShowCertificate(true);
                // Show success toast
                toast.success('Quyên góp thành công! Cảm ơn bạn đã đóng góp');
                
                // Refresh campaign data
                if (slug) {
                  api.getCampaignBySlug(slug).then(data => {
                    setCampaign(data);
                  });
                }
              }}
            />
          </>
        )}

        {console.log('VietQR render check:', { showVietQR, hasPaymentInfo: !!paymentInfo })}

        {zoomedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
            onClick={() => setZoomedImage(null)}
          >
            <Image
              src={zoomedImage}
              alt="Zoomed image"
              width={1200}
              height={800}
              className="max-h-[90vh] w-auto object-contain cursor-zoom-out"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignDetails;