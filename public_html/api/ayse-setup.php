<?php
// TEK KULLANIMLIK KURULUM — Çalıştırdıktan sonra SİL
$target = realpath(__DIR__ . '/../../') . '/private/ayse_config.php';
$dir    = dirname($target);

echo "<pre>\n";
echo "Hedef klasör : $dir\n";
echo "Klasör var   : " . (is_dir($dir) ? 'EVET' : 'HAYIR — oluşturulacak') . "\n";

if (!is_dir($dir)) {
    mkdir($dir, 0750, true);
    echo "Klasör oluşturuldu: $dir\n";
}

$key = $_POST['key'] ?? '';
if ($key) {
    file_put_contents($target, "<?php\ndefine('ANTHROPIC_API_KEY', '" . addslashes($key) . "');\n");
    echo file_exists($target) ? "✅ ayse_config.php oluşturuldu!\n" : "❌ Dosya oluşturulamadı.\n";
} else {
    echo "\nAşağıdaki formu doldur:\n</pre>";
    echo '<form method="post">
      <input name="key" type="text" style="width:500px" placeholder="sk-ant-..." required>
      <button type="submit">Oluştur</button>
    </form>';
}
echo "</pre>";
