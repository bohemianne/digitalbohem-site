<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$MEDIA_DIR = __DIR__ . '/../ornekler/media/';
if (!is_dir($MEDIA_DIR)) mkdir($MEDIA_DIR, 0755, true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($_FILES['media'])) {
    echo json_encode(['success' => false, 'mesaj' => 'Dosya gönderilmedi.']);
    exit;
}

$f   = $_FILES['media'];
$ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));

if (!in_array($ext, ['mp4', 'pdf', 'jpg', 'jpeg', 'png', 'webp'])) {
    echo json_encode(['success' => false, 'mesaj' => 'Sadece MP4, PDF veya resim (JPG/PNG/WebP) yüklenebilir.']);
    exit;
}
if ($f['size'] > 100 * 1024 * 1024) {
    echo json_encode(['success' => false, 'mesaj' => 'Dosya 100MB\'dan büyük olamaz.']);
    exit;
}

$dosya_adi = 'media-' . time() . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
$hedef     = $MEDIA_DIR . $dosya_adi;

if (!move_uploaded_file($f['tmp_name'], $hedef)) {
    echo json_encode(['success' => false, 'mesaj' => 'Dosya kaydedilemedi.']);
    exit;
}

echo json_encode([
    'success' => true,
    'path'    => 'ornekler/media/' . $dosya_adi,
]);
?>
