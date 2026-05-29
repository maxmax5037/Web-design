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
  }
].map((item) => ({
  date: item.date,
  episode: item.episode,
  title: item.title,
  markdown: fs.readFileSync(path.join(root, 'content', 'stock-cancer', item.markdownFile), 'utf8'),
  ppt: item.ppt
}));

fs.writeFileSync(
  path.join(root, 'public', 'data', 'stock-cancer-notes.json'),
  JSON.stringify(items, null, 2),
  'utf8'
);
console.log('stock cancer items', items.length);
