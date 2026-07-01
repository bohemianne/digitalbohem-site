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

// ── GET: yazi — tek yazının HTML'ini döndürür (önizleme için) ────────────────
if ($action === 'yazi') {
    $slug = preg_replace('/[^a-z0-9\-]/', '', $_GET['slug'] ?? '');
    $file = __DIR__ . '/../blog/' . $slug . '.html';
    if (!$slug || !file_exists($file)) {
        echo json_encode(['success' => false, 'mesaj' => 'Yazı bulunamadı.']);
        exit;
    }
    echo json_encode(['success' => true, 'html' => file_get_contents($file)]);
    exit;
}

// ── POST: taslak-kaydet — ajan taslağı kaydeder, henüz yayınlamaz ────────────
if ($action === 'taslak-kaydet' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (($input['secret'] ?? '') !== 'polaris2026') {
        http_response_code(403); echo json_encode(['success' => false, 'mesaj' => 'Yetkisiz.']); exit;
    }
    $slug = preg_replace('/[^a-z0-9\-]/', '', $input['slug'] ?? '');
    $html = $input['html'] ?? '';
    if (!$slug || !$html) { echo json_encode(['success' => false, 'mesaj' => 'slug ve html zorunlu.']); exit; }

    $DRAFT_DIR = __DIR__ . '/../blog/taslaklar';
    if (!is_dir($DRAFT_DIR)) mkdir($DRAFT_DIR, 0755, true);
    file_put_contents("$DRAFT_DIR/$slug.html", $html);

    $taslaklar_f = $DATA_DIR . 'blog_taslaklar.json';
    $taslaklar = readJson($taslaklar_f) ?? [];
    $taslaklar = array_values(array_filter($taslaklar, fn($t) => $t['slug'] !== $slug));
    $taslaklar[] = [
        'slug'     => $slug,
        'baslik'   => $input['baslik'] ?? '',
        'tarih'    => date('Y-m-d'),
        'excerpt'  => $input['excerpt'] ?? '',
        'konu_no'  => (int)($input['konu_no'] ?? 0),
    ];
    writeJson($taslaklar_f, $taslaklar);
    echo json_encode(['success' => true, 'mesaj' => "Taslak kaydedildi: $slug"]);
    exit;
}

// ── GET: taslaklar ───────────────────────────────────────────────────────────
if ($action === 'taslaklar') {
    $taslaklar_f = $DATA_DIR . 'blog_taslaklar.json';
    $taslaklar = readJson($taslaklar_f) ?? [];
    echo json_encode(['success' => true, 'taslaklar' => $taslaklar]);
    exit;
}

// ── GET: taslak — tek taslağın HTML'ini döndürür ─────────────────────────────
if ($action === 'taslak') {
    $slug = preg_replace('/[^a-z0-9\-]/', '', $_GET['slug'] ?? '');
    $file = __DIR__ . '/../blog/taslaklar/' . $slug . '.html';
    if (!$slug || !file_exists($file)) { echo json_encode(['success' => false, 'mesaj' => 'Taslak bulunamadı.']); exit; }
    echo json_encode(['success' => true, 'html' => file_get_contents($file)]);
    exit;
}

// ── POST: taslak-yayinla — taslağı onaylayıp canlıya al ─────────────────────
if ($action === 'taslak-yayinla' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $slug  = preg_replace('/[^a-z0-9\-]/', '', $input['slug'] ?? '');
    if (!$slug) { echo json_encode(['success' => false, 'mesaj' => 'slug zorunlu.']); exit; }

    $DRAFT_DIR = __DIR__ . '/../blog/taslaklar';
    $BLOG_DIR  = __DIR__ . '/../blog';
    $draft_file = "$DRAFT_DIR/$slug.html";
    if (!file_exists($draft_file)) { echo json_encode(['success' => false, 'mesaj' => 'Taslak bulunamadı.']); exit; }

    $html = file_get_contents($draft_file);
    file_put_contents("$BLOG_DIR/$slug.html", $html);
    unlink($draft_file);

    $taslaklar_f = $DATA_DIR . 'blog_taslaklar.json';
    $taslaklar = readJson($taslaklar_f) ?? [];
    $meta = null;
    foreach ($taslaklar as $t) { if ($t['slug'] === $slug) { $meta = $t; break; } }
    $taslaklar = array_values(array_filter($taslaklar, fn($t) => $t['slug'] !== $slug));
    writeJson($taslaklar_f, $taslaklar);

    // blog/index.html'e kart ekle
    $baslik  = $meta['baslik'] ?? $slug;
    $excerpt = $meta['excerpt'] ?? '';
    $tarih   = date('d.m.Y');
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

    // yazilar listesine ekle
    $yazilar = readJson($YAZILAR_F) ?? [];
    $yazilar[] = ['slug' => $slug, 'baslik' => $baslik, 'tarih' => date('Y-m-d'),
                  'url' => "https://digitalbohem.com.tr/blog/$slug.html"];
    writeJson($YAZILAR_F, $yazilar);

    // öneri durumunu güncelle
    if ($meta && $meta['konu_no'] > 0) {
        $data = readJson($ONERILER_F);
        if ($data) {
            foreach ($data['konular'] as &$k) {
                if ($k['no'] === (int)$meta['konu_no']) { $k['onay'] = 'YAYINLANDI'; break; }
            }
            writeJson($ONERILER_F, $data);
        }
    }

    echo json_encode(['success' => true, 'mesaj' => "Yayınlandı: $slug.html"]);
    exit;
}

// ── POST: taslak-guncelle — düzenlenmiş HTML'i kaydet ────────────────────────
if ($action === 'taslak-guncelle' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (($input['secret'] ?? '') !== 'polaris2026') {
        http_response_code(403); echo json_encode(['success' => false, 'mesaj' => 'Yetkisiz.']); exit;
    }
    $slug = preg_replace('/[^a-z0-9\-]/', '', $input['slug'] ?? '');
    $html = $input['html'] ?? '';
    if (!$slug || !$html) { echo json_encode(['success' => false, 'mesaj' => 'slug ve html zorunlu.']); exit; }
    $file = __DIR__ . '/../blog/taslaklar/' . $slug . '.html';
    if (!file_exists($file)) { echo json_encode(['success' => false, 'mesaj' => 'Taslak bulunamadı.']); exit; }
    file_put_contents($file, $html);
    echo json_encode(['success' => true, 'mesaj' => 'Taslak güncellendi.']);
    exit;
}

// ── POST: taslak-sil ─────────────────────────────────────────────────────────
if ($action === 'taslak-sil' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $slug  = preg_replace('/[^a-z0-9\-]/', '', $input['slug'] ?? '');
    $file  = __DIR__ . '/../blog/taslaklar/' . $slug . '.html';
    if (file_exists($file)) unlink($file);
    $taslaklar_f = $DATA_DIR . 'blog_taslaklar.json';
    $taslaklar = readJson($taslaklar_f) ?? [];
    $taslaklar = array_values(array_filter($taslaklar, fn($t) => $t['slug'] !== $slug));
    writeJson($taslaklar_f, $taslaklar);
    echo json_encode(['success' => true, 'mesaj' => "Taslak silindi: $slug"]);
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

// ── POST: sil — yazıyı sil ───────────────────────────────────────────────────
if ($action === 'sil' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (($input['secret'] ?? '') !== 'polaris2026') {
        http_response_code(403);
        echo json_encode(['success' => false, 'mesaj' => 'Yetkisiz.']);
        exit;
    }
    $slug = preg_replace('/[^a-z0-9\-]/', '', $input['slug'] ?? '');
    if (!$slug) {
        echo json_encode(['success' => false, 'mesaj' => 'slug zorunlu.']);
        exit;
    }

    $BLOG_DIR = __DIR__ . '/../blog';
    $html_file = "$BLOG_DIR/$slug.html";

    // HTML dosyasını sil
    if (file_exists($html_file)) unlink($html_file);

    // blog/index.html'den kartı kaldır
    $index_path = "$BLOG_DIR/index.html";
    if (file_exists($index_path)) {
        $index = file_get_contents($index_path);
        // slug içeren article kartını sil
        $index = preg_replace('/<article class="blog-card">.*?href="' . preg_quote($slug, '/') . '\.html".*?<\/article>/s', '', $index);
        file_put_contents($index_path, $index);
    }

    // yazilar.json'dan kaldır
    $yazilar = readJson($YAZILAR_F) ?? [];
    $yazilar = array_values(array_filter($yazilar, fn($y) => $y['slug'] !== $slug));
    writeJson($YAZILAR_F, $yazilar);

    echo json_encode(['success' => true, 'mesaj' => "$slug.html silindi."]);
    exit;
}

echo json_encode(['success' => false, 'mesaj' => 'Bilinmeyen action: ' . htmlspecialchars($action)]);
?>
