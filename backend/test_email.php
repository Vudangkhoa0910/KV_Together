<?php

require 'vendor/autoload.php';

use App\Models\ActivityRegistration;
use App\Notifications\ActivityRegistrationConfirmation;
use Illuminate\Support\Facades\Notification;

// Test email functionality
$testEmail = 'test@example.com';

// Create a mock registration for testing
$mockRegistration = (object) [
    'id' => 999,
    'activity_id' => 1,
    'user_id' => 1,
    'full_name' => 'Người Test',
    'email' => $testEmail,
    'phone' => '0123456789',
    'notes' => 'Đây là test email',
    'status' => 'pending',
    'amount_paid' => 0,
    'payment_status' => 'unpaid',
    'registered_at' => now(),
    'activity' => (object) [
        'id' => 1,
        'title' => 'Hoạt động Test',
        'location' => 'Địa điểm test',
        'event_date' => now()->addDays(7),
        'registration_fee' => 50000,
        'contact_email' => 'organizer@test.com',
        'contact_phone' => '0987654321',
        'slug' => 'hoat-dong-test'
    ]
];

echo "Attempting to send test email to: {$testEmail}\n";

try {
    // This would normally create a proper ActivityRegistration instance
    // but for testing we'll use a mock object
    Notification::route('mail', $testEmail)
        ->notify(new ActivityRegistrationConfirmation($mockRegistration));
    
    echo "Test email sent successfully!\n";
    echo "Check the log file: storage/logs/laravel.log\n";
} catch (Exception $e) {
    echo "Failed to send test email: " . $e->getMessage() . "\n";
}
