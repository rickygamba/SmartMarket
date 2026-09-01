<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Non autorizzato."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$id_prodotto = isset($data['id']) ? (int)$data['id'] : 0;
$id_utente = (int)$_SESSION['user_id'];

if ($id_prodotto <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "ID non valido."]);
    exit();
}

$conn = new mysqli("localhost", "root", "", "SmartMarket");

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Errore connessione DB."]);
    exit();
}

$sql = "DELETE FROM prodotti WHERE id = ? AND id_utente = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $id_prodotto, $id_utente);

if ($stmt->execute() && $stmt->affected_rows > 0) {
    echo json_encode(["success" => true, "message" => "Prodotto eliminato."]);
} else {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Operazione non consentita o prodotto non trovato."]);
}

$stmt->close();
$conn->close();
?>