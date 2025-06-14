<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->enum('status', ['pending', 'verified', 'completed', 'failed'])->default('pending')->after('message');
            $table->enum('payment_method', ['momo', 'vnpay', 'bank_transfer'])->default('bank_transfer')->after('status');
            $table->string('transaction_id')->nullable()->after('payment_method');
            $table->string('bank_name')->nullable()->after('transaction_id');
            $table->string('account_number')->nullable()->after('bank_name');
        });
    }

    public function down(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->dropColumn(['status', 'payment_method', 'transaction_id', 'bank_name', 'account_number']);
        });
    }
};
