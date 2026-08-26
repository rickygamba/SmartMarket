<?php

// ============================================================
// CONFIGURAZIONE CORS
// ============================================================

header("Access-Control-Allow-Origin: http://localhost:4200");

header("Access-Control-Allow-Methods: POST, OPTIONS");

header(
    "Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With"
);

header(
    "Content-Type: application/json; charset=UTF-8"
);


// ============================================================
// GESTIONE PREFLIGHT CORS
// ============================================================

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {

    http_response_code(200);

    exit;
}


// ============================================================
// CONFIGURAZIONE DATABASE
// ============================================================

$host = 'localhost';

$db = 'smartmarket';

$user = 'root';

$pass = '';

$charset = 'utf8mb4';


$dsn =
    "mysql:host=$host;dbname=$db;charset=$charset";


$options = [

    PDO::ATTR_ERRMODE =>
        PDO::ERRMODE_EXCEPTION,

    PDO::ATTR_DEFAULT_FETCH_MODE =>
        PDO::FETCH_ASSOC,

    PDO::ATTR_EMULATE_PREPARES =>
        false

];


// ============================================================
// CONNESSIONE DATABASE
// ============================================================

try {

    $pdo = new PDO(
        $dsn,
        $user,
        $pass,
        $options
    );

}
catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "message" =>
            "Connessione al database fallita."

    ]);

    exit;
}


// ============================================================
// ACCETTIAMO SOLO POST
// ============================================================

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

    http_response_code(405);

    echo json_encode([

        "success" => false,

        "message" =>
            "Metodo HTTP non consentito. Utilizzare POST."

    ]);

    exit;
}


// ============================================================
// LETTURA JSON
// ============================================================

$rawData =
    file_get_contents("php://input");


// ============================================================
// CONTROLLO JSON VUOTO
// ============================================================

if (!$rawData) {

    http_response_code(400);

    echo json_encode([

        "success" => false,

        "message" =>
            "Nessun dato ricevuto."

    ]);

    exit;
}


// ============================================================
// DECODIFICA JSON
// ============================================================

$data =
    json_decode($rawData);


// ============================================================
// CONTROLLO JSON VALIDO
// ============================================================

if ($data === null) {

    http_response_code(400);

    echo json_encode([

        "success" => false,

        "message" =>
            "Formato JSON non valido."

    ]);

    exit;
}


// ============================================================
// CONTROLLO CAMPI OBBLIGATORI
// ============================================================

if (

    empty($data->nome) ||

    empty($data->cognome) ||

    empty($data->email) ||

    empty($data->username) ||

    empty($data->password)

) {

    http_response_code(400);

    echo json_encode([

        "success" => false,

        "message" =>
            "Compila tutti i campi obbligatori."

    ]);

    exit;
}


// ============================================================
// PULIZIA DATI
// ============================================================

$nome =
    trim($data->nome);


$cognome =
    trim($data->cognome);


$email =
    trim($data->email);


$username =
    trim($data->username);


$passwordPlain =
    $data->password;


// ============================================================
// VALIDAZIONE EMAIL
// ============================================================

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

    http_response_code(400);

    echo json_encode([

        "success" => false,

        "message" =>
            "Indirizzo email non valido."

    ]);

    exit;
}


// ============================================================
// VALIDAZIONE USERNAME
// ============================================================

if (strlen($username) < 3) {

    http_response_code(400);

    echo json_encode([

        "success" => false,

        "message" =>
            "Lo username deve avere almeno 3 caratteri."

    ]);

    exit;
}


// ============================================================
// VALIDAZIONE PASSWORD
// ============================================================


// Almeno 6 caratteri

if (strlen($passwordPlain) < 6) {

    http_response_code(400);

    echo json_encode([

        "success" => false,

        "message" =>
            "La password deve avere almeno 6 caratteri."

    ]);

    exit;
}


// Almeno una maiuscola

if (!preg_match('/[A-Z]/', $passwordPlain)) {

    http_response_code(400);

    echo json_encode([

        "success" => false,

        "message" =>
            "La password deve contenere almeno una lettera maiuscola."

    ]);

    exit;
}


// Almeno un carattere speciale

if (!preg_match('/[!@#$%^&*(),.?":{}|<>]/', $passwordPlain)) {

    http_response_code(400);

    echo json_encode([

        "success" => false,

        "message" =>
            "La password deve contenere almeno un simbolo."

    ]);

    exit;
}


// ============================================================
// HASH PASSWORD
// ============================================================

$password =
    password_hash(
        $passwordPlain,
        PASSWORD_BCRYPT
    );


// ============================================================
// CONTROLLO EMAIL / USERNAME ESISTENTI
// ============================================================

$checkQuery = "
    SELECT id
    FROM utenti
    WHERE email = ?
       OR username = ?
    LIMIT 1
";


$stmtCheck =
    $pdo->prepare($checkQuery);


$stmtCheck->execute([

    $email,

    $username

]);


if ($stmtCheck->fetch()) {

    http_response_code(409);

    echo json_encode([

        "success" => false,

        "message" =>
            "Email o Username già registrati."

    ]);

    exit;
}


// ============================================================
// DATI DEFAULT
// ============================================================


// ATTENZIONE:
// Se il tuo ENUM è ('utente','admin')
// devi usare 'utente'.

$ruolo = 'utente';


$saldo = 0.00;


$data_creazione =
    date('Y-m-d H:i:s');


// ============================================================
// INSERT UTENTE
// ============================================================

$insertQuery = "

    INSERT INTO utenti

    (
        nome,
        cognome,
        email,
        username,
        password,
        ruolo,
        saldo,
        data_creazione
    )

    VALUES

    (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?
    )

";


$stmtInsert =
    $pdo->prepare($insertQuery);


// ============================================================
// ESECUZIONE INSERT
// ============================================================

try {

    $executed =
        $stmtInsert->execute([

            $nome,

            $cognome,

            $email,

            $username,

            $password,

            $ruolo,

            $saldo,

            $data_creazione

        ]);

}
catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([

        "success" => false,

        "message" =>
            "Errore durante il salvataggio dell'utente."

    ]);

    exit;
}


// ============================================================
// RISULTATO
// ============================================================

if ($executed) {

    http_response_code(201);

    echo json_encode([

        "success" => true,

        "message" =>
            "Utente registrato con successo!"

    ]);

    exit;

}


// ============================================================
// ERRORE GENERICO
// ============================================================

http_response_code(500);

echo json_encode([

    "success" => false,

    "message" =>
        "Errore durante il salvataggio dell'utente."

]);

exit;