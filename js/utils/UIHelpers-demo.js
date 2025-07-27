/**
 * UIHelpers Demo and Usage Examples
 * 
 * This file demonstrates how to use the UIHelpers utility functions
 * in the RRB Mock Test App context.
 * 
 * @author Ravi-katta-dev
 * @version 1.0.0
 */

// This demo file shows how the MockTestApp can integrate UIHelpers utilities

class UIHelpersDemoIntegration {
    constructor() {
        this.uiHelpers = window.UIHelpers;
        this.setupDemoEventListeners();
    }

    /**
     * Demonstrate toast notifications for different app events
     */
    demonstrateToastIntegration() {
        // Success toast for question save
        this.showQuestionSaveSuccess = () => {
            this.uiHelpers.showToast('Question saved successfully!', 'success', 3000);
        };

        // Error toast for validation failures
        this.showValidationError = (message) => {
            this.uiHelpers.showToast(`Validation Error: ${message}`, 'error', 5000);
        };

        // Warning toast for timer alerts
        this.showTimerWarning = (timeLeft) => {
            this.uiHelpers.showToast(`⏰ ${timeLeft} minutes remaining!`, 'warning', 4000);
        };

        // Info toast for general notifications
        this.showInfoNotification = (message) => {
            this.uiHelpers.showToast(message, 'info', 3000);
        };
    }

    /**
     * Demonstrate form validation for user registration
     */
    demonstrateFormValidation() {
        this.validateUserForm = (formData) => {
            const validationRules = {
                name: {
                    required: true,
                    minLength: 2,
                    maxLength: 50
                },
                email: {
                    required: true,
                    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address'
                },
                phone: {
                    required: true,
                    validator: (value) => {
                        return this.uiHelpers.isValidPhone(value) || 'Please enter a valid 10-digit phone number';
                    }
                }
            };

            return this.uiHelpers.validateForm(formData, validationRules);
        };
    }

    /**
     * Demonstrate debounced search functionality
     */
    demonstrateSearchDebouncing() {
        // Debounced search function for question bank
        this.debouncedSearch = this.uiHelpers.debounce((searchTerm) => {
            console.log('Searching for:', searchTerm);
            this.performQuestionSearch(searchTerm);
        }, 300, 'question-search');

        this.performQuestionSearch = (term) => {
            // Simulate search implementation
            const filteredQuestions = this.mockQuestions.filter(q => 
                q.text.toLowerCase().includes(term.toLowerCase())
            );
            this.displaySearchResults(filteredQuestions);
        };
    }

    /**
     * Demonstrate throttled auto-save functionality
     */
    demonstrateAutoSave() {
        // Throttled auto-save function
        this.throttledAutoSave = this.uiHelpers.throttle(() => {
            console.log('Auto-saving test progress...');
            this.saveTestProgress();
            this.uiHelpers.showToast('Progress auto-saved', 'info', 2000);
        }, 30000, 'auto-save'); // Auto-save every 30 seconds max
    }

    /**
     * Demonstrate array utilities for question management
     */
    demonstrateArrayUtilities() {
        // Shuffle questions for random test
        this.shuffleQuestions = (questions) => {
            return this.uiHelpers.shuffleArray(questions);
        };

        // Group questions by subject
        this.groupQuestionsBySubject = (questions) => {
            return this.uiHelpers.groupBy(questions, 'subject');
        };

        // Get unique subjects from questions
        this.getUniqueSubjects = (questions) => {
            return this.uiHelpers.getUniqueItems(questions, 'subject');
        };

        // Split questions into pages
        this.paginateQuestions = (questions, pageSize = 10) => {
            return this.uiHelpers.chunkArray(questions, pageSize);
        };
    }

    /**
     * Demonstrate ID generation for test sessions
     */
    demonstrateIdGeneration() {
        // Generate session ID
        this.generateSessionId = () => {
            return this.uiHelpers.generateUniqueId('session');
        };

        // Generate test ID
        this.generateTestId = () => {
            return this.uiHelpers.generateUUID();
        };

        // Generate short result ID
        this.generateResultId = () => {
            return this.uiHelpers.generateShortId(8);
        };
    }

    /**
     * Demonstrate utility functions for test results
     */
    demonstrateUtilityFunctions() {
        // Format file size for PDF uploads
        this.formatUploadSize = (bytes) => {
            return this.uiHelpers.formatFileSize(bytes);
        };

        // Sanitize user input for question text
        this.sanitizeQuestionText = (text) => {
            return this.uiHelpers.sanitizeHTML(text);
        };

        // Copy test results to clipboard
        this.copyResultsToClipboard = async (results) => {
            const resultText = this.formatResultsForClipboard(results);
            const success = await this.uiHelpers.copyToClipboard(resultText);
            
            if (success) {
                this.uiHelpers.showToast('Results copied to clipboard!', 'success');
            } else {
                this.uiHelpers.showToast('Failed to copy results', 'error');
            }
        };
    }

    /**
     * Setup demo event listeners
     */
    setupDemoEventListeners() {
        // Example integration with existing app events
        if (typeof document !== 'undefined') {
            // Search input debouncing
            const searchInput = document.getElementById('searchQuestions');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.debouncedSearch(e.target.value);
                });
            }

            // Auto-save on answer selection
            document.addEventListener('change', (e) => {
                if (e.target.name === 'answer') {
                    this.throttledAutoSave();
                }
            });
        }
    }

    // Mock data and methods for demonstration
    mockQuestions = [
        { id: 1, text: 'What is 2+2?', subject: 'Mathematics' },
        { id: 2, text: 'Capital of India?', subject: 'General Awareness' },
        { id: 3, text: 'Logic puzzle question', subject: 'Reasoning' }
    ];

    displaySearchResults(results) {
        console.log('Search results:', results);
    }

    saveTestProgress() {
        console.log('Saving test progress...');
    }

    formatResultsForClipboard(results) {
        return `Test Results:\nScore: ${results.score}/${results.total}\nAccuracy: ${results.accuracy}%`;
    }
}

// Usage example:
// const demo = new UIHelpersDemoIntegration();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIHelpersDemoIntegration;
}