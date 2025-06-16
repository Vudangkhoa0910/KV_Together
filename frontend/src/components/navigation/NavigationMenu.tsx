'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MegaMenu from './MegaMenu';
import { MENU_ITEMS } from './MenuItems';

const NavigationMenu: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuTimeoutRef = useRef<NodeJS.Timeout>();
  const pathname = usePathname();

  const handleMenuEnter = (menu: string) => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
    }
    setActiveMenu(menu);
  };

  const handleMenuLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (menuTimeoutRef.current) {
        clearTimeout(menuTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setActiveMenu(null);
  }, [pathname]);

  return (
    <nav className="nav-menu" onMouseLeave={handleMenuLeave}>
      <Link 
        href="/" 
        className={pathname === '/' ? 'active' : ''}
        onMouseEnter={() => handleMenuEnter('home')}
      >
        Trang chủ
      </Link>

      {Object.entries(MENU_ITEMS).map(([key, menu]) => (
        <div 
          key={key}
          className="menu-item-wrapper"
          onMouseEnter={() => handleMenuEnter(key)}
        >
          <Link 
            href={`/${key}`}
            className={pathname?.startsWith(`/${key}`) ? 'active' : ''}
          >
            {menu.title}
          </Link>
          
          <MegaMenu
            sections={menu.sections}
            isVisible={activeMenu === key}
            showFeaturedNews={key === 'news'}
          />
        </div>
      ))}
    </nav>
  );
};

export default NavigationMenu; 