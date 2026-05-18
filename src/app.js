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

const hashDate = decodeURIComponent(location.hash.replace('#', ''));
const initial = items.find((item) => item.date === hashDate);

if (initial) {
  selectItem(initial);
} else if (hashDate === 'hao') {
  showHaoZone();
} else {
  showHome();
}
