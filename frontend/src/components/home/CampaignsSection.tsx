import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Campaign } from '@/services/api';
import { formatCurrency, formatTimeLeft } from '@/utils/format';
import ProgressBar from '@/components/ProgressBar';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface CampaignsSectionProps {
  campaigns: Campaign[];
  title: string;
  subtitle?: string;
  type: 'featured' | 'successful' | 'urgent';
}

const CampaignsSection: React.FC<CampaignsSectionProps> = ({ 
  campaigns, 
  title, 
  subtitle,
  type 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!campaigns || campaigns.length === 0) {
    return null;
  }

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const getBadgeStyle = (campaign: Campaign, type: string) => {
    if (type === 'urgent') {
      const urgency = (campaign as any).urgency_level;
      switch (urgency) {
        case 'critical':
          return 'bg-red-500 text-white';
        case 'high':
          return 'bg-orange-500 text-white';
        default:
          return 'bg-yellow-500 text-white';
      }
    }
    if (type === 'successful') {
      return 'bg-green-500 text-white';
    }
    return 'bg-blue-500 text-white';
  };

  const getBadgeText = (campaign: Campaign, type: string) => {
    if (type === 'urgent') {
      const timeLeft = (campaign as any).time_left;
      return timeLeft <= 7 ? `🚨 ${timeLeft} ngày` : `⏰ ${timeLeft} ngày`;
    }
    if (type === 'successful') {
      return `✅ ${campaign.progress_percentage.toFixed(2)}%`;
    }
    return '⭐ Nổi bật';
  };

  const getSectionBg = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50';
      case 'successful':
        return 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50';
      default:
        return 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50';
    }
  };

  return (
    <section className={`py-16 ${getSectionBg(type)}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Navigation buttons and scroll container */}
        <div className="relative">
          {/* Left navigation button */}
          {campaigns.length > 3 && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 opacity-80 hover:opacity-100"
              aria-label="Scroll left"
            >
              <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
            </button>
          )}

          {/* Right navigation button */}
          {campaigns.length > 3 && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 opacity-80 hover:opacity-100"
              aria-label="Scroll right"
            >
              <ChevronRightIcon className="h-6 w-6 text-gray-600" />
            </button>
          )}

          {/* Horizontal scroll container */}
          <div 
            ref={scrollRef}
            className="overflow-x-auto pb-4 scrollbar-hide"
          >
            <div className="flex gap-6 w-max px-4 md:px-0">
              {campaigns.map((campaign, index) => (
                <Link 
                  key={campaign.id}
                  href={`/campaigns/${campaign.slug}`}
                  className="block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group flex-shrink-0 w-80 sm:w-72 md:w-80"
                >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={campaign.image_url || "/images/bg.jpeg"}
                    alt={campaign.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  
                  {/* Badge */}
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${getBadgeStyle(campaign, type)}`}>
                    {getBadgeText(campaign, type)}
                </div>

                {/* Progress overlay for urgent campaigns */}
                {type === 'urgent' && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <ProgressBar 
                      value={campaign.current_amount} 
                      max={campaign.target_amount}
                      height="sm"
                      variant="danger"
                      showPercentage={false}
                    />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Categories */}
                {campaign.categories && campaign.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {campaign.categories.slice(0, 2).map((category) => (
                      <span 
                        key={category.id}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Title */}
                <h3 className="font-bold text-gray-800 text-lg mb-3 line-clamp-2 hover:text-orange-600 transition-colors">
                  {campaign.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {campaign.description}
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <ProgressBar 
                    value={campaign.current_amount} 
                    max={campaign.target_amount}
                    height="sm"
                    variant={
                      type === 'urgent' ? 'danger' :
                      type === 'successful' ? 'success' :
                      'default'
                    }
                    showPercentage={true}
                    label="Tiến độ"
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Đã gây quỹ</p>
                    <p className="font-bold text-green-600 text-sm">
                      {formatCurrency(campaign.current_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      {type === 'urgent' ? 'Còn lại' : 'Mục tiêu'}
                    </p>
                    <p className="font-bold text-gray-700 text-sm">
                      {type === 'urgent' ? 
                        `${(campaign as any).time_left || campaign.days_remaining} ngày` :
                        formatCurrency(campaign.target_amount)
                      }
                    </p>
                  </div>
                </div>

                {/* Organizer */}
                {campaign.organizer && (
                  <div className="flex items-center mb-4 text-xs text-gray-500">
                    <div className="w-6 h-6 rounded-full bg-gray-200 mr-2 overflow-hidden">
                      {campaign.organizer.avatar_url ? (
                        <Image
                          src={campaign.organizer.avatar_url}
                          alt={campaign.organizer.name}
                          width={24}
                          height={24}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-orange-400 flex items-center justify-center">
                          <span className="text-white text-xs">
                            {campaign.organizer.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="truncate">{campaign.organizer.name}</span>
                  </div>
                )}

                {/* Action Button */}
                <div className={`w-full py-3 px-4 rounded-lg font-semibold text-white text-center transition-all duration-300 hover:scale-105 ${
                  type === 'urgent' ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' :
                  type === 'successful' ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' :
                  'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                }`}>
                  {type === 'urgent' ? 'Ủng hộ ngay!' : 'Xem chi tiết'}
                </div>
              </div>
            </Link>
          ))}
            </div>
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <Link 
            href="/campaigns"
            className={`inline-block px-8 py-3 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl ${
              type === 'urgent' ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' :
              type === 'successful' ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' :
              'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
            }`}
          >
            {type === 'urgent' ? 'Xem thêm chiến dịch cần ưu tiên' :
             type === 'successful' ? 'Xem thêm chiến dịch thành công' :
             'Xem tất cả chiến dịch nổi bật'}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CampaignsSection;
