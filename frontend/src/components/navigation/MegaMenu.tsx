import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import FeaturedNewsMenu from './FeaturedNewsMenu';

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
  showFeaturedNews?: boolean; // Add flag for showing dynamic featured news
}

const MegaMenu: React.FC<MegaMenuProps> = ({ sections, featured, isVisible, showFeaturedNews = false }) => {
  const { isAuthenticated, user } = useAuth();

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
    if (item.requireRole && (!user || !user.role || user.role?.slug !== item.requireRole)) {
      return false;
    }

    return true;
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
                    <Link key={itemIndex} href={item.href}>
                      {item.label}
                    </Link>
                  ))}
                </div>
                <div className="category-column">
                  {rightColumn.map((item, itemIndex) => (
                    <Link key={itemIndex} href={item.href}>
                      {item.label}
                    </Link>
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
              <Link key={itemIndex} href={item.href}>
                {item.label}
              </Link>
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
              <Link href={item.href}>{item.label}</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MegaMenu; 