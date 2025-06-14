'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface FormData {
  title: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  maxParticipants: string;
  description: string;
  content: string;
  requirements: string[];
  benefits: string[];
  images: string[];
}

const CreateActivityPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    category: '',
    location: '',
    startDate: '',
    endDate: '',
    maxParticipants: '',
    description: '',
    content: '',
    requirements: [''],
    benefits: [''],
    images: [],
  });

  const categories = [
    { id: 'volunteer', name: 'Tình nguyện' },
    { id: 'charity', name: 'Từ thiện' },
    { id: 'education', name: 'Giáo dục' },
    { id: 'environment', name: 'Môi trường' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInputChange = (index: number, value: string, field: 'requirements' | 'benefits') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'requirements' | 'benefits') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (index: number, field: 'requirements' | 'benefits') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Convert FileList to Array and get URLs
      const imageUrls = Array.from(files).map(file => URL.createObjectURL(file));
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log('Form submitted:', formData);
    router.push('/activities');
  };

  const nextStep = () => {
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Tạo hoạt động mới</h1>
          <p className="text-gray-600">
            Chia sẻ hoạt động của bạn với cộng đồng
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((number) => (
            <div key={number} className="flex-1">
              <div className={`relative flex items-center ${number !== 3 ? 'after:content-[""] after:h-1 after:flex-1 after:ml-4 after:bg-gray-200' : ''}`}>
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${step === number ? 'bg-orange-500 text-white' : step > number ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                  {step > number ? <i className="fas fa-check"></i> : number}
                </div>
              </div>
              <div className="text-center mt-2 text-sm text-gray-600">
                {number === 1 ? 'Thông tin cơ bản' : number === 2 ? 'Nội dung chi tiết' : 'Hình ảnh & Hoàn tất'}
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="card">
              <div className="p-6 space-y-6">
                <div>
                  <label htmlFor="title" className="label">Tên hoạt động</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Nhập tên hoạt động"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="category" className="label">Danh mục</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="input"
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

                <div>
                  <label htmlFor="location" className="label">Địa điểm</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Nhập địa điểm tổ chức"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="label">Ngày bắt đầu</label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="label">Ngày kết thúc</label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="maxParticipants" className="label">Số lượng người tham gia tối đa</label>
                  <input
                    type="number"
                    id="maxParticipants"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Nhập số lượng người tham gia tối đa"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="label">Mô tả ngắn</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="input min-h-[100px]"
                    placeholder="Nhập mô tả ngắn về hoạt động"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Detailed Content */}
          {step === 2 && (
            <div className="space-y-8">
              <div className="card">
                <div className="p-6">
                  <label htmlFor="content" className="label">Nội dung chi tiết</label>
                  <div className="mb-2 text-sm text-gray-600">
                    Hỗ trợ định dạng Markdown
                  </div>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    className="input min-h-[300px] font-mono"
                    placeholder="# Mục tiêu&#10;- Mục tiêu 1&#10;- Mục tiêu 2&#10;&#10;# Thời gian và địa điểm&#10;..."
                    required
                  />
                </div>
              </div>

              <div className="card">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4">Yêu cầu tham gia</h3>
                  {formData.requirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => handleArrayInputChange(index, e.target.value, 'requirements')}
                        className="input flex-1"
                        placeholder="Nhập yêu cầu tham gia"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem(index, 'requirements')}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('requirements')}
                    className="btn btn-secondary mt-2"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Thêm yêu cầu
                  </button>
                </div>
              </div>

              <div className="card">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4">Quyền lợi</h3>
                  {formData.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) => handleArrayInputChange(index, e.target.value, 'benefits')}
                        className="input flex-1"
                        placeholder="Nhập quyền lợi"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem(index, 'benefits')}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('benefits')}
                    className="btn btn-secondary mt-2"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Thêm quyền lợi
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Images & Finish */}
          {step === 3 && (
            <div className="space-y-8">
              <div className="card">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4">Hình ảnh hoạt động</h3>
                  <div className="mb-4">
                    <label className="block mb-2">
                      <span className="sr-only">Chọn hình ảnh</span>
                      <input
                        type="file"
                        onChange={handleImageUpload}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-orange-50 file:text-orange-700
                          hover:file:bg-orange-100
                        "
                        multiple
                        accept="image/*"
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="relative h-40 rounded-lg overflow-hidden">
                          <Image
                            src={image}
                            alt={`Preview ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4">Xác nhận thông tin</h3>
                  <p className="text-gray-600 mb-4">
                    Vui lòng kiểm tra lại thông tin trước khi tạo hoạt động. Sau khi tạo, bạn vẫn có thể chỉnh sửa thông tin này.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center text-sm">
                      <i className="fas fa-check-circle text-green-500 mr-2"></i>
                      <span>Đã điền đầy đủ thông tin cơ bản</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <i className="fas fa-check-circle text-green-500 mr-2"></i>
                      <span>Đã thêm nội dung chi tiết</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <i className="fas fa-check-circle text-green-500 mr-2"></i>
                      <span>Đã thêm {formData.images.length} hình ảnh</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="btn btn-secondary"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Quay lại
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn btn-primary ml-auto"
              >
                Tiếp theo
                <i className="fas fa-arrow-right ml-2"></i>
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-primary ml-auto"
              >
                <i className="fas fa-check mr-2"></i>
                Tạo hoạt động
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateActivityPage; 