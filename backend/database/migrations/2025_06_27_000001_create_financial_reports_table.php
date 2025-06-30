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
        Schema::create('financial_reports', function (Blueprint $table) {
            $table->id();
            $table->enum('report_type', ['monthly', 'quarterly', 'yearly', 'campaign_specific']);
            $table->date('report_period_start');
            $table->date('report_period_end');
            $table->foreignId('campaign_id')->nullable()->constrained()->onDelete('cascade');
            
            // Dòng tiền vào
            $table->decimal('total_income', 15, 2)->default(0);
            $table->decimal('donations_income', 15, 2)->default(0);
            $table->decimal('credits_income', 15, 2)->default(0);
            $table->decimal('bank_transfer_income', 15, 2)->default(0);
            $table->decimal('momo_income', 15, 2)->default(0);
            $table->decimal('vnpay_income', 15, 2)->default(0);
            
            // Dòng tiền ra
            $table->decimal('total_expenses', 15, 2)->default(0);
            $table->decimal('campaign_disbursements', 15, 2)->default(0);
            $table->decimal('platform_fees', 15, 2)->default(0);
            $table->decimal('payment_processing_fees', 15, 2)->default(0);
            $table->decimal('operational_costs', 15, 2)->default(0);
            $table->decimal('refunds_issued', 15, 2)->default(0);
            $table->decimal('credits_converted', 15, 2)->default(0);
            
            // Số liệu thống kê
            $table->integer('total_donors')->default(0);
            $table->integer('total_transactions')->default(0);
            $table->decimal('average_donation', 10, 2)->default(0);
            $table->decimal('median_donation', 10, 2)->default(0);
            
            // Quỹ dự phòng và tạm giữ
            $table->decimal('reserve_fund', 15, 2)->default(0);
            $table->decimal('pending_disbursements', 15, 2)->default(0);
            $table->decimal('escrow_balance', 15, 2)->default(0);
            
            // Metadata và ghi chú
            $table->json('breakdown_details')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('generated_at');
            $table->foreignId('generated_by')->constrained('users');
            $table->boolean('is_public')->default(true);
            $table->boolean('is_verified')->default(false);
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users');
            
            $table->timestamps();
            
            $table->index(['report_type', 'report_period_start', 'report_period_end']);
            $table->index(['campaign_id', 'report_period_start']);
            $table->index(['is_public', 'is_verified']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_reports');
    }
};
