<header>
    <nav class="container">
        <a href="/" class="logo-link">
            <span class="logo-text select-none">KV Together</span>
        </a>

        <ul class="nav-links">
            <li><a href="<?php echo e(route('home')); ?>" class="<?php echo e(request()->routeIs('home') ? 'active' : ''); ?>">Trang chủ</a></li>
            <li><a href="<?php echo e(route('campaigns.index')); ?>" class="<?php echo e(request()->routeIs('campaigns.*') ? 'active' : ''); ?>">Chiến dịch</a></li>
            <li><a href="<?php echo e(route('news.index')); ?>" class="<?php echo e(request()->routeIs('news.*') ? 'active' : ''); ?>">Tin tức</a></li>
            <li><a href="<?php echo e(route('about')); ?>" class="<?php echo e(request()->routeIs('about') ? 'active' : ''); ?>">Về chúng tôi</a></li>
        </ul>

        <div class="auth-links">
            <a href="<?php echo e(route('login')); ?>">Đăng nhập</a>
            <a href="<?php echo e(route('register')); ?>" class="register">Đăng ký</a>
        </div>

        <div class="hamburger">
            <span></span>
            <span></span>
            <span></span>
        </div>
    </nav>
    <div class="mobile-menu-overlay"></div>
    <div class="mobile-menu">
        <a href="<?php echo e(route('home')); ?>">Trang chủ</a>
        <a href="<?php echo e(route('campaigns.index')); ?>">Chiến dịch</a>
        <a href="<?php echo e(route('news.index')); ?>">Tin tức</a>
        <a href="<?php echo e(route('about')); ?>">Về chúng tôi</a>
        <a href="<?php echo e(route('login')); ?>">Đăng nhập</a>
        <a href="<?php echo e(route('register')); ?>" class="register">Đăng ký</a>
    </div>
</header>
<?php /**PATH /Users/vudangkhoa/Working/KV_Together/resources/views/components/navbar.blade.php ENDPATH**/ ?>