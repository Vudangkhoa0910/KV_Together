<!-- Hero Section -->
<main class="hero animate__animated animate__fadeIn" style="background-image: url('{{ asset('images/bg.jpeg') }}');">
    <div class="hero-overlay">
        <div class="hero-content">
            <h1 class="animate__animated animate__fadeInUp">
                <span class="white-text">Cùng nhau</span> <span class="red-text">Gây quỹ</span>
                <span class="yellow-text">Lan tỏa Yêu thương</span>
            </h1>
            <p class="hero-desc">
                Tham gia và ủng hộ các chiến dịch ý nghĩa, giúp đỡ cộng đồng và tạo nên sự thay đổi tích cực.
            </p>
            <div class="buttons">
                <a href="{{ route('campaigns.index') }}" class="button-primary">Khám phá chiến dịch</a>
                <a href="{{ route('register') }}" class="button-secondary">Trở thành sứ giả</a>
            </div>
        </div>
    </div>
</main>