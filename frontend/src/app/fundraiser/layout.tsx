'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  HomeIcon, 
  ChartBarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  BellIcon,
  Bars3Icon as MenuIcon,
  XMarkIcon as XIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon as LogoutIcon
} from '@heroicons/react/24/outline';

export default function FundraiserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Navigation items
  const navigation = [
    { name: 'Bảng điều khiển', href: '/fundraiser/dashboard', icon: HomeIcon },
    { name: 'Chiến dịch', href: '/fundraiser/campaigns', icon: ChartBarIcon },
    { name: 'Hoạt động', href: '/fundraiser/activities', icon: CalendarIcon },
    { name: 'Tin tức', href: '/fundraiser/news', icon: DocumentTextIcon },
    { name: 'Báo cáo', href: '/fundraiser/reports', icon: CurrencyDollarIcon },
    { name: 'Thông báo', href: '/fundraiser/notifications', icon: BellIcon },
  ];

  // Check if the current path matches a navigation item
  const isActive = (href: string) => {
    if (!pathname) return false;
    
    if (href === '/fundraiser/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar for mobile */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition duration-300 transform md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 h-16 bg-orange-500">
          <div className="text-white font-semibold text-lg">Fundraiser</div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="px-2 py-4">
          <nav className="space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  isActive(item.href)
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${isActive(item.href) ? 'text-orange-500' : 'text-gray-500'}`} />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white shadow-lg">
            <div className="flex items-center h-16 px-4 bg-orange-500">
              <div className="text-white font-semibold text-lg">Fundraiser</div>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                      isActive(item.href)
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${isActive(item.href) ? 'text-orange-500' : 'text-gray-500'}`} />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-full mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                >
                  <MenuIcon className="h-6 w-6" />
                </button>
              </div>

              {/* User info and logout */}
              <div className="flex items-center space-x-4 ml-auto">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-800">{user?.name || 'Người dùng'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md"
                >
                  <LogoutIcon className="mr-2 h-4 w-4 text-gray-500" />
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-full mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
