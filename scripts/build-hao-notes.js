const fs = require('fs');
const path = require('path');
const root = 'D:/Codex/Web design';
const dates = ['2026-05-14', '2026-05-15', '2026-05-18'];
const items = dates.map((date) => {
  const markdown = fs.readFileSync(path.join(root, 'content', 'reports', `${date}_皓哥開示摘要.md`), 'utf8');
  return {
    date,
    title: `${date} 皓哥開示摘要`,
    markdown,
    image: `${date}_皓哥開示摘要圖.png`
  };
});
fs.writeFileSync(path.join(root, 'public', 'data', 'hao-notes.json'), JSON.stringify(items, null, 2), 'utf8');
console.log('items', items.length);
