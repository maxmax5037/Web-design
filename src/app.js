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
    marketNote.textContent = '來源：臺灣證券交易所每 5 秒指數統計。頁面約每 60 秒更新一次。';
  } catch (error) {
    marketIndex.textContent = '暫時無法取得';
    marketChange.textContent = '--';
    marketChange.dataset.direction = 'flat';
    marketTime.textContent = '--';
    marketHigh.textContent = '--';
    marketLow.textContent = '--';
    marketDate.textContent = '--';
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

