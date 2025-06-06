<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'KV_Together') }}</title>

    <!-- Styles -->
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" rel="stylesheet" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Local CSS -->
    <link rel="stylesheet" href="{{ asset('css/layout.css') }}">
    <link rel="stylesheet" href="{{ asset('css/header.css') }}">
    <link rel="stylesheet" href="{{ asset('css/hero.css') }}">
    <link rel="stylesheet" href="{{ asset('css/projects.css') }}">
    <link rel="stylesheet" href="{{ asset('css/footer.css') }}">
</head>
<body class="font-poppins antialiased">
    @if(request()->is('auth/login') || request()->is('auth/register'))
        <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            @yield('content')
        </div>
    @else
        <!-- Navigation -->
        <header>
            <nav class="container">
                <a href="{{ route('home') }}" class="logo-link">
                    <span class="logo-text select-none">KV Together</span>
                </a>

                <ul class="nav-links">
                    <li><a href="{{ route('home') }}" class="{{ request()->routeIs('home') ? 'active' : '' }}">Trang chủ</a></li>
                    <li><a href="{{ route('campaigns.index') }}" class="{{ request()->routeIs('campaigns.*') ? 'active' : '' }}">Chiến dịch</a></li>
                    <li><a href="{{ route('news.index') }}" class="{{ request()->routeIs('news.*') ? 'active' : '' }}">Tin tức</a></li>
                    <li><a href="{{ route('activities.index') }}" class="{{ request()->routeIs('activities.*') ? 'active' : '' }}">Hoạt động</a></li>
                    <li><a href="{{ route('about') }}" class="{{ request()->routeIs('about') ? 'active' : '' }}">Về chúng tôi</a></li>
                </ul>

                <div class="auth-links">
                    @guest
                        <a href="{{ route('login') }}">Đăng nhập</a>
                        <a href="{{ route('register') }}" class="register">Đăng ký</a>
                    @else
                        <div class="relative" x-data="{ open: false }">
                            <button @click="open = !open" class="flex items-center">
                                @if(auth()->user()->profile_picture)
                                    <img src="{{ Storage::url(auth()->user()->profile_picture) }}" class="h-8 w-8 rounded-full object-cover">
                                @else
                                    <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                        <span class="text-gray-500">{{ substr(auth()->user()->name, 0, 1) }}</span>
                                    </div>
                                @endif
                                <span class="ml-2">{{ auth()->user()->name }}</span>
                            </button>
                            
                            <div x-show="open" @click.away="open = false" class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white">
                                <div class="py-1">
                                    <a href="{{ route('profile.edit') }}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Hồ sơ</a>
                                    <a href="{{ route('notifications.index') }}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        Thông báo
                                        @if(auth()->user()->unreadNotifications->count() > 0)
                                            <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                {{ auth()->user()->unreadNotifications->count() }}
                                            </span>
                                        @endif
                                    </a>
                                    @if(auth()->user()->isAdmin())
                                        <a href="{{ route('admin.campaigns.index') }}" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Quản trị</a>
                                    @endif
                                    <form method="POST" action="{{ route('logout') }}">
                                        @csrf
                                        <button type="submit" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            Đăng xuất
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    @endguest
                </div>

                <div class="hamburger">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </nav>
        </header>

        <!-- Mobile Menu -->
        <div class="mobile-menu-overlay"></div>
        <div class="mobile-menu">
            <a href="{{ route('home') }}" class="{{ request()->routeIs('home') ? 'active' : '' }}">Trang chủ</a>
            <a href="{{ route('campaigns.index') }}" class="{{ request()->routeIs('campaigns.*') ? 'active' : '' }}">Chiến dịch</a>
            <a href="{{ route('news.index') }}" class="{{ request()->routeIs('news.*') ? 'active' : '' }}">Tin tức</a>
            <a href="{{ route('activities.index') }}" class="{{ request()->routeIs('activities.*') ? 'active' : '' }}">Hoạt động</a>
            <a href="{{ route('about') }}" class="{{ request()->routeIs('about') ? 'active' : '' }}">Về chúng tôi</a>
            @guest
                <a href="{{ route('login') }}">Đăng nhập</a>
                <a href="{{ route('register') }}" class="register">Đăng ký</a>
            @else
                <a href="{{ route('profile.edit') }}">Hồ sơ</a>
                <a href="{{ route('notifications.index') }}">Thông báo</a>
                @if(auth()->user()->isAdmin())
                    <a href="{{ route('admin.campaigns.index') }}">Quản trị</a>
                @endif
                <form method="POST" action="{{ route('logout') }}" class="block">
                    @csrf
                    <button type="submit" class="w-full text-left px-4 py-2">Đăng xuất</button>
                </form>
            @endguest
        </div>

        <!-- Main Content -->
        @yield('content')

        <!-- Footer -->
        @include('components.footer')
    @endif

    <!-- Scripts -->
    <script>
        // Hamburger Menu Toggle
        const hamburger = document.querySelector('.hamburger');
        const mobileMenu = document.querySelector('.mobile-menu');
        const overlay = document.querySelector('.mobile-menu-overlay');

        function toggleMenu() {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            overlay.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        }

        if (hamburger && mobileMenu && overlay) {
            hamburger.addEventListener('click', toggleMenu);
            overlay.addEventListener('click', toggleMenu);

            // Close menu when clicking links
            mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', toggleMenu);
            });

            // Close menu on window resize
            window.addEventListener('resize', () => {
                if (window.innerWidth > 768 && mobileMenu.classList.contains('active')) {
                    toggleMenu();
                }
            });
        }
    </script>
</body>
</html>
