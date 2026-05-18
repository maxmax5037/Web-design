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

const gallery = document.querySelector('#gallery');
const mainImage = document.querySelector('#mainImage');
const viewerTitle = document.querySelector('#viewerTitle');
const openImage = document.querySelector('#openImage');
const emptyState = document.querySelector('#emptyState');
const updateDate = document.querySelector('#updateDate');

const imagePath = (file) => `./public/uploads/images/${encodeURIComponent(file)}`;
const coverImage = './public/uploads/images/cover.svg';

function formatToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function setUpdateDate() {
  updateDate.textContent = `目前更新到 ${formatToday()}`;
}

function showCover() {
  mainImage.src = coverImage;
  mainImage.alt = '摘要圖封面';
  viewerTitle.textContent = `目前更新到 ${formatToday()}`;
  openImage.href = coverImage;
  openImage.textContent = '開啟封面';
  emptyState.hidden = true;
  mainImage.hidden = false;

  document.querySelectorAll('.gallery-card').forEach((card) => {
    card.classList.remove('is-active');
  });
}

function selectItem(item) {
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

setUpdateDate();
renderGallery();

const hashDate = decodeURIComponent(location.hash.replace('#', ''));
const initial = items.find((item) => item.date === hashDate);

if (initial) {
  selectItem(initial);
} else {
  showCover();
}
