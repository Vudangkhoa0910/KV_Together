'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useRef, useState, useEffect } from 'react';
import NavigationMenu from './navigation/NavigationMenu';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              KV Together
            </span>
          </Link>
        </div>
        
        <NavigationMenu />
        
        <div className="auth-buttons">
          {isAuthenticated && user ? (
            <div className="user-menu-container" ref={dropdownRef}>
              <div
                className="user-menu-trigger"
                onClick={() => setDropdownOpen((open) => !open)}
                tabIndex={0}
                role="button"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                <div className="user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="user-name">{user.name}</span>
              </div>
              <div className={`user-dropdown${dropdownOpen ? ' show' : ''}`}>
                <div className="user-info">
                  <div className="user-avatar-large">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-details">
                    <span className="user-fullname">{user.name}</span>
                    <span className="user-email">{user.email}</span>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                {user.role?.slug === 'admin' && (
                  <Link href="/admin" className="dropdown-item">
                    <i className="fas fa-cog"></i>
                    Quản trị hệ thống
                  </Link>
                )}
                {user.role?.slug === 'staff' && (
                  <Link href="/staff" className="dropdown-item">
                    <i className="fas fa-user-tie"></i>
                    Trang nhân viên
                  </Link>
                )}
                {user.role?.slug === 'fundraiser' && (
                  <>
                    <Link href="/fundraiser/dashboard" className="dropdown-item">
                      <i className="fas fa-tachometer-alt"></i>
                      Dashboard
                    </Link>
                    <Link href="/fundraiser/news" className="dropdown-item">
                      <i className="fas fa-newspaper"></i>
                      Quản lý tin tức
                    </Link>
                    <Link href="/fundraiser/activities" className="dropdown-item">
                      <i className="fas fa-calendar-alt"></i>
                      Quản lý hoạt động
                    </Link>
                  </>
                )}
                <Link href="/user" className="dropdown-item">
                  <i className="fas fa-user"></i>
                  Tài khoản của tôi
                </Link>
                <Link href="/wallet" className="dropdown-item">
                  <i className="fas fa-wallet"></i>
                  Ví thiện nguyện KV Credits
                </Link>
                <Link href="/user/donations" className="dropdown-item">
                  <i className="fas fa-heart"></i>
                  Lịch sử đóng góp
                </Link>
                <div className="dropdown-divider"></div>
                <button onClick={logout} className="dropdown-item logout-button">
                  <i className="fas fa-sign-out-alt"></i>
                  Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="login">Đăng nhập</Link>
              <Link href="/auth/register" className="register">Đăng ký</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}