<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DonationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Test route
Route::get('/test', function() {
    return response()->json(['message' => 'API is working']);
});

// Auth routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [RegisterController::class, 'register']);
    Route::post('/login', [LoginController::class, 'login']);
    Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth:sanctum');
});

// Public routes
Route::prefix('campaigns')->group(function () {
    Route::get('/', [CampaignController::class, 'index']);
    Route::get('/featured', [CampaignController::class, 'featured']);
    Route::get('/{campaign}', [CampaignController::class, 'show']);
});

Route::prefix('news')->group(function () {
    Route::get('/', [NewsController::class, 'index']);
    Route::get('/{news}', [NewsController::class, 'show']);
});

Route::get('/stats', [StatsController::class, 'index']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // User profile
    Route::prefix('user')->group(function () {
        Route::get('/', function (Request $request) {
            return $request->user();
        });
        Route::get('/donations', [UserController::class, 'donations']);
        Route::put('/profile', [UserController::class, 'updateProfile']);
    });

    // Campaign management
    Route::prefix('campaigns')->group(function () {
        Route::post('/', [CampaignController::class, 'store']);
        Route::put('/{campaign}', [CampaignController::class, 'update']);
        Route::delete('/{campaign}', [CampaignController::class, 'destroy']);
        Route::post('/{campaign}/donate', [CampaignController::class, 'donate']);
        Route::get('/{campaign}/analytics', [CampaignController::class, 'analytics']);
        Route::get('/{campaign}/updates', [CampaignController::class, 'updates']);
        Route::post('/{campaign}/updates', [CampaignController::class, 'storeUpdate']);
    });

    // Activities
    Route::apiResource('activities', ActivityController::class);

    // Blogs
    Route::apiResource('blogs', BlogController::class);

    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::post('/{notification}/read', [NotificationController::class, 'markAsRead']);
    });

    // Admin routes
    Route::middleware(['admin'])->prefix('admin')->group(function () {
        Route::get('/campaigns', [CampaignController::class, 'adminIndex']);
        Route::get('/campaigns/approval', [CampaignController::class, 'approval']);
        Route::post('/campaigns/{campaign}/approve', [CampaignController::class, 'approve']);
        Route::get('/donations', [UserController::class, 'adminDonations']);
        Route::get('/activities', [ActivityController::class, 'adminIndex']);
        Route::get('/news', [NewsController::class, 'adminIndex']);
        Route::apiResource('categories', CategoryController::class);
    });

    Route::get('/auth/user', function (Request $request) {
        return $request->user();
    });
}); 