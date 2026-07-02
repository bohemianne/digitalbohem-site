<?php
session_start();

$SIFRE = 'digitalbohem2026';
$JSON_DOSYA = dirname(__DIR__) . '/ornekler-data.json';

// Giriş
if (isset($_POST['sifre'])) {
    if ($_POST['sifre'] === $SIFRE) {
        $_SESSION['admin'] = true;
    } else {
        $hata = 'Şifre yanlış.';
    }
}

if (isset($_POST['cikis'])) {
    session_destroy();
    header('Location: ornek-ekle.php');
    exit;
}

// Örnek ekle
$mesaj = '';
if ($_SESSION['admin'] && $_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['baslik'])) {
    $yeni = [
        'id'        => 'ornek-' . time(),
        'baslik'    => htmlspecialchars(trim($_POST['baslik']), ENT_QUOTES),
        'kategori'  => in_array($_POST['kategori'], ['web','video','pdf']) ? $_POST['kategori'] : 'web',
        'canva_url' => trim($_POST['canva_url']),
        'aciklama'  => htmlspecialchars(trim($_POST['aciklama']), ENT_QUOTES),
    ];

    $liste = file_exists($JSON_DOSYA) ? json_decode(file_get_contents($JSON_DOSYA), true) : [];
    if (!is_array($liste)) $liste = [];
    $liste[] = $yeni;

    if (file_put_contents($JSON_DOSYA, json_encode($liste, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT))) {
        $mesaj = 'ok';
    } else {
        $mesaj = 'err';
    }
}

// Sil
if ($_SESSION['admin'] && isset($_GET['sil'])) {
    $liste = file_exists($JSON_DOSYA) ? json_decode(file_get_contents($JSON_DOSYA), true) : [];
    $liste = array_values(array_filter($liste, fn($o) => $o['id'] !== $_GET['sil']));
    file_put_contents($JSON_DOSYA, json_encode($liste, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    header('Location: ornek-ekle.php');
    exit;
}

$liste = file_exists($JSON_DOSYA) ? json_decode(file_get_contents($JSON_DOSYA), true) : [];
if (!is_array($liste)) $liste = [];
?>
<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Örnek Ekle — Digital Bohem Admin</title>
<meta name="robots" content="noindex, nofollow">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: #f5f4f2; color: #222; }
  .wrap { max-width: 700px; margin: 2.5rem auto; padding: 0 1rem; }
  h1 { font-size: 1.4rem; margin-bottom: 1.75rem; color: #1a1a1a; }
  .card { background: #fff; border-radius: 12px; padding: 1.75rem; box-shadow: 0 2px 12px rgba(0,0,0,0.07); margin-bottom: 1.5rem; }
  label { display: block; font-size: 0.82rem; font-weight: 600; color: #555; margin-bottom: 0.3rem; margin-top: 0.9rem; }
  label:first-child { margin-top: 0; }
  input, select, textarea {
    width: 100%; padding: 0.6rem 0.9rem; border: 1.5px solid #ddd;
    border-radius: 8px; font-size: 0.95rem; font-family: inherit; background: #fafafa;
  }
  input:focus, select:focus, textarea:focus { outline: none; border-color: #c9a84c; background: #fff; }
  textarea { min-height: 70px; resize: vertical; }
  .btn { display: inline-block; padding: 0.65rem 1.5rem; background: #c9a84c; color: #fff; border: none; border-radius: 8px; font-size: 0.95rem; cursor: pointer; font-family: inherit; font-weight: 600; }
  .btn:hover { background: #b8973d; }
  .btn-danger { background: #e74c3c; }
  .btn-danger:hover { background: #c0392b; }
  .alert { padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.9rem; }
  .alert-ok  { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
  .alert-err { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
  table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
  th { text-align: left; padding: 0.5rem 0.75rem; background: #f5f4f2; color: #555; font-weight: 600; border-bottom: 1px solid #eee; }
  td { padding: 0.6rem 0.75rem; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  .etiket { font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 5px; background: #fef3cd; color: #856404; }
  a.del-link { color: #e74c3c; font-size: 0.8rem; text-decoration: none; }
  a.del-link:hover { text-decoration: underline; }
  .sifre-form { max-width: 360px; margin: 4rem auto; }
  .nav-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.75rem; }
  .nav-bar a { color: #888; font-size: 0.85rem; text-decoration: none; }
  .nav-bar a:hover { color: #c9a84c; }
</style>
</head>
<body>
<div class="wrap">

<?php if (!$_SESSION['admin']): ?>
  <div class="card sifre-form">
    <h1>Admin Girişi</h1>
    <?php if (isset($hata)): ?><div class="alert alert-err"><?= $hata ?></div><?php endif; ?>
    <form method="post">
      <label>Şifre</label>
      <input type="password" name="sifre" autofocus>
      <br><br>
      <button class="btn" type="submit">Giriş</button>
    </form>
  </div>

<?php else: ?>
  <div class="nav-bar">
    <h1>Örnek Ekle</h1>
    <div>
      <a href="../ornekler.html" target="_blank">← Siteye git</a>
      &nbsp;&nbsp;
      <form method="post" style="display:inline"><button name="cikis" value="1" style="background:none;border:none;color:#888;cursor:pointer;font-size:0.85rem;">Çıkış</button></form>
    </div>
  </div>

  <?php if ($mesaj === 'ok'): ?>
    <div class="alert alert-ok">Örnek eklendi!</div>
  <?php elseif ($mesaj === 'err'): ?>
    <div class="alert alert-err">Dosya yazılamadı. cPanel'de ornekler-data.json dosyasına yazma izni ver (chmod 644).</div>
  <?php endif; ?>

  <div class="card">
    <form method="post">
      <label>Başlık</label>
      <input type="text" name="baslik" placeholder="Zeynep & Ali — Düğün Web Sitesi" required>

      <label>Kategori</label>
      <select name="kategori">
        <option value="web">🌐 Web Sitesi</option>
        <option value="video">🎬 Video</option>
        <option value="pdf">📄 PDF</option>
      </select>

      <label>Canva URL</label>
      <input type="url" name="canva_url" placeholder="https://www.canva.com/design/XXX/view?embed" required>
      <small style="color:#aaa;font-size:0.78rem">view veya view?embed — ikisi de olur</small>

      <label>Kısa Açıklama</label>
      <textarea name="aciklama" placeholder="Krem tonlarında zarif düğün sayfası"></textarea>

      <br>
      <button class="btn" type="submit">Ekle</button>
    </form>
  </div>

  <?php if ($liste): ?>
  <div class="card">
    <table>
      <thead><tr><th>Başlık</th><th>Kategori</th><th></th></tr></thead>
      <tbody>
      <?php foreach (array_reverse($liste) as $o): ?>
        <tr>
          <td><?= htmlspecialchars($o['baslik']) ?></td>
          <td><span class="etiket"><?= htmlspecialchars($o['kategori']) ?></span></td>
          <td><a href="?sil=<?= urlencode($o['id']) ?>" class="del-link" onclick="return confirm('Silinsin mi?')">Sil</a></td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  </div>
  <?php endif; ?>

<?php endif; ?>
</div>
</body>
</html>
