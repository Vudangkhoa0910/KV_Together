<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\TopDonorsController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DonationController;
use App\Http\Controllers\Admin\StatsController as AdminStatsController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\CampaignController as AdminCampaignController;
use App\Http\Controllers\Admin\AnalyticsController as AdminAnalyticsController;
use App\Http\Controllers\Api\CampaignStatusController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Test route
Route::get('/test', function() {
    return response()->json(['message' => 'API is working']);
});

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/auth/user', [AuthController::class, 'user'])->middleware('auth:sanctum');

// Categories
Route::get('/categories', [CategoryController::class, 'index']);

// News routes
Route::prefix('news')->group(function () {
    Route::get('/', [NewsController::class, 'index']);
    Route::get('/featured', [NewsController::class, 'featured']);
    Route::get('/categories', [NewsController::class, 'categories']);
    Route::get('/{slug}', [NewsController::class, 'show']);
});

// Activities routes  
Route::prefix('activities')->group(function () {
    Route::get('/', [ActivityController::class, 'index']);
    Route::get('/featured', [ActivityController::class, 'featured']);
    Route::get('/categories', [ActivityController::class, 'categories']);
    Route::get('/{slug}', [ActivityController::class, 'show']);
});

// Authenticated news routes
Route::middleware('auth:sanctum')->prefix('news')->group(function () {
    Route::post('/', [NewsController::class, 'store']);
    Route::put('/{news}', [NewsController::class, 'update']);
    Route::delete('/{news}', [NewsController::class, 'destroy']);
});

// Authenticated activities routes
Route::middleware('auth:sanctum')->prefix('activities')->group(function () {
    Route::post('/', [ActivityController::class, 'store']);
    Route::put('/{activity}', [ActivityController::class, 'update']);
    Route::delete('/{activity}', [ActivityController::class, 'destroy']);
});

Route::prefix('campaigns')->group(function () {
    Route::get('/', [CampaignController::class, 'index']);
    Route::get('/featured', [CampaignController::class, 'featured']);
    Route::get('/completed', [CampaignController::class, 'getCompleted']);
    Route::get('/recent-successful', [CampaignController::class, 'getRecentSuccessful']);
    Route::get('/urgent', [CampaignController::class, 'getUrgent']);
    Route::get('/{slug}', [CampaignController::class, 'show']);
});

Route::get('/stats', [StatsController::class, 'index']);
Route::get('/stats/monthly', [StatsController::class, 'getMonthlyStats']);
Route::get('/top-donors', [StatsController::class, 'getTopDonors']);
Route::get('/top-organizations', [TopDonorsController::class, 'getTopOrganizations']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // User routes
    Route::prefix('user')->group(function () {
        Route::get('/dashboard', [UserController::class, 'dashboard']);
        Route::get('/donations', [UserController::class, 'donations']);
        Route::put('/profile', [UserController::class, 'updateProfile']);
        Route::put('/settings/notifications', [UserController::class, 'updateNotificationSettings']);
    });

    // Donations
    Route::prefix('donations')->group(function () {
        Route::post('/{campaign}', [DonationController::class, 'store']);
        Route::get('/{donation}', [DonationController::class, 'show']);
        Route::patch('/{donation}/verify', [DonationController::class, 'verifyBankTransfer']);
        Route::get('/{donation}/status', [DonationController::class, 'checkStatus']);
    });

    // Campaign interaction routes
    Route::prefix('campaigns')->group(function () {
        Route::post('/{campaign}/favorite', [CampaignController::class, 'toggleFavorite']);
        Route::post('/{campaign}/share', [CampaignController::class, 'share']);
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
});

// Admin routes
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // Dashboard stats
    Route::get('/stats', [AdminStatsController::class, 'index']);
    
    // Users management
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::get('/users/{id}', [AdminUserController::class, 'show']);
    Route::post('/users/{id}/approve', [AdminUserController::class, 'approve']);
    Route::post('/users/{id}/reject', [AdminUserController::class, 'reject']);
    Route::post('/users/{id}/block', [AdminUserController::class, 'block']);
    Route::post('/users/{id}/unblock', [AdminUserController::class, 'unblock']);
    
    // Campaigns management
    Route::get('/campaigns', [AdminCampaignController::class, 'index']);
    Route::get('/campaigns/{id}', [AdminCampaignController::class, 'show']);
    Route::post('/campaigns/{id}/approve', [AdminCampaignController::class, 'approve']);
    Route::post('/campaigns/{id}/reject', [AdminCampaignController::class, 'reject']);
    
    // Campaign Status Monitoring
    Route::prefix('campaigns-status')->group(function () {
        Route::get('/summary', [CampaignStatusController::class, 'getStatusSummary']);
        Route::get('/attention', [CampaignStatusController::class, 'getCampaignsRequiringAttention']);
        Route::post('/{campaign}/complete', [CampaignStatusController::class, 'markAsCompleted']);
        Route::get('/health-check', [CampaignStatusController::class, 'healthCheck']);
    });
    
    // Analytics
    Route::get('/analytics/users', [AdminAnalyticsController::class, 'users']);
    Route::get('/analytics/campaigns', [AdminAnalyticsController::class, 'campaigns']);
    Route::get('/analytics/donations', [AdminAnalyticsController::class, 'donations']);
    
    // News management
    Route::get('/news', [NewsController::class, 'adminIndex']);
});