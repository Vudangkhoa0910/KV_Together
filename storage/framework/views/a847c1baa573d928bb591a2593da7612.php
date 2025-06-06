<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">

    <title><?php echo e(config('app.name', 'KV_Together')); ?></title>

    <!-- Styles -->
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" rel="stylesheet" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Local CSS -->
    <link rel="stylesheet" href="<?php echo e(asset('css/layout.css')); ?>">
    <link rel="stylesheet" href="<?php echo e(asset('css/header.css')); ?>">
    <link rel="stylesheet" href="<?php echo e(asset('css/hero.css')); ?>">
    <link rel="stylesheet" href="<?php echo e(asset('css/projects.css')); ?>">
    <link rel="stylesheet" href="<?php echo e(asset('css/footer.css')); ?>">
</head>
<body class="font-poppins antialiased">
    <!-- Header -->
    <header>
        <nav class="container">
            <a href="<?php echo e(route('home')); ?>" class="logo-link">
                <span class="logo-text select-none">KV Together</span>
            </a>

            <ul class="nav-links">
                <li><a href="<?php echo e(route('home')); ?>">Trang chủ</a></li>
                <li><a href="<?php echo e(route('campaigns.index')); ?>">Chiến dịch</a></li>
                <li><a href="<?php echo e(route('news.index')); ?>">Tin tức</a></li>
                <li><a href="<?php echo e(route('about')); ?>">Về chúng tôi</a></li>
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

    <!-- Main Content -->
    <?php echo $__env->make('components.hero', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
    <?php echo $__env->make('components.projects', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
    <?php echo $__env->make('components.hero-stats', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

    <!-- Footer -->
    <?php echo $__env->make('components.footer', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

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
<?php /**PATH /Users/vudangkhoa/Work/KV_Together/resources/views/layouts/app.blade.php ENDPATH**/ ?>