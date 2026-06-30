<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');

$AGENTS_DIR = '/home/bohem/.digitalbohem-agents';
$SITE_BLOG  = '/home/bohem/Masaüstü/digitalbohem-site/blog';

$action = $_GET['action'] ?? 'oneriler';

// ── Son öneri dosyasını bul ──────────────────────────────────────────────────
function sonOneriDosyasi($dir) {
    $dosyalar = glob($dir . '/blog-oneriler-*.md');
    if (!$dosyalar) return null;
    usort($dosyalar, fn($a,$b) => filemtime($b) - filemtime($a));
    return $dosyalar[0];
}

// ── Öneri dosyasını parse et ─────────────────────────────────────────────────
function parseOneriler($dosya) {
    $icerik  = file_get_contents($dosya);
    $konular = [];
    // Her ## Konu N bloğunu ayır
    preg_match_all('/## Konu (\d+)(.*?)(?=## Konu \d+|$)/s', $icerik, $m, PREG_SET_ORDER);
    foreach ($m as $blok) {
        $no   = (int)$blok[1];
        $metin = trim($blok[2]);
        $data  = ['no' => $no, 'ham' => $metin];
        foreach ([
            'ONAY'           => 'onay',
            'Başlık'         => 'baslik',
            'Hedef Kelime'   => 'hedef',
            'Neden Şimdi'    => 'neden',
            'Tahmini Hacim'  => 'hacim',
            'İlk Paragraf'   => 'giris',
        ] as $etiket => $anahtar) {
            if (preg_match('/^' . preg_quote($etiket, '/') . ':\s*(.+)$/m', $metin, $mm)) {
                $data[$anahtar] = trim($mm[1]);
            }
        }
        // H2 başlıkları
        if (preg_match('/H2 Başlıkları:\s*((?:\n- .+)+)/s', $metin, $hm)) {
            $data['h2ler'] = array_values(array_filter(
                array_map(fn($l) => ltrim(trim($l), '- '),
                explode("\n", trim($hm[1])))
            ));
        }
        $konular[] = $data;
    }
    return $konular;
}

// ── GET: oneriler ────────────────────────────────────────────────────────────
if ($action === 'oneriler') {
    $dosya = sonOneriDosyasi($AGENTS_DIR);
    if (!$dosya) {
        echo json_encode(['success' => false, 'mesaj' => 'Henüz öneri dosyası yok. Pazartesi 09:30\'da otomatik oluşur.']);
        exit;
    }
    echo json_encode([
        'success' => true,
        'dosya'   => basename($dosya),
        'tarih'   => date('Y-m-d', filemtime($dosya)),
        'konular' => parseOneriler($dosya)
    ]);
    exit;
}

// ── POST: onayla ─────────────────────────────────────────────────────────────
if ($action === 'onayla' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input  = json_decode(file_get_contents('php://input'), true);
    $konu   = (int)($input['konu'] ?? 0);
    $karar  = strtoupper(trim($input['karar'] ?? ''));  // EVET / HAYIR

    if (!in_array($karar, ['EVET', 'HAYIR'])) {
        echo json_encode(['success' => false, 'mesaj' => 'Geçersiz karar.']);
        exit;
    }

    $dosya = sonOneriDosyasi($AGENTS_DIR);
    if (!$dosya) {
        echo json_encode(['success' => false, 'mesaj' => 'Öneri dosyası bulunamadı.']);
        exit;
    }

    $icerik  = file_get_contents($dosya);
    $pattern = '/(## Konu ' . $konu . '\s*\nONAY:) [^\n]+/';
    $yeni    = '${1} ' . $karar;
    $sonuc   = preg_replace($pattern, $yeni, $icerik, 1, $degisti);

    if (!$degisti) {
        echo json_encode(['success' => false, 'mesaj' => 'Konu ' . $konu . ' bulunamadı veya zaten değiştirilmiş.']);
        exit;
    }

    file_put_contents($dosya, $sonuc);
    echo json_encode(['success' => true, 'mesaj' => 'Konu ' . $konu . ' için karar: ' . $karar]);
    exit;
}

// ── GET: yazilar — üretilmiş HTML blog yazıları ──────────────────────────────
if ($action === 'yazilar') {
    if (!is_dir($SITE_BLOG)) {
        echo json_encode(['success' => false, 'mesaj' => 'Blog dizini bulunamadı: ' . $SITE_BLOG]);
        exit;
    }
    $dosyalar = glob($SITE_BLOG . '/*.html');
    $liste    = [];
    foreach ($dosyalar as $d) {
        if (basename($d) === 'index.html') continue;
        $html  = file_get_contents($d);
        $baslik = '';
        $tarih  = '';
        if (preg_match('/<title>([^<|]+)/', $html, $tm)) $baslik = trim(explode('|', $tm[1])[0]);
        if (preg_match('/<time[^>]*>([^<]+)<\/time>/', $html, $dt)) $tarih = trim($dt[1]);
        $liste[] = [
            'slug'   => basename($d, '.html'),
            'baslik' => $baslik,
            'tarih'  => $tarih,
            'boyut'  => filesize($d),
        ];
    }
    usort($liste, fn($a,$b) => strcmp($b['tarih'], $a['tarih']));
    echo json_encode(['success' => true, 'yazilar' => $liste]);
    exit;
}

// ── GET: yazi?slug=... — tek yazı içeriği ────────────────────────────────────
if ($action === 'yazi') {
    $slug = preg_replace('/[^a-z0-9\-]/', '', $_GET['slug'] ?? '');
    $dosya = $SITE_BLOG . '/' . $slug . '.html';
    if (!file_exists($dosya)) {
        echo json_encode(['success' => false, 'mesaj' => 'Yazı bulunamadı.']);
        exit;
    }
    echo json_encode(['success' => true, 'html' => file_get_contents($dosya)]);
    exit;
}

echo json_encode(['success' => false, 'mesaj' => 'Bilinmeyen action.']);
?>
