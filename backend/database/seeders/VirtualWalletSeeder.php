<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\VirtualWallet;
use App\Models\CreditTransaction;

class VirtualWalletSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Tìm user với email khoauser@gmail.com
        $user = User::where('email', 'khoauser@gmail.com')->first();
        
        if (!$user) {
            $this->command->error("User with email 'khoauser@gmail.com' not found!");
            return;
        }

        $this->command->info("Found user: {$user->name} ({$user->email})");

        // Lấy hoặc tạo wallet cho user
        $wallet = $user->getWallet();
        
        $this->command->info("Current wallet balance: {$wallet->balance} Credits");

        // Các khoản Credits để thêm vào
        $creditsToAdd = [
            [
                'amount' => 500000,
                'description' => 'Credits khởi tạo cho user test',
                'source_type' => 'bonus',
                'type' => 'earn'
            ],
            [
                'amount' => 200000,
                'description' => 'Bonus Credits cho việc tham gia beta test',
                'source_type' => 'bonus',
                'type' => 'earn'
            ],
            [
                'amount' => 300000,
                'description' => 'Credits từ chiến dịch thất bại - Test Campaign',
                'source_type' => 'failed_campaign',
                'type' => 'earn'
            ],
            [
                'amount' => 100000,
                'description' => 'Referral bonus - giới thiệu bạn bè',
                'source_type' => 'referral',
                'type' => 'bonus'
            ],
        ];

        $totalAdded = 0;

        foreach ($creditsToAdd as $credit) {
            $transaction = $wallet->addCredits(
                $credit['amount'],
                $credit['type'],
                $credit['description'],
                $credit['source_type']
            );

            $totalAdded += $credit['amount'];
            
            $this->command->info("Added {$credit['amount']} Credits: {$credit['description']}");
        }

        // Refresh wallet data
        $wallet = $wallet->fresh();

        $this->command->info("Total Credits added: " . number_format($totalAdded, 0, ',', '.'));
        $this->command->info("New wallet balance: " . number_format($wallet->balance, 0, ',', '.') . " Credits");
        $this->command->info("Total earned: " . number_format($wallet->total_earned, 0, ',', '.') . " Credits");
        $this->command->info("Current tier: {$wallet->tier} ({$wallet->getTierDisplayName()})");

        // Hiển thị tier benefits
        $benefits = $wallet->getTierBenefits();
        $this->command->info("Tier benefits:");
        $this->command->info("- Transaction fee discount: {$benefits['transaction_fee_discount']}%");
        $this->command->info("- Priority support: " . ($benefits['priority_support'] ? 'Yes' : 'No'));
        $this->command->info("- Beta access: " . ($benefits['beta_access'] ? 'Yes' : 'No'));
        $this->command->info("- Consultation: " . ($benefits['consultation'] ? 'Yes' : 'No'));

        $this->command->info("Wallet seeding completed successfully! 🎉");
    }
}
