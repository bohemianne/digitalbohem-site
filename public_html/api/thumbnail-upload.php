<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$THUMB_DIR = __DIR__ . '/../ornekler/thumbnails/';
if (!is_dir($THUMB_DIR)) mkdir($THUMB_DIR, 0755, true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($_FILES['thumbnail'])) {
    echo json_encode(['success' => false, 'mesaj' => 'Dosya gönderilmedi.']);
    exit;
}

$f   = $_FILES['thumbnail'];
$ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));

if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'pdf'])) {
    echo json_encode(['success' => false, 'mesaj' => 'Sadece JPG, PNG, WebP veya PDF yüklenebilir.']);
    exit;
}
if ($f['size'] > 20 * 1024 * 1024) {
    echo json_encode(['success' => false, 'mesaj' => 'Dosya 20MB\'dan büyük olamaz.']);
    exit;
}

$dosya_adi = 'ornek-' . time() . '-' . bin2hex(random_bytes(4)) . '.jpg';
$hedef     = $THUMB_DIR . $dosya_adi;

// PDF → GS ile ilk sayfayı JPEG'e çevir
if ($ext === 'pdf') {
    $tmpJpg = sys_get_temp_dir() . '/' . uniqid('thumb_') . '.jpg';
    $gs = escapeshellcmd('gs') . ' -sDEVICE=jpeg -dNOPAUSE -dBATCH -dFirstPage=1 -dLastPage=1'
        . ' -r150 -dJPEGQ=90'
        . ' -sOutputFile=' . escapeshellarg($tmpJpg)
        . ' ' . escapeshellarg($f['tmp_name']) . ' 2>/dev/null';
    exec($gs, $out, $ret);

    if ($ret !== 0 || !file_exists($tmpJpg)) {
        echo json_encode(['success' => false, 'mesaj' => 'PDF resme dönüştürülemedi. Sunucuda Ghostscript eksik olabilir.']);
        exit;
    }
    $kaynak = imagecreatefromjpeg($tmpJpg);
    @unlink($tmpJpg);
} elseif ($ext === 'png') {
    $kaynak = imagecreatefrompng($f['tmp_name']);
} elseif ($ext === 'webp') {
    $kaynak = imagecreatefromwebp($f['tmp_name']);
} else {
    $kaynak = imagecreatefromjpeg($f['tmp_name']);
}

if (!$kaynak) {
    echo json_encode(['success' => false, 'mesaj' => 'Resim okunamadı.']);
    exit;
}

$orijW = imagesx($kaynak);
$orijH = imagesy($kaynak);
$maxPx = 1200;
if ($orijW > $maxPx || $orijH > $maxPx) {
    $oran  = min($maxPx / $orijW, $maxPx / $orijH);
    $yeniW = (int) round($orijW * $oran);
    $yeniH = (int) round($orijH * $oran);
} else {
    $yeniW = $orijW;
    $yeniH = $orijH;
}

$hedefImg = imagecreatetruecolor($yeniW, $yeniH);
$beyaz = imagecolorallocate($hedefImg, 255, 255, 255);
imagefill($hedefImg, 0, 0, $beyaz);
imagecopyresampled($hedefImg, $kaynak, 0, 0, 0, 0, $yeniW, $yeniH, $orijW, $orijH);

if (!imagejpeg($hedefImg, $hedef, 82)) {
    imagedestroy($kaynak);
    imagedestroy($hedefImg);
    echo json_encode(['success' => false, 'mesaj' => 'Dosya kaydedilemedi.']);
    exit;
}

imagedestroy($kaynak);
imagedestroy($hedefImg);

echo json_encode([
    'success' => true,
    'path'    => 'ornekler/thumbnails/' . $dosya_adi,
    'url'     => '/ornekler/thumbnails/' . $dosya_adi,
]);
?>
