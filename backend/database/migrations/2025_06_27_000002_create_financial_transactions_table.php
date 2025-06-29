<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('financial_transactions', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['income', 'expense']);
            $table->enum('category', [
                // Income categories
                'donation', 'credits_purchase', 'platform_fee_income', 'interest_income',
                // Expense categories  
                'campaign_disbursement', 'platform_fee', 'payment_processing_fee',
                'operational_cost', 'refund', 'credits_conversion', 'marketing_expense',
                'legal_compliance', 'technology_infrastructure', 'staff_salary'
            ]);
            $table->enum('sub_category', [
                // Donation sub-categories
                'bank_transfer', 'momo', 'vnpay', 'credits',
                // Disbursement sub-categories
                'campaign_completion', 'partial_disbursement', 'emergency_disbursement',
                // Fee sub-categories
                'momo_fee', 'vnpay_fee', 'bank_fee', 'platform_maintenance_fee',
                // Operational sub-categories
                'server_hosting', 'software_license', 'security_audit', 'customer_support'
            ])->nullable();
            
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3)->default('VND');
            $table->string('reference_id')->nullable(); // ID liên quan (donation_id, campaign_id, etc.)
            $table->string('reference_type')->nullable(); // 'donation', 'campaign', 'user', etc.
            $table->foreignId('campaign_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            
            // Thông tin giao dịch chi tiết
            $table->string('transaction_id')->unique()->index();
            $table->string('external_transaction_id')->nullable();
            $table->string('payment_method')->nullable();
            $table->enum('status', ['pending', 'completed', 'failed', 'cancelled', 'refunded']);
            
            // Địa chỉ ví/tài khoản
            $table->string('from_account')->nullable();
            $table->string('to_account')->nullable();
            $table->string('bank_name')->nullable();
            
            // Metadata và mô tả
            $table->text('description');
            $table->json('metadata')->nullable();
            $table->decimal('fee_amount', 10, 2)->default(0);
            $table->decimal('net_amount', 15, 2); // amount - fee_amount
            
            // Audit trail
            $table->timestamp('processed_at')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users');
            $table->boolean('is_verified')->default(false);
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users');
            
            // Compliance và thuế
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->string('tax_reference')->nullable();
            $table->boolean('requires_receipt')->default(false);
            $table->string('receipt_number')->nullable();
            
            $table->timestamps();
            
            $table->index(['type', 'category', 'created_at']);
            $table->index(['campaign_id', 'type', 'status']);
            $table->index(['user_id', 'type', 'created_at']);
            $table->index(['status', 'processed_at']);
            $table->index(['reference_type', 'reference_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_transactions');
    }
};
