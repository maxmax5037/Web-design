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
const marketOpen = document.querySelector('#marketOpen');
const marketPrevClose = document.querySelector('#marketPrevClose');
const marketHigh52 = document.querySelector('#marketHigh52');
const marketLow52 = document.querySelector('#marketLow52');
const marketDate = document.querySelector('#marketDate');
const marketNote = document.querySelector('#marketNote');
const marketKChart = document.querySelector('#marketKChart');

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


function createSeries(rows) {
  return rows
    .map((row) => ({
      time: row[0],
      value: parseMarketNumber(row[1])
    }))
    .filter((point) => point.time && Number.isFinite(point.value));
}

function renderMarketChart(series, previousClose) {
  marketKChart.innerHTML = '';

  if (!series.length) {
    return;
  }

  const width = 760;
  const height = 250;
  const pad = { top: 16, right: 82, bottom: 30, left: 12 };
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;
  const values = series.map((point) => point.value);
  const min = Math.min(...values, previousClose || values[0]);
  const max = Math.max(...values, previousClose || values[0]);
  const range = max - min || 1;
  const ns = 'http://www.w3.org/2000/svg';

  function x(index) {
    return pad.left + (index / Math.max(1, series.length - 1)) * plotWidth;
  }

  function y(value) {
    return pad.top + ((max - value) / range) * plotHeight;
  }

  function add(tag, attrs, parent = marketKChart) {
    const element = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
    parent.appendChild(element);
    return element;
  }

  const gradient = add('defs', {});
  const fillGradient = add('linearGradient', {
    id: 'marketAreaGradient',
    x1: '0',
    y1: '0',
    x2: '0',
    y2: '1'
  }, gradient);
  add('stop', { offset: '0%', 'stop-color': '#22c55e', 'stop-opacity': '0.24' }, fillGradient);
  add('stop', { offset: '100%', 'stop-color': '#22c55e', 'stop-opacity': '0.02' }, fillGradient);

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
      x: pad.left,
      y: yy - 5,
      class: 'chart-axis-label-left'
    }).textContent = formatMarketNumber(value);
  });

  if (previousClose) {
    const yy = y(previousClose);
    add('line', {
      x1: pad.left,
      y1: yy,
      x2: width - pad.right,
      y2: yy,
      class: 'prev-close-line'
    });
    add('text', {
      x: width - pad.right + 10,
      y: yy - 4,
      class: 'prev-close-label'
    }).textContent = `上次`;
    add('text', {
      x: width - pad.right + 10,
      y: yy + 14,
      class: 'prev-close-label'
    }).textContent = `收盤價`;
    add('text', {
      x: width - pad.right + 10,
      y: yy + 32,
      class: 'prev-close-value'
    }).textContent = formatMarketNumber(previousClose);
  }

  const linePoints = series.map((point, index) => `${x(index)},${y(point.value)}`).join(' ');
  const areaPoints = `${pad.left},${height - pad.bottom} ${linePoints} ${width - pad.right},${height - pad.bottom}`;

  add('polygon', {
    points: areaPoints,
    class: 'area-fill'
  });
  add('polyline', {
    points: linePoints,
    class: 'market-line'
  });

  const lastPoint = series[series.length - 1];
  add('circle', {
    cx: x(series.length - 1),
    cy: y(lastPoint.value),
    r: 4,
    class: 'market-dot'
  });

  const labelIndexes = [0, Math.floor(series.length * 0.28), Math.floor(series.length * 0.55), Math.floor(series.length * 0.82)];
  labelIndexes.forEach((index) => {
    const point = series[index];
    if (!point) {
      return;
    }
    add('text', {
      x: x(index),
      y: height - 8,
      class: 'time-label'
    }).textContent = point.time.slice(0, 5);
  });
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
    const previousClose = firstIndex;
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
    marketTime.textContent = `${latest[0]} 更新`;
    marketOpen.textContent = formatMarketNumber(firstIndex);
    marketHigh.textContent = formatMarketNumber(high);
    marketLow.textContent = formatMarketNumber(low);
    marketPrevClose.textContent = formatMarketNumber(previousClose);
    marketHigh52.textContent = '暫無';
    marketLow52.textContent = '暫無';
    marketDate.textContent = formatMarketDate(payload.date);
    renderMarketChart(createSeries(rows), previousClose);
    marketNote.textContent = '來源：臺灣證券交易所每 5 秒指數統計。頁面約每 60 秒更新一次。';
  } catch (error) {
    marketIndex.textContent = '暫時無法取得';
    marketChange.textContent = '--';
    marketChange.dataset.direction = 'flat';
    marketTime.textContent = '--';
    marketHigh.textContent = '--';
    marketLow.textContent = '--';
    marketOpen.textContent = '--';
    marketPrevClose.textContent = '--';
    marketHigh52.textContent = '--';
    marketLow52.textContent = '--';
    marketDate.textContent = '--';
    marketKChart.innerHTML = '';
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




