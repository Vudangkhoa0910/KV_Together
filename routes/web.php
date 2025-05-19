<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\DonationController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\NewsController;

Route::get('/', function () {
    return view('welcome');
});

Auth::routes();

Route::get('/home', [App\Http\Controllers\HomeController::class, 'index'])->name('home');

// Campaign routes
Route::resource('campaigns', CampaignController::class);
Route::get('campaigns/{campaign}/donate', [CampaignController::class, 'donate'])->name('campaigns.donate');

// Donation routes
Route::resource('donations', DonationController::class);
Route::post('donations/process', [DonationController::class, 'process'])->name('donations.process');

// Activity routes
Route::resource('activities', ActivityController::class);

// News routes
Route::resource('news', NewsController::class);

// Admin routes
Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/admin', function () {
        return view('admin.dashboard');
    })->name('admin.dashboard');
    
    Route::get('/admin/campaigns', [CampaignController::class, 'adminIndex'])->name('admin.campaigns.index');
    Route::get('/admin/donations', [DonationController::class, 'adminIndex'])->name('admin.donations.index');
    Route::get('/admin/activities', [ActivityController::class, 'adminIndex'])->name('admin.activities.index');
    Route::get('/admin/news', [NewsController::class, 'adminIndex'])->name('admin.news.index');
});
