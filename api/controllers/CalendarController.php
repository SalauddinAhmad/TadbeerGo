<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Database;
use App\Core\Request;
use App\Core\Response;
use PDO;

class CalendarController {
    public function events(Request $request): void {
        $pdo = Database::getConnection();
        $isOwner = Auth::isOwner();

        // FullCalendar passes ISO strings or YYYY-MM-DD
        $start = $request->query('start');
        $end = $request->query('end');
        $type = $request->query('type');

        if (!$start || !$end) {
            $start = date('Y-m-01');
            $end = date('Y-m-t');
        } else {
            $start = substr($start, 0, 10);
            $end = substr($end, 0, 10);
        }

        $sql = "
            SELECT a.*, c.name as contact_name, o.name as organization_name
            FROM activities a
            LEFT JOIN contacts c ON a.contact_id = c.id
            LEFT JOIN organizations o ON a.organization_id = o.id
            WHERE a.date >= ? AND a.date <= ?
              AND a.status != 'CANCELLED'
        ";
        $params = [$start, $end];

        if (!$isOwner) {
            $sql .= " AND a.is_private = 0";
        }

        if (!empty($type) && $type !== 'ALL') {
            $sql .= " AND a.type = ?";
            $params[] = $type;
        }

        $sql .= " ORDER BY a.date ASC, a.start_time ASC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $activities = $stmt->fetchAll();

        // Color mapping for scholarly/calm visual clarity
        $colorMap = [
            'CLASS' => ['bg' => '#0284c7', 'border' => '#0369a1', 'text' => '#ffffff'],     // Blue
            'JUMUAH' => ['bg' => '#059669', 'border' => '#047857', 'text' => '#ffffff'],    // Emerald Green
            'KHUTBAH' => ['bg' => '#0d9488', 'border' => '#0f766e', 'text' => '#ffffff'],   // Teal
            'LECTURE' => ['bg' => '#7c3aed', 'border' => '#6d28d9', 'text' => '#ffffff'],   // Purple
            'PROGRAMME' => ['bg' => '#d97706', 'border' => '#b45309', 'text' => '#ffffff'], // Amber
            'MEETING' => ['bg' => '#475569', 'border' => '#334155', 'text' => '#ffffff'],   // Slate
            'TRAVEL' => ['bg' => '#ea580c', 'border' => '#c2410c', 'text' => '#ffffff'],    // Orange
            'PERSONAL' => ['bg' => '#4f46e5', 'border' => '#4338ca', 'text' => '#ffffff'],  // Indigo
            'PREPARATION' => ['bg' => '#0891b2', 'border' => '#0e7490', 'text' => '#ffffff'],
            'TASK' => ['bg' => '#64748b', 'border' => '#475569', 'text' => '#ffffff'],
            'OTHER' => ['bg' => '#6b7280', 'border' => '#4b5563', 'text' => '#ffffff'],
        ];

        $calendarEvents = [];
        foreach ($activities as $act) {
            $typeColors = $colorMap[$act['type']] ?? $colorMap['OTHER'];

            $startIso = $act['date'];
            $endIso = $act['date'];
            $allDay = true;

            if (!empty($act['start_time'])) {
                $startIso = $act['date'] . 'T' . $act['start_time'];
                $allDay = false;
                if (!empty($act['end_time'])) {
                    $endIso = $act['date'] . 'T' . $act['end_time'];
                } else {
                    $endIso = date('Y-m-d\TH:i:s', strtotime('+1 hour', strtotime($startIso)));
                }
            }

            $calendarEvents[] = [
                'id' => (string)$act['id'],
                'title' => $act['title'],
                'start' => $startIso,
                'end' => $endIso,
                'allDay' => $allDay,
                'backgroundColor' => $typeColors['bg'],
                'borderColor' => $typeColors['border'],
                'textColor' => $typeColors['text'],
                'extendedProps' => [
                    'type' => $act['type'],
                    'status' => $act['status'],
                    'priority' => $act['priority'],
                    'location' => $act['location'],
                    'topic' => $act['topic'],
                    'contact' => $act['contact_name'],
                    'is_private' => (bool)$act['is_private']
                ]
            ];
        }

        Response::json([
            'events' => $calendarEvents
        ]);
    }
}
