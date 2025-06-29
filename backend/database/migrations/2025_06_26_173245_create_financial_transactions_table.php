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
            $table->string('transaction_id')->unique();
            $table->enum('type', ['income', 'expense']);
            $table->enum('category', [
                'donation', 'refund', 'campaign_disbursement', 'platform_fee', 
                'payment_processing_fee', 'operational_cost', 'credits_conversion',
                'bank_transfer_fee', 'withdrawal_fee', 'marketing_expense', 
                'technology_infrastructure', 'other'
            ]);
            $table->string('sub_category')->nullable();
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3)->default('VND');
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled']);
            
            // Reference fields
            $table->foreignId('campaign_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('donation_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('reference_type')->nullable(); // For polymorphic reference
            $table->unsignedBigInteger('reference_id')->nullable(); // For polymorphic reference
            
            // Payment details
            $table->enum('payment_method', ['bank_transfer', 'momo', 'vnpay', 'credits', 'internal'])->nullable();
            $table->string('payment_provider')->nullable();
            $table->string('external_transaction_id')->nullable();
            
            // Account details
            $table->string('from_account')->nullable();
            $table->string('to_account')->nullable();
            $table->string('bank_name')->nullable();
            
            // Financial details
            $table->decimal('fee_amount', 15, 2)->default(0);
            $table->decimal('net_amount', 15, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->string('tax_reference')->nullable();
            
            // Metadata
            $table->json('metadata')->nullable();
            $table->text('description')->nullable();
            $table->text('admin_notes')->nullable();
            
            // Receipt handling
            $table->boolean('requires_receipt')->default(false);
            $table->string('receipt_number')->nullable();
            
            // Processing details
            $table->timestamp('processed_at')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->onDelete('set null');
            
            // Verification
            $table->boolean('is_verified')->default(false);
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null');
            
            $table->timestamps();
            
            // Indexes
            $table->index(['type', 'status']);
            $table->index(['category', 'created_at']);
            $table->index(['campaign_id', 'type']);
            $table->index(['user_id', 'type']);
            $table->index(['reference_type', 'reference_id']);
            $table->index(['created_at', 'amount']);
            $table->index(['transaction_id']);
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
