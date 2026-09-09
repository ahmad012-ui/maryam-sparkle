<?php
declare(strict_types=1);

/**
 * Database Connection Manager (PDO)
 *
 * Provides a clean, reusable PDO connection to MySQL using configured credentials,
 * strict exception handling, associative array fetches, and native prepared statements.
 */
class Database {
    private static ?PDO $connection = null;

    /**
     * Private constructor to prevent direct instantiation.
     */
    private function __construct() {}

    /**
     * Retrieve the active PDO connection instance.
     *
     * @return PDO
     * @throws PDOException if connection fails
     */
    public static function getConnection(): PDO {
        if (self::$connection === null) {
            $config = require __DIR__ . '/config.php';
            $db = $config['db'];

            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=%s',
                $db['host'],
                $db['port'],
                $db['name'],
                $db['charset']
            );

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            try {
                self::$connection = new PDO($dsn, $db['user'], $db['pass'], $options);
            } catch (PDOException $e) {
                // Log the technical error without leaking connection credentials
                error_log('Database connection error: ' . $e->getMessage());
                throw new PDOException('Database connection failed.');
            }
        }

        return self::$connection;
    }

    /**
     * Close the database connection.
     */
    public static function closeConnection(): void {
        self::$connection = null;
    }
}
