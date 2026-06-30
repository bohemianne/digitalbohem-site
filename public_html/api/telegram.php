<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

require_once __DIR__ . '/../../private/telegram_config.php';

// GET: frontend'e yalnızca bot kullanıcı adını döndür (token/chat_id gizli kalır)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(['bot_username' => TG_BOT_USERNAME]);
    exit;
}

// POST: frontend'den yalnızca mesaj metni alınır
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $text  = trim($input['text'] ?? '');

    if (!$text) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'description' => 'Mesaj boş']);
        exit;
    }

    $url = 'https://api.telegram.org/bot' . TG_BOT_TOKEN . '/sendMessage';

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'chat_id' => TG_CHAT_ID,
        'text'    => $text,
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);

    $response = curl_exec($ch);
    $error    = curl_error($ch);
    curl_close($ch);

    if ($error) {
        http_response_code(502);
        echo json_encode(['ok' => false, 'description' => 'Sunucu bağlantı hatası']);
        exit;
    }

    echo $response;
    exit;
}

http_response_code(405);
echo json_encode(['ok' => false, 'description' => 'Method not allowed']);
