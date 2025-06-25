# Email Configuration Guide

## Option 1: Mailtrap (Recommended for Development)
- Easy setup, no authentication issues
- View emails in web interface
- Free for development

## Option 2: Gmail App Password (If you can find it)
- Try these direct links:
  - https://myaccount.google.com/apppasswords
  - https://security.google.com/settings/security/apppasswords

## Option 3: Keep using Log driver (Current)
- Emails are logged to: storage/logs/laravel.log
- Good for debugging but users won't receive actual emails

## Steps to test with different configurations:

### Test 1: Check current email functionality
```bash
cd backend
php artisan tinker --execute="
\$user = 'dangkhoavu666@gmail.com';
echo 'Testing email to: ' . \$user . PHP_EOL;
\Mail::raw('Test email from KV Together', function(\$message) use (\$user) {
    \$message->to(\$user)->subject('KV Together Test Email');
});
echo 'Email sent (check log file)' . PHP_EOL;
"
```

### Test 2: Real registration flow
1. Go to frontend test page: http://localhost:3000/test/registration
2. Fill form with real email
3. Submit and check logs

### Test 3: After getting Mailtrap credentials
```bash
# Update .env with Mailtrap settings
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_username
MAIL_PASSWORD=your_mailtrap_password

# Clear cache and test
php artisan config:clear
php artisan tinker --execute="Mail::raw('Real test', function(\$m) { \$m->to('test@example.com')->subject('Mailtrap Test'); }); echo 'Sent to Mailtrap!';"
```
