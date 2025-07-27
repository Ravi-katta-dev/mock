/**
 * RRB Mock Test App - Data Management Core Module
 * 
 * Comprehensive data management system that handles persistence, validation,
 * and CRUD operations for the RRB Mock Test App.
 * 
 * Features:
 * - localStorage wrapper with robust error handling
 * - Data validation and sanitization
 * - Automatic backup and restore functionality
 * - Data migration system for format updates
 * - Export/import capabilities for data portability
 * - Storage quota management and cleanup
 * - Comprehensive logging and monitoring
 * 
 * @author Ravi-katta-dev
 * @version 1.0.0
 * @created 2025-01-XX
 */

class DataManager {
    constructor(config = {}) {
        // Initialize configuration
        this.config = {
            // Storage configuration
            storagePrefix: config.storagePrefix || 'mockTest',
            autoBackup: config.autoBackup !== false,
            backupInterval: config.backupInterval || 24 * 60 * 60 * 1000, // 24 hours
            maxBackups: config.maxBackups || 5,
            
            // Validation configuration
            validateOnSave: config.validateOnSave !== false,
            sanitizeData: config.sanitizeData !== false,
            
            // Storage quota configuration
            maxStorageSize: config.maxStorageSize || 50 * 1024 * 1024, // 50MB
            cleanupThreshold: config.cleanupThreshold || 0.8, // 80%
            
            // Migration configuration
            currentVersion: config.currentVersion || '1.0.0',
            enableMigration: config.enableMigration !== false,
            
            // Debug configuration
            debugMode: config.debugMode || false,
            logOperations: config.logOperations !== false,
            
            ...config
        };

        // Initialize internal state
        this.isInitialized = false;
        this.migrationRun = false;
        this.lastBackupTime = null;
        this.storageQuotaWarningShown = false;
        
        // Storage keys mapping
        this.storageKeys = {
            USERS: `${this.config.storagePrefix}Users`,
            QUESTIONS: `${this.config.storagePrefix}Questions`,
            TEST_RESULTS: `${this.config.storagePrefix}Results`,
            UPLOADED_PDFS: `${this.config.storagePrefix}UploadedPDFs`,
            DRAFT_TESTS: `${this.config.storagePrefix}DraftTests`,
            AVAILABLE_TESTS: `${this.config.storagePrefix}AvailableTests`,
            USER_PREFERENCES: `${this.config.storagePrefix}Preferences`,
            APP_SETTINGS: `${this.config.storagePrefix}Settings`,
            ANALYTICS_DATA: `${this.config.storagePrefix}Analytics`,
            BACKUP_INDEX: `${this.config.storagePrefix}BackupIndex`,
            MIGRATION_INFO: `${this.config.storagePrefix}MigrationInfo`
        };

        // Data validation schemas
        this.validationSchemas = this.initializeValidationSchemas();
        
        // Initialize the data manager
        this.initPromise = this.initialize();
    }

    /**
     * Initialize the DataManager
     */
    async initialize() {
        try {
            this.log('Initializing DataManager...');
            
            // Check browser storage support
            this.checkStorageSupport();
            
            // Run migrations if needed
            if (this.config.enableMigration) {
                await this.runMigrations();
            }
            
            // Initialize storage quota monitoring
            this.initializeQuotaMonitoring();
            
            // Setup automatic backup
            if (this.config.autoBackup) {
                this.setupAutoBackup();
            }
            
            // Initialize data validation
            this.initializeValidation();
            
            this.isInitialized = true;
            this.log('DataManager initialized successfully');
            
        } catch (error) {
            this.logError('Failed to initialize DataManager', error);
            throw new Error('DataManager initialization failed: ' + error.message);
        }
    }

    /**
     * Check if browser supports localStorage
     */
    checkStorageSupport() {
        if (typeof Storage === 'undefined') {
            throw new Error('Browser does not support localStorage');
        }
        
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
        } catch (error) {
            throw new Error('localStorage is not accessible: ' + error.message);
        }
    }

    /**
     * Initialize validation schemas for different data types
     */
    initializeValidationSchemas() {
        return {
            user: {
                required: ['id', 'name', 'createdAt'],
                types: {
                    id: 'string',
                    name: 'string',
                    createdAt: 'number',
                    averageScore: 'number',
                    totalTests: 'number'
                },
                validate: (user) => {
                    if (!user.id || user.id.length < 1) return 'User ID is required';
                    if (!user.name || user.name.length < 1) return 'User name is required';
                    if (!user.createdAt || user.createdAt <= 0) return 'Valid creation date is required';
                    return null;
                }
            },
            question: {
                required: ['id', 'text', 'options', 'correctAnswer', 'subject'],
                types: {
                    id: 'string',
                    text: 'string',
                    options: 'array',
                    correctAnswer: 'string',
                    subject: 'string',
                    difficulty: 'string',
                    explanation: 'string',
                    source: 'string'
                },
                validate: (question) => {
                    if (!question.id || question.id.length < 1) return 'Question ID is required';
                    if (!question.text || question.text.length < 10) return 'Question text must be at least 10 characters';
                    if (!Array.isArray(question.options) || question.options.length !== 4) return 'Must have exactly 4 options';
                    if (!['A', 'B', 'C', 'D'].includes(question.correctAnswer)) return 'Correct answer must be A, B, C, or D';
                    if (!question.subject || question.subject.length < 1) return 'Subject is required';
                    return null;
                }
            },
            testResult: {
                required: ['id', 'userId', 'testType', 'score', 'totalQuestions', 'completedAt'],
                types: {
                    id: 'string',
                    userId: 'string',
                    testType: 'string',
                    score: 'number',
                    totalQuestions: 'number',
                    completedAt: 'number',
                    timeSpent: 'number'
                },
                validate: (result) => {
                    if (!result.id || result.id.length < 1) return 'Result ID is required';
                    if (!result.userId || result.userId.length < 1) return 'User ID is required';
                    if (typeof result.score !== 'number' || result.score < 0) return 'Valid score is required';
                    if (!result.totalQuestions || result.totalQuestions <= 0) return 'Total questions must be positive';
                    return null;
                }
            }
        };
    }

    /**
     * Generic data storage method with validation and error handling
     */
    async save(dataType, data, options = {}) {
        try {
            await this.ensureInitialized();
            
            const key = this.getStorageKey(dataType);
            if (!key) {
                throw new Error(`Unknown data type: ${dataType}`);
            }

            // Create backup before destructive operations
            if (this.config.autoBackup && options.createBackup !== false) {
                await this.createBackup(dataType);
            }

            // Validate data if enabled
            if (this.config.validateOnSave) {
                const validationResult = this.validateData(dataType, data);
                if (!validationResult.isValid) {
                    throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
                }
            }

            // Sanitize data if enabled
            if (this.config.sanitizeData) {
                data = this.sanitizeData(dataType, data);
            }

            // Check storage quota before saving
            const serializedData = JSON.stringify(data);
            const dataSize = new Blob([serializedData]).size;
            
            if (this.willExceedQuota(dataSize)) {
                await this.handleQuotaExceeded(dataSize);
            }

            // Save data to localStorage
            localStorage.setItem(key, serializedData);
            
            // Log operation
            this.log(`Saved ${dataType} data (${dataSize} bytes)`, options.logData ? data : undefined);
            
            // Update storage statistics
            this.updateStorageStats();
            
            return { success: true, size: dataSize };
            
        } catch (error) {
            this.logError(`Failed to save ${dataType} data`, error);
            
            // Try to restore from backup if save failed
            if (this.config.autoBackup && options.restoreOnFailure !== false) {
                try {
                    await this.restoreFromBackup(dataType);
                    this.log(`Restored ${dataType} from backup after save failure`);
                } catch (restoreError) {
                    this.logError(`Failed to restore ${dataType} from backup`, restoreError);
                }
            }
            
            throw error;
        }
    }

    /**
     * Generic data retrieval method with error handling
     */
    async load(dataType, options = {}) {
        try {
            await this.ensureInitialized();
            
            const key = this.getStorageKey(dataType);
            if (!key) {
                throw new Error(`Unknown data type: ${dataType}`);
            }

            const rawData = localStorage.getItem(key);
            
            if (rawData === null) {
                if (options.defaultValue !== undefined) {
                    return options.defaultValue;
                }
                throw new Error(`No data found for ${dataType}`);
            }

            let data;
            try {
                data = JSON.parse(rawData);
            } catch (parseError) {
                this.logError(`Failed to parse ${dataType} data`, parseError);
                
                // Try to restore from backup
                if (this.config.autoBackup) {
                    try {
                        data = await this.restoreFromBackup(dataType);
                        this.log(`Restored corrupted ${dataType} data from backup`);
                    } catch (backupError) {
                        this.logError(`Failed to restore ${dataType} from backup`, backupError);
                        throw new Error(`Data corruption detected and backup restore failed for ${dataType}`);
                    }
                } else {
                    throw new Error(`Data corruption detected for ${dataType} and no backup available`);
                }
            }

            // Validate loaded data if enabled
            if (this.config.validateOnSave && options.validate !== false) {
                const validationResult = this.validateData(dataType, data);
                if (!validationResult.isValid) {
                    this.logError(`Loaded ${dataType} data failed validation`, validationResult.errors);
                    
                    // Try to restore from backup
                    if (this.config.autoBackup) {
                        try {
                            data = await this.restoreFromBackup(dataType);
                            this.log(`Restored invalid ${dataType} data from backup`);
                        } catch (backupError) {
                            this.logError(`Failed to restore ${dataType} from backup`, backupError);
                        }
                    }
                }
            }

            this.log(`Loaded ${dataType} data (${rawData.length} bytes)`);
            return data;
            
        } catch (error) {
            this.logError(`Failed to load ${dataType} data`, error);
            
            if (options.returnEmptyOnError) {
                return options.defaultValue || [];
            }
            
            throw error;
        }
    }

    /**
     * Delete data with backup creation
     */
    async delete(dataType, options = {}) {
        try {
            await this.ensureInitialized();
            
            const key = this.getStorageKey(dataType);
            if (!key) {
                throw new Error(`Unknown data type: ${dataType}`);
            }

            // Create backup before deletion
            if (this.config.autoBackup && options.createBackup !== false) {
                await this.createBackup(dataType);
            }

            localStorage.removeItem(key);
            this.log(`Deleted ${dataType} data`);
            
            // Update storage statistics
            this.updateStorageStats();
            
            return { success: true };
            
        } catch (error) {
            this.logError(`Failed to delete ${dataType} data`, error);
            throw error;
        }
    }

    /**
     * Get validation schema key for data type
     */
    getValidationSchemaKey(dataType) {
        const schemaMap = {
            'users': 'user',
            'questions': 'question',
            'testresults': 'testResult',
            'uploadedpdfs': 'uploadedPdf',
            'drafttests': 'draftTest',
            'availabletests': 'availableTest',
            'userpreferences': 'userPreference',
            'appsettings': 'appSetting',
            'analyticsdata': 'analyticsData'
        };
        
        return schemaMap[dataType.toLowerCase().replace(/[^a-z]/g, '')] || dataType;
    }

    /**
     * Validate data against schema
     */
    validateData(dataType, data) {
        const schemaKey = this.getValidationSchemaKey(dataType);
        if (!this.validationSchemas[schemaKey]) {
            return { isValid: true, errors: [] };
        }

        const schema = this.validationSchemas[schemaKey];
        const errors = [];

        // Handle array data (multiple items)
        const items = Array.isArray(data) ? data : [data];
        
        for (const item of items) {
            // Check required fields
            for (const field of schema.required) {
                if (!(field in item) || item[field] === undefined || item[field] === null) {
                    errors.push(`Missing required field: ${field}`);
                }
            }

            // Check data types
            for (const [field, expectedType] of Object.entries(schema.types || {})) {
                if (field in item && item[field] !== undefined && item[field] !== null) {
                    const actualType = Array.isArray(item[field]) ? 'array' : typeof item[field];
                    if (actualType !== expectedType) {
                        errors.push(`Invalid type for ${field}: expected ${expectedType}, got ${actualType}`);
                    }
                }
            }

            // Run custom validation
            if (schema.validate && typeof schema.validate === 'function') {
                const customError = schema.validate(item);
                if (customError) {
                    errors.push(customError);
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Sanitize data to prevent XSS and ensure data integrity
     */
    sanitizeData(dataType, data) {
        if (!data) return data;

        const sanitizeString = (str) => {
            if (typeof str !== 'string') return str;
            return str
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;')
                .replace(/\//g, '&#x2F;')
                .trim();
        };

        const sanitizeObject = (obj) => {
            if (typeof obj !== 'object' || obj === null) return obj;
            
            if (Array.isArray(obj)) {
                return obj.map(item => sanitizeObject(item));
            }

            const sanitized = {};
            for (const [key, value] of Object.entries(obj)) {
                if (typeof value === 'string') {
                    sanitized[key] = sanitizeString(value);
                } else if (typeof value === 'object') {
                    sanitized[key] = sanitizeObject(value);
                } else {
                    sanitized[key] = value;
                }
            }
            return sanitized;
        };

        return Array.isArray(data) ? data.map(item => sanitizeObject(item)) : sanitizeObject(data);
    }

    /**
     * Create backup of specified data type
     */
    async createBackup(dataType) {
        try {
            const key = this.getStorageKey(dataType);
            if (!key) {
                throw new Error(`Cannot backup unknown data type: ${dataType}`);
            }

            const data = localStorage.getItem(key);
            if (!data) {
                this.log(`No data to backup for ${dataType}`);
                return;
            }

            const timestamp = Date.now();
            const backupKey = `${key}_backup_${timestamp}`;
            
            const backupData = {
                originalKey: key,
                dataType: dataType,
                timestamp: timestamp,
                version: this.config.currentVersion,
                data: data
            };

            localStorage.setItem(backupKey, JSON.stringify(backupData));
            
            // Update backup index
            await this.updateBackupIndex(dataType, backupKey, timestamp);
            
            // Clean old backups
            await this.cleanOldBackups(dataType);
            
            this.log(`Created backup for ${dataType}: ${backupKey}`);
            
        } catch (error) {
            this.logError(`Failed to create backup for ${dataType}`, error);
            // Don't throw here, as backup failure shouldn't stop the main operation
        }
    }

    /**
     * Restore data from backup
     */
    async restoreFromBackup(dataType, backupTimestamp = null) {
        try {
            const backupIndex = await this.getBackupIndex();
            const typeBackups = backupIndex[dataType] || [];
            
            if (typeBackups.length === 0) {
                throw new Error(`No backups available for ${dataType}`);
            }

            // Find the backup to restore
            let targetBackup;
            if (backupTimestamp) {
                targetBackup = typeBackups.find(b => b.timestamp === backupTimestamp);
                if (!targetBackup) {
                    throw new Error(`Backup with timestamp ${backupTimestamp} not found for ${dataType}`);
                }
            } else {
                // Use the most recent backup
                targetBackup = typeBackups.sort((a, b) => b.timestamp - a.timestamp)[0];
            }

            const backupData = localStorage.getItem(targetBackup.key);
            if (!backupData) {
                throw new Error(`Backup data not found: ${targetBackup.key}`);
            }

            const backup = JSON.parse(backupData);
            const restoredData = JSON.parse(backup.data);
            
            // Save restored data
            const originalKey = this.getStorageKey(dataType);
            localStorage.setItem(originalKey, backup.data);
            
            this.log(`Restored ${dataType} from backup (${new Date(targetBackup.timestamp).toISOString()})`);
            
            return restoredData;
            
        } catch (error) {
            this.logError(`Failed to restore ${dataType} from backup`, error);
            throw error;
        }
    }

    /**
     * Update backup index
     */
    async updateBackupIndex(dataType, backupKey, timestamp) {
        try {
            const backupIndex = await this.getBackupIndex();
            
            if (!backupIndex[dataType]) {
                backupIndex[dataType] = [];
            }
            
            backupIndex[dataType].push({
                key: backupKey,
                timestamp: timestamp,
                created: Date.now()
            });

            localStorage.setItem(this.storageKeys.BACKUP_INDEX, JSON.stringify(backupIndex));
            
        } catch (error) {
            this.logError('Failed to update backup index', error);
        }
    }

    /**
     * Get backup index
     */
    async getBackupIndex() {
        try {
            const indexData = localStorage.getItem(this.storageKeys.BACKUP_INDEX);
            return indexData ? JSON.parse(indexData) : {};
        } catch (error) {
            this.logError('Failed to load backup index', error);
            return {};
        }
    }

    /**
     * Clean old backups to maintain storage limits
     */
    async cleanOldBackups(dataType) {
        try {
            const backupIndex = await this.getBackupIndex();
            const typeBackups = backupIndex[dataType] || [];
            
            if (typeBackups.length <= this.config.maxBackups) {
                return;
            }

            // Sort by timestamp (newest first) and remove excess
            const sortedBackups = typeBackups.sort((a, b) => b.timestamp - a.timestamp);
            const backupsToRemove = sortedBackups.slice(this.config.maxBackups);
            
            for (const backup of backupsToRemove) {
                localStorage.removeItem(backup.key);
                this.log(`Removed old backup: ${backup.key}`);
            }

            // Update index
            backupIndex[dataType] = sortedBackups.slice(0, this.config.maxBackups);
            localStorage.setItem(this.storageKeys.BACKUP_INDEX, JSON.stringify(backupIndex));
            
        } catch (error) {
            this.logError(`Failed to clean old backups for ${dataType}`, error);
        }
    }

    /**
     * Export data for portability
     */
    async exportData(dataTypes = null, options = {}) {
        try {
            await this.ensureInitialized();
            
            const typesToExport = dataTypes || Object.keys(this.storageKeys).filter(key => 
                !key.includes('BACKUP') && !key.includes('MIGRATION')
            );

            const exportData = {
                metadata: {
                    exportedAt: Date.now(),
                    exportedBy: 'DataManager',
                    version: this.config.currentVersion,
                    appName: 'RRB Mock Test App'
                },
                data: {}
            };

            for (const dataType of typesToExport) {
                const lowercaseType = dataType.toLowerCase().replace('_', '');
                try {
                    const data = await this.load(lowercaseType, { returnEmptyOnError: true, defaultValue: [] });
                    exportData.data[lowercaseType] = data;
                } catch (error) {
                    this.logError(`Failed to export ${dataType}`, error);
                    if (!options.continueOnError) {
                        throw error;
                    }
                }
            }

            const exportString = JSON.stringify(exportData, null, options.pretty ? 2 : 0);
            
            if (options.downloadFile) {
                this.downloadAsFile(exportString, `mocktest_export_${Date.now()}.json`);
            }

            this.log('Data export completed', { size: exportString.length, types: typesToExport });
            
            return exportString;
            
        } catch (error) {
            this.logError('Failed to export data', error);
            throw error;
        }
    }

    /**
     * Import data from exported file
     */
    async importData(importData, options = {}) {
        try {
            await this.ensureInitialized();
            
            let data;
            if (typeof importData === 'string') {
                data = JSON.parse(importData);
            } else {
                data = importData;
            }

            if (!data.metadata || !data.data) {
                throw new Error('Invalid import data format');
            }

            // Validate import data structure
            if (!data.metadata.exportedAt || !data.metadata.version) {
                throw new Error('Import data missing required metadata');
            }

            // Create backup before import
            if (this.config.autoBackup && options.createBackup !== false) {
                for (const dataType of Object.keys(data.data)) {
                    await this.createBackup(dataType);
                }
            }

            const importResults = {};

            for (const [dataType, typeData] of Object.entries(data.data)) {
                try {
                    // Validate imported data
                    if (this.config.validateOnSave) {
                        const validationResult = this.validateData(dataType, typeData);
                        if (!validationResult.isValid) {
                            if (options.skipInvalidData) {
                                this.logError(`Skipping invalid ${dataType} data`, validationResult.errors);
                                importResults[dataType] = { success: false, error: 'Validation failed' };
                                continue;
                            } else {
                                throw new Error(`Import validation failed for ${dataType}: ${validationResult.errors.join(', ')}`);
                            }
                        }
                    }

                    await this.save(dataType, typeData, { createBackup: false });
                    importResults[dataType] = { success: true };
                    
                } catch (error) {
                    this.logError(`Failed to import ${dataType}`, error);
                    importResults[dataType] = { success: false, error: error.message };
                    
                    if (!options.continueOnError) {
                        throw error;
                    }
                }
            }

            this.log('Data import completed', importResults);
            
            return importResults;
            
        } catch (error) {
            this.logError('Failed to import data', error);
            throw error;
        }
    }

    /**
     * Run data migrations
     */
    async runMigrations() {
        try {
            if (this.migrationRun) return;
            
            const migrationInfo = await this.getMigrationInfo();
            const currentVersion = this.config.currentVersion;
            
            if (migrationInfo.version === currentVersion) {
                this.log('No migration needed');
                this.migrationRun = true;
                return;
            }

            this.log(`Running migration from ${migrationInfo.version || 'initial'} to ${currentVersion}`);
            
            // Create backup before migration
            if (this.config.autoBackup) {
                for (const dataType of Object.keys(this.storageKeys)) {
                    const lowercaseType = dataType.toLowerCase().replace('_', '');
                    await this.createBackup(lowercaseType);
                }
            }

            // Run migration logic here
            await this.executeMigrations(migrationInfo.version, currentVersion);
            
            // Update migration info
            await this.updateMigrationInfo(currentVersion);
            
            this.migrationRun = true;
            this.log(`Migration completed to version ${currentVersion}`);
            
        } catch (error) {
            this.logError('Migration failed', error);
            throw error;
        }
    }

    /**
     * Execute specific migrations
     */
    async executeMigrations(fromVersion, toVersion) {
        // Migration logic will be added here as needed
        // For now, just log the migration
        this.log(`Executing migration from ${fromVersion || 'initial'} to ${toVersion}`);
        
        // Example migration logic:
        // if (!fromVersion || fromVersion < '1.0.0') {
        //     await this.migrateToV1();
        // }
    }

    /**
     * Get migration information
     */
    async getMigrationInfo() {
        try {
            const migrationData = localStorage.getItem(this.storageKeys.MIGRATION_INFO);
            return migrationData ? JSON.parse(migrationData) : { version: null, migratedAt: null };
        } catch (error) {
            this.logError('Failed to load migration info', error);
            return { version: null, migratedAt: null };
        }
    }

    /**
     * Update migration information
     */
    async updateMigrationInfo(version) {
        try {
            const migrationInfo = {
                version: version,
                migratedAt: Date.now()
            };
            localStorage.setItem(this.storageKeys.MIGRATION_INFO, JSON.stringify(migrationInfo));
        } catch (error) {
            this.logError('Failed to update migration info', error);
        }
    }

    /**
     * Initialize storage quota monitoring
     */
    initializeQuotaMonitoring() {
        this.updateStorageStats();
        
        // Set up periodic quota checking
        setInterval(() => {
            this.updateStorageStats();
        }, 60000); // Check every minute
    }

    /**
     * Update storage statistics
     */
    updateStorageStats() {
        try {
            let totalSize = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.config.storagePrefix)) {
                    const value = localStorage.getItem(key);
                    totalSize += key.length + (value ? value.length : 0);
                }
            }

            this.storageStats = {
                totalSize: totalSize,
                usagePercentage: (totalSize / this.config.maxStorageSize) * 100,
                lastUpdated: Date.now()
            };

            // Check if approaching quota limit
            if (this.storageStats.usagePercentage > this.config.cleanupThreshold * 100) {
                this.handleQuotaWarning();
            }

        } catch (error) {
            this.logError('Failed to update storage stats', error);
        }
    }

    /**
     * Handle storage quota warning
     */
    handleQuotaWarning() {
        if (!this.storageQuotaWarningShown) {
            this.log(`Storage quota warning: ${this.storageStats.usagePercentage.toFixed(1)}% used`);
            this.storageQuotaWarningShown = true;
            
            // Emit event for UI to handle
            if (typeof window !== 'undefined' && window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('dataManagerQuotaWarning', {
                    detail: { stats: this.storageStats }
                }));
            }
        }
    }

    /**
     * Check if saving data will exceed quota
     */
    willExceedQuota(dataSize) {
        return (this.storageStats.totalSize + dataSize) > this.config.maxStorageSize;
    }

    /**
     * Handle quota exceeded situation
     */
    async handleQuotaExceeded(requiredSize) {
        this.log(`Storage quota would be exceeded. Required: ${requiredSize}, Available: ${this.config.maxStorageSize - this.storageStats.totalSize}`);
        
        // Try to clean up old backups first
        await this.cleanupStorage();
        
        // Update stats after cleanup
        this.updateStorageStats();
        
        // Check if we have enough space now
        if (this.willExceedQuota(requiredSize)) {
            throw new Error('Storage quota exceeded. Please delete some data or clear old backups.');
        }
    }

    /**
     * Cleanup storage by removing old backups and temporary data
     */
    async cleanupStorage() {
        try {
            this.log('Starting storage cleanup...');
            
            let cleanedSize = 0;
            
            // Clean old backups beyond the limit
            const backupIndex = await this.getBackupIndex();
            for (const [dataType, backups] of Object.entries(backupIndex)) {
                if (backups.length > this.config.maxBackups) {
                    const excessBackups = backups.sort((a, b) => b.timestamp - a.timestamp)
                                               .slice(this.config.maxBackups);
                    
                    for (const backup of excessBackups) {
                        const backupData = localStorage.getItem(backup.key);
                        if (backupData) {
                            cleanedSize += backupData.length;
                            localStorage.removeItem(backup.key);
                        }
                    }
                    
                    // Update backup index
                    backupIndex[dataType] = backups.slice(0, this.config.maxBackups);
                }
            }
            
            // Update the backup index
            localStorage.setItem(this.storageKeys.BACKUP_INDEX, JSON.stringify(backupIndex));
            
            // Clean temporary data (anything with 'temp' in the key)
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key && key.includes('temp') && key.startsWith(this.config.storagePrefix)) {
                    const value = localStorage.getItem(key);
                    if (value) {
                        cleanedSize += value.length;
                    }
                    localStorage.removeItem(key);
                }
            }
            
            this.log(`Storage cleanup completed. Freed ${cleanedSize} bytes`);
            
        } catch (error) {
            this.logError('Storage cleanup failed', error);
        }
    }

    /**
     * Setup automatic backup
     */
    setupAutoBackup() {
        const runAutoBackup = async () => {
            try {
                const now = Date.now();
                if (!this.lastBackupTime || (now - this.lastBackupTime) > this.config.backupInterval) {
                    await this.createFullBackup();
                    this.lastBackupTime = now;
                }
            } catch (error) {
                this.logError('Auto backup failed', error);
            }
        };

        // Run initial backup
        runAutoBackup();
        
        // Schedule periodic backups
        setInterval(runAutoBackup, this.config.backupInterval);
    }

    /**
     * Create full backup of all data
     */
    async createFullBackup() {
        const dataTypes = Object.keys(this.storageKeys).filter(key => 
            !key.includes('BACKUP') && !key.includes('MIGRATION')
        );

        for (const dataType of dataTypes) {
            const lowercaseType = dataType.toLowerCase().replace('_', '');
            await this.createBackup(lowercaseType);
        }
        
        this.log('Full backup completed');
    }

    /**
     * Initialize data validation
     */
    initializeValidation() {
        // Validate existing data
        this.validateExistingData();
    }

    /**
     * Validate all existing data
     */
    async validateExistingData() {
        const dataTypes = ['users', 'questions', 'testresults'];
        
        for (const dataType of dataTypes) {
            try {
                const data = await this.load(dataType, { returnEmptyOnError: true, defaultValue: [] });
                const validationResult = this.validateData(dataType, data);
                
                if (!validationResult.isValid) {
                    this.logError(`Existing ${dataType} data validation failed`, validationResult.errors);
                    
                    // Try to fix common issues automatically
                    const fixedData = this.autoFixData(dataType, data);
                    if (fixedData !== data) {
                        await this.save(dataType, fixedData, { createBackup: true });
                        this.log(`Auto-fixed ${dataType} data validation issues`);
                    }
                }
            } catch (error) {
                this.logError(`Failed to validate existing ${dataType} data`, error);
            }
        }
    }

    /**
     * Auto-fix common data issues
     */
    autoFixData(dataType, data) {
        if (!Array.isArray(data)) return data;
        
        return data.map(item => {
            if (!item || typeof item !== 'object') return item;
            
            const fixed = { ...item };
            
            // Fix common issues based on data type
            switch (dataType) {
                case 'users':
                    if (!fixed.id) fixed.id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    if (!fixed.createdAt) fixed.createdAt = Date.now();
                    if (typeof fixed.averageScore !== 'number') fixed.averageScore = 0;
                    if (typeof fixed.totalTests !== 'number') fixed.totalTests = 0;
                    break;
                    
                case 'questions':
                    if (!fixed.id) fixed.id = 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    if (!fixed.subject) fixed.subject = 'General';
                    if (!fixed.difficulty) fixed.difficulty = 'Medium';
                    if (!Array.isArray(fixed.options) || fixed.options.length !== 4) {
                        fixed.options = ['Option A', 'Option B', 'Option C', 'Option D'];
                    }
                    if (!['A', 'B', 'C', 'D'].includes(fixed.correctAnswer)) {
                        fixed.correctAnswer = 'A';
                    }
                    break;
                    
                case 'testresults':
                    if (!fixed.id) fixed.id = 'result_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    if (!fixed.completedAt) fixed.completedAt = Date.now();
                    if (typeof fixed.score !== 'number') fixed.score = 0;
                    if (typeof fixed.totalQuestions !== 'number') fixed.totalQuestions = 0;
                    break;
            }
            
            return fixed;
        });
    }

    /**
     * Download data as file
     */
    downloadAsFile(data, filename) {
        try {
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            this.log(`Downloaded file: ${filename}`);
            
        } catch (error) {
            this.logError(`Failed to download file: ${filename}`, error);
            throw error;
        }
    }

    /**
     * Get storage key for data type
     */
    getStorageKey(dataType) {
        const keyMap = {
            'users': this.storageKeys.USERS,
            'questions': this.storageKeys.QUESTIONS,
            'testresults': this.storageKeys.TEST_RESULTS,
            'uploadedpdfs': this.storageKeys.UPLOADED_PDFS,
            'drafttests': this.storageKeys.DRAFT_TESTS,
            'availabletests': this.storageKeys.AVAILABLE_TESTS,
            'userpreferences': this.storageKeys.USER_PREFERENCES,
            'appsettings': this.storageKeys.APP_SETTINGS,
            'analyticsdata': this.storageKeys.ANALYTICS_DATA
        };
        
        return keyMap[dataType.toLowerCase().replace(/[^a-z]/g, '')];
    }

    /**
     * Ensure DataManager is initialized
     */
    async ensureInitialized() {
        if (this.initPromise) {
            await this.initPromise;
        }
        if (!this.isInitialized) {
            throw new Error('DataManager not initialized. Call initialize() first.');
        }
    }

    /**
     * Log operations if enabled
     */
    log(message, data = null) {
        if (this.config.logOperations || this.config.debugMode) {
            const timestamp = new Date().toISOString();
            console.log(`[DataManager ${timestamp}] ${message}`, data || '');
        }
    }

    /**
     * Log errors
     */
    logError(message, error) {
        const timestamp = new Date().toISOString();
        console.error(`[DataManager ERROR ${timestamp}] ${message}`, error);
    }

    /**
     * Get storage statistics
     */
    getStorageStats() {
        return this.storageStats;
    }

    /**
     * Get available backup information
     */
    async getAvailableBackups() {
        return await this.getBackupIndex();
    }

    /**
     * Clear all app data (for testing or reset purposes)
     */
    async clearAllData(options = {}) {
        try {
            await this.ensureInitialized();
            
            if (options.createBackup !== false && this.config.autoBackup) {
                await this.createFullBackup();
                this.log('Created backup before clearing all data');
            }

            const keys = Object.values(this.storageKeys);
            for (const key of keys) {
                localStorage.removeItem(key);
            }
            
            // Also clear any backup data
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.config.storagePrefix)) {
                    localStorage.removeItem(key);
                }
            }

            this.updateStorageStats();
            this.log('All data cleared');
            
            return { success: true };
            
        } catch (error) {
            this.logError('Failed to clear all data', error);
            throw error;
        }
    }
}

// Export for use in browser and Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
} else if (typeof window !== 'undefined') {
    window.DataManager = DataManager;
}