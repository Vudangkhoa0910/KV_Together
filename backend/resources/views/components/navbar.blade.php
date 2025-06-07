<header>
    <nav class="container">
        <a href="/" class="logo-link">
            <span class="logo-text select-none">KV Together</span>
        </a>

        <ul class="nav-links">
            <li><a href="{{ route('home') }}" class="{{ request()->routeIs('home') ? 'active' : '' }}">Trang chủ</a></li>
            <li><a href="{{ route('campaigns.index') }}" class="{{ request()->routeIs('campaigns.*') ? 'active' : '' }}">Chiến dịch</a></li>
            <li><a href="{{ route('news.index') }}" class="{{ request()->routeIs('news.*') ? 'active' : '' }}">Tin tức</a></li>
            <li><a href="{{ route('about') }}" class="{{ request()->routeIs('about') ? 'active' : '' }}">Về chúng tôi</a></li>
        </ul>

        <div class="auth-links">
            <a href="{{ route('login') }}">Đăng nhập</a>
            <a href="{{ route('register') }}" class="register">Đăng ký</a>
        </div>

        <div class="hamburger">
            <span></span>
            <span></span>
            <span></span>
        </div>
    </nav>
    <div class="mobile-menu-overlay"></div>
    <div class="mobile-menu">
        <a href="{{ route('home') }}">Trang chủ</a>
        <a href="{{ route('campaigns.index') }}">Chiến dịch</a>
        <a href="{{ route('news.index') }}">Tin tức</a>
        <a href="{{ route('about') }}">Về chúng tôi</a>
        <a href="{{ route('login') }}">Đăng nhập</a>
        <a href="{{ route('register') }}" class="register">Đăng ký</a>
    </div>
</header>
