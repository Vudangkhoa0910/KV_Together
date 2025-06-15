<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            // Check if columns don't exist before adding them
            if (!Schema::hasColumn('donations', 'bank_name')) {
                $table->string('bank_name')->nullable();
            }
            if (!Schema::hasColumn('donations', 'account_number')) {
                $table->string('account_number')->nullable();
            }
            if (!Schema::hasColumn('donations', 'bank_id')) {
                $table->string('bank_id')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->dropColumn(['bank_name', 'account_number', 'bank_id']);
        });
    }
};
