<!-- resources/views/components/navbar.blade.php -->

<header class="bg-gradient-to-r from-orange-400 via-red-500 to-yellow-400 shadow-md">
    <nav class="container mx-auto flex justify-between items-center py-5 px-6">
        <!-- Logo -->
        <a href="{{ url('/') }}" class="flex items-center space-x-3">
            <img src="{{ asset('images/logo.png') }}" alt="KV Together Logo" class="h-10 w-10 rounded-full shadow-lg" />
            <span class="text-white text-2xl font-extrabold tracking-wide drop-shadow-lg">KV Together</span>
        </a>

        <!-- Menu -->
        <div class="hidden md:flex space-x-8 text-white font-semibold tracking-wide">
            <a href="{{ route('home') }}" class="hover:underline hover:decoration-yellow-300">Trang chủ</a>
            <a href="{{ route('campaigns.index') }}" class="hover:underline hover:decoration-yellow-300">Chiến dịch</a>
            <a href="{{ route('news.index') }}" class="hover:underline hover:decoration-yellow-300">Tin tức</a>
        </div>

        <!-- Auth Buttons -->
        <div class="space-x-4">
            @auth
                <form method="POST" action="{{ route('logout') }}" class="inline">
                    @csrf
                    <button type="submit" class="bg-yellow-300 text-orange-700 font-bold px-4 py-2 rounded hover:bg-yellow-400 transition">Đăng xuất</button>
                </form>
            @else
                <a href="{{ route('login') }}" class="bg-yellow-300 text-orange-700 font-bold px-4 py-2 rounded hover:bg-yellow-400 transition">Đăng nhập</a>
                <a href="{{ route('register') }}" class="border border-yellow-300 text-yellow-300 font-bold px-4 py-2 rounded hover:bg-yellow-300 hover:text-orange-700 transition">Đăng ký</a>
            @endauth
        </div>
    </nav>
</header>
