<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Audit;
use App\Core\Database;
use App\Core\Request;
use App\Core\Response;
use PDO;

class ContactController {
    public function index(Request $request): void {
        $pdo = Database::getConnection();
        $search = $request->query('q');

        $sql = "
            SELECT c.*, o.name as organization_name
            FROM contacts c
            LEFT JOIN organizations o ON c.organization_id = o.id
            WHERE 1=1
        ";
        $params = [];

        if (!empty($search)) {
            $sql .= " AND (c.name LIKE ? OR c.phone LIKE ? OR c.designation LIKE ? OR c.address LIKE ? OR o.name LIKE ?)";
            $term = "%$search%";
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        $sql .= " ORDER BY c.is_important DESC, c.updated_at DESC, c.id DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $contacts = $stmt->fetchAll();

        Response::json([
            'contacts' => $contacts
        ]);
    }

    public function organizations(Request $request): void {
        $pdo = Database::getConnection();
        $stmt = $pdo->query("SELECT * FROM organizations ORDER BY name ASC");
        Response::json([
            'organizations' => $stmt->fetchAll()
        ]);
    }

    public function store(Request $request): void {
        $pdo = Database::getConnection();
        $name = trim((string)$request->input('name', ''));
        $designation = $request->input('designation');
        $orgId = $request->input('organization_id') ? (int)$request->input('organization_id') : null;
        $phone = $request->input('phone');
        $whatsapp = $request->input('whatsapp');
        $email = $request->input('email');
        $address = $request->input('address');
        $notes = $request->input('notes');
        $isImportant = $request->input('is_important') ? 1 : 0;

        if (empty($name)) {
            Response::error('Contact name is required.', 'VALIDATION_ERROR', 422);
        }

        $stmt = $pdo->prepare("
            INSERT INTO contacts (
                organization_id, name, designation, phone, whatsapp,
                email, address, notes, is_important, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ");
        $stmt->execute([
            $orgId, $name, $designation, $phone, $whatsapp,
            $email, $address, $notes, $isImportant
        ]);

        $id = (int)$pdo->lastInsertId();
        Audit::log('contact.created', 'contact', $id, null, ['name' => $name, 'phone' => $phone]);

        Response::json([
            'id' => $id,
            'message' => 'Contact saved successfully.'
        ], 201);
    }

    /**
     * Automatically saves or updates contact in Directory whenever a phone number with name/address is input
     */
    public static function autoSyncContact(
        PDO $pdo,
        ?string $name,
        ?string $phone,
        ?string $address = null,
        ?string $designation = null,
        ?string $notes = null
    ): ?int {
        $phone = trim((string)$phone);
        if (empty($phone)) {
            return null;
        }

        $name = trim((string)$name);
        if (empty($name)) {
            $name = 'সম্মানিত পরিচিতি (' . $phone . ')';
        }

        $address = trim((string)$address);
        $cleanPhone = preg_replace('/[^\d+]/', '', $phone);

        // Check if contact with this phone already exists in Directory
        $stmt = $pdo->prepare("
            SELECT id, name, address, designation, notes 
            FROM contacts 
            WHERE phone = ? OR phone = ? 
            LIMIT 1
        ");
        $stmt->execute([$phone, $cleanPhone]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            $contactId = (int)$existing['id'];
            // Update address, designation, notes if missing or new
            $updatedAddress = !empty($address) ? $address : $existing['address'];
            $updatedDesignation = !empty($designation) ? $designation : $existing['designation'];
            $updatedNotes = !empty($notes) 
                ? (empty($existing['notes']) ? $notes : $existing['notes'] . " | " . $notes) 
                : $existing['notes'];

            $upd = $pdo->prepare("
                UPDATE contacts 
                SET address = ?, designation = ?, notes = ?, updated_at = NOW() 
                WHERE id = ?
            ");
            $upd->execute([$updatedAddress, $updatedDesignation, $updatedNotes, $contactId]);
            return $contactId;
        }

        // Insert new contact directly into Directory!
        $ins = $pdo->prepare("
            INSERT INTO contacts (
                name, designation, phone, whatsapp, address, notes, is_important, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, 0, NOW(), NOW())
        ");
        $ins->execute([
            $name,
            $designation ?: 'স্বয়ংক্রিয়ভাবে সংরক্ষিত যোগাযোগ',
            $phone,
            $cleanPhone ?: $phone,
            $address ?: 'ঢাকা',
            $notes ?: 'ইনপুট ফর্ম থেকে স্বয়ংক্রিয়ভাবে ডিরেক্টরিতে সংরক্ষিত'
        ]);

        return (int)$pdo->lastInsertId();
    }
}
