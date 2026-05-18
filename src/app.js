const items = [
  {
    title: '2026-05-14 皓哥開示摘要圖',
    file: '2026-05-14_皓哥開示摘要圖.png',
    date: '2026-05-14'
  },
  {
    title: '2026-05-15 皓哥開示摘要圖',
    file: '2026-05-15_皓哥開示摘要圖.png',
    date: '2026-05-15'
  },
  {
    title: '2026-05-18 皓哥開示摘要圖',
    file: '2026-05-18_皓哥開示摘要圖.png',
    date: '2026-05-18'
  }
];

const homePanel = document.querySelector('#homePanel');
const haoZone = document.querySelector('#haoZone');
const haoZoneButton = document.querySelector('#haoZoneButton');
const gallery = document.querySelector('#gallery');
const mainImage = document.querySelector('#mainImage');
const viewerTitle = document.querySelector('#viewerTitle');
const openImage = document.querySelector('#openImage');
const emptyState = document.querySelector('#emptyState');
const updateDate = document.querySelector('#updateDate');
const liveTime = document.querySelector('#liveTime');
const homeButton = document.querySelector('#homeButton');
const marketIndex = document.querySelector('#marketIndex');
const marketChange = document.querySelector('#marketChange');
const marketTime = document.querySelector('#marketTime');
const marketHigh = document.querySelector('#marketHigh');
const marketLow = document.querySelector('#marketLow');
const marketDate = document.querySelector('#marketDate');
const marketNote = document.querySelector('#marketNote');
const marketKChart = document.querySelector('#marketKChart');
const chartRange = document.querySelector('#chartRange');

const imagePath = (file) => `./public/uploads/images/${encodeURIComponent(file)}`;
const coverImage = './public/uploads/images/cover.svg';

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
  updateDate.textContent = `目前更新到 ${formatToday()}`;
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


function createCandles(rows) {
  const buckets = new Map();

  rows.forEach((row) => {
    const [time, rawIndex] = row;
    const price = parseMarketNumber(rawIndex);
    if (!Number.isFinite(price) || !time) {
      return;
    }

    const [hour, minute] = time.split(':').map(Number);
    const bucketMinute = Math.floor(minute / 5) * 5;
    const key = `${String(hour).padStart(2, '0')}:${String(bucketMinute).padStart(2, '0')}`;

    if (!buckets.has(key)) {
      buckets.set(key, {
        time: key,
        open: price,
        high: price,
        low: price,
        close: price
      });
      return;
    }

    const candle = buckets.get(key);
    candle.high = Math.max(candle.high, price);
    candle.low = Math.min(candle.low, price);
    candle.close = price;
  });

  return Array.from(buckets.values());
}

function renderKChart(candles) {
  marketKChart.innerHTML = '';

  if (!candles.length) {
    chartRange.textContent = '--';
    return;
  }

  const width = 720;
  const height = 260;
  const pad = { top: 20, right: 54, bottom: 30, left: 14 };
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;
  const lows = candles.map((candle) => candle.low);
  const highs = candles.map((candle) => candle.high);
  const min = Math.min(...lows);
  const max = Math.max(...highs);
  const range = max - min || 1;
  const step = plotWidth / candles.length;
  const bodyWidth = Math.max(3, Math.min(9, step * 0.55));
  const ns = 'http://www.w3.org/2000/svg';

  function y(value) {
    return pad.top + ((max - value) / range) * plotHeight;
  }

  function add(tag, attrs) {
    const element = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
    marketKChart.appendChild(element);
    return element;
  }

  [min, (min + max) / 2, max].forEach((value) => {
    const yy = y(value);
    add('line', {
      x1: pad.left,
      y1: yy,
      x2: width - pad.right,
      y2: yy,
      class: 'chart-grid-line'
    });
    add('text', {
      x: width - pad.right + 8,
      y: yy + 4,
      class: 'chart-axis-label'
    }).textContent = formatMarketNumber(value);
  });

  candles.forEach((candle, index) => {
    const x = pad.left + index * step + step / 2;
    const up = candle.close >= candle.open;
    const colorClass = up ? 'candle-up' : 'candle-down';
    const highY = y(candle.high);
    const lowY = y(candle.low);
    const openY = y(candle.open);
    const closeY = y(candle.close);
    const bodyTop = Math.min(openY, closeY);
    const bodyHeight = Math.max(2, Math.abs(closeY - openY));

    add('line', {
      x1: x,
      y1: highY,
      x2: x,
      y2: lowY,
      class: `candle-wick ${colorClass}`
    });
    add('rect', {
      x: x - bodyWidth / 2,
      y: bodyTop,
      width: bodyWidth,
      height: bodyHeight,
      rx: 1,
      class: `candle-body ${colorClass}`
    });
  });

  const first = candles[0].time;
  const last = candles[candles.length - 1].time;
  chartRange.textContent = `${first} - ${last}`;
}
async function loadMarketInfo() {
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
    const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
    const sign = change > 0 ? '+' : '';

    marketIndex.textContent = formatMarketNumber(latestIndex);
    marketChange.textContent = `${sign}${formatMarketNumber(change)} (${sign}${percent.toFixed(2)}%) 較09:00`;
    marketChange.dataset.direction = direction;
    marketTime.textContent = latest[0];
    marketHigh.textContent = formatMarketNumber(high);
    marketLow.textContent = formatMarketNumber(low);
    marketDate.textContent = formatMarketDate(payload.date);
    renderKChart(createCandles(rows));
    marketNote.textContent = '來源：臺灣證券交易所每 5 秒指數統計。頁面約每 60 秒更新一次。';
  } catch (error) {
    marketIndex.textContent = '暫時無法取得';
    marketChange.textContent = '--';
    marketChange.dataset.direction = 'flat';
    marketTime.textContent = '--';
    marketHigh.textContent = '--';
    marketLow.textContent = '--';
    marketDate.textContent = '--';
    marketKChart.innerHTML = '';
    chartRange.textContent = '--';
    marketNote.textContent = '大盤資料讀取失敗，請稍後重新整理。';
  }
}
function showHome() {
  homePanel.hidden = false;
  haoZone.hidden = true;
  history.replaceState(null, '', location.pathname);
}

function showHaoZone() {
  homePanel.hidden = true;
  haoZone.hidden = false;
  showCover();
  history.replaceState(null, '', '#hao');
}

function showCover() {
  mainImage.src = coverImage;
  mainImage.alt = '皓哥專區封面';
  viewerTitle.textContent = '皓哥開示摘要圖';
  openImage.href = coverImage;
  openImage.textContent = '開啟封面';
  emptyState.hidden = true;
  mainImage.hidden = false;

  document.querySelectorAll('.gallery-card').forEach((card) => {
    card.classList.remove('is-active');
  });
}

function selectItem(item) {
  homePanel.hidden = true;
  haoZone.hidden = false;

  const src = imagePath(item.file);
  mainImage.src = src;
  mainImage.alt = item.title;
  viewerTitle.textContent = item.title;
  openImage.href = src;
  openImage.textContent = '開啟原圖';
  emptyState.hidden = true;
  mainImage.hidden = false;

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
      <span class="title">${item.title.replace(item.date, '').trim()}</span>
      <span class="hint">查看圖片</span>
    `;
    button.addEventListener('click', () => selectItem(item));
    gallery.appendChild(button);
  });
}

haoZoneButton.addEventListener('click', showHaoZone);
homeButton.addEventListener('click', showHome);

setUpdateDate();
updateLiveTime();
setInterval(updateLiveTime, 1000);
renderGallery();
loadMarketInfo();
setInterval(loadMarketInfo, 60000);

const hashDate = decodeURIComponent(location.hash.replace('#', ''));
const initial = items.find((item) => item.date === hashDate);

if (initial) {
  selectItem(initial);
} else if (hashDate === 'hao') {
  showHaoZone();
} else {
  showHome();
}


