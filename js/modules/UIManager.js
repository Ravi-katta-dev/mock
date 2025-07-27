/**
 * UI Manager Module
 * Handles UI state management, theme switching, responsive design, and user interface interactions
 */

class UIManager {
    constructor() {
        this.initialized = false;
        this.currentTheme = 'light';
        this.currentView = 'welcome';
        this.modals = new Map();
        this.toasts = [];
        this.activeElements = new Set();
        this.responsiveBreakpoints = {
            mobile: 768,
            tablet: 1024,
            desktop: 1200
        };
        this.uiState = {
            sidebar: {
                isOpen: false,
                isPinned: false
            },
            notifications: {
                enabled: true,
                position: 'top-right'
            },
            accessibility: {
                highContrast: false,
                reducedMotion: false,
                fontSize: 'normal'
            }
        };
    }

    /**
     * Initialize the UI Manager module
     */
    init() {
        if (this.initialized) return;
        
        console.log('Initializing UI Manager module...');
        this.setupUIEventListeners();
        this.initializeTheme();
        this.initializeResponsiveDesign();
        this.loadUIState();
        this.initialized = true;
        console.log('UI Manager module initialized successfully');
    }

    /**
     * Switch between views (sections of the application)
     * @param {string} viewName - Name of the view to switch to
     * @param {Object} options - View options
     * @returns {Object} - Switch result
     */
    switchView(viewName, options = {}) {
        try {
            const validViews = ['welcome', 'dashboard', 'question-bank', 'take-test', 'analytics', 'profile'];
            
            if (!validViews.includes(viewName)) {
                return {
                    success: false,
                    error: 'Invalid view name'
                };
            }

            // Hide current view
            this.hideAllViews();

            // Show new view
            const viewElement = document.getElementById(viewName + '-section') || 
                              document.querySelector(`[data-view="${viewName}"]`);
            
            if (viewElement) {
                viewElement.style.display = 'block';
                viewElement.classList.add('active-view');
            }

            // Update navigation
            this.updateNavigation(viewName);

            // Update browser history if needed
            if (options.updateHistory !== false) {
                this.updateBrowserHistory(viewName);
            }

            this.currentView = viewName;
            this.saveUIState();

            // Trigger view change event
            this.dispatchUIEvent('viewChanged', {
                previousView: this.currentView,
                newView: viewName,
                options
            });

            console.log('View switched to:', viewName);
            return {
                success: true,
                view: viewName
            };
        } catch (error) {
            console.error('Failed to switch view:', error);
            return {
                success: false,
                error: 'Failed to switch view',
                details: error.message
            };
        }
    }

    /**
     * Hide all views
     */
    hideAllViews() {
        const allViews = document.querySelectorAll('[data-view], .view-section');
        allViews.forEach(view => {
            view.style.display = 'none';
            view.classList.remove('active-view');
        });
    }

    /**
     * Update navigation UI
     * @param {string} activeView - Currently active view
     */
    updateNavigation(activeView) {
        // Update sidebar navigation
        const navItems = document.querySelectorAll('.nav-item, [data-nav-target]');
        navItems.forEach(item => {
            const target = item.getAttribute('data-nav-target') || 
                          item.getAttribute('data-view');
            
            if (target === activeView) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update breadcrumbs if available
        this.updateBreadcrumbs(activeView);
    }

    /**
     * Update breadcrumbs
     * @param {string} currentView - Current view name
     */
    updateBreadcrumbs(currentView) {
        const breadcrumbContainer = document.querySelector('.breadcrumbs');
        if (!breadcrumbContainer) return;

        const viewTitles = {
            'welcome': 'Welcome',
            'dashboard': 'Dashboard',
            'question-bank': 'Question Bank',
            'take-test': 'Take Test',
            'analytics': 'Analytics',
            'profile': 'Profile'
        };

        const title = viewTitles[currentView] || currentView;
        breadcrumbContainer.innerHTML = `
            <span class="breadcrumb-item">Home</span>
            <span class="breadcrumb-separator">></span>
            <span class="breadcrumb-item active">${title}</span>
        `;
    }

    /**
     * Update browser history
     * @param {string} viewName - View name to add to history
     */
    updateBrowserHistory(viewName) {
        if (typeof window.history !== 'undefined') {
            const url = new URL(window.location);
            url.searchParams.set('view', viewName);
            window.history.pushState({ view: viewName }, '', url);
        }
    }

    /**
     * Switch theme
     * @param {string} themeName - Theme name ('light', 'dark', 'auto')
     * @returns {Object} - Switch result
     */
    switchTheme(themeName = null) {
        try {
            // If no theme specified, toggle between light and dark
            if (!themeName) {
                themeName = this.currentTheme === 'light' ? 'dark' : 'light';
            }

            const validThemes = ['light', 'dark', 'auto'];
            if (!validThemes.includes(themeName)) {
                return {
                    success: false,
                    error: 'Invalid theme name'
                };
            }

            // Handle auto theme
            if (themeName === 'auto') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                themeName = prefersDark ? 'dark' : 'light';
            }

            // Apply theme
            document.documentElement.setAttribute('data-theme', themeName);
            document.body.className = document.body.className.replace(/theme-\w+/g, '') + ` theme-${themeName}`;

            this.currentTheme = themeName;
            this.saveUIState();

            // Update theme toggle button
            this.updateThemeToggle(themeName);

            // Trigger theme change event
            this.dispatchUIEvent('themeChanged', {
                theme: themeName
            });

            console.log('Theme switched to:', themeName);
            return {
                success: true,
                theme: themeName
            };
        } catch (error) {
            console.error('Failed to switch theme:', error);
            return {
                success: false,
                error: 'Failed to switch theme',
                details: error.message
            };
        }
    }

    /**
     * Update theme toggle button
     * @param {string} currentTheme - Current theme
     */
    updateThemeToggle(currentTheme) {
        const themeToggle = document.getElementById('themeToggle') || 
                           document.querySelector('.theme-toggle');
        
        if (themeToggle) {
            themeToggle.setAttribute('data-theme', currentTheme);
            themeToggle.title = `Switch to ${currentTheme === 'light' ? 'dark' : 'light'} theme`;
        }
    }

    /**
     * Show modal
     * @param {string} modalId - Modal ID
     * @param {Object} options - Modal options
     * @returns {Object} - Show result
     */
    showModal(modalId, options = {}) {
        try {
            const modal = document.getElementById(modalId) || 
                         document.querySelector(`[data-modal="${modalId}"]`);
            
            if (!modal) {
                return {
                    success: false,
                    error: 'Modal not found'
                };
            }

            // Store modal reference
            this.modals.set(modalId, {
                element: modal,
                options,
                openTime: Date.now()
            });

            // Show modal
            modal.style.display = 'flex';
            modal.classList.add('modal-open');
            
            // Add backdrop
            if (options.backdrop !== false) {
                modal.classList.add('modal-backdrop');
            }

            // Handle escape key
            if (options.escapeKey !== false) {
                this.setupModalEscapeKey(modalId);
            }

            // Focus management
            this.setupModalFocus(modal);

            // Trigger modal event
            this.dispatchUIEvent('modalShown', {
                modalId,
                modal,
                options
            });

            console.log('Modal shown:', modalId);
            return {
                success: true,
                modalId
            };
        } catch (error) {
            console.error('Failed to show modal:', error);
            return {
                success: false,
                error: 'Failed to show modal',
                details: error.message
            };
        }
    }

    /**
     * Hide modal
     * @param {string} modalId - Modal ID
     * @returns {Object} - Hide result
     */
    hideModal(modalId) {
        try {
            const modalData = this.modals.get(modalId);
            if (!modalData) {
                return {
                    success: false,
                    error: 'Modal not found or not open'
                };
            }

            const modal = modalData.element;

            // Hide modal
            modal.style.display = 'none';
            modal.classList.remove('modal-open', 'modal-backdrop');

            // Clean up
            this.cleanupModalFocus(modal);
            this.modals.delete(modalId);

            // Trigger modal event
            this.dispatchUIEvent('modalHidden', {
                modalId,
                modal
            });

            console.log('Modal hidden:', modalId);
            return {
                success: true,
                modalId
            };
        } catch (error) {
            console.error('Failed to hide modal:', error);
            return {
                success: false,
                error: 'Failed to hide modal',
                details: error.message
            };
        }
    }

    /**
     * Show toast notification
     * @param {Object} toastOptions - Toast options
     * @returns {Object} - Show result
     */
    showToast(toastOptions) {
        try {
            const defaultOptions = {
                type: 'info',
                message: '',
                duration: 4000,
                closable: true,
                position: 'top-right'
            };

            const options = { ...defaultOptions, ...toastOptions };
            const toastId = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

            // Create toast element
            const toast = this.createToastElement(toastId, options);
            
            // Add to container
            const container = this.getToastContainer(options.position);
            container.appendChild(toast);

            // Store toast reference
            this.toasts.push({
                id: toastId,
                element: toast,
                options,
                createdAt: Date.now()
            });

            // Show toast with animation
            setTimeout(() => {
                toast.classList.add('toast--show');
            }, 100);

            // Auto-hide if duration is set
            if (options.duration > 0) {
                setTimeout(() => {
                    this.hideToast(toastId);
                }, options.duration);
            }

            // Trigger toast event
            this.dispatchUIEvent('toastShown', {
                toastId,
                options
            });

            console.log('Toast shown:', toastId);
            return {
                success: true,
                toastId
            };
        } catch (error) {
            console.error('Failed to show toast:', error);
            return {
                success: false,
                error: 'Failed to show toast',
                details: error.message
            };
        }
    }

    /**
     * Hide toast notification
     * @param {string} toastId - Toast ID
     * @returns {Object} - Hide result
     */
    hideToast(toastId) {
        try {
            const toastIndex = this.toasts.findIndex(t => t.id === toastId);
            if (toastIndex === -1) {
                return {
                    success: false,
                    error: 'Toast not found'
                };
            }

            const toast = this.toasts[toastIndex];
            
            // Hide with animation
            toast.element.classList.add('toast--hide');
            toast.element.classList.remove('toast--show');

            // Remove after animation
            setTimeout(() => {
                if (toast.element.parentNode) {
                    toast.element.parentNode.removeChild(toast.element);
                }
                this.toasts.splice(toastIndex, 1);
            }, 300);

            // Trigger toast event
            this.dispatchUIEvent('toastHidden', {
                toastId
            });

            return {
                success: true,
                toastId
            };
        } catch (error) {
            console.error('Failed to hide toast:', error);
            return {
                success: false,
                error: 'Failed to hide toast',
                details: error.message
            };
        }
    }

    /**
     * Create toast element
     * @param {string} toastId - Toast ID
     * @param {Object} options - Toast options
     * @returns {HTMLElement} - Toast element
     */
    createToastElement(toastId, options) {
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `toast toast--${options.type}`;

        const iconMap = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        toast.innerHTML = `
            <div class="toast__content">
                <div class="toast__icon">${iconMap[options.type] || 'ℹ'}</div>
                <div class="toast__message">${options.message}</div>
            </div>
            ${options.closable ? '<button class="toast__dismiss" aria-label="Close">×</button>' : ''}
        `;

        // Add close functionality
        if (options.closable) {
            const closeBtn = toast.querySelector('.toast__dismiss');
            closeBtn.addEventListener('click', () => {
                this.hideToast(toastId);
            });
        }

        return toast;
    }

    /**
     * Get or create toast container
     * @param {string} position - Toast position
     * @returns {HTMLElement} - Container element
     */
    getToastContainer(position) {
        let container = document.querySelector('.toast-container');
        
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        container.className = `toast-container toast-container--${position}`;
        return container;
    }

    /**
     * Toggle sidebar
     * @returns {Object} - Toggle result
     */
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar') || 
                       document.querySelector('.sidebar');
        
        if (!sidebar) {
            return {
                success: false,
                error: 'Sidebar not found'
            };
        }

        this.uiState.sidebar.isOpen = !this.uiState.sidebar.isOpen;
        
        if (this.uiState.sidebar.isOpen) {
            sidebar.classList.add('sidebar--open');
        } else {
            sidebar.classList.remove('sidebar--open');
        }

        this.saveUIState();

        this.dispatchUIEvent('sidebarToggled', {
            isOpen: this.uiState.sidebar.isOpen
        });

        return {
            success: true,
            isOpen: this.uiState.sidebar.isOpen
        };
    }

    /**
     * Initialize theme from saved state or system preference
     */
    initializeTheme() {
        const savedTheme = localStorage.getItem('app-theme');
        if (savedTheme) {
            this.switchTheme(savedTheme);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.switchTheme(prefersDark ? 'dark' : 'light');
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (this.currentTheme === 'auto') {
                this.switchTheme('auto');
            }
        });
    }

    /**
     * Initialize responsive design features
     */
    initializeResponsiveDesign() {
        this.updateResponsiveClasses();
        
        window.addEventListener('resize', () => {
            this.updateResponsiveClasses();
        });
    }

    /**
     * Update responsive classes based on screen size
     */
    updateResponsiveClasses() {
        const width = window.innerWidth;
        const body = document.body;

        // Remove existing responsive classes
        body.classList.remove('is-mobile', 'is-tablet', 'is-desktop');

        // Add appropriate class
        if (width < this.responsiveBreakpoints.mobile) {
            body.classList.add('is-mobile');
        } else if (width < this.responsiveBreakpoints.tablet) {
            body.classList.add('is-tablet');
        } else {
            body.classList.add('is-desktop');
        }
    }

    /**
     * Setup modal escape key handling
     * @param {string} modalId - Modal ID
     */
    setupModalEscapeKey(modalId) {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                this.hideModal(modalId);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        
        document.addEventListener('keydown', handleEscape);
    }

    /**
     * Setup modal focus management
     * @param {HTMLElement} modal - Modal element
     */
    setupModalFocus(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }

    /**
     * Cleanup modal focus
     * @param {HTMLElement} modal - Modal element
     */
    cleanupModalFocus(modal) {
        // Return focus to previously focused element if needed
        const previouslyFocused = document.querySelector('[data-modal-trigger]');
        if (previouslyFocused) {
            previouslyFocused.focus();
        }
    }

    /**
     * Save UI state to localStorage
     */
    saveUIState() {
        try {
            const stateToSave = {
                theme: this.currentTheme,
                view: this.currentView,
                sidebar: this.uiState.sidebar,
                notifications: this.uiState.notifications,
                accessibility: this.uiState.accessibility
            };
            
            localStorage.setItem('ui-state', JSON.stringify(stateToSave));
            localStorage.setItem('app-theme', this.currentTheme);
        } catch (error) {
            console.warn('Failed to save UI state:', error);
        }
    }

    /**
     * Load UI state from localStorage
     */
    loadUIState() {
        try {
            const savedState = localStorage.getItem('ui-state');
            if (savedState) {
                const parsed = JSON.parse(savedState);
                
                this.currentTheme = parsed.theme || 'light';
                this.currentView = parsed.view || 'welcome';
                this.uiState = {
                    ...this.uiState,
                    ...parsed
                };
            }
        } catch (error) {
            console.warn('Failed to load UI state:', error);
        }
    }

    /**
     * Setup event listeners for UI functionality
     */
    setupUIEventListeners() {
        // Theme toggle
        document.addEventListener('click', (event) => {
            if (event.target.matches('.theme-toggle, #themeToggle')) {
                this.switchTheme();
            }
        });

        // View navigation
        document.addEventListener('click', (event) => {
            const navTarget = event.target.getAttribute('data-nav-target') ||
                             event.target.closest('[data-nav-target]')?.getAttribute('data-nav-target');
            
            if (navTarget) {
                event.preventDefault();
                this.switchView(navTarget);
            }
        });

        // Modal close buttons
        document.addEventListener('click', (event) => {
            if (event.target.matches('.modal-close, [data-modal-close]')) {
                const modalId = event.target.getAttribute('data-modal-close') ||
                               event.target.closest('.modal')?.id;
                
                if (modalId) {
                    this.hideModal(modalId);
                }
            }
        });

        // Sidebar toggle
        document.addEventListener('click', (event) => {
            if (event.target.matches('.sidebar-toggle, [data-sidebar-toggle]')) {
                this.toggleSidebar();
            }
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.view) {
                this.switchView(event.state.view, { updateHistory: false });
            }
        });
    }

    /**
     * Dispatch UI-related events
     * @param {string} eventType - Event type
     * @param {Object} data - Event data
     */
    dispatchUIEvent(eventType, data) {
        document.dispatchEvent(new CustomEvent(eventType, {
            detail: data
        }));
    }

    /**
     * Show loading state
     * @param {string} target - Target element selector or element
     * @param {Object} options - Loading options
     */
    showLoading(target, options = {}) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (!element) return;

        const loadingClass = options.className || 'loading';
        element.classList.add(loadingClass);
        
        if (options.message) {
            element.setAttribute('data-loading-message', options.message);
        }
    }

    /**
     * Hide loading state
     * @param {string} target - Target element selector or element
     */
    hideLoading(target) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (!element) return;

        element.classList.remove('loading');
        element.removeAttribute('data-loading-message');
    }

    /**
     * Get current UI state
     * @returns {Object} - Current UI state
     */
    getCurrentState() {
        return {
            theme: this.currentTheme,
            view: this.currentView,
            sidebar: this.uiState.sidebar,
            activeModals: Array.from(this.modals.keys()),
            activeToasts: this.toasts.length
        };
    }
}

// Create global instance
window.UIManager = new UIManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.UIManager.init();
    });
} else {
    window.UIManager.init();
}

console.log('UIManager module loaded successfully');