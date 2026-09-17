<?php
declare(strict_types=1);

namespace App\Core;

use PDO;

class Auth {
    private static ?array $currentUser = null;

    public static function startSession(): void {
        if (session_status() === PHP_SESSION_NONE && !headers_sent()) {
            $config = require dirname(__DIR__) . '/config/app.php';
            $sessionConfig = $config['session'] ?? [];

            @ini_set('session.cookie_httponly', '1');
            @ini_set('session.use_only_cookies', '1');
            @ini_set('session.cookie_samesite', $sessionConfig['samesite'] ?? 'Lax');
            if (!empty($sessionConfig['secure'])) {
                @ini_set('session.cookie_secure', '1');
            }

            @session_name('PLM_SESSION');
            @session_start();
        }
    }

    public static function login(string $email, string $password): ?array {
        self::startSession();
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("
            SELECT u.*, r.name as role_name, r.display_name as role_display_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.email = ? AND u.status = 'ACTIVE'
            LIMIT 1
        ");
        $stmt->execute([trim($email)]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            return null;
        }

        // Regenerate session ID on login to prevent session fixation
        if (session_status() === PHP_SESSION_ACTIVE && !headers_sent()) {
            @session_regenerate_id(true);
        }

        $_SESSION['user_id'] = (int)$user['id'];
        $_SESSION['logged_in_at'] = time();

        // Update last login timestamp
        $upd = $pdo->prepare("UPDATE users SET last_login_at = NOW() WHERE id = ?");
        $upd->execute([$user['id']]);

        unset($user['password_hash'], $user['remember_token']);
        self::$currentUser = $user;

        // Log audit
        Audit::log('user.login', 'user', (int)$user['id'], null, ['ip' => $_SERVER['REMOTE_ADDR'] ?? '']);

        return $user;
    }

    public static function logout(): void {
        self::startSession();
        if (!empty($_SESSION['user_id'])) {
            Audit::log('user.logout', 'user', (int)$_SESSION['user_id']);
        }
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params["path"],
                $params["domain"],
                $params["secure"],
                $params["httponly"]
            );
        }
        session_destroy();
        self::$currentUser = null;
    }

    public static function user(): ?array {
        if (self::$currentUser !== null) {
            return self::$currentUser;
        }

        self::startSession();
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            return null;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT u.id, u.role_id, u.name, u.email, u.phone, u.avatar_url, u.status,
                   r.name as role_name, r.display_name as role_display_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = ? AND u.status = 'ACTIVE'
            LIMIT 1
        ");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (!$user) {
            return null;
        }

        // Fetch user permissions
        $permStmt = $pdo->prepare("
            SELECT p.name
            FROM role_permissions rp
            JOIN permissions p ON rp.permission_id = p.id
            WHERE rp.role_id = ?
        ");
        $permStmt->execute([$user['role_id']]);
        $user['permissions'] = $permStmt->fetchAll(PDO::FETCH_COLUMN);

        self::$currentUser = $user;
        return self::$currentUser;
    }

    public static function id(): ?int {
        $user = self::user();
        return $user ? (int)$user['id'] : null;
    }

    public static function isOwner(): bool {
        $user = self::user();
        return $user && ($user['role_name'] === 'owner');
    }

    public static function hasPermission(string $permission): bool {
        $user = self::user();
        if (!$user) {
            return false;
        }
        if ($user['role_name'] === 'owner') {
            return true; // Owner has all permissions
        }
        return in_array($permission, $user['permissions'] ?? [], true);
    }
}
