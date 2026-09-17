<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

return [
    'name' => env('APP_NAME', 'TadbeerGo'),
    'env' => env('APP_ENV', 'development'),
    'debug' => (bool)env('APP_DEBUG', true),
    'url' => env('APP_URL', 'http://localhost:8000'),
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:5173'),
    'timezone' => env('APP_TIMEZONE', 'Asia/Dhaka'),
    'csrf_secret' => env('CSRF_SECRET', 'secret_csrf_token'),
    'cron_secret' => env('CRON_SECRET', 'secure_cron_token_for_scheduled_tasks'),
    'session' => [
        'lifetime' => (int)env('SESSION_LIFETIME', 86400),
        'secure' => (bool)env('SESSION_SECURE', false),
        'httponly' => true,
        'samesite' => 'Lax',
    ]
];
