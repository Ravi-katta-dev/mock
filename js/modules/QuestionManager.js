/**
 * RRB Mock Test App - Question Management Module
 * 
 * Comprehensive question management system that handles question storage, validation,
 * search, categorization, and organization for the RRB Mock Test App.
 * 
 * Features:
 * - CRUD operations for questions
 * - Advanced validation and sanitization
 * - Search and filtering capabilities
 * - Subject and difficulty categorization
 * - Bulk import/export functionality
 * - Question statistics and analytics
 * - Deduplication and similarity detection
 * - Performance optimization for large datasets
 * 
 * @author Ravi-katta-dev
 * @version 1.0.0
 * @created 2025-01-XX
 */

class QuestionManager {
    constructor() {
        // Initialize with constants and configuration if available
        this.constants = window.MockTestConstants || {};
        this.syllabusMapping = window.MockTestSyllabus?.SYLLABUS_MAPPING || {};
        this.syllabusUtils = window.MockTestSyllabus?.SyllabusMappingUtils || {};
        
        // Storage configuration
        this.storageKey = this.constants.STORAGE_KEYS?.QUESTIONS || 'mockTestQuestions';
        this.analyticsKey = this.constants.STORAGE_KEYS?.ANALYTICS_DATA || 'analyticsData';
        
        // Internal data structures
        this.questions = [];
        this.questionIndex = new Map(); // For fast lookups by ID
        this.subjectIndex = new Map(); // Questions indexed by subject
        this.chapterIndex = new Map(); // Questions indexed by chapter
        this.difficultyIndex = new Map(); // Questions indexed by difficulty
        this.searchIndex = new Map(); // Full-text search index
        this.similarityIndex = new Map(); // For duplicate detection
        
        // Statistics and analytics
        this.analytics = {
            totalQuestions: 0,
            subjectDistribution: {},
            difficultyDistribution: {},
            chapterDistribution: {},
            sourceDistribution: {},
            pyqCount: 0,
            lastUpdated: null,
            usageStats: {},
            performanceMetrics: {}
        };
        
        // Configuration options
        this.config = {
            enableAutoSave: true,
            enableIndexing: true,
            enableSimilarityDetection: true,
            similarityThreshold: 0.8,
            maxSearchResults: 100,
            enableAnalytics: true,
            debounceDelay: 300
        };
        
        // Performance tracking
        this.performance = {
            lastIndexUpdate: 0,
            searchCache: new Map(),
            cacheTimeout: 300000 // 5 minutes
        };
        
        // Initialize the manager
        this.initialize();
    }

    /**
     * Initialize the QuestionManager
     */
    async initialize() {
        try {
            console.log('Initializing QuestionManager...');
            
            // Load questions from storage
            await this.loadQuestions();
            
            // Build indices for fast operations
            this.buildIndices();
            
            // Update analytics
            this.updateAnalytics();
            
            // Setup auto-save if enabled
            if (this.config.enableAutoSave) {
                this.setupAutoSave();
            }
            
            console.log(`QuestionManager initialized with ${this.questions.length} questions`);
        } catch (error) {
            console.error('Failed to initialize QuestionManager:', error);
            throw error;
        }
    }

    // ===== CORE CRUD OPERATIONS =====

    /**
     * Add a new question
     * @param {Object} questionData - Question data object
     * @returns {Object} Result object with success status and question ID
     */
    addQuestion(questionData) {
        try {
            // Validate question data
            const validation = this.validateQuestion(questionData);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.errors.join(', '),
                    question: null
                };
            }

            // Sanitize question data
            const sanitizedQuestion = this.sanitizeQuestion(questionData);
            
            // Generate unique ID if not provided
            if (!sanitizedQuestion.id) {
                sanitizedQuestion.id = this.generateQuestionId();
            }
            
            // Check for duplicates if enabled
            if (this.config.enableSimilarityDetection) {
                const duplicateCheck = this.findSimilarQuestions(sanitizedQuestion.text);
                if (duplicateCheck.length > 0) {
                    console.warn('Potential duplicate question detected:', duplicateCheck);
                }
            }
            
            // Add metadata
            sanitizedQuestion.createdAt = new Date().toISOString();
            sanitizedQuestion.updatedAt = sanitizedQuestion.createdAt;
            sanitizedQuestion.usageCount = 0;
            sanitizedQuestion.correctAttempts = 0;
            sanitizedQuestion.totalAttempts = 0;
            
            // Auto-detect subject/chapter if not provided
            if (!sanitizedQuestion.subject || !sanitizedQuestion.chapter) {
                const detected = this.autoDetectSubjectChapter(sanitizedQuestion.text);
                if (detected.subject && !sanitizedQuestion.subject) {
                    sanitizedQuestion.subject = detected.subject;
                }
                if (detected.chapter && !sanitizedQuestion.chapter) {
                    sanitizedQuestion.chapter = detected.chapter;
                }
            }
            
            // Add to questions array
            this.questions.push(sanitizedQuestion);
            
            // Update indices
            this.updateIndicesForQuestion(sanitizedQuestion, 'add');
            
            // Save to storage
            this.saveQuestions();
            
            // Update analytics
            this.updateAnalytics();
            
            return {
                success: true,
                question: sanitizedQuestion,
                message: 'Question added successfully'
            };
            
        } catch (error) {
            console.error('Error adding question:', error);
            return {
                success: false,
                error: error.message,
                question: null
            };
        }
    }

    /**
     * Update an existing question
     * @param {string} questionId - Question ID
     * @param {Object} updateData - Data to update
     * @returns {Object} Result object with success status
     */
    updateQuestion(questionId, updateData) {
        try {
            const existingQuestion = this.getQuestionById(questionId);
            if (!existingQuestion) {
                return {
                    success: false,
                    error: 'Question not found',
                    question: null
                };
            }

            // Merge update data with existing question
            const updatedQuestion = { ...existingQuestion, ...updateData };
            updatedQuestion.updatedAt = new Date().toISOString();
            
            // Validate updated question
            const validation = this.validateQuestion(updatedQuestion);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.errors.join(', '),
                    question: null
                };
            }

            // Sanitize updated question
            const sanitizedQuestion = this.sanitizeQuestion(updatedQuestion);
            
            // Find and update in questions array
            const index = this.questions.findIndex(q => q.id === questionId);
            if (index !== -1) {
                // Update indices (remove old, add new)
                this.updateIndicesForQuestion(this.questions[index], 'remove');
                this.questions[index] = sanitizedQuestion;
                this.updateIndicesForQuestion(sanitizedQuestion, 'add');
                
                // Save to storage
                this.saveQuestions();
                
                // Update analytics
                this.updateAnalytics();
                
                return {
                    success: true,
                    question: sanitizedQuestion,
                    message: 'Question updated successfully'
                };
            } else {
                return {
                    success: false,
                    error: 'Question not found in array',
                    question: null
                };
            }
            
        } catch (error) {
            console.error('Error updating question:', error);
            return {
                success: false,
                error: error.message,
                question: null
            };
        }
    }

    /**
     * Delete a question
     * @param {string} questionId - Question ID
     * @returns {Object} Result object with success status
     */
    deleteQuestion(questionId) {
        try {
            const question = this.getQuestionById(questionId);
            if (!question) {
                return {
                    success: false,
                    error: 'Question not found'
                };
            }

            // Remove from questions array
            this.questions = this.questions.filter(q => q.id !== questionId);
            
            // Update indices
            this.updateIndicesForQuestion(question, 'remove');
            
            // Save to storage
            this.saveQuestions();
            
            // Update analytics
            this.updateAnalytics();
            
            return {
                success: true,
                message: 'Question deleted successfully'
            };
            
        } catch (error) {
            console.error('Error deleting question:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Delete multiple questions
     * @param {Array} questionIds - Array of question IDs
     * @returns {Object} Result object with success status and details
     */
    deleteMultipleQuestions(questionIds) {
        try {
            const results = {
                deleted: [],
                failed: [],
                total: questionIds.length
            };

            for (const questionId of questionIds) {
                const result = this.deleteQuestion(questionId);
                if (result.success) {
                    results.deleted.push(questionId);
                } else {
                    results.failed.push({ id: questionId, error: result.error });
                }
            }

            return {
                success: results.failed.length === 0,
                results,
                message: `${results.deleted.length} questions deleted, ${results.failed.length} failed`
            };
            
        } catch (error) {
            console.error('Error deleting multiple questions:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get question by ID
     * @param {string} questionId - Question ID
     * @returns {Object|null} Question object or null if not found
     */
    getQuestionById(questionId) {
        return this.questionIndex.get(questionId) || null;
    }

    /**
     * Get all questions
     * @param {Object} options - Options for retrieval (pagination, sorting)
     * @returns {Array} Array of questions
     */
    getAllQuestions(options = {}) {
        let questions = [...this.questions];
        
        // Apply sorting if specified
        if (options.sortBy) {
            questions = this.sortQuestions(questions, options.sortBy, options.sortOrder);
        }
        
        // Apply pagination if specified
        if (options.page && options.pageSize) {
            const start = (options.page - 1) * options.pageSize;
            const end = start + options.pageSize;
            questions = questions.slice(start, end);
        }
        
        return questions;
    }

    // ===== SEARCH AND FILTERING =====

    /**
     * Search questions with advanced filtering
     * @param {Object} searchCriteria - Search criteria object
     * @returns {Array} Array of matching questions
     */
    searchQuestions(searchCriteria = {}) {
        try {
            const {
                query = '',
                subjects = [],
                chapters = [],
                difficulties = [],
                isPYQ = null,
                sources = [],
                tags = [],
                dateRange = null,
                usageRange = null,
                accuracyRange = null,
                sortBy = 'relevance',
                sortOrder = 'desc',
                limit = this.config.maxSearchResults
            } = searchCriteria;

            // Check cache first for performance
            const cacheKey = JSON.stringify(searchCriteria);
            const cached = this.performance.searchCache.get(cacheKey);
            if (cached && (Date.now() - cached.timestamp) < this.config.cacheTimeout) {
                return cached.results;
            }

            let results = [...this.questions];

            // Text search
            if (query.trim()) {
                results = this.performTextSearch(results, query);
            }

            // Filter by subject
            if (subjects.length > 0) {
                results = results.filter(q => subjects.includes(q.subject));
            }

            // Filter by chapter
            if (chapters.length > 0) {
                results = results.filter(q => chapters.includes(q.chapter));
            }

            // Filter by difficulty
            if (difficulties.length > 0) {
                results = results.filter(q => difficulties.includes(q.difficulty));
            }

            // Filter by PYQ status
            if (isPYQ !== null) {
                results = results.filter(q => q.isPYQ === isPYQ);
            }

            // Filter by source
            if (sources.length > 0) {
                results = results.filter(q => sources.includes(q.source));
            }

            // Filter by tags
            if (tags.length > 0) {
                results = results.filter(q => 
                    q.tags && q.tags.some(tag => tags.includes(tag))
                );
            }

            // Filter by date range
            if (dateRange) {
                results = results.filter(q => {
                    const questionDate = new Date(q.createdAt || q.updatedAt);
                    return questionDate >= new Date(dateRange.start) && 
                           questionDate <= new Date(dateRange.end);
                });
            }

            // Filter by usage range
            if (usageRange) {
                results = results.filter(q => 
                    q.usageCount >= usageRange.min && 
                    q.usageCount <= usageRange.max
                );
            }

            // Filter by accuracy range
            if (accuracyRange && accuracyRange.min !== undefined && accuracyRange.max !== undefined) {
                results = results.filter(q => {
                    const accuracy = q.totalAttempts > 0 ? 
                        (q.correctAttempts / q.totalAttempts) * 100 : 0;
                    return accuracy >= accuracyRange.min && accuracy <= accuracyRange.max;
                });
            }

            // Sort results
            results = this.sortQuestions(results, sortBy, sortOrder, query);

            // Limit results
            if (limit && limit > 0) {
                results = results.slice(0, limit);
            }

            // Cache results
            this.performance.searchCache.set(cacheKey, {
                results,
                timestamp: Date.now()
            });

            return results;
            
        } catch (error) {
            console.error('Error searching questions:', error);
            return [];
        }
    }

    /**
     * Perform text search on questions
     * @param {Array} questions - Questions to search
     * @param {string} query - Search query
     * @returns {Array} Filtered questions with relevance scores
     */
    performTextSearch(questions, query) {
        const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
        
        return questions.map(question => {
            let score = 0;
            const searchableText = [
                question.text || '',
                question.explanation || '',
                ...(question.options || []),
                question.subject || '',
                question.chapter || '',
                ...(question.tags || [])
            ].join(' ').toLowerCase();

            // Calculate relevance score
            for (const term of searchTerms) {
                const matches = (searchableText.match(new RegExp(term, 'g')) || []).length;
                score += matches;
                
                // Boost score for exact matches in question text
                if ((question.text || '').toLowerCase().includes(term)) {
                    score += 2;
                }
                
                // Boost score for matches in subject/chapter
                if ((question.subject || '').toLowerCase().includes(term) ||
                    (question.chapter || '').toLowerCase().includes(term)) {
                    score += 1;
                }
            }

            return { ...question, _relevanceScore: score };
        }).filter(question => question._relevanceScore > 0);
    }

    /**
     * Get questions by subject
     * @param {string} subject - Subject name
     * @param {Object} options - Additional options
     * @returns {Array} Questions for the subject
     */
    getQuestionsBySubject(subject, options = {}) {
        const questions = this.subjectIndex.get(subject) || [];
        return this.applyOptions(questions, options);
    }

    /**
     * Get questions by chapter
     * @param {string} chapter - Chapter name
     * @param {Object} options - Additional options
     * @returns {Array} Questions for the chapter
     */
    getQuestionsByChapter(chapter, options = {}) {
        const questions = this.chapterIndex.get(chapter) || [];
        return this.applyOptions(questions, options);
    }

    /**
     * Get questions by difficulty
     * @param {string} difficulty - Difficulty level
     * @param {Object} options - Additional options
     * @returns {Array} Questions for the difficulty level
     */
    getQuestionsByDifficulty(difficulty, options = {}) {
        const questions = this.difficultyIndex.get(difficulty) || [];
        return this.applyOptions(questions, options);
    }

    /**
     * Get random questions for test generation
     * @param {Object} criteria - Selection criteria
     * @returns {Array} Selected questions
     */
    getRandomQuestions(criteria = {}) {
        const {
            count = 10,
            subjects = [],
            chapters = [],
            difficulties = [],
            excludeIds = [],
            preferPYQ = false,
            difficultyDistribution = null
        } = criteria;

        let availableQuestions = this.questions.filter(q => 
            !excludeIds.includes(q.id)
        );

        // Apply filters
        if (subjects.length > 0) {
            availableQuestions = availableQuestions.filter(q => 
                subjects.includes(q.subject)
            );
        }

        if (chapters.length > 0) {
            availableQuestions = availableQuestions.filter(q => 
                chapters.includes(q.chapter)
            );
        }

        if (difficulties.length > 0) {
            availableQuestions = availableQuestions.filter(q => 
                difficulties.includes(q.difficulty)
            );
        }

        // Apply difficulty distribution if specified
        if (difficultyDistribution) {
            return this.selectQuestionsWithDistribution(
                availableQuestions, count, difficultyDistribution, preferPYQ
            );
        }

        // Prefer PYQ questions if specified
        if (preferPYQ) {
            const pyqQuestions = availableQuestions.filter(q => q.isPYQ);
            const nonPyqQuestions = availableQuestions.filter(q => !q.isPYQ);
            
            // Try to get 70% PYQ, 30% non-PYQ
            const pyqCount = Math.min(Math.floor(count * 0.7), pyqQuestions.length);
            const nonPyqCount = Math.min(count - pyqCount, nonPyqQuestions.length);
            
            availableQuestions = [
                ...this.shuffleArray(pyqQuestions).slice(0, pyqCount),
                ...this.shuffleArray(nonPyqQuestions).slice(0, nonPyqCount)
            ];
        }

        // Shuffle and select
        return this.shuffleArray(availableQuestions).slice(0, count);
    }

    // ===== VALIDATION AND SANITIZATION =====

    /**
     * Validate question data
     * @param {Object} questionData - Question data to validate
     * @returns {Object} Validation result
     */
    validateQuestion(questionData) {
        const errors = [];
        const config = this.constants.PDF_CONFIG || {};

        // Check required fields
        if (!questionData.text || typeof questionData.text !== 'string') {
            errors.push('Question text is required and must be a string');
        } else {
            const textLength = questionData.text.trim().length;
            const minLength = config.MIN_QUESTION_LENGTH || 10;
            const maxLength = config.MAX_QUESTION_LENGTH || 1000;
            
            if (textLength < minLength) {
                errors.push(`Question text must be at least ${minLength} characters long`);
            }
            if (textLength > maxLength) {
                errors.push(`Question text must not exceed ${maxLength} characters`);
            }
        }

        // Validate options
        if (!Array.isArray(questionData.options)) {
            errors.push('Options must be an array');
        } else {
            if (questionData.options.length !== 4) {
                errors.push('Exactly 4 options are required');
            }
            
            const minOptionLength = config.MIN_OPTION_LENGTH || 1;
            const maxOptionLength = config.MAX_OPTION_LENGTH || 200;
            
            questionData.options.forEach((option, index) => {
                if (!option || typeof option !== 'string') {
                    errors.push(`Option ${index + 1} is required and must be a string`);
                } else {
                    const optionLength = option.trim().length;
                    if (optionLength < minOptionLength) {
                        errors.push(`Option ${index + 1} must be at least ${minOptionLength} character long`);
                    }
                    if (optionLength > maxOptionLength) {
                        errors.push(`Option ${index + 1} must not exceed ${maxOptionLength} characters`);
                    }
                }
            });
        }

        // Validate correct answer
        if (typeof questionData.correctAnswer !== 'number' || 
            questionData.correctAnswer < 0 || 
            questionData.correctAnswer > 3) {
            errors.push('Correct answer must be a number between 0 and 3');
        }

        // Validate subject
        if (questionData.subject) {
            const validSubjects = this.getValidSubjects();
            if (validSubjects.length > 0 && !validSubjects.includes(questionData.subject)) {
                errors.push(`Invalid subject. Valid subjects are: ${validSubjects.join(', ')}`);
            }
        }

        // Validate difficulty
        if (questionData.difficulty) {
            const validDifficulties = ['Easy', 'Medium', 'Hard'];
            if (!validDifficulties.includes(questionData.difficulty)) {
                errors.push(`Invalid difficulty. Valid difficulties are: ${validDifficulties.join(', ')}`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Sanitize question data
     * @param {Object} questionData - Question data to sanitize
     * @returns {Object} Sanitized question data
     */
    sanitizeQuestion(questionData) {
        const sanitized = { ...questionData };

        // Sanitize text fields
        if (sanitized.text) {
            sanitized.text = this.sanitizeText(sanitized.text);
        }

        if (sanitized.explanation) {
            sanitized.explanation = this.sanitizeText(sanitized.explanation);
        }

        // Sanitize options
        if (Array.isArray(sanitized.options)) {
            sanitized.options = sanitized.options.map(option => 
                this.sanitizeText(option || '')
            );
        }

        // Sanitize subject and chapter
        if (sanitized.subject) {
            sanitized.subject = sanitized.subject.trim();
        }

        if (sanitized.chapter) {
            sanitized.chapter = sanitized.chapter.trim();
        }

        // Ensure boolean values
        sanitized.isPYQ = Boolean(sanitized.isPYQ);
        sanitized.needsReview = Boolean(sanitized.needsReview);

        // Set default values
        sanitized.difficulty = sanitized.difficulty || 'Medium';
        sanitized.source = sanitized.source || 'Manual';
        sanitized.tags = Array.isArray(sanitized.tags) ? sanitized.tags : [];

        return sanitized;
    }

    /**
     * Sanitize text content
     * @param {string} text - Text to sanitize
     * @returns {string} Sanitized text
     */
    sanitizeText(text) {
        if (typeof text !== 'string') return '';
        
        return text
            .trim()
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''); // Remove script tags
    }

    // ===== BULK OPERATIONS =====

    /**
     * Import questions from various formats
     * @param {Array|Object} data - Questions data
     * @param {Object} options - Import options
     * @returns {Object} Import result
     */
    importQuestions(data, options = {}) {
        try {
            const {
                format = 'json',
                defaultSubject = 'General',
                defaultChapter = 'Miscellaneous',
                defaultDifficulty = 'Medium',
                skipDuplicates = true,
                overwriteExisting = false
            } = options;

            let questions = [];

            // Parse data based on format
            switch (format.toLowerCase()) {
                case 'json':
                    questions = Array.isArray(data) ? data : [data];
                    break;
                case 'csv':
                    questions = this.parseCSVQuestions(data);
                    break;
                case 'txt':
                    questions = this.parseTextQuestions(data);
                    break;
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }

            const results = {
                imported: [],
                skipped: [],
                failed: [],
                total: questions.length
            };

            for (const questionData of questions) {
                try {
                    // Apply defaults
                    const processedQuestion = {
                        subject: defaultSubject,
                        chapter: defaultChapter,
                        difficulty: defaultDifficulty,
                        ...questionData
                    };

                    // Check for duplicates if enabled
                    if (skipDuplicates) {
                        const duplicates = this.findSimilarQuestions(processedQuestion.text);
                        if (duplicates.length > 0) {
                            results.skipped.push({
                                question: processedQuestion,
                                reason: 'Duplicate detected'
                            });
                            continue;
                        }
                    }

                    // Check if overwriting existing
                    if (processedQuestion.id && this.getQuestionById(processedQuestion.id)) {
                        if (overwriteExisting) {
                            const updateResult = this.updateQuestion(processedQuestion.id, processedQuestion);
                            if (updateResult.success) {
                                results.imported.push(updateResult.question);
                            } else {
                                results.failed.push({
                                    question: processedQuestion,
                                    error: updateResult.error
                                });
                            }
                        } else {
                            results.skipped.push({
                                question: processedQuestion,
                                reason: 'Question ID already exists'
                            });
                        }
                        continue;
                    }

                    // Add new question
                    const addResult = this.addQuestion(processedQuestion);
                    if (addResult.success) {
                        results.imported.push(addResult.question);
                    } else {
                        results.failed.push({
                            question: processedQuestion,
                            error: addResult.error
                        });
                    }

                } catch (error) {
                    results.failed.push({
                        question: questionData,
                        error: error.message
                    });
                }
            }

            return {
                success: results.failed.length === 0,
                results,
                message: `Import completed: ${results.imported.length} imported, ${results.skipped.length} skipped, ${results.failed.length} failed`
            };

        } catch (error) {
            console.error('Error importing questions:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Export questions in various formats
     * @param {Object} options - Export options
     * @returns {Object} Export result with data
     */
    exportQuestions(options = {}) {
        try {
            const {
                format = 'json',
                filters = {},
                includeAnalytics = false,
                includeMetadata = true,
                fileName = null
            } = options;

            // Get questions based on filters
            let questions = this.searchQuestions(filters);

            // Remove internal properties if not including metadata
            if (!includeMetadata) {
                questions = questions.map(q => {
                    const { _relevanceScore, usageCount, correctAttempts, totalAttempts, createdAt, updatedAt, ...cleanQuestion } = q;
                    return cleanQuestion;
                });
            }

            let exportData;
            let mimeType;
            let fileExtension;

            switch (format.toLowerCase()) {
                case 'json':
                    exportData = JSON.stringify({
                        questions,
                        metadata: {
                            exportDate: new Date().toISOString(),
                            totalQuestions: questions.length,
                            analytics: includeAnalytics ? this.getAnalytics() : null
                        }
                    }, null, 2);
                    mimeType = 'application/json';
                    fileExtension = 'json';
                    break;

                case 'csv':
                    exportData = this.generateCSV(questions);
                    mimeType = 'text/csv';
                    fileExtension = 'csv';
                    break;

                case 'txt':
                    exportData = this.generateTextFormat(questions);
                    mimeType = 'text/plain';
                    fileExtension = 'txt';
                    break;

                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }

            const suggestedFileName = fileName || 
                `questions_export_${new Date().toISOString().slice(0, 10)}.${fileExtension}`;

            return {
                success: true,
                data: exportData,
                mimeType,
                fileName: suggestedFileName,
                count: questions.length
            };

        } catch (error) {
            console.error('Error exporting questions:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ===== ANALYTICS AND STATISTICS =====

    /**
     * Get comprehensive analytics
     * @returns {Object} Analytics data
     */
    getAnalytics() {
        return { ...this.analytics };
    }

    /**
     * Get question statistics
     * @param {Object} filters - Optional filters
     * @returns {Object} Statistics object
     */
    getStatistics(filters = {}) {
        const questions = filters ? this.searchQuestions(filters) : this.questions;
        
        const stats = {
            total: questions.length,
            bySubject: {},
            byChapter: {},
            byDifficulty: {},
            bySource: {},
            pyqStats: {
                total: 0,
                percentage: 0
            },
            usageStats: {
                totalUsage: 0,
                averageUsage: 0,
                maxUsage: 0,
                unusedCount: 0
            },
            accuracyStats: {
                averageAccuracy: 0,
                highAccuracyCount: 0,
                lowAccuracyCount: 0
            },
            dateStats: {
                oldestQuestion: null,
                newestQuestion: null,
                questionsThisMonth: 0,
                questionsThisWeek: 0
            }
        };

        // Calculate statistics
        let totalUsage = 0;
        let totalAccuracy = 0;
        let accuracyCount = 0;
        let maxUsage = 0;

        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        for (const question of questions) {
            // Subject distribution
            stats.bySubject[question.subject] = (stats.bySubject[question.subject] || 0) + 1;
            
            // Chapter distribution
            stats.byChapter[question.chapter] = (stats.byChapter[question.chapter] || 0) + 1;
            
            // Difficulty distribution
            stats.byDifficulty[question.difficulty] = (stats.byDifficulty[question.difficulty] || 0) + 1;
            
            // Source distribution
            stats.bySource[question.source] = (stats.bySource[question.source] || 0) + 1;
            
            // PYQ stats
            if (question.isPYQ) {
                stats.pyqStats.total++;
            }
            
            // Usage stats
            const usage = question.usageCount || 0;
            totalUsage += usage;
            maxUsage = Math.max(maxUsage, usage);
            if (usage === 0) {
                stats.usageStats.unusedCount++;
            }
            
            // Accuracy stats
            if (question.totalAttempts > 0) {
                const accuracy = (question.correctAttempts / question.totalAttempts) * 100;
                totalAccuracy += accuracy;
                accuracyCount++;
                
                if (accuracy >= 80) stats.accuracyStats.highAccuracyCount++;
                if (accuracy <= 40) stats.accuracyStats.lowAccuracyCount++;
            }
            
            // Date stats
            const questionDate = new Date(question.createdAt || question.updatedAt);
            if (!stats.dateStats.oldestQuestion || questionDate < new Date(stats.dateStats.oldestQuestion)) {
                stats.dateStats.oldestQuestion = question.createdAt || question.updatedAt;
            }
            if (!stats.dateStats.newestQuestion || questionDate > new Date(stats.dateStats.newestQuestion)) {
                stats.dateStats.newestQuestion = question.createdAt || question.updatedAt;
            }
            
            if (questionDate >= oneWeekAgo) stats.dateStats.questionsThisWeek++;
            if (questionDate >= oneMonthAgo) stats.dateStats.questionsThisMonth++;
        }

        // Calculate percentages and averages
        stats.pyqStats.percentage = stats.total > 0 ? (stats.pyqStats.total / stats.total) * 100 : 0;
        stats.usageStats.totalUsage = totalUsage;
        stats.usageStats.averageUsage = stats.total > 0 ? totalUsage / stats.total : 0;
        stats.usageStats.maxUsage = maxUsage;
        stats.accuracyStats.averageAccuracy = accuracyCount > 0 ? totalAccuracy / accuracyCount : 0;

        return stats;
    }

    /**
     * Track question usage
     * @param {string} questionId - Question ID
     * @param {boolean} wasCorrect - Whether the answer was correct
     */
    trackQuestionUsage(questionId, wasCorrect = null) {
        const question = this.getQuestionById(questionId);
        if (!question) return;

        question.usageCount = (question.usageCount || 0) + 1;
        
        if (wasCorrect !== null) {
            question.totalAttempts = (question.totalAttempts || 0) + 1;
            if (wasCorrect) {
                question.correctAttempts = (question.correctAttempts || 0) + 1;
            }
        }

        question.lastUsed = new Date().toISOString();
        
        // Update the question
        this.updateQuestion(questionId, question);
    }

    // ===== DEDUPLICATION AND SIMILARITY =====

    /**
     * Find similar questions using text similarity
     * @param {string} questionText - Question text to compare
     * @param {number} threshold - Similarity threshold (0-1)
     * @returns {Array} Array of similar questions
     */
    findSimilarQuestions(questionText, threshold = null) {
        const similarityThreshold = threshold || this.config.similarityThreshold;
        const similar = [];

        for (const question of this.questions) {
            const similarity = this.calculateTextSimilarity(questionText, question.text);
            if (similarity >= similarityThreshold) {
                similar.push({
                    question,
                    similarity
                });
            }
        }

        return similar.sort((a, b) => b.similarity - a.similarity);
    }

    /**
     * Calculate text similarity between two strings
     * @param {string} text1 - First text
     * @param {string} text2 - Second text
     * @returns {number} Similarity score (0-1)
     */
    calculateTextSimilarity(text1, text2) {
        if (!text1 || !text2) return 0;
        
        const normalize = (text) => text.toLowerCase().replace(/[^\w\s]/g, '').trim();
        const norm1 = normalize(text1);
        const norm2 = normalize(text2);
        
        if (norm1 === norm2) return 1;
        
        // Use Jaccard similarity with n-grams
        const ngrams1 = this.generateNGrams(norm1, 3);
        const ngrams2 = this.generateNGrams(norm2, 3);
        
        const set1 = new Set(ngrams1);
        const set2 = new Set(ngrams2);
        
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        
        return union.size > 0 ? intersection.size / union.size : 0;
    }

    /**
     * Generate n-grams from text
     * @param {string} text - Input text
     * @param {number} n - N-gram size
     * @returns {Array} Array of n-grams
     */
    generateNGrams(text, n = 3) {
        const words = text.split(/\s+/);
        const ngrams = [];
        
        for (let i = 0; i <= words.length - n; i++) {
            ngrams.push(words.slice(i, i + n).join(' '));
        }
        
        return ngrams;
    }

    /**
     * Remove duplicate questions
     * @param {number} threshold - Similarity threshold for duplicates
     * @returns {Object} Result with removed duplicates
     */
    removeDuplicates(threshold = 0.9) {
        const removed = [];
        const toRemove = new Set();

        for (let i = 0; i < this.questions.length; i++) {
            if (toRemove.has(this.questions[i].id)) continue;

            for (let j = i + 1; j < this.questions.length; j++) {
                if (toRemove.has(this.questions[j].id)) continue;

                const similarity = this.calculateTextSimilarity(
                    this.questions[i].text,
                    this.questions[j].text
                );

                if (similarity >= threshold) {
                    // Keep the one with more usage or the newer one
                    const keep = (this.questions[i].usageCount || 0) >= (this.questions[j].usageCount || 0) ? i : j;
                    const remove = keep === i ? j : i;
                    
                    toRemove.add(this.questions[remove].id);
                    removed.push({
                        removed: this.questions[remove],
                        kept: this.questions[keep],
                        similarity
                    });
                }
            }
        }

        // Remove the duplicates
        for (const id of toRemove) {
            this.deleteQuestion(id);
        }

        return {
            success: true,
            removedCount: removed.length,
            removed
        };
    }

    // ===== UTILITY METHODS =====

    /**
     * Auto-detect subject and chapter from question text
     * @param {string} questionText - Question text to analyze
     * @returns {Object} Detected subject and chapter
     */
    autoDetectSubjectChapter(questionText) {
        if (!this.syllabusUtils || !this.syllabusUtils.detectSubjectAndChapter) {
            return { subject: null, chapter: null };
        }

        return this.syllabusUtils.detectSubjectAndChapter(questionText);
    }

    /**
     * Generate unique question ID
     * @returns {string} Unique question ID
     */
    generateQuestionId() {
        return 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get valid subjects from syllabus mapping
     * @returns {Array} Array of valid subjects
     */
    getValidSubjects() {
        if (!this.syllabusMapping) return [];
        return Object.keys(this.syllabusMapping).filter(key => key !== 'global_keywords');
    }

    /**
     * Get valid chapters for a subject
     * @param {string} subject - Subject name
     * @returns {Array} Array of valid chapters
     */
    getValidChapters(subject) {
        if (!this.syllabusMapping || !this.syllabusMapping[subject]) return [];
        return this.syllabusMapping[subject].chapters || [];
    }

    /**
     * Sort questions by various criteria
     * @param {Array} questions - Questions to sort
     * @param {string} sortBy - Sort criteria
     * @param {string} sortOrder - Sort order (asc/desc)
     * @param {string} query - Search query for relevance sorting
     * @returns {Array} Sorted questions
     */
    sortQuestions(questions, sortBy = 'createdAt', sortOrder = 'desc', query = '') {
        const sortFunctions = {
            relevance: (a, b) => (b._relevanceScore || 0) - (a._relevanceScore || 0),
            createdAt: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
            updatedAt: (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0),
            subject: (a, b) => (a.subject || '').localeCompare(b.subject || ''),
            chapter: (a, b) => (a.chapter || '').localeCompare(b.chapter || ''),
            difficulty: (a, b) => {
                const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
                return (difficultyOrder[a.difficulty] || 2) - (difficultyOrder[b.difficulty] || 2);
            },
            usage: (a, b) => (b.usageCount || 0) - (a.usageCount || 0),
            accuracy: (a, b) => {
                const accuracyA = a.totalAttempts > 0 ? (a.correctAttempts / a.totalAttempts) : 0;
                const accuracyB = b.totalAttempts > 0 ? (b.correctAttempts / b.totalAttempts) : 0;
                return accuracyB - accuracyA;
            }
        };

        const sortFunction = sortFunctions[sortBy] || sortFunctions.createdAt;
        let sorted = [...questions].sort(sortFunction);

        if (sortOrder === 'asc' && sortBy !== 'relevance') {
            sorted.reverse();
        }

        return sorted;
    }

    /**
     * Apply options to question list (pagination, sorting, etc.)
     * @param {Array} questions - Questions to process
     * @param {Object} options - Options to apply
     * @returns {Array} Processed questions
     */
    applyOptions(questions, options = {}) {
        let result = [...questions];

        // Apply sorting
        if (options.sortBy) {
            result = this.sortQuestions(result, options.sortBy, options.sortOrder);
        }

        // Apply pagination
        if (options.page && options.pageSize) {
            const start = (options.page - 1) * options.pageSize;
            const end = start + options.pageSize;
            result = result.slice(start, end);
        }

        return result;
    }

    /**
     * Select questions with specific difficulty distribution
     * @param {Array} questions - Available questions
     * @param {number} count - Total questions needed
     * @param {Object} distribution - Difficulty distribution
     * @param {boolean} preferPYQ - Prefer PYQ questions
     * @returns {Array} Selected questions
     */
    selectQuestionsWithDistribution(questions, count, distribution, preferPYQ = false) {
        const selected = [];
        const difficulties = ['Easy', 'Medium', 'Hard'];

        for (const difficulty of difficulties) {
            const targetCount = Math.floor(count * (distribution[difficulty] || 0));
            if (targetCount === 0) continue;

            let availableQuestions = questions.filter(q => q.difficulty === difficulty);
            
            if (preferPYQ) {
                const pyqQuestions = availableQuestions.filter(q => q.isPYQ);
                const nonPyqQuestions = availableQuestions.filter(q => !q.isPYQ);
                
                const pyqCount = Math.min(Math.floor(targetCount * 0.7), pyqQuestions.length);
                const nonPyqCount = Math.min(targetCount - pyqCount, nonPyqQuestions.length);
                
                availableQuestions = [
                    ...this.shuffleArray(pyqQuestions).slice(0, pyqCount),
                    ...this.shuffleArray(nonPyqQuestions).slice(0, nonPyqCount)
                ];
            }

            const selectedFromDifficulty = this.shuffleArray(availableQuestions).slice(0, targetCount);
            selected.push(...selectedFromDifficulty);
        }

        // Fill remaining slots if needed
        const remaining = count - selected.length;
        if (remaining > 0) {
            const usedIds = new Set(selected.map(q => q.id));
            const availableRemaining = questions.filter(q => !usedIds.has(q.id));
            const additionalQuestions = this.shuffleArray(availableRemaining).slice(0, remaining);
            selected.push(...additionalQuestions);
        }

        return this.shuffleArray(selected).slice(0, count);
    }

    /**
     * Shuffle array using Fisher-Yates algorithm
     * @param {Array} array - Array to shuffle
     * @returns {Array} Shuffled array
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
     * Parse CSV format questions
     * @param {string} csvData - CSV data
     * @returns {Array} Parsed questions
     */
    parseCSVQuestions(csvData) {
        const lines = csvData.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        const questions = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const question = {};

            headers.forEach((header, index) => {
                question[header] = values[index] || '';
            });

            // Convert options string to array
            if (question.options) {
                question.options = question.options.split('|').map(opt => opt.trim());
            }

            // Convert correctAnswer to number
            if (question.correctAnswer) {
                question.correctAnswer = parseInt(question.correctAnswer) || 0;
            }

            // Convert boolean fields
            question.isPYQ = question.isPYQ === 'true' || question.isPYQ === '1';
            question.needsReview = question.needsReview === 'true' || question.needsReview === '1';

            questions.push(question);
        }

        return questions;
    }

    /**
     * Parse text format questions
     * @param {string} textData - Text data
     * @returns {Array} Parsed questions
     */
    parseTextQuestions(textData) {
        // This would implement text parsing logic similar to existing PDF parsing
        // For now, return empty array
        console.warn('Text format parsing not yet implemented');
        return [];
    }

    /**
     * Generate CSV format
     * @param {Array} questions - Questions to export
     * @returns {string} CSV string
     */
    generateCSV(questions) {
        if (questions.length === 0) return '';

        const headers = ['id', 'text', 'options', 'correctAnswer', 'explanation', 'subject', 'chapter', 'difficulty', 'isPYQ', 'source'];
        const rows = [headers.join(',')];

        for (const question of questions) {
            const row = headers.map(header => {
                let value = question[header] || '';
                
                if (header === 'options' && Array.isArray(value)) {
                    value = value.join('|');
                }
                
                // Escape commas and quotes
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    value = `"${value.replace(/"/g, '""')}"`;
                }
                
                return value;
            });
            
            rows.push(row.join(','));
        }

        return rows.join('\n');
    }

    /**
     * Generate text format
     * @param {Array} questions - Questions to export
     * @returns {string} Text string
     */
    generateTextFormat(questions) {
        let text = `Question Bank Export\nGenerated: ${new Date().toISOString()}\nTotal Questions: ${questions.length}\n\n`;
        
        questions.forEach((question, index) => {
            text += `Question ${index + 1}:\n`;
            text += `Subject: ${question.subject}\n`;
            text += `Chapter: ${question.chapter}\n`;
            text += `Difficulty: ${question.difficulty}\n`;
            text += `PYQ: ${question.isPYQ ? 'Yes' : 'No'}\n\n`;
            text += `${question.text}\n\n`;
            
            question.options.forEach((option, optIndex) => {
                const letter = String.fromCharCode(65 + optIndex);
                const marker = optIndex === question.correctAnswer ? '✓' : ' ';
                text += `${letter}) ${option} ${marker}\n`;
            });
            
            text += `\nExplanation: ${question.explanation}\n`;
            text += `\n${'='.repeat(50)}\n\n`;
        });
        
        return text;
    }

    // ===== STORAGE AND PERSISTENCE =====

    /**
     * Load questions from storage
     */
    async loadQuestions() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            this.questions = stored ? JSON.parse(stored) : [];
            console.log(`Loaded ${this.questions.length} questions from storage`);
        } catch (error) {
            console.error('Error loading questions from storage:', error);
            this.questions = [];
        }
    }

    /**
     * Save questions to storage
     */
    saveQuestions() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.questions));
            console.log(`Saved ${this.questions.length} questions to storage`);
            
            // Update last save time
            this.uiState.lastAutoSave = Date.now();
        } catch (error) {
            console.error('Error saving questions to storage:', error);
            throw error;
        }
    }

    /**
     * Setup auto-save functionality
     */
    setupAutoSave() {
        const interval = this.constants.APP_CONFIG?.AUTO_SAVE_INTERVAL || 30000;
        
        setInterval(() => {
            if (Date.now() - this.uiState.lastAutoSave > interval) {
                this.saveQuestions();
            }
        }, interval);
    }

    // ===== INDEX MANAGEMENT =====

    /**
     * Build all indices for fast operations
     */
    buildIndices() {
        console.log('Building question indices...');
        
        // Clear existing indices
        this.questionIndex.clear();
        this.subjectIndex.clear();
        this.chapterIndex.clear();
        this.difficultyIndex.clear();
        this.searchIndex.clear();

        // Build indices
        for (const question of this.questions) {
            this.updateIndicesForQuestion(question, 'add');
        }

        this.performance.lastIndexUpdate = Date.now();
        console.log('Question indices built successfully');
    }

    /**
     * Update indices for a specific question
     * @param {Object} question - Question object
     * @param {string} operation - Operation (add/remove)
     */
    updateIndicesForQuestion(question, operation) {
        if (operation === 'add') {
            // Question ID index
            this.questionIndex.set(question.id, question);
            
            // Subject index
            if (!this.subjectIndex.has(question.subject)) {
                this.subjectIndex.set(question.subject, []);
            }
            this.subjectIndex.get(question.subject).push(question);
            
            // Chapter index
            if (!this.chapterIndex.has(question.chapter)) {
                this.chapterIndex.set(question.chapter, []);
            }
            this.chapterIndex.get(question.chapter).push(question);
            
            // Difficulty index
            if (!this.difficultyIndex.has(question.difficulty)) {
                this.difficultyIndex.set(question.difficulty, []);
            }
            this.difficultyIndex.get(question.difficulty).push(question);
            
        } else if (operation === 'remove') {
            // Question ID index
            this.questionIndex.delete(question.id);
            
            // Subject index
            const subjectQuestions = this.subjectIndex.get(question.subject);
            if (subjectQuestions) {
                const index = subjectQuestions.findIndex(q => q.id === question.id);
                if (index !== -1) {
                    subjectQuestions.splice(index, 1);
                }
            }
            
            // Chapter index
            const chapterQuestions = this.chapterIndex.get(question.chapter);
            if (chapterQuestions) {
                const index = chapterQuestions.findIndex(q => q.id === question.id);
                if (index !== -1) {
                    chapterQuestions.splice(index, 1);
                }
            }
            
            // Difficulty index
            const difficultyQuestions = this.difficultyIndex.get(question.difficulty);
            if (difficultyQuestions) {
                const index = difficultyQuestions.findIndex(q => q.id === question.id);
                if (index !== -1) {
                    difficultyQuestions.splice(index, 1);
                }
            }
        }
    }

    /**
     * Update analytics data
     */
    updateAnalytics() {
        const stats = this.getStatistics();
        
        this.analytics = {
            ...this.analytics,
            totalQuestions: stats.total,
            subjectDistribution: stats.bySubject,
            difficultyDistribution: stats.byDifficulty,
            chapterDistribution: stats.byChapter,
            sourceDistribution: stats.bySource,
            pyqCount: stats.pyqStats.total,
            lastUpdated: new Date().toISOString()
        };

        // Save analytics to storage
        try {
            localStorage.setItem(this.analyticsKey, JSON.stringify(this.analytics));
        } catch (error) {
            console.error('Error saving analytics:', error);
        }
    }

    // ===== PUBLIC API METHODS =====

    /**
     * Get the total number of questions
     * @returns {number} Total question count
     */
    getQuestionCount() {
        return this.questions.length;
    }

    /**
     * Clear all questions (with confirmation)
     * @param {boolean} confirmed - Confirmation flag
     * @returns {Object} Result object
     */
    clearAllQuestions(confirmed = false) {
        if (!confirmed) {
            return {
                success: false,
                error: 'Confirmation required to clear all questions'
            };
        }

        this.questions = [];
        this.buildIndices();
        this.saveQuestions();
        this.updateAnalytics();

        return {
            success: true,
            message: 'All questions cleared successfully'
        };
    }

    /**
     * Get configuration
     * @returns {Object} Current configuration
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Update configuration
     * @param {Object} newConfig - New configuration values
     * @returns {Object} Result object
     */
    updateConfig(newConfig) {
        try {
            this.config = { ...this.config, ...newConfig };
            return {
                success: true,
                message: 'Configuration updated successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = QuestionManager;
} else {
    // Browser environment - attach to window object
    window.QuestionManager = QuestionManager;
}