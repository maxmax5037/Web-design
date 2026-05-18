# 上傳資料放置規則

## 對外可直接讀取或下載的檔案

放在 `public/uploads` 底下：

- `public/uploads/images`: 圖片、截圖、照片
- `public/uploads/pdf`: PDF 文件
- `public/uploads/excel`: Excel、CSV
- `public/uploads/files`: 其他附件

## 網站用來產生頁面的資料

- `public/data`: JSON、CSV 等網站可直接讀取的資料
- `content/posts`: 文章內容，建議使用 Markdown
- `content/reports`: 報告、公告、紀錄類內容，建議使用 Markdown

## 簡單規則

- 想讓別人下載或直接看到的檔案，放 `public/uploads`。
- 想讓網站整理成文章、列表或報告頁面的內容，放 `content` 或 `public/data`。
