const fs = require('fs');
const path = require('path');

const root = 'D:/Codex/Web design';
const items = [
  {
    date: '2026-05-27',
    episode: 'EP665',
    title: '2026-05-27 股癌 EP665 上課講義',
    markdownFile: '2026-05-27_股癌_EP665_上課講義.md',
    ppt: '2026-05-27_股癌_EP665_自我整理筆記_無頁尾版.pptx'
  },
  {
    date: '2026-05-27-2',
    episode: 'EP665',
    title: '2026-05-27-2 股癌 EP665 敘述詳細版',
    slides: Array.from({ length: 17 }, (_, index) => `slides/2026-05-27-2/投影片${index + 1}.PNG`)
  },
  {
    date: '2026-05-30',
    episode: 'EP666',
    title: '2026-05-30 股癌 EP666 自我整理筆記',
    markdownFile: '2026-05-30_股癌_EP666_自我整理筆記.md',
    ppt: '2026-05-30_股癌_EP666_自我整理筆記.pptx'
  },
  {
    date: '2026-05-30-2',
    episode: 'EP666',
    title: '2026-05-30-2 股癌 EP666 投影片版',
    slides: Array.from({ length: 17 }, (_, index) => `slides/2026-05-30-2/投影片${index + 1}.PNG`)
  }
].map((item) => ({
  date: item.date,
  episode: item.episode,
  title: item.title,
  markdown: item.markdownFile
    ? fs.readFileSync(path.join(root, 'content', 'stock-cancer', item.markdownFile), 'utf8')
    : null,
  ppt: item.ppt || null,
  slides: item.slides || null
}));

fs.writeFileSync(
  path.join(root, 'public', 'data', 'stock-cancer-notes.json'),
  JSON.stringify(items, null, 2),
  'utf8'
);
console.log('stock cancer items', items.length);
