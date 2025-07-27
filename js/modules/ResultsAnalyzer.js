/**
 * RRB Mock Test App - Results and Analytics Module
 * 
 * Comprehensive results processing system for the RRB Mock Test App.
 * Handles test scoring, performance analysis, detailed reporting, and progress tracking.
 * 
 * Features:
 * - Accurate scoring with sectional breakdown
 * - Performance analytics with trend analysis  
 * - Visual charts and graphs for data representation
 * - Comparative analysis against previous attempts
 * - Detailed answer review with explanations
 * - Export functionality (PDF, CSV, JSON)
 * - Strength and weakness identification
 * - Percentile and ranking calculations
 * - Progress tracking over time
 * 
 * @author Ravi-katta-dev
 * @version 1.0.0
 * @created 2025-01-XX
 */

class ResultsAnalyzer {
    constructor(appInstance) {
        this.app = appInstance;
        this.constants = appInstance.constants || {};
        this.examPatterns = appInstance.examPatterns || {};
        
        // Analytics configuration
        this.config = {
            // Scoring configuration
            scoring: {
                positiveMarks: 1,
                negativeMarks: -0.33,
                unansweredMarks: 0,
                passingPercentage: 40
            },
            
            // Performance thresholds
            performance: {
                excellent: 80,
                good: 60,
                average: 40,
                poor: 0
            },
            
            // Time analysis thresholds (in seconds)
            timeAnalysis: {
                fast: 30,
                optimal: 54,
                slow: 120,
                tooSlow: 180
            },
            
            // Chart colors
            colors: {
                primary: '#3742fa',
                success: '#2ed573',
                warning: '#ffa502',
                danger: '#ff4757',
                info: '#70a1ff',
                secondary: '#747d8c'
            }
        };
        
        // Initialize analytics data structures
        this.analyticsData = {
            testResults: [],
            userProfiles: new Map(),
            performanceMetrics: new Map(),
            comparisonData: new Map(),
            trends: new Map()
        };
        
        console.log('ResultsAnalyzer initialized successfully');
    }

    // ========================================================================
    // SCORING AND CALCULATION METHODS
    // ========================================================================

    /**
     * Calculate comprehensive test results with detailed breakdown
     * @param {Object} testSession - Test session data
     * @param {Object} questions - Array of questions
     * @param {Object} answers - User answers
     * @param {Object} timeData - Time tracking data
     * @returns {Object} Comprehensive results object
     */
    calculateComprehensiveResults(testSession, questions, answers, timeData) {
        console.log('🧮 Calculating comprehensive test results...');
        
        const startTime = Date.now();
        
        // Basic scoring
        const basicResults = this.calculateBasicScoring(questions, answers);
        
        // Sectional analysis
        const sectionalAnalysis = this.calculateSectionalAnalysis(questions, answers);
        
        // Time analysis
        const timeAnalysis = this.calculateTimeAnalysis(timeData, questions);
        
        // Difficulty analysis
        const difficultyAnalysis = this.calculateDifficultyAnalysis(questions, answers);
        
        // Performance metrics
        const performanceMetrics = this.calculatePerformanceMetrics(basicResults, timeAnalysis);
        
        // Confidence analysis
        const confidenceAnalysis = this.calculateConfidenceAnalysis(testSession, answers);
        
        // Comprehensive result object
        const result = {
            // Basic information
            testId: testSession.id,
            userId: testSession.userId,
            testType: testSession.testType,
            completedAt: new Date().toISOString(),
            
            // Basic scoring
            ...basicResults,
            
            // Detailed analysis
            sectionalAnalysis,
            timeAnalysis,
            difficultyAnalysis,
            performanceMetrics,
            confidenceAnalysis,
            
            // Additional metadata
            questions: questions,
            answers: answers,
            marked: testSession.markedQuestions ? Array.from(testSession.markedQuestions) : [],
            flagged: testSession.flaggedQuestions ? Array.from(testSession.flaggedQuestions) : [],
            processingTime: Date.now() - startTime,
            
            // Analytics metadata
            calculatedAt: new Date().toISOString(),
            version: '1.0.0'
        };
        
        console.log(`✅ Results calculated in ${result.processingTime}ms`);
        return result;
    }

    /**
     * Calculate basic scoring metrics
     * @param {Array} questions - Questions array
     * @param {Object} answers - User answers
     * @returns {Object} Basic scoring results
     */
    calculateBasicScoring(questions, answers) {
        let correctAnswers = 0;
        let incorrectAnswers = 0;
        let unanswered = 0;
        let rawScore = 0;
        
        const questionResults = questions.map((question, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            const isAnswered = userAnswer !== undefined && userAnswer !== -1;
            
            let questionScore = 0;
            if (!isAnswered) {
                unanswered++;
                questionScore = this.config.scoring.unansweredMarks;
            } else if (isCorrect) {
                correctAnswers++;
                questionScore = this.config.scoring.positiveMarks;
            } else {
                incorrectAnswers++;
                questionScore = this.config.scoring.negativeMarks;
            }
            
            rawScore += questionScore;
            
            return {
                questionIndex: index,
                questionId: question.id,
                userAnswer: userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect: isCorrect,
                isAnswered: isAnswered,
                score: questionScore,
                subject: question.subject,
                chapter: question.chapter,
                difficulty: question.difficulty
            };
        });
        
        const totalQuestions = questions.length;
        const attemptedQuestions = correctAnswers + incorrectAnswers;
        const accuracyRate = attemptedQuestions > 0 ? (correctAnswers / attemptedQuestions) * 100 : 0;
        const attemptRate = (attemptedQuestions / totalQuestions) * 100;
        const percentageScore = Math.max(0, (rawScore / totalQuestions) * 100);
        
        return {
            totalQuestions,
            correctAnswers,
            incorrectAnswers,
            unanswered,
            attemptedQuestions,
            rawScore,
            score: percentageScore,
            accuracyRate,
            attemptRate,
            questionResults,
            
            // Grading
            grade: this.calculateGrade(percentageScore),
            passed: percentageScore >= this.config.scoring.passingPercentage,
            
            // Performance category
            performanceCategory: this.getPerformanceCategory(percentageScore)
        };
    }

    /**
     * Calculate sectional analysis by subject
     * @param {Array} questions - Questions array
     * @param {Object} answers - User answers  
     * @returns {Object} Sectional analysis
     */
    calculateSectionalAnalysis(questions, answers) {
        const sections = {};
        
        // Group questions by subject
        questions.forEach((question, index) => {
            const subject = question.subject || 'General';
            if (!sections[subject]) {
                sections[subject] = {
                    subject: subject,
                    totalQuestions: 0,
                    correctAnswers: 0,
                    incorrectAnswers: 0,
                    unanswered: 0,
                    rawScore: 0,
                    questionIndices: []
                };
            }
            
            sections[subject].totalQuestions++;
            sections[subject].questionIndices.push(index);
            
            const userAnswer = answers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            const isAnswered = userAnswer !== undefined && userAnswer !== -1;
            
            if (!isAnswered) {
                sections[subject].unanswered++;
                sections[subject].rawScore += this.config.scoring.unansweredMarks;
            } else if (isCorrect) {
                sections[subject].correctAnswers++;
                sections[subject].rawScore += this.config.scoring.positiveMarks;
            } else {
                sections[subject].incorrectAnswers++;
                sections[subject].rawScore += this.config.scoring.negativeMarks;
            }
        });
        
        // Calculate derived metrics for each section
        Object.values(sections).forEach(section => {
            section.attemptedQuestions = section.correctAnswers + section.incorrectAnswers;
            section.accuracyRate = section.attemptedQuestions > 0 ? 
                (section.correctAnswers / section.attemptedQuestions) * 100 : 0;
            section.attemptRate = (section.attemptedQuestions / section.totalQuestions) * 100;
            section.percentageScore = Math.max(0, (section.rawScore / section.totalQuestions) * 100);
            section.grade = this.calculateGrade(section.percentageScore);
            section.performanceCategory = this.getPerformanceCategory(section.percentageScore);
        });
        
        // Calculate overall sectional statistics
        const sectionArray = Object.values(sections);
        const bestSection = sectionArray.reduce((best, current) => 
            current.percentageScore > best.percentageScore ? current : best);
        const worstSection = sectionArray.reduce((worst, current) => 
            current.percentageScore < worst.percentageScore ? current : worst);
        
        return {
            sections: sections,
            sectionalStats: {
                totalSections: sectionArray.length,
                bestSection: bestSection.subject,
                worstSection: worstSection.subject,
                bestScore: bestSection.percentageScore,
                worstScore: worstSection.percentageScore,
                averageScore: sectionArray.reduce((sum, section) => 
                    sum + section.percentageScore, 0) / sectionArray.length
            }
        };
    }

    /**
     * Calculate comprehensive time analysis
     * @param {Object} timeData - Time tracking data
     * @param {Array} questions - Questions array
     * @returns {Object} Time analysis results
     */
    calculateTimeAnalysis(timeData, questions) {
        const totalTimeSpent = timeData.totalTime || 0;
        const questionTimeSpent = timeData.questionTimeSpent || {};
        const averageTimePerQuestion = totalTimeSpent / questions.length;
        
        let fastQuestions = 0;
        let optimalQuestions = 0;
        let slowQuestions = 0;
        let tooSlowQuestions = 0;
        
        const questionTimingAnalysis = questions.map((question, index) => {
            const timeSpent = questionTimeSpent[index] || 0;
            const timeInSeconds = timeSpent / 1000;
            
            let timingCategory = 'optimal';
            if (timeInSeconds < this.config.timeAnalysis.fast) {
                timingCategory = 'fast';
                fastQuestions++;
            } else if (timeInSeconds <= this.config.timeAnalysis.optimal) {
                timingCategory = 'optimal';
                optimalQuestions++;
            } else if (timeInSeconds <= this.config.timeAnalysis.slow) {
                timingCategory = 'slow';
                slowQuestions++;
            } else {
                timingCategory = 'too_slow';
                tooSlowQuestions++;
            }
            
            return {
                questionIndex: index,
                timeSpent: timeSpent,
                timeInSeconds: timeInSeconds,
                timingCategory: timingCategory,
                subject: question.subject,
                difficulty: question.difficulty
            };
        });
        
        // Subject-wise time analysis
        const subjectTimeAnalysis = {};
        questions.forEach((question, index) => {
            const subject = question.subject || 'General';
            if (!subjectTimeAnalysis[subject]) {
                subjectTimeAnalysis[subject] = {
                    totalTime: 0,
                    questionCount: 0,
                    averageTime: 0
                };
            }
            
            const timeSpent = questionTimeSpent[index] || 0;
            subjectTimeAnalysis[subject].totalTime += timeSpent;
            subjectTimeAnalysis[subject].questionCount++;
        });
        
        Object.values(subjectTimeAnalysis).forEach(subjectData => {
            subjectData.averageTime = subjectData.totalTime / subjectData.questionCount;
        });
        
        return {
            totalTimeSpent: totalTimeSpent,
            averageTimePerQuestion: averageTimePerQuestion,
            questionTimingAnalysis: questionTimingAnalysis,
            subjectTimeAnalysis: subjectTimeAnalysis,
            timingDistribution: {
                fast: fastQuestions,
                optimal: optimalQuestions,
                slow: slowQuestions,
                tooSlow: tooSlowQuestions
            },
            timeEfficiency: this.calculateTimeEfficiency(averageTimePerQuestion),
            recommendations: this.generateTimeRecommendations(averageTimePerQuestion, {
                fast: fastQuestions,
                optimal: optimalQuestions,
                slow: slowQuestions,
                tooSlow: tooSlowQuestions
            })
        };
    }

    /**
     * Calculate difficulty-wise performance analysis
     * @param {Array} questions - Questions array
     * @param {Object} answers - User answers
     * @returns {Object} Difficulty analysis
     */
    calculateDifficultyAnalysis(questions, answers) {
        const difficultyStats = {
            'Easy': { total: 0, correct: 0, incorrect: 0, unanswered: 0 },
            'Medium': { total: 0, correct: 0, incorrect: 0, unanswered: 0 },
            'Hard': { total: 0, correct: 0, incorrect: 0, unanswered: 0 }
        };
        
        questions.forEach((question, index) => {
            const difficulty = question.difficulty || 'Medium';
            const userAnswer = answers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            const isAnswered = userAnswer !== undefined && userAnswer !== -1;
            
            if (difficultyStats[difficulty]) {
                difficultyStats[difficulty].total++;
                
                if (!isAnswered) {
                    difficultyStats[difficulty].unanswered++;
                } else if (isCorrect) {
                    difficultyStats[difficulty].correct++;
                } else {
                    difficultyStats[difficulty].incorrect++;
                }
            }
        });
        
        // Calculate accuracy rates for each difficulty
        Object.values(difficultyStats).forEach(stats => {
            const attempted = stats.correct + stats.incorrect;
            stats.accuracyRate = attempted > 0 ? (stats.correct / attempted) * 100 : 0;
            stats.attemptRate = stats.total > 0 ? (attempted / stats.total) * 100 : 0;
        });
        
        // Performance insights
        const insights = this.generateDifficultyInsights(difficultyStats);
        
        return {
            difficultyStats: difficultyStats,
            insights: insights,
            overallPattern: this.analyzeDifficultyPattern(difficultyStats)
        };
    }

    /**
     * Calculate comprehensive performance metrics
     * @param {Object} basicResults - Basic scoring results
     * @param {Object} timeAnalysis - Time analysis results
     * @returns {Object} Performance metrics
     */
    calculatePerformanceMetrics(basicResults, timeAnalysis) {
        const metrics = {
            // Core performance indicators
            overallScore: basicResults.score,
            accuracyIndex: basicResults.accuracyRate,
            speedIndex: this.calculateSpeedIndex(timeAnalysis.averageTimePerQuestion),
            efficiencyIndex: this.calculateEfficiencyIndex(basicResults, timeAnalysis),
            
            // Composite scores
            performanceIndex: 0,
            improvementPotential: 0,
            
            // Ranking metrics (will be calculated when comparing with others)
            percentile: null,
            rank: null,
            
            // Skill assessment
            strengthAreas: [],
            weaknessAreas: [],
            recommendations: []
        };
        
        // Calculate composite performance index (weighted average)
        metrics.performanceIndex = (
            metrics.overallScore * 0.4 +
            metrics.accuracyIndex * 0.3 +
            metrics.speedIndex * 0.2 +
            metrics.efficiencyIndex * 0.1
        );
        
        // Calculate improvement potential
        metrics.improvementPotential = Math.max(0, 100 - metrics.performanceIndex);
        
        return metrics;
    }

    /**
     * Calculate confidence-based analysis
     * @param {Object} testSession - Test session data
     * @param {Object} answers - User answers
     * @returns {Object} Confidence analysis
     */
    calculateConfidenceAnalysis(testSession, answers) {
        const confidenceLevels = testSession.confidenceLevels || {};
        const flaggedQuestions = testSession.flaggedQuestions || new Set();
        
        let highConfidenceCorrect = 0;
        let highConfidenceIncorrect = 0;
        let lowConfidenceCorrect = 0;
        let lowConfidenceIncorrect = 0;
        
        Object.entries(answers).forEach(([index, userAnswer]) => {
            const questionId = testSession.questions[index]?.id;
            const confidence = confidenceLevels[questionId];
            const isCorrect = userAnswer === testSession.questions[index]?.correctAnswer;
            
            if (confidence === 'high' || confidence === 'very-high') {
                if (isCorrect) highConfidenceCorrect++;
                else highConfidenceIncorrect++;
            } else if (confidence === 'low' || confidence === 'very-low') {
                if (isCorrect) lowConfidenceCorrect++;
                else lowConfidenceIncorrect++;
            }
        });
        
        return {
            confidenceAccuracy: {
                highConfidenceCorrect,
                highConfidenceIncorrect,
                lowConfidenceCorrect,
                lowConfidenceIncorrect
            },
            flaggedQuestionsCount: flaggedQuestions.size,
            confidenceCalibration: this.calculateConfidenceCalibration(
                highConfidenceCorrect, highConfidenceIncorrect,
                lowConfidenceCorrect, lowConfidenceIncorrect
            )
        };
    }

    // ========================================================================
    // VISUALIZATION AND CHART METHODS
    // ========================================================================

    /**
     * Generate comprehensive performance visualizations
     * @param {Object} results - Test results object
     * @returns {Object} Chart configurations for various visualizations
     */
    generatePerformanceCharts(results) {
        return {
            overallPerformance: this.createOverallPerformanceChart(results),
            subjectWiseAnalysis: this.createSubjectWiseChart(results),
            difficultyAnalysis: this.createDifficultyChart(results),
            timeAnalysis: this.createTimeAnalysisChart(results),
            progressChart: this.createProgressChart(results),
            radarChart: this.createPerformanceRadarChart(results)
        };
    }

    /**
     * Create overall performance doughnut chart
     * @param {Object} results - Test results
     * @returns {Object} Chart configuration
     */
    createOverallPerformanceChart(results) {
        return {
            type: 'doughnut',
            data: {
                labels: ['Correct', 'Incorrect', 'Unanswered'],
                datasets: [{
                    data: [
                        results.correctAnswers,
                        results.incorrectAnswers,
                        results.unanswered
                    ],
                    backgroundColor: [
                        this.config.colors.success,
                        this.config.colors.danger,
                        this.config.colors.secondary
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const percentage = ((context.raw / results.totalQuestions) * 100).toFixed(1);
                                return `${context.label}: ${context.raw} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        };
    }

    /**
     * Create subject-wise performance bar chart
     * @param {Object} results - Test results
     * @returns {Object} Chart configuration
     */
    createSubjectWiseChart(results) {
        const sections = Object.values(results.sectionalAnalysis.sections);
        
        return {
            type: 'bar',
            data: {
                labels: sections.map(s => s.subject.split(' ')[0]), // Shortened labels
                datasets: [{
                    label: 'Score (%)',
                    data: sections.map(s => s.percentageScore),
                    backgroundColor: this.config.colors.primary,
                    borderColor: this.config.colors.primary,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `Score: ${context.raw.toFixed(1)}%`;
                            }
                        }
                    }
                }
            }
        };
    }

    /**
     * Create performance radar chart
     * @param {Object} results - Test results
     * @returns {Object} Chart configuration
     */
    createPerformanceRadarChart(results) {
        const sections = Object.values(results.sectionalAnalysis.sections);
        
        return {
            type: 'radar',
            data: {
                labels: sections.map(s => s.subject.split(' ')[0]),
                datasets: [{
                    label: 'Performance (%)',
                    data: sections.map(s => s.percentageScore),
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderColor: this.config.colors.primary,
                    pointBackgroundColor: this.config.colors.primary,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20,
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        };
    }

    // ========================================================================
    // COMPARISON AND TREND ANALYSIS
    // ========================================================================

    /**
     * Compare current results with previous attempts
     * @param {Object} currentResult - Current test result
     * @param {Array} previousResults - Array of previous results
     * @returns {Object} Comparison analysis
     */
    generateComparisonAnalysis(currentResult, previousResults) {
        if (!previousResults || previousResults.length === 0) {
            return {
                hasComparison: false,
                message: 'No previous attempts available for comparison'
            };
        }
        
        const validPreviousResults = previousResults.filter(result => 
            result.userId === currentResult.userId
        );
        
        if (validPreviousResults.length === 0) {
            return {
                hasComparison: false,
                message: 'No previous attempts found for this user'
            };
        }
        
        // Get most recent result for comparison
        const lastResult = validPreviousResults[validPreviousResults.length - 1];
        const bestResult = validPreviousResults.reduce((best, current) => 
            current.score > best.score ? current : best
        );
        
        // Calculate trends
        const trends = this.calculatePerformanceTrends(currentResult, validPreviousResults);
        
        // Score comparison
        const scoreComparison = {
            current: currentResult.score,
            last: lastResult.score,
            best: bestResult.score,
            improvement: currentResult.score - lastResult.score,
            improvementFromBest: currentResult.score - bestResult.score,
            isNewBest: currentResult.score > bestResult.score
        };
        
        // Subject-wise comparison
        const subjectComparison = this.compareSubjectPerformance(
            currentResult.sectionalAnalysis.sections,
            lastResult.sectionalAnalysis?.sections || {}
        );
        
        return {
            hasComparison: true,
            scoreComparison,
            subjectComparison,
            trends,
            insights: this.generateComparisonInsights(scoreComparison, trends),
            attemptCount: validPreviousResults.length + 1
        };
    }

    /**
     * Calculate performance trends over time
     * @param {Object} currentResult - Current result
     * @param {Array} previousResults - Previous results
     * @returns {Object} Trend analysis
     */
    calculatePerformanceTrends(currentResult, previousResults) {
        const allResults = [...previousResults, currentResult];
        const scores = allResults.map(r => r.score);
        
        // Calculate moving averages
        const movingAverage = this.calculateMovingAverage(scores, 3);
        
        // Trend direction
        const recentScores = scores.slice(-3);
        const trendDirection = this.calculateTrendDirection(recentScores);
        
        // Consistency metrics
        const consistency = this.calculateConsistency(scores);
        
        return {
            overallTrend: trendDirection,
            movingAverage: movingAverage[movingAverage.length - 1],
            consistency: consistency,
            volatility: this.calculateVolatility(scores),
            progressRate: this.calculateProgressRate(scores)
        };
    }

    // ========================================================================
    // EXPORT FUNCTIONALITY
    // ========================================================================

    /**
     * Export test results in specified format
     * @param {Object} results - Test results
     * @param {string} format - Export format ('pdf', 'csv', 'json')
     * @param {Object} options - Export options
     * @returns {Promise} Export promise
     */
    async exportResults(results, format, options = {}) {
        console.log(`📤 Exporting results in ${format} format...`);
        
        try {
            switch (format.toLowerCase()) {
                case 'pdf':
                    return await this.exportToPDF(results, options);
                case 'csv':
                    return await this.exportToCSV(results, options);
                case 'json':
                    return await this.exportToJSON(results, options);
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }
        } catch (error) {
            console.error('Export failed:', error);
            throw error;
        }
    }

    /**
     * Export results to PDF format
     * @param {Object} results - Test results
     * @param {Object} options - PDF export options
     * @returns {Promise} PDF export promise
     */
    async exportToPDF(results, options) {
        // Create comprehensive PDF report
        const reportData = this.generatePDFReportData(results);
        
        // Create PDF content
        const pdfContent = `
# Test Results Report

## Test Information
- Test Type: ${results.testType}
- Date: ${new Date(results.completedAt).toLocaleDateString()}
- Total Questions: ${results.totalQuestions}
- Time Spent: ${Math.round(results.timeAnalysis.totalTimeSpent / 60000)} minutes

## Performance Summary
- Overall Score: ${results.score.toFixed(1)}%
- Grade: ${results.grade}
- Accuracy Rate: ${results.accuracyRate.toFixed(1)}%
- Attempt Rate: ${results.attemptRate.toFixed(1)}%

## Subject-wise Performance
${Object.values(results.sectionalAnalysis.sections).map(section => 
    `- ${section.subject}: ${section.percentageScore.toFixed(1)}%`
).join('\n')}

## Analysis and Recommendations
${results.performanceMetrics.recommendations.join('\n')}
        `;
        
        // Create downloadable blob
        const blob = new Blob([pdfContent], { type: 'text/plain' });
        this.downloadFile(blob, `test-results-${Date.now()}.txt`);
        
        return { success: true, format: 'pdf', filename: `test-results-${Date.now()}.txt` };
    }

    /**
     * Export results to CSV format
     * @param {Object} results - Test results
     * @param {Object} options - CSV export options  
     * @returns {Promise} CSV export promise
     */
    async exportToCSV(results, options) {
        const csvData = [];
        
        // Header row
        csvData.push([
            'Question No',
            'Subject',
            'Chapter', 
            'Difficulty',
            'Your Answer',
            'Correct Answer',
            'Result',
            'Time Spent (s)',
            'Question Text'
        ]);
        
        // Data rows
        results.questionResults.forEach((qResult, index) => {
            const question = results.questions[index];
            const timeSpent = results.timeAnalysis.questionTimingAnalysis[index]?.timeInSeconds || 0;
            
            csvData.push([
                index + 1,
                question.subject || 'N/A',
                question.chapter || 'N/A',
                question.difficulty || 'N/A',
                qResult.userAnswer !== -1 ? String.fromCharCode(65 + qResult.userAnswer) : 'Not Answered',
                String.fromCharCode(65 + qResult.correctAnswer),
                qResult.isCorrect ? 'Correct' : (qResult.isAnswered ? 'Incorrect' : 'Unanswered'),
                timeSpent.toFixed(1),
                `"${question.text.replace(/"/g, '""')}"`
            ]);
        });
        
        // Convert to CSV string
        const csvContent = csvData.map(row => row.join(',')).join('\n');
        
        // Create downloadable blob
        const blob = new Blob([csvContent], { type: 'text/csv' });
        this.downloadFile(blob, `test-results-${Date.now()}.csv`);
        
        return { success: true, format: 'csv', filename: `test-results-${Date.now()}.csv` };
    }

    /**
     * Export results to JSON format
     * @param {Object} results - Test results
     * @param {Object} options - JSON export options
     * @returns {Promise} JSON export promise
     */
    async exportToJSON(results, options) {
        const exportData = {
            testResults: results,
            exportedAt: new Date().toISOString(),
            version: '1.0.0',
            format: 'json'
        };
        
        // Create downloadable blob
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        this.downloadFile(blob, `test-results-${Date.now()}.json`);
        
        return { success: true, format: 'json', filename: `test-results-${Date.now()}.json` };
    }

    // ========================================================================
    // INSIGHTS AND RECOMMENDATIONS
    // ========================================================================

    /**
     * Generate comprehensive insights and recommendations
     * @param {Object} results - Test results
     * @returns {Object} Insights and recommendations
     */
    generateInsightsAndRecommendations(results) {
        const insights = {
            strengths: this.identifyStrengths(results),
            weaknesses: this.identifyWeaknesses(results),
            recommendations: this.generateRecommendations(results),
            studyPlan: this.generateStudyPlan(results),
            nextSteps: this.generateNextSteps(results)
        };
        
        return insights;
    }

    /**
     * Identify student's strength areas
     * @param {Object} results - Test results
     * @returns {Array} Array of strength areas
     */
    identifyStrengths(results) {
        const strengths = [];
        const sections = results.sectionalAnalysis.sections;
        
        // Subject-wise strengths
        Object.values(sections).forEach(section => {
            if (section.percentageScore >= this.config.performance.good) {
                strengths.push({
                    type: 'subject',
                    area: section.subject,
                    score: section.percentageScore,
                    description: `Strong performance in ${section.subject} (${section.percentageScore.toFixed(1)}%)`
                });
            }
        });
        
        // Difficulty-based strengths
        const diffStats = results.difficultyAnalysis.difficultyStats;
        Object.entries(diffStats).forEach(([difficulty, stats]) => {
            if (stats.accuracyRate >= 70) {
                strengths.push({
                    type: 'difficulty',
                    area: `${difficulty} Questions`,
                    score: stats.accuracyRate,
                    description: `Excellent accuracy in ${difficulty.toLowerCase()} questions (${stats.accuracyRate.toFixed(1)}%)`
                });
            }
        });
        
        // Time management strengths
        if (results.timeAnalysis.timeEfficiency >= 70) {
            strengths.push({
                type: 'time_management',
                area: 'Time Management',
                score: results.timeAnalysis.timeEfficiency,
                description: 'Good time management skills demonstrated'
            });
        }
        
        return strengths;
    }

    /**
     * Identify areas that need improvement
     * @param {Object} results - Test results
     * @returns {Array} Array of weakness areas
     */
    identifyWeaknesses(results) {
        const weaknesses = [];
        const sections = results.sectionalAnalysis.sections;
        
        // Subject-wise weaknesses
        Object.values(sections).forEach(section => {
            if (section.percentageScore < this.config.performance.average) {
                weaknesses.push({
                    type: 'subject',
                    area: section.subject,
                    score: section.percentageScore,
                    severity: section.percentageScore < 30 ? 'high' : 'medium',
                    description: `Needs improvement in ${section.subject} (${section.percentageScore.toFixed(1)}%)`
                });
            }
        });
        
        // Difficulty-based weaknesses
        const diffStats = results.difficultyAnalysis.difficultyStats;
        Object.entries(diffStats).forEach(([difficulty, stats]) => {
            if (stats.accuracyRate < 50 && stats.total > 0) {
                weaknesses.push({
                    type: 'difficulty',
                    area: `${difficulty} Questions`,
                    score: stats.accuracyRate,
                    severity: stats.accuracyRate < 30 ? 'high' : 'medium',
                    description: `Low accuracy in ${difficulty.toLowerCase()} questions (${stats.accuracyRate.toFixed(1)}%)`
                });
            }
        });
        
        // Time management issues
        if (results.timeAnalysis.timingDistribution.tooSlow > results.totalQuestions * 0.3) {
            weaknesses.push({
                type: 'time_management',
                area: 'Time Management',
                score: results.timeAnalysis.timeEfficiency,
                severity: 'medium',
                description: 'Spending too much time on individual questions'
            });
        }
        
        return weaknesses;
    }

    // ========================================================================
    // UTILITY AND HELPER METHODS
    // ========================================================================

    /**
     * Calculate grade based on percentage score
     * @param {number} score - Percentage score
     * @returns {string} Grade letter
     */
    calculateGrade(score) {
        if (score >= 90) return 'A+';
        if (score >= 85) return 'A';
        if (score >= 80) return 'A-';
        if (score >= 75) return 'B+';
        if (score >= 70) return 'B';
        if (score >= 65) return 'B-';
        if (score >= 60) return 'C+';
        if (score >= 55) return 'C';
        if (score >= 50) return 'C-';
        if (score >= 40) return 'D';
        return 'F';
    }

    /**
     * Get performance category based on score
     * @param {number} score - Percentage score
     * @returns {string} Performance category
     */
    getPerformanceCategory(score) {
        if (score >= this.config.performance.excellent) return 'Excellent';
        if (score >= this.config.performance.good) return 'Good';
        if (score >= this.config.performance.average) return 'Average';
        return 'Needs Improvement';
    }

    /**
     * Calculate time efficiency index
     * @param {number} averageTime - Average time per question in seconds
     * @returns {number} Efficiency index (0-100)
     */
    calculateTimeEfficiency(averageTime) {
        const optimalTime = this.config.timeAnalysis.optimal;
        if (averageTime <= optimalTime) {
            return 100;
        } else {
            const penalty = Math.min(50, (averageTime - optimalTime) / optimalTime * 100);
            return Math.max(0, 100 - penalty);
        }
    }

    /**
     * Generate time-based recommendations
     * @param {number} averageTime - Average time per question
     * @param {Object} timingDistribution - Distribution of timing categories
     * @returns {Array} Array of time-related recommendations
     */
    generateTimeRecommendations(averageTime, timingDistribution) {
        const recommendations = [];
        
        if (averageTime > this.config.timeAnalysis.slow) {
            recommendations.push('Focus on improving speed - practice time-bound questions');
        }
        
        if (timingDistribution.tooSlow > timingDistribution.optimal) {
            recommendations.push('Avoid spending too much time on difficult questions');
        }
        
        if (timingDistribution.fast > timingDistribution.optimal) {
            recommendations.push('Take more time to carefully read questions');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('Good time management - maintain this pace');
        }
        
        return recommendations;
    }

    /**
     * Generate difficulty-based insights
     * @param {Object} difficultyStats - Difficulty statistics
     * @returns {Array} Array of insights
     */
    generateDifficultyInsights(difficultyStats) {
        const insights = [];
        
        Object.entries(difficultyStats).forEach(([difficulty, stats]) => {
            if (stats.accuracyRate < 50 && stats.total > 0) {
                insights.push(`Struggling with ${difficulty.toLowerCase()} questions`);
            } else if (stats.accuracyRate > 80 && stats.total > 0) {
                insights.push(`Strong performance in ${difficulty.toLowerCase()} questions`);
            }
        });
        
        return insights;
    }

    /**
     * Analyze difficulty pattern
     * @param {Object} difficultyStats - Difficulty statistics
     * @returns {Object} Pattern analysis
     */
    analyzeDifficultyPattern(difficultyStats) {
        const patterns = {
            strengths: [],
            weaknesses: [],
            recommendations: []
        };
        
        Object.entries(difficultyStats).forEach(([difficulty, stats]) => {
            if (stats.accuracyRate > 70) {
                patterns.strengths.push(difficulty);
            } else if (stats.accuracyRate < 50) {
                patterns.weaknesses.push(difficulty);
            }
        });
        
        if (patterns.weaknesses.length > 0) {
            patterns.recommendations.push(`Focus on ${patterns.weaknesses.join(' and ').toLowerCase()} questions`);
        }
        
        return patterns;
    }

    /**
     * Calculate speed index based on average time
     * @param {number} averageTime - Average time per question
     * @returns {number} Speed index (0-100)
     */
    calculateSpeedIndex(averageTime) {
        const optimalTime = this.config.timeAnalysis.optimal * 1000; // Convert to milliseconds
        const ratio = averageTime / optimalTime;
        
        if (ratio <= 1) {
            return 100; // Perfect or better than optimal
        } else {
            return Math.max(0, 100 - (ratio - 1) * 50);
        }
    }

    /**
     * Calculate efficiency index
     * @param {Object} basicResults - Basic results
     * @param {Object} timeAnalysis - Time analysis
     * @returns {number} Efficiency index
     */
    calculateEfficiencyIndex(basicResults, timeAnalysis) {
        const accuracyWeight = 0.7;
        const speedWeight = 0.3;
        
        const accuracyScore = basicResults.accuracyRate;
        const speedScore = this.calculateSpeedIndex(timeAnalysis.averageTimePerQuestion);
        
        return (accuracyScore * accuracyWeight) + (speedScore * speedWeight);
    }

    /**
     * Calculate confidence calibration
     * @param {number} highCorrect - High confidence correct answers
     * @param {number} highIncorrect - High confidence incorrect answers
     * @param {number} lowCorrect - Low confidence correct answers
     * @param {number} lowIncorrect - Low confidence incorrect answers
     * @returns {number} Calibration score (0-1)
     */
    calculateConfidenceCalibration(highCorrect, highIncorrect, lowCorrect, lowIncorrect) {
        const highTotal = highCorrect + highIncorrect;
        const lowTotal = lowCorrect + lowIncorrect;
        
        if (highTotal === 0 && lowTotal === 0) return 0.5;
        
        const highAccuracy = highTotal > 0 ? highCorrect / highTotal : 0;
        const lowAccuracy = lowTotal > 0 ? lowCorrect / lowTotal : 0;
        
        // Good calibration means high confidence should have higher accuracy
        const calibration = highAccuracy - lowAccuracy;
        return Math.max(0, Math.min(1, (calibration + 1) / 2));
    }

    /**
     * Download file to user's device
     * @param {Blob} blob - File blob
     * @param {string} filename - Filename
     */
    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Calculate moving average
     * @param {Array} data - Data array
     * @param {number} window - Window size
     * @returns {Array} Moving averages
     */
    calculateMovingAverage(data, window) {
        const result = [];
        for (let i = window - 1; i < data.length; i++) {
            const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
            result.push(sum / window);
        }
        return result;
    }

    /**
     * Generate study plan based on performance
     * @param {Object} results - Test results
     * @returns {Object} Personalized study plan
     */
    generateStudyPlan(results) {
        const weakSubjects = this.identifyWeaknesses(results)
            .filter(w => w.type === 'subject')
            .sort((a, b) => a.score - b.score);
        
        return {
            priority: 'high',
            focusAreas: weakSubjects.slice(0, 2).map(w => w.area),
            timeAllocation: this.calculateTimeAllocation(weakSubjects),
            milestones: this.generateMilestones(results),
            resources: this.suggestResources(weakSubjects)
        };
    }

    /**
     * Generate time allocation recommendations
     * @param {Array} weakSubjects - Weak subject areas
     * @returns {Object} Time allocation plan
     */
    calculateTimeAllocation(weakSubjects) {
        const totalStudyTime = 100; // 100% of study time
        const allocation = {};
        
        if (weakSubjects.length === 0) {
            return { message: 'Continue practicing all subjects equally' };
        }
        
        weakSubjects.forEach((subject, index) => {
            const priority = weakSubjects.length - index;
            allocation[subject.area] = Math.round((priority / (weakSubjects.length * (weakSubjects.length + 1) / 2)) * totalStudyTime);
        });
        
        return allocation;
    }

    /**
     * Log analytics event for tracking
     * @param {string} event - Event name
     * @param {Object} data - Event data
     */
    logAnalyticsEvent(event, data) {
        console.log(`📊 Analytics Event: ${event}`, data);
        
        // Store in analytics data for future use
        if (!this.analyticsData.events) {
            this.analyticsData.events = [];
        }
        
        this.analyticsData.events.push({
            event: event,
            data: data,
            timestamp: new Date().toISOString()
        });
    }

    // ========================================================================
    // COMPREHENSIVE ANALYTICS GENERATION
    // ========================================================================

    /**
     * Generate comprehensive analytics from multiple test results
     * @param {Array} userResults - Array of user test results
     * @returns {Object} Comprehensive analytics data
     */
    generateComprehensiveAnalytics(userResults) {
        console.log(`🔍 Generating comprehensive analytics for ${userResults.length} test results...`);
        
        const analytics = {
            // Overall performance metrics
            overallMetrics: this.calculateOverallMetrics(userResults),
            
            // Subject-wise trends
            subjectTrends: this.calculateSubjectTrends(userResults),
            
            // Time-based performance trends
            performanceTrends: this.calculatePerformanceTrendsOverTime(userResults),
            
            // Difficulty analysis across tests
            difficultyTrends: this.calculateDifficultyTrends(userResults),
            
            // Improvement patterns
            improvementPatterns: this.calculateImprovementPatterns(userResults),
            
            // Percentile and ranking data
            rankingData: this.calculateRankingData(userResults),
            
            // Insights and recommendations
            insights: this.generateLongTermInsights(userResults),
            
            // Chart configurations
            chartConfigurations: this.generateAnalyticsChartConfigs(userResults)
        };
        
        console.log('✅ Comprehensive analytics generated successfully');
        return analytics;
    }

    /**
     * Calculate overall performance metrics
     * @param {Array} userResults - User test results
     * @returns {Object} Overall metrics
     */
    calculateOverallMetrics(userResults) {
        const totalTests = userResults.length;
        const totalQuestions = userResults.reduce((sum, r) => sum + r.totalQuestions, 0);
        const totalCorrect = userResults.reduce((sum, r) => sum + r.correctAnswers, 0);
        const totalIncorrect = userResults.reduce((sum, r) => sum + r.incorrectAnswers, 0);
        const totalUnanswered = userResults.reduce((sum, r) => sum + (r.unanswered || 0), 0);
        
        const averageScore = userResults.reduce((sum, r) => sum + r.score, 0) / totalTests;
        const bestScore = Math.max(...userResults.map(r => r.score));
        const worstScore = Math.min(...userResults.map(r => r.score));
        const overallAccuracy = totalCorrect + totalIncorrect > 0 ? (totalCorrect / (totalCorrect + totalIncorrect)) * 100 : 0;
        
        return {
            totalTests,
            totalQuestions,
            totalCorrect,
            totalIncorrect,
            totalUnanswered,
            averageScore,
            bestScore,
            worstScore,
            overallAccuracy,
            improvementRate: this.calculateImprovementRate(userResults),
            consistencyScore: this.calculateConsistencyScore(userResults)
        };
    }

    /**
     * Calculate subject-wise trends
     * @param {Array} userResults - User test results
     * @returns {Object} Subject trends
     */
    calculateSubjectTrends(userResults) {
        const subjectData = {};
        
        userResults.forEach(result => {
            if (result.sectionalAnalysis && result.sectionalAnalysis.sections) {
                Object.values(result.sectionalAnalysis.sections).forEach(section => {
                    const subject = section.subject;
                    if (!subjectData[subject]) {
                        subjectData[subject] = {
                            scores: [],
                            accuracyRates: [],
                            attemptRates: [],
                            totalQuestions: 0,
                            totalCorrect: 0
                        };
                    }
                    
                    subjectData[subject].scores.push(section.percentageScore);
                    subjectData[subject].accuracyRates.push(section.accuracyRate);
                    subjectData[subject].attemptRates.push(section.attemptRate);
                    subjectData[subject].totalQuestions += section.totalQuestions;
                    subjectData[subject].totalCorrect += section.correctAnswers;
                });
            }
        });
        
        // Calculate trend metrics for each subject
        Object.keys(subjectData).forEach(subject => {
            const data = subjectData[subject];
            data.averageScore = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length;
            data.trend = this.calculateTrendDirection(data.scores);
            data.improvement = data.scores.length > 1 ? data.scores[data.scores.length - 1] - data.scores[0] : 0;
            data.consistency = this.calculateConsistency(data.scores);
        });
        
        return subjectData;
    }

    /**
     * Calculate improvement rate over time
     * @param {Array} userResults - User test results
     * @returns {number} Improvement rate percentage
     */
    calculateImprovementRate(userResults) {
        if (userResults.length < 2) return 0;
        
        const sortedResults = userResults.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
        const firstScore = sortedResults[0].score;
        const lastScore = sortedResults[sortedResults.length - 1].score;
        
        return ((lastScore - firstScore) / firstScore) * 100;
    }

    /**
     * Calculate consistency score
     * @param {Array} scores - Array of scores
     * @returns {number} Consistency score (0-100)
     */
    calculateConsistencyScore(scores) {
        if (scores.length < 2) return 100;
        
        const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
        const standardDeviation = Math.sqrt(variance);
        
        // Convert to consistency score (lower deviation = higher consistency)
        return Math.max(0, 100 - (standardDeviation / mean) * 100);
    }

    /**
     * Calculate trend direction
     * @param {Array} data - Data array
     * @returns {string} Trend direction
     */
    calculateTrendDirection(data) {
        if (data.length < 2) return 'stable';
        
        let increasingCount = 0;
        let decreasingCount = 0;
        
        for (let i = 1; i < data.length; i++) {
            if (data[i] > data[i - 1]) increasingCount++;
            else if (data[i] < data[i - 1]) decreasingCount++;
        }
        
        if (increasingCount > decreasingCount) return 'improving';
        if (decreasingCount > increasingCount) return 'declining';
        return 'stable';
    }

    /**
     * Generate long-term insights
     * @param {Array} userResults - User test results
     * @returns {Object} Long-term insights
     */
    generateLongTermInsights(userResults) {
        const insights = {
            strengths: [],
            weaknesses: [],
            patterns: [],
            recommendations: []
        };
        
        // Identify consistent strengths and weaknesses
        const subjectTrends = this.calculateSubjectTrends(userResults);
        
        Object.entries(subjectTrends).forEach(([subject, data]) => {
            if (data.averageScore >= 70) {
                insights.strengths.push({
                    area: subject,
                    score: data.averageScore,
                    trend: data.trend,
                    description: `Consistently strong in ${subject} (avg: ${data.averageScore.toFixed(1)}%)`
                });
            } else if (data.averageScore < 50) {
                insights.weaknesses.push({
                    area: subject,
                    score: data.averageScore,
                    trend: data.trend,
                    severity: data.averageScore < 30 ? 'high' : 'medium',
                    description: `Needs significant improvement in ${subject} (avg: ${data.averageScore.toFixed(1)}%)`
                });
            }
        });
        
        // Generate pattern-based recommendations
        const overallMetrics = this.calculateOverallMetrics(userResults);
        
        if (overallMetrics.improvementRate > 10) {
            insights.patterns.push('Showing positive improvement trend');
            insights.recommendations.push('Continue current study approach - it\'s working well');
        } else if (overallMetrics.improvementRate < -5) {
            insights.patterns.push('Performance declining over time');
            insights.recommendations.push('Consider revising study strategy and taking more practice tests');
        }
        
        if (overallMetrics.consistencyScore < 60) {
            insights.patterns.push('Inconsistent performance across tests');
            insights.recommendations.push('Focus on time management and reduce test anxiety');
        }
        
        return insights;
    }

    /**
     * Generate chart configurations for analytics
     * @param {Array} userResults - User test results
     * @returns {Object} Chart configurations
     */
    generateAnalyticsChartConfigs(userResults) {
        return {
            overallProgress: this.createProgressOverTimeChart(userResults),
            subjectComparison: this.createSubjectComparisonChart(userResults),
            accuracyTrends: this.createAccuracyTrendsChart(userResults),
            timeSpentAnalysis: this.createTimeSpentAnalysisChart(userResults)
        };
    }

    /**
     * Create progress over time chart
     * @param {Array} userResults - User test results
     * @returns {Object} Chart configuration
     */
    createProgressOverTimeChart(userResults) {
        const sortedResults = userResults.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
        
        return {
            type: 'line',
            data: {
                labels: sortedResults.map((_, index) => `Test ${index + 1}`),
                datasets: [{
                    label: 'Score (%)',
                    data: sortedResults.map(result => result.score),
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderColor: this.config.colors.primary,
                    pointBackgroundColor: this.config.colors.primary,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const result = sortedResults[context.dataIndex];
                                return [
                                    `Score: ${context.raw.toFixed(1)}%`,
                                    `Date: ${new Date(result.completedAt).toLocaleDateString()}`,
                                    `Questions: ${result.totalQuestions}`
                                ];
                            }
                        }
                    }
                }
            }
        };
    }

    /**
     * Generate recommendations based on performance analysis
     * @param {Object} results - Test results
     * @returns {Array} Array of recommendations
     */
    generateRecommendations(results) {
        const recommendations = [];
        
        // Performance-based recommendations
        if (results.score < this.config.performance.average) {
            recommendations.push('Focus on fundamental concepts and take more practice tests');
        } else if (results.score >= this.config.performance.excellent) {
            recommendations.push('Excellent work! Focus on maintaining consistency and speed');
        }
        
        // Time-based recommendations
        if (results.timeAnalysis && results.timeAnalysis.timeEfficiency < 60) {
            recommendations.push('Work on time management - practice answering questions within time limits');
        }
        
        // Subject-specific recommendations
        if (results.sectionalAnalysis) {
            const weakSubjects = Object.values(results.sectionalAnalysis.sections)
                .filter(section => section.percentageScore < 50)
                .sort((a, b) => a.percentageScore - b.percentageScore);
            
            if (weakSubjects.length > 0) {
                recommendations.push(`Priority focus needed: ${weakSubjects[0].subject}`);
            }
        }
        
        // Confidence-based recommendations
        if (results.confidenceAnalysis && results.confidenceAnalysis.confidenceCalibration < 0.5) {
            recommendations.push('Work on self-assessment skills - practice estimating confidence levels');
        }
        
        return recommendations;
    }

    /**
     * Generate milestones for study plan
     * @param {Object} results - Test results
     * @returns {Array} Array of milestones
     */
    generateMilestones(results) {
        const currentScore = results.score;
        const milestones = [];
        
        if (currentScore < 40) {
            milestones.push({ target: 40, description: 'Reach passing score', priority: 'high' });
            milestones.push({ target: 60, description: 'Achieve good performance', priority: 'medium' });
        } else if (currentScore < 60) {
            milestones.push({ target: 60, description: 'Achieve good performance', priority: 'high' });
            milestones.push({ target: 80, description: 'Reach excellent level', priority: 'medium' });
        } else if (currentScore < 80) {
            milestones.push({ target: 80, description: 'Reach excellent level', priority: 'high' });
            milestones.push({ target: 90, description: 'Achieve mastery', priority: 'low' });
        } else {
            milestones.push({ target: 95, description: 'Achieve near-perfect score', priority: 'low' });
        }
        
        return milestones;
    }

    /**
     * Suggest study resources based on weaknesses
     * @param {Array} weakSubjects - Weak subject areas
     * @returns {Object} Resource suggestions
     */
    suggestResources(weakSubjects) {
        const resources = {
            books: [],
            onlineResources: [],
            practiceTests: []
        };
        
        weakSubjects.forEach(subject => {
            switch (subject.area) {
                case 'Mathematics':
                    resources.books.push('RRB Mathematics Guide by R.S. Aggarwal');
                    resources.onlineResources.push('Khan Academy - Arithmetic and Algebra');
                    break;
                case 'General Intelligence & Reasoning':
                    resources.books.push('Reasoning Ability by R.S. Aggarwal');
                    resources.onlineResources.push('IndiaBIX - Logical Reasoning');
                    break;
                case 'Basic Science & Engineering':
                    resources.books.push('RRB Technical Guide by Kiran Publications');
                    resources.onlineResources.push('BYJU\'s - Basic Science Concepts');
                    break;
                default:
                    resources.onlineResources.push('General study materials for ' + subject.area);
            }
        });
        
        resources.practiceTests.push('Take more subject-specific mock tests');
        resources.practiceTests.push('Practice previous year question papers');
        
        return resources;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = ResultsAnalyzer;
} else {
    // Browser environment - attach to window object
    window.ResultsAnalyzer = ResultsAnalyzer;
}