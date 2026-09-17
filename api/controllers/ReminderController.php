<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Database;
use App\Core\Request;
use App\Core\Response;

class ReminderController {
    public function notifications(Request $request): void {
        $pdo = Database::getConnection();
        $userId = Auth::id();

        $stmt = $pdo->prepare("
            SELECT * FROM notifications
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 50
        ");
        $stmt->execute([$userId]);
        $notifications = $stmt->fetchAll();

        // Unread count
        $cntStmt = $pdo->prepare("
            SELECT COUNT(*) FROM notifications
            WHERE user_id = ? AND status = 'UNREAD'
        ");
        $cntStmt->execute([$userId]);
        $unreadCount = (int)$cntStmt->fetchColumn();

        Response::json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount
        ]);
    }

    public function markAsRead(Request $request): void {
        $id = (int)$request->param('id');
        $pdo = Database::getConnection();
        $userId = Auth::id();

        $upd = $pdo->prepare("
            UPDATE notifications SET status = 'READ', read_at = NOW()
            WHERE id = ? AND user_id = ?
        ");
        $upd->execute([$id, $userId]);

        Response::json([
            'message' => 'Notification marked as read.'
        ]);
    }

    public function markAllAsRead(Request $request): void {
        $pdo = Database::getConnection();
        $userId = Auth::id();

        $upd = $pdo->prepare("
            UPDATE notifications SET status = 'READ', read_at = NOW()
            WHERE user_id = ? AND status = 'UNREAD'
        ");
        $upd->execute([$userId]);

        Response::json([
            'message' => 'All notifications marked as read.'
        ]);
    }
}
