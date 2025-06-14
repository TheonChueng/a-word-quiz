# `index.html` 说明文档

## 文件功能与作用

`index.html` 是单词记忆测试应用的主页面文件，它构建了整个应用的用户界面结构。该文件通过引入外部CSS文件（`style.css` 和 `cute-theme.css`）来定义应用的视觉样式，并通过引入多个JavaScript文件（`localforage.min.js`, `sql-wasm.js`, `storage.js`, `vocabulary.js`, `quiz.js`, `ui.js`, `app.js`）来实现应用的交互逻辑和数据管理功能。

该页面包含了多个“屏幕”（`div` 元素，通过 `id` 区分），每个屏幕代表应用的不同视图或功能模块，例如欢迎界面、设置界面、测试界面、结果界面等。通过JavaScript动态控制这些屏幕的显示与隐藏，实现了单页应用（SPA）的用户体验。

## 页面结构概览

`index.html` 的主要结构可以分为以下几个部分：

1.  **文档头部 (`<head>`)**：
    *   设置字符编码、视口配置和页面标题。
    *   引入了两个CSS文件：`css/style.css`（基础样式）和 `css/cute-theme.css`（可爱主题样式）。

2.  **音频元素 (`<audio>`)**：
    *   定义了多个音频元素，用于背景音乐和各种音效（悬停、点击、正确、错误、完成），通过JavaScript控制播放。

3.  **应用屏幕 (`<div class="screen">`)**：
    *   **欢迎界面 (`#welcome-screen`)**：应用的入口，包含应用Logo、欢迎标题、插图、副标题和多个功能按钮（开始测试、查看历史、错题回顾、设置）。
    *   **设置界面 (`#settings-screen`)**：允许用户配置背景音乐、音效、导入/导出词汇文件和数据库。
    *   **题目数量选择界面 (`#question-count-screen`)**：用户选择每次测试的题目数量。
    *   **测试界面 (`#quiz-screen`)**：显示当前单词、选项、进度和计时器，用户在此进行答题。
    *   **答案反馈界面 (`#feedback-screen`)**：显示用户答案的对错、正确答案、例句和笔记。
    *   **测试结果界面 (`#results-screen`)**：显示测试得分、用时、答对题数，并提供查看错题、再来一轮和返回首页的选项。
    *   **历史记录界面 (`#history-screen`)**：显示所有历史测试记录。
    *   **错题回顾界面 (`#mistakes-screen`)**：显示当前测试中的错题列表。
    *   **错题功能选择界面 (`#wrong-question-hub-screen`)**：提供查看错题汇总和开始错题测试的选项。
    *   **查看所有历史错词汇总表界面 (`#all-wrong-words-screen`)**：显示所有历史错词的详细列表和统计信息。

4.  **模态框和加载提示 (`<div>`)**：
    *   **加载提示 (`#loading`)**：在加载词汇等操作时显示。
    *   **错误提示 (`#error-modal`)**：显示错误信息，例如文件格式不正确。

5.  **JavaScript引用 (`<script>`)**：
    *   引入了第三方库：`lib/localforage.min.js`（用于本地存储）和 `lib/sql-wasm.js`（用于SQLite数据库操作）。
    *   引入了应用的核心JavaScript文件：`js/storage.js`（数据存储逻辑）、`js/vocabulary.js`（词汇管理）、`js/quiz.js`（测试逻辑）、`js/ui.js`（用户界面交互）和 `js/app.js`（应用主逻辑）。

## 关键元素和功能点

*   **屏幕管理**：通过为每个主要视图定义一个 `div` 元素并赋予 `screen` 类和唯一 `id`，结合JavaScript动态添加/移除 `active` 类来控制屏幕的显示与隐藏，实现流畅的界面切换。
*   **按钮交互**：页面中定义了多种类型的按钮（`primary-btn`, `secondary-btn`, `icon-btn`, `count-option-btn`），它们通过JavaScript事件监听器触发不同的应用功能。
*   **音频反馈**：通过预加载的 `<audio>` 元素，应用能够在用户交互（如点击、悬停）和测试结果（正确、错误、完成）时提供即时音效反馈，增强用户体验。
*   **数据导入/导出**：设置界面提供了导入CSV词汇文件和导入/导出SQLite数据库的功能，方便用户管理自己的学习数据和词汇库。
*   **响应式设计**：虽然HTML本身不直接处理响应式，但它通过引入的CSS文件（特别是 `style.css` 和 `cute-theme.css` 中的 `@media` 查询）支持在不同设备上的良好显示。
*   **动态内容**：历史记录、错题列表、测试进度和结果等内容都是通过JavaScript动态生成和更新的，使得页面内容能够根据用户操作和测试状态实时变化。

`index.html` 作为应用的骨架，将所有视觉和功能模块整合在一起，并通过JavaScript赋予其生命力，为用户提供一个完整的单词记忆测试体验。