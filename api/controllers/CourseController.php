<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Audit;
use App\Core\Database;
use App\Core\Request;
use App\Core\Response;
use DateTime;
use DateInterval;
use PDO;

class CourseController {
    public function index(Request $request): void {
        $pdo = Database::getConnection();
        $stmt = $pdo->query("
            SELECT c.*, 
                   COUNT(cs.id) as total_sessions,
                   SUM(CASE WHEN cs.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_sessions,
                   SUM(CASE WHEN cs.status = 'MISSED' THEN 1 ELSE 0 END) as missed_sessions
            FROM courses c
            LEFT JOIN class_sessions cs ON c.id = cs.course_id
            GROUP BY c.id
            ORDER BY c.created_at DESC
        ");
        $courses = $stmt->fetchAll();

        foreach ($courses as &$c) {
            $c['recurrence_rule'] = !empty($c['recurrence_rule']) ? json_decode($c['recurrence_rule'], true) : null;
        }

        Response::json([
            'courses' => $courses
        ]);
    }

    public function show(Request $request): void {
        $id = (int)$request->param('id');
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("SELECT * FROM courses WHERE id = ?");
        $stmt->execute([$id]);
        $course = $stmt->fetch();

        if (!$course) {
            Response::error('Course not found.', 'NOT_FOUND', 404);
        }

        $course['recurrence_rule'] = !empty($course['recurrence_rule']) ? json_decode($course['recurrence_rule'], true) : null;

        // Fetch recent and upcoming sessions
        $sessStmt = $pdo->prepare("
            SELECT * FROM class_sessions
            WHERE course_id = ?
            ORDER BY date ASC, start_time ASC
        ");
        $sessStmt->execute([$id]);
        $course['sessions'] = $sessStmt->fetchAll();

        Response::json([
            'course' => $course
        ]);
    }

    public function store(Request $request): void {
        $pdo = Database::getConnection();
        $userId = Auth::id() ?? 1;

        $title = trim((string)$request->input('title', ''));
        $description = $request->input('description');
        $teacherName = trim((string)$request->input('teacher_name', 'Mokhter Ahmad'));
        $targetGroup = $request->input('target_group');
        $mode = (string)$request->input('mode', 'ONLINE');
        $meetingLink = $request->input('meeting_link');
        $startDate = (string)$request->input('start_date', date('Y-m-d'));
        $endDate = $request->input('end_date') ?: null;
        $recurrence = $request->input('recurrence_rule'); // e.g. ["SAT", "MON", "WED"]
        $duration = (int)$request->input('default_duration_minutes', 60);
        $syllabus = $request->input('syllabus');
        $progressUnit = (string)$request->input('progress_unit', 'Lesson');
        $totalUnits = (string)$request->input('total_units', '');
        $notes = $request->input('notes');

        if (empty($title) || empty($startDate)) {
            Response::error('Course title and start date are required.', 'VALIDATION_ERROR', 422);
        }

        $recurrenceJson = is_array($recurrence) ? json_encode($recurrence) : $recurrence;

        $stmt = $pdo->prepare("
            INSERT INTO courses (
                title, description, teacher_name, target_group, mode, meeting_link,
                start_date, end_date, recurrence_rule, default_duration_minutes,
                syllabus, progress_unit, total_units, status, notes, created_by
            ) VALUES (
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, 'ACTIVE', ?, ?
            )
        ");

        $stmt->execute([
            $title, $description, $teacherName, $targetGroup, $mode, $meetingLink,
            $startDate, $endDate, $recurrenceJson, $duration,
            $syllabus, $progressUnit, $totalUnits, $notes, $userId
        ]);

        $courseId = (int)$pdo->lastInsertId();

        Audit::log('course.created', 'course', $courseId, null, ['title' => $title]);

        // If recurrence definition is provided, auto-generate sessions for first 4 weeks
        if (!empty($recurrence)) {
            $this->generateSessionsInternal($courseId, $startDate, $endDate ?: date('Y-m-d', strtotime('+3 months', strtotime($startDate))), $userId);
        }

        Response::json([
            'id' => $courseId,
            'message' => 'Course created successfully.'
        ], 201);
    }

    public function generateSessions(Request $request): void {
        $id = (int)$request->param('id');
        $pdo = Database::getConnection();
        $userId = Auth::id() ?? 1;

        $stmt = $pdo->prepare("SELECT * FROM courses WHERE id = ?");
        $stmt->execute([$id]);
        $course = $stmt->fetch();

        if (!$course) {
            Response::error('Course not found.', 'NOT_FOUND', 404);
        }

        $horizonMonths = (int)$request->input('months', 3);
        $startDate = (string)$request->input('start_date', date('Y-m-d'));
        $endDate = (string)$request->input('end_date', date('Y-m-d', strtotime("+{$horizonMonths} months", strtotime($startDate))));

        $count = $this->generateSessionsInternal($id, $startDate, $endDate, $userId);

        Response::json([
            'message' => "Generated {$count} new class session instances successfully.",
            'count' => $count
        ]);
    }

    private function generateSessionsInternal(int $courseId, string $startDateStr, string $endDateStr, int $userId): int {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM courses WHERE id = ?");
        $stmt->execute([$courseId]);
        $course = $stmt->fetch();

        if (!$course || empty($course['recurrence_rule'])) {
            return 0;
        }

        $rule = json_decode($course['recurrence_rule'], true);
        $days = $rule['days'] ?? ['SAT', 'MON', 'WED']; // e.g. ["SAT", "MON", "WED"]
        $startTime = $rule['start_time'] ?? '21:00:00';
        if (strlen($startTime) === 5) $startTime .= ':00';
        $durationMin = (int)($rule['duration_minutes'] ?? $course['default_duration_minutes'] ?? 60);

        // Day map for DateTime: 1 (Mon) to 7 (Sun)
        $dayMap = [
            'MON' => 1, 'TUE' => 2, 'WED' => 3, 'THU' => 4,
            'FRI' => 5, 'SAT' => 6, 'SUN' => 7
        ];
        $targetWeekdays = [];
        foreach ($days as $d) {
            $upper = strtoupper(trim($d));
            if (isset($dayMap[$upper])) {
                $targetWeekdays[] = $dayMap[$upper];
            }
        }

        if (empty($targetWeekdays)) {
            return 0;
        }

        // Find max existing session number
        $maxStmt = $pdo->prepare("SELECT MAX(session_no) FROM class_sessions WHERE course_id = ?");
        $maxStmt->execute([$courseId]);
        $currentSessionNo = (int)$maxStmt->fetchColumn();

        // Calculate endTime
        $startDtObj = new DateTime("2000-01-01 $startTime");
        $startDtObj->add(new DateInterval("PT{$durationMin}M"));
        $endTime = $startDtObj->format('H:i:s');

        $cursor = new DateTime($startDateStr);
        $end = new DateTime($endDateStr);

        $insertedCount = 0;
        while ($cursor <= $end) {
            $dayOfWeek = (int)$cursor->format('N');
            if (in_array($dayOfWeek, $targetWeekdays, true)) {
                $curDateStr = $cursor->format('Y-m-d');

                // Check if session already exists for this course on this date
                $checkStmt = $pdo->prepare("SELECT id FROM class_sessions WHERE course_id = ? AND date = ?");
                $checkStmt->execute([$courseId, $curDateStr]);
                if (!$checkStmt->fetch()) {
                    $currentSessionNo++;

                    // 1. Create Activity
                    $actStmt = $pdo->prepare("
                        INSERT INTO activities (
                            user_id, type, title, date, start_time, end_time,
                            status, priority, source, created_by
                        ) VALUES (
                            ?, 'CLASS', ?, ?, ?, ?,
                            'CONFIRMED', 'HIGH', 'COURSE_RECURRENCE', ?
                        )
                    ");
                    $sessionTitle = "{$course['title']} - Class #{$currentSessionNo}";
                    $actStmt->execute([
                        $userId, $sessionTitle, $curDateStr, $startTime, $endTime, $userId
                    ]);
                    $activityId = (int)$pdo->lastInsertId();

                    // 2. Create Class Session
                    $sessStmt = $pdo->prepare("
                        INSERT INTO class_sessions (
                            course_id, activity_id, session_no, date, start_time, end_time,
                            status, topic, lesson_title, created_by
                        ) VALUES (
                            ?, ?, ?, ?, ?, ?,
                            'PENDING', ?, ?, ?
                        )
                    ");
                    $sessStmt->execute([
                        $courseId, $activityId, $currentSessionNo, $curDateStr, $startTime, $endTime,
                        $course['title'], "Session #{$currentSessionNo}", $userId
                    ]);

                    $insertedCount++;
                }
            }
            $cursor->add(new DateInterval('P1D'));
        }

        return $insertedCount;
    }

    public function update(Request $request): void {
        $id = (int)$request->param('id');
        $pdo = Database::getConnection();
        $userId = Auth::id() ?? 1;

        $stmt = $pdo->prepare("SELECT * FROM courses WHERE id = ?");
        $stmt->execute([$id]);
        $course = $stmt->fetch();
        if (!$course) {
            Response::error('Course not found.', 'NOT_FOUND', 404);
        }

        $title = trim((string)$request->input('title', $course['title']));
        $description = $request->input('description', $course['description']);
        $teacherName = trim((string)$request->input('teacher_name', $course['teacher_name']));
        $targetGroup = $request->input('target_group', $course['target_group']);
        $mode = (string)$request->input('mode', $course['mode']);
        $meetingLink = $request->input('meeting_link', $course['meeting_link']);
        $recurrence = $request->input('recurrence_rule');
        $duration = (int)$request->input('default_duration_minutes', $course['default_duration_minutes']);

        $recurrenceJson = is_array($recurrence) ? json_encode($recurrence) : ($recurrence ?: $course['recurrence_rule']);

        $upd = $pdo->prepare("
            UPDATE courses SET
                title = ?, description = ?, teacher_name = ?, target_group = ?,
                mode = ?, meeting_link = ?, recurrence_rule = ?, default_duration_minutes = ?,
                updated_by = ?
            WHERE id = ?
        ");
        $upd->execute([
            $title, $description, $teacherName, $targetGroup,
            $mode, $meetingLink, $recurrenceJson, $duration,
            $userId, $id
        ]);

        Response::json(['message' => 'Course updated successfully.']);
    }

    public function destroy(Request $request): void {
        $id = (int)$request->param('id');
        $pdo = Database::getConnection();

        // Delete activities linked to class_sessions of this course
        $actStmt = $pdo->prepare("
            DELETE FROM activities WHERE id IN (
                SELECT activity_id FROM class_sessions WHERE course_id = ? AND activity_id IS NOT NULL
            )
        ");
        $actStmt->execute([$id]);

        // Delete class sessions
        $delSessions = $pdo->prepare("DELETE FROM class_sessions WHERE course_id = ?");
        $delSessions->execute([$id]);

        // Delete course
        $delCourse = $pdo->prepare("DELETE FROM courses WHERE id = ?");
        $delCourse->execute([$id]);

        Response::json(['message' => 'Course and its sessions deleted successfully.']);
    }

    public function addSession(Request $request): void {
        $courseId = (int)$request->param('id');
        $pdo = Database::getConnection();
        $userId = Auth::id() ?? 1;

        $stmt = $pdo->prepare("SELECT * FROM courses WHERE id = ?");
        $stmt->execute([$courseId]);
        $course = $stmt->fetch();
        if (!$course) {
            Response::error('Course not found.', 'NOT_FOUND', 404);
        }

        $date = (string)$request->input('date', date('Y-m-d'));
        $startTime = (string)$request->input('start_time', '18:00:00');
        if (strlen($startTime) === 5) $startTime .= ':00';
        $endTime = (string)$request->input('end_time', '19:30:00');
        if (strlen($endTime) === 5) $endTime .= ':00';

        $sessionNo = (int)$request->input('session_no', 0);
        if ($sessionNo <= 0) {
            $maxStmt = $pdo->prepare("SELECT COALESCE(MAX(session_no), 0) FROM class_sessions WHERE course_id = ?");
            $maxStmt->execute([$courseId]);
            $sessionNo = ((int)$maxStmt->fetchColumn()) + 1;
        }

        $lessonTitle = (string)$request->input('lesson_title', "Class #{$sessionNo}");
        $topic = (string)$request->input('topic', $course['title']);
        $coveredContent = $request->input('covered_content');
        $teacherNotes = $request->input('teacher_notes');
        $homework = $request->input('homework');
        $status = (string)$request->input('status', 'PENDING');

        // Create Activity
        $actStmt = $pdo->prepare("
            INSERT INTO activities (
                user_id, type, title, date, start_time, end_time,
                topic, status, priority, source, created_by
            ) VALUES (
                ?, 'CLASS', ?, ?, ?, ?,
                ?, 'CONFIRMED', 'HIGH', 'MANUAL_CLASS', ?
            )
        ");
        $sessionTitle = "{$course['title']} - {$lessonTitle}";
        $actStmt->execute([
            $userId, $sessionTitle, $date, $startTime, $endTime, $topic, $userId
        ]);
        $activityId = (int)$pdo->lastInsertId();

        // Create class session
        $sessStmt = $pdo->prepare("
            INSERT INTO class_sessions (
                course_id, activity_id, session_no, date, start_time, end_time,
                status, topic, lesson_title, covered_content, teacher_notes, homework, created_by
            ) VALUES (
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?
            )
        ");
        $sessStmt->execute([
            $courseId, $activityId, $sessionNo, $date, $startTime, $endTime,
            $status, $topic, $lessonTitle, $coveredContent, $teacherNotes, $homework, $userId
        ]);
        $sessionId = (int)$pdo->lastInsertId();

        Response::json([
            'id' => $sessionId,
            'session_no' => $sessionNo,
            'message' => 'Class session added successfully.'
        ], 201);
    }
}
