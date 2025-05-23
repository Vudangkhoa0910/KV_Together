import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/sass/app.scss',
                'resources/js/app.js',
                'resources/sass/welcome.scss',
                'resources/js/welcome.js',
            ],
            refresh: true,
        }),
    ],
});
