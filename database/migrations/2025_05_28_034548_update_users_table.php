<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['user', 'sponsor', 'admin'])->default('user')->after('password');
            $table->boolean('is_verified')->default(false)->after('role');
            $table->string('profile_picture')->nullable()->after('is_verified');
            $table->text('bio')->nullable()->after('profile_picture');
            $table->string('phone')->nullable()->after('bio');
            $table->text('address')->nullable()->after('phone');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'is_verified', 'profile_picture', 'bio', 'phone', 'address']);
        });
    }
};