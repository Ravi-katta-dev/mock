/**
 * QuestionExtractor - Question Extraction Utility from Text/PDF
 * 
 * This utility provides intelligent question extraction capabilities
 * from text content, PDF documents, and various question formats.
 * 
 * @author Ravi-katta-dev
 * @version 2.0.0
 * @created 2025-01-XX
 */

class QuestionExtractor {
    constructor() {
        this.initialized = false;
        this.extractionPatterns = {
            // Question patterns
            questionPatterns: [
                /^\s*(\d+)\.\s+(.+?)(?=\n\s*(?:[a-d]\)|[A-D]\)|\d+\.|$))/gm,
                /^\s*Q\s*(\d+)[:\-.]?\s+(.+?)(?=\n\s*(?:[a-d]\)|[A-D]\)|\d+\.|Q\s*\d+|$))/gm,
                /^\s*Question\s*(\d+)[:\-.]?\s+(.+?)(?=\n\s*(?:[a-d]\)|[A-D]\)|\d+\.|Question\s*\d+|$))/gm
            ],
            // Option patterns
            optionPatterns: [
                /^\s*([a-d])\)\s*(.+?)(?=\n\s*[a-d]\)|\n\s*\d+\.|\n\s*Q|\n\s*Question|$)/gm,
                /^\s*([A-D])\)\s*(.+?)(?=\n\s*[A-D]\)|\n\s*\d+\.|\n\s*Q|\n\s*Question|$)/gm,
                /^\s*\(([a-d])\)\s*(.+?)(?=\n\s*\([a-d]\)|\n\s*\d+\.|\n\s*Q|\n\s*Question|$)/gm,
                /^\s*\(([A-D])\)\s*(.+?)(?=\n\s*\([A-D]\)|\n\s*\d+\.|\n\s*Q|\n\s*Question|$)/gm
            ],
            // Answer patterns
            answerPatterns: [
                /(?:Answer|Ans)[:\-.]?\s*([a-dA-D])/gm,
                /(?:Correct|Right)\s*(?:Answer|Option)[:\-.]?\s*([a-dA-D])/gm,
                /(?:Solution|Sol)[:\-.]?\s*([a-dA-D])/gm
            ]
        };
        
        this.subjectClassifiers = {
            mathematics: [
                'equation', 'formula', 'calculate', 'solve', 'derivative', 'integral',
                'algebra', 'geometry', 'trigonometry', 'statistics', 'probability',
                'matrix', 'function', 'graph', 'angle', 'triangle', 'circle'
            ],
            physics: [
                'force', 'energy', 'velocity', 'acceleration', 'momentum', 'wave',
                'electric', 'magnetic', 'current', 'voltage', 'resistance', 'circuit',
                'thermodynamics', 'optics', 'mechanics', 'quantum'
            ],
            chemistry: [
                'molecule', 'atom', 'reaction', 'chemical', 'compound', 'element',
                'bond', 'solution', 'acid', 'base', 'organic', 'inorganic',
                'periodic', 'electron', 'oxidation', 'reduction'
            ],
            biology: [
                'cell', 'organism', 'DNA', 'gene', 'protein', 'evolution',
                'ecosystem', 'photosynthesis', 'respiration', 'reproduction',
                'classification', 'anatomy', 'physiology'
            ],
            reasoning: [
                'logical', 'pattern', 'sequence', 'analogy', 'relationship',
                'classification', 'coding', 'decoding', 'puzzle', 'series'
            ]
        };
    }

    /**
     * Initialize the Question Extractor
     */
    async init() {
        if (this.initialized) return;
        
        console.log('Initializing Question Extractor...');
        
        this.setupAdvancedPatterns();
        this.initialized = true;
        
        console.log('Question Extractor initialized successfully');
    }

    /**
     * Setup advanced extraction patterns
     */
    setupAdvancedPatterns() {
        // Add more sophisticated patterns for different question formats
        this.extractionPatterns.multipleChoicePatterns = [
            // Standard MCQ format
            /(\d+)\.\s*(.+?)\n\s*(?:\(?[a-dA-D]\)?)\s*(.+?)(?=\n\s*\d+\.|\n\s*Answer|\n\s*$)/gs,
            // Question with numbered options
            /(\d+)\.\s*(.+?)\n\s*1\.\s*(.+?)\n\s*2\.\s*(.+?)(?:\n\s*3\.\s*(.+?))?(?:\n\s*4\.\s*(.+?))?/gs
        ];

        this.extractionPatterns.explanationPatterns = [
            /(?:Explanation|Solution|Justification)[:\-.]?\s*(.+?)(?=\n\s*\d+\.|\n\s*Q|\n\s*$)/gs,
            /(?:Because|Since|Therefore)[:\-.]?\s*(.+?)(?=\n\s*\d+\.|\n\s*Q|\n\s*$)/gs
        ];
    }

    /**
     * Extract questions from text content
     */
    extractFromText(text) {
        if (!text || typeof text !== 'string') {
            throw new Error('Invalid text input for question extraction');
        }

        try {
            console.log('Extracting questions from text...');
            
            // Clean and normalize text
            const normalizedText = this.normalizeText(text);
            
            // Extract questions using different methods
            const questions = [];
            
            // Method 1: Pattern-based extraction
            const patternQuestions = this.extractUsingPatterns(normalizedText);
            questions.push(...patternQuestions);
            
            // Method 2: Block-based extraction (for structured content)
            const blockQuestions = this.extractUsingBlocks(normalizedText);
            questions.push(...blockQuestions);
            
            // Method 3: AI-assisted extraction (basic heuristics)
            const heuristicQuestions = this.extractUsingHeuristics(normalizedText);
            questions.push(...heuristicQuestions);
            
            // Deduplicate and validate
            const uniqueQuestions = this.deduplicateQuestions(questions);
            const validatedQuestions = this.validateExtractedQuestions(uniqueQuestions);
            
            console.log(`Extracted ${validatedQuestions.length} questions from text`);
            return validatedQuestions;
            
        } catch (error) {
            console.error('Error extracting questions from text:', error);
            if (window.ErrorHandler) {
                window.ErrorHandler.handleError({
                    message: 'Failed to extract questions from text',
                    error,
                    category: window.ErrorHandler.categories.VALIDATION,
                    severity: window.ErrorHandler.severity.MEDIUM
                });
            }
            return [];
        }
    }

    /**
     * Normalize text for better extraction
     */
    normalizeText(text) {
        return text
            // Normalize line endings
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            // Remove excessive whitespace
            .replace(/[ \t]+/g, ' ')
            // Normalize multiple newlines
            .replace(/\n\s*\n\s*\n/g, '\n\n')
            // Trim whitespace
            .trim();
    }

    /**
     * Extract questions using regex patterns
     */
    extractUsingPatterns(text) {
        const questions = [];
        
        // Try each question pattern
        for (const pattern of this.extractionPatterns.questionPatterns) {
            const matches = [...text.matchAll(pattern)];
            
            for (const match of matches) {
                const questionNumber = match[1];
                const questionText = match[2].trim();
                
                if (questionText.length > 10) { // Minimum question length
                    // Extract options for this question
                    const options = this.extractOptionsForQuestion(text, match.index, questionText);
                    
                    if (options.length >= 2) { // Must have at least 2 options
                        const question = {
                            id: this.generateQuestionId(),
                            number: parseInt(questionNumber),
                            question: questionText,
                            options: options,
                            correctAnswer: this.detectCorrectAnswer(text, questionText, options),
                            subject: this.classifySubject(questionText),
                            difficulty: this.estimateDifficulty(questionText),
                            source: 'text_extraction',
                            extracted: true,
                            confidence: this.calculateConfidence(questionText, options)
                        };
                        
                        questions.push(question);
                    }
                }
            }
        }
        
        return questions;
    }

    /**
     * Extract options for a specific question
     */
    extractOptionsForQuestion(text, questionIndex, questionText) {
        const options = [];
        
        // Look for options after the question
        const afterQuestion = text.substring(questionIndex + questionText.length);
        const nextQuestionMatch = afterQuestion.match(/\n\s*(\d+\.|Q\s*\d+|Question\s*\d+)/);
        const searchScope = nextQuestionMatch ? 
            afterQuestion.substring(0, nextQuestionMatch.index) : 
            afterQuestion.substring(0, 500); // Limit search scope
        
        // Try different option patterns
        for (const pattern of this.extractionPatterns.optionPatterns) {
            const optionMatches = [...searchScope.matchAll(pattern)];
            
            if (optionMatches.length >= 2) {
                optionMatches.forEach(match => {
                    const optionText = match[2].trim();
                    if (optionText.length > 0 && optionText.length < 200) {
                        options.push(optionText);
                    }
                });
                break; // Use first successful pattern
            }
        }
        
        return options.slice(0, 4); // Maximum 4 options
    }

    /**
     * Extract questions using block-based approach
     */
    extractUsingBlocks(text) {
        const questions = [];
        const blocks = text.split(/\n\s*\n/); // Split by double newlines
        
        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i].trim();
            
            if (this.looksLikeQuestion(block)) {
                const question = this.parseQuestionBlock(block);
                if (question) {
                    questions.push(question);
                }
            }
        }
        
        return questions;
    }

    /**
     * Check if a block looks like a question
     */
    looksLikeQuestion(block) {
        const indicators = [
            /^\s*\d+\./,           // Starts with number
            /^\s*Q\s*\d+/,         // Starts with Q
            /^\s*Question/,        // Starts with Question
            /\?/,                  // Contains question mark
            /[a-d]\)/,             // Contains option markers
            /Choose|Select|Which|What|How|Why|When|Where/i // Question words
        ];
        
        return indicators.some(pattern => pattern.test(block));
    }

    /**
     * Parse a question block
     */
    parseQuestionBlock(block) {
        try {
            const lines = block.split('\n').map(line => line.trim()).filter(line => line.length > 0);
            
            if (lines.length < 3) return null; // Need at least question + 2 options
            
            let questionText = '';
            const options = [];
            let currentLine = 0;
            
            // Extract question text (first line or until options start)
            while (currentLine < lines.length) {
                const line = lines[currentLine];
                
                if (/^[a-dA-D]\)/.test(line) || /^\([a-dA-D]\)/.test(line)) {
                    break; // Options started
                }
                
                questionText += (questionText ? ' ' : '') + line.replace(/^\d+\.\s*/, '');
                currentLine++;
            }
            
            // Extract options
            while (currentLine < lines.length && options.length < 4) {
                const line = lines[currentLine];
                const optionMatch = line.match(/^[a-dA-D]\)\s*(.+)/) || line.match(/^\([a-dA-D]\)\s*(.+)/);
                
                if (optionMatch) {
                    options.push(optionMatch[1].trim());
                } else if (line.length > 0 && !this.looksLikeAnswer(line)) {
                    // Continuation of previous option
                    if (options.length > 0) {
                        options[options.length - 1] += ' ' + line;
                    }
                }
                
                currentLine++;
            }
            
            if (questionText.length > 10 && options.length >= 2) {
                return {
                    id: this.generateQuestionId(),
                    question: questionText,
                    options: options,
                    correctAnswer: this.detectCorrectAnswer(block, questionText, options),
                    subject: this.classifySubject(questionText),
                    difficulty: this.estimateDifficulty(questionText),
                    source: 'block_extraction',
                    extracted: true,
                    confidence: this.calculateConfidence(questionText, options)
                };
            }
            
        } catch (error) {
            console.warn('Error parsing question block:', error);
        }
        
        return null;
    }

    /**
     * Extract questions using heuristic approach
     */
    extractUsingHeuristics(text) {
        const questions = [];
        
        // Split text into potential question segments
        const segments = text.split(/(?=\d+\.|\nQ\s*\d+|\nQuestion\s*\d+)/);
        
        for (const segment of segments) {
            if (segment.trim().length < 50) continue; // Too short to be a question
            
            // Apply heuristic scoring
            const score = this.scoreQuestionCandidate(segment);
            
            if (score > 0.6) { // Threshold for question likelihood
                const question = this.extractQuestionFromCandidate(segment);
                if (question) {
                    question.confidence = score;
                    questions.push(question);
                }
            }
        }
        
        return questions;
    }

    /**
     * Score a text segment for question likelihood
     */
    scoreQuestionCandidate(text) {
        let score = 0;
        
        // Question indicators
        if (/\?/.test(text)) score += 0.3;
        if (/Choose|Select|Which|What|How|Why|When|Where/i.test(text)) score += 0.2;
        if (/^\s*\d+\./.test(text)) score += 0.2;
        if (/[a-d]\)/g.test(text)) score += 0.3;
        
        // Option structure
        const optionCount = (text.match(/[a-d]\)/g) || []).length;
        if (optionCount >= 2 && optionCount <= 4) score += 0.2;
        
        // Length check
        if (text.length > 100 && text.length < 1000) score += 0.1;
        
        return Math.min(score, 1.0);
    }

    /**
     * Extract question from a candidate segment
     */
    extractQuestionFromCandidate(text) {
        // Use simplified extraction for heuristic method
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        let questionText = lines[0].replace(/^\d+\.\s*/, '');
        const options = [];
        
        for (let i = 1; i < lines.length; i++) {
            const optionMatch = lines[i].match(/^[a-d]\)\s*(.+)/);
            if (optionMatch) {
                options.push(optionMatch[1]);
            }
        }
        
        if (questionText.length > 10 && options.length >= 2) {
            return {
                id: this.generateQuestionId(),
                question: questionText,
                options: options,
                correctAnswer: null, // Will be detected separately
                subject: this.classifySubject(questionText),
                difficulty: this.estimateDifficulty(questionText),
                source: 'heuristic_extraction',
                extracted: true
            };
        }
        
        return null;
    }

    /**
     * Detect correct answer from text
     */
    detectCorrectAnswer(text, questionText, options) {
        // Look for explicit answer patterns
        for (const pattern of this.extractionPatterns.answerPatterns) {
            const match = text.match(pattern);
            if (match) {
                const answerLetter = match[1].toLowerCase();
                const answerIndex = answerLetter.charCodeAt(0) - 97; // a=0, b=1, c=2, d=3
                if (answerIndex >= 0 && answerIndex < options.length) {
                    return answerIndex;
                }
            }
        }
        
        return null; // No answer detected
    }

    /**
     * Classify subject based on question content
     */
    classifySubject(questionText) {
        const text = questionText.toLowerCase();
        const scores = {};
        
        for (const [subject, keywords] of Object.entries(this.subjectClassifiers)) {
            scores[subject] = keywords.reduce((score, keyword) => {
                return score + (text.includes(keyword) ? 1 : 0);
            }, 0);
        }
        
        // Find subject with highest score
        const maxScore = Math.max(...Object.values(scores));
        if (maxScore > 0) {
            return Object.keys(scores).find(subject => scores[subject] === maxScore);
        }
        
        return 'General'; // Default subject
    }

    /**
     * Estimate question difficulty
     */
    estimateDifficulty(questionText) {
        const text = questionText.toLowerCase();
        let difficultyScore = 0;
        
        // Complexity indicators
        const complexPatterns = [
            /calculate|compute|derive|prove/, // Mathematical complexity
            /analyze|evaluate|compare|contrast/, // Higher-order thinking
            /multiple|several|various/, // Multiple concepts
            /\d+\.\d+/, // Decimal numbers
            /equation|formula|theorem/ // Advanced concepts
        ];
        
        complexPatterns.forEach(pattern => {
            if (pattern.test(text)) difficultyScore++;
        });
        
        // Length-based difficulty
        if (questionText.length > 200) difficultyScore++;
        if (questionText.length > 400) difficultyScore++;
        
        // Map score to difficulty levels
        if (difficultyScore <= 1) return 'Easy';
        if (difficultyScore <= 3) return 'Medium';
        return 'Hard';
    }

    /**
     * Calculate confidence score for extracted question
     */
    calculateConfidence(questionText, options) {
        let confidence = 0.5; // Base confidence
        
        // Question quality indicators
        if (questionText.length > 20) confidence += 0.1;
        if (questionText.includes('?')) confidence += 0.1;
        if (options.length === 4) confidence += 0.1;
        if (options.every(opt => opt.length > 2)) confidence += 0.1;
        
        // Deduct for potential issues
        if (questionText.length < 10) confidence -= 0.2;
        if (options.length < 2) confidence -= 0.3;
        
        return Math.max(0, Math.min(1, confidence));
    }

    /**
     * Deduplicate extracted questions
     */
    deduplicateQuestions(questions) {
        const unique = [];
        const seen = new Set();
        
        for (const question of questions) {
            const fingerprint = this.generateQuestionFingerprint(question);
            if (!seen.has(fingerprint)) {
                seen.add(fingerprint);
                unique.push(question);
            }
        }
        
        return unique;
    }

    /**
     * Generate question fingerprint for deduplication
     */
    generateQuestionFingerprint(question) {
        const questionWords = question.question.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .slice(0, 10) // First 10 words
            .join(' ');
        
        return questionWords;
    }

    /**
     * Validate extracted questions
     */
    validateExtractedQuestions(questions) {
        return questions.filter(question => {
            // Basic validation rules
            if (!question.question || question.question.length < 10) return false;
            if (!question.options || question.options.length < 2) return false;
            if (question.options.some(opt => !opt || opt.length < 1)) return false;
            
            return true;
        });
    }

    /**
     * Check if text looks like an answer
     */
    looksLikeAnswer(text) {
        const answerPatterns = [
            /^(?:Answer|Ans|Correct|Solution)[:\-.]?/i,
            /^[a-dA-D]$/
        ];
        
        return answerPatterns.some(pattern => pattern.test(text));
    }

    /**
     * Generate unique question ID
     */
    generateQuestionId() {
        return `extracted_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get extraction statistics
     */
    getStats() {
        return {
            initialized: this.initialized,
            patternsCount: {
                question: this.extractionPatterns.questionPatterns.length,
                option: this.extractionPatterns.optionPatterns.length,
                answer: this.extractionPatterns.answerPatterns.length
            },
            subjectClassifiers: Object.keys(this.subjectClassifiers).length
        };
    }
}

// Make QuestionExtractor available globally
window.QuestionExtractor = new QuestionExtractor();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuestionExtractor;
}