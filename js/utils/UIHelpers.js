/**
 * UIHelpers - Core UI Utility Functions for RRB Mock Test App
 * 
 * This module provides essential UI helper utilities including toast notifications,
 * ID generation, form validation, array manipulation, and performance utilities.
 * 
 * @author Ravi-katta-dev
 * @version 1.0.0
 * @created 2025-01-XX
 */

/**
 * Core UI Helper Utilities Class
 * Provides reusable functions for the modular RRB Mock Test App
 */
class UIHelpers {
    constructor() {
        this.toastContainer = null;
        this.debounceTimers = new Map();
        this.throttleTimers = new Map();
        this.idCounter = 0;
        this.initializeToastContainer();
    }

    /**
     * Initialize the toast notification container
     * @private
     */
    initializeToastContainer() {
        // Check if container already exists
        this.toastContainer = document.getElementById('toast-container');
        
        if (!this.toastContainer) {
            this.toastContainer = document.createElement('div');
            this.toastContainer.id = 'toast-container';
            this.toastContainer.className = 'toast-container';
            this.toastContainer.setAttribute('aria-live', 'polite');
            this.toastContainer.setAttribute('aria-atomic', 'true');
            this.toastContainer.setAttribute('role', 'status');
            document.body.appendChild(this.toastContainer);
        }
    }

    /**
     * Toast Notification System
     * Shows accessible and dismissible toast notifications
     * 
     * @param {string} message - The message to display
     * @param {string} type - Type of toast ('success', 'error', 'warning', 'info')
     * @param {number} duration - Duration in milliseconds (default: 4000)
     * @param {boolean} dismissible - Whether the toast is manually dismissible (default: true)
     * @returns {HTMLElement} The toast element
     */
    showToast(message, type = 'info', duration = 4000, dismissible = true) {
        const toastId = this.generateUniqueId('toast');
        const toast = document.createElement('div');
        
        toast.id = toastId;
        toast.className = `toast toast--${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        
        // Toast content
        const content = document.createElement('div');
        content.className = 'toast__content';
        
        // Icon based on type
        const icon = document.createElement('span');
        icon.className = 'toast__icon';
        icon.setAttribute('aria-hidden', 'true');
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        icon.textContent = icons[type] || icons.info;
        
        // Message
        const messageEl = document.createElement('span');
        messageEl.className = 'toast__message';
        messageEl.textContent = message;
        
        content.appendChild(icon);
        content.appendChild(messageEl);
        toast.appendChild(content);
        
        // Dismiss button if dismissible
        if (dismissible) {
            const dismissBtn = document.createElement('button');
            dismissBtn.className = 'toast__dismiss';
            dismissBtn.setAttribute('aria-label', 'Dismiss notification');
            dismissBtn.innerHTML = '×';
            dismissBtn.onclick = () => this.dismissToast(toastId);
            toast.appendChild(dismissBtn);
        }
        
        // Add to container
        this.toastContainer.appendChild(toast);
        
        // Auto dismiss after duration
        if (duration > 0) {
            setTimeout(() => {
                this.dismissToast(toastId);
            }, duration);
        }
        
        // Trigger animation
        setTimeout(() => {
            toast.classList.add('toast--show');
        }, 10);
        
        return toast;
    }

    /**
     * Dismiss a specific toast notification
     * @param {string} toastId - The ID of the toast to dismiss
     */
    dismissToast(toastId) {
        const toast = document.getElementById(toastId);
        if (toast) {
            toast.classList.add('toast--hide');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }

    /**
     * Clear all toast notifications
     */
    clearAllToasts() {
        const toasts = this.toastContainer.querySelectorAll('.toast');
        toasts.forEach(toast => {
            this.dismissToast(toast.id);
        });
    }

    /**
     * ID Generation Utilities
     * Generates unique, collision-resistant identifiers
     */

    /**
     * Generate a unique ID with optional prefix
     * @param {string} prefix - Optional prefix for the ID
     * @returns {string} Unique identifier
     */
    generateUniqueId(prefix = 'id') {
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substr(2, 9);
        const counter = (++this.idCounter).toString(36);
        return `${prefix}-${timestamp}-${randomPart}-${counter}`;
    }

    /**
     * Generate a UUID v4
     * @returns {string} UUID v4 string
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Generate a short random ID
     * @param {number} length - Length of the ID (default: 8)
     * @returns {string} Short random ID
     */
    generateShortId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Array Manipulation Helpers
     */

    /**
     * Shuffle an array using Fisher-Yates algorithm
     * @param {Array} array - Array to shuffle
     * @returns {Array} New shuffled array (original array is not modified)
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Get unique items from an array
     * @param {Array} array - Input array
     * @param {string|Function} key - Key property name or function to determine uniqueness
     * @returns {Array} Array with unique items
     */
    getUniqueItems(array, key = null) {
        if (!key) {
            return [...new Set(array)];
        }
        
        const seen = new Set();
        return array.filter(item => {
            const keyValue = typeof key === 'function' ? key(item) : item[key];
            if (seen.has(keyValue)) {
                return false;
            }
            seen.add(keyValue);
            return true;
        });
    }

    /**
     * Group array items by a key
     * @param {Array} array - Input array
     * @param {string|Function} key - Key property name or function
     * @returns {Object} Grouped object
     */
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const groupKey = typeof key === 'function' ? key(item) : item[key];
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(item);
            return groups;
        }, {});
    }

    /**
     * Chunk array into smaller arrays
     * @param {Array} array - Input array
     * @param {number} size - Size of each chunk
     * @returns {Array} Array of chunks
     */
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    /**
     * Form Validation Utilities
     */

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate phone number (Indian format)
     * @param {string} phone - Phone number to validate
     * @returns {boolean} True if valid phone format
     */
    isValidPhone(phone) {
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(phone.replace(/\D/g, ''));
    }

    /**
     * Validate required fields in a form
     * @param {HTMLFormElement|Object} form - Form element or form data object
     * @param {Array} requiredFields - Array of required field names
     * @returns {Object} Validation result with isValid and errors
     */
    validateRequired(form, requiredFields) {
        const errors = [];
        const formData = form instanceof HTMLFormElement ? new FormData(form) : form;
        
        requiredFields.forEach(fieldName => {
            const value = formData instanceof FormData ? formData.get(fieldName) : formData[fieldName];
            if (!value || (typeof value === 'string' && value.trim() === '')) {
                errors.push(`${fieldName} is required`);
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Validate form with custom rules
     * @param {HTMLFormElement|Object} form - Form element or form data object
     * @param {Object} rules - Validation rules object
     * @returns {Object} Validation result with isValid and errors
     */
    validateForm(form, rules) {
        const errors = [];
        const formData = form instanceof HTMLFormElement ? new FormData(form) : form;
        
        Object.keys(rules).forEach(fieldName => {
            const value = formData instanceof FormData ? formData.get(fieldName) : formData[fieldName];
            const fieldRules = rules[fieldName];
            
            // Required validation
            if (fieldRules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
                errors.push(`${fieldName} is required`);
                return;
            }
            
            // Skip other validations if field is empty and not required
            if (!value || (typeof value === 'string' && value.trim() === '')) {
                return;
            }
            
            // Min length validation
            if (fieldRules.minLength && value.length < fieldRules.minLength) {
                errors.push(`${fieldName} must be at least ${fieldRules.minLength} characters`);
            }
            
            // Max length validation
            if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
                errors.push(`${fieldName} must not exceed ${fieldRules.maxLength} characters`);
            }
            
            // Pattern validation
            if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
                errors.push(fieldRules.message || `${fieldName} format is invalid`);
            }
            
            // Custom validation function
            if (fieldRules.validator && typeof fieldRules.validator === 'function') {
                const result = fieldRules.validator(value);
                if (result !== true) {
                    errors.push(result || `${fieldName} is invalid`);
                }
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Performance Utilities - Debounce and Throttle
     */

    /**
     * Debounce function - delays execution until after wait time has elapsed
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @param {string} key - Optional key to identify the debounced function
     * @returns {Function} Debounced function
     */
    debounce(func, wait, key = 'default') {
        return (...args) => {
            const previous = this.debounceTimers.get(key);
            if (previous) {
                clearTimeout(previous);
            }
            
            this.debounceTimers.set(key, setTimeout(() => {
                func.apply(this, args);
                this.debounceTimers.delete(key);
            }, wait));
        };
    }

    /**
     * Throttle function - limits execution to once per wait time
     * @param {Function} func - Function to throttle
     * @param {number} wait - Wait time in milliseconds
     * @param {string} key - Optional key to identify the throttled function
     * @returns {Function} Throttled function
     */
    throttle(func, wait, key = 'default') {
        return (...args) => {
            if (!this.throttleTimers.has(key)) {
                func.apply(this, args);
                this.throttleTimers.set(key, setTimeout(() => {
                    this.throttleTimers.delete(key);
                }, wait));
            }
        };
    }

    /**
     * Cancel a debounced function
     * @param {string} key - Key of the debounced function to cancel
     */
    cancelDebounce(key) {
        const timer = this.debounceTimers.get(key);
        if (timer) {
            clearTimeout(timer);
            this.debounceTimers.delete(key);
        }
    }

    /**
     * Additional Utility Functions
     */

    /**
     * Format file size in human readable format
     * @param {number} bytes - File size in bytes
     * @param {number} decimals - Number of decimal places (default: 2)
     * @returns {string} Formatted file size
     */
    formatFileSize(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    /**
     * Sanitize HTML string
     * @param {string} str - HTML string to sanitize
     * @returns {string} Sanitized string
     */
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    /**
     * Escape HTML entities
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    escapeHTML(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} Promise that resolves to true if successful
     */
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                return successful;
            }
        } catch (error) {
            console.error('Failed to copy text: ', error);
            return false;
        }
    }
}

// Create global instance
window.UIHelpers = new UIHelpers();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIHelpers;
}