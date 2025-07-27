/**
 * RRB Mock Test App - Application Constants and Configuration
 * 
 * This file contains all application-wide constants, configuration settings,
 * scoring parameters, and question patterns for the RRB Technician Grade-3 Signal Mock Test App.
 * 
 * @author Ravi-katta-dev
 * @version 1.0.0
 * @created 2025-01-XX
 */

// Application Configuration
const APP_CONFIG = {
    // Application Metadata
    APP_NAME: 'RRB Technician Grade-3 Signal Mock Test',
    APP_VERSION: '1.0.0',
    APP_AUTHOR: 'Ravi-katta-dev',
    
    // Environment Settings
    ENVIRONMENT: 'production',
    DEBUG_MODE: false,
    
    // Storage Configuration
    STORAGE_PREFIX: 'mockTest',
    AUTO_SAVE_INTERVAL: 30000, // 30 seconds
    DATA_RETENTION_DAYS: 365,
    
    // UI Configuration
    DEFAULT_THEME: 'light',
    AVAILABLE_THEMES: ['light', 'dark', 'blue'],
    KEYBOARD_SHORTCUTS_ENABLED: true,
    
    // Feature Flags
    FEATURES: {
        PDF_UPLOAD: true,
        ADVANCED_ANALYTICS: true,
        EXPORT_RESULTS: true,
        STUDY_MATERIALS: true,
        MOCK_TEST_BUILDER: true,
        PERFORMANCE_TRACKING: true
    }
};

// Test Configuration Constants
const TEST_CONFIG = {
    // Question Limits
    MIN_QUESTIONS: 10,
    MAX_QUESTIONS: 100,
    DEFAULT_QUESTIONS: 25,
    
    // Time Limits (in minutes)
    MIN_TIME_LIMIT: 10,
    MAX_TIME_LIMIT: 90,
    DEFAULT_TIME_LIMIT: 22.5,
    TIME_PER_QUESTION: 0.9, // 54 seconds per question
    
    // Test Types
    TEST_TYPES: {
        FULL_MOCK: 'full_mock',
        SUBJECT_WISE: 'subject_wise',
        CHAPTER_WISE: 'chapter_wise',
        CUSTOM: 'custom',
        PYQ: 'previous_year',
        QUICK_TEST: 'quick_test'
    },
    
    // Difficulty Levels
    DIFFICULTY_LEVELS: {
        EASY: 'Easy',
        MEDIUM: 'Medium',
        HARD: 'Hard'
    },
    
    // Default Difficulty Distribution
    DEFAULT_DIFFICULTY_DISTRIBUTION: {
        Easy: 0.40,    // 40% easy questions
        Medium: 0.45,  // 45% medium questions
        Hard: 0.15     // 15% hard questions
    }
};

// Scoring Configuration
const SCORING_CONFIG = {
    // Marking Scheme
    POSITIVE_MARKS: 1,
    NEGATIVE_MARKS: -0.33, // 1/3 negative marking
    UNANSWERED_MARKS: 0,
    
    // Performance Thresholds
    PASSING_PERCENTAGE: 40,
    GOOD_PERFORMANCE: 60,
    EXCELLENT_PERFORMANCE: 80,
    
    // Score Categories
    SCORE_CATEGORIES: {
        POOR: { min: 0, max: 39, label: 'Needs Improvement', color: '#ff4757' },
        AVERAGE: { min: 40, max: 59, label: 'Average', color: '#ffa502' },
        GOOD: { min: 60, max: 79, label: 'Good', color: '#3742fa' },
        EXCELLENT: { min: 80, max: 100, label: 'Excellent', color: '#2ed573' }
    },
    
    // Confidence Levels
    CONFIDENCE_LEVELS: {
        LOW: 'low',
        MEDIUM: 'medium',
        HIGH: 'high'
    }
};

// Question Pattern Configuration
const QUESTION_PATTERNS = {
    // Question Types
    QUESTION_TYPES: {
        MCQ: 'multiple_choice',
        NUMERICAL: 'numerical',
        ASSERTION_REASON: 'assertion_reason',
        MATCH_FOLLOWING: 'match_following'
    },
    
    // Question Format Validation
    FORMAT_PATTERNS: {
        // Pattern 1: Q1. Question text? A) option B) option C) option D) option
        PATTERN_1: /Q\d+\.\s*(.+?)\?\s*A\)\s*(.+?)\s*B\)\s*(.+?)\s*C\)\s*(.+?)\s*D\)\s*(.+?)(?=\s*Q\d+\.|\s*$)/gs,
        
        // Pattern 2: Question 1: Question text? A) option B) option C) option D) option
        PATTERN_2: /Question\s+\d+:\s*(.+?)\?\s*A\)\s*(.+?)\s*B\)\s*(.+?)\s*C\)\s*(.+?)\s*D\)\s*(.+?)(?=\s*Question\s+\d+:|\s*$)/gs,
        
        // Pattern 3: 1. Question text? (a) option (b) option (c) option (d) option
        PATTERN_3: /\d+\.\s*(.+?)\?\s*\(a\)\s*(.+?)\s*\(b\)\s*(.+?)\s*\(c\)\s*(.+?)\s*\(d\)\s*(.+?)(?=\s*\d+\.|\s*$)/gs,
        
        // Pattern 4: Q. Question text? 1) option 2) option 3) option 4) option
        PATTERN_4: /Q\.\s*(.+?)\?\s*1\)\s*(.+?)\s*2\)\s*(.+?)\s*3\)\s*(.+?)\s*4\)\s*(.+?)(?=\s*Q\.|\s*$)/gs
    },
    
    // Answer Key Patterns
    ANSWER_PATTERNS: {
        SINGLE_LETTER: /[A-D]/,
        WITH_PARENTHESES: /\([A-D]\)/,
        WITH_NUMBER: /[1-4]/,
        WITH_OPTION: /option\s*[A-D]/i
    }
};

// PDF Configuration
const PDF_CONFIG = {
    // File Constraints
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    ALLOWED_EXTENSIONS: ['.pdf'],
    SUPPORTED_MIME_TYPES: ['application/pdf'],
    
    // Processing Configuration
    MAX_PAGES: 500,
    MIN_QUESTIONS_PER_UPLOAD: 5,
    MAX_QUESTIONS_PER_UPLOAD: 500,
    
    // Extraction Settings
    EXTRACTION_CONFIDENCE_THRESHOLD: 0.7,
    MIN_QUESTION_LENGTH: 10,
    MAX_QUESTION_LENGTH: 1000,
    MIN_OPTION_LENGTH: 1,
    MAX_OPTION_LENGTH: 200
};

// Analytics Configuration
const ANALYTICS_CONFIG = {
    // Chart Colors
    CHART_COLORS: {
        PRIMARY: '#3742fa',
        SUCCESS: '#2ed573',
        WARNING: '#ffa502',
        DANGER: '#ff4757',
        INFO: '#70a1ff',
        SECONDARY: '#747d8c'
    },
    
    // Performance Metrics
    METRICS: {
        ACCURACY: 'accuracy',
        SPEED: 'speed',
        CONSISTENCY: 'consistency',
        IMPROVEMENT: 'improvement',
        SUBJECT_STRENGTH: 'subject_strength',
        WEAK_AREAS: 'weak_areas'
    },
    
    // Time Analysis
    TIME_ANALYSIS: {
        FAST_THRESHOLD: 30, // seconds
        OPTIMAL_THRESHOLD: 54, // seconds
        SLOW_THRESHOLD: 120 // seconds
    }
};

// UI Constants
const UI_CONSTANTS = {
    // Pagination
    QUESTIONS_PER_PAGE: 20,
    RESULTS_PER_PAGE: 10,
    
    // Animation Durations
    TRANSITION_DURATION: 300,
    FADE_DURATION: 200,
    
    // Notification Settings
    NOTIFICATION_DURATION: 3000,
    ERROR_NOTIFICATION_DURATION: 5000,
    
    // Keyboard Shortcuts
    KEYBOARD_SHORTCUTS: {
        NEXT_QUESTION: 'ArrowRight',
        PREVIOUS_QUESTION: 'ArrowLeft',
        MARK_REVIEW: 'KeyM',
        CLEAR_RESPONSE: 'KeyC',
        SUBMIT_TEST: 'KeyS',
        TOGGLE_PALETTE: 'KeyP'
    },
    
    // Responsive Breakpoints
    BREAKPOINTS: {
        MOBILE: 768,
        TABLET: 1024,
        DESKTOP: 1200
    }
};

// Error Messages
const ERROR_MESSAGES = {
    // File Upload Errors
    FILE_TOO_LARGE: 'File size exceeds the maximum limit of 50MB',
    INVALID_FILE_TYPE: 'Please upload a valid PDF file',
    UPLOAD_FAILED: 'Failed to upload file. Please try again.',
    
    // Question Validation Errors
    INVALID_QUESTION: 'Question text is required and must be between 10-1000 characters',
    INVALID_OPTIONS: 'All four options are required and must be between 1-200 characters',
    INVALID_ANSWER: 'Please select a valid answer (A, B, C, or D)',
    
    // Test Errors
    NO_QUESTIONS_AVAILABLE: 'No questions available for the selected criteria',
    TEST_ALREADY_STARTED: 'Test has already been started',
    TEST_TIME_EXPIRED: 'Test time has expired',
    
    // General Errors
    STORAGE_QUOTA_EXCEEDED: 'Storage quota exceeded. Please clear some data.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNEXPECTED_ERROR: 'An unexpected error occurred. Please try again.'
};

// Success Messages
const SUCCESS_MESSAGES = {
    QUESTION_ADDED: 'Question added successfully',
    QUESTION_UPDATED: 'Question updated successfully',
    QUESTION_DELETED: 'Question deleted successfully',
    TEST_SUBMITTED: 'Test submitted successfully',
    PROFILE_UPDATED: 'Profile updated successfully',
    DATA_EXPORTED: 'Data exported successfully',
    SETTINGS_SAVED: 'Settings saved successfully'
};

// Local Storage Keys
const STORAGE_KEYS = {
    USERS: 'mockTestUsers',
    QUESTIONS: 'mockTestQuestions',
    TEST_RESULTS: 'mockTestResults',
    UPLOADED_PDFS: 'uploadedPDFs',
    DRAFT_TESTS: 'draftMockTests',
    AVAILABLE_TESTS: 'availableMockTests',
    USER_PREFERENCES: 'userPreferences',
    APP_SETTINGS: 'appSettings',
    ANALYTICS_DATA: 'analyticsData'
};

// API Endpoints (for future server integration)
const API_ENDPOINTS = {
    BASE_URL: '',
    QUESTIONS: '/api/questions',
    TESTS: '/api/tests',
    RESULTS: '/api/results',
    ANALYTICS: '/api/analytics',
    UPLOAD: '/api/upload',
    EXPORT: '/api/export'
};

// Export all constants for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        APP_CONFIG,
        TEST_CONFIG,
        SCORING_CONFIG,
        QUESTION_PATTERNS,
        PDF_CONFIG,
        ANALYTICS_CONFIG,
        UI_CONSTANTS,
        ERROR_MESSAGES,
        SUCCESS_MESSAGES,
        STORAGE_KEYS,
        API_ENDPOINTS
    };
} else {
    // Browser environment - attach to window object
    window.MockTestConstants = {
        APP_CONFIG,
        TEST_CONFIG,
        SCORING_CONFIG,
        QUESTION_PATTERNS,
        PDF_CONFIG,
        ANALYTICS_CONFIG,
        UI_CONSTANTS,
        ERROR_MESSAGES,
        SUCCESS_MESSAGES,
        STORAGE_KEYS,
        API_ENDPOINTS
    };
}