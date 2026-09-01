<?php

// =====================================================
// CONFIGURAZIONE COOKIE DI SESSIONE (Prima di session_start)
// =====================================================
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'domain' => 'localhost',
    'secure' => false,
    'httponly' => true,
    'samesite' => 'Lax'
]);

session_start();

// =====================================================
// CONFIGURAZIONE CORS
// =====================================================
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// =====================================================
// CONTROLLO METODO HTTP
// =====================================================
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Metodo HTTP non consentito."
    ]);
    exit();
}

// =====================================================
// CONTROLLO AUTENTICAZIONE
// =====================================================
if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Utente non autenticato."
    ]);
    exit();
}

$id_utente = (int) $_SESSION['user_id'];

if ($id_utente <= 0) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "ID utente non valido."
    ]);
    exit();
}

// =====================================================
// CONNESSIONE DATABASE (Allineato a SmartMarket)
// =====================================================
$conn = new mysqli(
    "localhost",
    "root",
    "",
    "smartmarket"
);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Errore di connessione al database."
    ]);
    exit();
}

$conn->set_charset("utf8mb4");

// =====================================================
// QUERY PRODOTTI
// =====================================================
$sql = "
    SELECT
        id,
        titolo,
        descrizione,
        prezzo,
        categoria,
        stato,
        img_principale,
        quantita
    FROM prodotti
    WHERE id_utente = ?
    ORDER BY id DESC
";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Errore nella preparazione della query."
    ]);
    $conn->close();
    exit();
}

$stmt->bind_param("i", $id_utente);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Errore durante il recupero dei prodotti."
    ]);
    $stmt->close();
    $conn->close();
    exit();
}

$result = $stmt->get_result();
$prodotti = [];

while ($row = $result->fetch_assoc()) {
    $prodotti[] = [
        "id" => (int) $row["id"],
        "titolo" => $row["titolo"],
        "descrizione" => $row["descrizione"],
        "prezzo" => (float) $row["prezzo"],
        "categoria" => $row["categoria"],
        "stato" => $row["stato"],
        "img_principale" => $row["img_principale"],
        "quantita" => (int) $row["quantita"]
    ];
}

// =====================================================
// RISPOSTA JSON
// =====================================================
http_response_code(200);

echo json_encode([
    "success" => true,
    "message" => "Prodotti recuperati correttamente.",
    "id_utente" => $id_utente,
    "totale_prodotti" => count($prodotti),
    "prodotti" => $prodotti
], JSON_UNESCAPED_UNICODE);

$stmt->close();
$conn->close();

?>