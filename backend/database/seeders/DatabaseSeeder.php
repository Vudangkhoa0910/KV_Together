<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Campaign;
use App\Models\Donation;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        \App\Models\User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@kvtogether.org',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        // Create sample campaigns
        \App\Models\Campaign::create([
            'title' => 'Nước sạch cho trường học',
            'description' => 'Giúp các em học sinh vùng cao có nước sạch để sử dụng, cải thiện điều kiện vệ sinh và sức khỏe cho các em.',
            'target_amount' => 50000000,
            'current_amount' => 25000000,
            'image_url' => '/images/bg.jpeg',
            'is_featured' => true,
            'status' => 'active',
        ]);

        \App\Models\Campaign::create([
            'title' => 'Thư viện tóc',
            'description' => 'Hỗ trợ bệnh nhân ung thư có tóc giả để tự tin hơn trong cuộc sống, giúp họ vượt qua giai đoạn khó khăn.',
            'target_amount' => 100000000,
            'current_amount' => 75000000,
            'image_url' => '/images/bg.jpeg',
            'is_featured' => true,
            'status' => 'active',
        ]);

        \App\Models\Campaign::create([
            'title' => 'Cải thiện bếp đun',
            'description' => 'Giúp các gia đình khó khăn có bếp đun an toàn và tiết kiệm nhiên liệu, bảo vệ sức khỏe và môi trường.',
            'target_amount' => 80000000,
            'current_amount' => 40000000,
            'image_url' => '/images/bg.jpeg',
            'is_featured' => true,
            'status' => 'active',
        ]);

        // Create sample users with different roles
        User::create([
            'name' => 'Sứ giả 1',
            'email' => 'ambassador1@kvtogether.org',
            'password' => bcrypt('password'),
            'role' => 'ambassador',
        ]);

        User::create([
            'name' => 'Tổ chức 1',
            'email' => 'org1@kvtogether.org',
            'password' => bcrypt('password'),
            'role' => 'organization',
        ]);

        // Create sample donations
        $users = User::all();
        $campaigns = Campaign::all();

        foreach ($campaigns as $campaign) {
            foreach ($users as $user) {
                if (rand(0, 1)) {
                    Donation::create([
                        'user_id' => $user->id,
                        'campaign_id' => $campaign->id,
                        'amount' => rand(100000, 1000000),
                        'message' => 'Chúc chiến dịch thành công!',
                    ]);
                }
            }
        }
    }
}
