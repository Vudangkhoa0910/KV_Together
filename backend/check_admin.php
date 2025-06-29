<?php

use App\Models\User;
use App\Models\Role;

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Check admin role
$adminRole = Role::where('slug', 'admin')->first();
if (!$adminRole) {
    echo "No admin role found\n";
    exit;
}

echo "Admin role exists: {$adminRole->name}\n";

// Check admin users
$adminUsers = User::where('role_id', $adminRole->id)->get();
echo "Admin users count: {$adminUsers->count()}\n";

foreach ($adminUsers as $user) {
    echo "- {$user->name} ({$user->email}) - Status: {$user->status}\n";
}

// Check if there's a user with admin email
$adminUser = User::where('email', 'admin@kvtogether.com')->first();
if ($adminUser) {
    echo "\nFound admin@kvtogether.com user:\n";
    echo "- Role: {$adminUser->role->name} ({$adminUser->role->slug})\n";
    echo "- Status: {$adminUser->status}\n";
} else {
    echo "\nNo admin@kvtogether.com user found\n";
}
