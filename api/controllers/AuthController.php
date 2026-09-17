<?php
declare(strict_types=1);

namespace App\Controllers;

use App\Core\Auth;
use App\Core\Request;
use App\Core\Response;

class AuthController {
    public function login(Request $request): void {
        $email = (string)$request->input('email', '');
        $password = (string)$request->input('password', '');

        if (empty($email) || empty($password)) {
            Response::error('Email and password are required.', 'VALIDATION_ERROR', 422);
        }

        $user = Auth::login($email, $password);
        if (!$user) {
            Response::error('Invalid email or password.', 'INVALID_CREDENTIALS', 401);
        }

        Response::json([
            'user' => $user,
            'message' => 'Logged in successfully.'
        ]);
    }

    public function logout(Request $request): void {
        Auth::logout();
        Response::json([
            'message' => 'Logged out successfully.'
        ]);
    }

    public function me(Request $request): void {
        $user = Auth::user();
        if (!$user) {
            Response::error('Not authenticated.', 'UNAUTHENTICATED', 401);
        }

        Response::json([
            'user' => $user
        ]);
    }
}
