import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatCurrency } from '@/utils/format';
import toast from 'react-hot-toast';

interface VietQRDonationProps {
  paymentInfo: {
    bank_id?: string;
    bank_name: string;
    account_number: string;
    account_name: string;
    amount: number;
    transaction_id?: string;
    transaction_code?: string; // Backend sometimes returns this instead
    message: string;
    qr_url: string;
  };
  onClose: () => void;
  onPaymentConfirmed: () => void; // New callback for when payment is confirmed
}

const VietQRDonation: React.FC<VietQRDonationProps> = ({ paymentInfo, onClose, onPaymentConfirmed }) => {
  const [imageError, setImageError] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [canConfirm, setCanConfirm] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanConfirm(true);
    }
  }, [countdown]);

  const handleConfirmPayment = () => {
    onPaymentConfirmed();
  };

  console.log('VietQRDonation component rendering with:', paymentInfo);

  // Handle both transaction_id and transaction_code from backend
  const transactionCode = paymentInfo.transaction_id || paymentInfo.transaction_code || '';

  console.log('VietQRDonation received payment info:', paymentInfo);
  console.log('QR URL:', paymentInfo.qr_url);
  console.log('Transaction code:', transactionCode);

  // Map bank names to VietQR bank codes (theo tài liệu VietQR)
  const getBankCode = (bankName: string, bankId?: string): string => {
    if (bankId) {
      // Map bankId to VietQR bank names
      const bankIdMap: { [key: string]: string } = {
        'MBB': 'mbbank',
        'VCB': 'vietcombank',
        'TCB': 'techcombank',
        'BIDV': 'bidv',
        'CTG': 'vietinbank',
        'AGB': 'agribank',
        'ACB': 'acb',
        'VPB': 'vpbank',
        'TPB': 'tpbank',
        'STB': 'sacombank',
        'HDB': 'hdbank',
        'VIB': 'vib',
        'SHB': 'shb',
        'EIB': 'eximbank',
        'MSB': 'msb'
      };
      return bankIdMap[bankId] || 'mbbank';
    }
    
    const bankMap: { [key: string]: string } = {
      'MBBank': 'mbbank',
      'MB Bank': 'mbbank',
      'Vietcombank': 'vietcombank',
      'Techcombank': 'techcombank',
      'BIDV': 'bidv',
      'VietinBank': 'vietinbank',
      'Agribank': 'agribank',
      'ACB': 'acb',
      'VPBank': 'vpbank',
      'TPBank': 'tpbank',
      'Sacombank': 'sacombank',
      'HDBank': 'hdbank',
      'VIB': 'vib',
      'SHB': 'shb',
      'Eximbank': 'eximbank',
      'MSB': 'msb'
    };
    
    return bankMap[bankName] || 'mbbank'; // Default to mbbank if not found
  };

  const bankCode = getBankCode(paymentInfo.bank_name, paymentInfo.bank_id);

  // If QR URL is missing, try to generate one as fallback using new VietQR format
  const fallbackQrUrl = !paymentInfo.qr_url && paymentInfo.account_number ? 
    `https://img.vietqr.io/image/${bankCode.toLowerCase()}-${paymentInfo.account_number}-compact.jpg?amount=${paymentInfo.amount}&addInfo=${transactionCode}` : 
    paymentInfo.qr_url;

  console.log('Bank code used:', bankCode);
  console.log('Final QR URL (with fallback):', fallbackQrUrl);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-green-600 mb-2">Quét mã để quyên góp</h3>
          <p className="text-gray-600">
            Số tiền: <span className="font-bold">{formatCurrency(paymentInfo.amount)}</span>
          </p>
        </div>
        
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="border border-gray-200 rounded-lg p-2 mb-4">
            {fallbackQrUrl && !imageError ? (
              <div>
                <Image 
                  src={fallbackQrUrl} 
                  alt="VietQR Code" 
                  width={250} 
                  height={250} 
                  className="mx-auto"
                  onError={() => {
                    console.error('QR Image failed to load:', fallbackQrUrl);
                    setImageError(true);
                  }}
                  onLoad={() => {
                    console.log('QR Image loaded successfully:', fallbackQrUrl);
                  }}
                  priority
                  unoptimized
                />
                {/* Fallback regular img tag if Next.js Image fails */}
                <img 
                  src={fallbackQrUrl}
                  alt="VietQR Code Fallback"
                  width={250}
                  height={250}
                  className="mx-auto hidden"
                  style={{ display: imageError ? 'block' : 'none' }}
                  onLoad={() => console.log('Fallback image loaded')}
                  onError={() => console.error('Fallback image also failed')}
                />
              </div>
            ) : (
              <div className="w-[250px] h-[250px] flex items-center justify-center bg-gray-100 rounded">
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-2">
                    Không thể tải mã QR
                  </p>
                  <p className="text-gray-600 text-xs">
                    Vui lòng chuyển khoản thủ công<br/>
                    theo thông tin bên dưới
                  </p>
                  {fallbackQrUrl && (
                    <div className="mt-2">
                      <a 
                        href={fallbackQrUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 text-xs underline"
                      >
                        Mở QR trong tab mới
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="text-sm text-center text-gray-600 space-y-2">
            <p>Ngân hàng: <span className="font-semibold">{paymentInfo.bank_name}</span></p>
            <p>
              Số tài khoản: 
              <span 
                className="font-semibold ml-1 cursor-pointer hover:text-green-600"
                onClick={() => {
                  navigator.clipboard.writeText(paymentInfo.account_number);
                  toast.success('Đã sao chép số tài khoản!', {
                    duration: 2000,
                    icon: '📋',
                  });
                }}
              >
                {paymentInfo.account_number} 
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </span>
            </p>
            <p>Chủ tài khoản: <span className="font-semibold">{paymentInfo.account_name}</span></p>
            <p>
              Nội dung chuyển khoản: 
              <span 
                className="font-semibold ml-1 cursor-pointer hover:text-green-600"
                onClick={() => {
                  const contentToCopy = paymentInfo.message || transactionCode;
                  navigator.clipboard.writeText(contentToCopy);
                  toast.success('Đã sao chép nội dung chuyển khoản!', {
                    duration: 2000,
                    icon: '📋',
                  });
                }}
              >
                {paymentInfo.message || transactionCode}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </span>
            </p>
          </div>
        </div>
        
        <div className="text-center text-sm text-gray-600 mb-6">
          <p className="mb-2">Quý vị vui lòng nhập đúng nội dung chuyển khoản để chúng tôi có thể xác nhận giao dịch.</p>
          <p className="text-green-600 font-semibold">Xin chân thành cảm ơn sự đóng góp của quý vị!</p>
        </div>

        {/* Confirm Payment Button */}
        <div className="text-center">
          {canConfirm ? (
            <button
              onClick={handleConfirmPayment}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Tôi đã chuyển khoản thành công
            </button>
          ) : (
            <div className="w-full bg-gray-300 text-gray-600 font-bold py-3 px-6 rounded-lg">
              Chờ {countdown} giây để xác nhận chuyển khoản
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VietQRDonation;
