<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Database;
use App\Core\Request;
use App\Core\Response;
use PDO;

class DashboardController {
    public function index(Request $request): void {
        $pdo = Database::getConnection();
        $isOwner = Auth::isOwner();
        $today = date('Y-m-d');
        $currentTime = date('H:i:s');

        // Privacy clause
        $privacySql = $isOwner ? "" : " AND a.is_private = 0";

        // 1. Current Activity (NOW)
        $nowStmt = $pdo->prepare("
            SELECT a.*, c.name as contact_name, o.name as organization_name
            FROM activities a
            LEFT JOIN contacts c ON a.contact_id = c.id
            LEFT JOIN organizations o ON a.organization_id = o.id
            WHERE a.date = ? 
              AND a.start_time <= ? 
              AND a.end_time >= ?
              AND a.status NOT IN ('CANCELLED', 'MISSED')
              $privacySql
            ORDER BY a.start_time ASC
            LIMIT 1
        ");
        $nowStmt->execute([$today, $currentTime, $currentTime]);
        $nowActivity = $nowStmt->fetch() ?: null;

        // 2. Next Activity (NEXT)
        if ($nowActivity) {
            $nextStmt = $pdo->prepare("
                SELECT a.*, c.name as contact_name, o.name as organization_name
                FROM activities a
                LEFT JOIN contacts c ON a.contact_id = c.id
                LEFT JOIN organizations o ON a.organization_id = o.id
                WHERE ((a.date = ? AND a.start_time > ?) OR (a.date > ?))
                  AND a.status NOT IN ('CANCELLED', 'MISSED', 'COMPLETED')
                  $privacySql
                ORDER BY a.date ASC, a.start_time ASC
                LIMIT 1
            ");
            $nextStmt->execute([$today, $nowActivity['end_time'], $today]);
        } else {
            $nextStmt = $pdo->prepare("
                SELECT a.*, c.name as contact_name, o.name as organization_name
                FROM activities a
                LEFT JOIN contacts c ON a.contact_id = c.id
                LEFT JOIN organizations o ON a.organization_id = o.id
                WHERE ((a.date = ? AND a.start_time > ?) OR (a.date > ?))
                  AND a.status NOT IN ('CANCELLED', 'MISSED', 'COMPLETED')
                  $privacySql
                ORDER BY a.date ASC, a.start_time ASC
                LIMIT 1
            ");
            $nextStmt->execute([$today, $currentTime, $today]);
        }
        $nextActivity = $nextStmt->fetch() ?: null;

        // 3. Today's Full Timeline
        $todayStmt = $pdo->prepare("
            SELECT a.*, c.name as contact_name, o.name as organization_name
            FROM activities a
            LEFT JOIN contacts c ON a.contact_id = c.id
            LEFT JOIN organizations o ON a.organization_id = o.id
            WHERE a.date = ?
              AND a.status != 'CANCELLED'
              $privacySql
            ORDER BY a.start_time ASC
        ");
        $todayStmt->execute([$today]);
        $todayActivities = $todayStmt->fetchAll();

        // 4. Upcoming Activities (Next 7 Days)
        $upcomingStmt = $pdo->prepare("
            SELECT a.*, c.name as contact_name, o.name as organization_name
            FROM activities a
            LEFT JOIN contacts c ON a.contact_id = c.id
            LEFT JOIN organizations o ON a.organization_id = o.id
            WHERE a.date > ? AND a.date <= DATE_ADD(?, INTERVAL 7 DAY)
              AND a.status NOT IN ('CANCELLED', 'COMPLETED')
              $privacySql
            ORDER BY a.date ASC, a.start_time ASC
            LIMIT 10
        ");
        $upcomingStmt->execute([$today, $today]);
        $upcomingActivities = $upcomingStmt->fetchAll();

        // 5. Needs Attention:
        // - Programmes awaiting confirmation or prep
        $needsAttention = [];

        $unconfirmedStmt = $pdo->query("
            SELECT id, title, date, start_time, status, venue, contact_person, phone
            FROM programmes
            WHERE status IN ('INVITED', 'PENDING') AND date >= '$today'
            ORDER BY date ASC
            LIMIT 5
        ");
        $unconfirmedProgrammes = $unconfirmedStmt->fetchAll();
        foreach ($unconfirmedProgrammes as $prog) {
            $needsAttention[] = [
                'type' => 'UNCONFIRMED_PROGRAMME',
                'title' => "Pending Confirmation: {$prog['title']}",
                'subtitle' => date('D, d M', strtotime($prog['date'])) . ($prog['venue'] ? " at {$prog['venue']}" : ""),
                'action_url' => "/programmes",
                'severity' => 'warning',
                'item_id' => $prog['id']
            ];
        }

        // - Pending Programme Preparations due soon
        $prepStmt = $pdo->query("
            SELECT pp.id, pp.title as task_title, p.title as programme_title, p.date
            FROM programme_preparations pp
            JOIN programmes p ON pp.programme_id = p.id
            WHERE pp.status = 'PENDING' AND p.date >= '$today'
            ORDER BY p.date ASC
            LIMIT 5
        ");
        $pendingPreps = $prepStmt->fetchAll();
        foreach ($pendingPreps as $prep) {
            $needsAttention[] = [
                'type' => 'PENDING_PREPARATION',
                'title' => "Preparation: {$prep['task_title']}",
                'subtitle' => "For: {$prep['programme_title']} (" . date('d M', strtotime($prep['date'])) . ")",
                'action_url' => "/programmes",
                'severity' => 'info',
                'item_id' => $prep['id']
            ];
        }

        // 6. Schedule Conflicts Detection for Next 14 Days
        $conflictStmt = $pdo->prepare("
            SELECT a1.id as id1, a1.title as title1, a1.date, a1.start_time as start1, a1.end_time as end1,
                   a2.id as id2, a2.title as title2, a2.start_time as start2, a2.end_time as end2
            FROM activities a1
            JOIN activities a2 ON a1.date = a2.date 
                              AND a1.id < a2.id
                              AND a1.status NOT IN ('CANCELLED', 'MISSED')
                              AND a2.status NOT IN ('CANCELLED', 'MISSED')
                              AND (
                                  (a1.start_time <= a2.start_time AND a1.end_time > a2.start_time) OR
                                  (a2.start_time <= a1.start_time AND a2.end_time > a1.start_time)
                              )
            WHERE a1.date >= ? AND a1.date <= DATE_ADD(?, INTERVAL 14 DAY)
            ORDER BY a1.date ASC
            LIMIT 5
        ");
        $conflictStmt->execute([$today, $today]);
        $conflicts = $conflictStmt->fetchAll();

        // 7. Upcoming Next Friday Jumu'ah
        $nextFridayDate = date('Y-m-d', strtotime('next friday', strtotime($today)));
        if (date('N', strtotime($today)) == 5) { // If today is Friday
            $nextFridayDate = $today;
        }

        $jumuaStmt = $pdo->prepare("
            SELECT j.*, m.name as mosque_name, m.address as mosque_address
            FROM jumua_events j
            LEFT JOIN mosques m ON j.mosque_id = m.id
            WHERE j.date = ?
            LIMIT 1
        ");
        $jumuaStmt->execute([$nextFridayDate]);
        $upcomingJumua = $jumuaStmt->fetch();

        if (!$upcomingJumua) {
            $upcomingJumua = [
                'date' => $nextFridayDate,
                'status' => 'FREE',
                'mosque_name' => null,
                'khutbah_topic' => null,
                'notes' => 'Open Friday schedule (Not yet booked)'
            ];
        }

        // 8. Stats
        $statsStmt = $pdo->query("
            SELECT
                (SELECT COUNT(*) FROM courses WHERE status = 'ACTIVE') as active_courses,
                (SELECT COUNT(*) FROM programmes WHERE status IN ('INVITED', 'PENDING')) as pending_programmes,
                (SELECT COUNT(*) FROM activities WHERE date = '$today' AND status NOT IN ('CANCELLED')) as today_activities_count,
                (SELECT COUNT(*) FROM notifications WHERE status = 'UNREAD') as unread_notifications
        ");
        $stats = $statsStmt->fetch() ?: [];

        Response::json([
            'now' => $nowActivity,
            'next' => $nextActivity,
            'today_timeline' => $todayActivities,
            'upcoming' => $upcomingActivities,
            'needs_attention' => $needsAttention,
            'conflicts' => $conflicts,
            'upcoming_jumua' => $upcomingJumua,
            'stats' => $stats,
            'meta' => [
                'current_time' => $currentTime,
                'today_date' => $today,
                'is_owner' => $isOwner
            ]
        ]);
    }
}
