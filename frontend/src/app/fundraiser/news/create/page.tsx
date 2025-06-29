'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PhotoIcon, ArrowLeftIcon, DocumentTextIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { api } from '@/services/api';
import Link from 'next/link';
import toast from 'react-hot-toast';

const categories = [
  { id: 'community', name: 'Cộng đồng' },
  { id: 'event', name: 'Sự kiện' },
  { id: 'story', name: 'Câu chuyện' },
  { id: 'announcement', name: 'Thông báo' },
];

export default function CreateNews() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'community',
    is_featured: false,
    status: 'draft'
  });
  
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
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
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước file không được vượt quá 5MB', {
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề là bắt buộc';
    }
    
    if (!formData.summary.trim()) {
      newErrors.summary = 'Tóm tắt là bắt buộc';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Nội dung là bắt buộc';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const submitData = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value.toString());
      });
      
      // Add image if selected
      if (image) {
        submitData.append('image', image);
      }
      
      await api.createNews(submitData);
      
      setIsSuccess(true);
      toast.success('Bài viết đã được tạo thành công!', {
        duration: 4000,
        position: 'top-center',
      });

      // Redirect after showing success
      setTimeout(() => {
        router.push('/fundraiser/news');
      }, 2000);
      
    } catch (error: any) {
      console.error('Error creating news:', error);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error('Có lỗi xảy ra khi tạo bài viết. Vui lòng thử lại.', {
          duration: 4000,
          position: 'top-center',
        });
      }
    } finally {
      setIsSubmitting(false);
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
            Bài viết đã được tạo!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Bài viết của bạn đã được tạo thành công và đang chờ được phê duyệt.
          </p>
          
          <div className="space-y-3">
            <Link
              href="/fundraiser/news"
              className="block w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5"
            >
              Quản lý tin tức
            </Link>
            
            <button
              onClick={() => setIsSuccess(false)}
              className="block w-full border-2 border-gray-300 hover:border-orange-500 text-gray-700 hover:text-orange-600 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Tạo bài viết khác
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
            href="/fundraiser/news" 
            className="inline-flex items-center text-orange-600 hover:text-orange-800 font-medium transition-colors duration-200 group"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Quay lại quản lý tin tức
          </Link>
        </div>
        
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-orange-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6">
            <div className="flex items-center">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl mr-4">
                <DocumentTextIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Tạo bài viết mới</h1>
                <p className="text-orange-100">Chia sẻ tin tức và câu chuyện với cộng đồng</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 bg-gray-50 space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-md border border-orange-100 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-100 to-orange-200 px-6 py-4 border-b border-orange-200">
                <h2 className="text-lg font-semibold text-orange-800 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Thông tin bài viết
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border ${errors.title ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200`}
                    placeholder="Nhập tiêu đề bài viết..."
                  />
                  {errors.title && (
                    <p className="mt-2 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
                    Tóm tắt <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="summary"
                    id="summary"
                    rows={3}
                    value={formData.summary}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border ${errors.summary ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200`}
                    placeholder="Tóm tắt ngắn gọn về nội dung bài viết..."
                  />
                  {errors.summary && (
                    <p className="mt-2 text-sm text-red-600">{errors.summary}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục
                  </label>
                  <select
                    name="category"
                    id="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="content"
                    id="content"
                    rows={12}
                    value={formData.content}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border ${errors.content ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200`}
                    placeholder="Viết nội dung chi tiết của bài viết..."
                  />
                  {errors.content && (
                    <p className="mt-2 text-sm text-red-600">{errors.content}</p>
                  )}
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
                    className="border-2 border-dashed border-orange-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors duration-200 cursor-pointer"
                  >
                    <PhotoIcon className="mx-auto h-16 w-16 text-orange-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Thêm hình ảnh đại diện
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Kéo thả hoặc nhấp để chọn hình ảnh
                    </p>
                    <p className="text-xs text-gray-400">
                      PNG, JPG lên đến 5MB
                    </p>
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

            {/* Options */}
            <div className="bg-white rounded-xl shadow-md border border-orange-100 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-100 to-orange-200 px-6 py-4 border-b border-orange-200">
                <h2 className="text-lg font-semibold text-orange-800 flex items-center">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Cài đặt xuất bản
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center h-6">
                    <input
                      id="is_featured"
                      name="is_featured"
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="text-sm">
                    <label htmlFor="is_featured" className="font-medium text-gray-700">
                      Bài viết nổi bật
                    </label>
                    <p className="text-gray-500">
                      Bài viết nổi bật sẽ được hiển thị ưu tiên trên trang chủ
                    </p>
                  </div>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <select
                    name="status"
                    id="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                  >
                    <option value="draft">Bản nháp</option>
                    <option value="published">Xuất bản</option>
                  </select>
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
                  href="/fundraiser/news"
                  className="inline-flex items-center px-6 py-3 border-2 border-gray-300 shadow-sm text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200"
                >
                  Hủy bỏ
                </Link>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-8 py-3 border border-transparent shadow-lg text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang tạo bài viết...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Tạo bài viết
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
