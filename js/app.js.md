# `js/app.js` 文件说明文档

## 文件功能

`js/app.js` 文件定义了 `WordMemoryTestApp` 类，它是整个单词记忆测试应用的核心入口。该文件负责应用的初始化、模块管理（词汇、测试、UI、存储）、全局事件绑定、用户设置加载、默认词汇库加载、数据导入导出以及背景音乐控制等功能。它协调各个模块协同工作，确保应用的正常运行。

## 核心类：`WordMemoryTestApp`

### 构造函数

`constructor()`

-   初始化 `WordMemoryTestApp` 实例。
-   设置 `isInitialized` 为 `false`。
-   初始化 `modules` 对象，用于存储 `vocabularyManager`、`quizManager`、`uiManager` 和 `storageManager` 的实例。

### 核心方法

#### 应用生命周期管理

-   `async init()`
    -   应用的初始化入口。
    -   检查必要的DOM元素是否存在。
    -   异步初始化各个模块（`vocabulary`、`quiz`、`ui`、`storage`）。
    -   绑定全局事件（`beforeunload`、`visibilitychange`、`error`、`unhandledrejection`）。
    -   异步加载用户设置。
    -   异步加载默认词汇库。
    -   设置 `isInitialized` 为 `true`。
    -   异步显示欢迎消息。
    -   初始化背景音乐。
    -   包含错误处理机制。

-   `checkRequiredElements()`
    -   检查应用运行所需的关键DOM元素（如欢迎界面、测试界面等）是否存在。
    -   如果缺少任何元素，则抛出错误。

-   `async initModules()`
    -   异步初始化 `vocabularyManager`、`quizManager`、`uiManager` 和 `storageManager` 模块。
    -   首先初始化 `uiManager`，因为它可能被其他模块用于显示消息。
    -   初始化 `storageManager` 的数据库。
    -   尝试将 `localStorage` 中的旧数据迁移到SQL数据库。
    -   包含错误处理机制。

-   `bindGlobalEvents()`
    -   绑定全局事件监听器，包括：
        -   `beforeunload`: 页面卸载前的清理工作。
        -   `visibilitychange`: 页面可见性变化时暂停/恢复测试。
        -   `error`: 全局错误捕获。
        -   `unhandledrejection`: 未处理的Promise拒绝捕获。

-   `async loadUserSettings()`
    -   异步从 `storageManager` 加载用户设置。
    -   将设置应用到相应的模块（如设置题目数量到 `quizManager`）。
    -   应用主题设置。
    -   包含错误处理机制。

-   `async loadDefaultVocabulary()`
    -   异步尝试加载默认词汇库。
    -   如果默认词汇库不存在或加载失败，则等待用户上传文件。
    -   包含错误处理机制。

-   `applyTheme(theme)`
    -   根据传入的主题名称，更新 `body` 元素的class，从而应用不同的主题样式。

-   `async showWelcomeMessage()`
    -   异步获取测试统计数据，并根据是否有历史测试记录显示不同的欢迎消息。
    -   检查词汇库加载状态并显示相关信息。
    -   包含错误处理机制。

-   `showInitError(error)`
    -   在应用初始化失败时，尝试通过模态框或 `alert` 显示错误信息。

-   `handleGlobalError(error)`
    -   处理应用运行时捕获的全局错误。
    -   如果错误发生在测试过程中，尝试暂停测试并显示错误提示。

-   `getAppStatus()`
    -   返回当前应用的状态信息，包括是否已初始化、词汇库是否加载、测试是否激活、当前屏幕以及各个模块的加载状态。

-   `async restart()`
    -   异步重启应用，包括清理当前资源并重新执行初始化流程。

-   `cleanup()`
    -   清理应用资源，例如停止测试和计时器。

#### 数据管理

-   `exportData()`
    -   导出所有应用数据（通过 `storageManager`）为JSON文件，并触发下载。
    -   包含错误处理机制。

-   `async importData(file)`
    -   异步从用户选择的JSON文件中导入数据（通过 `storageManager`）。
    -   导入成功后，重新加载用户设置和词汇库。
    -   包含错误处理机制。

#### 信息与媒体

-   `getAppInfo()`
    -   返回应用的元数据，包括名称、版本、作者、描述、主要功能和当前状态。

-   `async initBGM()`
    -   异步初始化背景音乐（BGM）。
    -   根据用户设置决定是否自动播放BGM。

-   `async toggleBGM(play)`
    -   异步控制BGM的播放/暂停状态。
    -   如果未指定 `play` 参数，则切换当前状态。
    -   将BGM播放状态保存到用户设置中。

## 模块导出

`js/app.js` 文件创建了 `WordMemoryTestApp` 的实例 `app`，并在DOM加载完成后初始化该实例。它将 `app` 实例导出为全局 `window.wordMemoryTestApp`，并在Node.js环境下通过 `module.exports` 导出 `WordMemoryTestApp` 类和 `app` 实例，以便在不同环境中复用。

```javascript
// 创建应用实例
const app = new WordMemoryTestApp();

// DOM加载完成后初始化应用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app.init().catch(error => {
            console.error('应用启动失败:', error);
        });
    });
} else {
    // DOM已经加载完成
    app.init().catch(error => {
        console.error('应用启动失败:', error);
    });
}

// 导出应用实例供全局使用
window.wordMemoryTestApp = app;

// 如果在Node.js环境中
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WordMemoryTestApp, app };
}
```

## 文件功能和作用

`js/app.js` 是整个单词记忆测试应用的主入口文件，它定义了 `WordMemoryTestApp` 类，负责协调和管理应用的所有核心模块（词汇管理、测试逻辑、UI交互、数据存储）。该文件处理应用的生命周期，包括初始化、事件绑定、错误处理、数据导入导出、主题应用以及背景音乐控制等。

## 核心类：`WordMemoryTestApp`

### 构造函数 `constructor()`

- **作用**：初始化应用实例。设置 `isInitialized` 状态为 `false`，并创建 `modules` 对象来存储各个功能模块的引用。

### 异步方法 `init()`

- **作用**：应用的初始化入口。按顺序执行以下步骤：
    1. 调用 `checkRequiredElements()` 检查页面中必要的DOM元素是否存在。
    2. 调用 `initModules()` 初始化各个功能模块（`vocabulary`、`quiz`、`ui`、`storage`）。
    3. 调用 `bindGlobalEvents()` 绑定全局事件监听器（如页面卸载、可见性变化、全局错误）。
    4. 调用 `loadUserSettings()` 加载并应用用户设置。
    5. 调用 `loadDefaultVocabulary()` 尝试加载默认词汇库。
    6. 设置 `isInitialized` 为 `true`。
    7. 调用 `showWelcomeMessage()` 显示欢迎信息。
    8. 调用 `initBGM()` 初始化背景音乐。
- **错误处理**：捕获初始化过程中的任何错误，并调用 `showInitError()` 显示错误信息。

### 方法 `checkRequiredElements()`

- **作用**：检查应用运行所需的关键DOM元素（如欢迎界面、测试界面等）是否存在。如果缺少任何元素，则抛出错误。

### 异步方法 `initModules()`

- **作用**：初始化并连接 `vocabularyManager`、`quizManager`、`uiManager` 和 `storageManager` 等模块。
    1. 验证这些全局模块是否已加载。
    2. 将模块实例赋值给 `this.modules`。
    3. 初始化 `uiManager`。
    4. 初始化 `storageManager` 的数据库 (`initDB()`)。
    5. 尝试执行数据从 `localStorage` 到 `SQL` 的迁移 (`migrateFromLocalStorageToSQL()`)，并根据迁移结果显示提示信息。

### 方法 `bindGlobalEvents()`

- **作用**：绑定全局事件监听器，以增强用户体验和应用稳定性：
    - `beforeunload`：页面卸载前进行清理工作。
    - `visibilitychange`：根据页面可见性暂停或恢复测试。
    - `error`：捕获全局JavaScript错误。
    - `unhandledrejection`：捕获未处理的Promise拒绝。
- **错误处理**：全局错误和Promise拒绝会通过 `handleGlobalError()` 方法进行处理。

### 异步方法 `loadUserSettings()`

- **作用**：从 `storage` 模块加载用户设置，并将其应用到 `quiz` 模块（如题目数量）和应用主题 (`applyTheme()`)。

### 异步方法 `loadDefaultVocabulary()`

- **作用**：尝试加载默认词汇库。如果默认词汇库不存在或加载失败，会提示用户手动上传词汇文件。

### 方法 `applyTheme(theme)`

- **作用**：根据传入的主题名称，为 `body` 元素添加相应的CSS类，从而改变应用的主题样式。

### 异步方法 `showWelcomeMessage()`

- **作用**：根据用户是否有测试记录，显示不同的欢迎信息。同时，检查词汇库是否已加载并显示相关统计信息。

### 方法 `showInitError(error)`

- **作用**：当应用初始化失败时，尝试在UI上显示一个错误模态框。如果模态框元素不存在，则回退到使用 `alert()`。

### 方法 `handleGlobalError(error)`

- **作用**：处理应用运行时捕获到的全局错误。如果错误发生在测试过程中，会尝试暂停测试并显示错误提示。

### 方法 `getAppStatus()`

- **作用**：返回当前应用的状态信息，包括是否已初始化、词汇库是否加载、测试是否活跃、当前屏幕以及各模块的加载状态。

### 异步方法 `restart()`

- **作用**：重启应用。首先调用 `cleanup()` 清理当前资源，然后重新执行 `init()`。

### 方法 `cleanup()`

- **作用**：清理应用资源，例如停止正在进行的测试和清除计时器。

### 方法 `exportData()`

- **作用**：通过 `storage` 模块导出所有应用数据（通常是JSON格式），并触发浏览器下载。

### 异步方法 `importData(file)`

- **作用**：从用户选择的文件中导入应用数据。数据导入成功后，会重新加载用户设置和词汇库。

### 方法 `getAppInfo()`

- **作用**：返回应用的基本信息，如名称、版本、作者、描述、主要功能和当前状态。

### 异步方法 `initBGM()`

- **作用**：初始化背景音乐。从存储中获取 `playBGM` 设置，如果设置为 `true`，则尝试播放背景音乐。

### 异步方法 `toggleBGM(play)`

- **作用**：控制背景音乐的播放/暂停状态。如果未指定 `play` 参数，则切换当前状态。同时，将新的播放状态保存到用户设置中。

## 应用启动逻辑

- 在 `DOMContentLoaded` 事件触发后，创建 `WordMemoryTestApp` 的实例 `app`，并调用其 `init()` 方法启动应用。
- 将 `app` 实例挂载到 `window.wordMemoryTestApp`，使其可以在全局范围内访问。
- 在 Node.js 环境下，同时导出 `WordMemoryTestApp` 类和 `app` 实例。

## 依赖

- `vocabularyManager` (来自 `js/vocabulary.js`)
- `quizManager` (来自 `js/quiz.js`)
- `uiManager` (来自 `js/ui.js`)
- `storageManager` (来自 `js/storage.js`)

## 总结

`js/app.js` 是整个单词记忆测试应用的“大脑”，它将各个独立的模块整合在一起，形成一个功能完整的应用程序。它负责应用的启动、配置、状态管理、全局事件处理以及数据流的协调，确保了用户界面的响应性和数据的一致性。