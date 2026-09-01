<?php

// =====================================================
// CONFIGURAZIONE COOKIE DI SESSIONE (Prima di session_start)
// =====================================================
session_set_cookie_params([
    'lifetime' => 3600,  // 1 ora di timeout
    'path' => '/',
    'domain' => '',  // Vuoto per localhost/singolo dominio
    'secure' => false,  // false per localhost, true per HTTPS production
    'httponly' => true,
    'samesite' => 'Lax'
]);

ini_set('session.gc_maxlifetime', 3600);  // Allineato al lifetime
session_start();

header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$_SESSION = [];

if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params['path'],
        $params['domain'],
        $params['secure'],
        $params['httponly']
    );
}

session_destroy();

echo json_encode([
    "success" => true,
    "message" => "Logout effettuato con successo."
]);

exit();
?>