<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VirtualWallet;
use App\Models\CreditTransaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class VirtualWalletController extends Controller
{
    /**
     * Get user's wallet balance and info
     */
    public function getWallet(): JsonResponse
    {
        try {
            $user = Auth::user();
            $wallet = $user->getWallet();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'balance' => $wallet->balance,
                    'formatted_balance' => $wallet->formatted_balance,
                    'total_earned' => $wallet->total_earned,
                    'total_spent' => $wallet->total_spent,
                    'tier' => $wallet->tier,
                    'tier_display_name' => $wallet->getTierDisplayName(),
                    'tier_benefits' => $wallet->getTierBenefits(),
                    'last_activity' => $wallet->last_activity,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể lấy thông tin ví'
            ], 500);
        }
    }

    /**
     * Get wallet transaction history
     */
    public function getTransactions(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $wallet = $user->getWallet();
            
            $query = $wallet->transactions()->orderBy('created_at', 'desc');
            
            // Filter by type
            if ($request->has('type') && $request->type !== 'all') {
                $query->where('type', $request->type);
            }
            
            // Filter by date range
            if ($request->has('start_date') && $request->has('end_date')) {
                $query->dateRange($request->start_date, $request->end_date);
            }
            
            $transactions = $query->paginate($request->get('per_page', 20));
            
            // Transform transactions data
            $transactions->getCollection()->transform(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'type' => $transaction->type,
                    'display_type' => $transaction->display_type,
                    'amount' => $transaction->amount,
                    'formatted_amount' => $transaction->formatted_amount,
                    'description' => $transaction->description,
                    'source_type' => $transaction->source_type,
                    'display_source_type' => $transaction->display_source_type,
                    'balance_before' => $transaction->balance_before,
                    'balance_after' => $transaction->balance_after,
                    'created_at' => $transaction->created_at,
                    'metadata' => $transaction->metadata,
                ];
            });
            
            return response()->json([
                'success' => true,
                'data' => $transactions
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể lấy lịch sử giao dịch'
            ], 500);
        }
    }

    /**
     * Use credits to support a campaign
     */
    public function useCredits(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'campaign_id' => 'required|exists:campaigns,id',
            'amount' => 'required|numeric|min:1000', // Minimum 1000 VND equivalent
            'message' => 'sometimes|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = Auth::user();
            $wallet = $user->getWallet();
            $amount = $request->amount;
            
            // Check if user has enough credits
            if (!$wallet->canAfford($amount)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Số dư Credits không đủ'
                ], 400);
            }
            
            // Get campaign
            $campaign = \App\Models\Campaign::findOrFail($request->campaign_id);
            
            // Check if campaign is still active
            if ($campaign->status !== 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'Chiến dịch này không còn hoạt động'
                ], 400);
            }
            
            \DB::transaction(function () use ($wallet, $amount, $campaign, $request, $user) {
                // Spend credits
                $transaction = $wallet->spendCredits(
                    $amount,
                    "Ủng hộ thiện nguyện chiến dịch: {$campaign->title}",
                    'charity_donation',
                    $campaign->id,
                    [
                        'campaign_title' => $campaign->title,
                        'message' => $request->message
                    ]
                );
                
                // Create corresponding donation record
                \App\Models\Donation::create([
                    'user_id' => $user->id,
                    'campaign_id' => $campaign->id,
                    'amount' => $amount,
                    'message' => $request->message,
                    'status' => 'completed',
                    'payment_method' => 'credits',
                    'is_anonymous' => $request->get('is_anonymous', false),
                    'transaction_id' => 'CREDITS_' . $transaction->id
                ]);
                
                // Update campaign current amount
                $campaign->increment('current_amount', $amount);
            });
            
            return response()->json([
                'success' => true,
                'message' => 'Cảm ơn bạn đã ủng hộ chiến dịch bằng KV Credits thiện nguyện!',
                'data' => [
                    'remaining_balance' => $wallet->fresh()->balance,
                    'formatted_balance' => $wallet->fresh()->formatted_balance
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Credits donation error: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'campaign_id' => $request->campaign_id,
                'amount' => $request->amount,
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi xử lý giao dịch: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Transfer credits to another user
     */
    public function transferCredits(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'recipient_email' => 'required|email|exists:users,email',
            'amount' => 'required|numeric|min:10000', // Minimum 10,000 Credits for transfer
            'message' => 'sometimes|string|max:200'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = Auth::user();
            $wallet = $user->getWallet();
            $amount = $request->amount;
            
            // Check if user has enough credits
            if (!$wallet->canAfford($amount)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Số dư Credits không đủ'
                ], 400);
            }
            
            // Find recipient
            $recipient = User::where('email', $request->recipient_email)->first();
            
            if (!$recipient) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy người nhận'
                ], 404);
            }
            
            if ($recipient->id === $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể chuyển Credits cho chính mình'
                ], 400);
            }
            
            $recipientWallet = $recipient->getWallet();
            
            // Perform transfer
            $success = $wallet->transferTo($recipientWallet, $amount, $request->message);
            
            if (!$success) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể thực hiện chuyển khoản'
                ], 400);
            }
            
            return response()->json([
                'success' => true,
                'message' => "Đã chuyển {$amount} Credits thiện nguyện thành công cho {$recipient->name}",
                'data' => [
                    'remaining_balance' => $wallet->fresh()->balance,
                    'formatted_balance' => $wallet->fresh()->formatted_balance
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi chuyển Credits'
            ], 500);
        }
    }

    /**
     * Get wallet statistics
     */
    public function getStatistics(): JsonResponse
    {
        try {
            $user = Auth::user();
            $wallet = $user->getWallet();
            
            // Get transaction statistics for current month
            $startOfMonth = now()->startOfMonth();
            $endOfMonth = now()->endOfMonth();
            
            $monthlyEarnings = $wallet->transactions()
                ->earnings()
                ->dateRange($startOfMonth, $endOfMonth)
                ->sum('amount');
                
            $monthlySpending = $wallet->transactions()
                ->spending()
                ->dateRange($startOfMonth, $endOfMonth)
                ->sum('amount');
            
            // Get top spending categories
            $topCategories = $wallet->transactions()
                ->spending()
                ->selectRaw('source_type, SUM(amount) as total')
                ->groupBy('source_type')
                ->orderBy('total', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($item) {
                    return [
                        'category' => $item->source_type,
                        'display_name' => CreditTransaction::SOURCE_TYPES[$item->source_type] ?? $item->source_type,
                        'amount' => $item->total,
                        'formatted_amount' => number_format($item->total, 0, ',', '.') . ' Credits'
                    ];
                });
            
            return response()->json([
                'success' => true,
                'data' => [
                    'current_balance' => $wallet->balance,
                    'formatted_balance' => $wallet->formatted_balance,
                    'total_earned' => $wallet->total_earned,
                    'total_spent' => $wallet->total_spent,
                    'monthly_earnings' => $monthlyEarnings,
                    'monthly_spending' => $monthlySpending,
                    'tier' => $wallet->tier,
                    'tier_display_name' => $wallet->getTierDisplayName(),
                    'tier_benefits' => $wallet->getTierBenefits(),
                    'top_spending_categories' => $topCategories,
                    'transactions_count' => $wallet->transactions()->count()
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể lấy thống kê ví'
            ], 500);
        }
    }
}
