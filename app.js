/**
 * RRB Technician Grade-3 Signal Mock Test Application - Modular Version
 * Main Application Coordinator
 * 
 * Created: 2025-07-26
 * Author: Ravi-katta-dev
 * Version: 2.0 - Modularized
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
        
        // Initialize the application
        this.initialize();
    }

    /**
     * Initialize the application and all modules
     */
    async initialize() {
        if (this.initialized) return;
        
        console.log('🚀 Initializing RRB Mock Test App v2.0...');
        
        try {
            // Load configuration from modular files
            await this.loadConfiguration();
            
            // Initialize core modules
            await this.initializeModules();
            
            // Setup main application
            this.setupApplication();
            
            // Check for existing user session
            this.checkUserSession();
            
            this.initialized = true;
            console.log('✅ RRB Mock Test App initialized successfully!');
            
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Load configuration from modular files
     */
    async loadConfiguration() {
        console.log('📋 Loading configuration...');
        
        // Configuration should already be loaded via script tags
        if (typeof window.MockTestConstants !== 'undefined') {
            this.config = { ...this.config, ...window.MockTestConstants };
        }
        
        if (typeof window.SyllabusMapping !== 'undefined') {
            this.syllabusMapping = window.SyllabusMapping;
        }
        
        if (typeof window.ExamPatterns !== 'undefined') {
            this.examPatterns = window.ExamPatterns;
        }
        
        console.log('✅ Configuration loaded');
    }

    /**
     * Initialize all application modules
     */
    async initializeModules() {
        console.log('🔧 Initializing modules...');
        
        // Initialize modules in dependency order
        const moduleInitOrder = [
            'dataManager',
            'userManager', 
            'uiManager',
            'questionManager',
            'testEngine',
            'resultsAnalyzer',
            'pdfProcessor',
            'answerKeyDetector'
        ];

        for (const moduleName of moduleInitOrder) {
            try {
                await this.initializeModule(moduleName);
            } catch (error) {
                console.warn(`⚠️ Failed to initialize ${moduleName}:`, error);
            }
        }
        
        console.log('✅ All modules initialized');
    }

    /**
     * Initialize a specific module
     */
    async initializeModule(moduleName) {
        const moduleMap = {
            dataManager: window.dataManager,
            userManager: window.userManager,
            uiManager: window.uiManager,
            questionManager: window.questionManager,
            testEngine: window.testEngine,
            resultsAnalyzer: window.resultsAnalyzer,
            pdfProcessor: window.pdfProcessor,
            answerKeyDetector: window.answerKeyDetector
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
    setupApplication() {
        console.log('⚙️ Setting up application...');
        
        // Setup global event listeners
        this.setupGlobalEventListeners();
        
        // Setup auto-save
        this.setupAutoSave();
        
        // Setup theme management
        this.setupThemeManagement();
        
        // Setup error handling
        this.setupErrorHandling();
        
        console.log('✅ Application setup complete');
    }

    /**
     * Setup global event listeners
     */
    setupGlobalEventListeners() {
        // Navigation event listeners
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-link[data-section]')) {
                e.preventDefault();
                const section = e.target.dataset.section;
                this.navigateToSection(section);
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Window events
        window.addEventListener('beforeunload', () => {
            this.saveApplicationState();
        });

        // Visibility change (tab switching)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.handleApplicationFocus();
            }
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
            this.performAutoSave();
        }, this.config.autoSaveInterval);
    }

    /**
     * Setup theme management
     */
    setupThemeManagement() {
        // Apply saved theme
        this.applyTheme(this.uiState.theme);
        
        // Theme toggle button
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    /**
     * Setup error handling
     */
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.handleGlobalError(event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.handleGlobalError(event.reason);
        });
    }

    /**
     * Check for existing user session
     */
    checkUserSession() {
        if (this.modules.userManager) {
            const isLoggedIn = this.modules.userManager.isLoggedIn();
            
            if (isLoggedIn) {
                this.showMainApplication();
            } else {
                this.showWelcomeScreen();
            }
        } else {
            this.showWelcomeScreen();
        }
    }

    /**
     * Navigate to a specific section
     */
    navigateToSection(section) {
        console.log(`📍 Navigating to section: ${section}`);
        
        // Update active navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === section) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });

        // Hide all sections
        document.querySelectorAll('.main-section').forEach(sectionEl => {
            sectionEl.classList.add('hidden');
        });

        // Show target section
        const targetSection = document.getElementById(section);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            this.uiState.currentSection = section;
            
            // Trigger section-specific initialization
            this.initializeSection(section);
        }
    }

    /**
     * Initialize section-specific functionality
     */
    initializeSection(section) {
        switch (section) {
            case 'dashboard':
                this.modules.uiManager?.initializeDashboard?.();
                break;
            case 'questions':
                this.modules.questionManager?.initializeQuestionView?.();
                break;
            case 'test':
                this.modules.testEngine?.initializeTestInterface?.();
                break;
            case 'results':
                this.modules.resultsAnalyzer?.initializeResultsView?.();
                break;
            case 'pdf-upload':
                this.modules.pdfProcessor?.initializePDFInterface?.();
                break;
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(event) {
        // Only if user preferences allow shortcuts
        if (!this.modules.userManager?.getCurrentUser()?.preferences?.keyboardShortcuts) {
            return;
        }

        const { ctrlKey, altKey, key } = event;
        
        if (ctrlKey && altKey) {
            switch (key) {
                case 'd':
                    event.preventDefault();
                    this.navigateToSection('dashboard');
                    break;
                case 'q':
                    event.preventDefault();
                    this.navigateToSection('questions');
                    break;
                case 't':
                    event.preventDefault();
                    this.navigateToSection('test');
                    break;
                case 'r':
                    event.preventDefault();
                    this.navigateToSection('results');
                    break;
                case 'p':
                    event.preventDefault();
                    this.navigateToSection('pdf-upload');
                    break;
            }
        }

        // Theme toggle shortcut
        if (ctrlKey && key === '`') {
            event.preventDefault();
            this.toggleTheme();
        }
    }

    /**
     * Perform auto-save
     */
    performAutoSave() {
        try {
            // Save current application state
            this.saveApplicationState();
            
            // Update auto-save indicator
            this.updateAutoSaveIndicator('saved');
            
            this.uiState.lastAutoSave = Date.now();
            
        } catch (error) {
            console.warn('Auto-save failed:', error);
            this.updateAutoSaveIndicator('error');
        }
    }

    /**
     * Save application state
     */
    saveApplicationState() {
        const state = {
            currentSection: this.uiState.currentSection,
            theme: this.uiState.theme,
            timestamp: Date.now()
        };

        localStorage.setItem('appState', JSON.stringify(state));

        // Trigger module saves
        Object.values(this.modules).forEach(module => {
            if (typeof module.saveState === 'function') {
                try {
                    module.saveState();
                } catch (error) {
                    console.warn('Module save failed:', error);
                }
            }
        });
    }

    /**
     * Update auto-save indicator
     */
    updateAutoSaveIndicator(status) {
        const indicator = document.getElementById('autoSaveIndicator');
        const text = document.getElementById('autoSaveText');
        
        if (!indicator || !text) return;

        const statusConfig = {
            saving: { text: 'Saving...', class: 'saving' },
            saved: { text: 'Saved', class: 'saved' },
            error: { text: 'Save Error', class: 'error' }
        };

        const config = statusConfig[status] || statusConfig.saved;
        
        text.textContent = config.text;
        indicator.className = `auto-save-indicator visible ${config.class}`;

        // Hide after delay for saved status
        if (status === 'saved') {
            setTimeout(() => {
                indicator.classList.remove('visible');
            }, 2000);
        }
    }

    /**
     * Toggle application theme
     */
    toggleTheme() {
        const newTheme = this.uiState.theme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    /**
     * Set application theme
     */
    setTheme(theme) {
        this.uiState.theme = theme;
        this.applyTheme(theme);
        localStorage.setItem('appTheme', theme);
        
        // Update user preferences if logged in
        if (this.modules.userManager?.getCurrentUser()) {
            const user = this.modules.userManager.getCurrentUser();
            user.preferences.theme = theme;
            this.modules.userManager.saveUsers();
        }
    }

    /**
     * Apply theme to the application
     */
    applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.setAttribute('data-theme', theme);
            themeToggle.title = theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
        }
    }

    /**
     * Show welcome screen
     */
    showWelcomeScreen() {
        const welcomeScreen = document.getElementById('welcomeScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (welcomeScreen) {
            welcomeScreen.classList.remove('hidden');
        }
        
        if (mainApp) {
            mainApp.classList.add('hidden');
        }
    }

    /**
     * Show main application
     */
    showMainApplication() {
        const welcomeScreen = document.getElementById('welcomeScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (welcomeScreen) {
            welcomeScreen.classList.add('hidden');
        }
        
        if (mainApp) {
            mainApp.classList.remove('hidden');
        }
        
        // Initialize dashboard by default
        this.navigateToSection('dashboard');
    }

    /**
     * Handle application focus (when user returns to tab)
     */
    handleApplicationFocus() {
        // Refresh data if needed
        this.refreshApplicationData();
        
        // Update session activity
        if (this.modules.userManager) {
            this.modules.userManager.updateLastActivity();
        }
    }

    /**
     * Refresh application data
     */
    refreshApplicationData() {
        // Refresh current section data
        const currentSection = this.uiState.currentSection;
        
        switch (currentSection) {
            case 'dashboard':
                this.modules.uiManager?.refreshDashboard?.();
                break;
            case 'results':
                this.modules.resultsAnalyzer?.refreshResults?.();
                break;
        }
    }

    /**
     * Handle global errors
     */
    handleGlobalError(error) {
        console.error('Application error:', error);
        
        // Show user-friendly error message
        const errorMessage = this.getErrorMessage(error);
        this.showErrorNotification(errorMessage);
        
        // Save error details for debugging
        this.logError(error);
    }

    /**
     * Get user-friendly error message
     */
    getErrorMessage(error) {
        if (error.message?.includes('PDF')) {
            return '⚠️ An error occurred during PDF processing. Please try again.';
        } else if (error.message?.includes('memory')) {
            return '⚠️ Memory limit reached. Please refresh the page.';
        } else if (error.message?.includes('network')) {
            return '⚠️ Network error. Please check your connection.';
        } else {
            return '⚠️ An unexpected error occurred. Please refresh the page if the problem persists.';
        }
    }

    /**
     * Show error notification
     */
    showErrorNotification(message) {
        // Create or update error notification
        let notification = document.getElementById('errorNotification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'errorNotification';
            notification.className = 'error-notification';
            document.body.appendChild(notification);
        }
        
        notification.textContent = message;
        notification.classList.add('visible');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('visible');
        }, 5000);
    }

    /**
     * Log error for debugging
     */
    logError(error) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            message: error.message,
            stack: error.stack,
            userAgent: navigator.userAgent,
            url: window.location.href,
            userId: this.modules.userManager?.getCurrentUser()?.id
        };

        // Save to localStorage for debugging
        try {
            const existingLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
            existingLogs.push(errorLog);
            
            // Keep only last 10 errors
            if (existingLogs.length > 10) {
                existingLogs.splice(0, existingLogs.length - 10);
            }
            
            localStorage.setItem('errorLogs', JSON.stringify(existingLogs));
        } catch (e) {
            console.warn('Failed to save error log:', e);
        }
    }

    /**
     * Handle initialization error
     */
    handleInitializationError(error) {
        console.error('Critical initialization error:', error);
        
        // Show critical error message
        document.body.innerHTML = `
            <div class="critical-error">
                <div class="error-content">
                    <h1>⚠️ Application Failed to Initialize</h1>
                    <p>The RRB Mock Test application encountered a critical error during startup.</p>
                    <details>
                        <summary>Error Details</summary>
                        <pre>${error.message}\n${error.stack}</pre>
                    </details>
                    <button onclick="window.location.reload()">🔄 Reload Application</button>
                </div>
            </div>
        `;
    }

    /**
     * Get application information
     */
    getAppInfo() {
        return {
            name: this.config.name,
            version: this.config.version,
            initialized: this.initialized,
            currentSection: this.uiState.currentSection,
            modules: Object.keys(this.modules),
            currentUser: this.modules.userManager?.getCurrentUser()?.name
        };
    }

    /**
     * Performance monitoring
     */
    monitorPerformance() {
        if (window.performance && window.performance.memory) {
            const memory = window.performance.memory;
            
            console.log('📊 Memory Usage:', {
                used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + ' MB',
                total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + ' MB',
                limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + ' MB'
            });
            
            // Warn if memory usage is high
            if (memory.usedJSHeapSize > 100 * 1024 * 1024) { // > 100MB
                console.warn('⚠️ High memory usage detected');
                this.showErrorNotification('⚠️ High memory usage detected. Consider refreshing the page.');
            }
        }
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM loaded, starting RRB Mock Test App...');
    
    // Create global app instance
    window.app = new MockTestApp();
    
    // Performance monitoring
    setInterval(() => {
        if (window.app) {
            window.app.monitorPerformance();
        }
    }, 60000); // Every minute
});

// Export for debugging (optional)
if (typeof window !== 'undefined') {
    window.MockTestApp = MockTestApp;
}

console.log('🎯 RRB Mock Test App v2.0 - Modular Version Loaded!');