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
        Schema::create('credit_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->constrained('virtual_wallets')->onDelete('cascade');
            $table->enum('type', ['earn', 'spend', 'transfer_in', 'transfer_out', 'bonus', 'refund']);
            $table->decimal('amount', 15, 2);
            $table->string('source_type', 50)->nullable(); // 'failed_campaign', 'donation', 'bonus', 'transfer'
            $table->unsignedBigInteger('source_id')->nullable(); // ID của campaign, donation, etc.
            $table->text('description')->nullable();
            $table->json('metadata')->nullable(); // Thông tin bổ sung
            $table->decimal('balance_before', 15, 2);
            $table->decimal('balance_after', 15, 2);
            $table->timestamps();
            
            $table->index(['wallet_id', 'created_at']);
            $table->index(['type', 'created_at']);
            $table->index(['source_type', 'source_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('credit_transactions');
    }
};
