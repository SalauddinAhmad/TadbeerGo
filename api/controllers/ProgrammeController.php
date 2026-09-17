<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Audit;
use App\Core\Database;
use App\Core\Request;
use App\Core\Response;
use PDO;

class ProgrammeController {
    public function index(Request $request): void {
        $pdo = Database::getConnection();
        $status = $request->query('status');
        $search = $request->query('q');

        $sql = "
            SELECT p.*, o.name as organizer_name,
                   (SELECT COUNT(*) FROM programme_preparations pp WHERE pp.programme_id = p.id) as total_prep_tasks,
                   (SELECT COUNT(*) FROM programme_preparations pp WHERE pp.programme_id = p.id AND pp.status = 'COMPLETED') as completed_prep_tasks
            FROM programmes p
            LEFT JOIN organizations o ON p.organizer_id = o.id
            WHERE 1=1
        ";
        $params = [];

        if (!empty($status) && $status !== 'ALL') {
            $sql .= " AND p.status = ?";
            $params[] = $status;
        }

        if (!empty($search)) {
            $sql .= " AND (p.title LIKE ? OR p.venue LIKE ? OR p.topic LIKE ?)";
            $term = "%$search%";
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        $sql .= " ORDER BY p.date ASC, p.start_time ASC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $programmes = $stmt->fetchAll();

        Response::json([
            'programmes' => $programmes
        ]);
    }

    public function show(Request $request): void {
        $id = (int)$request->param('id');
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("
            SELECT p.*, o.name as organizer_name, o.phone as organizer_phone
            FROM programmes p
            LEFT JOIN organizations o ON p.organizer_id = o.id
            WHERE p.id = ?
        ");
        $stmt->execute([$id]);
        $programme = $stmt->fetch();

        if (!$programme) {
            Response::error('Programme not found.', 'NOT_FOUND', 404);
        }

        // Fetch preparation tasks
        $prepStmt = $pdo->prepare("SELECT * FROM programme_preparations WHERE programme_id = ? ORDER BY id ASC");
        $prepStmt->execute([$id]);
        $programme['preparations'] = $prepStmt->fetchAll();

        Response::json([
            'programme' => $programme
        ]);
    }

    public function store(Request $request): void {
        $pdo = Database::getConnection();
        $userId = Auth::id() ?? 1;

        $title = trim((string)$request->input('title', ''));
        $programmeType = (string)$request->input('programme_type', 'Lecture');
        $date = (string)$request->input('date', '');
        $startTime = $request->input('start_time');
        $endTime = $request->input('end_time');
        $venue = $request->input('venue');
        $location = $request->input('location');
        $mapsUrl = $request->input('maps_url');
        $organizerId = $request->input('organizer_id') ? (int)$request->input('organizer_id') : null;
        $contactPerson = $request->input('contact_person');
        $phone = $request->input('phone');
        $whatsapp = $request->input('whatsapp');
        $topic = $request->input('topic');
        $audienceType = $request->input('audience_type');
        $description = $request->input('description');
        $status = (string)$request->input('status', 'PENDING');
        $prepRequired = $request->input('preparation_required') ? 1 : 0;
        $travelRequired = $request->input('travel_required') ? 1 : 0;
        $notes = $request->input('notes');

        if (empty($title) || empty($date)) {
            Response::error('Programme title and date are required.', 'VALIDATION_ERROR', 422);
        }

        // 1. Create synced Activity
        $actStmt = $pdo->prepare("
            INSERT INTO activities (
                user_id, type, title, description, date, start_time, end_time,
                location, topic, status, priority, preparation_required, travel_required,
                source, created_by
            ) VALUES (
                ?, 'PROGRAMME', ?, ?, ?, ?, ?,
                ?, ?, ?, 'HIGH', ?, ?,
                'PROGRAMME_MODULE', ?
            )
        ");
        $actStmt->execute([
            $userId, $title, $description, $date, $startTime, $endTime,
            $venue ?: $location, $topic, $status, $prepRequired, $travelRequired,
            $userId
        ]);
        $activityId = (int)$pdo->lastInsertId();

        // 2. Insert Programme
        $stmt = $pdo->prepare("
            INSERT INTO programmes (
                title, programme_type, date, start_time, end_time,
                venue, location, maps_url, organizer_id, contact_person, phone, whatsapp,
                topic, audience_type, description, status,
                preparation_required, travel_required, notes, activity_id, created_by
            ) VALUES (
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?, ?
            )
        ");
        $stmt->execute([
            $title, $programmeType, $date, $startTime, $endTime,
            $venue, $location, $mapsUrl, $organizerId, $contactPerson, $phone, $whatsapp,
            $topic, $audienceType, $description, $status,
            $prepRequired, $travelRequired, $notes, $activityId, $userId
        ]);
        $programmeId = (int)$pdo->lastInsertId();

        // Auto-add default prep tasks if preparation required
        if ($prepRequired) {
            $tasks = [
                'Prepare lecture notes and key reference ayahs/hadith',
                'Verify venue sound system and travel route'
            ];
            $prepIns = $pdo->prepare("INSERT INTO programme_preparations (programme_id, title) VALUES (?, ?)");
            foreach ($tasks as $t) {
                $prepIns->execute([$programmeId, $t]);
            }
        }

        Audit::log('programme.created', 'programme', $programmeId, null, [
            'title' => $title,
            'date' => $date,
            'status' => $status
        ]);

        // Auto-save into Contacts Directory
        if (!empty($phone)) {
            ContactController::autoSyncContact(
                $pdo,
                $contactPerson ?: $title . ' আয়োজক',
                (string)$phone,
                $venue ?: $location,
                'কর্মসূচি / লেকচার সমন্বয়কারী',
                "কর্মসূচি: $title ($date)"
            );
        }

        Response::json([
            'id' => $programmeId,
            'message' => 'Programme recorded successfully.'
        ], 201);
    }

    public function update(Request $request): void {
        $id = (int)$request->param('id');
        $pdo = Database::getConnection();
        $userId = Auth::id() ?? 1;

        $stmt = $pdo->prepare("SELECT * FROM programmes WHERE id = ?");
        $stmt->execute([$id]);
        $programme = $stmt->fetch();

        if (!$programme) {
            Response::error('Programme not found.', 'NOT_FOUND', 404);
        }

        $title = trim((string)$request->input('title', $programme['title']));
        $programmeType = (string)$request->input('programme_type', $programme['programme_type']);
        $date = (string)$request->input('date', $programme['date']);
        $startTime = $request->input('start_time', $programme['start_time']);
        $endTime = $request->input('end_time', $programme['end_time']);
        $venue = $request->input('venue', $programme['venue']);
        $location = $request->input('location', $programme['location']);
        $mapsUrl = $request->input('maps_url', $programme['maps_url']);
        $organizerId = $request->input('organizer_id') !== null ? (int)$request->input('organizer_id') : $programme['organizer_id'];
        $contactPerson = $request->input('contact_person', $programme['contact_person']);
        $phone = $request->input('phone', $programme['phone']);
        $whatsapp = $request->input('whatsapp', $programme['whatsapp']);
        $topic = $request->input('topic', $programme['topic']);
        $audienceType = $request->input('audience_type', $programme['audience_type']);
        $description = $request->input('description', $programme['description']);
        $status = (string)$request->input('status', $programme['status']);
        $prepRequired = $request->has('preparation_required') ? ($request->input('preparation_required') ? 1 : 0) : $programme['preparation_required'];
        $travelRequired = $request->has('travel_required') ? ($request->input('travel_required') ? 1 : 0) : $programme['travel_required'];
        $notes = $request->input('notes', $programme['notes']);

        $upd = $pdo->prepare("
            UPDATE programmes SET
                title = ?, programme_type = ?, date = ?, start_time = ?, end_time = ?,
                venue = ?, location = ?, maps_url = ?, organizer_id = ?, contact_person = ?,
                phone = ?, whatsapp = ?, topic = ?, audience_type = ?, description = ?,
                status = ?, preparation_required = ?, travel_required = ?, notes = ?, updated_by = ?
            WHERE id = ?
        ");
        $upd->execute([
            $title, $programmeType, $date, $startTime, $endTime,
            $venue, $location, $mapsUrl, $organizerId, $contactPerson,
            $phone, $whatsapp, $topic, $audienceType, $description,
            $status, $prepRequired, $travelRequired, $notes, $userId, $id
        ]);

        if (!empty($programme['activity_id'])) {
            $actUpd = $pdo->prepare("
                UPDATE activities SET
                    title = ?, description = ?, date = ?, start_time = ?, end_time = ?,
                    location = ?, topic = ?, status = ?, preparation_required = ?, travel_required = ?, updated_by = ?
                WHERE id = ?
            ");
            $actUpd->execute([
                $title, $description, $date, $startTime, $endTime,
                $venue ?: $location, $topic, $status, $prepRequired, $travelRequired, $userId, $programme['activity_id']
            ]);
        }

        Audit::log('programme.updated', 'programme', $id, $programme, [
            'title' => $title,
            'date' => $date,
            'status' => $status
        ]);

        // Auto-save / update into Contacts Directory
        if (!empty($phone)) {
            ContactController::autoSyncContact(
                $pdo,
                $contactPerson ?: $title . ' আয়োজক',
                (string)$phone,
                $venue ?: $location,
                'কর্মসূচি / লেকচার সমন্বয়কারী',
                "কর্মসূচি: $title ($date)"
            );
        }

        Response::json([
            'message' => 'Programme updated successfully.'
        ]);
    }

    public function destroy(Request $request): void {
        $id = (int)$request->param('id');
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("SELECT * FROM programmes WHERE id = ?");
        $stmt->execute([$id]);
        $programme = $stmt->fetch();

        if (!$programme) {
            Response::error('Programme not found.', 'NOT_FOUND', 404);
        }

        if (!empty($programme['activity_id'])) {
            $delAct = $pdo->prepare("DELETE FROM activities WHERE id = ?");
            $delAct->execute([$programme['activity_id']]);
        }

        $delPrep = $pdo->prepare("DELETE FROM programme_preparations WHERE programme_id = ?");
        $delPrep->execute([$id]);

        $delProg = $pdo->prepare("DELETE FROM programmes WHERE id = ?");
        $delProg->execute([$id]);

        Response::json([
            'message' => 'Programme and its preparation tasks deleted successfully.'
        ]);
    }

    public function updateStatus(Request $request): void {
        $id = (int)$request->param('id');
        $pdo = Database::getConnection();
        $userId = Auth::id() ?? 1;

        $stmt = $pdo->prepare("SELECT * FROM programmes WHERE id = ?");
        $stmt->execute([$id]);
        $programme = $stmt->fetch();

        if (!$programme) {
            Response::error('Programme not found.', 'NOT_FOUND', 404);
        }

        $newStatus = (string)$request->input('status', '');
        if (!in_array($newStatus, ['DRAFT', 'INVITED', 'PENDING', 'CONFIRMED', 'RESCHEDULED', 'CANCELLED', 'COMPLETED'], true)) {
            Response::error('Invalid programme status.', 'VALIDATION_ERROR', 422);
        }

        $upd = $pdo->prepare("UPDATE programmes SET status = ?, updated_by = ? WHERE id = ?");
        $upd->execute([$newStatus, $userId, $id]);

        if (!empty($programme['activity_id'])) {
            $actUpd = $pdo->prepare("UPDATE activities SET status = ?, updated_by = ? WHERE id = ?");
            $actUpd->execute([$newStatus, $userId, $programme['activity_id']]);
        }

        Audit::log('programme.status_changed', 'programme', $id, ['status' => $programme['status']], ['status' => $newStatus]);

        Response::json([
            'message' => "Programme status updated to {$newStatus}."
        ]);
    }

    public function addPrepItem(Request $request): void {
        $id = (int)$request->param('id');
        $pdo = Database::getConnection();

        $title = trim((string)$request->input('title', ''));
        if (empty($title)) {
            Response::error('Title is required.', 'VALIDATION_ERROR', 422);
        }

        $stmt = $pdo->prepare("INSERT INTO programme_preparations (programme_id, title) VALUES (?, ?)");
        $stmt->execute([$id, $title]);

        Response::json([
            'id' => (int)$pdo->lastInsertId(),
            'message' => 'Preparation task added.'
        ]);
    }

    public function togglePrepItem(Request $request): void {
        $prepId = (int)$request->param('prepId');
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("SELECT status FROM programme_preparations WHERE id = ?");
        $stmt->execute([$prepId]);
        $curr = $stmt->fetchColumn();

        if (!$curr) {
            Response::error('Task not found.', 'NOT_FOUND', 404);
        }

        $newStatus = ($curr === 'COMPLETED') ? 'PENDING' : 'COMPLETED';
        $upd = $pdo->prepare("UPDATE programme_preparations SET status = ? WHERE id = ?");
        $upd->execute([$newStatus, $prepId]);

        Response::json([
            'status' => $newStatus,
            'message' => "Task marked as {$newStatus}."
        ]);
    }

    public function deletePrepItem(Request $request): void {
        $prepId = (int)$request->param('prepId');
        $pdo = Database::getConnection();

        $del = $pdo->prepare("DELETE FROM programme_preparations WHERE id = ?");
        $del->execute([$prepId]);

        Response::json([
            'message' => 'Preparation task removed.'
        ]);
    }
}
