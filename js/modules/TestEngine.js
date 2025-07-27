/**
 * Test Engine Module
 * Handles test execution, timing, navigation, and scoring
 */

class TestEngine {
    constructor() {
        this.initialized = false;
        this.currentTest = null;
        this.testState = {
            isActive: false,
            isPaused: false,
            currentQuestionIndex: 0,
            answers: new Map(),
            flaggedQuestions: new Set(),
            timeRemaining: 0,
            startTime: null,
            endTime: null
        };
        this.timer = null;
        this.config = {
            autoSave: true,
            autoSaveInterval: 30000, // 30 seconds
            warningTime: 300, // 5 minutes warning
            showTimer: true,
            allowPause: true
        };
    }

    /**
     * Initialize the Test Engine module
     */
    init() {
        if (this.initialized) return;
        
        console.log('Initializing Test Engine module...');
        this.setupTestEventListeners();
        this.restoreTestState();
        this.initialized = true;
        console.log('Test Engine module initialized successfully');
    }

    /**
     * Start a new test
     * @param {Object} testConfig - Test configuration
     * @returns {Object} - Start result
     */
    startTest(testConfig) {
        try {
            // Validate test configuration
            if (!testConfig || !testConfig.questions || testConfig.questions.length === 0) {
                return {
                    success: false,
                    error: 'Invalid test configuration or no questions provided'
                };
            }

            // Stop any existing test
            if (this.testState.isActive) {
                this.endTest();
            }

            // Initialize new test
            this.currentTest = {
                id: testConfig.id || this.generateTestId(),
                title: testConfig.title || 'Mock Test',
                type: testConfig.type || 'General',
                questions: [...testConfig.questions],
                duration: testConfig.duration || 3600, // Default 1 hour
                config: { ...this.config, ...testConfig.config }
            };

            // Reset test state
            this.testState = {
                isActive: true,
                isPaused: false,
                currentQuestionIndex: 0,
                answers: new Map(),
                flaggedQuestions: new Set(),
                timeRemaining: this.currentTest.duration,
                startTime: new Date().toISOString(),
                endTime: null
            };

            // Start timer
            this.startTimer();

            // Auto-save setup
            if (this.currentTest.config.autoSave) {
                this.setupAutoSave();
            }

            // Save test state
            this.saveTestState();

            // Trigger event
            this.dispatchTestEvent('testStarted', {
                test: this.currentTest,
                state: this.testState
            });

            console.log('Test started:', this.currentTest.id);
            return {
                success: true,
                test: this.currentTest,
                state: this.testState
            };
        } catch (error) {
            console.error('Failed to start test:', error);
            return {
                success: false,
                error: 'Failed to start test',
                details: error.message
            };
        }
    }

    /**
     * End the current test
     * @param {boolean} forceEnd - Force end without confirmation
     * @returns {Object} - End result
     */
    endTest(forceEnd = false) {
        try {
            if (!this.testState.isActive) {
                return {
                    success: false,
                    error: 'No active test to end'
                };
            }

            // Stop timer
            this.stopTimer();

            // Calculate results
            const results = this.calculateResults();

            // Update test state
            this.testState.isActive = false;
            this.testState.endTime = new Date().toISOString();

            // Clear auto-save
            this.clearAutoSave();

            // Clear saved test state
            this.clearTestState();

            // Trigger event
            this.dispatchTestEvent('testEnded', {
                test: this.currentTest,
                results: results,
                forced: forceEnd
            });

            console.log('Test ended:', this.currentTest.id);
            
            // Reset current test
            const finalResults = {
                success: true,
                test: this.currentTest,
                results: results
            };
            
            this.currentTest = null;
            
            return finalResults;
        } catch (error) {
            console.error('Failed to end test:', error);
            return {
                success: false,
                error: 'Failed to end test',
                details: error.message
            };
        }
    }

    /**
     * Navigate to a specific question
     * @param {number} questionIndex - Question index to navigate to
     * @returns {Object} - Navigation result
     */
    navigateToQuestion(questionIndex) {
        if (!this.testState.isActive) {
            return {
                success: false,
                error: 'No active test'
            };
        }

        if (questionIndex < 0 || questionIndex >= this.currentTest.questions.length) {
            return {
                success: false,
                error: 'Invalid question index'
            };
        }

        this.testState.currentQuestionIndex = questionIndex;
        this.saveTestState();

        this.dispatchTestEvent('questionChanged', {
            questionIndex,
            question: this.getCurrentQuestion()
        });

        return {
            success: true,
            questionIndex,
            question: this.getCurrentQuestion()
        };
    }

    /**
     * Navigate to next question
     * @returns {Object} - Navigation result
     */
    nextQuestion() {
        const nextIndex = this.testState.currentQuestionIndex + 1;
        if (nextIndex >= this.currentTest.questions.length) {
            return {
                success: false,
                error: 'Already at last question'
            };
        }
        return this.navigateToQuestion(nextIndex);
    }

    /**
     * Navigate to previous question
     * @returns {Object} - Navigation result
     */
    previousQuestion() {
        const prevIndex = this.testState.currentQuestionIndex - 1;
        if (prevIndex < 0) {
            return {
                success: false,
                error: 'Already at first question'
            };
        }
        return this.navigateToQuestion(prevIndex);
    }

    /**
     * Submit answer for current question
     * @param {number} answerIndex - Selected answer index
     * @returns {Object} - Submission result
     */
    submitAnswer(answerIndex) {
        if (!this.testState.isActive) {
            return {
                success: false,
                error: 'No active test'
            };
        }

        const currentQuestion = this.getCurrentQuestion();
        if (!currentQuestion) {
            return {
                success: false,
                error: 'No current question'
            };
        }

        // Validate answer index
        if (answerIndex < 0 || answerIndex >= currentQuestion.options.length) {
            return {
                success: false,
                error: 'Invalid answer index'
            };
        }

        // Store answer
        this.testState.answers.set(this.testState.currentQuestionIndex, {
            answerIndex,
            timestamp: new Date().toISOString(),
            questionId: currentQuestion.id
        });

        // Save test state
        this.saveTestState();

        // Trigger event
        this.dispatchTestEvent('answerSubmitted', {
            questionIndex: this.testState.currentQuestionIndex,
            answerIndex,
            question: currentQuestion
        });

        console.log(`Answer submitted for question ${this.testState.currentQuestionIndex}: ${answerIndex}`);
        return {
            success: true,
            questionIndex: this.testState.currentQuestionIndex,
            answerIndex
        };
    }

    /**
     * Clear answer for current question
     * @returns {Object} - Clear result
     */
    clearAnswer() {
        if (!this.testState.isActive) {
            return {
                success: false,
                error: 'No active test'
            };
        }

        this.testState.answers.delete(this.testState.currentQuestionIndex);
        this.saveTestState();

        this.dispatchTestEvent('answerCleared', {
            questionIndex: this.testState.currentQuestionIndex
        });

        return {
            success: true,
            questionIndex: this.testState.currentQuestionIndex
        };
    }

    /**
     * Flag/unflag current question for review
     * @returns {Object} - Flag result
     */
    toggleFlag() {
        if (!this.testState.isActive) {
            return {
                success: false,
                error: 'No active test'
            };
        }

        const questionIndex = this.testState.currentQuestionIndex;
        const isFlagged = this.testState.flaggedQuestions.has(questionIndex);

        if (isFlagged) {
            this.testState.flaggedQuestions.delete(questionIndex);
        } else {
            this.testState.flaggedQuestions.add(questionIndex);
        }

        this.saveTestState();

        this.dispatchTestEvent('questionFlagged', {
            questionIndex,
            flagged: !isFlagged
        });

        return {
            success: true,
            questionIndex,
            flagged: !isFlagged
        };
    }

    /**
     * Pause the test
     * @returns {Object} - Pause result
     */
    pauseTest() {
        if (!this.testState.isActive || this.testState.isPaused) {
            return {
                success: false,
                error: 'Cannot pause test'
            };
        }

        if (!this.currentTest.config.allowPause) {
            return {
                success: false,
                error: 'Pausing not allowed for this test'
            };
        }

        this.testState.isPaused = true;
        this.stopTimer();
        this.saveTestState();

        this.dispatchTestEvent('testPaused', {
            timeRemaining: this.testState.timeRemaining
        });

        return {
            success: true,
            timeRemaining: this.testState.timeRemaining
        };
    }

    /**
     * Resume the test
     * @returns {Object} - Resume result
     */
    resumeTest() {
        if (!this.testState.isActive || !this.testState.isPaused) {
            return {
                success: false,
                error: 'Cannot resume test'
            };
        }

        this.testState.isPaused = false;
        this.startTimer();
        this.saveTestState();

        this.dispatchTestEvent('testResumed', {
            timeRemaining: this.testState.timeRemaining
        });

        return {
            success: true,
            timeRemaining: this.testState.timeRemaining
        };
    }

    /**
     * Get current question
     * @returns {Object|null} - Current question or null
     */
    getCurrentQuestion() {
        if (!this.currentTest || !this.testState.isActive) {
            return null;
        }

        return this.currentTest.questions[this.testState.currentQuestionIndex] || null;
    }

    /**
     * Get test progress
     * @returns {Object} - Progress information
     */
    getProgress() {
        if (!this.testState.isActive) {
            return null;
        }

        const totalQuestions = this.currentTest.questions.length;
        const answeredQuestions = this.testState.answers.size;
        const flaggedQuestions = this.testState.flaggedQuestions.size;

        return {
            currentQuestion: this.testState.currentQuestionIndex + 1,
            totalQuestions,
            answeredQuestions,
            flaggedQuestions,
            completionPercentage: Math.round((answeredQuestions / totalQuestions) * 100),
            timeRemaining: this.testState.timeRemaining,
            isPaused: this.testState.isPaused
        };
    }

    /**
     * Start the test timer
     */
    startTimer() {
        this.stopTimer(); // Clear any existing timer
        
        this.timer = setInterval(() => {
            if (this.testState.timeRemaining > 0) {
                this.testState.timeRemaining--;
                
                // Save state periodically
                if (this.testState.timeRemaining % 60 === 0) {
                    this.saveTestState();
                }

                // Trigger time update event
                this.dispatchTestEvent('timeUpdate', {
                    timeRemaining: this.testState.timeRemaining
                });

                // Check for warnings
                if (this.testState.timeRemaining === this.currentTest.config.warningTime) {
                    this.dispatchTestEvent('timeWarning', {
                        timeRemaining: this.testState.timeRemaining
                    });
                }
            } else {
                // Time's up
                this.dispatchTestEvent('timeUp', {});
                this.endTest(true);
            }
        }, 1000);
    }

    /**
     * Stop the test timer
     */
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    /**
     * Calculate test results
     * @returns {Object} - Test results
     */
    calculateResults() {
        if (!this.currentTest) {
            return null;
        }

        const results = {
            testId: this.currentTest.id,
            title: this.currentTest.title,
            type: this.currentTest.type,
            startTime: this.testState.startTime,
            endTime: this.testState.endTime || new Date().toISOString(),
            duration: this.currentTest.duration,
            timeSpent: this.currentTest.duration - this.testState.timeRemaining,
            totalQuestions: this.currentTest.questions.length,
            answeredQuestions: this.testState.answers.size,
            flaggedQuestions: this.testState.flaggedQuestions.size,
            correctAnswers: 0,
            incorrectAnswers: 0,
            score: 0,
            percentage: 0,
            subjects: {},
            questionResults: []
        };

        // Calculate correct answers and subject-wise performance
        this.currentTest.questions.forEach((question, index) => {
            const userAnswer = this.testState.answers.get(index);
            const isCorrect = userAnswer && userAnswer.answerIndex === question.correctAnswer;
            const subject = question.subject || 'General';

            // Initialize subject stats
            if (!results.subjects[subject]) {
                results.subjects[subject] = {
                    total: 0,
                    correct: 0,
                    incorrect: 0,
                    unanswered: 0
                };
            }

            results.subjects[subject].total++;

            if (userAnswer) {
                if (isCorrect) {
                    results.correctAnswers++;
                    results.subjects[subject].correct++;
                } else {
                    results.incorrectAnswers++;
                    results.subjects[subject].incorrect++;
                }
            } else {
                results.subjects[subject].unanswered++;
            }

            // Store individual question result
            results.questionResults.push({
                questionIndex: index,
                questionId: question.id,
                subject: subject,
                userAnswer: userAnswer ? userAnswer.answerIndex : null,
                correctAnswer: question.correctAnswer,
                isCorrect,
                isFlagged: this.testState.flaggedQuestions.has(index),
                timeSpent: userAnswer ? userAnswer.timestamp : null
            });
        });

        // Calculate score and percentage
        results.score = (results.correctAnswers / results.totalQuestions) * 100;
        results.percentage = Math.round(results.score * 100) / 100;

        return results;
    }

    /**
     * Generate a unique test ID
     * @returns {string} - Unique test ID
     */
    generateTestId() {
        return 'test_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Save current test state to localStorage
     */
    saveTestState() {
        if (!this.testState.isActive) return;

        try {
            const stateToSave = {
                currentTest: this.currentTest,
                testState: {
                    ...this.testState,
                    answers: Array.from(this.testState.answers.entries()),
                    flaggedQuestions: Array.from(this.testState.flaggedQuestions)
                }
            };
            
            localStorage.setItem('activeTestState', JSON.stringify(stateToSave));
        } catch (error) {
            console.warn('Failed to save test state:', error);
        }
    }

    /**
     * Restore test state from localStorage
     */
    restoreTestState() {
        try {
            const savedState = localStorage.getItem('activeTestState');
            if (savedState) {
                const parsed = JSON.parse(savedState);
                
                this.currentTest = parsed.currentTest;
                this.testState = {
                    ...parsed.testState,
                    answers: new Map(parsed.testState.answers),
                    flaggedQuestions: new Set(parsed.testState.flaggedQuestions)
                };

                // Restart timer if test was active
                if (this.testState.isActive && !this.testState.isPaused) {
                    this.startTimer();
                }

                console.log('Test state restored');
            }
        } catch (error) {
            console.warn('Failed to restore test state:', error);
            this.clearTestState();
        }
    }

    /**
     * Clear saved test state
     */
    clearTestState() {
        localStorage.removeItem('activeTestState');
    }

    /**
     * Setup auto-save functionality
     */
    setupAutoSave() {
        this.clearAutoSave();
        
        this.autoSaveTimer = setInterval(() => {
            this.saveTestState();
        }, this.currentTest.config.autoSaveInterval);
    }

    /**
     * Clear auto-save timer
     */
    clearAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }

    /**
     * Setup event listeners for test functionality
     */
    setupTestEventListeners() {
        // Listen for test start requests
        document.addEventListener('startTest', (event) => {
            const result = this.startTest(event.detail);
            this.dispatchTestEvent('testStartResult', result);
        });

        // Listen for test end requests
        document.addEventListener('endTest', (event) => {
            const result = this.endTest(event.detail?.force);
            this.dispatchTestEvent('testEndResult', result);
        });

        // Listen for navigation requests
        document.addEventListener('navigateToQuestion', (event) => {
            const result = this.navigateToQuestion(event.detail.index);
            this.dispatchTestEvent('navigationResult', result);
        });

        // Listen for answer submissions
        document.addEventListener('submitAnswer', (event) => {
            const result = this.submitAnswer(event.detail.answerIndex);
            this.dispatchTestEvent('answerSubmissionResult', result);
        });
    }

    /**
     * Dispatch test-related events
     * @param {string} eventType - Event type
     * @param {Object} data - Event data
     */
    dispatchTestEvent(eventType, data) {
        document.dispatchEvent(new CustomEvent(eventType, {
            detail: data
        }));
    }

    /**
     * Get current test status
     * @returns {Object} - Test status
     */
    getTestStatus() {
        return {
            hasActiveTest: this.testState.isActive,
            currentTest: this.currentTest,
            progress: this.getProgress(),
            state: this.testState
        };
    }
}

// Create global instance
window.TestEngine = new TestEngine();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.TestEngine.init();
    });
} else {
    window.TestEngine.init();
}

console.log('TestEngine module loaded successfully');