<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$UPLOAD_DIR = __DIR__ . '/../uploads/sosyal/';
if (!is_dir($UPLOAD_DIR)) mkdir($UPLOAD_DIR, 0755, true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($_FILES['gorsel'])) {
    echo json_encode(['success' => false, 'mesaj' => 'Dosya gönderilmedi.']);
    exit;
}

$f   = $_FILES['gorsel'];
$ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));

if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) {
    echo json_encode(['success' => false, 'mesaj' => 'Sadece JPG, PNG veya WebP yüklenebilir.']);
    exit;
}
if ($f['size'] > 10 * 1024 * 1024) {
    echo json_encode(['success' => false, 'mesaj' => 'Dosya 10MB\'dan büyük olamaz.']);
    exit;
}

if ($ext === 'png') {
    $kaynak = imagecreatefrompng($f['tmp_name']);
} elseif ($ext === 'webp') {
    $kaynak = imagecreatefromwebp($f['tmp_name']);
} else {
    $kaynak = imagecreatefromjpeg($f['tmp_name']);
}

if (!$kaynak) {
    echo json_encode(['success' => false, 'mesaj' => 'Resim okunamadı. GD kütüphanesi eksik olabilir.']);
    exit;
}

$orijW = imagesx($kaynak);
$orijH = imagesy($kaynak);

$maxPx = 1920;
if ($orijW > $maxPx || $orijH > $maxPx) {
    $oran  = min($maxPx / $orijW, $maxPx / $orijH);
    $yeniW = (int) round($orijW * $oran);
    $yeniH = (int) round($orijH * $oran);
} else {
    $yeniW = $orijW;
    $yeniH = $orijH;
}

$hedefImg = imagecreatetruecolor($yeniW, $yeniH);
$beyaz    = imagecolorallocate($hedefImg, 255, 255, 255);
imagefill($hedefImg, 0, 0, $beyaz);
imagecopyresampled($hedefImg, $kaynak, 0, 0, 0, 0, $yeniW, $yeniH, $orijW, $orijH);

$dosya_adi = 'sosyal-' . time() . '-' . bin2hex(random_bytes(4)) . '.jpg';
$hedef     = $UPLOAD_DIR . $dosya_adi;

if (!imagejpeg($hedefImg, $hedef, 85)) {
    imagedestroy($kaynak);
    imagedestroy($hedefImg);
    echo json_encode(['success' => false, 'mesaj' => 'Dosya kaydedilemedi.']);
    exit;
}

imagedestroy($kaynak);
imagedestroy($hedefImg);

echo json_encode([
    'success' => true,
    'url'     => '/uploads/sosyal/' . $dosya_adi,
]);
?>
