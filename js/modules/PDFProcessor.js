/**
 * PDFProcessor - PDF Processing Module for RRB Mock Test App
 * 
 * This module handles PDF parsing, text extraction, question extraction,
 * practice set detection, and PDF preprocessing functionality.
 * 
 * @author Ravi-katta-dev
 * @version 1.0.0
 * @created 2025-01-XX
 */

/**
 * PDF Processor Class
 * Handles all PDF-related operations
 */
class PDFProcessor {
    constructor() {
        this.initialized = false;
        this.currentPDFFile = null;
        this.currentPDFMetadata = null;
        this.cancelProcessing = false;
        this.pdfDoc = null;
        this.currentPage = 1;
    }

    /**
     * Initialize the PDF Processor module
     */
    init() {
        if (this.initialized) return;
        
        console.log('Initializing PDF Processor module...');
        this.setupPDFEventListeners();
        this.initialized = true;
        console.log('PDF Processor module initialized successfully');
    }

    /**
     * Setup event listeners for PDF-related elements
     */
    setupPDFEventListeners() {
        // PDF file input listener
        const pdfInput = document.getElementById('pdfInput');
        if (pdfInput) {
            pdfInput.addEventListener('change', (e) => this.handlePDFFileSelect(e));
        }

        // Process PDF button listener
        const processPDF = document.getElementById('processPDF');
        if (processPDF) {
            processPDF.addEventListener('click', (e) => {
                e.preventDefault();
                this.processPDFForQuestions();
            });
        }

        // PDF drag and drop setup
        this.setupPDFDragDrop();
    }

    /**
     * Setup drag and drop for PDF upload
     */
    setupPDFDragDrop() {
        const dropZone = document.getElementById('pdfDropZone');
        if (!dropZone) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('drag-over');
            });
        });

        dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handlePDFFile(files[0]);
            }
        });
    }

    /**
     * Handle PDF file selection
     */
    handlePDFFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.handlePDFFile(file);
        }
    }

    /**
     * Handle PDF file processing
     */
    handlePDFFile(file) {
        if (!file) {
            console.warn('No file provided');
            return;
        }

        if (file.type !== 'application/pdf') {
            alert('Please select a PDF file.');
            return;
        }

        if (file.size > 50 * 1024 * 1024) { // 50MB limit
            alert('File size too large. Please select a file smaller than 50MB.');
            return;
        }

        this.currentPDFFile = file;
        this.displayPDFInfo(file);
    }

    /**
     * Display PDF file information
     */
    displayPDFInfo(file) {
        const infoDiv = document.getElementById('pdfInfo');
        if (infoDiv) {
            infoDiv.innerHTML = `
                <div class="pdf-file-info">
                    <h4>📄 ${file.name}</h4>
                    <p><strong>Size:</strong> ${this.formatFileSize(file.size)}</p>
                    <p><strong>Type:</strong> ${file.type}</p>
                    <div class="pdf-metadata">
                        <div class="form-group">
                            <label class="form-label">Subject: <span class="required">*</span></label>
                            <select id="pdfSubject" class="form-control" required onchange="app.updateChapterOptions()">
                                <option value="">-- Select Subject --</option>
                                <option value="Mathematics">Mathematics</option>
                                <option value="General Intelligence & Reasoning">General Intelligence & Reasoning</option>
                                <option value="Basic Science & Engineering">Basic Science & Engineering</option>
                                <option value="General Awareness">General Awareness</option>
                                <option value="Basics of Computers and Applications">Basics of Computers and Applications</option>
                                <option value="Environmental & Pollution Control">Environmental & Pollution Control</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Chapter: <span class="required">*</span></label>
                            <select id="pdfChapter" class="form-control">
                                <option value="">-- Select Chapter --</option>
                            </select>
                            <div class="custom-chapter-input" id="customChapterDiv" style="display: none;">
                                <input type="text" id="pdfChapterCustom" class="form-control" placeholder="Enter custom chapter name">
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="checkbox-group">
                                <input type="checkbox" id="autoDetectChapter" checked>
                                <label for="autoDetectChapter">Auto-detect chapter from content</label>
                            </div>
                            <div class="checkbox-group">
                                <input type="checkbox" id="enableVisualDetection" checked>
                                <label for="enableVisualDetection">Enable visual answer key detection</label>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Format file size for display
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Process PDF for question extraction
     */
    async processPDFForQuestions() {
        if (!this.currentPDFFile) {
            alert('Please select a PDF file first.');
            return;
        }

        // Store form values to prevent loss
        this.currentPDFMetadata = {
            subject: document.getElementById('pdfSubject')?.value || '',
            chapter: document.getElementById('pdfChapterCustom')?.value?.trim() || 
                    document.getElementById('pdfChapter')?.value || 'Auto-detect',
            filename: this.currentPDFFile.name,
            autoDetect: document.getElementById('autoDetectChapter')?.checked !== false,
            visualDetection: document.getElementById('enableVisualDetection')?.checked !== false
        };

        // Show processing UI with cancel option
        this.showProcessingUI();

        try {
            this.updateProcessingStep('Loading PDF document...');
            
            const fileArrayBuffer = await this.currentPDFFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(fileArrayBuffer).promise;
            
            // Process in manageable chunks to prevent memory issues
            const CHUNK_SIZE = 5;
            const results = [];
            let pageVisualData = [];
            
            for (let i = 1; i <= pdf.numPages; i += CHUNK_SIZE) {
                const endPage = Math.min(i + CHUNK_SIZE - 1, pdf.numPages);
                this.updateProcessingStep(`Processing pages ${i} to ${endPage} of ${pdf.numPages}...`);
                
                // Check for user cancellation
                if (this.cancelProcessing) {
                    this.updateProcessingStep("Operation cancelled by user");
                    return;
                }
                
                // Process chunk
                const chunkPages = [];
                for (let j = i; j <= endPage; j++) {
                    const page = await pdf.getPage(j);
                    const textContent = await page.getTextContent();
                    
                    const pageItems = textContent.items.map(item => ({
                        text: item.str,
                        x: item.transform[4],
                        y: item.transform[5],
                        width: item.width,
                        height: item.height
                    }));
                    
                    const pageText = this.reconstructPageText(pageItems);
                    chunkPages.push({
                        number: j,
                        text: this.preprocessPDFText(pageText),
                        items: pageItems
                    });
                    
                    // Extract visual data for answer detection
                    if (this.currentPDFMetadata.visualDetection) {
                        const visualData = await this.extractPageVisualData(page, pageItems);
                        pageVisualData.push(visualData);
                    }
                }
                
                results.push(...chunkPages);
                
                // Brief pause to prevent UI blocking
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            // Auto-detect practice sets if enabled
            this.updateProcessingStep('Detecting practice sets...');
            const fullText = results.map(page => page.text).join('\n');
            const detectedSets = this.detectPracticeSets(fullText);
            
            // Auto-detect chapter if enabled
            let detectedChapter = this.currentPDFMetadata.chapter;
            if (this.currentPDFMetadata.autoDetect && detectedChapter === 'Auto-detect') {
                this.updateProcessingStep('Auto-detecting chapter...');
                const chapterDetection = this.detectChapterFromContent(fullText);
                detectedChapter = chapterDetection.chapter || 'General';
            }

            // Extract questions
            this.updateProcessingStep('Extracting questions...');
            const extractedQuestions = await this.extractQuestionsFromText(fullText, results, pageVisualData);

            // Process complete
            this.hideProcessingUI();
            
            if (extractedQuestions.length === 0) {
                alert('No questions were found in the PDF. Please check the format or try a different PDF.');
                return;
            }

            // Store extracted data
            this.tempExtractedQuestions = {
                questions: extractedQuestions,
                metadata: {
                    ...this.currentPDFMetadata,
                    chapter: detectedChapter,
                    totalQuestions: extractedQuestions.length,
                    extractedAt: new Date().toISOString(),
                    practiceSets: detectedSets
                }
            };

            // Show results
            this.showExtractedQuestions(extractedQuestions, this.tempExtractedQuestions.metadata);

        } catch (error) {
            console.error('PDF processing error:', error);
            this.hideProcessingUI();
            
            let errorMessage = 'An error occurred while processing the PDF.';
            if (error.message.includes('Invalid PDF')) {
                errorMessage = 'Invalid PDF file. Please ensure the file is not corrupted.';
            } else if (error.message.includes('password')) {
                errorMessage = 'Password-protected PDFs are not supported.';
            }
            
            alert(errorMessage + '\n\nError details: ' + error.message);
        }
    }

    /**
     * Preprocess PDF text for better extraction
     */
    preprocessPDFText(text) {
        if (!text) return '';
        
        // Remove excessive whitespace and line breaks
        text = text.replace(/\s+/g, ' ').trim();
        
        // Fix common PDF extraction issues
        text = text.replace(/(\d+)\s*\.\s*/g, '$1. '); // Fix question numbers
        text = text.replace(/([a-d])\s*\)\s*/gi, '$1) '); // Fix option markers
        text = text.replace(/\s+([.,;:])/g, '$1'); // Fix punctuation spacing
        
        // Normalize option patterns
        text = text.replace(/\(\s*([a-d])\s*\)/gi, '($1)'); // (a) format
        text = text.replace(/([a-d])\s*\.\s*/gi, '$1) '); // a. to a) format
        
        return text;
    }

    /**
     * Reconstruct page text from PDF items
     */
    reconstructPageText(items) {
        if (!items || items.length === 0) return '';
        
        // Sort items by vertical position (y-coordinate) then horizontal (x-coordinate)
        const sortedItems = items.sort((a, b) => {
            const yDiff = Math.abs(b.y - a.y);
            if (yDiff < 5) { // Same line
                return a.x - b.x;
            }
            return b.y - a.y;
        });
        
        let text = '';
        let lastY = null;
        
        sortedItems.forEach(item => {
            if (lastY !== null && Math.abs(lastY - item.y) > 5) {
                text += '\n';
            }
            text += item.text + ' ';
            lastY = item.y;
        });
        
        return text.trim();
    }

    /**
     * Extract page visual data for answer detection
     */
    async extractPageVisualData(page, pageItems) {
        try {
            const viewport = page.getViewport({ scale: 1.0 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;
            
            // Extract image data for highlight detection
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            
            return {
                pageNumber: page.pageNumber,
                width: viewport.width,
                height: viewport.height,
                imageData: imageData,
                textItems: pageItems
            };
        } catch (error) {
            console.warn('Failed to extract visual data from page:', error);
            return null;
        }
    }

    /**
     * Detect practice sets from PDF content
     */
    detectPracticeSets(text) {
        console.log('Detecting RRB practice sets from PDF content...');
        
        const practiceSets = [];
        
        // RRB-specific practice set patterns
        const practiceSetPatterns = [
            /PRACTICE\s+SET\s*[-:\s]*(\d+)/gi,
            /Practice\s+Set\s*[-:\s]*(\d+)/gi,
            /SET\s*[-:\s]*(\d+)/gi,
            /Test\s*[-:\s]*(\d+)/gi,
            /Mock\s+Test\s*[-:\s]*(\d+)/gi,
            /Paper\s*[-:\s]*(\d+)/gi,
            /(?:^|\n)\s*(\d+)\s*\.\s*(?:Practice|Set|Test)/gi
        ];
        
        // Find all practice set headers
        let setMatches = [];
        practiceSetPatterns.forEach(pattern => {
            let match;
            pattern.lastIndex = 0;
            while ((match = pattern.exec(text)) !== null) {
                const setNumber = parseInt(match[1]);
                if (setNumber >= 1 && setNumber <= 20) {
                    setMatches.push({
                        setNumber: setNumber,
                        index: match.index,
                        fullMatch: match[0],
                        endIndex: match.index + match[0].length
                    });
                }
            }
        });
        
        // Remove duplicates and sort by position
        setMatches = setMatches.filter((match, index, self) => 
            index === self.findIndex(m => 
                Math.abs(m.setNumber - match.setNumber) < 1 && 
                Math.abs(m.index - match.index) < 200
            )
        ).sort((a, b) => a.index - b.index);
        
        console.log('Found practice set headers:', setMatches.length, setMatches);
        
        // Extract questions for each practice set
        for (let i = 0; i < setMatches.length; i++) {
            const currentSet = setMatches[i];
            const nextSet = setMatches[i + 1];
            
            const startIndex = currentSet.endIndex;
            const endIndex = nextSet ? nextSet.index : text.length;
            const setContent = text.substring(startIndex, endIndex);
            
            // Extract questions from this practice set
            const questions = this.extractQuestionsFromSetContent(setContent, currentSet.setNumber);
            
            if (questions.length > 0) {
                practiceSets.push({
                    setNumber: currentSet.setNumber,
                    title: currentSet.fullMatch.trim(),
                    questionCount: questions.length,
                    questions: questions,
                    startIndex: startIndex,
                    endIndex: endIndex
                });
            }
        }
        
        console.log(`Detected ${practiceSets.length} practice sets with total questions:`, 
                    practiceSets.reduce((sum, set) => sum + set.questionCount, 0));
        
        return practiceSets;
    }

    /**
     * Extract questions from practice set content
     */
    extractQuestionsFromSetContent(content, setNumber) {
        const questions = [];
        
        // RRB question pattern - typically numbered 1-100
        const questionPattern = /(\d+)\.\s*([^?]*\?)\s*((?:[a-d]\)[^a-d)]*(?:[a-d]\)|$))+)/gi;
        
        let match;
        while ((match = questionPattern.exec(content)) !== null) {
            const questionNumber = parseInt(match[1]);
            const questionText = match[2].trim();
            const optionsText = match[3].trim();
            
            // Extract options
            const options = this.extractOptionsFromText(optionsText);
            
            if (options.length >= 2 && questionText.length > 10) {
                questions.push({
                    id: `set_${setNumber}_q_${questionNumber}`,
                    questionNumber: questionNumber,
                    questionText: questionText,
                    options: options,
                    correctAnswer: null, // Will be detected separately
                    subject: 'General',
                    chapter: `Practice Set ${setNumber}`,
                    difficulty: 'Medium',
                    extractedFrom: 'PDF',
                    setNumber: setNumber
                });
            }
        }
        
        return questions;
    }

    /**
     * Extract options from text
     */
    extractOptionsFromText(optionsText) {
        const options = [];
        const optionPatterns = [
            /([a-d])\)\s*([^a-d)]+?)(?=[a-d]\)|$)/gi,
            /\(([a-d])\)\s*([^(]+?)(?=\([a-d]\)|$)/gi
        ];
        
        let bestOptions = [];
        
        optionPatterns.forEach(pattern => {
            const currentOptions = [];
            let match;
            pattern.lastIndex = 0;
            
            while ((match = pattern.exec(optionsText)) !== null) {
                const label = match[1].toLowerCase();
                const text = match[2].trim();
                
                if (text.length > 0 && text.length < 200) {
                    currentOptions.push({
                        label: label,
                        text: text
                    });
                }
            }
            
            if (currentOptions.length > bestOptions.length) {
                bestOptions = currentOptions;
            }
        });
        
        return bestOptions;
    }

    /**
     * Detect chapter from content
     */
    detectChapterFromContent(text) {
        // Implementation would analyze content to detect chapter
        // This is a simplified version
        const chapterKeywords = {
            'Algebra': ['equation', 'polynomial', 'algebraic', 'variable'],
            'Geometry': ['triangle', 'circle', 'angle', 'area', 'perimeter'],
            'Arithmetic': ['percentage', 'ratio', 'proportion', 'average'],
            'Reasoning': ['logical', 'pattern', 'sequence', 'analogy'],
            'General Knowledge': ['history', 'geography', 'current affairs', 'politics']
        };
        
        const scores = {};
        for (const [chapter, keywords] of Object.entries(chapterKeywords)) {
            scores[chapter] = keywords.reduce((score, keyword) => {
                const regex = new RegExp(keyword, 'gi');
                const matches = text.match(regex) || [];
                return score + matches.length;
            }, 0);
        }
        
        const detectedChapter = Object.keys(scores).reduce((a, b) => 
            scores[a] > scores[b] ? a : b
        );
        
        return {
            chapter: detectedChapter,
            confidence: scores[detectedChapter] > 0 ? 'medium' : 'low',
            scores: scores
        };
    }

    /**
     * Extract questions from full text
     */
    async extractQuestionsFromText(fullText, pageResults, visualData) {
        // This would contain the main question extraction logic
        // For now, using the practice set detection as the primary method
        const questions = [];
        
        // Try practice set extraction first
        const practiceSets = this.detectPracticeSets(fullText);
        
        if (practiceSets.length > 0) {
            practiceSets.forEach(set => {
                questions.push(...set.questions);
            });
        } else {
            // Fallback to general question extraction
            const generalQuestions = this.extractGeneralQuestions(fullText);
            questions.push(...generalQuestions);
        }
        
        return questions;
    }

    /**
     * Extract general questions when no practice sets detected
     */
    extractGeneralQuestions(text) {
        const questions = [];
        const questionPattern = /(\d+)\.\s*([^?]*\?)\s*((?:[a-d]\)[^a-d)]*)+)/gi;
        
        let match;
        while ((match = questionPattern.exec(text)) !== null) {
            const questionNumber = parseInt(match[1]);
            const questionText = match[2].trim();
            const optionsText = match[3].trim();
            
            const options = this.extractOptionsFromText(optionsText);
            
            if (options.length >= 2) {
                questions.push({
                    id: `general_q_${questionNumber}`,
                    questionNumber: questionNumber,
                    questionText: questionText,
                    options: options,
                    correctAnswer: null,
                    subject: 'General',
                    chapter: 'General',
                    difficulty: 'Medium',
                    extractedFrom: 'PDF'
                });
            }
        }
        
        return questions;
    }

    /**
     * Show processing UI
     */
    showProcessingUI() {
        const processingDiv = document.getElementById('pdfProcessing');
        if (processingDiv) {
            processingDiv.style.display = 'block';
            processingDiv.innerHTML = `
                <div class="processing-content">
                    <div class="processing-spinner"></div>
                    <div class="processing-text" id="processingText">Initializing...</div>
                    <button class="btn btn--secondary" onclick="pdfProcessor.cancelProcessing = true">Cancel Processing</button>
                </div>
            `;
        }
    }

    /**
     * Update processing step
     */
    updateProcessingStep(message) {
        const processingText = document.getElementById('processingText');
        if (processingText) {
            processingText.textContent = message;
        }
        console.log('PDF Processing:', message);
    }

    /**
     * Hide processing UI
     */
    hideProcessingUI() {
        const processingDiv = document.getElementById('pdfProcessing');
        if (processingDiv) {
            processingDiv.style.display = 'none';
        }
        this.cancelProcessing = false;
    }

    /**
     * Show extracted questions for review
     */
    showExtractedQuestions(questions, metadata) {
        const previewDiv = document.getElementById('extractedQuestionsPreview');
        if (!previewDiv) return;

        previewDiv.innerHTML = `
            <div class="extraction-summary">
                <h3>📊 Extraction Summary</h3>
                <div class="summary-stats">
                    <div class="stat">
                        <span class="stat-number">${questions.length}</span>
                        <span class="stat-label">Questions Found</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">${metadata.subject}</span>
                        <span class="stat-label">Subject</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">${metadata.chapter}</span>
                        <span class="stat-label">Chapter</span>
                    </div>
                </div>
            </div>
            
            <div class="questions-preview">
                <h4>📝 Questions Preview</h4>
                <div class="questions-list">
                    ${questions.slice(0, 5).map((q, index) => `
                        <div class="question-preview-item">
                            <div class="question-number">Q${q.questionNumber || index + 1}</div>
                            <div class="question-content">
                                <div class="question-text">${q.questionText}</div>
                                <div class="question-options">
                                    ${q.options.map(opt => `<span class="option">${opt.label}) ${opt.text}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                ${questions.length > 5 ? `<div class="more-questions">... and ${questions.length - 5} more questions</div>` : ''}
            </div>
            
            <div class="preview-actions">
                <button class="btn btn--primary" onclick="pdfProcessor.confirmExtraction()">
                    ✅ Add ${questions.length} Questions
                </button>
                <button class="btn btn--secondary" onclick="pdfProcessor.discardExtraction()">
                    ❌ Discard
                </button>
            </div>
        `;
        
        previewDiv.style.display = 'block';
    }

    /**
     * Confirm extraction and add questions
     */
    confirmExtraction() {
        if (this.tempExtractedQuestions && window.questionManager) {
            const questions = this.tempExtractedQuestions.questions;
            const metadata = this.tempExtractedQuestions.metadata;
            
            // Add questions through QuestionManager
            questions.forEach(question => {
                window.questionManager.addQuestion(question);
            });
            
            alert(`✅ Successfully added ${questions.length} questions from ${metadata.filename}`);
            this.discardExtraction();
        }
    }

    /**
     * Discard extracted questions
     */
    discardExtraction() {
        this.tempExtractedQuestions = null;
        const previewDiv = document.getElementById('extractedQuestionsPreview');
        if (previewDiv) {
            previewDiv.style.display = 'none';
        }
    }
}

// Initialize global instance
if (typeof window !== 'undefined') {
    window.PDFProcessor = PDFProcessor;
    window.pdfProcessor = new PDFProcessor();
}