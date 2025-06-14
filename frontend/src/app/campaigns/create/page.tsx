'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const CreateCampaign = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    targetAmount: '',
    endDate: '',
    description: '',
    image: null as File | null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: 'education', name: 'Giáo dục' },
    { id: 'community', name: 'Cộng đồng' },
    { id: 'health', name: 'Y tế' },
    { id: 'environment', name: 'Môi trường' },
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
      <div className="max-w-3xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link href="/campaigns" className="hover:text-orange-500">
              <i className="fas fa-arrow-left mr-2"></i>
              Quay lại
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-4">Tạo chiến dịch mới</h1>
          <p className="text-gray-600">
            Hãy chia sẻ câu chuyện của bạn và bắt đầu hành trình gây quỹ cộng đồng.
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
                  Tên chiến dịch
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Nhập tên chiến dịch của bạn"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label htmlFor="targetAmount" className="form-label">
                    Số tiền mục tiêu
                  </label>
                  <input
                    type="number"
                    id="targetAmount"
                    name="targetAmount"
                    value={formData.targetAmount}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="VNĐ"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endDate" className="form-label">
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Details */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold">Chi tiết chiến dịch</h2>
            </div>
            <div className="card-body space-y-6">
              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Mô tả chiến dịch
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows={6}
                  placeholder="Mô tả chi tiết về chiến dịch của bạn..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Hình ảnh chiến dịch</label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative">
                      <div className="relative h-64 rounded-lg overflow-hidden">
                        <Image
                          src={imagePreview}
                          alt="Campaign preview"
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
            <Link href="/campaigns" className="btn btn-outline">
              Hủy
            </Link>
            <button type="submit" className="btn btn-primary">
              Tạo chiến dịch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign; 