<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Campaign;
use App\Models\Donation;
use App\Models\User;

// Tìm 2 chiến dịch active có target nhỏ nhất
$campaigns = Campaign::where('status', 'active')
    ->orderBy('target_amount', 'asc')
    ->take(2)
    ->get();

$user = User::where('email', 'user@example.com')->first();

echo "Found " . $campaigns->count() . " campaigns to complete\n";

foreach ($campaigns as $campaign) {
    $amountNeeded = $campaign->target_amount - $campaign->current_amount;
    
    echo "Completing campaign: {$campaign->title}\n";
    echo "Target: " . number_format($campaign->target_amount) . " VND\n";
    echo "Current: " . number_format($campaign->current_amount) . " VND\n";
    echo "Adding: " . number_format($amountNeeded) . " VND\n";
    
    // Tạo donation
    Donation::create([
        'user_id' => $user->id,
        'campaign_id' => $campaign->id,
        'amount' => $amountNeeded,
        'message' => 'Hoàn thành mục tiêu chiến dịch!',
        'status' => 'completed',
        'payment_method' => 'bank_transfer',
        'is_stats' => false,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    
    // Cập nhật campaign
    $campaign->update([
        'current_amount' => $campaign->target_amount,
        'status' => 'completed'
    ]);
    
    echo "✓ Campaign completed successfully!\n\n";
}

echo "Summary of all completed campaigns:\n";
$completed = Campaign::where('status', 'completed')->get(['id', 'title', 'target_amount', 'current_amount']);
echo "Total completed campaigns: " . $completed->count() . "\n";
foreach ($completed as $c) {
    $progress = round(($c->current_amount / $c->target_amount) * 100, 1);
    echo "Campaign {$c->id}: {$progress}% - " . number_format($c->current_amount) . "/" . number_format($c->target_amount) . "\n";
}

echo "\nActive campaigns remaining:\n";
$active = Campaign::where('status', 'active')->count();
echo "Total active campaigns: " . $active . "\n";
