<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Donation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Notifications\DonationReceived;
use App\Services\PaymentService;

class DonationController extends Controller
{
    protected $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Tạo donation mới
     */
    public function store(Request $request, Campaign $campaign)
    {
        // Add auth check
        if (!Auth::check()) {
            return response()->json([
                'message' => 'Vui lòng đăng nhập để quyên góp'
            ], 401);
        }

        // Enhanced validation
        $validated = $request->validate([
            'amount' => 'required|integer|min:20000', // Giảm từ 10k xuống 20k để phù hợp
            'message' => 'nullable|string|max:500',
            'is_anonymous' => 'boolean',
            'payment_method' => 'required|in:momo,vnpay,bank_transfer'
        ], [
            'amount.required' => 'Vui lòng nhập số tiền quyên góp',
            'amount.integer' => 'Số tiền phải là số nguyên',
            'amount.min' => 'Số tiền quyên góp tối thiểu là 20,000đ', // Cập nhật thông báo
            'message.max' => 'Lời nhắn không được vượt quá 500 ký tự',
            'payment_method.required' => 'Vui lòng chọn phương thức thanh toán',
            'payment_method.in' => 'Phương thức thanh toán không hợp lệ'
        ]);

        // Check campaign status - chỉ dừng nhận tiền khi status = completed
        if ($campaign->status === 'completed') {
            return response()->json([
                'message' => 'Chiến dịch này đã hoàn thành và đã dừng nhận quyên góp'
            ], 400);
        }
        
        if (!$campaign->isActive()) {
            return response()->json([
                'message' => 'Chiến dịch này hiện không nhận quyên góp'
            ], 400);
        }

        // Kiểm tra số tiền còn thiếu
        $remainingAmount = $campaign->target_amount - $campaign->current_amount;
        
        if ($remainingAmount <= 0) {
            return response()->json([
                'message' => 'Chiến dịch này đã đạt đủ mục tiêu và không còn cần quyên góp thêm'
            ], 400);
        }
        
        // Strict limit: maximum 105% of target amount total
        $absoluteMaxTotal = intval($campaign->target_amount * 1.05);
        $maxRemainingAllowed = $absoluteMaxTotal - $campaign->current_amount;
        
        if ($maxRemainingAllowed <= 0) {
            return response()->json([
                'message' => 'Chiến dịch này đã đạt mức tối đa cho phép và không thể nhận thêm quyên góp'
            ], 400);
        }
        
        // Limit donation to not exceed the remaining allowed amount
        $maxAllowedAmount = min($maxRemainingAllowed, $remainingAmount);
        
        if ($validated['amount'] > $maxAllowedAmount) {
            return response()->json([
                'message' => "Số tiền quyên góp tối đa cho chiến dịch này là " . number_format($maxAllowedAmount) . "đ (còn thiếu " . number_format($remainingAmount) . "đ)",
                'remaining_amount' => $remainingAmount,
                'max_allowed' => $maxAllowedAmount
            ], 400);
        }

        // Tạo donation
        $donation = $campaign->donations()->create([
            'user_id' => Auth::id(),
            'amount' => $validated['amount'],
            'message' => $validated['message'],
            'is_anonymous' => $validated['is_anonymous'] ?? false,
            'payment_method' => $validated['payment_method'],
            'status' => 'pending'
        ]);

        // Xử lý thanh toán
        $paymentResult = $this->paymentService->processPayment(
            $donation,
            $validated['payment_method']
        );
        
        // Debug log để kiểm tra payment result
        \Log::info('Payment result:', $paymentResult);
        
        $responseData = [
            'message' => $validated['payment_method'] === 'bank_transfer' 
                ? 'Vui lòng chuyển khoản theo thông tin bên dưới' 
                : 'Đang chuyển hướng đến cổng thanh toán',
            'donation' => $donation,
            'status' => 'pending',
            'showCertificate' => false
        ];
        
        // Xử lý kết quả thanh toán tùy thuộc vào phương thức
        if ($validated['payment_method'] === 'bank_transfer') {
            $responseData['payment_info'] = $paymentResult;
        } else {
            $responseData['payment_url'] = $paymentResult;
        }

        return response()->json($responseData);
    }

    /**
     * Hiển thị chi tiết donation
     */
    public function show(Donation $donation)
    {
        $this->authorize('view', $donation);

        $donation->load(['campaign', 'user']);

        return response()->json($donation);
    }

    /**
     * Callback từ cổng thanh toán
     */
    public function handlePaymentCallback(Request $request)
    {
        $donation = $this->paymentService->handleCallback($request);

        if ($donation->status === 'completed') {
            // Gửi thông báo
            $donation->user->notify(new DonationReceived($donation));
        }

        return response()->json([
            'message' => 'Xử lý thanh toán thành công'
        ]);
    }

    /**
     * Admin verification for bank transfer donations
     */
    public function verifyBankTransfer(Request $request, Donation $donation)
    {
        $this->authorize('verify', $donation);

        // Validate request
        $validated = $request->validate([
            'transaction_id' => 'nullable|string|max:255',
            'bank_name' => 'required|string|max:255',
            'account_number' => 'required|string|max:50',
        ]);

        // Update donation status
        $donation->update([
            'status' => 'completed',
            'transaction_id' => $validated['transaction_id'],
            'bank_name' => $validated['bank_name'],
            'account_number' => $validated['account_number']
        ]);

        // Update campaign amount - strict control to never exceed 105% of target
        $campaign = $donation->campaign;
        $newAmount = $campaign->current_amount + $donation->amount;
        
        // Absolute maximum is 105% of target - NEVER exceed this
        $absoluteMaxAmount = intval($campaign->target_amount * 1.05);
        $actualAmount = min($newAmount, $absoluteMaxAmount);
        
        $campaign->update(['current_amount' => $actualAmount]);
        
        // Check and auto-complete campaign if target reached
        $campaign = $campaign->fresh();
        if ($campaign->current_amount >= $campaign->target_amount && $campaign->status === 'active') {
            $campaign->update(['status' => 'completed']);
            
            // Notify organizer about campaign completion
            if (class_exists('\App\Notifications\CampaignCompleted')) {
                $campaign->organizer->notify(new \App\Notifications\CampaignCompleted($campaign));
            }
        }

        // Send notification to donor
        $donation->user->notify(new DonationReceived($donation));

        return response()->json([
            'message' => 'Donation verified successfully',
            'donation' => $donation->fresh(['campaign', 'user'])
        ]);
    }

    /**
     * Check donation status
     */
    public function checkStatus(Donation $donation)
    {
        $donation->load(['campaign']);
        
        return response()->json([
            'status' => $donation->status,
            'showCertificate' => $donation->status === 'completed',
            'message' => $this->getStatusMessage($donation->status)
        ]);
    }

    private function getStatusMessage(string $status): string 
    {
        return match ($status) {
            'pending' => 'Đang chờ xác nhận thanh toán',
            'completed' => 'Đã xác nhận thanh toán',
            'failed' => 'Thanh toán thất bại',
            default => 'Trạng thái không xác định'
        };
    }
}