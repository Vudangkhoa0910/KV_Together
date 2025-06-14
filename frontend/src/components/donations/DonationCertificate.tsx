import React, { useState } from 'react';
import Image from 'next/image';
import { DonationCertificateProps } from '@/types/donation';
import html2canvas from 'html2canvas';
import { formatCurrency, formatDate } from '@/utils/format';
import { toast } from 'react-hot-toast';

const DonationCertificate: React.FC<DonationCertificateProps> = ({
  isOpen,
  onClose,
  donation
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  
  if (!isOpen) return null;

  const handleDownload = async () => {
    const certificate = document.getElementById('donation-certificate');
    if (certificate) {
      try {
        setIsDownloading(true);
        const canvas = await html2canvas(certificate, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          allowTaint: true
        });
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 10);
        link.download = `Chung-chi-quyen-gop-${donation.donor.name}-${timestamp}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
        toast.success('Đã tải xuống chứng chỉ thành công!');
        
        // Save to user's certificate collection (simulate)
        saveCertificateToCollection(donation);
      } catch (err) {
        console.error('Failed to generate certificate:', err);
        toast.error('Không thể tải xuống chứng chỉ. Vui lòng thử lại.');
      } finally {
        setIsDownloading(false);
      }
    }
  };

  const handleShare = async () => {
    const certificate = document.getElementById('donation-certificate');
    if (certificate) {
      try {
        const canvas = await html2canvas(certificate, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          allowTaint: true
        });
        
        const shareText = `Tôi vừa quyên góp ${formatCurrency(donation.amount)} cho chiến dịch "${donation.campaign.title}" tại KV Together. Cùng chung tay tạo nên những thay đổi tích cực! #KVTogether #QuyenGop`;
        
        if (navigator.share) {
          // Native share API (mobile)
          canvas.toBlob(async (blob) => {
            if (blob) {
              const file = new File([blob], 'chung-chi-quyen-gop.png', { type: 'image/png' });
              await navigator.share({
                title: 'Chứng chỉ quyên góp - KV Together',
                text: shareText,
                files: [file]
              });
            }
          });
        } else {
          // Fallback to social media sharing
          const imageDataUrl = canvas.toDataURL('image/png');
          // Copy to clipboard
          navigator.clipboard.writeText(shareText);
          toast.success('Đã sao chép nội dung chia sẻ! Bạn có thể tải ảnh và chia sẻ trên mạng xã hội.');
          
          // Download image for manual sharing
          const link = document.createElement('a');
          link.download = 'chung-chi-quyen-gop.png';
          link.href = imageDataUrl;
          link.click();
        }
      } catch (err) {
        console.error('Failed to share certificate:', err);
        toast.error('Không thể chia sẻ chứng chỉ. Vui lòng thử lại.');
      }
    }
  };

  const saveCertificateToCollection = (donation: any) => {
    // Simulate saving to user's certificate collection
    const certificates = JSON.parse(localStorage.getItem('user_certificates') || '[]');
    const newCertificate = {
      id: donation.id,
      campaign_title: donation.campaign.title,
      amount: donation.amount,
      date: donation.created_at,
      donor_name: donation.donor.name,
      created_at: new Date().toISOString()
    };
    certificates.push(newCertificate);
    localStorage.setItem('user_certificates', JSON.stringify(certificates));
    console.log('Certificate saved to collection:', newCertificate);
  };

  // Get donor name, use "Nhà hảo tâm" for anonymous donations
  const donorName = donation.is_anonymous ? 'Nhà hảo tâm' : (donation.donor?.name || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-black/80 via-black/70 to-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-5xl max-h-[95vh] overflow-auto border border-orange-100 relative">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-yellow-50 rounded-full -translate-x-16 -translate-y-16 opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-blue-100 to-orange-50 rounded-full translate-x-12 translate-y-12 opacity-40"></div>
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent mb-2">
            Chứng chỉ quyên góp
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Cảm ơn bạn đã đóng góp cho một thế giới tốt đẹp hơn
          </p>
        </div>
        
        <div id="donation-certificate" className="relative w-full bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group" style={{ aspectRatio: '1.41', minHeight: '450px' }}>
          {/* Hình nền chứng chỉ */}
          <div className="relative w-full h-full">
            <Image
              src="/images/Certi.png"
              alt="Certificate background"
              fill
              className="object-contain transition-all duration-500 group-hover:scale-[1.02]"
              priority
            />
            {/* Overlay content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center animate-fadeIn" style={{ paddingTop: '32%', paddingBottom: '20%' }}>
              {/* Tên người quyên góp - positioned to match the certificate design */}
              <div style={{ 
                marginBottom: 'clamp(1%, 1.5%, 2%)',
                width: '88%',
                animation: 'slideInFromTop 0.8s ease-out'
              }}>
                <h2 className="font-serif font-bold transform transition-all duration-500 group-hover:scale-105" style={{ 
                  color: '#012B72',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.15)',
                  lineHeight: '0.9',
                  fontSize: 'clamp(1.5rem, 4.2vw, 2.8rem)',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  width: '100%',
                  letterSpacing: '0.5px',
                  marginBottom: '0'
                }}>
                  {donorName}
                </h2>
              </div>
              
              {/* Tên chiến dịch và số tiền - positioned on same line */}
              <div style={{ 
                paddingLeft: '4%',
                paddingRight: '4%',
                maxWidth: '92%',
                marginBottom: 'clamp(2%, 3%, 4%)',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'clamp(0.1rem, 0.5vw, 0.6rem)',
                flexWrap: 'wrap',
                animation: 'slideInFromLeft 0.9s ease-out 0.2s both'
              }}>
                <p className="font-medium transition-all duration-300 hover:scale-105" style={{ 
                  color: '#012B72',
                  textShadow: '1px 1px 3px rgba(0,0,0,0.12)',
                  lineHeight: '1.0',
                  fontSize: 'clamp(0.85rem, 2.0vw, 1.0rem)',
                  marginBottom: '0',
                  textAlign: 'center',
                  flex: '1',
                  minWidth: '0'
                }}>
                  Cho chiến dịch: "{donation.campaign.title}" với số tiền: 
                </p>
                
                <p className="font-bold transform transition-all duration-300 hover:scale-110 hover:text-orange-600" style={{ 
                  color: '#D97706',
                  textShadow: '2px 2px 4px rgba(217, 119, 6, 0.2)',
                  fontSize: 'clamp(0.85rem, 2.0vw, 1.0rem)',
                  marginBottom: '0',
                  whiteSpace: 'nowrap',
                  background: 'linear-gradient(135deg, #D97706, #F59E0B)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {formatCurrency(donation.amount)}
                </p>
              </div>

              {/* Ngày quyên góp - positioned at the bottom of content area */}
              <div style={{ 
                marginTop: 'auto',
                animation: 'slideInFromBottom 1s ease-out 0.4s both'
              }}>
                <p className="font-medium transition-all duration-300 hover:scale-105" style={{ 
                  color: '#4B5563',
                  fontSize: 'clamp(0.8rem, 2.4vw, 1.1rem)',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                  letterSpacing: '0.5px',
                  marginBottom: '0'
                }}>
                  Ngày: {formatDate(donation.created_at || new Date().toISOString())}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-4 md:gap-6 animate-slideInFromBottom">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="group flex-1 relative overflow-hidden py-4 px-6 rounded-xl font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl button-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center text-sm md:text-base border-2 border-transparent hover:border-orange-200"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 shimmer-effect"></div>
            {isDownloading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="relative z-10">Đang tải xuống...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 md:w-6 md:h-6 mr-3 transform group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="relative z-10">Tải chứng chỉ</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleShare}
            className="group flex-1 relative overflow-hidden py-4 px-6 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl button-glow-blue flex items-center justify-center text-sm md:text-base border-2 border-transparent hover:border-blue-200"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 shimmer-effect"></div>
            <svg className="w-5 h-5 md:w-6 md:h-6 mr-3 transform group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            <span className="relative z-10">Chia sẻ</span>
          </button>
          
          <button
            onClick={onClose}
            className="group w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-500 hover:from-red-100 hover:to-red-200 hover:text-red-600 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center border-2 border-transparent hover:border-red-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-7 md:w-7 transform group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonationCertificate;
