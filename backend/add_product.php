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

// 1. Verifica autenticazione utente
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Utente non autorizzato."]);
    exit();
}

$id_utente = $_SESSION['user_id'];

// 2. Lettura e sanificazione input POST
$titolo       = trim($_POST['titolo'] ?? '');
$descrizione  = trim($_POST['descrizione'] ?? '');
$prezzo       = floatval($_POST['prezzo'] ?? 0);
$categoria    = trim($_POST['categoria'] ?? '');
$stato        = trim($_POST['condizione'] ?? $_POST['stato'] ?? ''); 
$quantita     = intval($_POST['quantita'] ?? 1);

// 3. Gestione upload immagine
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
$geminiApiKey = 'INSERISCI_QUI_LA_TUA_GEMINI_API_KEY';

function analizzaProdottoConAI($imagePath, $titolo, $descrizione, $apiKey) {
    // Se la chiave non è impostata, approva di default per evitare blocchi o caricamenti infiniti
    if (empty($apiKey) || $apiKey === 'INSERISCI_QUI_LA_TUA_GEMINI_API_KEY') {
        return ['valido' => true, 'confidenza' => 100, 'motivo' => 'AI Bypassed (Chiave non configurata)'];
    }

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
    curl_setopt($ch, CURLOPT_TIMEOUT, 8); // Previene blocchi oltre gli 8 secondi

    $response = curl_exec($ch);
    curl_close($ch);

    if (!$response) return null;

    $json = json_decode($response, true);
    $rawText = $json['candidates'][0]['content']['parts'][0]['text'] ?? '';
    
    $cleanJson = trim(preg_replace('/^```(?:json)?|```$/m', '', $rawText));
    return json_decode($cleanJson, true);
}

// Esecuzione controllo AI
$aiResult = analizzaProdottoConAI($targetPath, $titolo, $descrizione, $geminiApiKey);

if ($aiResult && isset($aiResult['valido'])) {
    if (!$aiResult['valido']) {
        unlink($targetPath);
        echo json_encode([
            "success" => false, 
            "message" => "Prodotto rifiutato dall'AI: " . ($aiResult['motivo'] ?? "L'immagine non corrisponde alla descrizione.")
        ]);
        exit();
    }
    $confidenza_ai = floatval($aiResult['confidenza'] ?? 100);
} else {
    $confidenza_ai = 50.0; 
}

// 5. Connessione al Database
$conn = new mysqli("localhost", "root", "", "smartmarket");

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Errore di connessione al database."]);
    exit();
}

// 6. Preparazione query
$query = "INSERT INTO prodotti (id_utente, titolo, descrizione, prezzo, categoria, stato, confidenza_ai, quantita, img_principale) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($query);

/* 
   MAPPATURA CORRETTA DEI TIPI IN BIND_PARAM:
   1. id_utente     -> i (int)
   2. titolo        -> s (string)
   3. descrizione   -> s (string)
   4. prezzo        -> d (double/float)
   5. categoria     -> s (string)
   6. stato         -> s (string)
   7. confidenza_ai -> d (double/float)
   8. quantita      -> i (int)
   9. img_principale-> s (string)
   Stringa tipi: "issdssdis"
*/
$stmt->bind_param(
    "issdssdis", 
    $id_utente, 
    $titolo, 
    $descrizione, 
    $prezzo, 
    $categoria, 
    $stato, 
    $confidenza_ai, 
    $quantita, 
    $filename
);

// 7. Esecuzione query e output della risposta
if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Prodotto salvato con successo!",
        "product_id" => $stmt->insert_id,
        "confidenza_ai" => $confidenza_ai
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Errore DB: " . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>