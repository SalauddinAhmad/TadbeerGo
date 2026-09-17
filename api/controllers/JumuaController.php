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

class JumuaController {
    public function monthlyOverview(Request $request): void {
        $pdo = Database::getConnection();

        $year = (int)$request->query('year', date('Y'));
        $month = (int)$request->query('month', date('n'));

        // Calculate all Fridays in the requested month
        $fridays = $this->getFridaysInMonth($year, $month);

        if (empty($fridays)) {
            Response::json(['fridays' => []]);
            return;
        }

        $placeholders = implode(',', array_fill(0, count($fridays), '?'));
        $stmt = $pdo->prepare("
            SELECT j.*, m.name as mosque_name, m.address as mosque_address, m.maps_url as mosque_maps_url
            FROM jumua_events j
            LEFT JOIN mosques m ON j.mosque_id = m.id
            WHERE j.date IN ($placeholders)
        ");
        $stmt->execute($fridays);
        $existing = [];
        foreach ($stmt->fetchAll() as $row) {
            $existing[$row['date']] = $row;
        }

        $result = [];
        $fridayIndex = 1;
        foreach ($fridays as $fDate) {
            if (isset($existing[$fDate])) {
                $item = $existing[$fDate];
                $item['friday_number'] = $fridayIndex++;
                $result[] = $item;
            } else {
                $result[] = [
                    'id' => null,
                    'date' => $fDate,
                    'friday_number' => $fridayIndex++,
                    'mosque_id' => null,
                    'mosque_name' => null,
                    'mosque_address' => null,
                    'contact_person' => null,
                    'phone' => null,
                    'status' => 'FREE',
                    'khutbah_topic' => null,
                    'notes' => 'Free Friday (Available for booking)',
                    'preparation_status' => 'NOT_STARTED'
                ];
            }
        }

        Response::json([
            'year' => $year,
            'month' => $month,
            'fridays' => $result
        ]);
    }

    public function book(Request $request): void {
        $pdo = Database::getConnection();
        $userId = Auth::id() ?? 1;

        $date = (string)$request->input('date', '');
        $mosqueId = $request->input('mosque_id') ? (int)$request->input('mosque_id') : null;
        $customMosqueName = trim((string)$request->input('custom_mosque_name', ''));
        $mosqueAddress = trim((string)$request->input('mosque_address', ''));
        $mosqueMapsUrl = trim((string)$request->input('mosque_maps_url', ''));
        $contactPerson = $request->input('contact_person');
        $phone = $request->input('phone');
        $status = (string)$request->input('status', 'CONFIRMED');
        $khutbahTopic = $request->input('khutbah_topic');
        $notes = $request->input('notes');

        if (empty($date)) {
            Response::error('Date is required.', 'VALIDATION_ERROR', 422);
        }

        // Verify date is Friday
        $dt = new DateTime($date);
        if ($dt->format('N') !== '5') {
            Response::error('Selected date is not a Friday.', 'VALIDATION_ERROR', 422);
        }

        // Handle cancellation / resetting to FREE
        if ($status === 'FREE') {
            $stmt = $pdo->prepare("
                UPDATE jumua_events
                SET mosque_id = NULL, contact_person = NULL, phone = NULL, status = 'FREE',
                    khutbah_topic = NULL, notes = 'Free Friday (Available for booking)', updated_by = ?
                WHERE date = ?
            ");
            $stmt->execute([$userId, $date]);

            // Also delete any JUMUAH activity for this date
            $actDel = $pdo->prepare("DELETE FROM activities WHERE date = ? AND type = 'JUMUAH'");
            $actDel->execute([$date]);

            Audit::log('jumua.cancelled', 'jumua_event', null, null, ['date' => $date]);

            Response::json([
                'message' => "Jumu'ah for $date marked as free/available."
            ]);
            return;
        }

        // Handle custom mosque name if not selecting from existing list
        $mosqueName = 'Local Mosque';
        if (empty($mosqueId) && !empty($customMosqueName)) {
            $checkStmt = $pdo->prepare("SELECT id, name FROM mosques WHERE name = ? LIMIT 1");
            $checkStmt->execute([$customMosqueName]);
            $existingMosque = $checkStmt->fetch();
            if ($existingMosque) {
                $mosqueId = (int)$existingMosque['id'];
                $mosqueName = $existingMosque['name'];
            } else {
                $createM = $pdo->prepare("
                    INSERT INTO mosques (name, address, maps_url, contact_person, phone)
                    VALUES (?, ?, ?, ?, ?)
                ");
                $createM->execute([
                    $customMosqueName,
                    $mosqueAddress ?: 'Dhaka',
                    $mosqueMapsUrl ?: null,
                    $contactPerson,
                    $phone
                ]);
                $mosqueId = (int)$pdo->lastInsertId();
                $mosqueName = $customMosqueName;
            }
        } elseif ($mosqueId) {
            $mStmt = $pdo->prepare("SELECT name, address FROM mosques WHERE id = ?");
            $mStmt->execute([$mosqueId]);
            $m = $mStmt->fetch();
            if ($m) {
                $mosqueName = $m['name'];
                // Update address or maps_url if provided
                if (!empty($mosqueAddress) || !empty($mosqueMapsUrl)) {
                    $updM = $pdo->prepare("UPDATE mosques SET address = COALESCE(NULLIF(?, ''), address), maps_url = COALESCE(NULLIF(?, ''), maps_url) WHERE id = ?");
                    $updM->execute([$mosqueAddress, $mosqueMapsUrl, $mosqueId]);
                }
            }
        }

        // 1. Create or sync Activity
        $actTitle = "Jumu'ah Khutbah - $mosqueName";
        $actStmt = $pdo->prepare("
            INSERT INTO activities (
                user_id, type, title, date, start_time, end_time,
                location, topic, status, priority, preparation_required, source, created_by
            ) VALUES (
                ?, 'JUMUAH', ?, ?, '12:30:00', '14:00:00',
                ?, ?, ?, 'HIGH', 1, 'JUMUA_PLANNER', ?
            )
        ");
        $actStmt->execute([
            $userId, $actTitle, $date, $mosqueName, $khutbahTopic, $status, $userId
        ]);
        $activityId = (int)$pdo->lastInsertId();

        // 2. Insert or update jumua_events
        $stmt = $pdo->prepare("
            INSERT INTO jumua_events (
                date, mosque_id, contact_person, phone, status,
                khutbah_topic, notes, activity_id, created_by
            ) VALUES (
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?
            )
            ON DUPLICATE KEY UPDATE
                mosque_id = VALUES(mosque_id),
                contact_person = VALUES(contact_person),
                phone = VALUES(phone),
                status = VALUES(status),
                khutbah_topic = VALUES(khutbah_topic),
                notes = VALUES(notes),
                activity_id = VALUES(activity_id),
                updated_by = VALUES(created_by)
        ");
        $stmt->execute([
            $date, $mosqueId, $contactPerson, $phone, $status,
            $khutbahTopic, $notes, $activityId, $userId
        ]);

        Audit::log('jumua.booked', 'jumua_event', null, null, [
            'date' => $date,
            'mosque_id' => $mosqueId,
            'topic' => $khutbahTopic
        ]);

        // 3. Auto-save into Contacts Directory
        if (!empty($phone)) {
            ContactController::autoSyncContact(
                $pdo,
                $contactPerson ?: ($mosqueName . ' মুতাওয়াল্লী'),
                (string)$phone,
                $mosqueAddress ?: 'ঢাকা',
                "মুতাওয়াল্লী / জুমু'আ দায়িত্বপ্রাপ্ত - $mosqueName",
                "মসজিদ: $mosqueName (জুমু'আ খুতবাহ সূচি $date)"
            );
        }

        Response::json([
            'message' => "Jumu'ah for $date booked successfully."
        ]);
    }

    private function getFridaysInMonth(int $year, int $month): array {
        $fridays = [];
        $startDate = new DateTime(sprintf('%04d-%02d-01', $year, $month));
        $endDate = clone $startDate;
        $endDate->modify('last day of this month');

        while ($startDate <= $endDate) {
            if ($startDate->format('N') === '5') {
                $fridays[] = $startDate->format('Y-m-d');
            }
            $startDate->add(new DateInterval('P1D'));
        }
        return $fridays;
    }
}
