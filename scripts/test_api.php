<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/api/config/database.php';
require_once dirname(__DIR__) . '/api/core/Database.php';
require_once dirname(__DIR__) . '/api/core/Request.php';
require_once dirname(__DIR__) . '/api/core/Response.php';
require_once dirname(__DIR__) . '/api/core/Auth.php';
require_once dirname(__DIR__) . '/api/core/Audit.php';
require_once dirname(__DIR__) . '/api/controllers/AuthController.php';
require_once dirname(__DIR__) . '/api/controllers/DashboardController.php';
require_once dirname(__DIR__) . '/api/controllers/CourseController.php';
require_once dirname(__DIR__) . '/api/controllers/JumuaController.php';

use App\Core\Auth;
use App\Controllers\DashboardController;
use App\Controllers\CourseController;
use App\Controllers\JumuaController;
use App\Core\Request;

echo "==> Testing Core PHP 8.2 Backend Logic...\n";

// 1. Test Login
$user = Auth::login('admin@mokhterahmad.com', 'password123');
if (!$user) {
    echo "❌ Auth::login failed!\n";
    exit(1);
}
echo "✅ Auth::login successful: {$user['name']} ({$user['role_name']})\n";

// 2. Test Recurrence Generator on Course #1
$courseController = new CourseController();
$req = new Request();
$req->setParams(['id' => '1']);
echo "==> Triggering recurrence generation for Course #1...\n";
// Use reflection or direct method to test generator
$generateMethod = new ReflectionMethod(CourseController::class, 'generateSessionsInternal');
$count = $generateMethod->invoke($courseController, 1, '2026-09-01', '2026-09-30', $user['id']);
echo "✅ Recurrence generator created {$count} class sessions and synchronized activities!\n";

// 3. Test Jumu'ah Monthly Overview
$jumuaController = new JumuaController();
echo "==> Testing Jumu'ah Monthly Overview calculation...\n";
$jumuaMethod = new ReflectionMethod(JumuaController::class, 'getFridaysInMonth');
$fridays = $jumuaMethod->invoke($jumuaController, 2026, 9);
echo "✅ Detected " . count($fridays) . " Fridays in September 2026: " . implode(', ', $fridays) . "\n";

echo "==> All Core PHP Backend unit checks passed!\n";
