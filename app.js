/**
 * RRB Technician Grade-3 Signal Mock Test Application - Main Entry Point
 * 
 * This is the main entry point for the RRB Mock Test Application.
 * It initializes the MockTestApp class and sets up the application.
 * 
 * @author Ravi-katta-dev
 * @version 2.0.0 - Modularized
 * @created 2025-01-XX
 */

// Global application instance
let app = null;

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎯 DOM loaded, starting RRB Mock Test App...');
    
    try {
        // Initialize error handling first
        if (window.ErrorHandler) {
            await window.ErrorHandler.init();
        }
        
        // Initialize performance monitoring
        if (window.PerformanceMonitor) {
            await window.PerformanceMonitor.init();
        }
        
        // Mark app initialization start
        if (window.PerformanceMonitor) {
            window.PerformanceMonitor.mark('app-init-start');
        }
        
        // Create and initialize the main application
        app = new MockTestApp();
        await app.initialize();
        
        // Mark app initialization end
        if (window.PerformanceMonitor) {
            window.PerformanceMonitor.mark('app-init-end');
            const initTime = window.PerformanceMonitor.measure('app-initialization', 'app-init-start', 'app-init-end');
            console.log(`📊 App initialization took ${initTime?.toFixed(2) || 'N/A'}ms`);
        }
        
        // Setup global app reference for backwards compatibility
        window.app = app;
        
        console.log('✅ RRB Mock Test App started successfully!');
        
    } catch (error) {
        console.error('❌ Failed to start application:', error);
        
        // Show error to user
        if (window.ErrorHandler) {
            window.ErrorHandler.handleError({
                message: 'Failed to start application. Please refresh the page.',
                error,
                category: window.ErrorHandler.categories.UNKNOWN,
                severity: window.ErrorHandler.severity.CRITICAL
            });
        } else {
            // Fallback error display
            document.body.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #f5f5f5;">
                    <div style="text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                        <h2 style="color: #e53e3e; margin-bottom: 1rem;">⚠️ Application Error</h2>
                        <p style="margin-bottom: 1rem;">Failed to start the application. Please refresh the page.</p>
                        <button onclick="location.reload()" style="padding: 0.5rem 1rem; background: #3182ce; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Refresh Page
                        </button>
                    </div>
                </div>
            `;
        }
    }
});

/**
 * Handle page visibility changes for performance optimization
 */
document.addEventListener('visibilitychange', () => {
    if (app && app.isInitialized()) {
        if (document.hidden) {
            // Page is hidden - pause performance monitoring, save state
            if (window.PerformanceMonitor) {
                // Reduce monitoring frequency when page is hidden
            }
            app.saveApplicationState();
        } else {
            // Page is visible - resume normal operation
            if (window.PerformanceMonitor) {
                // Resume normal monitoring
            }
        }
    }
});

/**
 * Handle before page unload
 */
window.addEventListener('beforeunload', () => {
    if (app && app.isInitialized()) {
        app.saveApplicationState();
    }
});

/**
 * Expose app instance for backwards compatibility and debugging
 * These functions maintain compatibility with existing HTML onclick handlers
 */
window.toggleSelectAll = function() {
    if (window.QuestionBank && window.QuestionBank.toggleSelectAll) {
        const checkbox = document.getElementById('selectAllQuestions');
        window.QuestionBank.toggleSelectAll(checkbox?.checked || false);
    }
};

window.deleteSelectedQuestions = function() {
    if (window.QuestionBank && window.QuestionBank.deleteSelectedQuestions) {
        window.QuestionBank.deleteSelectedQuestions();
    }
};

// Export app instance for debugging
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { app };
}

console.log('🎯 RRB Mock Test App v2.0 - Modular Version Loaded!');