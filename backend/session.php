<?php

session_start();

header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


// ============================================================
// CONTROLLO SESSIONE
// ============================================================

if (!isset($_SESSION['user_id'])) {

    http_response_code(401);

    echo json_encode([
        "success" => false,
        "loggedIn" => false,
        "message" => "Utente non autenticato."
    ]);

    exit();
}


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
        "message" => "Errore di connessione al database."
    ]);

    exit();
}


// ============================================================
// RECUPERO UTENTE DAL DATABASE
// ============================================================

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
    ':id' => $_SESSION['user_id']
]);

$user = $stmt->fetch();


if (!$user) {

    session_destroy();

    http_response_code(401);

    echo json_encode([
        "success" => false,
        "loggedIn" => false,
        "message" => "Utente non trovato."
    ]);

    exit();
}


// ============================================================
// RISPOSTA
// ============================================================

echo json_encode([
    "success" => true,
    "loggedIn" => true,
    "user" => $user
]);

exit();
?>