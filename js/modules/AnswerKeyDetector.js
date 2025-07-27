/**
 * AnswerKeyDetector - Answer Key Detection Module for RRB Mock Test App
 * 
 * This module handles visual highlight detection, answer key parsing,
 * auto-answer assignment, and confidence scoring for extracted questions.
 * 
 * @author Ravi-katta-dev
 * @version 1.0.0
 * @created 2025-01-XX
 */

/**
 * Answer Key Detector Class
 * Handles all answer key detection operations
 */
class AnswerKeyDetector {
    constructor() {
        this.initialized = false;
        this.detectionMethods = {
            visual: true,
            textPattern: true,
            highlight: true,
            bold: true
        };
        this.confidenceThreshold = 0.6;
        this.answerPatterns = [];
        this.highlightColors = {
            // Common highlight colors in RGB ranges
            yellow: { r: [200, 255], g: [200, 255], b: [0, 150] },
            green: { r: [0, 150], g: [200, 255], b: [0, 150] },
            blue: { r: [0, 150], g: [150, 255], b: [200, 255] },
            red: { r: [200, 255], g: [0, 150], b: [0, 150] },
            pink: { r: [200, 255], g: [150, 255], b: [200, 255] }
        };
    }

    /**
     * Initialize the Answer Key Detector module
     */
    init() {
        if (this.initialized) return;
        
        console.log('Initializing Answer Key Detector module...');
        this.setupAnswerKeyPatterns();
        this.setupDetectionEventListeners();
        this.initialized = true;
        console.log('Answer Key Detector module initialized successfully');
    }

    /**
     * Setup answer key detection patterns
     */
    setupAnswerKeyPatterns() {
        this.answerPatterns = [
            // Standard answer key patterns
            {
                name: 'numbered_answers',
                pattern: /(\d+)\.\s*([a-d])\b/gi,
                confidence: 0.9
            },
            {
                name: 'bracket_answers', 
                pattern: /(\d+)\)\s*([a-d])\b/gi,
                confidence: 0.85
            },
            {
                name: 'colon_answers',
                pattern: /(\d+):\s*([a-d])\b/gi,
                confidence: 0.8
            },
            {
                name: 'dash_answers',
                pattern: /(\d+)\s*-\s*([a-d])\b/gi,
                confidence: 0.8
            },
            {
                name: 'answer_key_section',
                pattern: /(?:answer\s*key|answers?)\s*:?\s*((?:\d+\s*[.)\-:]\s*[a-d]\s*,?\s*)+)/gi,
                confidence: 0.95,
                isSection: true
            },
            {
                name: 'solution_section',
                pattern: /(?:solutions?|correct\s*answers?)\s*:?\s*((?:\d+\s*[.)\-:]\s*[a-d]\s*,?\s*)+)/gi,
                confidence: 0.9,
                isSection: true
            }
        ];
    }

    /**
     * Setup event listeners for answer detection
     */
    setupDetectionEventListeners() {
        // Auto-detect button
        const autoDetectBtn = document.getElementById('autoDetectAnswers');
        if (autoDetectBtn) {
            autoDetectBtn.addEventListener('click', () => this.performAutoDetection());
        }

        // Manual answer input handlers
        const answerInputs = document.querySelectorAll('.answer-input');
        answerInputs.forEach(input => {
            input.addEventListener('change', (e) => this.handleManualAnswerInput(e));
        });
    }

    /**
     * Detect answers from extracted questions and visual data
     */
    async detectAnswersFromQuestions(questions, visualData = null, textData = null) {
        console.log('Starting answer detection for', questions.length, 'questions...');
        
        const results = {
            totalQuestions: questions.length,
            answersDetected: 0,
            confidenceScores: {},
            detectionMethods: {},
            errors: []
        };

        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            
            try {
                const detection = await this.detectSingleQuestionAnswer(
                    question, 
                    visualData, 
                    textData
                );
                
                if (detection.answer) {
                    question.correctAnswer = detection.answer;
                    question.detectionConfidence = detection.confidence;
                    question.detectionMethod = detection.method;
                    
                    results.answersDetected++;
                    results.confidenceScores[question.id] = detection.confidence;
                    results.detectionMethods[question.id] = detection.method;
                }
            } catch (error) {
                console.warn(`Error detecting answer for question ${question.id}:`, error);
                results.errors.push({
                    questionId: question.id,
                    error: error.message
                });
            }
        }

        console.log(`Answer detection complete: ${results.answersDetected}/${results.totalQuestions} answers detected`);
        return results;
    }

    /**
     * Detect answer for a single question
     */
    async detectSingleQuestionAnswer(question, visualData, textData) {
        const detectionResults = [];

        // Method 1: Text pattern detection
        if (this.detectionMethods.textPattern && textData) {
            const textDetection = this.detectAnswerFromTextPatterns(question, textData);
            if (textDetection.answer) {
                detectionResults.push(textDetection);
            }
        }

        // Method 2: Visual highlight detection  
        if (this.detectionMethods.visual && visualData) {
            const visualDetection = await this.detectAnswerFromVisualHighlights(question, visualData);
            if (visualDetection.answer) {
                detectionResults.push(visualDetection);
            }
        }

        // Method 3: Bold text detection
        if (this.detectionMethods.bold && textData) {
            const boldDetection = this.detectAnswerFromBoldText(question, textData);
            if (boldDetection.answer) {
                detectionResults.push(boldDetection);
            }
        }

        // Select best detection result
        if (detectionResults.length === 0) {
            return { answer: null, confidence: 0, method: 'none' };
        }

        // Sort by confidence and return the best
        detectionResults.sort((a, b) => b.confidence - a.confidence);
        return detectionResults[0];
    }

    /**
     * Detect answer from text patterns
     */
    detectAnswerFromTextPatterns(question, textData) {
        const questionNumber = question.questionNumber || this.extractQuestionNumber(question.questionText);
        
        if (!questionNumber) {
            return { answer: null, confidence: 0, method: 'text_pattern' };
        }

        for (const pattern of this.answerPatterns) {
            let matches = [];
            
            if (pattern.isSection) {
                // Look for answer key sections
                const sectionMatches = textData.match(pattern.pattern);
                if (sectionMatches) {
                    // Extract individual answers from the section
                    const sectionText = sectionMatches[0];
                    const answerMatches = sectionText.match(/(\d+)\s*[.)\-:]\s*([a-d])/gi);
                    if (answerMatches) {
                        matches = answerMatches.map(match => {
                            const parts = match.match(/(\d+)\s*[.)\-:]\s*([a-d])/i);
                            return parts ? [match, parts[1], parts[2]] : null;
                        }).filter(Boolean);
                    }
                }
            } else {
                // Direct pattern matching
                const regex = new RegExp(pattern.pattern);
                let match;
                while ((match = regex.exec(textData)) !== null) {
                    matches.push(match);
                }
            }

            // Find answer for this specific question
            for (const match of matches) {
                const matchedNumber = parseInt(match[1]);
                if (matchedNumber === questionNumber) {
                    const answer = match[2].toLowerCase();
                    
                    // Verify answer is valid for this question
                    if (this.isValidAnswerForQuestion(answer, question)) {
                        return {
                            answer: answer,
                            confidence: pattern.confidence,
                            method: `text_pattern_${pattern.name}`,
                            source: match[0]
                        };
                    }
                }
            }
        }

        return { answer: null, confidence: 0, method: 'text_pattern' };
    }

    /**
     * Detect answer from visual highlights
     */
    async detectAnswerFromVisualHighlights(question, visualData) {
        if (!visualData || !visualData.imageData) {
            return { answer: null, confidence: 0, method: 'visual_highlight' };
        }

        try {
            // Find question text position
            const questionPosition = this.findQuestionPosition(question, visualData.textItems);
            if (!questionPosition) {
                return { answer: null, confidence: 0, method: 'visual_highlight' };
            }

            // Look for highlighted options near the question
            const optionPositions = this.findOptionPositions(question, visualData.textItems, questionPosition);
            
            for (const optionPos of optionPositions) {
                const highlightScore = this.analyzeHighlightInRegion(
                    visualData.imageData,
                    optionPos.x,
                    optionPos.y,
                    optionPos.width,
                    optionPos.height
                );

                if (highlightScore.isHighlighted && highlightScore.confidence > this.confidenceThreshold) {
                    return {
                        answer: optionPos.option,
                        confidence: highlightScore.confidence,
                        method: 'visual_highlight',
                        color: highlightScore.dominantColor
                    };
                }
            }

        } catch (error) {
            console.warn('Visual highlight detection error:', error);
        }

        return { answer: null, confidence: 0, method: 'visual_highlight' };
    }

    /**
     * Detect answer from bold text
     */
    detectAnswerFromBoldText(question, textData) {
        // This would analyze font weights and styles to detect bold answers
        // For now, implementing a simplified version
        
        const questionNumber = question.questionNumber || this.extractQuestionNumber(question.questionText);
        if (!questionNumber) {
            return { answer: null, confidence: 0, method: 'bold_text' };
        }

        // Look for patterns where answers appear to be emphasized
        const boldPatterns = [
            new RegExp(`${questionNumber}\\s*[.)]\\s*.*?\\b([a-d])\\)\\s*\\*\\*([^*]+)\\*\\*`, 'gi'),
            new RegExp(`${questionNumber}\\s*[.)]\\s*.*?\\b\\*\\*([a-d])\\)\\s*([^*]+)\\*\\*`, 'gi'),
            new RegExp(`${questionNumber}\\s*[.)]\\s*.*?\\b([a-d])\\)\\s*<b>([^<]+)</b>`, 'gi')
        ];

        for (const pattern of boldPatterns) {
            const matches = textData.match(pattern);
            if (matches) {
                for (const match of matches) {
                    const answerMatch = match.match(/\b([a-d])\)/i);
                    if (answerMatch) {
                        const answer = answerMatch[1].toLowerCase();
                        if (this.isValidAnswerForQuestion(answer, question)) {
                            return {
                                answer: answer,
                                confidence: 0.7,
                                method: 'bold_text',
                                source: match
                            };
                        }
                    }
                }
            }
        }

        return { answer: null, confidence: 0, method: 'bold_text' };
    }

    /**
     * Find question position in visual data
     */
    findQuestionPosition(question, textItems) {
        const questionText = question.questionText.substring(0, 50).toLowerCase();
        
        for (const item of textItems) {
            if (item.text.toLowerCase().includes(questionText.substring(0, 20))) {
                return {
                    x: item.x,
                    y: item.y,
                    width: item.width,
                    height: item.height
                };
            }
        }
        
        return null;
    }

    /**
     * Find option positions relative to question
     */
    findOptionPositions(question, textItems, questionPosition) {
        const optionPositions = [];
        const searchArea = {
            x: questionPosition.x - 50,
            y: questionPosition.y - 100,
            width: questionPosition.width + 100,
            height: 200
        };

        for (const option of question.options) {
            const optionPattern = new RegExp(option.label + '\\)', 'i');
            
            for (const item of textItems) {
                if (optionPattern.test(item.text) && 
                    this.isInSearchArea(item, searchArea)) {
                    optionPositions.push({
                        option: option.label,
                        x: item.x,
                        y: item.y,
                        width: item.width,
                        height: item.height
                    });
                    break;
                }
            }
        }

        return optionPositions;
    }

    /**
     * Check if item is in search area
     */
    isInSearchArea(item, area) {
        return item.x >= area.x && 
               item.x <= area.x + area.width &&
               item.y >= area.y && 
               item.y <= area.y + area.height;
    }

    /**
     * Analyze highlight in region
     */
    analyzeHighlightInRegion(imageData, x, y, width, height) {
        const data = imageData.data;
        const imgWidth = imageData.width;
        
        let highlightPixels = 0;
        let totalPixels = 0;
        const colorCounts = {};

        // Sample pixels in the region
        const startX = Math.max(0, Math.floor(x));
        const startY = Math.max(0, Math.floor(y));
        const endX = Math.min(imgWidth, Math.floor(x + width));
        const endY = Math.min(imageData.height, Math.floor(y + height));

        for (let pixelY = startY; pixelY < endY; pixelY += 2) {
            for (let pixelX = startX; pixelX < endX; pixelX += 2) {
                const index = (pixelY * imgWidth + pixelX) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                
                totalPixels++;
                
                // Check if pixel matches highlight colors
                const colorMatch = this.matchesHighlightColor(r, g, b);
                if (colorMatch) {
                    highlightPixels++;
                    colorCounts[colorMatch] = (colorCounts[colorMatch] || 0) + 1;
                }
            }
        }

        const highlightRatio = highlightPixels / totalPixels;
        const isHighlighted = highlightRatio > 0.3; // 30% threshold
        
        const dominantColor = Object.keys(colorCounts).reduce((a, b) => 
            colorCounts[a] > colorCounts[b] ? a : b, 'unknown');

        return {
            isHighlighted: isHighlighted,
            confidence: Math.min(0.9, highlightRatio * 2), // Scale to confidence
            dominantColor: dominantColor,
            highlightRatio: highlightRatio
        };
    }

    /**
     * Check if RGB values match highlight colors
     */
    matchesHighlightColor(r, g, b) {
        for (const [colorName, ranges] of Object.entries(this.highlightColors)) {
            if (r >= ranges.r[0] && r <= ranges.r[1] &&
                g >= ranges.g[0] && g <= ranges.g[1] &&
                b >= ranges.b[0] && b <= ranges.b[1]) {
                return colorName;
            }
        }
        return null;
    }

    /**
     * Extract question number from question text
     */
    extractQuestionNumber(questionText) {
        const match = questionText.match(/^(\d+)[.)]/);
        return match ? parseInt(match[1]) : null;
    }

    /**
     * Validate if answer is valid for question
     */
    isValidAnswerForQuestion(answer, question) {
        const validOptions = question.options.map(opt => opt.label.toLowerCase());
        return validOptions.includes(answer.toLowerCase());
    }

    /**
     * Perform automatic answer detection
     */
    async performAutoDetection() {
        if (!window.app || !window.app.tempExtractedQuestions) {
            alert('No extracted questions found. Please extract questions from a PDF first.');
            return;
        }

        const questions = window.app.tempExtractedQuestions.questions;
        const visualData = window.app.extractedVisualData;
        const textData = window.app.extractedTextData;

        this.showDetectionProgress();

        try {
            const results = await this.detectAnswersFromQuestions(questions, visualData, textData);
            this.showDetectionResults(results);
            
            // Update questions with detected answers
            window.app.tempExtractedQuestions.questions = questions;
            
        } catch (error) {
            console.error('Auto-detection error:', error);
            alert('An error occurred during answer detection: ' + error.message);
        } finally {
            this.hideDetectionProgress();
        }
    }

    /**
     * Handle manual answer input
     */
    handleManualAnswerInput(event) {
        const input = event.target;
        const questionId = input.dataset.questionId;
        const answer = input.value.toLowerCase();
        
        if (questionId && answer && ['a', 'b', 'c', 'd'].includes(answer)) {
            // Update question with manual answer
            if (window.app && window.app.tempExtractedQuestions) {
                const question = window.app.tempExtractedQuestions.questions.find(q => q.id === questionId);
                if (question) {
                    question.correctAnswer = answer;
                    question.detectionMethod = 'manual';
                    question.detectionConfidence = 1.0;
                }
            }
        }
    }

    /**
     * Show detection progress
     */
    showDetectionProgress() {
        const progressDiv = document.getElementById('answerDetectionProgress');
        if (progressDiv) {
            progressDiv.style.display = 'block';
            progressDiv.innerHTML = `
                <div class="detection-progress">
                    <div class="progress-spinner"></div>
                    <div class="progress-text">Detecting answers...</div>
                </div>
            `;
        }
    }

    /**
     * Hide detection progress
     */
    hideDetectionProgress() {
        const progressDiv = document.getElementById('answerDetectionProgress');
        if (progressDiv) {
            progressDiv.style.display = 'none';
        }
    }

    /**
     * Show detection results
     */
    showDetectionResults(results) {
        const resultsDiv = document.getElementById('detectionResults');
        if (!resultsDiv) return;

        const successRate = (results.answersDetected / results.totalQuestions * 100).toFixed(1);
        
        resultsDiv.innerHTML = `
            <div class="detection-summary">
                <h3>🎯 Answer Detection Results</h3>
                <div class="results-stats">
                    <div class="stat">
                        <span class="stat-number">${results.answersDetected}</span>
                        <span class="stat-label">Answers Detected</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">${results.totalQuestions}</span>
                        <span class="stat-label">Total Questions</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">${successRate}%</span>
                        <span class="stat-label">Success Rate</span>
                    </div>
                </div>
                
                ${results.errors.length > 0 ? `
                    <div class="detection-errors">
                        <h4>⚠️ Detection Issues</h4>
                        <ul>
                            ${results.errors.slice(0, 5).map(error => 
                                `<li>Question ${error.questionId}: ${error.error}</li>`
                            ).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                <div class="detection-methods">
                    <h4>📊 Detection Methods Used</h4>
                    <div class="method-breakdown">
                        ${Object.entries(this.getMethodBreakdown(results.detectionMethods)).map(([method, count]) => `
                            <div class="method-stat">
                                <span class="method-name">${method}</span>
                                <span class="method-count">${count}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        resultsDiv.style.display = 'block';
    }

    /**
     * Get breakdown of detection methods used
     */
    getMethodBreakdown(detectionMethods) {
        const breakdown = {};
        Object.values(detectionMethods).forEach(method => {
            breakdown[method] = (breakdown[method] || 0) + 1;
        });
        return breakdown;
    }

    /**
     * Export detected answers for review
     */
    exportDetectedAnswers(questions) {
        const answersData = questions
            .filter(q => q.correctAnswer)
            .map(q => ({
                questionNumber: q.questionNumber,
                questionText: q.questionText.substring(0, 100) + '...',
                correctAnswer: q.correctAnswer,
                confidence: q.detectionConfidence,
                method: q.detectionMethod
            }));

        const dataStr = JSON.stringify(answersData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'detected_answers.json';
        link.click();
    }

    /**
     * Import answers from file
     */
    async importAnswers(file) {
        try {
            const text = await file.text();
            const answersData = JSON.parse(text);
            
            if (window.app && window.app.tempExtractedQuestions) {
                const questions = window.app.tempExtractedQuestions.questions;
                
                answersData.forEach(answerData => {
                    const question = questions.find(q => 
                        q.questionNumber === answerData.questionNumber
                    );
                    
                    if (question) {
                        question.correctAnswer = answerData.correctAnswer;
                        question.detectionMethod = 'imported';
                        question.detectionConfidence = answerData.confidence || 0.8;
                    }
                });
                
                alert(`✅ Imported answers for ${answersData.length} questions`);
            }
        } catch (error) {
            console.error('Answer import error:', error);
            alert('Error importing answers: ' + error.message);
        }
    }
}

// Initialize global instance
if (typeof window !== 'undefined') {
    window.AnswerKeyDetector = AnswerKeyDetector;
    window.answerKeyDetector = new AnswerKeyDetector();
}