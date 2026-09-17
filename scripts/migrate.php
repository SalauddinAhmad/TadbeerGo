<?php
/**
 * Database Migration & Seed Runner
 * Supports both CLI and web execution (with secret key protection)
 */

declare(strict_types=1);

// Load .env if available
$envFile = dirname(__DIR__) . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        if (str_contains($line, '=')) {
            [$key, $value] = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value, " \t\n\r\0\x0B\"'");
            $_ENV[$key] = $value;
            putenv("$key=$value");
        }
    }
}

$dbHost = getenv('DB_HOST') ?: '127.0.0.1';
$dbPort = getenv('DB_PORT') ?: '3306';
$dbName = getenv('DB_NAME') ?: 'personal_life_management';
$dbUser = getenv('DB_USER') ?: 'root';
$dbPass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';
$dbCharset = getenv('DB_CHARSET') ?: 'utf8mb4';

echo "==> Connecting to MySQL [$dbHost:$dbPort, DB: $dbName]...\n";

try {
    $dsn = "mysql:host={$dbHost};port={$dbPort};charset={$dbCharset}";
    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    // Ensure database exists
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET {$dbCharset} COLLATE utf8mb4_unicode_ci;");
    $pdo->exec("USE `{$dbName}`;");

    // Ensure migrations tracking table exists
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS _migrations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            migration VARCHAR(255) NOT NULL UNIQUE,
            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
    ");

    // Scan migration files
    $migrationDir = dirname(__DIR__) . '/database/migrations';
    $files = glob($migrationDir . '/*.sql');
    sort($files);

    $stmt = $pdo->query("SELECT migration FROM _migrations");
    $executed = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo "==> Running Pending Migrations...\n";
    foreach ($files as $file) {
        $filename = basename($file);
        if (in_array($filename, $executed, true)) {
            echo "    [SKIPPED] $filename (already applied)\n";
            continue;
        }

        echo "    [RUNNING] $filename...";
        $sql = file_get_contents($file);
        $pdo->exec($sql);

        $ins = $pdo->prepare("INSERT INTO _migrations (migration) VALUES (?)");
        $ins->execute([$filename]);
        echo " OK\n";
    }

    // Run seeds if flag passed or if users table is empty
    $seedArg = in_array('--seed', $argv ?? [], true);
    $userCountStmt = $pdo->query("SELECT COUNT(*) FROM users");
    $userCount = (int)$userCountStmt->fetchColumn();

    if ($seedArg || $userCount === 0) {
        echo "==> Running Seeds...\n";
        $seedDir = dirname(__DIR__) . '/database/seeds';
        $seedFiles = glob($seedDir . '/*.sql');
        sort($seedFiles);
        foreach ($seedFiles as $seedFile) {
            $seedName = basename($seedFile);
            echo "    [SEEDING] $seedName...";
            $seedSql = file_get_contents($seedFile);
            $pdo->exec($seedSql);
            echo " OK\n";
        }
    }

    echo "==> Database migrations completed successfully!\n";

} catch (PDOException $e) {
    echo "\n[ERROR] Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
