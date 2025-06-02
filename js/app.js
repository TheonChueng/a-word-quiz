// 主应用入口文件
class WordMemoryTestApp {
    constructor() {
        this.isInitialized = false;
        this.modules = {
            vocabulary: null,
            quiz: null,
            ui: null,
            storage: null
        };
    }

    // 初始化应用
    async init() {
        try {
            console.log('开始初始化单词记忆测试应用...');
            
            // 检查必要的DOM元素
            this.checkRequiredElements();
            
            // 初始化各个模块
            await this.initModules();
            
            // 绑定全局事件
            this.bindGlobalEvents();
            
            // 加载用户设置
            await this.loadUserSettings(); // 改为异步
            
            // 尝试加载默认词汇库
            await this.loadDefaultVocabulary();
            
            this.isInitialized = true;
            console.log('应用初始化完成！');
            
            // 显示欢迎界面
            await this.showWelcomeMessage(); // 改为异步
            
            // 初始化BGM
            this.initBGM();
            
        } catch (error) {
            console.error('应用初始化失败:', error);
            this.showInitError(error);
        }
    }

    // 检查必要的DOM元素
    checkRequiredElements() {
        const requiredElements = [
            'welcome-screen',
            'quiz-screen', 
            'feedback-screen',
            'results-screen',
            'history-screen',
            'mistakes-screen'
        ];
        
        const missingElements = [];
        requiredElements.forEach(id => {
            if (!document.getElementById(id)) {
                missingElements.push(id);
            }
        });
        
        if (missingElements.length > 0) {
            throw new Error(`缺少必要的DOM元素: ${missingElements.join(', ')}`);
        }
    }

    // 初始化各个模块
    async initModules() {
        try {
            // 检查模块是否已加载
            if (typeof vocabularyManager === 'undefined') {
                throw new Error('词汇管理模块未加载');
            }
            if (typeof quizManager === 'undefined') {
                throw new Error('测试管理模块未加载');
            }
            if (typeof uiManager === 'undefined') {
                throw new Error('UI管理模块未加载');
            }
            if (typeof StorageManager === 'undefined') { // 注意：这里应该是 StorageManager 类
                throw new Error('存储管理模块类未加载');
            }

            // 首先初始化UI模块，因为其他模块可能需要使用UI来显示消息
            this.modules.vocabulary = vocabularyManager;
            this.modules.quiz = quizManager;
            this.modules.ui = uiManager;
            
            // 初始化UI管理器
            this.modules.ui.init();
            console.log('UI模块初始化完成');

            // 使用全局的 storageManager 实例并初始化数据库
            this.modules.storage = storageManager;
            await this.modules.storage.initDB(); // 初始化数据库
            console.log('数据库初始化完成');

            // 尝试数据迁移
            try {
                const migrationResult = await this.modules.storage.migrateFromLocalStorageToSQL();
                if (migrationResult.migrated) {
                    console.log(`数据迁移成功: ${migrationResult.details}`);
                    this.modules.ui.showSuccess(`部分旧数据已成功迁移到新数据库！`);
                } else if (migrationResult.skipped) {
                    console.log(`数据迁移跳过: ${migrationResult.details}`);
                } else {
                    console.log('没有需要迁移的数据，或迁移过程中出现非致命错误。');
                }
            } catch (migrationError) {
                console.error('数据迁移过程中发生严重错误:', migrationError);
                this.modules.ui.showError('数据迁移失败，部分旧数据可能无法使用。');
            }
            
            console.log('所有模块初始化完成');
        } catch (error) {
            console.error('模块初始化失败:', error);
            throw new Error('模块初始化失败: ' + error.message);
        }
    }

    // 绑定全局事件
    bindGlobalEvents() {
        // 页面卸载前的清理
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
        
        // 页面可见性变化处理
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // 页面隐藏时暂停测试
                if (this.modules.quiz.isActive) {
                    this.modules.quiz.pauseQuiz();
                }
            } else {
                // 页面显示时恢复测试
                if (this.modules.quiz.isActive && !this.modules.quiz.timer) {
                    this.modules.quiz.resumeQuiz();
                }
            }
        });
        
        // 错误处理
        window.addEventListener('error', (event) => {
            console.error('全局错误:', event.error);
            this.handleGlobalError(event.error);
        });
        
        // 未处理的Promise拒绝
        window.addEventListener('unhandledrejection', (event) => {
            console.error('未处理的Promise拒绝:', event.reason);
            this.handleGlobalError(event.reason);
        });
        
        console.log('全局事件绑定完成');
    }

    // 加载用户设置
    async loadUserSettings() {
        try {
            const settings = await this.modules.storage.getSettings();
            
            // 应用设置到各个模块
            if (settings && settings.questionCount) {
                this.modules.quiz.setTotalQuestions(settings.questionCount);
            }
            
            // 应用主题设置
            if (settings && settings.theme) {
                this.applyTheme(settings.theme);
            }
            
            console.log('用户设置已加载:', settings);
        } catch (error) {
            console.error('加载用户设置失败:', error);
            // 可以在UI上显示错误提示
            this.modules.ui.showError('加载用户设置失败，将使用默认设置。');
        }
    }

    // 尝试加载默认词汇库
    async loadDefaultVocabulary() {
        try {
            // 首先尝试从存储中加载 (注意：getVocabulary 预期是同步的，如果改为异步需要调整)
            // 假设 getVocabulary 仍然是同步的，或者在 StorageManager 中没有这个方法了
            // 如果词汇库也移到数据库，这里需要异步获取
            // const savedVocabulary = await this.modules.storage.getVocabulary(); 
            // if (savedVocabulary && savedVocabulary.length > 0) {
            //     await this.modules.vocabulary.loadFromArray(savedVocabulary);
            //     console.log('从存储中加载词汇库成功');
            //     return;
            // }
            
            // 词汇库加载逻辑保持不变，因为词汇库本身不直接依赖于旧的localStorage
            // 而是通过 vocabularyManager 管理
            try {
                await this.modules.vocabulary.loadFromDefault();
                console.log('默认词汇库加载成功');
            } catch (error) {
                console.log('默认词汇库不存在或加载失败，等待用户上传文件');
            }
        } catch (error) {
            console.error('加载词汇库失败:', error);
            this.modules.ui.showError('加载词汇库失败，请尝试手动上传。');
        }
    }

    // 应用主题
    applyTheme(theme) {
        try {
            document.body.className = document.body.className.replace(/theme-\w+/g, '');
            document.body.classList.add(`theme-${theme}`);
            console.log(`应用主题: ${theme}`);
        } catch (error) {
            console.error('应用主题失败:', error);
        }
    }

    // 显示欢迎消息
    async showWelcomeMessage() {
        try {
            const stats = await this.modules.storage.getTestStats(); // 改为异步的 getTestStats
            
            if (stats && stats.totalTests > 0) {
                console.log(`欢迎回来！您已完成 ${stats.totalTests} 次测试，平均正确率 ${stats.averageScore.toFixed(2)}%`);
                // UI层面可以更新欢迎信息
                // this.modules.ui.updateWelcomeMessage(`欢迎回来！您已完成 ${stats.totalTests} 次测试...`);
            } else {
                console.log('欢迎使用单词记忆测试应用！');
                // this.modules.ui.updateWelcomeMessage('欢迎使用单词记忆测试应用！');
            }
            
            // 检查词汇库状态
            if (this.modules.vocabulary.isLoaded) {
                const vocabStats = this.modules.vocabulary.getStats();
                console.log(`词汇库已加载，共 ${vocabStats.totalWords} 个单词`);
            } else {
                console.log('请上传词汇文件开始测试');
            }
        } catch (error) {
            console.error('显示欢迎消息失败:', error);
            if (this.modules.ui) {
                this.modules.ui.showError('加载用户统计信息失败。');
            }
        }
    }

    // 显示初始化错误
    showInitError(error) {
        const errorMessage = `应用初始化失败: ${error.message}`;
        
        // 尝试显示错误模态框
        const errorModal = document.getElementById('error-modal');
        const errorMessageEl = document.getElementById('error-message');
        
        if (errorModal && errorMessageEl) {
            errorMessageEl.textContent = errorMessage;
            errorModal.style.display = 'flex';
        } else {
            // 回退到alert
            alert(errorMessage);
        }
        
        console.error('初始化错误详情:', error);
    }

    // 处理全局错误
    handleGlobalError(error) {
        // 记录错误
        console.error('应用运行时错误:', error);
        
        // 如果是测试过程中的错误，尝试恢复
        if (this.modules.quiz && this.modules.quiz.isActive) {
            try {
                this.modules.quiz.pauseQuiz();
                this.modules.ui.showError('测试过程中发生错误，已暂停测试');
            } catch (e) {
                console.error('错误恢复失败:', e);
            }
        }
    }

    // 获取应用状态
    getAppStatus() {
        return {
            isInitialized: this.isInitialized,
            vocabularyLoaded: this.modules.vocabulary ? this.modules.vocabulary.isLoaded : false,
            quizActive: this.modules.quiz ? this.modules.quiz.isActive : false,
            currentScreen: this.modules.ui ? this.modules.ui.getCurrentScreen() : 'unknown',
            modules: {
                vocabulary: !!this.modules.vocabulary,
                quiz: !!this.modules.quiz,
                ui: !!this.modules.ui,
                storage: !!this.modules.storage
            }
        };
    }

    // 重启应用
    async restart() {
        try {
            console.log('重启应用...');
            
            // 清理当前状态
            this.cleanup();
            
            // 重新初始化
            await this.init();
            
            console.log('应用重启完成');
        } catch (error) {
            console.error('应用重启失败:', error);
            throw error;
        }
    }

    // 清理资源
    cleanup() {
        try {
            // 停止测试
            if (this.modules.quiz && this.modules.quiz.isActive) {
                this.modules.quiz.reset();
            }
            
            // 清理计时器等资源
            if (this.modules.quiz) {
                this.modules.quiz.stopTimer();
            }
            
            console.log('应用资源清理完成');
        } catch (error) {
            console.error('资源清理失败:', error);
        }
    }

    // 导出应用数据
    exportData() {
        try {
            if (!this.modules.storage) {
                throw new Error('存储模块未初始化');
            }
            
            const data = this.modules.storage.exportAllData();
            if (!data) {
                throw new Error('导出数据失败');
            }
            
            // 创建下载链接
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `word-memory-test-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('数据导出成功');
            return true;
        } catch (error) {
            console.error('导出数据失败:', error);
            this.modules.ui.showError('导出数据失败: ' + error.message);
            return false;
        }
    }

    // 导入应用数据
    async importData(file) {
        try {
            if (!this.modules.storage) {
                throw new Error('存储模块未初始化');
            }
            
            const text = await file.text();
            const success = this.modules.storage.importAllData(text);
            
            if (success) {
                // 重新加载设置和词汇库
                this.loadUserSettings();
                await this.loadDefaultVocabulary();
                
                this.modules.ui.showSuccess('数据导入成功！');
                console.log('数据导入成功');
                return true;
            } else {
                throw new Error('数据导入失败');
            }
        } catch (error) {
            console.error('导入数据失败:', error);
            this.modules.ui.showError('导入数据失败: ' + error.message);
            return false;
        }
    }

    // 获取应用信息
    getAppInfo() {
        return {
            name: '单词记忆测试',
            version: '1.0.0',
            author: 'AI Assistant',
            description: '一个帮助用户记忆英语单词的测试应用',
            features: [
                '支持CSV格式词汇文件导入',
                '随机生成选择题',
                '实时计时和评分',
                '错题回顾功能',
                '历史记录统计',
                '本地数据存储'
            ],
            status: this.getAppStatus()
        };
    }

    // 初始化BGM
    async initBGM() {
        const bgmElement = document.getElementById('bgm');
        if (bgmElement) {
            // 从存储中获取BGM设置
            const settings = await this.modules.storage.getSettings();
            const playBGM = settings ? settings.playBGM : false; // 增加空检查
            if (playBGM) {
                bgmElement.play().catch(error => console.warn('BGM播放失败:', error));
            }
            console.log(`BGM初始化完成，播放状态: ${playBGM}`);
        }
    }

    // 控制BGM播放状态
    async toggleBGM(play) {
        const bgmElement = document.getElementById('bgm');
        if (!bgmElement) return;
        
        if (play === undefined) {
            // 如果未指定状态，则切换当前状态
            if (bgmElement.paused) {
                bgmElement.play().catch(error => console.warn('BGM播放失败:', error));
            } else {
                bgmElement.pause();
            }
        } else if (play) {
            // 播放BGM
            bgmElement.play().catch(error => console.warn('BGM播放失败:', error));
        } else {
            // 暂停BGM
            bgmElement.pause();
        }
        
        // 保存设置
        const settings = await this.modules.storage.getSettings() || {}; // 获取现有设置，或空对象
        settings.playBGM = !bgmElement.paused;
        await this.modules.storage.saveSettings(settings); // 改为异步
        
        return !bgmElement.paused;
    }
}

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