# `css/style.css` 说明文档

## 文件功能和作用

`style.css` 是单词记忆测试应用的主要样式表，定义了应用的基础布局、颜色、字体、响应式行为以及各种 UI 元素的通用样式。它旨在提供一个干净、现代且用户友好的视觉体验，并确保应用在不同设备上都能良好显示。

## 样式结构概览

文件主要包含以下几个部分：

1.  **基础样式重置**: 对所有元素的 `margin`、`padding` 和 `box-sizing` 进行重置，确保跨浏览器一致性。
2.  **全局样式**: 定义 `body` 的字体、背景渐变、最小高度和溢出行为。
3.  **屏幕容器样式**: 定义 `.screen` 类的通用样式，用于控制不同界面的显示/隐藏和布局。
4.  **特定界面样式**: 为 `welcome-screen`、`question-count-screen`、`quiz-screen`、`feedback-screen`、`results-screen`、`history-screen`、`mistakes-screen`、`wrong-question-hub-screen`、`all-wrong-words-screen` 和 `settings-screen` 等主要界面及其内部元素定义了详细的样式。
5.  **通用组件样式**: 定义了按钮 (`primary-btn`, `secondary-btn`, `icon-btn`, `file-label`, `clear-btn`)、开关 (`switch`)、加载提示 (`loading`) 和模态框 (`modal`) 等可复用组件的样式。
6.  **动画效果**: 定义了 `bounce`、`float`、`celebration` 和 `spin` 等关键帧动画，为 UI 元素增添动态效果。
7.  **响应式设计**: 使用 `@media` 查询为不同屏幕尺寸（特别是移动设备）调整布局和字体大小，确保良好的用户体验。
8.  **错题回顾相关样式**: 专门为错题回顾功能定义了统计信息、错题列表项、错误次数显示等样式。
9.  **设置页面样式**: 专门为设置页面定义了容器、分区、设置项和描述文本的样式。

## 关键样式和组件说明

### 1. 全局和布局

-   `body`: 设置了从紫色到蓝色的线性渐变背景 (`linear-gradient(135deg, #667eea 0%, #764ba2 100%)`)，并确保内容至少占据整个视口高度。
-   `.screen`: 作为每个独立界面的容器，默认 `display: none`，通过添加 `active` 类 (`.screen.active`) 来显示，并使用 `flex` 布局居中内容。

### 2. 按钮样式

-   `.primary-btn`: 主要操作按钮，使用橙红色到黄色的渐变背景，字体加粗，圆角，并带有阴影和悬停动画。
-   `.secondary-btn`: 次要操作按钮，半透明白色背景，白色边框，圆角，带有模糊效果和悬停动画。
-   `.icon-btn`: 图标按钮，圆形，半透明背景，用于导航或小功能，带有悬停放大效果。
-   `.file-label`: 用于文件输入框的自定义样式，模拟按钮外观。
-   `.clear-btn`: 清空按钮，红色背景，用于危险操作，带有悬停动画。

### 3. 界面元素样式

-   **Logo 和标题**: `.app-logo` (大字体图标，带有 `bounce` 动画)，`.welcome-title` (白色字体，阴影)。
-   **插图**: `.cute-animals` (大字体图标，带有 `float` 动画)，`.subtitle` (白色半透明字体)。
-   **题目数量选择**: `.question-count-options` 使用 `grid` 布局，`.count-option-btn` 带有白色背景、圆角、阴影和悬停动画，内部包含数字、标签和描述。
-   **测试界面**: 
    -   `.quiz-header`: 顶部导航栏，包含返回按钮、进度信息 (`.progress-info`) 和计时器 (`.timer`)，这些元素都有半透明背景和模糊效果。
    -   `.word-container` 和 `.word-display`: 显示单词的容器，白色背景，大字体，居中。
    -   `.options-container` 和 `.option-btn`: 选项按钮，白色背景，圆角，阴影，悬停时边框变色。还定义了 `selected`、`correct` 和 `incorrect` 状态的样式。
-   **反馈界面**: 
    -   `.feedback-message`: 显示正确/错误反馈，白色背景，大图标和文字。
    -   `.answer-details`: 显示答案详情，包括用户答案、正确答案、例句和笔记，并为正确/错误答案提供了不同的背景和边框颜色。
-   **结果界面**: 
    -   `.results-title`: 标题，白色字体，阴影。
    -   `.celebration-animals`: 庆祝动画元素，带有 `celebration` 动画。
    -   `.results-container`: 结果展示容器，白色背景，阴影。
    -   `.score-display`: 分数显示，包含 `score-item`，展示得分、用时、答对题数。
-   **历史记录/错题列表**: 
    -   `.history-list`, `.mistakes-list`, `.all-wrong-words-list`: 列表容器，设置了最大高度和滚动条。
    -   `.history-item`, `.mistake-item`, `.wrong-word-item`: 列表项，白色背景，圆角，阴影，悬停动画。
    -   `.empty-history`, `.no-mistakes`, `.empty-wrong-pool`: 空状态提示，居中显示图标和文字。
-   **错题汇总**: 
    -   `.stats-container`: 统计信息容器，半透明背景，模糊效果，展示错题总数和平均错误次数。
    -   `.wrong-word-header`: 错题项头部，包含单词文本和错误次数 (`.error-count`)。
    -   `.wrong-word-details`: 错题详情，包括答案、例句、笔记和日期，并为正确/错误答案提供了不同的颜色。
-   **设置页面**: 
    -   `.settings-container`: 设置容器，半透明背景，模糊效果。
    -   `.settings-section`: 设置分区，包含标题和设置项。
    -   `.setting-item`: 单个设置项，半透明背景，圆角，悬停动画，包含标签和描述。

### 4. 动画

-   `@keyframes bounce`: 元素上下跳动。
-   `@keyframes float`: 元素上下浮动。
-   `@keyframes celebration`: 元素放大缩小，用于庆祝效果。
-   `@keyframes spin`: 元素旋转，用于加载动画。

### 5. 响应式设计

-   通过 `@media (max-width: 768px)` 和 `@media (max-width: 480px)` 媒体查询，调整了字体大小、内边距、按钮宽度、布局方向等，以适应平板和手机等较小屏幕设备，确保在不同尺寸设备上都能提供良好的视觉和交互体验。

## 总结

`style.css` 文件通过清晰的结构和丰富的样式定义，为单词记忆测试应用提供了美观且响应式的用户界面。它将视觉表现层与 HTML 结构和 JavaScript 逻辑分离，使得样式管理更加高效和可维护。