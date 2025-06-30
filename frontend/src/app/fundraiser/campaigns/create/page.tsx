'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { createCampaign } from '@/services/api';
import { toast } from 'react-hot-toast';
import { 
  ChevronLeftIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TagIcon,
  PhotoIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  XCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function CreateCampaignPage() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
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

    fetchCategories();
    
    // Pre-fill organizer details if available
    if (user) {
      setFormData(prev => ({
        ...prev,
        organizer_name: user.name || '',
        organizer_contact: user.email || ''
      }));
    }
  }, [user]);

  // Category slug to ID mapping
  const categoryMap: Record<string, string> = {
    'giao-duc': '1',
    'tre-em': '2',
    'cong-dong': '3',
    'y-te': '4',
    'nguoi-cao-tuoi': '5',
    'khan-cap': '6',
    'moi-truong': '7',
    // English equivalents
    'education': '1',
    'children': '2',
    'community': '3',
    'medical': '4',
    'elderly': '5',
    'emergency': '6',
    'environment': '7'
  };
  
  // Helper function to get category ID from slug
  const getCategoryIdFromSlug = (slug: string): string => {
    return categoryMap[slug] || '';
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Special handling for category field if it exists
    if (name === 'category') {
      // Find the category ID for the selected slug
      const categoryId = getCategoryIdFromSlug(value);
      setFormData(prev => ({
        ...prev,
        category_id: categoryId
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
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
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file hình ảnh (PNG, JPG, GIF)', {
          icon: '⚠️',
          duration: 4000,
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước file không được vượt quá 5MB', {
          icon: '⚠️',
          duration: 4000,
        });
        return;
      }
      
      setMainImage(file);
      setPreviewMainImage(URL.createObjectURL(file));
      
      // Clear error if exists
      if (errors.mainImage) {
        setErrors(prev => ({
          ...prev,
          mainImage: ''
        }));
      }
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Validate each file
      const validFiles = filesArray.filter(file => {
        if (!file.type.startsWith('image/')) {
          toast.error(`File ${file.name} không phải là hình ảnh`, {
            icon: '⚠️',
            duration: 3000,
          });
          return false;
        }
        
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} vượt quá 5MB`, {
            icon: '⚠️',
            duration: 3000,
          });
          return false;
        }
        
        return true;
      });
      
      const newImages = [...additionalImages, ...validFiles].slice(0, 5);
      setAdditionalImages(newImages);
      
      const newPreviews = newImages.map(file => URL.createObjectURL(file));
      setPreviewAdditionalImages(newPreviews);
      
      if (validFiles.length > 0) {
        toast.success(`Đã thêm ${validFiles.length} hình ảnh`, {
          icon: '✅',
          duration: 2000,
        });
      }
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent, isMainImage = false) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    
    if (isMainImage && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
        setMainImage(file);
        setPreviewMainImage(URL.createObjectURL(file));
        
        if (errors.mainImage) {
          setErrors(prev => ({ ...prev, mainImage: '' }));
        }
      } else {
        toast.error('File không hợp lệ. Vui lòng chọn hình ảnh dưới 5MB');
      }
    } else {
      // Handle additional images
      const validFiles = files.filter(file => 
        file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
      );
      
      if (validFiles.length > 0) {
        const newImages = [...additionalImages, ...validFiles].slice(0, 5);
        setAdditionalImages(newImages);
        setPreviewAdditionalImages(newImages.map(file => URL.createObjectURL(file)));
        toast.success(`Đã thêm ${validFiles.length} hình ảnh`);
      }
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
    
    if (!formData.content?.trim()) {
      // If content is empty, use description as content
      console.log("Content is empty, using description as content");
    }
    
    if (!formData.category_id) {
      newErrors.category_id = 'Vui lòng chọn danh mục cho chiến dịch';
    }
    
    const targetAmount = parseFloat(formData.target_amount);
    if (isNaN(targetAmount) || targetAmount < 1000000) {
      newErrors.target_amount = 'Số tiền mục tiêu phải từ 1.000.000 VND trở lên';
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
    
    if (!mainImage) {
      newErrors.mainImage = 'Vui lòng tải lên hình ảnh đại diện cho chiến dịch';
    }
    
    if (!formData.organizer_name.trim()) {
      newErrors.organizer_name = 'Vui lòng nhập tên tổ chức hoặc cá nhân tổ chức';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Log form submission data for debugging
    console.log("Form data before submission:", formData);
    
    // Extract form data from the event in case it's being submitted directly
    const formElement = e.currentTarget;
    const formEventData = new FormData(formElement);
    console.log("Form data from event:", Object.fromEntries(formEventData.entries()));
    
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create a FormData object
      const formDataObj = new FormData();
      
      // Log what we're seeing in the UI for debugging
      console.log("Category ID value from form:", formData.category_id);
      
      // Map form fields to match backend validation requirements
      formDataObj.append('title', formData.title);
      formDataObj.append('description', formData.description);
      formDataObj.append('content', formData.content || formData.description); 
      formDataObj.append('target_amount', formData.target_amount);
      formDataObj.append('end_date', formData.end_date);
      
      // IMPORTANT: Fix for the category_id issue
      // Check if we have a direct category value from the event data
      const categoryFromEvent = formEventData.get('category');
      if (categoryFromEvent && typeof categoryFromEvent === 'string') {
        // Get category ID from our mapping
        const categoryId = getCategoryIdFromSlug(categoryFromEvent);
        if (categoryId) {
          console.log(`Found category ID for ${categoryFromEvent}: ${categoryId}`);
          formDataObj.append('category_id', categoryId);
        } else {
          console.error("No category ID found for slug:", categoryFromEvent);
          // Try finding from categories array as backup
          const matchingCategory = categories.find(cat => cat.slug === categoryFromEvent || cat.slug === categoryFromEvent.toLowerCase());
          if (matchingCategory) {
            console.log(`Found matching category from array: ${matchingCategory.name} (ID: ${matchingCategory.id})`);
            formDataObj.append('category_id', matchingCategory.id.toString());
          } else {
            console.error("No matching category found from array either.");
            formDataObj.append('category_id', formData.category_id); // Fall back to stored value
          }
        }
      } else {
        formDataObj.append('category_id', formData.category_id);
      }
      
      // Organizer details
      formDataObj.append('organizer_name', formData.organizer_name);
      if (formData.organizer_description) formDataObj.append('organizer_description', formData.organizer_description);
      if (formData.organizer_website) formDataObj.append('organizer_website', formData.organizer_website);
      if (formData.organizer_address) formDataObj.append('organizer_address', formData.organizer_address);
      if (formData.organizer_hotline) formDataObj.append('organizer_hotline', formData.organizer_hotline);
      if (formData.organizer_contact) formDataObj.append('organizer_contact', formData.organizer_contact);
      
      // Add main image if exists
      if (mainImage) {
        formDataObj.append('image', mainImage);
      } else {
        console.error('Main image is missing!');
        setErrors({
          ...errors,
          mainImage: 'Vui lòng tải lên hình ảnh đại diện cho chiến dịch'
        });
        setIsSubmitting(false);
        return;
      }
      
      // Add additional images if any
      additionalImages.forEach((image, index) => {
        formDataObj.append(`additional_images[${index}]`, image);
      });
      
      // Log FormData contents for debugging
      console.log("FormData contents being sent to server:");
      for (let [key, value] of formDataObj.entries()) {
        console.log(`${key}: ${value instanceof File ? 'File: ' + value.name : value}`);
      }
      
      // Get auth token for debugging
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      console.log("Auth token exists:", !!token);
      if (!token) {
        console.error("No authentication token found");
        toast.error('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.', {
          icon: '🔐',
          duration: 5000,
          style: {
            background: '#EF4444',
            color: '#fff',
            fontWeight: '500',
            padding: '16px',
            borderRadius: '12px',
          },
        });
        setIsSubmitting(false);
        return;
      }
      
      // Use the API service to create a campaign
      const { api } = await import('@/services/api');
      const response = await createCampaign(formDataObj);
      console.log("API response:", response);
      
      setIsSuccess(true);
      
      // Show success toast
      toast.success('🎉 Chiến dịch đã được tạo thành công! Đang chuyển hướng...', {
        duration: 3000,
        style: {
          background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
          color: '#fff',
          fontWeight: '600',
          padding: '16px',
          borderRadius: '12px',
          maxWidth: '500px',
        },
      });
      
      // Redirect after showing success message
      setTimeout(() => {
        router.push('/fundraiser/campaigns');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error creating campaign:', err);
      
      // Extract validation errors if available
      if (err.response && err.response.data && err.response.data.errors) {
        const validationErrors: Record<string, string> = {};
        
        // Create user-friendly error messages for each field
        Object.entries(err.response.data.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            validationErrors[field] = messages[0];
          }
        });
        
        setErrors(validationErrors);
      } else {
        // Set a generic error if no specific validation errors
        const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi tạo chiến dịch. Vui lòng thử lại sau.';
        setErrors({ 
          form: errorMessage 
        });
        
        // Show detailed error info in console for debugging
        console.log('Error details:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          headers: err.response?.headers
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Debug helper function
  const handleDebugSubmit = async () => {
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    try {
      // Create a FormData object
      const formDataObj = new FormData();
      
      // Map all fields
      formDataObj.append('title', formData.title);
      formDataObj.append('description', formData.description);
      formDataObj.append('content', formData.content || formData.description);
      formDataObj.append('target_amount', formData.target_amount);
      formDataObj.append('end_date', formData.end_date);
      formDataObj.append('category_id', formData.category_id);
      
      // Organizer details
      formDataObj.append('organizer_name', formData.organizer_name);
      if (formData.organizer_description) formDataObj.append('organizer_description', formData.organizer_description);
      if (formData.organizer_website) formDataObj.append('organizer_website', formData.organizer_website);
      if (formData.organizer_address) formDataObj.append('organizer_address', formData.organizer_address);
      if (formData.organizer_hotline) formDataObj.append('organizer_hotline', formData.organizer_hotline);
      if (formData.organizer_contact) formDataObj.append('organizer_contact', formData.organizer_contact);
      
      // Add main image if exists
      if (mainImage) {
        formDataObj.append('image', mainImage);
      } else {
        toast.error('Vui lòng tải lên hình ảnh đại diện cho chiến dịch', {
          icon: '📷',
          duration: 4000,
        });
        return;
      }
      
      // Add additional images if any
      additionalImages.forEach((image, index) => {
        formDataObj.append(`additional_images[${index}]`, image);
      });
      
      // Log FormData contents
      console.log("FormData contents for debug:");
      for (let [key, value] of formDataObj.entries()) {
        console.log(`${key}: ${value instanceof File ? 'File: ' + value.name : value}`);
      }
      
      // Call debug endpoint
      const { api } = await import('@/services/api');
      const response = await createCampaign(formDataObj);
      console.log("Debug response:", response);
      
      toast.success('Debug information sent! Check console for details.', {
        icon: '🐛',
        duration: 3000,
      });
    } catch (err) {
      console.error("Debug error:", err);
      toast.error('Error during debug. Check console for details.', {
        icon: '❌',
        duration: 3000,
      });
    }
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

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center transform animate-in zoom-in-95 duration-500">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 mb-4 animate-bounce">
              <CheckCircleIcon className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              🎉 Chiến dịch đã được tạo thành công!
            </h3>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-orange-600 mx-auto rounded-full mb-4"></div>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-6">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-6 w-6 text-orange-600 mt-1 mr-3 flex-shrink-0" />
              <div className="text-left">
                <p className="text-orange-800 font-semibold mb-2">Thông tin quan trọng:</p>
                <p className="text-orange-700 text-sm leading-relaxed">
                  Chiến dịch của bạn đã được gửi và đang chờ phê duyệt từ quản trị viên. 
                  Bạn sẽ nhận được thông báo qua email khi chiến dịch được phê duyệt và công khai.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/fundraiser/campaigns" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <ChevronLeftIcon className="h-5 w-5 mr-2" />
              Quay lại quản lý chiến dịch
            </Link>
            
            <Link 
              href="/fundraiser/campaigns/create" 
              className="inline-flex items-center px-6 py-3 bg-white border-2 border-orange-500 text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-all duration-200"
            >
              Tạo chiến dịch khác
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <Link 
            href="/fundraiser/campaigns" 
            className="inline-flex items-center text-orange-600 hover:text-orange-800 font-medium transition-colors duration-200 group"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Quay lại quản lý chiến dịch
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
                <h1 className="text-2xl font-bold text-white mb-1">Tạo chiến dịch gây quỹ mới</h1>
                <p className="text-orange-100">Chia sẻ câu chuyện của bạn và kết nối với cộng đồng</p>
              </div>
            </div>
          </div>          
        <form onSubmit={handleSubmit} className="p-8 bg-gray-50">
          {errors.form && (
            <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center">
                <XCircleIcon className="h-6 w-6 text-red-500 mr-3" />
                <p className="text-sm text-red-700 font-medium">{errors.form}</p>
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
                  <label htmlFor="target_amount" className="block text-sm font-medium text-gray-700">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 mr-1 text-gray-400" />
                      Số tiền mục tiêu <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    name="target_amount"
                    id="target_amount"
                    className={`mt-1 block w-full border ${errors.target_amount ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm`}
                    value={formData.target_amount ? formatCurrency(formData.target_amount) : ''}
                    onChange={handleCurrencyChange}
                    placeholder="VD: 50.000.000 VND"
                  />
                  {errors.target_amount && <p className="mt-1 text-sm text-red-600">{errors.target_amount}</p>}
                </div>
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
            
            {/* Right Column - Organizer Info & Images */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <PhotoIcon className="h-5 w-5 mr-2 text-orange-500" />
                  Hình ảnh
                </h2>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Hình ảnh đại diện <span className="text-red-500">*</span>
                  </label>
                  <div 
                    className={`relative border-2 border-dashed rounded-xl transition-all duration-300 ${
                      isDragOver 
                        ? 'border-orange-400 bg-orange-50' 
                        : errors.mainImage 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300 hover:border-orange-300 hover:bg-orange-50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, true)}
                  >
                    {previewMainImage ? (
                      <div className="relative p-4">
                        <img 
                          src={previewMainImage} 
                          alt="Preview" 
                          className="mx-auto h-48 w-auto object-cover rounded-lg shadow-md" 
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            setMainImage(null);
                            setPreviewMainImage(null);
                          }}
                          className="absolute top-6 right-6 p-2 bg-red-100 hover:bg-red-200 rounded-full transition-colors duration-200 shadow-lg"
                        >
                          <XCircleIcon className="h-5 w-5 text-red-600" />
                        </button>
                        <div className="mt-4 text-center">
                          <p className="text-sm text-gray-600">
                            {mainImage?.name} ({((mainImage?.size || 0) / 1024 / 1024).toFixed(1)}MB)
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center px-6 py-10">
                        <CloudArrowUpIcon className={`mx-auto h-16 w-16 mb-4 ${isDragOver ? 'text-orange-500' : 'text-gray-400'} transition-colors duration-300`} />
                        <div className="text-center">
                          <label htmlFor="main-image" className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500">
                            <span className="text-lg">Nhấn để tải lên</span>
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
                          <p className="text-gray-500 ml-1">hoặc kéo thả file vào đây</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF tối đa 5MB</p>
                      </div>
                    )}
                  </div>
                  {errors.mainImage && <p className="mt-2 text-sm text-red-600">{errors.mainImage}</p>}
                </div>
                
                <div className="mt-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Hình ảnh bổ sung (tối đa 5 hình)
                  </label>
                  <div 
                    className={`border-2 border-dashed rounded-xl transition-all duration-300 ${
                      isDragOver 
                        ? 'border-orange-400 bg-orange-50' 
                        : 'border-gray-300 hover:border-orange-300 hover:bg-orange-50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, false)}
                  >
                    {previewAdditionalImages.length > 0 ? (
                      <div className="p-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                          {previewAdditionalImages.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={preview} 
                                alt={`Preview ${index + 1}`} 
                                className="h-32 w-full object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-200" 
                              />
                              <button
                                type="button"
                                onClick={() => removeAdditionalImage(index)}
                                className="absolute -top-2 -right-2 p-1.5 bg-red-100 hover:bg-red-200 rounded-full shadow-lg transition-colors duration-200"
                              >
                                <XCircleIcon className="h-4 w-4 text-red-600" />
                              </button>
                            </div>
                          ))}
                        </div>
                        {previewAdditionalImages.length < 5 && (
                          <div className="text-center">
                            <label htmlFor="additional-images" className="inline-flex items-center px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium rounded-lg cursor-pointer transition-colors duration-200">
                              <PhotoIcon className="h-5 w-5 mr-2" />
                              Thêm hình ảnh ({5 - previewAdditionalImages.length} còn lại)
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
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center px-6 py-8">
                        <PhotoIcon className={`mx-auto h-12 w-12 mb-4 ${isDragOver ? 'text-orange-500' : 'text-gray-400'} transition-colors duration-300`} />
                        <div className="text-center">
                          <label htmlFor="additional-images" className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500">
                            <span>Thêm hình ảnh bổ sung</span>
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
                          <p className="text-gray-500 ml-1">hoặc kéo thả file vào đây</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF tối đa 5MB mỗi ảnh</p>
                      </div>
                    )}
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
          
          <div className="mt-10 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500 flex items-center">
                <span className="text-red-500 text-base mr-1">*</span> 
                Các thông tin bắt buộc
              </p>
              
              <div className="flex items-center space-x-4">
                <Link 
                  href="/fundraiser/campaigns"
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
                      Đang tạo chiến dịch...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Tạo chiến dịch
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
        </form>
      </div>
    </div>
  </div>
  );
}
