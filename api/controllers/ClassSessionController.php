<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Audit;
use App\Core\Database;
use App\Core\Request;
use App\Core\Response;
use PDO;

class ClassSessionController {
    public function show(Request $request): void {
        $id = (int)$request->param('id');
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("
            SELECT cs.*, c.title as course_title, c.progress_unit, c.current_progress as course_progress
            FROM class_sessions cs
            JOIN courses c ON cs.course_id = c.id
            WHERE cs.id = ?
        ");
        $stmt->execute([$id]);
        $session = $stmt->fetch();

        if (!$session) {
            Response::error('Class session not found.', 'NOT_FOUND', 404);
        }

        Response::json([
            'session' => $session
        ]);
    }

    public function updateProgress(Request $request): void {
        $id = (int)$request->param('id');
        $pdo = Database::getConnection();
        $userId = Auth::id() ?? 1;

        $stmt = $pdo->prepare("SELECT * FROM class_sessions WHERE id = ?");
        $stmt->execute([$id]);
        $session = $stmt->fetch();

        if (!$session) {
            Response::error('Class session not found.', 'NOT_FOUND', 404);
        }

        $coveredContent = trim((string)$request->input('covered_content', ''));
        $progressValue = $request->input('progress_value');
        $nextStartingPoint = $request->input('next_starting_point');
        $homework = $request->input('homework');
        $teacherNotes = $request->input('teacher_notes');
        $studentNotes = $request->input('student_notes');

        // Update session to COMPLETED
        $upd = $pdo->prepare("
            UPDATE class_sessions SET
                status = 'COMPLETED',
                covered_content = ?,
                progress_value = ?,
                next_starting_point = ?,
                homework = ?,
                teacher_notes = ?,
                student_notes = ?,
                updated_by = ?
            WHERE id = ?
        ");
        $upd->execute([
            $coveredContent, $progressValue, $nextStartingPoint,
            $homework, $teacherNotes, $studentNotes,
            $userId, $id
        ]);

        // Sync activity status
        if (!empty($session['activity_id'])) {
            $actUpd = $pdo->prepare("UPDATE activities SET status = 'COMPLETED', updated_by = ? WHERE id = ?");
            $actUpd->execute([$userId, $session['activity_id']]);
        }

        // Update Course current progress if progressValue or nextStartingPoint is provided
        if (!empty($progressValue)) {
            $crsUpd = $pdo->prepare("UPDATE courses SET current_progress = ? WHERE id = ?");
            $crsUpd->execute([$progressValue, $session['course_id']]);
        }

        Audit::log('class_session.completed', 'class_session', $id, $session, [
            'covered' => $coveredContent,
            'next' => $nextStartingPoint
        ]);

        Response::json([
            'message' => 'Class progress saved and session marked as completed.'
        ]);
    }

    public function markMissed(Request $request): void {
        $id = (int)$request->param('id');
        $pdo = Database::getConnection();
        $userId = Auth::id() ?? 1;

        $stmt = $pdo->prepare("SELECT * FROM class_sessions WHERE id = ?");
        $stmt->execute([$id]);
        $session = $stmt->fetch();

        if (!$session) {
            Response::error('Class session not found.', 'NOT_FOUND', 404);
        }

        $reason = (string)$request->input('miss_reason', 'Other');
        $missNotes = $request->input('miss_notes');

        $upd = $pdo->prepare("
            UPDATE class_sessions SET
                status = 'MISSED',
                miss_reason = ?,
                miss_notes = ?,
                updated_by = ?
            WHERE id = ?
        ");
        $upd->execute([$reason, $missNotes, $userId, $id]);

        if (!empty($session['activity_id'])) {
            $actUpd = $pdo->prepare("UPDATE activities SET status = 'MISSED', updated_by = ? WHERE id = ?");
            $actUpd->execute([$userId, $session['activity_id']]);
        }

        Audit::log('class_session.missed', 'class_session', $id, $session, [
            'reason' => $reason,
            'notes' => $missNotes
        ]);

        Response::json([
            'message' => 'Class session marked as missed with reason preserved in history.'
        ]);
    }

    public function reschedule(Request $request): void {
        $id = (int)$request->param('id');
        $pdo = Database::getConnection();
        $userId = Auth::id() ?? 1;

        $stmt = $pdo->prepare("
            SELECT cs.*, c.title as course_title 
            FROM class_sessions cs 
            JOIN courses c ON cs.course_id = c.id 
            WHERE cs.id = ?
        ");
        $stmt->execute([$id]);
        $session = $stmt->fetch();

        if (!$session) {
            Response::error('Class session not found.', 'NOT_FOUND', 404);
        }

        $newDate = (string)$request->input('new_date', '');
        $newStartTime = (string)$request->input('new_start_time', $session['start_time']);
        $newEndTime = (string)$request->input('new_end_time', $session['end_time']);
        $reason = (string)$request->input('reschedule_reason', 'Rescheduled');

        if (empty($newDate)) {
            Response::error('New date is required for rescheduling.', 'VALIDATION_ERROR', 422);
        }

        // 1. Create new Activity for the rescheduled session
        $actStmt = $pdo->prepare("
            INSERT INTO activities (
                user_id, type, title, date, start_time, end_time,
                status, priority, source, notes, created_by
            ) VALUES (
                ?, 'CLASS', ?, ?, ?, ?,
                'CONFIRMED', 'HIGH', 'RESCHEDULED', ?, ?
            )
        ");
        $newTitle = "{$session['course_title']} - Class #{$session['session_no']} (Rescheduled)";
        $actStmt->execute([
            $userId, $newTitle, $newDate, $newStartTime, $newEndTime,
            "Rescheduled from {$session['date']}. Reason: $reason", $userId
        ]);
        $newActivityId = (int)$pdo->lastInsertId();

        // 2. Create the new Class Session record
        $newSessStmt = $pdo->prepare("
            INSERT INTO class_sessions (
                course_id, activity_id, session_no, date, start_time, end_time,
                status, topic, lesson_title, teacher_notes, created_by
            ) VALUES (
                ?, ?, ?, ?, ?, ?,
                'PENDING', ?, ?, ?, ?
            )
        ");
        $newSessStmt->execute([
            $session['course_id'], $newActivityId, $session['session_no'],
            $newDate, $newStartTime, $newEndTime,
            $session['topic'], $session['lesson_title'],
            "Rescheduled from {$session['date']}. Reason: $reason",
            $userId
        ]);
        $newSessionId = (int)$pdo->lastInsertId();

        // 3. Mark original session as RESCHEDULED with link to new session
        $origUpd = $pdo->prepare("
            UPDATE class_sessions SET
                status = 'RESCHEDULED',
                rescheduled_to_session_id = ?,
                miss_notes = ?,
                updated_by = ?
            WHERE id = ?
        ");
        $origUpd->execute([$newSessionId, "Rescheduled to $newDate. Reason: $reason", $userId, $id]);

        if (!empty($session['activity_id'])) {
            $actOrigUpd = $pdo->prepare("UPDATE activities SET status = 'RESCHEDULED', updated_by = ? WHERE id = ?");
            $actOrigUpd->execute([$userId, $session['activity_id']]);
        }

        Audit::log('class_session.rescheduled', 'class_session', $id, $session, [
            'new_date' => $newDate,
            'new_session_id' => $newSessionId,
            'reason' => $reason
        ]);

        Response::json([
            'message' => 'Class session rescheduled successfully.',
            'new_session_id' => $newSessionId
        ]);
    }

    public function update(Request $request): void {
        $id = (int)$request->param('id');
        $pdo = Database::getConnection();
        $userId = Auth::id() ?? 1;

        $stmt = $pdo->prepare("SELECT * FROM class_sessions WHERE id = ?");
        $stmt->execute([$id]);
        $session = $stmt->fetch();

        if (!$session) {
            Response::error('Class session not found.', 'NOT_FOUND', 404);
        }

        $sessionNo = (int)$request->input('session_no', $session['session_no']);
        $date = (string)$request->input('date', $session['date']);
        $startTime = (string)$request->input('start_time', $session['start_time']);
        if (strlen($startTime) === 5) $startTime .= ':00';
        $endTime = (string)$request->input('end_time', $session['end_time']);
        if (strlen($endTime) === 5) $endTime .= ':00';
        $lessonTitle = (string)$request->input('lesson_title', $session['lesson_title']);
        $topic = (string)$request->input('topic', $session['topic']);
        $coveredContent = $request->input('covered_content', $session['covered_content']);
        $teacherNotes = $request->input('teacher_notes', $session['teacher_notes']);
        $homework = $request->input('homework', $session['homework']);
        $status = (string)$request->input('status', $session['status']);

        $upd = $pdo->prepare("
            UPDATE class_sessions SET
                session_no = ?,
                date = ?,
                start_time = ?,
                end_time = ?,
                lesson_title = ?,
                topic = ?,
                covered_content = ?,
                teacher_notes = ?,
                homework = ?,
                status = ?,
                updated_by = ?
            WHERE id = ?
        ");
        $upd->execute([
            $sessionNo, $date, $startTime, $endTime,
            $lessonTitle, $topic, $coveredContent,
            $teacherNotes, $homework, $status,
            $userId, $id
        ]);

        if (!empty($session['activity_id'])) {
            $actUpd = $pdo->prepare("
                UPDATE activities SET
                    date = ?,
                    start_time = ?,
                    end_time = ?,
                    topic = ?,
                    status = ?,
                    updated_by = ?
                WHERE id = ?
            ");
            $actStatus = ($status === 'COMPLETED') ? 'COMPLETED' : (($status === 'CANCELLED') ? 'CANCELLED' : 'CONFIRMED');
            $actUpd->execute([$date, $startTime, $endTime, $topic, $actStatus, $userId, $session['activity_id']]);
        }

        Audit::log('class_session.updated', 'class_session', $id, $session, [
            'session_no' => $sessionNo,
            'date' => $date,
            'lesson_title' => $lessonTitle
        ]);

        Response::json([
            'message' => 'Class session updated successfully.'
        ]);
    }

    public function destroy(Request $request): void {
        $id = (int)$request->param('id');
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("SELECT * FROM class_sessions WHERE id = ?");
        $stmt->execute([$id]);
        $session = $stmt->fetch();

        if (!$session) {
            Response::error('Class session not found.', 'NOT_FOUND', 404);
        }

        if (!empty($session['activity_id'])) {
            $delAct = $pdo->prepare("DELETE FROM activities WHERE id = ?");
            $delAct->execute([$session['activity_id']]);
        }

        $delSess = $pdo->prepare("DELETE FROM class_sessions WHERE id = ?");
        $delSess->execute([$id]);

        Response::json([
            'message' => 'Class session deleted successfully.'
        ]);
    }
}
