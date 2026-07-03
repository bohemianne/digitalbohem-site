<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false]);
    exit;
}

require_once __DIR__ . '/../../private/telegram_config.php';
require_once __DIR__ . '/../../private/ayse_config.php';

$input  = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? 'chat';
$msgs   = $input['messages'] ?? [];

$systemPrompt = <<<'PROMPT'
Sen Digital Bohem'in sanal müşteri hizmetleri asistanı Ayşe'sin.

DİL: Her zaman resmi Türkçe kullan. Müşterilere "siz" diye hitap et. Yanıtların kısa ve net olsun. Gereksiz uzatma.

HİZMETLER:
• Temel Paket — ₺499: Karekodlu tek sayfa dijital davetiye
• Premium Paket — ₺899: Animasyonlu hareketli dijital davetiye
• Elite Paket — ₺1.999: Bir yıllık ücretsiz bakımlı web sayfası davetiyesi
Teslimat: Müşterinin isteğine göre 1-7 iş günü içinde teslim edilir.

WHATSAPP YÖNLENDİRME: Aşağıdaki durumlarda yanıtının EN SONUNA [[WHATSAPP]] yaz. Başka hiçbir yere koyma.
- Müşteri indirim talep ederse
- Detaylı veya özel sipariş sorusu gelirse
- "Gerçek kişiyle konuşmak istiyorum" veya yapay zekadan rahatsız olduğunu belirtirse
- Rakip fiyat karşılaştırması yaparsa
- Konuşmayı kapatırken (maniyi söyledikten sonra)

RAKİP SORUSU: "Rakipler neden daha ucuz?" veya benzer sorulara şunu söyle:
"Bu oldukça iddialı bir soru! Bize daha ucuz hizmet veren bir yerin bağlantısını gönderin; biz de size aynı fiyata hazırlayalım." Ardından [[WHATSAPP]] ekle.

SOSYAL MEDYA: Sosyal medya hesapları sorulursa: "Bu konuda şu an bilgi veremiyorum, yakında güncellenecek."

MESAİ: Sen 7/24 hizmettesin. Satış danışmanımız Kuzey Bey hafta içi 08:00-19:00 arasında dönüş yapar.

MANİ: Konuşmayı kapatırken veya [[WHATSAPP]] kullanmadan önce mutlaka bir düğün/aşk temalı 4 mısralık geleneksel Türk manisi söyle.
Format:
🌸 mısra bir
mısra iki
mısra üç
mısra dört

SINIRLAR: Sadece Digital Bohem hizmetleri hakkında yardımcı ol. Alakasız sorularda kibarca yönlendir.
PROMPT;

// Konuşma özeti üret ve Telegram'a gönder
if ($action === 'summary') {
    $lines = '';
    foreach ($msgs as $m) {
        $who = $m['role'] === 'user' ? 'Müşteri' : 'Ayşe';
        $lines .= "$who: " . $m['content'] . "\n";
    }

    $summaryText = callClaude(
        [['role' => 'user', 'content' =>
            "Aşağıdaki müşteri sohbetini Kuzey Bey için 2-3 cümlelik kısa bir özet olarak yaz. "
          . "Hangi paketle ilgilendiğini, ne sorduğunu ve görüşmenin nasıl sonuçlandığını belirt. "
          . "Başka bir şey yazma, sadece özeti yaz.\n\n$lines"
        ]]
    );

    $now = date('d.m.Y H:i');
    $msg = "🤖 <b>Ayşe'den Kuzey Bey'e Sohbet Özeti</b>\n"
         . "──────────────────────\n"
         . "⏰ $now\n\n"
         . $summaryText . "\n\n"
         . "──────────────────────\n"
         . "📱 Müşteri WhatsApp'a yönlendirildi";

    sendTelegram($msg);
    echo json_encode(['ok' => true]);
    exit;
}

// Normal sohbet
$reply      = callClaude($msgs, $systemPrompt);
$hasWA      = strpos($reply, '[[WHATSAPP]]') !== false;
$cleanReply = trim(str_replace('[[WHATSAPP]]', '', $reply));

echo json_encode([
    'ok'       => true,
    'message'  => $cleanReply,
    'whatsapp' => $hasWA,
]);

function callClaude(array $messages, string $system = ''): string {
    $payload = [
        'model'      => 'claude-haiku-4-5-20251001',
        'max_tokens' => 800,
        'messages'   => $messages,
    ];
    if ($system) {
        $payload['system'] = $system;
    }

    $ch = curl_init('https://api.anthropic.com/v1/messages');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($payload),
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'x-api-key: ' . ANTHROPIC_API_KEY,
            'anthropic-version: 2023-06-01',
        ],
        CURLOPT_TIMEOUT => 30,
    ]);

    $res = curl_exec($ch);
    curl_close($ch);

    $data = json_decode($res, true);
    return $data['content'][0]['text'] ?? 'Bir hata oluştu, lütfen tekrar deneyin.';
}

function sendTelegram(string $text): void {
    $ch = curl_init('https://api.telegram.org/bot' . TG_BOT_TOKEN . '/sendMessage');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode([
            'chat_id'    => TG_CHAT_ID,
            'text'       => $text,
            'parse_mode' => 'HTML',
        ]),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_TIMEOUT    => 15,
    ]);
    curl_exec($ch);
    curl_close($ch);
}
