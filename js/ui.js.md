# 文件：`js/ui.js`

## 功能和作用

`ui.js` 文件定义了 `UIManager` 类，负责管理应用程序的用户界面（UI）的各个方面。它处理DOM元素的缓存、事件绑定、屏幕切换、数据显示更新、用户交互反馈（如加载、错误、成功提示）以及与 `quizManager`、`vocabularyManager` 和 `storageManager` 等核心逻辑模块的交互。该模块是应用程序前端展示和用户体验的核心。

## 核心类：`UIManager`

### 构造函数 `constructor()`

- **功能**：初始化 `UIManager` 实例的各项属性，包括当前屏幕、屏幕历史、所有屏幕的DOM引用、缓存的DOM元素集合以及初始化状态。
- **主要属性**：
    - `currentScreen`: 当前显示的屏幕名称。
    - `screenHistory`: 数组，用于存储屏幕切换历史，支持返回上一页功能。
    - `screens`: 对象，存储所有主要屏幕的DOM元素引用，通过ID获取。
    - `elements`: 对象，用于缓存各种按钮、显示区域等DOM元素，方便快速访问。
    - `isInitialized`: 布尔值，标识UI管理器是否已完成初始化。

### 核心方法

#### `init()`

- **功能**：初始化UI管理器，包括缓存DOM元素、绑定事件和显示初始屏幕。
- **逻辑**：调用 `cacheElements()`、`bindEvents()` 和 `showScreen('welcome')`。

#### `cacheElements()`

- **功能**：查找并缓存应用程序中所有需要频繁访问的DOM元素，如按钮、输入框、显示区域等。
- **目的**：提高DOM操作效率，避免重复查询。

#### `playSound(soundId)`

- **功能**：播放指定ID的音效。
- **逻辑**：检查用户设置中是否开启了音效，如果开启则播放对应的音频元素。

#### `bindEvents()`

- **功能**：为所有UI元素绑定事件监听器，处理用户交互。
- **涵盖事件**：点击事件（按钮）、文件选择事件、键盘事件、自定义事件（如 `quizTimerUpdate`）。
- **交互逻辑**：根据用户操作调用相应的处理函数，如 `handleStartTest()`、`handleOptionSelect()`、`handleKeyPress()` 等。

#### `showScreen(screenName, addToHistory = true)`

- **功能**：显示指定的屏幕，并隐藏其他所有屏幕。
- **参数**：
    - `screenName`: 要显示的屏幕的名称（对应 `this.screens` 中的键）。
    - `addToHistory`: 布尔值，是否将当前屏幕添加到历史记录，默认为 `true`。
- **逻辑**：
    - 遍历 `this.screens` 隐藏所有屏幕。
    - 如果 `addToHistory` 为 `true` 且当前屏幕与目标屏幕不同，则将当前屏幕推入 `screenHistory`。
    - 显示目标屏幕，并更新 `currentScreen`。
    - 根据屏幕类型（如 `settings`、`history`、`allWrongWords`）调用相应的初始化或更新函数。

#### `initSettingsScreen()`

- **功能**：初始化设置屏幕的UI状态，例如根据用户设置更新BGM和音效开关的状态。
- **逻辑**：从 `storageManager` 获取用户设置并应用到UI。

#### `goBack()`

- **功能**：返回到上一个屏幕。
- **逻辑**：从 `screenHistory` 弹出上一个屏幕，并调用 `showScreen()` 显示，但不将其添加到历史记录。

#### `handleStartTest()`

- **功能**：处理用户点击“开始测试”按钮的逻辑。
- **逻辑**：检查词汇库是否已加载，如果未加载则尝试加载默认词汇，然后跳转到题目数量选择界面。

#### `handleFileSelect(event)`

- **功能**：处理用户选择CSV词汇文件的逻辑。
- **逻辑**：验证文件格式，显示加载状态，调用 `vocabularyManager.loadFromFile()` 加载词汇，并更新UI显示加载结果。

#### `handleQuestionCountSelect(event)`

- **功能**：处理用户选择题目数量的逻辑。
- **逻辑**：设置 `quizManager` 的题目数量，并调用 `quizManager.startQuiz()` 开始测试，然后显示测试界面。

#### `showQuizScreen()`

- **功能**：显示测试界面并更新其内容。

#### `updateQuizDisplay()`

- **功能**：根据 `quizManager.currentQuestion` 和 `quizManager.getProgress()` 更新测试界面的单词、进度和选项显示。

#### `handleOptionSelect(optionIndex)`

- **功能**：处理用户选择答案选项的逻辑。
- **逻辑**：获取用户选择的选项，调用 `quizManager.submitAnswer()` 提交答案，播放音效，并显示反馈界面。

#### `highlightCorrectAnswer(correctAnswer)`

- **功能**：在选项按钮中高亮显示正确答案和用户选择的答案（正确或错误）。

#### `showFeedbackScreen(result)`

- **功能**：显示反馈界面并更新其内容。

#### `updateFeedbackDisplay(result)`

- **功能**：根据答题结果更新反馈界面的单词、进度、反馈消息、用户答案、正确答案、例句和笔记显示。

#### `handleNextQuestion()`

- **功能**：处理用户点击“下一题”或“查看结果”按钮的逻辑。
- **逻辑**：如果测试未结束，则生成下一题并显示测试界面；如果测试结束，则调用 `quizManager.endQuiz()` 并显示结果界面。

#### `showResultsScreen(result)`

- **功能**：显示结果界面并更新其内容。

#### `updateResultsDisplay(result)`

- **功能**：根据测试结果更新结果界面的分数、时间、正确数等显示，并根据正确率显示不同的庆祝动画。

#### `showCelebration(level)`

- **功能**：根据测试成绩显示不同的庆祝动画（表情符号）。

#### `showHistoryScreen()`

- **功能**：显示历史记录界面并更新其内容。

#### `updateHistoryDisplay()`

- **功能**：从 `storageManager` 获取测试历史记录，并动态生成HTML列表显示。

#### `createHistoryItem(record)`

- **功能**：根据单个测试记录数据创建历史记录项的DOM元素。

#### `showMistakesScreen()`

- **功能**：显示本次测试的错题列表界面并更新其内容。

#### `updateMistakesDisplay()`

- **功能**：根据 `quizManager.wrongAnswers` 更新错题列表显示。

#### `createMistakeItem(mistake)`

- **功能**：根据单个错题数据创建错题项的DOM元素。

#### `showHint()`

- **功能**：显示当前题目的提示信息（通过 `alert` 弹窗）。

#### `updateTimer(timerData)`

- **功能**：更新计时器显示。

#### `handleBackToHome()`

- **功能**：处理返回首页的逻辑，如果测试正在进行，会提示用户确认是否退出。

#### `handleKeyPress(event)`

- **功能**：处理键盘事件，例如在测试界面通过数字键选择选项，在反馈界面通过空格或回车键进入下一题。

#### `showLoading(message)` / `hideLoading()`

- **功能**：显示/隐藏加载状态提示。

#### `showError(message)` / `hideError()`

- **功能**：显示/隐藏错误信息模态框。

#### `showSuccess(message)` / `showToast(message)`

- **功能**：显示短暂的成功提示信息（Toast）。

#### `getCurrentScreen()`

- **功能**：获取当前显示的屏幕名称。

#### `isReady()`

- **功能**：检查UI管理器是否已初始化。

#### `showWrongQuestionHubScreen()`

- **功能**：显示错题功能选择界面。

#### `showAllWrongWordsScreen()`

- **功能**：显示所有历史错词汇总表界面。

#### `updateAllWrongWordsDisplay()`

- **功能**：从 `storageManager` 获取所有错题数据和统计信息，并动态生成HTML列表显示。

#### `handleStartWrongQuiz()`

- **功能**：处理用户点击“开始错题测试”按钮的逻辑。
- **逻辑**：从 `storageManager` 获取错题，并调用 `quizManager.startQuiz()` 以回顾模式开始测试。

#### `handleClearWrongPool()`

- **功能**：处理清空错题池的逻辑。
- **逻辑**：提示用户确认，然后调用 `storageManager.clearAllWrongQuestions()` 清空错题，并更新显示。

#### `initSettingsEvents()`

- **功能**：初始化设置界面中与数据管理相关的事件，如导出/导入数据库。
- **逻辑**：绑定导出数据库按钮的点击事件和导入数据库文件选择事件，调用 `storageManager` 相应的方法。

## 模块导出

- `ui.js` 文件导出了 `UIManager` 类和 `uiManager` 实例，使得其他模块可以导入并使用UI管理功能。
- `const uiManager = new UIManager();` 创建了 `UIManager` 的单例。
- `module.exports = { UIManager, uiManager };` 用于Node.js环境下的导出兼容性。

### 初始化与元素缓存

- **`init()`**: 
    - 调用 `cacheElements()` 缓存所有需要的 DOM 元素。
    - 调用 `bindEvents()` 为缓存的元素绑定事件监听器。
    - 调用 `showScreen('welcome')` 显示欢迎界面。
    - 设置 `isInitialized` 为 `true`。

- **`cacheElements()`**: 
    - 获取并存储应用中所有重要的 DOM 元素到 `this.elements` 对象中。这包括各种按钮（开始测试、查看历史、设置、返回、选项按钮等）、显示区域（当前单词、进度、计时器、反馈信息、最终得分等）、列表容器（历史记录列表、错题列表）以及模态框（加载、错误）。

### 事件绑定

- **`bindEvents()`**: 
    - 为 `this.elements` 中缓存的各个交互元素（主要是按钮）添加事件监听器。
    - **导航事件**: 开始测试、查看历史、查看错题中心、打开设置、返回按钮等，通常会调用 `playSound()` 并触发相应的屏幕切换或处理函数。
    - **设置事件**: 背景音乐开关 (`bgmSwitch`) 和音效开关 (`soundEffectsSwitch`) 的 `change` 事件会调用 `app.toggleBGM()` 或更新 `storageManager` 中的设置。
    - **文件选择**: CSV 文件输入 (`csvFileInput`) 的 `change` 事件会调用 `handleFileSelect()`。
    - **题目数量选择**: 数量选项按钮 (`countOptionBtns`) 的点击事件会调用 `handleQuestionCountSelect()`。
    - **测试界面事件**: 提示按钮 (`hintBtn`) 调用 `showHint()`；选项按钮 (`optionButtons`) 调用 `handleOptionSelect()`。
    - **反馈界面事件**: 下一题按钮 (`nextQuestionBtn`) 调用 `handleNextQuestion()`。
    - **结果界面事件**: 重新开始按钮 (`restartTestBtn`) 调用 `handleStartTest()`；查看错题按钮 (`viewMistakesBtn`) 调用 `showMistakesScreen()`。
    - **错题回顾事件**: 查看所有错词、开始错题测试、清空错题池等按钮分别调用相应的处理函数。
    - **全局事件**: 监听 `window` 上的 `quizTimerUpdate` 自定义事件来更新计时器显示；监听 `document` 上的 `keydown` 事件来处理键盘快捷键 (`handleKeyPress`)。
    - 调用 `initSettingsEvents()` 来为设置界面中的特定功能（如导入/导出数据库）绑定事件。

### 屏幕管理

- **`showScreen(screenName, addToHistory = true)`**: 
    - 隐藏当前所有活动的屏幕。
    - 显示 `screenName` 指定的屏幕。
    - 如果 `addToHistory` 为 `true` 且不是切换到当前屏幕，则将之前的屏幕名推入 `screenHistory`。
    - 更新 `currentScreen` 为 `screenName`。
    - 特定屏幕的特殊处理：
        - 如果是 `'settings'`，调用 `initSettingsScreen()` 初始化设置项的显示状态。
        - 如果是 `'history'`，调用 `updateHistoryDisplay()` 更新历史记录列表。
        - 如果是 `'allWrongWords'`，调用 `updateAllWrongWordsDisplay()` 更新所有错词列表。

- **`goBack()`**: 
    - 从 `screenHistory` 中弹出上一个屏幕名称，并使用 `showScreen(previousScreen, false)`切换回去（不再次添加到历史记录）。
    - 如果历史记录为空，则返回欢迎界面。

### 核心交互处理

- **`async handleStartTest()`**: 
    - 检查词汇库是否加载，如果未加载则尝试加载默认词汇或提示用户选择文件。
    - 设置 `quizManager.isReviewMode = false`。
    - 显示题目数量选择界面 (`questionCount`)。

- **`async handleFileSelect(event)`**: 
    - 获取用户选择的 CSV 文件。
    - 显示加载动画，调用 `vocabularyManager.loadFromFile()` 加载词汇。
    - 更新文件标签，显示成功加载信息或错误信息。

- **`handleQuestionCountSelect(event)`**: 
    - 获取用户选择的题目数量。
    - 调用 `quizManager.setTotalQuestions()` 和 `quizManager.startQuiz()`。
    - 调用 `showQuizScreen()` 显示测试界面。

- **`showQuizScreen()` / `updateQuizDisplay()`**: 
    - 切换到测试屏幕。
    - 更新界面元素以显示当前问题、进度和选项。

- **`async handleOptionSelect(optionIndex)`**: 
    - 获取用户选择的答案。
    - 调用 `quizManager.submitAnswer()` 提交答案。
    - 播放正确或错误音效。
    - 调用 `showFeedbackScreen()` 显示反馈。

- **`showFeedbackScreen(result)` / `updateFeedbackDisplay(result)`**: 
    - 切换到反馈屏幕。
    - 显示用户答案、正确答案、例句、笔记，以及反馈信息（正确/错误）。
    - 更新“下一题”按钮的文本（如果是最后一题，则变为“查看结果”）。

- **`async handleNextQuestion()`**: 
    - 如果是最后一题，调用 `quizManager.endQuiz()` 并显示结果屏幕 (`showResultsScreen`)。
    - 否则，调用 `quizManager.generateNextQuestion()` 并刷新测试界面 (`showQuizScreen`)。

- **`showResultsScreen(result)` / `updateResultsDisplay(result)`**: 
    - 切换到结果屏幕。
    - 显示最终得分、用时、正确题数等。
    - 根据得分百分比显示不同的庆祝动画 (`showCelebration`)。

### 历史记录与错题显示

- **`showHistoryScreen()` / `async updateHistoryDisplay()`**: 
    - 切换到历史记录屏幕。
    - 从 `storageManager.getTestRecords()` 获取记录。
    - 如果无记录，显示空状态；否则，遍历记录并为每条记录调用 `createHistoryItem()` 生成 DOM 元素添加到列表中。

- **`createHistoryItem(record)`**: 
    - 根据测试记录对象创建一个格式化的 HTML 元素，包含日期、得分、用时、正确率等信息。

- **`showMistakesScreen()` / `updateMistakesDisplay()`**: 
    - 切换到本次测试的错题显示屏幕。
    - 从 `quizManager.wrongAnswers` 获取本次测试的错题。
    - 如果无错题，显示空状态；否则，遍历错题并为每条记录调用 `createMistakeItem()` 生成 DOM 元素添加到列表中。

- **`createMistakeItem(mistake)`**: 
    - 根据错题对象创建一个格式化的 HTML 元素，包含单词、用户答案、正确答案、例句和笔记。

### 错题回顾功能 UI

- **`showWrongQuestionHubScreen()`**: 显示错题功能中心（包含“查看所有错词”和“开始错题测试”按钮）。
- **`showAllWrongWordsScreen()` / `async updateAllWrongWordsDisplay()`**: 
    - 切换到所有历史错词汇总屏幕。
    - 从 `storageManager.getWrongQuestions()` 和 `storageManager.getWrongQuestionStats()` 获取数据。
    - 更新总错题数、平均错误次数等统计信息。
    - 遍历所有错词，生成包含单词、错误次数、答案、例句、笔记、最近错误时间的 HTML 列表项。
- **`async handleStartWrongQuiz()`**: 
    - 从 `storageManager.getWrongQuestionsForQuiz()` 获取一批错题。
    - 调用 `quizManager.startQuiz()` 以回顾模式开始测试。
- **`async handleClearWrongPool()`**: 
    - 确认后，调用 `storageManager.clearAllWrongQuestions()` 清空错题池，并刷新显示。

### 辅助 UI 功能

- **`async playSound(soundId)`**: 
    - 检查音效设置，如果开启，则播放 `document.getElementById(soundId)` 指定的音频元素。

- **`showHint()`**: 
    - 调用 `quizManager.getHint()` 获取提示信息，并通过 `alert` 显示。

- **`updateTimer(timerData)`**: 
    - 更新测试界面和反馈界面上的计时器显示。

- **`handleBackToHome()`**: 
    - 如果在测试中，提示用户确认退出。
    - 调用 `quizManager.reset()` 并显示欢迎界面。

- **`handleKeyPress(event)`**: 
    - 在测试界面，允许用数字键 1-3 选择答案。
    - 在反馈界面，允许用空格键或回车键进入下一题。

- **`showLoading(message)` / `hideLoading()`**: 控制加载动画的显示和隐藏。
- **`showError(message)` / `hideError()`**: 控制错误模态框的显示和隐藏。
- **`showSuccess(message)`**: 显示一个短暂的成功提示框 (toast)。

- **`async initSettingsScreen()`**: 
    - 当切换到设置屏幕时，从 `storageManager.getSettings()` 读取设置，并更新 BGM 和音效开关的状态。

- **`initSettingsEvents()`**: 
    - 为设置界面中的特定按钮（如导出/导入数据库）绑定事件。
        - 导出数据库：调用 `storageManager.exportDatabase()`。
        - 导入数据库：获取文件，确认后调用 `storageManager.importDatabase()` 并提示重新加载页面。

### 状态获取

- **`getCurrentScreen()`**: 返回当前显示的屏幕名称。
- **`isReady()`**: 返回 UI 是否已初始化。

## 导出

- 导出一个 `UIManager` 的单例 `uiManager`，供应用其他模块使用。
- 在 Node.js 环境下，同时导出 `UIManager` 类和 `uiManager` 实例。

# 总结

`UIManager` 是连接用户与应用逻辑的核心。它通过精心组织的屏幕管理、元素缓存和事件处理，提供了流畅的用户体验。该模块不仅负责基本的界面渲染和导航，还集成了音效、加载提示、错误处理以及与数据存储模块（`storageManager`）和测验逻辑模块（`quizManager`）的交互，确保了应用各部分功能的协调运作。特别是对错题回顾相关界面的细致处理，增强了应用的学习辅助功能。