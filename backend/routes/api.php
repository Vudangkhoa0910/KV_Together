<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Auth routes
Route::post('/register', [App\Http\Controllers\Auth\RegisterController::class, 'register']);
Route::post('/login', [App\Http\Controllers\Auth\LoginController::class, 'login']);
Route::post('/logout', [App\Http\Controllers\Auth\LoginController::class, 'logout'])->middleware('auth:sanctum');

// Campaign routes
Route::get('/campaigns', [App\Http\Controllers\CampaignController::class, 'index']);
Route::get('/campaigns/featured', [App\Http\Controllers\CampaignController::class, 'featured']);
Route::get('/campaigns/{campaign}', [App\Http\Controllers\CampaignController::class, 'show']);
Route::post('/campaigns/{campaign}/donate', [App\Http\Controllers\CampaignController::class, 'donate'])->middleware('auth:sanctum');

// Stats routes
Route::get('/stats', [App\Http\Controllers\StatsController::class, 'index']);

// User profile routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/user/donations', [App\Http\Controllers\UserController::class, 'donations']);
    Route::put('/user/profile', [App\Http\Controllers\UserController::class, 'updateProfile']);
}); 