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

const imagePath = (file) => `./public/uploads/images/${encodeURIComponent(file)}`;

function selectItem(item) {
  const src = imagePath(item.file);
  mainImage.src = src;
  mainImage.alt = item.title;
  viewerTitle.textContent = item.title;
  openImage.href = src;
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

renderGallery();
mainImage.hidden = true;

const hashDate = decodeURIComponent(location.hash.replace('#', ''));
const initial = items.find((item) => item.date === hashDate) || items[0];
selectItem(initial);
