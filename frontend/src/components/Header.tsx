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
          <Link href="/">KV Together</Link>
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
                {user.role === 'admin' && (
                  <Link href="/admin" className="dropdown-item">
                    <i className="fas fa-cog"></i>
                    Quản trị hệ thống
                  </Link>
                )}
                {user.role === 'staff' && (
                  <Link href="/staff" className="dropdown-item">
                    <i className="fas fa-user-tie"></i>
                    Trang nhân viên
                  </Link>
                )}
                <Link href="/user" className="dropdown-item">
                  <i className="fas fa-user"></i>
                  Tài khoản của tôi
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