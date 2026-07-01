<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');

$DATA_DIR    = __DIR__ . '/../data/';
$ONERILER_F  = $DATA_DIR . 'blog_oneriler.json';
$YAZILAR_F   = $DATA_DIR . 'blog_yazilar.json';

function readJson($path) {
    if (!file_exists($path)) return null;
    return json_decode(file_get_contents($path), true);
}
function writeJson($path, $data) {
    file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// ── GET: oneriler ────────────────────────────────────────────────────────────
if ($action === 'oneriler') {
    $data = readJson($ONERILER_F);
    if (!$data) {
        echo json_encode(['success' => false, 'mesaj' => "Henüz öneri yok. Pazartesi 09:30'da otomatik oluşur."]);
        exit;
    }
    echo json_encode(['success' => true] + $data);
    exit;
}

// ── POST: oneriler-kaydet — ajan tarafından çağrılır ─────────────────────────
if ($action === 'oneriler-kaydet' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!isset($input['konular'])) {
        echo json_encode(['success' => false, 'mesaj' => 'konular alanı zorunlu.']);
        exit;
    }
    writeJson($ONERILER_F, [
        'tarih'   => $input['tarih'] ?? date('Y-m-d'),
        'dosya'   => $input['dosya'] ?? '',
        'konular' => $input['konular'],
    ]);
    echo json_encode(['success' => true, 'mesaj' => 'Öneriler kaydedildi.']);
    exit;
}

// ── POST: onayla ─────────────────────────────────────────────────────────────
if ($action === 'onayla' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $konu  = (int)($input['konu'] ?? 0);
    $karar = strtoupper(trim($input['karar'] ?? ''));

    if (!in_array($karar, ['EVET', 'HAYIR'])) {
        echo json_encode(['success' => false, 'mesaj' => 'Geçersiz karar.']);
        exit;
    }
    $data = readJson($ONERILER_F);
    if (!$data) {
        echo json_encode(['success' => false, 'mesaj' => 'Öneri bulunamadı.']);
        exit;
    }
    $degisti = false;
    foreach ($data['konular'] as &$k) {
        if ($k['no'] === $konu) { $k['onay'] = $karar; $degisti = true; break; }
    }
    if (!$degisti) {
        echo json_encode(['success' => false, 'mesaj' => 'Konu ' . $konu . ' bulunamadı.']);
        exit;
    }
    writeJson($ONERILER_F, $data);
    echo json_encode(['success' => true, 'mesaj' => 'Konu ' . $konu . ' → ' . $karar]);
    exit;
}

// ── GET: yazilar ─────────────────────────────────────────────────────────────
if ($action === 'yazilar') {
    $data = readJson($YAZILAR_F) ?? [];
    echo json_encode(['success' => true, 'yazilar' => $data]);
    exit;
}

// ── POST: yazi-kaydet — blog yazı ajanı tarafından çağrılır ──────────────────
if ($action === 'yazi-kaydet' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $yazilar = readJson($YAZILAR_F) ?? [];
    $yazilar[] = [
        'slug'   => $input['slug']   ?? '',
        'baslik' => $input['baslik'] ?? '',
        'tarih'  => $input['tarih']  ?? date('Y-m-d'),
        'url'    => 'https://digitalbohem.com.tr/blog/' . ($input['slug'] ?? '') . '.html',
    ];
    writeJson($YAZILAR_F, $yazilar);
    echo json_encode(['success' => true, 'mesaj' => 'Yazı kaydedildi.']);
    exit;
}

// ── POST: yayinla — ajan HTML'i doğrudan sunucuya yazar ─────────────────────
if ($action === 'yayinla' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    // Basit güvenlik anahtarı
    if (($input['secret'] ?? '') !== 'polaris2026') {
        http_response_code(403);
        echo json_encode(['success' => false, 'mesaj' => 'Yetkisiz.']);
        exit;
    }

    $slug    = preg_replace('/[^a-z0-9\-]/', '', $input['slug'] ?? '');
    $html    = $input['html'] ?? '';
    $baslik  = $input['baslik'] ?? '';
    $tarih   = $input['tarih'] ?? date('d.m.Y');
    $excerpt = mb_substr(strip_tags($input['excerpt'] ?? ''), 0, 140);
    $konu_no = (int)($input['konu_no'] ?? 0);

    if (!$slug || !$html) {
        echo json_encode(['success' => false, 'mesaj' => 'slug ve html zorunlu.']);
        exit;
    }

    $BLOG_DIR = __DIR__ . '/../blog';

    // HTML dosyasını yaz
    file_put_contents("$BLOG_DIR/$slug.html", $html);

    // blog/index.html'e kart ekle
    $index_path = "$BLOG_DIR/index.html";
    if (file_exists($index_path)) {
        $kart = <<<KART
    <article class="blog-card">
      <div class="blog-card-body">
        <span class="blog-card-date">$tarih</span>
        <h2>$baslik</h2>
        <p>$excerpt...</p>
        <a href="$slug.html" class="blog-card-link">Devamını Oku →</a>
      </div>
    </article>
KART;
        $index = file_get_contents($index_path);
        $index = str_replace('<!-- BLOG_POSTS_START -->', "<!-- BLOG_POSTS_START -->\n$kart", $index);
        file_put_contents($index_path, $index);
    }

    // Öneriler dosyasında durumu YAYINLANDI yap
    if ($konu_no > 0) {
        $data = readJson($ONERILER_F);
        if ($data) {
            foreach ($data['konular'] as &$k) {
                if ($k['no'] === $konu_no) { $k['onay'] = 'YAYINLANDI'; break; }
            }
            writeJson($ONERILER_F, $data);
        }
    }

    // Yazılar listesine ekle
    $yazilar = readJson($YAZILAR_F) ?? [];
    $yazilar[] = [
        'slug'   => $slug,
        'baslik' => $baslik,
        'tarih'  => date('Y-m-d'),
        'url'    => "https://digitalbohem.com.tr/blog/$slug.html",
    ];
    writeJson($YAZILAR_F, $yazilar);

    echo json_encode(['success' => true, 'mesaj' => "Yayınlandı: $slug.html"]);
    exit;
}

echo json_encode(['success' => false, 'mesaj' => 'Bilinmeyen action: ' . htmlspecialchars($action)]);
?>
