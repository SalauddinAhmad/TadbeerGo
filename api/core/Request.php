<?php
declare(strict_types=1);

namespace App\Core;

class Request {
    private array $body = [];
    private array $query = [];
    private array $headers = [];
    private array $params = [];
    private string $method;
    private string $uri;

    public function __construct() {
        $this->method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        
        // Parse URI
        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        $position = strpos($uri, '?');
        if ($position !== false) {
            $uri = substr($uri, 0, $position);
        }
        $this->uri = '/' . trim($uri, '/');
        
        $this->query = $_GET;
        $this->headers = $this->captureHeaders();

        // Parse JSON body
        if (in_array($this->method, ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
            $input = file_get_contents('php://input');
            $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
            if (str_contains($contentType, 'application/json') || (!empty($input) && ($input[0] === '{' || $input[0] === '['))) {
                $decoded = json_decode($input, true);
                $this->body = is_array($decoded) ? $decoded : [];
            } else {
                $this->body = $_POST;
            }
        }
    }

    private function captureHeaders(): array {
        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (str_starts_with($key, 'HTTP_')) {
                $headerName = strtolower(str_replace('_', '-', substr($key, 5)));
                $headers[$headerName] = $value;
            } elseif (in_array($key, ['CONTENT_TYPE', 'CONTENT_LENGTH'], true)) {
                $headerName = strtolower(str_replace('_', '-', $key));
                $headers[$headerName] = $value;
            }
        }
        return $headers;
    }

    public function getMethod(): string {
        return $this->method;
    }

    public function getUri(): string {
        return $this->uri;
    }

    public function all(): array {
        return array_merge($this->query, $this->body);
    }

    public function input(string $key, mixed $default = null): mixed {
        return $this->body[$key] ?? $this->query[$key] ?? $default;
    }

    public function has(string $key): bool {
        return array_key_exists($key, $this->body) || array_key_exists($key, $this->query);
    }

    public function query(string $key, mixed $default = null): mixed {
        return $this->query[$key] ?? $default;
    }

    public function header(string $key, mixed $default = null): mixed {
        return $this->headers[strtolower($key)] ?? $default;
    }

    public function setParams(array $params): void {
        $this->params = $params;
    }

    public function param(string $key, mixed $default = null): mixed {
        return $this->params[$key] ?? $default;
    }
}
