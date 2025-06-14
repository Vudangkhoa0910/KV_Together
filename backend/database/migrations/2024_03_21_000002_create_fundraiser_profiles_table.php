<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fundraiser_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('organization_name')->nullable();
            $table->string('tax_id')->nullable();
            $table->string('website')->nullable();
            $table->string('social_media')->nullable();
            $table->text('mission_statement')->nullable();
            $table->string('organization_type')->nullable();
            $table->year('year_established')->nullable();
            $table->string('registration_number')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fundraiser_profiles');
    }
}; 