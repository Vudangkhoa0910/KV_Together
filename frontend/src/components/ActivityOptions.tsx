'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface ActivityOptionsProps {
  activityId: number;
  userRole: 'admin' | 'organizer' | 'member' | 'guest';
  status: string;
  onDelete?: () => void;
}

const ActivityOptions: React.FC<ActivityOptionsProps> = ({
  activityId,
  userRole,
  status,
  onDelete
}) => {
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

  const getOptions = () => {
    const options = [];

    if (userRole === 'admin' || userRole === 'organizer') {
      options.push(
        {
          label: 'Chỉnh sửa',
          icon: 'fa-edit',
          href: `/activities/${activityId}/edit`,
          color: 'text-blue-600'
        }
      );

      if (status === 'upcoming') {
        options.push(
          {
            label: 'Bắt đầu hoạt động',
            icon: 'fa-play',
            href: `/activities/${activityId}/start`,
            color: 'text-green-600'
          }
        );
      }

      if (status === 'ongoing') {
        options.push(
          {
            label: 'Kết thúc hoạt động',
            icon: 'fa-flag-checkered',
            href: `/activities/${activityId}/end`,
            color: 'text-orange-600'
          },
          {
            label: 'Điểm danh',
            icon: 'fa-clipboard-list',
            href: `/activities/${activityId}/attendance`,
            color: 'text-purple-600'
          }
        );
      }

      if (status === 'completed') {
        options.push(
          {
            label: 'Xem báo cáo',
            icon: 'fa-chart-bar',
            href: `/activities/${activityId}/report`,
            color: 'text-indigo-600'
          }
        );
      }

      options.push(
        {
          label: 'Quản lý đăng ký',
          icon: 'fa-users',
          href: `/activities/${activityId}/registrations`,
          color: 'text-teal-600'
        }
      );

      if (userRole === 'admin') {
        options.push(
          {
            label: 'Xóa hoạt động',
            icon: 'fa-trash',
            onClick: onDelete,
            color: 'text-red-600'
          }
        );
      }
    }

    if (userRole === 'member' || userRole === 'guest') {
      if (status === 'upcoming') {
        options.push(
          {
            label: 'Đăng ký tham gia',
            icon: 'fa-user-plus',
            href: `/activities/${activityId}/register`,
            color: 'text-green-600'
          }
        );
      }

      options.push(
        {
          label: 'Chia sẻ',
          icon: 'fa-share-alt',
          onClick: () => {
            // Implement share functionality
            navigator.share?.({
              title: 'Hoạt động thiện nguyện',
              url: window.location.href
            }).catch(console.error);
          },
          color: 'text-blue-600'
        }
      );
    }

    return options;
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <i className="fas fa-ellipsis-v text-gray-600"></i>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {getOptions().map((option, index) => (
              option.href ? (
                <Link
                  key={index}
                  href={option.href}
                  className="flex items-center px-4 py-2 text-sm hover:bg-gray-50"
                >
                  <i className={`fas ${option.icon} ${option.color} w-5`}></i>
                  <span className="ml-2">{option.label}</span>
                </Link>
              ) : (
                <button
                  key={index}
                  onClick={() => {
                    option.onClick?.();
                    setIsOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-50"
                >
                  <i className={`fas ${option.icon} ${option.color} w-5`}></i>
                  <span className="ml-2">{option.label}</span>
                </button>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityOptions; 