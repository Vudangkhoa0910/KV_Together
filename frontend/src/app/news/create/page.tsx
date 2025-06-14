'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const CreateNews = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    summary: '',
    content: '',
    tags: '',
    image: null as File | null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: 'community', name: 'Cộng đồng' },
    { id: 'events', name: 'Sự kiện' },
    { id: 'stories', name: 'Câu chuyện' },
    { id: 'updates', name: 'Cập nhật' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log('Form submitted:', formData);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link href="/news" className="hover:text-orange-500">
              <i className="fas fa-arrow-left mr-2"></i>
              Quay lại
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-4">Tạo bài viết mới</h1>
          <p className="text-gray-600">
            Chia sẻ những câu chuyện ý nghĩa và cập nhật thông tin mới nhất về các hoạt động thiện nguyện.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold">Thông tin cơ bản</h2>
            </div>
            <div className="card-body space-y-6">
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Tiêu đề bài viết
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Nhập tiêu đề bài viết"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category" className="form-label">
                  Danh mục
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="summary" className="form-label">
                  Tóm tắt
                </label>
                <textarea
                  id="summary"
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows={3}
                  placeholder="Tóm tắt ngắn gọn về bài viết (hiển thị ở trang danh sách)"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="tags" className="form-label">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Nhập các tags, phân cách bằng dấu phẩy"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Ví dụ: từ thiện, cộng đồng, giáo dục
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold">Nội dung bài viết</h2>
              <p className="text-sm text-gray-500 mt-1">
                Hỗ trợ định dạng Markdown
              </p>
            </div>
            <div className="card-body">
              <div className="form-group">
                <div className="mb-2 flex justify-between text-sm">
                  <div>
                    <span className="font-medium">Định dạng:</span>
                    <span className="ml-2 text-gray-500">
                      **in đậm**, *in nghiêng*, # Tiêu đề, - Danh sách
                    </span>
                  </div>
                  <a
                    href="https://www.markdownguide.org/basic-syntax/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:underline"
                  >
                    Xem hướng dẫn
                  </a>
                </div>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="form-textarea font-mono"
                  rows={20}
                  placeholder="Nhập nội dung bài viết (hỗ trợ Markdown)"
                  required
                />
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold">Hình ảnh đại diện</h2>
            </div>
            <div className="card-body">
              <div className="form-group">
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative">
                      <div className="relative h-64 rounded-lg overflow-hidden">
                        <Image
                          src={imagePreview}
                          alt="Article preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData(prev => ({ ...prev, image: null }));
                        }}
                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-orange-500 transition-colors"
                    >
                      <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                      <p className="text-gray-600">
                        Kéo thả hình ảnh vào đây hoặc click để chọn file
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        PNG, JPG (Tối đa 5MB)
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between">
            <Link href="/news" className="btn btn-outline">
              Hủy
            </Link>
            <button type="submit" className="btn btn-primary">
              Đăng bài
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNews; 