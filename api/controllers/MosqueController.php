<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Audit;
use App\Core\Database;
use App\Core\Request;
use App\Core\Response;

class MosqueController {
    public function index(Request $request): void {
        $pdo = Database::getConnection();
        $search = $request->query('q');

        $sql = "SELECT * FROM mosques WHERE 1=1";
        $params = [];

        if (!empty($search)) {
            $sql .= " AND (name LIKE ? OR district LIKE ? OR contact_person LIKE ?)";
            $term = "%$search%";
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        $sql .= " ORDER BY name ASC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $mosques = $stmt->fetchAll();

        Response::json([
            'mosques' => $mosques
        ]);
    }

    public function show(Request $request): void {
        $id = (int)$request->param('id');
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("SELECT * FROM mosques WHERE id = ?");
        $stmt->execute([$id]);
        $mosque = $stmt->fetch();

        if (!$mosque) {
            Response::error('Mosque not found.', 'NOT_FOUND', 404);
        }

        // Fetch past Jumu'ah history at this mosque
        $histStmt = $pdo->prepare("
            SELECT date, status, khutbah_topic, notes
            FROM jumua_events
            WHERE mosque_id = ?
            ORDER BY date DESC
            LIMIT 10
        ");
        $histStmt->execute([$id]);
        $mosque['past_events'] = $histStmt->fetchAll();

        Response::json([
            'mosque' => $mosque
        ]);
    }

    public function store(Request $request): void {
        $pdo = Database::getConnection();
        $name = trim((string)$request->input('name', ''));
        $address = $request->input('address');
        $district = $request->input('district', 'Dhaka');
        $mapsUrl = $request->input('maps_url');
        $contactPerson = $request->input('contact_person');
        $phone = $request->input('phone');
        $whatsapp = $request->input('whatsapp');
        $notes = $request->input('notes');

        if (empty($name)) {
            Response::error('Mosque name is required.', 'VALIDATION_ERROR', 422);
        }

        $stmt = $pdo->prepare("
            INSERT INTO mosques (
                name, address, district, maps_url,
                contact_person, phone, whatsapp, notes
            ) VALUES (
                ?, ?, ?, ?,
                ?, ?, ?, ?
            )
        ");
        $stmt->execute([
            $name, $address, $district, $mapsUrl,
            $contactPerson, $phone, $whatsapp, $notes
        ]);

        $id = (int)$pdo->lastInsertId();
        Audit::log('mosque.created', 'mosque', $id, null, ['name' => $name]);

        // Auto-save into Contacts Directory if phone is provided
        if (!empty($phone)) {
            ContactController::autoSyncContact(
                $pdo,
                $contactPerson ?: ($name . ' মুতাওয়াল্লী'),
                (string)$phone,
                $address ?: $district,
                "মুতাওয়াল্লী / মসজিদ প্রতিনিধি - $name",
                "মসজিদ ডিরেক্টরি: $name"
            );
        }

        Response::json([
            'id' => $id,
            'message' => 'Mosque added successfully.'
        ], 201);
    }
}
