<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            $table->foreignId('organizer_id')->nullable()->constrained('users')->onDelete('set null')->after('status');
            $table->renameColumn('max_participants', 'participants_count');
        });
    }

    public function down(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            $table->dropForeign(['organizer_id']);
            $table->dropColumn('organizer_id');
            $table->renameColumn('participants_count', 'max_participants');
        });
    }
};