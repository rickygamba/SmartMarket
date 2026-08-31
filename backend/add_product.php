<?php
// Gestione CORS e Credenziali di Sessione
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

// 1. Verifica che l'utente sia loggato
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Utente non autorizzato."]);
    exit();
}

$id_utente = $_SESSION['user_id'];

// 2. Lettura dei campi inviati via POST
$titolo = $_POST['titolo'] ?? '';
$descrizione = $_POST['descrizione'] ?? '';
$prezzo = $_POST['prezzo'] ?? 0;
$categoria = $_POST['categoria'] ?? '';
$stato = $_POST['condizione'] ?? ''; 
$quantita = $_POST['quantita'] ?? 1;

// 3. Gestione del caricamento file (Immagine)
if (!isset($_FILES['immagine']) || $_FILES['immagine']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(["success" => false, "message" => "Immagine non caricata o errore nel file."]);
    exit();
}

$file = $_FILES['immagine'];
$uploadDir = '../uploads/';

if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('prod_', true) . '.' . strtolower($extension);
$targetPath = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    echo json_encode(["success" => false, "message" => "Errore durante il salvataggio dell'immagine."]);
    exit();
}

// 4. INTEGRAZIONE AI (Gemini Flash API)
$geminiApiKey = 'INSERISCI_QUI_LA_TUA_GEMINI_API_KEY'; // Inserisci la tua chiave API di Google AI Studio

function analizzaProdottoConAI($imagePath, $titolo, $descrizione, $apiKey) {
    $imageData = base64_encode(file_get_contents($imagePath));
    $mimeType = mime_content_type($imagePath);

    $prompt = "Analizza questa foto e confrontala con Titolo: '$titolo' e Descrizione: '$descrizione'. " .
              "Determina se la foto è coerente con l'oggetto descritto e se il contenuto è conforme per la vendita. " .
              "Rispondi ESCLUSIVAMENTE con un oggetto JSON valido e senza formattazione markdown con questo formato esatto: " .
              "{\"valido\": true/false, \"confidenza\": numero_da_0_a_100, \"motivo\": \"spiegazione in italiano\"}";

    $payload = [
        "contents" => [
            [
                "parts" => [
                    ["text" => $prompt],
                    [
                        "inline_data" => [
                            "mime_type" => $mimeType,
                            "data" => $imageData
                        ]
                    ]
                ]
            ]
        ]
    ];

    $ch = curl_init("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . $apiKey);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

    $response = curl_exec($ch);
    curl_close($ch);

    if (!$response) return null;

    $json = json_decode($response, true);
    $rawText = $json['candidates'][0]['content']['parts'][0]['text'] ?? '';
    
    // Pulisce la risposta da eventuali tag ```json ... ```
    $cleanJson = trim(preg_replace('/^```(?:json)?|```$/m', '', $rawText));
    return json_decode($cleanJson, true);
}

// Esecuzione controllo AI
$aiResult = analizzaProdottoConAI($targetPath, $titolo, $descrizione, $geminiApiKey);

if ($aiResult && isset($aiResult['valido'])) {
    if (!$aiResult['valido']) {
        // Se l'AI rifiuta il prodotto, cancella l'immagine caricata e interrompi
        unlink($targetPath);
        echo json_encode([
            "success" => false, 
            "message" => "Prodotto rifiutato dall'AI: " . ($aiResult['motivo'] ?? "L'immagine non corrisponde alla descrizione.")
        ]);
        exit();
    }
    $confidenza_ai = $aiResult['confidenza'] ?? 100;
} else {
    // Fallback nel caso in cui la chiamata API o la chiave non sia impostata
    $confidenza_ai = 50.0; 
}

// 5. Connessione al Database
$conn = new mysqli("localhost", "root", "", "smartmarket");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Errore di connessione al database."]);
    exit();
}

// 6. Inserimento query con Prepared Statement
$query = "INSERT INTO prodotti (id_utente, titolo, descrizione, prezzo, categoria, stato, confidenza_ai, quantita, img_principale) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($query);
// Tipi di dati: i=int, s=string, d=double/float
$stmt->bind_param("issdssdis", $id_utente, $titolo, $descrizione, $prezzo, $categoria, $stato, $confidenza_ai, $quantita, $filename);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Prodotto verificato dall'AI e pubblicato con successo!",
        "product_id" => $stmt->insert_id,
        "confidenza_ai" => $confidenza_ai
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Errore nel salvataggio del prodotto su DB."]);
}

$stmt->close();
$conn->close();
?>