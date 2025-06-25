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
        $this->middleware('auth:sanctum')->except(['index', 'show', 'featured', 'getCompleted', 'getEnded', 'getRecentSuccessful', 'getUrgent', 'getStatus', 'getSystemStatus']);
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
            // Lấy CHÍNH XÁC chiến dịch hoàn thành:
            // Chỉ những chiến dịch có status = 'completed' (đã được backend xử lý và đánh dấu hoàn thành)
            $query = Campaign::where('status', 'completed')
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

            // Calculate total raised amount from ONLY completed campaigns
            $totalRaised = Campaign::where('status', 'completed')->sum('current_amount');

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

    /**
     * Get detailed status for a campaign
     */
    public function getStatus(Campaign $campaign)
    {
        try {
            $detailedStatus = $campaign->getDetailedStatus();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'campaign_id' => $campaign->id,
                    'basic_status' => $campaign->status,
                    'detailed_status' => $detailedStatus,
                    'progress' => [
                        'percentage' => $campaign->progress_percentage,
                        'current_amount' => $campaign->current_amount,
                        'target_amount' => $campaign->target_amount,
                        'remaining_amount' => max(0, $campaign->target_amount - $campaign->current_amount)
                    ],
                    'time' => [
                        'end_date' => $campaign->end_date,
                        'days_remaining' => $campaign->days_remaining,
                        'is_expired' => $campaign->isExpired()
                    ],
                    'funding_info' => [
                        'funding_type' => $campaign->funding_type ?? 'all_or_nothing',
                        'minimum_goal' => $campaign->minimum_goal,
                        'auto_disburse' => $campaign->auto_disburse,
                        'accepts_credits' => $campaign->accepts_credits
                    ],
                    'closure' => $campaign->closure ? [
                        'type' => $campaign->closure->closure_type,
                        'status_text' => $campaign->closure->getClosureStatusText(),
                        'final_amount' => $campaign->closure->final_amount,
                        'disbursement_amount' => $campaign->closure->disbursement_amount,
                        'platform_fee' => $campaign->closure->platform_fee,
                        'requires_refund' => $campaign->closure->requiresRefund(),
                        'closed_at' => $campaign->closure->created_at
                    ] : null
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting campaign status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Không thể lấy trạng thái chiến dịch'
            ], 500);
        }
    }

    /**
     * Get campaigns by status for admin
     */
    public function getCampaignsByStatus(Request $request)
    {
        try {
            $status = $request->get('status', 'all');
            $perPage = $request->get('per_page', 15);
            
            $query = Campaign::with(['categories', 'organizer', 'closure'])
                ->withCount('donations');

            switch ($status) {
                case 'active':
                    // Chiến dịch đang hoạt động (chưa hết hạn và chưa đủ target)
                    $query->where('status', 'active')
                          ->where('end_date', '>', now())
                          ->whereColumn('current_amount', '<', 'target_amount');
                    break;

                case 'completed':
                    // Chiến dịch đã hoàn thành (đủ target)
                    $query->whereColumn('current_amount', '>=', 'target_amount');
                    break;

                case 'ended_failed':
                    // Chiến dịch đã kết thúc thất bại (hết hạn, chưa đủ target, all-or-nothing)
                    $query->whereHas('closure', function($q) {
                        $q->where('closure_type', 'failed');
                    });
                    break;

                case 'ended_partial':
                    // Chiến dịch kết thúc một phần (hết hạn, chưa đủ target, flexible funding)
                    $query->whereHas('closure', function($q) {
                        $q->where('closure_type', 'partial');
                    });
                    break;

                case 'expired_unprocessed':
                    // Chiến dịch hết hạn nhưng chưa được xử lý
                    $query->where('status', 'active')
                          ->where('end_date', '<=', now())
                          ->whereDoesntHave('closure');
                    break;

                case 'requires_refund':
                    // Chiến dịch cần hoàn tiền
                    $query->whereHas('closure', function($q) {
                        $q->where('closure_type', 'failed');
                    });
                    break;

                case 'pending':
                    $query->where('status', 'pending');
                    break;

                case 'rejected':
                    $query->where('status', 'rejected');
                    break;

                default:
                    // All campaigns
                    break;
            }

            $campaigns = $query->orderBy('created_at', 'desc')
                              ->paginate($perPage);

            // Add detailed status to each campaign
            $campaigns->getCollection()->transform(function ($campaign) {
                $campaign->detailed_status = $campaign->getDetailedStatus();
                return $campaign;
            });

            return response()->json([
                'success' => true,
                'data' => $campaigns,
                'summary' => [
                    'total' => Campaign::count(),
                    'active' => Campaign::where('status', 'active')
                        ->where('end_date', '>', now())
                        ->whereColumn('current_amount', '<', 'target_amount')
                        ->count(),
                    'completed' => Campaign::whereColumn('current_amount', '>=', 'target_amount')->count(),
                    'ended_failed' => Campaign::whereHas('closure', function($q) {
                        $q->where('closure_type', 'failed');
                    })->count(),
                    'ended_partial' => Campaign::whereHas('closure', function($q) {
                        $q->where('closure_type', 'partial');
                    })->count(),
                    'expired_unprocessed' => Campaign::where('status', 'active')
                        ->where('end_date', '<=', now())
                        ->whereDoesntHave('closure')
                        ->count(),
                    'pending' => Campaign::where('status', 'pending')->count(),
                    'rejected' => Campaign::where('status', 'rejected')->count(),
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting campaigns by status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Không thể lấy danh sách chiến dịch'
            ], 500);
        }
    }

    /**
     * Get system status overview for monitoring
     */
    public function getSystemStatus()
    {
        try {
            $overview = [
                'campaigns' => [
                    'total' => Campaign::count(),
                    'active' => Campaign::where('status', 'active')
                        ->where('end_date', '>', now())
                        ->whereColumn('current_amount', '<', 'target_amount')
                        ->count(),
                    // CHÍNH XÁC: Chỉ đếm những chiến dịch có status = 'completed'
                    'completed' => Campaign::where('status', 'completed')->count(),
                    // CHÍNH XÁC: Đếm những chiến dịch có status là ended_failed hoặc ended_partial
                    'ended_failed' => Campaign::whereIn('status', ['ended_failed', 'ended_partial'])->count(),
                    'expired_unprocessed' => Campaign::where('status', 'active')
                        ->where('end_date', '<=', now())
                        ->whereDoesntHave('closure')
                        ->count(),
                    'pending_approval' => Campaign::where('status', 'pending')->count(),
                ],
                'finance' => [
                    'total_raised' => Campaign::sum('current_amount'),
                    'total_target' => Campaign::sum('target_amount'),
                    'funds_to_refund' => Campaign::whereIn('status', ['ended_failed'])
                        ->sum('current_amount'),
                ],
                'alerts' => [
                    'expired_unprocessed' => Campaign::where('status', 'active')
                        ->where('end_date', '<=', now())
                        ->whereDoesntHave('closure')
                        ->count(),
                    'need_refund' => Campaign::where('status', 'ended_failed')->count(),
                    'low_performance' => Campaign::where('status', 'active')
                        ->where('end_date', '>', now())
                        ->whereRaw('(current_amount / target_amount) < 0.1')
                        ->where('created_at', '<', now()->subDays(30))
                        ->count(),
                ],
                'last_updated' => now()->toISOString(),
            ];

            return response()->json([
                'success' => true,
                'data' => $overview
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting system status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Không thể lấy trạng thái hệ thống'
            ], 500);
        }
    }

    /**
     * Get ended campaigns (expired but not necessarily completed)
     */
    public function getEnded(Request $request)
    {
        try {
            // Lấy CHÍNH XÁC chiến dịch đã kết thúc:
            // Hết thời gian NHƯNG KHÔNG PHẢI status 'completed' (tức là chưa đạt target hoặc đạt một phần)
            $query = Campaign::where('end_date', '<=', now())
                ->whereIn('status', ['ended_failed', 'ended_partial']) // Chỉ lấy những chiến dịch thực sự kết thúc
                ->with(['categories', 'organizer', 'closure'])
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

            // Filter by closure type
            if ($request->closure_type && $request->closure_type !== 'all') {
                $query->whereHas('closure', function($q) use ($request) {
                    $q->where('closure_type', $request->closure_type);
                });
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
                case 'progress':
                    $query->orderByRaw('(current_amount / target_amount) DESC');
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
                
                // Add detailed status and status color for frontend
                $campaign->detailed_status = $campaign->getDetailedStatus();
                $campaign->display_status = $campaign->getDisplayStatus();
                $campaign->status_color = $campaign->getStatusColor();
                $campaign->was_stopped_before_target = $campaign->wasStoppedBeforeTarget();
                
                // Add closure information
                if ($campaign->closure) {
                    $campaign->closure_info = [
                        'type' => $campaign->closure->closure_type,
                        'status_text' => $campaign->closure->getClosureStatusText(),
                        'requires_refund' => $campaign->closure->requiresRefund(),
                        'closed_at' => $campaign->closure->created_at,
                        'final_amount' => $campaign->closure->final_amount,
                        'disbursement_amount' => $campaign->closure->disbursement_amount,
                    ];
                }
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
            Log::error('Error fetching ended campaigns:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Có lỗi xảy ra khi tải danh sách chiến dịch đã kết thúc'], 500);
        }
    }
}