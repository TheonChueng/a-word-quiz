# `storage.js` 文件说明文档

`storage.js` 文件定义了 `StorageManager` 类，该类负责应用程序的数据存储和管理。它使用 `sql.js` 库将数据存储在浏览器中的 IndexedDB（通过 `localForage` 封装）中，并提供了数据迁移、测试记录管理、设置管理、错题池管理以及数据导入导出等功能。

## `StorageManager` 类

### 概述

`StorageManager` 类是应用程序数据持久化的核心。它抽象了底层存储机制，为应用程序的其他部分提供了统一的数据访问接口。该类支持从旧的 `localStorage` 结构迁移数据到新的 `sql.js` 数据库，确保了数据的兼容性和可扩展性。

### 属性

- `legacyStorageKey`: 旧版测试记录在 `localStorage` 中的键名。
- `legacySettingsKey`: 旧版设置在 `localStorage` 中的键名。
- `legacyWrongQuestionsKey`: 旧版错题在 `localStorage` 中的键名。
- `legacyMaxRecords`: 旧版最大记录数限制（可能已废弃或由 SQL 逻辑处理）。
- `legacyMaxWrongQuestions`: 旧版最大错题数限制（可能已废弃或由 SQL 逻辑处理）。
- `db`: `sql.js` 数据库实例，用于执行 SQL 操作。
- `sqlJSConfig`: `sql.js` 的配置对象，主要用于指定 `sql-wasm.wasm` 文件的位置。
- `sqlJS`: `initSqlJs` 函数的实例，用于初始化 `sql.js` 库。
- `dbStorageKey`: `localForage` 中存储数据库二进制数据的键名。

### 方法

#### `constructor()`

- **功能**: 构造函数，初始化 `StorageManager` 实例的各项属性，包括旧版存储键、数据库实例、`sql.js` 配置等。

#### `async initDB()`

- **功能**: 初始化数据库。它会检查 `sql.js` 是否已正确加载，尝试从 `localForage` 加载现有数据库，如果不存在则创建新数据库并初始化表结构，最后确保默认设置已应用。
- **异常**: 如果 `initSqlJs` 未定义或数据库初始化失败，将抛出错误。

#### `createTables()`

- **功能**: 在数据库中创建必要的表，包括 `settings`（设置）、`test_records`（测试记录）和 `wrong_questions_pool`（错题池）。如果表已存在，则不会重复创建。

#### `async ensureDefaultSettings()`

- **功能**: 确保数据库中存在所有默认设置。它会遍历 `getDefaultSettings` 返回的默认设置，如果某个设置在数据库中不存在，则插入其默认值。

#### `async saveDBState()`

- **功能**: 将当前数据库的二进制状态保存到 `localForage` 中。这是持久化 `sql.js` 数据库的关键步骤。

#### `async saveTestRecord(record)`

- **功能**: 将测试记录保存到 `test_records` 表中。它会生成唯一的 ID 和时间戳，并将记录的详细信息（如分数、正确答案数、错题等）插入数据库。
- **参数**: `record` - 包含测试结果的对象。
- **返回**: 插入的测试记录对象。
- **异常**: 如果数据库未初始化或保存失败，将抛出错误。

#### `async getTestRecords()`

- **功能**: 从 `test_records` 表中获取所有测试记录，并按时间戳降序排序。它会解析 `wrong_answers_json` 字段，并格式化时间。
- **返回**: 测试记录数组。

#### `async getRecentRecords(count = 10)`

- **功能**: 获取最近的指定数量的测试记录。
- **参数**: `count` - 要获取的记录数量，默认为 10。
- **返回**: 最近的测试记录数组。

#### `async getRecordById(id)`

- **功能**: 根据 ID 获取单个测试记录。
- **参数**: `id` - 测试记录的唯一 ID。
- **返回**: 匹配的测试记录对象，如果未找到则返回 `undefined`。

#### `async deleteTestRecord(id)`

- **功能**: 根据 ID 删除单个测试记录。
- **参数**: `id` - 要删除的测试记录的唯一 ID。
- **返回**: `true` 如果删除成功，否则 `false`。

#### `async clearAllRecords()`

- **功能**: 清空 `test_records` 表中的所有测试记录。
- **返回**: `true` 如果清空成功，否则 `false`。

#### `async getTestRecordsStats()`

- **功能**: 获取测试记录的统计数据，包括总测试次数、平均分数、最佳分数、平均时间、改进趋势等。此方法是 `getTestStats` 的兼容性别名。
- **返回**: 包含统计数据的对象。

#### `async getTestStats()`

- **功能**: 计算并返回详细的测试统计数据。它会从数据库中获取所有测试记录，并计算各项指标。
- **返回**: 包含统计数据的对象。

#### `getWrongAnswersStats()`

- **功能**: 统计错题的频率和相关信息。
- **返回**: 包含错题统计数据的对象。

#### `async saveSettings(settingsToSave)`

- **功能**: 保存应用程序设置到 `settings` 表中。它会插入或替换现有设置。
- **参数**: `settingsToSave` - 包含要保存设置的对象。
- **返回**: 保存的设置对象。
- **异常**: 如果数据库未初始化或保存失败，将抛出错误。

#### `async getSettings()`

- **功能**: 从 `settings` 表中获取所有设置。如果数据库未初始化或获取失败，将返回默认设置。
- **返回**: 包含当前设置的对象（合并了默认设置）。

#### `getDefaultSettings()`

- **功能**: 返回应用程序的默认设置。
- **返回**: 包含默认设置的对象。

#### `exportData()`

- **功能**: 将测试记录和设置导出为 JSON 文件。它会创建一个 Blob 对象并触发下载。
- **返回**: `true` 如果导出成功，否则 `false`。

#### `importData(file)`

- **功能**: 从 JSON 文件导入数据（测试记录和设置）。此方法处理文件读取和数据解析，并验证数据格式。**注意：此方法目前仍在使用 `localStorage` 进行导入，可能需要更新以与 `sql.js` 数据库兼容。**
- **参数**: `file` - 要导入的 File 对象。
- **返回**: Promise，解析为导入结果。

#### `generateId()`

- **功能**: 生成一个唯一的 ID，用于测试记录和错题。
- **返回**: 唯一的字符串 ID。

#### `async migrateDataFromLocalStorage(forceMigration = false)`

- **功能**: 将旧版 `localStorage` 中的数据（设置、测试记录、错题）迁移到 `sql.js` 数据库中。它会检查迁移状态，避免重复迁移。
- **参数**: `forceMigration` - 如果为 `true`，则强制执行迁移，即使已标记为完成。
- **返回**: `true` 如果迁移成功，否则 `false`。

#### `parseTimeToSeconds(timeString)`

- **功能**: 将时间字符串（例如 "01:30"）解析为秒数。
- **参数**: `timeString` - 时间字符串。
- **返回**: 对应的秒数。

#### `formatTime(seconds)`

- **功能**: 将秒数格式化为 "MM:SS" 的时间字符串。
- **参数**: `seconds` - 秒数。
- **返回**: 格式化的时间字符串。

#### `checkStorageSpace()`

- **功能**: 检查浏览器的本地存储空间使用情况（基于 `localStorage` 的估算）。
- **返回**: 包含使用量、配额、百分比和可用空间的统计对象，如果检查失败则返回 `null`。

#### `cleanupOldData(daysToKeep = 30)`

- **功能**: 清理旧的测试记录，只保留指定天数内的数据。**注意：此方法目前仍在使用 `localStorage` 进行清理，可能需要更新以与 `sql.js` 数据库兼容。**
- **参数**: `daysToKeep` - 要保留数据的天数，默认为 30 天。
- **返回**: 移除的记录数量。

#### `async addWrongQuestion(question)`

- **功能**: 将错题添加到 `wrong_questions_pool` 表中。如果错题已存在，则更新其错误计数和时间戳；否则，插入新错题。
- **参数**: `question` - 包含错题信息（单词、正确答案、用户答案、句子、备注等）的对象。
- **返回**: 更新后的错题列表。
- **异常**: 如果数据库未初始化或操作失败，将抛出错误。

#### `async getWrongQuestions()`

- **功能**: 从 `wrong_questions_pool` 表中获取所有错题，并按错误计数降序、时间戳降序排序。
- **返回**: 错题数组。

#### `async removeWrongQuestion(word)`

- **功能**: 根据单词从错题池中移除错题。
- **参数**: `word` - 要移除的错题单词。
- **返回**: `true` 如果移除成功，否则 `false`。

#### `async clearAllWrongQuestions()`

- **功能**: 清空 `wrong_questions_pool` 表中的所有错题。
- **返回**: `true` 如果清空成功，否则 `false`。

#### `async getWrongQuestionStats()`

- **功能**: 获取错题池的统计数据，包括总错题数、最常错单词、最不常错单词和平均错误计数。
- **返回**: 包含错题统计数据的对象。

#### `async getWrongQuestionsForQuiz(count = 20, strategy = 'default')`

- **功能**: 根据指定的策略从错题池中获取指定数量的错题，用于测验。
- **参数**: 
    - `count` - 要获取的错题数量，默认为 20。
    - `strategy` - 获取错题的策略，可选值包括 `'default'`（按错误计数和时间戳降序）、`'random'`（随机）、`'oldest_errors'`（按时间戳升序）和 `'least_frequent_errors'`（按错误计数升序）。
- **返回**: 错题数组。

#### `async exportDatabase()`

- **功能**: 将当前的 `sql.js` 数据库导出为 `.sqlite` 文件。它会创建数据库的二进制 Blob 并触发下载。
- **返回**: `true` 如果导出成功，否则 `false`。
- **异常**: 如果数据库未初始化或导出失败，将抛出错误。

#### `async importDatabase(file)`

- **功能**: 从 `.sqlite` 文件导入数据库。它会读取文件内容，将其转换为 `Uint8Array`，然后用它创建一个新的 `sql.js` 数据库实例，并保存到 `localForage`。
- **参数**: `file` - 要导入的 File 对象。
- **返回**: `true` 如果导入成功，否则 `false`。
- **异常**: 如果未提供文件或导入失败，将抛出错误。

## 导出

`storage.js` 文件导出了 `StorageManager` 类本身以及一个 `storageManager` 的单例实例，方便其他模块直接使用。

```javascript
// 导出存储管理器实例
const storageManager = new StorageManager();

// 如果在Node.js环境中
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StorageManager, storageManager };
}
```

## 注意事项

- **数据迁移**: `migrateDataFromLocalStorage` 方法用于将旧版 `localStorage` 中的数据迁移到 `sql.js` 数据库。在应用程序启动时应调用此方法以确保数据兼容性。
- **持久化**: 数据库的更改需要通过 `saveDBState()` 方法显式保存到 `localForage` 中才能持久化。
- **兼容性**: `importData` 和 `cleanupOldData` 方法目前仍在使用 `localStorage`，可能需要更新以完全兼容 `sql.js` 数据库。