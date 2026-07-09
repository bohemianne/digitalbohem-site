<?php
// Tek seferlik temizlik scripti — çalıştıktan sonra .cpanel.yml'den kaldırılacak
if (($_GET['tok'] ?? '') !== 'digi-clean-2026') {
    http_response_code(403);
    echo 'Yasak';
    exit;
}

$base = __DIR__ . '/../';
$silindi = [];
$hata = [];

$sil = [
    // Eski video dosyaları (JSON'da artık referans yok)
    'ornekler/media/video-01.mp4',
    'ornekler/media/video-02.mp4',
    'ornekler/media/video-03.mp4',
    'ornekler/media/video-04.mp4',
    'ornekler/media/video-05.mp4',
    'ornekler/media/video-06.mp4',
    'ornekler/media/video-31.mp4',
    'ornekler/media/video-32.mp4',
    'ornekler/media/video-33.mp4',
    'ornekler/media/video-34.mp4',
    'ornekler/media/video-35.mp4',
    'ornekler/media/video-36.mp4',
    // Eski PDF dosyaları (pdf-02.pdf hariç — JSON'da kullanımda)
    'ornekler/media/pdf-01.pdf',
    'ornekler/media/pdf-03.pdf',
    'ornekler/media/pdf-04.pdf',
    'ornekler/media/pdf-05.pdf',
    'ornekler/media/pdf-06.pdf',
    'ornekler/media/pdf-07.pdf',
    'ornekler/media/pdf-08.pdf',
    'ornekler/media/pdf-09.pdf',
    'ornekler/media/pdf-10.pdf',
    'ornekler/media/pdf-11.pdf',
    'ornekler/media/pdf-12.pdf',
    'ornekler/media/pdf-13.pdf',
    'ornekler/media/pdf-14.pdf',
    'ornekler/media/pdf-15.pdf',
    // Test dosyaları
    'api/tg-test.html',
    'api/upload.php',
];

foreach ($sil as $rel) {
    $yol = realpath($base . $rel);
    if ($yol && file_exists($yol)) {
        if (unlink($yol)) {
            $silindi[] = $rel;
        } else {
            $hata[] = $rel . ' (silinemedi)';
        }
    }
}

header('Content-Type: text/plain; charset=utf-8');
echo "=== TEMIZLIK TAMAMLANDI ===\n\n";
echo "Silinen (" . count($silindi) . "):\n";
foreach ($silindi as $f) echo "  ✓ $f\n";
if ($hata) {
    echo "\nHata (" . count($hata) . "):\n";
    foreach ($hata as $f) echo "  ✗ $f\n";
}
echo "\nBu scripti artık .cpanel.yml'den kaldırabilirsiniz.\n";
