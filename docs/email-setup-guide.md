# Hướng dẫn cấu hình Gmail để gửi email thực

## Vấn đề hiện tại
Gmail yêu cầu App Password thay vì mật khẩu thường để đảm bảo bảo mật.

## Cách tạo App Password cho Gmail:

### Bước 1: Bật 2-Factor Authentication
1. Đăng nhập vào tài khoản Google của bạn
2. Vào **Google Account settings** > **Security**
3. Bật **2-Step Verification** nếu chưa bật

### Bước 2: Tạo App Password
1. Vào **Google Account settings** > **Security**
2. Tìm mục **2-Step Verification**
3. Click vào **App passwords**
4. Chọn **Select app** > **Mail**
5. Chọn **Select device** > **Other** (rồi nhập "KV Together")
6. Click **Generate**
7. Copy mật khẩu 16 ký tự được tạo (dạng: xxxx xxxx xxxx xxxx)

### Bước 3: Cập nhật file .env
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=khoabuit910@gmail.com
MAIL_PASSWORD="your-16-character-app-password"
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="khoabuit910@gmail.com"
MAIL_FROM_NAME="KV Together"
```

### Bước 4: Test lại
```bash
cd backend
php artisan config:clear
php artisan cache:clear
```

## Lưu ý bảo mật:
- **KHÔNG BAO GIỜ** chia sẻ App Password với ai khác
- App Password chỉ dùng cho ứng dụng, không phải để đăng nhập Gmail
- Có thể thu hồi App Password bất cứ lúc nào trong Google Account settings

## Thay thế khác:
Nếu không muốn dùng Gmail, có thể sử dụng:
- **Mailtrap** (cho development)
- **SendGrid** (cho production)
- **Mailgun** (cho production)
- **Amazon SES** (cho production)

## File cấu hình hiện tại:
- Backend: `/backend/.env`
- Mail config: `/backend/config/mail.php`
- Notification: `/backend/app/Notifications/ActivityRegistrationConfirmation.php`
