<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Donation;
use Illuminate\Http\Request;

class DonationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'campaign_id' => 'required|exists:campaigns,id',
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|in:credit_card,paypal,bank_transfer',
            'message' => 'nullable|string|max:500',
            'is_anonymous' => 'boolean'
        ]);

        $campaign = Campaign::findOrFail($validated['campaign_id']);

        if ($campaign->status !== 'active') {
            return back()->with('error', 'This campaign is no longer active.');
        }

        $validated['user_id'] = auth()->id();
        $validated['status'] = 'pending';

        $donation = Donation::create($validated);

        // Here you would typically integrate with a payment gateway
        // For now, we'll just mark it as completed
        $donation->update(['status' => 'completed']);

        // Update campaign current amount
        $campaign->increment('current_amount', $donation->amount);

        // Check if campaign target is reached
        if ($campaign->current_amount >= $campaign->target_amount) {
            $campaign->update(['status' => 'completed']);
        }

        return redirect()->route('campaigns.show', $campaign)
            ->with('success', 'Thank you for your donation!');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function adminIndex()
    {
        $this->authorize('viewAny', Donation::class);

        $donations = Donation::with(['user', 'campaign'])
            ->latest()
            ->paginate(20);

        return view('admin.donations.index', compact('donations'));
    }
}
