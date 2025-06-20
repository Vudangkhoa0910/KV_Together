'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import FeaturedNewsMenu from './FeaturedNewsMenu';
import '@/styles/mega-menu-fixes.css';

interface MenuItem {
  label: string;
  href: string;
  requireAuth?: boolean;
  requireRole?: 'user' | 'fundraiser' | 'admin';
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface FeaturedNewsItem {
  date: string;
  label: string;
  href: string;
}

interface MegaMenuProps {
  sections: MenuSection[];
  featured?: {
    title: string;
    items: FeaturedNewsItem[];
  };
  isVisible: boolean;
  showFeaturedNews?: boolean; 
}

const MegaMenuFixed: React.FC<MegaMenuProps> = ({ sections, featured, isVisible, showFeaturedNews = false }) => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  
  // Log user info for debugging
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Authenticated user:', user?.name, 'Role:', user?.role?.slug);
    } else {
      console.log('User not authenticated');
    }
  }, [isAuthenticated, user]);
  
  // For debugging
  useEffect(() => {
    console.log('MegaMenu sections:', sections);
  }, [sections]);
  
  // Function to check if user can access a menu item
  const canAccessMenuItem = (item: MenuItem): boolean => {
    // If no auth requirement, allow access
    if (!item.requireAuth && !item.requireRole) {
      return true;
    }

    // If requires auth but user is not authenticated
    if (item.requireAuth && !isAuthenticated) {
      return false;
    }

    // If requires specific role
    if (item.requireRole && (!user || !user.role || user.role.slug !== item.requireRole)) {
      return false;
    }

    return true;
  };
  
  // Handle direct navigation with force
  const handleNavigation = (e: React.MouseEvent, item: MenuItem) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Handle special links for campaign creation/management
    let targetUrl = item.href;
    if (item.label === 'Tạo chiến dịch') {
      targetUrl = '/fundraiser/campaigns/create';
    } else if (item.label === 'Quản lý chiến dịch') {
      targetUrl = '/fundraiser/campaigns';
    }
    
    console.log(`Clicked on: ${item.label}, URL: ${targetUrl}`);
    
    // Authentication check
    if (item.requireAuth && !isAuthenticated) {
      window.location.href = '/auth/login?redirect=' + targetUrl;
      return;
    }
    
    // Role check for fundraiser actions
    if ((item.label === 'Tạo chiến dịch' || item.label === 'Quản lý chiến dịch') && 
        (!user || !user.role || user.role.slug !== 'fundraiser')) {
      window.location.href = '/auth/access-denied?message=Bạn cần có tài khoản fundraiser để truy cập tính năng này';
      return;
    }
    
    // Force direct navigation
    console.log(`Forcing navigation to: ${targetUrl}`);
    window.location.href = targetUrl;
  };

  return (
    <div className={`mega-menu ${isVisible ? 'show' : ''}`}>
      {sections.map((section, index) => {
        // Filter items based on permissions
        const visibleItems = section.items.filter(canAccessMenuItem);
        
        // Only show section if it has visible items
        if (visibleItems.length === 0) {
          return null;
        }

        // Special handling for categories - split into 2 columns
        if (section.title === 'Danh mục chiến dịch') {
          const midPoint = Math.ceil(visibleItems.length / 2);
          const leftColumn = visibleItems.slice(0, midPoint);
          const rightColumn = visibleItems.slice(midPoint);

          return (
            <div key={index} className="menu-section categories-section">
              <h3>Danh mục</h3>
              <div className="categories-grid">
                <div className="category-column">
                  {leftColumn.map((item, itemIndex) => (
                    <a
                      key={itemIndex}
                      href={item.href}
                      className="menu-item-link"
                      onClick={(e) => handleNavigation(e, item)}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
                <div className="category-column">
                  {rightColumn.map((item, itemIndex) => (
                    <a
                      key={itemIndex}
                      href={item.href}
                      className="menu-item-link"
                      onClick={(e) => handleNavigation(e, item)}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          );
        }

        // Regular section rendering for non-category sections
        return (
          <div key={index} className="menu-section">
            <h3>{section.title}</h3>
            {visibleItems.map((item, itemIndex) => (
              <a
                key={itemIndex}
                href={item.href}
                className="menu-item-link"
                onClick={(e) => handleNavigation(e, item)}
              >
                {item.label}
              </a>
            ))}
          </div>
        );
      })}
      
      {/* Show dynamic featured news for news menu */}
      {showFeaturedNews && (
        <FeaturedNewsMenu className="menu-section" />
      )}
      
      {/* Show static featured news for other menus */}
      {featured && !showFeaturedNews && (
        <div className="menu-section featured-news">
          <h3>{featured.title}</h3>
          {featured.items.map((item, index) => (
            <div key={index} className="featured-news-item">
              <span className="news-date">{item.date}</span>
              <a href={item.href} onClick={(e) => {
                e.preventDefault();
                window.location.href = item.href;
              }}>
                {item.label}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MegaMenuFixed;
