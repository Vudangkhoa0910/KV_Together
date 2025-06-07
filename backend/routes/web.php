<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\DonationController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\CategoryController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

// Public routes
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/about', function () {
    return view('about');
})->name('about');

// Campaign routes
Route::prefix('campaigns')->name('campaigns.')->group(function () {
    Route::get('/', [CampaignController::class, 'index'])->name('index');
    Route::get('/{campaign}', [CampaignController::class, 'show'])->name('show');
});

// News routes
Route::prefix('news')->name('news.')->group(function () {
    Route::get('/', [NewsController::class, 'index'])->name('index');
    Route::get('/{news}', [NewsController::class, 'show'])->name('show');
});

// Authentication routes
Auth::routes();

// Protected routes
Route::middleware(['auth'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [HomeController::class, 'dashboard'])->name('dashboard')->middleware('admin');

    // User profile
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('edit');
        Route::put('/', [ProfileController::class, 'update'])->name('update');
    });

    // Campaign management
    Route::prefix('campaigns')->name('campaigns.')->group(function () {
        Route::get('/create', [CampaignController::class, 'create'])->name('create');
        Route::post('/', [CampaignController::class, 'store'])->name('store');
        Route::get('/{campaign}/edit', [CampaignController::class, 'edit'])->name('edit');
        Route::put('/{campaign}', [CampaignController::class, 'update'])->name('update');
        Route::delete('/{campaign}', [CampaignController::class, 'destroy'])->name('destroy');
        Route::get('/{campaign}/donate', [CampaignController::class, 'donate'])->name('donate');
        Route::get('/{campaign}/analytics', [CampaignController::class, 'analytics'])->name('analytics');
        Route::get('/{campaign}/updates', [CampaignController::class, 'updates'])->name('updates');
        Route::post('/{campaign}/updates', [CampaignController::class, 'storeUpdate'])->name('updates.store');
    });

    // Donations
    Route::post('/donations', [DonationController::class, 'store'])->name('donations.store');

    // Activities
    Route::resource('activities', ActivityController::class);

    // Blogs
    Route::resource('blogs', BlogController::class)->except(['index', 'show']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');

    // Admin routes
    Route::middleware(['admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/campaigns', [CampaignController::class, 'adminIndex'])->name('campaigns.index');
        Route::get('/campaigns/approval', [CampaignController::class, 'approval'])->name('campaigns.approval');
        Route::post('/campaigns/{campaign}/approve', [CampaignController::class, 'approve'])->name('campaigns.approve');
        Route::get('/donations', [DonationController::class, 'adminIndex'])->name('donations.index');
        Route::get('/activities', [ActivityController::class, 'adminIndex'])->name('activities.index');
        Route::get('/news', [NewsController::class, 'adminIndex'])->name('news.index');
        Route::resource('categories', CategoryController::class);
    });
});
Auth::routes();

Route::get('/home', [App\Http\Controllers\HomeController::class, 'index'])->name('home');
