<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Make sure storage directory exists
        if (!file_exists(storage_path('app/public/campaigns'))) {
            mkdir(storage_path('app/public/campaigns'), 0777, true);
        }

        $this->call([
            RoleSeeder::class,
            CategorySeeder::class,
            UserSeeder::class,
            CampaignSeeder::class,
            DonationSeeder::class,
        ]);
    }
}