import './bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Alpine from 'alpinejs';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Initialize Alpine.js
window.Alpine = Alpine;
Alpine.start();

// Initialize AOS
AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true,
    mirror: false
});

// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenuButton.classList.toggle('active');
            if (!mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('translate-y-0');
                mobileMenu.classList.remove('-translate-y-full');
            } else {
                mobileMenu.classList.add('-translate-y-full');
                mobileMenu.classList.remove('translate-y-0');
            }
        });

        // Close menu when clicking links
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                mobileMenuButton.classList.remove('active');
            });
        });
    }
});
