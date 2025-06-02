# 文件：`js/vocabulary.js`

## 功能和作用

`vocabulary.js` 文件定义了 `VocabularyManager` 类，负责管理应用程序的词汇数据。它处理词汇的加载（从CSV文件或默认文件）、解析、存储、检索以及生成测试题目和干扰项。该模块是应用程序核心逻辑的重要组成部分，为测试和学习功能提供词汇支持。

## 核心类：`VocabularyManager`

### 构造函数 `constructor()`

- **功能**：初始化 `VocabularyManager` 实例的各项属性。
- **主要属性**：
    - `vocabulary`: 数组，用于存储加载的词汇对象，每个对象包含 `word`、`translation`、`sentence` 和 `notes` 属性。
    - `isLoaded`: 布尔值，标识词汇是否已成功加载。

### 核心方法

#### `loadFromFile(file)`

- **功能**：从用户选择的CSV文件异步加载词汇。
- **参数**：
    - `file`: 用户选择的文件对象（File）。
- **逻辑**：
    - 使用 `FileReader` 读取文件内容。
    - 调用 `parseCSV()` 方法解析CSV文本，填充 `this.vocabulary`。
    - 更新 `isLoaded` 状态。
    - 返回一个Promise，解析成功时返回加载的词汇数组，失败时reject错误。

#### `loadFromDefault()`

- **功能**：从默认的 `Vocabulary_List.csv` 文件异步加载词汇。
- **逻辑**：
    - 使用 `fetch` API 获取默认CSV文件的内容。
    - 调用 `parseCSV()` 方法解析CSV文本，填充 `this.vocabulary`。
    - 更新 `isLoaded` 状态。
    - 如果加载失败，会捕获错误并返回空数组，但不会向上抛出，允许应用继续运行。

#### `parseCSV(csvText)`

- **功能**：解析CSV文本字符串，将词汇数据填充到 `this.vocabulary` 数组中。
- **参数**：
    - `csvText`: 包含词汇数据的CSV格式字符串。
- **逻辑**：
    - 将CSV文本按行分割，跳过标题行。
    - 遍历数据行，对每一行调用 `parseCSVLine()` 进行解析。
    - 将解析后的有效词汇对象添加到 `this.vocabulary`。
    - 包含错误处理，如果CSV格式不正确或没有有效数据，会抛出错误。

#### `parseCSVLine(line)`

- **功能**：解析单行CSV文本，处理逗号分隔和引号包围的字段。
- **参数**：
    - `line`: 单行CSV字符串。
- **逻辑**：
    - 实现了一个简单的CSV解析器，能够正确处理包含逗号和转义引号的字段。
    - 返回一个包含 `word`、`translation`、`sentence` 和 `notes` 属性的对象。

#### `getAvailableWords(usedWords = new Set())`

- **功能**：获取当前词汇库中未被使用的单词列表。
- **参数**：
    - `usedWords`: 一个Set对象，包含已使用的单词（通常是单词本身，而非翻译）。
- **逻辑**：过滤 `this.vocabulary`，排除 `usedWords` 中存在的单词。
- **错误处理**：如果词汇库未加载或为空，会抛出错误。

#### `getRandomWord()`

- **功能**：从词汇库中随机获取一个单词。
- **逻辑**：生成一个随机索引，返回对应位置的词汇对象。
- **错误处理**：如果词汇库未加载或为空，会抛出错误。

#### `getRandomDistractors(correctTranslation, count = 2)`

- **功能**：为给定正确翻译生成指定数量的随机干扰项（错误选项）。
- **参数**：
    - `correctTranslation`: 正确答案的翻译。
    - `count`: 需要生成的干扰项数量，默认为2。
- **逻辑**：
    - 从词汇库中筛选出翻译与 `correctTranslation` 不同的单词。
    - 随机选择 `count` 个不重复的翻译作为干扰项。
- **错误处理**：如果词汇库单词数量不足或可用干扰项不足，会抛出错误。

#### `generateQuestion()`

- **功能**：生成一个完整的测试题目对象，包括单词、正确答案、选项、例句和笔记。
- **逻辑**：
    - 调用 `getRandomWord()` 获取一个随机单词作为题目。
    - 调用 `getRandomDistractors()` 生成干扰项。
    - 将正确答案和干扰项组合成选项数组，并使用 `shuffleArray()` 随机排序。
    - 返回包含题目所需所有信息的对象。

#### `shuffleArray(array)`

- **功能**：原地随机打乱数组元素的顺序（Fisher-Yates 洗牌算法）。
- **参数**：
    - `array`: 需要打乱的数组。
- **返回**：打乱后的数组。

#### `getStats()`

- **功能**：获取词汇库的统计信息。
- **返回**：一个对象，包含 `totalWords`（总词汇数）、`wordsWithSentences`（有例句的词汇数）、`wordsWithNotes`（有笔记的词汇数）和 `isLoaded`（词汇库是否已加载）。

#### `searchWord(query)`

- **功能**：根据查询字符串搜索词汇。
- **参数**：
    - `query`: 搜索关键词。
- **逻辑**：在词汇的单词或翻译中查找包含 `query` 的词汇。
- **返回**：匹配的词汇数组。

#### `getWordDetails(word)`

- **功能**：根据单词获取其详细信息。
- **参数**：
    - `word`: 要查询的单词。
- **逻辑**：在词汇库中查找与 `word` 匹配的词汇对象。
- **返回**：匹配的词汇对象，如果未找到则返回 `undefined`。

#### `static validateCSVFormat(csvText)`

- **功能**：静态方法，用于验证CSV文本的格式是否符合要求。
- **参数**：
    - `csvText`: 需要验证的CSV格式字符串。
- **逻辑**：
    - 检查文件是否至少包含标题行和一行数据。
    - 检查标题行是否包含“生词”和“翻译”字段（或其英文对应）。
    - 检查是否存在有效的数据行（即有单词和翻译的行）。
- **返回**：一个对象，包含 `valid`（布尔值，表示是否有效）和 `error`（如果无效，则为错误信息）以及 `dataLines`（有效数据行数）。

## 模块导出

- `vocabulary.js` 文件导出了 `VocabularyManager` 类和 `vocabularyManager` 实例，使得其他模块可以导入并使用词汇管理功能。
- `const vocabularyManager = new VocabularyManager();` 创建了 `VocabularyManager` 的单例。
- `module.exports = { VocabularyManager, vocabularyManager };` 用于Node.js环境下的导出兼容性。