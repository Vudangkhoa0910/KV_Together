'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api, Activity } from '@/services/api';
import { Calendar, MapPin, Users, Phone, Mail, Clock, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import ActivityRegistrationButton from '@/components/activities/ActivityRegistrationButton';

const CATEGORIES = {
  event: 'Sự kiện',
  workshop: 'Hội thảo', 
  community: 'Cộng đồng',
  volunteer: 'Tình nguyện'
};

export default function ActivityDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchActivity(slug);
    }
  }, [slug]);

  const fetchActivity = async (activitySlug: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getActivity(activitySlug);
      setActivity(data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin hoạt động');
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'EEEE, dd MMMM yyyy, HH:mm', { locale: vi });
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Không tìm thấy hoạt động
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/activities"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Về trang hoạt động
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-700">Trang chủ</Link>
          <span className="mx-2">/</span>
          <Link href="/activities" className="hover:text-gray-700">Hoạt động</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{activity.title}</span>
        </nav>

        {/* Activity Header */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          {activity.image_url && (
            <div className="aspect-video overflow-hidden">
              <img
                src={activity.image_url}
                alt={activity.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {CATEGORIES[activity.category]}
              </span>
              {activity.is_featured && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                  Nổi bật
                </span>
              )}
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                activity.status === 'published' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {activity.status === 'published' ? 'Đang mở đăng ký' : 'Chưa mở đăng ký'}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {activity.title}
            </h1>
            
            {activity.summary && (
              <p className="text-lg text-gray-600 mb-6">
                {activity.summary}
              </p>
            )}
            
            {/* Key Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Thời gian</div>
                    <div className="text-gray-600">{formatEventDate(activity.event_date)}</div>
                  </div>
                </div>
                
                {activity.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">Địa điểm</div>
                      <div className="text-gray-600">{activity.location}</div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Số lượng tham gia</div>
                    <div className="text-gray-600">
                      {activity.current_participants}
                      {activity.max_participants ? `/${activity.max_participants}` : ''} người
                      {activity.is_full && (
                        <span className="ml-2 text-red-600 font-medium">(Đã đầy)</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Phí tham gia</div>
                    <div className="text-gray-600 text-lg font-semibold">
                      {formatPrice(activity.registration_fee)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Registration Deadline */}
            {activity.registration_deadline && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">
                    Hạn đăng ký: {format(new Date(activity.registration_deadline), 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </span>
                </div>
              </div>
            )}

            {/* Registration Button */}
            <div className="mb-6">
              <ActivityRegistrationButton activity={activity} />
            </div>
            
            {/* Contact Info */}
            {(activity.contact_email || activity.contact_phone) && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin liên hệ</h3>
                <div className="flex flex-wrap gap-6">
                  {activity.contact_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a 
                        href={`mailto:${activity.contact_email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {activity.contact_email}
                      </a>
                    </div>
                  )}
                  {activity.contact_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a 
                        href={`tel:${activity.contact_phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {activity.contact_phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Activity Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Chi tiết hoạt động</h2>
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown>{activity.description}</ReactMarkdown>
          </div>
        </div>

        {/* Additional Images */}
        {activity.images_url && activity.images_url.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Hình ảnh thêm</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {activity.images_url.map((imageUrl, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src={imageUrl}
                    alt={`${activity.title} - Hình ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Organizer Info */}
        {activity.organizer && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Người tổ chức</h3>
            <div className="flex items-center gap-4">
              {activity.organizer.avatar_url && (
                <img
                  src={activity.organizer.avatar_url}
                  alt={activity.organizer.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <h4 className="font-medium text-gray-900">{activity.organizer.name}</h4>
                <p className="text-sm text-gray-600">Tổ chức: {activity.organizer_name}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
