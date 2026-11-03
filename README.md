# 伴读书房

章节导读的手机网页 App，可以添加到主屏幕、离线打开。

- `data/books.json`：书架（每本书的简介、目录、已有导读的章节）。`tags` 是书架上的主题分类（每本书的 `tags` 取其中一个），`lang` 是 `zh` / `en`，用于筛选
- `data/chapters/<bookId>.json`：每本书的章节导读
- 章节定位：`epubHref` 是原文所在文件；一个文件里有好几章时，再加 `epubStart` / `epubEnd`（本章和下一章开头的一小段文字），读原文时只截出这一章
- 英文版：`data/en/books.json` 放标签和作者的英文名、各书的英文简介，以及已翻译的章节列表（`guided`）；`data/en/chapters/<bookId>.json` 放章节导读的英文版，字段和中文版一样，只含 `key` 和要替换的内容。没翻译的章节在英文界面下显示中文并加提示。书架右上角切换中英文，选择存在手机本地
- 已读、收藏、笔记保存在手机本地（localStorage + IndexedDB），书架页底部可以备份 / 恢复
- epub 原书只在手机上打开和保存，不会上传，也不放在这个仓库里

新的导读由 Claude 生成后提交到 `data/`，手机联网打开时会自动拿到最新内容。
改了 `index.html` / `app.js` 之后，把 `sw.js` 里的 `VERSION` 加一，手机才会更新界面。
