'use client';

import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Giới thiệu */}
          <div>
            <h3 className="text-lg font-bold mb-4">Về KV Together</h3>
            <p className="text-gray-300 mb-4">
              Nền tảng gây quỹ cộng đồng, kết nối những tấm lòng nhân ái để lan tỏa yêu thương và xây dựng một xã hội tốt đẹp hơn.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>

          {/* Liên kết nhanh */}
          <div>
            <h3 className="text-lg font-bold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/campaigns" className="text-gray-300 hover:text-white">
                  Chiến dịch
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-gray-300 hover:text-white">
                  Tin tức
                </Link>
              </li>
              <li>
                <Link href="/activities" className="text-gray-300 hover:text-white">
                  Hoạt động
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white">
                  Về chúng tôi
                </Link>
              </li>
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div>
            <h3 className="text-lg font-bold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-300 hover:text-white">
                  Trung tâm trợ giúp
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Liên hệ */}
          <div>
            <h3 className="text-lg font-bold mb-4">Liên hệ</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-3">
                <i className="fas fa-map-marker-alt mt-1 text-gray-300"></i>
                <span className="text-gray-300">
                  Công ty TNHH KV Together
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <i className="fas fa-phone-alt text-gray-300"></i>
                <span className="text-gray-300">
                  (84) 822 608 286
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <i className="fas fa-envelope text-gray-300"></i>
                <span className="text-gray-300">
                  vudangkhoa@kvtogether.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              © 2024 KV Together. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/terms" className="text-gray-300 hover:text-white text-sm">
                Điều khoản
              </Link>
              <Link href="/privacy" className="text-gray-300 hover:text-white text-sm">
                Bảo mật
              </Link>
              <Link href="/cookies" className="text-gray-300 hover:text-white text-sm">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 