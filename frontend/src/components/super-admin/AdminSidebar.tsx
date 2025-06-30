'use client';

import { useState } from 'react';
import { 
  Database, 
  Users, 
  Activity, 
  DollarSign, 
  BarChart3, 
  Settings,
  FileText,
  Calendar,
  Shield,
  LogOut,
  ChevronRight,
  X
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: 'overview' | 'users' | 'campaigns' | 'news' | 'activities' | 'donations' | 'analytics' | 'system') => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ activeTab, setActiveTab, isOpen, onClose }: AdminSidebarProps) {
  const menuItems = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Tổng quan hệ thống'
    },
    {
      id: 'users',
      label: 'Quản lý người dùng',
      icon: Users,
      description: 'Quản lý tài khoản người dùng'
    },
    {
      id: 'campaigns',
      label: 'Quản lý chiến dịch',
      icon: Activity,
      description: 'Quản lý các chiến dịch gây quỹ'
    },
    {
      id: 'news',
      label: 'Quản lý tin tức',
      icon: FileText,
      description: 'Quản lý bài viết và tin tức'
    },
    {
      id: 'activities',
      label: 'Quản lý hoạt động',
      icon: Calendar,
      description: 'Quản lý hoạt động tình nguyện'
    },
    {
      id: 'donations',
      label: 'Quản lý quyên góp',
      icon: DollarSign,
      description: 'Quản lý giao dịch quyên góp'
    },
    {
      id: 'analytics',
      label: 'Báo cáo & Thống kê',
      icon: BarChart3,
      description: 'Phân tích dữ liệu và báo cáo'
    },
    {
      id: 'system',
      label: 'Cài đặt hệ thống',
      icon: Settings,
      description: 'Cấu hình và bảo trì hệ thống'
    }
  ];

  const handleMenuClick = (tabId: string) => {
    setActiveTab(tabId as 'overview' | 'users' | 'campaigns' | 'news' | 'activities' | 'donations' | 'analytics' | 'system');
    onClose(); // Close mobile menu after selection
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        h-screen bg-white border-r border-orange-200 z-40 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:block
        w-64 flex flex-col shadow-lg lg:shadow-none
        fixed lg:relative top-0 left-0
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Super Admin</h1>
              <p className="text-xs text-gray-500">Quản trị hệ thống</p>
            </div>
          </div>
          
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`
                  w-full group flex items-center px-3 py-3 text-left rounded-lg transition-all duration-200
                  ${isActive
                    ? 'bg-orange-50 text-orange-700 border border-orange-200 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className={`
                  h-5 w-5 mr-3 transition-colors
                  ${isActive ? 'text-orange-600' : 'text-gray-400 group-hover:text-gray-600'}
                `} />
                
                <div className="flex-1 min-w-0">
                  <div className={`
                    text-sm font-medium truncate
                    ${isActive ? 'text-orange-700' : 'text-gray-900'}
                  `}>
                    {item.label}
                  </div>
                  <div className={`
                    text-xs truncate mt-0.5
                    ${isActive ? 'text-orange-600' : 'text-gray-500'}
                  `}>
                    {item.description}
                  </div>
                </div>
                
                {isActive && (
                  <ChevronRight className="h-4 w-4 text-orange-600 ml-2" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-orange-50 rounded-lg p-3 mb-3">
            <div className="flex items-center text-orange-700">
              <Shield className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Chế độ Quản trị</span>
            </div>
            <p className="text-xs text-orange-600 mt-1">
              Bạn đang có quyền truy cập đầy đủ vào hệ thống
            </p>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            <div>Admin Panel v1.0</div>
            <div className="mt-1">© 2024 KV Together</div>
          </div>
        </div>
      </div>
    </>
  );
}
