// RRB Technician Grade-3 Signal Mock Test Application with Enhanced PDF Processing

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
        console.log('Initializing app...');
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
                    explanation: "Each letter is moved one position back in the alphabet. D→C, I→H, S→R, P→O, L→K, A→Z, Y→X",
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
                    explanation: "Copper is a good conductor of electricity due to free electrons in its structure",
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
                    source: "Manual"
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
                    source: "Manual"
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
                    source: "Manual"
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
                    source: "Manual"
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
                    source: "Manual"
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

    // PDF Handling Methods
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
                    <h4>${file.name}</h4>
                    <p>Size: ${this.formatFileSize(file.size)}</p>
                    <p>Type: ${file.type}</p>
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
                <h3>Extraction Tips</h3>
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

    showExtractedQuestionsPreview(extractedQuestions) {
        const previewHtml = `
            <div class="extracted-questions-preview">
                <h3>Extracted Questions Preview</h3>
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
                        Add All Questions
                    </button>
                    <button class="btn btn--secondary" onclick="app.reviewExtractedQuestions()">
                        Review Individual Questions
                    </button>
                    <button class="btn btn--outline" onclick="app.discardExtractedQuestions()">
                        Discard All
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
                        <h3>Review Question ${this.currentReviewIndex + 1} of ${this.currentExtractedQuestions.length}</h3>
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
                        <button class="btn btn--primary" onclick="app.saveReviewedQuestion()">Save & Next</button>
                        <button class="btn btn--outline" onclick="app.skipQuestion()">Skip</button>
                        <button class="btn btn--secondary" onclick="app.cancelReview()">Cancel Review</button>
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

    // PDF Viewer Methods
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
            
            const viewport = page.getViewport({ scale: 1.5 });
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
        // Implement zoom functionality
        const canvas = document.getElementById('pdfCanvas');
        if (canvas) {
            const currentScale = parseFloat(canvas.dataset.scale || '1.5');
            const newScale = currentScale * factor;
            canvas.dataset.scale = newScale.toString();
            this.renderPDFPageWithScale(newScale);
        }
    }

    async renderPDFPageWithScale(scale) {
        if (!this.pdfDoc) return;

        try {
            const page = await this.pdfDoc.getPage(this.currentPage);
            const canvas = document.getElementById('pdfCanvas');
            const context = canvas.getContext('2d');
            
            const viewport = page.getViewport({ scale: scale });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

        } catch (error) {
            console.error('Error rendering PDF page with scale:', error);
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

    renderStudyMaterials() {
        const pdfList = document.getElementById('pdfList');
        if (!pdfList) return;

        if (this.uploadedPDFs.length === 0) {
            pdfList.innerHTML = `
                <div class="no-pdfs">
                    <p>No PDF materials uploaded yet.</p>
                    <button class="btn btn--primary" onclick="app.showModal('pdfUploadModal')">Upload Your First PDF</button>
                </div>
            `;
            return;
        }

        pdfList.innerHTML = this.uploadedPDFs.map(pdf => `
            <div class="pdf-item">
                <div class="pdf-info">
                    <h4>${pdf.name}</h4>
                    <p>${pdf.subject} - ${pdf.chapter}</p>
                    <div class="pdf-stats">
                        <span class="stat">Size: ${this.formatFileSize(pdf.size)}</span>
                        <span class="stat">Questions: ${pdf.questionsExtracted}</span>
                        <span class="stat">Uploaded: ${new Date(pdf.uploadDate).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="pdf-actions">
                    <button class="btn btn--primary btn--sm" onclick="app.openPDFViewer(${JSON.stringify(pdf).replace(/"/g, '&quot;')})">View PDF</button>
                    <button class="btn btn--secondary btn--sm" onclick="app.deletePDF('${pdf.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    deletePDF(pdfId) {
        if (confirm('Are you sure you want to delete this PDF and all its extracted questions?')) {
            // Remove PDF
            this.uploadedPDFs = this.uploadedPDFs.filter(pdf => pdf.id !== pdfId);
            this.savePDFs();

            // Remove questions from this PDF
            const pdfName = this.uploadedPDFs.find(pdf => pdf.id === pdfId)?.name;
            if (pdfName) {
                this.questions = this.questions.filter(q => q.source !== `PDF: ${pdfName}`);
                this.saveQuestions();
            }

            this.renderStudyMaterials();
            this.renderQuestionBank();
        }
    }

    // Enhanced question bank methods
    renderQuestionBank() {
        const tbody = document.getElementById('questionsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        this.questions.forEach(question => {
            const row = document.createElement('tr');
            const sourceColor = question.source.startsWith('PDF:') ? 'var(--color-warning)' : 'var(--color-success)';
            const needsReviewBadge = question.needsReview ? '<span class="review-badge">Needs Review</span>' : '';
            
            row.innerHTML = `
                <td>
                    <div class="question-preview">${question.text}</div>
                    ${needsReviewBadge}
                </td>
                <td>${question.subject}</td>
                <td>${question.chapter}</td>
                <td>
                    <span class="difficulty-badge difficulty-${question.difficulty}">
                        ${question.difficulty}
                    </span>
                </td>
                <td>
                    ${question.isPYQ ? '<span class="pyq-badge">PYQ</span>' : ''}
                </td>
                <td>
                    <span class="source-badge" style="color: ${sourceColor}; font-size: var(--font-size-xs);">
                        ${question.source}
                    </span>
                </td>
                <td>
                    <button class="btn btn--sm btn--secondary" onclick="app.editQuestion('${question.id}')">Edit</button>
                    <button class="btn btn--sm btn--outline" onclick="app.deleteQuestion('${question.id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // User Management Methods
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
            currentUserSpan.textContent = `Welcome, ${this.currentUser.name}!`;
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

    // Navigation Methods
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

    // Question Management Methods
    showAddQuestionModal() {
        const titleEl = document.getElementById('questionModalTitle');
        const formEl = document.getElementById('questionForm');
        
        if (titleEl) titleEl.textContent = 'Add Question';
        if (formEl) formEl.reset();
        
        this.showModal('questionModal');
    }

    editQuestion(questionId) {
        const question = this.questions.find(q => q.id === questionId);
        if (!question) return;

        const titleEl = document.getElementById('questionModalTitle');
        if (titleEl) titleEl.textContent = 'Edit Question';
        
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
            isPYQ: document.getElementById('isPyqCheckbox')?.checked || false,
            source: 'Manual',
            needsReview: false
        };

        if (editingId) {
            const index = this.questions.findIndex(q => q.id === editingId);
            if (index !== -1) {
                this.questions[index] = questionData;
            }
        } else {
            this.questions.push(questionData);
        }

        this.saveQuestions();
        this.renderQuestionBank();
        this.hideModal('questionModal');
        
        if (saveBtn) delete saveBtn.dataset.editingId;
    }

    deleteQuestion(questionId) {
        if (confirm('Are you sure you want to delete this question?')) {
            this.questions = this.questions.filter(q => q.id !== questionId);
            this.saveQuestions();
            this.renderQuestionBank();
        }
    }

    // Test Management Methods
    handleQuickAction(action) {
        switch(action) {
            case 'fullMockTest':
                this.startTest('fullMock');
                break;
            case 'customTest':
                this.showModal('customTestModal');
                break;
            case 'pyqTest':
                this.startTest('pyq');
                break;
        }
    }

    startTest(testType) {
        let testConfig = {};
        
        switch(testType) {
            case 'fullMock':
                testConfig = {
                    title: 'Full Mock Test',
                    duration: 5, // 5 minutes for demo
                    subjects: {
                        'Mathematics': 2,
                        'General Intelligence & Reasoning': 2,
                        'Basic Science & Engineering': 3,
                        'General Awareness': 1,
                        'Computer Applications': 2
                    },
                    totalQuestions: 10
                };
                break;
            case 'pyq':
                testConfig = {
                    title: 'Previous Year Questions Test',
                    duration: 3, // 3 minutes for demo
                    subjects: {
                        'Mathematics': 2,
                        'General Intelligence & Reasoning': 2,
                        'Basic Science & Engineering': 3,
                        'General Awareness': 1,
                        'Computer Applications': 2
                    },
                    totalQuestions: 10,
                    pyqOnly: true
                };
                break;
            case 'subjectWise':
                const subjectSelect = document.querySelector('.test-subject-select');
                const subject = subjectSelect ? subjectSelect.value : 'Mathematics';
                testConfig = {
                    title: `${subject} Test`,
                    duration: 2, // 2 minutes for demo
                    subjects: { [subject]: 5 },
                    totalQuestions: 5
                };
                break;
        }

        this.generateTest(testConfig);
    }

    startCustomTest() {
        const totalQuestionsInput = document.getElementById('totalQuestionsInput');
        const testDurationInput = document.getElementById('testDurationInput');
        
        const totalQuestions = totalQuestionsInput ? parseInt(totalQuestionsInput.value) : 10;
        const duration = testDurationInput ? parseInt(testDurationInput.value) : 5;
        
        const subjects = {};
        document.querySelectorAll('.subject-count').forEach(input => {
            const count = parseInt(input.value) || 0;
            if (count > 0) {
                subjects[input.dataset.subject] = count;
            }
        });

        const testConfig = {
            title: 'Custom Test',
            duration: duration,
            subjects: subjects,
            totalQuestions: totalQuestions
        };

        this.hideModal('customTestModal');
        this.generateTest(testConfig);
    }

    generateTest(config) {
        let selectedQuestions = [];
        
        // Select questions based on subjects
        for (const [subject, count] of Object.entries(config.subjects)) {
            let subjectQuestions = this.questions.filter(q => q.subject === subject);
            
            if (config.pyqOnly) {
                subjectQuestions = subjectQuestions.filter(q => q.isPYQ);
            }
            
            // Shuffle and select required count
            subjectQuestions = this.shuffleArray([...subjectQuestions]);
            selectedQuestions.push(...subjectQuestions.slice(0, Math.min(count, subjectQuestions.length)));
        }

        // Shuffle final question order
        selectedQuestions = this.shuffleArray(selectedQuestions);

        if (selectedQuestions.length === 0) {
            alert('No questions available for the selected criteria. Please add questions to the question bank first.');
            return;
        }

        // Create test session
        this.testSession = {
            id: 'test_' + Date.now(),
            config: config,
            questions: selectedQuestions,
            answers: new Array(selectedQuestions.length).fill(-1),
            timeSpent: new Array(selectedQuestions.length).fill(0),
            marked: new Array(selectedQuestions.length).fill(false),
            currentQuestion: 0,
            startTime: Date.now(),
            duration: config.duration * 60 * 1000 // Convert to milliseconds
        };

        this.switchSection('testInterface');
        setTimeout(() => {
            this.initializeTestInterface();
        }, 200);
    }

    initializeTestInterface() {
        const testTitleEl = document.getElementById('testTitle');
        if (testTitleEl) {
            testTitleEl.textContent = this.testSession.config.title;
        }
        
        this.startTimer();
        this.renderQuestion();
        this.renderQuestionPalette();
    }

    startTimer() {
        const endTime = this.testSession.startTime + this.testSession.duration;
        
        this.testSession.timer = setInterval(() => {
            const remaining = endTime - Date.now();
            
            if (remaining <= 0) {
                this.submitTest();
                return;
            }
            
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            const timeRemainingEl = document.getElementById('timeRemaining');
            if (timeRemainingEl) {
                timeRemainingEl.textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    renderQuestion() {
        if (!this.testSession || !this.testSession.questions.length) return;
        
        const question = this.testSession.questions[this.testSession.currentQuestion];
        const questionNum = this.testSession.currentQuestion + 1;
        
        const elements = {
            'currentQuestionNum': questionNum,
            'testProgress': `Question ${questionNum} of ${this.testSession.questions.length}`,
            'questionText': question.text
        };
        
        Object.keys(elements).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = elements[id];
        });
        
        const optionsHtml = question.options.map((option, index) => `
            <div class="option ${this.testSession.answers[this.testSession.currentQuestion] === index ? 'selected' : ''}" 
                 onclick="app.selectOption(${index})">
                <input type="radio" name="question_${this.testSession.currentQuestion}" 
                       value="${index}" ${this.testSession.answers[this.testSession.currentQuestion] === index ? 'checked' : ''}>
                <span>${String.fromCharCode(65 + index)}. ${option}</span>
            </div>
        `).join('');
        
        const questionOptionsEl = document.getElementById('questionOptions');
        if (questionOptionsEl) {
            questionOptionsEl.innerHTML = optionsHtml;
        }
        
        // Update navigation buttons
        const prevBtn = document.getElementById('previousQuestion');
        const nextBtn = document.getElementById('nextQuestion');
        
        if (prevBtn) prevBtn.disabled = this.testSession.currentQuestion === 0;
        if (nextBtn) nextBtn.disabled = this.testSession.currentQuestion === this.testSession.questions.length - 1;
            
        // Update mark for review button
        const markBtn = document.getElementById('markForReview');
        if (markBtn) {
            markBtn.textContent = this.testSession.marked[this.testSession.currentQuestion] ? 
                'Unmark for Review' : 'Mark for Review';
        }
    }

    selectOption(optionIndex) {
        this.testSession.answers[this.testSession.currentQuestion] = optionIndex;
        this.renderQuestion();
        this.renderQuestionPalette();
    }

    clearResponse() {
        this.testSession.answers[this.testSession.currentQuestion] = -1;
        this.renderQuestion();
        this.renderQuestionPalette();
    }

    markForReview() {
        const currentIdx = this.testSession.currentQuestion;
        this.testSession.marked[currentIdx] = !this.testSession.marked[currentIdx];
        this.renderQuestion();
        this.renderQuestionPalette();
    }

    nextQuestion() {
        if (this.testSession.currentQuestion < this.testSession.questions.length - 1) {
            this.testSession.currentQuestion++;
            this.renderQuestion();
            this.renderQuestionPalette();
        }
    }

    previousQuestion() {
        if (this.testSession.currentQuestion > 0) {
            this.testSession.currentQuestion--;
            this.renderQuestion();
            this.renderQuestionPalette();
        }
    }

    renderQuestionPalette() {
        const palette = document.getElementById('questionPalette');
        if (!palette) return;
        
        palette.innerHTML = '';
        
        this.testSession.questions.forEach((_, index) => {
            const item = document.createElement('div');
            item.className = 'palette-item';
            item.textContent = index + 1;
            item.onclick = () => this.jumpToQuestion(index);
            
            // Determine status
            if (index === this.testSession.currentQuestion) {
                item.classList.add('current');
            } else if (this.testSession.answers[index] !== -1) {
                item.classList.add('answered');
            } else {
                item.classList.add('not-answered');
            }
            
            if (this.testSession.marked[index]) {
                item.classList.add('marked');
            }
            
            palette.appendChild(item);
        });
    }

    jumpToQuestion(index) {
        this.testSession.currentQuestion = index;
        this.renderQuestion();
        this.renderQuestionPalette();
    }

    submitTest() {
        if (this.testSession.timer) {
            clearInterval(this.testSession.timer);
        }
        
        if (!confirm('Are you sure you want to submit the test?')) {
            return;
        }
        
        // Calculate results
        let correctAnswers = 0;
        let incorrectAnswers = 0;
        let unattempted = 0;
        
        this.testSession.questions.forEach((question, index) => {
            const userAnswer = this.testSession.answers[index];
            if (userAnswer === -1) {
                unattempted++;
            } else if (userAnswer === question.correctAnswer) {
                correctAnswers++;
            } else {
                incorrectAnswers++;
            }
        });
        
        const score = correctAnswers - (incorrectAnswers * 0.33);
        const percentage = Math.round((score / this.testSession.questions.length) * 100);
        
        // Save result
        const result = {
            id: this.testSession.id,
            userId: this.currentUser.id,
            testType: this.testSession.config.title,
            totalQuestions: this.testSession.questions.length,
            correctAnswers: correctAnswers,
            incorrectAnswers: incorrectAnswers,
            unattempted: unattempted,
            score: Math.max(0, percentage),
            rawScore: Math.max(0, score),
            timeSpent: Date.now() - this.testSession.startTime,
            completedAt: new Date().toISOString(),
            questions: this.testSession.questions,
            answers: this.testSession.answers,
            marked: this.testSession.marked
        };
        
        this.testResults.push(result);
        this.saveTestResults();
        
        // Update user stats
        this.currentUser.totalTests++;
        const userResults = this.testResults.filter(r => r.userId === this.currentUser.id);
        this.currentUser.averageScore = userResults.reduce((sum, r) => sum + r.score, 0) / userResults.length;
        this.saveUsers();
        
        this.currentTest = result;
        this.showTestReview();
    }

    showTestReview() {
        this.switchSection('testReview');
        setTimeout(() => {
            this.renderTestReview();
        }, 100);
    }

    renderTestReview() {
        const result = this.currentTest;
        if (!result) return;
        
        // Render summary
        const summaryHtml = `
            <div class="summary-grid">
                <div class="summary-item">
                    <h4>Total Questions</h4>
                    <div class="summary-value">${result.totalQuestions}</div>
                </div>
                <div class="summary-item">
                    <h4>Correct</h4>
                    <div class="summary-value correct">${result.correctAnswers}</div>
                </div>
                <div class="summary-item">
                    <h4>Incorrect</h4>
                    <div class="summary-value incorrect">${result.incorrectAnswers}</div>
                </div>
                <div class="summary-item">
                    <h4>Unattempted</h4>
                    <div class="summary-value unattempted">${result.unattempted}</div>
                </div>
                <div class="summary-item">
                    <h4>Final Score</h4>
                    <div class="summary-value">${result.score}%</div>
                </div>
            </div>
        `;
        
        const summaryEl = document.getElementById('reviewSummary');
        if (summaryEl) {
            summaryEl.innerHTML = summaryHtml;
        }
        
        // Render all questions
        this.renderReviewQuestions('all');
    }

    filterReviewQuestions(filter) {
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        this.renderReviewQuestions(filter);
    }

    renderReviewQuestions(filter) {
        const result = this.currentTest;
        if (!result) return;
        
        const container = document.getElementById('reviewQuestions');
        if (!container) return;
        
        container.innerHTML = '';
        
        result.questions.forEach((question, index) => {
            const userAnswer = result.answers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            const isUnattempted = userAnswer === -1;
            const isMarked = result.marked[index];
            
            // Apply filter
            if (filter === 'correct' && !isCorrect) return;
            if (filter === 'incorrect' && (isCorrect || isUnattempted)) return;
            if (filter === 'unattempted' && !isUnattempted) return;
            if (filter === 'marked' && !isMarked) return;
            
            const questionDiv = document.createElement('div');
            questionDiv.className = 'review-question';
            
            const resultClass = isUnattempted ? 'unattempted' : (isCorrect ? 'correct' : 'incorrect');
            const resultText = isUnattempted ? 'Unattempted' : (isCorrect ? 'Correct' : 'Incorrect');
            
            questionDiv.innerHTML = `
                <div class="review-question-header">
                    <h4>Question ${index + 1}</h4>
                    <span class="question-result ${resultClass}">${resultText}</span>
                    <span class="question-source">${question.source}</span>
                </div>
                <div class="question-text">${question.text}</div>
                <div class="answer-comparison">
                    <div class="answer-box user-answer">
                        <h5>Your Answer:</h5>
                        <p>${userAnswer === -1 ? 'Not Attempted' : 
                            `${String.fromCharCode(65 + userAnswer)}. ${question.options[userAnswer]}`}</p>
                    </div>
                    <div class="answer-box correct-answer">
                        <h5>Correct Answer:</h5>
                        <p>${String.fromCharCode(65 + question.correctAnswer)}. ${question.options[question.correctAnswer]}</p>
                    </div>
                </div>
                <div class="explanation">
                    <h5>Explanation:</h5>
                    <p>${question.explanation}</p>
                </div>
            `;
            
            container.appendChild(questionDiv);
        });
    }

    // Analytics Methods
    loadAnalytics() {
        this.renderOverviewCharts();
    }

    switchAnalyticsTab(tabId) {
        // Update tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeTab = document.querySelector(`[data-tab="${tabId}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        // Show content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        const targetContent = document.getElementById(tabId + 'Tab');
        if (targetContent) {
            targetContent.classList.add('active');
        }
        
        // Load charts
        setTimeout(() => {
            switch(tabId) {
                case 'overview':
                    this.renderOverviewCharts();
                    break;
                case 'subjects':
                    this.renderSubjectCharts();
                    break;
                case 'progress':
                    this.renderProgressCharts();
                    break;
                case 'time':
                    this.renderTimeCharts();
                    break;
            }
        }, 100);
    }

    renderOverviewCharts() {
        const userResults = this.testResults.filter(result => result.userId === this.currentUser.id);
        
        if (userResults.length === 0) {
            return;
        }
        
        // Performance Chart
        const performanceCtx = document.getElementById('performanceChart');
        if (performanceCtx) {
            if (this.charts.performance) {
                this.charts.performance.destroy();
            }
            
            this.charts.performance = new Chart(performanceCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Correct', 'Incorrect', 'Unattempted'],
                    datasets: [{
                        data: [
                            userResults.reduce((sum, r) => sum + r.correctAnswers, 0),
                            userResults.reduce((sum, r) => sum + r.incorrectAnswers, 0),
                            userResults.reduce((sum, r) => sum + r.unattempted, 0)
                        ],
                        backgroundColor: ['#1FB8CD', '#B4413C', '#ECEBD5']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
        
        // Subject Chart
        const subjectCtx = document.getElementById('subjectChart');
        if (subjectCtx) {
            if (this.charts.subject) {
                this.charts.subject.destroy();
            }
            
            const subjects = ['Mathematics', 'General Intelligence & Reasoning', 
                            'Basic Science & Engineering', 'General Awareness', 'Computer Applications'];
            const subjectScores = subjects.map(subject => {
                const subjectResults = userResults.map(result => {
                    const subjectQuestions = result.questions.filter(q => q.subject === subject);
                    const correctCount = subjectQuestions.reduce((count, q, idx) => {
                        const globalIdx = result.questions.indexOf(q);
                        return count + (result.answers[globalIdx] === q.correctAnswer ? 1 : 0);
                    }, 0);
                    return subjectQuestions.length > 0 ? (correctCount / subjectQuestions.length) * 100 : 0;
                });
                return subjectResults.length > 0 ? 
                    subjectResults.reduce((sum, score) => sum + score, 0) / subjectResults.length : 0;
            });
            
            this.charts.subject = new Chart(subjectCtx, {
                type: 'bar',
                data: {
                    labels: subjects.map(s => s.split(' ')[0]), // Shortened labels
                    datasets: [{
                        label: 'Average Score (%)',
                        data: subjectScores,
                        backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#5D878F', '#DB4545']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }
    }

    renderSubjectCharts() {
        const userResults = this.testResults.filter(result => result.userId === this.currentUser.id);
        
        if (userResults.length === 0) return;
        
        const radarCtx = document.getElementById('radarChart');
        if (radarCtx) {
            if (this.charts.radar) {
                this.charts.radar.destroy();
            }
            
            const subjects = ['Mathematics', 'Reasoning', 'Basic Science', 'General Awareness', 'Computer Apps'];
            const fullSubjects = ['Mathematics', 'General Intelligence & Reasoning', 
                                'Basic Science & Engineering', 'General Awareness', 'Computer Applications'];
            
            const subjectScores = fullSubjects.map(subject => {
                const subjectResults = userResults.map(result => {
                    const subjectQuestions = result.questions.filter(q => q.subject === subject);
                    const correctCount = subjectQuestions.reduce((count, q, idx) => {
                        const globalIdx = result.questions.indexOf(q);
                        return count + (result.answers[globalIdx] === q.correctAnswer ? 1 : 0);
                    }, 0);
                    return subjectQuestions.length > 0 ? (correctCount / subjectQuestions.length) * 100 : 0;
                });
                return subjectResults.length > 0 ? 
                    subjectResults.reduce((sum, score) => sum + score, 0) / subjectResults.length : 0;
            });
            
            this.charts.radar = new Chart(radarCtx, {
                type: 'radar',
                data: {
                    labels: subjects,
                    datasets: [{
                        label: 'Performance (%)',
                        data: subjectScores,
                        backgroundColor: 'rgba(31, 184, 205, 0.2)',
                        borderColor: '#1FB8CD',
                        pointBackgroundColor: '#1FB8CD'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }
    }

    renderProgressCharts() {
        const userResults = this.testResults.filter(result => result.userId === this.currentUser.id)
                                          .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
        
        if (userResults.length === 0) return;
        
        const progressCtx = document.getElementById('progressChart');
        if (progressCtx) {
            if (this.charts.progress) {
                this.charts.progress.destroy();
            }
            
            this.charts.progress = new Chart(progressCtx, {
                type: 'line',
                data: {
                    labels: userResults.map((_, index) => `Test ${index + 1}`),
                    datasets: [{
                        label: 'Score (%)',
                        data: userResults.map(result => result.score),
                        backgroundColor: 'rgba(31, 184, 205, 0.2)',
                        borderColor: '#1FB8CD',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }
    }

    renderTimeCharts() {
        const userResults = this.testResults.filter(result => result.userId === this.currentUser.id);
        
        if (userResults.length === 0) return;
        
        const timeCtx = document.getElementById('timeChart');
        if (timeCtx) {
            if (this.charts.time) {
                this.charts.time.destroy();
            }
            
            const avgTimeSpent = userResults.reduce((sum, result) => sum + result.timeSpent, 0) / userResults.length;
            const avgTimeMinutes = Math.round(avgTimeSpent / 60000);
            
            this.charts.time = new Chart(timeCtx, {
                type: 'bar',
                data: {
                    labels: ['Average Time Spent'],
                    datasets: [{
                        label: 'Minutes',
                        data: [avgTimeMinutes],
                        backgroundColor: '#1FB8CD'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }

    // Utility Methods
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            console.log('Showing modal:', modalId);
            modal.style.display = 'flex';
            modal.classList.remove('hidden');
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            console.log('Hiding modal:', modalId);
            modal.style.display = 'none';
            modal.classList.add('hidden');
        }
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Data Persistence Methods
    saveUsers() {
        try {
            localStorage.setItem('mockTestUsers', JSON.stringify(this.users));
            console.log('Users saved successfully');
        } catch (error) {
            console.error('Error saving users:', error);
        }
    }

    saveQuestions() {
        try {
            localStorage.setItem('mockTestQuestions', JSON.stringify(this.questions));
            console.log('Questions saved successfully');
        } catch (error) {
            console.error('Error saving questions:', error);
        }
    }

    saveTestResults() {
        try {
            localStorage.setItem('mockTestResults', JSON.stringify(this.testResults));
            console.log('Test results saved successfully');
        } catch (error) {
            console.error('Error saving test results:', error);
        }
    }

    savePDFs() {
        try {
            // Note: In a real application, you'd want to store PDFs on a server
            // For this demo, we'll store basic info locally (without the large data)
            const pdfMetadata = this.uploadedPDFs.map(pdf => ({
                ...pdf,
                data: null // Remove large binary data for localStorage
            }));
            localStorage.setItem('uploadedPDFs', JSON.stringify(pdfMetadata));
            console.log('PDF metadata saved successfully');
        } catch (error) {
            console.error('Error saving PDF metadata:', error);
        }
    }
}

// Initialize the application
const app = new MockTestApp();
