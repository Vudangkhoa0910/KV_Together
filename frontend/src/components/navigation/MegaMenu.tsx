import React from 'react';
import Link from 'next/link';

interface MenuItem {
  label: string;
  href: string;
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
}

const MegaMenu: React.FC<MegaMenuProps> = ({ sections, featured, isVisible }) => {
  return (
    <div className={`mega-menu ${isVisible ? 'show' : ''}`}>
      {sections.map((section, index) => (
        <div key={index} className="menu-section">
          <h3>{section.title}</h3>
          {section.items.map((item, itemIndex) => (
            <Link key={itemIndex} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      ))}
      
      {featured && (
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