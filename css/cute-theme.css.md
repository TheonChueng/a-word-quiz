# `css/cute-theme.css` 说明文档

## 文件功能与作用

`cute-theme.css` 文件为单词记忆测试应用提供了一个“可爱主题”的视觉风格，旨在通过柔和的色彩、圆润的形状、生动的动画和有趣的图标，营造一个轻松愉快的学习氛围。它定义了主题的颜色变量、字体样式、背景动画、按钮效果、交互反馈动画以及响应式调整，使得整个应用界面更具吸引力，尤其适合低年龄用户或偏爱可爱风格的用户。

## 样式结构概览

该文件主要包含以下几个部分：

1.  **自定义颜色变量 (`:root`)**：定义了一系列主题色，如粉色、蓝色、黄色、紫色、橙色，以及成功和错误提示色，并定义了可爱的阴影和渐变效果。
2.  **可爱字体样式 (`.cute-font`)**：指定了具有手写或卡通风格的字体。
3.  **彩虹渐变背景 (`body`)**：为整个页面设置了动态的彩虹渐变背景动画。
4.  **可爱按钮样式增强 (`.primary-btn`, `.secondary-btn`)**：为主要和次要按钮添加了渐变背景、边框、阴影、悬停动画和闪光效果。
5.  **选项按钮可爱化 (`.option-btn`)**：为选择题选项按钮设计了独特的边框、悬停效果、选中、正确和错误状态的视觉反馈动画。
6.  **选项标签可爱化 (`.option-label`)：为选项前的字母标签设计了圆形、渐变背景和阴影。
7.  **单词显示区域可爱化 (`.word-container`, `.word-display`)**：为单词展示区域添加了彩虹边框动画和文字发光效果。
8.  **反馈消息可爱化 (`.feedback-message`, `.feedback-icon`)**：为答题反馈消息和图标添加了闪烁和弹跳动画。
9.  **进度条可爱化 (`.progress-info`)**：为进度信息条添加了渐变背景、阴影和“✨”闪烁装饰。
10. **计时器可爱化 (`.timer`)**：为计时器添加了渐变背景、阴影和“⏰”摇摆装饰。
11. **历史记录项可爱化 (`.history-item`)**：为历史记录列表项设计了渐变背景、左侧彩色边框和悬停效果。
12. **分数显示可爱化 (`.score-item`, `.score-value`)**：为分数显示区域添加了渐变边框和文字脉冲动画。
13. **图标按钮可爱化 (`.icon-btn`)**：为图标按钮设计了渐变背景、边框、阴影和悬停旋转放大效果。
14. **加载动画可爱化 (`.loading-spinner`)**：为加载动画设计了文字渐变和旋转缩放动画。
15. **模态框可爱化 (`.modal-content`)**：为模态框添加了边框、阴影和“✨”闪烁装饰。
16. **错题项可爱化 (`.mistake-item`)**：为错题列表项设计了背景、左侧红色边框和“📝”图标。
17. **庆祝动画增强 (`.celebration-animals`)**：为庆祝动画添加了跳舞效果。
18. **可爱的滚动条 (`::-webkit-scrollbar`)**：自定义了滚动条的样式，使其与主题风格一致。
19. **响应式可爱元素调整 (`@media`)**：针对不同屏幕尺寸调整了部分可爱元素的样式，确保在移动设备上的显示效果。

## 关键样式和组件说明

### 1. 全局和布局

*   **颜色变量**: 通过CSS变量定义了主题中使用的所有颜色，便于统一管理和修改。
    ```css
    :root {
        --primary-pink: #ff6b9d;
        --primary-blue: #4ecdc4;
        --primary-yellow: #ffe66d;
        --cute-shadow: 0 4px 20px rgba(255, 107, 157, 0.3);
    }
    ```
*   **背景**: `body` 元素使用了 `linear-gradient` 创建彩虹渐变背景，并通过 `@keyframes rainbow-bg` 实现背景位置的无限循环动画，营造活泼的氛围。
    ```css
    body {
        background: linear-gradient(45deg, 
            #ff6b9d 0%, 
            #4ecdc4 25%, 
            #ffe66d 50%, 
            #a8e6cf 75%, 
            #ffa726 100%);
        background-size: 400% 400%;
        animation: rainbow-bg 8s ease infinite;
    }
    ```

### 2. 按钮样式

*   **主要按钮 (`.primary-btn`)**: 采用渐变背景、白色边框和可爱阴影。悬停时有上浮和放大效果，并伴随一个从左到右的白色闪光动画 (`::before` 伪元素)。
    ```css
    .primary-btn {
        background: linear-gradient(45deg, var(--primary-pink), var(--primary-orange));
        border: 3px solid white;
        box-shadow: var(--cute-shadow);
        position: relative;
        overflow: hidden;
    }
    .primary-btn:hover {
        transform: translateY(-3px) scale(1.05);
        box-shadow: 0 8px 25px rgba(255, 107, 157, 0.4);
    }
    ```
*   **选项按钮 (`.option-btn`)**: 具有圆润的边角和细边框。通过 `nth-child` 为不同选项设置了不同的左侧彩色边框，增加了视觉区分度。选中、正确和错误状态分别有不同的背景渐变、边框颜色和动画效果（弹跳 `correct-bounce` 和摇晃 `incorrect-shake`）。
    ```css
    .option-btn {
        border: 3px solid #e0e0e0;
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
    .option-btn.correct {
        background: linear-gradient(135deg, #d5f4e6 0%, #a8e6cf 100%);
        border-color: var(--success-green);
        animation: correct-bounce 0.6s ease;
    }
    ```

### 3. 界面元素样式

*   **单词显示区域 (`.word-container`)**: 采用白色渐变背景，并通过伪元素 (`::before`) 创建了一个动态的彩虹渐变边框动画 (`border-rainbow`)，使单词区域更加突出和生动。
    ```css
    .word-container {
        background: linear-gradient(135deg, #fff 0%, #f8f9ff 100%);
        border: 4px solid transparent;
        background-clip: padding-box;
        position: relative;
    }
    .word-container::before {
        background: linear-gradient(45deg, var(--primary-pink), var(--primary-blue), var(--primary-yellow), var(--primary-purple));
        animation: border-rainbow 3s linear infinite;
    }
    ```
*   **反馈消息 (`.feedback-message`)**: 具有白色渐变背景和彩色边框，并通过伪元素 (`::before`) 实现了一个中心向外扩散的“闪光”动画 (`sparkle`)，增强了反馈的视觉冲击力。
    ```css
    .feedback-message {
        background: linear-gradient(135deg, #fff 0%, #f0f8ff 100%);
        border: 3px solid var(--primary-blue);
        position: relative;
        overflow: hidden;
    }
    .feedback-message::before {
        background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
        animation: sparkle 2s ease-in-out infinite;
    }
    ```

### 4. 动画

*   **`rainbow-bg`**: 控制 `body` 背景的彩虹渐变动画，实现背景色的平滑过渡。
*   **`correct-bounce`**: 用于正确答案选项，使其在被选中时产生一个轻微的弹跳效果。
*   **`incorrect-shake`**: 用于错误答案选项，使其在被选中时产生一个左右摇晃的效果。
*   **`border-rainbow`**: 控制 `word-container` 边框的色相旋转，形成流动的彩虹效果。
*   **`word-glow`**: 控制 `word-display` 文字的发光效果，使其在两种发光状态之间交替。
*   **`sparkle`**: 控制 `feedback-message` 的闪光效果，模拟光线从中心扩散。
*   **`icon-bounce`**: 控制 `feedback-icon` 的弹跳效果，使其在大小之间周期性变化。
*   **`twinkle`**: 控制 `progress-info` 上的“✨”图标的闪烁和缩放效果。
*   **`tick`**: 控制 `timer` 上的“⏰”图标的左右摇摆效果。
*   **`score-pulse`**: 控制 `score-value` 文字的脉冲效果，使其在大小之间周期性变化。
*   **`cute-spin`**: 控制 `loading-spinner` 的旋转和缩放效果。
*   **`modal-sparkle`**: 控制 `modal-content` 上的“✨”图标的旋转、缩放和透明度变化。
*   **`celebration-dance`**: 控制 `celebration-animals` 的上下移动和轻微旋转，模拟跳舞效果。

### 5. 响应式设计

通过 `@media` 查询，该文件对不同屏幕尺寸下的元素进行了调整，例如：

*   在最大宽度为 `768px` 的屏幕上，调整了 `option-label` 的大小和字体，并减慢了 `word-container` 边框动画的速度。
*   在最大宽度为 `480px` 的屏幕上，进一步缩小了 `option-label`，并隐藏了 `progress-info` 和 `timer` 上的装饰图标，同时调整了 `modal-content` 上的闪烁图标大小和位置。

这些响应式调整确保了在各种设备上都能保持良好的视觉体验和可用性，同时保留了主题的可爱风格。