'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface User {
  id: number;
  name: string;
  avatar: string;
  role: 'admin' | 'organizer' | 'member' | 'guest';
}

interface UserMenuProps {
  user: User;
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
      >
        <div className="relative w-8 h-8 rounded-full overflow-hidden">
          <Image
            src={user.avatar || '/images/default-avatar.png'}
            alt={user.name}
            fill
            className="object-cover"
          />
        </div>
        <span className="text-white hidden md:inline">{user.name}</span>
        <i className={`fas fa-chevron-down text-white text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 py-1">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 mt-1">
              {user.role === 'admin' && 'Quản trị viên'}
              {user.role === 'organizer' && 'Người tổ chức'}
              {user.role === 'member' && 'Thành viên'}
              {user.role === 'guest' && 'Khách'}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {/* Admin Section */}
            {user.role === 'admin' && (
              <>
                <Link
                  href="/admin/dashboard"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  <i className="fas fa-tachometer-alt w-5 text-gray-400"></i>
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/admin/users"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  <i className="fas fa-users-cog w-5 text-gray-400"></i>
                  <span>Quản lý người dùng</span>
                </Link>
                <Link
                  href="/admin/activities"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  <i className="fas fa-tasks w-5 text-gray-400"></i>
                  <span>Quản lý hoạt động</span>
                </Link>
                <div className="border-t border-gray-100"></div>
              </>
            )}

            {/* Organizer Section */}
            {(user.role === 'admin' || user.role === 'organizer') && (
              <>
                <Link
                  href="/organizer/activities"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  <i className="fas fa-calendar-alt w-5 text-gray-400"></i>
                  <span>Hoạt động của tôi</span>
                </Link>
                <Link
                  href="/organizer/reports"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  <i className="fas fa-chart-bar w-5 text-gray-400"></i>
                  <span>Báo cáo</span>
                </Link>
                <div className="border-t border-gray-100"></div>
              </>
            )}

            {/* Common Section */}
            <Link
              href="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <i className="fas fa-user w-5 text-gray-400"></i>
              <span>Hồ sơ của tôi</span>
            </Link>
            <Link
              href="/activities/registered"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <i className="fas fa-clipboard-list w-5 text-gray-400"></i>
              <span>Hoạt động đã đăng ký</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <i className="fas fa-cog w-5 text-gray-400"></i>
              <span>Cài đặt</span>
            </Link>

            {/* Logout */}
            <div className="border-t border-gray-100"></div>
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <i className="fas fa-sign-out-alt w-5"></i>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu; 