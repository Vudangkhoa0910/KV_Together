<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancialTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'category',
        'sub_category',
        'amount',
        'currency',
        'reference_id',
        'reference_type',
        'campaign_id',
        'user_id',
        'transaction_id',
        'external_transaction_id',
        'payment_method',
        'status',
        'from_account',
        'to_account',
        'bank_name',
        'description',
        'metadata',
        'fee_amount',
        'net_amount',
        'processed_at',
        'processed_by',
        'is_verified',
        'verified_at',
        'verified_by',
        'tax_amount',
        'tax_reference',
        'requires_receipt',
        'receipt_number'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'fee_amount' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'metadata' => 'array',
        'processed_at' => 'datetime',
        'verified_at' => 'datetime',
        'is_verified' => 'boolean',
        'requires_receipt' => 'boolean'
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Get the referenced model dynamically
     */
    public function reference()
    {
        if (!$this->reference_type || !$this->reference_id) {
            return null;
        }

        return match($this->reference_type) {
            'donation' => Donation::find($this->reference_id),
            'campaign' => Campaign::find($this->reference_id),
            'user' => User::find($this->reference_id),
            'credit_transaction' => CreditTransaction::find($this->reference_id),
            default => null,
        };
    }

    /**
     * Check if transaction is income
     */
    public function isIncome(): bool
    {
        return $this->type === 'income';
    }

    /**
     * Check if transaction is expense
     */
    public function isExpense(): bool
    {
        return $this->type === 'expense';
    }

    /**
     * Get formatted amount
     */
    public function getFormattedAmountAttribute(): string
    {
        $prefix = $this->isIncome() ? '+' : '-';
        return $prefix . number_format($this->amount, 0, ',', '.') . ' VND';
    }

    /**
     * Get category display name
     */
    public function getCategoryDisplayAttribute(): string
    {
        $categories = [
            // Income
            'donation' => 'Quyên góp',
            'credits_purchase' => 'Mua Credits',
            'platform_fee_income' => 'Thu phí nền tảng',
            'interest_income' => 'Thu lãi suất',
            
            // Expense
            'campaign_disbursement' => 'Giải ngân chiến dịch',
            'platform_fee' => 'Phí nền tảng',
            'payment_processing_fee' => 'Phí xử lý thanh toán',
            'operational_cost' => 'Chi phí vận hành',
            'refund' => 'Hoàn tiền',
            'credits_conversion' => 'Chuyển đổi Credits',
            'marketing_expense' => 'Chi phí marketing',
            'legal_compliance' => 'Chi phí pháp lý',
            'technology_infrastructure' => 'Hạ tầng công nghệ',
            'staff_salary' => 'Lương nhân viên'
        ];

        return $categories[$this->category] ?? $this->category;
    }

    /**
     * Scope for income transactions
     */
    public function scopeIncome($query)
    {
        return $query->where('type', 'income');
    }

    /**
     * Scope for expense transactions
     */
    public function scopeExpense($query)
    {
        return $query->where('type', 'expense');
    }

    /**
     * Scope for completed transactions
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope for pending transactions
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope by date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Scope by category
     */
    public function scopeCategory($query, string $category)
    {
        return $query->where('category', $category);
    }
}
