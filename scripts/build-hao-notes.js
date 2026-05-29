const fs = require('fs');
const path = require('path');

const root = 'D:/Codex/Web design';
const reportsDir = path.join(root, 'content', 'reports');
const imagesDir = path.join(root, 'public', 'uploads', 'images');
const outputPath = path.join(root, 'public', 'data', 'hao-notes.json');
const maxVisibleDays = 5;

const dates = fs.readdirSync(reportsDir)
  .map((fileName) => {
    const match = fileName.match(/^(\d{4}-\d{2}-\d{2})_皓哥開示摘要\.md$/);
    return match?.[1] || null;
  })
  .filter(Boolean)
  .filter((date) => fs.existsSync(path.join(imagesDir, `${date}_皓哥開示摘要圖.png`)))
  .sort()
  .slice(-maxVisibleDays);

const items = dates.map((date) => {
  const markdown = fs.readFileSync(path.join(reportsDir, `${date}_皓哥開示摘要.md`), 'utf8');
  return {
    date,
    title: `${date} 皓哥開示摘要`,
    markdown,
    image: `${date}_皓哥開示摘要圖.png`
  };
});

fs.writeFileSync(outputPath, JSON.stringify(items, null, 2), 'utf8');
console.log('items', items.length, dates.join(', '));
