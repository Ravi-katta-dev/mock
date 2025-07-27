/**
 * Results Analyzer Module
 * Provides comprehensive analytics and reporting functionality for test results
 */

class ResultsAnalyzer {
    constructor() {
        this.initialized = false;
        this.chartInstances = new Map();
        this.analyticsData = {
            testHistory: [],
            subjectPerformance: {},
            timeAnalytics: {},
            progressTracking: []
        };
    }

    /**
     * Initialize the Results Analyzer module
     */
    init() {
        if (this.initialized) return;
        
        console.log('Initializing Results Analyzer module...');
        this.loadStoredData();
        this.setupAnalyticsEventListeners();
        this.initialized = true;
        console.log('Results Analyzer module initialized successfully');
    }

    /**
     * Load stored analytics data from localStorage
     */
    loadStoredData() {
        try {
            const storedAnalytics = localStorage.getItem('analyticsData');
            if (storedAnalytics) {
                this.analyticsData = { ...this.analyticsData, ...JSON.parse(storedAnalytics) };
            }
        } catch (error) {
            console.warn('Failed to load stored analytics data:', error);
        }
    }

    /**
     * Save analytics data to localStorage
     */
    saveAnalyticsData() {
        try {
            localStorage.setItem('analyticsData', JSON.stringify(this.analyticsData));
        } catch (error) {
            console.warn('Failed to save analytics data:', error);
        }
    }

    /**
     * Process and store test results for analytics
     * @param {Object} testResult - The completed test result
     */
    processTestResult(testResult) {
        if (!testResult) return;

        // Add to test history
        this.analyticsData.testHistory.push({
            id: testResult.id || Date.now(),
            date: testResult.date || new Date().toISOString(),
            type: testResult.type || 'Unknown',
            score: testResult.score || 0,
            totalQuestions: testResult.totalQuestions || 0,
            correctAnswers: testResult.correctAnswers || 0,
            timeSpent: testResult.timeSpent || 0,
            subjects: testResult.subjects || {}
        });

        // Update subject performance
        this.updateSubjectPerformance(testResult);

        // Update time analytics
        this.updateTimeAnalytics(testResult);

        // Update progress tracking
        this.updateProgressTracking(testResult);

        // Save to localStorage
        this.saveAnalyticsData();

        console.log('Test result processed for analytics:', testResult.id);
    }

    /**
     * Update subject-wise performance analytics
     * @param {Object} testResult - The test result
     */
    updateSubjectPerformance(testResult) {
        if (!testResult.subjects) return;

        Object.entries(testResult.subjects).forEach(([subject, data]) => {
            if (!this.analyticsData.subjectPerformance[subject]) {
                this.analyticsData.subjectPerformance[subject] = {
                    totalTests: 0,
                    totalQuestions: 0,
                    correctAnswers: 0,
                    averageScore: 0,
                    bestScore: 0,
                    lastTestDate: null
                };
            }

            const subjectStats = this.analyticsData.subjectPerformance[subject];
            subjectStats.totalTests++;
            subjectStats.totalQuestions += data.total || 0;
            subjectStats.correctAnswers += data.correct || 0;
            subjectStats.lastTestDate = testResult.date;

            const currentScore = data.total > 0 ? (data.correct / data.total) * 100 : 0;
            subjectStats.bestScore = Math.max(subjectStats.bestScore, currentScore);
            subjectStats.averageScore = subjectStats.totalQuestions > 0 
                ? (subjectStats.correctAnswers / subjectStats.totalQuestions) * 100 
                : 0;
        });
    }

    /**
     * Update time-based analytics
     * @param {Object} testResult - The test result
     */
    updateTimeAnalytics(testResult) {
        const timeData = {
            date: testResult.date,
            totalTime: testResult.timeSpent || 0,
            questionsCount: testResult.totalQuestions || 0,
            averageTimePerQuestion: testResult.totalQuestions > 0 
                ? (testResult.timeSpent || 0) / testResult.totalQuestions 
                : 0
        };

        this.analyticsData.timeAnalytics[testResult.id] = timeData;
    }

    /**
     * Update progress tracking data
     * @param {Object} testResult - The test result
     */
    updateProgressTracking(testResult) {
        this.analyticsData.progressTracking.push({
            date: testResult.date,
            score: testResult.score || 0,
            type: testResult.type || 'Unknown',
            trend: this.calculateTrend(testResult.score || 0)
        });

        // Keep only last 50 progress points
        if (this.analyticsData.progressTracking.length > 50) {
            this.analyticsData.progressTracking = this.analyticsData.progressTracking.slice(-50);
        }
    }

    /**
     * Calculate performance trend
     * @param {number} currentScore - Current test score
     * @returns {string} - Trend indicator
     */
    calculateTrend(currentScore) {
        const recent = this.analyticsData.progressTracking.slice(-5);
        if (recent.length < 2) return 'stable';

        const averageRecent = recent.reduce((sum, item) => sum + item.score, 0) / recent.length;
        
        if (currentScore > averageRecent + 5) return 'improving';
        if (currentScore < averageRecent - 5) return 'declining';
        return 'stable';
    }

    /**
     * Generate comprehensive analytics report
     * @returns {Object} - Analytics report
     */
    generateAnalyticsReport() {
        const report = {
            overview: this.getOverviewStats(),
            subjectAnalysis: this.getSubjectAnalysis(),
            timeAnalysis: this.getTimeAnalysis(),
            progressAnalysis: this.getProgressAnalysis(),
            recommendations: this.generateRecommendations()
        };

        console.log('Analytics report generated');
        return report;
    }

    /**
     * Get overview statistics
     * @returns {Object} - Overview stats
     */
    getOverviewStats() {
        const history = this.analyticsData.testHistory;
        if (history.length === 0) return null;

        const totalTests = history.length;
        const averageScore = history.reduce((sum, test) => sum + test.score, 0) / totalTests;
        const bestScore = Math.max(...history.map(test => test.score));
        const totalTimeSpent = history.reduce((sum, test) => sum + test.timeSpent, 0);

        return {
            totalTests,
            averageScore: Math.round(averageScore * 100) / 100,
            bestScore,
            totalTimeSpent,
            lastTestDate: history[history.length - 1].date
        };
    }

    /**
     * Get subject-wise analysis
     * @returns {Object} - Subject analysis
     */
    getSubjectAnalysis() {
        return this.analyticsData.subjectPerformance;
    }

    /**
     * Get time-based analysis
     * @returns {Object} - Time analysis
     */
    getTimeAnalysis() {
        const timeData = Object.values(this.analyticsData.timeAnalytics);
        if (timeData.length === 0) return null;

        const averageTimePerQuestion = timeData.reduce((sum, data) => sum + data.averageTimePerQuestion, 0) / timeData.length;
        const totalTime = timeData.reduce((sum, data) => sum + data.totalTime, 0);

        return {
            averageTimePerQuestion: Math.round(averageTimePerQuestion * 100) / 100,
            totalTime,
            testCount: timeData.length
        };
    }

    /**
     * Get progress analysis
     * @returns {Object} - Progress analysis
     */
    getProgressAnalysis() {
        const progress = this.analyticsData.progressTracking;
        if (progress.length === 0) return null;

        const recent = progress.slice(-10);
        const older = progress.slice(0, -10);

        const recentAverage = recent.reduce((sum, item) => sum + item.score, 0) / recent.length;
        const olderAverage = older.length > 0 ? older.reduce((sum, item) => sum + item.score, 0) / older.length : recentAverage;

        return {
            currentTrend: recent.length > 0 ? recent[recent.length - 1].trend : 'stable',
            improvement: recentAverage - olderAverage,
            recentAverage: Math.round(recentAverage * 100) / 100,
            totalProgress: progress.length
        };
    }

    /**
     * Generate personalized recommendations
     * @returns {Array} - Array of recommendations
     */
    generateRecommendations() {
        const recommendations = [];
        const subjectPerformance = this.analyticsData.subjectPerformance;

        // Subject-based recommendations
        Object.entries(subjectPerformance).forEach(([subject, stats]) => {
            if (stats.averageScore < 60) {
                recommendations.push({
                    type: 'improvement',
                    subject,
                    message: `Focus more on ${subject} - current average: ${Math.round(stats.averageScore)}%`,
                    priority: 'high'
                });
            } else if (stats.averageScore > 80) {
                recommendations.push({
                    type: 'strength',
                    subject,
                    message: `Great performance in ${subject}! Keep it up.`,
                    priority: 'low'
                });
            }
        });

        // Progress-based recommendations
        const progressAnalysis = this.getProgressAnalysis();
        if (progressAnalysis && progressAnalysis.currentTrend === 'declining') {
            recommendations.push({
                type: 'warning',
                message: 'Your recent performance shows a declining trend. Consider reviewing your study strategy.',
                priority: 'high'
            });
        }

        return recommendations;
    }

    /**
     * Setup event listeners for analytics functionality
     */
    setupAnalyticsEventListeners() {
        // Listen for test completion events
        document.addEventListener('testCompleted', (event) => {
            this.processTestResult(event.detail);
        });

        // Listen for analytics view requests
        document.addEventListener('showAnalytics', () => {
            this.displayAnalytics();
        });
    }

    /**
     * Display analytics in the UI
     */
    displayAnalytics() {
        const report = this.generateAnalyticsReport();
        
        // Trigger custom event with analytics data
        document.dispatchEvent(new CustomEvent('analyticsGenerated', {
            detail: report
        }));

        console.log('Analytics displayed');
    }

    /**
     * Export analytics data
     * @param {string} format - Export format ('json', 'csv')
     * @returns {string} - Exported data
     */
    exportAnalytics(format = 'json') {
        const report = this.generateAnalyticsReport();
        
        if (format === 'json') {
            return JSON.stringify(report, null, 2);
        } else if (format === 'csv') {
            // Simple CSV export for test history
            const headers = ['Date', 'Type', 'Score', 'Total Questions', 'Correct Answers', 'Time Spent'];
            const rows = this.analyticsData.testHistory.map(test => [
                test.date,
                test.type,
                test.score,
                test.totalQuestions,
                test.correctAnswers,
                test.timeSpent
            ]);
            
            return [headers, ...rows].map(row => row.join(',')).join('\n');
        }
        
        return '';
    }

    /**
     * Clear all analytics data
     */
    clearAnalytics() {
        this.analyticsData = {
            testHistory: [],
            subjectPerformance: {},
            timeAnalytics: {},
            progressTracking: []
        };
        
        localStorage.removeItem('analyticsData');
        console.log('Analytics data cleared');
    }
}

// Create global instance
window.ResultsAnalyzer = new ResultsAnalyzer();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.ResultsAnalyzer.init();
    });
} else {
    window.ResultsAnalyzer.init();
}

console.log('ResultsAnalyzer module loaded successfully');