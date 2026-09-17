<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Audit;
use App\Core\Database;
use App\Core\Request;
use App\Core\Response;
use PDO;

class ActivityController {
    public function index(Request $request): void {
        $pdo = Database::getConnection();
        $isOwner = Auth::isOwner();

        $date = $request->query('date');
        $type = $request->query('type');
        $status = $request->query('status');
        $search = $request->query('q');

        $sql = "
            SELECT a.*, c.name as contact_name, o.name as organization_name
            FROM activities a
            LEFT JOIN contacts c ON a.contact_id = c.id
            LEFT JOIN organizations o ON a.organization_id = o.id
            WHERE 1=1
        ";
        $params = [];

        if (!$isOwner) {
            $sql .= " AND a.is_private = 0";
        }

        if (!empty($date)) {
            $sql .= " AND a.date = ?";
            $params[] = $date;
        }

        if (!empty($type)) {
            $sql .= " AND a.type = ?";
            $params[] = $type;
        }

        if (!empty($status)) {
            $sql .= " AND a.status = ?";
            $params[] = $status;
        }

        if (!empty($search)) {
            $sql .= " AND (a.title LIKE ? OR a.location LIKE ? OR a.topic LIKE ?)";
            $searchTerm = "%$search%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        $sql .= " ORDER BY a.date DESC, a.start_time ASC LIMIT 100";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $activities = $stmt->fetchAll();

        Response::json([
            'activities' => $activities
        ]);
    }

    public function show(Request $request): void {
        $id = (int)$request->param('id');
        $pdo = Database::getConnection();
        $isOwner = Auth::isOwner();

        $stmt = $pdo->prepare("
            SELECT a.*, c.name as contact_name, c.phone as contact_phone, o.name as organization_name
            FROM activities a
            LEFT JOIN contacts c ON a.contact_id = c.id
            LEFT JOIN organizations o ON a.organization_id = o.id
            WHERE a.id = ?
        ");
        $stmt->execute([$id]);
        $activity = $stmt->fetch();

        if (!$activity) {
            Response::error('Activity not found.', 'NOT_FOUND', 404);
        }

        if ($activity['is_private'] && !$isOwner) {
            Response::error('Access denied to private activity.', 'FORBIDDEN', 403);
        }

        // Fetch reminders
        $remStmt = $pdo->prepare("SELECT * FROM activity_reminders WHERE activity_id = ?");
        $remStmt->execute([$id]);
        $activity['reminders'] = $remStmt->fetchAll();

        // Fetch status history
        $histStmt = $pdo->prepare("
            SELECT h.*, u.name as changed_by_name
            FROM activity_status_history h
            LEFT JOIN users u ON h.changed_by = u.id
            WHERE h.activity_id = ?
            ORDER BY h.created_at DESC
        ");
        $histStmt->execute([$id]);
        $activity['status_history'] = $histStmt->fetchAll();

        // Fetch travel details if any
        $trvStmt = $pdo->prepare("SELECT * FROM travel_plans WHERE activity_id = ? LIMIT 1");
        $trvStmt->execute([$id]);
        $activity['travel_plan'] = $trvStmt->fetch() ?: null;

        Response::json([
            'activity' => $activity
        ]);
    }

    public function store(Request $request): void {
        $pdo = Database::getConnection();
        $userId = Auth::id();
        $isOwner = Auth::isOwner();

        $title = trim((string)$request->input('title', ''));
        $type = (string)$request->input('type', 'OTHER');
        $date = (string)$request->input('date', '');
        $startTime = $request->input('start_time');
        $endTime = $request->input('end_time');
        $location = $request->input('location');
        $contactId = $request->input('contact_id') ?: null;
        $organizationId = $request->input('organization_id') ?: null;
        $topic = $request->input('topic');
        $notes = $request->input('notes');
        $status = (string)$request->input('status', 'CONFIRMED');
        $priority = (string)$request->input('priority', 'MEDIUM');
        $isPrivate = ($isOwner && $request->input('is_private')) ? 1 : 0;
        $preparationRequired = $request->input('preparation_required') ? 1 : 0;
        $travelRequired = $request->input('travel_required') ? 1 : 0;

        if (empty($title) || empty($date)) {
            Response::error('Title and date are required.', 'VALIDATION_ERROR', 422);
        }

        // Check conflicts
        $conflicts = [];
        if (!empty($startTime) && !empty($endTime)) {
            $conflicts = $this->detectConflicts($date, $startTime, $endTime);
        }

        $stmt = $pdo->prepare("
            INSERT INTO activities (
                user_id, type, title, description, date, start_time, end_time,
                location, contact_id, organization_id, topic, notes, status,
                priority, preparation_required, travel_required, is_private,
                source, created_by
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?,
                'MANUAL', ?
            )
        ");

        $stmt->execute([
            $userId, $type, $title, $request->input('description'), $date, $startTime, $endTime,
            $location, $contactId, $organizationId, $topic, $notes, $status,
            $priority, $preparationRequired, $travelRequired, $isPrivate,
            $userId
        ]);

        $activityId = (int)$pdo->lastInsertId();

        // Create standard reminders if start_time is set
        if (!empty($startTime)) {
            $startDateTimeStr = "$date $startTime";
            // Default 1: 2 hours before
            $remTime1 = date('Y-m-d H:i:s', strtotime('-2 hours', strtotime($startDateTimeStr)));
            // Default 2: 15 minutes before
            $remTime2 = date('Y-m-d H:i:s', strtotime('-15 minutes', strtotime($startDateTimeStr)));

            $remStmt = $pdo->prepare("
                INSERT INTO activity_reminders (activity_id, minutes_before, scheduled_at, channel)
                VALUES (?, ?, ?, 'IN_APP'), (?, ?, ?, 'IN_APP')
            ");
            $remStmt->execute([
                $activityId, 120, $remTime1,
                $activityId, 15, $remTime2
            ]);
        }

        Audit::log('activity.created', 'activity', $activityId, null, [
            'title' => $title,
            'type' => $type,
            'date' => $date
        ]);

        // Auto-save into Contacts Directory
        $phoneInput = $request->input('phone') ?: $request->input('contact_phone');
        if (!empty($phoneInput)) {
            ContactController::autoSyncContact(
                $pdo,
                $request->input('contact_person') ?: $request->input('contact_name') ?: $title,
                (string)$phoneInput,
                $location,
                'সূচি পরিচিতি',
                "কার্যক্রম: $title ($date)"
            );
        }

        Response::json([
            'id' => $activityId,
            'message' => 'Activity created successfully.',
            'conflicts_warning' => !empty($conflicts) ? $conflicts : null
        ], 201);
    }

    public function update(Request $request): void {
        $id = (int)$request->param('id');
        $pdo = Database::getConnection();
        $isOwner = Auth::isOwner();
        $userId = Auth::id();

        // Get existing
        $curStmt = $pdo->prepare("SELECT * FROM activities WHERE id = ?");
        $curStmt->execute([$id]);
        $existing = $curStmt->fetch();

        if (!$existing) {
            Response::error('Activity not found.', 'NOT_FOUND', 404);
        }

        if ($existing['is_private'] && !$isOwner) {
            Response::error('Access denied.', 'FORBIDDEN', 403);
        }

        $title = trim((string)$request->input('title', $existing['title']));
        $type = (string)$request->input('type', $existing['type']);
        $date = (string)$request->input('date', $existing['date']);
        $startTime = $request->input('start_time', $existing['start_time']);
        $endTime = $request->input('end_time', $existing['end_time']);
        $location = $request->input('location', $existing['location']);
        $status = (string)$request->input('status', $existing['status']);
        $priority = (string)$request->input('priority', $existing['priority']);
        $notes = $request->input('notes', $existing['notes']);
        $topic = $request->input('topic', $existing['topic']);
        $isPrivate = ($isOwner && $request->input('is_private') !== null) 
            ? ($request->input('is_private') ? 1 : 0) 
            : $existing['is_private'];

        $upd = $pdo->prepare("
            UPDATE activities SET
                title = ?, type = ?, date = ?, start_time = ?, end_time = ?,
                location = ?, status = ?, priority = ?, notes = ?, topic = ?,
                is_private = ?, updated_by = ?
            WHERE id = ?
        ");
        $upd->execute([
            $title, $type, $date, $startTime, $endTime,
            $location, $status, $priority, $notes, $topic,
            $isPrivate, $userId, $id
        ]);

        // If status changed, record status transition history
        if ($status !== $existing['status']) {
            $reason = (string)$request->input('status_change_reason', 'Status updated');
            $hist = $pdo->prepare("
                INSERT INTO activity_status_history (activity_id, from_status, to_status, reason, changed_by)
                VALUES (?, ?, ?, ?, ?)
            ");
            $hist->execute([$id, $existing['status'], $status, $reason, $userId]);
        }

        Audit::log('activity.updated', 'activity', $id, $existing, [
            'title' => $title,
            'status' => $status,
            'date' => $date
        ]);

        // Auto-save / update into Contacts Directory
        $phoneInput = $request->input('phone') ?: $request->input('contact_phone');
        if (!empty($phoneInput)) {
            ContactController::autoSyncContact(
                $pdo,
                $request->input('contact_person') ?: $request->input('contact_name') ?: $title,
                (string)$phoneInput,
                $location,
                'সূচি পরিচিতি',
                "কার্যক্রম: $title ($date)"
            );
        }

        Response::json([
            'message' => 'Activity updated successfully.'
        ]);
    }

    public function destroy(Request $request): void {
        $id = (int)$request->param('id');
        $pdo = Database::getConnection();
        $isOwner = Auth::isOwner();

        $stmt = $pdo->prepare("SELECT * FROM activities WHERE id = ?");
        $stmt->execute([$id]);
        $existing = $stmt->fetch();

        if (!$existing) {
            Response::error('Activity not found.', 'NOT_FOUND', 404);
        }

        if ($existing['is_private'] && !$isOwner) {
            Response::error('Access denied.', 'FORBIDDEN', 403);
        }

        $del = $pdo->prepare("DELETE FROM activities WHERE id = ?");
        $del->execute([$id]);

        Audit::log('activity.deleted', 'activity', $id, $existing);

        Response::json([
            'message' => 'Activity deleted successfully.'
        ]);
    }

    public function checkConflicts(Request $request): void {
        $date = (string)$request->query('date', '');
        $startTime = (string)$request->query('start_time', '');
        $endTime = (string)$request->query('end_time', '');
        $excludeId = (int)$request->query('exclude_id', 0);

        if (empty($date) || empty($startTime) || empty($endTime)) {
            Response::json(['has_conflict' => false, 'conflicts' => []]);
            return;
        }

        $conflicts = $this->detectConflicts($date, $startTime, $endTime, $excludeId);
        Response::json([
            'has_conflict' => !empty($conflicts),
            'conflicts' => $conflicts
        ]);
    }

    private function detectConflicts(string $date, string $startTime, string $endTime, int $excludeId = 0): array {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("
            SELECT id, title, type, start_time, end_time, location
            FROM activities
            WHERE date = ?
              AND id != ?
              AND status NOT IN ('CANCELLED', 'MISSED')
              AND start_time IS NOT NULL
              AND end_time IS NOT NULL
              AND (
                  (start_time <= ? AND end_time > ?) OR
                  (start_time < ? AND end_time >= ?) OR
                  (start_time >= ? AND end_time <= ?)
              )
        ");
        $stmt->execute([$date, $excludeId, $startTime, $startTime, $endTime, $endTime, $startTime, $endTime]);
        return $stmt->fetchAll();
    }
}
