'use client';

import { useState, useEffect, Fragment } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  BellIcon, 
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  InformationCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';

interface Notification {
  id: number;
  type: 'campaign_status' | 'donation' | 'donor_message' | 'goal_reached' | 'about_to_expire' | 'system';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  campaign_id?: number;
  campaign_slug?: string;
  donation_id?: number;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  
  useEffect(() => {
    fetchNotifications();
  }, [filter]);
  
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // In production, this would be a real API call
      // const response = await fetch(`/api/fundraiser/notifications?filter=${filter}`);
      // const data = await response.json();
      
      // Mock data for development
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockNotifications: Notification[] = [
        {
          id: 1,
          type: 'campaign_status',
          title: 'Chiến dịch được phê duyệt',
          message: 'Chiến dịch "Hỗ trợ trẻ em vùng cao" của bạn đã được phê duyệt và hiện đang hoạt động.',
          read: true,
          created_at: '2025-06-20T10:30:00Z',
          campaign_id: 1,
          campaign_slug: 'ho-tro-tre-em-vung-cao'
        },
        {
          id: 2,
          type: 'donation',
          title: 'Quyên góp mới',
          message: 'Nguyễn Văn A vừa quyên góp 5.000.000đ cho chiến dịch "Hỗ trợ trẻ em vùng cao".',
          read: false,
          created_at: '2025-06-23T15:45:00Z',
          campaign_id: 1,
          campaign_slug: 'ho-tro-tre-em-vung-cao',
          donation_id: 123
        },
        {
          id: 3,
          type: 'goal_reached',
          title: 'Đạt mục tiêu!',
          message: 'Chiến dịch "Cứu trợ đồng bào bị lũ lụt" đã đạt 100% mục tiêu quyên góp! Xin chúc mừng!',
          read: false,
          created_at: '2025-06-22T09:15:00Z',
          campaign_id: 3,
          campaign_slug: 'cuu-tro-dong-bao-bi-lu-lut'
        },
        {
          id: 4,
          type: 'donor_message',
          title: 'Tin nhắn mới từ nhà hảo tâm',
          message: 'Trần Thị B: "Cảm ơn vì những nỗ lực tuyệt vời của quỹ. Tôi rất muốn biết thêm về cách tiền quyên góp được sử dụng."',
          read: false,
          created_at: '2025-06-21T14:20:00Z',
          campaign_id: 1,
          campaign_slug: 'ho-tro-tre-em-vung-cao',
          donation_id: 124
        },
        {
          id: 5,
          type: 'about_to_expire',
          title: 'Chiến dịch sắp kết thúc',
          message: 'Chiến dịch "Học bổng cho sinh viên vượt khó" của bạn sẽ kết thúc trong 7 ngày nữa. Hiện đã đạt 60% mục tiêu.',
          read: true,
          created_at: '2025-06-19T11:30:00Z',
          campaign_id: 5,
          campaign_slug: 'hoc-bong-cho-sinh-vien-vuot-kho'
        },
        {
          id: 6,
          type: 'system',
          title: 'Cập nhật hệ thống',
          message: 'Hệ thống sẽ bảo trì từ 23:00 - 01:00 ngày 25/06/2025. Vui lòng không cập nhật chiến dịch trong khoảng thời gian này.',
          read: true,
          created_at: '2025-06-18T09:00:00Z'
        },
        {
          id: 7,
          type: 'campaign_status',
          title: 'Chiến dịch cần bổ sung thông tin',
          message: 'Chiến dịch "Trang bị y tế cho trạm xá vùng núi" cần bổ sung thông tin về cách thức sử dụng tiền quyên góp.',
          read: false,
          created_at: '2025-06-17T10:15:00Z',
          campaign_id: 4,
          campaign_slug: 'trang-bi-y-te-cho-tram-xa-vung-nui'
        }
      ];
      
      // Filter notifications if needed
      let filteredNotifications = mockNotifications;
      if (filter !== 'all') {
        filteredNotifications = mockNotifications.filter(notification => notification.type === filter);
      }
      
      setNotifications(filteredNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const markAsRead = async (id: number) => {
    try {
      // In production, this would be a real API call
      // await fetch(`/api/fundraiser/notifications/${id}/read`, {
      //   method: 'PUT'
      // });
      
      // Update in local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };
  
  const markAllAsRead = async () => {
    try {
      // In production, this would be a real API call
      // await fetch(`/api/fundraiser/notifications/read-all`, {
      //   method: 'PUT'
      // });
      
      // Update in local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };
  
  const deleteNotification = async (id: number) => {
    try {
      // In production, this would be a real API call
      // await fetch(`/api/fundraiser/notifications/${id}`, {
      //   method: 'DELETE'
      // });
      
      // Update in local state
      setNotifications(prev => 
        prev.filter(notification => notification.id !== id)
      );
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'campaign_status':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'donation':
        return <CurrencyIcon className="h-6 w-6 text-blue-500" />;
      case 'donor_message':
        return <MessageIcon className="h-6 w-6 text-purple-500" />;
      case 'goal_reached':
        return <GoalIcon className="h-6 w-6 text-orange-500" />;
      case 'about_to_expire':
        return <ClockIcon className="h-6 w-6 text-yellow-500" />;
      case 'system':
        return <InformationCircleIcon className="h-6 w-6 text-gray-500" />;
      default:
        return <BellIcon className="h-6 w-6 text-gray-500" />;
    }
  };
  
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-orange-500 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-white">Thông báo</h1>
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {unreadCount} mới
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center px-3 py-1.5 border border-white text-sm leading-4 font-medium rounded-md text-white hover:bg-orange-600 focus:outline-none"
              disabled={unreadCount === 0}
            >
              Đánh dấu tất cả đã đọc
            </button>
            
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="inline-flex items-center p-1.5 border border-white rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none">
                  <FilterIcon className="h-5 w-5" />
                  <span className="sr-only">Lọc thông báo</span>
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="py-1 px-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                          } ${filter === 'all' ? 'bg-orange-50 text-orange-600' : ''} flex w-full items-center px-2 py-2 text-sm rounded-md`}
                          onClick={() => setFilter('all')}
                        >
                          Tất cả
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                          } ${filter === 'campaign_status' ? 'bg-orange-50 text-orange-600' : ''} flex w-full items-center px-2 py-2 text-sm rounded-md`}
                          onClick={() => setFilter('campaign_status')}
                        >
                          Trạng thái chiến dịch
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                          } ${filter === 'donation' ? 'bg-orange-50 text-orange-600' : ''} flex w-full items-center px-2 py-2 text-sm rounded-md`}
                          onClick={() => setFilter('donation')}
                        >
                          Quyên góp mới
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                          } ${filter === 'goal_reached' ? 'bg-orange-50 text-orange-600' : ''} flex w-full items-center px-2 py-2 text-sm rounded-md`}
                          onClick={() => setFilter('goal_reached')}
                        >
                          Đạt mục tiêu
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <BellIcon className="h-12 w-12" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không có thông báo nào</h3>
              {filter !== 'all' && (
                <p className="mt-1 text-sm text-gray-500">
                  Không có thông báo nào thuộc loại này. <button 
                  onClick={() => setFilter('all')}
                  className="font-medium text-orange-600 hover:text-orange-500"
                >Xem tất cả thông báo</button>
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`border rounded-lg p-4 transition-all ${notification.read ? 'border-gray-200 bg-white' : 'border-orange-200 bg-orange-50'}`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-medium ${notification.read ? 'text-gray-900' : 'text-orange-600'}`}>{notification.title}</h3>
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500">
                            {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex space-x-3">
                          {notification.campaign_slug && (
                            <a 
                              href={`/campaigns/${notification.campaign_slug}`} 
                              className="text-sm text-orange-600 hover:text-orange-800"
                            >
                              Xem chiến dịch
                            </a>
                          )}
                          {notification.campaign_slug && notification.type === 'donation' && (
                            <a 
                              href={`/fundraiser/campaigns/${notification.campaign_slug}/analytics`} 
                              className="text-sm text-orange-600 hover:text-orange-800"
                            >
                              Xem thống kê
                            </a>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          {!notification.read && (
                            <button 
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs font-medium text-blue-600 hover:text-blue-800"
                            >
                              Đánh dấu đã đọc
                            </button>
                          )}
                          <button 
                            onClick={() => deleteNotification(notification.id)}
                            className="text-xs text-gray-400 hover:text-red-600"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Icon components
const CurrencyIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MessageIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const GoalIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const FilterIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);
