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
$izin = ['jpg','jpeg','png','webp'];

if (!in_array($ext, $izin)) {
    echo json_encode(['success' => false, 'mesaj' => 'Sadece JPG, PNG veya WebP yüklenebilir.']);
    exit;
}
if ($f['size'] > 5 * 1024 * 1024) {
    echo json_encode(['success' => false, 'mesaj' => 'Dosya 5MB\'dan büyük olamaz.']);
    exit;
}

$dosya_adi = 'ornek-' . time() . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
$hedef     = $THUMB_DIR . $dosya_adi;

if (!move_uploaded_file($f['tmp_name'], $hedef)) {
    echo json_encode(['success' => false, 'mesaj' => 'Dosya kaydedilemedi.']);
    exit;
}

echo json_encode([
    'success' => true,
    'path'    => 'ornekler/thumbnails/' . $dosya_adi,
    'url'     => '/ornekler/thumbnails/' . $dosya_adi,
]);
?>
