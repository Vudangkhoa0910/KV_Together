<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Category;
use App\Models\CampaignUpdate;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CampaignController extends Controller
{
    public function index()
    {
        $categories = Category::all();
        $query = Campaign::where('status', 'active');

        if (request('category_id')) {
            $query->where('category_id', request('category_id'));
        }

        $campaigns = $query->orderBy('created_at', 'desc')->paginate(9);

        return view('campaigns.index', compact('campaigns', 'categories'));
    }

    public function create()
    {
        $categories = Category::all();
        return view('campaigns.create', compact('categories'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|max:255',
            'description' => 'required',
            'target_amount' => 'required|numeric|min:1',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'image' => 'required|image|max:2048',
            'category_id' => 'required|exists:categories,id',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('campaigns', 'public');
            $validated['image'] = $path;
        }

        $validated['organizer_id'] = auth()->id();
        $validated['current_amount'] = 0;
        $validated['status'] = 'pending'; // Chờ phê duyệt

        $campaign = Campaign::create($validated);

        // Thông báo cho quản trị viên
        Notification::create([
            'user_id' => auth()->id(),
            'type' => 'campaign_submitted',
            'message' => "Chiến dịch '{$campaign->title}' đã được gửi để phê duyệt.",
        ]);

        return redirect()->route('campaigns.index')
            ->with('success', 'Campaign submitted for approval.');
    }

    public function show(Campaign $campaign)
    {
        $campaign->load(['donations' => fn($query) => $query->latest(), 'updates', 'category']);
        return view('campaigns.show', compact('campaign'));
    }

    public function edit(Campaign $campaign)
    {
        $this->authorize('update', $campaign);
        $categories = Category::all();
        return view('campaigns.edit', compact('campaign', 'categories'));
    }

    public function update(Request $request, Campaign $campaign)
    {
        $this->authorize('update', $campaign);

        $validated = $request->validate([
            'title' => 'required|max:255',
            'description' => 'required',
            'target_amount' => 'required|numeric|min:1',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'image' => 'nullable|image|max:2048',
            'category_id' => 'required|exists:categories,id',
        ]);

        if ($request->hasFile('image')) {
            if ($campaign->image) {
                Storage::disk('public')->delete($campaign->image);
            }
            $path = $request->file('image')->store('campaigns', 'public');
            $validated['image'] = $path;
        }

        $campaign->update($validated);

        return redirect()->route('campaigns.show', $campaign)
            ->with('success', 'Campaign updated successfully.');
    }

    public function destroy(Campaign $campaign)
    {
        $this->authorize('delete', $campaign);

        if ($campaign->image) {
            Storage::disk('public')->delete($campaign->image);
        }

        $campaign->delete();

        return redirect()->route('campaigns.index')
            ->with('success', 'Campaign deleted successfully.');
    }

    public function donate(Campaign $campaign)
    {
        return view('campaigns.donate', compact('campaign'));
    }

    public function analytics(Campaign $campaign)
    {
        $this->authorize('view', $campaign);
        $donations = $campaign->donations()->latest()->paginate(10);
        $donationData = $campaign->donations()
            ->selectRaw('DATE(created_at) as date, SUM(amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return view('campaigns.analytics', compact('campaign', 'donations', 'donationData'));
    }

    public function updates(Campaign $campaign)
    {
        $this->authorize('update', $campaign);
        $updates = $campaign->updates()->latest()->get();
        return view('campaigns.updates', compact('campaign', 'updates'));
    }

    public function storeUpdate(Request $request, Campaign $campaign)
    {
        $this->authorize('update', $campaign);

        $validated = $request->validate([
            'content' => 'required',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('campaign_updates', 'public');
            $validated['image'] = $path;
        }

        $campaign->updates()->create($validated);

        // Thông báo cho người theo dõi chiến dịch
        $donors = $campaign->donations()->pluck('user_id')->unique();
        foreach ($donors as $user_id) {
            Notification::create([
                'user_id' => $user_id,
                'type' => 'campaign_update',
                'message' => "Chiến dịch '{$campaign->title}' có cập nhật mới.",
            ]);
        }

        return redirect()->route('campaigns.updates', $campaign)
            ->with('success', 'Update added successfully.');
    }

    public function adminIndex()
    {
        $this->authorize('viewAny', Campaign::class);
        $campaigns = Campaign::with('organizer')->latest()->paginate(10);
        return view('admin.campaigns.index', compact('campaigns'));
    }

    public function approval()
    {
        $this->authorize('viewAny', Campaign::class);
        $campaigns = Campaign::where('status', 'pending')->with('organizer')->latest()->paginate(10);
        return view('admin.campaigns.approval', compact('campaigns'));
    }

    public function approve(Request $request, Campaign $campaign)
    {
        $this->authorize('update', $campaign);
        $campaign->update(['status' => 'active']);

        Notification::create([
            'user_id' => $campaign->organizer_id,
            'type' => 'campaign_approved',
            'message' => "Chiến dịch '{$campaign->title}' đã được phê duyệt.",
        ]);

        return redirect()->route('admin.campaigns.approval')
            ->with('success', 'Campaign approved successfully.');
    }
}