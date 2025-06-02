// UI管理模块
class UIManager {
    constructor() {
        this.currentScreen = 'welcome';
        this.screenHistory = []; // 页面历史记录
        this.screens = {
            welcome: document.getElementById('welcome-screen'),
            questionCount: document.getElementById('question-count-screen'),
            quiz: document.getElementById('quiz-screen'),
            feedback: document.getElementById('feedback-screen'),
            results: document.getElementById('results-screen'),
            history: document.getElementById('history-screen'),
            mistakes: document.getElementById('mistakes-screen'),
            wrongQuestionHub: document.getElementById('wrong-question-hub-screen'),
            allWrongWords: document.getElementById('all-wrong-words-screen'),
            settings: document.getElementById('settings-screen')
        };
        this.elements = {};
        this.isInitialized = false;
    }

    // 初始化UI
    init() {
        this.cacheElements();
        this.bindEvents();
        this.showScreen('welcome');
        this.isInitialized = true;
        console.log('UI管理器初始化完成');
    }

    // 缓存DOM元素
    cacheElements() {
        // 按钮元素
        this.elements.startTestBtn = document.getElementById('start-test-btn');
        this.elements.viewHistoryBtn = document.getElementById('view-history-btn');
        this.elements.reviewMistakesHubBtn = document.getElementById('review-mistakes-hub-btn');
        this.elements.csvFileInput = document.getElementById('csv-file');
        this.elements.fileLabel = document.getElementById('file-label');
        this.elements.countBackBtn = document.getElementById('count-back-btn');
        this.elements.countOptionBtns = document.querySelectorAll('.count-option-btn');
        this.elements.backBtn = document.getElementById('back-btn');
        this.elements.hintBtn = document.getElementById('hint-btn');
        this.elements.nextQuestionBtn = document.getElementById('next-question-btn');
        this.elements.restartTestBtn = document.getElementById('restart-test-btn');
        this.elements.backToHomeBtn = document.getElementById('back-to-home-btn');
        this.elements.viewMistakesBtn = document.getElementById('view-mistakes-btn');
        this.elements.historyBackBtn = document.getElementById('history-back-btn');
        this.elements.mistakesBackBtn = document.getElementById('mistakes-back-btn');
        this.elements.feedbackBackBtn = document.getElementById('feedback-back-btn');
        this.elements.errorOkBtn = document.getElementById('error-ok-btn');
        
        // 设置相关按钮
        this.elements.settingsBtn = document.getElementById('settings-btn');
        this.elements.settingsBackBtn = document.getElementById('settings-back-btn');
        this.elements.bgmSwitch = document.getElementById('bgm-switch');
        this.elements.soundEffectsSwitch = document.getElementById('sound-effects-switch');
        
        // 错题回顾相关按钮
        this.elements.viewAllWrongWordsBtn = document.getElementById('view-all-wrong-words-btn');
        this.elements.startWrongQuizBtn = document.getElementById('start-wrong-quiz-btn');
        this.elements.hubBackBtn = document.getElementById('hub-back-btn');
        this.elements.allWrongBackBtn = document.getElementById('all-wrong-back-btn');
        this.elements.clearWrongPoolBtn = document.getElementById('clear-wrong-pool-btn');
        
        // 返回上一页按钮
        this.elements.countGoBackBtn = document.getElementById('count-go-back-btn');
        this.elements.allWrongGoBackBtn = document.getElementById('all-wrong-go-back-btn');
        this.elements.mistakesGoBackBtn = document.getElementById('mistakes-go-back-btn');

        // 显示元素
        this.elements.currentWord = document.getElementById('current-word');
        this.elements.questionProgress = document.getElementById('question-progress');
        this.elements.timerDisplay = document.getElementById('timer-display');
        this.elements.feedbackWord = document.getElementById('feedback-word');
        this.elements.feedbackProgress = document.getElementById('feedback-progress');
        this.elements.feedbackTimer = document.getElementById('feedback-timer');
        this.elements.feedbackMessage = document.getElementById('feedback-message');
        this.elements.userAnswer = document.getElementById('user-answer');
        this.elements.correctAnswer = document.getElementById('correct-answer');
        this.elements.exampleSentence = document.getElementById('example-sentence');
        this.elements.notes = document.getElementById('notes');
        this.elements.finalScore = document.getElementById('final-score');
        this.elements.finalTime = document.getElementById('final-time');
        this.elements.finalCorrect = document.getElementById('final-correct');
        this.elements.maxScore = document.getElementById('max-score');
        this.elements.totalQuestions = document.getElementById('total-questions');
        this.elements.historyList = document.getElementById('history-list');
        this.elements.mistakesList = document.getElementById('mistakes-list');
        this.elements.emptyHistory = document.getElementById('empty-history');
        this.elements.noMistakes = document.getElementById('no-mistakes');
        this.elements.loading = document.getElementById('loading');
        this.elements.errorModal = document.getElementById('error-modal');
        this.elements.errorMessage = document.getElementById('error-message');
        
        // 错题回顾相关显示元素
        this.elements.allWrongWordsList = document.getElementById('all-wrong-words-list');
        this.elements.emptyWrongPool = document.getElementById('empty-wrong-pool');
        this.elements.totalWrongCount = document.getElementById('total-wrong-count');
        this.elements.avgErrorCount = document.getElementById('avg-error-count');

        // 选项按钮
        this.elements.optionButtons = [
            document.getElementById('option-a'),
            document.getElementById('option-b'),
            document.getElementById('option-c')
        ];
    }

    // 播放音效
    async playSound(soundId) { // 改为异步
        // 检查音效设置是否开启
        const settings = await storageManager.getSettings(); // 改为异步
        if (!settings || !settings.playSoundEffects) return; // 增加空检查
        
        const soundElement = document.getElementById(soundId);
        if (soundElement) {
            soundElement.currentTime = 0; // 从头播放
            soundElement.play().catch(error => console.warn(`${soundId} 播放失败:`, error));
        }
    }

    // 绑定事件
    bindEvents() {
        // 开始界面事件
        this.elements.startTestBtn?.addEventListener('mouseenter', () => this.playSound('sound-hover'));
        this.elements.startTestBtn?.addEventListener('click', () => {
            this.playSound('sound-click');
            this.handleStartTest();
        });
        
        this.elements.viewHistoryBtn?.addEventListener('mouseenter', () => this.playSound('sound-hover'));
        this.elements.viewHistoryBtn?.addEventListener('click', () => {
            this.playSound('sound-click');
            this.showHistoryScreen();
        });
        
        this.elements.reviewMistakesHubBtn?.addEventListener('mouseenter', () => this.playSound('sound-hover'));
        this.elements.reviewMistakesHubBtn?.addEventListener('click', () => {
            this.playSound('sound-click');
            this.showWrongQuestionHubScreen();
        });
        
        // 设置按钮事件
        this.elements.settingsBtn?.addEventListener('mouseenter', () => this.playSound('sound-hover'));
        this.elements.settingsBtn?.addEventListener('click', () => {
            this.playSound('sound-click');
            this.showScreen('settings');
        });
        
        this.elements.settingsBackBtn?.addEventListener('mouseenter', () => this.playSound('sound-hover'));
        this.elements.settingsBackBtn?.addEventListener('click', () => {
            this.playSound('sound-click');
            this.showScreen('welcome');
        });
        
        // 初始化设置界面的数据管理事件
        this.initSettingsEvents();
        
        // BGM和音效开关事件
        this.elements.bgmSwitch?.addEventListener('change', async (e) => { // 改为异步
            await this.playSound('sound-click'); // 改为异步
            await app.toggleBGM(e.target.checked); // toggleBGM 也已改为异步
        });
        
        this.elements.soundEffectsSwitch?.addEventListener('change', async (e) => { // 改为异步
            if (e.target.checked) {
                await this.playSound('sound-click'); // 改为异步
            }
            const settings = await storageManager.getSettings() || {}; // 改为异步，增加空检查
            settings.playSoundEffects = e.target.checked;
            await storageManager.saveSettings(settings); // 改为异步
        });
        
        this.elements.csvFileInput?.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // 题目数量选择界面事件
        this.elements.countBackBtn?.addEventListener('mouseenter', () => this.playSound('sound-hover'));
        this.elements.countBackBtn?.addEventListener('click', () => {
            this.playSound('sound-click');
            this.showScreen('welcome');
        });
        
        this.elements.countOptionBtns?.forEach(btn => {
            btn.addEventListener('mouseenter', () => this.playSound('sound-hover'));
            btn.addEventListener('click', (e) => {
                this.playSound('sound-click');
                this.handleQuestionCountSelect(e);
            });
        });

        // 测试界面事件
        this.elements.backBtn?.addEventListener('mouseenter', () => this.playSound('sound-hover'));
        this.elements.backBtn?.addEventListener('click', () => {
            this.playSound('sound-click');
            this.handleBackToHome();
        });
        
        this.elements.hintBtn?.addEventListener('mouseenter', () => this.playSound('sound-hover'));
        this.elements.hintBtn?.addEventListener('click', () => {
            this.playSound('sound-click');
            this.showHint();
        });
        
        // 选项按钮事件
        this.elements.optionButtons.forEach((btn, index) => {
            btn?.addEventListener('mouseenter', () => this.playSound('sound-hover'));
            btn?.addEventListener('click', () => {
                this.playSound('sound-click');
                this.handleOptionSelect(index);
            });
        });

        // 反馈界面事件
        this.elements.feedbackBackBtn?.addEventListener('mouseenter', () => this.playSound('sound-hover'));
        this.elements.feedbackBackBtn?.addEventListener('click', () => {
            this.playSound('sound-click');
            this.handleBackToHome();
        });
        
        this.elements.nextQuestionBtn?.addEventListener('mouseenter', () => this.playSound('sound-hover'));
        this.elements.nextQuestionBtn?.addEventListener('click', () => {
            this.playSound('sound-click');
            this.handleNextQuestion();
        });

        // 结果界面事件
        this.elements.restartTestBtn?.addEventListener('mouseenter', () => this.playSound('sound-hover'));
        this.elements.restartTestBtn?.addEventListener('click', () => {
            this.playSound('sound-click');
            this.handleStartTest();
        });
        
        this.elements.backToHomeBtn?.addEventListener('mouseenter', () => this.playSound('sound-hover'));
        this.elements.backToHomeBtn?.addEventListener('click', () => {
            this.playSound('sound-click');
            this.showScreen('welcome');
        });
        
        this.elements.viewMistakesBtn?.addEventListener('mouseenter', () => this.playSound('sound-hover'));
        this.elements.viewMistakesBtn?.addEventListener('click', () => {
            this.playSound('sound-click');
            this.showMistakesScreen();
        });

        // 历史记录界面事件
        this.elements.historyBackBtn?.addEventListener('mouseenter', () => this.playSound('sound-hover'));
        this.elements.historyBackBtn?.addEventListener('click', () => {
            this.playSound('sound-click');
            this.showScreen('welcome');
        });
        
        this.elements.mistakesBackBtn?.addEventListener('mouseenter', () => this.playSound('sound-hover'));
        this.elements.mistakesBackBtn?.addEventListener('click', () => {
            this.playSound('sound-click');
            this.showScreen('welcome');
        });

        // 错误模态框事件
        this.elements.errorOkBtn?.addEventListener('mouseenter', () => this.playSound('sound-hover'));
        this.elements.errorOkBtn?.addEventListener('click', () => {
            this.playSound('sound-click');
            this.hideError();
        });
        
        // 错题回顾相关事件
        this.elements.viewAllWrongWordsBtn?.addEventListener('mouseenter', () => this.playSound('sound-hover'));
        this.elements.viewAllWrongWordsBtn?.addEventListener('click', () => {
            this.playSound('sound-click');
            this.showAllWrongWordsScreen();
        });
        
        this.elements.startWrongQuizBtn?.addEventListener('mouseenter', () => this.playSound('sound-hover'));
        this.elements.startWrongQuizBtn?.addEventListener('click', () => {
            this.playSound('sound-click');
            this.handleStartWrongQuiz();
        });
        
        this.elements.hubBackBtn?.addEventListener('mouseenter', () => this.playSound('sound-hover'));
        this.elements.hubBackBtn?.addEventListener('click', () => {
            this.playSound('sound-click');
            this.showScreen('welcome');
        });
        
        this.elements.allWrongBackBtn?.addEventListener('mouseenter', () => this.playSound('sound-hover'));
        this.elements.allWrongBackBtn?.addEventListener('click', () => {
            this.playSound('sound-click');
            this.handleBackToHome();
        });
        
        this.elements.clearWrongPoolBtn?.addEventListener('mouseenter', () => this.playSound('sound-hover'));
        this.elements.clearWrongPoolBtn?.addEventListener('click', () => {
            this.playSound('sound-click');
            this.handleClearWrongPool();
        });
        
        // 返回上一页事件
        this.elements.countGoBackBtn?.addEventListener('mouseenter', () => this.playSound('sound-hover'));
        this.elements.countGoBackBtn?.addEventListener('click', () => {
            this.playSound('sound-click');
            this.goBack();
        });
        
        this.elements.allWrongGoBackBtn?.addEventListener('mouseenter', () => this.playSound('sound-hover'));
        this.elements.allWrongGoBackBtn?.addEventListener('click', () => {
            this.playSound('sound-click');
            this.goBack();
        });
        
        this.elements.mistakesGoBackBtn?.addEventListener('mouseenter', () => this.playSound('sound-hover'));
        this.elements.mistakesGoBackBtn?.addEventListener('click', () => {
            this.playSound('sound-click');
            this.goBack();
        });

        // 计时器更新事件
        window.addEventListener('quizTimerUpdate', (e) => this.updateTimer(e.detail));

        // 键盘事件
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    // 显示指定屏幕
    showScreen(screenName, addToHistory = true) {
        // 隐藏所有屏幕
        Object.values(this.screens).forEach(screen => {
            if (screen) {
                screen.classList.remove('active');
            }
        });

        // 显示指定屏幕
        if (this.screens[screenName]) {
            // 添加到历史记录（如果不是返回操作）
            if (addToHistory && this.currentScreen !== screenName) {
                this.screenHistory.push(this.currentScreen);
            }
            
            this.screens[screenName].classList.add('active');
            this.currentScreen = screenName;
            
            // 如果是设置界面，初始化设置状态
            if (screenName === 'settings') {
                this.initSettingsScreen();
            }
            
            // 如果是历史记录界面，更新历史记录
            if (screenName === 'history') {
                this.updateHistoryDisplay();
            }
            
            // 如果是错题汇总界面，更新错题显示
            if (screenName === 'allWrongWords') {
                this.updateAllWrongWordsDisplay();
            }
        }
    }
    
    // 初始化设置界面
    async initSettingsScreen() { // 改为异步
        const settings = await storageManager.getSettings(); // 改为异步
        if (this.elements.bgmSwitch) {
            this.elements.bgmSwitch.checked = settings ? settings.playBGM : false; // 增加空检查
        }
        if (this.elements.soundEffectsSwitch) {
            this.elements.soundEffectsSwitch.checked = settings ? settings.playSoundEffects : false; // 增加空检查
        }
    }

    // 返回上一页
    goBack() {
        if (this.screenHistory.length > 0) {
            const previousScreen = this.screenHistory.pop();
            this.showScreen(previousScreen, false); // 不添加到历史记录
        } else {
            // 如果没有历史记录，返回首页
            this.showScreen('welcome', false);
        }
    }

    // 处理开始测试
    async handleStartTest() {
        try {
            // 检查词汇库是否已加载
            if (!vocabularyManager.isLoaded) {
                // 尝试加载默认文件
                try {
                    await vocabularyManager.loadFromDefault();
                } catch (error) {
                    this.showError('请先选择词汇文件');
                    return;
                }
            }

            // 重置为正常测试模式
            quizManager.isReviewMode = false;

            // 跳转到题目数量选择界面
            this.showScreen('questionCount');
        } catch (error) {
            console.error('开始测试失败:', error);
            this.showError('开始测试失败: ' + error.message);
        }
    }

    // 处理文件选择
    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.csv')) {
            this.showError('请选择CSV格式的文件');
            return;
        }

        try {
            this.showLoading('正在加载词汇文件...');
            await vocabularyManager.loadFromFile(file);
            this.hideLoading();
            
            // 更新文件标签显示文件名
            if (this.elements.fileLabel) {
                this.elements.fileLabel.textContent = `📁 选择词汇文件 (${file.name})`;
            }
            
            const stats = vocabularyManager.getStats();
            this.showSuccess(`成功加载 ${stats.totalWords} 个单词！`);
        } catch (error) {
            this.hideLoading();
            console.error('文件加载失败:', error);
            this.showError('文件加载失败: ' + error.message);
        }
    }

    // 处理题目数量选择
    handleQuestionCountSelect(event) {
        const count = parseInt(event.currentTarget.dataset.count);
        if (!count) return;

        try {
            // 设置题目数量
            quizManager.setTotalQuestions(count);
            
            // 开始测试（传递错题回顾模式标志）
            quizManager.startQuiz(quizManager.isReviewMode);
            this.showQuizScreen();
        } catch (error) {
            console.error('开始测试失败:', error);
            this.showError('开始测试失败: ' + error.message);
        }
    }

    // 显示测试界面
    showQuizScreen() {
        this.showScreen('quiz');
        this.updateQuizDisplay();
    }

    // 更新测试界面显示
    updateQuizDisplay() {
        const question = quizManager.currentQuestion;
        const progress = quizManager.getProgress();

        if (!question) return;

        // 更新单词显示
        if (this.elements.currentWord) {
            this.elements.currentWord.textContent = question.word;
        }

        // 更新进度显示
        if (this.elements.questionProgress) {
            this.elements.questionProgress.textContent = `第 ${progress.current}/${progress.total} 题`;
        }

        // 更新选项
        question.options.forEach((option, index) => {
            if (this.elements.optionButtons[index]) {
                const optionText = this.elements.optionButtons[index].querySelector('.option-text');
                if (optionText) {
                    optionText.textContent = option;
                }
                // 重置按钮状态
                this.elements.optionButtons[index].classList.remove('selected', 'correct', 'incorrect');
                this.elements.optionButtons[index].disabled = false;
            }
        });
    }

    // 处理选项选择
    async handleOptionSelect(optionIndex) { // 添加 async
        try {
            if (!quizManager.isActive) return;
            
            const option = this.elements.optionButtons[optionIndex];
            if (!option) return;
            
            const selectedOption = option.querySelector('.option-text').textContent;
            const result = await quizManager.submitAnswer(selectedOption); // 添加 await
            
            // 播放答题音效
            if (result.isCorrect) {
                this.playSound('sound-correct');
            } else {
                this.playSound('sound-incorrect');
            }
            
            this.showFeedbackScreen(result);
        } catch (error) {
            console.error('处理答案选择时发生错误:', error);
            this.showError('答题过程中发生错误: ' + error.message);
        }
    }

    // 高亮正确答案
    highlightCorrectAnswer(correctAnswer) {
        this.elements.optionButtons.forEach(btn => {
            if (btn) {
                const optionText = btn.querySelector('.option-text');
                if (optionText && optionText.textContent === correctAnswer) {
                    btn.classList.add('correct');
                } else if (btn.classList.contains('selected') && optionText.textContent !== correctAnswer) {
                    btn.classList.add('incorrect');
                }
            }
        });
    }

    // 显示反馈界面
    showFeedbackScreen(result) {
        this.showScreen('feedback');
        this.updateFeedbackDisplay(result);
    }

    // 更新反馈界面显示
    updateFeedbackDisplay(result) {
        // 更新单词显示
        if (this.elements.feedbackWord) {
            this.elements.feedbackWord.textContent = result.word;
        }

        // 更新进度显示
        if (this.elements.feedbackProgress) {
            this.elements.feedbackProgress.textContent = `第 ${result.questionNumber}/${result.totalQuestions} 题`;
        }

        // 更新反馈消息
        if (this.elements.feedbackMessage) {
            const icon = this.elements.feedbackMessage.querySelector('.feedback-icon');
            const text = this.elements.feedbackMessage.querySelector('.feedback-text');
            
            if (result.isCorrect) {
                if (icon) icon.textContent = '🎉';
                if (text) text.textContent = '太棒了，回答正确！';
                this.elements.feedbackMessage.style.borderColor = '#2ecc71';
            } else {
                if (icon) icon.textContent = '😅';
                if (text) text.textContent = '加油，再接再厉！';
                this.elements.feedbackMessage.style.borderColor = '#e74c3c';
            }
        }

        // 更新答案显示
        if (this.elements.userAnswer) {
            this.elements.userAnswer.textContent = `你的答案: ${result.userAnswer}`;
            this.elements.userAnswer.className = `answer-line ${result.isCorrect ? 'correct' : 'incorrect'}`;
        }

        if (this.elements.correctAnswer) {
            this.elements.correctAnswer.textContent = `正确答案: ${result.correctAnswer}`;
            this.elements.correctAnswer.className = 'answer-line correct';
        }

        // 更新例句和笔记
        if (this.elements.exampleSentence) {
            if (result.sentence) {
                this.elements.exampleSentence.textContent = `例句: ${result.sentence}`;
                this.elements.exampleSentence.style.display = 'block';
            } else {
                this.elements.exampleSentence.style.display = 'none';
            }
        }

        if (this.elements.notes) {
            if (result.notes) {
                this.elements.notes.textContent = `笔记: ${result.notes}`;
                this.elements.notes.style.display = 'block';
            } else {
                this.elements.notes.style.display = 'none';
            }
        }

        // 更新下一题按钮文本
        if (this.elements.nextQuestionBtn) {
            if (result.questionNumber >= result.totalQuestions) {
                this.elements.nextQuestionBtn.textContent = '查看结果 🏆';
            } else {
                this.elements.nextQuestionBtn.textContent = '下一题 ➡️';
            }
        }
    }

    // 处理下一题
    async handleNextQuestion() { // 添加 async
        try {
            if (quizManager.currentQuestionIndex >= quizManager.totalQuestions) {
                // 测试结束，显示结果
                const result = await quizManager.endQuiz(); // 添加 await
                this.showResultsScreen(result);
            } else {
                // 继续下一题
                quizManager.generateNextQuestion();
                this.showQuizScreen();
            }
        } catch (error) {
            console.error('处理下一题时发生错误:', error);
            this.showError('进入下一题时发生错误: ' + error.message);
        }
    }

    // 显示结果界面
    showResultsScreen(result) {
        this.showScreen('results');
        this.updateResultsDisplay(result);
    }

    // 更新结果界面显示
    updateResultsDisplay(result) {
        if (this.elements.finalScore) {
            this.elements.finalScore.textContent = result.score;
        }

        if (this.elements.finalTime) {
            this.elements.finalTime.textContent = result.timeFormatted;
        }

        if (this.elements.finalCorrect) {
            this.elements.finalCorrect.textContent = result.correctAnswers;
        }

        // 动态更新最大分数和总题数
        if (this.elements.maxScore) {
            this.elements.maxScore.textContent = result.maxScore;
        }

        if (this.elements.totalQuestions) {
            this.elements.totalQuestions.textContent = result.totalQuestions;
        }

        // 根据成绩显示不同的庆祝动画
        if (result.percentage >= 90) {
            this.showCelebration('excellent');
        } else if (result.percentage >= 70) {
            this.showCelebration('good');
        } else {
            this.showCelebration('normal');
        }
    }

    // 显示庆祝动画
    showCelebration(level) {
        const celebration = document.querySelector('.celebration-animals');
        if (celebration) {
            switch (level) {
                case 'excellent':
                    celebration.textContent = '🎊 🏆 🎉 ⭐ 🎊 🏆 🎉 ⭐ 🎊';
                    break;
                case 'good':
                    celebration.textContent = '🎉 😊 👏 🌟 🎉 😊 👏 🌟 🎉';
                    break;
                default:
                    celebration.textContent = '😊 👍 💪 🌟 😊 👍 💪 🌟 😊';
            }
        }
    }

    // 显示历史记录界面
    showHistoryScreen() {
        this.showScreen('history');
        this.updateHistoryDisplay();
    }

    // 更新历史记录显示
    async updateHistoryDisplay() { // 改为异步
        try {
            this.showLoading('正在加载历史记录...');
            const records = await storageManager.getTestRecords(); // 改为异步
            
            if (records.length === 0) {
                if (this.elements.historyList) {
                    this.elements.historyList.style.display = 'none';
                }
                if (this.elements.emptyHistory) {
                    this.elements.emptyHistory.style.display = 'block';
                }
                this.hideLoading();
                return;
            }

            if (this.elements.emptyHistory) {
                this.elements.emptyHistory.style.display = 'none';
            }
            if (this.elements.historyList) {
                this.elements.historyList.style.display = 'block';
                this.elements.historyList.innerHTML = '';

                records.forEach(record => {
                    const historyItem = this.createHistoryItem(record);
                    this.elements.historyList.appendChild(historyItem);
                });
            }
            this.hideLoading();
        } catch (error) {
            this.hideLoading();
            console.error('更新历史记录显示失败:', error);
            this.showError('加载历史记录失败: ' + error.message);
        }
    }

    // 创建历史记录项
    createHistoryItem(record) {
        const item = document.createElement('div');
        item.className = 'history-item';
        
        // 确保所有数据字段都有值
        const score = record.score !== undefined && record.score !== null ? Number(record.score) : 0;
        const totalQuestions = record.totalQuestions !== undefined && record.totalQuestions !== null ? 
            Number(record.totalQuestions) : 20;
        const maxScore = record.maxScore !== undefined && record.maxScore !== null ? 
            Number(record.maxScore) : (totalQuestions * 5 || 100);
        const correctAnswers = record.correctAnswers !== undefined && record.correctAnswers !== null ? 
            Number(record.correctAnswers) : 0;
        
        // 计算正确率百分比
        let percentage = 0;
        if (record.percentage !== undefined && record.percentage !== null) {
            percentage = Number(record.percentage);
        } else if (totalQuestions > 0) {
            percentage = Math.round((correctAnswers / totalQuestions) * 100);
        }
        const scoreColor = percentage >= 90 ? '#2ecc71' : percentage >= 70 ? '#f39c12' : '#e74c3c';
        
        // 格式化日期显示
        const formatDate = (dateStr) => {
            if (!dateStr) return '未知日期';
            try {
                const date = new Date(dateStr);
                return date.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (e) {
                console.error('日期格式化错误:', e, dateStr);
                return dateStr;
            }
        };
        
        // 使用timeFormatted字段（如果存在）或格式化timeTaken字段
        const timeDisplay = record.timeFormatted || this.formatTime(record.timeTaken);
        
        // 使用数据库中的日期，而不是当前日期
        const dateToShow = record.date || record.date_iso;
        
        // 使用计算好的值构建HTML
        item.innerHTML = `
            <div class="history-header">
                <span class="history-date">${formatDate(dateToShow)}</span>
                <span class="history-score" style="color: ${scoreColor}">${score}/${maxScore}分</span>
            </div>
            <div class="history-details">
                <span>用时: ${timeDisplay}</span>
                <span>正确率: ${percentage}%</span>
                <span>答对: ${correctAnswers}/${totalQuestions}</span>
            </div>
        `;
        
        console.log('创建历史记录项:', { 
            date: dateToShow,
            score, maxScore, correctAnswers, totalQuestions, percentage,
            timeTaken: record.timeTaken,
            timeFormatted: timeDisplay
        });
        
        return item;
    }

    // 显示错题界面
    showMistakesScreen() {
        this.showScreen('mistakes');
        this.updateMistakesDisplay();
    }

    // 更新错题显示
    updateMistakesDisplay() {
        const wrongAnswers = quizManager.wrongAnswers;
        
        if (wrongAnswers.length === 0) {
            if (this.elements.mistakesList) {
                this.elements.mistakesList.style.display = 'none';
            }
            if (this.elements.noMistakes) {
                this.elements.noMistakes.style.display = 'block';
            }
            return;
        }

        if (this.elements.noMistakes) {
            this.elements.noMistakes.style.display = 'none';
        }
        if (this.elements.mistakesList) {
            this.elements.mistakesList.style.display = 'block';
            this.elements.mistakesList.innerHTML = '';

            wrongAnswers.forEach(mistake => {
                const mistakeItem = this.createMistakeItem(mistake);
                this.elements.mistakesList.appendChild(mistakeItem);
            });
        }
    }

    // 创建错题项
    createMistakeItem(mistake) {
        const item = document.createElement('div');
        item.className = 'mistake-item';
        
        item.innerHTML = `
            <div class="mistake-word">${mistake.word}</div>
            <div class="mistake-answers">
                <div class="mistake-answer user">你的答案: ${mistake.userAnswer}</div>
                <div class="mistake-answer correct">正确答案: ${mistake.correctAnswer}</div>
            </div>
            ${mistake.sentence ? `<div class="example-sentence">例句: ${mistake.sentence}</div>` : ''}
            ${mistake.notes ? `<div class="notes">笔记: ${mistake.notes}</div>` : ''}
        `;
        
        return item;
    }

    // 显示提示
    showHint() {
        const hints = quizManager.getHint();
        if (hints && hints.length > 0) {
            const hintText = hints.slice(0, 2).join('\n'); // 只显示前两个提示
            alert(`💡 提示:\n${hintText}`);
        }
    }

    // 更新计时器显示
    updateTimer(timerData) {
        if (this.elements.timerDisplay) {
            this.elements.timerDisplay.textContent = timerData.timeFormatted;
        }
        if (this.elements.feedbackTimer) {
            this.elements.feedbackTimer.textContent = timerData.timeFormatted;
        }
    }

    // 处理返回首页
    handleBackToHome() {
        if (quizManager.isActive) {
            const confirmed = confirm('确定要退出当前测试吗？进度将不会保存。');
            if (!confirmed) return;
            
            quizManager.reset();
        }
        this.showScreen('welcome');
    }

    // 处理键盘事件
    handleKeyPress(event) {
        if (this.currentScreen === 'quiz' && quizManager.isActive) {
            // 在测试界面，支持数字键1-3选择选项
            if (event.key >= '1' && event.key <= '3') {
                const optionIndex = parseInt(event.key) - 1;
                this.handleOptionSelect(optionIndex);
            }
        } else if (this.currentScreen === 'feedback') {
            // 在反馈界面，支持空格键或回车键继续
            if (event.key === ' ' || event.key === 'Enter') {
                event.preventDefault();
                this.handleNextQuestion();
            }
        }
    }

    // 显示加载状态
    showLoading(message = '加载中...') {
        if (this.elements.loading) {
            const loadingText = this.elements.loading.querySelector('p');
            if (loadingText) {
                loadingText.textContent = message;
            }
            this.elements.loading.style.display = 'flex';
        }
    }

    // 隐藏加载状态
    hideLoading() {
        if (this.elements.loading) {
            this.elements.loading.style.display = 'none';
        }
    }

    // 显示错误信息
    showError(message) {
        if (this.elements.errorModal && this.elements.errorMessage) {
            this.elements.errorMessage.textContent = message;
            this.elements.errorModal.style.display = 'flex';
        } else {
            alert('错误: ' + message);
        }
    }

    // 隐藏错误信息
    hideError() {
        if (this.elements.errorModal) {
            this.elements.errorModal.style.display = 'none';
        }
    }

    // 显示成功信息
    showSuccess(message) {
        // 简单的成功提示，可以后续改为更美观的提示框
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2ecc71;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1001;
            font-weight: bold;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 3000);
    }

    // 显示Toast提示信息（与showSuccess功能相同）
    showToast(message) {
        this.showSuccess(message);
    }

    // 获取当前屏幕
    getCurrentScreen() {
        return this.currentScreen;
    }

    // 检查UI是否已初始化
    isReady() {
        return this.isInitialized;
    }
    
    // ==================== 错题回顾相关方法 ====================
    
    // 显示错题功能选择界面
    showWrongQuestionHubScreen() {
        this.showScreen('wrongQuestionHub');
    }
    
    // 显示所有历史错词汇总表界面
    showAllWrongWordsScreen() {
        this.showScreen('allWrongWords');
        this.updateAllWrongWordsDisplay();
    }
    
    // 更新错题汇总显示
    async updateAllWrongWordsDisplay() { // 改为异步
        try {
            this.showLoading('正在加载错题汇总...');
            const wrongQuestions = await storageManager.getWrongQuestions(); // 改为异步
            const stats = await storageManager.getWrongQuestionStats(); // 改为异步
            
            // 更新统计信息
            if (this.elements.totalWrongCount) {
                this.elements.totalWrongCount.textContent = stats ? stats.totalWrong : 0;
            }
            if (this.elements.avgErrorCount) {
                this.elements.avgErrorCount.textContent = stats ? stats.averageErrorCount.toFixed(1) : '0.0';
            }
            
            // 显示/隐藏相应的容器
            if (wrongQuestions.length === 0) {
                if(this.elements.allWrongWordsList) this.elements.allWrongWordsList.style.display = 'none';
                if(this.elements.emptyWrongPool) this.elements.emptyWrongPool.style.display = 'block';
                this.hideLoading();
                return;
            }
            
            if(this.elements.allWrongWordsList) this.elements.allWrongWordsList.style.display = 'block';
            if(this.elements.emptyWrongPool) this.elements.emptyWrongPool.style.display = 'none';
            
            // 生成错题列表HTML
            const wrongWordsHTML = wrongQuestions.map(wq => {
                const errorDate = new Date(wq.timestamp).toLocaleDateString('zh-CN');
                return `
                    <div class="wrong-word-item">
                        <div class="wrong-word-header">
                            <span class="wrong-word-text">${wq.word}</span>
                            <span class="error-count">错误${wq.errorCount}次</span>
                        </div>
                        <div class="wrong-word-details">
                            <div class="answer-line">
                                <span class="label">正确答案:</span>
                                <span class="correct">${wq.correctAnswer}</span>
                            </div>
                            <div class="answer-line">
                                <span class="label">最近错误答案:</span>
                                <span class="wrong">${wq.userAnswer}</span>
                            </div>
                            ${wq.sentence ? `
                                <div class="sentence-line">
                                    <span class="label">例句:</span>
                                    <span class="sentence">${wq.sentence}</span>
                                </div>
                            ` : ''}
                            ${wq.notes ? `
                                <div class="notes-line">
                                    <span class="label">笔记:</span>
                                    <span class="notes">${wq.notes}</span>
                                </div>
                            ` : ''}
                            <div class="date-line">
                                <span class="label">最近错误时间:</span>
                                <span class="date">${errorDate}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
            if(this.elements.allWrongWordsList) this.elements.allWrongWordsList.innerHTML = wrongWordsHTML;
            this.hideLoading();
            
        } catch (error) {
            this.hideLoading();
            console.error('更新错题汇总显示失败:', error);
            this.showError('加载错题汇总失败: ' + error.message);
        }
    }
    
    // 处理开始错题测试
    async handleStartWrongQuiz() {
        try {
            this.showLoading('正在加载错题...');
            const wrongQuestions = await storageManager.getWrongQuestionsForQuiz(20); // 获取20道错题
            this.hideLoading();
            
            if (!wrongQuestions || wrongQuestions.length === 0) {
                this.showError('错题池为空或加载失败，无法开始错题测试！');
                return;
            }
            
            // 将错题数据传递给quizManager，开始错题回顾模式测试
            quizManager.startQuiz(wrongQuestions.length, 'review', wrongQuestions);
            this.showQuizScreen();
            
        } catch (error) {
            this.hideLoading();
            console.error('开始错题测试失败:', error);
            this.showError('开始错题测试失败: ' + error.message);
        }
    }
    
    // 处理清空错题池
    async handleClearWrongPool() { // 改为异步
        if (confirm('确定要清空所有错题吗？此操作不可恢复！')) {
            try {
                this.showLoading('正在清空错题池...');
                await storageManager.clearAllWrongQuestions(); // 改为异步，方法名修正
                await this.updateAllWrongWordsDisplay(); // 改为异步
                this.hideLoading();
                this.showSuccess('错题池已清空！'); // 使用 showSuccess 替代 alert
            } catch (error) {
                this.hideLoading();
                console.error('清空错题池失败:', error);
                this.showError('清空错题池失败: ' + error.message);
            }
        }
    }
    
    // 初始化设置界面事件
    initSettingsEvents() {
        // 导出数据库按钮
        const exportDbBtn = document.getElementById('export-db-btn');
        if (exportDbBtn) {
            exportDbBtn.addEventListener('click', async () => {
                try {
                    await storageManager.exportDatabase();
                    uiManager.showToast('数据库导出成功！');
                } catch (error) {
                    console.error('导出数据库失败:', error);
                    uiManager.showError('导出数据库失败: ' + error.message);
                }
            });
        }

        // 导入数据库文件选择
        const importDbFile = document.getElementById('import-db-file');
        if (importDbFile) {
            importDbFile.addEventListener('change', async (event) => {
                const file = event.target.files[0];
                if (!file) return;

                try {
                    // 显示确认对话框
                    if (confirm('导入数据库将覆盖当前所有数据，确定要继续吗？')) {
                        await storageManager.importDatabase(file);
                        uiManager.showToast('数据库导入成功！');
                        // 重新加载页面以应用新数据库
                        setTimeout(() => window.location.reload(), 1500);
                    }
                } catch (error) {
                    console.error('导入数据库失败:', error);
                    uiManager.showError('导入数据库失败: ' + error.message);
                }
                // 清空文件输入，允许再次选择同一文件
                event.target.value = '';
            });
        }
    }
}

// 导出UI管理器实例
const uiManager = new UIManager();

// 如果在Node.js环境中
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UIManager, uiManager };
}