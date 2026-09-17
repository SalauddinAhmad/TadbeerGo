<?php
declare(strict_types=1);

namespace App\Core;

use PDOException;

class Audit {
    public static function log(
        string $action,
        string $entityType,
        ?int $entityId = null,
        mixed $oldValues = null,
        mixed $newValues = null
    ): void {
        try {
            $pdo = Database::getConnection();
            $userId = Auth::id();
            $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
            $userAgent = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500);

            $stmt = $pdo->prepare("
                INSERT INTO audit_logs (
                    user_id, action, entity_type, entity_id,
                    old_values, new_values, ip_address, user_agent
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $userId,
                $action,
                $entityType,
                $entityId,
                $oldValues !== null ? json_encode($oldValues, JSON_UNESCAPED_UNICODE) : null,
                $newValues !== null ? json_encode($newValues, JSON_UNESCAPED_UNICODE) : null,
                $ip,
                $userAgent
            ]);
        } catch (PDOException $e) {
            // Failure to write audit log must not break application execution
            error_log("Audit Log Warning: " . $e->getMessage());
        }
    }
}
