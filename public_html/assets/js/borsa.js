// ===== BORSA TRACKER =====

// ---- AUTOCOMPLETE VERİ LİSTESİ ----
const STOCK_SUGGESTIONS = [
  // BIST
  { symbol: 'THYAO',  name: 'Türk Hava Yolları',       market: 'BIST' },
  { symbol: 'GARAN',  name: 'Garanti BBVA',             market: 'BIST' },
  { symbol: 'AKBNK',  name: 'Akbank',                   market: 'BIST' },
  { symbol: 'YKBNK',  name: 'Yapı Kredi Bankası',       market: 'BIST' },
  { symbol: 'ISCTR',  name: 'İş Bankası C',             market: 'BIST' },
  { symbol: 'TUPRS',  name: 'Tüpraş',                   market: 'BIST' },
  { symbol: 'EREGL',  name: 'Ereğli Demir Çelik',       market: 'BIST' },
  { symbol: 'KCHOL',  name: 'Koç Holding',              market: 'BIST' },
  { symbol: 'SAHOL',  name: 'Sabancı Holding',          market: 'BIST' },
  { symbol: 'SISE',   name: 'Şişecam',                  market: 'BIST' },
  { symbol: 'BIMAS',  name: 'BİM Mağazalar',            market: 'BIST' },
  { symbol: 'FROTO',  name: 'Ford Otosan',              market: 'BIST' },
  { symbol: 'TOASO',  name: 'Tofaş Oto Fabrika',        market: 'BIST' },
  { symbol: 'ARCLK',  name: 'Arçelik',                  market: 'BIST' },
  { symbol: 'TCELL',  name: 'Turkcell',                 market: 'BIST' },
  { symbol: 'TTKOM',  name: 'Türk Telekom',             market: 'BIST' },
  { symbol: 'PETKM',  name: 'Petkim',                   market: 'BIST' },
  { symbol: 'ASELS',  name: 'Aselsan',                  market: 'BIST' },
  { symbol: 'EKGYO',  name: 'Emlak Konut GYO',          market: 'BIST' },
  { symbol: 'ENKAI',  name: 'Enka İnşaat',              market: 'BIST' },
  { symbol: 'KOZAL',  name: 'Koza Altın',               market: 'BIST' },
  { symbol: 'MGROS',  name: 'Migros Ticaret',           market: 'BIST' },
  { symbol: 'ULKER',  name: 'Ülker Bisküvi',            market: 'BIST' },
  { symbol: 'TAVHL',  name: 'TAV Havalimanları',        market: 'BIST' },
  { symbol: 'PGSUS',  name: 'Pegasus Hava Yolları',     market: 'BIST' },
  { symbol: 'OTKAR',  name: 'Otokar',                   market: 'BIST' },
  { symbol: 'VESTL',  name: 'Vestel Elektronik',        market: 'BIST' },
  { symbol: 'SOKM',   name: 'Şok Marketler',            market: 'BIST' },
  { symbol: 'DOHOL',  name: 'Doğan Holding',            market: 'BIST' },
  { symbol: 'VAKBN',  name: 'Vakıfbank',                market: 'BIST' },
  { symbol: 'HALKB',  name: 'Halk Bankası',             market: 'BIST' },
  { symbol: 'TKFEN',  name: 'Tekfen Holding',           market: 'BIST' },
  { symbol: 'GUBRF',  name: 'Gübre Fabrikaları',        market: 'BIST' },
  { symbol: 'LOGO',   name: 'Logo Yazılım',             market: 'BIST' },
  { symbol: 'MAVI',   name: 'Mavi Giyim',               market: 'BIST' },
  { symbol: 'CIMSA',  name: 'Çimsa Çimento',            market: 'BIST' },
  { symbol: 'AKCNS',  name: 'Akçansa Çimento',          market: 'BIST' },
  { symbol: 'BOLUC',  name: 'Bolu Çimento',             market: 'BIST' },
  { symbol: 'NUHCM',  name: 'Nuh Çimento',              market: 'BIST' },
  { symbol: 'ADANA',  name: 'Adana Çimento A',          market: 'BIST' },
  { symbol: 'BRISA',  name: 'Brisa Bridgestone',        market: 'BIST' },
  { symbol: 'KRDMD',  name: 'Kardemir D',               market: 'BIST' },
  { symbol: 'ALARK',  name: 'Alarko Holding',           market: 'BIST' },
  { symbol: 'AGHOL',  name: 'AG Anadolu Grubu',         market: 'BIST' },
  { symbol: 'ISGYO',  name: 'İş GYO',                   market: 'BIST' },
  { symbol: 'TRGYO',  name: 'Torunlar GYO',             market: 'BIST' },
  { symbol: 'INDES',  name: 'İndeks Bilgisayar',        market: 'BIST' },
  { symbol: 'PRKAB',  name: 'Türk Prysmian Kablo',      market: 'BIST' },
  { symbol: 'GLYHO',  name: 'Global Yatırım Holding',   market: 'BIST' },
  { symbol: 'MPARK',  name: 'MLP Sağlık',               market: 'BIST' },
  { symbol: 'HEKTS',  name: 'Hektaş Ticaret',           market: 'BIST' },
  { symbol: 'BERA',   name: 'Bera Holding',             market: 'BIST' },
  { symbol: 'SKBNK',  name: 'Şekerbank',                market: 'BIST' },
  { symbol: 'TSKB',   name: 'Türkiye Sınai Kalkınma',   market: 'BIST' },
  { symbol: 'SELEC',  name: 'Selçuk Ecza Deposu',       market: 'BIST' },
  { symbol: 'KONTR',  name: 'Kontrolmatik Teknoloji',   market: 'BIST' },
  { symbol: 'NTHOL',  name: 'Net Holding',              market: 'BIST' },
  { symbol: 'GENIL',  name: 'Gen İlaç',                 market: 'BIST' },
  { symbol: 'ALFAS',  name: 'Alfa Solar Enerji',        market: 'BIST' },
  // NASDAQ
  { symbol: 'AAPL',   name: 'Apple Inc.',               market: 'NASDAQ' },
  { symbol: 'MSFT',   name: 'Microsoft',                market: 'NASDAQ' },
  { symbol: 'GOOGL',  name: 'Alphabet (Google)',        market: 'NASDAQ' },
  { symbol: 'AMZN',   name: 'Amazon',                   market: 'NASDAQ' },
  { symbol: 'META',   name: 'Meta Platforms',           market: 'NASDAQ' },
  { symbol: 'TSLA',   name: 'Tesla Inc.',               market: 'NASDAQ' },
  { symbol: 'NVDA',   name: 'NVIDIA',                   market: 'NASDAQ' },
  { symbol: 'NFLX',   name: 'Netflix',                  market: 'NASDAQ' },
  { symbol: 'AMD',    name: 'Advanced Micro Devices',   market: 'NASDAQ' },
  { symbol: 'INTC',   name: 'Intel',                    market: 'NASDAQ' },
  { symbol: 'CSCO',   name: 'Cisco Systems',            market: 'NASDAQ' },
  { symbol: 'ADBE',   name: 'Adobe Inc.',               market: 'NASDAQ' },
  { symbol: 'CRM',    name: 'Salesforce',               market: 'NASDAQ' },
  { symbol: 'ORCL',   name: 'Oracle',                   market: 'NASDAQ' },
  { symbol: 'PYPL',   name: 'PayPal',                   market: 'NASDAQ' },
  { symbol: 'QCOM',   name: 'Qualcomm',                 market: 'NASDAQ' },
  { symbol: 'COST',   name: 'Costco',                   market: 'NASDAQ' },
  // NYSE
  { symbol: 'JPM',    name: 'JPMorgan Chase',           market: 'NYSE' },
  { symbol: 'BAC',    name: 'Bank of America',          market: 'NYSE' },
  { symbol: 'WMT',    name: 'Walmart',                  market: 'NYSE' },
  { symbol: 'JNJ',    name: 'Johnson & Johnson',        market: 'NYSE' },
  { symbol: 'XOM',    name: 'ExxonMobil',               market: 'NYSE' },
  { symbol: 'V',      name: 'Visa Inc.',                market: 'NYSE' },
  { symbol: 'MA',     name: 'Mastercard',               market: 'NYSE' },
  { symbol: 'PG',     name: 'Procter & Gamble',         market: 'NYSE' },
  { symbol: 'HD',     name: 'Home Depot',               market: 'NYSE' },
  { symbol: 'DIS',    name: 'Walt Disney',              market: 'NYSE' },
  { symbol: 'BA',     name: 'Boeing',                   market: 'NYSE' },
  { symbol: 'GS',     name: 'Goldman Sachs',            market: 'NYSE' },
  { symbol: 'MS',     name: 'Morgan Stanley',           market: 'NYSE' },
  { symbol: 'GE',     name: 'General Electric',         market: 'NYSE' },
  { symbol: 'NKE',    name: 'Nike Inc.',                market: 'NYSE' },
  { symbol: 'MCD',    name: 'McDonald\'s',              market: 'NYSE' },
  { symbol: 'UNH',    name: 'UnitedHealth Group',       market: 'NYSE' },
  { symbol: 'LLY',    name: 'Eli Lilly',                market: 'NYSE' },
  { symbol: 'PFE',    name: 'Pfizer',                   market: 'NYSE' },
  { symbol: 'WFC',    name: 'Wells Fargo',              market: 'NYSE' },
  // EURO
  { symbol: 'SAP.DE',   name: 'SAP SE',                market: 'EURO' },
  { symbol: 'ASML.AS',  name: 'ASML Holding',          market: 'EURO' },
  { symbol: 'LVMH.PA',  name: 'LVMH',                  market: 'EURO' },
  { symbol: 'MC.PA',    name: 'LVMH (alt sembol)',      market: 'EURO' },
  { symbol: 'SAN.PA',   name: 'Sanofi',                market: 'EURO' },
  { symbol: 'AIR.PA',   name: 'Airbus',                market: 'EURO' },
  { symbol: 'TTE.PA',   name: 'TotalEnergies',         market: 'EURO' },
  { symbol: 'BNP.PA',   name: 'BNP Paribas',           market: 'EURO' },
  { symbol: 'SIE.DE',   name: 'Siemens AG',            market: 'EURO' },
  { symbol: 'BMW.DE',   name: 'BMW Group',             market: 'EURO' },
  { symbol: 'VOW3.DE',  name: 'Volkswagen',            market: 'EURO' },
  { symbol: 'ALV.DE',   name: 'Allianz SE',            market: 'EURO' },
  { symbol: 'NESN.SW',  name: 'Nestlé',                market: 'EURO' },
  { symbol: 'NOVN.SW',  name: 'Novartis',              market: 'EURO' },
  { symbol: 'ROG.SW',   name: 'Roche Holding',         market: 'EURO' },
];

// ---- AUTOCOMPLETE MANTIK ----
let acActiveIndex = -1;

function initSymbolAutocomplete() {
  const input = document.getElementById('stock-symbol');
  const dropdown = document.getElementById('symbol-dropdown');
  if (!input || !dropdown) return;

  input.addEventListener('input', () => {
    acActiveIndex = -1;
    const q = input.value.trim();
    if (!q) { closeDropdown(); return; }
    const matches = filterAC(q);
    renderDropdown(matches, q);
  });

  input.addEventListener('keydown', e => {
    const items = dropdown.querySelectorAll('li');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      acActiveIndex = Math.min(acActiveIndex + 1, items.length - 1);
      highlightAC(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      acActiveIndex = Math.max(acActiveIndex - 1, 0);
      highlightAC(items);
    } else if (e.key === 'Enter') {
      if (acActiveIndex >= 0 && items[acActiveIndex]) {
        e.preventDefault();
        items[acActiveIndex].click();
      }
    } else if (e.key === 'Escape') {
      closeDropdown();
    }
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('#symbol-autocomplete') &&
        !e.target.closest('.symbol-ac')) {
      closeDropdown();
    }
  });
}

function filterAC(q) {
  const lower = q.toLowerCase();
  // Zaten listede olan sembolleri çıkar
  const existing = new Set(stockList.map(s => s.symbol));
  return STOCK_SUGGESTIONS
    .filter(s => !existing.has(s.symbol) &&
      (s.symbol.toLowerCase().includes(lower) ||
       s.name.toLowerCase().includes(lower)))
    .slice(0, 8);
}

function renderDropdown(matches, q) {
  const dropdown = document.getElementById('symbol-dropdown');
  if (!matches.length) { closeDropdown(); return; }

  dropdown.innerHTML = matches.map((s, i) => `
    <li data-i="${i}" onclick="selectSymbol(${STOCK_SUGGESTIONS.indexOf(s)})">
      <span class="ac-symbol">${highlight(s.symbol, q)}</span>
      <span class="ac-name">${highlight(s.name, q)}</span>
      <span class="ac-market">${s.market}</span>
    </li>
  `).join('');
  dropdown.classList.add('open');
}

function highlight(text, q) {
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return text.slice(0, idx) +
    '<mark>' + text.slice(idx, idx + q.length) + '</mark>' +
    text.slice(idx + q.length);
}

function highlightAC(items) {
  items.forEach((li, i) => li.classList.toggle('active', i === acActiveIndex));
  if (items[acActiveIndex]) items[acActiveIndex].scrollIntoView({ block: 'nearest' });
}

function selectSymbol(suggestionIndex) {
  const s = STOCK_SUGGESTIONS[suggestionIndex];
  if (!s) return;
  document.getElementById('stock-symbol').value = s.symbol;
  document.getElementById('stock-name').value = s.name;
  document.getElementById('stock-market').value = s.market;
  closeDropdown();
}

function closeDropdown() {
  const d = document.getElementById('symbol-dropdown');
  if (d) { d.innerHTML = ''; d.classList.remove('open'); }
  acActiveIndex = -1;
}

const DEFAULT_STOCKS = [
  { symbol: 'THYAO', name: 'Türk Hava Yolları', market: 'BIST' },
  { symbol: 'GARAN', name: 'Garanti BBVA', market: 'BIST' },
  { symbol: 'AAPL', name: 'Apple Inc.', market: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla Inc.', market: 'NASDAQ' },
  { symbol: 'JPM', name: 'JPMorgan Chase', market: 'NYSE' },
  { symbol: 'SAP.DE', name: 'SAP SE', market: 'EURO' },
];

const INDEX_SYMBOLS = [
  { id: 'bist', yahoo: 'XU100.IS', label: 'BIST 100' },
  { id: 'nasdaq', yahoo: '%5EIXIC', label: 'NASDAQ' },
  { id: 'nyse', yahoo: '%5EDJI', label: 'NYSE' },
  { id: 'euro', yahoo: '%5ESTOXX50E', label: 'EURO STOXX' },
];

let stockList = JSON.parse(localStorage.getItem('db_stocks') || 'null') || DEFAULT_STOCKS;
let alarms = JSON.parse(localStorage.getItem('db_alarms') || '[]');
let stockPrices = {};

const TG_API = '/api/telegram.php';

document.addEventListener('DOMContentLoaded', () => {
  renderStockTable();
  renderStockManageList();
  renderAlarmSelector();
  renderAlarms();
  updateLastUpdate();
  initSymbolAutocomplete();
  initTelegramButton();

  fetchAllPrices();
  setInterval(fetchAllPrices, 60000);
});

// ---- YAHOO FINANCE FETCH ----

function getYahooSymbol(symbol, market) {
  if (market === 'BIST') return symbol + '.IS';
  return symbol;
}

const PROXY_URL = '/borsa/proxy.php';

async function fetchYahoo(yahooSymbol) {
  // PHP proxy'yi dene (CORS sorununu önler)
  try {
    const res = await fetch(`${PROXY_URL}?symbol=${encodeURIComponent(yahooSymbol)}`);
    if (res.ok) {
      const d = await res.json();
      if (!d.error) return { price: d.price, change: d.change, volume: d.volume };
    }
  } catch (_) {}

  // Proxy başarısız olursa direkt Yahoo Finance dene
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1d`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  const meta = data.chart.result[0].meta;
  const price = meta.regularMarketPrice;
  const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
  return { price, change: ((price - prevClose) / prevClose) * 100, volume: meta.regularMarketVolume ?? null };
}

async function fetchAllPrices() {
  setFetchStatus('loading');

  // Fetch index cards
  INDEX_SYMBOLS.forEach(async idx => {
    try {
      const d = await fetchYahoo(idx.yahoo);
      updateIndexCard(idx.id, d.price, d.change);
    } catch (_) {}
  });

  // Fetch stock list in parallel
  const results = await Promise.allSettled(
    stockList.map(s =>
      fetchYahoo(getYahooSymbol(s.symbol, s.market))
        .then(d => ({ symbol: s.symbol, d }))
    )
  );

  let anyOk = false;
  results.forEach(r => {
    if (r.status === 'fulfilled') {
      stockPrices[r.value.symbol] = r.value.d;
      anyOk = true;
    }
  });

  setFetchStatus(anyOk ? 'ok' : 'error');
  checkAlarms();
  renderStockTable();
  updateLastUpdate();
}

function updateIndexCard(id, price, changePct) {
  const valEl = document.getElementById(id + '-val');
  const chgEl = document.getElementById(id + '-change');
  if (!valEl || !chgEl) return;
  valEl.textContent = price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sign = changePct >= 0 ? '+' : '';
  chgEl.textContent = sign + changePct.toFixed(2) + '%';
  chgEl.className = 'market-change ' + (changePct >= 0 ? 'up' : 'down');
}

function setFetchStatus(state) {
  const el = document.getElementById('fetch-status');
  if (!el) return;
  if (state === 'loading') {
    el.textContent = 'Veri çekiliyor...';
    el.style.color = '#9ca3af';
  } else if (state === 'ok') {
    el.textContent = 'Canlı veri';
    el.style.color = '#10b981';
  } else {
    el.textContent = 'Veri alınamadı (Yahoo Finance erişim sorunu olabilir)';
    el.style.color = '#ef4444';
  }
}

// ---- STOCK TABLE ----

function renderStockTable() {
  const tbody = document.getElementById('stock-tbody');
  if (!tbody) return;

  if (stockList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#9ca3af;padding:2rem;">Hisse listesi boş. Aşağıdan hisse ekleyin.</td></tr>';
    return;
  }

  tbody.innerHTML = stockList.map(s => {
    const p = stockPrices[s.symbol];
    const price = p ? p.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';
    const changeTxt = p ? (p.change >= 0 ? '+' : '') + p.change.toFixed(2) + '%' : '—';
    const cls = p ? (p.change >= 0 ? 'up' : 'down') : '';
    const vol = p ? formatVolume(p.volume) : '—';
    return `<tr>
      <td><strong>${s.symbol}</strong></td>
      <td>${s.name}</td>
      <td>${s.market}</td>
      <td>${price}</td>
      <td class="${cls}">${changeTxt}</td>
      <td>${vol}</td>
    </tr>`;
  }).join('');
}

function formatVolume(v) {
  if (!v) return '—';
  if (v >= 1e9) return (v / 1e9).toFixed(1) + 'B';
  if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M';
  if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K';
  return String(v);
}

// ---- STOCK LIST MANAGEMENT ----

function renderStockManageList() {
  const container = document.getElementById('stock-manage-list');
  if (!container) return;

  if (stockList.length === 0) {
    container.innerHTML = '<p style="color:#9ca3af;margin-top:1rem;">Liste boş. Yukarıdan hisse ekleyin.</p>';
    return;
  }

  container.innerHTML = `<div style="margin-top:1rem;display:flex;flex-direction:column;gap:0.5rem;">
    ${stockList.map((s, i) => `
      <div style="display:flex;align-items:center;padding:0.75rem 1rem;background:#1f2937;border-radius:8px;gap:1rem;">
        <span style="font-weight:700;color:#c9a96e;min-width:90px;">${s.symbol}</span>
        <span style="color:#d1d5db;flex:1;">${s.name}</span>
        <span style="color:#9ca3af;min-width:70px;font-size:0.85rem;">${s.market}</span>
        <button onclick="removeStock(${i})" style="background:#ef4444;color:#fff;border:none;padding:0.3rem 0.7rem;border-radius:4px;cursor:pointer;font-size:0.85rem;">Kaldır</button>
      </div>
    `).join('')}
  </div>`;
}

function addStock() {
  const symbolRaw = document.getElementById('stock-symbol').value.trim().toUpperCase();
  const name = document.getElementById('stock-name').value.trim();
  const market = document.getElementById('stock-market').value;

  if (!symbolRaw) {
    alert('Sembol zorunludur!');
    return;
  }
  const finalName = name || symbolRaw;

  if (stockList.some(s => s.symbol === symbolRaw)) {
    alert('Bu sembol zaten listede mevcut!');
    return;
  }

  stockList.push({ symbol: symbolRaw, name: finalName, market });
  saveStockList();

  document.getElementById('stock-symbol').value = '';
  document.getElementById('stock-name').value = '';

  renderStockManageList();
  renderAlarmSelector();

  fetchYahoo(getYahooSymbol(symbolRaw, market))
    .then(d => { stockPrices[symbolRaw] = d; })
    .catch(() => {})
    .finally(() => renderStockTable());
}

function removeStock(index) {
  const s = stockList[index];
  if (!confirm(`"${s.symbol} – ${s.name}" listeden kaldırılsın mı?`)) return;

  stockList.splice(index, 1);
  delete stockPrices[s.symbol];
  alarms = alarms.filter(a => a.symbol !== s.symbol);
  localStorage.setItem('db_alarms', JSON.stringify(alarms));

  saveStockList();
  renderStockTable();
  renderStockManageList();
  renderAlarmSelector();
  renderAlarms();
}

function saveStockList() {
  localStorage.setItem('db_stocks', JSON.stringify(stockList));
}

// ---- ALARMS ----

function renderAlarmSelector() {
  const sel = document.getElementById('alarm-symbol');
  if (!sel) return;
  sel.innerHTML = stockList.map(s => `<option value="${s.symbol}">${s.symbol} – ${s.name}</option>`).join('');
}

function addAlarm() {
  const symbol = document.getElementById('alarm-symbol').value;
  const type = document.getElementById('alarm-type').value;
  const price = parseFloat(document.getElementById('alarm-price').value);

  if (!price || isNaN(price)) {
    alert('Lütfen geçerli bir fiyat girin!');
    return;
  }

  alarms.push({ id: Date.now(), symbol, type, price, active: true });
  localStorage.setItem('db_alarms', JSON.stringify(alarms));
  renderAlarms();
  document.getElementById('alarm-price').value = '';
}

function removeAlarm(id) {
  alarms = alarms.filter(a => a.id !== id);
  localStorage.setItem('db_alarms', JSON.stringify(alarms));
  renderAlarms();
}

function renderAlarms() {
  const list = document.getElementById('alarm-list');
  if (!list) return;

  if (alarms.length === 0) {
    list.innerHTML = '<p style="color:#9ca3af;margin-top:1rem;">Henüz alarm eklenmemiş.</p>';
    return;
  }

  list.innerHTML = alarms.map(a => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:0.8rem;background:#1f2937;border-radius:8px;margin-top:0.5rem;opacity:${a.active ? 1 : 0.55};">
      <span>
        <strong style="color:#c9a96e;">${a.symbol}</strong>
        &nbsp;${a.type === 'above' ? '⬆ Yukarı kırarsa' : '⬇ Aşağı kırarsa'}
        &nbsp;<strong>${a.price}</strong>
        ${!a.active ? '<span style="color:#9ca3af;font-size:0.8rem;"> (tetiklendi)</span>' : ''}
      </span>
      <button onclick="removeAlarm(${a.id})" style="background:#ef4444;color:#fff;border:none;padding:0.3rem 0.8rem;border-radius:4px;cursor:pointer;">Sil</button>
    </div>
  `).join('');
}

function checkAlarms() {
  let changed = false;
  alarms.forEach(a => {
    if (!a.active) return;
    const p = stockPrices[a.symbol];
    if (!p) return;

    const triggered =
      (a.type === 'above' && p.price > a.price) ||
      (a.type === 'below' && p.price < a.price);

    if (triggered) {
      a.active = false;
      changed = true;
      const dir = a.type === 'above' ? 'yukarı' : 'aşağı';
      sendTelegram(`🔔 ALARM: ${a.symbol} ${dir} kırdı!\nHedef: ${a.price}\nGüncel: ${p.price.toFixed(2)}`);
    }
  });

  if (changed) {
    localStorage.setItem('db_alarms', JSON.stringify(alarms));
    renderAlarms();
  }
}

// ---- TELEGRAM ----

function initTelegramButton() {
  fetch(TG_API)
    .then(r => r.json())
    .then(d => {
      if (d.bot_username) {
        const btn = document.getElementById('tg-deeplink');
        if (btn) btn.href = 'https://t.me/' + d.bot_username;
      }
    })
    .catch(() => {});
}

function sendTelegram(message) {
  fetch(TG_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: message }),
  }).catch(err => console.error('Telegram hata:', err));
}

// ---- EXPORT & UTILS ----

function exportToExcel() {
  const header = ['Sembol', 'İsim', 'Piyasa', 'Fiyat', 'Değişim%', 'Hacim'];
  const rows = stockList.map(s => {
    const p = stockPrices[s.symbol];
    return [
      s.symbol,
      s.name,
      s.market,
      p ? p.price.toFixed(2) : '',
      p ? (p.change >= 0 ? '+' : '') + p.change.toFixed(2) + '%' : '',
      p ? formatVolume(p.volume) : '',
    ];
  });

  const csv = '﻿' + [header, ...rows].map(r => r.join(';')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'borsa_verileri_' + new Date().toISOString().slice(0, 10) + '.csv';
  link.click();
}

function refreshData() {
  fetchAllPrices();
}

function updateLastUpdate() {
  const el = document.getElementById('last-update');
  if (el) el.textContent = 'Son güncelleme: ' + new Date().toLocaleTimeString('tr-TR');
}
