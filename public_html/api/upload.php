<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$uploadDir = __DIR__ . '/../assets/images/';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Sadece POST desteklenir']);
    exit;
}

if (!isset($_FILES['file'])) {
    echo json_encode(['success' => false, 'message' => 'Dosya bulunamadı']);
    exit;
}

$file = $_FILES['file'];
$allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

if (!in_array($ext, $allowed)) {
    echo json_encode(['success' => false, 'message' => 'Geçersiz dosya formatı']);
    exit;
}

if ($file['size'] > 5 * 1024 * 1024) {
    echo json_encode(['success' => false, 'message' => 'Dosya 5MB'dan büyük']);
    exit;
}

$filename = uniqid() . '_' . basename($file['name']);
$target = $uploadDir . $filename;

if (move_uploaded_file($file['tmp_name'], $target)) {
    echo json_encode([
        'success' => true,
        'message' => 'Yüklendi',
        'url' => 'assets/images/' . $filename
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Yükleme hatası']);
}
?>