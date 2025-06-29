<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Campaign;
use App\Models\Donation;
use App\Models\VirtualWallet;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class RefundDemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Tạo demo cho chức năng hoàn tiền khi chiến dịch không đạt target
     */
    public function run(): void
    {
        DB::beginTransaction();
        
        try {
            // 1. Tìm hoặc tạo user khoauser@gmail.com
            $user = User::firstOrCreate(
                ['email' => 'khoauser@gmail.com'],
                [
                    'name' => 'Khoa Demo User',
                    'password' => bcrypt('password123'),
                    'email_verified_at' => now(),
                    'role' => 'user'
                ]
            );

            // 2. Tạo ví ảo cho user nếu chưa có
            $wallet = VirtualWallet::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'balance' => 0,
                    'total_earned' => 0,
                    'total_spent' => 0
                ]
            );

            // 3. Tạo chiến dịch demo sẽ thất bại
            $campaign = Campaign::create([
                'title' => 'Demo Campaign - Hỗ trợ xây dựng trường học vùng cao',
                'slug' => 'demo-campaign-ho-tro-xay-dung-truong-hoc-vung-cao',
                'description' => 'Chiến dịch demo để test chức năng hoàn tiền khi không đạt target. Chiến dịch này sẽ kết thúc mà chưa đủ mục tiêu.',
                'content' => 'Nội dung chi tiết về chiến dịch demo để test chức năng hoàn tiền khi không đạt target.',
                'target_amount' => 50000000, // 50 triệu VND target
                'current_amount' => 0,
                'organizer_id' => 1, // Admin user
                'organizer_name' => 'Quỹ Xây Dựng Trường Học',
                'organizer_description' => 'Tổ chức phi lợi nhuận hỗ trợ giáo dục',
                'organizer_hotline' => '0901234567',
                'status' => 'active',
                'start_date' => Carbon::now()->subDays(30), // Bắt đầu 30 ngày trước
                'end_date' => Carbon::now()->subDays(1), // Kết thúc hôm qua
                'image' => '/images/campaigns/demo-school.jpg'
            ]);

            echo "✓ Tạo chiến dịch demo: {$campaign->title}\n";
            echo "  - Target: " . number_format($campaign->target_amount) . " VND\n";
            echo "  - Trạng thái: {$campaign->status}\n";
            echo "  - Kết thúc: {$campaign->end_date}\n\n";

            // 4. Tạo một số donations từ user khoauser@gmail.com và user khác
            $donations = [
                [
                    'user' => $user,
                    'amount' => 5000000, // 5 triệu
                    'message' => 'Ủng hộ xây dựng trường học cho trẻ em vùng cao!',
                    'days_ago' => 25
                ],
                [
                    'user' => $user, 
                    'amount' => 3000000, // 3 triệu
                    'message' => 'Thêm một khoản ủng hộ nhỏ cho các em',
                    'days_ago' => 15
                ],
                [
                    'user' => User::find(1), // Admin user donation
                    'amount' => 10000000, // 10 triệu
                    'message' => 'Ủng hộ từ admin để khuyến khích',
                    'days_ago' => 20
                ]
            ];

            $totalDonated = 0;
            foreach ($donations as $donationData) {
                $donation = Donation::create([
                    'user_id' => $donationData['user']->id,
                    'campaign_id' => $campaign->id,
                    'amount' => $donationData['amount'],
                    'message' => $donationData['message'],
                    'status' => 'completed',
                    'payment_method' => 'bank_transfer',
                    'transaction_id' => 'DEMO_' . uniqid(),
                    'created_at' => Carbon::now()->subDays($donationData['days_ago']),
                    'updated_at' => Carbon::now()->subDays($donationData['days_ago'])
                ]);

                $totalDonated += $donationData['amount'];

                // Cập nhật ví của user
                if ($donationData['user']->id === $user->id) {
                    $userWallet = VirtualWallet::where('user_id', $donationData['user']->id)->first();
                    if ($userWallet) {
                        $userWallet->total_spent += $donationData['amount'];
                        $userWallet->save();
                    }
                }

                echo "✓ Tạo donation: " . number_format($donationData['amount']) . " VND từ {$donationData['user']->name}\n";
            }

            // 5. Cập nhật campaign current_amount
            $campaign->current_amount = $totalDonated;
            $campaign->status = 'cancelled'; // Đánh dấu là cancelled vì không đạt target
            $campaign->save();

            echo "\n📊 TỔNG KẾT CHIẾN DỊCH:\n";
            echo "  - Tổng quyên góp: " . number_format($totalDonated) . " VND\n";
            echo "  - Mục tiêu: " . number_format($campaign->target_amount) . " VND\n";
            echo "  - Đạt được: " . round(($totalDonated / $campaign->target_amount) * 100, 1) . "%\n";
            echo "  - Thiếu: " . number_format($campaign->target_amount - $totalDonated) . " VND\n";
            echo "  - Trạng thái: HỦY BỎ (chưa đạt target)\n\n";

            // 6. Tính toán số tiền cần hoàn cho khoauser@gmail.com
            $userDonations = Donation::where('campaign_id', $campaign->id)
                ->where('user_id', $user->id)
                ->where('status', 'completed')
                ->get();

            $totalUserDonated = $userDonations->sum('amount');

            echo "💰 THÔNG TIN HOÀN TIỀN CHO {$user->email}:\n";
            echo "  - Tổng đã quyên góp: " . number_format($totalUserDonated) . " VND\n";
            echo "  - Số giao dịch: " . $userDonations->count() . "\n";
            echo "  - Cần hoàn tiền: " . number_format($totalUserDonated) . " VND\n\n";

            // 7. Thực hiện hoàn tiền vào ví
            if ($totalUserDonated > 0) {
                // Cập nhật số dự ví
                $wallet->balance += $totalUserDonated;
                $wallet->total_earned += $totalUserDonated;
                $wallet->save();

                // Cập nhật status của donations thành refunded (nếu có status field hỗ trợ)
                // Donation::where('campaign_id', $campaign->id)
                //     ->where('user_id', $user->id)
                //     ->update(['status' => 'refunded']);

                echo "✅ HOÀN TIỀN THÀNH CÔNG!\n";
                echo "  - Số dự ví trước: " . number_format($wallet->balance - $totalUserDonated) . " VND\n";
                echo "  - Số tiền hoàn: +" . number_format($totalUserDonated) . " VND\n";
                echo "  - Số dự ví sau: " . number_format($wallet->balance) . " VND\n\n";
            }

            // 8. Demo hoàn tất
            echo "📝 DEMO ĐÃ HOÀN TẤT!\n";

            DB::commit();
            
            echo "\n🎉 DEMO SEEDER HOÀN TẤT!\n";
            echo "=====================================\n";
            echo "User: {$user->email}\n";
            echo "Campaign: {$campaign->title}\n";
            echo "Trạng thái: Thất bại (chưa đạt " . number_format($campaign->target_amount) . " VND)\n";
            echo "Đã hoàn tiền: " . number_format($totalUserDonated) . " VND\n";
            echo "Số dư ví hiện tại: " . number_format($wallet->balance) . " VND\n";
            echo "=====================================\n\n";
            
            echo "🧪 HƯỚNG DẪN TEST:\n";
            echo "1. Đăng nhập với email: khoauser@gmail.com\n";
            echo "2. Vào trang Ví của tôi để xem số dư và lịch sử giao dịch\n";
            echo "3. Kiểm tra các giao dịch hoàn tiền từ chiến dịch thất bại\n";
            echo "4. Xem chi tiết chiến dịch ID: {$campaign->id}\n";

        } catch (\Exception $e) {
            DB::rollback();
            echo "❌ LỖI: " . $e->getMessage() . "\n";
            throw $e;
        }
    }
}
