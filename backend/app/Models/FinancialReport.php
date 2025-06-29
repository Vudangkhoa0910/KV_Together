<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancialReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_type',
        'report_period_start',
        'report_period_end',
        'campaign_id',
        'total_income',
        'donations_income',
        'credits_income',
        'bank_transfer_income',
        'momo_income',
        'vnpay_income',
        'total_expenses',
        'campaign_disbursements',
        'platform_fees',
        'payment_processing_fees',
        'operational_costs',
        'refunds_issued',
        'credits_converted',
        'total_donors',
        'total_transactions',
        'average_donation',
        'median_donation',
        'reserve_fund',
        'pending_disbursements',
        'escrow_balance',
        'breakdown_details',
        'notes',
        'generated_at',
        'generated_by',
        'is_public',
        'is_verified',
        'verified_at',
        'verified_by'
    ];

    protected $casts = [
        'report_period_start' => 'date',
        'report_period_end' => 'date',
        'total_income' => 'decimal:2',
        'donations_income' => 'decimal:2',
        'credits_income' => 'decimal:2',
        'bank_transfer_income' => 'decimal:2',
        'momo_income' => 'decimal:2',
        'vnpay_income' => 'decimal:2',
        'total_expenses' => 'decimal:2',
        'campaign_disbursements' => 'decimal:2',
        'platform_fees' => 'decimal:2',
        'payment_processing_fees' => 'decimal:2',
        'operational_costs' => 'decimal:2',
        'refunds_issued' => 'decimal:2',
        'credits_converted' => 'decimal:2',
        'average_donation' => 'decimal:2',
        'median_donation' => 'decimal:2',
        'reserve_fund' => 'decimal:2',
        'pending_disbursements' => 'decimal:2',
        'escrow_balance' => 'decimal:2',
        'breakdown_details' => 'array',
        'generated_at' => 'datetime',
        'is_public' => 'boolean',
        'is_verified' => 'boolean',
        'verified_at' => 'datetime'
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(Campaign::class);
    }

    public function generatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Get net profit/loss for the period
     */
    public function getNetBalanceAttribute(): float
    {
        return $this->total_income - $this->total_expenses;
    }

    /**
     * Get income efficiency percentage
     */
    public function getIncomeEfficiencyAttribute(): float
    {
        if ($this->total_income == 0) return 0;
        return round(($this->donations_income / $this->total_income) * 100, 2);
    }

    /**
     * Get expense ratio
     */
    public function getExpenseRatioAttribute(): float
    {
        if ($this->total_income == 0) return 0;
        return round(($this->total_expenses / $this->total_income) * 100, 2);
    }

    /**
     * Check if report is for a specific campaign
     */
    public function isCampaignSpecific(): bool
    {
        return $this->report_type === 'campaign_specific' && !is_null($this->campaign_id);
    }

    /**
     * Get formatted period
     */
    public function getPeriodDisplayAttribute(): string
    {
        return $this->report_period_start->format('d/m/Y') . ' - ' . $this->report_period_end->format('d/m/Y');
    }

    /**
     * Scope for public reports
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope for verified reports
     */
    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    /**
     * Scope for specific report type
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('report_type', $type);
    }
}
