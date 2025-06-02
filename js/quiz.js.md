# `js/quiz.js` 文件说明文档

## 文件功能

`js/quiz.js` 文件定义了 `QuizManager` 类，该类负责管理单词测试的整个生命周期，包括测试的开始、题目生成、答案提交、计时、结果统计以及错题处理。它支持正常测试模式和错题回顾模式。

## 核心类：`QuizManager`

### 构造函数

`constructor()`

-   初始化 `QuizManager` 实例。
-   设置测试的初始状态，包括：
    -   `currentQuestion`: 当前题目对象。
    -   `currentQuestionIndex`: 当前题目索引。
    -   `totalQuestions`: 测试总题目数（默认为20）。
    -   `score`: 当前得分。
    -   `correctAnswers`: 正确答案数量。
    -   `wrongAnswers`: 存储本次测试中答错的题目。
    -   `startTime`, `endTime`, `timer`, `timeElapsed`: 用于计时。
    -   `isActive`: 测试是否激活。
    -   `usedWords`: 记录正常模式下已使用的单词，避免重复。
    -   `isReviewMode`: 标识是否为错题回顾模式。
    -   `reviewQuestions`: 错题回顾模式下的题目列表。

### 核心方法

#### 测试生命周期管理

-   `async startQuiz(totalQuestions = null, mode = 'normal', wrongQuestions = null)`
    -   开始一个新的测试。
    -   首先调用 `reset()` 清除上一次测试的状态。
    -   根据 `mode` 参数（`'normal'` 或 `'review'`）和 `wrongQuestions` 参数判断是正常测试还是错题回顾模式。
    -   在错题回顾模式下，从 `storageManager` 获取错题或使用传入的 `wrongQuestions`。
    -   设置 `totalQuestions`，并启动计时器 `startTimer()`。
    -   生成第一道题目 `generateNextQuestion()`。

-   `reset()`
    -   重置所有测试状态变量到初始值，为新的测试做准备。
    -   停止计时器 `stopTimer()`。

-   `generateNextQuestion()`
    -   生成下一道题目。
    -   如果已达到 `totalQuestions`，则调用 `endQuiz()` 结束测试。
    -   根据 `isReviewMode` 从错题池或词汇库中选择单词。
    -   调用 `vocabularyManager.getRandomDistractors()` 生成干扰项。
    -   调用 `vocabularyManager.shuffleArray()` 随机排序选项。
    -   构建 `currentQuestion` 对象并递增 `currentQuestionIndex`。
    -   返回生成的题目对象。

-   `async submitAnswer(selectedOption)`
    -   提交用户选择的答案。
    -   判断答案是否正确，更新 `score` 和 `correctAnswers`。
    -   如果答案错误，将错题信息添加到 `wrongAnswers` 数组，并调用 `storageManager.addWrongQuestion()` 将错题保存到错题池。
    -   返回包含答题结果的对象。

-   `async endQuiz()`
    -   结束当前测试。
    -   设置 `isActive` 为 `false`，停止计时器 `stopTimer()`。
    -   播放测试完成音效。
    -   如果不是错题回顾模式，则将本次测试记录保存到 `storageManager`。
    -   返回测试结果对象 `getQuizResult()`。

-   `getQuizResult()`
    -   计算并返回本次测试的最终结果，包括得分、正确答案数、总题目数、错题列表、用时、格式化时间、正确率、日期和测试类型。

#### 计时器管理

-   `startTimer()`
    -   启动一个 `setInterval` 计时器，每秒更新 `timeElapsed`。
    -   通过 `CustomEvent` 触发 `quizTimerUpdate` 事件，通知UI更新计时器显示。

-   `stopTimer()`
    -   清除 `setInterval` 计时器，停止计时。

-   `formatTime(seconds)`
    -   将秒数格式化为 `MM:SS` 字符串。

#### 辅助功能

-   `getHint()`
    -   为当前题目生成提示，包括首字母、单词长度、例句和笔记。

-   `async saveTestRecord(result)`
    -   将测试结果保存到 `storageManager` 中。此方法在 `endQuiz` 中被调用，也可以独立调用。

-   `getProgress()`
    -   返回当前测试的进度信息，包括当前题目索引、总题目数、完成百分比、当前得分和正确答案数。

-   `skipQuestion()`
    -   跳过当前题目，将该题目记录为错题，并生成下一道题目。

-   `pauseQuiz()`
    -   暂停测试，停止计时器并设置 `isActive` 为 `false`。

-   `resumeQuiz()`
    -   恢复测试，启动计时器并设置 `isActive` 为 `true`。

-   `getStats()`
    -   返回当前测试的实时统计数据，包括激活状态、当前题目索引、总题目数、得分、正确答案数、错题数量、已用时间等。

-   `setTotalQuestions(count)`
    -   设置测试的总题目数量。在正常模式下会检查词汇库是否有足够的单词。

-   `getWrongAnswersStats()`
    -   统计本次测试中错题的详细信息，包括总数、按首字母分类、按长度分类以及包含例句和笔记的错题数量。

## 模块导出

`js/quiz.js` 文件导出了 `QuizManager` 类的实例 `quizManager`，使其可以在其他模块中直接引用和使用。

```javascript
// 导出测试管理器实例
const quizManager = new QuizManager();

// 如果在Node.js环境中
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QuizManager, quizManager };
}
```

## 功能和作用

`quiz.js` 文件定义了 `QuizManager` 类，负责管理单词记忆测试的整个生命周期和逻辑。它处理测试的开始、题目生成、答案提交、计时、结果统计、错题记录以及测试状态的重置和管理。该模块是应用程序核心测试功能的实现。

## 核心类：`QuizManager`

### 构造函数 `constructor()`

- **功能**：初始化 `QuizManager` 实例的各项属性，包括测试状态、分数、题目索引、计时器等。
- **主要属性**：
    - `currentQuestion`: 当前题目对象。
    - `currentQuestionIndex`: 当前题目在测试中的索引。
    - `totalQuestions`: 测试的总题目数量，默认为20。
    - `score`: 当前测试得分。
    - `correctAnswers`: 正确回答的题目数量。
    - `wrongAnswers`: 记录本次测试中答错的题目。
    - `startTime`, `endTime`: 测试的开始和结束时间。
    - `timer`: 计时器ID。
    - `isActive`: 测试是否处于激活状态。
    - `timeElapsed`: 测试已用时间（秒）。
    - `usedWords`: `Set` 类型，记录已在本次测试中使用的单词，避免重复出题。
    - `isReviewMode`: 布尔值，标识是否为错题回顾模式。
    - `reviewQuestions`: 错题回顾模式下的题目列表。

### 核心方法

#### `startQuiz(totalQuestions = null, mode = 'normal', wrongQuestions = null)`

- **功能**：开始一个新的单词记忆测试。
- **参数**：
    - `totalQuestions`: 可选，测试的总题目数量。如果为 `null`，则使用 `this.totalQuestions` 的默认值。
    - `mode`: 可选，测试模式，'normal' 为正常测试，'review' 为错题回顾模式。
    - `wrongQuestions`: 可选，在错题回顾模式下，可以直接传入错题数据。
- **逻辑**：
    - 首先调用 `reset()` 方法重置所有测试状态。
    - 根据 `mode` 或 `wrongQuestions` 判断是否为错题回顾模式。
    - 如果是错题回顾模式，从 `storageManager` 获取错题数据或使用传入的 `wrongQuestions`。
    - 检查词汇库是否已加载（正常模式下）。
    - 设置 `isActive` 为 `true`，记录 `startTime`，启动计时器 `startTimer()`，并生成第一道题目 `generateNextQuestion()`。
- **异常处理**：如果错题池为空（回顾模式）或词汇库未加载（正常模式），会抛出错误。

#### `reset()`

- **功能**：重置所有测试相关的状态变量，为新的测试做准备。
- **逻辑**：清空分数、题目索引、已答错题目、计时器、已使用单词等。

#### `generateNextQuestion()`

- **功能**：生成下一道测试题目。
- **逻辑**：
    - 检查是否已达到 `totalQuestions`，如果达到则结束测试 `endQuiz()`。
    - 根据 `isReviewMode` 选择题目来源：
        - **错题回顾模式**：从 `reviewQuestions` 中选择题目。
        - **正常测试模式**：从 `vocabularyManager` 获取可用单词，随机选择一个作为正确答案，并记录到 `usedWords`。
    - 生成干扰选项 `getRandomDistractors()`。
    - 组合正确答案和干扰选项，并随机排序。
    - 构建 `currentQuestion` 对象，包含单词、正确答案、选项、例句和笔记。
    - 递增 `currentQuestionIndex`。
- **异常处理**：如果没有足够的单词生成题目，会抛出错误。

#### `submitAnswer(selectedOption)`

- **功能**：提交用户选择的答案，并判断对错。
- **参数**：
    - `selectedOption`: 用户选择的选项。
- **逻辑**：
    - 判断 `selectedOption` 是否与 `currentQuestion.correctAnswer` 匹配。
    - 如果正确，增加 `correctAnswers` 和 `score`。
    - 如果错误，将错题信息记录到 `wrongAnswers` 数组，并通过 `storageManager.addWrongQuestion()` 自动保存到错题池。
    - 返回包含答题结果的对象。
- **异常处理**：如果测试未激活或没有当前题目，会抛出错误。

#### `getHint()`

- **功能**：为当前题目提供提示。
- **逻辑**：根据当前单词生成首字母、单词长度、例句和笔记等提示信息。

#### `endQuiz()`

- **功能**：结束当前测试，停止计时，保存测试记录，并返回最终结果。
- **逻辑**：
    - 设置 `isActive` 为 `false`，记录 `endTime`，停止计时器 `stopTimer()`。
    - 播放测试完成音效。
    - 如果不是错题回顾模式，将测试结果通过 `storageManager.saveTestRecord()` 保存到数据库。
    - 调用 `getQuizResult()` 获取并返回最终测试结果。

#### `getQuizResult()`

- **功能**：计算并返回当前测试的最终结果。
- **逻辑**：计算得分、正确率、用时等，并返回一个包含所有结果统计的对象。

#### `startTimer()`

- **功能**：启动测试计时器，每秒更新 `timeElapsed` 并触发 `quizTimerUpdate` 事件。

#### `stopTimer()`

- **功能**：停止测试计时器。

#### `formatTime(seconds)`

- **功能**：将秒数格式化为 `MM:SS` 的时间字符串。

#### `saveTestRecord(result)`

- **功能**：独立保存测试记录到 `storageManager`（通常在 `endQuiz` 中调用）。

#### `getProgress()`

- **功能**：获取当前测试的进度信息，包括当前题目数、总题目数、完成百分比、得分和正确答案数。

#### `skipQuestion()`

- **功能**：跳过当前题目，并将其记录为错题。

#### `pauseQuiz()`

- **功能**：暂停测试，停止计时器。

#### `resumeQuiz()`

- **功能**：恢复测试，重新启动计时器。

#### `getStats()`

- **功能**：获取当前测试的实时统计数据。

#### `setTotalQuestions(count)`

- **功能**：设置测试的总题目数量。
- **逻辑**：在正常模式下，会检查设置的题目数量是否超过词汇库的单词数量。

#### `getWrongAnswersStats()`

- **功能**：统计本次测试中错题的详细信息，如按首字母、长度分类，以及包含例句/笔记的错题数量。

## 模块导出

- `quiz.js` 文件导出了 `QuizManager` 类和 `quizManager` 实例，使得其他模块可以导入并使用测试管理功能。
- `const quizManager = new QuizManager();` 创建了 `QuizManager` 的单例。
- `module.exports = { QuizManager, quizManager };` 用于Node.js环境下的导出兼容性。