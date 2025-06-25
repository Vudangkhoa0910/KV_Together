<?php

use Illuminate\Support\Facades\DB;
use App\Models\Campaign;

// Script to fix campaign statuses according to correct logic
echo "Starting campaign status fix...\n";

$campaigns = Campaign::all();
$fixed = 0;

foreach ($campaigns as $campaign) {
    $current = $campaign->current_amount ?? 0;
    $target = $campaign->target_amount ?? 0;
    $isExpired = $campaign->end_date && now()->gt($campaign->end_date);
    $targetReached = $target > 0 && $current >= $target;
    
    $correctStatus = null;
    
    // Determine correct status
    if ($targetReached) {
        // Hoàn thành: đạt đủ target (bất kể thời gian)
        $correctStatus = 'completed';
    } elseif ($isExpired) {
        // Đã kết thúc: hết hạn + chưa đạt target
        if ($campaign->funding_type === 'flexible' || ($campaign->minimum_goal && $current >= $campaign->minimum_goal)) {
            $correctStatus = 'ended_partial';
        } else {
            $correctStatus = 'ended_failed';
        }
    } elseif ($campaign->status === 'active') {
        // Đang hoạt động: chưa hết hạn + chưa đạt target
        $correctStatus = 'active';
    } else {
        // Giữ nguyên các status khác (pending, draft, rejected, etc.)
        continue;
    }
    
    if ($campaign->status !== $correctStatus) {
        echo "Campaign ID {$campaign->id}: {$campaign->status} -> {$correctStatus}\n";
        echo "  Current: {$current}, Target: {$target}, Expired: " . ($isExpired ? 'Yes' : 'No') . "\n";
        
        $campaign->update(['status' => $correctStatus]);
        $fixed++;
    }
}

echo "Fixed {$fixed} campaigns.\n";

// Show summary
$summary = [
    'total' => Campaign::count(),
    'active' => Campaign::where('status', 'active')->count(),
    'completed' => Campaign::where('status', 'completed')->count(),
    'ended_failed' => Campaign::where('status', 'ended_failed')->count(),
    'ended_partial' => Campaign::where('status', 'ended_partial')->count(),
    'other' => Campaign::whereNotIn('status', ['active', 'completed', 'ended_failed', 'ended_partial'])->count(),
];

echo "\nSummary after fix:\n";
foreach ($summary as $status => $count) {
    echo "  {$status}: {$count}\n";
}

echo "\nDone!\n";
