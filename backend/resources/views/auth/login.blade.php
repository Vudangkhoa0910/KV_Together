@extends('layouts.app')

@section('content')
<div class="max-w-md w-full space-y-8">
    <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đăng nhập
        </h2>
    </div>
    <form class="mt-8 space-y-6" action="{{ route('login') }}" method="POST">
        @csrf
        <div class="rounded-md shadow-sm -space-y-px">
            <div>
                <label for="email" class="sr-only">Email</label>
                <input id="email" name="email" type="email" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Email">
            </div>
            <div>
                <label for="password" class="sr-only">Mật khẩu</label>
                <input id="password" name="password" type="password" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Mật khẩu">
            </div>
        </div>

        <div class="flex items-center justify-between">
            <div class="flex items-center">
                <input id="remember_me" name="remember" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                <label for="remember_me" class="ml-2 block text-sm text-gray-900">
                    Ghi nhớ đăng nhập
                </label>
            </div>

            <div class="text-sm">
                <a href="{{ route('password.request') }}" class="font-medium text-indigo-600 hover:text-indigo-500">
                    Quên mật khẩu?
                </a>
            </div>
        </div>

        <div>
            <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Đăng nhập
            </button>
        </div>
    </form>
</div>
@endsection
