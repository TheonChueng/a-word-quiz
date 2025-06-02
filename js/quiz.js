// 测试逻辑模块
class QuizManager {
    constructor() {
        this.currentQuestion = null;
        this.currentQuestionIndex = 0;
        this.totalQuestions = 20;
        this.score = 0;
        this.correctAnswers = 0;
        this.wrongAnswers = [];
        this.startTime = null;
        this.endTime = null;
        this.timer = null;
        this.isActive = false;
        this.timeElapsed = 0;
        this.usedWords = new Set(); // 记录已使用的单词
        this.isReviewMode = false; // 是否为错题回顾模式
        this.reviewQuestions = []; // 错题回顾题库
    }

    // 开始测试
    async startQuiz(totalQuestions = null, mode = 'normal', wrongQuestions = null) {
        // 先重置状态
        this.reset();
        
        // 处理参数兼容性
        let isReviewMode = false;
        if (typeof totalQuestions === 'boolean') {
            // 旧的调用方式：startQuiz(isReviewMode)
            isReviewMode = totalQuestions;
            totalQuestions = this.totalQuestions;
        } else if (mode === 'review' || wrongQuestions) {
            // 新的调用方式：startQuiz(totalQuestions, 'review', wrongQuestions)
            isReviewMode = true;
            if (totalQuestions) {
                this.totalQuestions = totalQuestions;
            }
        }
        
        if (isReviewMode) {
            // 错题回顾模式
            this.isReviewMode = true;
            
            if (wrongQuestions && wrongQuestions.length > 0) {
                // 使用传入的错题数据
                this.reviewQuestions = wrongQuestions;
            } else {
                // 从存储中获取错题数据
                this.reviewQuestions = await storageManager.getWrongQuestionsForQuiz(this.totalQuestions);
            }
            
            if (this.reviewQuestions.length === 0) {
                throw new Error('错题池为空，无法开始错题回顾测试');
            }
            
            // 如果错题数量少于设定的题目数量，调整题目数量
            if (this.reviewQuestions.length < this.totalQuestions) {
                this.totalQuestions = this.reviewQuestions.length;
            }
            
            console.log(`错题回顾模式开始！共${this.totalQuestions}道错题`);
        } else {
            // 正常测试模式
            this.isReviewMode = false;
            this.reviewQuestions = [];
            
            if (totalQuestions) {
                this.totalQuestions = totalQuestions;
            }
            
            if (!vocabularyManager.isLoaded) {
                throw new Error('词汇库未加载，无法开始测试');
            }
            console.log('正常测试开始！');
        }

        this.isActive = true;
        this.startTime = new Date();
        this.startTimer();
        this.generateNextQuestion();
    }

    // 重置测试状态
    reset() {
        this.currentQuestion = null;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.wrongAnswers = [];
        this.startTime = null;
        this.endTime = null;
        this.timeElapsed = 0;
        this.isActive = false;
        this.usedWords.clear(); // 清空已使用的单词
        this.stopTimer();
        
        // 重置错题回顾相关状态
        // 注意：这些会在startQuiz中被重新设置，所以这里重置是安全的
        this.isReviewMode = false;
        this.reviewQuestions = [];
    }

    // 生成下一题
    generateNextQuestion() {
        if (this.currentQuestionIndex >= this.totalQuestions) {
            this.endQuiz();
            return null;
        }

        try {
            let correctWord;
            
            if (this.isReviewMode) {
                // 错题回顾模式：从错题池选择题目
                if (this.currentQuestionIndex >= this.reviewQuestions.length) {
                    this.endQuiz();
                    return null;
                }
                
                const wrongQuestion = this.reviewQuestions[this.currentQuestionIndex];
                correctWord = {
                    word: wrongQuestion.word,
                    translation: wrongQuestion.correctAnswer,
                    sentence: wrongQuestion.sentence,
                    notes: wrongQuestion.notes
                };
                
                console.log(`错题回顾第${this.currentQuestionIndex + 1}题:`, correctWord.word);
            } else {
                // 正常测试模式：从词汇库选择题目
                const availableWords = vocabularyManager.getAvailableWords(this.usedWords);
                
                if (availableWords.length === 0) {
                    throw new Error('没有足够的单词生成题目');
                }

                // 随机选择一个单词作为正确答案
                const correctWordIndex = Math.floor(Math.random() * availableWords.length);
                correctWord = availableWords[correctWordIndex];
                
                // 记录已使用的单词
                this.usedWords.add(correctWord.word);
                
                console.log(`第${this.currentQuestionIndex + 1}题:`, correctWord.word);
            }
            
            // 生成干扰选项
            const distractors = vocabularyManager.getRandomDistractors(correctWord.translation, 2);
            
            // 创建选项数组并随机排序
            const options = [correctWord.translation, ...distractors];
            vocabularyManager.shuffleArray(options);
            
            // 创建题目对象
            this.currentQuestion = {
                word: correctWord.word,
                correctAnswer: correctWord.translation,
                options: options,
                sentence: correctWord.sentence || '',
                notes: correctWord.notes || ''
            };
            
            this.currentQuestionIndex++;
            
            return this.currentQuestion;
        } catch (error) {
            console.error('生成题目失败:', error);
            throw error;
        }
    }

    // 提交答案
    async submitAnswer(selectedOption) {
        if (!this.isActive || !this.currentQuestion) {
            throw new Error('测试未激活或没有当前题目');
        }

        const isCorrect = selectedOption === this.currentQuestion.correctAnswer;
        
        if (isCorrect) {
            this.correctAnswers++;
            this.score += 5; // 每题5分
            
            // 如果是错题回顾模式且答对了，可以考虑从错题池中移除该题（可选）
            if (this.isReviewMode) {
                // 暂时不自动移除，让用户决定是否要继续练习
                // await storageManager.removeWrongQuestion(this.currentQuestion.word);
            }
        } else {
            // 记录错题到当次测试
            const wrongAnswer = {
                word: this.currentQuestion.word,
                correctAnswer: this.currentQuestion.correctAnswer,
                userAnswer: selectedOption,
                sentence: this.currentQuestion.sentence,
                notes: this.currentQuestion.notes
            };
            
            this.wrongAnswers.push(wrongAnswer);
            
            // 自动保存错题到错题池（无论是正常测试还是错题回顾）
            try {
                await storageManager.addWrongQuestion({
                    word: wrongAnswer.word,
                    user_answer: wrongAnswer.userAnswer,
                    correct_answer: wrongAnswer.correctAnswer,
                    sentence: wrongAnswer.sentence,
                    notes: wrongAnswer.notes
                });
            } catch (error) {
                console.error('保存错题到错题池失败:', error);
            }
        }

        const result = {
            isCorrect: isCorrect,
            correctAnswer: this.currentQuestion.correctAnswer,
            userAnswer: selectedOption,
            word: this.currentQuestion.word,
            sentence: this.currentQuestion.sentence,
            notes: this.currentQuestion.notes,
            currentScore: this.score,
            questionNumber: this.currentQuestionIndex, // currentQuestionIndex已经在generateNextQuestion中递增了
            totalQuestions: this.totalQuestions
        };

        console.log(`答题结果:`, result);
        return result;
    }

    // 获取提示
    getHint() {
        if (!this.currentQuestion) {
            return null;
        }

        const word = this.currentQuestion.word;
        const hints = [];

        // 提示1: 首字母
        hints.push(`首字母: ${word.charAt(0).toUpperCase()}`);
        
        // 提示2: 单词长度
        hints.push(`单词长度: ${word.length} 个字母`);
        
        // 提示3: 如果有例句，提供例句
        if (this.currentQuestion.sentence) {
            hints.push(`例句: ${this.currentQuestion.sentence}`);
        }
        
        // 提示4: 如果有笔记，提供笔记
        if (this.currentQuestion.notes) {
            hints.push(`提示: ${this.currentQuestion.notes}`);
        }

        return hints;
    }

    // 结束测试
    async endQuiz() {
        this.isActive = false;
        this.endTime = new Date(); // 设置结束时间
        this.stopTimer();
        
        // 播放测试完成音效
        const soundElement = document.getElementById('sound-complete');
        if (soundElement) {
            const settings = await storageManager.getSettings();
            if (settings && settings.playSoundEffects) {
                soundElement.currentTime = 0;
                soundElement.play().catch(error => console.warn('测试完成音效播放失败:', error));
            }
        }
        
        // 保存测试记录（只保存正常测试，不保存错题回顾）
        if (!this.isReviewMode) {
            const timeTaken = this.endTime ? 
                Math.floor((this.endTime - this.startTime) / 1000) : 
                this.timeElapsed;
            
            const record = {
                date: new Date().toISOString(),
                score: this.score,
                maxScore: this.totalQuestions * 5,
                correctAnswers: this.correctAnswers,
                totalQuestions: this.totalQuestions,
                timeTaken: timeTaken,
                timeFormatted: this.formatTime(timeTaken),
                percentage: Math.round((this.correctAnswers / this.totalQuestions) * 100),
                wrongAnswers: this.wrongAnswers.map(wa => ({ // 确保wrongAnswers符合数据库结构
                    word: wa.word,
                    userAnswer: wa.userAnswer,
                    correctAnswer: wa.correctAnswer,
                    sentence: wa.sentence,
                    notes: wa.notes
                }))
            };
            await storageManager.saveTestRecord(record);
        }
        
        return this.getQuizResult();
    }

    // 获取测试结果
    getQuizResult() {
        const timeTaken = this.endTime ? 
            Math.floor((this.endTime - this.startTime) / 1000) : 
            this.timeElapsed;
        
        return {
            score: this.score,
            maxScore: this.totalQuestions * 5,
            correctAnswers: this.correctAnswers,
            totalQuestions: this.totalQuestions,
            wrongAnswers: this.wrongAnswers,
            timeTaken: timeTaken,
            timeFormatted: this.formatTime(timeTaken),
            percentage: Math.round((this.correctAnswers / this.totalQuestions) * 100),
            date: new Date().toISOString(),
            isReviewMode: this.isReviewMode, // 标识是否为错题回顾模式
            testType: this.isReviewMode ? '错题回顾' : '正常测试' // 测试类型描述
        };
    }

    // 开始计时器
    startTimer() {
        this.stopTimer(); // 确保没有重复的计时器
        
        this.timer = setInterval(() => {
            if (this.startTime) {
                this.timeElapsed = Math.floor((new Date() - this.startTime) / 1000);
                
                // 触发计时器更新事件
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('quizTimerUpdate', {
                        detail: {
                            timeElapsed: this.timeElapsed,
                            timeFormatted: this.formatTime(this.timeElapsed)
                        }
                    }));
                }
            }
        }, 1000);
    }

    // 停止计时器
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    // 格式化时间显示
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // 保存测试记录
    async saveTestRecord(result) { // 虽然endQuiz已经调用，但为了遵循计划，先修改为异步
        try {
            if (typeof storageManager !== 'undefined') {
                await storageManager.saveTestRecord({
                    date: new Date().toISOString(), // 使用ISOString保持一致性
                    score: result.score,
                    maxScore: result.maxScore,
                    timeTaken: result.timeTaken, // 使用原始秒数
                    timeFormatted: result.timeFormatted,
                    correctAnswers: result.correctAnswers,
                    totalQuestions: result.totalQuestions,
                    percentage: result.percentage,
                    wrongAnswers: result.wrongAnswers.map(wa => ({ // 确保wrongAnswers符合数据库结构
                        word: wa.word,
                        userAnswer: wa.userAnswer,
                        correctAnswer: wa.correctAnswer,
                        sentence: wa.sentence,
                        notes: wa.notes
                    }))
                });
                console.log('测试记录已保存 (通过独立的saveTestRecord方法)');
            }
        } catch (error) {
            console.error('保存测试记录失败 (通过独立的saveTestRecord方法):', error);
        }
    }

    // 获取当前进度
    getProgress() {
        return {
            current: this.currentQuestionIndex, // currentQuestionIndex在generateNextQuestion中已经递增，表示当前正在答的题目序号
            total: this.totalQuestions,
            percentage: Math.round((this.currentQuestionIndex / this.totalQuestions) * 100),
            score: this.score,
            correctAnswers: this.correctAnswers
        };
    }

    // 跳过当前题目（可选功能）
    skipQuestion() {
        if (!this.isActive || !this.currentQuestion) {
            return null;
        }

        // 将跳过的题目记录为错题
        this.wrongAnswers.push({
            word: this.currentQuestion.word,
            correctAnswer: this.currentQuestion.correctAnswer,
            userAnswer: '跳过',
            sentence: this.currentQuestion.sentence,
            notes: this.currentQuestion.notes
        });

        return this.generateNextQuestion();
    }

    // 暂停测试
    pauseQuiz() {
        if (this.isActive) {
            this.stopTimer();
            this.isActive = false;
        }
    }

    // 恢复测试
    resumeQuiz() {
        if (!this.isActive && this.currentQuestion) {
            this.isActive = true;
            this.startTimer();
        }
    }

    // 获取测试统计
    getStats() {
        return {
            isActive: this.isActive,
            currentQuestionIndex: this.currentQuestionIndex,
            totalQuestions: this.totalQuestions,
            score: this.score,
            correctAnswers: this.correctAnswers,
            wrongAnswersCount: this.wrongAnswers.length,
            timeElapsed: this.timeElapsed,
            timeFormatted: this.formatTime(this.timeElapsed),
            hasCurrentQuestion: !!this.currentQuestion
        };
    }

    // 设置测试题目数量
    setTotalQuestions(count) {
        if (count > 0) {
            // 在错题回顾模式下，不需要检查词汇库长度
            if (this.isReviewMode || count <= vocabularyManager.vocabulary.length) {
                this.totalQuestions = count;
                return true;
            }
        }
        return false;
    }

    // 获取错题统计
    getWrongAnswersStats() {
        const stats = {
            total: this.wrongAnswers.length,
            byFirstLetter: {},
            byLength: {},
            withSentences: 0,
            withNotes: 0
        };

        this.wrongAnswers.forEach(wrong => {
            // 按首字母统计
            const firstLetter = wrong.word.charAt(0).toUpperCase();
            stats.byFirstLetter[firstLetter] = (stats.byFirstLetter[firstLetter] || 0) + 1;
            
            // 按长度统计
            const length = wrong.word.length;
            stats.byLength[length] = (stats.byLength[length] || 0) + 1;
            
            // 统计有例句和笔记的错题
            if (wrong.sentence) stats.withSentences++;
            if (wrong.notes) stats.withNotes++;
        });

        return stats;
    }
}

// 导出测试管理器实例
const quizManager = new QuizManager();

// 如果在Node.js环境中
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QuizManager, quizManager };
}