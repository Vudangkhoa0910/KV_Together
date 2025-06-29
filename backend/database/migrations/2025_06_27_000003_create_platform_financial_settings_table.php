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
        Schema::create('platform_financial_settings', function (Blueprint $table) {
            $table->id();
            $table->string('setting_key')->unique();
            $table->string('setting_value');
            $table->enum('data_type', ['decimal', 'integer', 'string', 'boolean', 'json']);
            $table->text('description')->nullable();
            $table->boolean('is_public')->default(false);
            $table->timestamps();
        });
        
        // Insert default settings
        DB::table('platform_financial_settings')->insert([
            [
                'setting_key' => 'platform_fee_percentage',
                'setting_value' => '3.5',
                'data_type' => 'decimal',
                'description' => 'Phí nền tảng tính theo phần trăm (%) từ mỗi khoản quyên góp',
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'setting_key' => 'momo_processing_fee',
                'setting_value' => '2.0',
                'data_type' => 'decimal', 
                'description' => 'Phí xử lý thanh toán MoMo (%)',
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'setting_key' => 'vnpay_processing_fee',
                'setting_value' => '1.8',
                'data_type' => 'decimal',
                'description' => 'Phí xử lý thanh toán VNPay (%)',
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'setting_key' => 'bank_transfer_processing_fee',
                'setting_value' => '0.5',
                'data_type' => 'decimal',
                'description' => 'Phí xử lý chuyển khoản ngân hàng (%)',
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'setting_key' => 'min_disbursement_amount',
                'setting_value' => '500000',
                'data_type' => 'integer',
                'description' => 'Số tiền tối thiểu để giải ngân (VND)',
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'setting_key' => 'reserve_fund_percentage',
                'setting_value' => '5.0',
                'data_type' => 'decimal',
                'description' => 'Phần trăm giữ lại cho quỹ dự phòng (%)',
                'is_public' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'setting_key' => 'emergency_fund_threshold',
                'setting_value' => '10000000',
                'data_type' => 'integer',
                'description' => 'Ngưỡng quỹ khẩn cấp (VND)',
                'is_public' => false,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'setting_key' => 'auto_disbursement_enabled',
                'setting_value' => 'false',
                'data_type' => 'boolean',
                'description' => 'Tự động giải ngân khi chiến dịch hoàn thành',
                'is_public' => false,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('platform_financial_settings');
    }
};
