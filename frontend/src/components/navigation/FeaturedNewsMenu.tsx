'use client';

import { useState, useEffect } from 'react';
import { api, News } from '@/services/api';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface FeaturedNewsMenuProps {
  className?: string;
}

export default function FeaturedNewsMenu({ className = '' }: FeaturedNewsMenuProps) {
  const [featuredNews, setFeaturedNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedNews = async () => {
      try {
        const news = await api.getFeaturedNews(2); // Lấy 2 tin nổi bật
        setFeaturedNews(news);
      } catch (error) {
        console.error('Error fetching featured news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedNews();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy', { locale: vi });
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <h4 className="font-semibold text-gray-900 mb-3">Tin tức nổi bật</h4>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-3 bg-gray-200 rounded mb-1"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (featuredNews.length === 0) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <h4 className="font-semibold text-gray-900 mb-3">Tin tức nổi bật</h4>
      <div className="space-y-3">
        {featuredNews.map((item) => (
          <Link
            key={item.id}
            href={`/news/${item.slug}`}
            className="block group"
          >
            <div className="text-xs text-gray-500 mb-1">
              {formatDate(item.published_date)}
            </div>
            <div className="text-sm text-gray-700 group-hover:text-orange-600 transition-colors line-clamp-2">
              {item.title}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
