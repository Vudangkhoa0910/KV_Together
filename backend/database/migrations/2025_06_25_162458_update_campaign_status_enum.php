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
        // For MySQL, we need to use raw SQL to modify enum
        DB::statement("ALTER TABLE campaigns MODIFY COLUMN status ENUM('draft', 'pending', 'active', 'rejected', 'completed', 'cancelled', 'ended_failed', 'ended_partial') DEFAULT 'draft'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to original enum values
        DB::statement("ALTER TABLE campaigns MODIFY COLUMN status ENUM('draft', 'pending', 'active', 'rejected', 'completed', 'cancelled') DEFAULT 'draft'");
    }
};
