<?php

// ============================================================
// CONFIGURAZIONE COOKIE DI SESSIONE (Prima di session_start)
// ============================================================
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

// ============================================================
// RINNOVAMENTO SESSIONE
// ============================================================
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 3600)) {
    session_destroy();
    $loggedIn = false;
    $user = null;
} else if (isset($_SESSION['last_activity'])) {
    $_SESSION['last_activity'] = time();
}

// ============================================================
// CORS
// ============================================================

header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");


// ============================================================
// OPTIONS
// ============================================================

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


// ============================================================
// CONTROLLO SESSIONE
// ============================================================

if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {

    echo json_encode([
        "success" => true,
        "loggedIn" => false,
        "user" => null,
        "message" => "Utente non autenticato."
    ]);

    exit();
}


$id_utente = (int) $_SESSION['user_id'];


// ============================================================
// DATABASE
// ============================================================

$host = "localhost";
$dbname = "SmartMarket";
$db_user = "root";
$db_pass = "";

try {

    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $db_user,
        $db_pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "loggedIn" => false,
        "message" => "Errore di connessione al database."
    ]);

    exit();
}


// ============================================================
// RECUPERO UTENTE
// ============================================================

try {

    $sql = "
        SELECT
            id,
            nome,
            cognome,
            username,
            email,
            saldo
        FROM utenti
        WHERE id = :id
        LIMIT 1
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ':id' => $id_utente
    ]);

    $user = $stmt->fetch();


    // ========================================================
    // UTENTE NON TROVATO
    // ========================================================

    if (!$user) {

        // La sessione contiene un ID che non esiste più nel DB
        session_unset();
        session_destroy();

        echo json_encode([
            "success" => true,
            "loggedIn" => false,
            "user" => null,
            "message" => "Utente non trovato."
        ]);

        exit();
    }


    // ========================================================
    // RISPOSTA UTENTE AUTENTICATO
    // ========================================================

    // Rinnovamento della sessione per utente autenticato
    $_SESSION['last_activity'] = time();

    echo json_encode([
        "success" => true,
        "loggedIn" => true,
        "user" => [
            "id" => (int) $user['id'],
            "nome" => $user['nome'],
            "cognome" => $user['cognome'],
            "username" => $user['username'],
            "email" => $user['email'],
            "saldo" => (float) $user['saldo']
        ]
    ]);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "loggedIn" => false,
        "message" => "Errore durante il recupero dell'utente."
    ]);
}

exit();
?>