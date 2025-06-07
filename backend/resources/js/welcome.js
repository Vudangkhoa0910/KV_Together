document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('stars-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = Array.from({ length: 100 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        velocity: Math.random() * 0.5 + 0.2,
    }));

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        stars.forEach(star => {
            star.y += star.velocity;
            if (star.y > canvas.height) {
                star.y = 0;
                star.x = Math.random() * canvas.width;
            }
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        });
        requestAnimationFrame(draw);
    }

    draw();
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
});
