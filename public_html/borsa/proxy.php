<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-cache');

$symbol = isset($_GET['symbol']) ? preg_replace('/[^A-Za-z0-9.\-^%]/', '', $_GET['symbol']) : '';

if (!$symbol) {
    http_response_code(400);
    echo json_encode(['error' => 'symbol gerekli']);
    exit;
}

$url = "https://query1.finance.yahoo.com/v8/finance/chart/{$symbol}?interval=1d&range=1d";

$ctx = stream_context_create([
    'http' => [
        'method'  => 'GET',
        'timeout' => 10,
        'header'  => implode("\r\n", [
            'User-Agent: Mozilla/5.0 (compatible; BorsaBot/1.0)',
            'Accept: application/json',
        ]),
    ],
    'ssl' => [
        'verify_peer'      => true,
        'verify_peer_name' => true,
    ],
]);

$raw = @file_get_contents($url, false, $ctx);

if ($raw === false) {
    http_response_code(502);
    echo json_encode(['error' => 'Yahoo Finance yanıt vermedi']);
    exit;
}

$data = json_decode($raw, true);

if (json_last_error() !== JSON_ERROR_NONE || empty($data['chart']['result'][0])) {
    http_response_code(502);
    echo json_encode(['error' => 'Geçersiz veri']);
    exit;
}

$meta     = $data['chart']['result'][0]['meta'];
$price    = $meta['regularMarketPrice'] ?? null;
$prev     = $meta['chartPreviousClose'] ?? $meta['previousClose'] ?? $price;
$volume   = $meta['regularMarketVolume'] ?? null;
$currency = $meta['currency'] ?? '';

if ($price === null) {
    http_response_code(502);
    echo json_encode(['error' => 'Fiyat bulunamadı']);
    exit;
}

echo json_encode([
    'price'    => $price,
    'change'   => $prev ? (($price - $prev) / $prev) * 100 : 0,
    'volume'   => $volume,
    'currency' => $currency,
    'symbol'   => $symbol,
]);
