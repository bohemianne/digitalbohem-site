# Digital Bohem — Proje Handoff

## Genel Bakış

Dijital düğün davetiyesi satış sitesi. Türkçe, tek dilli. Üç paket: Temel (₺499), Premium (₺899), Elite (₺1.499).

**Canlı URL:** https://digitalbohem.com.tr  
**Instagram:** https://instagram.com/digital.davet  
**WhatsApp:** 0530 773 22 70

---

## Deployment

**Git → cPanel otodeploy.**  
`git push origin main` yaptığında cPanel `.cpanel.yml` dosyasını çalıştırır ve repo kökündeki dosyaları `/home/digi7586/public_html/`'e kopyalar.

```bash
cd ~/Masaüstü/digitalbohem-site
git add .
git commit -m "mesaj"
git push origin main   # canlıya otomatik gider
```

Remote: `git@github-digitalbohem:bohemianne/digitalbohem-site.git`  
SSH alias `github-digitalbohem` → `~/.ssh/config`'de tanımlı.

---

## Dosya Yapısı

```
digitalbohem-site/
├── index.html              # Ana sayfa (paketler + referanslar + form modal)
├── ornekler.html           # Örnek davetiye galerisi (JSON'dan dinamik)
├── hakkimizda.html         # Hakkımızda sayfası
├── blog/index.html         # Blog listesi
├── admin.php               # Admin paneli giriş + yönetim (şifreli)
├── form-handler.php        # Sipariş formu → Telegram bot + e-posta
├── ornekler-data.json      # Örnek davetiye verileri (admin'den düzenlenir)
├── sitemap.xml
├── robots.txt
├── .cpanel.yml             # cPanel otodeploy görevleri
│
└── assets/css/
    ├── style.css           # Ana tema (header, hero, paketler, footer)
    ├── form.css            # Referans şeridi + sipariş form modali
    ├── ornekler.css        # Örnekler sayfası stilleri
    ├── blog.css            # Blog sayfası stilleri
    └── hakkimizda.css      # Hakkımızda sayfası stilleri
```

---

## Renk Teması

Buz mavisi + fuşya pembe + beyaz (Haziran 2026'da güncellendi).

| Değişken | Değer | Kullanım |
|---|---|---|
| `--fuchsia` | `#e91e8c` | Logo, butonlar, fiyatlar, featured kart |
| `--fuchsia-light` | `#ff6db7` | Hover efektleri |
| `--ice` | `#4bbfe3` | Border, onay tikleri |
| `--ice-light` | `#a8dff5` | Header border, ayırıcılar |
| `--ice-pale` | `#e8f7fd` | Bölüm arka planları |
| `--text` | `#1e2a38` | Ana metin |
| `--text-muted` | `#6b7e94` | İkincil metin |

Hero banner: `linear-gradient(135deg, #4bbfe3 → #9ad8f0 → #f8f0ff → #ffb3de → #e91e8c)`

---

## Sipariş Formu

`form-handler.php` iki şey yapar:
1. **Telegram:** Bot token + chat ID'ye mesaj gönderir
2. **E-posta:** `mail()` ile bildirim

Telegram ayarları `form-handler.php` içinde tanımlı. Değiştirmek için dosyayı düzenle → push et.

---

## Admin Paneli

`/admin.php` adresinden erişilir. Şifre `admin.php` içinde hash olarak saklanıyor.  
Oturum açınca örnek davetiye ekle/sil yapılabilir; değişiklikler `ornekler-data.json`'a yazılır.

> Not: `ornekler-data.json` deploy sırasında **üzerine yazılmaz** (`.cpanel.yml`'de koşullu kopyalama: `test -f ... || cp ...`). Canlıdaki JSON korunur.

---

## Örnekler Galerisi

`ornekler.html` → `ornekler-data.json`'u fetch ederek kartları oluşturur.  
Her kart: `{ "baslik", "aciklama", "emoji", "kategori", "canvaUrl" }` alanlarına sahip.  
Canva URL varsa iframe embed gösterilir.

---

## Notlar

- `public_html/` klasörü repoda var ama deploy'a dahil değil. Eski referans kopyası, silinebilir.
- `borsa.html` aktif değil / menüde yok, eski bir test sayfası.
- Blog şu an tek sayfa (`blog/index.html`), tek yazı şablonu yok — genişletilebilir.
