/**
 * RRB Mock Test App - Exam Pattern Configuration
 * 
 * This file contains exam patterns for intelligent test generation
 * supporting full mock test generation with official CBT structure.
 * 
 * @author Ravi-katta-dev
 * @version 1.0.0
 * @created 2025-01-XX
 */

// CBT Exam Pattern Framework for Intelligent Test Generation
const EXAM_PATTERNS = {
    // Official RRB Technician Grade-3 Signal CBT Pattern
    'CBT_Technician_GrI_Signal': {
        name: 'RRB Technician Grade-3 Signal CBT',
        description: 'Official Computer Based Test pattern for RRB Technician Grade-3 Signal',
        type: 'full_mock',
        totalQuestions: 100,
        timeLimit: 90, // minutes
        subjects: {
            'General Awareness': { 
                questions: 10, 
                weight: 0.10,
                timeAllocation: 9, // minutes
                description: 'Current affairs, geography, polity, economy, science & technology'
            },
            'General Intelligence & Reasoning': { 
                questions: 15, 
                weight: 0.15,
                timeAllocation: 13.5, // minutes
                description: 'Logical reasoning, analytical ability, pattern recognition'
            },
            'Basics of Computers and Applications': { 
                questions: 20, 
                weight: 0.20,
                timeAllocation: 18, // minutes
                description: 'Computer fundamentals, MS Office, internet, basic programming'
            },
            'Mathematics': { 
                questions: 20, 
                weight: 0.20,
                timeAllocation: 18, // minutes
                description: 'Arithmetic, algebra, geometry, mensuration, statistics'
            },
            'Basic Science & Engineering': { 
                questions: 35, 
                weight: 0.35,
                timeAllocation: 31.5, // minutes
                description: 'Physics, chemistry, electronics, electrical, signal & telecom'
            }
        },
        difficultyDistribution: {
            'Easy': 0.40,    // 40% easy questions
            'Medium': 0.45,  // 45% medium questions
            'Hard': 0.15     // 15% hard questions
        },
        markingScheme: {
            positive: 1,
            negative: 0.33, // 1/3 negative marking
            unanswered: 0
        },
        passingPercentage: 40,
        cutoffStrategy: 'overall', // 'overall' or 'sectional'
        shuffleQuestions: true,
        shuffleOptions: true,
        allowReview: true,
        allowBookmark: true,
        showTimer: true,
        warningTime: 15, // minutes before end
        autoSubmit: true
    },

    // Subject-wise Practice Test Pattern
    'SubjectWise_Standard': {
        name: 'Subject-wise Practice Test',
        description: 'Focused practice test for individual subjects',
        type: 'subject_wise',
        totalQuestions: 25,
        timeLimit: 22.5, // 54 seconds per question
        difficultyDistribution: {
            'Easy': 0.40,
            'Medium': 0.45,
            'Hard': 0.15
        },
        markingScheme: {
            positive: 1,
            negative: 0.33,
            unanswered: 0
        },
        requireAllChapters: true, // Ensure all chapters are covered
        passingPercentage: 50,
        shuffleQuestions: true,
        shuffleOptions: true,
        allowReview: true,
        allowBookmark: true,
        showTimer: true,
        chapterDistribution: 'equal' // 'equal' or 'weighted'
    },

    // Chapter-wise Practice Test Pattern
    'ChapterWise_Standard': {
        name: 'Chapter-wise Practice Test',
        description: 'Targeted practice for specific chapters',
        type: 'chapter_wise',
        totalQuestions: 20,
        timeLimit: 18, // 54 seconds per question
        difficultyDistribution: {
            'Easy': 0.40,
            'Medium': 0.45,
            'Hard': 0.15
        },
        markingScheme: {
            positive: 1,
            negative: 0.33,
            unanswered: 0
        },
        useDifficultyMix: true,
        passingPercentage: 60,
        shuffleQuestions: true,
        shuffleOptions: true,
        allowReview: true,
        allowBookmark: true,
        showTimer: true,
        focusMode: true // Hide other navigation during test
    },

    // Previous Year Questions Pattern
    'PYQ_Standard': {
        name: 'Previous Year Questions Test',
        description: 'Practice test using previous year questions',
        type: 'pyq',
        totalQuestions: 50,
        timeLimit: 45,
        difficultyDistribution: {
            'Easy': 0.30,
            'Medium': 0.50,
            'Hard': 0.20
        },
        markingScheme: {
            positive: 1,
            negative: 0.33,
            unanswered: 0
        },
        yearRange: [2018, 2024],
        prioritizeRecent: true,
        passingPercentage: 45,
        shuffleQuestions: true,
        shuffleOptions: false, // Keep original PYQ options order
        allowReview: true,
        allowBookmark: true,
        showTimer: true,
        showYearInfo: true
    },

    // Quick Practice Test Pattern
    'Quick_Practice': {
        name: 'Quick Practice Test',
        description: 'Short practice test for quick revision',
        type: 'quick_test',
        totalQuestions: 10,
        timeLimit: 9, // 54 seconds per question
        difficultyDistribution: {
            'Easy': 0.50,
            'Medium': 0.40,
            'Hard': 0.10
        },
        markingScheme: {
            positive: 1,
            negative: 0.25, // Reduced negative marking
            unanswered: 0
        },
        passingPercentage: 70,
        shuffleQuestions: true,
        shuffleOptions: true,
        allowReview: false, // Quick test mode
        allowBookmark: false,
        showTimer: true,
        instantFeedback: true
    },

    // Custom Test Pattern (Template)
    'Custom_Template': {
        name: 'Custom Test',
        description: 'Customizable test pattern',
        type: 'custom',
        totalQuestions: 25, // Default, can be overridden
        timeLimit: 22.5, // Default, can be overridden
        difficultyDistribution: {
            'Easy': 0.40,
            'Medium': 0.45,
            'Hard': 0.15
        },
        markingScheme: {
            positive: 1,
            negative: 0.33,
            unanswered: 0
        },
        passingPercentage: 50,
        shuffleQuestions: true,
        shuffleOptions: true,
        allowReview: true,
        allowBookmark: true,
        showTimer: true,
        customizable: true // Indicates this pattern can be modified
    },

    // Full Length Mock Test (Alternative Pattern)
    'Full_Mock_Extended': {
        name: 'Extended Mock Test',
        description: 'Comprehensive mock test with additional questions',
        type: 'full_mock',
        totalQuestions: 120,
        timeLimit: 108, // 54 seconds per question
        subjects: {
            'General Awareness': { 
                questions: 12, 
                weight: 0.10,
                timeAllocation: 10.8
            },
            'General Intelligence & Reasoning': { 
                questions: 18, 
                weight: 0.15,
                timeAllocation: 16.2
            },
            'Basics of Computers and Applications': { 
                questions: 24, 
                weight: 0.20,
                timeAllocation: 21.6
            },
            'Mathematics': { 
                questions: 24, 
                weight: 0.20,
                timeAllocation: 21.6
            },
            'Basic Science & Engineering': { 
                questions: 42, 
                weight: 0.35,
                timeAllocation: 37.8
            }
        },
        difficultyDistribution: {
            'Easy': 0.35,
            'Medium': 0.50,
            'Hard': 0.15
        },
        markingScheme: {
            positive: 1,
            negative: 0.33,
            unanswered: 0
        },
        passingPercentage: 40,
        shuffleQuestions: true,
        shuffleOptions: true,
        allowReview: true,
        allowBookmark: true,
        showTimer: true,
        warningTime: 15,
        autoSubmit: true
    }
};

// Test Generation Configuration
const TEST_GENERATION_CONFIG = {
    // Question Selection Strategies
    selectionStrategies: {
        RANDOM: 'random',
        WEIGHTED: 'weighted',
        DIFFICULTY_BASED: 'difficulty_based',
        CHAPTER_BALANCED: 'chapter_balanced',
        ADAPTIVE: 'adaptive'
    },

    // Difficulty Level Weights (for weighted selection)
    difficultyWeights: {
        'Easy': 1.0,
        'Medium': 1.2,
        'Hard': 1.5
    },

    // Chapter Coverage Requirements
    chapterCoverage: {
        MINIMUM_PER_CHAPTER: 1,
        MAXIMUM_PER_CHAPTER: null, // null = no limit
        BALANCED_DISTRIBUTION: true
    },

    // Question Validation Rules
    validationRules: {
        MIN_QUESTION_LENGTH: 10,
        MAX_QUESTION_LENGTH: 1000,
        MIN_OPTION_LENGTH: 1,
        MAX_OPTION_LENGTH: 200,
        REQUIRE_ALL_OPTIONS: true,
        REQUIRE_CORRECT_ANSWER: true,
        REQUIRE_EXPLANATION: false
    },

    // Test Quality Metrics
    qualityMetrics: {
        MIN_DIFFICULTY_VARIANCE: 0.1,
        MAX_SUBJECT_IMBALANCE: 0.2,
        MIN_CHAPTER_COVERAGE: 0.7,
        PREFERRED_PYQ_RATIO: 0.3
    }
};

// Utility functions for exam patterns
const ExamPatternUtils = {
    /**
     * Get all available exam patterns
     * @returns {Array} Array of pattern names
     */
    getAllPatterns() {
        return Object.keys(EXAM_PATTERNS);
    },

    /**
     * Get exam pattern by name
     * @param {string} patternName - Pattern name
     * @returns {Object} Exam pattern object
     */
    getPattern(patternName) {
        return EXAM_PATTERNS[patternName] || null;
    },

    /**
     * Get patterns by type
     * @param {string} type - Pattern type (full_mock, subject_wise, etc.)
     * @returns {Array} Array of matching patterns
     */
    getPatternsByType(type) {
        return Object.entries(EXAM_PATTERNS)
            .filter(([name, pattern]) => pattern.type === type)
            .map(([name, pattern]) => ({ name, ...pattern }));
    },

    /**
     * Calculate total time allocation for subjects
     * @param {Object} pattern - Exam pattern
     * @returns {Object} Time allocation per subject
     */
    calculateTimeAllocation(pattern) {
        if (!pattern.subjects) return {};

        const totalTime = pattern.timeLimit;
        const allocation = {};

        Object.entries(pattern.subjects).forEach(([subject, config]) => {
            allocation[subject] = totalTime * config.weight;
        });

        return allocation;
    },

    /**
     * Validate pattern configuration
     * @param {Object} pattern - Exam pattern to validate
     * @returns {Object} Validation result with errors array
     */
    validatePattern(pattern) {
        const errors = [];

        if (!pattern.totalQuestions || pattern.totalQuestions < 1) {
            errors.push('Total questions must be at least 1');
        }

        if (!pattern.timeLimit || pattern.timeLimit < 1) {
            errors.push('Time limit must be at least 1 minute');
        }

        if (pattern.subjects) {
            const totalSubjectQuestions = Object.values(pattern.subjects)
                .reduce((sum, config) => sum + config.questions, 0);
            
            if (totalSubjectQuestions !== pattern.totalQuestions) {
                errors.push('Subject questions sum does not match total questions');
            }

            const totalWeight = Object.values(pattern.subjects)
                .reduce((sum, config) => sum + config.weight, 0);
            
            if (Math.abs(totalWeight - 1.0) > 0.01) {
                errors.push('Subject weights must sum to 1.0');
            }
        }

        if (pattern.difficultyDistribution) {
            const totalDifficulty = Object.values(pattern.difficultyDistribution)
                .reduce((sum, weight) => sum + weight, 0);
            
            if (Math.abs(totalDifficulty - 1.0) > 0.01) {
                errors.push('Difficulty distribution must sum to 1.0');
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    },

    /**
     * Create a custom pattern based on template
     * @param {Object} customConfig - Custom configuration
     * @returns {Object} Custom exam pattern
     */
    createCustomPattern(customConfig) {
        const template = { ...EXAM_PATTERNS.Custom_Template };
        return { ...template, ...customConfig };
    },

    /**
     * Get recommended pattern for given criteria
     * @param {Object} criteria - Selection criteria
     * @returns {string} Recommended pattern name
     */
    getRecommendedPattern(criteria) {
        const { timeAvailable, subject, difficulty, testType } = criteria;

        if (testType === 'quick' || timeAvailable < 15) {
            return 'Quick_Practice';
        }

        if (subject && testType === 'subject_wise') {
            return 'SubjectWise_Standard';
        }

        if (testType === 'chapter_wise') {
            return 'ChapterWise_Standard';
        }

        if (testType === 'pyq') {
            return 'PYQ_Standard';
        }

        if (timeAvailable >= 90) {
            return 'CBT_Technician_GrI_Signal';
        }

        return 'SubjectWise_Standard';
    },

    /**
     * Calculate expected completion time
     * @param {Object} pattern - Exam pattern
     * @param {number} userSpeed - User's average time per question (optional)
     * @returns {number} Expected completion time in minutes
     */
    calculateExpectedTime(pattern, userSpeed = null) {
        const standardTimePerQuestion = 0.9; // 54 seconds
        const timePerQuestion = userSpeed || standardTimePerQuestion;
        return pattern.totalQuestions * timePerQuestion;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        EXAM_PATTERNS,
        TEST_GENERATION_CONFIG,
        ExamPatternUtils
    };
} else {
    // Browser environment - attach to window object
    window.MockTestExamPatterns = {
        EXAM_PATTERNS,
        TEST_GENERATION_CONFIG,
        ExamPatternUtils
    };
}