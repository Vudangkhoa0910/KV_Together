'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  ChevronLeftIcon,
  PlusIcon,
  PhotoIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface Campaign {
  id: number;
  title: string;
  slug: string;
  description: string;
  status: string;
  current_amount: number;
  target_amount: number;
  start_date: string;
  end_date: string;
  progress_percentage: number;
  image_url: string;
}

interface CampaignUpdate {
  id: number;
  campaign_id: number;
  content: string;
  image?: string;
  image_url?: string;
  created_at: string;
}

export default function CampaignUpdatesPage() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params;
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [updates, setUpdates] = useState<CampaignUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [updateToEdit, setUpdateToEdit] = useState<CampaignUpdate | null>(null);
  const [updateToDelete, setUpdateToDelete] = useState<CampaignUpdate | null>(null);
  
  const [formData, setFormData] = useState({
    content: '',
  });
  
  const [updateImage, setUpdateImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    const fetchCampaignAndUpdates = async () => {
      try {
        setLoading(true);
        
        // In production, this would be real API calls
        // const campaignResponse = await fetch(`/api/fundraiser/campaigns/${slug}`);
        // const campaignData = await campaignResponse.json();
        // const updatesResponse = await fetch(`/api/fundraiser/campaigns/${slug}/updates`);
        // const updatesData = await updatesResponse.json();
        
        // Mock data for development
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockCampaign: Campaign = {
          id: 1,
          title: 'Hỗ trợ trẻ em vùng cao',
          slug: 'ho-tro-tre-em-vung-cao',
          description: 'Chương trình hỗ trợ trẻ em vùng cao với các nhu yếu phẩm và đồ dùng học tập',
          status: 'active',
          current_amount: 452000000,
          target_amount: 500000000,
          start_date: '2025-04-15',
          end_date: '2025-08-15',
          progress_percentage: 90.4,
          image_url: '/images/campaigns/education.jpg'
        };
        
        const mockUpdates: CampaignUpdate[] = [
          {
            id: 1,
            campaign_id: 1,
            content: 'Chúng tôi đã mua được 500 bộ đồ dùng học tập đầu tiên và chuẩn bị vận chuyển lên vùng cao trong tuần tới. Cảm ơn sự đóng góp của tất cả mọi người!',
            image_url: '/images/campaigns/update1.jpg',
            created_at: '2025-04-25T08:30:00Z'
          },
          {
            id: 2,
            campaign_id: 1,
            content: 'Đợt vận chuyển đầu tiên đã đến nơi! Các em học sinh đã nhận được đồ dùng học tập và rất phấn khởi. Chúng tôi sẽ tiếp tục với đợt hỗ trợ tiếp theo cho các trường còn lại trong tháng sau.',
            image_url: '/images/campaigns/update2.jpg',
            created_at: '2025-05-10T15:45:00Z'
          },
        ];
        
        setCampaign(mockCampaign);
        setUpdates(mockUpdates);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    if (slug) {
      fetchCampaignAndUpdates();
    }
  }, [slug]);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUpdateImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };
  
  const resetForm = () => {
    setFormData({ content: '' });
    setUpdateImage(null);
    setPreviewImage(null);
    setUpdateToEdit(null);
    setUpdateToDelete(null);
  };
  
  const validateForm = () => {
    if (!formData.content.trim()) {
      setError('Vui lòng nhập nội dung cập nhật');
      return false;
    }
    setError('');
    return true;
  };
  
  const handleAddUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // In production, this would be a real API call
      // const formDataObj = new FormData();
      // formDataObj.append('content', formData.content);
      // if (updateImage) formDataObj.append('image', updateImage);
      
      // const response = await fetch(`/api/fundraiser/campaigns/${slug}/updates`, {
      //   method: 'POST',
      //   body: formDataObj
      // });
      
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.message);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock new update
      const newUpdate: CampaignUpdate = {
        id: updates.length + 1,
        campaign_id: campaign?.id || 1,
        content: formData.content,
        image_url: previewImage || undefined,
        created_at: new Date().toISOString()
      };
      
      setUpdates([newUpdate, ...updates]);
      setSuccess('Cập nhật đã được thêm thành công.');
      resetForm();
      setIsAddModalOpen(false);
      
    } catch (err) {
      console.error('Error adding update:', err);
      setError('Đã xảy ra lỗi khi thêm cập nhật. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm() || !updateToEdit) return;
    
    setIsSubmitting(true);
    
    try {
      // In production, this would be a real API call
      // const formDataObj = new FormData();
      // formDataObj.append('content', formData.content);
      // if (updateImage) formDataObj.append('image', updateImage);
      
      // const response = await fetch(`/api/fundraiser/campaigns/${slug}/updates/${updateToEdit.id}`, {
      //   method: 'PUT',
      //   body: formDataObj
      // });
      
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.message);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update in local state
      const updatedUpdates = updates.map(update => {
        if (update.id === updateToEdit.id) {
          return {
            ...update,
            content: formData.content,
            image_url: previewImage || update.image_url
          };
        }
        return update;
      });
      
      setUpdates(updatedUpdates);
      setSuccess('Cập nhật đã được chỉnh sửa thành công.');
      resetForm();
      setIsEditModalOpen(false);
      
    } catch (err) {
      console.error('Error editing update:', err);
      setError('Đã xảy ra lỗi khi chỉnh sửa cập nhật. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteUpdate = async () => {
    if (!updateToDelete) return;
    
    setIsSubmitting(true);
    
    try {
      // In production, this would be a real API call
      // const response = await fetch(`/api/fundraiser/campaigns/${slug}/updates/${updateToDelete.id}`, {
      //   method: 'DELETE'
      // });
      
      // if (!response.ok) {
      //   const data = await response.json();
      //   throw new Error(data.message);
      // }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update in local state
      const updatedUpdates = updates.filter(update => update.id !== updateToDelete.id);
      setUpdates(updatedUpdates);
      setSuccess('Cập nhật đã được xóa thành công.');
      resetForm();
      setIsDeleteModalOpen(false);
      
    } catch (err) {
      console.error('Error deleting update:', err);
      setError('Đã xảy ra lỗi khi xóa cập nhật. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const openEditModal = (update: CampaignUpdate) => {
    setUpdateToEdit(update);
    setFormData({
      content: update.content
    });
    setPreviewImage(update.image_url || null);
    setIsEditModalOpen(true);
  };
  
  const openDeleteModal = (update: CampaignUpdate) => {
    setUpdateToDelete(update);
    setIsDeleteModalOpen(true);
  };
  
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
      
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex items-center">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      {success && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-orange-500 px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Quản lý cập nhật chiến dịch</h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-orange-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Thêm cập nhật
          </button>
        </div>
        
        <div className="p-6">
          {campaign && (
            <div className="flex items-center space-x-4 mb-6 p-4 bg-orange-50 rounded-lg">
              <img 
                src={campaign.image_url} 
                alt={campaign.title}
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <h2 className="text-lg font-medium text-gray-900">{campaign.title}</h2>
                <div className="flex items-center mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    campaign.status === 'active' ? 'bg-green-100 text-green-800' : 
                    campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {campaign.status === 'active' ? 'Đang hoạt động' : 
                     campaign.status === 'completed' ? 'Hoàn thành' : 
                     'Chờ duyệt'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <h2 className="text-lg font-medium text-gray-900 mb-4">Lịch sử cập nhật</h2>
          
          {updates.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">Chưa có cập nhật nào</h3>
              <p className="mt-1 text-sm text-gray-500">
                Bắt đầu bằng việc thêm cập nhật đầu tiên cho chiến dịch của bạn
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Thêm cập nhật
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {updates.map((update) => (
                <div key={update.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-sm text-gray-500">
                        {format(new Date(update.created_at), 'dd/MM/yyyy - HH:mm', { locale: vi })}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(update)}
                        className="text-gray-400 hover:text-orange-500"
                        title="Chỉnh sửa"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(update)}
                        className="text-gray-400 hover:text-red-500"
                        title="Xóa"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 whitespace-pre-wrap text-gray-700">{update.content}</div>
                  {update.image_url && (
                    <div className="mt-3">
                      <img 
                        src={update.image_url} 
                        alt="Update image" 
                        className="max-h-64 rounded-lg object-cover" 
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Add Update Modal */}
      <Transition appear show={isAddModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsAddModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Thêm cập nhật mới
                  </Dialog.Title>
                  <form onSubmit={handleAddUpdate}>
                    <div className="mt-4">
                      <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                        Nội dung cập nhật <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="content"
                        name="content"
                        rows={5}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        placeholder="Nhập nội dung cập nhật về tiến độ chiến dịch..."
                        value={formData.content}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Hình ảnh (không bắt buộc)
                      </label>
                      <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          {previewImage ? (
                            <div>
                              <img src={previewImage} alt="Preview" className="mx-auto h-40 w-auto object-cover" />
                              <button 
                                type="button"
                                onClick={() => {
                                  setUpdateImage(null);
                                  setPreviewImage(null);
                                }}
                                className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                Xóa
                              </button>
                            </div>
                          ) : (
                            <>
                              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                              <div className="flex text-sm text-gray-600">
                                <label htmlFor="update-image" className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500">
                                  <span>Tải lên hình ảnh</span>
                                  <input 
                                    id="update-image" 
                                    name="update-image" 
                                    type="file" 
                                    className="sr-only" 
                                    accept="image/*"
                                    onChange={handleImageChange}
                                  />
                                </label>
                                <p className="pl-1">hoặc kéo thả</p>
                              </div>
                              <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 5MB</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        onClick={() => {
                          resetForm();
                          setIsAddModalOpen(false);
                        }}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Đang xử lý...
                          </>
                        ) : 'Thêm cập nhật'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      
      {/* Edit Update Modal */}
      <Transition appear show={isEditModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsEditModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Chỉnh sửa cập nhật
                  </Dialog.Title>
                  <form onSubmit={handleEditUpdate}>
                    <div className="mt-4">
                      <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                        Nội dung cập nhật <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="content"
                        name="content"
                        rows={5}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        placeholder="Nhập nội dung cập nhật về tiến độ chiến dịch..."
                        value={formData.content}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Hình ảnh (không bắt buộc)
                      </label>
                      <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          {previewImage ? (
                            <div>
                              <img src={previewImage} alt="Preview" className="mx-auto h-40 w-auto object-cover" />
                              <button 
                                type="button"
                                onClick={() => {
                                  setUpdateImage(null);
                                  setPreviewImage(null);
                                }}
                                className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                Xóa
                              </button>
                            </div>
                          ) : (
                            <>
                              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                              <div className="flex text-sm text-gray-600">
                                <label htmlFor="edit-update-image" className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500">
                                  <span>Tải lên hình ảnh</span>
                                  <input 
                                    id="edit-update-image" 
                                    name="edit-update-image" 
                                    type="file" 
                                    className="sr-only" 
                                    accept="image/*"
                                    onChange={handleImageChange}
                                  />
                                </label>
                                <p className="pl-1">hoặc kéo thả</p>
                              </div>
                              <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 5MB</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        onClick={() => {
                          resetForm();
                          setIsEditModalOpen(false);
                        }}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Đang xử lý...
                          </>
                        ) : 'Lưu thay đổi'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      
      {/* Delete Confirmation Modal */}
      <Transition appear show={isDeleteModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsDeleteModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Xác nhận xóa cập nhật
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Bạn có chắc chắn muốn xóa cập nhật này không? Hành động này không thể hoàn tác.
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      onClick={() => setIsDeleteModalOpen(false)}
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      onClick={handleDeleteUpdate}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang xử lý...
                        </>
                      ) : 'Xác nhận xóa'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
