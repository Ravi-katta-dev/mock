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