/**
 * Main Application Integration File
 * RRB Mock Test Application - Version 3.0
 * Integrates all modules into a cohesive application
 */

class RRBMockTestApp {
    constructor() {
        this.version = '3.0';
        this.initialized = false;
        
        // Core modules
        this.uiManager = null;
        this.testSession = null;
        this.currentUser = null;
        
        // Data management
        this.users = JSON.parse(localStorage.getItem('mockTestUsers')) || [];
        this.questions = JSON.parse(localStorage.getItem('mockTestQuestions')) || [];
        this.testResults = JSON.parse(localStorage.getItem('mockTestResults')) || [];
        this.uploadedPDFs = JSON.parse(localStorage.getItem('uploadedPDFs')) || [];
        
        // Configuration
        this.config = {};
        this.charts = {};
        this.currentTest = null;
        
        // UI state
        this.currentSection = 'dashboard';
        
        console.log(`🚀 RRB Mock Test App v${this.version} - Initializing...`);
        this.initialize();
    }

    /**
     * Initialize the application
     */
    async initialize() {
        try {
            await this.loadConfiguration();
            await this.initializeUI();
            await this.loadSampleData();
            await this.setupEventListeners();
            await this.checkExistingUser();
            
            this.initialized = true;
            console.log('✅ Application initialized successfully');
            
            // Show welcome animation
            this.showWelcomeAnimation();
            
        } catch (error) {
            console.error('❌ Application initialization failed:', error);
            this.showErrorMessage('Failed to initialize application. Please refresh the page.');
        }
    }

    /**
     * Load configuration from modules
     */
    async loadConfiguration() {
        try {
            // Initialize configuration from modular files
            if (typeof window.MockTestConstants !== 'undefined') {
                this.config.constants = window.MockTestConstants;
            }

            if (typeof window.MockTestSyllabus !== 'undefined') {
                this.config.syllabusMapping = window.MockTestSyllabus.SYLLABUS_MAPPING;
                this.config.syllabusUtils = window.MockTestSyllabus.SyllabusMappingUtils;
            }

            if (typeof window.MockTestExamPatterns !== 'undefined') {
                this.config.examPatterns = window.MockTestExamPatterns.EXAM_PATTERNS;
                this.config.testGenerationConfig = window.MockTestExamPatterns.TEST_GENERATION_CONFIG;
                this.config.examPatternUtils = window.MockTestExamPatterns.ExamPatternUtils;
            }
            
            console.log('📋 Configuration loaded successfully');
            
        } catch (error) {
            console.warn('⚠️ Configuration loading failed, using defaults:', error);
            this.loadFallbackConfiguration();
        }
    }

    /**
     * Load fallback configuration if modules fail
     */
    loadFallbackConfiguration() {
        this.config = {
            constants: {
                SUBJECTS: ['Mathematics', 'General Intelligence & Reasoning', 'Basic Science & Engineering', 'General Awareness', 'Computer Applications'],
                DIFFICULTIES: ['Easy', 'Medium', 'Hard'],
                DEFAULT_TEST_DURATION: 90
            },
            syllabusMapping: {
                "Mathematics": {
                    chapters: ["Arithmetic", "Algebra", "Geometry", "Trigonometry", "Statistics"],
                    keywords: {}
                },
                "General Intelligence & Reasoning": {
                    chapters: ["Analogies", "Classification", "Series", "Coding-Decoding", "Blood Relations"],
                    keywords: {}
                },
                "Basic Science & Engineering": {
                    chapters: ["Physics", "Chemistry", "Basic Electronics", "Electrical Engineering"],
                    keywords: {}
                },
                "General Awareness": {
                    chapters: ["Current Affairs", "Geography", "History", "Polity", "Economy"],
                    keywords: {}
                },
                "Computer Applications": {
                    chapters: ["MS Office", "Internet", "Computer Fundamentals", "Programming Basics"],
                    keywords: {}
                }
            },
            examPatterns: {
                'standard': {
                    name: 'Standard Test',
                    totalQuestions: 100,
                    timeLimit: 90,
                    subjects: {
                        'Mathematics': { questions: 25, weight: 0.25 },
                        'General Intelligence & Reasoning': { questions: 25, weight: 0.25 },
                        'Basic Science & Engineering': { questions: 25, weight: 0.25 },
                        'General Awareness': { questions: 15, weight: 0.15 },
                        'Computer Applications': { questions: 10, weight: 0.10 }
                    }
                }
            }
        };
    }

    /**
     * Initialize UI Manager
     */
    async initializeUI() {
        if (typeof UIManager === 'undefined') {
            throw new Error('UIManager module not loaded');
        }
        
        this.uiManager = new UIManager(this);
        
        // Set up global reference for inline handlers
        window.uiManager = this.uiManager;
        window.app = this;
        
        console.log('🎨 UI Manager initialized');
    }

    /**
     * Load sample data if needed
     */
    async loadSampleData() {
        if (this.questions.length === 0) {
            const sampleQuestions = this.generateSampleQuestions();
            this.questions = sampleQuestions;
            this.saveQuestions();
            console.log(`📚 Loaded ${sampleQuestions.length} sample questions`);
        }
    }

    /**
     * Generate sample questions for testing
     */
    generateSampleQuestions() {
        return [
            {
                id: "q1",
                text: "If a train travels 60 km in 1 hour, what is its speed in m/s?",
                options: ["16.67 m/s", "60 m/s", "3600 m/s", "1000 m/s"],
                correctAnswer: 0,
                explanation: "Speed = 60 km/h = 60 × 1000 ÷ 3600 = 16.67 m/s",
                subject: "Mathematics",
                chapter: "Speed and Time",
                difficulty: "Easy",
                isPYQ: true,
                source: "Manual"
            },
            {
                id: "q2",
                text: "What is 25% of 80?",
                options: ["15", "20", "25", "30"],
                correctAnswer: 1,
                explanation: "25% of 80 = (25/100) × 80 = 20",
                subject: "Mathematics",
                chapter: "Percentages",
                difficulty: "Easy",
                isPYQ: false,
                source: "Manual"
            },
            {
                id: "q3",
                text: "In a certain code, 'MONITOR' is written as 'LNMHSNQ'. How will 'DISPLAY' be written?",
                options: ["CHROKZX", "CHRPKZX", "CHROKYX", "CHRPLYX"],
                correctAnswer: 0,
                explanation: "Each letter is moved one position back in the alphabet.",
                subject: "General Intelligence & Reasoning",
                chapter: "Coding and Decoding",
                difficulty: "Medium",
                isPYQ: true,
                source: "Manual"
            },
            {
                id: "q4",
                text: "Which of the following is a conductor of electricity?",
                options: ["Rubber", "Copper", "Glass", "Wood"],
                correctAnswer: 1,
                explanation: "Copper is a good conductor of electricity due to free electrons.",
                subject: "Basic Science & Engineering",
                chapter: "Basic Electricity",
                difficulty: "Easy",
                isPYQ: false,
                source: "Manual"
            },
            {
                id: "q5",
                text: "Who is the current Prime Minister of India?",
                options: ["Rahul Gandhi", "Narendra Modi", "Arvind Kejriwal", "Mamata Banerjee"],
                correctAnswer: 1,
                explanation: "Narendra Modi has been the Prime Minister of India since 2014",
                subject: "General Awareness",
                chapter: "Current Affairs",
                difficulty: "Easy",
                isPYQ: false,
                source: "Manual"
            }
        ];
    }

    /**
     * Setup event listeners
     */
    async setupEventListeners() {
        // User management
        this.setupUserEventListeners();
        
        // Navigation
        this.setupNavigationEventListeners();
        
        // Dashboard
        this.setupDashboardEventListeners();
        
        // Test management
        this.setupTestEventListeners();
        
        // Question bank
        this.setupQuestionBankEventListeners();
        
        console.log('🎯 Event listeners configured');
    }

    /**
     * Setup user management event listeners
     */
    setupUserEventListeners() {
        const createUserBtn = document.getElementById('createUserBtn');
        const saveUserBtn = document.getElementById('saveUserBtn');
        const cancelUserBtn = document.getElementById('cancelUserBtn');
        const switchUserBtn = document.getElementById('switchUserBtn');

        if (createUserBtn) {
            createUserBtn.addEventListener('click', () => this.showUserModal());
        }
        
        if (saveUserBtn) {
            saveUserBtn.addEventListener('click', () => this.createUser());
        }
        
        if (cancelUserBtn) {
            cancelUserBtn.addEventListener('click', () => this.uiManager.hideModal('userModal'));
        }
        
        if (switchUserBtn) {
            switchUserBtn.addEventListener('click', () => this.showUserSelection());
        }
    }

    /**
     * Setup navigation event listeners
     */
    setupNavigationEventListeners() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                if (section) {
                    this.switchSection(section);
                }
            });
        });
    }

    /**
     * Setup dashboard event listeners
     */
    setupDashboardEventListeners() {
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', () => {
                const action = card.dataset.action;
                if (action) {
                    this.handleQuickAction(action);
                }
            });
        });
    }

    /**
     * Setup test event listeners
     */
    setupTestEventListeners() {
        // Test type buttons
        document.querySelectorAll('.test-type-card button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const testCard = e.target.closest('.test-type-card');
                const testType = testCard?.dataset.test;
                if (testType) {
                    this.startTest(testType);
                }
            });
        });

        // Custom test configuration
        const configureCustomBtn = document.getElementById('configureCustomTest');
        if (configureCustomBtn) {
            configureCustomBtn.addEventListener('click', () => {
                this.uiManager.showModal('customTestModal');
            });
        }

        // Test interface controls
        this.setupTestInterfaceControls();
    }

    /**
     * Setup test interface controls
     */
    setupTestInterfaceControls() {
        const nextBtn = document.getElementById('nextQuestion');
        const prevBtn = document.getElementById('previousQuestion');
        const markBtn = document.getElementById('markForReview');
        const clearBtn = document.getElementById('clearResponse');
        const submitBtn = document.getElementById('submitTest');

        if (nextBtn) nextBtn.addEventListener('click', () => this.nextQuestion());
        if (prevBtn) prevBtn.addEventListener('click', () => this.previousQuestion());
        if (markBtn) markBtn.addEventListener('click', () => this.markForReview());
        if (clearBtn) clearBtn.addEventListener('click', () => this.clearResponse());
        if (submitBtn) submitBtn.addEventListener('click', () => this.submitTest());
    }

    /**
     * Setup question bank event listeners
     */
    setupQuestionBankEventListeners() {
        const addQuestionBtn = document.getElementById('addQuestionBtn');
        const uploadQuestionsBtn = document.getElementById('uploadQuestionsBtn');
        
        if (addQuestionBtn) {
            addQuestionBtn.addEventListener('click', () => this.showAddQuestionModal());
        }
        
        if (uploadQuestionsBtn) {
            uploadQuestionsBtn.addEventListener('click', () => {
                this.uiManager.showModal('pdfUploadModal');
            });
        }
    }

    /**
     * Check for existing user
     */
    async checkExistingUser() {
        const lastUserId = localStorage.getItem('lastUserId');
        if (lastUserId) {
            const user = this.users.find(u => u.id === lastUserId);
            if (user) {
                this.currentUser = user;
                this.showMainApp();
                this.updateDashboardStats();
                return;
            }
        }
        
        // Show welcome screen if no user
        this.showWelcomeScreen();
    }

    /**
     * Show welcome screen
     */
    showWelcomeScreen() {
        document.getElementById('welcomeScreen')?.classList.remove('hidden');
        document.getElementById('mainApp')?.classList.add('hidden');
    }

    /**
     * Show main application
     */
    showMainApp() {
        document.getElementById('welcomeScreen')?.classList.add('hidden');
        document.getElementById('mainApp')?.classList.remove('hidden');
        
        if (this.currentUser) {
            const userElement = document.getElementById('currentUser');
            if (userElement) {
                userElement.textContent = `Welcome, ${this.currentUser.name}!`;
            }
        }
    }

    /**
     * Show user modal
     */
    showUserModal() {
        this.uiManager.showModal('userModal', {
            announcement: 'Create user profile dialog opened'
        });
    }

    /**
     * Create new user
     */
    createUser() {
        const nameInput = document.getElementById('userName');
        const name = nameInput?.value.trim();
        
        if (!name) {
            this.uiManager.showNotification('Please enter your name', 'error');
            return;
        }
        
        const user = {
            id: 'user_' + Date.now(),
            name: name,
            createdAt: new Date().toISOString(),
            totalTests: 0,
            totalQuestions: 0,
            bestScore: 0,
            averageScore: 0
        };
        
        this.users.push(user);
        this.currentUser = user;
        this.saveUsers();
        
        localStorage.setItem('lastUserId', user.id);
        
        this.uiManager.hideModal('userModal');
        this.showMainApp();
        this.updateDashboardStats();
        
        this.uiManager.showNotification(`Welcome, ${name}!`, 'success');
    }

    /**
     * Show user selection
     */
    showUserSelection() {
        if (this.users.length === 0) {
            this.showUserModal();
            return;
        }
        
        // Implementation for user selection modal
        // This would show a list of existing users to choose from
        console.log('Show user selection - to be implemented');
    }

    /**
     * Switch application section
     */
    switchSection(sectionId) {
        if (!this.currentUser && sectionId !== 'dashboard') {
            this.uiManager.showNotification('Please create a user profile first', 'warning');
            return;
        }
        
        this.currentSection = sectionId;
        this.uiManager.switchSection(sectionId);
        
        // Section-specific initialization
        switch(sectionId) {
            case 'dashboard':
                this.updateDashboardStats();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
            case 'questionBank':
                this.loadQuestionBank();
                break;
            case 'testSelection':
                this.loadTestSelection();
                break;
            case 'studyMaterials':
                this.loadStudyMaterials();
                break;
        }
    }

    /**
     * Handle quick action from dashboard
     */
    handleQuickAction(action) {
        if (!this.currentUser) {
            this.uiManager.showNotification('Please create a user profile first', 'warning');
            return;
        }
        
        switch(action) {
            case 'fullMockTest':
                this.startTest('fullMock');
                break;
            case 'customTest':
                this.uiManager.showModal('customTestModal');
                break;
            case 'pyqTest':
                this.startTest('pyq');
                break;
            default:
                console.warn('Unknown action:', action);
        }
    }

    /**
     * Start a test
     */
    startTest(testType) {
        if (!this.currentUser) {
            this.uiManager.showNotification('Please create a user profile first', 'warning');
            return;
        }
        
        if (this.questions.length === 0) {
            this.uiManager.showNotification('No questions available. Please add questions first.', 'warning');
            return;
        }
        
        // Generate test questions based on type
        const testQuestions = this.generateTestQuestions(testType);
        
        if (testQuestions.length === 0) {
            this.uiManager.showNotification('Not enough questions available for this test type', 'error');
            return;
        }
        
        // Create test session
        this.testSession = {
            id: 'test_' + Date.now(),
            userId: this.currentUser.id,
            testType: testType,
            questions: testQuestions,
            currentQuestionIndex: 0,
            answers: {},
            markedQuestions: new Set(),
            startTime: Date.now(),
            duration: this.getTestDuration(testType),
            timeRemaining: this.getTestDuration(testType) * 60, // Convert to seconds
            active: true
        };
        
        // Switch to test interface
        this.switchSection('testInterface');
        this.startTestTimer();
        this.renderQuestion();
        
        this.uiManager.showNotification(`${this.getTestTypeName(testType)} started!`, 'success');
    }

    /**
     * Generate test questions based on type
     */
    generateTestQuestions(testType) {
        let questions = [];
        
        switch(testType) {
            case 'fullMock':
                questions = this.generateFullMockTest();
                break;
            case 'subjectWise':
                questions = this.generateSubjectWiseTest();
                break;
            case 'custom':
                questions = this.generateCustomTest();
                break;
            case 'pyq':
                questions = this.generatePYQTest();
                break;
            default:
                questions = this.questions.slice(0, 25); // Default 25 questions
        }
        
        return this.shuffleArray(questions);
    }

    /**
     * Generate full mock test
     */
    generateFullMockTest() {
        const pattern = this.config.examPatterns?.standard || this.config.examPatterns[Object.keys(this.config.examPatterns)[0]];
        const questions = [];
        
        Object.entries(pattern.subjects).forEach(([subject, config]) => {
            const subjectQuestions = this.questions.filter(q => q.subject === subject);
            const selectedQuestions = this.shuffleArray(subjectQuestions).slice(0, config.questions);
            questions.push(...selectedQuestions);
        });
        
        return questions;
    }

    /**
     * Generate subject-wise test
     */
    generateSubjectWiseTest() {
        // This would be implemented based on selected subject
        return this.questions.slice(0, 20);
    }

    /**
     * Generate custom test
     */
    generateCustomTest() {
        // This would use custom test configuration
        return this.questions.slice(0, 50);
    }

    /**
     * Generate PYQ test
     */
    generatePYQTest() {
        const pyqQuestions = this.questions.filter(q => q.isPYQ);
        return this.shuffleArray(pyqQuestions).slice(0, 50);
    }

    /**
     * Get test duration in minutes
     */
    getTestDuration(testType) {
        const durations = {
            'fullMock': 90,
            'subjectWise': 30,
            'custom': 60,
            'pyq': 60
        };
        return durations[testType] || 60;
    }

    /**
     * Get test type display name
     */
    getTestTypeName(testType) {
        const names = {
            'fullMock': 'Full Mock Test',
            'subjectWise': 'Subject-wise Test',
            'custom': 'Custom Test',
            'pyq': 'Previous Year Questions Test'
        };
        return names[testType] || 'Test';
    }

    /**
     * Start test timer
     */
    startTestTimer() {
        if (this.testSession.timer) {
            clearInterval(this.testSession.timer);
        }
        
        this.testSession.timer = setInterval(() => {
            if (!this.testSession.active) return;
            
            this.testSession.timeRemaining--;
            this.updateTimerDisplay();
            
            if (this.testSession.timeRemaining <= 0) {
                this.submitTest(true); // Auto-submit when time is up
            }
        }, 1000);
    }

    /**
     * Update timer display
     */
    updateTimerDisplay() {
        const minutes = Math.floor(this.testSession.timeRemaining / 60);
        const seconds = this.testSession.timeRemaining % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const timerElement = document.getElementById('timeRemaining');
        if (timerElement) {
            timerElement.textContent = timeString;
        }
        
        // Update timer styling based on remaining time
        const timerContainer = document.getElementById('timerContainer');
        if (timerContainer) {
            timerContainer.classList.toggle('warning', this.testSession.timeRemaining <= 300);
            timerContainer.classList.toggle('critical', this.testSession.timeRemaining <= 60);
        }
    }

    /**
     * Render current question
     */
    renderQuestion() {
        if (!this.testSession) return;
        
        const question = this.testSession.questions[this.testSession.currentQuestionIndex];
        if (!question) return;
        
        // Update question number
        const questionNum = document.getElementById('currentQuestionNum');
        if (questionNum) {
            questionNum.textContent = this.testSession.currentQuestionIndex + 1;
        }
        
        // Update progress
        const progress = document.getElementById('testProgress');
        if (progress) {
            progress.textContent = `Question ${this.testSession.currentQuestionIndex + 1} of ${this.testSession.questions.length}`;
        }
        
        // Update question text
        const questionText = document.getElementById('questionText');
        if (questionText) {
            questionText.innerHTML = question.text;
        }
        
        // Update options
        const optionsContainer = document.getElementById('questionOptions');
        if (optionsContainer) {
            optionsContainer.innerHTML = question.options.map((option, index) => `
                <div class="question-option ${this.testSession.answers[this.testSession.currentQuestionIndex] === index ? 'selected' : ''}" 
                     onclick="app.selectAnswer(${index})">
                    <label class="question-option-label">
                        <input type="radio" name="question_${this.testSession.currentQuestionIndex}" value="${index}" 
                               ${this.testSession.answers[this.testSession.currentQuestionIndex] === index ? 'checked' : ''}>
                        <span class="option-marker">${String.fromCharCode(65 + index)}</span>
                        <span class="option-text">${option}</span>
                    </label>
                </div>
            `).join('');
        }
        
        // Update navigation buttons
        this.updateNavigationButtons();
        
        // Update question palette
        this.updateQuestionPalette();
    }

    /**
     * Select an answer
     */
    selectAnswer(optionIndex) {
        if (!this.testSession) return;
        
        this.testSession.answers[this.testSession.currentQuestionIndex] = optionIndex;
        
        // Update UI
        document.querySelectorAll('.question-option').forEach((option, index) => {
            option.classList.toggle('selected', index === optionIndex);
        });
        
        // Update progress
        this.updateProgressIndicators();
        
        // Update palette
        this.updateQuestionPalette();
    }

    /**
     * Navigate to next question
     */
    nextQuestion() {
        if (!this.testSession) return;
        
        if (this.testSession.currentQuestionIndex < this.testSession.questions.length - 1) {
            this.testSession.currentQuestionIndex++;
            this.renderQuestion();
        }
    }

    /**
     * Navigate to previous question
     */
    previousQuestion() {
        if (!this.testSession) return;
        
        if (this.testSession.currentQuestionIndex > 0) {
            this.testSession.currentQuestionIndex--;
            this.renderQuestion();
        }
    }

    /**
     * Mark question for review
     */
    markForReview() {
        if (!this.testSession) return;
        
        const questionId = this.testSession.questions[this.testSession.currentQuestionIndex].id;
        
        if (this.testSession.markedQuestions.has(questionId)) {
            this.testSession.markedQuestions.delete(questionId);
            this.uiManager.showNotification('Question unmarked for review', 'info');
        } else {
            this.testSession.markedQuestions.add(questionId);
            this.uiManager.showNotification('Question marked for review', 'success');
        }
        
        this.updateQuestionPalette();
    }

    /**
     * Clear current response
     */
    clearResponse() {
        if (!this.testSession) return;
        
        delete this.testSession.answers[this.testSession.currentQuestionIndex];
        this.renderQuestion();
        this.uiManager.showNotification('Response cleared', 'info');
    }

    /**
     * Update navigation buttons
     */
    updateNavigationButtons() {
        if (!this.testSession) return;
        
        const prevBtn = document.getElementById('previousQuestion');
        const nextBtn = document.getElementById('nextQuestion');
        
        if (prevBtn) {
            prevBtn.disabled = this.testSession.currentQuestionIndex === 0;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.testSession.currentQuestionIndex === this.testSession.questions.length - 1;
        }
    }

    /**
     * Update progress indicators
     */
    updateProgressIndicators() {
        if (!this.testSession) return;
        
        const totalQuestions = this.testSession.questions.length;
        const answeredCount = Object.keys(this.testSession.answers).length;
        const markedCount = this.testSession.markedQuestions.size;
        const remainingCount = totalQuestions - answeredCount;
        const progressPercent = Math.round((answeredCount / totalQuestions) * 100);
        
        // Update progress bar
        this.uiManager.updateProgress('overallProgressFill', progressPercent, { animate: true });
        
        const progressText = document.getElementById('overallProgressText');
        if (progressText) progressText.textContent = progressPercent + '%';
        
        // Update stats
        const elements = {
            answeredCount: answeredCount,
            markedCount: markedCount,
            remainingCount: remainingCount
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    /**
     * Update question palette
     */
    updateQuestionPalette() {
        if (!this.testSession) return;
        
        const paletteGrid = document.getElementById('questionPalette');
        if (!paletteGrid) return;
        
        paletteGrid.innerHTML = this.testSession.questions.map((question, index) => {
            const isAnswered = this.testSession.answers.hasOwnProperty(index);
            const isMarked = this.testSession.markedQuestions.has(question.id);
            const isCurrent = index === this.testSession.currentQuestionIndex;
            
            let className = 'palette-question';
            if (isCurrent) className += ' current';
            else if (isAnswered) className += ' answered';
            else className += ' not-answered';
            
            if (isMarked) className += ' marked';
            
            return `
                <div class="${className}" onclick="app.jumpToQuestion(${index})" title="Question ${index + 1}">
                    ${index + 1}
                </div>
            `;
        }).join('');
    }

    /**
     * Jump to specific question
     */
    jumpToQuestion(questionIndex) {
        if (!this.testSession || questionIndex < 0 || questionIndex >= this.testSession.questions.length) {
            return;
        }
        
        this.testSession.currentQuestionIndex = questionIndex;
        this.renderQuestion();
    }

    /**
     * Submit test
     */
    submitTest(autoSubmit = false) {
        if (!this.testSession) return;
        
        if (!autoSubmit) {
            const confirmed = confirm('Are you sure you want to submit the test? You cannot change your answers after submission.');
            if (!confirmed) return;
        }
        
        // Stop timer
        if (this.testSession.timer) {
            clearInterval(this.testSession.timer);
        }
        
        this.testSession.active = false;
        
        // Calculate results
        const result = this.calculateTestResults();
        
        // Save result
        this.testResults.push(result);
        this.saveTestResults();
        
        // Update user stats
        this.updateUserStats(result);
        
        // Show results
        this.currentTest = result;
        this.switchSection('testReview');
        
        this.uiManager.showNotification(
            autoSubmit ? 'Test auto-submitted due to time limit' : 'Test submitted successfully!', 
            'success'
        );
    }

    /**
     * Calculate test results
     */
    calculateTestResults() {
        const correctAnswers = this.testSession.questions.reduce((count, question, index) => {
            return count + (this.testSession.answers[index] === question.correctAnswer ? 1 : 0);
        }, 0);
        
        const incorrectAnswers = Object.keys(this.testSession.answers).length - correctAnswers;
        const unattempted = this.testSession.questions.length - Object.keys(this.testSession.answers).length;
        const rawScore = correctAnswers - (incorrectAnswers * 0.33); // Negative marking
        const percentage = Math.max(0, (rawScore / this.testSession.questions.length) * 100);
        
        return {
            id: this.testSession.id,
            userId: this.testSession.userId,
            testType: this.testSession.testType,
            questions: this.testSession.questions,
            answers: Object.keys(this.testSession.answers).map(key => this.testSession.answers[key]),
            marked: Array.from(this.testSession.markedQuestions),
            totalQuestions: this.testSession.questions.length,
            correctAnswers: correctAnswers,
            incorrectAnswers: incorrectAnswers,
            unattempted: unattempted,
            rawScore: rawScore,
            score: Math.round(percentage),
            timeSpent: this.testSession.duration * 60 * 1000 - this.testSession.timeRemaining * 1000,
            completedAt: new Date().toISOString()
        };
    }

    /**
     * Update user statistics
     */
    updateUserStats(result) {
        if (!this.currentUser) return;
        
        this.currentUser.totalTests = (this.currentUser.totalTests || 0) + 1;
        this.currentUser.totalQuestions = (this.currentUser.totalQuestions || 0) + result.totalQuestions;
        this.currentUser.bestScore = Math.max(this.currentUser.bestScore || 0, result.score);
        
        // Calculate average score
        const userResults = this.testResults.filter(r => r.userId === this.currentUser.id);
        this.currentUser.averageScore = Math.round(
            userResults.reduce((sum, r) => sum + r.score, 0) / userResults.length
        );
        
        this.saveUsers();
    }

    /**
     * Update dashboard statistics
     */
    updateDashboardStats() {
        if (!this.currentUser) return;
        
        const userResults = this.testResults.filter(r => r.userId === this.currentUser.id);
        
        const stats = {
            totalTests: userResults.length,
            averageScore: userResults.length > 0 ? Math.round(userResults.reduce((sum, r) => sum + r.score, 0) / userResults.length) : 0,
            bestScore: userResults.length > 0 ? Math.max(...userResults.map(r => r.score)) : 0,
            totalQuestions: this.questions.length
        };
        
        // Update DOM elements
        Object.entries(stats).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = key === 'totalQuestions' ? value : 
                                   (key.includes('Score') ? value + '%' : value);
            }
        });
    }

    /**
     * Show add question modal
     */
    showAddQuestionModal() {
        this.uiManager.showModal('questionModal', {
            announcement: 'Add question dialog opened'
        });
    }

    /**
     * Load analytics
     */
    loadAnalytics() {
        if (!this.currentUser) return;
        
        const userResults = this.testResults.filter(r => r.userId === this.currentUser.id);
        
        if (userResults.length === 0) {
            this.showNoAnalyticsMessage();
            return;
        }
        
        // Load charts would be implemented here
        console.log('Loading analytics for', userResults.length, 'tests');
    }

    /**
     * Show no analytics message
     */
    showNoAnalyticsMessage() {
        const analyticsContent = document.querySelector('.analytics-content');
        if (analyticsContent) {
            analyticsContent.innerHTML = `
                <div class="no-analytics">
                    <div class="no-content-icon">📊</div>
                    <h3>No Test Data Available</h3>
                    <p>Take some tests to see your performance analytics here.</p>
                    <button class="btn btn--primary" onclick="app.switchSection('testSelection')">📝 Take a Test</button>
                </div>
            `;
        }
    }

    /**
     * Load question bank
     */
    loadQuestionBank() {
        console.log('Loading question bank with', this.questions.length, 'questions');
        // Question bank rendering would be implemented here
    }

    /**
     * Load test selection
     */
    loadTestSelection() {
        console.log('Loading test selection');
        // Test selection setup would be implemented here
    }

    /**
     * Load study materials
     */
    loadStudyMaterials() {
        console.log('Loading study materials');
        // Study materials setup would be implemented here
    }

    /**
     * Show welcome animation
     */
    showWelcomeAnimation() {
        // Add animation class to dashboard elements
        const dashboard = document.getElementById('dashboard');
        if (dashboard) {
            dashboard.classList.add('dashboard-animate-in');
        }
    }

    /**
     * Show error message
     */
    showErrorMessage(message) {
        this.uiManager?.showNotification(message, 'error') || alert(message);
    }

    /**
     * Shuffle array utility
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
     * Data persistence methods
     */
    saveUsers() {
        try {
            localStorage.setItem('mockTestUsers', JSON.stringify(this.users));
        } catch (error) {
            console.error('Error saving users:', error);
        }
    }

    saveQuestions() {
        try {
            localStorage.setItem('mockTestQuestions', JSON.stringify(this.questions));
        } catch (error) {
            console.error('Error saving questions:', error);
        }
    }

    saveTestResults() {
        try {
            localStorage.setItem('mockTestResults', JSON.stringify(this.testResults));
        } catch (error) {
            console.error('Error saving test results:', error);
        }
    }

    /**
     * Cleanup application
     */
    cleanup() {
        if (this.testSession?.timer) {
            clearInterval(this.testSession.timer);
        }
        
        if (this.uiManager) {
            this.uiManager.cleanup();
        }
        
        // Clear charts
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        
        console.log('🧹 Application cleaned up');
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new RRBMockTestApp();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.app) {
        window.app.cleanup();
    }
});

// Handle errors gracefully
window.addEventListener('error', (event) => {
    console.error('Application error:', event.error);
    
    if (window.app?.uiManager) {
        window.app.uiManager.showNotification(
            'An error occurred. Please refresh the page if issues persist.', 
            'error'
        );
    }
});

console.log('🎯 RRB Mock Test App v3.0 - Module-based architecture loaded');