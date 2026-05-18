const items = [
  {
    title: '2026-05-14 皓哥開示摘要',
    file: '2026-05-14_皓哥開示摘要圖.png',
    date: '2026-05-14'
  },
  {
    title: '2026-05-15 皓哥開示摘要',
    file: '2026-05-15_皓哥開示摘要圖.png',
    date: '2026-05-15'
  },
  {
    title: '2026-05-18 皓哥開示摘要',
    file: '2026-05-18_皓哥開示摘要圖.png',
    date: '2026-05-18'
  }
];

const usIndices = [
  { symbol: '^DJI', valueId: 'us-dji', changeId: 'us-dji-change' },
  { symbol: '^IXIC', valueId: 'us-ixic', changeId: 'us-ixic-change' },
  { symbol: '^GSPC', valueId: 'us-gspc', changeId: 'us-gspc-change' },
  { symbol: '^SOX', valueId: 'us-sox', changeId: 'us-sox-change' }
];

let haoNotes = [];

const homePanel = document.querySelector('#homePanel');
const haoZone = document.querySelector('#haoZone');
const haoZoneButton = document.querySelector('#haoZoneButton');
const gallery = document.querySelector('#gallery');
const viewerTitle = document.querySelector('#viewerTitle');
const updateDate = document.querySelector('#updateDate');
const liveTime = document.querySelector('#liveTime');
const siteEyebrow = document.querySelector('#siteEyebrow');
const siteTitle = document.querySelector('#siteTitle');
const headerHomeButton = document.querySelector('#headerHomeButton');
const noteReader = document.querySelector('#noteReader');
const marketIndex = document.querySelector('#marketIndex');
const marketChange = document.querySelector('#marketChange');
const marketTime = document.querySelector('#marketTime');
const marketHigh = document.querySelector('#marketHigh');
const marketLow = document.querySelector('#marketLow');
const marketDate = document.querySelector('#marketDate');
const marketNote = document.querySelector('#marketNote');
const usMarketNote = document.querySelector('#usMarketNote');

const imagePath = (file) => `./public/uploads/images/${encodeURIComponent(file)}`;

function formatToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function formatTaipeiTime() {
  const parts = new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}/${values.month}/${values.day} ${values.hour}:${values.minute}:${values.second}`;
}

function updateLiveTime() {
  liveTime.textContent = `現在時間 ${formatTaipeiTime()}`;
}

function setUpdateDate() {
  updateDate.textContent = `${formatToday()}已更新`;
}

function parseMarketNumber(value) {
  return Number(String(value).replace(/,/g, ''));
}

function formatMarketNumber(value) {
  return new Intl.NumberFormat('zh-TW', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

function formatMarketDate(value) {
  if (!value || value.length !== 8) {
    return value || '--';
  }
  return `${value.slice(0, 4)}/${value.slice(4, 6)}/${value.slice(6, 8)}`;
}

function setChangeText(element, change, percent, suffix = '') {
  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
  const sign = change > 0 ? '+' : '';
  element.textContent = `${sign}${formatMarketNumber(change)} (${sign}${percent.toFixed(2)}%)${suffix}`;
  element.dataset.direction = direction;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/#([\p{L}\p{N}_-]+)/gu, '<span class="tag">#$1</span>');
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const html = [];
  let inList = false;
  let inQuote = false;

  function closeList() {
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
  }

  function closeQuote() {
    if (inQuote) {
      html.push('</blockquote>');
      inQuote = false;
    }
  }

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      closeList();
      closeQuote();
      return;
    }

    if (trimmed.startsWith('>')) {
      closeList();
      if (!inQuote) {
        html.push('<blockquote>');
        inQuote = true;
      }
      html.push(`<p>${inlineMarkdown(trimmed.replace(/^>\s?/, ''))}</p>`);
      return;
    }

    closeQuote();

    if (trimmed.startsWith('### ')) {
      closeList();
      html.push(`<h3>${inlineMarkdown(trimmed.slice(4))}</h3>`);
      return;
    }

    if (trimmed.startsWith('## ')) {
      closeList();
      html.push(`<h2>${inlineMarkdown(trimmed.slice(3))}</h2>`);
      return;
    }

    if (trimmed.startsWith('# ')) {
      closeList();
      html.push(`<h1>${inlineMarkdown(trimmed.slice(2))}</h1>`);
      return;
    }

    if (/^-\s+/.test(trimmed)) {
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${inlineMarkdown(trimmed.replace(/^-\s+/, ''))}</li>`);
      return;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      closeList();
      html.push(`<h3>${inlineMarkdown(trimmed.replace(/^\d+\.\s+/, ''))}</h3>`);
      return;
    }

    closeList();
    html.push(`<p>${inlineMarkdown(trimmed)}</p>`);
  });

  closeList();
  closeQuote();
  return html.join('');
}

async function loadTaiwanMarketInfo() {
  const endpoint = 'https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_INDEX?response=json';

  try {
    const response = await fetch(`${endpoint}&_=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    const rows = Array.isArray(payload.data) ? payload.data : [];
    if (payload.stat !== 'OK' || rows.length === 0) {
      throw new Error(payload.stat || 'no market data');
    }

    const first = rows[0];
    const latest = rows[rows.length - 1];
    const firstIndex = parseMarketNumber(first[1]);
    const latestIndex = parseMarketNumber(latest[1]);
    const values = rows.map((row) => parseMarketNumber(row[1])).filter(Number.isFinite);
    const high = Math.max(...values);
    const low = Math.min(...values);
    const change = latestIndex - firstIndex;
    const percent = firstIndex ? (change / firstIndex) * 100 : 0;

    marketIndex.textContent = formatMarketNumber(latestIndex);
    setChangeText(marketChange, change, percent, ' 較09:00');
    marketTime.textContent = latest[0];
    marketHigh.textContent = formatMarketNumber(high);
    marketLow.textContent = formatMarketNumber(low);
    marketDate.textContent = formatMarketDate(payload.date);
    marketNote.textContent = '來源：臺灣證券交易所每 5 秒指數統計。頁面每 5 秒嘗試更新一次。';
  } catch (error) {
    marketIndex.textContent = '暫時無法取得';
    marketChange.textContent = '--';
    marketChange.dataset.direction = 'flat';
    marketTime.textContent = '--';
    marketHigh.textContent = '--';
    marketLow.textContent = '--';
    marketDate.textContent = '--';
    marketNote.textContent = '台股資料讀取失敗，請稍後重新整理。';
  }
}

async function loadUsMarketInfo() {
  const lookup = Object.fromEntries(usIndices.map((item) => [item.symbol, item]));

  try {
    const response = await fetch(`/api/us-market?_=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    const quotes = Array.isArray(payload.quotes) ? payload.quotes : [];
    const seen = new Set();

    quotes.forEach((quote) => {
      const item = lookup[quote.symbol];
      if (!item) {
        return;
      }

      const valueElement = document.querySelector(`#${item.valueId}`);
      const changeElement = document.querySelector(`#${item.changeId}`);
      valueElement.textContent = formatMarketNumber(quote.price);
      setChangeText(changeElement, quote.change, quote.percent);
      seen.add(item.symbol);
    });

    usIndices.forEach((item) => {
      if (seen.has(item.symbol)) {
        return;
      }
      document.querySelector(`#${item.valueId}`).textContent = '暫時無法取得';
      const changeElement = document.querySelector(`#${item.changeId}`);
      changeElement.textContent = '--';
      changeElement.dataset.direction = 'flat';
    });

    usMarketNote.textContent = seen.size > 0
      ? '來源：Yahoo Finance。頁面每 5 秒嘗試更新一次；實際更新頻率依資料來源而定。'
      : '美股資料目前無法讀取，請稍後重新整理。';
  } catch (error) {
    usIndices.forEach((item) => {
      document.querySelector(`#${item.valueId}`).textContent = '暫時無法取得';
      const changeElement = document.querySelector(`#${item.changeId}`);
      changeElement.textContent = '--';
      changeElement.dataset.direction = 'flat';
    });
    usMarketNote.textContent = '美股資料目前無法讀取，請稍後重新整理。';
  }
}

async function loadHaoNotes() {
  try {
    const response = await fetch('./public/data/hao-notes.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    haoNotes = await response.json();
  } catch (error) {
    haoNotes = [];
  }
}

function showHome() {
  homePanel.hidden = false;
  haoZone.hidden = true;
  siteEyebrow.textContent = 'Max Test Area';
  siteTitle.textContent = 'Max測試專區';
  headerHomeButton.hidden = true;
  history.replaceState(null, '', location.pathname);
}

function showHaoZone() {
  homePanel.hidden = true;
  haoZone.hidden = false;
  siteEyebrow.textContent = 'Hao Notes';
  siteTitle.textContent = '皓哥開示摘要圖';
  headerHomeButton.hidden = false;
  showNotePlaceholder();
  history.replaceState(null, '', '#hao');
}

function showNotePlaceholder() {
  viewerTitle.textContent = '皓哥開示摘要圖';
  noteReader.innerHTML = '<div class="note-empty">從左側選一個日期查看網頁版摘要。</div>';

  document.querySelectorAll('.gallery-card').forEach((card) => {
    card.classList.remove('is-active');
  });
}

function selectItem(item) {
  homePanel.hidden = true;
  haoZone.hidden = false;
  siteEyebrow.textContent = 'Hao Notes';
  siteTitle.textContent = '皓哥開示摘要圖';
  headerHomeButton.hidden = false;

  const note = haoNotes.find((entry) => entry.date === item.date);
  viewerTitle.textContent = item.title;

  if (!note) {
    noteReader.innerHTML = '<div class="note-empty">這一天的文字摘要尚未載入。</div>';
  } else {
    noteReader.innerHTML = `
      <div class="note-content">${markdownToHtml(note.markdown)}</div>
      <details class="original-image">
        <summary>查看原圖備份</summary>
        <img src="${imagePath(note.image)}" alt="${escapeHtml(note.title)} 原圖" />
      </details>
    `;
  }

  document.querySelectorAll('.gallery-card').forEach((card) => {
    card.classList.toggle('is-active', card.dataset.file === item.file);
  });

  history.replaceState(null, '', `#${item.date}`);
}

function renderGallery() {
  gallery.innerHTML = '';

  items.forEach((item) => {
    const button = document.createElement('button');
    button.className = 'gallery-card';
    button.type = 'button';
    button.dataset.file = item.file;
    button.innerHTML = `
      <span class="date">${item.date}</span>
      <span class="title">皓哥開示摘要</span>
      <span class="hint">閱讀網頁版</span>
    `;
    button.addEventListener('click', () => selectItem(item));
    gallery.appendChild(button);
  });
}

async function boot() {
  await loadHaoNotes();
  renderGallery();

  const hashDate = decodeURIComponent(location.hash.replace('#', ''));
  const initial = items.find((item) => item.date === hashDate);

  if (initial) {
    selectItem(initial);
  } else if (hashDate === 'hao') {
    showHaoZone();
  } else {
    showHome();
  }
}

haoZoneButton.addEventListener('click', showHaoZone);
headerHomeButton.addEventListener('click', showHome);

setUpdateDate();
updateLiveTime();
setInterval(updateLiveTime, 1000);
loadTaiwanMarketInfo();
loadUsMarketInfo();
setInterval(loadTaiwanMarketInfo, 5000);
setInterval(loadUsMarketInfo, 5000);
boot();
