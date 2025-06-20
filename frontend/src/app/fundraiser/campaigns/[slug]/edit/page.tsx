'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeftIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TagIcon,
  PhotoIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  XCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Campaign {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  target_amount: number;
  current_amount: number;
  start_date: string;
  end_date: string;
  image_url: string;
  images_url: string[];
  status: string;
  category_id: number | string;
  categories: Category[];
  organizer_name: string;
  organizer_description: string;
  organizer_website: string;
  organizer_address: string;
  organizer_hotline: string;
  organizer_contact: string;
}

export default function EditCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params;
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category_id: '',
    target_amount: '',
    end_date: '',
    organizer_name: '',
    organizer_description: '',
    organizer_website: '',
    organizer_address: '',
    organizer_hotline: '',
    organizer_contact: ''
  });
  
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [previewMainImage, setPreviewMainImage] = useState<string | null>(null);
  const [previewAdditionalImages, setPreviewAdditionalImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        
        // In production, this would be a real API call
        // const response = await fetch(`/api/fundraiser/campaigns/${slug}`);
        // const data = await response.json();
        // setCampaign(data);
        
        // Mock data for development
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockCampaign: Campaign = {
          id: 1,
          title: 'Hỗ trợ trẻ em vùng cao',
          slug: 'ho-tro-tre-em-vung-cao',
          description: 'Chương trình hỗ trợ trẻ em vùng cao với các nhu yếu phẩm và đồ dùng học tập',
          content: 'Nội dung chi tiết về chiến dịch hỗ trợ trẻ em vùng cao. Bao gồm các hoạt động, đối tượng hưởng lợi và cách thức sử dụng tiền quyên góp.\n\nCác hoạt động dự kiến:\n- Mua sắm đồ dùng học tập\n- Tổ chức các buổi đào tạo kỹ năng sống\n- Xây dựng các không gian học tập cho trẻ em',
          status: 'active',
          current_amount: 452000000,
          target_amount: 500000000,
          start_date: '2025-04-15',
          end_date: '2025-08-15',
          image_url: '/images/campaigns/education.jpg',
          images_url: ['/images/campaigns/education.jpg', '/images/campaigns/education2.jpg'],
          category_id: 1,
          categories: [
            { id: 1, name: 'Giáo dục', slug: 'giao-duc' }
          ],
          organizer_name: 'Quỹ Hỗ Trợ Giáo Dục Vùng Cao',
          organizer_description: 'Quỹ Hỗ Trợ Giáo Dục Vùng Cao hoạt động với mục tiêu nâng cao chất lượng giáo dục cho trẻ em các vùng khó khăn',
          organizer_website: 'https://quygiaoduc.org',
          organizer_address: 'Số 123, Đường Láng, Quận Đống Đa, Hà Nội',
          organizer_hotline: '0987654321',
          organizer_contact: 'contact@quygiaoduc.org'
        };
        
        setCampaign(mockCampaign);
        
        setFormData({
          title: mockCampaign.title,
          description: mockCampaign.description,
          content: mockCampaign.content,
          category_id: mockCampaign.category_id.toString(),
          target_amount: mockCampaign.target_amount.toString(),
          end_date: mockCampaign.end_date.split('T')[0],
          organizer_name: mockCampaign.organizer_name,
          organizer_description: mockCampaign.organizer_description,
          organizer_website: mockCampaign.organizer_website,
          organizer_address: mockCampaign.organizer_address,
          organizer_hotline: mockCampaign.organizer_hotline,
          organizer_contact: mockCampaign.organizer_contact
        });
        
        setPreviewMainImage(mockCampaign.image_url);
        setPreviewAdditionalImages(mockCampaign.images_url.slice(1) || []);
        
      } catch (err) {
        console.error('Error fetching campaign:', err);
        setErrors({ form: 'Có lỗi xảy ra khi tải thông tin chiến dịch. Vui lòng thử lại sau.' });
      } finally {
        setLoading(false);
      }
    };
    
    const fetchCategories = async () => {
      try {
        // In production, this would be a real API call
        // const response = await fetch('/api/categories');
        // const data = await response.json();
        // setCategories(data);
        
        // Mock data for development
        setCategories([
          { id: 1, name: 'Giáo dục', slug: 'giao-duc' },
          { id: 2, name: 'Y tế', slug: 'y-te' },
          { id: 3, name: 'Thiên tai', slug: 'thien-tai' },
          { id: 4, name: 'Trẻ em', slug: 'tre-em' },
          { id: 5, name: 'Người già', slug: 'nguoi-gia' },
          { id: 6, name: 'Người khuyết tật', slug: 'nguoi-khuyet-tat' },
          { id: 7, name: 'Môi trường', slug: 'moi-truong' },
          { id: 8, name: 'Cộng đồng', slug: 'cong-dong' }
        ]);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    
    if (slug) {
      fetchCampaign();
      fetchCategories();
    }
  }, [slug]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMainImage(file);
      setPreviewMainImage(URL.createObjectURL(file));
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newImages = [...additionalImages, ...filesArray].slice(0, 5); // Limit to 5 images
      setAdditionalImages(newImages);
      
      // Create new preview URLs
      const existingPreviews = previewAdditionalImages.filter(url => !url.startsWith('blob:'));
      const newFilePreviews = newImages.map(file => URL.createObjectURL(file));
      
      setPreviewAdditionalImages([...existingPreviews, ...newFilePreviews].slice(0, 5));
    }
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
    setPreviewAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề chiến dịch';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Vui lòng nhập mô tả ngắn gọn cho chiến dịch';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Vui lòng nhập nội dung chi tiết cho chiến dịch';
    }
    
    if (!formData.category_id) {
      newErrors.category_id = 'Vui lòng chọn danh mục cho chiến dịch';
    }
    
    if (!formData.end_date) {
      newErrors.end_date = 'Vui lòng chọn ngày kết thúc chiến dịch';
    } else {
      const endDate = new Date(formData.end_date);
      const today = new Date();
      if (endDate <= today) {
        newErrors.end_date = 'Ngày kết thúc phải lớn hơn ngày hiện tại';
      }
    }
    
    if (!previewMainImage) {
      newErrors.mainImage = 'Vui lòng tải lên hình ảnh đại diện cho chiến dịch';
    }
    
    if (!formData.organizer_name.trim()) {
      newErrors.organizer_name = 'Vui lòng nhập tên tổ chức hoặc cá nhân tổ chức';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCurrency = (value: string) => {
    const number = value.replace(/[^0-9]/g, '');
    if (!number) return '';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(parseInt(number));
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setFormData(prev => ({
      ...prev,
      target_amount: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In production, this would be a real API call with FormData
      // const formDataObj = new FormData();
      // Object.keys(formData).forEach(key => formDataObj.append(key, formData[key as keyof typeof formData]));
      // if (mainImage) formDataObj.append('image', mainImage);
      // additionalImages.forEach(image => formDataObj.append('additional_images[]', image));
      
      // const response = await fetch(`/api/fundraiser/campaigns/${slug}`, {
      //   method: 'PUT',
      //   body: formDataObj
      // });
      
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.message);
      
      // Mock successful response for development
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSuccess(true);
      
      // Redirect after showing success message
      setTimeout(() => {
        router.push('/fundraiser/campaigns');
      }, 2000);
      
    } catch (err) {
      console.error('Error updating campaign:', err);
      setErrors({ 
        form: 'Có lỗi xảy ra khi cập nhật chiến dịch. Vui lòng thử lại sau.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto my-12 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <CheckCircleIcon className="h-8 w-8 text-green-600" aria-hidden="true" />
        </div>
        <h3 className="mt-3 text-lg font-medium text-gray-900">Cập nhật chiến dịch thành công!</h3>
        <p className="mt-2 text-sm text-gray-500">
          Thông tin chiến dịch của bạn đã được cập nhật thành công. 
          {campaign?.status === 'active' ? ' Các thay đổi sẽ được hiển thị ngay lập tức.' : ' Các thay đổi sẽ được kiểm duyệt trước khi hiển thị.'}
        </p>
        <div className="mt-5">
          <Link href="/fundraiser/campaigns" className="text-sm font-medium text-orange-600 hover:text-orange-500">
            Quay lại quản lý chiến dịch
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <Link 
          href="/fundraiser/campaigns" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeftIcon className="h-5 w-5 mr-1" />
          Quay lại danh sách chiến dịch
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-orange-500 px-6 py-4">
          <h1 className="text-xl font-bold text-white">Chỉnh sửa chiến dịch</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {errors.form && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex items-center">
                <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{errors.form}</p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 text-orange-500" />
                Thông tin chiến dịch
              </h2>
              
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Tiêu đề chiến dịch <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  className={`mt-1 block w-full border ${errors.title ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm`}
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Nhập tiêu đề chiến dịch"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Mô tả ngắn <span className="text-red-500">*</span></label>
                <textarea
                  name="description"
                  id="description"
                  rows={3}
                  className={`mt-1 block w-full border ${errors.description ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm`}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Mô tả ngắn gọn về chiến dịch (150-200 từ)"
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>
              
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">Nội dung chi tiết <span className="text-red-500">*</span></label>
                <textarea
                  name="content"
                  id="content"
                  rows={8}
                  className={`mt-1 block w-full border ${errors.content ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm`}
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Mô tả chi tiết về chiến dịch, mục đích, đối tượng hưởng lợi, cách thức sử dụng tiền quyên góp..."
                />
                {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                    <div className="flex items-center">
                      <TagIcon className="h-4 w-4 mr-1 text-gray-400" />
                      Danh mục <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <select
                    name="category_id"
                    id="category_id"
                    className={`mt-1 block w-full border ${errors.category_id ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm`}
                    value={formData.category_id}
                    onChange={handleChange}
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                  {errors.category_id && <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>}
                </div>
                
                <div>
                  <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                      Ngày kết thúc <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    id="end_date"
                    className={`mt-1 block w-full border ${errors.end_date ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm`}
                    value={formData.end_date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
                </div>
              </div>
              
              <div className="border border-gray-200 bg-gray-50 rounded-md p-4">
                <div className="flex items-center space-x-2">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Số tiền đã quyên góp:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {campaign && new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(campaign.current_amount)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 mt-2">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Số tiền mục tiêu:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formData.target_amount ? formatCurrency(formData.target_amount) : 'Chưa đặt mục tiêu'}
                  </span>
                </div>
                
                <div className="mt-3">
                  <label htmlFor="target_amount" className="block text-sm font-medium text-gray-700">Cập nhật số tiền mục tiêu:</label>
                  <input
                    type="text"
                    name="target_amount"
                    id="target_amount"
                    className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm`}
                    value={formData.target_amount ? formatCurrency(formData.target_amount) : ''}
                    onChange={handleCurrencyChange}
                    placeholder="VD: 50.000.000 VND"
                    disabled={campaign?.status === 'completed'}
                  />
                  {campaign?.status === 'completed' && (
                    <p className="mt-1 text-xs text-gray-500">Không thể thay đổi số tiền mục tiêu cho chiến dịch đã hoàn thành</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right Column - Organizer Info & Images */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <PhotoIcon className="h-5 w-5 mr-2 text-orange-500" />
                  Hình ảnh
                </h2>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Hình ảnh đại diện <span className="text-red-500">*</span></label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      {previewMainImage ? (
                        <div>
                          <img src={previewMainImage} alt="Preview" className="mx-auto h-40 w-auto object-cover mb-2" />
                          <button 
                            type="button"
                            onClick={() => {
                              setMainImage(null);
                              setPreviewMainImage(null);
                            }}
                            className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Xóa
                          </button>
                        </div>
                      ) : (
                        <>
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label htmlFor="main-image" className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500">
                              <span>Tải lên hình ảnh</span>
                              <input 
                                id="main-image" 
                                name="main-image" 
                                type="file" 
                                className="sr-only" 
                                accept="image/*"
                                onChange={handleMainImageChange}
                                ref={fileInputRef}
                              />
                            </label>
                            <p className="pl-1">hoặc kéo thả</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 5MB</p>
                        </>
                      )}
                    </div>
                  </div>
                  {errors.mainImage && <p className="mt-1 text-sm text-red-600">{errors.mainImage}</p>}
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700">Hình ảnh bổ sung (tối đa 5 hình)</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      {previewAdditionalImages.length > 0 ? (
                        <div>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {previewAdditionalImages.map((preview, index) => (
                              <div key={index} className="relative">
                                <img src={preview} alt={`Preview ${index + 1}`} className="h-24 w-auto object-cover" />
                                <button
                                  type="button"
                                  onClick={() => removeAdditionalImage(index)}
                                  className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1"
                                >
                                  <XCircleIcon className="h-4 w-4 text-red-700" />
                                </button>
                              </div>
                            ))}
                          </div>
                          {previewAdditionalImages.length < 5 && (
                            <button 
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            >
                              Thêm hình ảnh
                            </button>
                          )}
                        </div>
                      ) : (
                        <>
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label htmlFor="additional-images" className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500">
                              <span>Tải lên hình ảnh</span>
                              <input 
                                id="additional-images" 
                                name="additional-images" 
                                type="file" 
                                className="sr-only" 
                                accept="image/*"
                                onChange={handleAdditionalImagesChange}
                                multiple
                              />
                            </label>
                            <p className="pl-1">hoặc kéo thả</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 5MB mỗi ảnh</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <InformationCircleIcon className="h-5 w-5 mr-2 text-orange-500" />
                  Thông tin nhà tổ chức
                </h2>
                
                <div className="mt-4">
                  <div>
                    <label htmlFor="organizer_name" className="block text-sm font-medium text-gray-700">Tên tổ chức/cá nhân <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="organizer_name"
                      id="organizer_name"
                      className={`mt-1 block w-full border ${errors.organizer_name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm`}
                      value={formData.organizer_name}
                      onChange={handleChange}
                      placeholder="Tên tổ chức hoặc cá nhân tổ chức chiến dịch"
                    />
                    {errors.organizer_name && <p className="mt-1 text-sm text-red-600">{errors.organizer_name}</p>}
                  </div>
                  
                  <div className="mt-4">
                    <label htmlFor="organizer_description" className="block text-sm font-medium text-gray-700">Giới thiệu về tổ chức</label>
                    <textarea
                      name="organizer_description"
                      id="organizer_description"
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      value={formData.organizer_description}
                      onChange={handleChange}
                      placeholder="Mô tả ngắn gọn về tổ chức/cá nhân của bạn"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 mt-4 gap-4">
                    <div>
                      <label htmlFor="organizer_website" className="block text-sm font-medium text-gray-700">Website</label>
                      <input
                        type="text"
                        name="organizer_website"
                        id="organizer_website"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        value={formData.organizer_website}
                        onChange={handleChange}
                        placeholder="VD: https://www.example.org"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="organizer_address" className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                      <input
                        type="text"
                        name="organizer_address"
                        id="organizer_address"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        value={formData.organizer_address}
                        onChange={handleChange}
                        placeholder="Địa chỉ của tổ chức/cá nhân"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="organizer_hotline" className="block text-sm font-medium text-gray-700">Hotline</label>
                      <input
                        type="text"
                        name="organizer_hotline"
                        id="organizer_hotline"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        value={formData.organizer_hotline}
                        onChange={handleChange}
                        placeholder="Số điện thoại liên hệ"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="organizer_contact" className="block text-sm font-medium text-gray-700">Email liên hệ</label>
                      <input
                        type="email"
                        name="organizer_contact"
                        id="organizer_contact"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        value={formData.organizer_contact}
                        onChange={handleChange}
                        placeholder="Email liên hệ"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-5 border-t border-gray-200 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              <span className="text-red-500">*</span> là thông tin bắt buộc
            </p>
            <div className="flex items-center space-x-3">
              <Link 
                href="/fundraiser/campaigns"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Hủy
              </Link>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang lưu...
                  </>
                ) : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
