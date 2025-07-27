/**
 * RRB Mock Test App - Test Engine Module
 * 
 * Core test execution engine that handles test creation, management, timing, 
 * scoring, and user interaction for the RRB Mock Test App.
 * 
 * @author Ravi-katta-dev
 * @version 1.0.0
 * @created 2025-01-XX
 */

class TestEngine {
    constructor(appContext) {
        // Reference to main app context
        this.app = appContext;
        
        // Test session state
        this.currentSession = null;
        this.sessionId = null;
        
        // Timer management
        this.timer = null;
        this.timerPaused = false;
        this.startTime = null;
        this.timeRemaining = 0;
        this.warningsSent = new Set();
        
        // Session persistence
        this.autoSaveInterval = 30000; // 30 seconds
        this.autoSaveTimer = null;
        this.lastSaved = null;
        
        // Navigation state
        this.currentQuestionIndex = 0;
        this.markedQuestions = new Set();
        this.flaggedQuestions = new Set();
        this.visitedQuestions = new Set();
        
        // Answer tracking
        this.answers = {};
        this.answerTimes = {};
        this.confidenceLevels = {};
        this.questionStartTimes = {};
        
        // Test configuration
        this.testConfig = null;
        this.questions = [];
        this.testMode = 'mock'; // 'practice', 'mock', 'timed'
        
        // Scoring and evaluation
        this.scoringMode = 'deferred'; // 'immediate', 'deferred'
        this.allowReview = true;
        this.showCorrectAnswers = false;
        
        // Event callbacks
        this.eventCallbacks = {
            onQuestionChange: [],
            onAnswerChange: [],
            onTimeWarning: [],
            onAutoSubmit: [],
            onSessionSave: [],
            onTestComplete: []
        };
        
        // Performance tracking
        this.performanceMetrics = {
            totalTime: 0,
            averageTimePerQuestion: 0,
            questionsAttempted: 0,
            questionsMarked: 0,
            sectionalTimes: {},
            difficultyWisePerformance: {}
        };
        
        // Accessibility support
        this.keyboardNavigationEnabled = true;
        this.screenReaderSupport = true;
        this.highContrastMode = false;
        
        this.initializeEventListeners();
        this.loadPersistedSessions();
    }

    // ========================================================================
    // SESSION MANAGEMENT
    // ========================================================================

    /**
     * Create a new test session
     * @param {Object} config - Test configuration
     * @param {Array} questions - Array of questions
     * @param {Object} options - Additional options
     * @returns {Object} Created session
     */
    createSession(config, questions, options = {}) {
        this.sessionId = this.generateSessionId();
        this.testConfig = { ...config };
        this.questions = [...questions];
        this.testMode = options.mode || 'mock';
        this.scoringMode = options.scoringMode || (this.testMode === 'practice' ? 'immediate' : 'deferred');
        this.allowReview = options.allowReview !== undefined ? options.allowReview : true;
        
        // Initialize session state
        this.currentSession = {
            id: this.sessionId,
            config: this.testConfig,
            questions: this.questions,
            mode: this.testMode,
            scoringMode: this.scoringMode,
            allowReview: this.allowReview,
            startTime: Date.now(),
            lastActivity: Date.now(),
            status: 'created',
            timeLimit: config.timeLimit * 60 * 1000, // Convert minutes to milliseconds
            timeRemaining: config.timeLimit * 60 * 1000,
            currentQuestionIndex: 0,
            answers: {},
            answerTimes: {},
            markedQuestions: new Set(),
            flaggedQuestions: new Set(),
            visitedQuestions: new Set(),
            confidenceLevels: {},
            sessionData: {
                browser: navigator.userAgent,
                screenResolution: `${screen.width}x${screen.height}`,
                startedAt: new Date().toISOString(),
                version: '1.0.0'
            }
        };
        
        // Reset instance variables
        this.resetInstanceState();
        
        // Auto-save session
        this.startAutoSave();
        
        this.announceToScreenReader(`Test session created with ${questions.length} questions. Time limit: ${config.timeLimit} minutes.`);
        
        return this.currentSession;
    }

    /**
     * Start the test session
     * @returns {boolean} Success status
     */
    startSession() {
        if (!this.currentSession) {
            throw new Error('No session created. Call createSession() first.');
        }
        
        if (this.currentSession.status !== 'created' && this.currentSession.status !== 'paused') {
            throw new Error('Session cannot be started. Current status: ' + this.currentSession.status);
        }
        
        this.currentSession.status = 'active';
        this.currentSession.actualStartTime = Date.now();
        this.startTime = Date.now();
        this.timeRemaining = this.currentSession.timeRemaining;
        
        // Start timer
        this.startTimer();
        
        // Mark first question as visited
        this.visitedQuestions.add(0);
        this.currentSession.visitedQuestions.add(0);
        
        // Start tracking question time
        this.startQuestionTimer(0);
        
        // Save session state
        this.saveSession();
        
        this.announceToScreenReader('Test session started. Timer is now running.');
        this.triggerEvent('onSessionStart', this.currentSession);
        
        return true;
    }

    /**
     * Pause the test session
     * @returns {boolean} Success status
     */
    pauseSession() {
        if (!this.currentSession || this.currentSession.status !== 'active') {
            return false;
        }
        
        this.currentSession.status = 'paused';
        this.timerPaused = true;
        
        // Stop timer
        this.stopTimer();
        
        // Update time remaining
        this.updateTimeRemaining();
        
        // Save current state
        this.saveSession();
        
        this.announceToScreenReader('Test session paused.');
        this.triggerEvent('onSessionPause', this.currentSession);
        
        return true;
    }

    /**
     * Resume the test session
     * @returns {boolean} Success status
     */
    resumeSession() {
        if (!this.currentSession || this.currentSession.status !== 'paused') {
            return false;
        }
        
        this.currentSession.status = 'active';
        this.timerPaused = false;
        
        // Restart timer
        this.startTimer();
        
        // Resume question timer
        this.startQuestionTimer(this.currentQuestionIndex);
        
        this.announceToScreenReader('Test session resumed.');
        this.triggerEvent('onSessionResume', this.currentSession);
        
        return true;
    }

    /**
     * Complete the test session
     * @param {boolean} autoSubmit - Whether this is an auto-submit
     * @returns {Object} Test results
     */
    completeSession(autoSubmit = false) {
        if (!this.currentSession) {
            throw new Error('No active session to complete.');
        }
        
        this.currentSession.status = 'completed';
        this.currentSession.completedAt = Date.now();
        this.currentSession.autoSubmitted = autoSubmit;
        
        // Stop all timers
        this.stopTimer();
        this.stopAutoSave();
        
        // Calculate final results
        const results = this.calculateResults();
        
        // Save final session state
        this.saveSession();
        
        // Save results to history
        this.saveResultsToHistory(results);
        
        // Clear auto-save data
        this.clearAutoSaveData();
        
        this.announceToScreenReader(`Test completed. Final score: ${results.percentage}%.`);
        this.triggerEvent('onTestComplete', { session: this.currentSession, results });
        
        return results;
    }

    /**
     * Load an existing session from storage
     * @param {string} sessionId - Session ID to load
     * @returns {boolean} Success status
     */
    loadSession(sessionId) {
        const sessionKey = `testSession_${sessionId}`;
        const sessionData = localStorage.getItem(sessionKey);
        
        if (!sessionData) {
            return false;
        }
        
        try {
            const session = JSON.parse(sessionData);
            
            // Restore session state
            this.currentSession = session;
            this.sessionId = session.id;
            this.testConfig = session.config;
            this.questions = session.questions;
            this.testMode = session.mode;
            this.scoringMode = session.scoringMode;
            this.allowReview = session.allowReview;
            this.timeRemaining = session.timeRemaining;
            this.currentQuestionIndex = session.currentQuestionIndex;
            
            // Restore collections (convert arrays back to Sets)
            this.markedQuestions = new Set(session.markedQuestions || []);
            this.flaggedQuestions = new Set(session.flaggedQuestions || []);
            this.visitedQuestions = new Set(session.visitedQuestions || []);
            
            // Restore objects
            this.answers = session.answers || {};
            this.answerTimes = session.answerTimes || {};
            this.confidenceLevels = session.confidenceLevels || {};
            
            // Update session collections
            this.currentSession.markedQuestions = this.markedQuestions;
            this.currentSession.flaggedQuestions = this.flaggedQuestions;
            this.currentSession.visitedQuestions = this.visitedQuestions;
            
            this.announceToScreenReader('Previous test session loaded successfully.');
            this.triggerEvent('onSessionLoad', this.currentSession);
            
            return true;
        } catch (error) {
            console.error('Error loading session:', error);
            return false;
        }
    }

    /**
     * Get all available sessions for the current user
     * @returns {Array} Array of session summaries
     */
    getAvailableSessions() {
        const sessions = [];
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (key.startsWith('testSession_')) {
                try {
                    const sessionData = JSON.parse(localStorage.getItem(key));
                    sessions.push({
                        id: sessionData.id,
                        startTime: sessionData.startTime,
                        lastActivity: sessionData.lastActivity,
                        status: sessionData.status,
                        questionsCount: sessionData.questions.length,
                        timeRemaining: sessionData.timeRemaining,
                        mode: sessionData.mode,
                        progress: this.calculateProgress(sessionData)
                    });
                } catch (error) {
                    console.warn('Invalid session data for key:', key);
                }
            }
        });
        
        // Sort by last activity (most recent first)
        return sessions.sort((a, b) => b.lastActivity - a.lastActivity);
    }

    // ========================================================================
    // TIMER FUNCTIONALITY
    // ========================================================================

    /**
     * Start the test timer
     */
    startTimer() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.timer = setInterval(() => {
            if (!this.timerPaused && this.currentSession && this.currentSession.status === 'active') {
                this.timeRemaining -= 1000; // Decrease by 1 second
                this.updateTimeDisplay();
                this.checkTimeWarnings();
                
                // Auto-submit when time expires
                if (this.timeRemaining <= 0) {
                    this.handleTimeExpired();
                }
                
                // Update session
                this.currentSession.timeRemaining = this.timeRemaining;
                this.currentSession.lastActivity = Date.now();
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
     * Update time remaining calculation
     */
    updateTimeRemaining() {
        if (!this.currentSession || this.timerPaused) return;
        
        const elapsed = Date.now() - this.startTime;
        this.timeRemaining = Math.max(0, this.currentSession.timeLimit - elapsed);
        this.currentSession.timeRemaining = this.timeRemaining;
    }

    /**
     * Update timer display in UI
     */
    updateTimeDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60000);
        const seconds = Math.floor((this.timeRemaining % 60000) / 1000);
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update UI elements
        const timerElement = document.getElementById('timeRemaining');
        const timerContainer = document.getElementById('timerContainer');
        
        if (timerElement) {
            timerElement.textContent = timeString;
        }
        
        if (timerContainer) {
            // Add visual warnings
            timerContainer.classList.remove('warning', 'critical');
            
            if (this.timeRemaining <= 60000) { // Last minute
                timerContainer.classList.add('critical');
            } else if (this.timeRemaining <= 300000) { // Last 5 minutes
                timerContainer.classList.add('warning');
            }
        }
        
        // Update document title to show remaining time
        document.title = `${timeString} - RRB Mock Test`;
    }

    /**
     * Check for time warnings and send notifications
     */
    checkTimeWarnings() {
        const warningTimes = [900000, 300000, 60000, 30000, 10000]; // 15 min, 5 min, 1 min, 30 sec, 10 sec
        
        warningTimes.forEach(warningTime => {
            if (this.timeRemaining <= warningTime && !this.warningsSent.has(warningTime)) {
                this.warningsSent.add(warningTime);
                this.sendTimeWarning(warningTime);
            }
        });
    }

    /**
     * Send time warning notification
     * @param {number} timeRemaining - Time remaining in milliseconds
     */
    sendTimeWarning(timeRemaining) {
        const minutes = Math.floor(timeRemaining / 60000);
        const seconds = Math.floor((timeRemaining % 60000) / 1000);
        
        let message = '';
        if (minutes > 0) {
            message = `⏰ ${minutes} minute${minutes > 1 ? 's' : ''} remaining!`;
        } else {
            message = `🚨 ${seconds} second${seconds > 1 ? 's' : ''} remaining!`;
        }
        
        this.showNotification(message, 'warning');
        this.announceToScreenReader(message);
        this.triggerEvent('onTimeWarning', { timeRemaining, message });
    }

    /**
     * Handle time expiry and auto-submit
     */
    handleTimeExpired() {
        this.stopTimer();
        this.showNotification('⏰ Time expired! Test will be submitted automatically.', 'error');
        this.announceToScreenReader('Time expired. Test is being submitted automatically.');
        
        // Auto-submit after a brief delay
        setTimeout(() => {
            this.completeSession(true);
            this.triggerEvent('onAutoSubmit', this.currentSession);
        }, 2000);
    }

    // ========================================================================
    // QUESTION NAVIGATION
    // ========================================================================

    /**
     * Navigate to a specific question
     * @param {number} questionIndex - Index of the question to navigate to
     * @returns {boolean} Success status
     */
    navigateToQuestion(questionIndex) {
        if (!this.currentSession || questionIndex < 0 || questionIndex >= this.questions.length) {
            return false;
        }
        
        // Save current question time
        this.saveQuestionTime(this.currentQuestionIndex);
        
        // Update current question index
        const previousIndex = this.currentQuestionIndex;
        this.currentQuestionIndex = questionIndex;
        this.currentSession.currentQuestionIndex = questionIndex;
        
        // Mark question as visited
        this.visitedQuestions.add(questionIndex);
        this.currentSession.visitedQuestions.add(questionIndex);
        
        // Start timing for new question
        this.startQuestionTimer(questionIndex);
        
        // Update session
        this.saveSession();
        
        this.announceToScreenReader(`Navigated to question ${questionIndex + 1} of ${this.questions.length}.`);
        this.triggerEvent('onQuestionChange', { 
            previousIndex, 
            currentIndex: questionIndex,
            question: this.questions[questionIndex]
        });
        
        return true;
    }

    /**
     * Navigate to next question
     * @returns {boolean} Success status
     */
    nextQuestion() {
        return this.navigateToQuestion(this.currentQuestionIndex + 1);
    }

    /**
     * Navigate to previous question
     * @returns {boolean} Success status
     */
    previousQuestion() {
        return this.navigateToQuestion(this.currentQuestionIndex - 1);
    }

    /**
     * Navigate to first unanswered question
     * @returns {boolean} Success status
     */
    navigateToFirstUnanswered() {
        for (let i = 0; i < this.questions.length; i++) {
            if (!this.answers.hasOwnProperty(i)) {
                return this.navigateToQuestion(i);
            }
        }
        return false; // All questions answered
    }

    /**
     * Navigate to first marked question
     * @returns {boolean} Success status
     */
    navigateToFirstMarked() {
        for (let i = 0; i < this.questions.length; i++) {
            if (this.markedQuestions.has(i)) {
                return this.navigateToQuestion(i);
            }
        }
        return false; // No marked questions
    }

    /**
     * Get navigation status for question palette
     * @returns {Array} Array of question statuses
     */
    getNavigationStatus() {
        return this.questions.map((question, index) => {
            return {
                index,
                id: question.id,
                isAnswered: this.answers.hasOwnProperty(index),
                isMarked: this.markedQuestions.has(index),
                isFlagged: this.flaggedQuestions.has(index),
                isVisited: this.visitedQuestions.has(index),
                isCurrent: index === this.currentQuestionIndex,
                timeSpent: this.answerTimes[index] || 0
            };
        });
    }

    // ========================================================================
    // ANSWER MANAGEMENT
    // ========================================================================

    /**
     * Save answer for current question
     * @param {number} optionIndex - Selected option index
     * @param {string} confidence - Confidence level (optional)
     * @returns {boolean} Success status
     */
    saveAnswer(optionIndex, confidence = null) {
        if (!this.currentSession || optionIndex < 0 || optionIndex > 3) {
            return false;
        }
        
        const questionIndex = this.currentQuestionIndex;
        const previousAnswer = this.answers[questionIndex];
        
        // Save answer
        this.answers[questionIndex] = optionIndex;
        this.currentSession.answers = this.answers;
        
        // Save confidence level if provided
        if (confidence) {
            this.confidenceLevels[questionIndex] = confidence;
            this.currentSession.confidenceLevels = this.confidenceLevels;
        }
        
        // Save time spent on question
        this.saveQuestionTime(questionIndex);
        
        // Update session
        this.currentSession.lastActivity = Date.now();
        this.saveSession();
        
        // Immediate feedback for practice mode
        if (this.scoringMode === 'immediate') {
            this.showImmediateFeedback(questionIndex, optionIndex);
        }
        
        this.announceToScreenReader(`Answer ${String.fromCharCode(65 + optionIndex)} selected for question ${questionIndex + 1}.`);
        this.triggerEvent('onAnswerChange', {
            questionIndex,
            optionIndex,
            previousAnswer,
            confidence,
            isCorrect: this.scoringMode === 'immediate' ? optionIndex === this.questions[questionIndex].correctAnswer : null
        });
        
        return true;
    }

    /**
     * Clear answer for current question
     * @returns {boolean} Success status
     */
    clearAnswer() {
        const questionIndex = this.currentQuestionIndex;
        
        if (this.answers.hasOwnProperty(questionIndex)) {
            delete this.answers[questionIndex];
            delete this.confidenceLevels[questionIndex];
            
            this.currentSession.answers = this.answers;
            this.currentSession.confidenceLevels = this.confidenceLevels;
            
            this.saveSession();
            
            this.announceToScreenReader(`Answer cleared for question ${questionIndex + 1}.`);
            this.triggerEvent('onAnswerChange', {
                questionIndex,
                optionIndex: null,
                previousAnswer: null,
                confidence: null,
                cleared: true
            });
            
            return true;
        }
        
        return false;
    }

    /**
     * Mark current question for review
     * @returns {boolean} Success status
     */
    markForReview() {
        const questionIndex = this.currentQuestionIndex;
        
        if (this.markedQuestions.has(questionIndex)) {
            this.markedQuestions.delete(questionIndex);
            this.currentSession.markedQuestions.delete(questionIndex);
            this.announceToScreenReader(`Question ${questionIndex + 1} unmarked for review.`);
        } else {
            this.markedQuestions.add(questionIndex);
            this.currentSession.markedQuestions.add(questionIndex);
            this.announceToScreenReader(`Question ${questionIndex + 1} marked for review.`);
        }
        
        this.saveSession();
        return true;
    }

    /**
     * Flag current question as difficult
     * @returns {boolean} Success status
     */
    flagQuestion() {
        const questionIndex = this.currentQuestionIndex;
        
        if (this.flaggedQuestions.has(questionIndex)) {
            this.flaggedQuestions.delete(questionIndex);
            this.currentSession.flaggedQuestions.delete(questionIndex);
            this.announceToScreenReader(`Question ${questionIndex + 1} unflagged.`);
        } else {
            this.flaggedQuestions.add(questionIndex);
            this.currentSession.flaggedQuestions.add(questionIndex);
            this.announceToScreenReader(`Question ${questionIndex + 1} flagged as difficult.`);
        }
        
        this.saveSession();
        return true;
    }

    /**
     * Get current question data
     * @returns {Object} Current question with metadata
     */
    getCurrentQuestion() {
        if (!this.currentSession || this.currentQuestionIndex >= this.questions.length) {
            return null;
        }
        
        const question = this.questions[this.currentQuestionIndex];
        const questionIndex = this.currentQuestionIndex;
        
        return {
            ...question,
            index: questionIndex,
            number: questionIndex + 1,
            totalQuestions: this.questions.length,
            isAnswered: this.answers.hasOwnProperty(questionIndex),
            selectedAnswer: this.answers[questionIndex],
            isMarked: this.markedQuestions.has(questionIndex),
            isFlagged: this.flaggedQuestions.has(questionIndex),
            confidence: this.confidenceLevels[questionIndex],
            timeSpent: this.answerTimes[questionIndex] || 0,
            canShowAnswer: this.scoringMode === 'immediate',
            correctAnswer: this.scoringMode === 'immediate' ? question.correctAnswer : null,
            explanation: this.scoringMode === 'immediate' ? question.explanation : null
        };
    }

    // ========================================================================
    // SCORING AND EVALUATION
    // ========================================================================

    /**
     * Calculate comprehensive test results
     * @returns {Object} Complete test results
     */
    calculateResults() {
        const results = {
            sessionId: this.sessionId,
            userId: this.app.currentUser?.id || 'anonymous',
            testType: this.testMode,
            startTime: this.currentSession.startTime,
            endTime: Date.now(),
            totalTime: Date.now() - this.currentSession.startTime,
            timeLimit: this.currentSession.timeLimit,
            autoSubmitted: this.currentSession.autoSubmitted || false,
            
            // Question statistics
            totalQuestions: this.questions.length,
            questionsAttempted: Object.keys(this.answers).length,
            questionsUnanswered: this.questions.length - Object.keys(this.answers).length,
            questionsMarked: this.markedQuestions.size,
            questionsFlagged: this.flaggedQuestions.size,
            
            // Score calculation
            correctAnswers: 0,
            incorrectAnswers: 0,
            unattempted: 0,
            rawScore: 0,
            percentage: 0,
            grade: '',
            
            // Detailed analysis
            answers: { ...this.answers },
            answerTimes: { ...this.answerTimes },
            confidenceLevels: { ...this.confidenceLevels },
            markedQuestions: Array.from(this.markedQuestions),
            flaggedQuestions: Array.from(this.flaggedQuestions),
            visitedQuestions: Array.from(this.visitedQuestions),
            
            // Performance metrics
            sectionalAnalysis: {},
            difficultyAnalysis: {},
            accuracyBySubject: {},
            timeAnalysis: {},
            
            // Questions for review
            questions: this.questions.map(q => ({ ...q }))
        };
        
        // Calculate scores
        this.questions.forEach((question, index) => {
            const userAnswer = this.answers[index];
            const correctAnswer = question.correctAnswer;
            
            if (userAnswer === undefined) {
                results.unattempted++;
            } else if (userAnswer === correctAnswer) {
                results.correctAnswers++;
                results.rawScore += this.testConfig.markingScheme?.positive || 1;
            } else {
                results.incorrectAnswers++;
                results.rawScore += this.testConfig.markingScheme?.negative || -0.33;
            }
        });
        
        // Calculate percentage
        const maxPossibleScore = this.questions.length * (this.testConfig.markingScheme?.positive || 1);
        results.percentage = Math.max(0, (results.rawScore / maxPossibleScore) * 100);
        results.grade = this.calculateGrade(results.percentage);
        
        // Calculate sectional analysis
        results.sectionalAnalysis = this.calculateSectionalAnalysis();
        
        // Calculate difficulty analysis
        results.difficultyAnalysis = this.calculateDifficultyAnalysis();
        
        // Calculate time analysis
        results.timeAnalysis = this.calculateTimeAnalysis();
        
        // Calculate accuracy by subject
        results.accuracyBySubject = this.calculateAccuracyBySubject();
        
        return results;
    }

    /**
     * Calculate sectional analysis
     * @returns {Object} Sectional performance data
     */
    calculateSectionalAnalysis() {
        const sectionalData = {};
        
        this.questions.forEach((question, index) => {
            const subject = question.subject || 'General';
            
            if (!sectionalData[subject]) {
                sectionalData[subject] = {
                    totalQuestions: 0,
                    attempted: 0,
                    correct: 0,
                    incorrect: 0,
                    unanswered: 0,
                    totalTime: 0,
                    accuracy: 0,
                    averageTime: 0
                };
            }
            
            sectionalData[subject].totalQuestions++;
            sectionalData[subject].totalTime += this.answerTimes[index] || 0;
            
            const userAnswer = this.answers[index];
            if (userAnswer === undefined) {
                sectionalData[subject].unanswered++;
            } else {
                sectionalData[subject].attempted++;
                if (userAnswer === question.correctAnswer) {
                    sectionalData[subject].correct++;
                } else {
                    sectionalData[subject].incorrect++;
                }
            }
        });
        
        // Calculate derived metrics
        Object.keys(sectionalData).forEach(subject => {
            const data = sectionalData[subject];
            data.accuracy = data.attempted > 0 ? (data.correct / data.attempted) * 100 : 0;
            data.averageTime = data.totalQuestions > 0 ? data.totalTime / data.totalQuestions : 0;
        });
        
        return sectionalData;
    }

    /**
     * Calculate difficulty-wise analysis
     * @returns {Object} Difficulty performance data
     */
    calculateDifficultyAnalysis() {
        const difficultyData = {
            Easy: { total: 0, correct: 0, incorrect: 0, unanswered: 0 },
            Medium: { total: 0, correct: 0, incorrect: 0, unanswered: 0 },
            Hard: { total: 0, correct: 0, incorrect: 0, unanswered: 0 }
        };
        
        this.questions.forEach((question, index) => {
            const difficulty = question.difficulty || 'Medium';
            const userAnswer = this.answers[index];
            
            difficultyData[difficulty].total++;
            
            if (userAnswer === undefined) {
                difficultyData[difficulty].unanswered++;
            } else if (userAnswer === question.correctAnswer) {
                difficultyData[difficulty].correct++;
            } else {
                difficultyData[difficulty].incorrect++;
            }
        });
        
        // Calculate accuracy for each difficulty
        Object.keys(difficultyData).forEach(difficulty => {
            const data = difficultyData[difficulty];
            const attempted = data.correct + data.incorrect;
            data.accuracy = attempted > 0 ? (data.correct / attempted) * 100 : 0;
        });
        
        return difficultyData;
    }

    /**
     * Calculate time analysis
     * @returns {Object} Time analysis data
     */
    calculateTimeAnalysis() {
        const totalTime = Object.values(this.answerTimes).reduce((sum, time) => sum + time, 0);
        const attemptedQuestions = Object.keys(this.answers).length;
        
        return {
            totalTimeSpent: totalTime,
            averageTimePerQuestion: attemptedQuestions > 0 ? totalTime / attemptedQuestions : 0,
            fastestQuestion: Math.min(...Object.values(this.answerTimes).filter(t => t > 0)) || 0,
            slowestQuestion: Math.max(...Object.values(this.answerTimes)) || 0,
            timeEfficiency: this.calculateTimeEfficiency(),
            questionsUnderTime: this.countQuestionsUnderTime(30000), // Under 30 seconds
            questionsOverTime: this.countQuestionsOverTime(120000) // Over 2 minutes
        };
    }

    /**
     * Calculate accuracy by subject
     * @returns {Object} Subject-wise accuracy data
     */
    calculateAccuracyBySubject() {
        const subjectAccuracy = {};
        
        this.questions.forEach((question, index) => {
            const subject = question.subject || 'General';
            const userAnswer = this.answers[index];
            
            if (!subjectAccuracy[subject]) {
                subjectAccuracy[subject] = { attempted: 0, correct: 0 };
            }
            
            if (userAnswer !== undefined) {
                subjectAccuracy[subject].attempted++;
                if (userAnswer === question.correctAnswer) {
                    subjectAccuracy[subject].correct++;
                }
            }
        });
        
        // Calculate accuracy percentages
        Object.keys(subjectAccuracy).forEach(subject => {
            const data = subjectAccuracy[subject];
            data.accuracy = data.attempted > 0 ? (data.correct / data.attempted) * 100 : 0;
        });
        
        return subjectAccuracy;
    }

    /**
     * Calculate grade based on percentage
     * @param {number} percentage - Score percentage
     * @returns {string} Grade
     */
    calculateGrade(percentage) {
        if (percentage >= 90) return 'A+';
        if (percentage >= 85) return 'A';
        if (percentage >= 80) return 'A-';
        if (percentage >= 75) return 'B+';
        if (percentage >= 70) return 'B';
        if (percentage >= 65) return 'B-';
        if (percentage >= 60) return 'C+';
        if (percentage >= 55) return 'C';
        if (percentage >= 50) return 'C-';
        if (percentage >= 40) return 'D';
        return 'F';
    }

    /**
     * Show immediate feedback for practice mode
     * @param {number} questionIndex - Question index
     * @param {number} selectedAnswer - Selected answer
     */
    showImmediateFeedback(questionIndex, selectedAnswer) {
        if (this.scoringMode !== 'immediate') return;
        
        const question = this.questions[questionIndex];
        const isCorrect = selectedAnswer === question.correctAnswer;
        
        const feedbackMessage = isCorrect ? 
            '✅ Correct! ' + (question.explanation || '') :
            '❌ Incorrect. Correct answer: ' + String.fromCharCode(65 + question.correctAnswer) + 
            '. ' + (question.explanation || '');
        
        this.showNotification(feedbackMessage, isCorrect ? 'success' : 'error');
    }

    // ========================================================================
    // PERSISTENCE AND AUTO-SAVE
    // ========================================================================

    /**
     * Start auto-save functionality
     */
    startAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setInterval(() => {
            if (this.currentSession && this.currentSession.status === 'active') {
                this.saveSession();
                this.triggerEvent('onSessionSave', {
                    sessionId: this.sessionId,
                    timestamp: Date.now()
                });
            }
        }, this.autoSaveInterval);
    }

    /**
     * Stop auto-save functionality
     */
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }

    /**
     * Save current session to localStorage
     */
    saveSession() {
        if (!this.currentSession) return;
        
        // Update session with current state
        this.currentSession.answers = { ...this.answers };
        this.currentSession.answerTimes = { ...this.answerTimes };
        this.currentSession.confidenceLevels = { ...this.confidenceLevels };
        this.currentSession.markedQuestions = new Set(this.markedQuestions);
        this.currentSession.flaggedQuestions = new Set(this.flaggedQuestions);
        this.currentSession.visitedQuestions = new Set(this.visitedQuestions);
        this.currentSession.currentQuestionIndex = this.currentQuestionIndex;
        this.currentSession.timeRemaining = this.timeRemaining;
        this.currentSession.lastActivity = Date.now();
        
        // Convert Sets to Arrays for storage
        const sessionData = {
            ...this.currentSession,
            markedQuestions: Array.from(this.currentSession.markedQuestions),
            flaggedQuestions: Array.from(this.currentSession.flaggedQuestions),
            visitedQuestions: Array.from(this.currentSession.visitedQuestions)
        };
        
        try {
            const sessionKey = `testSession_${this.sessionId}`;
            localStorage.setItem(sessionKey, JSON.stringify(sessionData));
            this.lastSaved = Date.now();
        } catch (error) {
            console.error('Failed to save session:', error);
            this.showNotification('Failed to save progress. Please ensure sufficient storage space.', 'error');
        }
    }

    /**
     * Save test results to history
     * @param {Object} results - Test results
     */
    saveResultsToHistory(results) {
        try {
            const historyKey = 'testResultsHistory';
            const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
            
            existingHistory.push({
                id: this.generateResultId(),
                sessionId: results.sessionId,
                userId: results.userId,
                timestamp: Date.now(),
                summary: {
                    testType: results.testType,
                    totalQuestions: results.totalQuestions,
                    percentage: results.percentage,
                    grade: results.grade,
                    totalTime: results.totalTime,
                    questionsAttempted: results.questionsAttempted
                },
                fullResults: results
            });
            
            // Keep only last 100 results
            if (existingHistory.length > 100) {
                existingHistory.splice(0, existingHistory.length - 100);
            }
            
            localStorage.setItem(historyKey, JSON.stringify(existingHistory));
        } catch (error) {
            console.error('Failed to save results to history:', error);
        }
    }

    /**
     * Clear auto-save data for completed session
     */
    clearAutoSaveData() {
        if (this.sessionId) {
            const sessionKey = `testSession_${this.sessionId}`;
            localStorage.removeItem(sessionKey);
        }
    }

    /**
     * Load persisted sessions on initialization
     */
    loadPersistedSessions() {
        // Check for incomplete sessions
        const sessions = this.getAvailableSessions();
        const incompleteSessions = sessions.filter(s => s.status === 'active' || s.status === 'paused');
        
        if (incompleteSessions.length > 0) {
            console.log(`Found ${incompleteSessions.length} incomplete session(s)`);
            // Can trigger UI to ask user if they want to resume
        }
    }

    // ========================================================================
    // UTILITY METHODS
    // ========================================================================

    /**
     * Generate unique session ID
     * @returns {string} Session ID
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generate unique result ID
     * @returns {string} Result ID
     */
    generateResultId() {
        return 'result_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Reset instance state
     */
    resetInstanceState() {
        this.currentQuestionIndex = 0;
        this.markedQuestions = new Set();
        this.flaggedQuestions = new Set();
        this.visitedQuestions = new Set();
        this.answers = {};
        this.answerTimes = {};
        this.confidenceLevels = {};
        this.questionStartTimes = {};
        this.timeRemaining = 0;
        this.timerPaused = false;
        this.warningsSent = new Set();
    }

    /**
     * Calculate session progress
     * @param {Object} sessionData - Session data
     * @returns {number} Progress percentage
     */
    calculateProgress(sessionData) {
        const answeredCount = Object.keys(sessionData.answers || {}).length;
        const totalQuestions = sessionData.questions.length;
        return Math.round((answeredCount / totalQuestions) * 100);
    }

    /**
     * Start question timer
     * @param {number} questionIndex - Question index
     */
    startQuestionTimer(questionIndex) {
        this.questionStartTimes[questionIndex] = Date.now();
    }

    /**
     * Save question time
     * @param {number} questionIndex - Question index
     */
    saveQuestionTime(questionIndex) {
        if (this.questionStartTimes[questionIndex]) {
            const timeSpent = Date.now() - this.questionStartTimes[questionIndex];
            this.answerTimes[questionIndex] = (this.answerTimes[questionIndex] || 0) + timeSpent;
            this.currentSession.answerTimes = this.answerTimes;
        }
    }

    /**
     * Calculate time efficiency
     * @returns {number} Efficiency percentage
     */
    calculateTimeEfficiency() {
        const totalTimeSpent = Object.values(this.answerTimes).reduce((sum, time) => sum + time, 0);
        const optimalTime = this.questions.length * 54000; // 54 seconds per question
        return Math.min(100, (optimalTime / totalTimeSpent) * 100);
    }

    /**
     * Count questions answered under specified time
     * @param {number} timeThreshold - Time threshold in milliseconds
     * @returns {number} Count of questions
     */
    countQuestionsUnderTime(timeThreshold) {
        return Object.values(this.answerTimes).filter(time => time < timeThreshold).length;
    }

    /**
     * Count questions answered over specified time
     * @param {number} timeThreshold - Time threshold in milliseconds
     * @returns {number} Count of questions
     */
    countQuestionsOverTime(timeThreshold) {
        return Object.values(this.answerTimes).filter(time => time > timeThreshold).length;
    }

    /**
     * Show notification to user
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, warning, info)
     */
    showNotification(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notificationContainer = document.getElementById('notificationContainer');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notificationContainer';
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        notificationContainer.appendChild(notification);
        
        // Auto-remove after delay
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    /**
     * Announce message to screen reader
     * @param {string} message - Message to announce
     */
    announceToScreenReader(message) {
        if (!this.screenReaderSupport) return;
        
        let announcer = document.getElementById('screenReaderAnnouncer');
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'screenReaderAnnouncer';
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'sr-only';
            document.body.appendChild(announcer);
        }
        
        announcer.textContent = message;
        
        // Clear after delay to allow re-announcements
        setTimeout(() => {
            announcer.textContent = '';
        }, 1000);
    }

    // ========================================================================
    // EVENT MANAGEMENT
    // ========================================================================

    /**
     * Add event listener
     * @param {string} eventType - Event type
     * @param {Function} callback - Callback function
     */
    addEventListener(eventType, callback) {
        if (this.eventCallbacks[eventType]) {
            this.eventCallbacks[eventType].push(callback);
        }
    }

    /**
     * Remove event listener
     * @param {string} eventType - Event type
     * @param {Function} callback - Callback function
     */
    removeEventListener(eventType, callback) {
        if (this.eventCallbacks[eventType]) {
            const index = this.eventCallbacks[eventType].indexOf(callback);
            if (index > -1) {
                this.eventCallbacks[eventType].splice(index, 1);
            }
        }
    }

    /**
     * Trigger event
     * @param {string} eventType - Event type
     * @param {*} data - Event data
     */
    triggerEvent(eventType, data) {
        if (this.eventCallbacks[eventType]) {
            this.eventCallbacks[eventType].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event callback for ${eventType}:`, error);
                }
            });
        }
    }

    /**
     * Initialize keyboard event listeners
     */
    initializeEventListeners() {
        if (!this.keyboardNavigationEnabled) return;
        
        document.addEventListener('keydown', (event) => {
            // Only handle events if test session is active and not in input fields
            if (!this.currentSession || 
                this.currentSession.status !== 'active' || 
                event.target.matches('input, textarea, select')) {
                return;
            }
            
            switch (event.key) {
                case 'ArrowLeft':
                    event.preventDefault();
                    this.previousQuestion();
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    this.nextQuestion();
                    break;
                case 'm':
                case 'M':
                    event.preventDefault();
                    this.markForReview();
                    break;
                case 'f':
                case 'F':
                    event.preventDefault();
                    this.flagQuestion();
                    break;
                case 'c':
                case 'C':
                    event.preventDefault();
                    this.clearAnswer();
                    break;
                case ' ':
                    event.preventDefault();
                    this.pauseSession();
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                    event.preventDefault();
                    this.saveAnswer(parseInt(event.key) - 1);
                    break;
            }
        });
    }

    // ========================================================================
    // REVIEW MODE AND ANALYTICS
    // ========================================================================

    /**
     * Get test review data
     * @returns {Object} Complete review data
     */
    getReviewData() {
        if (!this.currentSession || this.currentSession.status !== 'completed') {
            return null;
        }
        
        const results = this.calculateResults();
        const reviewQuestions = this.questions.map((question, index) => {
            const userAnswer = this.answers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            const isUnanswered = userAnswer === undefined;
            
            return {
                ...question,
                index,
                number: index + 1,
                userAnswer,
                isCorrect,
                isUnanswered,
                isMarked: this.markedQuestions.has(index),
                isFlagged: this.flaggedQuestions.has(index),
                timeSpent: this.answerTimes[index] || 0,
                confidence: this.confidenceLevels[index]
            };
        });
        
        return {
            results,
            questions: reviewQuestions,
            summary: {
                totalQuestions: this.questions.length,
                attempted: Object.keys(this.answers).length,
                correct: results.correctAnswers,
                incorrect: results.incorrectAnswers,
                unanswered: results.unattempted,
                marked: this.markedQuestions.size,
                flagged: this.flaggedQuestions.size,
                percentage: results.percentage,
                grade: results.grade,
                totalTime: results.totalTime
            },
            analytics: {
                sectionalAnalysis: results.sectionalAnalysis,
                difficultyAnalysis: results.difficultyAnalysis,
                timeAnalysis: results.timeAnalysis,
                accuracyBySubject: results.accuracyBySubject
            }
        };
    }

    /**
     * Filter review questions by criteria
     * @param {string} filter - Filter criteria
     * @returns {Array} Filtered questions
     */
    filterReviewQuestions(filter) {
        const reviewData = this.getReviewData();
        if (!reviewData) return [];
        
        const { questions } = reviewData;
        
        switch (filter) {
            case 'correct':
                return questions.filter(q => q.isCorrect);
            case 'incorrect':
                return questions.filter(q => !q.isCorrect && !q.isUnanswered);
            case 'unanswered':
                return questions.filter(q => q.isUnanswered);
            case 'marked':
                return questions.filter(q => q.isMarked);
            case 'flagged':
                return questions.filter(q => q.isFlagged);
            default:
                return questions;
        }
    }

    /**
     * Get performance trends
     * @returns {Object} Performance trend data
     */
    getPerformanceTrends() {
        try {
            const historyKey = 'testResultsHistory';
            const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
            const userHistory = history.filter(h => h.userId === (this.app.currentUser?.id || 'anonymous'));
            
            if (userHistory.length === 0) return null;
            
            // Sort by timestamp
            userHistory.sort((a, b) => a.timestamp - b.timestamp);
            
            const trends = {
                scoreProgression: userHistory.map(h => ({
                    date: new Date(h.timestamp),
                    score: h.summary.percentage,
                    testType: h.summary.testType
                })),
                averageImprovement: this.calculateAverageImprovement(userHistory),
                consistencyScore: this.calculateConsistencyScore(userHistory),
                subjectTrends: this.calculateSubjectTrends(userHistory),
                strengthsAndWeaknesses: this.identifyStrengthsAndWeaknesses(userHistory)
            };
            
            return trends;
        } catch (error) {
            console.error('Error calculating performance trends:', error);
            return null;
        }
    }

    /**
     * Calculate average improvement over time
     * @param {Array} history - Test history
     * @returns {number} Improvement percentage
     */
    calculateAverageImprovement(history) {
        if (history.length < 2) return 0;
        
        const firstScore = history[0].summary.percentage;
        const lastScore = history[history.length - 1].summary.percentage;
        
        return lastScore - firstScore;
    }

    /**
     * Calculate consistency score
     * @param {Array} history - Test history
     * @returns {number} Consistency score (0-100)
     */
    calculateConsistencyScore(history) {
        if (history.length < 3) return 100;
        
        const scores = history.map(h => h.summary.percentage);
        const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
        const standardDeviation = Math.sqrt(variance);
        
        // Convert to consistency score (lower deviation = higher consistency)
        return Math.max(0, 100 - standardDeviation * 2);
    }

    /**
     * Calculate subject-wise trends
     * @param {Array} history - Test history
     * @returns {Object} Subject trends
     */
    calculateSubjectTrends(history) {
        const subjectTrends = {};
        
        history.forEach(test => {
            if (test.fullResults && test.fullResults.sectionalAnalysis) {
                Object.entries(test.fullResults.sectionalAnalysis).forEach(([subject, data]) => {
                    if (!subjectTrends[subject]) {
                        subjectTrends[subject] = [];
                    }
                    subjectTrends[subject].push({
                        date: new Date(test.timestamp),
                        accuracy: data.accuracy,
                        averageTime: data.averageTime
                    });
                });
            }
        });
        
        return subjectTrends;
    }

    /**
     * Identify strengths and weaknesses
     * @param {Array} history - Test history
     * @returns {Object} Strengths and weaknesses
     */
    identifyStrengthsAndWeaknesses(history) {
        const subjectPerformance = {};
        
        // Aggregate performance by subject
        history.forEach(test => {
            if (test.fullResults && test.fullResults.sectionalAnalysis) {
                Object.entries(test.fullResults.sectionalAnalysis).forEach(([subject, data]) => {
                    if (!subjectPerformance[subject]) {
                        subjectPerformance[subject] = [];
                    }
                    subjectPerformance[subject].push(data.accuracy);
                });
            }
        });
        
        // Calculate average performance per subject
        const averagePerformance = {};
        Object.entries(subjectPerformance).forEach(([subject, scores]) => {
            averagePerformance[subject] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        });
        
        // Sort subjects by performance
        const sortedSubjects = Object.entries(averagePerformance)
            .sort(([, a], [, b]) => b - a);
        
        const midpoint = Math.ceil(sortedSubjects.length / 2);
        
        return {
            strengths: sortedSubjects.slice(0, midpoint).map(([subject, score]) => ({
                subject,
                averageScore: score
            })),
            weaknesses: sortedSubjects.slice(midpoint).map(([subject, score]) => ({
                subject,
                averageScore: score
            }))
        };
    }

    // ========================================================================
    // PUBLIC API METHODS
    // ========================================================================

    /**
     * Get current session status
     * @returns {Object} Session status
     */
    getSessionStatus() {
        if (!this.currentSession) {
            return { status: 'none', message: 'No active session' };
        }
        
        return {
            status: this.currentSession.status,
            sessionId: this.sessionId,
            currentQuestion: this.currentQuestionIndex + 1,
            totalQuestions: this.questions.length,
            timeRemaining: this.timeRemaining,
            progress: this.calculateProgress(this.currentSession),
            questionsAttempted: Object.keys(this.answers).length,
            questionsMarked: this.markedQuestions.size,
            questionsFlagged: this.flaggedQuestions.size
        };
    }

    /**
     * Get test statistics
     * @returns {Object} Test statistics
     */
    getTestStatistics() {
        return {
            sessionStatus: this.getSessionStatus(),
            navigationStatus: this.getNavigationStatus(),
            performanceMetrics: { ...this.performanceMetrics },
            currentQuestion: this.getCurrentQuestion(),
            timeAnalysis: this.calculateTimeAnalysis(),
            lastSaved: this.lastSaved
        };
    }

    /**
     * Export session data
     * @returns {Object} Exportable session data
     */
    exportSessionData() {
        if (!this.currentSession) return null;
        
        return {
            session: { ...this.currentSession },
            answers: { ...this.answers },
            answerTimes: { ...this.answerTimes },
            confidenceLevels: { ...this.confidenceLevels },
            navigation: {
                markedQuestions: Array.from(this.markedQuestions),
                flaggedQuestions: Array.from(this.flaggedQuestions),
                visitedQuestions: Array.from(this.visitedQuestions)
            },
            metadata: {
                exportedAt: Date.now(),
                version: '1.0.0',
                browser: navigator.userAgent
            }
        };
    }

    /**
     * Dispose of the test engine and clean up resources
     */
    dispose() {
        // Stop all timers
        this.stopTimer();
        this.stopAutoSave();
        
        // Clear event listeners
        Object.keys(this.eventCallbacks).forEach(eventType => {
            this.eventCallbacks[eventType] = [];
        });
        
        // Clear references
        this.currentSession = null;
        this.app = null;
        
        console.log('TestEngine disposed successfully');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = TestEngine;
} else {
    // Browser environment - attach to window object
    window.TestEngine = TestEngine;
}