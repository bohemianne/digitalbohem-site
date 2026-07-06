// ===== ADMIN PANEL =====
let davetiyeler = JSON.parse(localStorage.getItem('db_davetiyeler') || '[]');
let fiyatlar = JSON.parse(localStorage.getItem('db_fiyatlar') || '[{"paket":"basic","fiyat":"₺499"},{"paket":"premium","fiyat":"₺899"},{"paket":"elite","fiyat":"₺1,499"}]');
let ornekler = JSON.parse(localStorage.getItem('db_ornekler') || '[]');

// Check login
document.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem('db_admin') && !window.location.href.includes('index.html')) {
    window.location.href = 'index.html';
    return;
  }
  renderDavetiyeler();
  renderFiyatlar();
  loadTelegramSettings();
});

function showSection(id) {
  document.querySelectorAll('.admin-section').forEach(s => s.classList.add('hidden'));
  document.getElementById('sec-' + id).classList.remove('hidden');
  document.querySelectorAll('.admin-sidebar a').forEach(a => a.classList.remove('active'));
  event.target.classList.add('active');
  if (id === 'blog') loadBloglar();
  if (id === 'ornekler') loadOrnekler();
  if (id === 'sosyal') { loadSosyal(); loadWebhookUrl(); }
}

// ===== DAVETIYE CRUD =====
function renderDavetiyeler() {
  const tbody = document.querySelector('#davetiye-table tbody');
  if (!tbody) return;

  if (davetiyeler.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#999;">Henüz davetiye yok.</td></tr>';
    return;
  }

  tbody.innerHTML = davetiyeler.map(d => `
    <tr>
      <td>${d.id}</td>
      <td>${d.musteri}</td>
      <td>${d.paket}</td>
      <td>${d.tarih}</td>
      <td><span style="color:${d.durum === 'Aktif' ? '#10b981' : '#ef4444'}">${d.durum}</span></td>
      <td>
        <button class="btn-admin" onclick="toggleDurum(${d.id})">${d.durum === 'Aktif' ? 'Pasif' : 'Aktif'}</button>
        <button class="btn-admin btn-danger" onclick="deleteDavetiye(${d.id})">Sil</button>
      </td>
    </tr>
  `).join('');
}

function addDavetiye() {
  const musteri = document.getElementById('new-musteri').value;
  const paket = document.getElementById('new-paket').value;
  if (!musteri) { alert('Müşteri adı girin!'); return; }

  davetiyeler.push({
    id: Date.now(),
    musteri,
    paket,
    tarih: new Date().toLocaleDateString('tr-TR'),
    durum: 'Aktif'
  });
  localStorage.setItem('db_davetiyeler', JSON.stringify(davetiyeler));
  renderDavetiyeler();
  document.getElementById('new-musteri').value = '';
}

function toggleDurum(id) {
  const d = davetiyeler.find(x => x.id === id);
  if (d) { d.durum = d.durum === 'Aktif' ? 'Pasif' : 'Aktif'; }
  localStorage.setItem('db_davetiyeler', JSON.stringify(davetiyeler));
  renderDavetiyeler();
}

function deleteDavetiye(id) {
  if (!confirm('Silmek istediğinize emin misiniz?')) return;
  davetiyeler = davetiyeler.filter(d => d.id !== id);
  localStorage.setItem('db_davetiyeler', JSON.stringify(davetiyeler));
  renderDavetiyeler();
}

// ===== FIYAT CRUD =====
function renderFiyatlar() {
  const tbody = document.querySelector('#fiyat-table tbody');
  if (!tbody) return;

  tbody.innerHTML = fiyatlar.map((f, i) => `
    <tr>
      <td>${f.paket}</td>
      <td><input type="text" value="${f.fiyat}" onchange="updateFiyat(${i}, this.value)" style="width:100px;"></td>
      <td><button class="btn-admin" onclick="saveFiyatlar()">Kaydet</button></td>
    </tr>
  `).join('');
}

function updateFiyat(index, value) {
  fiyatlar[index].fiyat = value;
}

function saveFiyatlar() {
  localStorage.setItem('db_fiyatlar', JSON.stringify(fiyatlar));
  // Also save as simple prices for main page
  const prices = {};
  fiyatlar.forEach(f => { prices[f.paket] = f.fiyat; });
  localStorage.setItem('db_prices', JSON.stringify(prices));
  alert('Fiyatlar kaydedildi!');

  // Sync to API
  fetch('../api/data.php?table=fiyatlar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'save', data: fiyatlar })
  }).catch(() => {});
}

// ===== ÖRNEKLER =====
const KAT_LABEL = { web: 'Dijital Düğün Web Sitesi', video: 'Animasyonlu Düğün Davetiyesi', pdf: 'Karekodlu Tek Sayfa Davetiye' };

async function loadOrnekler() {
  const list = document.getElementById('ornek-list');
  if (!list) return;
  list.innerHTML = '<p style="color:#9ca3af;">Yükleniyor...</p>';
  const res  = await fetch('../api/data.php?table=ornekler');
  const json = await res.json();
  renderOrnekler(json.data || []);
}

let _ornekSira = [];

function renderOrnekler(ornekler) {
  const list = document.getElementById('ornek-list');
  if (!list) return;
  _ornekSira = ornekler;
  if (!ornekler.length) {
    list.innerHTML = '<p style="color:#9ca3af;">Henüz örnek yok.</p>';
    return;
  }
  list.innerHTML = '<p style="font-size:0.8rem;color:#9ca3af;margin:0 0 0.5rem;">≡ simgesinden tutup sürükleyerek sırayı değiştirebilirsiniz.</p>' +
    ornekler.map((o, i) => `
      <div class="ornek-satir" data-id="${o.id}" draggable="true"
           style="display:flex;align-items:center;padding:0.6rem 0.8rem;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;margin-top:0.5rem;gap:0.75rem;cursor:default;">
        <span class="drag-handle" style="font-size:1.2rem;color:#d1d5db;cursor:grab;padding:0 4px;flex-shrink:0;" title="Sıralamak için sürükle">≡</span>
        ${o.thumbnail ? `<img src="../${o.thumbnail}" style="width:56px;height:38px;object-fit:cover;border-radius:5px;border:1px solid #e5e7eb;flex-shrink:0;">` : '<div style="width:56px;height:38px;background:#f3f4f6;border-radius:5px;border:1px dashed #d1d5db;flex-shrink:0;"></div>'}
        <div style="flex:1;overflow:hidden;min-width:0;">
          <strong style="font-size:0.9rem;">${o.baslik}</strong>
          <p style="margin:0;color:#9ca3af;font-size:0.78rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${KAT_LABEL[o.kategori] || o.kategori}</p>
        </div>
        <div style="display:flex;gap:0.4rem;flex-shrink:0;">
          <button class="btn-admin" onclick="ornekDuzenle('${o.id}')" style="background:#4bbfe3;padding:0.35rem 0.7rem;font-size:0.8rem;">Düzenle</button>
          <button class="btn-admin btn-danger" onclick="removeOrnek('${o.id}')" style="padding:0.35rem 0.7rem;font-size:0.8rem;">Sil</button>
        </div>
      </div>`).join('');

  siralamaBaslat(list);
}

// Thumbnail önizleme + position picker
document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('change', e => {
    if (e.target.id !== 'ornek-thumbnail') return;
    const file = e.target.files[0];
    const kaldir = document.getElementById('ornek-thumb-kaldir');
    const prev   = document.getElementById('ornek-thumb-preview');
    if (!file) {
      if (prev) prev.innerHTML = '';
      if (kaldir) kaldir.style.display = 'none';
      posPicKapat();
      return;
    }
    const url = URL.createObjectURL(file);
    if (prev) prev.innerHTML = '';
    if (kaldir) kaldir.style.display = 'inline-block';
    posPicAc(url, '50% 50%');
  });
});

function canvaUrlTemizle(input) {
  const val = input.value;
  if (!val.includes('<iframe')) return;
  const esles = val.match(/src="([^"]+)"/);
  if (esles) {
    input.value = esles[1].replace(/&amp;/g, '&');
    input.style.borderColor = '#4bbfe3';
    setTimeout(() => input.style.borderColor = '', 1500);
  }
}

function thumbnailKaldir() {
  const input = document.getElementById('ornek-thumbnail');
  const prev  = document.getElementById('ornek-thumb-preview');
  const kaldir = document.getElementById('ornek-thumb-kaldir');
  if (input) input.value = '';
  if (prev) prev.innerHTML = '';
  if (kaldir) kaldir.style.display = 'none';
  posPicKapat();
}

// ---- Position Picker ----
let _posOffX = 0, _posOffY = 0;
let _posDragStartX, _posDragStartY, _posStartOX, _posStartOY;
let _posMinX = 0, _posMinY = 0;
let _posPickerAktif = false;
const PIC_W = 280, PIC_H = 210;

function posPicAc(url, mevcutPos) {
  const wrap = document.getElementById('pos-picker-wrap');
  const img  = document.getElementById('pos-img');
  const picker = document.getElementById('pos-picker');
  if (!wrap || !img || !picker) return;

  // Önceki listener'ı temizle
  if (_posPickerAktif) {
    picker.removeEventListener('mousedown', posDragBasla);
    picker.removeEventListener('touchstart', posDragBasla);
  }

  wrap.style.display = 'block';
  img.src = url;
  img.onload = () => {
    const scale = Math.max(PIC_W / img.naturalWidth, PIC_H / img.naturalHeight);
    const dw = Math.round(img.naturalWidth * scale);
    const dh = Math.round(img.naturalHeight * scale);
    img.style.width  = dw + 'px';
    img.style.height = dh + 'px';
    _posMinX = PIC_W - dw;
    _posMinY = PIC_H - dh;

    // Mevcut pozisyonu geri yükle
    if (mevcutPos && mevcutPos !== '50% 50%') {
      const parts = mevcutPos.split(' ');
      const px = parseFloat(parts[0]) / 100;
      const py = parseFloat(parts[1]) / 100;
      _posOffX = Math.min(0, Math.max(_posMinX, _posMinX * px));
      _posOffY = Math.min(0, Math.max(_posMinY, _posMinY * py));
    } else {
      _posOffX = (PIC_W - dw) / 2;
      _posOffY = (PIC_H - dh) / 2;
    }

    img.style.left = _posOffX + 'px';
    img.style.top  = _posOffY + 'px';
    posPicKaydet();

    picker.addEventListener('mousedown', posDragBasla);
    picker.addEventListener('touchstart', posDragBasla, { passive: false });
    _posPickerAktif = true;
  };
}

function posPicKapat() {
  const wrap = document.getElementById('pos-picker-wrap');
  if (wrap) wrap.style.display = 'none';
  const pos = document.getElementById('ornek-thumbnail-position');
  if (pos) pos.value = '50% 50%';
  const picker = document.getElementById('pos-picker');
  if (picker && _posPickerAktif) {
    picker.removeEventListener('mousedown', posDragBasla);
    picker.removeEventListener('touchstart', posDragBasla);
  }
  _posPickerAktif = false;
}

function posDragBasla(e) {
  e.preventDefault();
  const touch = e.touches ? e.touches[0] : e;
  _posDragStartX = touch.clientX;
  _posDragStartY = touch.clientY;
  _posStartOX = _posOffX;
  _posStartOY = _posOffY;
  const picker = document.getElementById('pos-picker');
  if (picker) picker.style.cursor = 'grabbing';
  document.addEventListener('mousemove', posDragHareket);
  document.addEventListener('touchmove',  posDragHareket, { passive: false });
  document.addEventListener('mouseup',  posDragBitir);
  document.addEventListener('touchend', posDragBitir);
}

function posDragHareket(e) {
  e.preventDefault();
  const touch = e.touches ? e.touches[0] : e;
  const dx = touch.clientX - _posDragStartX;
  const dy = touch.clientY - _posDragStartY;
  _posOffX = Math.min(0, Math.max(_posMinX, _posStartOX + dx));
  _posOffY = Math.min(0, Math.max(_posMinY, _posStartOY + dy));
  const img = document.getElementById('pos-img');
  if (img) { img.style.left = _posOffX + 'px'; img.style.top = _posOffY + 'px'; }
  posPicKaydet();
}

function posDragBitir() {
  const picker = document.getElementById('pos-picker');
  if (picker) picker.style.cursor = 'grab';
  document.removeEventListener('mousemove', posDragHareket);
  document.removeEventListener('touchmove',  posDragHareket);
  document.removeEventListener('mouseup',  posDragBitir);
  document.removeEventListener('touchend', posDragBitir);
}

function posPicKaydet() {
  const posInput = document.getElementById('ornek-thumbnail-position');
  if (!posInput) return;
  const rangeX = Math.abs(_posMinX) || 1;
  const rangeY = Math.abs(_posMinY) || 1;
  const px = Math.round((-_posOffX / rangeX) * 100);
  const py = Math.round((-_posOffY / rangeY) * 100);
  posInput.value = px + '% ' + py + '%';
}

let _ornekDuzenleData = null;

function ornekDuzenle(id) {
  const res = fetch('../api/data.php?table=ornekler').then(r => r.json()).then(json => {
    const o = (json.data || []).find(x => x.id === id);
    if (!o) return;
    _ornekDuzenleData = o;
    document.getElementById('ornek-duzenle-id').value = id;
    document.getElementById('ornek-kategori').value  = o.kategori || 'dugun';
    document.getElementById('ornek-baslik').value    = o.baslik || '';
    document.getElementById('ornek-canva-url').value = o.canva_url || '';
    document.getElementById('ornek-aciklama').value  = o.aciklama || '';
    const prev  = document.getElementById('ornek-thumb-preview');
    const kaldir = document.getElementById('ornek-thumb-kaldir');
    if (o.thumbnail && prev) {
      if (kaldir) kaldir.style.display = 'inline-block';
      posPicAc('../' + o.thumbnail, o.thumbnail_position || '50% 50%');
    }
    const btn = document.getElementById('ornek-kaydet-btn');
    const iptal = document.getElementById('ornek-iptal-btn');
    if (btn) btn.textContent = 'Güncelle';
    if (iptal) iptal.style.display = 'inline-block';
    document.getElementById('ornek-baslik').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

function ornekDuzenleIptal() {
  _ornekDuzenleData = null;
  document.getElementById('ornek-duzenle-id').value = '';
  document.getElementById('ornek-baslik').value    = '';
  document.getElementById('ornek-canva-url').value = '';
  document.getElementById('ornek-aciklama').value  = '';
  thumbnailKaldir();
  const btn = document.getElementById('ornek-kaydet-btn');
  const iptal = document.getElementById('ornek-iptal-btn');
  if (btn) btn.textContent = 'Ekle';
  if (iptal) iptal.style.display = 'none';
}

async function ornekKaydet() {
  const btn       = document.getElementById('ornek-kaydet-btn');
  const duzenleId = document.getElementById('ornek-duzenle-id').value;
  const kategori  = document.getElementById('ornek-kategori').value;
  const baslik    = document.getElementById('ornek-baslik').value.trim();
  const canva_url = document.getElementById('ornek-canva-url').value.trim();
  const aciklama  = document.getElementById('ornek-aciklama').value.trim();
  const thumbFile = document.getElementById('ornek-thumbnail')?.files[0];
  if (!baslik) { alert('Başlık gerekli!'); return; }

  if (btn) { btn.disabled = true; btn.textContent = duzenleId ? 'Güncelleniyor...' : 'Ekleniyor...'; }

  let thumbnail = duzenleId ? (_ornekDuzenleData?.thumbnail || '') : '';
  if (thumbFile) {
    try {
      const fd = new FormData();
      fd.append('thumbnail', thumbFile);
      const upRes  = await fetch('../api/thumbnail-upload.php', { method: 'POST', body: fd });
      const upJson = await upRes.json();
      if (upJson.success) {
        thumbnail = upJson.path;
      } else {
        const devam = confirm('Resim yüklenemedi: ' + upJson.mesaj + '\n\nResim olmadan devam edilsin mi?');
        if (!devam) { if (btn) { btn.disabled = false; btn.textContent = duzenleId ? 'Güncelle' : 'Ekle'; } return; }
      }
    } catch (err) {
      const devam = confirm('Resim yüklenirken bağlantı hatası oluştu.\n\nResim olmadan devam edilsin mi?');
      if (!devam) { if (btn) { btn.disabled = false; btn.textContent = duzenleId ? 'Güncelle' : 'Ekle'; } return; }
    }
  }

  const thumbnail_position = document.getElementById('ornek-thumbnail-position')?.value || (duzenleId ? (_ornekDuzenleData?.thumbnail_position || '50% 50%') : '50% 50%');
  const action = duzenleId ? 'update' : 'add';
  const data   = duzenleId
    ? { id: duzenleId, kategori, baslik, canva_url, aciklama, thumbnail, thumbnail_position }
    : { id: 'ornek-' + Date.now(), kategori, baslik, canva_url, aciklama, thumbnail, thumbnail_position };

  await fetch('../api/data.php?table=ornekler', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, data })
  });

  ornekDuzenleIptal();
  if (btn) { btn.disabled = false; }
  loadOrnekler();
}

function siralamaBaslat(list) {
  let suruklenen = null;

  list.querySelectorAll('.ornek-satir').forEach(satir => {
    satir.addEventListener('dragstart', e => {
      suruklenen = satir;
      setTimeout(() => satir.style.opacity = '0.4', 0);
    });
    satir.addEventListener('dragend', () => {
      satir.style.opacity = '';
      list.querySelectorAll('.ornek-satir').forEach(s => s.style.borderColor = '');
      suruklenen = null;
      siralamayiKaydet(list);
    });
    satir.addEventListener('dragover', e => {
      e.preventDefault();
      if (!suruklenen || suruklenen === satir) return;
      const kutu = satir.getBoundingClientRect();
      const ortasi = kutu.top + kutu.height / 2;
      if (e.clientY < ortasi) {
        list.insertBefore(suruklenen, satir);
      } else {
        list.insertBefore(suruklenen, satir.nextSibling);
      }
    });
  });
}

async function siralamayiKaydet(list) {
  const yeniSira = [...list.querySelectorAll('.ornek-satir')].map(el => el.dataset.id);
  const sirali = yeniSira.map(id => _ornekSira.find(o => o.id === id)).filter(Boolean);
  await fetch('../api/data.php?table=ornekler', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'save', data: sirali })
  });
  _ornekSira = sirali;
}

async function removeOrnek(id) {
  if (!confirm('Bu örneği silmek istiyor musunuz?')) return;
  await fetch('../api/data.php?table=ornekler', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', id })
  });
  loadOrnekler();
}

// ===== TELEGRAM =====
function loadTelegramSettings() {
  const tg = JSON.parse(localStorage.getItem('db_telegram') || '{}');
  if (document.getElementById('admin-tg-token')) document.getElementById('admin-tg-token').value = tg.token || '';
  if (document.getElementById('admin-tg-chat')) document.getElementById('admin-tg-chat').value = tg.chat || '';
}

function saveAdminTelegram() {
  const token = document.getElementById('admin-tg-token').value;
  const chat = document.getElementById('admin-tg-chat').value;
  localStorage.setItem('db_telegram', JSON.stringify({ token, chat }));
  alert('Telegram ayarları kaydedildi!');
}

function testTelegram() {
  const tg = JSON.parse(localStorage.getItem('db_telegram') || '{}');
  if (!tg.token || !tg.chat) { alert('Önce ayarları kaydedin!'); return; }

  fetch('/api/telegram.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: tg.token, chat_id: tg.chat, text: '✅ DigitalBohem test mesajı başarılı!' })
  })
    .then(r => r.json())
    .then(data => {
      if (data.ok) alert('✅ Test mesajı gönderildi!');
      else alert('❌ Hata: ' + data.description);
    })
    .catch(() => alert('❌ Sunucu hatası. PHP dosyasını kontrol edin.'));
}

// ===== BLOG =====
const BLOG_API = '../api/blog.php';

function blogTab(sekme) {
  ['oneriler', 'taslaklar', 'yazilar'].forEach(s => {
    document.getElementById('blog-tab-' + s).style.display = s === sekme ? '' : 'none';
    const btn = document.getElementById('btab-' + s);
    if (btn) {
      btn.style.color = s === sekme ? '#3b82f6' : '#6b7280';
      btn.style.borderBottom = s === sekme ? '2px solid #3b82f6' : 'none';
    }
  });
  if (sekme === 'oneriler') loadOneriler();
  else if (sekme === 'taslaklar') loadTaslaklar();
  else loadYazilar();
}

function loadBloglar() {
  blogTab('oneriler');
}

// ── Onay Bölümü ──────────────────────────────────────────────────────────────
async function loadOneriler() {
  const el = document.getElementById('blog-oneri-yukleniyor');
  const list = document.getElementById('blog-oneriler-list');
  if (el) el.textContent = 'Yükleniyor...';

  try {
    const res  = await fetch(BLOG_API + '?action=oneriler');
    const json = await res.json();
    if (el) el.textContent = '';

    if (!json.success) {
      list.innerHTML = `<div style="text-align:center; padding:2rem; color:#9ca3af;">${json.mesaj}</div>`;
      return;
    }

    const bekleyenler = json.konular.filter(k => k.onay === 'BEKLIYOR' || k.onay === 'EVET');
    const tamamlananlar = json.konular.filter(k => k.onay !== 'BEKLIYOR' && k.onay !== 'EVET');

    if (!json.konular.length) {
      list.innerHTML = '<p style="color:#9ca3af; text-align:center; padding:2rem 0;">Bu hafta henüz öneri yok. Pazartesi 09:30\'da ajan otomatik önerir.</p>';
      return;
    }

    const RENK = { 'BEKLIYOR': ['#fef3c7','#92400e'], 'EVET': ['#d1fae5','#065f46'], 'HAYIR': ['#fee2e2','#991b1b'], 'YAYINLANDI': ['#ede9fe','#4c1d95'] };

    const kartHtml = (k) => {
      const renk = RENK[k.onay?.split(' ')[0]] || RENK['BEKLIYOR'];
      const bekliyor = k.onay === 'BEKLIYOR';
      return `
      <div style="border:1px solid #e5e7eb; border-radius:10px; padding:1.5rem; margin-bottom:1rem; background:#fff;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; flex-wrap:wrap; margin-bottom:1rem;">
          <div>
            <span style="background:${renk[0]}; color:${renk[1]}; padding:0.2rem 0.7rem; border-radius:20px; font-size:0.8rem; font-weight:700;">Konu ${k.no} — ${k.onay || '?'}</span>
            <h4 style="margin:0.6rem 0 0.2rem; color:#1f2937;">${k.baslik || '(Başlık yok)'}</h4>
            <small style="color:#6b7280;">Hedef Kelime: <strong>${k.hedef || '—'}</strong> · Hacim: ${k.hacim || '—'}</small>
          </div>
          ${bekliyor ? `
          <div style="display:flex; gap:0.5rem; flex-shrink:0;">
            <button class="btn-admin" onclick="onaylaKonu(${k.no},'EVET')" style="background:#10b981; padding:0.45rem 1rem;">✅ Onayla</button>
            <button class="btn-admin btn-danger" onclick="onaylaKonu(${k.no},'HAYIR')" style="padding:0.45rem 1rem;">✕ Reddet</button>
          </div>` : ''}
        </div>
        <p style="color:#6b7280; font-size:0.88rem; margin:0 0 0.75rem;"><em>${k.neden || ''}</em></p>
        ${k.h2ler?.length ? '<details style="cursor:pointer;"><summary style="color:#3b82f6; font-size:0.9rem;">H2 Başlıkları (' + k.h2ler.length + ' adet)</summary><ul style="margin:0.5rem 0 0 1rem; color:#374151; font-size:0.9rem;">' + k.h2ler.map(h => '<li>' + h + '</li>').join('') + '</ul></details>' : ''}
      </div>`;
    };

    let html = '';
    if (bekleyenler.length) {
      html += bekleyenler.map(kartHtml).join('');
    } else {
      html += '<p style="color:#9ca3af; text-align:center; padding:1rem 0;">Bu haftanın tüm konuları işlendi.</p>';
    }
    if (tamamlananlar.length) {
      html += `<details style="margin-top:1rem;"><summary style="cursor:pointer; color:#9ca3af; font-size:0.85rem;">Tamamlananları göster (${tamamlananlar.length})</summary><div style="margin-top:0.75rem; opacity:0.6;">${tamamlananlar.map(kartHtml).join('')}</div></details>`;
    }
    list.innerHTML = html;
  } catch(e) {
    if (el) el.textContent = '';
    list.innerHTML = '<p style="color:#ef4444;">Bağlantı hatası. blog.php erişilemedi.</p>';
  }
}

async function onaylaKonu(no, karar) {
  const res  = await fetch(BLOG_API + '?action=onayla', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ konu: no, karar })
  });
  const json = await res.json();
  alert(json.mesaj);
  loadOneriler();
}

// ── Yazılmış Yazılar Bölümü ──────────────────────────────────────────────────
async function loadYazilar() {
  const el   = document.getElementById('blog-yazi-yukleniyor');
  const list = document.getElementById('blog-yazilar-list');
  if (el) el.textContent = 'Yükleniyor...';

  try {
    const res  = await fetch(BLOG_API + '?action=yazilar');
    const json = await res.json();
    if (el) el.textContent = '';

    if (!json.success) {
      list.innerHTML = `<div style="text-align:center; padding:2rem; color:#9ca3af;">${json.mesaj}</div>`;
      return;
    }
    if (!json.yazilar.length) {
      list.innerHTML = '<p style="color:#9ca3af; text-align:center; padding:2rem 0;">Henüz yazılmış blog yok.</p>';
      return;
    }

    list.innerHTML = json.yazilar.map(y => `
      <div style="border:1px solid #e5e7eb; border-radius:10px; padding:1.2rem 1.5rem; margin-bottom:0.75rem; background:#fff; display:flex; justify-content:space-between; align-items:center; gap:1rem; flex-wrap:wrap;">
        <div>
          <h4 style="margin:0 0 0.25rem; color:#1f2937; font-size:0.95rem;">${y.baslik}</h4>
          <small style="color:#9ca3af;">${y.tarih} · ${(y.boyut/1024).toFixed(1)} KB · <code>${y.slug}.html</code></small>
        </div>
        <div style="display:flex; gap:0.5rem;">
          <button class="btn-admin" onclick="onizleYazi('${y.slug}','${y.baslik.replace(/'/g,"\\'")}') " style="background:#3b82f6; padding:0.4rem 0.9rem;">Önizle</button>
          <a class="btn-admin" href="https://digitalbohem.com.tr/blog/${y.slug}.html" target="_blank" style="text-decoration:none; padding:0.4rem 0.9rem;">Canlı</a>
          <button class="btn-admin" onclick="yaziSil('${y.slug}','${y.baslik.replace(/'/g,"\\'")}') " style="background:#ef4444; padding:0.4rem 0.9rem;">Sil</button>
        </div>
      </div>`).join('');
  } catch(e) {
    if (el) el.textContent = '';
    list.innerHTML = '<p style="color:#ef4444;">Bağlantı hatası.</p>';
  }
}

async function onizleYazi(slug, baslik) {
  const res  = await fetch(BLOG_API + '?action=yazi&slug=' + slug);
  const json = await res.json();
  if (!json.success) { alert(json.mesaj); return; }
  document.getElementById('onizleme-baslik').textContent = baslik;
  document.getElementById('onizleme-frame').srcdoc = json.html;
  document.getElementById('blog-onizleme-modal').style.display = 'block';
}

async function onizleTaslak(slug, baslik) {
  const res  = await fetch(BLOG_API + '?action=taslak&slug=' + slug);
  const json = await res.json();
  if (!json.success) { alert(json.mesaj); return; }
  document.getElementById('onizleme-baslik').textContent = baslik + ' (TASLAK)';
  document.getElementById('onizleme-frame').srcdoc = json.html;
  document.getElementById('blog-onizleme-modal').style.display = 'block';
}

async function loadTaslaklar() {
  const el   = document.getElementById('blog-taslak-yukleniyor');
  const list = document.getElementById('blog-taslaklar-list');
  if (el) el.textContent = 'Yükleniyor...';
  try {
    const res  = await fetch(BLOG_API + '?action=taslaklar');
    const json = await res.json();
    if (el) el.textContent = '';
    if (!json.taslaklar || !json.taslaklar.length) {
      list.innerHTML = '<p style="color:#9ca3af; text-align:center; padding:2rem 0;">Bekleyen taslak yok.</p>';
      return;
    }
    list.innerHTML = json.taslaklar.map(t => `
      <div style="border:2px solid #f59e0b; border-radius:10px; padding:1.2rem 1.5rem; margin-bottom:0.75rem; background:#fffbeb; display:flex; justify-content:space-between; align-items:center; gap:1rem; flex-wrap:wrap;">
        <div>
          <h4 style="margin:0 0 0.25rem; color:#1f2937; font-size:0.95rem;">${t.baslik}</h4>
          <small style="color:#9ca3af;">${t.tarih} · Onay bekliyor · <code>${t.slug}.html</code></small>
        </div>
        <div style="display:flex; gap:0.5rem;">
          <button class="btn-admin" onclick="onizleTaslak('${t.slug}','${t.baslik.replace(/'/g,"\\'")}') " style="background:#3b82f6; padding:0.4rem 0.9rem;">Önizle</button>
          <button class="btn-admin" onclick="taslakDuzenle('${t.slug}','${t.baslik.replace(/'/g,"\\'")}') " style="background:#f59e0b; padding:0.4rem 0.9rem;">Düzenle</button>
          <button class="btn-admin" onclick="taslakYayinla('${t.slug}')" style="background:#10b981; padding:0.4rem 0.9rem;">✓ Yayınla</button>
          <button class="btn-admin" onclick="taslakSil('${t.slug}')" style="background:#ef4444; padding:0.4rem 0.9rem;">Sil</button>
        </div>
      </div>`).join('');
  } catch(e) {
    if (el) el.textContent = '';
    list.innerHTML = '<p style="color:#ef4444;">Bağlantı hatası.</p>';
  }
}

let _duzenleSlug = '';
let _duzenleFullHtml = '';

function fmt(cmd, val) {
  document.execCommand(cmd, false, val || null);
  document.getElementById('duzenle-icerik').focus();
}

async function taslakDuzenle(slug, baslik) {
  const res  = await fetch(BLOG_API + '?action=taslak&slug=' + slug);
  const json = await res.json();
  if (!json.success) { alert(json.mesaj); return; }
  _duzenleSlug = slug;
  _duzenleFullHtml = json.html;

  // Sadece makale içeriğini (post-content div) çıkar
  const parser = new DOMParser();
  const doc = parser.parseFromString(json.html, 'text/html');
  const content = doc.querySelector('.post-content');
  const icerik = document.getElementById('duzenle-icerik');
  icerik.innerHTML = content ? content.innerHTML : '<p>İçerik bulunamadı.</p>';

  document.getElementById('duzenle-baslik').textContent = baslik;
  document.getElementById('taslak-duzenle-modal').style.display = 'block';
  icerik.focus();
}

function closeDuzenle() {
  document.getElementById('taslak-duzenle-modal').style.display = 'none';
  document.getElementById('duzenle-icerik').innerHTML = '';
  _duzenleSlug = '';
  _duzenleFullHtml = '';
}

async function taslakKaydet() {
  const editedIcerik = document.getElementById('duzenle-icerik').innerHTML;
  if (!editedIcerik.trim()) { alert('İçerik boş olamaz.'); return; }

  // Düzenlenen içeriği orijinal HTML'e geri yerleştir
  const parser = new DOMParser();
  const doc = parser.parseFromString(_duzenleFullHtml, 'text/html');
  const content = doc.querySelector('.post-content');
  if (content) content.innerHTML = editedIcerik;
  const finalHtml = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;

  try {
    const res  = await fetch(BLOG_API + '?action=taslak-guncelle', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ secret: 'polaris2026', slug: _duzenleSlug, html: finalHtml })
    });
    const json = await res.json();
    if (json.success) { alert('Taslak güncellendi.'); closeDuzenle(); }
    else alert('Hata: ' + json.mesaj);
  } catch(e) { alert('Bağlantı hatası.'); }
}

async function taslakYayinla(slug) {
  if (!confirm('Bu taslağı yayınlamak istediğine emin misin?')) return;
  try {
    const res  = await fetch(BLOG_API + '?action=taslak-yayinla', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ slug })
    });
    const json = await res.json();
    if (json.success) { alert('Yazı yayınlandı!'); loadTaslaklar(); }
    else alert('Hata: ' + json.mesaj);
  } catch(e) { alert('Bağlantı hatası.'); }
}

async function taslakSil(slug) {
  if (!confirm('Taslağı silmek istediğine emin misin? Bu işlem geri alınamaz.')) return;
  try {
    const res  = await fetch(BLOG_API + '?action=taslak-sil', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ slug })
    });
    const json = await res.json();
    if (json.success) { alert('Taslak silindi.'); loadTaslaklar(); }
    else alert('Hata: ' + json.mesaj);
  } catch(e) { alert('Bağlantı hatası.'); }
}

async function yaziSil(slug, baslik) {
  if (!confirm(`"${baslik}" yazısını silmek istediğine emin misin?`)) return;
  try {
    const res  = await fetch(BLOG_API + '?action=sil', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ secret: 'polaris2026', slug })
    });
    const json = await res.json();
    if (json.success) { alert('Yazı silindi.'); loadYazilar(); }
    else alert('Hata: ' + json.mesaj);
  } catch(e) { alert('Bağlantı hatası.'); }
}

function closeOnizleme() {
  document.getElementById('blog-onizleme-modal').style.display = 'none';
  document.getElementById('onizleme-frame').srcdoc = '';
}

// ===== SOSYAL MEDYA =====
const SOSYAL_API = '../api/sosyal.php';

let _sosyalPosts = {};

async function loadWebhookUrl() {
  try {
    const res  = await fetch(SOSYAL_API + '?action=webhook-al');
    const json = await res.json();
    const el   = document.getElementById('make-webhook-url');
    if (el && json.url) el.value = json.url;
  } catch(e) {}
}

async function webhookKaydet() {
  const url = (document.getElementById('make-webhook-url')?.value || '').trim();
  const msg = document.getElementById('webhook-msg');
  try {
    await fetch(SOSYAL_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'webhook-kaydet', url })
    });
    msg.style.color = '#10b981';
    msg.textContent = url ? 'Webhook URL kaydedildi.' : 'Webhook URL silindi.';
    setTimeout(() => msg.textContent = '', 3000);
  } catch(e) {
    msg.style.color = '#ef4444';
    msg.textContent = 'Kayıt hatası!';
  }
}

const PLATFORM_LABEL = {
  facebook: { ad: 'Facebook', renk: '#1877f2', emoji: '📘' },
  linkedin: { ad: 'LinkedIn', renk: '#0a66c2', emoji: '💼' },
  pinterest: { ad: 'Pinterest', renk: '#e60023', emoji: '📌' },
  instagram: { ad: 'Instagram', renk: '#c13584', emoji: '📸' },
  youtube: { ad: 'YouTube', renk: '#ff0000', emoji: '🎬' }
};

let _sosyalAktifSekme = 'bekliyor';

function sosyalTab(sekme) {
  _sosyalAktifSekme = sekme;
  ['bekliyor', 'yayinlandi'].forEach(s => {
    document.getElementById('sosyal-tab-' + s).style.display = s === sekme ? '' : 'none';
    const btn = document.getElementById('stab-' + s);
    if (btn) {
      btn.style.color = s === sekme ? '#e91e8c' : '#6b7280';
      btn.style.borderBottom = s === sekme ? '2px solid #e91e8c' : 'none';
    }
  });
  loadSosyal();
}

async function loadSosyal() {
  const el = document.getElementById('sosyal-yukleniyor');
  if (el) el.textContent = 'Yükleniyor...';
  try {
    const res  = await fetch(SOSYAL_API);
    const json = await res.json();
    if (el) el.textContent = '';
    if (!json.success) { renderSosyalBos(); return; }

    _sosyalPosts = {};
    (json.posts || []).forEach(p => _sosyalPosts[p.id] = p);

    const bekleyenler   = (json.posts || []).filter(p => p.durum === 'bekliyor');
    const yayinlananlar = (json.posts || []).filter(p => p.durum === 'yayinlandi');

    renderSosyalListe('sosyal-bekliyor-list', bekleyenler, true);
    renderSosyalListe('sosyal-yayinlandi-list', yayinlananlar, false);
  } catch(e) {
    if (el) el.textContent = '';
    document.getElementById('sosyal-bekliyor-list').innerHTML = '<p style="color:#ef4444;">Bağlantı hatası. sosyal.php erişilemedi.</p>';
  }
}

function renderSosyalBos() {
  const bosMsg = '<p style="color:#9ca3af; text-align:center; padding:2rem 0;">Henüz içerik yok. Ajan Salı ve Cuma 5 platform için içerik üretir.</p>';
  document.getElementById('sosyal-bekliyor-list').innerHTML = bosMsg;
  document.getElementById('sosyal-yayinlandi-list').innerHTML = '<p style="color:#9ca3af; text-align:center; padding:2rem 0;">Henüz yayınlanan post yok.</p>';
}

function renderSosyalListe(listId, posts, gosterBtn) {
  const el = document.getElementById(listId);
  if (!posts.length) {
    el.innerHTML = listId.includes('bekliyor')
      ? '<p style="color:#9ca3af; text-align:center; padding:2rem 0;">Bekleyen içerik yok. Ajan Salı ve Cuma içerik üretir.</p>'
      : '<p style="color:#9ca3af; text-align:center; padding:2rem 0;">Henüz yayınlanan post yok.</p>';
    return;
  }

  // Tarihe göre grupla
  const gruplar = {};
  posts.forEach(p => {
    const key = p.tarih + '-' + p.post_no;
    if (!gruplar[key]) gruplar[key] = { tarih: p.tarih, post_no: p.post_no, platformlar: [] };
    gruplar[key].platformlar.push(p);
  });

  el.innerHTML = Object.values(gruplar).sort((a,b) => b.tarih.localeCompare(a.tarih)).map(grup => `
    <div style="border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; margin-bottom:1.5rem; background:#fff;">
      <div style="padding:0.8rem 1.2rem; background:#f9fafb; border-bottom:1px solid #e5e7eb; display:flex; justify-content:space-between; align-items:center;">
        <strong style="color:#1f2937;">${grup.tarih} — ${grup.post_no === 1 ? 'Salı Paylaşımı' : 'Cuma Paylaşımı'}</strong>
        <span style="font-size:0.8rem; color:#9ca3af;">${grup.platformlar.length} platform</span>
      </div>
      ${grup.platformlar.map(p => sosyalKartHtml(p, gosterBtn)).join('')}
    </div>`).join('');
}

function sosyalKartHtml(p, gosterBtn) {
  const pl = PLATFORM_LABEL[p.platform] || { ad: p.platform, renk: '#6b7280', emoji: '📣' };
  const ozelIcerik = p.platform === 'youtube'
    ? `<div style="margin-top:0.75rem;"><strong style="font-size:0.85rem; color:#6b7280;">Başlık:</strong><p style="margin:0.25rem 0 0.75rem; font-size:0.9rem;">${p.baslik || ''}</p><strong style="font-size:0.85rem; color:#6b7280;">Senaryo:</strong><pre style="white-space:pre-wrap; font-family:inherit; font-size:0.88rem; color:#374151; margin:0.25rem 0 0;">${escHtml(p.senaryo || '')}</pre></div>`
    : `<pre style="white-space:pre-wrap; font-family:inherit; font-size:0.88rem; color:#374151; margin:0.5rem 0 0;">${escHtml(p.icerik || '')}</pre>`;
  const resimNotu = p.resim_onerisi ? `<p style="margin:0.5rem 0 0; font-size:0.82rem; background:#fef9c3; padding:0.4rem 0.8rem; border-radius:6px; color:#92400e;">Görsel: ${escHtml(p.resim_onerisi)}</p>` : '';

  return `
  <div style="padding:1rem 1.2rem; border-bottom:1px solid #f3f4f6;">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; flex-wrap:wrap; gap:0.4rem;">
      <span style="background:${pl.renk}18; color:${pl.renk}; padding:0.2rem 0.8rem; border-radius:20px; font-size:0.82rem; font-weight:700;">${pl.emoji} ${pl.ad}</span>
      <div style="display:flex; gap:0.4rem; align-items:center;">
        <button onclick="sosyalKopyala('${escHtml(p.id)}')" id="kopyala-${escHtml(p.id)}" style="padding:0.3rem 0.7rem; background:#f3f4f6; color:#374151; border:1px solid #e5e7eb; border-radius:6px; cursor:pointer; font-size:0.8rem;">📋 Kopyala</button>
        ${gosterBtn
          ? `<button onclick="sosyalYayinla('${escHtml(p.id)}')" style="padding:0.3rem 0.9rem; background:#e91e8c; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:0.82rem; font-weight:600;">✓ Yayınlandı</button>`
          : `<span style="font-size:0.8rem; color:#10b981; font-weight:600;">✓ Yayınlandı</span>`}
      </div>
    </div>
    ${ozelIcerik}
    ${resimNotu}
    ${p.hashtag ? `<p style="margin:0.5rem 0 0; font-size:0.82rem; color:#6b7280;">${escHtml(p.hashtag)}</p>` : ''}
  </div>`;
}

function sosyalKopyala(id) {
  const p = _sosyalPosts[id];
  if (!p) return;
  let metin = '';
  if (p.platform === 'youtube') {
    metin = (p.baslik ? 'BAŞLIK: ' + p.baslik + '\n\n' : '') + (p.senaryo || '');
  } else {
    metin = p.icerik || '';
    if (p.baslik)  metin = p.baslik + '\n\n' + metin;
    if (p.hashtag) metin += '\n\n' + p.hashtag;
  }
  navigator.clipboard.writeText(metin).then(() => {
    const btn = document.getElementById('kopyala-' + id);
    if (btn) { btn.textContent = '✓ Kopyalandı'; setTimeout(() => btn.textContent = '📋 Kopyala', 2000); }
  }).catch(() => {
    const btn = document.getElementById('kopyala-' + id);
    if (btn) { btn.textContent = 'Hata'; setTimeout(() => btn.textContent = '📋 Kopyala', 2000); }
  });
}

function escHtml(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

async function sosyalYayinla(id) {
  try {
    await fetch(SOSYAL_API, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ action: 'durum-guncelle', id, durum: 'yayinlandi' })
    });
    loadSosyal();
  } catch(e) { alert('Bağlantı hatası.'); }
}

// ===== PASSWORD =====
function changePassword() {
  const oldPass = document.getElementById('old-pass').value;
  const newPass = document.getElementById('new-pass').value;
  const confirmPass = document.getElementById('new-pass-confirm').value;
  const msg = document.getElementById('sifre-msg');

  if (oldPass !== 'digital2026') { msg.textContent = 'Mevcut şifre hatalı!'; return; }
  if (newPass.length < 6) { msg.textContent = 'Yeni şifre en az 6 karakter olmalı!'; return; }
  if (newPass !== confirmPass) { msg.textContent = 'Şifreler eşleşmiyor!'; return; }

  msg.style.color = '#10b981';
  msg.textContent = 'Şifre başarıyla değiştirildi! (Not: Gerçek uygulamada sunucu tarafında güncellenmelidir)';
  document.getElementById('old-pass').value = '';
  document.getElementById('new-pass').value = '';
  document.getElementById('new-pass-confirm').value = '';
}
