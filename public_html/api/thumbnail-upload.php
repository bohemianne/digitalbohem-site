<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$THUMB_DIR = __DIR__ . '/../ornekler/thumbnails/';
if (!is_dir($THUMB_DIR)) mkdir($THUMB_DIR, 0755, true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($_FILES['thumbnail'])) {
    echo json_encode(['success' => false, 'mesaj' => 'Dosya gönderilmedi.']);
    exit;
}

$f    = $_FILES['thumbnail'];
$ext  = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
$izin = ['jpg', 'jpeg', 'png', 'webp'];

if (!in_array($ext, $izin)) {
    echo json_encode(['success' => false, 'mesaj' => 'Sadece JPG, PNG veya WebP yüklenebilir.']);
    exit;
}
if ($f['size'] > 10 * 1024 * 1024) {
    echo json_encode(['success' => false, 'mesaj' => 'Dosya 10MB\'dan büyük olamaz.']);
    exit;
}

// GD ile sıkıştır ve JPEG olarak kaydet
$dosya_adi = 'ornek-' . time() . '-' . bin2hex(random_bytes(4)) . '.jpg';
$hedef     = $THUMB_DIR . $dosya_adi;

$kaynak = match ($ext) {
    'png'  => imagecreatefrompng($f['tmp_name']),
    'webp' => imagecreatefromwebp($f['tmp_name']),
    default => imagecreatefromjpeg($f['tmp_name']),
};

if (!$kaynak) {
    echo json_encode(['success' => false, 'mesaj' => 'Resim okunamadı.']);
    exit;
}

$orijW = imagesx($kaynak);
$orijH = imagesy($kaynak);

// Max 1200px uzun kenar, oranı koru
$maxPx = 1200;
if ($orijW > $maxPx || $orijH > $maxPx) {
    $oran = min($maxPx / $orijW, $maxPx / $orijH);
    $yeniW = (int) round($orijW * $oran);
    $yeniH = (int) round($orijH * $oran);
} else {
    $yeniW = $orijW;
    $yeniH = $orijH;
}

$hedefImg = imagecreatetruecolor($yeniW, $yeniH);

// PNG saydamlığını beyaz arka plana dönüştür
if ($ext === 'png') {
    $beyaz = imagecolorallocate($hedefImg, 255, 255, 255);
    imagefill($hedefImg, 0, 0, $beyaz);
}

imagecopyresampled($hedefImg, $kaynak, 0, 0, 0, 0, $yeniW, $yeniH, $orijW, $orijH);

if (!imagejpeg($hedefImg, $hedef, 82)) {
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
