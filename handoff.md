# Digital Bohem — Proje Handoff

## Son Oturum — 02.07.2026 10:16

**Son commit'ler:**
```
50fb2fd Örnekler: thumbnail resim desteği + hızlı galeri
63107c8 Blog: Elite paket fiyatı ₺1.499→₺1.999 düzelt (3 yazı)
572970d Blog: 3 yazı ekle, branding ve fiyat hataları düzelt
f55974d chore: admin panelden Telegram sekmesi kaldırıldı
bcfae00 fix: yayinla/taslak-yayinla duplicate slug önleme
```

**Bekleyen değişiklikler:**
```
 M handoff.md
?? admin/
?? public_html.zip
?? public_html/.htaccess.bk
?? public_html/borsa/
?? public_html/digitalbohem_site.zip
```

---
## Genel Bakış

Dijital düğün davetiyesi satış sitesi. Türkçe, tek dilli. Üç paket: Temel (₺499), Premium (₺899), Elite (₺1.999).

**Canlı URL:** https://digitalbohem.com.tr  
**Instagram:** https://instagram.com/digital.davet  
**WhatsApp:** 0530 773 22 70

---

## Deployment

**Git → cPanel manuel deploy.**  
Push sonrası cPanel'e giriş yapılıp "Git Version Control → Manage → Deploy HEAD Commit" tıklanması gerekir (webhook kurulu değil).

```bash
cd ~/Masaüstü/digitalbohem-site
git add .
git commit -m "mesaj"
git push origin main
# Ardından cPanel'den Deploy HEAD Commit tıkla
```

**DNS notu:** `github.com` DNS çözümlenemiyor, SSH config'de IP ile gidiyoruz:  
`~/.ssh/config` → `HostName 140.82.121.4` (GitHub IP). IP değişirse güncellenecek.

Remote: `git@github-digitalbohem:bohemianne/digitalbohem-site.git`  
SSH key: `~/.ssh/digitalbohem-github`

---

## Dosya Yapısı

```
digitalbohem-site/
├── index.html              # Ana sayfa
├── ornekler.html           # Örnek davetiye galerisi
├── hakkimizda.html         # Hakkımızda sayfası
├── blog/index.html         # Blog listesi sayfası
├── form-handler.php        # Sipariş formu → Telegram + e-posta
├── sitemap.xml / robots.txt
├── .cpanel.yml             # Deploy görevleri
│
├── public_html/            # ← Sunucuya deploy edilen asıl dosyalar
│   ├── admin/
│   │   ├── index.html      # Admin giriş sayfası (şifre: digital2026)
│   │   └── panel.html      # Admin paneli
│   ├── api/
│   │   ├── data.php        # Genel CRUD API (JSON dosyaları okur/yazar)
│   │   ├── blog.php        # Blog önerileri + onay API
│   │   └── telegram.php    # Telegram mesaj gönderici
│   ├── assets/
│   │   ├── css/style.css   # Admin panel stilleri
│   │   └── js/admin.js     # Admin panel JS
│   └── data/
│       ├── blog_oneriler.json  # Haftalık blog konu önerileri (ajan yazar)
│       └── blog_yazilar.json   # Yayımlanan yazıların listesi
│
└── assets/css/
    ├── style.css / form.css / ornekler.css / blog.css / hakkimizda.css
```

---

## Renk Teması

Buz mavisi + fuşya pembe + beyaz (Haziran 2026'da güncellendi).

| Değişken | Değer | Kullanım |
|---|---|---|
| `--fuchsia` | `#e91e8c` | Logo, butonlar, fiyatlar |
| `--fuchsia-light` | `#ff6db7` | Hover efektleri |
| `--ice` | `#4bbfe3` | Border, onay tikleri |
| `--ice-light` | `#a8dff5` | Header border |
| `--ice-pale` | `#e8f7fd` | Bölüm arka planları |
| `--text` | `#1e2a38` | Ana metin |
| `--text-muted` | `#6b7e94` | İkincil metin |

---

## Admin Paneli

**URL:** `https://digitalbohem.com.tr/admin/`  
**Şifre:** `digital2026`

### Sekmeler

| Sekme | Ne yapar |
|---|---|
| Davetiyeler | Müşteri listesi, durum takibi (localStorage) |
| Örnekler | Site galeri örnekleri ekle/sil |
| Fiyatlar | Paket fiyatlarını güncelle (API'ye kaydeder) |
| **Blog** | Blog konu önerilerini gör/onayla + yazılmış yazıları önizle |
| Telegram | Bot token ve chat ID ayarla |

---

## Blog Sistemi — Tam Akış

Haftada 2 blog yazısı otomatik üretilir. Akış:

```
Pazartesi 09:30  →  blog-oneri-ajan.sh
                    Claude 2 konu önerir
                    → ~/.digitalbohem-agents/blog-oneriler-TARIH.md (local yedek)
                    → https://digitalbohem.com.tr/api/blog.php?action=oneriler-kaydet (canlıya)

Sen              →  Admin paneli → Blog → "Bu Haftanın Konuları"
                    ✅ Onayla veya ✕ Reddet

Perşembe 19:30   →  blog-yaz-ajan.sh 1   (Konu 1 onaylıysa yazar)
Cumartesi 10:30  →  blog-yaz-ajan.sh 2   (Konu 2 onaylıysa yazar)
                    → HTML dosya ~/Masaüstü/digitalbohem-site/blog/ dizinine
                    → Git commit + push → cPanel deploy
```

### Blog API Endpoint'leri

| Endpoint | Açıklama |
|---|---|
| `GET /api/blog.php?action=oneriler` | Bu haftanın öneri konularını getir |
| `POST /api/blog.php?action=oneriler-kaydet` | Ajan yeni önerileri gönderir |
| `POST /api/blog.php?action=onayla` `{"konu":1,"karar":"EVET"}` | Konu onayla/reddet |
| `GET /api/blog.php?action=yazilar` | Yayımlanan yazı listesi |
| `POST /api/blog.php?action=yazi-kaydet` | Blog yazı ajanı yazıyı kaydeder |

---

## Otomasyon Ajanları (Cron)

Tüm ajanlar `~/.digitalbohem-agents/` altında, `bohem` kullanıcısının crontab'ında kayıtlı.

| Zaman | Ajan | Görev |
|---|---|---|
| Pazartesi 09:07 | `icerik-ajan.sh` | Haftalık içerik planı |
| Pazartesi 09:30 | `blog-oneri-ajan.sh` | Blog konu önerileri üret → API'ye gönder |
| Çarşamba 09:13 | `seo-ajan.sh` | SEO & rakip takip raporu |
| 1. ve 15. günü 09:17 | `trend-ajan.sh` | Trend araştırması |
| Cuma 09:23 | `teknik-seo-ajan.sh` | Teknik SEO kontrol |
| Cuma 10:00 | `site-updater.sh` | SEO raporundan site güncellemesi |
| Perşembe 19:30 | `blog-yaz-ajan.sh 1` | Onaylanan Konu 1'i yaz |
| Cumartesi 10:30 | `blog-yaz-ajan.sh 2` | Onaylanan Konu 2'yi yaz |

Log dosyası: `~/.digitalbohem-agents/logs/cron.log`

---

## Sipariş Formu

`form-handler.php` iki şey yapar:
1. **Telegram:** Bot token + chat ID'ye sipariş bildirimi gönderir
2. **E-posta:** `mail()` ile bildirim

Telegram ayarları `form-handler.php` içinde tanımlı. Değiştirmek için düzenle → push et.

---

## Notlar

- `ornekler-data.json` deploy sırasında üzerine yazılmaz (`.cpanel.yml`'de koşullu kopyalama).
- `data/blog_oneriler.json` ve `data/blog_yazilar.json` deploy sırasında sadece yoksa oluşturulur — canlıdaki veriler korunur.
- `borsa.html` aktif değil, eski test sayfası.
- GitHub IP (`140.82.121.4`) değişirse `~/.ssh/config`'i güncelle.
