'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { api } from '@/services/api';

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
      router.push('/fundraiser/news');
    } catch (error: any) {
      console.error('Error creating news:', error);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert('Có lỗi xảy ra khi tạo bài viết. Vui lòng thử lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Tạo bài viết mới</h1>
        <p className="mt-2 text-sm text-gray-700">
          Chia sẻ tin tức và câu chuyện với cộng đồng
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Tiêu đề *
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
              errors.title ? 'border-red-300' : ''
            }`}
            placeholder="Nhập tiêu đề bài viết..."
          />
          {errors.title && (
            <p className="mt-2 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Summary */}
        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
            Tóm tắt *
          </label>
          <textarea
            name="summary"
            id="summary"
            rows={3}
            value={formData.summary}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
              errors.summary ? 'border-red-300' : ''
            }`}
            placeholder="Tóm tắt ngắn gọn về nội dung bài viết..."
          />
          {errors.summary && (
            <p className="mt-2 text-sm text-red-600">{errors.summary}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Danh mục
          </label>
          <select
            name="category"
            id="category"
            value={formData.category}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Hình ảnh đại diện
          </label>
          
          {imagePreview ? (
            <div className="mt-2">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-64 w-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 cursor-pointer"
              >
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Tải lên hình ảnh
                  </span>
                  <span className="text-sm text-gray-500">PNG, JPG lên đến 2MB</span>
                </div>
              </div>
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

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Nội dung *
          </label>
          <textarea
            name="content"
            id="content"
            rows={12}
            value={formData.content}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
              errors.content ? 'border-red-300' : ''
            }`}
            placeholder="Viết nội dung chi tiết của bài viết..."
          />
          {errors.content && (
            <p className="mt-2 text-sm text-red-600">{errors.content}</p>
          )}
        </div>

        {/* Options */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <input
              id="is_featured"
              name="is_featured"
              type="checkbox"
              checked={formData.is_featured}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900">
              Bài viết nổi bật
            </label>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Trạng thái
            </label>
            <select
              name="status"
              id="status"
              value={formData.status}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="draft">Bản nháp</option>
              <option value="published">Xuất bản</option>
            </select>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Đang tạo...' : 'Tạo bài viết'}
          </button>
        </div>
      </form>
    </div>
  );
}
