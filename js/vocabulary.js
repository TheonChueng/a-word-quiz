// 词汇管理模块
class VocabularyManager {
    constructor() {
        this.vocabulary = [];
        this.isLoaded = false;
    }

    // 从CSV文件加载词汇并保存到StorageManager
    async loadFromFile(file) {
        return new Promise(async (resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const csvText = e.target.result;
                    this.parseCSV(csvText); // parseCSV会填充 this.vocabulary
                    // 根据用户反馈，词汇表不再保存到数据库
                    // if (this.vocabulary.length > 0) {
                    //     await storageManager.saveVocabulary(this.vocabulary); // 保存到数据库
                    //     console.log(`从文件加载并已保存到数据库 ${this.vocabulary.length} 个单词`);
                    // }
                    console.log(`从文件加载了 ${this.vocabulary.length} 个单词`);
                    this.isLoaded = true;
                    resolve(this.vocabulary);
                } catch (error) {
                    console.error('CSV文件处理或保存数据库失败:', error);
                    reject(new Error('CSV文件处理或保存数据库失败: ' + error.message));
                }
            };
            
            reader.onerror = () => {
                console.error('文件读取失败');
                reject(new Error('文件读取失败'));
            };
            
            reader.readAsText(file, 'UTF-8');
        });
    }

    // 从默认位置加载词汇（优先从StorageManager，其次从CSV）
    async loadFromDefault() {
        try {
            // 根据用户反馈，词汇表不再从数据库加载，始终从CSV文件加载
            // // 尝试从StorageManager加载词汇
            // const storedVocabulary = await storageManager.getVocabulary();
            // if (storedVocabulary && storedVocabulary.length > 0) {
            //     this.vocabulary = storedVocabulary;
            //     this.isLoaded = true;
            //     console.log(`从数据库成功加载 ${this.vocabulary.length} 个单词`);
            //     return this.vocabulary;
            // }

            // // 如果StorageManager中没有，则从默认CSV文件加载
            // console.log('数据库中无词汇，尝试从默认CSV文件加载...');
            console.log('尝试从默认CSV文件加载词汇...');
            const response = await fetch('./Vocabulary_List.csv');
            if (!response.ok) {
                throw new Error('默认词汇文件 Vocabulary_List.csv 未找到');
            }
            const csvText = await response.text();
            this.parseCSV(csvText); // parseCSV会填充 this.vocabulary
            
            // 根据用户反馈，词汇表不再保存到数据库
            // // 将从CSV加载的词汇保存到StorageManager
            // if (this.vocabulary.length > 0) {
            //     await storageManager.saveVocabulary(this.vocabulary);
            //     console.log(`从CSV加载并已保存到数据库 ${this.vocabulary.length} 个单词`);
            // }
            console.log(`从默认CSV文件加载了 ${this.vocabulary.length} 个单词`);
            this.isLoaded = true;
            return this.vocabulary;
        } catch (error) {
            console.error('加载默认词汇失败:', error);
            this.isLoaded = false; // 确保加载失败时状态正确
            // 不向上抛出错误，允许应用在无词汇情况下启动，UI层应处理此情况
            // throw new Error('无法加载默认词汇文件: ' + error.message);
            return []; // 返回空数组表示加载失败
        }
    }

    // 解析CSV文本
    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        
        if (lines.length < 2) {
            throw new Error('CSV文件格式错误：至少需要标题行和一行数据');
        }

        // 跳过标题行
        const dataLines = lines.slice(1);
        this.vocabulary = [];

        for (let i = 0; i < dataLines.length; i++) {
            const line = dataLines[i].trim();
            if (!line) continue; // 跳过空行

            try {
                const parsed = this.parseCSVLine(line);
                if (parsed.word && parsed.translation) {
                    this.vocabulary.push({
                        word: parsed.word.trim(),
                        translation: parsed.translation.trim(),
                        sentence: parsed.sentence ? parsed.sentence.trim() : '',
                        notes: parsed.notes ? parsed.notes.trim() : ''
                    });
                }
            } catch (error) {
                console.warn(`第${i + 2}行解析失败:`, error.message);
            }
        }

        if (this.vocabulary.length === 0) {
            throw new Error('没有找到有效的词汇数据');
        }

        console.log(`成功加载 ${this.vocabulary.length} 个单词`);
    }

    // 解析CSV行（处理引号包围的字段）
    parseCSVLine(line) {
        const fields = [];
        let current = '';
        let inQuotes = false;
        let i = 0;

        while (i < line.length) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
                    // 转义的引号
                    current += '"';
                    i += 2;
                } else {
                    // 切换引号状态
                    inQuotes = !inQuotes;
                    i++;
                }
            } else if (char === ',' && !inQuotes) {
                // 字段分隔符
                fields.push(current);
                current = '';
                i++;
            } else {
                current += char;
                i++;
            }
        }
        
        // 添加最后一个字段
        fields.push(current);

        // 确保至少有4个字段
        while (fields.length < 4) {
            fields.push('');
        }

        return {
            word: fields[0],
            translation: fields[1],
            sentence: fields[2],
            notes: fields[3]
        };
    }

    // 获取可用单词（排除已使用的）
    getAvailableWords(usedWords = new Set()) {
        if (!this.isLoaded || this.vocabulary.length === 0) {
            throw new Error('词汇库未加载或为空');
        }
        
        return this.vocabulary.filter(word => !usedWords.has(word.word));
    }

    // 获取随机单词
    getRandomWord() {
        if (!this.isLoaded || this.vocabulary.length === 0) {
            throw new Error('词汇库未加载或为空');
        }
        
        const randomIndex = Math.floor(Math.random() * this.vocabulary.length);
        return this.vocabulary[randomIndex];
    }

    // 获取随机干扰项（排除指定的正确答案）
    getRandomDistractors(correctTranslation, count = 2) {
        if (!this.isLoaded || this.vocabulary.length < count + 1) {
            throw new Error('词汇库单词数量不足以生成干扰项');
        }

        const distractors = [];
        const availableWords = this.vocabulary.filter(word => 
            word.translation !== correctTranslation
        );

        if (availableWords.length < count) {
            throw new Error('可用的干扰项不足');
        }

        while (distractors.length < count) {
            const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
            
            // 确保不重复
            if (!distractors.includes(randomWord.translation)) {
                distractors.push(randomWord.translation);
            }
        }

        return distractors;
    }

    // 生成测试题目
    generateQuestion() {
        const currentWord = this.getRandomWord();
        const distractors = this.getRandomDistractors(currentWord.translation, 2);
        
        // 创建选项数组并随机排序
        const options = [currentWord.translation, ...distractors];
        this.shuffleArray(options);
        
        return {
            word: currentWord.word,
            correctAnswer: currentWord.translation,
            options: options,
            sentence: currentWord.sentence,
            notes: currentWord.notes,
            correctIndex: options.indexOf(currentWord.translation)
        };
    }

    // 数组随机排序
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // 获取词汇统计信息
    getStats() {
        return {
            totalWords: this.vocabulary.length,
            wordsWithSentences: this.vocabulary.filter(w => w.sentence).length,
            wordsWithNotes: this.vocabulary.filter(w => w.notes).length,
            isLoaded: this.isLoaded
        };
    }

    // 搜索单词
    searchWord(query) {
        if (!this.isLoaded) {
            return [];
        }
        
        const lowerQuery = query.toLowerCase();
        return this.vocabulary.filter(word => 
            word.word.toLowerCase().includes(lowerQuery) ||
            word.translation.toLowerCase().includes(lowerQuery)
        );
    }

    // 获取单词详情
    getWordDetails(word) {
        return this.vocabulary.find(w => 
            w.word.toLowerCase() === word.toLowerCase()
        );
    }

    // 验证CSV格式
    static validateCSVFormat(csvText) {
        const lines = csvText.trim().split('\n');
        
        if (lines.length < 2) {
            return {
                valid: false,
                error: 'CSV文件至少需要包含标题行和一行数据'
            };
        }

        // 检查标题行
        const header = lines[0].toLowerCase();
        const requiredFields = ['生词', '翻译'];
        const hasRequiredFields = requiredFields.every(field => 
            header.includes(field.toLowerCase()) || 
            header.includes(field) ||
            header.includes('word') ||
            header.includes('translation')
        );

        if (!hasRequiredFields) {
            return {
                valid: false,
                error: '标题行必须包含"生词"和"翻译"字段（或对应的英文字段）'
            };
        }

        // 检查数据行
        let validDataLines = 0;
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                const fields = line.split(',');
                if (fields.length >= 2 && fields[0].trim() && fields[1].trim()) {
                    validDataLines++;
                }
            }
        }

        if (validDataLines === 0) {
            return {
                valid: false,
                error: '没有找到有效的数据行'
            };
        }

        return {
            valid: true,
            dataLines: validDataLines
        };
    }
}

// 导出词汇管理器实例
const vocabularyManager = new VocabularyManager();

// 如果在Node.js环境中
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VocabularyManager, vocabularyManager };
}