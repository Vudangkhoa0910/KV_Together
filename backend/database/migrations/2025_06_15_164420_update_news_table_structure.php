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
        Schema::table('news', function (Blueprint $table) {
            // Add all required columns
            $table->string('title')->after('id');
            $table->string('slug')->unique()->after('title');
            $table->text('summary')->after('slug');
            $table->longText('content')->after('summary');
            $table->string('image')->nullable()->after('content');
            $table->json('images')->nullable()->after('image');
            $table->string('author_name')->nullable()->after('images');
            $table->foreignId('author_id')->nullable()->constrained('users')->onDelete('set null')->after('author_name');
            $table->enum('category', ['community', 'event', 'story', 'announcement'])->default('story')->after('author_id');
            $table->enum('status', ['draft', 'published', 'archived'])->default('published')->after('category');
            $table->boolean('is_featured')->default(false)->after('status');
            $table->string('source')->nullable()->after('is_featured');
            $table->date('published_date')->after('source');
            $table->integer('views_count')->default(0)->after('published_date');
        });
        
        // Add indexes
        Schema::table('news', function (Blueprint $table) {
            $table->index(['status', 'published_date']);
            $table->index(['category', 'status']);
            $table->index(['is_featured', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('news', function (Blueprint $table) {
            $table->dropColumn([
                'title', 'slug', 'summary', 'content', 'image', 'images', 
                'author_name', 'author_id', 'category', 'status',
                'is_featured', 'source', 'published_date', 'views_count'
            ]);
        });
    }
};
