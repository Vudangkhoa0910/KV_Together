<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VirtualWallet extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'balance',
        'total_earned',
        'total_spent',
        'tier',
        'last_activity'
    ];

    protected $casts = [
        'balance' => 'decimal:2',
        'total_earned' => 'decimal:2',
        'total_spent' => 'decimal:2',
        'last_activity' => 'datetime'
    ];

    const TIER_BRONZE = 'bronze';
    const TIER_SILVER = 'silver';
    const TIER_GOLD = 'gold';
    const TIER_PLATINUM = 'platinum';

    const TIER_THRESHOLDS = [
        self::TIER_BRONZE => 0,
        self::TIER_SILVER => 1000000,  // 1M Credits
        self::TIER_GOLD => 5000000,    // 5M Credits
        self::TIER_PLATINUM => 20000000, // 20M Credits
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(CreditTransaction::class, 'wallet_id');
    }

    public function recentTransactions(int $limit = 10): HasMany
    {
        return $this->transactions()->orderBy('created_at', 'desc')->limit($limit);
    }

    /**
     * Add credits to wallet
     */
    public function addCredits(
        float $amount, 
        string $type, 
        ?string $description = null, 
        ?string $sourceType = null, 
        ?int $sourceId = null,
        array $metadata = []
    ): CreditTransaction {
        $balanceBefore = $this->balance;
        $this->balance += $amount;
        $this->total_earned += $amount;
        $this->last_activity = now();
        
        // Update tier based on total earned
        $this->updateTier();
        
        $this->save();

        return $this->transactions()->create([
            'type' => $type,
            'amount' => $amount,
            'source_type' => $sourceType,
            'source_id' => $sourceId,
            'description' => $description,
            'metadata' => $metadata,
            'balance_before' => $balanceBefore,
            'balance_after' => $this->balance,
        ]);
    }

    /**
     * Spend credits from wallet
     */
    public function spendCredits(
        float $amount, 
        ?string $description = null, 
        ?string $sourceType = null, 
        ?int $sourceId = null,
        array $metadata = []
    ): ?CreditTransaction {
        if ($this->balance < $amount) {
            return null; // Insufficient balance
        }

        $balanceBefore = $this->balance;
        $this->balance -= $amount;
        $this->total_spent += $amount;
        $this->last_activity = now();
        $this->save();

        return $this->transactions()->create([
            'type' => 'spend',
            'amount' => $amount,
            'source_type' => $sourceType,
            'source_id' => $sourceId,
            'description' => $description,
            'metadata' => $metadata,
            'balance_before' => $balanceBefore,
            'balance_after' => $this->balance,
        ]);
    }

    /**
     * Transfer credits to another wallet
     */
    public function transferTo(VirtualWallet $targetWallet, float $amount, ?string $description = null): bool
    {
        if ($this->balance < $amount) {
            return false;
        }

        \DB::transaction(function () use ($targetWallet, $amount, $description) {
            // Deduct from sender
            $this->spendCredits(
                $amount, 
                $description ?: "Chuyển {$amount} Credits cho {$targetWallet->user->name}",
                'transfer',
                $targetWallet->id
            );

            // Add to receiver
            $targetWallet->addCredits(
                $amount,
                'transfer_in',
                $description ?: "Nhận {$amount} Credits từ {$this->user->name}",
                'transfer',
                $this->id
            );
        });

        return true;
    }

    /**
     * Update tier based on total earned
     */
    public function updateTier(): void
    {
        $totalEarned = $this->total_earned;
        
        if ($totalEarned >= self::TIER_THRESHOLDS[self::TIER_PLATINUM]) {
            $this->tier = self::TIER_PLATINUM;
        } elseif ($totalEarned >= self::TIER_THRESHOLDS[self::TIER_GOLD]) {
            $this->tier = self::TIER_GOLD;
        } elseif ($totalEarned >= self::TIER_THRESHOLDS[self::TIER_SILVER]) {
            $this->tier = self::TIER_SILVER;
        } else {
            $this->tier = self::TIER_BRONZE;
        }
    }

    /**
     * Get tier benefits
     */
    public function getTierBenefits(): array
    {
        return match($this->tier) {
            self::TIER_PLATINUM => [
                'transaction_fee_discount' => 100, // 100% discount (free)
                'priority_support' => true,
                'beta_access' => true,
                'consultation' => true,
            ],
            self::TIER_GOLD => [
                'transaction_fee_discount' => 5, // 5% discount
                'priority_support' => false,
                'beta_access' => true,
                'consultation' => false,
            ],
            self::TIER_SILVER => [
                'transaction_fee_discount' => 2, // 2% discount
                'priority_support' => false,
                'beta_access' => false,
                'consultation' => false,
            ],
            default => [
                'transaction_fee_discount' => 0,
                'priority_support' => false,
                'beta_access' => false,
                'consultation' => false,
            ],
        };
    }

    /**
     * Get tier display name
     */
    public function getTierDisplayName(): string
    {
        return match($this->tier) {
            self::TIER_PLATINUM => 'Bạch Kim',
            self::TIER_GOLD => 'Vàng',
            self::TIER_SILVER => 'Bạc',
            default => 'Đồng',
        };
    }

    /**
     * Check if can afford amount
     */
    public function canAfford(float $amount): bool
    {
        return $this->balance >= $amount;
    }

    /**
     * Get formatted balance
     */
    public function getFormattedBalanceAttribute(): string
    {
        return number_format($this->balance, 0, ',', '.') . ' Credits';
    }
}
