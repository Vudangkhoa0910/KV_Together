<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')->after('id')->constrained();
            $table->string('status')->default('active');
            $table->string('id_card')->nullable();
            $table->text('registration_reason')->nullable();
            $table->string('fundraiser_type')->nullable();
            $table->string('avatar')->nullable();
            $table->text('bio')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropColumn([
                'role_id',
                'status',
                'id_card',
                'registration_reason',
                'fundraiser_type',
                'avatar',
                'bio',
                'phone',
                'address'
            ]);
        });
    }
}; 