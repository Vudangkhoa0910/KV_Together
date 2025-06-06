<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name', 'KV_Together') }}</title>

    <!-- Minimal CSS for auth pages -->
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
    <link href="{{ asset('css/auth.css') }}" rel="stylesheet">
</head>
<body>
    <div class="auth-container flex items-center justify-center px-4">
        <div class="max-w-md w-full">
            <!-- Logo -->
            <div class="text-center mb-8">
                <a href="{{ route('home') }}" class="text-3xl font-bold text-white hover:text-orange-100">
                    KV Together
                </a>
            </div>

            @yield('content')

            <!-- Back to home -->
            <div class="text-center mt-4">
                <a href="{{ route('home') }}" class="text-white hover:text-orange-100">
                    Quay về trang chủ
                </a>
            </div>
        </div>
    </div>
</body>
</html>
