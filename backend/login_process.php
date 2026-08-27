<?php

session_start();

// Gestione CORS e intestazioni JSON
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Risposta alle richieste OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


// ============================================================
// CONNESSIONE DATABASE
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
// LETTURA DATI ANGULAR
// ============================================================

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$identifier = trim($data['identifier'] ?? '');
$password   = trim($data['password'] ?? '');


// ============================================================
// VALIDAZIONE
// ============================================================

if (empty($identifier) || empty($password)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "Compila tutti i campi."
    ]);

    exit();
}


// ============================================================
// RICERCA UTENTE
// ============================================================

$sql = "
    SELECT
        id,
        nome,
        cognome,
        username,
        email,
        saldo,
        password
    FROM utenti
    WHERE username = :identifier
       OR email = :identifier
    LIMIT 1
";

$stmt = $pdo->prepare($sql);

$stmt->execute([
    ':identifier' => $identifier
]);

$user = $stmt->fetch();


// ============================================================
// VERIFICA CREDENZIALI
// ============================================================

if (
    !$user ||
    !password_verify(
        $password,
        $user['password']
    )
) {

    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Credenziali errate."
    ]);

    exit();
}


// ============================================================
// CREAZIONE SESSIONE
// ============================================================

session_regenerate_id(true);

$_SESSION['user_id'] = $user['id'];
$_SESSION['username'] = $user['username'];


// ============================================================
// RIMOZIONE PASSWORD
// ============================================================

unset($user['password']);


// ============================================================
// RISPOSTA
// ============================================================

http_response_code(200);

echo json_encode([
    "success" => true,
    "message" => "Login effettuato con successo!",
    "user" => $user
]);

exit();
?>