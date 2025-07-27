/**
 * MathRenderer - Mathematical Expression Rendering Utility
 * 
 * This utility provides mathematical expression rendering capabilities
 * using MathJax and supports various mathematical notation formats.
 * 
 * @author Ravi-katta-dev
 * @version 2.0.0
 * @created 2025-01-XX
 */

class MathRenderer {
    constructor() {
        this.initialized = false;
        this.mathJaxLoaded = false;
        this.renderQueue = [];
        this.config = {
            // MathJax configuration
            tex: {
                inlineMath: [['$', '$'], ['\\(', '\\)']],
                displayMath: [['$$', '$$'], ['\\[', '\\]']],
                processEscapes: true,
                processEnvironments: true,
                tags: 'none',
                packages: {
                    '[+]': ['ams', 'newcommand', 'configMacros', 'action']
                }
            },
            svg: {
                fontCache: 'global',
                displayAlign: 'left',
                displayIndent: '0em'
            },
            options: {
                skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'annotation', 'annotation-xml'],
                ignoreHtmlClass: 'tex2jax_ignore',
                processHtmlClass: 'tex2jax_process'
            },
            startup: {
                ready: () => {
                    this.onMathJaxReady();
                }
            }
        };
    }

    /**
     * Initialize the Math Renderer
     */
    async init() {
        if (this.initialized) return;
        
        console.log('Initializing Math Renderer...');
        
        try {
            await this.ensureMathJaxLoaded();
            this.setupMathJaxConfig();
            this.setupMutationObserver();
            this.processInitialMath();
            
            this.initialized = true;
            console.log('Math Renderer initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Math Renderer:', error);
            if (window.ErrorHandler) {
                window.ErrorHandler.handleError({
                    message: 'Failed to initialize mathematical expression rendering',
                    error,
                    category: window.ErrorHandler.categories.UI,
                    severity: window.ErrorHandler.severity.MEDIUM
                });
            }
        }
    }

    /**
     * Ensure MathJax is loaded
     */
    async ensureMathJaxLoaded() {
        if (window.MathJax && this.mathJaxLoaded) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            // Check if MathJax is already in the process of loading
            if (window.MathJax) {
                // Configure MathJax before it starts
                window.MathJax = this.config;
                
                // Wait for MathJax to be ready
                if (window.MathJax.startup) {
                    window.MathJax.startup.promise.then(() => {
                        this.mathJaxLoaded = true;
                        resolve();
                    }).catch(reject);
                } else {
                    // MathJax is already loaded
                    this.mathJaxLoaded = true;
                    resolve();
                }
            } else {
                // MathJax not loaded, configure and wait for script to load
                window.MathJax = this.config;
                
                // Listen for MathJax ready event
                document.addEventListener('DOMContentLoaded', () => {
                    if (window.MathJax && window.MathJax.startup) {
                        window.MathJax.startup.promise.then(() => {
                            this.mathJaxLoaded = true;
                            resolve();
                        }).catch(reject);
                    } else {
                        setTimeout(() => {
                            if (window.MathJax) {
                                this.mathJaxLoaded = true;
                                resolve();
                            } else {
                                reject(new Error('MathJax failed to load'));
                            }
                        }, 5000); // 5 second timeout
                    }
                });
            }
        });
    }

    /**
     * Called when MathJax is ready
     */
    onMathJaxReady() {
        console.log('MathJax is ready');
        this.mathJaxLoaded = true;
        
        // Process any queued render requests
        this.processRenderQueue();
    }

    /**
     * Setup MathJax configuration
     */
    setupMathJaxConfig() {
        if (!window.MathJax) return;

        // Add custom macros for common mathematical expressions
        const customMacros = {
            // Fractions
            '\\frac': ['\\frac{#1}{#2}', 2],
            // Roots
            '\\sqrt': ['\\sqrt{#1}', 1],
            '\\nthroot': ['\\sqrt[#1]{#2}', 2],
            // Trigonometric functions
            '\\sin': '\\operatorname{sin}',
            '\\cos': '\\operatorname{cos}',
            '\\tan': '\\operatorname{tan}',
            '\\sec': '\\operatorname{sec}',
            '\\csc': '\\operatorname{csc}',
            '\\cot': '\\operatorname{cot}',
            // Logarithms
            '\\log': '\\operatorname{log}',
            '\\ln': '\\operatorname{ln}',
            // Common symbols
            '\\degree': '^\\circ',
            '\\percent': '\\%',
            // Physics and engineering
            '\\ohm': '\\Omega',
            '\\volt': '\\text{V}',
            '\\amp': '\\text{A}',
            '\\watt': '\\text{W}'
        };

        if (window.MathJax.config && window.MathJax.config.tex) {
            window.MathJax.config.tex.macros = {
                ...window.MathJax.config.tex.macros,
                ...customMacros
            };
        }
    }

    /**
     * Setup mutation observer to detect new math content
     */
    setupMutationObserver() {
        if (!window.MutationObserver) return;

        this.observer = new MutationObserver((mutations) => {
            let shouldRender = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (this.containsMath(node) || node.classList?.contains('tex2jax_process')) {
                                shouldRender = true;
                            }
                        }
                    });
                }
            });

            if (shouldRender) {
                this.renderMathInDocument();
            }
        });

        // Start observing
        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: false,
            characterData: false
        });
    }

    /**
     * Check if element contains mathematical expressions
     */
    containsMath(element) {
        if (!element || !element.textContent) return false;
        
        const mathPatterns = [
            /\$[\s\S]*?\$/,          // Inline math: $...$
            /\$\$[\s\S]*?\$\$/,      // Display math: $$...$$
            /\\\([\s\S]*?\\\)/,      // Inline math: \(...\)
            /\\\[[\s\S]*?\\\]/,      // Display math: \[...\]
            /\\[a-zA-Z]+/,           // LaTeX commands
            /\^[\{\w]|\_{[\{\w]/     // Superscripts and subscripts
        ];

        return mathPatterns.some(pattern => pattern.test(element.textContent));
    }

    /**
     * Process initial math on page load
     */
    processInitialMath() {
        if (this.mathJaxLoaded) {
            this.renderMathInDocument();
        } else {
            // Queue for later processing
            this.renderQueue.push(() => this.renderMathInDocument());
        }
    }

    /**
     * Process queued render requests
     */
    processRenderQueue() {
        while (this.renderQueue.length > 0) {
            const renderFn = this.renderQueue.shift();
            try {
                renderFn();
            } catch (error) {
                console.error('Error processing queued math render:', error);
            }
        }
    }

    /**
     * Render math in the entire document
     */
    renderMathInDocument() {
        if (!this.mathJaxLoaded || !window.MathJax) {
            this.renderQueue.push(() => this.renderMathInDocument());
            return;
        }

        try {
            if (window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise().catch((error) => {
                    console.error('MathJax typeset error:', error);
                });
            } else if (window.MathJax.Hub) {
                // MathJax v2 compatibility
                window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub]);
            }
        } catch (error) {
            console.error('Error rendering math in document:', error);
            if (window.ErrorHandler) {
                window.ErrorHandler.handleError({
                    message: 'Error rendering mathematical expressions',
                    error,
                    category: window.ErrorHandler.categories.UI,
                    severity: window.ErrorHandler.severity.LOW
                });
            }
        }
    }

    /**
     * Render math in specific element
     */
    renderMathInElement(element) {
        if (!this.mathJaxLoaded || !window.MathJax || !element) {
            this.renderQueue.push(() => this.renderMathInElement(element));
            return Promise.resolve();
        }

        try {
            if (window.MathJax.typesetPromise) {
                return window.MathJax.typesetPromise([element]);
            } else if (window.MathJax.Hub) {
                // MathJax v2 compatibility
                return new Promise((resolve) => {
                    window.MathJax.Hub.Queue(
                        ['Typeset', window.MathJax.Hub, element],
                        [resolve]
                    );
                });
            }
        } catch (error) {
            console.error('Error rendering math in element:', error);
            if (window.ErrorHandler) {
                window.ErrorHandler.handleError({
                    message: 'Error rendering mathematical expressions in element',
                    error,
                    category: window.ErrorHandler.categories.UI,
                    severity: window.ErrorHandler.severity.LOW
                });
            }
        }

        return Promise.resolve();
    }

    /**
     * Render math from LaTeX string
     */
    renderMathFromString(latex, target, displayMode = false) {
        if (!this.mathJaxLoaded || !window.MathJax || !target) {
            this.renderQueue.push(() => this.renderMathFromString(latex, target, displayMode));
            return Promise.resolve();
        }

        try {
            // Wrap latex in appropriate delimiters
            const wrappedLatex = displayMode ? `$$${latex}$$` : `$${latex}$`;
            
            // Set the content and render
            target.textContent = wrappedLatex;
            return this.renderMathInElement(target);
        } catch (error) {
            console.error('Error rendering math from string:', error);
            return Promise.reject(error);
        }
    }

    /**
     * Convert common text patterns to LaTeX
     */
    preprocessMathText(text) {
        if (!text) return text;

        // Common replacements for better math rendering
        const replacements = [
            // Fractions
            [/(\d+)\/(\d+)/g, '\\frac{$1}{$2}'],
            // Square roots
            [/sqrt\(([^)]+)\)/g, '\\sqrt{$1}'],
            // Powers (simple cases)
            [/\^(\d+)/g, '^{$1}'],
            // Subscripts (simple cases)
            [/_(\d+)/g, '_{$1}'],
            // Degrees
            [/(\d+)\s*degrees?/gi, '$1^\\circ'],
            [/(\d+)\s*deg/gi, '$1^\\circ'],
            // Mathematical functions
            [/\bsin\b/g, '\\sin'],
            [/\bcos\b/g, '\\cos'],
            [/\btan\b/g, '\\tan'],
            [/\blog\b/g, '\\log'],
            [/\bln\b/g, '\\ln'],
            // Greek letters (common ones)
            [/\balpha\b/g, '\\alpha'],
            [/\bbeta\b/g, '\\beta'],
            [/\bgamma\b/g, '\\gamma'],
            [/\bdelta\b/g, '\\delta'],
            [/\btheta\b/g, '\\theta'],
            [/\bpi\b/g, '\\pi'],
            [/\bsigma\b/g, '\\sigma'],
            [/\bomega\b/g, '\\omega']
        ];

        let processedText = text;
        replacements.forEach(([pattern, replacement]) => {
            processedText = processedText.replace(pattern, replacement);
        });

        return processedText;
    }

    /**
     * Validate LaTeX syntax
     */
    validateLatex(latex) {
        if (!latex) return { valid: false, error: 'Empty LaTeX string' };

        try {
            // Basic validation checks
            const checks = [
                // Balanced braces
                {
                    test: () => {
                        const openBraces = (latex.match(/\{/g) || []).length;
                        const closeBraces = (latex.match(/\}/g) || []).length;
                        return openBraces === closeBraces;
                    },
                    error: 'Unbalanced braces'
                },
                // Balanced math delimiters
                {
                    test: () => {
                        const singleDollar = (latex.match(/\$/g) || []).length;
                        return singleDollar % 2 === 0;
                    },
                    error: 'Unbalanced $ delimiters'
                },
                // Valid LaTeX commands
                {
                    test: () => {
                        const invalidCommands = latex.match(/\\[^a-zA-Z\s\{\}]/g);
                        return !invalidCommands;
                    },
                    error: 'Invalid LaTeX commands'
                }
            ];

            for (const check of checks) {
                if (!check.test()) {
                    return { valid: false, error: check.error };
                }
            }

            return { valid: true };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    /**
     * Get math rendering statistics
     */
    getStats() {
        return {
            initialized: this.initialized,
            mathJaxLoaded: this.mathJaxLoaded,
            queueLength: this.renderQueue.length,
            mathJaxVersion: window.MathJax?.version || 'Unknown'
        };
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        
        this.renderQueue = [];
        this.initialized = false;
        
        console.log('Math Renderer destroyed');
    }
}

// Make MathRenderer available globally
window.MathRenderer = new MathRenderer();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MathRenderer;
}