/**
 * MockTestApp - Main Application Class for RRB Mock Test App
 * 
 * This is the core application class that coordinates all modules and manages
 * the overall application state and lifecycle.
 * 
 * @author Ravi-katta-dev
 * @version 2.0.0
 * @created 2025-01-XX
 */

class MockTestApp {
    constructor() {
        // Core application state
        this.initialized = false;
        this.modules = {};
        
        // Application configuration
        this.config = {
            version: '2.0',
            name: 'RRB Mock Test Application',
            autoSaveInterval: 30000 // 30 seconds
        };
        
        // UI state management
        this.uiState = {
            currentSection: 'dashboard',
            theme: localStorage.getItem('appTheme') || 'light',
            autoSaveTimer: null,
            lastAutoSave: Date.now()
        };
        
        // Performance monitoring
        this.performance = {
            startTime: performance.now(),
            loadTime: null,
            moduleLoadTimes: new Map()
        };
    }

    /**
     * Initialize the application and all modules
     */
    async initialize() {
        if (this.initialized) return;
        
        console.log('🚀 Initializing MockTestApp v2.0...');
        
        try {
            // Load configuration from modular files
            await this.loadConfiguration();
            
            // Initialize core modules
            await this.initializeModules();
            
            // Setup main application
            await this.setupApplication();
            
            // Mark as initialized
            this.initialized = true;
            this.performance.loadTime = performance.now() - this.performance.startTime;
            
            console.log(`✅ MockTestApp initialized successfully in ${this.performance.loadTime.toFixed(2)}ms!`);
            
        } catch (error) {
            console.error('❌ Failed to initialize MockTestApp:', error);
            throw error;
        }
    }

    /**
     * Load configuration from modular config files
     */
    async loadConfiguration() {
        console.log('📋 Loading configuration...');
        
        try {
            // Configuration is already loaded via script tags in index.html
            // We just need to validate that the global config objects exist
            if (typeof APP_CONFIG !== 'undefined') {
                this.config = { ...this.config, ...APP_CONFIG };
            }
            
            if (typeof EXAM_PATTERNS !== 'undefined') {
                this.config.examPatterns = EXAM_PATTERNS;
            }
            
            if (typeof SYLLABUS_MAPPING !== 'undefined') {
                this.config.syllabusMapping = SYLLABUS_MAPPING;
            }
            
            console.log('✅ Configuration loaded');
        } catch (error) {
            console.error('❌ Failed to load configuration:', error);
            throw error;
        }
    }

    /**
     * Initialize all application modules
     */
    async initializeModules() {
        console.log('🔧 Initializing modules...');
        
        const modules = [
            'dataManager',
            'userManager', 
            'uiManager',
            'questionManager',
            'testEngine',
            'resultsAnalyzer',
            'pdfProcessor',
            'answerKeyDetector',
            'questionBank'
        ];

        for (const moduleName of modules) {
            const startTime = performance.now();
            await this.initializeModule(moduleName);
            const endTime = performance.now();
            this.performance.moduleLoadTimes.set(moduleName, endTime - startTime);
        }

        console.log('✅ All modules initialized');
    }

    /**
     * Initialize individual module
     */
    async initializeModule(moduleName) {
        const moduleMap = {
            dataManager: window.DataManager,
            userManager: window.userManager,
            uiManager: window.UIManager,
            questionManager: window.QuestionManager,
            testEngine: window.TestEngine,
            resultsAnalyzer: window.ResultsAnalyzer,
            pdfProcessor: window.pdfProcessor,
            answerKeyDetector: window.answerKeyDetector,
            questionBank: window.QuestionBank
        };

        const module = moduleMap[moduleName];
        if (module && typeof module.init === 'function') {
            await module.init();
            this.modules[moduleName] = module;
            console.log(`✅ ${moduleName} initialized`);
        } else {
            console.warn(`⚠️ Module ${moduleName} not found or invalid`);
        }
    }

    /**
     * Setup main application components
     */
    async setupApplication() {
        console.log('⚙️ Setting up application...');
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize auto-save
        this.setupAutoSave();
        
        // Setup error handling
        this.setupErrorHandling();
        
        // Setup performance monitoring
        this.setupPerformanceMonitoring();
        
        // Initialize the dashboard view
        this.initializeDefaultView();
        
        console.log('✅ Application setup complete');
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Handle visibility change for auto-save
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveApplicationState();
            }
        });

        // Handle before unload
        window.addEventListener('beforeunload', () => {
            this.saveApplicationState();
        });

        // Setup navigation event handlers
        this.setupNavigationHandlers();
    }

    /**
     * Setup navigation event handlers for section switching
     */
    setupNavigationHandlers() {
        // Handle navigation link clicks
        document.addEventListener('click', (event) => {
            const navLink = event.target.closest('[data-section]');
            if (navLink) {
                event.preventDefault();
                const sectionName = navLink.getAttribute('data-section');
                this.switchSection(sectionName);
            }
        });

        // Handle action card clicks (dashboard quick actions)
        document.addEventListener('click', (event) => {
            const actionCard = event.target.closest('[data-action]');
            if (actionCard) {
                const action = actionCard.getAttribute('data-action');
                this.handleQuickAction(action);
            }
        });
    }

    /**
     * Switch between application sections
     * @param {string} sectionName - Name of the section to switch to
     */
    switchSection(sectionName) {
        try {
            console.log(`Switching to section: ${sectionName}`);
            
            // Hide all sections
            const allSections = document.querySelectorAll('.content-section');
            allSections.forEach(section => {
                section.classList.remove('active');
            });

            // Show target section
            const targetSection = document.getElementById(sectionName);
            if (targetSection) {
                targetSection.classList.add('active');
            } else {
                console.warn(`Section ${sectionName} not found`);
                return;
            }

            // Update navigation active state
            const allNavLinks = document.querySelectorAll('[data-section]');
            allNavLinks.forEach(link => {
                link.classList.remove('active');
            });

            const activeNavLink = document.querySelector(`[data-section="${sectionName}"]`);
            if (activeNavLink) {
                activeNavLink.classList.add('active');
            }

            // Update UI state
            this.uiState.currentSection = sectionName;
            this.saveApplicationState();

            // Notify modules of section change
            this.notifyModulesOfSectionChange(sectionName);

            console.log(`✅ Switched to section: ${sectionName}`);
        } catch (error) {
            console.error('Failed to switch section:', error);
        }
    }

    /**
     * Handle quick action clicks from dashboard
     * @param {string} action - Action name
     */
    handleQuickAction(action) {
        console.log(`Handling quick action: ${action}`);
        
        switch (action) {
            case 'fullMockTest':
                this.startFullMockTest();
                break;
            case 'customTest':
                this.switchSection('testSelection');
                break;
            case 'pyqTest':
                this.startPYQTest();
                break;
            default:
                console.warn(`Unknown action: ${action}`);
        }
    }

    /**
     * Start full mock test
     */
    startFullMockTest() {
        if (this.modules.testEngine && this.modules.testEngine.startTest) {
            this.modules.testEngine.startTest({
                type: 'fullMock',
                questionCount: 100,
                duration: 90
            });
        } else {
            console.warn('TestEngine module not available');
        }
    }

    /**
     * Start PYQ test
     */
    startPYQTest() {
        if (this.modules.testEngine && this.modules.testEngine.startTest) {
            this.modules.testEngine.startTest({
                type: 'pyq',
                filterPYQ: true
            });
        } else {
            console.warn('TestEngine module not available');
        }
    }

    /**
     * Notify modules when section changes
     * @param {string} sectionName - New section name
     */
    notifyModulesOfSectionChange(sectionName) {
        // Notify UI Manager
        if (this.modules.uiManager && this.modules.uiManager.onSectionChange) {
            this.modules.uiManager.onSectionChange(sectionName);
        }

        // Notify specific modules based on section
        switch (sectionName) {
            case 'questionBank':
                if (this.modules.questionBank && this.modules.questionBank.refresh) {
                    this.modules.questionBank.refresh();
                }
                break;
            case 'analytics':
                if (this.modules.resultsAnalyzer && this.modules.resultsAnalyzer.refreshCharts) {
                    this.modules.resultsAnalyzer.refreshCharts();
                }
                break;
            case 'dashboard':
                this.refreshDashboard();
                break;
        }
    }

    /**
     * Refresh dashboard data
     */
    refreshDashboard() {
        try {
            // Update statistics
            if (this.modules.resultsAnalyzer) {
                const stats = this.modules.resultsAnalyzer.getOverallStats();
                this.updateDashboardStats(stats);
            }
        } catch (error) {
            console.error('Failed to refresh dashboard:', error);
        }
    }

    /**
     * Update dashboard statistics
     * @param {Object} stats - Statistics object
     */
    updateDashboardStats(stats = {}) {
        const elements = {
            totalTests: document.getElementById('totalTests'),
            averageScore: document.getElementById('averageScore'),
            bestScore: document.getElementById('bestScore'),
            totalQuestions: document.getElementById('totalQuestions')
        };

        if (elements.totalTests) {
            elements.totalTests.textContent = stats.totalTests || '0';
        }
        if (elements.averageScore) {
            elements.averageScore.textContent = stats.averageScore ? `${stats.averageScore}%` : '0%';
        }
        if (elements.bestScore) {
            elements.bestScore.textContent = stats.bestScore ? `${stats.bestScore}%` : '0%';
        }
        if (elements.totalQuestions) {
            const questionCount = this.modules.questionManager ? 
                this.modules.questionManager.getTotalQuestionCount() : 0;
            elements.totalQuestions.textContent = questionCount.toString();
        }
    }

    /**
     * Setup auto-save functionality
     */
    setupAutoSave() {
        if (this.uiState.autoSaveTimer) {
            clearInterval(this.uiState.autoSaveTimer);
        }

        this.uiState.autoSaveTimer = setInterval(() => {
            this.saveApplicationState();
        }, this.config.autoSaveInterval);
    }

    /**
     * Setup error handling
     */
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.handleError(event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.handleError(event.reason);
        });
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor memory usage periodically
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB threshold
                    console.warn('High memory usage detected:', memory.usedJSHeapSize / 1024 / 1024, 'MB');
                }
            }, 60000); // Check every minute
        }
    }

    /**
     * Handle application errors
     */
    handleError(error) {
        // Log error details
        console.error('Application error:', error);
        
        // Show user-friendly error message
        if (this.modules.uiManager && this.modules.uiManager.showError) {
            this.modules.uiManager.showError('An unexpected error occurred. Please try again.');
        }
    }

    /**
     * Save current application state
     */
    saveApplicationState() {
        try {
            const state = {
                uiState: this.uiState,
                timestamp: Date.now()
            };
            
            localStorage.setItem('mockTestAppState', JSON.stringify(state));
            this.uiState.lastAutoSave = Date.now();
            
            // Update auto-save indicator if available
            if (this.modules.uiManager && this.modules.uiManager.updateAutoSaveIndicator) {
                this.modules.uiManager.updateAutoSaveIndicator();
            }
        } catch (error) {
            console.error('Failed to save application state:', error);
        }
    }

    /**
     * Get module by name
     */
    getModule(name) {
        return this.modules[name];
    }

    /**
     * Check if application is initialized
     */
    isInitialized() {
        return this.initialized;
    }

    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        return {
            loadTime: this.performance.loadTime,
            moduleLoadTimes: Object.fromEntries(this.performance.moduleLoadTimes),
            memoryUsage: 'memory' in performance ? performance.memory : null
        };
    }

    /**
     * Initialize the default view (dashboard)
     */
    initializeDefaultView() {
        // Make sure dashboard is visible by default
        this.switchSection('dashboard');
        
        // Initialize dashboard data
        this.refreshDashboard();
    }

    /**
     * Cleanup resources
     */
    destroy() {
        if (this.uiState.autoSaveTimer) {
            clearInterval(this.uiState.autoSaveTimer);
        }
        
        this.saveApplicationState();
        this.initialized = false;
        
        console.log('MockTestApp destroyed');
    }
}

// Make MockTestApp available globally
window.MockTestApp = MockTestApp;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MockTestApp;
}