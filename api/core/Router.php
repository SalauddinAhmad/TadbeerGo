<?php
declare(strict_types=1);

namespace App\Core;

class Router {
    private array $routes = [];
    private array $globalMiddleware = [];

    public function use(callable $middleware): void {
        $this->globalMiddleware[] = $middleware;
    }

    public function get(string $path, array|callable $handler, array $middleware = []): void {
        $this->addRoute('GET', $path, $handler, $middleware);
    }

    public function post(string $path, array|callable $handler, array $middleware = []): void {
        $this->addRoute('POST', $path, $handler, $middleware);
    }

    public function put(string $path, array|callable $handler, array $middleware = []): void {
        $this->addRoute('PUT', $path, $handler, $middleware);
    }

    public function delete(string $path, array|callable $handler, array $middleware = []): void {
        $this->addRoute('DELETE', $path, $handler, $middleware);
    }

    public function patch(string $path, array|callable $handler, array $middleware = []): void {
        $this->addRoute('PATCH', $path, $handler, $middleware);
    }

    private function addRoute(string $method, string $path, array|callable $handler, array $middleware = []): void {
        $cleanPath = '/' . trim($path, '/');
        // Convert {param} to regex named group
        $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<$1>[^/]+)', $cleanPath);
        $regex = '#^' . $pattern . '$#';

        $this->routes[] = [
            'method' => $method,
            'path' => $cleanPath,
            'regex' => $regex,
            'handler' => $handler,
            'middleware' => $middleware,
        ];
    }

    public function dispatch(Request $request): void {
        // Run global middleware
        foreach ($this->globalMiddleware as $middleware) {
            $middleware($request);
        }

        $method = $request->getMethod();
        $uri = $request->getUri();

        // Handle CORS Pre-flight Options request immediately
        if ($method === 'OPTIONS') {
            http_response_code(204);
            exit;
        }

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            if (preg_match($route['regex'], $uri, $matches)) {
                $params = [];
                foreach ($matches as $k => $v) {
                    if (is_string($k)) {
                        $params[$k] = $v;
                    }
                }
                $request->setParams($params);

                // Run route middleware
                foreach ($route['middleware'] as $mw) {
                    if (is_callable($mw)) {
                        $mw($request);
                    } elseif (is_string($mw) && class_exists($mw)) {
                        (new $mw())->handle($request);
                    }
                }

                // Execute handler
                $handler = $route['handler'];
                if (is_callable($handler)) {
                    $handler($request);
                    return;
                }

                if (is_array($handler) && count($handler) === 2) {
                    [$controllerClass, $methodName] = $handler;
                    $controller = new $controllerClass();
                    $controller->$methodName($request);
                    return;
                }
            }
        }

        // Route not found
        Response::error("Endpoint '{$method} {$uri}' not found.", 'NOT_FOUND', 404);
    }
}
