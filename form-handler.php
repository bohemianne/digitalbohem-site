<?php
header('Content-Type: application/json');

// Yalnızca POST kabul et
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok' => false, 'msg' => 'Geçersiz istek.']);
    exit;
}

// Girdileri temizle
function clean($val) {
    return htmlspecialchars(strip_tags(trim($val)), ENT_QUOTES, 'UTF-8');
}

$ad_soyad     = clean($_POST['ad_soyad'] ?? '');
$telefon      = clean($_POST['telefon'] ?? '');
$email        = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$paket        = clean($_POST['paket'] ?? '');
$dugun_tarihi = clean($_POST['dugun_tarihi'] ?? '');
$mesaj        = clean($_POST['mesaj'] ?? '');

// Zorunlu alanlar
if (empty($ad_soyad) || empty($telefon)) {
    echo json_encode(['ok' => false, 'msg' => 'Ad soyad ve telefon zorunludur.']);
    exit;
}

// E-posta içeriği
$to      = 'nursengineerl@gmail.com';
$subject = "Yeni Sipariş: $paket — $ad_soyad";

$body  = "YENİ SİPARİŞ — Digital Bohem\n";
$body .= str_repeat('-', 40) . "\n";
$body .= "Ad Soyad    : $ad_soyad\n";
$body .= "Telefon     : $telefon\n";
$body .= "E-posta     : $email\n";
$body .= "Paket       : $paket\n";
$body .= "Düğün Tarihi: $dugun_tarihi\n";
$body .= "Notlar      : $mesaj\n";
$body .= str_repeat('-', 40) . "\n";
$body .= "Gönderim zamanı: " . date('d.m.Y H:i') . "\n";

$headers  = "From: noreply@digitalbohem.com.tr\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

if (mail($to, $subject, $body, $headers)) {
    echo json_encode(['ok' => true]);
} else {
    echo json_encode(['ok' => false, 'msg' => 'Mail gönderilemedi, lütfen WhatsApp\'tan yazın.']);
}
?>
