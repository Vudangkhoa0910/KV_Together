<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\ActivityRegistration;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class ActivityRegistrationSeeder extends Seeder
{
    public function run(): void
    {
        $activities = Activity::all();
        $users = User::where('status', 'active')->get();

        if ($activities->isEmpty() || $users->isEmpty()) {
            $this->command->warn('No activities or users found. Please run ActivitySeeder and UserSeeder first.');
            return;
        }

        foreach ($activities as $activity) {
            // Random number of registrations per activity (1-8)
            $registrationCount = rand(1, 8);
            $selectedUsers = $users->random(min($registrationCount, $users->count()));

            foreach ($selectedUsers as $index => $user) {
                $status = match(rand(1, 10)) {
                    1, 2 => 'cancelled',
                    3, 4 => 'pending',
                    5, 6, 7, 8 => 'confirmed',
                    9, 10 => 'completed'
                };

                $registeredDate = Carbon::now()->subDays(rand(1, 30));
                $confirmedDate = null;
                $cancelledDate = null;

                if ($status === 'confirmed' || $status === 'completed') {
                    $confirmedDate = $registeredDate->copy()->addHours(rand(1, 48));
                } elseif ($status === 'cancelled') {
                    $cancelledDate = $registeredDate->copy()->addHours(rand(1, 72));
                }

                ActivityRegistration::create([
                    'activity_id' => $activity->id,
                    'user_id' => $user->id,
                    'full_name' => $user->name,
                    'email' => $user->email,
                    'phone' => '0' . rand(900000000, 999999999),
                    'notes' => rand(1, 3) === 1 ? 'Tôi rất mong được tham gia hoạt động này!' : null,
                    'status' => $status,
                    'amount_paid' => $status === 'confirmed' || $status === 'completed' ? $activity->registration_fee : 0,
                    'payment_status' => $status === 'confirmed' || $status === 'completed' ? 'paid' : 'unpaid',
                    'payment_method' => $status === 'confirmed' || $status === 'completed' ? 'bank_transfer' : null,
                    'payment_reference' => $status === 'confirmed' || $status === 'completed' ? 'TXN' . rand(100000, 999999) : null,
                    'registered_at' => $registeredDate,
                    'confirmed_at' => $confirmedDate,
                    'cancelled_at' => $cancelledDate,
                    'created_at' => $registeredDate,
                    'updated_at' => $confirmedDate ?? $cancelledDate ?? $registeredDate,
                ]);
            }

            $this->command->info("Created {$registrationCount} registrations for: {$activity->title}");
        }

        $this->command->info('Activity registrations seeding completed!');
    }
}
