<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;

Route::get('/', function () {
    return response()->json(['message' => 'KV Together API']);
});

// Route để serve files từ thư mục data
Route::get('/data/{path}', function (Request $request, $path) {
    $fullPath = base_path('data/' . $path);
    
    if (!file_exists($fullPath)) {
        abort(404);
    }
    
    return response()->file($fullPath);
})->where('path', '.*');
