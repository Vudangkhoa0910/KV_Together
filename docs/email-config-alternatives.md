# Alternative Email Configuration for Development

## Option 1: Mailtrap (Recommended for development)
```env
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_username
MAIL_PASSWORD=your_mailtrap_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@kvtogether.com"
MAIL_FROM_NAME="KV Together"
```

## Option 2: Keep using log driver (current setup)
```env
MAIL_MAILER=log
MAIL_FROM_ADDRESS="noreply@kvtogether.com"
MAIL_FROM_NAME="KV Together"
```

## Option 3: Gmail with App Password
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=khoabuit910@gmail.com
MAIL_PASSWORD="your-16-char-app-password"
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="khoabuit910@gmail.com"
MAIL_FROM_NAME="KV Together"
```

## Testing Commands:
```bash
# Clear cache
php artisan config:clear && php artisan cache:clear

# Test email
php artisan tinker --execute="
\Mail::raw('Test email', function(\$message) {
    \$message->to('test@example.com')->subject('Test');
});
echo 'Email sent successfully!';
"
```
