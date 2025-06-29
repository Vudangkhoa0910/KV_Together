<?php

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Foundation\Application;

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Create admin user
$adminRole = \App\Models\Role::where('slug', 'admin')->first();
if (!$adminRole) {
    echo "Creating admin role...\n";
    $adminRole = \App\Models\Role::create([
        'name' => 'Admin',
        'slug' => 'admin',
        'permissions' => json_encode(['*']), // all permissions
    ]);
}

$adminUser = \App\Models\User::where('email', 'admin@example.com')->first();
if (!$adminUser) {
    echo "Creating admin user...\n";
    $adminUser = \App\Models\User::create([
        'name' => 'Admin User',
        'email' => 'admin@example.com',
        'password' => bcrypt('admin123'),
        'role_id' => $adminRole->id,
        'email_verified_at' => now(),
    ]);
}

// Generate admin token
$token = $adminUser->createToken('admin-token')->plainTextToken;
echo "Admin user created successfully!\n";
echo "Email: admin@example.com\n";
echo "Password: admin123\n";
echo "Admin Token: $token\n";
