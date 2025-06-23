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
        Schema::table('campaigns', function (Blueprint $table) {
            $table->enum('expiry_action', ['refund', 'credits', 'extend'])->default('credits');
            $table->integer('grace_period_days')->default(7);
            $table->timestamp('expired_at')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->enum('expiry_status', ['active', 'expired', 'processing', 'processed'])->default('active');
            
            $table->index(['expiry_status', 'expired_at']);
        });
    }

    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropColumn([
                'expiry_action', 
                'grace_period_days', 
                'expired_at', 
                'processed_at', 
                'expiry_status'
            ]);
        });
    }
};
