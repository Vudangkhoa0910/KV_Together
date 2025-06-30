<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Get roles
        $adminRole = Role::where('slug', 'admin')->first();
        $fundraiserRole = Role::where('slug', 'fundraiser')->first();
        $userRole = Role::where('slug', 'user')->first();

        // Create admin
        User::create([
            'name' => 'Khoa Admin',
            'email' => 'admin@kvtogether.com',
            'password' => Hash::make('password'),
            'phone' => '0123456789',
            'role_id' => $adminRole->id,
            'status' => 'active',
            'email_verified_at' => now()->subDays(30),
            'created_at' => now()->subDays(30),
            'updated_at' => now()->subDays(5),
        ]);

        // Create demo admin
        User::create([
            'name' => 'Vũ Đăng Khoa (Admin)',
            'email' => 'khoaadmin@gmail.com',
            'password' => Hash::make('123456a@'),
            'phone' => '0123456788',
            'role_id' => $adminRole->id,
            'status' => 'active',
            'email_verified_at' => now()->subDays(25),
            'created_at' => now()->subDays(25),
            'updated_at' => now()->subDays(3),
        ]);

        // Create fundraisers
        $fundraisers = [
            [
                'name' => 'Khoa Fundraiser',
                'email' => 'fundraiser@kvtogether.com',
                'password' => Hash::make('password'),
                'phone' => '0123456781',
                'role_id' => $fundraiserRole->id,
                'status' => 'active',
                'email_verified_at' => now()->subDays(20),
                'created_at' => now()->subDays(20),
                'updated_at' => now()->subDays(2),
                'address' => 'Hà Nội',
                'id_card' => '012345678901',
                'registration_reason' => 'Tài khoản demo cho fundraiser',
            ],
            [
                'name' => 'Vũ Đăng Khoa (Fundraiser)',
                'email' => 'khoaraiser@gmail.com',
                'password' => Hash::make('123456a@'),
                'phone' => '0123456782',
                'role_id' => $fundraiserRole->id,
                'status' => 'active',
                'email_verified_at' => now(),
                'address' => 'Hà Nội',
                'id_card' => '012345678902',
                'registration_reason' => 'Muốn giúp đỡ cộng đồng',
            ],
            [
                'name' => 'Tổ chức Tình thương',
                'email' => 'tinhthuong@example.com',
                'password' => Hash::make('password'),
                'phone' => '0123456783',
                'role_id' => $fundraiserRole->id,
                'status' => 'active',
                'email_verified_at' => now(),
                'address' => 'TP. Hồ Chí Minh',
                'id_card' => '012345678903',
                'registration_reason' => 'Hoạt động từ thiện',
                'fundraiser_type' => 'organization',
            ],
            [
                'name' => 'Quỹ Hy vọng',
                'email' => 'hyvong@example.com',
                'password' => Hash::make('password'),
                'phone' => '0123456784',
                'role_id' => $fundraiserRole->id,
                'status' => 'active',
                'email_verified_at' => now(),
                'address' => 'Đà Nẵng',
                'id_card' => '012345678904',
                'registration_reason' => 'Hỗ trợ giáo dục',
                'fundraiser_type' => 'organization',
            ],
            [
                'name' => 'Trần Văn Thiện',
                'email' => 'thientv@example.com',
                'password' => Hash::make('password'),
                'phone' => '0123456785',
                'role_id' => $fundraiserRole->id,
                'status' => 'pending',
                'email_verified_at' => now(),
                'address' => 'Cần Thơ',
                'id_card' => '012345678905',
                'registration_reason' => 'Muốn giúp đỡ người già',
            ],
            [
                'name' => 'Lê Văn C',
                'email' => 'fundraiser3@example.com',
                'password' => Hash::make('password'),
                'phone' => '0123456783',
                'role_id' => $fundraiserRole->id,
                'status' => 'pending',
                'email_verified_at' => now(),
            ],
        ];

        foreach ($fundraisers as $fundraiser) {
            User::create($fundraiser);
        }

        // Create regular users
        $users = [
            [
                'name' => 'Khoa User',
                'email' => 'user@kvtogether.com',
                'password' => Hash::make('password'),
                'phone' => '0123456786',
                'role_id' => $userRole->id,
                'status' => 'active',
                'email_verified_at' => now()->subDays(15),
                'created_at' => now()->subDays(15),
                'updated_at' => now()->subDays(1),
            ],
            [
                'name' => 'Vũ Đăng Khoa (User)',
                'email' => 'khoauser@gmail.com',
                'password' => Hash::make('123456a@'),
                'phone' => '0123456787',
                'role_id' => $userRole->id,
                'status' => 'active',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Hoàng Văn E',
                'email' => 'user2@example.com',
                'password' => Hash::make('password'),
                'phone' => '0123456785',
                'role_id' => $userRole->id,
                'status' => 'active',
                'email_verified_at' => now()->subDays(12),
                'created_at' => now()->subDays(12),
                'updated_at' => now()->subHours(6),
            ],
            [
                'name' => 'Đỗ Thị F',
                'email' => 'user3@example.com',
                'password' => Hash::make('password'),
                'phone' => '0123456786',
                'role_id' => $userRole->id,
                'status' => 'active', // Changed from inactive to active
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Nguyễn Văn G',
                'email' => 'user4@example.com',
                'password' => Hash::make('password'),
                'phone' => '0123456787',
                'role_id' => $userRole->id,
                'status' => 'active',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Trần Thị H',
                'email' => 'user5@example.com',
                'password' => Hash::make('password'),
                'phone' => '0123456788',
                'role_id' => $userRole->id,
                'status' => 'active',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Lê Văn I',
                'email' => 'user6@example.com',
                'password' => Hash::make('password'),
                'phone' => '0123456789',
                'role_id' => $userRole->id,
                'status' => 'active',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Phạm Thị K',
                'email' => 'user7@example.com',
                'password' => Hash::make('password'),
                'phone' => '0123456790',
                'role_id' => $userRole->id,
                'status' => 'active',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Đinh Văn L',
                'email' => 'user8@example.com',
                'password' => Hash::make('password'),
                'phone' => '0123456791',
                'role_id' => $userRole->id,
                'status' => 'active',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Võ Thị M',
                'email' => 'user9@example.com',
                'password' => Hash::make('password'),
                'phone' => '0123456792',
                'role_id' => $userRole->id,
                'status' => 'active',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Bùi Văn N',
                'email' => 'user10@example.com',
                'password' => Hash::make('password'),
                'phone' => '0123456793',
                'role_id' => $userRole->id,
                'status' => 'active',
                'email_verified_at' => now(),
            ],
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
} 