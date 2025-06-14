<?php

namespace App\Services;

use App\Models\Donation;
use Illuminate\Http\Request;

class PaymentService
{
    /**
     * Xử lý yêu cầu thanh toán
     */
    public function processPayment(Donation $donation, string $method)
    {
        switch ($method) {
            case 'momo':
                return $this->processMomoPayment($donation);
            case 'vnpay':
                return $this->processVNPayPayment($donation);
            case 'bank_transfer':
                return $this->processBankTransfer($donation);
            default:
                throw new \Exception('Phương thức thanh toán không hợp lệ');
        }
    }

    /**
     * Xử lý thanh toán qua Momo
     */
    protected function processMomoPayment(Donation $donation)
    {
        $endpoint = config('services.momo.endpoint');
        $partnerCode = config('services.momo.partner_code');
        $accessKey = config('services.momo.access_key');
        $secretKey = config('services.momo.secret_key');
        
        // Tạo signature và payload theo tài liệu MoMo
        // Gửi request đến MoMo
        // Trả về payment URL

        return "https://test.momo.vn/pay/" . $donation->id; // Demo URL
    }

    /**
     * Xử lý thanh toán qua VNPay
     */
    protected function processVNPayPayment(Donation $donation)
    {
        $vnp_TmnCode = config('services.vnpay.tmn_code');
        $vnp_HashSecret = config('services.vnpay.hash_secret');
        $vnp_Url = config('services.vnpay.payment_url');
        
        // Tạo URL thanh toán theo tài liệu VNPay
        // Thêm các tham số cần thiết
        // Tạo chữ ký

        return "https://sandbox.vnpayment.vn/pay/" . $donation->id; // Demo URL
    }

    /**
     * Generate VietQR URL for bank transfers
     */
    private function generateVietQrUrl(string $bankId, string $accountNumber, int $amount, string $message): string
    {
        // Clean message - remove special characters and spaces
        $cleanMessage = preg_replace('/[^a-zA-Z0-9]/', '', $message);
        
        // Map bank codes to VietQR bank names (theo tài liệu VietQR)
        $bankNames = [
            'MBB' => 'mbbank',
            'VCB' => 'vietcombank', 
            'TCB' => 'techcombank',
            'BIDV' => 'bidv',
            'CTG' => 'vietinbank',
            'AGB' => 'agribank',
            'ACB' => 'acb',
            'VPB' => 'vpbank',
            'TPB' => 'tpbank',
            'STB' => 'sacombank',
            'HDB' => 'hdbank',
            'VIB' => 'vib',
            'SHB' => 'shb',
            'EIB' => 'eximbank',
            'MSB' => 'msb'
        ];
        
        $bankName = $bankNames[$bankId] ?? 'mbbank';
        
        // VietQR format: https://img.vietqr.io/image/{bank-name}-{account-number}-{template}.jpg
        // Add amount and message as query parameters
        $url = sprintf(
            'https://img.vietqr.io/image/%s-%s-compact.jpg?amount=%d&addInfo=%s',
            $bankName,
            $accountNumber,
            $amount,
            urlencode($cleanMessage)
        );

        return $url;
    }

    /**
     * Xử lý chuyển khoản ngân hàng
     */
    protected function processBankTransfer(Donation $donation)
    {
        // Generate transaction code
        $transaction_code = strtoupper(uniqid('DN'));
        
        // Bank account info - Use correct VietQR bank codes
        $bankId = 'MBB';  // MBBank code for VietQR (MB Bank = MBB)
        $accountNumber = '222234567868';
        $accountName = 'VU DANG KHOA';
        $amount = $donation->amount;
        
        // Use user's message if provided, otherwise use default format
        $userMessage = $donation->message ? trim($donation->message) : '';
        $transactionRef = "KVT{$donation->id}";
        
        // Combine transaction reference with user message
        $fullMessage = $userMessage ? "{$transactionRef} - {$userMessage}" : $transactionRef;
        
        // Save transaction info
        $donation->update([
            'transaction_id' => $transaction_code,
            'bank_name' => 'MBBank',
            'account_number' => $accountNumber
        ]);

        // Generate QR code URL
        $vietQrUrl = $this->generateVietQrUrl($bankId, $accountNumber, $amount, $fullMessage);

        // Return payment info
        return [
            'bank_id' => $bankId,
            'bank_name' => 'MBBank',
            'account_number' => $accountNumber,
            'account_name' => $accountName,
            'amount' => $amount,
            'message' => $fullMessage,
            'transaction_code' => $transaction_code, // Keep this for frontend compatibility
            'transaction_id' => $transaction_code,   // Also include this for consistency
            'qr_url' => $vietQrUrl
        ];
    }

    /**
     * Xử lý callback từ cổng thanh toán
     */
    public function handleCallback(Request $request): Donation
    {
        $donation = Donation::findOrFail($request->get('orderId'));

        // Handle different payment methods
        switch ($donation->payment_method) {
            case 'momo':
                $this->validateMomoCallback($request);
                break;
            case 'vnpay':
                $this->validateVNPayCallback($request);
                break;
        }

        // Update donation status
        $donation->update([
            'status' => 'completed',
            'transaction_id' => $request->get('transactionId')
        ]);

        // Update campaign amount
        $donation->campaign->increment('current_amount', $donation->amount);

        return $donation->fresh();
    }

    /**
     * Xác thực callback
     */
    protected function verifyCallback(Request $request)
    {
        // Verify signature/checksum from payment gateway
        return true; // Demo
    }
    
    /**
     * Validate Momo callback
     */
    private function validateMomoCallback(Request $request): void
    {
        // TODO: Implement Momo signature validation
    }

    /**
     * Validate VNPay callback
     */
    private function validateVNPayCallback(Request $request): void
    {
        // TODO: Implement VNPay signature validation
    }
}
