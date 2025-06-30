'use client';

import React, { useState } from 'react';
import ActivityRegistrationForm from '@/components/activities/ActivityRegistrationForm';

const TestRegistrationPage = () => {
  const [showForm, setShowForm] = useState(false);

  // Mock activity data
  const mockActivity = {
    id: 1,
    title: 'Tour du lịch tình nguyện Lô Lô Chải – Hà Giang',
    registration_fee: 588467,
    max_participants: 20,
    current_participants: 8,
    registration_deadline: '2025-07-20T23:59:59Z',
    event_date: '2025-08-08T03:12:00Z'
  };

  const handleSuccess = () => {
    console.log('Registration successful!');
    // Refresh page or update state
  };

  const handleClose = () => {
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Test Form Đăng Ký Hoạt động
          </h1>
          
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h2 className="font-semibold text-green-900 mb-2">✅ Email đã được cấu hình thành công!</h2>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• ✅ Gmail SMTP hoạt động với App Password</li>
              <li>• ✅ Email sẽ được gửi THẬT đến địa chỉ người dùng nhập</li>
              <li>• ✅ Thông báo thành công hiển thị đẹp trên form</li>
              <li>• ✅ Form tự động đóng sau 3 giây</li>
              <li>• ✅ Có animation và hiệu ứng đẹp</li>
              <li>• ✅ Sử dụng token authentication tự động</li>
              <li>• 📧 Kiểm tra email sau khi đăng ký: <strong>dangkhoavu666@gmail.com</strong></li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Hoạt động mẫu:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Tên:</span> {mockActivity.title}
                </div>
                <div>
                  <span className="font-medium">Phí:</span> {mockActivity.registration_fee.toLocaleString()} VND
                </div>
                <div>
                  <span className="font-medium">Số người:</span> {mockActivity.current_participants}/{mockActivity.max_participants}
                </div>
                <div>
                  <span className="font-medium">Hạn đăng ký:</span> {new Date(mockActivity.registration_deadline).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              🎯 Mở Form Đăng Ký
            </button>
          </div>
        </div>

        {/* Form đăng ký */}
        {showForm && (
          <ActivityRegistrationForm
            activity={mockActivity}
            onSuccess={handleSuccess}
            onClose={handleClose}
          />
        )}
      </div>
    </div>
  );
};

export default TestRegistrationPage;
