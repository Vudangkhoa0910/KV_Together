'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getActivity, updateActivity, Activity } from '@/services/api';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Users, DollarSign, Mail, Phone } from 'lucide-react';

interface ActivityForm {
  title: string;
  summary: string;
  description: string;
  category: string;
  location: string;
  event_date: string;
  registration_deadline: string;
  max_participants: number;
  registration_fee: number;
  contact_email: string;
  contact_phone: string;
  status: 'draft' | 'pending' | 'published';
}

export default function EditActivityPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [form, setForm] = useState<ActivityForm>({
    title: '',
    summary: '',
    description: '',
    category: 'community',
    location: '',
    event_date: '',
    registration_deadline: '',
    max_participants: 50,
    registration_fee: 0,
    contact_email: '',
    contact_phone: '',
    status: 'draft'
  });

  const categories = [
    { value: 'event', label: 'Sự kiện' },
    { value: 'workshop', label: 'Hội thảo' },
    { value: 'community', label: 'Cộng đồng' },
    { value: 'volunteer', label: 'Tình nguyện' }
  ];

  useEffect(() => {
    if (params.slug) {
      fetchActivity();
    }
  }, [params.slug]);

  const fetchActivity = async () => {
    try {
      setLoadingActivity(true);
      const activityData = await getActivity(params.slug as string);
      
      // Check if user owns this activity
      if (activityData.organizer_id !== user?.id) {
        router.push('/user/activities');
        return;
      }
      
      setActivity(activityData);
      
      // Format dates for datetime-local input
      const eventDate = new Date(activityData.event_date);
      const registrationDeadline = new Date(activityData.registration_deadline);
      
      setForm({
        title: activityData.title,
        summary: activityData.summary,
        description: activityData.description,
        category: activityData.category,
        location: activityData.location,
        event_date: eventDate.toISOString().slice(0, 16),
        registration_deadline: registrationDeadline.toISOString().slice(0, 16),
        max_participants: activityData.max_participants,
        registration_fee: activityData.registration_fee,
        contact_email: activityData.contact_email,
        contact_phone: activityData.contact_phone || '',
        status: activityData.status as 'draft' | 'pending' | 'published'
      });
    } catch (error) {
      console.error('Error fetching activity:', error);
      router.push('/user/activities');
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'max_participants' || name === 'registration_fee' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity) return;

    try {
      setLoading(true);
      await updateActivity(activity.id, form);
      router.push('/user/activities');
    } catch (error: any) {
      console.error('Error updating activity:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hoạt động');
    } finally {
      setLoading(false);
    }
  };

  if (loadingActivity) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!activity) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/user/activities"
            className="text-blue-600 hover:text-blue-800 flex items-center mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Quay lại danh sách hoạt động
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa hoạt động</h1>
          <p className="text-gray-600 mt-2">
            Cập nhật thông tin hoạt động: {activity.title}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
              Thông tin cơ bản
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề hoạt động *
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tiêu đề hoạt động"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại hoạt động *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tóm tắt *
              </label>
              <textarea
                name="summary"
                value={form.summary}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mô tả ngắn gọn về hoạt động"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả chi tiết *
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                required
                rows={8}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mô tả chi tiết về hoạt động, chương trình, lợi ích..."
              />
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
              Chi tiết sự kiện
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Ngày và giờ diễn ra *
                </label>
                <input
                  type="datetime-local"
                  name="event_date"
                  value={form.event_date}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Hạn đăng ký *
                </label>
                <input
                  type="datetime-local"
                  name="registration_deadline"
                  value={form.registration_deadline}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin size={16} className="inline mr-1" />
                Địa điểm *
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập địa điểm tổ chức"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users size={16} className="inline mr-1" />
                  Số lượng tham gia tối đa *
                </label>
                <input
                  type="number"
                  name="max_participants"
                  value={form.max_participants}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Hiện tại: {activity.current_participants} người đã đăng ký
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign size={16} className="inline mr-1" />
                  Phí tham gia (VNĐ)
                </label>
                <input
                  type="number"
                  name="registration_fee"
                  value={form.registration_fee}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0 = Miễn phí"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
              Thông tin liên hệ
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-1" />
                  Email liên hệ *
                </label>
                <input
                  type="email"
                  name="contact_email"
                  value={form.contact_email}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} className="inline mr-1" />
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={form.contact_phone}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Số điện thoại liên hệ"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
              Trạng thái
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái xuất bản
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="draft">Lưu bản nháp</option>
                <option value="pending">Gửi để duyệt</option>
                {activity.status === 'published' && (
                  <option value="published">Đã xuất bản</option>
                )}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                {activity.status === 'published' 
                  ? 'Hoạt động đã được xuất bản'
                  : 'Hoạt động sẽ cần được admin duyệt trước khi xuất bản'
                }
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Link
              href="/user/activities"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang cập nhật...' : 'Cập nhật hoạt động'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
