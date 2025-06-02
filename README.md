
**项目名称：单词记忆测试**

**项目概述：**
“单词记忆测试”是一款基于Web的互动式单词学习与记忆辅助工具。它旨在通过自定义词汇列表、多种测试模式和直观的用户界面，帮助用户高效地学习和巩固新单词。该应用支持从CSV文件导入词汇，并提供记忆曲线优化功能，以提升学习效果。

**主要功能：**
1.  **自定义词汇导入：** 用户可以上传CSV格式的词汇文件，轻松导入自己的生词列表。
2.  **多种测试模式：** 提供选择题、填空题、听写等多种测试形式，满足不同学习需求。
3.  **学习进度跟踪：** 记录用户的学习历史和测试成绩，可视化学习进度。
4.  **记忆曲线优化：** 结合记忆曲线原理，智能安排单词复习，提高记忆效率。
5.  **用户友好界面：** 简洁直观的UI设计，提供流畅的用户体验。
6.  **音频支持：** 可为单词和例句添加音频，辅助发音学习。

**技术栈：**
*   **前端：** HTML5, CSS3 (包含 `cute-theme.css` 和 `style.css` 用于美化), JavaScript
*   **数据存储：** LocalForage (用于浏览器端离线存储), SQLite (通过 `sql-wasm.js` 在WebAssembly中运行)
*   **核心逻辑：** `app.js`, `quiz.js`, `vocabulary.js`, `storage.js`, `ui.js`

**项目结构与模块划分：**
```
. 
├── Vocabulary_List.csv             # 示例词汇文件
├── audio/                          # 音频资源（背景音乐、音效等）
│   ├── BGM.mp3
│   ├── click.mp3
│   ├── complete.mp3
│   ├── correct.mp3
│   ├── hover.mp3
│   └── incorrect.mp3
├── css/                            # 样式文件
│   ├── cute-theme.css              # 可爱主题样式
│   ├── cute-theme.css.md           # cute-theme.css 说明文档
│   ├── style.css                   # 主要样式
│   └── style.css.md                # style.css 说明文档
├── index.html                      # 应用主页面
├── index.html.md                   # index.html 说明文档
├── js/                             # JavaScript 逻辑文件
│   ├── app.js                      # 应用主逻辑
│   ├── app.js.md                   # app.js 说明文档
│   ├── quiz.js                     # 测试逻辑
│   ├── quiz.js.md                  # quiz.js 说明文档
│   ├── storage.js                  # 数据存储管理
│   ├── storage.js.md               # storage.js 说明文档
│   ├── ui.js                       # 用户界面交互逻辑
│   ├── ui.js.md                    # ui.js 说明文档
│   ├── vocabulary.js               # 词汇处理逻辑
│   └── vocabulary.js.md            # vocabulary.js 说明文档
├── lib/                            # 第三方库
│   ├── localforage.min.js          # 离线存储库
│   ├── localforage.min.js.md       # localforage.min.js 说明文档
│   ├── sql-wasm.js                 # SQLite WebAssembly 模块
│   └── sql-wasm.js.md              # sql-wasm.js 说明文档
├── sql-wasm.wasm                   # SQLite WebAssembly 二进制文件
├── wordquiz_database.sqlite        # 默认SQLite数据库文件
├── 单词记忆测试UI原型设计.md       # UI原型设计文档
├── 单词记忆测试技术方案.md         # 技术方案文档
├── 单词记忆测试需求文档.md         # 需求文档
└── 小学四年级英语高频词汇.csv      # 示例词汇文件
```

**安装与运行：**
1.  **克隆仓库：**
    ```bash
    git clone <仓库地址>
    cd 单词记忆测试
    ```
2.  **本地运行：**
    由于是纯前端应用，您可以通过任何支持HTTP服务的工具在本地运行。例如，使用Python的简单HTTP服务器：
    ```bash
    python -m http.server 8000
    ```
    然后，在浏览器中打开 `http://localhost:8000` 即可访问应用。

**数据管理（CSV词汇文件规范）：**
应用支持导入CSV格式的词汇文件。请遵循以下规范以确保文件能被正确解析：

*   **文件格式：** 纯文本CSV文件。
*   **编码：** 推荐使用UTF-8编码，以避免中文乱码问题。
*   **列要求：**
    *   **必需列：** `生词` (或 `Word`)，`翻译` (或 `Translation`)
    *   **可选列：** `例句` (或 `Sentence`)，`笔记` (或 `Notes`)
    *   列名不区分大小写，但建议保持一致性。
*   **数据行：**
    *   第一行必须是标题行，包含列名。
    *   至少需要包含一个有效的数据行。
*   **字段分隔符：** 逗号 (`,`)。
*   **文本限定符：** 双引号 (`"`)。如果字段内容包含逗号或换行符，请使用双引号将该字段括起来。如果字段内容本身包含双引号，则需要将该双引号重复两次进行转义（例如，`"He said "
        
