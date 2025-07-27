/**
 * UIManager.js - Comprehensive UI Management System
 * Handles all user interface interactions, responsive design, and accessibility
 * for the RRB Mock Test Application
 */

class UIManager {
    constructor(app) {
        this.app = app;
        this.currentSection = 'dashboard';
        this.modals = new Map();
        this.themes = ['light', 'dark'];
        this.currentTheme = localStorage.getItem('appTheme') || 'light';
        this.mobileBreakpoint = 768;
        this.touchStartX = 0;
        this.touchStartY = 0;
        
        // UI state management
        this.uiState = {
            isMobileMenuOpen: false,
            activeModal: null,
            focusTrap: null,
            announcer: null,
            keyboardNavigation: true,
            highContrastMode: false,
            reducedMotion: false
        };

        this.initialize();
    }

    /**
     * Initialize the UI Manager
     */
    initialize() {
        console.log('🎨 Initializing UI Manager...');
        
        this.setupThemeSystem();
        this.setupResponsiveDesign();
        this.setupAccessibility();
        this.setupMobileNavigation();
        this.setupTouchGestures();
        this.setupKeyboardShortcuts();
        this.setupProgressIndicators();
        this.setupModals();
        this.setupNotifications();
        
        // Apply user preferences
        this.applyUserPreferences();
        
        console.log('✅ UI Manager initialized successfully');
    }

    /**
     * Theme System Setup
     */
    setupThemeSystem() {
        this.applyTheme(this.currentTheme);
        
        // Create theme toggle button if it doesn't exist
        if (!document.getElementById('themeToggle')) {
            this.createThemeToggle();
        }
        
        // Listen for system theme changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                if (!localStorage.getItem('appTheme')) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    /**
     * Apply theme to the application
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('appTheme', theme);
        
        // Update theme toggle button
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.innerHTML = theme === 'light' ? '🌙' : '☀️';
            themeToggle.setAttribute('title', 
                theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'
            );
        }
        
        this.announceToScreenReader(`Switched to ${theme} theme`);
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    /**
     * Create theme toggle button
     */
    createThemeToggle() {
        const themeToggle = document.createElement('button');
        themeToggle.id = 'themeToggle';
        themeToggle.className = 'theme-toggle';
        themeToggle.innerHTML = this.currentTheme === 'light' ? '🌙' : '☀️';
        themeToggle.setAttribute('title', 'Toggle Dark Mode');
        themeToggle.setAttribute('aria-label', 'Toggle dark mode');
        themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Insert into header or body
        const header = document.querySelector('.app-header') || document.body;
        header.appendChild(themeToggle);
    }

    /**
     * Setup responsive design system
     */
    setupResponsiveDesign() {
        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 150);
        });

        // Initial setup
        this.handleResize();
    }

    /**
     * Handle window resize events
     */
    handleResize() {
        const width = window.innerWidth;
        const isMobile = width <= this.mobileBreakpoint;
        
        // Update mobile state
        document.body.classList.toggle('mobile-view', isMobile);
        document.body.classList.toggle('desktop-view', !isMobile);
        
        // Close mobile menu if switching to desktop
        if (!isMobile && this.uiState.isMobileMenuOpen) {
            this.closeMobileMenu();
        }
        
        // Adjust test interface for mobile
        this.adjustTestInterfaceForMobile(isMobile);
        
        // Recalculate modal positions
        this.repositionModals();
    }

    /**
     * Adjust test interface for mobile devices
     */
    adjustTestInterfaceForMobile(isMobile) {
        const testInterface = document.getElementById('testInterface');
        if (!testInterface) return;

        if (isMobile) {
            // Stack question and palette vertically on mobile
            testInterface.classList.add('mobile-layout');
            
            // Ensure question palette is collapsible
            const palette = testInterface.querySelector('.question-palette');
            if (palette && !palette.querySelector('.palette-toggle')) {
                this.addPaletteToggle(palette);
            }
        } else {
            testInterface.classList.remove('mobile-layout');
        }
    }

    /**
     * Add toggle button for question palette on mobile
     */
    addPaletteToggle(palette) {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'palette-toggle btn btn--secondary btn--sm';
        toggleBtn.innerHTML = '📋 Questions';
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.addEventListener('click', () => {
            const isExpanded = palette.classList.toggle('expanded');
            toggleBtn.setAttribute('aria-expanded', isExpanded);
            toggleBtn.innerHTML = isExpanded ? '❌ Close' : '📋 Questions';
        });
        
        palette.insertBefore(toggleBtn, palette.firstChild);
    }

    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        this.createScreenReaderAnnouncer();
        this.setupSkipLinks();
        this.setupFocusManagement();
        this.setupAriaLabels();
        this.setupKeyboardNavigation();
        this.detectReducedMotion();
        this.detectHighContrast();
    }

    /**
     * Create screen reader announcer
     */
    createScreenReaderAnnouncer() {
        if (this.uiState.announcer) return;
        
        const announcer = document.createElement('div');
        announcer.id = 'screen-reader-announcements';
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        announcer.style.cssText = `
            position: absolute !important;
            width: 1px !important;
            height: 1px !important;
            padding: 0 !important;
            margin: -1px !important;
            overflow: hidden !important;
            clip: rect(0, 0, 0, 0) !important;
            white-space: nowrap !important;
            border: 0 !important;
        `;
        
        document.body.appendChild(announcer);
        this.uiState.announcer = announcer;
    }

    /**
     * Announce message to screen readers
     */
    announceToScreenReader(message) {
        if (!this.uiState.announcer) return;
        
        this.uiState.announcer.textContent = message;
        
        // Clear after delay to allow re-announcements
        setTimeout(() => {
            this.uiState.announcer.textContent = '';
        }, 1000);
    }

    /**
     * Setup skip links for accessibility
     */
    setupSkipLinks() {
        if (document.querySelector('.skip-links')) return;
        
        const skipLinks = document.createElement('div');
        skipLinks.className = 'skip-links';
        skipLinks.innerHTML = `
            <a href="#main-content" class="skip-link">Skip to main content</a>
            <a href="#sidebar-nav" class="skip-link">Skip to navigation</a>
        `;
        
        // Add CSS for skip links
        const style = document.createElement('style');
        style.textContent = `
            .skip-links { position: absolute; top: -40px; left: 6px; z-index: 9999; }
            .skip-link {
                position: absolute;
                top: -40px;
                left: 6px;
                background: var(--color-primary);
                color: white;
                padding: 8px;
                text-decoration: none;
                border-radius: 4px;
                z-index: 9999;
            }
            .skip-link:focus {
                top: 6px;
            }
        `;
        document.head.appendChild(style);
        
        document.body.insertBefore(skipLinks, document.body.firstChild);
        
        // Add IDs to main content areas
        const mainContent = document.querySelector('.main-content');
        const sidebar = document.querySelector('.sidebar');
        
        if (mainContent && !mainContent.id) mainContent.id = 'main-content';
        if (sidebar && !sidebar.id) sidebar.id = 'sidebar-nav';
    }

    /**
     * Setup focus management
     */
    setupFocusManagement() {
        // Track keyboard usage
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('using-keyboard');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('using-keyboard');
        });
        
        // Enhance focus visibility
        const style = document.createElement('style');
        style.textContent = `
            .using-keyboard *:focus {
                outline: 2px solid var(--color-primary) !important;
                outline-offset: 2px !important;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Setup ARIA labels and roles
     */
    setupAriaLabels() {
        // Enhance existing elements with better ARIA labels
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            if (!link.getAttribute('aria-label')) {
                const text = link.textContent.trim();
                link.setAttribute('aria-label', `Navigate to ${text} section`);
            }
        });
        
        // Add landmark roles
        const main = document.querySelector('.main-content');
        if (main) main.setAttribute('role', 'main');
        
        const nav = document.querySelector('.sidebar');
        if (nav) nav.setAttribute('role', 'navigation');
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Global keyboard shortcuts
            if (e.target.matches('input, textarea, select') && !e.ctrlKey && !e.metaKey) {
                return; // Don't interfere with form inputs
            }
            
            switch(e.key) {
                case 'Escape':
                    this.handleEscapeKey();
                    break;
                case 'F1':
                    e.preventDefault();
                    this.showHelpModal();
                    break;
                case 'h':
                case 'H':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.showKeyboardShortcuts();
                    }
                    break;
            }
        });
    }

    /**
     * Handle escape key press
     */
    handleEscapeKey() {
        if (this.uiState.activeModal) {
            this.hideModal(this.uiState.activeModal);
        } else if (this.uiState.isMobileMenuOpen) {
            this.closeMobileMenu();
        }
    }

    /**
     * Detect reduced motion preference
     */
    detectReducedMotion() {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.uiState.reducedMotion = mediaQuery.matches;
        
        if (this.uiState.reducedMotion) {
            document.body.classList.add('reduced-motion');
        }
        
        mediaQuery.addEventListener('change', (e) => {
            this.uiState.reducedMotion = e.matches;
            document.body.classList.toggle('reduced-motion', e.matches);
        });
    }

    /**
     * Detect high contrast preference
     */
    detectHighContrast() {
        const mediaQuery = window.matchMedia('(prefers-contrast: high)');
        this.uiState.highContrastMode = mediaQuery.matches;
        
        if (this.uiState.highContrastMode) {
            document.body.classList.add('high-contrast');
        }
        
        mediaQuery.addEventListener('change', (e) => {
            this.uiState.highContrastMode = e.matches;
            document.body.classList.toggle('high-contrast', e.matches);
        });
    }

    /**
     * Setup mobile navigation
     */
    setupMobileNavigation() {
        const sidebar = document.querySelector('.sidebar');
        const header = document.querySelector('.app-header');
        
        if (!sidebar || !header) return;
        
        // Add mobile menu button if it doesn't exist
        if (!header.querySelector('.mobile-menu-btn')) {
            this.createMobileMenuButton(header);
        }
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.uiState.isMobileMenuOpen && 
                !sidebar.contains(e.target) && 
                !e.target.closest('.mobile-menu-btn')) {
                this.closeMobileMenu();
            }
        });
        
        // Close menu when navigating
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= this.mobileBreakpoint) {
                    this.closeMobileMenu();
                }
            });
        });
    }

    /**
     * Create mobile menu button
     */
    createMobileMenuButton(header) {
        const menuBtn = document.createElement('button');
        menuBtn.className = 'mobile-menu-btn';
        menuBtn.innerHTML = '☰';
        menuBtn.setAttribute('aria-label', 'Toggle navigation menu');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.addEventListener('click', () => this.toggleMobileMenu());
        
        // Add CSS for mobile menu button
        const style = document.createElement('style');
        style.textContent = `
            .mobile-menu-btn {
                display: none;
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0.5rem;
                color: var(--color-text);
            }
            
            @media (max-width: 768px) {
                .mobile-menu-btn { display: block; }
            }
        `;
        document.head.appendChild(style);
        
        header.insertBefore(menuBtn, header.firstChild);
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        if (this.uiState.isMobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    /**
     * Open mobile menu
     */
    openMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const menuBtn = document.querySelector('.mobile-menu-btn');
        
        if (!sidebar) return;
        
        sidebar.classList.add('open');
        this.uiState.isMobileMenuOpen = true;
        
        if (menuBtn) {
            menuBtn.setAttribute('aria-expanded', 'true');
            menuBtn.innerHTML = '✕';
        }
        
        // Trap focus in menu
        this.trapFocus(sidebar);
        
        this.announceToScreenReader('Navigation menu opened');
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const menuBtn = document.querySelector('.mobile-menu-btn');
        
        if (!sidebar) return;
        
        sidebar.classList.remove('open');
        this.uiState.isMobileMenuOpen = false;
        
        if (menuBtn) {
            menuBtn.setAttribute('aria-expanded', 'false');
            menuBtn.innerHTML = '☰';
        }
        
        this.releaseFocus();
        
        this.announceToScreenReader('Navigation menu closed');
    }

    /**
     * Trap focus within an element
     */
    trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        const handleTabKey = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
            
            if (e.key === 'Escape') {
                this.releaseFocus();
                if (this.uiState.isMobileMenuOpen) {
                    this.closeMobileMenu();
                }
            }
        };
        
        element.addEventListener('keydown', handleTabKey);
        this.uiState.focusTrap = { element, handler: handleTabKey };
        
        firstElement.focus();
    }

    /**
     * Release focus trap
     */
    releaseFocus() {
        if (this.uiState.focusTrap) {
            this.uiState.focusTrap.element.removeEventListener('keydown', this.uiState.focusTrap.handler);
            this.uiState.focusTrap = null;
        }
    }

    /**
     * Setup touch gestures
     */
    setupTouchGestures() {
        document.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (!e.changedTouches[0]) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            this.handleTouchGesture(
                this.touchStartX, 
                this.touchStartY, 
                touchEndX, 
                touchEndY
            );
        }, { passive: true });
    }

    /**
     * Handle touch gestures
     */
    handleTouchGesture(startX, startY, endX, endY) {
        const diffX = startX - endX;
        const diffY = startY - endY;
        const threshold = 50;
        
        // Only process if horizontal swipe is greater than vertical
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
            if (this.currentSection === 'testInterface' && this.app.testSession) {
                if (diffX > 0) {
                    // Swipe left - next question
                    this.app.nextQuestion();
                } else {
                    // Swipe right - previous question
                    this.app.previousQuestion();
                }
            }
        }
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        // Test interface shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.currentSection !== 'testInterface' || !this.app.testSession) return;
            if (e.target.matches('input, textarea, select')) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.app.previousQuestion();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.app.nextQuestion();
                    break;
                case 'm':
                case 'M':
                    e.preventDefault();
                    this.app.markForReview();
                    break;
                case 'f':
                case 'F':
                    e.preventDefault();
                    this.app.toggleFlagQuestion();
                    break;
                case ' ':
                    e.preventDefault();
                    this.app.toggleTimerPause();
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                    e.preventDefault();
                    this.selectOption(parseInt(e.key) - 1);
                    break;
            }
        });
    }

    /**
     * Select option by index
     */
    selectOption(optionIndex) {
        const options = document.querySelectorAll('.question-option input[type="radio"]');
        if (options[optionIndex]) {
            options[optionIndex].click();
            this.announceToScreenReader(`Selected option ${String.fromCharCode(65 + optionIndex)}`);
        }
    }

    /**
     * Setup progress indicators
     */
    setupProgressIndicators() {
        // Add smooth transitions to progress bars
        const style = document.createElement('style');
        style.textContent = `
            .progress-fill {
                transition: width 0.3s ease-in-out;
            }
            
            .progress-fill.pulse {
                animation: pulse 0.3s ease-in-out;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.02); }
                100% { transform: scale(1); }
            }
            
            .reduced-motion .progress-fill,
            .reduced-motion .progress-fill.pulse {
                transition: none;
                animation: none;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Update progress with animation
     */
    updateProgress(elementId, percentage, options = {}) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const { animate = true, color = null } = options;
        
        if (animate && !this.uiState.reducedMotion) {
            element.classList.add('pulse');
            setTimeout(() => element.classList.remove('pulse'), 300);
        }
        
        element.style.width = `${percentage}%`;
        
        if (color) {
            element.style.backgroundColor = color;
        }
    }

    /**
     * Setup modal system
     */
    setupModals() {
        // Add event listeners for modal backdrop clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target.id);
            }
        });
        
        // Prevent modal backdrop click when clicking modal content
        document.addEventListener('click', (e) => {
            if (e.target.closest('.modal-content')) {
                e.stopPropagation();
            }
        });
    }

    /**
     * Show modal with enhanced accessibility
     */
    showModal(modalId, options = {}) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.warn(`Modal ${modalId} not found`);
            return;
        }
        
        const { 
            focus = true, 
            trapFocus = true, 
            announcement = null 
        } = options;
        
        // Hide any existing modal
        if (this.uiState.activeModal) {
            this.hideModal(this.uiState.activeModal);
        }
        
        modal.style.display = 'flex';
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
        
        this.uiState.activeModal = modalId;
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        if (focus) {
            // Focus first input or focusable element
            const firstInput = modal.querySelector('input, select, textarea, button');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
        
        if (trapFocus) {
            this.trapFocus(modal);
        }
        
        if (announcement) {
            this.announceToScreenReader(announcement);
        }
        
        this.modals.set(modalId, { element: modal, options });
    }

    /**
     * Hide modal
     */
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.style.display = 'none';
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        this.releaseFocus();
        this.uiState.activeModal = null;
        
        this.modals.delete(modalId);
    }

    /**
     * Hide all modals
     */
    hideAllModals() {
        this.modals.forEach((_, modalId) => {
            this.hideModal(modalId);
        });
    }

    /**
     * Reposition modals for responsive design
     */
    repositionModals() {
        // This could be expanded to adjust modal positioning
        // based on screen size and content
        this.modals.forEach(({ element }) => {
            if (window.innerWidth <= this.mobileBreakpoint) {
                element.classList.add('mobile-modal');
            } else {
                element.classList.remove('mobile-modal');
            }
        });
    }

    /**
     * Setup notification system
     */
    setupNotifications() {
        this.createNotificationContainer();
    }

    /**
     * Create notification container
     */
    createNotificationContainer() {
        if (document.getElementById('notifications')) return;
        
        const container = document.createElement('div');
        container.id = 'notifications';
        container.className = 'notifications-container';
        container.setAttribute('aria-live', 'polite');
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        `;
        
        document.body.appendChild(container);
    }

    /**
     * Show notification/toast
     */
    showNotification(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notifications');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.style.cssText = `
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            pointer-events: auto;
            transform: translateX(100%);
            transition: transform 0.3s ease-in-out;
            max-width: 300px;
        `;
        
        const icon = this.getNotificationIcon(type);
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 1.2em;">${icon}</span>
                <span>${message}</span>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);
        }
        
        // Click to dismiss
        notification.addEventListener('click', () => {
            this.removeNotification(notification);
        });
        
        return notification;
    }

    /**
     * Get icon for notification type
     */
    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    /**
     * Remove notification
     */
    removeNotification(notification) {
        if (!notification.parentNode) return;
        
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    /**
     * Show help modal
     */
    showHelpModal() {
        // Create help modal if it doesn't exist
        if (!document.getElementById('helpModal')) {
            this.createHelpModal();
        }
        
        this.showModal('helpModal', {
            announcement: 'Help dialog opened'
        });
    }

    /**
     * Create help modal
     */
    createHelpModal() {
        const modal = document.createElement('div');
        modal.id = 'helpModal';
        modal.className = 'modal hidden';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>❓ Help & Keyboard Shortcuts</h2>
                <div class="help-content">
                    <h3>Navigation</h3>
                    <ul>
                        <li><kbd>Tab</kbd> - Navigate between elements</li>
                        <li><kbd>Enter</kbd> / <kbd>Space</kbd> - Activate buttons</li>
                        <li><kbd>Esc</kbd> - Close modals or menus</li>
                        <li><kbd>F1</kbd> - Show this help</li>
                    </ul>
                    
                    <h3>Test Interface</h3>
                    <ul>
                        <li><kbd>←</kbd> / <kbd>→</kbd> - Previous/Next question</li>
                        <li><kbd>1-4</kbd> - Select options A-D</li>
                        <li><kbd>M</kbd> - Mark for review</li>
                        <li><kbd>F</kbd> - Flag question</li>
                        <li><kbd>Space</kbd> - Pause/Resume timer</li>
                    </ul>
                    
                    <h3>Theme & Display</h3>
                    <ul>
                        <li><kbd>D</kbd> - Toggle dark/light theme</li>
                        <li><kbd>Ctrl</kbd> + <kbd>+/-</kbd> - Zoom in/out</li>
                    </ul>
                </div>
                <div class="modal-actions">
                    <button class="btn btn--primary" onclick="uiManager.hideModal('helpModal')">Got it!</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    /**
     * Show keyboard shortcuts
     */
    showKeyboardShortcuts() {
        this.showHelpModal();
    }

    /**
     * Switch between application sections
     */
    switchSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
            
            // Update navigation
            this.updateNavigation(sectionId);
            
            // Announce section change
            const sectionTitle = targetSection.querySelector('h2, h1')?.textContent || sectionId;
            this.announceToScreenReader(`Navigated to ${sectionTitle}`);
            
            // Section-specific setup
            this.handleSectionChange(sectionId);
        }
    }

    /**
     * Update navigation state
     */
    updateNavigation(activeSection) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        });
        
        const activeLink = document.querySelector(`[data-section="${activeSection}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
            activeLink.setAttribute('aria-current', 'page');
        }
    }

    /**
     * Handle section-specific setup
     */
    handleSectionChange(sectionId) {
        switch(sectionId) {
            case 'testInterface':
                this.setupTestInterface();
                break;
            case 'analytics':
                this.setupAnalytics();
                break;
            case 'dashboard':
                this.setupDashboard();
                break;
        }
    }

    /**
     * Setup test interface specific UI
     */
    setupTestInterface() {
        // Ensure proper layout for current screen size
        this.adjustTestInterfaceForMobile(window.innerWidth <= this.mobileBreakpoint);
        
        // Enable keyboard shortcuts
        this.uiState.keyboardNavigation = true;
    }

    /**
     * Setup analytics specific UI
     */
    setupAnalytics() {
        // Trigger chart redraws if needed
        setTimeout(() => {
            if (this.app && this.app.renderOverviewCharts) {
                this.app.renderOverviewCharts();
            }
        }, 100);
    }

    /**
     * Setup dashboard specific UI
     */
    setupDashboard() {
        // Update statistics display
        if (this.app && this.app.updateDashboardStats) {
            this.app.updateDashboardStats();
        }
    }

    /**
     * Apply user preferences
     */
    applyUserPreferences() {
        // Load saved preferences
        const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        
        // Apply theme preference
        if (preferences.theme) {
            this.applyTheme(preferences.theme);
        }
        
        // Apply text size preference
        if (preferences.textSize) {
            document.documentElement.style.fontSize = preferences.textSize;
        }
        
        // Apply other preferences
        if (preferences.reducedMotion) {
            document.body.classList.add('reduced-motion');
        }
        
        if (preferences.highContrast) {
            document.body.classList.add('high-contrast');
        }
    }

    /**
     * Save user preferences
     */
    saveUserPreferences(preferences) {
        const current = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        const updated = { ...current, ...preferences };
        localStorage.setItem('userPreferences', JSON.stringify(updated));
        
        this.applyUserPreferences();
    }

    /**
     * Get current UI state
     */
    getState() {
        return {
            currentSection: this.currentSection,
            currentTheme: this.currentTheme,
            isMobileMenuOpen: this.uiState.isMobileMenuOpen,
            activeModal: this.uiState.activeModal,
            reducedMotion: this.uiState.reducedMotion,
            highContrastMode: this.uiState.highContrastMode
        };
    }

    /**
     * Cleanup UI Manager
     */
    cleanup() {
        // Remove event listeners
        this.releaseFocus();
        
        // Close any open modals
        this.hideAllModals();
        
        // Reset body styles
        document.body.style.overflow = '';
        
        // Clear announcer
        if (this.uiState.announcer) {
            this.uiState.announcer.textContent = '';
        }
        
        console.log('🎨 UI Manager cleaned up');
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}

// Global reference for inline handlers
window.UIManager = UIManager;