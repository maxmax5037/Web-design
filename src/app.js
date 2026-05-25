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
  },
  {
    title: '2026-05-19 皓哥開示摘要',
    file: '2026-05-19_皓哥開示摘要圖.png',
    date: '2026-05-19'
  },
  {
    title: '2026-05-20 皓哥開示摘要',
    file: '2026-05-20_皓哥開示摘要圖.png',
    date: '2026-05-20'
  },
  {
    title: '2026-05-21 皓哥開示摘要',
    file: '2026-05-21_皓哥開示摘要圖.png',
    date: '2026-05-21'
  },
  {
    title: '2026-05-22 皓哥開示摘要',
    file: '2026-05-22_皓哥開示摘要圖.png',
    date: '2026-05-22'
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
const mengZone = document.querySelector('#mengZone');
const xiaobaiZone = document.querySelector('#xiaobaiZone');
const haoZoneButton = document.querySelector('#haoZoneButton');
const mengZoneButton = document.querySelector('#mengZoneButton');
const xiaobaiZoneButton = document.querySelector('#xiaobaiZoneButton');
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
const nightMarketName = document.querySelector('#nightMarketName');
const nightMarketIndex = document.querySelector('#nightMarketIndex');
const nightMarketChange = document.querySelector('#nightMarketChange');
const nightMarketVolume = document.querySelector('#nightMarketVolume');
const nightMarketTime = document.querySelector('#nightMarketTime');
const nightMarketNote = document.querySelector('#nightMarketNote');
const usMarketNote = document.querySelector('#usMarketNote');
const fundNote = document.querySelector('#fundNote');
const fundCards = {
  '1205': {
    nav: document.querySelector('#fund-1205-nav'),
    change: document.querySelector('#fund-1205-change'),
    date: document.querySelector('#fund-1205-date')
  },
  '2531': {
    nav: document.querySelector('#fund-2531-nav'),
    change: document.querySelector('#fund-2531-change'),
    date: document.querySelector('#fund-2531-date')
  }
};

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

function parseMarkdownSections(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const titleLine = lines.find((line) => line.startsWith('# ')) || '';
  const title = titleLine.replace(/^#\s+/, '').trim();
  const sections = [];
  let current = null;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('# ')) {
      return;
    }

    if (trimmed.startsWith('## ')) {
      current = { heading: trimmed.slice(3).trim(), lines: [] };
      sections.push(current);
      return;
    }

    if (!current) {
      current = { heading: '摘要', lines: [] };
      sections.push(current);
    }

    current.lines.push(trimmed);
  });

  return { title, sections };
}

function sectionIcon(heading) {
  const map = [
    ['一句話', '重'],
    ['主軸', '軸'],
    ['投資', '投'],
    ['標籤', '#'],
    ['笑話', '笑'],
    ['補充', '補'],
    ['對應', '卡'],
    ['其他', '其'],
    ['今日', '今']
  ];
  return map.find(([key]) => heading.includes(key))?.[1] || '摘';
}

function renderSectionLines(lines) {
  const html = [];
  let listOpen = false;
  let quoteOpen = false;

  function closeList() {
    if (listOpen) {
      html.push('</ul>');
      listOpen = false;
    }
  }

  function closeQuote() {
    if (quoteOpen) {
      html.push('</blockquote>');
      quoteOpen = false;
    }
  }

  lines.forEach((line) => {
    if (line.startsWith('>')) {
      closeList();
      if (!quoteOpen) {
        html.push('<blockquote>');
        quoteOpen = true;
      }
      html.push(`<p>${inlineMarkdown(line.replace(/^>\s?/, ''))}</p>`);
      return;
    }

    closeQuote();

    if (line.startsWith('### ')) {
      closeList();
      html.push(`<h3>${inlineMarkdown(line.slice(4))}</h3>`);
      return;
    }

    if (/^\d+\.\s+/.test(line)) {
      closeList();
      html.push(`<h3>${inlineMarkdown(line.replace(/^\d+\.\s+/, ''))}</h3>`);
      return;
    }

    if (/^-\s+/.test(line)) {
      if (!listOpen) {
        html.push('<ul>');
        listOpen = true;
      }
      html.push(`<li>${inlineMarkdown(line.replace(/^-\s+/, ''))}</li>`);
      return;
    }

    closeList();
    html.push(`<p>${inlineMarkdown(line)}</p>`);
  });

  closeList();
  closeQuote();
  return html.join('');
}

function renderTags(section) {
  const tags = section.lines
    .map((line) => line.replace(/^-\s+/, '').trim())
    .filter(Boolean)
    .map((tag) => tag.startsWith('#') ? tag : `#${tag}`);

  if (!tags.length) {
    return '';
  }

  return `<div class="tag-cloud">${tags.map((tag) => `<span class="tag">${inlineMarkdown(tag)}</span>`).join('')}</div>`;
}

function markdownToHtml(markdown) {
  const { title, sections } = parseMarkdownSections(markdown);
  const sourceSection = sections.find((section) => section.lines.some((line) => line.startsWith('>')));
  const normalSections = sections.filter((section) => section !== sourceSection);
  const oneLine = normalSections.find((section) => section.heading.includes('一句話'));
  const tagSection = normalSections.find((section) => section.heading.includes('標籤'));
  const cardSections = normalSections.filter((section) => section !== oneLine && section !== tagSection);

  return `
    <div class="note-hero">
      <div>
        <p class="note-kicker">Hao Notes</p>
        <h1>${inlineMarkdown(title)}</h1>
      </div>
      <span class="note-badge">網頁版</span>
    </div>
    ${sourceSection ? `<div class="source-card">${renderSectionLines(sourceSection.lines)}</div>` : ''}
    ${oneLine ? `<section class="key-takeaway"><span class="takeaway-label">一句話</span>${renderSectionLines(oneLine.lines)}</section>` : ''}
    ${tagSection ? renderTags(tagSection) : ''}
    <div class="note-card-grid">
      ${cardSections.map((section) => `
        <section class="note-card">
          <div class="note-card-head">
            <span class="note-icon">${sectionIcon(section.heading)}</span>
            <h2>${inlineMarkdown(section.heading)}</h2>
          </div>
          <div class="note-card-body">${renderSectionLines(section.lines)}</div>
        </section>
      `).join('')}
    </div>
  `;
}

function getTaipeiNow() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    weekday: values.weekday,
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second)
  };
}

function minutesSinceMidnight(time) {
  return (time.hour * 60) + time.minute + (time.second / 60);
}

function weekdayIndex(time = getTaipeiNow()) {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(time.weekday);
}

function isWeekdayTaipei(time = getTaipeiNow()) {
  const day = weekdayIndex(time);
  return day >= 1 && day <= 5;
}

function isTaiwanMarketRefreshTime(time = getTaipeiNow()) {
  const minutes = minutesSinceMidnight(time);
  return isWeekdayTaipei(time) && minutes >= (8 * 60 + 45) && minutes <= (13 * 60 + 45);
}

function isTaiwanNightMarketRefreshTime(time = getTaipeiNow()) {
  const day = weekdayIndex(time);
  const minutes = minutesSinceMidnight(time);
  const eveningSession = day >= 1 && day <= 5 && minutes >= (14 * 60 + 45);
  const overnightSession = day >= 2 && day <= 6 && minutes <= (5 * 60 + 15);
  return eveningSession || overnightSession;
}

function isUsMarketRefreshTime(time = getTaipeiNow()) {
  const day = weekdayIndex(time);
  const minutes = minutesSinceMidnight(time);
  const eveningSession = day >= 1 && day <= 5 && minutes >= (21 * 60 + 15);
  const overnightSession = day >= 2 && day <= 6 && minutes <= (3 * 60 + 45);
  return eveningSession || overnightSession;
}

function isFundRefreshTime(time = getTaipeiNow()) {
  const minutes = minutesSinceMidnight(time);
  return isWeekdayTaipei(time) && minutes >= (17 * 60 + 50) && minutes <= (18 * 60 + 30);
}

function refreshMarketsBySchedule() {
  if (isTaiwanMarketRefreshTime()) {
    loadTaiwanMarketInfo();
  }

  if (isTaiwanNightMarketRefreshTime()) {
    loadTaiwanNightMarketInfo();
  }

  if (isUsMarketRefreshTime()) {
    loadUsMarketInfo();
  }
}
async function loadTaiwanMarketInfo() {
  try {
    const response = await fetch(`/api/taiwan-market?_=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    const quote = payload.quote;
    if (!quote || typeof quote.price !== 'number') {
      throw new Error('missing taiwan market quote');
    }

    marketIndex.textContent = formatMarketNumber(quote.price);
    setChangeText(marketChange, quote.change || 0, quote.percent || 0, ' 較昨收');
    marketTime.textContent = quote.time || '--';
    marketHigh.textContent = typeof quote.high === 'number' ? formatMarketNumber(quote.high) : '--';
    marketLow.textContent = typeof quote.low === 'number' ? formatMarketNumber(quote.low) : '--';
    marketDate.textContent = quote.date || '--';
    marketNote.textContent = '來源：臺灣證券交易所 MIS 即時行情。頁面載入先抓一次，台股平日 08:45-13:45 每 5 秒更新。';
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

async function loadTaiwanNightMarketInfo() {
  try {
    const response = await fetch(`/api/tw-night-market?_=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    const quote = payload.quote;
    if (!quote || typeof quote.price !== 'number') {
      throw new Error('missing night market quote');
    }

    nightMarketName.textContent = '台指期近一';
    nightMarketIndex.textContent = formatMarketNumber(quote.price);
    setChangeText(nightMarketChange, quote.change || 0, quote.percent || 0);
    nightMarketVolume.textContent = typeof quote.volume === 'number'
      ? new Intl.NumberFormat('zh-TW').format(quote.volume)
      : '--';
    nightMarketTime.textContent = quote.time || '--';
    nightMarketNote.textContent = '來源：Yahoo 股市。頁面載入先抓一次，台股夜盤平日 14:45-隔日 05:15 每 5 秒更新。';
  } catch (error) {
    nightMarketIndex.textContent = '暫時無法取得';
    nightMarketChange.textContent = '--';
    nightMarketChange.dataset.direction = 'flat';
    nightMarketVolume.textContent = '--';
    nightMarketTime.textContent = '--';
    nightMarketNote.textContent = '台股夜盤資料讀取失敗，請稍後重新整理。';
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
      ? '來源：Yahoo Finance。頁面載入先抓一次，美股平日 21:15-隔日 03:45 每 5 秒更新；實際更新頻率依資料來源而定。'
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

function setPercentText(element, percent) {
  const direction = percent > 0 ? 'up' : percent < 0 ? 'down' : 'flat';
  const sign = percent > 0 ? '+' : '';
  element.textContent = `${sign}${percent.toFixed(2)}%`;
  element.dataset.direction = direction;
}

async function loadMengFunds() {
  try {
    const response = await fetch(`/api/meng-funds?_=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    const funds = Array.isArray(payload.funds) ? payload.funds : [];
    const seen = new Set();

    funds.forEach((fund) => {
      const card = fundCards[fund.code];
      if (!card) {
        return;
      }
      card.nav.textContent = formatMarketNumber(fund.nav);
      setPercentText(card.change, fund.changePercent);
      card.date.textContent = `最新淨值日期 ${fund.date || '--'}`;
      seen.add(fund.code);
    });

    Object.entries(fundCards).forEach(([code, card]) => {
      if (seen.has(code)) {
        return;
      }
      card.nav.textContent = '暫時無法取得';
      card.change.textContent = '--';
      card.change.dataset.direction = 'flat';
      card.date.textContent = '最新淨值日期 --';
    });

    fundNote.textContent = seen.size > 0
      ? '來源：玉山銀行基金資訊。進入專區先抓一次，平日 17:50-18:30 每 5 秒更新。'
      : '基金資料目前無法讀取，請稍後重新整理。';
  } catch (error) {
    Object.values(fundCards).forEach((card) => {
      card.nav.textContent = '暫時無法取得';
      card.change.textContent = '--';
      card.change.dataset.direction = 'flat';
      card.date.textContent = '最新淨值日期 --';
    });
    fundNote.textContent = '基金資料目前無法讀取，請稍後重新整理。';
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
  mengZone.hidden = true;
  xiaobaiZone.hidden = true;
  document.body.classList.remove('is-meng-zone');
  siteEyebrow.textContent = 'Max Test Area';
  siteTitle.textContent = 'Max測試專區';
  headerHomeButton.hidden = true;
  history.replaceState(null, '', location.pathname);
}

function showHaoZone() {
  homePanel.hidden = true;
  haoZone.hidden = false;
  mengZone.hidden = true;
  xiaobaiZone.hidden = true;
  document.body.classList.remove('is-meng-zone');
  siteEyebrow.textContent = 'Hao Notes';
  siteTitle.textContent = '皓哥開示摘要圖';
  headerHomeButton.hidden = false;
  showNotePlaceholder();
  history.replaceState(null, '', '#hao');
}

function showMengZone() {
  homePanel.hidden = true;
  haoZone.hidden = true;
  mengZone.hidden = false;
  xiaobaiZone.hidden = true;
  document.body.classList.add('is-meng-zone');
  siteEyebrow.textContent = 'Meng Jie Collection';
  siteTitle.textContent = '孟潔的壓箱寶';
  headerHomeButton.hidden = false;
  history.replaceState(null, '', '#mengjie');
  loadMengFunds();
}


function showXiaobaiZone() {
  homePanel.hidden = true;
  haoZone.hidden = true;
  mengZone.hidden = true;
  xiaobaiZone.hidden = false;
  document.body.classList.remove('is-meng-zone');
  siteEyebrow.textContent = 'Xiao Bai Gallery';
  siteTitle.textContent = '小白金毛專區';
  headerHomeButton.hidden = false;
  history.replaceState(null, '', '#xiaobai');
}
function refreshFundsBySchedule() {
  if (!mengZone.hidden && isFundRefreshTime()) {
    loadMengFunds();
  }
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
  mengZone.hidden = true;
  xiaobaiZone.hidden = true;
  document.body.classList.remove('is-meng-zone');
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
  } else if (hashDate === 'mengjie') {
    showMengZone();
  } else if (hashDate === 'xiaobai') {
    showXiaobaiZone();
  } else {
    showHome();
  }
}

haoZoneButton.addEventListener('click', showHaoZone);
mengZoneButton.addEventListener('click', showMengZone);
xiaobaiZoneButton.addEventListener('click', showXiaobaiZone);
headerHomeButton.addEventListener('click', showHome);

setUpdateDate();
updateLiveTime();
setInterval(updateLiveTime, 1000);
loadTaiwanMarketInfo();
loadTaiwanNightMarketInfo();
loadUsMarketInfo();
setInterval(refreshMarketsBySchedule, 5000);
setInterval(refreshFundsBySchedule, 5000);
boot();





















