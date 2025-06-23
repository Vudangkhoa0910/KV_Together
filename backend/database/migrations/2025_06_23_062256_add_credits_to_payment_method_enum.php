<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE donations MODIFY COLUMN payment_method ENUM('momo', 'vnpay', 'bank_transfer', 'credits')");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE donations MODIFY COLUMN payment_method ENUM('momo', 'vnpay', 'bank_transfer')");
    }
};
