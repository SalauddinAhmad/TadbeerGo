<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Database;
use App\Core\Request;
use App\Core\Response;
use PDO;

class UserManagementController {

    /** GET /api/users — list all team members */
    public function index(Request $request): void {
        $pdo = Database::getConnection();

        $stmt = $pdo->query("
            SELECT u.id, u.name, u.email, u.phone, u.avatar_url, u.status,
                   u.last_login_at, u.created_at,
                   r.name as role_name, r.display_name as role_display,
                   r.description as role_description, r.id as role_id
            FROM users u
            JOIN roles r ON u.role_id = r.id
            ORDER BY r.id ASC, u.name ASC
        ");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $rolesStmt = $pdo->query("SELECT id, name, display_name, description FROM roles ORDER BY id ASC");
        $roles = $rolesStmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json([
            'users' => $users,
            'roles' => $roles
        ]);
    }

    /** GET /api/users/permissions — permission map per role */
    public function permissions(Request $request): void {
        $permissionsMap = [
            'owner' => [
                'view_private'          => true,
                'manage_jumua'          => true,
                'manage_programmes'     => true,
                'manage_courses'        => true,
                'manage_contacts'       => true,
                'manage_users'          => true,
                'edit_schedule'         => true,
                'delete_items'          => true,
                'view_financials'       => true,
                'export_data'           => true,
            ],
            'admin' => [
                'view_private'          => true,
                'manage_jumua'          => true,
                'manage_programmes'     => true,
                'manage_courses'        => true,
                'manage_contacts'       => true,
                'manage_users'          => false,
                'edit_schedule'         => true,
                'delete_items'          => true,
                'view_financials'       => false,
                'export_data'           => true,
            ],
            'ps_admin' => [
                'view_private'          => false,
                'manage_jumua'          => true,
                'manage_programmes'     => true,
                'manage_courses'        => true,
                'manage_contacts'       => true,
                'manage_users'          => false,
                'edit_schedule'         => true,
                'delete_items'          => false,
                'view_financials'       => false,
                'export_data'           => true,
            ],
            'editor' => [
                'view_private'          => false,
                'manage_jumua'          => false,
                'manage_programmes'     => true,
                'manage_courses'        => true,
                'manage_contacts'       => true,
                'manage_users'          => false,
                'edit_schedule'         => false,
                'delete_items'          => false,
                'view_financials'       => false,
                'export_data'           => false,
            ],
            'viewer' => [
                'view_private'          => false,
                'manage_jumua'          => false,
                'manage_programmes'     => false,
                'manage_courses'        => false,
                'manage_contacts'       => false,
                'manage_users'          => false,
                'edit_schedule'         => false,
                'delete_items'          => false,
                'view_financials'       => false,
                'export_data'           => false,
            ],
        ];

        Response::json(['permissions' => $permissionsMap]);
    }

    /** POST /api/users — create new team member */
    public function store(Request $request): void {
        if (!Auth::isOwner()) {
            Response::error('Only the Scholar/Owner can manage team members.', 'FORBIDDEN', 403);
            return;
        }

        $pdo = Database::getConnection();
        $name     = trim((string)$request->input('name', ''));
        $email    = trim((string)$request->input('email', ''));
        $phone    = $request->input('phone');
        $roleId   = (int)$request->input('role_id', 2);
        $password = (string)$request->input('password', '');

        if (empty($name) || empty($email) || empty($password)) {
            Response::error('নাম, ইমেইল এবং পাসওয়ার্ড আবশ্যক।', 'VALIDATION_ERROR', 422);
            return;
        }

        // Check email uniqueness
        $chk = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $chk->execute([$email]);
        if ($chk->fetch()) {
            Response::error("এই ইমেইলে ইতোমধ্যে একটি অ্যাকাউন্ট আছে: $email", 'DUPLICATE_EMAIL', 409);
            return;
        }

        $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

        $stmt = $pdo->prepare("
            INSERT INTO users (role_id, name, email, phone, password_hash, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 'active', NOW(), NOW())
        ");
        $stmt->execute([$roleId, $name, $email, $phone, $hash]);

        $userId = (int)$pdo->lastInsertId();

        Response::json([
            'id'      => $userId,
            'message' => "টিম সদস্য '$name' সফলভাবে যুক্ত হয়েছেন।"
        ], 201);
    }

    /** PUT /api/users/{id} — update name, email, phone, role */
    public function update(Request $request): void {
        if (!Auth::isOwner()) {
            Response::error('Only the Scholar/Owner can manage team members.', 'FORBIDDEN', 403);
            return;
        }

        $id  = (int)$request->param('id');
        $pdo = Database::getConnection();

        // Owner cannot change their own role
        $currentUser = $pdo->prepare("SELECT role_id FROM users WHERE id = ?");
        $currentUser->execute([$id]);
        $target = $currentUser->fetch(PDO::FETCH_ASSOC);
        if (!$target) {
            Response::error('User not found.', 'NOT_FOUND', 404);
            return;
        }

        $name   = trim((string)$request->input('name', ''));
        $email  = trim((string)$request->input('email', ''));
        $phone  = $request->input('phone');
        $roleId = $request->input('role_id') ? (int)$request->input('role_id') : null;
        $status = $request->input('status');
        $newPassword = $request->input('new_password');

        // Build dynamic update
        $sets = [];
        $vals = [];

        if (!empty($name)) { $sets[] = 'name = ?'; $vals[] = $name; }
        if (!empty($email)) {
            // Check uniqueness excluding self
            $emailChk = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
            $emailChk->execute([$email, $id]);
            if ($emailChk->fetch()) {
                Response::error("এই ইমেইলে অন্য একটি অ্যাকাউন্ট বিদ্যমান আছে।", 'DUPLICATE_EMAIL', 409);
                return;
            }
            $sets[] = 'email = ?'; $vals[] = $email;
        }
        if ($phone !== null) { $sets[] = 'phone = ?'; $vals[] = $phone; }
        if ($roleId !== null && $id !== Auth::id()) {
            $sets[] = 'role_id = ?'; $vals[] = $roleId;
        }
        if ($status !== null) { $sets[] = 'status = ?'; $vals[] = $status; }
        if (!empty($newPassword)) {
            $sets[] = 'password_hash = ?';
            $vals[] = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
        }

        if (empty($sets)) {
            Response::json(['message' => 'No changes to update.']);
            return;
        }

        $sets[] = 'updated_at = NOW()';
        $vals[] = $id;

        $pdo->prepare("UPDATE users SET " . implode(', ', $sets) . " WHERE id = ?")
            ->execute($vals);

        Response::json(['message' => 'টিম সদস্যের তথ্য আপডেট করা হয়েছে।']);
    }

    /** DELETE /api/users/{id} — deactivate a user (soft delete) */
    public function destroy(Request $request): void {
        if (!Auth::isOwner()) {
            Response::error('Only the Scholar/Owner can remove team members.', 'FORBIDDEN', 403);
            return;
        }

        $id = (int)$request->param('id');

        if ($id === Auth::id()) {
            Response::error('নিজের অ্যাকাউন্ট নিষ্ক্রিয় করা যাবে না।', 'SELF_DELETE', 400);
            return;
        }

        $pdo = Database::getConnection();
        $pdo->prepare("UPDATE users SET status = 'inactive', updated_at = NOW() WHERE id = ?")
            ->execute([$id]);

        Response::json(['message' => 'টিম সদস্য নিষ্ক্রিয় করা হয়েছে।']);
    }
}
