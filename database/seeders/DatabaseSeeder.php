<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Campaign;
use App\Models\News;
use App\Models\Activity;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'is_admin' => true,
        ]);

        // Create regular user
        $user = User::create([
            'name' => 'Regular User',
            'email' => 'user@example.com',
            'password' => Hash::make('password'),
        ]);

        // Create sample campaigns
        Campaign::create([
            'title' => 'Help Build a School',
            'description' => 'We are raising funds to build a new school in a rural area.',
            'target_amount' => 50000,
            'current_amount' => 15000,
            'start_date' => now(),
            'end_date' => now()->addMonths(3),
            'status' => 'active',
            'organizer_id' => $admin->id,
        ]);

        Campaign::create([
            'title' => 'Medical Supplies for Village',
            'description' => 'Providing essential medical supplies to remote villages.',
            'target_amount' => 25000,
            'current_amount' => 8000,
            'start_date' => now(),
            'end_date' => now()->addMonths(2),
            'status' => 'active',
            'organizer_id' => $admin->id,
        ]);

        // Create sample news
        News::create([
            'title' => 'Our First Campaign Success',
            'content' => 'We are proud to announce the successful completion of our first campaign.',
            'author_id' => $admin->id,
            'status' => 'published',
            'published_at' => now(),
        ]);

        News::create([
            'title' => 'New Partnership Announcement',
            'content' => 'We are excited to announce our new partnership with local organizations.',
            'author_id' => $admin->id,
            'status' => 'published',
            'published_at' => now()->subDays(2),
        ]);

        // Create sample activities
        Activity::create([
            'title' => 'Community Clean-up Day',
            'description' => 'Join us for a day of cleaning up our local community.',
            'date' => now()->addDays(7),
            'location' => 'Central Park',
            'status' => 'upcoming',
            'max_participants' => 50,
        ]);

        Activity::create([
            'title' => 'Fundraising Workshop',
            'description' => 'Learn how to organize effective fundraising campaigns.',
            'date' => now()->addDays(14),
            'location' => 'Community Center',
            'status' => 'upcoming',
            'max_participants' => 30,
        ]);
    }
}
