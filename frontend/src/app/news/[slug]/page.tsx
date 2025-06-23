'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { api, News } from '@/services/api';

export default function NewsDetailPage() {
  const params = useParams();
  const slug = params?.slug;
  const [news, setNews] = useState<News | null>(null);
  const [relatedNews, setRelatedNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchNewsDetail();
    }
  }, [slug]);

  const fetchNewsDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getNewsArticle(slug as string);
      setNews(response.news);
      setRelatedNews(response.related);
    } catch (error: any) {
      console.error('Error fetching news detail:', error);
      setError(error.message || 'Không thể tải bài viết');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryName = (category: string) => {
    const categories: { [key: string]: string } = {
      community: 'Cộng đồng',
      event: 'Sự kiện',
      story: 'Câu chuyện',
      announcement: 'Thông báo'
    };
    return categories[category] || category;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy bài viết</h1>
          <p className="text-gray-600 mb-6">{error || 'Bài viết không tồn tại hoặc đã bị xóa'}</p>
          <Link href="/news" className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors">
            Quay lại tin tức
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          <li><Link href="/" className="hover:text-orange-500">Trang chủ</Link></li>
          <li>/</li>
          <li><Link href="/news" className="hover:text-orange-500">Tin tức</Link></li>
          <li>/</li>
          <li className="text-gray-400">{getCategoryName(news.category)}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <article className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Featured Image */}
            {news.image_url && (
              <div className="relative h-96">
                <Image
                  src={news.image_url}
                  alt={news.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-8">
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600">
                <span className="inline-block bg-orange-100 text-orange-600 px-3 py-1 rounded-full">
                  {getCategoryName(news.category)}
                </span>
                <span>{formatDate(news.published_date)}</span>
                <span>{news.read_time}</span>
                <span>{news.views_count} lượt xem</span>
                {news.source && <span>Nguồn: {news.source}</span>}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 leading-tight">
                {news.title}
              </h1>

              {/* Summary */}
              <div className="text-lg text-gray-700 mb-8 p-4 bg-gray-50 rounded-lg border-l-4 border-orange-500">
                {news.summary}
              </div>

              {/* Author */}
              {(news.author_name || news.author?.name) && (
                <div className="flex items-center mb-8 p-4 bg-gray-50 rounded-lg">
                  {news.author?.avatar_url && (
                    <Image
                      src={news.author.avatar_url}
                      alt={news.author.name}
                      width={48}
                      height={48}
                      className="rounded-full mr-4"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-gray-800">
                      {news.author_name || news.author?.name}
                    </p>
                    <p className="text-sm text-gray-600">Tác giả</p>
                  </div>
                </div>
              )}

              {/* Content */}
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: news.content.replace(/\n/g, '<br />') 
                }}
              />

              {/* Additional Images */}
              {news.images_url && news.images_url.length > 1 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Hình ảnh liên quan</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {news.images_url.slice(1).map((imageUrl, index) => (
                      <div key={index} className="relative h-32 rounded-lg overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={`${news.title} - ${index + 2}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Share Buttons */}
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-lg font-semibold mb-4">Chia sẻ bài viết</h3>
                <div className="flex space-x-4">
                  <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                    <span>Twitter</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Facebook</span>
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Related News */}
          {relatedNews.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h3 className="text-xl font-bold mb-6">Tin liên quan</h3>
              <div className="space-y-6">
                {relatedNews.map((article) => (
                  <article key={article.id} className="group">
                    <Link href={`/news/${article.slug}`}>
                      <div className="flex space-x-4">
                        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                          <Image
                            src={article.image_url || '/images/bg.jpeg'}
                            alt={article.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 group-hover:text-orange-500 transition-colors line-clamp-2 mb-2">
                            {article.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {formatDate(article.published_date)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Back to News */}
          <div className="bg-orange-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Khám phá thêm</h3>
            <Link 
              href="/news" 
              className="block w-full bg-orange-500 text-white text-center py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Xem tất cả tin tức
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
