<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campaigns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organizer_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->longText('content');
            $table->string('organizer_name')->nullable();
            $table->text('organizer_description')->nullable();
            $table->string('organizer_website')->nullable();
            $table->string('organizer_address')->nullable();
            $table->string('organizer_hotline')->nullable();
            $table->string('organizer_contact')->nullable();
            $table->decimal('target_amount', 12, 2);
            $table->decimal('current_amount', 12, 2)->default(0);
            $table->datetime('start_date');
            $table->datetime('end_date');
            $table->string('image')->nullable();
            $table->json('images')->nullable();
            $table->enum('status', ['draft', 'pending', 'active', 'rejected', 'completed', 'cancelled'])->default('draft');
            $table->text('rejection_reason')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'end_date']);
            $table->index('is_featured');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaigns');
    }
};