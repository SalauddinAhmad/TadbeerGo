<?php
declare(strict_types=1);

namespace App\Core;

class Response {
    public static function json(mixed $data = null, int $status = 200, array $headers = []): void {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        foreach ($headers as $key => $value) {
            header("$key: $value");
        }

        echo json_encode([
            'success' => true,
            'data' => $data
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function error(string $message, string $code = 'ERROR', int $status = 400, mixed $details = null): void {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');

        $errorPayload = [
            'code' => $code,
            'message' => $message,
        ];

        if ($details !== null) {
            $errorPayload['details'] = $details;
        }

        echo json_encode([
            'success' => false,
            'error' => $errorPayload
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
}
