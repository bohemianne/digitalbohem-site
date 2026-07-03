# Digital Bohem — Proje Handoff

## Son Oturum — 03.07.2026 10:02

**Son commit'ler:**
```
758f66f chore: handoff.md güncelle — sosyal medya sistemi dokümantasyonu
a735090 feat: sosyal medya otomasyon sistemi
cf24d64 chore: handoff.md güncelle — WhatsApp butonu ve main.js notu
611096b feat: WhatsApp kayan buton tüm sayfalarda + mobil menü main.js'e taşındı
a9b3965 chore: handoff.md güncelle — örnekler sistemi ve bu oturum değişiklikleri
```

**Bekleyen değişiklikler:**
```
 M borsa.html
 M hakkimizda.html
 M handoff.md
 M index.html
 M ornekler.html
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
├── ornekler.html           # Örnek davetiye galerisi (API'den yükler)
├── hakkimizda.html         # Hakkımızda sayfası
├── favicon.svg             # Fuşya-mavi gradyanlı yıldız favicon
├── blog/index.html         # Blog listesi sayfası
├── form-handler.php        # Sipariş formu → Telegram + e-posta
├── assets/js/main.js      # Mobil menü + WhatsApp kayan buton (tüm sayfalarda)
├── sitemap.xml / robots.txt
├── .cpanel.yml             # Deploy görevleri
│
├── public_html/            # ← Sunucuya deploy edilen asıl dosyalar
│   ├── admin/
│   │   ├── index.html      # Admin giriş sayfası (şifre: digital2026)
│   │   └── panel.html      # Admin paneli
│   ├── api/
│   │   ├── data.php        # Genel CRUD API + update action (JSON okur/yazar)
│   │   ├── blog.php        # Blog önerileri + onay API
│   │   ├── telegram.php    # Telegram mesaj gönderici
│   │   └── thumbnail-upload.php  # Resim yükle, GD ile sıkıştır (max 1200px, JPEG %82)
│   ├── assets/
│   │   ├── css/style.css   # Admin panel stilleri
│   │   └── js/admin.js     # Admin panel JS
│   ├── ornekler/
│   │   └── thumbnails/     # Yüklenen örnek önizleme resimleri (deploy korunur)
│   └── data/
│       ├── blog_oneriler.json
│       └── blog_yazilar.json
│
└── assets/css/
    ├── style.css / form.css / ornekler.css / blog.css / hakkimizda.css
```

---

## Örnekler Sistemi

`ornekler-data.json` → API üzerinden okunur, `ornekler.html` sayfasında gösterilir.

**Kart tasarımı:** Tam resim + altta başlık overlay. Tıklayınca "Bağlantı URL"ye gider.

**Her örnekte:**
- `baslik`, `kategori` (web/video/pdf), `canva_url` (bağlantı URL), `aciklama`
- `thumbnail` — `ornekler/thumbnails/` altında sıkıştırılmış JPEG
- `thumbnail_position` — sürükleme ile belirlenen `object-position` değeri (örn: `"40% 20%"`)

**Admin paneli Örnekler sekmesi:**
- Ekle / Düzenle / Sil
- Thumbnail yükleyince GD ile sıkıştırılır (PNG→JPEG dahil)
- Yükledikten sonra 280×210 sürükleme kutusundan pozisyon belirlenir
- Liste sırasını ≡ tutamacından sürükle-bırak ile değiştir → otomatik kaydolur

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

| Sekme | Ne yapar |
|---|---|
| Davetiyeler | Müşteri listesi, durum takibi (localStorage — siteye yansımaz) |
| Örnekler | Galeri ekle/düzenle/sil, sürükle-bırak sıralama |
| Fiyatlar | Paket fiyatlarını güncelle |
| Blog | Konu önerilerini gör/onayla + yazıları önizle |
| Sosyal Medya | Ajan tarafından üretilen içerikleri gör, "Yayınlandı" ile işaretle |

---

## Blog Sistemi — Tam Akış

```
Pazartesi 09:30  →  blog-oneri-ajan.sh → API'ye konu önerileri gönderir
Sen              →  Admin → Blog → Onayla/Reddet
Perşembe 19:30   →  blog-yaz-ajan.sh 1  (Konu 1 onaylıysa)
Cumartesi 10:30  →  blog-yaz-ajan.sh 2  (Konu 2 onaylıysa)
                    → blog/ dizinine HTML → git push → cPanel deploy
```

---

## Otomasyon Ajanları (Cron)

Tüm ajanlar `~/.digitalbohem-agents/` altında.

| Zaman | Ajan | Görev |
|---|---|---|
| Pazartesi 09:07 | `icerik-ajan.sh` | Haftalık içerik planı |
| Pazartesi 09:30 | `blog-oneri-ajan.sh` | Blog konu önerileri |
| Çarşamba 09:13 | `seo-ajan.sh` | SEO & rakip takip |
| 1. ve 15. günü 09:17 | `trend-ajan.sh` | Trend araştırması |
| Cuma 09:23 | `teknik-seo-ajan.sh` | Teknik SEO kontrol |
| Cuma 10:00 | `site-updater.sh` | SEO raporundan site güncellemesi |
| Perşembe 19:30 | `blog-yaz-ajan.sh 1` | Konu 1'i yaz |
| Cumartesi 10:30 | `blog-yaz-ajan.sh 2` | Konu 2'yi yaz |
| **Salı 10:00** | `sosyal-medya-ajan.sh` | 5 platform için sosyal içerik üret |
| **Cuma 10:30** | `sosyal-medya-ajan.sh` | 5 platform için sosyal içerik üret |

## Sosyal Medya Akışı

```
Salı 10:00 + Cuma 10:30  →  sosyal-medya-ajan.sh çalışır
   → Claude WebSearch ile güncel trend arar
   → Facebook, LinkedIn, Pinterest, Instagram, YouTube için içerik yazar
   → sosyal.php API'sine kaydeder
Sen  →  Admin → Sosyal Medya → İçerikleri gör
   → Facebook/LinkedIn/Pinterest: metni kopyala, kendin paylaş
   → Instagram: önerilen görsel türü + caption hazır
   → YouTube: 30-60sn Shorts senaryosu hazır
   → "Yayınlandı" butonuna bas → arşive taşınır
```

**API endpoint:** `https://digitalbohem.com.tr/api/sosyal.php`  
**JSON dosyası:** `/public_html/data/sosyal_posts.json` (son 30 gün görünür)

Log: `~/.digitalbohem-agents/logs/cron.log`

---

## Notlar

- `ornekler-data.json` deploy sırasında üzerine yazılmaz.
- `ornekler/thumbnails/` deploy sırasında korunur.
- `data/blog_*.json` deploy sırasında sadece yoksa oluşturulur.
- `borsa.html` aktif değil, eski test sayfası.
- GitHub IP (`140.82.121.4`) değişirse `~/.ssh/config`'i güncelle.
