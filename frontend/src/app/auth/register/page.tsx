'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import registerBg from '../../../../public/images/Register.jpg';
import { useAuth } from '../../../contexts/AuthContext';

export default function Register() {
  const [error, setError] = useState('');
  const [role, setRole] = useState('user');
  const [organizationType, setOrganizationType] = useState('personal');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const router = useRouter();
  const { registerUser } = useAuth();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data: any) => {
    if (!acceptTerms) {
      setError('Bạn cần đồng ý với điều khoản và điều kiện');
      return;
    }
    
    try {
      const registrationData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        password_confirmation: data.password_confirmation,
        user_type: role,
        ...(role === 'fundraiser' && {
          address: data.address,
          id_card: data.id_number,
          registration_reason: data.reason,
          fundraiser_type: organizationType,
          ...(organizationType === 'organization' && {
            organization_name: data.organization_name
          })
        })
      };

      await registerUser(registrationData);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Information */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0">
          <Image
            src={registerBg}
            alt="Children playing"
            fill
            sizes="50vw"
            priority
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/70 to-orange-400/50"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white px-12">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-6">Tham gia KV Together</h1>
            <p className="text-xl mb-8">Cùng chung tay xây dựng một cộng đồng vững mạnh và tạo nên những thay đổi tích cực.</p>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="bg-white/20 rounded-full p-2 mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-lg">Tạo hồ sơ cá nhân</span>
              </div>
              <div className="flex items-center">
                <div className="bg-white/20 rounded-full p-2 mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-lg">Bắt đầu hoặc tham gia dự án</span>
              </div>
              <div className="flex items-center">
                <div className="bg-white/20 rounded-full p-2 mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <span className="text-lg">Tạo tác động tích cực</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Registration Form */}
            <div className="flex-1 flex flex-col h-screen bg-gradient-to-b from-orange-50 to-white">
        <div className="sticky top-[72px] z-10 bg-gradient-to-b from-orange-50 to-white/80 backdrop-blur-sm pt-8 pb-4 px-4 sm:px-6 lg:px-20 xl:px-24 border-b border-orange-100/50">
          <div className="mx-auto w-full max-w-sm lg:w-96 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Tạo tài khoản mới
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Hoặc{' '}
              <Link href="/auth/login" className="font-medium text-orange-600 hover:text-orange-500">
                đăng nhập vào tài khoản hiện có
              </Link>
            </p>
          </div>
        </div>
          <div className="flex-1 overflow-y-auto px-4 pt-24 pb-12 sm:px-6 lg:px-20 xl:px-24">
            <div className="mx-auto w-full max-w-sm lg:w-96">
              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {/* Role Selection */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Bạn muốn tham gia với vai trò
                  </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('user')}
                    className={`p-4 text-left rounded-lg border ${
                      role === 'user'
                        ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500'
                        : 'border-gray-200 hover:border-orange-500'
                    }`}
                  >
                    <div className="font-medium">Người dùng</div>
                    <div className="text-sm text-gray-500">Tham gia quyên góp và theo dõi các chiến dịch</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('fundraiser')}
                    className={`p-4 text-left rounded-lg border ${
                      role === 'fundraiser'
                        ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500'
                        : 'border-gray-200 hover:border-orange-500'
                    }`}
                  >
                    <div className="font-medium">Gây quỹ</div>
                    <div className="text-sm text-gray-500">Tạo và quản lý các chiến dịch gây quỹ</div>
                  </button>
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Họ và tên
                  </label>
                  <div className="mt-1">
                    <input
                      {...register('name', {
                        required: 'Họ và tên là bắt buộc',
                        minLength: {
                          value: 2,
                          message: 'Họ và tên phải có ít nhất 2 ký tự',
                        },
                      })}
                      type="text"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600">{errors.name.message as string}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      {...register('email', {
                        required: 'Email là bắt buộc',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Email không hợp lệ',
                        },
                      })}
                      type="email"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600">{errors.email.message as string}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Số điện thoại
                  </label>
                  <div className="mt-1">
                    <input
                      {...register('phone', {
                        required: 'Số điện thoại là bắt buộc',
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: 'Số điện thoại không hợp lệ',
                        },
                      })}
                      type="tel"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    />
                    {errors.phone && (
                      <p className="mt-2 text-sm text-red-600">{errors.phone.message as string}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Mật khẩu
                  </label>
                  <div className="mt-1">
                    <input
                      {...register('password', {
                        required: 'Mật khẩu là bắt buộc',
                        minLength: {
                          value: 8,
                          message: 'Mật khẩu phải có ít nhất 8 ký tự',
                        },
                      })}
                      type="password"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    />
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600">{errors.password.message as string}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Xác nhận mật khẩu
                  </label>
                  <div className="mt-1">
                    <input
                      {...register('password_confirmation', {
                        required: 'Xác nhận mật khẩu là bắt buộc',
                        validate: value =>
                          value === password || 'Mật khẩu xác nhận không khớp',
                      })}
                      type="password"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    />
                    {errors.password_confirmation && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.password_confirmation.message as string}
                      </p>
                    )}
                  </div>
                </div>
              </div>

                            {/* Fundraiser Additional Information */}
              {role === 'fundraiser' && (
                <div className="space-y-6 border-t border-gray-200 pt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Bạn đăng ký với tư cách
                    </label>
                    <div className="mt-2">
                      <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            value="personal"
                            checked={organizationType === 'personal'}
                            onChange={(e) => setOrganizationType(e.target.value)}
                            className="form-radio h-4 w-4 text-orange-600"
                          />
                          <span className="ml-2">Cá nhân</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            value="organization"
                            checked={organizationType === 'organization'}
                            onChange={(e) => setOrganizationType(e.target.value)}
                            className="form-radio h-4 w-4 text-orange-600"
                          />
                          <span className="ml-2">Tổ chức</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {organizationType === 'organization' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tên tổ chức
                      </label>
                      <div className="mt-1">
                        <input
                          {...register('organization_name', {
                            required: 'Tên tổ chức là bắt buộc',
                          })}
                          type="text"
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        />
                        {errors.organization_name && (
                          <p className="mt-2 text-sm text-red-600">{errors.organization_name.message as string}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Địa chỉ
                    </label>
                    <div className="mt-1">
                      <textarea
                        {...register('address', {
                          required: 'Địa chỉ là bắt buộc',
                        })}
                        rows={3}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      />
                      {errors.address && (
                        <p className="mt-2 text-sm text-red-600">{errors.address.message as string}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {organizationType === 'personal' ? 'CCCD/CMND' : 'Mã số thuế'}
                    </label>
                    <div className="mt-1">
                      <input
                        {...register('id_number', {
                          required: `${organizationType === 'personal' ? 'CCCD/CMND' : 'Mã số thuế'} là bắt buộc`,
                        })}
                        type="text"
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                      />
                      {errors.id_number && (
                        <p className="mt-2 text-sm text-red-600">{errors.id_number.message as string}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Lý do đăng ký
                    </label>
                    <div className="mt-1">
                      <textarea
                        {...register('reason', {
                          required: 'Lý do đăng ký là bắt buộc',
                          minLength: {
                            value: 100,
                            message: 'Vui lòng viết ít nhất 100 ký tự',
                          },
                        })}
                        rows={4}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        placeholder="Vui lòng chia sẻ lý do bạn muốn trở thành người gây quỹ và mục tiêu của bạn..."
                      />
                      {errors.reason && (
                        <p className="mt-2 text-sm text-red-600">{errors.reason.message as string}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Terms and Conditions */}
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3">
                    <label htmlFor="terms" className="text-sm text-gray-500">
                      Tôi đồng ý với{' '}
                      <a href="#" className="font-medium text-orange-600 hover:text-orange-500">
                        Điều khoản sử dụng
                      </a>
                      {' '}và{' '}
                      <a href="#" className="font-medium text-orange-600 hover:text-orange-500">
                        Chính sách bảo mật
                      </a>
                    </label>
                  </div>
                </div>

                {role === 'fundraiser' && (
                  <div className="bg-orange-50 p-4 rounded-md">
                    <p className="text-sm text-orange-700">
                      Bằng việc đăng ký, tôi cam kết:
                    </p>
                    <ul className="mt-2 text-sm text-orange-600 list-disc list-inside">
                      <li>Cung cấp thông tin chính xác và đầy đủ</li>
                      <li>Tuân thủ quy định về gây quỹ và quản lý tài chính</li>
                      <li>Sử dụng tiền quyên góp đúng mục đích</li>
                      <li>Báo cáo minh bạch về các hoạt động gây quỹ</li>
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-orange-400 hover:from-orange-700 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Đăng ký
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 