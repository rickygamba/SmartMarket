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

// 1. Leggi l'ID del prodotto dall'URL (es. get_product_detail.php?id=5)
$product_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($product_id <= 0) {
    echo json_encode(["success" => false, "message" => "ID prodotto non valido."]);
    exit();
}

// 2. Connessione al DB
$conn = new mysqli("localhost", "root", "", "smartmarket");

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Errore di connessione al database."]);
    exit();
}

$conn->set_charset("utf8mb4");

// 3. Query per recuperare il singolo prodotto con le info del venditore
$sql = "
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
        p.id_utente AS id_venditore,
        u.username AS venditore
    FROM prodotti p
    INNER JOIN utenti u ON p.id_utente = u.id
    WHERE p.id = ?
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $product_id);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    $baseUrl = "http://localhost/smartmarket/uploads/";
    $image_filename = $row["img_principale"];

    $prodotto = [
        "id"             => (int) $row["id"],
        "titolo"         => $row["titolo"],
        "descrizione"    => $row["descrizione"],
        "prezzo"         => (float) $row["prezzo"],
        "categoria"      => $row["categoria"],
        "stato"          => $row["stato"],
        "confidenza_ai"  => (float) ($row["confidenza_ai"] ?? 0),
        "img_principale" => $image_filename,
        "quantita"       => (int) $row["quantita"],
        "id_venditore"   => (int) $row["id_venditore"],
        "venditore"      => $row["venditore"]
    ];

    echo json_encode([
        "success" => true,
        "prodotto" => $prodotto
    ], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Prodotto non trovato."
    ]);
}

$stmt->close();
$conn->close();
?>