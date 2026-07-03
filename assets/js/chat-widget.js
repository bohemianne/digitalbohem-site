(function () {
  'use strict';

  const WA_NUMBER = '905307732270';
  const WA_TEXT   = 'Merhaba%2C%20dijital%20davetiye%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum.';

  // Sayfa derinliğine göre API yolu (blog/ alt dizininden de çalışır)
  const apiUrl = (function () {
    const parts = location.pathname.split('/').filter(Boolean);
    const prefix = parts.length > 1 ? '../'.repeat(parts.length - 1) : '';
    return prefix + 'api/chat.php';
  })();

  let history  = JSON.parse(sessionStorage.getItem('ayse_history') || '[]');
  let isTyping = false;

  // --- DOM oluştur ---
  function buildWidget() {
    // Tanıtım balonu
    const intro = document.createElement('div');
    intro.className = 'ayse-intro';
    intro.style.display = 'none';
    intro.innerHTML = `
      <button class="ayse-intro-close" aria-label="Kapat">✕</button>
      <div class="ayse-intro-name">🌸 Merhaba! Ben Ayşe</div>
      Bu işletmenin yapay zeka asistanıyım.<br>Size yardımcı olabilir miyim?
    `;

    // Buton grubu (yuvarlak + isim etiketi)
    const launcher = document.createElement('div');
    launcher.className = 'ayse-launcher';

    const btn = document.createElement('button');
    btn.className = 'ayse-btn';
    btn.setAttribute('aria-label', 'Ayşe ile sohbet et');
    btn.textContent = '🌸';

    const lbl = document.createElement('div');
    lbl.className = 'ayse-btn-label';
    lbl.textContent = '✨ Ayşe — Asistan';

    launcher.appendChild(btn);
    launcher.appendChild(lbl);

    // Chat penceresi
    const win = document.createElement('div');
    win.className = 'ayse-window';
    win.setAttribute('role', 'dialog');
    win.setAttribute('aria-label', 'Ayşe — Digital Bohem Asistanı');
    win.innerHTML = `
      <div class="ayse-header">
        <div class="ayse-header-avatar">🌸</div>
        <div class="ayse-header-info">
          <div class="ayse-header-name">Ayşe</div>
          <div class="ayse-header-status">Digital Bohem Asistanı · 7/24 aktif</div>
        </div>
        <button class="ayse-close" aria-label="Kapat">✕</button>
      </div>
      <div class="ayse-messages" id="ayse-msgs"></div>
      <div class="ayse-input-row">
        <textarea class="ayse-input" id="ayse-input" placeholder="Mesajınızı yazın..." rows="1"></textarea>
        <button class="ayse-send" id="ayse-send" aria-label="Gönder">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(intro);
    document.body.appendChild(launcher);
    document.body.appendChild(win);

    const msgs     = win.querySelector('#ayse-msgs');
    const input    = win.querySelector('#ayse-input');
    const send     = win.querySelector('#ayse-send');
    const closeBtn = win.querySelector('.ayse-close');

    // Tanıtım balonunu otomatik göster (sadece ilk ziyaret)
    if (!sessionStorage.getItem('ayse_intro_shown')) {
      setTimeout(() => {
        intro.style.display = 'block';
        sessionStorage.setItem('ayse_intro_shown', '1');
      }, 1800);

      // 12 saniye sonra otomatik kapat
      setTimeout(() => { intro.style.display = 'none'; }, 13800);
    }

    // Tanıtım X butonu
    intro.querySelector('.ayse-intro-close').addEventListener('click', () => {
      intro.style.display = 'none';
    });

    // Chat açma
    btn.addEventListener('click', () => {
      intro.style.display = 'none';
      win.classList.toggle('open');
      if (win.classList.contains('open')) {
        if (history.length === 0) showGreeting(msgs);
        else renderHistory(msgs);
        setTimeout(() => input.focus(), 50);
      }
    });

    closeBtn.addEventListener('click', () => win.classList.remove('open'));

    // Gönder
    send.addEventListener('click', () => submitMessage(msgs, input, send));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitMessage(msgs, input, send);
      }
    });

    // Textarea otomatik büyüme
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 80) + 'px';
    });
  }

  // --- İlk karşılama ---
  function showGreeting(msgs) {
    const text = 'Merhaba! 🌸 Ben Ayşe, Digital Bohem\'in yapay zeka asistanıyım. Size nasıl yardımcı olabilirim?';
    addBotMessage(msgs, text);
    history.push({ role: 'assistant', content: text });
    saveHistory();
  }

  // --- Geçmişi yeniden çiz ---
  function renderHistory(msgs) {
    msgs.innerHTML = '';
    history.forEach((m) => {
      if (m.role === 'user') addUserMessage(msgs, m.content, false);
      else addBotMessage(msgs, m.content, false);
    });
    scrollBottom(msgs);
  }

  // --- Mesaj gönder ---
  async function submitMessage(msgs, input, send) {
    const text = input.value.trim();
    if (!text || isTyping) return;

    addUserMessage(msgs, text);
    history.push({ role: 'user', content: text });
    saveHistory();

    input.value = '';
    input.style.height = 'auto';
    send.disabled = true;
    isTyping = true;

    const typing = showTyping(msgs);

    try {
      const res  = await fetch(apiUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'chat', messages: history }),
      });
      const data = await res.json();

      typing.remove();
      isTyping = false;
      send.disabled = false;

      if (data.ok) {
        addBotMessage(msgs, data.message);
        history.push({ role: 'assistant', content: data.message });
        saveHistory();
        if (data.whatsapp) showWhatsAppButton(msgs);
      } else {
        addBotMessage(msgs, 'Bir hata oluştu, lütfen tekrar deneyin.');
      }
    } catch {
      typing.remove();
      isTyping = false;
      send.disabled = false;
      addBotMessage(msgs, 'Bağlantı hatası oluştu, lütfen tekrar deneyin.');
    }
  }

  // --- WhatsApp yönlendirme butonu ---
  function showWhatsAppButton(msgs) {
    const btn = document.createElement('button');
    btn.className = 'ayse-wa-redirect';
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.564 4.14 1.534 5.876L.054 23.447a.75.75 0 0 0 .916.944l5.752-1.506A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.714 9.714 0 0 1-4.964-1.362l-.355-.211-3.685.965.982-3.585-.232-.369A9.718 9.718 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
      </svg>
      Kuzey Bey ile WhatsApp'ta devam et
    `;

    btn.addEventListener('click', () => {
      sendSummaryToTelegram();
      window.open('https://wa.me/' + WA_NUMBER + '?text=' + WA_TEXT, '_blank');
      btn.innerHTML = '✓ WhatsApp\'a yönlendiriliyorsunuz...';
      btn.style.background = '#128c7e';
      btn.disabled = true;
    });

    msgs.appendChild(btn);
    scrollBottom(msgs);
  }

  // --- Telegram özet gönder (WhatsApp yönlendirmesinde) ---
  async function sendSummaryToTelegram() {
    if (history.length === 0) return;
    sessionStorage.setItem('ayse_summary_sent', '1');
    try {
      await fetch(apiUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'summary', messages: history }),
      });
    } catch { /* sessizce geç */ }
  }

  // --- Sekme kapanınca özet gönder (sendBeacon — iptal edilmez) ---
  window.addEventListener('pagehide', () => {
    // Gerçek sohbet yoksa (sadece karşılama mesajı) veya özet zaten gönderildiyse atla
    const userMessages = history.filter(m => m.role === 'user');
    if (userMessages.length === 0) return;
    if (sessionStorage.getItem('ayse_summary_sent')) return;

    sessionStorage.setItem('ayse_summary_sent', '1');
    const payload = JSON.stringify({ action: 'summary', messages: history, source: 'tab_closed' });
    navigator.sendBeacon(apiUrl, new Blob([payload], { type: 'application/json' }));
  });

  // --- Yardımcılar ---
  function addBotMessage(msgs, text, scroll = true) {
    const el = document.createElement('div');
    el.className = 'ayse-msg bot';
    el.textContent = text;
    msgs.appendChild(el);
    if (scroll) scrollBottom(msgs);
    return el;
  }

  function addUserMessage(msgs, text, scroll = true) {
    const el = document.createElement('div');
    el.className = 'ayse-msg user';
    el.textContent = text;
    msgs.appendChild(el);
    if (scroll) scrollBottom(msgs);
    return el;
  }

  function showTyping(msgs) {
    const el = document.createElement('div');
    el.className = 'ayse-typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(el);
    scrollBottom(msgs);
    return el;
  }

  function scrollBottom(msgs) { msgs.scrollTop = msgs.scrollHeight; }

  function saveHistory() {
    sessionStorage.setItem('ayse_history', JSON.stringify(history));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildWidget);
  } else {
    buildWidget();
  }
})();
