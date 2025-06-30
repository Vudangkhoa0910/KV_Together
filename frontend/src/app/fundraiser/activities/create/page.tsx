'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createActivity } from '@/services/api';
import Link from 'next/link';
import { ArrowLeftIcon, CalendarIcon, MapPinIcon, UsersIcon, CurrencyDollarIcon, EnvelopeIcon, PhoneIcon, PhotoIcon, StarIcon, CheckCircleIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

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
  is_featured: boolean;
}

export default function CreateFundraiserActivityPage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
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
    contact_email: user?.email || '',
    contact_phone: '',
    status: 'published',
    is_featured: false
  });

  const categories = [
    { value: 'event', label: 'Sự kiện' },
    { value: 'workshop', label: 'Hội thảo' },
    { value: 'community', label: 'Cộng đồng' },
    { value: 'volunteer', label: 'Tình nguyện' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked
        : name === 'max_participants' || name === 'registration_fee' 
          ? Number(value) 
          : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file hình ảnh (PNG, JPG, GIF)', {
          duration: 4000,
          position: 'top-center',
        });
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Kích thước file không được vượt quá 10MB', {
          duration: 4000,
          position: 'top-center',
        });
        return;
      }

      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      
      const submitData = new FormData();
      
      // Add all form fields
      Object.entries(form).forEach(([key, value]) => {
        submitData.append(key, value.toString());
      });
      
      // Add organizer info
      submitData.append('organizer_name', user.name);

      // Add image if selected
      if (image) {
        submitData.append('image', image);
      }

      await createActivity(submitData);
      
      setIsSuccess(true);
      toast.success('Hoạt động đã được tạo thành công!', {
        duration: 4000,
        position: 'top-center',
      });

      // Redirect after showing success
      setTimeout(() => {
        router.push('/fundraiser/activities');
      }, 2000);
      
    } catch (error: any) {
      console.error('Error creating activity:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo hoạt động');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-slideUp">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircleIcon className="h-10 w-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Hoạt động đã được tạo!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Hoạt động của bạn đã được tạo thành công và sẵn sàng để mọi người tham gia.
          </p>
          
          <div className="space-y-3">
            <Link
              href="/fundraiser/activities"
              className="block w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5"
            >
              Quản lý hoạt động
            </Link>
            
            <button
              onClick={() => setIsSuccess(false)}
              className="block w-full border-2 border-gray-300 hover:border-orange-500 text-gray-700 hover:text-orange-600 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Tạo hoạt động khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <div className="container mx-auto px-4 max-w-7xl py-8">
        <div className="mb-8">
          <Link 
            href="/fundraiser/activities" 
            className="inline-flex items-center text-orange-600 hover:text-orange-800 font-medium transition-colors duration-200 group"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Quay lại quản lý hoạt động
          </Link>
        </div>
        
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-orange-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6">
            <div className="flex items-center">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl mr-4">
                <CalendarIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Tạo hoạt động mới</h1>
                <p className="text-orange-100">Tạo hoạt động để kết nối và phục vụ cộng đồng</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 bg-gray-50 space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-md border border-orange-100 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-100 to-orange-200 px-6 py-4 border-b border-orange-200">
                <h2 className="text-lg font-semibold text-orange-800 flex items-center">
                  <StarIcon className="h-5 w-5 mr-2" />
                  Thông tin cơ bản
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề hoạt động <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                    value={form.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập tiêu đề hoạt động"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Loại hoạt động <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    id="category"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                    value={form.category}
                    onChange={handleInputChange}
                    required
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
                    Tóm tắt <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="summary"
                    id="summary"
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                    value={form.summary}
                    onChange={handleInputChange}
                    required
                    placeholder="Mô tả ngắn gọn về hoạt động"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Tóm tắt sẽ hiển thị trong danh sách hoạt động và kết quả tìm kiếm
                  </p>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả chi tiết <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={8}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                    value={form.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Mô tả chi tiết về hoạt động, chương trình, lợi ích, yêu cầu tham gia..."
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Mô tả chi tiết càng tốt sẽ thu hút được nhiều người tham gia hơn.
                  </p>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="bg-white rounded-xl shadow-md border border-orange-100 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-100 to-orange-200 px-6 py-4 border-b border-orange-200">
                <h2 className="text-lg font-semibold text-orange-800 flex items-center">
                  <PhotoIcon className="h-5 w-5 mr-2" />
                  Hình ảnh đại diện
                </h2>
              </div>
              
              <div className="p-6">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors duration-200"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-orange-300 rounded-xl p-8 text-center hover:border-orange-400 transition-colors duration-200 cursor-pointer"
                  >
                    <PhotoIcon className="mx-auto h-16 w-16 text-orange-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">Thêm hình ảnh đại diện</p>
                    <p className="text-sm text-gray-500 mb-4">Kéo thả hoặc nhấp để chọn hình ảnh</p>
                    <button
                      type="button"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg"
                    >
                      <PhotoIcon className="h-5 w-5 mr-2" />
                      Chọn hình ảnh
                    </button>
                    <p className="text-xs text-gray-400 mt-4">PNG, JPG, GIF tối đa 10MB</p>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Event Details */}
            <div className="bg-white rounded-xl shadow-md border border-orange-100 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-100 to-orange-200 px-6 py-4 border-b border-orange-200">
                <h2 className="text-lg font-semibold text-orange-800 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Chi tiết sự kiện
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="event_date" className="block text-sm font-medium text-gray-700 mb-2">
                      <CalendarIcon className="h-4 w-4 inline mr-1" />
                      Ngày và giờ diễn ra <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="event_date"
                      id="event_date"
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                      value={form.event_date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="registration_deadline" className="block text-sm font-medium text-gray-700 mb-2">
                      <CalendarIcon className="h-4 w-4 inline mr-1" />
                      Hạn đăng ký
                    </label>
                    <input
                      type="datetime-local"
                      name="registration_deadline"
                      id="registration_deadline"
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                      value={form.registration_deadline}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPinIcon className="h-4 w-4 inline mr-1" />
                    Địa điểm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                    value={form.location}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập địa điểm tổ chức"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="max_participants" className="block text-sm font-medium text-gray-700 mb-2">
                      <UsersIcon className="h-4 w-4 inline mr-1" />
                      Số lượng tham gia tối đa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="max_participants"
                      id="max_participants"
                      min="1"
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                      value={form.max_participants}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="registration_fee" className="block text-sm font-medium text-gray-700 mb-2">
                      <CurrencyDollarIcon className="h-4 w-4 inline mr-1" />
                      Phí tham gia (VNĐ)
                    </label>
                    <input
                      type="number"
                      name="registration_fee"
                      id="registration_fee"
                      min="0"
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                      value={form.registration_fee}
                      onChange={handleInputChange}
                      placeholder="0 = Miễn phí"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-md border border-orange-100 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-100 to-orange-200 px-6 py-4 border-b border-orange-200">
                <h2 className="text-lg font-semibold text-orange-800 flex items-center">
                  <EnvelopeIcon className="h-5 w-5 mr-2" />
                  Thông tin liên hệ
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-2">
                      <EnvelopeIcon className="h-4 w-4 inline mr-1" />
                      Email liên hệ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="contact_email"
                      id="contact_email"
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                      value={form.contact_email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-2">
                      <PhoneIcon className="h-4 w-4 inline mr-1" />
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="contact_phone"
                      id="contact_phone"
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                      value={form.contact_phone}
                      onChange={handleInputChange}
                      required
                      placeholder="Số điện thoại liên hệ"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="bg-white rounded-xl shadow-md border border-orange-100 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-100 to-orange-200 px-6 py-4 border-b border-orange-200">
                <h2 className="text-lg font-semibold text-orange-800 flex items-center">
                  <StarIcon className="h-5 w-5 mr-2" />
                  Cài đặt nâng cao
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái xuất bản
                  </label>
                  <select
                    name="status"
                    id="status"
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                    value={form.status}
                    onChange={handleInputChange}
                  >
                    <option value="draft">Lưu bản nháp</option>
                    <option value="pending">Gửi để duyệt</option>
                    <option value="published">Xuất bản ngay</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-2">
                    Với tư cách là fundraiser, bạn có thể xuất bản trực tiếp
                  </p>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex items-center h-6">
                    <input
                      type="checkbox"
                      id="is_featured"
                      name="is_featured"
                      checked={form.is_featured}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="text-sm">
                    <label htmlFor="is_featured" className="font-medium text-gray-700 flex items-center">
                      <StarIcon className="h-4 w-4 mr-1 text-yellow-500" />
                      Đánh dấu là hoạt động nổi bật
                    </label>
                    <p className="text-gray-500 mt-1">
                      Hoạt động nổi bật sẽ được hiển thị ưu tiên và có nhiều cơ hội tiếp cận hơn
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
              <p className="text-sm text-gray-500 flex items-center">
                <span className="text-red-500 text-base mr-1">*</span> 
                Các thông tin bắt buộc
              </p>
              
              <div className="flex items-center space-x-4">
                <Link 
                  href="/fundraiser/activities"
                  className="inline-flex items-center px-6 py-3 border-2 border-gray-300 shadow-sm text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200"
                >
                  Hủy bỏ
                </Link>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-8 py-3 border border-transparent shadow-lg text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang tạo hoạt động...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Tạo hoạt động
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
