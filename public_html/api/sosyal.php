<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');

$DATA_FILE = __DIR__ . '/../data/sosyal_posts.json';

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

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'list';

if ($method === 'GET') {
    $posts = oku();
    // Son 30 günü göster
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
        foreach ($posts as &$p) {
            if ($p['id'] === $id) { $p['durum'] = $durum; break; }
        }
        yaz($posts);
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'mesaj' => 'Bilinmeyen aksiyon']);
    }
    exit;
}

echo json_encode(['success' => false, 'mesaj' => 'Geçersiz istek']);
?>
