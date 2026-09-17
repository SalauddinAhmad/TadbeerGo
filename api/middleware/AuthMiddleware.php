<?php
declare(strict_types=1);

namespace App\Middleware;

use App\Core\Auth;
use App\Core\Request;
use App\Core\Response;

class AuthMiddleware {
    private ?string $requiredPermission;

    public function __construct(?string $requiredPermission = null) {
        $this->requiredPermission = $requiredPermission;
    }

    public function handle(Request $request): void {
        $user = Auth::user();
        if (!$user) {
            Response::error('Authentication required.', 'UNAUTHORIZED', 401);
        }

        if ($this->requiredPermission !== null) {
            if (!Auth::hasPermission($this->requiredPermission)) {
                Response::error('You do not have permission to perform this action.', 'FORBIDDEN', 403);
            }
        }
    }
}
