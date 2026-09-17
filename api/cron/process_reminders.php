<?php
/**
 * Cron Reminder Processor
 * Run via cPanel Cron: (every 5 minutes)
 * Command: /usr/local/bin/php /home/username/public_html/api/cron/process_reminders.php > /dev/null 2>&1
 * Or via HTTP: /api/cron/process_reminders.php?token=CRON_SECRET
 */

declare(strict_types=1);

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/core/Database.php';

use App\Core\Database;

// Check CLI or HTTP Token
$isCli = (php_sapi_name() === 'cli');
if (!$isCli) {
    $appConfig = require dirname(__DIR__) . '/config/app.php';
    $cronSecret = $appConfig['cron_secret'] ?? '';
    $token = $_GET['token'] ?? '';
    if (empty($token) || $token !== $cronSecret) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden']);
        exit;
    }
}

try {
    $pdo = Database::getConnection();
    $now = date('Y-m-d H:i:s');

    // 1. Fetch pending reminders that reached their scheduled time
    $stmt = $pdo->prepare("
        SELECT r.id as reminder_id, r.activity_id, r.minutes_before,
               a.title as activity_title, a.type as activity_type, a.date as activity_date,
               a.start_time, a.location, a.user_id
        FROM activity_reminders r
        JOIN activities a ON r.activity_id = a.id
        WHERE r.is_dispatched = 0
          AND r.scheduled_at <= ?
          AND a.status NOT IN ('CANCELLED', 'COMPLETED')
        LIMIT 50
    ");
    $stmt->execute([$now]);
    $pendingReminders = $stmt->fetchAll();

    $dispatchedCount = 0;
    foreach ($pendingReminders as $item) {
        $mins = (int)$item['minutes_before'];
        $timeLabel = $mins >= 60 ? (round($mins / 60) . ' hour(s)') : ($mins . ' minutes');
        $notifTitle = "Reminder: {$item['activity_title']}";
        $notifBody = "Upcoming {$item['activity_type']} in {$timeLabel} at " . date('h:i A', strtotime($item['start_time'])) . ($item['location'] ? " ({$item['location']})" : "");

        // Create notification
        $notifStmt = $pdo->prepare("
            INSERT INTO notifications (user_id, title, body, type, entity_type, entity_id, status)
            VALUES (?, ?, ?, 'REMINDER', 'activity', ?, 'UNREAD')
        ");
        $notifStmt->execute([
            $item['user_id'],
            $notifTitle,
            $notifBody,
            $item['activity_id']
        ]);

        // Mark reminder as dispatched
        $updStmt = $pdo->prepare("
            UPDATE activity_reminders
            SET is_dispatched = 1, dispatched_at = ?
            WHERE id = ?
        ");
        $updStmt->execute([$now, $item['reminder_id']]);
        $dispatchedCount++;
    }

    $msg = "Cron run completed at $now. Dispatched: $dispatchedCount reminder(s).\n";
    if ($isCli) {
        echo $msg;
    } else {
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'dispatched' => $dispatchedCount, 'timestamp' => $now]);
    }

} catch (Exception $e) {
    error_log("Cron Reminder Processor Error: " . $e->getMessage());
    if ($isCli) {
        echo "Error: " . $e->getMessage() . "\n";
        exit(1);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit;
    }
}
