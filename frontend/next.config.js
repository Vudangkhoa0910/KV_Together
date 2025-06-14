/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'api.vietqr.io', 'img.vietqr.io'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'api.vietqr.io',
        pathname: '/image/**',
      },
      {
        protocol: 'https',
        hostname: 'img.vietqr.io',
        pathname: '/image/**',
      },
    ],
  },
};

module.exports = nextConfig;
