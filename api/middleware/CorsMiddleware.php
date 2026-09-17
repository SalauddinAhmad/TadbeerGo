<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Core\Request;

class CorsMiddleware {
    public function handle(Request $request): void {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
        
        // Allow credentials with specific origin
        header("Access-Control-Allow-Origin: $origin");
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token");
        header("Access-Control-Max-Age: 86400");
    }
}
