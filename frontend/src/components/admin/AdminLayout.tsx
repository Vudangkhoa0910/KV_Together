'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  HomeIcon,
  UsersIcon,
  FlagIcon,
  ChartBarIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { Transition } from '@headlessui/react';
import Sidebar from '@/components/admin/Sidebar';
import { Toaster } from 'react-hot-toast';

const navigation = [
  { name: 'Tổng quan', href: '/admin', icon: HomeIcon },
  { name: 'Quản lý người dùng', href: '/admin/users', icon: UsersIcon },
  { name: 'Quản lý chiến dịch', href: '/admin/campaigns', icon: FlagIcon },
  { name: 'Thống kê báo cáo', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Cài đặt', href: '/admin/settings', icon: Cog6ToothIcon },
];

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user || user.role?.slug !== 'admin') {
      router.push('/auth/login');
    }
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          {/* Separator */}
          <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            {/* Search */}
            <form className="relative flex flex-1" action="#" method="GET">
              <label htmlFor="search-field" className="sr-only">
                Tìm kiếm
              </label>
              <MagnifyingGlassIcon
                className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
                aria-hidden="true"
              />
              <input
                id="search-field"
                className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                placeholder="Tìm kiếm..."
                type="search"
                name="search"
              />
            </form>

            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Xem thông báo</span>
                <BellIcon className="h-6 w-6" aria-hidden="true" />
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className="-m-1.5 flex items-center p-1.5"
                  onClick={handleLogout}
                >
                  <span className="sr-only">Tài khoản</span>
                  <img
                    className="h-8 w-8 rounded-full bg-gray-50"
                    src={user?.avatar || 'https://via.placeholder.com/32'}
                    alt=""
                  />
                  <span className="hidden lg:flex lg:items-center">
                    <span className="ml-4 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
                      {user?.name}
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
} 