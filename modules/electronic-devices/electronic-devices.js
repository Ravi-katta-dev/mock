/**
 * Electronic Devices & Circuits Module JavaScript
 * Interactive framework and content management system
 * 
 * Features:
 * - Dynamic content loading from JSON
 * - Interactive demos management
 * - Quiz functionality
 * - Accessibility features
 * - Progressive enhancement
 * 
 * @author RRB Electronics Team
 * @version 1.0.0
 */

class ElectronicDevicesModule {
    constructor() {
        this.concepts = [];
        this.exercises = [];
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.quizAnswers = [];
        
        this.init();
    }

    /**
     * Initialize the module
     */
    async init() {
        try {
            this.setupEventListeners();
            await this.loadContent();
            this.setupAccessibility();
            this.updateStats();
            console.log('Electronic Devices Module initialized successfully');
        } catch (error) {
            console.error('Failed to initialize module:', error);
            this.showErrorMessage('Failed to load module content');
        }
    }

    /**
     * Set up event listeners for interactive elements
     */
    setupEventListeners() {
        // Concept expansion buttons
        document.querySelectorAll('.concept-expand').forEach(button => {
            button.addEventListener('click', this.handleConceptExpansion.bind(this));
        });

        // Demo launch buttons
        document.querySelectorAll('.demo-launch').forEach(button => {
            button.addEventListener('click', this.handleDemoLaunch.bind(this));
        });

        // Exercise controls
        const topicFilter = document.getElementById('topic-filter');
        const difficultyFilter = document.getElementById('difficulty-filter');
        const startQuizBtn = document.getElementById('start-quiz');

        if (topicFilter) {
            topicFilter.addEventListener('change', this.filterExercises.bind(this));
        }
        
        if (difficultyFilter) {
            difficultyFilter.addEventListener('change', this.filterExercises.bind(this));
        }
        
        if (startQuizBtn) {
            startQuizBtn.addEventListener('click', this.startQuiz.bind(this));
        }

        // Quiz modal controls
        this.setupQuizControls();

        // Smooth scrolling for navigation
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', this.handleSmoothScroll.bind(this));
        });

        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
    }

    /**
     * Load content from JSON files
     */
    async loadContent() {
        try {
            const [conceptsResponse, exercisesResponse] = await Promise.all([
                fetch('data/concepts.json'),
                fetch('data/exercises.json')
            ]);

            if (!conceptsResponse.ok || !exercisesResponse.ok) {
                throw new Error('Failed to fetch content files');
            }

            this.concepts = await conceptsResponse.json();
            this.exercises = await exercisesResponse.json();

            this.renderExercises();
        } catch (error) {
            console.error('Content loading error:', error);
            // Fall back to sample content
            this.loadSampleContent();
        }
    }

    /**
     * Load sample content as fallback
     */
    loadSampleContent() {
        this.concepts = [
            {
                id: 'diodes',
                title: 'Diodes',
                description: 'Semiconductor devices allowing unidirectional current flow',
                topics: ['PN Junction', 'Forward/Reverse Bias', 'IV Characteristics', 'Zener Diodes']
            }
        ];

        this.exercises = [
            {
                id: 1,
                topic: 'diodes',
                difficulty: 'easy',
                question: 'What is the primary function of a diode?',
                options: [
                    'Amplify signals',
                    'Allow current flow in one direction',
                    'Store electrical energy',
                    'Generate voltage'
                ],
                correctAnswer: 1,
                explanation: 'A diode allows current to flow in only one direction, from anode to cathode.'
            }
        ];

        this.renderExercises();
    }

    /**
     * Handle concept expansion
     */
    handleConceptExpansion(event) {
        const button = event.target;
        const conceptId = button.getAttribute('data-concept');
        const contentDiv = document.getElementById(`${conceptId}-content`);
        
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
            button.setAttribute('aria-expanded', 'false');
            button.textContent = 'Learn More';
            contentDiv.style.maxHeight = 'auto';
        } else {
            button.setAttribute('aria-expanded', 'true');
            button.textContent = 'Show Less';
            // Load detailed content here
            this.loadDetailedConcept(conceptId, contentDiv);
        }
    }

    /**
     * Load detailed concept content
     */
    loadDetailedConcept(conceptId, container) {
        const concept = this.concepts.find(c => c.id === conceptId);
        if (!concept) return;

        // Create detailed content
        const detailsHTML = `
            <div class="concept-details" role="region" aria-label="Detailed ${concept.title} information">
                <h4>Detailed Information</h4>
                <p>${concept.detailedDescription || 'Detailed information will be loaded here.'}</p>
                ${concept.examples ? `
                    <h5>Examples:</h5>
                    <ul>
                        ${concept.examples.map(example => `<li>${example}</li>`).join('')}
                    </ul>
                ` : ''}
                ${concept.formulas ? `
                    <h5>Key Formulas:</h5>
                    <div class="formulas">
                        ${concept.formulas.map(formula => `<div class="formula">${formula}</div>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;

        container.insertAdjacentHTML('beforeend', detailsHTML);
    }

    /**
     * Handle demo launches
     */
    handleDemoLaunch(event) {
        const button = event.target;
        const demoType = button.getAttribute('data-demo');
        
        // Disable button temporarily
        button.disabled = true;
        button.textContent = 'Loading...';

        setTimeout(() => {
            this.launchDemo(demoType, button);
        }, 1000);
    }

    /**
     * Launch interactive demos
     */
    launchDemo(demoType, button) {
        const demoContainer = button.closest('.demo-card').querySelector('.demo-container');
        
        switch (demoType) {
            case 'iv-curve':
                this.loadIVCurveDemo(demoContainer);
                break;
            case 'circuit-analysis':
                this.loadCircuitAnalysisDemo(demoContainer);
                break;
            case 'opamp-sim':
                this.loadOpAmpDemo(demoContainer);
                break;
            default:
                console.warn('Unknown demo type:', demoType);
        }

        // Re-enable button
        button.disabled = false;
        button.textContent = 'Restart Demo';
    }

    /**
     * Load IV Curve demonstration
     */
    loadIVCurveDemo(container) {
        container.innerHTML = `
            <div class="iv-demo" role="application" aria-label="IV Curve Plotting Tool">
                <div class="demo-controls">
                    <label for="voltage-range">Voltage Range (V):</label>
                    <input type="range" id="voltage-range" min="-5" max="5" step="0.1" value="0" aria-describedby="voltage-value">
                    <span id="voltage-value">0V</span>
                </div>
                <div class="demo-display">
                    <canvas id="iv-canvas" width="300" height="200" aria-label="IV characteristic curve"></canvas>
                </div>
                <div class="demo-info">
                    <p>Current: <span id="current-value">0 mA</span></p>
                    <p>Adjust voltage to see current response</p>
                </div>
            </div>
        `;

        this.initializeIVDemo();
    }

    /**
     * Initialize IV curve demo functionality
     */
    initializeIVDemo() {
        const voltageInput = document.getElementById('voltage-range');
        const voltageValue = document.getElementById('voltage-value');
        const currentValue = document.getElementById('current-value');
        const canvas = document.getElementById('iv-canvas');
        
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        voltageInput.addEventListener('input', (e) => {
            const voltage = parseFloat(e.target.value);
            voltageValue.textContent = `${voltage}V`;
            
            // Simple diode IV calculation
            const current = voltage > 0.7 ? Math.exp(voltage - 0.7) * 10 : 0.01;
            currentValue.textContent = `${current.toFixed(2)} mA`;
            
            this.drawIVCurve(ctx, voltage, current);
        });

        // Initial draw
        this.drawIVCurve(ctx, 0, 0);
    }

    /**
     * Draw IV curve on canvas
     */
    drawIVCurve(ctx, currentVoltage, currentCurrent) {
        ctx.clearRect(0, 0, 300, 200);
        
        // Draw axes
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(50, 150);
        ctx.lineTo(250, 150); // X-axis
        ctx.moveTo(50, 20);
        ctx.lineTo(50, 180); // Y-axis
        ctx.stroke();
        
        // Draw curve
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let v = -2; v <= 5; v += 0.1) {
            const i = v > 0.7 ? Math.exp(v - 0.7) * 2 : 0.01;
            const x = 50 + (v + 2) * 25;
            const y = 150 - Math.min(i * 10, 120);
            
            if (v === -2) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        
        // Mark current point
        const x = 50 + (currentVoltage + 2) * 25;
        const y = 150 - Math.min(currentCurrent * 10, 120);
        
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    }

    /**
     * Load Circuit Analysis demonstration
     */
    loadCircuitAnalysisDemo(container) {
        container.innerHTML = `
            <div class="circuit-demo" role="application" aria-label="Circuit Analysis Tool">
                <p>Circuit analysis tool will be implemented here</p>
                <div class="demo-placeholder">
                    <p>Interactive circuit builder and analyzer</p>
                    <p>Features: Component placement, voltage/current calculations</p>
                </div>
            </div>
        `;
    }

    /**
     * Load Op-Amp demonstration
     */
    loadOpAmpDemo(container) {
        container.innerHTML = `
            <div class="opamp-demo" role="application" aria-label="Op-Amp Simulator">
                <p>Op-Amp configuration simulator will be implemented here</p>
                <div class="demo-placeholder">
                    <p>Simulate inverting, non-inverting, and differential configurations</p>
                    <p>Adjust gain, input voltages, and see output response</p>
                </div>
            </div>
        `;
    }

    /**
     * Render exercises in the container
     */
    renderExercises() {
        const container = document.getElementById('exercises-container');
        if (!container) return;

        if (this.exercises.length === 0) {
            container.innerHTML = '<p class="no-exercises">No exercises available</p>';
            return;
        }

        const exercisesHTML = this.exercises.slice(0, 5).map(exercise => `
            <div class="exercise-item" data-topic="${exercise.topic}" data-difficulty="${exercise.difficulty}">
                <h4>Question ${exercise.id}</h4>
                <p class="exercise-question">${exercise.question}</p>
                <div class="exercise-meta">
                    <span class="topic-tag">${exercise.topic}</span>
                    <span class="difficulty-tag difficulty-${exercise.difficulty}">${exercise.difficulty}</span>
                </div>
            </div>
        `).join('');

        container.innerHTML = exercisesHTML;
    }

    /**
     * Filter exercises based on selected criteria
     */
    filterExercises() {
        const topicFilter = document.getElementById('topic-filter').value;
        const difficultyFilter = document.getElementById('difficulty-filter').value;
        
        document.querySelectorAll('.exercise-item').forEach(item => {
            const topic = item.getAttribute('data-topic');
            const difficulty = item.getAttribute('data-difficulty');
            
            const topicMatch = topicFilter === 'all' || topic === topicFilter;
            const difficultyMatch = difficultyFilter === 'all' || difficulty === difficultyFilter;
            
            item.style.display = topicMatch && difficultyMatch ? 'block' : 'none';
        });
    }

    /**
     * Start a practice quiz
     */
    startQuiz() {
        const topicFilter = document.getElementById('topic-filter').value;
        const difficultyFilter = document.getElementById('difficulty-filter').value;
        
        // Filter exercises for quiz
        let quizQuestions = this.exercises.filter(exercise => {
            const topicMatch = topicFilter === 'all' || exercise.topic === topicFilter;
            const difficultyMatch = difficultyFilter === 'all' || exercise.difficulty === difficultyFilter;
            return topicMatch && difficultyMatch;
        });

        if (quizQuestions.length === 0) {
            alert('No questions available for the selected criteria');
            return;
        }

        // Shuffle and limit questions
        quizQuestions = this.shuffleArray(quizQuestions).slice(0, Math.min(10, quizQuestions.length));
        
        this.currentQuiz = quizQuestions;
        this.currentQuestionIndex = 0;
        this.quizAnswers = [];
        
        this.showQuizModal();
        this.displayQuestion();
    }

    /**
     * Show quiz modal
     */
    showQuizModal() {
        const modal = document.getElementById('quiz-modal');
        if (modal) {
            modal.style.display = 'flex';
            modal.setAttribute('aria-hidden', 'false');
            // Focus management
            modal.querySelector('.quiz-close').focus();
        }
    }

    /**
     * Hide quiz modal
     */
    hideQuizModal() {
        const modal = document.getElementById('quiz-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Setup quiz modal controls
     */
    setupQuizControls() {
        const modal = document.getElementById('quiz-modal');
        const closeBtn = document.querySelector('.quiz-close');
        const prevBtn = document.getElementById('prev-question');
        const nextBtn = document.getElementById('next-question');
        const submitBtn = document.getElementById('submit-quiz');

        if (closeBtn) {
            closeBtn.addEventListener('click', this.hideQuizModal.bind(this));
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', this.previousQuestion.bind(this));
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', this.nextQuestion.bind(this));
        }

        if (submitBtn) {
            submitBtn.addEventListener('click', this.submitQuiz.bind(this));
        }

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
                this.hideQuizModal();
            }
        });

        // Close on backdrop click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideQuizModal();
                }
            });
        }
    }

    /**
     * Display current question
     */
    displayQuestion() {
        if (!this.currentQuiz || this.currentQuestionIndex >= this.currentQuiz.length) return;

        const question = this.currentQuiz[this.currentQuestionIndex];
        const quizBody = document.getElementById('quiz-body');
        
        if (!quizBody) return;

        const questionHTML = `
            <div class="quiz-question" role="group" aria-labelledby="question-title">
                <h4 id="question-title">Question ${this.currentQuestionIndex + 1}</h4>
                <p class="question-text">${question.question}</p>
                <div class="question-options" role="radiogroup" aria-labelledby="question-title">
                    ${question.options.map((option, index) => `
                        <label class="option-label">
                            <input type="radio" name="answer" value="${index}" aria-describedby="option-${index}">
                            <span id="option-${index}">${option}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;

        quizBody.innerHTML = questionHTML;

        // Update progress
        this.updateQuizProgress();
        this.updateQuizButtons();

        // Pre-select previous answer if exists
        const previousAnswer = this.quizAnswers[this.currentQuestionIndex];
        if (previousAnswer !== undefined) {
            const radio = quizBody.querySelector(`input[value="${previousAnswer}"]`);
            if (radio) radio.checked = true;
        }
    }

    /**
     * Update quiz progress indicator
     */
    updateQuizProgress() {
        const progressBar = document.querySelector('.progress-bar::after');
        const progressText = document.querySelector('.progress-text');
        const progressBarElement = document.querySelector('.progress-bar');
        
        if (progressText) {
            progressText.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.currentQuiz.length}`;
        }

        if (progressBarElement) {
            const percentage = ((this.currentQuestionIndex + 1) / this.currentQuiz.length) * 100;
            progressBarElement.style.setProperty('--progress', `${percentage}%`);
        }
    }

    /**
     * Update quiz navigation buttons
     */
    updateQuizButtons() {
        const prevBtn = document.getElementById('prev-question');
        const nextBtn = document.getElementById('next-question');
        const submitBtn = document.getElementById('submit-quiz');

        if (prevBtn) {
            prevBtn.disabled = this.currentQuestionIndex === 0;
        }

        const isLastQuestion = this.currentQuestionIndex === this.currentQuiz.length - 1;
        
        if (nextBtn && submitBtn) {
            nextBtn.style.display = isLastQuestion ? 'none' : 'inline-block';
            submitBtn.style.display = isLastQuestion ? 'inline-block' : 'none';
        }
    }

    /**
     * Navigate to previous question
     */
    previousQuestion() {
        this.saveCurrentAnswer();
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayQuestion();
        }
    }

    /**
     * Navigate to next question
     */
    nextQuestion() {
        this.saveCurrentAnswer();
        if (this.currentQuestionIndex < this.currentQuiz.length - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
        }
    }

    /**
     * Save current answer
     */
    saveCurrentAnswer() {
        const selectedOption = document.querySelector('input[name="answer"]:checked');
        if (selectedOption) {
            this.quizAnswers[this.currentQuestionIndex] = parseInt(selectedOption.value);
        }
    }

    /**
     * Submit quiz and show results
     */
    submitQuiz() {
        this.saveCurrentAnswer();
        
        let correctAnswers = 0;
        const results = this.currentQuiz.map((question, index) => {
            const userAnswer = this.quizAnswers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            if (isCorrect) correctAnswers++;
            
            return {
                question: question.question,
                userAnswer: userAnswer !== undefined ? question.options[userAnswer] : 'Not answered',
                correctAnswer: question.options[question.correctAnswer],
                isCorrect,
                explanation: question.explanation
            };
        });

        this.showQuizResults(correctAnswers, results);
    }

    /**
     * Show quiz results
     */
    showQuizResults(correctAnswers, results) {
        const quizBody = document.getElementById('quiz-body');
        const percentage = Math.round((correctAnswers / this.currentQuiz.length) * 100);
        
        const resultsHTML = `
            <div class="quiz-results" role="region" aria-labelledby="results-title">
                <h3 id="results-title">Quiz Results</h3>
                <div class="results-summary">
                    <p class="score">Score: ${correctAnswers}/${this.currentQuiz.length} (${percentage}%)</p>
                    <div class="score-badge ${percentage >= 70 ? 'pass' : 'fail'}">
                        ${percentage >= 70 ? 'Pass' : 'Needs Improvement'}
                    </div>
                </div>
                <div class="results-details">
                    ${results.map((result, index) => `
                        <div class="result-item ${result.isCorrect ? 'correct' : 'incorrect'}">
                            <h4>Question ${index + 1}</h4>
                            <p class="question">${result.question}</p>
                            <p class="user-answer">Your answer: ${result.userAnswer}</p>
                            ${!result.isCorrect ? `<p class="correct-answer">Correct answer: ${result.correctAnswer}</p>` : ''}
                            ${result.explanation ? `<p class="explanation">${result.explanation}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
                <button class="btn-primary" onclick="electronicDevicesModule.hideQuizModal()">
                    Close Results
                </button>
            </div>
        `;

        quizBody.innerHTML = resultsHTML;
        
        // Hide navigation buttons
        document.querySelector('.quiz-footer .quiz-controls').style.display = 'none';
    }

    /**
     * Handle smooth scrolling for navigation links
     */
    handleSmoothScroll(event) {
        event.preventDefault();
        const targetId = event.target.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Update focus for accessibility
            targetElement.focus({ preventScroll: true });
        }
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyboardNavigation(event) {
        // Add keyboard shortcuts here if needed
        // For example: Alt+C for concepts, Alt+I for interactive, Alt+E for exercises
    }

    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        // Add skip links
        this.addSkipLinks();
        
        // Setup ARIA live regions
        this.setupLiveRegions();
        
        // Enhance focus management
        this.enhanceFocusManagement();
    }

    /**
     * Add skip navigation links
     */
    addSkipLinks() {
        const skipNav = document.createElement('nav');
        skipNav.className = 'skip-nav sr-only';
        skipNav.innerHTML = `
            <a href="#concepts" class="skip-link">Skip to concepts</a>
            <a href="#interactive" class="skip-link">Skip to interactive demos</a>
            <a href="#exercises" class="skip-link">Skip to exercises</a>
        `;
        
        document.body.insertBefore(skipNav, document.body.firstChild);
    }

    /**
     * Setup ARIA live regions for dynamic content
     */
    setupLiveRegions() {
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'live-region';
        
        document.body.appendChild(liveRegion);
    }

    /**
     * Enhance focus management
     */
    enhanceFocusManagement() {
        // Trap focus in modal when open
        const modal = document.getElementById('quiz-modal');
        if (modal) {
            modal.addEventListener('keydown', this.trapFocus.bind(this));
        }
    }

    /**
     * Trap focus within modal
     */
    trapFocus(event) {
        if (event.key !== 'Tab') return;

        const modal = event.currentTarget;
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstFocusable) {
            lastFocusable.focus();
            event.preventDefault();
        } else if (!event.shiftKey && document.activeElement === lastFocusable) {
            firstFocusable.focus();
            event.preventDefault();
        }
    }

    /**
     * Update statistics in the intro section
     */
    updateStats() {
        const conceptsStat = document.querySelector('[data-stat="concepts"]');
        const demosStat = document.querySelector('[data-stat="demos"]');
        const exercisesStat = document.querySelector('[data-stat="exercises"]');

        if (conceptsStat) conceptsStat.textContent = this.concepts.length || 3;
        if (demosStat) demosStat.textContent = 6; // Fixed number of demos
        if (exercisesStat) exercisesStat.textContent = this.exercises.length || 15;
    }

    /**
     * Show error message to user
     */
    showErrorMessage(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = `Error: ${message}`;
        } else {
            console.error(message);
        }
    }

    /**
     * Utility function to shuffle array
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
     * Log user interaction for analytics
     */
    logInteraction(action, details = {}) {
        console.log('User interaction:', { action, details, timestamp: new Date().toISOString() });
        // In a real implementation, this would send data to analytics service
    }
}

// Initialize module when DOM is loaded
let electronicDevicesModule;

document.addEventListener('DOMContentLoaded', () => {
    electronicDevicesModule = new ElectronicDevicesModule();
});

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ElectronicDevicesModule;
}