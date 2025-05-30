<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Donation;
use App\Models\Notification;
use Illuminate\Http\Request;

class DonationController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'campaign_id' => 'required|exists:campaigns,id',
            'amount' => 'required|numeric|min:10000',
            'payment_method' => 'required|in:momo,vnpay,bank_transfer',
            'message' => 'nullable|string|max:500',
            'is_anonymous' => 'boolean',
        ]);

        $campaign = Campaign::findOrFail($validated['campaign_id']);

        if ($campaign->status !== 'active') {
            return back()->with('error', 'This campaign is no longer active.');
        }

        $validated['user_id'] = auth()->id();
        $validated['status'] = 'pending';

        $donation = Donation::create($validated);

        // Giả lập thanh toán thành công
        $donation->update(['status' => 'completed']);

        // Cập nhật số tiền chiến dịch
        $campaign->increment('current_amount', $donation->amount);

        // Kiểm tra mục tiêu
        if ($campaign->current_amount >= $campaign->target_amount) {
            $campaign->update(['status' => 'completed']);
        }

        // Thông báo cho nhà tổ chức
        Notification::create([
            'user_id' => $campaign->organizer_id,
            'type' => 'donation_received',
            'message' => "Chiến dịch '{$campaign->title}' nhận được quyên góp " . number_format($donation->amount) . "đ.",
        ]);

        return redirect()->route('campaigns.show', $campaign)
            ->with('success', 'Thank you for your donation!');
    }

    public function adminIndex()
    {
        $this->authorize('viewAny', Donation::class);
        $donations = Donation::with(['user', 'campaign'])->latest()->paginate(20);
        $campaigns = Campaign::all(); // Để bộ lọc
        return view('admin.donations.index', compact('donations', 'campaigns'));
    }
}