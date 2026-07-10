# Digital Bohem — Proje Handoff

## Son Oturum — 10.07.2026 10:01

**Son commit'ler:**
```
a83c364 fix: kaydırma sırasında kart açılma sorunu giderildi
d5d5095 fix: çift acOnizle çağrısı engellendi (takılma sorunu)
8cc3905 fix: mobil modal ekrana sığma sorunu giderildi
d5861e6 fix: mobil tıklama sorunu giderildi (iOS Safari uyumluluğu)
40fbd4e Handoff güncellendi — 09.07.2026 oturum özeti
```

**Bekleyen değişiklikler:**
```
 M handoff.md
```

---
## Örnekler Sistemi — Güncel Durum ✅

**Tamamlanan işler (bu oturumda):**
- 6 MP4 video + 11 PNG resim + 1 PDF admin panelinden yüklendi, canlıda görünüyor
- Karta tıklayınca önizleme modalı açılıyor (MP4, PDF, PNG/JPG/WebP destekleniyor)
- Canva örnekler / önizlemeli örnekler arası ayraç ("Canva bağlantısı açılmıyorsa…")
- Admin panelinde düzenlerken küçük thumbnail gösterimi eklendi
- `.htaccess`'e MP4 ve PDF MIME türleri eklendi (video oynatma sorunu çözüldü)
- Site sağlık kontrolü: tüm sayfalar 200 OK
- 28 gereksiz dosya sunucudan temizlendi (12 eski video, 14 eski PDF, 2 test dosyası)

**Sunucudaki önizleme dosyaları (`ornekler/media/`):**
- 6 MP4 video (~1–8 MB), 11 PNG resim (84 KB–1.4 MB), 1 PDF
- En büyük dosya: `media-1783598546-eee8d8a3.mp4` ~7.7 MB (kabul edilebilir)
- `pdf-02.pdf` hâlâ referanslı — silme!

**Sunucuda GS (Ghostscript) yok** → PDF → thumbnail dönüşümü yapılamıyor. Thumbnail olarak sadece JPG/PNG/WebP kabul ediliyor.

**Yapılacak (isteğe bağlı):**
- 7.7 MB'lık videoyu yerel olarak `ffmpeg -crf 28` ile yeniden sıkıştırıp yüklemek mümkün
- `ornekler-data.json` Admin panelinden yönetiliyor; File Manager ile manuel yükleme gerekmez artık

---
## Genel Bakış

Dijital düğün davetiyesi satış sitesi. Türkçe, tek dilli. Üç paket: Temel (₺499), Premium (₺899), Elite (₺1.999).

**Hizmet modeli:** Self-service değil, kişisel hizmet. Müşteri bilgi verir veya dış örnek gösterir, tasarımcı sıfırdan tasarlar, 24 saat içinde teslim. Elite pakette 12 ay boyunca tüm bakım (güncelleme, ekleme) tarafımızdan yapılır.

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
├── favicon.svg
├── blog/index.html         # Blog listesi sayfası
├── sitemap.xml / robots.txt
├── assets/js/main.js       # Mobil menü + WhatsApp kayan buton
│
├── public_html/            # ← Sunucuya deploy edilen asıl dosyalar
│   ├── admin/
│   │   ├── index.html      # Admin giriş (şifre: digital2026)
│   │   └── panel.html      # Admin paneli
│   ├── api/
│   │   ├── data.php        # Genel CRUD API (JSON okur/yazar)
│   │   ├── blog.php        # Blog önerileri + onay + taslak API
│   │   ├── blog-resim-upload.php  # Blog editörü için resim yükleme (blog/resimler/)
│   │   ├── telegram.php    # Telegram mesaj gönderici
│   │   ├── thumbnail-upload.php   # Örnek thumbnail yükleme
│   │   └── chat.php        # Ayşe sohbet ajanı backend
│   ├── assets/
│   │   ├── css/style.css   # Admin + genel stiller
│   │   └── js/admin.js     # Admin panel JS
│   ├── ornekler/thumbnails/  # Yüklenen thumbnail'ler (deploy korunur)
│   ├── blog/
│   │   ├── taslaklar/      # Onay bekleyen taslaklar (sunucuda)
│   │   └── resimler/       # Blog editöründen yüklenen resimler
│   └── data/
│       ├── blog_oneriler.json
│       ├── blog_taslaklar.json
│       └── blog_yazilar.json
│
└── assets/css/
    ├── style.css / form.css / ornekler.css / blog.css / hakkimizda.css
```

---

## Örnekler Sistemi

`ornekler-data.json` → API üzerinden okunur, `ornekler.html` sayfasında gösterilir.

**Her örnekte:**
- `baslik`, `kategori` (web/video/pdf), `canva_url` (bağlantı URL), `aciklama`
- `thumbnail` — `ornekler/thumbnails/` altında sıkıştırılmış JPEG
- `thumbnail_position` — sürükleme ile belirlenen `object-position` değeri

**Admin paneli Örnekler sekmesi:**
- Ekle / Düzenle / Sil
- Thumbnail yükleyince GD ile sıkıştırılır (max 1200px, JPEG %82)
- 280×210 sürükleme kutusundan pozisyon belirlenir
- ≡ tutamacından sürükle-bırak ile sıralama

---

## Renk Teması

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
| Davetiyeler | Müşteri listesi, durum takibi (localStorage) |
| Örnekler | Galeri ekle/düzenle/sil, sürükle-bırak sıralama |
| Fiyatlar | Paket fiyatlarını güncelle |
| Blog | Konu öner/onayla + taslak gör/düzenle/yayınla/reddet |

---

## Blog Sistemi — Tam Akış

```
Pazartesi 09:30  →  blog-oneri-ajan.sh → API'ye 2 konu önerisi gönderir
Sen              →  Admin → Blog → "Bu Haftanın Konuları" → Onayla/Reddet
Perşembe 19:30   →  blog-yaz-ajan.sh 1  (EVET veya YENIDEN_YAZ ise yazar)
Cumartesi 10:30  →  blog-yaz-ajan.sh 2  (EVET veya YENIDEN_YAZ ise yazar)
                    → taslak-kaydet API → sunucuda blog/taslaklar/ altına kaydeder
Sen              →  Admin → Blog → "Taslaklar" sekmesi
                    → Önizle / Düzenle (metin + resim ekle) / Yayınla / Yeniden Yaz
"Yayınla"        →  taslak-yayinla API → blog/ altına taşır, blog/index.html'e kart ekler
"Yeniden Yaz"    →  taslak-reddet API → taslak silinir, konu YENIDEN_YAZ işaretlenir
                    → Perşembe/Cumartesi ajanı tekrar yazar
```

**Blog editöründe resim ekleme:**
Admin → Blog → Taslaklar → Düzenle → araç çubuğunda "🖼 Resim Ekle" → dosya seç → `blog-resim-upload.php`'ye yüklenir → yazının içine yerleştirilir.

---

## Otomasyon Ajanları (Cron)

Tüm ajanlar `~/.digitalbohem-agents/` altında. Log: `~/.digitalbohem-agents/logs/cron.log`

| Zaman | Ajan | Görev |
|---|---|---|
| Pazartesi 09:07 | `icerik-ajan.sh` | Haftalık içerik planı |
| Pazartesi 09:30 | `blog-oneri-ajan.sh` | Blog konu önerileri → API'ye gönderir |
| Çarşamba 09:13 | `seo-ajan.sh` | SEO & rakip takip raporu |
| 1. ve 15. günü 09:17 | `trend-ajan.sh` | Trend araştırması |
| Cuma 09:23 | `teknik-seo-ajan.sh` | Teknik SEO kontrol |
| Cuma 10:00 | `site-updater.sh` | SEO raporundan site güncellemesi |
| Perşembe 19:30 | `blog-yaz-ajan.sh 1` | Konu 1'i yaz (EVET veya YENIDEN_YAZ) |
| Cumartesi 10:30 | `blog-yaz-ajan.sh 2` | Konu 2'yi yaz (EVET veya YENIDEN_YAZ) |
| Ayın 1'i 10:00 | `site-saglik-ajan.sh` | Site sağlık kontrolü |

**Not:** Sosyal medya ajanı (Salı + Cuma) kaldırıldı. Sosyal medya içerikleri Make.com üzerinden ayrı yönetilecek.

---

## Sosyal Medya (Make.com)

Sosyal medya içerikleri artık Make.com ile Claude MCP kullanılarak üretilecek ve yayınlanacak. Admin paneldeki Sosyal Medya sekmesi kaldırıldı.

---

## Ayşe Sohbet Ajanı

Tüm sayfalarda sağ altta fuşya chat butonu. Müşteriler Ayşe ile sohbet eder, gerektiğinde WhatsApp'a yönlendirilir. Her yönlendirmede Telegram'a özet gelir.

**Dosyalar:**
- `assets/css/chat-widget.css` — Widget stilleri
- `assets/js/chat-widget.js` — Frontend (sessionStorage'da geçmiş)
- `public_html/api/chat.php` — Backend: Claude API + Telegram özet

**Kurulum — SUNUCUDA YAPILACAK:**
```bash
mkdir -p ~/private
nano ~/private/ayse_config.php
```
İçerik:
```php
<?php
define('ANTHROPIC_API_KEY', 'sk-ant-...');
```

**Davranış:**
- İndirim isteği → WhatsApp yönlendirme
- Gerçek kişi isteği → WhatsApp yönlendirme
- Konuşma sonu → WhatsApp butonu
- WhatsApp kullanamıyorum → telefon/mail alır, Telegram'a iletir
- Kuzey Bey mesaisi: hafta içi 08:00–19:00

**Model:** claude-haiku-4-5 (hızlı ve ekonomik)  
**WhatsApp:** `https://wa.me/905307732270`  
**Sunucu config:** `~/private/ayse_config.php` (git'e gitmez)

---

## Deploy Korumaları

- `ornekler-data.json` deploy sırasında üzerine yazılmaz.
- `ornekler/thumbnails/` deploy sırasında korunur.
- `data/blog_*.json` deploy sırasında sadece yoksa oluşturulur.
- `borsa.html` yerel proje klasöründe var ama deploy listesinde yok, sunucuya gitmiyor.
- GitHub IP (`140.82.121.4`) değişirse `~/.ssh/config`'i güncelle.

---

## Rakip Notlar (08.07.2026)

En güçlü rakip: **edijitaldavetiye.com** (TR #15.663, Kütahya/Tavşanlı, Mobirise CMS).  
Fiyatları: Standart ₺599.90 / Plus ₺999.90 / Pro ₺1.999.90 — self-service, şablon doldurma modeli.  
Fark: Polaris kişisel hizmet, 24 saat teslim, dış örnek kabul, Elite'te 12 ay bakım.  
SEO raporu: `~/.digitalbohem-agents/logs/seo-2026-07-08.md`
