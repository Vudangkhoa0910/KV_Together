<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Category;
use App\Models\CampaignUpdate;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;

class CampaignController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->except(['index', 'show', 'featured', 'getCompleted', 'getRecentSuccessful', 'getUrgent']);
    }

    public function index()
    {
        try {
            $query = Campaign::with(['categories', 'organizer'])
                ->withCount('donations');

            if (request('category')) {
                $categorySlug = request('category');
                $query->whereHas('categories', function($q) use ($categorySlug) {
                    $q->where('slug', $categorySlug);
                });
            }

            if (request('search')) {
                $query->search(request('search'));
            }

            // Filter by status - default to active if no status specified
            if (request('status')) {
                $query->where('status', request('status'));
            } else {
                // Only show truly active campaigns (status = active AND not expired)
                $query->where('status', 'active')
                      ->where('end_date', '>', now());
            }

            // Sắp xếp
            switch(request('sort', 'newest')) {
                case 'oldest':
                    $query->oldest();
                    break;
                case 'amount':
                    $query->orderByDesc('current_amount');
                    break;
                case 'deadline':
                    $query->orderBy('end_date');
                    break;
                case 'newest':
                default:
                    $query->latest();
                    break;
            }

            $campaigns = $query->paginate(9);
           
           // Add image URLs, donations count and status information
           $campaignsData = $campaigns->items();
           foreach ($campaignsData as $campaign) {
               $campaign->image_url = $campaign->getImageUrlAttribute();
               $campaign->images_url = $campaign->getImagesUrlAttribute();
               
               // Add display status and status color for frontend
               $campaign->display_status = $campaign->getDisplayStatus();
               $campaign->status_color = $campaign->getStatusColor();
               $campaign->was_stopped_before_target = $campaign->wasStoppedBeforeTarget();
           }

            return response()->json([
                'data' => $campaignsData,
                'meta' => [
                    'current_page' => $campaigns->currentPage(),
                    'last_page' => $campaigns->lastPage(),
                    'total' => $campaigns->total(),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching campaigns:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Có lỗi xảy ra khi tải danh sách chiến dịch'], 500);
        }
    }

    public function create()
    {
        $this->authorize('create', Campaign::class);
        
        $categories = Category::all();
        return response()->json(['categories' => $categories]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Campaign::class);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'target_amount' => 'required|numeric|min:1000000',
            'end_date' => 'required|date|after:today',
            'category_id' => 'required|exists:categories,id',
            'image' => 'required|image|max:2048',
        ], [
            'title.required' => 'Tiêu đề chiến dịch là bắt buộc',
            'title.max' => 'Tiêu đề không được vượt quá 255 ký tự',
            'description.required' => 'Mô tả chiến dịch là bắt buộc',
            'target_amount.required' => 'Số tiền mục tiêu là bắt buộc',
            'target_amount.min' => 'Số tiền mục tiêu tối thiểu là 1.000.000đ',
            'end_date.required' => 'Ngày kết thúc là bắt buộc',
            'end_date.after' => 'Ngày kết thúc phải sau ngày hôm nay',
            'category_id.required' => 'Danh mục là bắt buộc',
            'category_id.exists' => 'Danh mục không tồn tại',
            'image.required' => 'Hình ảnh chiến dịch là bắt buộc',
            'image.image' => 'File phải là hình ảnh',
            'image.max' => 'Kích thước hình ảnh không được vượt quá 2MB',
        ]);

        try {
        $images = [];
        if ($request->hasFile('image')) {
            // Make sure we store images without backslashes
            $path = str_replace('\\', '', $request->file('image')->store('campaigns', 'public'));
            $images[] = $path;
            $validated['images'] = $images;
            $validated['image'] = $path; // For backward compatibility
        }

        $validated['organizer_id'] = auth()->id();
        $validated['current_amount'] = 0;
            $validated['status'] = 'pending';

        $campaign = Campaign::create($validated);

            // Notify admins about new campaign
            $admins = User::whereHas('role', function($query) {
                $query->where('slug', 'admin');
            })->get();

            foreach ($admins as $admin) {
        Notification::create([
                    'user_id' => $admin->id,
                    'type' => 'new_campaign',
                    'message' => "Chiến dịch mới '{$campaign->title}' cần được phê duyệt.",
                    'data' => ['campaign_id' => $campaign->id]
                ]);
            }

            Log::info('Campaign created', ['campaign_id' => $campaign->id, 'user_id' => auth()->id()]);

            return response()->json([
                'message' => 'Chiến dịch đã được tạo và đang chờ phê duyệt.',
                'campaign' => $campaign
            ], 201);

        } catch (\Exception $e) {
            Log::error('Campaign creation failed', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);

            if (isset($path)) {
                Storage::disk('public')->delete($path);
            }

            return response()->json([
                'message' => 'Có lỗi xảy ra khi tạo chiến dịch.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($slug)
    {
        try {
            $campaign = Campaign::with(['categories', 'organizer' => function($query) {
                $query->select('id', 'name', 'email', 'avatar', 'bio', 'phone', 'address', 'fundraiser_type', 'status');
            }, 'realDonations' => function($query) {
                $query->with('user:id,name,avatar')
                      ->orderBy('created_at', 'desc')
                      ->limit(5);
            }])
            ->where('slug', $slug)
            ->firstOrFail();
            
            // Kiểm tra và cập nhật trạng thái chiến dịch nếu cần
            $campaign = $this->checkAndUpdateCampaignStatus($campaign);
            
            // Try to load updates if the table exists
            try {
                $campaign->load('updates');
            } catch (\Exception $e) {
                Log::warning('Could not load campaign updates: ' . $e->getMessage());
                // Continue without updates if there's an issue
            }
            
            // Tính lại current_amount từ real donations trước khi save
            $realCurrentAmount = $campaign->realDonations()->sum('amount');
            if ($campaign->current_amount != $realCurrentAmount) {
                $campaign->current_amount = $realCurrentAmount;
                $campaign->save();
            }
            
            // Calculate remaining time and progress (after save)
            $campaign->days_remaining = now()->diffInDays($campaign->end_date, false);
            $campaign->progress_percentage = $campaign->target_amount > 0 
                ? round(($campaign->current_amount / $campaign->target_amount) * 100)
                : 0;
            
            // Add image URLs (computed attributes - not saved to DB)
            $campaign->image_url = $campaign->getImageUrlAttribute();
            $campaign->images_url = $campaign->getImagesUrlAttribute();
            
            // Add organizer avatar URL if exists
            if ($campaign->organizer && $campaign->organizer->avatar) {
                $campaign->organizer->avatar_url = url('storage/' . str_replace('\\', '', $campaign->organizer->avatar));
            }

            // Tính lại current_amount từ real donations trước khi save
            $realCurrentAmount = $campaign->realDonations()->sum('amount');
            if ($campaign->current_amount != $realCurrentAmount) {
                $campaign->current_amount = $realCurrentAmount;
                $campaign->save();
            }
            
            // Calculate remaining time and progress (after save)
            $campaign->days_remaining = now()->diffInDays($campaign->end_date, false);
            $campaign->progress_percentage = $campaign->target_amount > 0 
                ? round(($campaign->current_amount / $campaign->target_amount) * 100, 2) // 2 decimal places
                : 0;
            
            // Add remaining amount info for frontend
            $campaign->remaining_amount = max(0, $campaign->target_amount - $campaign->current_amount);
            $campaign->is_completed = $campaign->status === 'completed' || $campaign->current_amount >= $campaign->target_amount;
                
            // Add donation count for easier access in the frontend (chỉ đếm real donations)
            $campaign->donations_count = $campaign->realDonations()->count();
            
            // Add display status and status color for frontend
            $campaign->display_status = $campaign->getDisplayStatus();
            $campaign->status_color = $campaign->getStatusColor();
            $campaign->was_stopped_before_target = $campaign->wasStoppedBeforeTarget();
            
            // Rename realDonations to donations cho frontend compatibility
            $campaign->donations = $campaign->realDonations;
            
            // Include detailed organizer information
            if ($campaign->organizer_description || $campaign->organizer_website || 
                $campaign->organizer_address || $campaign->organizer_hotline || 
                $campaign->organizer_contact) {
                $campaign->organizer_details = [
                    'name' => $campaign->organizer_name,
                    'description' => $campaign->organizer_description,
                    'website' => $campaign->organizer_website,
                    'address' => $campaign->organizer_address,
                    'hotline' => $campaign->organizer_hotline,
                    'contact' => $campaign->organizer_contact
                ];
            }

            return response()->json($campaign);
        } catch (\Exception $e) {
            Log::error('Error fetching campaign:', ['error' => $e->getMessage(), 'slug' => $slug]);
            return response()->json(['message' => 'Không tìm thấy chiến dịch'], 404);
        }
    }

    public function featured()
    {
        try {
            $campaigns = Campaign::where('status', 'active')
                ->where('end_date', '>', now()) // Only non-expired campaigns
                ->where('is_featured', true)
                ->with(['categories', 'organizer'])
                ->withCount('donations')
                ->latest()
                ->limit(3)
                ->get();
            
            // Add image URLs
            foreach ($campaigns as $campaign) {
                $campaign->image_url = $campaign->getImageUrlAttribute();
                $campaign->images_url = $campaign->getImagesUrlAttribute();
            }
            
            return response()->json($campaigns);
        } catch (\Exception $e) {
            Log::error('Error fetching featured campaigns:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Có lỗi xảy ra khi tải danh sách chiến dịch nổi bật'], 500);
        }
    }

    public function getRecentSuccessful(Request $request)
    {
        try {
            $limit = $request->get('limit', 6);
            
            $campaigns = Campaign::where('status', 'active')
                ->where('end_date', '>', now()) // Only non-expired campaigns
                ->with(['categories', 'organizer'])
                ->withCount('donations')
                ->whereRaw('current_amount >= target_amount * 0.7') // Đạt ít nhất 70% mục tiêu
                ->orderByDesc('progress_percentage')
                ->orderBy('end_date', 'asc')
                ->limit($limit)
                ->get();
            
            // Add image URLs and calculate additional data
            foreach ($campaigns as $campaign) {
                $campaign->image_url = $campaign->getImageUrlAttribute();
                $campaign->images_url = $campaign->getImagesUrlAttribute();
                $campaign->time_left = now()->diffInDays($campaign->end_date, false);
            }
            
            return response()->json($campaigns);
        } catch (\Exception $e) {
            Log::error('Error fetching recent successful campaigns:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Có lỗi xảy ra khi tải danh sách chiến dịch thành công'], 500);
        }
    }

    public function getUrgent(Request $request)
    {
        try {
            $limit = $request->get('limit', 4);
            
            $campaigns = Campaign::where('status', 'active')
                ->with(['categories', 'organizer'])
                ->withCount('donations')
                ->where('end_date', '>=', now())
                ->where('end_date', '<=', now()->addDays(30)) // Kết thúc trong 30 ngày
                ->whereRaw('current_amount < target_amount * 0.8') // Chưa đạt 80% mục tiêu
                ->orderBy('end_date', 'asc')
                ->limit($limit)
                ->get();
            
            // Add image URLs and calculate additional data
            foreach ($campaigns as $campaign) {
                $campaign->image_url = $campaign->getImageUrlAttribute();
                $campaign->images_url = $campaign->getImagesUrlAttribute();
                $campaign->time_left = now()->diffInDays($campaign->end_date, false);
                $campaign->urgency_level = $campaign->time_left <= 7 ? 'critical' : ($campaign->time_left <= 14 ? 'high' : 'medium');
            }
            
            return response()->json($campaigns);
        } catch (\Exception $e) {
            Log::error('Error fetching urgent campaigns:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Có lỗi xảy ra khi tải danh sách chiến dịch cần ưu tiên'], 500);
        }
    }

    public function edit(Campaign $campaign)
    {
        $this->authorize('update', $campaign);
        
        $categories = Category::all();
        return response()->json([
            'campaign' => $campaign,
            'categories' => $categories
        ]);
    }

    public function update(Request $request, Campaign $campaign)
    {
        $this->authorize('update', $campaign);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'target_amount' => 'required|numeric|min:1000000',
            'end_date' => 'required|date|after:today',
            'category_id' => 'required|exists:categories,id',
            'image' => 'nullable|image|max:2048',
        ], [
            'title.required' => 'Tiêu đề chiến dịch là bắt buộc',
            'title.max' => 'Tiêu đề không được vượt quá 255 ký tự',
            'description.required' => 'Mô tả chiến dịch là bắt buộc',
            'target_amount.required' => 'Số tiền mục tiêu là bắt buộc',
            'target_amount.min' => 'Số tiền mục tiêu tối thiểu là 1.000.000đ',
            'end_date.required' => 'Ngày kết thúc là bắt buộc',
            'end_date.after' => 'Ngày kết thúc phải sau ngày hôm nay',
            'category_id.required' => 'Danh mục là bắt buộc',
            'category_id.exists' => 'Danh mục không tồn tại',
            'image.image' => 'File phải là hình ảnh',
            'image.max' => 'Kích thước hình ảnh không được vượt quá 2MB',
        ]);

        try {
        if ($request->hasFile('image')) {
            if ($campaign->image) {
                Storage::disk('public')->delete($campaign->image);
            }
            // Delete all old images
            if ($campaign->images) {
                foreach ($campaign->images as $oldImage) {
                    Storage::disk('public')->delete($oldImage);
                }
            }
            $path = str_replace('\\', '', $request->file('image')->store('campaigns', 'public'));
            $validated['image'] = $path;
            $validated['images'] = [$path];
        }

        $campaign->update($validated);

            Log::info('Campaign updated', ['campaign_id' => $campaign->id, 'user_id' => auth()->id()]);

            return response()->json([
                'message' => 'Chiến dịch đã được cập nhật thành công.',
                'campaign' => $campaign
            ]);

        } catch (\Exception $e) {
            Log::error('Campaign update failed', [
                'error' => $e->getMessage(),
                'campaign_id' => $campaign->id,
                'user_id' => auth()->id()
            ]);

            if (isset($path)) {
                Storage::disk('public')->delete($path);
            }

            return response()->json([
                'message' => 'Có lỗi xảy ra khi cập nhật chiến dịch.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Campaign $campaign)
    {
        $this->authorize('delete', $campaign);

        try {
        if ($campaign->image) {
            Storage::disk('public')->delete($campaign->image);
        }
        if ($campaign->images) {
            foreach ($campaign->images as $image) {
                Storage::disk('public')->delete($image);
            }
        }

        $campaign->delete();

            Log::info('Campaign deleted', ['campaign_id' => $campaign->id, 'user_id' => auth()->id()]);

            return response()->json([
                'message' => 'Chiến dịch đã được xóa thành công.'
            ]);

        } catch (\Exception $e) {
            Log::error('Campaign deletion failed', [
                'error' => $e->getMessage(),
                'campaign_id' => $campaign->id,
                'user_id' => auth()->id()
            ]);

            return response()->json([
                'message' => 'Có lỗi xảy ra khi xóa chiến dịch.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function approve(Campaign $campaign)
    {
        $this->authorize('approve', $campaign);

        try {
            $campaign->update(['status' => 'active']);

            // Notify organizer
            Notification::create([
                'user_id' => $campaign->organizer_id,
                'type' => 'campaign_approved',
                'message' => "Chiến dịch '{$campaign->title}' đã được phê duyệt.",
                'data' => ['campaign_id' => $campaign->id]
            ]);

            Log::info('Campaign approved', [
                'campaign_id' => $campaign->id, 
                'approved_by' => auth()->id()
        ]);

        return response()->json([
                'message' => 'Chiến dịch đã được phê duyệt thành công.',
                'campaign' => $campaign
            ]);

        } catch (\Exception $e) {
            Log::error('Campaign approval failed', [
                'error' => $e->getMessage(),
                'campaign_id' => $campaign->id
            ]);

            return response()->json([
                'message' => 'Có lỗi xảy ra khi phê duyệt chiến dịch.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function reject(Request $request, Campaign $campaign)
    {
        $this->authorize('reject', $campaign);

        $validated = $request->validate([
            'reason' => 'required|string|max:500'
        ], [
            'reason.required' => 'Lý do từ chối là bắt buộc',
            'reason.max' => 'Lý do không được vượt quá 500 ký tự'
        ]);

        try {
            $campaign->update([
                'status' => 'rejected',
                'rejection_reason' => $validated['reason']
            ]);

            // Notify organizer
            Notification::create([
                'user_id' => $campaign->organizer_id,
                'type' => 'campaign_rejected',
                'message' => "Chiến dịch '{$campaign->title}' đã bị từ chối.",
                'data' => [
                    'campaign_id' => $campaign->id,
                    'reason' => $validated['reason']
                ]
            ]);

            Log::info('Campaign rejected', [
                'campaign_id' => $campaign->id, 
                'rejected_by' => auth()->id(),
                'reason' => $validated['reason']
            ]);

            return response()->json([
                'message' => 'Chiến dịch đã bị từ chối.',
                'campaign' => $campaign
            ]);

        } catch (\Exception $e) {
            Log::error('Campaign rejection failed', [
                'error' => $e->getMessage(),
                'campaign_id' => $campaign->id
        ]);

            return response()->json([
                'message' => 'Có lỗi xảy ra khi từ chối chiến dịch.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tự động kiểm tra và cập nhật trạng thái chiến dịch khi cần thiết
     */
    private function checkAndUpdateCampaignStatus($campaign)
    {
        // Không tự động chuyển trạng thái completed
        return $campaign->fresh();
    }

    public function getCompleted(Request $request)
    {
        try {
            // Lấy chiến dịch hoàn thành theo 3 điều kiện:
            // 1. status = 'completed' (đã được đánh dấu hoàn thành thủ công)
            // 2. current_amount >= target_amount (đã đạt đủ số tiền), HOẶC
            // 3. end_date <= now() (đã hết thời gian)
            $query = Campaign::where(function($q) {
                $q->where('status', 'completed')
                  ->orWhereRaw('current_amount >= target_amount')
                  ->orWhere('end_date', '<=', now());
            })
                ->with(['categories', 'organizer'])
                ->withCount('donations')
                ->withSum('realDonations', 'amount');

            // Filter by category if provided
            if ($request->category && $request->category !== 'all') {
                $categorySlug = $request->category;
                $query->whereHas('categories', function($q) use ($categorySlug) {
                    $q->where('slug', $categorySlug);
                });
            }

            // Search functionality
            if ($request->search) {
                $query->search($request->search);
            }

            // Sắp xếp
            switch($request->get('sort', 'newest')) {
                case 'oldest':
                    $query->oldest();
                    break;
                case 'amount':
                    $query->orderByDesc('current_amount');
                    break;
                case 'target':
                    $query->orderByDesc('target_amount');
                    break;
                case 'newest':
                default:
                    $query->latest();
                    break;
            }

            $campaigns = $query->paginate($request->get('per_page', 9));
           
            // Add image URLs and status information
            $campaignsData = $campaigns->items();
            foreach ($campaignsData as $campaign) {
                $campaign->image_url = $campaign->getImageUrlAttribute();
                $campaign->images_url = $campaign->getImagesUrlAttribute();
                
                // Add display status and status color for frontend
                $campaign->display_status = $campaign->getDisplayStatus();
                $campaign->status_color = $campaign->getStatusColor();
                $campaign->was_stopped_before_target = $campaign->wasStoppedBeforeTarget();
            }

            // Calculate total raised amount from all completed campaigns (including expired ones)
            $totalRaised = Campaign::where(function($q) {
                $q->where('status', 'completed')
                  ->orWhereRaw('current_amount >= target_amount')
                  ->orWhere('end_date', '<=', now());
            })->sum('current_amount');

            return response()->json([
                'data' => $campaignsData,
                'meta' => [
                    'current_page' => $campaigns->currentPage(),
                    'last_page' => $campaigns->lastPage(),
                    'total' => $campaigns->total(),
                    'total_raised' => $totalRaised,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching completed campaigns:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Có lỗi xảy ra khi tải danh sách chiến dịch đã hoàn thành'], 500);
        }
    }
}