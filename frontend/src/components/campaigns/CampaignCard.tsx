'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Campaign } from '@/services/api';
import { formatCurrency, formatTimeLeft, getCampaignStatus } from '@/utils/format';

interface CampaignCardProps {
  campaign: Campaign;
  className?: string;
}

export function CampaignCard({ campaign, className = '' }: CampaignCardProps) {
  const timeLeft = formatTimeLeft(campaign.end_date);
  const daysLeftNumber = Math.ceil((new Date(campaign.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const campaignStatus = getCampaignStatus(campaign.progress_percentage, daysLeftNumber);
  
  // Determine urgency styling
  const getProgressBarColor = () => {
    if (campaign.progress_percentage >= 100) return 'bg-green-500';
    if (campaign.progress_percentage >= 80) return 'bg-blue-500';
    if (daysLeftNumber <= 7 && campaign.progress_percentage < 80) return 'bg-orange-500';
    return 'bg-gradient-to-r from-primary to-orange-400';
  };
  
  const getUrgencyBadge = () => {
    if (campaign.progress_percentage >= 100) {
      return { text: 'Hoàn thành', style: 'bg-green-100 text-green-700' };
    }
    if (daysLeftNumber <= 3 && campaign.progress_percentage < 90) {
      return { text: 'Gấp', style: 'bg-red-100 text-red-700' };
    }
    if (daysLeftNumber <= 7 && campaign.progress_percentage < 80) {
      return { text: 'Cần hỗ trợ', style: 'bg-orange-100 text-orange-700' };
    }
    if (campaign.progress_percentage >= 80) {
      return { text: 'Gần đạt', style: 'bg-blue-100 text-blue-700' };
    }
    return null;
  };
  
  const urgencyBadge = getUrgencyBadge();
  
  return (
    <Link
      href={`/campaigns/${campaign.slug}`}
      className={`group block bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-orange-100/50 overflow-hidden hover:shadow-2xl hover:border-orange-200 transform hover:scale-[1.02] transition-all duration-500 ${className}`}
    >        
      <div className="relative h-56 overflow-hidden">
        <Image
          src={campaign.image_url || (campaign.images_url && campaign.images_url[0]) || '/images/placeholder.jpg'}
          alt={campaign.title}
          fill
          priority={true}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/placeholder.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start gap-2 mb-3">
          <div className="flex gap-2 flex-wrap">
            {campaign.categories.map((category) => (
              <span
                key={category.id}
                className="text-xs px-3 py-1.5 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 rounded-full font-medium border border-orange-200/50 transform group-hover:scale-105 transition-all duration-300"
              >
                {category.name}
              </span>
            ))}
          </div>
          
          {urgencyBadge && (
            <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${urgencyBadge.style} whitespace-nowrap border transform group-hover:scale-105 transition-all duration-300 shadow-sm`}>
              {urgencyBadge.text}
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold mb-3 line-clamp-2 text-gray-800 group-hover:text-orange-600 transition-colors duration-300">
          {campaign.title}
        </h3>

        <p className="text-gray-600 text-sm mb-5 line-clamp-2 leading-relaxed">
          {campaign.description}
        </p>

        <div className="mt-5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-500 font-medium">Tiến độ</span>
            <span className="text-sm font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
              {campaign.progress_percentage}%
            </span>
          </div>
          
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressBarColor()} relative overflow-hidden`}
              style={{ width: `${Math.min(campaign.progress_percentage, 100)}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-3 rounded-xl border border-orange-200">
                <p className="text-orange-600 text-xs font-medium mb-1">Đã quyên góp</p>
                <p className="font-bold text-gray-800 truncate">
                  {formatCurrency(campaign.current_amount)}
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-xl border border-blue-200 text-right">
                <p className="text-blue-600 text-xs font-medium mb-1">Mục tiêu</p>
                <p className="font-bold text-gray-800 truncate">
                  {formatCurrency(campaign.target_amount)}
                </p>
              </div>
            </div>
            
            {/* Remaining amount needed */}
            {campaign.progress_percentage < 100 && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-xl border border-yellow-200">
                <p className="text-orange-600 text-xs font-medium mb-1">Còn thiếu</p>
                <p className="font-bold text-orange-700">
                  {formatCurrency(campaign.target_amount - campaign.current_amount)}
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex justify-between items-center text-xs">
            <span className="flex items-center gap-1 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {campaign.donations_count || 0} lượt ủng hộ
            </span>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`text-xs font-medium ${
                daysLeftNumber <= 3 ? 'text-red-600' :
                daysLeftNumber <= 7 ? 'text-orange-600' :
                'text-gray-500'
              }`}>
                {timeLeft}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
