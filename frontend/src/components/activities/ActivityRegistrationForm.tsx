'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '@/lib/axios';

interface ActivityRegistrationFormProps {
  activity: {
    id: number;
    title: string;
    registration_fee: number;
    max_participants?: number;
    current_participants: number;
    registration_deadline?: string;
    event_date: string;
  };
  onSuccess?: () => void;
  onClose?: () => void;
}

export default function ActivityRegistrationForm({ activity, onSuccess, onClose }: ActivityRegistrationFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    full_name: user?.name || '',
    email: user?.email || '',
    phone: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await axiosInstance.post(`/activity-registrations/activities/${activity.id}`, formData);

      if (response.data.success) {
        setSuccess(true);
        setSuccessMessage('Đăng ký thành công! Chúng tôi đã gửi email xác nhận đến địa chỉ của bạn.');
        
        // Auto close after 3 seconds
        setTimeout(() => {
          onSuccess?.();
          onClose?.();
        }, 3000);
      } else {
        setError(response.data.message || 'Có lỗi xảy ra khi đăng ký');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const isDeadlinePassed = activity.registration_deadline ? new Date(activity.registration_deadline) < new Date() : false;
  const isFull = activity.max_participants ? activity.current_participants >= activity.max_participants : false;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-gray-900">Đăng ký tham gia</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-1">{activity.title}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>💰 Phí tham gia: <span className="font-semibold">{activity.registration_fee.toLocaleString()} VND</span></p>
              <p>👥 Số lượng: {activity.current_participants}/{activity.max_participants || 'Không giới hạn'} người</p>
              {activity.registration_deadline && (
                <p>⏰ Hạn đăng ký: {new Date(activity.registration_deadline).toLocaleDateString('vi-VN')}</p>
              )}
              <p>📅 Ngày diễn ra: {new Date(activity.event_date).toLocaleDateString('vi-VN')}</p>
            </div>
          </div>

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-green-800 font-semibold">Đăng ký thành công!</p>
                    <span className="text-green-600 text-sm">✨</span>
                  </div>
                  <p className="text-green-700 text-sm mb-2">{successMessage}</p>
                  <div className="flex items-center gap-2 text-green-600 text-xs">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Form sẽ tự động đóng sau 3 giây...</span>
                  </div>
                  <div className="mt-2 text-xs text-green-600">
                    📧 Email xác nhận đã được gửi đến <strong>{formData.email}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {isDeadlinePassed && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700 text-sm">⚠️ Đã hết hạn đăng ký cho hoạt động này.</p>
            </div>
          )}

          {isFull && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">❌ Hoạt động này đã đủ số lượng người tham gia.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập họ và tên của bạn"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập email của bạn"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập số điện thoại của bạn"
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Có điều gì bạn muốn chia sẻ với ban tổ chức? (không bắt buộc)"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading || isDeadlinePassed || isFull}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Đang đăng ký...' : 'Đăng ký ngay'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
