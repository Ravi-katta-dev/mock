/**
 * Question Manager Module
 * Handles question management, validation, categorization, and organization
 */

class QuestionManager {
    constructor() {
        this.initialized = false;
        this.questions = new Map();
        this.categories = new Set();
        this.subjects = new Set();
        this.validationRules = {
            required: ['questionText', 'options', 'correctAnswer'],
            minOptionLength: 2,
            maxOptionLength: 4,
            maxQuestionLength: 1000,
            maxOptionTextLength: 200
        };
    }

    /**
     * Initialize the Question Manager module
     */
    init() {
        if (this.initialized) return;
        
        console.log('Initializing Question Manager module...');
        this.loadStoredQuestions();
        this.setupQuestionEventListeners();
        this.initialized = true;
        console.log('Question Manager module initialized successfully');
    }

    /**
     * Load stored questions from localStorage
     */
    loadStoredQuestions() {
        try {
            const storedQuestions = localStorage.getItem('questions');
            if (storedQuestions) {
                const questionsArray = JSON.parse(storedQuestions);
                questionsArray.forEach(question => {
                    this.questions.set(question.id, question);
                    this.categories.add(question.category || 'General');
                    this.subjects.add(question.subject || 'General');
                });
                console.log(`Loaded ${questionsArray.length} questions from storage`);
            }
        } catch (error) {
            console.warn('Failed to load stored questions:', error);
        }
    }

    /**
     * Save questions to localStorage
     */
    saveQuestions() {
        try {
            const questionsArray = Array.from(this.questions.values());
            localStorage.setItem('questions', JSON.stringify(questionsArray));
            console.log(`Saved ${questionsArray.length} questions to storage`);
        } catch (error) {
            console.warn('Failed to save questions:', error);
        }
    }

    /**
     * Add a new question
     * @param {Object} questionData - The question data
     * @returns {Object} - Result object with success status and data
     */
    addQuestion(questionData) {
        try {
            // Validate question data
            const validation = this.validateQuestion(questionData);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: 'Validation failed',
                    details: validation.errors
                };
            }

            // Process and normalize question data
            const processedQuestion = this.processQuestionData(questionData);
            
            // Generate unique ID if not provided
            if (!processedQuestion.id) {
                processedQuestion.id = this.generateQuestionId();
            }

            // Add timestamps
            processedQuestion.createdAt = new Date().toISOString();
            processedQuestion.updatedAt = processedQuestion.createdAt;

            // Store question
            this.questions.set(processedQuestion.id, processedQuestion);
            this.categories.add(processedQuestion.category);
            this.subjects.add(processedQuestion.subject);

            // Save to localStorage
            this.saveQuestions();

            // Trigger event
            this.dispatchQuestionEvent('questionAdded', processedQuestion);

            console.log('Question added successfully:', processedQuestion.id);
            return {
                success: true,
                question: processedQuestion
            };
        } catch (error) {
            console.error('Failed to add question:', error);
            return {
                success: false,
                error: 'Failed to add question',
                details: error.message
            };
        }
    }

    /**
     * Update an existing question
     * @param {string} questionId - The question ID
     * @param {Object} updatedData - The updated question data
     * @returns {Object} - Result object
     */
    updateQuestion(questionId, updatedData) {
        try {
            const existingQuestion = this.questions.get(questionId);
            if (!existingQuestion) {
                return {
                    success: false,
                    error: 'Question not found'
                };
            }

            // Validate updated data
            const mergedData = { ...existingQuestion, ...updatedData };
            const validation = this.validateQuestion(mergedData);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: 'Validation failed',
                    details: validation.errors
                };
            }

            // Process and update
            const processedQuestion = this.processQuestionData(mergedData);
            processedQuestion.updatedAt = new Date().toISOString();

            // Update question
            this.questions.set(questionId, processedQuestion);
            this.categories.add(processedQuestion.category);
            this.subjects.add(processedQuestion.subject);

            // Save to localStorage
            this.saveQuestions();

            // Trigger event
            this.dispatchQuestionEvent('questionUpdated', processedQuestion);

            console.log('Question updated successfully:', questionId);
            return {
                success: true,
                question: processedQuestion
            };
        } catch (error) {
            console.error('Failed to update question:', error);
            return {
                success: false,
                error: 'Failed to update question',
                details: error.message
            };
        }
    }

    /**
     * Delete a question
     * @param {string} questionId - The question ID
     * @returns {Object} - Result object
     */
    deleteQuestion(questionId) {
        try {
            const question = this.questions.get(questionId);
            if (!question) {
                return {
                    success: false,
                    error: 'Question not found'
                };
            }

            // Remove question
            this.questions.delete(questionId);

            // Save to localStorage
            this.saveQuestions();

            // Trigger event
            this.dispatchQuestionEvent('questionDeleted', { id: questionId });

            console.log('Question deleted successfully:', questionId);
            return {
                success: true,
                deletedId: questionId
            };
        } catch (error) {
            console.error('Failed to delete question:', error);
            return {
                success: false,
                error: 'Failed to delete question',
                details: error.message
            };
        }
    }

    /**
     * Get a question by ID
     * @param {string} questionId - The question ID
     * @returns {Object|null} - The question or null if not found
     */
    getQuestion(questionId) {
        return this.questions.get(questionId) || null;
    }

    /**
     * Get all questions with optional filtering
     * @param {Object} filters - Filtering options
     * @returns {Array} - Array of questions
     */
    getQuestions(filters = {}) {
        let questions = Array.from(this.questions.values());

        // Apply filters
        if (filters.subject) {
            questions = questions.filter(q => q.subject === filters.subject);
        }
        
        if (filters.category) {
            questions = questions.filter(q => q.category === filters.category);
        }
        
        if (filters.difficulty) {
            questions = questions.filter(q => q.difficulty === filters.difficulty);
        }
        
        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            questions = questions.filter(q => 
                q.questionText.toLowerCase().includes(term) ||
                q.options.some(opt => opt.toLowerCase().includes(term))
            );
        }

        // Apply sorting
        if (filters.sortBy) {
            questions.sort((a, b) => {
                const aVal = a[filters.sortBy];
                const bVal = b[filters.sortBy];
                
                if (filters.sortOrder === 'desc') {
                    return bVal > aVal ? 1 : -1;
                }
                return aVal > bVal ? 1 : -1;
            });
        }

        return questions;
    }

    /**
     * Get questions for test generation
     * @param {Object} criteria - Test criteria
     * @returns {Array} - Array of selected questions
     */
    getQuestionsForTest(criteria) {
        let availableQuestions = this.getQuestions(criteria);
        
        // Shuffle questions
        availableQuestions = this.shuffleArray(availableQuestions);
        
        // Apply count limit
        if (criteria.count && criteria.count < availableQuestions.length) {
            availableQuestions = availableQuestions.slice(0, criteria.count);
        }

        return availableQuestions;
    }

    /**
     * Validate question data
     * @param {Object} questionData - The question data to validate
     * @returns {Object} - Validation result
     */
    validateQuestion(questionData) {
        const errors = [];

        // Check required fields
        this.validationRules.required.forEach(field => {
            if (!questionData[field]) {
                errors.push(`${field} is required`);
            }
        });

        // Validate question text
        if (questionData.questionText) {
            if (questionData.questionText.length > this.validationRules.maxQuestionLength) {
                errors.push(`Question text is too long (max ${this.validationRules.maxQuestionLength} characters)`);
            }
        }

        // Validate options
        if (questionData.options) {
            if (!Array.isArray(questionData.options)) {
                errors.push('Options must be an array');
            } else {
                if (questionData.options.length < this.validationRules.minOptionLength) {
                    errors.push(`At least ${this.validationRules.minOptionLength} options required`);
                }
                
                if (questionData.options.length > this.validationRules.maxOptionLength) {
                    errors.push(`Maximum ${this.validationRules.maxOptionLength} options allowed`);
                }

                questionData.options.forEach((option, index) => {
                    if (!option || option.trim().length === 0) {
                        errors.push(`Option ${index + 1} cannot be empty`);
                    } else if (option.length > this.validationRules.maxOptionTextLength) {
                        errors.push(`Option ${index + 1} is too long (max ${this.validationRules.maxOptionTextLength} characters)`);
                    }
                });
            }
        }

        // Validate correct answer
        if (questionData.correctAnswer !== undefined && questionData.options) {
            const correctIndex = parseInt(questionData.correctAnswer);
            if (isNaN(correctIndex) || correctIndex < 0 || correctIndex >= questionData.options.length) {
                errors.push('Correct answer index is invalid');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Process and normalize question data
     * @param {Object} questionData - Raw question data
     * @returns {Object} - Processed question data
     */
    processQuestionData(questionData) {
        const processed = { ...questionData };

        // Trim text fields
        if (processed.questionText) {
            processed.questionText = processed.questionText.trim();
        }

        if (processed.explanation) {
            processed.explanation = processed.explanation.trim();
        }

        // Process options
        if (processed.options && Array.isArray(processed.options)) {
            processed.options = processed.options.map(option => 
                typeof option === 'string' ? option.trim() : option
            );
        }

        // Normalize subject and category
        processed.subject = processed.subject || 'General';
        processed.category = processed.category || 'General';
        processed.difficulty = processed.difficulty || 'Medium';

        // Ensure correct answer is a number
        if (processed.correctAnswer !== undefined) {
            processed.correctAnswer = parseInt(processed.correctAnswer);
        }

        return processed;
    }

    /**
     * Generate a unique question ID
     * @returns {string} - Unique ID
     */
    generateQuestionId() {
        return 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Shuffle array using Fisher-Yates algorithm
     * @param {Array} array - Array to shuffle
     * @returns {Array} - Shuffled array
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
     * Get available subjects
     * @returns {Array} - Array of subjects
     */
    getSubjects() {
        return Array.from(this.subjects).sort();
    }

    /**
     * Get available categories
     * @returns {Array} - Array of categories
     */
    getCategories() {
        return Array.from(this.categories).sort();
    }

    /**
     * Get question statistics
     * @returns {Object} - Statistics object
     */
    getStatistics() {
        const questions = Array.from(this.questions.values());
        const subjectCounts = {};
        const difficultyCounts = {};

        questions.forEach(question => {
            subjectCounts[question.subject] = (subjectCounts[question.subject] || 0) + 1;
            difficultyCounts[question.difficulty] = (difficultyCounts[question.difficulty] || 0) + 1;
        });

        return {
            totalQuestions: questions.length,
            subjectCounts,
            difficultyCounts,
            subjects: this.getSubjects(),
            categories: this.getCategories()
        };
    }

    /**
     * Bulk import questions
     * @param {Array} questionsArray - Array of questions to import
     * @returns {Object} - Import result
     */
    bulkImport(questionsArray) {
        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        questionsArray.forEach((questionData, index) => {
            const result = this.addQuestion(questionData);
            if (result.success) {
                results.success++;
            } else {
                results.failed++;
                results.errors.push({
                    index,
                    error: result.error,
                    details: result.details
                });
            }
        });

        console.log(`Bulk import complete: ${results.success} success, ${results.failed} failed`);
        return results;
    }

    /**
     * Export questions
     * @param {Object} filters - Export filters
     * @returns {Array} - Array of questions
     */
    exportQuestions(filters = {}) {
        return this.getQuestions(filters);
    }

    /**
     * Setup event listeners for question management
     */
    setupQuestionEventListeners() {
        // Listen for question form submissions
        document.addEventListener('submitQuestion', (event) => {
            const result = this.addQuestion(event.detail);
            this.dispatchQuestionEvent('questionSubmissionResult', result);
        });

        // Listen for question updates
        document.addEventListener('updateQuestion', (event) => {
            const { id, data } = event.detail;
            const result = this.updateQuestion(id, data);
            this.dispatchQuestionEvent('questionUpdateResult', result);
        });

        // Listen for question deletions
        document.addEventListener('deleteQuestion', (event) => {
            const result = this.deleteQuestion(event.detail.id);
            this.dispatchQuestionEvent('questionDeleteResult', result);
        });
    }

    /**
     * Dispatch question-related events
     * @param {string} eventType - Event type
     * @param {Object} data - Event data
     */
    dispatchQuestionEvent(eventType, data) {
        document.dispatchEvent(new CustomEvent(eventType, {
            detail: data
        }));
    }

    /**
     * Get total question count for dashboard
     * @returns {number} Total number of questions
     */
    getTotalQuestionCount() {
        return this.questions.size;
    }

    /**
     * Clear all questions
     */
    clearAllQuestions() {
        this.questions.clear();
        this.categories.clear();
        this.subjects.clear();
        localStorage.removeItem('questions');
        
        this.dispatchQuestionEvent('questionsCleared', {});
        console.log('All questions cleared');
    }
}

// Create global instance
window.QuestionManager = new QuestionManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.QuestionManager.init();
    });
} else {
    window.QuestionManager.init();
}

console.log('QuestionManager module loaded successfully');