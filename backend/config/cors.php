<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'storage/*', 'login', 'logout', 'register'],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    'allowed_origins' => [
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => [
        'Origin',
        'Content-Type',
        'X-Auth-Token',
        'Authorization',
        'Accept',
        'X-Requested-With',
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Headers'
    ],
    'exposed_headers' => [
        'Authorization',
        'authenticated'
    ],
    'max_age' => 60 * 60 * 24,  // 24 hours
    'supports_credentials' => true,
]; 