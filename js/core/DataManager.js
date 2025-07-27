/**
 * DataManager - Core Data Management Module for RRB Mock Test App
 * 
 * This module provides centralized data management functionality including
 * localStorage operations, data validation, backup/restore, and data integrity checks.
 * 
 * @author Ravi-katta-dev
 * @version 1.0.0
 * @created 2025-01-XX
 */

/**
 * Core Data Manager Class
 * Handles all data persistence and management operations
 */
class DataManager {
    constructor() {
        this.storageKeys = {
            USERS: 'mockTestUsers',
            QUESTIONS: 'mockTestQuestions',
            RESULTS: 'mockTestResults',
            PDFS: 'uploadedPDFs',
            DRAFT_TESTS: 'draftMockTests',
            AVAILABLE_TESTS: 'availableMockTests',
            APP_THEME: 'appTheme',
            USER_PREFERENCES: 'userPreferences'
        };

        this.dataValidators = {
            user: this.validateUserData.bind(this),
            question: this.validateQuestionData.bind(this),
            result: this.validateResultData.bind(this)
        };

        this.initializeStorage();
    }

    /**
     * Initialize storage with default values if needed
     */
    initializeStorage() {
        Object.values(this.storageKeys).forEach(key => {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify([]));
            }
        });

        // Initialize theme if not set
        if (!localStorage.getItem(this.storageKeys.APP_THEME)) {
            localStorage.setItem(this.storageKeys.APP_THEME, 'light');
        }
    }

    /**
     * Generic data storage method with validation
     * @param {string} key - Storage key
     * @param {any} data - Data to store
     * @param {boolean} validate - Whether to validate data
     * @returns {boolean} Success status
     */
    setData(key, data, validate = true) {
        try {
            if (validate && this.dataValidators[key]) {
                if (!this.dataValidators[key](data)) {
                    console.error(`Data validation failed for key: ${key}`);
                    return false;
                }
            }

            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error storing data for key ${key}:`, error);
            return false;
        }
    }

    /**
     * Generic data retrieval method
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if key doesn't exist
     * @returns {any} Retrieved data
     */
    getData(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error(`Error retrieving data for key ${key}:`, error);
            return defaultValue;
        }
    }

    /**
     * Add item to array-based storage
     * @param {string} key - Storage key
     * @param {any} item - Item to add
     * @returns {boolean} Success status
     */
    addItem(key, item) {
        const currentData = this.getData(key, []);
        currentData.push(item);
        return this.setData(key, currentData);
    }

    /**
     * Update item in array-based storage
     * @param {string} key - Storage key
     * @param {function} findFn - Function to find item
     * @param {any} updatedItem - Updated item data
     * @returns {boolean} Success status
     */
    updateItem(key, findFn, updatedItem) {
        const currentData = this.getData(key, []);
        const index = currentData.findIndex(findFn);
        
        if (index !== -1) {
            currentData[index] = updatedItem;
            return this.setData(key, currentData);
        }
        
        return false;
    }

    /**
     * Remove item from array-based storage
     * @param {string} key - Storage key
     * @param {function} findFn - Function to find item
     * @returns {boolean} Success status
     */
    removeItem(key, findFn) {
        const currentData = this.getData(key, []);
        const filteredData = currentData.filter(item => !findFn(item));
        
        if (filteredData.length !== currentData.length) {
            return this.setData(key, filteredData);
        }
        
        return false;
    }

    /**
     * Clear all data (with confirmation)
     * @param {boolean} confirmed - Confirmation flag
     * @returns {boolean} Success status
     */
    clearAllData(confirmed = false) {
        if (!confirmed) {
            return false;
        }

        try {
            Object.values(this.storageKeys).forEach(key => {
                localStorage.removeItem(key);
            });
            this.initializeStorage();
            return true;
        } catch (error) {
            console.error('Error clearing all data:', error);
            return false;
        }
    }

    /**
     * Export data for backup
     * @returns {object} Exported data
     */
    exportData() {
        const exportData = {};
        
        Object.entries(this.storageKeys).forEach(([name, key]) => {
            exportData[name] = this.getData(key, []);
        });

        exportData.exportDate = new Date().toISOString();
        exportData.version = '1.0.0';
        
        return exportData;
    }

    /**
     * Import data from backup
     * @param {object} importData - Data to import
     * @returns {boolean} Success status
     */
    importData(importData) {
        if (!importData || typeof importData !== 'object') {
            console.error('Invalid import data');
            return false;
        }

        try {
            Object.entries(this.storageKeys).forEach(([name, key]) => {
                if (importData[name]) {
                    this.setData(key, importData[name], false);
                }
            });
            
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    /**
     * Validate user data
     * @param {any} data - Data to validate
     * @returns {boolean} Validation result
     */
    validateUserData(data) {
        return Array.isArray(data) && data.every(user => 
            user.hasOwnProperty('name') && 
            user.hasOwnProperty('id') &&
            user.hasOwnProperty('createdAt')
        );
    }

    /**
     * Validate question data
     * @param {any} data - Data to validate
     * @returns {boolean} Validation result
     */
    validateQuestionData(data) {
        return Array.isArray(data) && data.every(question => 
            question.hasOwnProperty('question') && 
            question.hasOwnProperty('options') &&
            question.hasOwnProperty('correctAnswer') &&
            question.hasOwnProperty('subject')
        );
    }

    /**
     * Validate result data
     * @param {any} data - Data to validate
     * @returns {boolean} Validation result
     */
    validateResultData(data) {
        return Array.isArray(data) && data.every(result => 
            result.hasOwnProperty('userId') && 
            result.hasOwnProperty('score') &&
            result.hasOwnProperty('testDate') &&
            result.hasOwnProperty('answers')
        );
    }

    /**
     * Get storage usage statistics
     * @returns {object} Storage statistics
     */
    getStorageStats() {
        const stats = {
            totalKeys: Object.keys(this.storageKeys).length,
            keyStats: {}
        };

        Object.entries(this.storageKeys).forEach(([name, key]) => {
            const data = localStorage.getItem(key);
            stats.keyStats[name] = {
                size: data ? data.length : 0,
                items: data ? JSON.parse(data).length || 1 : 0
            };
        });

        return stats;
    }
}

// Create global instance
window.DataManager = new DataManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
}