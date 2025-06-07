<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ config('app.name') }} - Quản trị</title>
    
    <!-- Styles -->
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    @stack('styles')
</head>
<body class="bg-gray-100">
    <div class="min-h-screen flex">
        <!-- Sidebar -->
        <div class="w-64 bg-gray-800 text-white">
            <div class="p-4">
                <h1 class="text-2xl font-bold">KV Together</h1>
            </div>
            <nav class="mt-8">
                <a href="{{ route('admin.campaigns.index') }}" 
                   class="block py-2 px-4 hover:bg-gray-700 {{ request()->routeIs('admin.campaigns.*') ? 'bg-gray-700' : '' }}">
                    Chiến dịch
                </a>
                <a href="{{ route('admin.donations.index') }}"
                   class="block py-2 px-4 hover:bg-gray-700 {{ request()->routeIs('admin.donations.*') ? 'bg-gray-700' : '' }}">
                    Quyên góp
                </a>
                <a href="{{ route('admin.activities.index') }}"
                   class="block py-2 px-4 hover:bg-gray-700 {{ request()->routeIs('admin.activities.*') ? 'bg-gray-700' : '' }}">
                    Hoạt động
                </a>
                <a href="{{ route('admin.news.index') }}"
                   class="block py-2 px-4 hover:bg-gray-700 {{ request()->routeIs('admin.news.*') ? 'bg-gray-700' : '' }}">
                    Tin tức
                </a>
                <a href="{{ route('admin.categories.index') }}"
                   class="block py-2 px-4 hover:bg-gray-700 {{ request()->routeIs('admin.categories.*') ? 'bg-gray-700' : '' }}">
                    Danh mục
                </a>
            </nav>
        </div>

        <!-- Main content -->
        <div class="flex-1">
            <header class="bg-white shadow">
                <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                        @yield('header')
                    </h2>
                    <div>
                        <a href="{{ route('home') }}" class="text-gray-500 hover:text-gray-700">
                            Về trang chủ
                        </a>
                    </div>
                </div>
            </header>

            <main class="py-6">
                <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    @yield('content')
                </div>
            </main>
        </div>
    </div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/gh/alpinejs/alpine@v2.8.2/dist/alpine.min.js" defer></script>
    @stack('scripts')
</body>
</html>
