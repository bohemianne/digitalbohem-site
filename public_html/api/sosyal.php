<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');

$DATA_FILE    = __DIR__ . '/../data/sosyal_posts.json';
$WEBHOOK_FILE = __DIR__ . '/../data/sosyal_webhook.json';

function oku() {
    global $DATA_FILE;
    if (!file_exists($DATA_FILE)) return [];
    return json_decode(file_get_contents($DATA_FILE), true) ?: [];
}

function yaz($data) {
    global $DATA_FILE;
    if (!is_dir(dirname($DATA_FILE))) mkdir(dirname($DATA_FILE), 0755, true);
    file_put_contents($DATA_FILE, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function webhookUrl() {
    global $WEBHOOK_FILE;
    if (!file_exists($WEBHOOK_FILE)) return '';
    $d = json_decode(file_get_contents($WEBHOOK_FILE), true);
    return $d['url'] ?? '';
}

function webhookGonder($post) {
    $url = webhookUrl();
    if (!$url) return;
    $ctx = stream_context_create([
        'http' => [
            'method'  => 'POST',
            'header'  => "Content-Type: application/json\r\n",
            'content' => json_encode($post, JSON_UNESCAPED_UNICODE),
            'timeout' => 10,
            'ignore_errors' => true
        ]
    ]);
    @file_get_contents($url, false, $ctx);
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'list';

if ($method === 'GET') {
    $action = $_GET['action'] ?? 'list';

    if ($action === 'webhook-al') {
        echo json_encode(['success' => true, 'url' => webhookUrl()]);
        exit;
    }

    $posts = oku();
    $sinir = date('Y-m-d', strtotime('-30 days'));
    $posts = array_filter($posts, fn($p) => ($p['tarih'] ?? '') >= $sinir);
    echo json_encode(['success' => true, 'posts' => array_values($posts)]);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';

    if ($action === 'kaydet') {
        $posts = oku();
        // Aynı tarih+platform'u güncelle veya ekle
        $yeni = $input['posts'] ?? [];
        foreach ($yeni as $post) {
            $bulundu = false;
            foreach ($posts as &$p) {
                if ($p['id'] === $post['id']) { $p = $post; $bulundu = true; break; }
            }
            if (!$bulundu) $posts[] = $post;
        }
        yaz($posts);
        echo json_encode(['success' => true]);

    } elseif ($action === 'durum-guncelle') {
        $posts = oku();
        $id    = $input['id'] ?? '';
        $durum = $input['durum'] ?? '';
        $hedef = null;
        foreach ($posts as &$p) {
            if ($p['id'] === $id) { $p['durum'] = $durum; $hedef = $p; break; }
        }
        yaz($posts);
        if ($durum === 'yayinlandi' && $hedef) {
            webhookGonder($hedef);
        }
        echo json_encode(['success' => true]);

    } elseif ($action === 'webhook-kaydet') {
        global $WEBHOOK_FILE;
        $url = trim($input['url'] ?? '');
        if (!is_dir(dirname($WEBHOOK_FILE))) mkdir(dirname($WEBHOOK_FILE), 0755, true);
        file_put_contents($WEBHOOK_FILE, json_encode(['url' => $url], JSON_UNESCAPED_UNICODE));
        echo json_encode(['success' => true]);

    } else {
        echo json_encode(['success' => false, 'mesaj' => 'Bilinmeyen aksiyon']);
    }
    exit;
}

echo json_encode(['success' => false, 'mesaj' => 'Geçersiz istek']);
?>
