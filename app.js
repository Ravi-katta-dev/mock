// RRB Technician Grade-3 Signal Mock Test Application with Enhanced PDF Processing
// Complete JavaScript Application Logic

class MockTestApp {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('mockTestUsers')) || [];
        this.questions = JSON.parse(localStorage.getItem('mockTestQuestions')) || [];
        this.testResults = JSON.parse(localStorage.getItem('mockTestResults')) || [];
        this.uploadedPDFs = JSON.parse(localStorage.getItem('uploadedPDFs')) || [];
        this.currentTest = null;
        this.testSession = null;
        this.charts = {};
        this.currentPDF = null;
        this.pdfDoc = null;
        this.currentPage = 1;
        this.tempExtractedQuestions = null;
        this.currentExtractedQuestions = null;
        this.currentReviewIndex = 0;
        this.currentPDFFile = null;
        
        // Wait for DOM to be ready before initializing
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => this.initializeApp(), 100);
            });
        } else {
            setTimeout(() => this.initializeApp(), 100);
        }
    }

    initializeApp() {
        console.log('Initializing RRB Mock Test App...');
        this.loadSampleData();
        this.setupEventListeners();
        this.checkExistingUser();
        this.loadPDFJS();
        console.log('App initialization complete');
    }

    async loadPDFJS() {
        // Load PDF.js library
        if (typeof pdfjsLib === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = () => {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                console.log('PDF.js loaded successfully');
            };
            document.head.appendChild(script);
        }
    }

    loadSampleData() {
        // Load sample questions if none exist
        if (this.questions.length === 0) {
            const sampleQuestions = [
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
                    source: "Manual",
                    needsReview: false
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
                    source: "Manual",
                    needsReview: false
                },
                {
                    id: "q3",
                    text: "In a certain code, 'MONITOR' is written as 'LNMHSNQ'. How will 'DISPLAY' be written?",
                    options: ["CHROKZX", "CHRPKZX", "CHROKYX", "CHRPLYX"],
                    correctAnswer: 0,
                    explanation: "Each letter is moved one position back in the alphabet. D→C, I→H, S→R, P→O, L→K, A→Z, Y→X",
                    subject: "General Intelligence & Reasoning",
                    chapter: "Coding and Decoding",
                    difficulty: "Medium",
                    isPYQ: true,
                    source: "Manual",
                    needsReview: false
                },
                {
                    id: "q4",
                    text: "Which of the following is a conductor of electricity?",
                    options: ["Rubber", "Copper", "Glass", "Wood"],
                    correctAnswer: 1,
                    explanation: "Copper is a good conductor of electricity due to free electrons in its structure",
                    subject: "Basic Science & Engineering",
                    chapter: "Basic Electricity",
                    difficulty: "Easy",
                    isPYQ: false,
                    source: "Manual",
                    needsReview: false
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
                    source: "Manual",
                    needsReview: false
                },
                {
                    id: "q6",
                    text: "Which shortcut key is used to copy text in most applications?",
                    options: ["Ctrl+X", "Ctrl+C", "Ctrl+V", "Ctrl+Z"],
                    correctAnswer: 1,
                    explanation: "Ctrl+C is the standard shortcut for copying text or objects",
                    subject: "Computer Applications",
                    chapter: "Basic Computer Operations",
                    difficulty: "Easy",
                    isPYQ: true,
                    source: "Manual",
                    needsReview: false
                },
                {
                    id: "q7",
                    text: "What is the value of π (pi) approximately?",
                    options: ["3.14", "2.71", "1.41", "1.73"],
                    correctAnswer: 0,
                    explanation: "π (pi) is approximately 3.14159, commonly rounded to 3.14",
                    subject: "Mathematics",
                    chapter: "Geometry",
                    difficulty: "Easy",
                    isPYQ: true,
                    source: "Manual",
                    needsReview: false
                },
                {
                    id: "q8",
                    text: "If P + Q = 10 and P - Q = 4, what is the value of P?",
                    options: ["6", "7", "8", "9"],
                    correctAnswer: 1,
                    explanation: "Adding the equations: 2P = 14, therefore P = 7",
                    subject: "Mathematics",
                    chapter: "Algebra",
                    difficulty: "Medium",
                    isPYQ: false,
                    source: "Manual",
                    needsReview: false
                },
                {
                    id: "q9",
                    text: "Complete the series: 2, 6, 12, 20, ?",
                    options: ["28", "30", "32", "34"],
                    correctAnswer: 1,
                    explanation: "The differences are 4, 6, 8, so next difference is 10. 20 + 10 = 30",
                    subject: "General Intelligence & Reasoning",
                    chapter: "Number Series",
                    difficulty: "Medium",
                    isPYQ: true,
                    source: "Manual",
                    needsReview: false
                },
                {
                    id: "q10",
                    text: "What is Ohm's Law?",
                    options: ["V = IR", "P = VI", "E = mc²", "F = ma"],
                    correctAnswer: 0,
                    explanation: "Ohm's Law states that Voltage (V) equals Current (I) times Resistance (R)",
                    subject: "Basic Science & Engineering",
                    chapter: "Electrical Engineering",
                    difficulty: "Easy",
                    isPYQ: true,
                    source: "Manual",
                    needsReview: false
                }
            ];
            
            this.questions = sampleQuestions;
            this.saveQuestions();
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Welcome screen
        this.setupElementListener('createUserBtn', 'click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showUserModal();
        });

        // User management
        this.setupElementListener('saveUserBtn', 'click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.createUser();
        });

        this.setupElementListener('cancelUserBtn', 'click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.hideUserModal();
        });

        this.setupElementListener('switchUserBtn', 'click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showUserSelection();
        });

        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(link.dataset.section);
            });
        });

        // Question Bank
        this.setupElementListener('addQuestionBtn', 'click', (e) => {
            e.preventDefault();
            this.showAddQuestionModal();
        });

        this.setupElementListener('uploadQuestionsBtn', 'click', (e) => {
            e.preventDefault();
            this.showModal('pdfUploadModal');
        });

        this.setupElementListener('saveQuestion', 'click', (e) => {
            e.preventDefault();
            this.saveQuestion();
        });

        this.setupElementListener('cancelQuestion', 'click', (e) => {
            e.preventDefault();
            this.hideModal('questionModal');
        });

        // PDF Upload
        this.setupElementListener('uploadPdfBtn', 'click', (e) => {
            e.preventDefault();
            this.showModal('pdfUploadModal');
        });

        this.setupElementListener('pdfFileInput', 'change', (e) => {
            this.handlePDFFileSelect(e);
        });

        this.setupElementListener('uploadZone', 'click', (e) => {
            document.getElementById('pdfFileInput')?.click();
        });

        this.setupElementListener('processPDF', 'click', (e) => {
            e.preventDefault();
            this.processPDFForQuestions();
        });

        this.setupElementListener('cancelPDFUpload', 'click', (e) => {
            e.preventDefault();
            this.hideModal('pdfUploadModal');
        });

        // PDF Viewer
        this.setupElementListener('closePdfViewer', 'click', (e) => {
            e.preventDefault();
            this.closePDFViewer();
        });

        this.setupElementListener('prevPage', 'click', (e) => {
            e.preventDefault();
            this.prevPDFPage();
        });

        this.setupElementListener('nextPage', 'click', (e) => {
            e.preventDefault();
            this.nextPDFPage();
        });

        this.setupElementListener('zoomIn', 'click', (e) => {
            e.preventDefault();
            this.zoomPDF(1.2);
        });

        this.setupElementListener('zoomOut', 'click', (e) => {
            e.preventDefault();
            this.zoomPDF(0.8);
        });

        // Test Selection
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', () => {
                this.handleQuickAction(card.dataset.action);
            });
        });

        document.querySelectorAll('.test-type-card button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const testType = e.target.closest('.test-type-card').dataset.test;
                this.startTest(testType);
            });
        });

        this.setupElementListener('configureCustomTest', 'click', (e) => {
            e.preventDefault();
            this.showModal('customTestModal');
        });

        this.setupElementListener('startCustomTest', 'click', (e) => {
            e.preventDefault();
            this.startCustomTest();
        });

        this.setupElementListener('cancelCustomTest', 'click', (e) => {
            e.preventDefault();
            this.hideModal('customTestModal');
        });

        // Test Interface
        this.setupElementListener('nextQuestion', 'click', (e) => {
            e.preventDefault();
            this.nextQuestion();
        });

        this.setupElementListener('previousQuestion', 'click', (e) => {
            e.preventDefault();
            this.previousQuestion();
        });

        this.setupElementListener('markForReview', 'click', (e) => {
            e.preventDefault();
            this.markForReview();
        });

        this.setupElementListener('clearResponse', 'click', (e) => {
            e.preventDefault();
            this.clearResponse();
        });

        this.setupElementListener('submitTest', 'click', (e) => {
            e.preventDefault();
            this.submitTest();
        });

        // Analytics tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchAnalyticsTab(btn.dataset.tab);
            });
        });

        // Review filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterReviewQuestions(btn.dataset.filter);
            });
        });

        // Drag and drop for PDF upload
        const uploadZone = document.getElementById('uploadZone');
        if (uploadZone) {
            uploadZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadZone.classList.add('drag-over');
            });

            uploadZone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadZone.classList.remove('drag-over');
            });

            uploadZone.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadZone.classList.remove('drag-over');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handlePDFFile(files[0]);
                }
            });
        }

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });

        console.log('Event listeners setup complete');
    }

    setupElementListener(elementId, event, handler) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener(event, handler);
            console.log(`Event listener added for ${elementId}`);
        } else {
            console.warn(`Element ${elementId} not found`);
        }
    }

    // ===============================================
    // PDF HANDLING METHODS - ENHANCED VERSION
    // ===============================================

    handlePDFFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.handlePDFFile(file);
        }
    }

    handlePDFFile(file) {
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
                            <label class="form-label">Subject:</label>
                            <select id="pdfSubject" class="form-control">
                                <option value="Mathematics">Mathematics</option>
                                <option value="General Intelligence & Reasoning">General Intelligence & Reasoning</option>
                                <option value="Basic Science & Engineering">Basic Science & Engineering</option>
                                <option value="General Awareness">General Awareness</option>
                                <option value="Computer Applications">Computer Applications</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Chapter/Topic:</label>
                            <input type="text" id="pdfChapter" class="form-control" placeholder="Enter chapter or topic">
                        </div>
                    </div>
                </div>
            `;
            infoDiv.style.display = 'block';
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async processPDFForQuestions() {
        if (!this.currentPDFFile) {
            alert('Please select a PDF file first.');
            return;
        }

        const processingDiv = document.getElementById('processingStatus');
        if (processingDiv) {
            processingDiv.innerHTML = `
                <div class="processing-indicator">
                    <div class="spinner"></div>
                    <p>Processing PDF and extracting questions...</p>
                    <div class="progress-details">
                        <p id="processingStep">Extracting text from PDF...</p>
                    </div>
                </div>
            `;
            processingDiv.style.display = 'block';
        }

        try {
            const fileArrayBuffer = await this.currentPDFFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(fileArrayBuffer).promise;
            
            this.updateProcessingStep('Extracting text from pages...');
            
            let fullText = '';
            let pageTexts = [];
            
            // Extract text page by page for better processing
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                
                // Get text with position information for better parsing
                const pageItems = textContent.items.map(item => ({
                    text: item.str,
                    x: item.transform[4],
                    y: item.transform[5],
                    width: item.width,
                    height: item.height
                }));
                
                const pageText = this.reconstructPageText(pageItems);
                pageTexts.push(pageText);
                fullText += pageText + '\n\n--- PAGE_BREAK ---\n\n';
                
                this.updateProcessingStep(`Processing page ${i} of ${pdf.numPages}...`);
            }

            this.updateProcessingStep('Analyzing question structure...');
            
            // Enhanced text preprocessing
            const preprocessedText = this.preprocessPDFText(fullText);
            
            this.updateProcessingStep('Extracting questions...');
            
            // Multiple extraction strategies
            const extractedQuestions = this.extractQuestionsWithMultipleStrategies(preprocessedText, pageTexts);
            
            this.updateProcessingStep('Validating extracted questions...');
            
            // Filter and validate questions
            const validQuestions = this.validateAndFilterQuestions(extractedQuestions);
            
            if (validQuestions.length > 0) {
                this.showExtractedQuestionsPreview(validQuestions);
            } else {
                alert('No valid questions found in the PDF. The format might not be supported or the questions need manual formatting.');
                this.showExtractionTips();
            }

            // Store PDF information
            const pdfInfo = {
                id: 'pdf_' + Date.now(),
                name: this.currentPDFFile.name,
                size: this.currentPDFFile.size,
                subject: document.getElementById('pdfSubject')?.value || 'General',
                chapter: document.getElementById('pdfChapter')?.value || 'Miscellaneous',
                uploadDate: new Date().toISOString(),
                questionsExtracted: validQuestions.length,
                totalPages: pdf.numPages,
                data: fileArrayBuffer
            };

            this.uploadedPDFs.push(pdfInfo);
            this.savePDFs();

        } catch (error) {
            console.error('Error processing PDF:', error);
            alert('Error processing PDF. Please try again or use a different file.');
        } finally {
            if (processingDiv) {
                processingDiv.style.display = 'none';
            }
        }
    }

    updateProcessingStep(step) {
        const stepElement = document.getElementById('processingStep');
        if (stepElement) {
            stepElement.textContent = step;
        }
    }

    reconstructPageText(pageItems) {
        // Sort items by Y position (top to bottom) then X position (left to right)
        pageItems.sort((a, b) => {
            const yDiff = Math.abs(a.y - b.y);
            if (yDiff < 5) { // Same line
                return a.x - b.x;
            }
            return b.y - a.y; // Top to bottom (PDF coordinates are bottom-up)
        });

        let reconstructedText = '';
        let currentY = null;
        
        pageItems.forEach(item => {
            if (currentY !== null && Math.abs(item.y - currentY) > 5) {
                reconstructedText += '\n';
            }
            reconstructedText += item.text + ' ';
            currentY = item.y;
        });

        return reconstructedText.trim();
    }

    preprocessPDFText(text) {
        console.log('Preprocessing text of length:', text.length);
        
        let cleanedText = text
            // Remove page breaks
            .replace(/--- PAGE_BREAK ---/g, '\n')
            // Remove extra whitespace but preserve line structure
            .replace(/[ \t]+/g, ' ')
            .replace(/\n\s*\n/g, '\n')
            // Remove common PDF artifacts
            .replace(/\f/g, '')
            .replace(/\r/g, '')
            // Remove timestamps and percentages that don't belong to questions
            .replace(/\d{1,2}\/\d{1,2}\/\d{4}\s*-->\s*\d{1,2}:\d{2}\s*(AM|PM)\s*-\s*\d{1,2}:\d{2}\s*(AM|PM)/g, ' ')
            .replace(/\d+\.\d+%\s*(Attempted|Right|Wrong)/g, ' ')
            // Clean up question numbering variations
            .replace(/([Qq]uestion)\s*[:\-]?\s*(\d+)\s*[:\.\)]\s*/g, 'Q$2. ')
            .replace(/^(\d+)\s*[\.\)]\s*/gm, 'Q$1. ')
            // Normalize option formatting
            .replace(/\b([A-D])\s*[\)\.\]]\s*/g, '$1) ')
            .replace(/\(([a-d])\)\s*/g, (match, letter) => `${letter.toUpperCase()}) `)
            // Clean up multiple spaces
            .replace(/\s+/g, ' ')
            .trim();

        console.log('Cleaned text length:', cleanedText.length);
        return cleanedText;
    }

    extractQuestionsWithMultipleStrategies(text, pageTexts) {
        const allQuestions = [];
        
        // Strategy 1: Line-by-line parsing
        const strategy1Questions = this.extractQuestionsLineByLine(text);
        console.log('Strategy 1 found:', strategy1Questions.length, 'questions');
        
        // Strategy 2: Pattern-based extraction
        const strategy2Questions = this.extractQuestionsWithPatterns(text);
        console.log('Strategy 2 found:', strategy2Questions.length, 'questions');
        
        // Strategy 3: Block-based extraction
        const strategy3Questions = this.extractQuestionsBlockBased(text);
        console.log('Strategy 3 found:', strategy3Questions.length, 'questions');
        
        // Combine and deduplicate results
        const combinedQuestions = [
            ...strategy1Questions,
            ...strategy2Questions,
            ...strategy3Questions
        ];
        
        // Remove duplicates based on question text similarity
        const uniqueQuestions = this.removeDuplicateQuestions(combinedQuestions);
        console.log('Final unique questions:', uniqueQuestions.length);
        
        return uniqueQuestions;
    }

    extractQuestionsLineByLine(text) {
        const questions = [];
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        let currentQuestion = null;
        let optionCount = 0;
        let questionNumber = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Check if this line starts a new question
            const questionMatch = line.match(/^Q(\d+)\.\s*(.+)/);
            if (questionMatch) {
                // Save previous question if complete
                if (currentQuestion && this.isQuestionComplete(currentQuestion)) {
                    questions.push(this.finalizeQuestion(currentQuestion));
                }
                
                // Start new question
                questionNumber = parseInt(questionMatch[1]);
                currentQuestion = {
                    number: questionNumber,
                    text: questionMatch[2].trim(),
                    options: [],
                    optionsText: []
                };
                optionCount = 0;
                continue;
            }
            
            // Check if this line is an option
            if (currentQuestion) {
                const optionMatch = line.match(/^([A-D])\)\s*(.+)/);
                if (optionMatch && optionCount < 4) {
                    const optionLetter = optionMatch[1];
                    const optionText = optionMatch[2].trim();
                    
                    // Verify option sequence
                    const expectedLetter = String.fromCharCode(65 + optionCount);
                    if (optionLetter === expectedLetter) {
                        currentQuestion.options.push(optionText);
                        optionCount++;
                    }
                } else if (!line.match(/^[A-D]\)/)) {
                    // This might be continuation of question text
                    if (optionCount === 0 && currentQuestion.text.length < 200) {
                        currentQuestion.text += ' ' + line;
                    }
                }
            }
        }
        
        // Don't forget the last question
        if (currentQuestion && this.isQuestionComplete(currentQuestion)) {
            questions.push(this.finalizeQuestion(currentQuestion));
        }
        
        return questions;
    }

    extractQuestionsWithPatterns(text) {
        const questions = [];
        
        // More precise patterns with better boundary detection
        const patterns = [
            // Q1. Question? A) ... B) ... C) ... D) ...
            /Q(\d+)\.\s*([^?]+\?)\s*A\)\s*([^B]+)\s*B\)\s*([^C]+)\s*C\)\s*([^D]+)\s*D\)\s*([^Q]+?)(?=\s*Q\d+\.|$)/gi,
            
            // Question with number at start: 1. Question? A) ... B) ... C) ... D) ...
            /(\d+)\.\s*([^?]+\?)\s*A\)\s*([^B]+)\s*B\)\s*([^C]+)\s*C\)\s*([^D]+)\s*D\)\s*([^1-9]+?)(?=\s*\d+\.|$)/gi
        ];

        patterns.forEach((pattern, index) => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const questionNumber = parseInt(match[1]);
                const questionText = match[2].trim();
                const options = [
                    match[3].trim(),
                    match[4].trim(),
                    match[5].trim(),
                    match[6].trim()
                ];

                if (this.isValidQuestionData(questionText, options, questionNumber)) {
                    questions.push({
                        number: questionNumber,
                        text: questionText,
                        options: options,
                        source: `Pattern ${index + 1}`
                    });
                }
            }
        });

        return questions;
    }

    extractQuestionsBlockBased(text) {
        const questions = [];
        
        // Split text into potential question blocks
        const blocks = text.split(/(?=Q\d+\.)|(?=\d+\.)/);
        
        blocks.forEach(block => {
            block = block.trim();
            if (block.length < 20) return; // Skip very short blocks
            
            // Try to parse this block as a single question
            const questionMatch = block.match(/^(?:Q)?(\d+)\.\s*(.+?)(?:\s*A\)\s*(.+?)\s*B\)\s*(.+?)\s*C\)\s*(.+?)\s*D\)\s*(.+?))?$/s);
            
            if (questionMatch) {
                const questionNumber = parseInt(questionMatch[1]);
                let questionText = questionMatch[2];
                
                if (questionMatch[3] && questionMatch[4] && questionMatch[5] && questionMatch[6]) {
                    // Has all options in the match
                    const options = [
                        questionMatch[3].trim(),
                        questionMatch[4].trim(),
                        questionMatch[5].trim(),
                        questionMatch[6].trim()
                    ];
                    
                    // Clean question text (remove any option text that leaked in)
                    questionText = questionText.replace(/\s*[A-D]\).*$/s, '').trim();
                    
                    if (this.isValidQuestionData(questionText, options, questionNumber)) {
                        questions.push({
                            number: questionNumber,
                            text: questionText,
                            options: options,
                            source: 'Block parsing'
                        });
                    }
                }
            }
        });
        
        return questions;
    }

    isQuestionComplete(question) {
        return question && 
               question.text && 
               question.text.length > 10 && 
               question.options && 
               question.options.length === 4 &&
               question.options.every(opt => opt && opt.length > 0);
    }

    isValidQuestionData(questionText, options, questionNumber) {
        if (!questionText || questionText.length < 10 || questionText.length > 500) {
            return false;
        }
        
        if (!options || options.length !== 4) {
            return false;
        }
        
        // Check all options have content
        if (!options.every(opt => opt && opt.trim().length > 0)) {
            return false;
        }
        
        // Check for mixed content indicators
        const mixedIndicators = [
            /Q\d+\./,
            /\d+\.\d+%/,
            /\d{1,2}\/\d{1,2}\/\d{4}/,
            /Question\s+\d+/,
            /(Attempted|Right|Wrong)/
        ];
        
        if (mixedIndicators.some(indicator => indicator.test(questionText))) {
            return false;
        }
        
        return true;
    }

    finalizeQuestion(questionData) {
        return {
            id: 'pdf_q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            text: questionData.text.trim(),
            options: questionData.options.map(opt => opt.trim()),
            correctAnswer: 0, // Default, user will need to verify
            explanation: 'Extracted from PDF - please verify and add explanation',
            subject: document.getElementById('pdfSubject')?.value || 'General',
            chapter: document.getElementById('pdfChapter')?.value || 'PDF Extract',
            difficulty: this.guessDifficulty(questionData.text),
            isPYQ: false,
            source: `PDF: ${this.currentPDFFile.name}`,
            needsReview: true,
            questionNumber: questionData.number,
            extractionSource: questionData.source || 'Unknown'
        };
    }

    removeDuplicateQuestions(questions) {
        const unique = [];
        const seenTexts = new Set();
        
        questions.forEach(question => {
            const normalizedText = question.text.toLowerCase().replace(/\s+/g, ' ').trim();
            
            if (!seenTexts.has(normalizedText)) {
                seenTexts.add(normalizedText);
                unique.push(question);
            }
        });
        
        return unique.sort((a, b) => (a.number || 0) - (b.number || 0));
    }

    validateAndFilterQuestions(questions) {
        return questions.filter(question => {
            // Additional validation checks
            if (!question.text || question.text.length < 10) {
                console.warn(`Question ${question.number}: Text too short`);
                return false;
            }
            
            if (question.text.length > 300) {
                console.warn(`Question ${question.number}: Text too long, might contain mixed content`);
                return false;
            }
            
            if (!question.options || question.options.length !== 4) {
                console.warn(`Question ${question.number}: Invalid options`);
                return false;
            }
            
            // Check if any option is too long (might indicate mixed content)
            if (question.options.some(opt => opt.length > 100)) {
                console.warn(`Question ${question.number}: Option too long`);
                return false;
            }
            
            return true;
        });
    }

    showExtractionTips() {
        const tipsHtml = `
            <div class="extraction-tips">
                <h3>📋 Extraction Tips</h3>
                <p>To improve question extraction, please ensure your PDF has:</p>
                <ul>
                    <li>Clear question numbering (Q1., Q2., etc. or 1., 2., etc.)</li>
                    <li>Options marked as A), B), C), D)</li>
                    <li>Questions ending with question marks (?)</li>
                    <li>Consistent formatting throughout</li>
                </ul>
                <p>You can try manually formatting the PDF or add questions manually using the "Add Question" button.</p>
            </div>
        `;
        
        const previewDiv = document.getElementById('extractedQuestionsPreview');
        if (previewDiv) {
            previewDiv.innerHTML = tipsHtml;
            previewDiv.style.display = 'block';
        }
    }

    // Enhanced preview with better question display
    showExtractedQuestionsPreview(extractedQuestions) {
        const previewHtml = `
            <div class="extracted-questions-preview">
                <h3>✅ Extracted Questions Preview</h3>
                <div class="extraction-summary">
                    <p>Successfully extracted <strong>${extractedQuestions.length}</strong> questions</p>
                    <div class="extraction-stats">
                        <div class="stat-item">
                            <span class="stat-label">Total Questions:</span>
                            <span class="stat-value">${extractedQuestions.length}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Subject:</span>
                            <span class="stat-value">${document.getElementById('pdfSubject')?.value || 'General'}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Need Review:</span>
                            <span class="stat-value">${extractedQuestions.filter(q => q.needsReview).length}</span>
                        </div>
                    </div>
                </div>
                
                <div class="questions-preview-list">
                    ${extractedQuestions.slice(0, 3).map((q, index) => `
                        <div class="preview-question">
                            <div class="question-header">
                                <h4>Question ${q.questionNumber || index + 1}</h4>
                                <span class="extraction-method">${q.extractionSource || 'Auto'}</span>
                            </div>
                            <div class="question-content">
                                <p class="question-text"><strong>Q:</strong> ${q.text}</p>
                                <div class="preview-options">
                                    ${q.options.map((opt, i) => `
                                        <p class="option-item">
                                            <strong>${String.fromCharCode(65 + i)}:</strong> ${opt}
                                        </p>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="question-meta">
                                <span class="difficulty-badge difficulty-${q.difficulty}">${q.difficulty}</span>
                                <span class="subject-badge">${q.subject}</span>
                                ${q.needsReview ? '<span class="review-badge">Needs Review</span>' : ''}
                            </div>
                        </div>
                    `).join('')}
                    ${extractedQuestions.length > 3 ? `
                        <div class="more-questions">
                            <p>... and ${extractedQuestions.length - 3} more questions</p>
                        </div>
                    ` : ''}
                </div>
                
                <div class="preview-actions">
                    <button class="btn btn--primary" onclick="app.confirmExtractedQuestions()">
                        ✅ Add All Questions
                    </button>
                    <button class="btn btn--secondary" onclick="app.reviewExtractedQuestions()">
                        🔍 Review Individual Questions
                    </button>
                    <button class="btn btn--outline" onclick="app.discardExtractedQuestions()">
                        🗑️ Discard All
                    </button>
                </div>
            </div>
        `;

        const previewDiv = document.getElementById('extractedQuestionsPreview');
        if (previewDiv) {
            previewDiv.innerHTML = previewHtml;
            previewDiv.style.display = 'block';
        }

        // Store extracted questions temporarily
        this.tempExtractedQuestions = extractedQuestions;
    }

    confirmExtractedQuestions() {
        if (this.tempExtractedQuestions && this.tempExtractedQuestions.length > 0) {
            this.questions.push(...this.tempExtractedQuestions);
            this.saveQuestions();
            this.hideModal('pdfUploadModal');
            this.renderQuestionBank();
            alert(`Successfully added ${this.tempExtractedQuestions.length} questions from PDF!`);
            this.tempExtractedQuestions = null;
        }
    }

    reviewExtractedQuestions() {
        if (this.tempExtractedQuestions && this.tempExtractedQuestions.length > 0) {
            this.showModal('questionReviewModal');
            this.currentExtractedQuestions = [...this.tempExtractedQuestions];
            this.currentReviewIndex = 0;
            this.showQuestionForReview();
        }
    }

    discardExtractedQuestions() {
        if (confirm('Are you sure you want to discard all extracted questions?')) {
            this.tempExtractedQuestions = null;
            this.hideModal('pdfUploadModal');
        }
    }

    showQuestionForReview() {
        const question = this.currentExtractedQuestions[this.currentReviewIndex];
        const reviewContainer = document.getElementById('questionReviewContainer');
        
        if (reviewContainer && question) {
            reviewContainer.innerHTML = `
                <div class="question-review">
                    <div class="review-header">
                        <h3>🔍 Review Question ${this.currentReviewIndex + 1} of ${this.currentExtractedQuestions.length}</h3>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Question Text:</label>
                        <textarea class="form-control" id="reviewQuestionText" rows="3">${question.text}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Options:</label>
                        <div class="options-input">
                            <input type="text" class="form-control" id="reviewOption1" value="${question.options[0]}">
                            <input type="text" class="form-control" id="reviewOption2" value="${question.options[1]}">
                            <input type="text" class="form-control" id="reviewOption3" value="${question.options[2]}">
                            <input type="text" class="form-control" id="reviewOption4" value="${question.options[3]}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Correct Answer:</label>
                        <select class="form-control" id="reviewCorrectAnswer">
                            <option value="0" ${question.correctAnswer === 0 ? 'selected' : ''}>Option A</option>
                            <option value="1" ${question.correctAnswer === 1 ? 'selected' : ''}>Option B</option>
                            <option value="2" ${question.correctAnswer === 2 ? 'selected' : ''}>Option C</option>
                            <option value="3" ${question.correctAnswer === 3 ? 'selected' : ''}>Option D</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Explanation:</label>
                        <textarea class="form-control" id="reviewExplanation" rows="2">${question.explanation}</textarea>
                    </div>
                    <div class="review-actions">
                        <button class="btn btn--primary" onclick="app.saveReviewedQuestion()">💾 Save & Next</button>
                        <button class="btn btn--outline" onclick="app.skipQuestion()">⏭️ Skip</button>
                        <button class="btn btn--secondary" onclick="app.cancelReview()">❌ Cancel Review</button>
                    </div>
                </div>
            `;
        }
    }

    saveReviewedQuestion() {
        const reviewedQuestion = {
            ...this.currentExtractedQuestions[this.currentReviewIndex],
            text: document.getElementById('reviewQuestionText')?.value || '',
            options: [
                document.getElementById('reviewOption1')?.value || '',
                document.getElementById('reviewOption2')?.value || '',
                document.getElementById('reviewOption3')?.value || '',
                document.getElementById('reviewOption4')?.value || ''
            ],
            correctAnswer: parseInt(document.getElementById('reviewCorrectAnswer')?.value || '0'),
            explanation: document.getElementById('reviewExplanation')?.value || '',
            needsReview: false
        };

        this.questions.push(reviewedQuestion);
        this.currentReviewIndex++;

        if (this.currentReviewIndex >= this.currentExtractedQuestions.length) {
            // Review complete
            this.saveQuestions();
            this.hideModal('questionReviewModal');
            this.hideModal('pdfUploadModal');
            this.renderQuestionBank();
            alert(`Successfully reviewed and added ${this.currentReviewIndex} questions!`);
        } else {
            this.showQuestionForReview();
        }
    }

    skipQuestion() {
        this.currentReviewIndex++;
        if (this.currentReviewIndex >= this.currentExtractedQuestions.length) {
            this.hideModal('questionReviewModal');
            this.hideModal('pdfUploadModal');
            this.saveQuestions();
            this.renderQuestionBank();
            alert('Question review completed!');
        } else {
            this.showQuestionForReview();
        }
    }

    cancelReview() {
        this.hideModal('questionReviewModal');
    }

    guessDifficulty(questionText) {
        const text = questionText.toLowerCase();
        
        const hardIndicators = [
            'calculate', 'derive', 'prove', 'analyze', 'evaluate', 'synthesize',
            'algorithm', 'complex', 'advanced', 'sophisticated', 'implement'
        ];
        
        const mediumIndicators = [
            'compare', 'explain', 'difference', 'why', 'how', 'relationship',
            'interpret', 'apply', 'understand', 'determine'
        ];
        
        const easyIndicators = [
            'what', 'which', 'who', 'when', 'where', 'define', 'list',
            'identify', 'recall', 'remember', 'name', 'state'
        ];

        if (hardIndicators.some(indicator => text.includes(indicator))) {
            return 'Hard';
        } else if (mediumIndicators.some(indicator => text.includes(indicator))) {
            return 'Medium';
        } else if (easyIndicators.some(indicator => text.includes(indicator))) {
            return 'Easy';
        } else {
            return 'Medium'; // Default
        }
    }

    // ===============================================
    // PDF VIEWER METHODS
    // ===============================================

    async openPDFViewer(pdfInfo) {
        this.currentPDF = pdfInfo;
        const viewer = document.getElementById('pdfViewer');
        if (viewer) {
            viewer.classList.remove('hidden');
            
            try {
                this.pdfDoc = await pdfjsLib.getDocument(pdfInfo.data).promise;
                this.currentPage = 1;
                this.renderPDFPage();
                this.updatePDFControls();
            } catch (error) {
                console.error('Error loading PDF:', error);
                alert('Error loading PDF');
            }
        }
    }

    async renderPDFPage() {
        if (!this.pdfDoc) return;

        try {
            const page = await this.pdfDoc.getPage(this.currentPage);
            const canvas = document.getElementById('pdfCanvas');
            const context = canvas.getContext('2d');
            
            const scale = parseFloat(canvas.dataset.scale || '1.5');
            const viewport = page.getViewport({ scale: scale });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

        } catch (error) {
            console.error('Error rendering PDF page:', error);
        }
    }

    updatePDFControls() {
        const pageInfo = document.getElementById('pageInfo');
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');

        if (pageInfo && this.pdfDoc) {
            pageInfo.textContent = `Page ${this.currentPage} of ${this.pdfDoc.numPages}`;
        }

        if (prevBtn) {
            prevBtn.disabled = this.currentPage <= 1;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= (this.pdfDoc?.numPages || 1);
        }
    }

    prevPDFPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderPDFPage();
            this.updatePDFControls();
        }
    }

    nextPDFPage() {
        if (this.pdfDoc && this.currentPage < this.pdfDoc.numPages) {
            this.currentPage++;
            this.renderPDFPage();
            this.updatePDFControls();
        }
    }

    zoomPDF(factor) {
        const canvas = document.getElementById('pdfCanvas');
        if (canvas) {
            const currentScale = parseFloat(canvas.dataset.scale || '1.5');
            const newScale = Math.max(0.5, Math.min(3.0, currentScale * factor)); // Limit zoom range
            canvas.dataset.scale = newScale.toString();
            this.renderPDFPage();
        }
    }

    closePDFViewer() {
        const viewer = document.getElementById('pdfViewer');
        if (viewer) {
            viewer.classList.add('hidden');
        }
        this.currentPDF = null;
        this.pdfDoc = null;
    }

    // ===============================================
    // STUDY MATERIALS MANAGEMENT
    // ===============================================

    renderStudyMaterials() {
        const pdfList = document.getElementById('pdfList');
        if (!pdfList) return;

        if (this.uploadedPDFs.length === 0) {
            pdfList.innerHTML = `
                <div class="no-pdfs">
                    <h3>📄 No PDF Materials</h3>
                    <p>No PDF materials uploaded yet.</p>
                    <button class="btn btn--primary" onclick="app.showModal('pdfUploadModal')">📤 Upload Your First PDF</button>
                </div>
            `;
            return;
        }

        pdfList.innerHTML = this.uploadedPDFs.map(pdf => `
            <div class="pdf-item">
                <div class="pdf-info">
                    <h4>📄 ${pdf.name}</h4>
                    <p><strong>Subject:</strong> ${pdf.subject} - ${pdf.chapter}</p>
                    <div class="pdf-stats">
                        <span class="stat">📏 Size: ${this.formatFileSize(pdf.size)}</span>
                        <span class="stat">❓ Questions: ${pdf.questionsExtracted}</span>
                        <span class="stat">📅 Uploaded: ${new Date(pdf.uploadDate).toLocaleDateString()}</span>
                        ${pdf.totalPages ? `<span class="stat">📄 Pages: ${pdf.totalPages}</span>` : ''}
                    </div>
                </div>
                <div class="pdf-actions">
                    <button class="btn btn--primary btn--sm" onclick="app.openPDFViewer(${JSON.stringify(pdf).replace(/"/g, '&quot;')})">👁️ View PDF</button>
                    <button class="btn btn--secondary btn--sm" onclick="app.deletePDF('${pdf.id}')">🗑️ Delete</button>
                </div>
            </div>
        `).join('');
    }

    deletePDF(pdfId) {
        if (confirm('Are you sure you want to delete this PDF and all its extracted questions?')) {
            // Find PDF to get its name
            const pdf = this.uploadedPDFs.find(pdf => pdf.id === pdfId);
            const pdfName = pdf?.name;
            
            // Remove PDF
            this.uploadedPDFs = this.uploadedPDFs.filter(pdf => pdf.id !== pdfId);
            this.savePDFs();

            // Remove questions from this PDF
            if (pdfName) {
                this.questions = this.questions.filter(q => q.source !== `PDF: ${pdfName}`);
                this.saveQuestions();
            }

            this.renderStudyMaterials();
            this.renderQuestionBank();
            this.updateDashboard();
        }
    }

    // ===============================================
    // USER MANAGEMENT
    // ===============================================

    checkExistingUser() {
        console.log('Checking existing user...', this.users.length);
        if (this.users.length > 0) {
            this.currentUser = this.users[0];
            console.log('Found existing user:', this.currentUser.name);
            this.showMainApp();
        } else {
            console.log('No existing user found, showing welcome screen');
            this.showWelcomeScreen();
        }
    }

    showWelcomeScreen() {
        console.log('Showing welcome screen');
        const welcomeScreen = document.getElementById('welcomeScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (welcomeScreen) {
            welcomeScreen.style.display = 'flex';
            welcomeScreen.classList.remove('hidden');
        }
        if (mainApp) {
            mainApp.style.display = 'none';
            mainApp.classList.add('hidden');
        }
    }

    showMainApp() {
        console.log('Showing main app for user:', this.currentUser?.name);
        const welcomeScreen = document.getElementById('welcomeScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (welcomeScreen) {
            welcomeScreen.style.display = 'none';
            welcomeScreen.classList.add('hidden');
        }
        if (mainApp) {
            mainApp.style.display = 'grid';
            mainApp.classList.remove('hidden');
        }
        
        const currentUserSpan = document.getElementById('currentUser');
        if (currentUserSpan && this.currentUser) {
            currentUserSpan.textContent = `👋 Welcome, ${this.currentUser.name}!`;
        }
        
        this.updateDashboard();
        this.renderQuestionBank();
        this.renderStudyMaterials();
    }

    showUserModal() {
        console.log('Showing user modal');
        const modal = document.getElementById('userModal');
        const nameInput = document.getElementById('userName');
        
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.remove('hidden');
        }
        
        if (nameInput) {
            nameInput.value = '';
            nameInput.focus();
        }
    }

    hideUserModal() {
        console.log('Hiding user modal');
        const modal = document.getElementById('userModal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.add('hidden');
        }
    }

    hideAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
            modal.classList.add('hidden');
        });
    }

    createUser() {
        console.log('Creating user...');
        const nameInput = document.getElementById('userName');
        if (!nameInput) {
            console.error('Name input not found');
            alert('Error: Name input field not found');
            return;
        }
        
        const name = nameInput.value.trim();
        console.log('Name entered:', name);
        
        if (!name) {
            alert('Please enter a name');
            nameInput.focus();
            return;
        }

        const user = {
            id: 'user_' + Date.now(),
            name: name,
            createdAt: new Date().toISOString(),
            totalTests: 0,
            averageScore: 0
        };

        console.log('Created user object:', user);
        
        this.users.push(user);
        this.currentUser = user;
        this.saveUsers();
        
        console.log('User saved successfully');
        
        // Hide modal first
        this.hideUserModal();
        
        // Clear the input
        nameInput.value = '';
        
        // Show main app after short delay
        setTimeout(() => {
            this.showMainApp();
        }, 200);
    }

    showUserSelection() {
        if (this.users.length === 0) {
            alert('No users found. Please create a user first.');
            return;
        }
        
        const userList = this.users.map((user, index) => `${index + 1}. ${user.name}`).join('\n');
        const selection = prompt(`Select user:\n${userList}\n\nEnter number:`);
        
        if (selection && !isNaN(selection)) {
            const index = parseInt(selection) - 1;
            if (index >= 0 && index < this.users.length) {
                this.currentUser = this.users[index];
                this.showMainApp();
            }
        }
    }

    // ===============================================
    // NAVIGATION AND UI
    // ===============================================

    switchSection(sectionId) {
        console.log('Switching to section:', sectionId);
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Show section
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Load section-specific data
        if (sectionId === 'analytics') {
            setTimeout(() => {
                this.loadAnalytics();
            }, 100);
        } else if (sectionId === 'studyMaterials') {
            this.renderStudyMaterials();
        }
    }

    updateDashboard() {
        if (!this.currentUser) return;
        
        const userResults = this.testResults.filter(result => result.userId === this.currentUser.id);
        
        const elements = {
            'totalTests': userResults.length,
            'totalQuestions': this.questions.length,
            'averageScore': userResults.length > 0 ? 
                Math.round(userResults.reduce((sum, result) => sum + result.score, 0) / userResults.length) + '%' : '0%',
            'bestScore': userResults.length > 0 ? 
                Math.max(...userResults.map(result => result.score)) + '%' : '0%'
        };
        
        Object.keys(elements).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = elements[id];
            }
        });
    }

    // ===============================================
    // QUESTION BANK MANAGEMENT
    // ===============================================

    showAddQuestionModal() {
        const titleEl = document.getElementById('questionModalTitle');
        const formEl = document.getElementById('questionForm');
        
        if (titleEl) titleEl.textContent = '➕ Add Question';
        if (formEl) formEl.reset();
        
        this.showModal('questionModal');
    }

    editQuestion(questionId) {
        const question = this.questions.find(q => q.id === questionId);
        if (!question) return;

        const titleEl = document.getElementById('questionModalTitle');
        if (titleEl) titleEl.textContent = '✏️ Edit Question';
        
        // Fill form fields
        const fields = {
            'questionTextInput': question.text,
            'option1': question.options[0],
            'option2': question.options[1],
            'option3': question.options[2],
            'option4': question.options[3],
            'correctAnswerSelect': question.correctAnswer,
            'explanationInput': question.explanation,
            'subjectSelect': question.subject,
            'chapterInput': question.chapter,
            'difficultySelect': question.difficulty
        };
        
        Object.keys(fields).forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) field.value = fields[fieldId];
        });
        
        const pyqCheckbox = document.getElementById('isPyqCheckbox');
        if (pyqCheckbox) pyqCheckbox.checked = question.isPYQ;

        const saveBtn = document.getElementById('saveQuestion');
        if (saveBtn) saveBtn.dataset.editingId = questionId;
        
        this.showModal('questionModal');
    }

    saveQuestion() {
        const form = document.getElementById('questionForm');
        if (!form || !form.checkValidity()) {
            if (form) form.reportValidity();
            return;
        }

        const saveBtn = document.getElementById('saveQuestion');
        const editingId = saveBtn?.dataset.editingId;
        
        const questionData = {
            id: editingId || 'q_' + Date.now(),
            text: document.getElementById('questionTextInput')?.value || '',
            options: [
                document.getElementById('option1')?.value || '',
                document.getElementById('option2')?.value || '',
                document.getElementById('option3')?.value || '',
                document.getElementById('option4')?.value || ''
            ],
            correctAnswer: parseInt(document.getElementById('correctAnswerSelect')?.value || '0'),
            explanation: document.getElementById('explanationInput')?.value || '',
            subject: document.getElementById('subjectSelect')?.value || '',
            chapter: document.getElementById('chapterInput')?.value || '',
            difficulty: document.getElementById('difficultySelect')?.value || '',
            isPYQ: document.
