<?php
session_start();

// Gestione CORS e Header
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Connessione al DB
$conn = new mysqli("localhost", "root", "", "smartmarket");

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Errore di connessione al database."]);
    exit();
}

$conn->set_charset("utf8mb4");

// Recupero ID utente connesso (se presente)
$current_user_id = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0;

// Query SQL base
$query_base = "
    SELECT 
        p.id,
        p.titolo,
        p.descrizione,
        p.prezzo,
        p.categoria,
        p.stato,
        p.confidenza_ai,
        p.img_principale,
        p.quantita,
        u.username AS venditore
    FROM prodotti p
    INNER JOIN utenti u ON p.id_utente = u.id
";

// Se l'utente è loggato, escludi i suoi prodotti
if ($current_user_id > 0) {
    $sql = $query_base . " WHERE p.id_utente != ? ORDER BY p.id DESC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $current_user_id);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    $sql = $query_base . " ORDER BY p.id DESC";
    $result = $conn->query($sql);
}

if (!$result) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Errore nella lettura dei prodotti."]);
    $conn->close();
    exit();
}

$prodotti = [];

while ($row = $result->fetch_assoc()) {
    $prodotti[] = [
        "id"             => (int) $row["id"],
        "titolo"         => $row["titolo"],
        "descrizione"    => $row["descrizione"],
        "prezzo"         => (float) $row["prezzo"],
        "categoria"      => $row["categoria"],
        "stato"          => $row["stato"],
        "confidenza_ai"  => (float) ($row["confidenza_ai"] ?? 0),
        "img_principale" => $row["img_principale"],
        "quantita"       => (int) $row["quantita"],
        "venditore"      => $row["venditore"]
    ];
}

echo json_encode([
    "success" => true,
    "prodotti" => $prodotti
], JSON_UNESCAPED_UNICODE);

if (isset($stmt)) {
    $stmt->close();
}
$conn->close();
?>