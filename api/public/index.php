<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/config/bootstrap.php';

// Enable error reporting in development, logs in production
ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

// Autoload Core Classes & Controllers
spl_autoload_register(function (string $class) {
    $prefix = 'App\\';
    $baseDir = dirname(__DIR__) . '/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relativeClass = substr($class, $len);
    // Convert e.g. Core\Database to core/Database.php, Controllers\AuthController to controllers/AuthController.php
    $parts = explode('\\', $relativeClass);
    if (count($parts) > 1) {
        $parts[0] = strtolower($parts[0]);
    }
    $file = $baseDir . implode('/', $parts) . '.php';

    if (file_exists($file)) {
        require_once $file;
    }
});

use App\Core\Request;
use App\Core\Router;
use App\Middleware\CorsMiddleware;
use App\Middleware\AuthMiddleware;
use App\Controllers\AuthController;
use App\Controllers\DashboardController;
use App\Controllers\ActivityController;
use App\Controllers\CalendarController;
use App\Controllers\CourseController;
use App\Controllers\ClassSessionController;
use App\Controllers\JumuaController;
use App\Controllers\MosqueController;
use App\Controllers\ProgrammeController;
use App\Controllers\ContactController;
use App\Controllers\ReminderController;
use App\Controllers\UserManagementController;

$request = new Request();
$router = new Router();

// 1. Global Middleware
$router->use(function (Request $req) {
    (new CorsMiddleware())->handle($req);
});

// 2. Auth Routes (Public)
$router->post('/api/auth/login', [AuthController::class, 'login']);
$router->post('/api/auth/logout', [AuthController::class, 'logout']);
$router->get('/api/auth/me', [AuthController::class, 'me']);

// 3. Protected Routes
$authMw = [new AuthMiddleware()];

// Dashboard
$router->get('/api/dashboard', [DashboardController::class, 'index'], $authMw);

// Activities
$router->get('/api/activities', [ActivityController::class, 'index'], $authMw);
$router->post('/api/activities', [ActivityController::class, 'store'], $authMw);
$router->get('/api/activities/check-conflicts', [ActivityController::class, 'checkConflicts'], $authMw);
$router->get('/api/activities/{id}', [ActivityController::class, 'show'], $authMw);
$router->put('/api/activities/{id}', [ActivityController::class, 'update'], $authMw);
$router->delete('/api/activities/{id}', [ActivityController::class, 'destroy'], $authMw);

// Calendar
$router->get('/api/calendar', [CalendarController::class, 'events'], $authMw);

// Courses & Classes
$router->get('/api/courses', [CourseController::class, 'index'], $authMw);
$router->post('/api/courses', [CourseController::class, 'store'], $authMw);
$router->get('/api/courses/{id}', [CourseController::class, 'show'], $authMw);
$router->put('/api/courses/{id}', [CourseController::class, 'update'], $authMw);
$router->delete('/api/courses/{id}', [CourseController::class, 'destroy'], $authMw);
$router->post('/api/courses/{id}/generate-sessions', [CourseController::class, 'generateSessions'], $authMw);
$router->post('/api/courses/{id}/sessions', [CourseController::class, 'addSession'], $authMw);

$router->get('/api/class-sessions/{id}', [ClassSessionController::class, 'show'], $authMw);
$router->put('/api/class-sessions/{id}', [ClassSessionController::class, 'update'], $authMw);
$router->delete('/api/class-sessions/{id}', [ClassSessionController::class, 'destroy'], $authMw);
$router->put('/api/class-sessions/{id}/progress', [ClassSessionController::class, 'updateProgress'], $authMw);
$router->put('/api/class-sessions/{id}/missed', [ClassSessionController::class, 'markMissed'], $authMw);
$router->post('/api/class-sessions/{id}/reschedule', [ClassSessionController::class, 'reschedule'], $authMw);

// Jumu'ah & Mosques
$router->get('/api/jumua/monthly', [JumuaController::class, 'monthlyOverview'], $authMw);
$router->post('/api/jumua/book', [JumuaController::class, 'book'], $authMw);

$router->get('/api/mosques', [MosqueController::class, 'index'], $authMw);
$router->post('/api/mosques', [MosqueController::class, 'store'], $authMw);
$router->get('/api/mosques/{id}', [MosqueController::class, 'show'], $authMw);

// Programmes & Prep
$router->get('/api/programmes', [ProgrammeController::class, 'index'], $authMw);
$router->post('/api/programmes', [ProgrammeController::class, 'store'], $authMw);
$router->get('/api/programmes/{id}', [ProgrammeController::class, 'show'], $authMw);
$router->put('/api/programmes/{id}', [ProgrammeController::class, 'update'], $authMw);
$router->delete('/api/programmes/{id}', [ProgrammeController::class, 'destroy'], $authMw);
$router->put('/api/programmes/{id}/status', [ProgrammeController::class, 'updateStatus'], $authMw);
$router->post('/api/programmes/{id}/preparations', [ProgrammeController::class, 'addPrepItem'], $authMw);
$router->put('/api/programmes/preparations/{prepId}/toggle', [ProgrammeController::class, 'togglePrepItem'], $authMw);
$router->delete('/api/programmes/preparations/{prepId}', [ProgrammeController::class, 'deletePrepItem'], $authMw);

// Contacts & Organizations
$router->get('/api/contacts', [ContactController::class, 'index'], $authMw);
$router->post('/api/contacts', [ContactController::class, 'store'], $authMw);
$router->get('/api/organizations', [ContactController::class, 'organizations'], $authMw);

// Reminders & Notifications
$router->get('/api/notifications', [ReminderController::class, 'notifications'], $authMw);
$router->put('/api/notifications/{id}/read', [ReminderController::class, 'markAsRead'], $authMw);
$router->put('/api/notifications/read-all', [ReminderController::class, 'markAllAsRead'], $authMw);

// User Management & Roles (Owner Only)
$router->get('/api/users', [UserManagementController::class, 'index'], $authMw);
$router->get('/api/users/permissions', [UserManagementController::class, 'permissions'], $authMw);
$router->post('/api/users', [UserManagementController::class, 'store'], $authMw);
$router->put('/api/users/{id}', [UserManagementController::class, 'update'], $authMw);
$router->delete('/api/users/{id}', [UserManagementController::class, 'destroy'], $authMw);

// Dispatch
$router->dispatch($request);
