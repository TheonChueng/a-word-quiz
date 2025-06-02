// 存储管理模块
class StorageManager {
    constructor() {
        // These keys might be deprecated or used as part of a migration strategy
        this.legacyStorageKey = 'wordQuizTestRecords';
        this.legacySettingsKey = 'wordQuizSettings';
        this.legacyWrongQuestionsKey = 'wordQuizWrongQuestions';
        // These limits might be handled differently or become irrelevant with SQL
        this.legacyMaxRecords = 100;
        this.legacyMaxWrongQuestions = 500;

        this.db = null;          // Will hold the sql.js database object
        this.sqlJSConfig = {
            // Path to sql-wasm.wasm. Adjust if you placed it elsewhere.
            // If sql-wasm.wasm is in the same directory as index.html:
            locateFile: file => file // 直接返回文件名，让浏览器从当前URL的同级目录查找
            // If sql-wasm.wasm is in js/lib/ (assuming index.html is at root):
            // locateFile: file => `/js/lib/${file}`
        };
        this.sqlJS = null;       // Will hold the initSqlJs instance
        this.dbStorageKey = 'wordQuizDatabase_sqljs'; // Key for localForage to store the DB state
    }

    async initDB() {
        try {
            if (typeof initSqlJs !== 'function') {
                console.error('Fatal: initSqlJs is not defined. Ensure sql-wasm.js is loaded correctly before storage.js and that it defines initSqlJs globally.');
                throw new Error('initSqlJs is not defined. SQL.js library not loaded correctly.');
            }

            if (!this.sqlJS) {
                // Load sql.js and initialize it
                console.log('Attempting to initialize SQL.js with config:', this.sqlJSConfig);
                this.sqlJS = await initSqlJs(this.sqlJSConfig);
                console.log('SQL.js initialized successfully.');
            }

            // Try to load existing database from localForage
            const dbFile = await localforage.getItem(this.dbStorageKey);

            if (dbFile instanceof Uint8Array && dbFile.length > 0) {
                this.db = new this.sqlJS.Database(dbFile);
                console.log('Database loaded from localForage.');
            } else {
                this.db = new this.sqlJS.Database();
                console.log('New database created. Initializing schema...');
                // Create tables if it's a new database
                this.createTables();
                await this.saveDBState(); // Save the initial empty schema
            }
            // Apply default settings if they don't exist
            await this.ensureDefaultSettings();
        } catch (error) {
            console.error('Error initializing database:', error);
            // Fallback or error display might be needed here
            throw new Error('Database initialization failed: ' + error.message);
        }
    }

    createTables() {
        if (!this.db) return;
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT
            );

            CREATE TABLE IF NOT EXISTS test_records (
                id TEXT PRIMARY KEY,
                timestamp INTEGER,
                date_iso TEXT,
                score INTEGER,
                max_score INTEGER,
                correct_answers INTEGER,
                total_questions INTEGER,
                time_taken_seconds INTEGER,
                percentage INTEGER,
                wrong_answers_json TEXT
            );
            CREATE INDEX IF NOT EXISTS idx_test_records_timestamp ON test_records (timestamp DESC);

            CREATE TABLE IF NOT EXISTS wrong_questions_pool (
                word TEXT PRIMARY KEY,
                correct_answer TEXT,
                user_answer TEXT, -- Renamed from last_user_answer for clarity
                sentence TEXT,
                notes TEXT,
                timestamp INTEGER, -- Renamed from last_error_timestamp
                error_count INTEGER DEFAULT 1
            );
            CREATE INDEX IF NOT EXISTS idx_wrong_questions_error_count ON wrong_questions_pool (error_count DESC);
            CREATE INDEX IF NOT EXISTS idx_wrong_questions_timestamp ON wrong_questions_pool (timestamp DESC);
        `);
        console.log('Database tables created/ensured.');
    }

    async ensureDefaultSettings() {
        const defaultSettings = this.getDefaultSettings(); // This method still exists
        for (const key in defaultSettings) {
            const stmtSelect = this.db.prepare("SELECT value FROM settings WHERE key = :key");
            const existingSetting = stmtSelect.getAsObject({ ':key': key });
            stmtSelect.free();
            
            // getAsObject returns an empty object if no rows are found. 
            // So, check if 'value' property exists or if the object is empty.
            if (Object.keys(existingSetting).length === 0 || existingSetting.value === undefined) { 
                 const stmtInsert = this.db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (:key, :value)");
                 stmtInsert.run({ ':key': key, ':value': JSON.stringify(defaultSettings[key]) });
                 stmtInsert.free();
            }
        }
        await this.saveDBState();
    }

    async saveDBState() {
        if (this.db) {
            try {
                const dbBinary = this.db.export();
                await localforage.setItem(this.dbStorageKey, dbBinary);
                // console.log('Database state saved to localForage.'); // Can be too verbose
            } catch (error) {
                console.error('Error saving database state to localForage:', error);
            }
        }
    }

    // saveTestRecord
    async saveTestRecord(record) {
        if (!this.db) throw new Error('DB not initialized for saveTestRecord');
        try {
            const stmt = this.db.prepare(`
                INSERT INTO test_records (id, timestamp, date_iso, score, max_score, correct_answers, total_questions, time_taken_seconds, percentage, wrong_answers_json)
                VALUES (:id, :timestamp, :date_iso, :score, :max_score, :correct_answers, :total_questions, :time_taken_seconds, :percentage, :wrong_answers_json)
            `);
            const newRecord = {
                ':id': record.id || this.generateId(), // Ensure ID
                ':timestamp': record.timestamp || Date.now(), // Ensure timestamp
                ':date_iso': record.date || new Date().toISOString(), // Use record.date if available from quizManager
                ':score': record.score,
                ':max_score': record.maxScore,
                ':correct_answers': record.correctAnswers,
                ':total_questions': record.totalQuestions,
                ':time_taken_seconds': record.timeTaken, // This should be raw seconds from quizManager
                ':percentage': record.percentage,
                ':wrong_answers_json': JSON.stringify(record.wrongAnswers || [])
            };
            stmt.run(newRecord);
            
            // 为了调试，也记录实际插入的数据
            const debugRecord = {
                id: record.id || this.generateId(),
                timestamp: record.timestamp || Date.now(),
                date_iso: record.date || new Date().toISOString(),
                score: record.score,
                max_score: record.maxScore,
                correct_answers: record.correctAnswers,
                total_questions: record.totalQuestions,
                time_taken_seconds: record.timeTaken,
                percentage: record.percentage,
                wrong_answers_json: JSON.stringify(record.wrongAnswers || [])
            };
            console.log('Inserting record with data:', debugRecord);
            stmt.free();

            // Optional: Pruning old records can be done here or as a separate maintenance task.
            // Example: Prune to keep only the latest N records (e.g., this.legacyMaxRecords)
            // const countResult = this.db.exec("SELECT COUNT(*) FROM test_records");
            // const currentCount = countResult[0].values[0][0];
            // if (currentCount > this.legacyMaxRecords) { // Using legacyMaxRecords for consistency if desired
            //     this.db.exec(`DELETE FROM test_records WHERE id IN (SELECT id FROM test_records ORDER BY timestamp ASC LIMIT ${currentCount - this.legacyMaxRecords})`);
            // }

            await this.saveDBState();
            console.log('Test record saved to DB:', debugRecord);
            return debugRecord; // Return the object that was inserted
        } catch (error) {
            console.error('Failed to save test record to DB:', error);
            throw error;
        }
    }

    // Get all test records
    async getTestRecords() {
        if (!this.db) return [];
        try {
            const results = this.db.exec("SELECT id, timestamp, date_iso, score, max_score AS maxScore, correct_answers AS correctAnswers, total_questions AS totalQuestions, time_taken_seconds AS timeTaken, percentage, wrong_answers_json AS wrongAnswersJson FROM test_records ORDER BY timestamp DESC");
            if (results.length > 0 && results[0].values) {
                return results[0].values.map(row => {
                    // 创建记录对象，确保每个字段都有值
                    const record = {};
                    
                    // 将列名与值对应起来
                    results[0].columns.forEach((col, i) => {
                        // 确保即使数据库中的值为null，也设置一个默认值
                        record[col] = row[i] !== null ? row[i] : 
                            (col === 'score' || col === 'maxScore' || col === 'correctAnswers' || 
                             col === 'totalQuestions' || col === 'timeTaken' || col === 'percentage') ? 0 : '';
                    });
                    
                    // 处理特殊字段
                    try {
                        record.wrongAnswers = JSON.parse(record.wrongAnswersJson || '[]');
                    } catch (e) {
                        console.error('Error parsing wrongAnswersJson:', e);
                        record.wrongAnswers = [];
                    }
                    
                    delete record.wrongAnswersJson; // 清理内部表示
                    
                    // 添加格式化的时间，用于UI显示
                    record.timeFormatted = this.formatTime(record.timeTaken);
                    
                    // 确保date字段存在，用于兼容性 - 使用数据库中的日期，而不是当前日期
                    record.date = record.date_iso;
                    
                    // 确保所有必要字段都有值，但不要覆盖已有的值
                    if (record.score === undefined || record.score === null) record.score = 0;
                    if (record.maxScore === undefined || record.maxScore === null) record.maxScore = record.totalQuestions * 5 || 100;
                    if (record.correctAnswers === undefined || record.correctAnswers === null) record.correctAnswers = 0;
                    if (record.totalQuestions === undefined || record.totalQuestions === null) record.totalQuestions = 20;
                    if (record.percentage === undefined || record.percentage === null) {
                        record.percentage = record.totalQuestions > 0 ? 
                            Math.round((record.correctAnswers / record.totalQuestions) * 100) : 0;
                    }
                    
                    // Add logging for debugging
                    console.log('Retrieved record:', record);
                    
                    return record;
                });
            }
            return [];
        } catch (error) {
            console.error('Error getting test records:', error);
            return [];
        }
    }

    // getRecentRecords (uses SQL LIMIT for efficiency)
    async getRecentRecords(count = 10) {
        if (!this.db) return [];
        try {
            // Using db.exec with a template literal for the LIMIT clause as sql.js prepare might not directly support LIMIT with placeholders in all versions/contexts easily.
            const results = this.db.exec(`SELECT id, timestamp, date_iso, score, max_score AS maxScore, correct_answers AS correctAnswers, total_questions AS totalQuestions, time_taken_seconds AS timeTaken, percentage, wrong_answers_json AS wrongAnswersJson FROM test_records ORDER BY timestamp DESC LIMIT ${count}`);
            if (results.length > 0 && results[0].values) {
                 return results[0].values.map(row => {
                    // 创建记录对象，确保每个字段都有值
                    const record = {};
                    
                    // 将列名与值对应起来
                    results[0].columns.forEach((col, i) => {
                        // 确保即使数据库中的值为null，也设置一个默认值
                        record[col] = row[i] !== null ? row[i] : 
                            (col === 'score' || col === 'maxScore' || col === 'correctAnswers' || 
                             col === 'totalQuestions' || col === 'timeTaken' || col === 'percentage') ? 0 : '';
                    });
                    
                    // 处理特殊字段
                    try {
                        record.wrongAnswers = JSON.parse(record.wrongAnswersJson || '[]');
                    } catch (e) {
                        console.error('Error parsing wrongAnswersJson:', e);
                        record.wrongAnswers = [];
                    }
                    delete record.wrongAnswersJson; // 清理内部表示
                    
                    // 添加格式化的时间，用于UI显示
                    record.timeFormatted = this.formatTime(record.timeTaken);
                    
                    // 确保date字段存在，用于兼容性 - 使用数据库中的日期，而不是当前日期
                    record.date = record.date_iso;
                    
                    // 确保所有必要字段都有值，但不要覆盖已有的值
                    if (record.score === undefined || record.score === null) record.score = 0;
                    if (record.maxScore === undefined || record.maxScore === null) record.maxScore = record.totalQuestions * 5 || 100;
                    if (record.correctAnswers === undefined || record.correctAnswers === null) record.correctAnswers = 0;
                    if (record.totalQuestions === undefined || record.totalQuestions === null) record.totalQuestions = 20;
                    if (record.percentage === undefined || record.percentage === null) {
                        record.percentage = record.totalQuestions > 0 ? 
                            Math.round((record.correctAnswers / record.totalQuestions) * 100) : 0;
                    }
                    
                    return record;
                });
            }
            return [];
        } catch (error) {
            console.error('Failed to get recent records:', error);
            return [];
        }
    }

    // getRecordById
    async getRecordById(id) {
        if (!this.db) return undefined;
        try {
            const stmt = this.db.prepare("SELECT id, timestamp, date_iso, score, max_score AS maxScore, correct_answers AS correctAnswers, total_questions AS totalQuestions, time_taken_seconds AS timeTaken, percentage, wrong_answers_json AS wrongAnswersJson FROM test_records WHERE id = :id");
            const rowObject = stmt.getAsObject({ ':id': id });
            stmt.free();
            if (rowObject.id) { // Check if a record was found (getAsObject returns an object with id if found)
                rowObject.wrongAnswers = JSON.parse(rowObject.wrongAnswersJson || '[]');
                delete rowObject.wrongAnswersJson;
                rowObject.timeFormatted = this.formatTime(rowObject.timeTaken);
                rowObject.date = rowObject.date_iso;
                return rowObject;
            }
            return undefined;
        } catch (error) {
            console.error('Failed to get record by ID:', error);
            return undefined;
        }
    }

    // deleteTestRecord
    async deleteTestRecord(id) {
        if (!this.db) return false;
        try {
            const stmt = this.db.prepare("DELETE FROM test_records WHERE id = :id");
            stmt.run({ ':id': id });
            stmt.free();
            await this.saveDBState();
            console.log('Test record deleted from DB:', id);
            return true;
        } catch (error) {
            console.error('Failed to delete test record:', error);
            return false;
        }
    }

    // clearAllRecords
    async clearAllRecords() {
        if (!this.db) return false;
        try {
            this.db.exec("DELETE FROM test_records");
            await this.saveDBState();
            console.log('All test records cleared from DB.');
            return true;
        } catch (error) {
            console.error('Failed to clear all test records:', error);
            return false;
        }
    }

    // getTestRecordsStats - compatibility alias
    async getTestRecordsStats() {
        return this.getTestStats();
    }

    // getTestStats (rewritten to use data from getTestRecords which is now async and SQL-based)
    async getTestStats() {
        if (!this.db) return { totalTests: 0, averageScore: 0, bestScore: 0, averageTime: '00:00', averagePercentage: 0, bestPercentage: 0, bestTime: '00:00', totalCorrectAnswers: 0, totalQuestions: 0, overallAccuracy: 0, improvementTrend: 'none', recentRecords: [] }; 

        const records = await this.getTestRecords(); // This now fetches from SQL

        if (records.length === 0) {
            return {
                totalTests: 0, averageScore: 0, bestScore: 0, averageTime: '00:00',
                averagePercentage: 0, bestPercentage: 0, bestTime: '00:00',
                totalCorrectAnswers: 0, totalQuestions: 0, overallAccuracy: 0,
                improvementTrend: 'none', recentRecords: []
            };
        }

        const totalTests = records.length;
        // Ensure all calculations use numeric values, providing defaults if necessary
        const scores = records.map(r => r.score || 0);
        const percentages = records.map(r => r.percentage || 0);
        // timeTaken is already in seconds from the new saveTestRecord logic
        const timesInSeconds = records.map(r => r.timeTaken || 0); 
        const correctAnswersList = records.map(r => r.correctAnswers || 0);
        const totalQuestionsList = records.map(r => r.totalQuestions || 0);

        const sumScores = scores.reduce((a, b) => a + b, 0);
        const sumPercentages = percentages.reduce((a, b) => a + b, 0);
        const sumTimes = timesInSeconds.reduce((a, b) => a + b, 0);
        const sumCorrect = correctAnswersList.reduce((a, b) => a + b, 0);
        const sumTotalQs = totalQuestionsList.reduce((a, b) => a + b, 0);

        const averageScore = totalTests > 0 ? Math.round(sumScores / totalTests) : 0;
        const averagePercentage = totalTests > 0 ? Math.round(sumPercentages / totalTests) : 0;
        const averageTimeSeconds = totalTests > 0 ? Math.round(sumTimes / totalTests) : 0;

        const bestScore = Math.max(0, ...scores); // Ensure 0 if scores array is empty or all are negative (though scores should be positive)
        const bestPercentage = Math.max(0, ...percentages);
        // Filter out 0s for min calculation if 0 is not a valid time, or handle Infinity if all are 0
        const validTimes = timesInSeconds.filter(t => t > 0);
        const bestTimeSeconds = validTimes.length > 0 ? Math.min(...validTimes) : Infinity;

        let improvementTrend = 'none';
        if (totalTests >= 6) { // Trend calculation needs enough data points
            // Records are sorted newest first by getTestRecords
            const recent5Percentages = percentages.slice(0, 5);
            const previous5Percentages = percentages.slice(5, 10);
            if (recent5Percentages.length === 5 && previous5Percentages.length === 5) {
                const recentAvg = recent5Percentages.reduce((a, b) => a + b, 0) / 5;
                const previousAvg = previous5Percentages.reduce((a, b) => a + b, 0) / 5;
                if (recentAvg > previousAvg + 5) improvementTrend = 'improving';
                else if (recentAvg < previousAvg - 5) improvementTrend = 'declining';
                else improvementTrend = 'stable';
            }
        }

        return {
            totalTests,
            averageScore,
            averagePercentage,
            bestScore,
            bestPercentage,
            averageTime: this.formatTime(averageTimeSeconds), // formatTime should handle seconds
            bestTime: bestTimeSeconds === Infinity ? 'N/A' : this.formatTime(bestTimeSeconds),
            totalCorrectAnswers: sumCorrect,
            totalQuestions: sumTotalQs,
            overallAccuracy: sumTotalQs > 0 ? Math.round((sumCorrect / sumTotalQs) * 100) : 0,
            improvementTrend,
            recentRecords: records.slice(0, 5) // Still provide recent records if UI expects it
        };
    }

    // 获取错题统计
    getWrongAnswersStats() {
        const records = this.getTestRecords();
        const allWrongAnswers = [];
        
        records.forEach(record => {
            if (record.wrongAnswers && Array.isArray(record.wrongAnswers)) {
                allWrongAnswers.push(...record.wrongAnswers);
            }
        });

        // 统计错误频率
        const wordFrequency = {};
        const translationFrequency = {};
        
        allWrongAnswers.forEach(wrong => {
            const word = wrong.word?.toLowerCase();
            const translation = wrong.correctAnswer;
            
            if (word) {
                wordFrequency[word] = (wordFrequency[word] || 0) + 1;
            }
            if (translation) {
                translationFrequency[translation] = (translationFrequency[translation] || 0) + 1;
            }
        });

        // 获取最常错的单词（前10个）
        const mostWrongWords = Object.entries(wordFrequency)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([word, count]) => ({ word, count }));

        return {
            totalWrongAnswers: allWrongAnswers.length,
            uniqueWrongWords: Object.keys(wordFrequency).length,
            mostWrongWords,
            averageWrongPerTest: records.length > 0 ? 
                Math.round(allWrongAnswers.length / records.length * 10) / 10 : 0
        };
    }

    async saveSettings(settingsToSave) {
        if (!this.db) throw new Error('DB not initialized for saveSettings');
        try {
            const stmt = this.db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (:key, :value)");
            for (const key in settingsToSave) {
                if (Object.hasOwnProperty.call(settingsToSave, key)) {
                    stmt.run({ ':key': key, ':value': JSON.stringify(settingsToSave[key]) });
                }
            }
            stmt.free();
            await this.saveDBState();
            console.log('Settings saved to DB:', settingsToSave);
            // It's good practice to return the saved settings or the full, current settings state.
            // For simplicity, returning what was passed, assuming it's the complete desired state.
            return settingsToSave; 
        } catch (error) {
            console.error('Failed to save settings to DB:', error);
            throw error;
        }
    }

    async getSettings() {
        if (!this.db) {
            console.warn('DB not initialized for getSettings, returning default settings.');
            return this.getDefaultSettings(); // getDefaultSettings() is synchronous and provides the base structure
        }
        try {
            const results = this.db.exec("SELECT key, value FROM settings");
            const currentSettings = {};
            if (results.length > 0 && results[0].values) {
                results[0].values.forEach(row => {
                    // row[0] is key, row[1] is value
                    currentSettings[row[0]] = JSON.parse(row[1]);
                });
            }
            // Merge with defaults to ensure all settings are present and have a fallback
            return { ...this.getDefaultSettings(), ...currentSettings };
        } catch (error) {
            console.error('Failed to get settings from DB:', error);
            return this.getDefaultSettings(); // Fallback to defaults in case of error
        }
    }
    // getDefaultSettings() remains the same (synchronous, as it defines the structure)

    // 获取默认设置
    getDefaultSettings() {
        return {
            questionsPerTest: 20,
            showHints: true,
            autoNextQuestion: false,
            soundEnabled: true,
            theme: 'cute',
            difficulty: 'normal',
            playBGM: true,           // 新增：是否播放背景音乐
            playSoundEffects: true   // 新增：是否播放音效
        };
    }

    // 导出数据
    exportData() {
        try {
            const data = {
                records: this.getTestRecords(),
                settings: this.getSettings(),
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `word-quiz-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('数据导出成功');
            return true;
        } catch (error) {
            console.error('导出数据失败:', error);
            return false;
        }
    }

    // 导入数据
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // 验证数据格式
                    if (!data.records || !Array.isArray(data.records)) {
                        throw new Error('无效的数据格式');
                    }
                    
                    // 备份当前数据
                    const backup = {
                        records: this.getTestRecords(),
                        settings: this.getSettings()
                    };
                    
                    // 导入记录
                    if (data.records.length > 0) {
                        localStorage.setItem(this.storageKey, JSON.stringify(data.records));
                    }
                    
                    // 导入设置
                    if (data.settings) {
                        localStorage.setItem(this.settingsKey, JSON.stringify(data.settings));
                    }
                    
                    console.log('数据导入成功');
                    resolve({ imported: data.records.length, backup });
                } catch (error) {
                    console.error('导入数据失败:', error);
                    reject(new Error('导入失败: ' + error.message));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('文件读取失败'));
            };
            
            reader.readAsText(file);
        });
    }

    // 生成唯一ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // ==================== Data Migration (Phase 3) ====================
    async migrateFromLocalStorageToSQL(forceMigration = false) {
        if (!this.db) {
            console.error("DB not initialized, cannot migrate.");
            return;
        }

        const migrationStatusKey = 'sqlMigrationCompleted_v1'; // Use a versioned key
        const migrationCompleted = localStorage.getItem(migrationStatusKey);

        if (migrationCompleted === 'true' && !forceMigration) {
            console.log('Data migration already completed. Skipping.');
            return;
        }

        console.log('Starting data migration from localStorage to SQL...');
        let migrationSuccess = true;

        try {
            // 1. Migrate Settings
            const legacySettingsRaw = localStorage.getItem(this.legacySettingsKey);
            if (legacySettingsRaw) {
                const legacySettings = JSON.parse(legacySettingsRaw);
                // Check if settings table is empty or if we should overwrite
                const settingsCountResult = this.db.exec("SELECT COUNT(*) FROM settings");
                const settingsCount = settingsCountResult[0].values[0][0];
                if (settingsCount === 0 || forceMigration) {
                    console.log('Migrating settings...');
                    const stmt = this.db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (:key, :value)");
                    for (const key in legacySettings) {
                        if (Object.hasOwnProperty.call(legacySettings, key)) {
                            stmt.run({ ':key': key, ':value': JSON.stringify(legacySettings[key]) });
                        }
                    }
                    stmt.free();
                } else {
                    console.log('Settings table not empty, skipping settings migration unless forced.');
                }
            }

            // 2. Migrate Test Records
            const legacyRecordsRaw = localStorage.getItem(this.legacyStorageKey);
            if (legacyRecordsRaw) {
                const legacyRecords = JSON.parse(legacyRecordsRaw);
                const recordsCountResult = this.db.exec("SELECT COUNT(*) FROM test_records");
                const recordsCount = recordsCountResult[0].values[0][0];
                if ((recordsCount === 0 || forceMigration) && legacyRecords.length > 0) {
                    console.log(`Migrating ${legacyRecords.length} test records...`);
                    const stmt = this.db.prepare(`
                        INSERT OR IGNORE INTO test_records 
                        (id, timestamp, date_iso, score, max_score, correct_answers, total_questions, time_taken_seconds, percentage, wrong_answers_json)
                        VALUES (:id, :timestamp, :date_iso, :score, :max_score, :correct_answers, :total_questions, :time_taken_seconds, :percentage, :wrong_answers_json)
                    `);
                    for (const record of legacyRecords) {
                        stmt.run({
                            ':id': record.id || this.generateId(),
                            ':timestamp': record.timestamp || Date.now(),
                            ':date_iso': record.date || new Date(record.timestamp || Date.now()).toISOString(),
                            ':score': record.score || 0,
                            ':max_score': record.maxScore || record.totalQuestions || 0, // Guess maxScore if not present
                            ':correct_answers': record.correctAnswers || 0,
                            ':total_questions': record.totalQuestions || 0,
                            ':time_taken_seconds': this.parseTimeToSeconds(record.timeTaken || '00:00'), // Convert formatted time to seconds
                            ':percentage': record.percentage || 0,
                            ':wrong_answers_json': JSON.stringify(record.wrongAnswers || [])
                        });
                    }
                    stmt.free();
                } else {
                    console.log('Test records table not empty or no legacy records, skipping migration unless forced.');
                }
            }

            // 3. Migrate Wrong Questions Pool
            const legacyWrongQuestionsRaw = localStorage.getItem(this.legacyWrongQuestionsKey);
            if (legacyWrongQuestionsRaw) {
                const legacyWrongQuestions = JSON.parse(legacyWrongQuestionsRaw);
                const wrongQCountResult = this.db.exec("SELECT COUNT(*) FROM wrong_questions_pool");
                const wrongQCount = wrongQCountResult[0].values[0][0];
                if ((wrongQCount === 0 || forceMigration) && legacyWrongQuestions.length > 0) {
                    console.log(`Migrating ${legacyWrongQuestions.length} wrong questions...`);
                    const stmt = this.db.prepare(`
                        INSERT OR IGNORE INTO wrong_questions_pool 
                        (word, correct_answer, user_answer, sentence, notes, timestamp, error_count)
                        VALUES (:word, :correct_answer, :user_answer, :sentence, :notes, :timestamp, :error_count)
                    `);
                    for (const wq of legacyWrongQuestions) {
                        stmt.run({
                            ':word': wq.word,
                            ':correct_answer': wq.correctAnswer || wq.correct_answer || '', // Handle potential naming variations
                            ':user_answer': wq.userAnswer || wq.user_answer || wq.last_user_answer || '',
                            ':sentence': wq.sentence || '',
                            ':notes': wq.notes || '',
                            ':timestamp': wq.timestamp || wq.last_error_timestamp || Date.now(),
                            ':error_count': wq.errorCount || wq.error_count || 1
                        });
                    }
                    stmt.free();
                } else {
                    console.log('Wrong questions table not empty or no legacy questions, skipping migration unless forced.');
                }
            }

            await this.saveDBState(); // Save DB after migration
            localStorage.setItem(migrationStatusKey, 'true');
            console.log('Data migration completed successfully.');

            // Optional: Clear old localStorage data after successful migration
            // Consider adding a delay or user confirmation before this step
            // localStorage.removeItem(this.legacyStorageKey);
            // localStorage.removeItem(this.legacySettingsKey);
            // localStorage.removeItem(this.legacyWrongQuestionsKey);
            // console.log('Legacy localStorage data cleared.');

        } catch (error) {
            console.error('Data migration failed:', error);
            migrationSuccess = false;
            // Potentially mark migration as failed or incomplete if needed
            // localStorage.setItem(migrationStatusKey, 'failed');
        }
        return migrationSuccess;
    }

    // 解析时间字符串为秒数
    parseTimeToSeconds(timeString) {
        if (!timeString || typeof timeString !== 'string') {
            return 0;
        }
        
        const parts = timeString.split(':');
        if (parts.length === 2) {
            const minutes = parseInt(parts[0]) || 0;
            const seconds = parseInt(parts[1]) || 0;
            return minutes * 60 + seconds;
        }
        
        return 0;
    }

    // 格式化时间显示
    formatTime(seconds) {
        if (!seconds || seconds < 0) {
            return '00:00';
        }
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // 检查存储空间
    checkStorageSpace() {
        try {
            const used = new Blob(Object.values(localStorage)).size;
            const quota = 5 * 1024 * 1024; // 假设5MB限制
            
            return {
                used: used,
                quota: quota,
                percentage: Math.round((used / quota) * 100),
                available: quota - used
            };
        } catch (error) {
            console.error('检查存储空间失败:', error);
            return null;
        }
    }

    // 清理旧数据
    cleanupOldData(daysToKeep = 30) {
        try {
            const records = this.getTestRecords();
            const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
            
            const filteredRecords = records.filter(record => {
                const recordTime = record.timestamp || 0;
                return recordTime > cutoffTime;
            });
            
            localStorage.setItem(this.storageKey, JSON.stringify(filteredRecords));
            
            const removedCount = records.length - filteredRecords.length;
            console.log(`清理完成，删除了 ${removedCount} 条旧记录`);
            
            return removedCount;
        } catch (error) {
            console.error('清理旧数据失败:', error);
            return 0;
        }
    }

    // ==================== 错题池管理方法 ====================
    
    // addWrongQuestion (Phase 2: SQL based)
    async addWrongQuestion(question) {
        if (!this.db) throw new Error('DB not initialized for addWrongQuestion');
        try {
            // Check if the word already exists
            const stmtSelect = this.db.prepare("SELECT error_count FROM wrong_questions_pool WHERE word = :word");
            const existing = stmtSelect.getAsObject({ ':word': question.word });
            stmtSelect.free();

            if (existing.error_count !== undefined) { // Word exists, update it
                const stmtUpdate = this.db.prepare(`
                    UPDATE wrong_questions_pool 
                    SET user_answer = :user_answer, timestamp = :timestamp, error_count = :error_count, sentence = :sentence, notes = :notes
                    WHERE word = :word
                `);
                stmtUpdate.run({
                    ':word': question.word,
                    ':user_answer': question.user_answer,
                    ':timestamp': Date.now(),
                    ':error_count': (existing.error_count || 0) + 1,
                    ':sentence': question.sentence || null, // Ensure sentence is handled
                    ':notes': question.notes || null // Ensure notes are handled
                });
                stmtUpdate.free();
            } else { // New wrong question, insert it
                const stmtInsert = this.db.prepare(`
                    INSERT INTO wrong_questions_pool (word, correct_answer, user_answer, sentence, notes, timestamp, error_count)
                    VALUES (:word, :correct_answer, :user_answer, :sentence, :notes, :timestamp, 1)
                `);
                stmtInsert.run({
                    ':word': question.word,
                    ':correct_answer': question.correct_answer,
                    ':user_answer': question.user_answer,
                    ':sentence': question.sentence || null,
                    ':notes': question.notes || null,
                    ':timestamp': Date.now()
                });
                stmtInsert.free();
            }
            
            // Optional: Pruning old/least frequent wrong questions can be done here or as a separate task
            // Example: Prune to keep only the latest N wrong questions (e.g., this.legacyMaxWrongQuestions)
            // const countResult = this.db.exec("SELECT COUNT(*) FROM wrong_questions_pool");
            // const currentCount = countResult[0].values[0][0];
            // if (currentCount > this.legacyMaxWrongQuestions) {
            //     this.db.exec(`DELETE FROM wrong_questions_pool WHERE word IN (SELECT word FROM wrong_questions_pool ORDER BY timestamp ASC LIMIT ${currentCount - this.legacyMaxWrongQuestions})`);
            // }

            await this.saveDBState();
            console.log('Wrong question added/updated in DB:', question.word);
            // Returning all wrong questions might be too much; consider if this is needed by the caller
            // For now, let's assume the caller might want the updated list, similar to localStorage version
            return this.getWrongQuestions(); 
        } catch (error) {
            console.error('Failed to add/update wrong question in DB:', error);
            throw error;
        }
    }

    // getWrongQuestions (Phase 2: SQL based)
    async getWrongQuestions() {
        if (!this.db) return [];
        try {
            // Order by error_count desc, then by timestamp desc for tie-breaking
            const results = this.db.exec("SELECT word, correct_answer AS correctAnswer, user_answer AS userAnswer, sentence, notes, timestamp, error_count AS errorCount FROM wrong_questions_pool ORDER BY error_count DESC, timestamp DESC");
            if (results.length > 0 && results[0].values) {
                return results[0].values.map(row => {
                    const question = {};
                    results[0].columns.forEach((col, i) => question[col] = row[i]);
                    return question;
                });
            }
            return [];
        } catch (error) {
            console.error('Failed to get wrong questions from DB:', error);
            return [];
        }
    }

    // removeWrongQuestion (Phase 2: SQL based)
    async removeWrongQuestion(word) {
        if (!this.db) return false;
        try {
            const stmt = this.db.prepare("DELETE FROM wrong_questions_pool WHERE word = :word");
            stmt.run({ ':word': word });
            stmt.free();
            await this.saveDBState();
            console.log('Wrong question removed from DB:', word);
            return true;
        } catch (error) {
            console.error('Failed to remove wrong question from DB:', error);
            return false;
        }
    }

    // clearAllWrongQuestions (Phase 2: SQL based)
    async clearAllWrongQuestions() {
        if (!this.db) return false;
        try {
            this.db.exec("DELETE FROM wrong_questions_pool");
            await this.saveDBState();
            console.log('All wrong questions cleared from DB.');
            return true;
        } catch (error) {
            console.error('Failed to clear all wrong questions from DB:', error);
            return false;
        }
    }

    // getWrongQuestionStats (Phase 2: SQL based)
    async getWrongQuestionStats() {
        if (!this.db) return { totalWrong: 0, mostFrequent: null, leastFrequent: null, averageErrorCount: 0 };

        const wrongQuestions = await this.getWrongQuestions(); // Fetches sorted by error_count desc
        const totalWrong = wrongQuestions.length;

        if (totalWrong === 0) {
            return {
                totalWrong: 0,
                mostFrequent: null,
                leastFrequent: null,
                averageErrorCount: 0
            };
        }

        // wrongQuestions is already sorted by error_count DESC, then timestamp DESC
        const mostFrequentQuestion = wrongQuestions[0];
        // For least frequent, we need to find one with the minimum error_count.
        // If multiple have the same min error_count, the one with the oldest timestamp (smallest timestamp) among them.
        // A simple way if already sorted by error_count DESC is to take the last one, but it might not be the *absolute* least if error_counts are tied and timestamps vary.
        // However, for simplicity and given the primary sort, taking the last element is a common approach.
        const leastFrequentQuestion = wrongQuestions[totalWrong - 1]; 

        const sumErrorCounts = wrongQuestions.reduce((sum, q) => sum + (q.errorCount || 0), 0);
        const averageErrorCount = totalWrong > 0 ? Math.round(sumErrorCounts / totalWrong) : 0;

        return {
            totalWrong,
            mostFrequent: mostFrequentQuestion ? { word: mostFrequentQuestion.word, count: mostFrequentQuestion.errorCount } : null,
            leastFrequent: leastFrequentQuestion ? { word: leastFrequentQuestion.word, count: leastFrequentQuestion.errorCount } : null,
            averageErrorCount
        };
    }

    // getWrongQuestionsForQuiz (Phase 3: SQL based, with configurable strategy)
    async getWrongQuestionsForQuiz(count = 20, strategy = 'default') {
        if (!this.db) return [];
        try {
            let query = "SELECT word, correct_answer AS correctAnswer, user_answer AS userAnswer, sentence, notes, timestamp, error_count AS errorCount FROM wrong_questions_pool";

            // Strategy can determine ordering and filtering
            // 'default': Prioritize by error_count DESC, then by recency (timestamp DESC)
            // 'random': Random selection (could be useful for variety)
            // 'oldest_errors': Prioritize questions not reviewed recently (timestamp ASC)
            // 'least_frequent_errors': Prioritize questions with fewer error_count (error_count ASC)

            switch (strategy) {
                case 'random':
                    query += " ORDER BY RANDOM()";
                    break;
                case 'oldest_errors':
                    query += " ORDER BY timestamp ASC, error_count DESC";
                    break;
                case 'least_frequent_errors':
                    query += " ORDER BY error_count ASC, timestamp DESC";
                    break;
                case 'default':
                default:
                    query += " ORDER BY error_count DESC, timestamp DESC";
                    break;
            }
            query += ` LIMIT ${count}`;

            const results = this.db.exec(query);
            if (results.length > 0 && results[0].values) {
                return results[0].values.map(row => {
                    const question = {};
                    results[0].columns.forEach((col, i) => question[col] = row[i]);
                    return question;
                });
            }
            return [];
        } catch (error) {
            console.error('Failed to get wrong questions for quiz from DB:', error);
            return [];
        }
    }

    // 添加一个方法来导出数据库为文件
    async exportDatabase() {
        if (!this.db) {
            throw new Error('数据库未初始化，无法导出');
        }
        
        try {
            // 导出数据库为二进制数据
            const dbBinary = this.db.export();
            
            // 创建Blob对象
            const blob = new Blob([dbBinary], { type: 'application/octet-stream' });
            
            // 创建下载链接
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'wordquiz_database.sqlite';
            
            // 触发下载
            document.body.appendChild(a);
            a.click();
            
            // 清理
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            return true;
        } catch (error) {
            console.error('导出数据库失败:', error);
            throw error;
        }
    }
    
    // 添加一个方法来导入数据库文件
    async importDatabase(file) {
        if (!file) {
            throw new Error('未提供文件');
        }
        
        try {
            // 读取文件内容
            const arrayBuffer = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(reader.error);
                reader.readAsArrayBuffer(file);
            });
            
            // 转换为Uint8Array
            const dbBinary = new Uint8Array(arrayBuffer);
            
            // 加载数据库
            if (!this.sqlJS) {
                this.sqlJS = await initSqlJs(this.sqlJSConfig);
            }
            
            // 创建新的数据库实例
            this.db = new this.sqlJS.Database(dbBinary);
            
            // 保存到localforage
            await this.saveDBState();
            
            return true;
        } catch (error) {
            console.error('导入数据库失败:', error);
            throw error;
        }
    }
}

// 导出存储管理器实例
const storageManager = new StorageManager();

// 如果在Node.js环境中
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StorageManager, storageManager };
}