<?php

// ============================================================
// SESSIONE
// ============================================================

session_start();


// ============================================================
// CORS
// ============================================================

header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");


// ============================================================
// OPTIONS
// ============================================================

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


// ============================================================
// CONTROLLO METODO
// ============================================================

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Metodo HTTP non consentito."
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
// DATI RICEVUTI DA ANGULAR
// ============================================================

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$identifier = trim($data['identifier'] ?? '');
$password = $data['password'] ?? '';


// ============================================================
// VALIDAZIONE
// ============================================================

if ($identifier === '' || $password === '') {

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
// CONTROLLO PASSWORD
// ============================================================

if (
    !$user ||
    !password_verify($password, $user['password'])
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

$_SESSION['user_id'] = (int) $user['id'];
$_SESSION['username'] = $user['username'];


// ============================================================
// CHIUSURA SESSIONE
// ============================================================

// Salviamo i dati della sessione
session_write_close();


// ============================================================
// RIMOZIONE PASSWORD
// ============================================================

unset($user['password']);


// ============================================================
// NORMALIZZAZIONE DATI
// ============================================================

$user['id'] = (int) $user['id'];
$user['saldo'] = (float) $user['saldo'];


// ============================================================
// RISPOSTA
// ============================================================

echo json_encode([
    "success" => true,
    "message" => "Login effettuato con successo!",
    "user" => $user
], JSON_UNESCAPED_UNICODE);

exit();

?>