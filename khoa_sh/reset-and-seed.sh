#!/bin/bash

# Script để reset database và seed lại từ đầu cho demo
# Sử dụng: ./reset-and-seed.sh

echo "🔄 Bắt đầu reset database và seed dữ liệu demo..."

# Di chuyển vào thư mục backend
cd "$(dirname "$0")/backend"

echo "📦 Cài đặt dependencies..."
composer install --no-dev --optimize-autoloader

echo "🗑️  Dropping toàn bộ database..."
php artisan db:wipe --force

echo "🔧 Chạy lại migrations..."
php artisan migrate --force

echo "🌱 Tạo storage link..."
php artisan storage:link

echo "📂 Tạo thư mục cần thiết..."
mkdir -p storage/app/public/campaigns
mkdir -p storage/app/public/activities
mkdir -p storage/app/public/news
mkdir -p storage/app/public/users
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/

echo "🎯 Seeding dữ liệu demo..."
php artisan db:seed --class=DatabaseSeeder

echo "🧹 Clear cache..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

echo "✅ Hoàn thành! Database đã được reset và seed với dữ liệu demo."
echo ""
echo "👤 Tài khoản demo được tạo:"
echo "  🔧 Admin: admin@kvtogether.com / password (Khoa Admin)"
echo "  💰 Fundraiser: fundraiser@kvtogether.com / password (Khoa Fundraiser)"
echo "  👥 User: user@kvtogether.com / password (Khoa User)"
echo ""
echo "📊 Dữ liệu được tạo:"
echo "  📈 Campaigns: Chiến dịch từ thực tế với dữ liệu phong phú"
echo "  🎯 Activities: Hoạt động cộng đồng đa dạng"
echo "  👥 Activity Registrations: Đăng ký tham gia hoạt động"
echo "  💰 Donations: Lịch sử đóng góp mẫu"
echo "  📈 Statistics: Thống kê tổng quan hệ thống"
echo ""
echo "🚀 Có thể khởi động server với: php artisan serve"
