'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import loginBg from '../../../../public/images/Login.jpg';
import { useAuth } from '../../../contexts/AuthContext';

export default function Login() {
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      const response = await login(data.email, data.password);
      const redirect = searchParams.get('redirect') || '/';
      
      // Redirect based on user role
      if (response.user.role.slug === 'admin') {
        router.push('/admin');
      } else if (response.user.role.slug === 'fundraiser') {
        router.push('/fundraiser');
      } else {
        router.push(redirect);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Information */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0">
          <Image
            src={loginBg}
            alt="Children running"
            fill
            sizes="50vw"
            priority
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/70 to-orange-400/50"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white px-12">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-6">Chào mừng đến với KV Together</h1>
            <p className="text-xl mb-8">Tham gia cộng đồng của chúng tôi để tạo nên những thay đổi tích cực thông qua các hoạt động gây quỹ và từ thiện.</p>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="bg-white/20 rounded-full p-2 mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="text-lg">Tạo và quản lý chiến dịch gây quỹ</span>
              </div>
              <div className="flex items-center">
                <div className="bg-white/20 rounded-full p-2 mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-lg">Kết nối với nhà hảo tâm và tình nguyện viên</span>
              </div>
              <div className="flex items-center">
                <div className="bg-white/20 rounded-full p-2 mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-lg">Theo dõi đóng góp và tác động</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-gradient-to-b from-orange-50 to-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Đăng nhập vào tài khoản
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Hoặc{' '}
              <Link href="/auth/register" className="font-medium text-orange-600 hover:text-orange-500">
                tạo tài khoản mới
              </Link>
            </p>
          </div>

          {error && (
            <div className="mt-8 bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
                Mật khẩu
              </label>
              <div className="mt-1">
                <input
                  {...register('password', {
                    required: 'Mật khẩu là bắt buộc',
                  })}
                  type="password"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password.message as string}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-orange-600 hover:text-orange-500">
                  Quên mật khẩu?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-orange-400 hover:from-orange-700 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Đăng nhập
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 