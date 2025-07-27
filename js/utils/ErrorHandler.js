/**
 * ErrorHandler - Centralized Error Management Utility
 * 
 * This utility provides comprehensive error handling, logging, and user notification
 * functionality for the RRB Mock Test Application.
 * 
 * @author Ravi-katta-dev
 * @version 2.0.0
 * @created 2025-01-XX
 */

class ErrorHandler {
    constructor() {
        this.initialized = false;
        this.errorLog = [];
        this.maxLogSize = 100;
        this.reportingEnabled = true;
        this.debugMode = false;
        
        // Error categories
        this.categories = {
            NETWORK: 'network',
            STORAGE: 'storage',
            VALIDATION: 'validation',
            UI: 'ui',
            PERFORMANCE: 'performance',
            SECURITY: 'security',
            UNKNOWN: 'unknown'
        };
        
        // Error severity levels
        this.severity = {
            LOW: 'low',
            MEDIUM: 'medium',
            HIGH: 'high',
            CRITICAL: 'critical'
        };
    }

    /**
     * Initialize the Error Handler
     */
    init() {
        if (this.initialized) return;
        
        console.log('Initializing Error Handler...');
        
        this.setupGlobalErrorHandlers();
        this.loadStoredErrors();
        this.setupErrorReporting();
        
        this.initialized = true;
        console.log('Error Handler initialized successfully');
    }

    /**
     * Setup global error event listeners
     */
    setupGlobalErrorHandlers() {
        // Handle uncaught JavaScript errors
        window.addEventListener('error', (event) => {
            this.handleError({
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                error: event.error,
                category: this.categories.UNKNOWN,
                severity: this.severity.HIGH,
                timestamp: Date.now()
            });
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                message: `Unhandled Promise Rejection: ${event.reason}`,
                error: event.reason,
                category: this.categories.UNKNOWN,
                severity: this.severity.MEDIUM,
                timestamp: Date.now()
            });
        });

        // Handle resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.handleError({
                    message: `Resource loading failed: ${event.target.src || event.target.href}`,
                    category: this.categories.NETWORK,
                    severity: this.severity.LOW,
                    timestamp: Date.now()
                }, true);
            }
        }, true);
    }

    /**
     * Handle and process errors
     */
    handleError(errorInfo, capture = true) {
        try {
            // Enhance error information
            const enhancedError = this.enhanceErrorInfo(errorInfo);
            
            // Log the error
            if (capture) {
                this.logError(enhancedError);
            }
            
            // Show user notification if appropriate
            this.showErrorNotification(enhancedError);
            
            // Report error if enabled
            if (this.reportingEnabled) {
                this.reportError(enhancedError);
            }
            
            // Debug logging
            if (this.debugMode) {
                console.group('🚨 Error Details');
                console.error('Error Info:', enhancedError);
                console.trace('Stack Trace');
                console.groupEnd();
            }
            
        } catch (handlerError) {
            console.error('Error in error handler:', handlerError);
        }
    }

    /**
     * Enhance error information with additional context
     */
    enhanceErrorInfo(errorInfo) {
        return {
            id: this.generateErrorId(),
            timestamp: errorInfo.timestamp || Date.now(),
            message: errorInfo.message || 'Unknown error',
            category: errorInfo.category || this.categories.UNKNOWN,
            severity: errorInfo.severity || this.severity.MEDIUM,
            stack: errorInfo.error?.stack || new Error().stack,
            userAgent: navigator.userAgent,
            url: window.location.href,
            user: this.getCurrentUser(),
            sessionId: this.getSessionId(),
            appVersion: this.getAppVersion(),
            ...errorInfo
        };
    }

    /**
     * Log error to internal storage
     */
    logError(errorInfo) {
        this.errorLog.unshift(errorInfo);
        
        // Maintain log size limit
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog = this.errorLog.slice(0, this.maxLogSize);
        }
        
        // Persist to storage
        this.saveErrorLog();
    }

    /**
     * Show user-friendly error notification
     */
    showErrorNotification(errorInfo) {
        const { severity, category, message } = errorInfo;
        
        // Don't show notifications for low severity errors
        if (severity === this.severity.LOW) return;
        
        let userMessage = this.getUserFriendlyMessage(category, message);
        let notificationType = 'error';
        
        // Adjust message and type based on severity
        switch (severity) {
            case this.severity.CRITICAL:
                userMessage = `Critical Error: ${userMessage}`;
                notificationType = 'critical';
                break;
            case this.severity.HIGH:
                userMessage = `Error: ${userMessage}`;
                break;
            case this.severity.MEDIUM:
                userMessage = `Warning: ${userMessage}`;
                notificationType = 'warning';
                break;
        }
        
        this.showNotification(userMessage, notificationType);
    }

    /**
     * Get user-friendly error message
     */
    getUserFriendlyMessage(category, originalMessage) {
        const friendlyMessages = {
            [this.categories.NETWORK]: 'Network connection issue. Please check your internet connection.',
            [this.categories.STORAGE]: 'Unable to save data. Please try again.',
            [this.categories.VALIDATION]: 'Please check your input and try again.',
            [this.categories.UI]: 'Interface error occurred. Please refresh the page.',
            [this.categories.PERFORMANCE]: 'Performance issue detected. The app may run slowly.',
            [this.categories.SECURITY]: 'Security error detected. Please contact support.',
            [this.categories.UNKNOWN]: 'An unexpected error occurred. Please try again.'
        };
        
        return friendlyMessages[category] || friendlyMessages[this.categories.UNKNOWN];
    }

    /**
     * Show notification to user
     */
    showNotification(message, type = 'error') {
        // Try to use UI Manager if available
        if (window.UIManager && window.UIManager.showNotification) {
            window.UIManager.showNotification(message, type);
            return;
        }
        
        // Fallback to basic notification
        this.showBasicNotification(message, type);
    }

    /**
     * Basic notification fallback
     */
    showBasicNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Add styles if not present
        this.ensureNotificationStyles();
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-remove after delay
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    /**
     * Get notification icon for type
     */
    getNotificationIcon(type) {
        const icons = {
            error: '❌',
            warning: '⚠️',
            critical: '🚨',
            info: 'ℹ️',
            success: '✅'
        };
        return icons[type] || icons.error;
    }

    /**
     * Ensure basic notification styles are present
     */
    ensureNotificationStyles() {
        if (document.getElementById('error-handler-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'error-handler-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                z-index: 10000;
                max-width: 400px;
                animation: slideIn 0.3s ease-out;
            }
            .notification--error { border-left: 4px solid #e53e3e; }
            .notification--warning { border-left: 4px solid #d69e2e; }
            .notification--critical { border-left: 4px solid #c53030; }
            .notification-content {
                padding: 16px;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .notification-icon { font-size: 18px; }
            .notification-message { flex: 1; font-size: 14px; }
            .notification-close {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                opacity: 0.7;
            }
            .notification-close:hover { opacity: 1; }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }

    /**
     * Report error to external service (if configured)
     */
    reportError(errorInfo) {
        // This would typically send to an error reporting service
        // For now, just log to console in debug mode
        if (this.debugMode) {
            console.log('Reporting error:', errorInfo);
        }
    }

    /**
     * Create custom error with category and severity
     */
    createError(message, category = this.categories.UNKNOWN, severity = this.severity.MEDIUM, additionalInfo = {}) {
        const error = new Error(message);
        error.category = category;
        error.severity = severity;
        error.additionalInfo = additionalInfo;
        return error;
    }

    /**
     * Throw and handle custom error
     */
    throwError(message, category, severity, additionalInfo) {
        const error = this.createError(message, category, severity, additionalInfo);
        this.handleError({
            message,
            category,
            severity,
            error,
            ...additionalInfo
        });
        throw error;
    }

    /**
     * Safe function execution with error handling
     */
    safeExecute(fn, context = null, ...args) {
        try {
            return fn.apply(context, args);
        } catch (error) {
            this.handleError({
                message: `Safe execution failed: ${error.message}`,
                error,
                category: this.categories.UNKNOWN,
                severity: this.severity.MEDIUM
            });
            return null;
        }
    }

    /**
     * Safe async function execution with error handling
     */
    async safeExecuteAsync(fn, context = null, ...args) {
        try {
            return await fn.apply(context, args);
        } catch (error) {
            this.handleError({
                message: `Safe async execution failed: ${error.message}`,
                error,
                category: this.categories.UNKNOWN,
                severity: this.severity.MEDIUM
            });
            return null;
        }
    }

    /**
     * Get error statistics
     */
    getErrorStats() {
        const stats = {
            total: this.errorLog.length,
            categories: {},
            severity: {},
            recent: this.errorLog.slice(0, 10)
        };
        
        this.errorLog.forEach(error => {
            stats.categories[error.category] = (stats.categories[error.category] || 0) + 1;
            stats.severity[error.severity] = (stats.severity[error.severity] || 0) + 1;
        });
        
        return stats;
    }

    /**
     * Clear error log
     */
    clearErrorLog() {
        this.errorLog = [];
        this.saveErrorLog();
    }

    /**
     * Helper methods
     */
    generateErrorId() {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getCurrentUser() {
        try {
            return window.userManager?.getCurrentUser?.()?.name || 'Unknown';
        } catch {
            return 'Unknown';
        }
    }

    getSessionId() {
        return sessionStorage.getItem('sessionId') || 'unknown';
    }

    getAppVersion() {
        return window.APP_CONFIG?.APP_VERSION || '2.0.0';
    }

    saveErrorLog() {
        try {
            localStorage.setItem('errorLog', JSON.stringify(this.errorLog.slice(0, 50))); // Save only last 50 errors
        } catch (error) {
            console.warn('Could not save error log:', error);
        }
    }

    loadStoredErrors() {
        try {
            const stored = localStorage.getItem('errorLog');
            if (stored) {
                this.errorLog = JSON.parse(stored);
            }
        } catch (error) {
            console.warn('Could not load stored errors:', error);
            this.errorLog = [];
        }
    }

    setupErrorReporting() {
        // Setup periodic error reporting if configured
        // This is where you would integrate with external error services
    }
}

// Make ErrorHandler available globally
window.ErrorHandler = new ErrorHandler();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
}