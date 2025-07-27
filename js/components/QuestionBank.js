/**
 * QuestionBank - Question Bank Management Component
 * 
 * This component manages the question bank functionality including
 * question display, filtering, searching, and management operations.
 * 
 * @author Ravi-katta-dev
 * @version 2.0.0
 * @created 2025-01-XX
 */

class QuestionBank {
    constructor() {
        this.initialized = false;
        this.currentFilters = {
            subject: '',
            difficulty: '',
            search: ''
        };
        this.selectedQuestions = new Set();
        this.currentView = 'list';
        this.sortBy = 'created';
        this.sortOrder = 'desc';
    }

    /**
     * Initialize the Question Bank component
     */
    async init() {
        if (this.initialized) return;
        
        console.log('Initializing Question Bank component...');
        
        this.setupEventListeners();
        this.loadQuestionBankView();
        this.refreshQuestionsList();
        
        this.initialized = true;
        console.log('Question Bank component initialized successfully');
    }

    /**
     * Setup event listeners for question bank functionality
     */
    setupEventListeners() {
        // Filter controls
        const subjectFilter = document.getElementById('subjectFilter');
        const difficultyFilter = document.getElementById('difficultyFilter');
        const searchInput = document.getElementById('searchQuestions');

        if (subjectFilter) {
            subjectFilter.addEventListener('change', () => {
                this.currentFilters.subject = subjectFilter.value;
                this.applyFilters();
            });
        }

        if (difficultyFilter) {
            difficultyFilter.addEventListener('change', () => {
                this.currentFilters.difficulty = difficultyFilter.value;
                this.applyFilters();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value;
                this.debounceSearch();
            });
        }

        // Question management buttons
        const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
        const addQuestionBtn = document.getElementById('addQuestionBtn');
        const uploadQuestionsBtn = document.getElementById('uploadQuestionsBtn');

        if (deleteSelectedBtn) {
            deleteSelectedBtn.addEventListener('click', () => {
                this.deleteSelectedQuestions();
            });
        }

        if (addQuestionBtn) {
            addQuestionBtn.addEventListener('click', () => {
                this.showAddQuestionModal();
            });
        }

        if (uploadQuestionsBtn) {
            uploadQuestionsBtn.addEventListener('click', () => {
                this.showUploadModal();
            });
        }

        // Select all checkbox
        const selectAllQuestions = document.getElementById('selectAllQuestions');
        if (selectAllQuestions) {
            selectAllQuestions.addEventListener('change', (e) => {
                this.toggleSelectAll(e.target.checked);
            });
        }
    }

    /**
     * Load question bank view and populate data
     */
    loadQuestionBankView() {
        this.refreshQuestionsList();
        this.updateFilterCounts();
        this.updateSelectionControls();
    }

    /**
     * Refresh the questions list based on current filters
     */
    refreshQuestionsList() {
        const questionsTableBody = document.getElementById('questionsTableBody');
        if (!questionsTableBody) return;

        // Get questions from QuestionManager
        const questionManager = window.QuestionManager;
        if (!questionManager) {
            console.warn('QuestionManager not available');
            return;
        }

        const allQuestions = questionManager.getQuestions();
        const filteredQuestions = this.filterQuestions(allQuestions);
        const sortedQuestions = this.sortQuestions(filteredQuestions);

        // Clear existing content
        questionsTableBody.innerHTML = '';

        // Populate table with questions
        sortedQuestions.forEach((question, index) => {
            const row = this.createQuestionRow(question, index);
            questionsTableBody.appendChild(row);
        });

        // Update statistics
        this.updateQuestionStats(allQuestions.length, filteredQuestions.length);
    }

    /**
     * Filter questions based on current filters
     */
    filterQuestions(questions) {
        return questions.filter(question => {
            // Subject filter
            if (this.currentFilters.subject && question.subject !== this.currentFilters.subject) {
                return false;
            }

            // Difficulty filter
            if (this.currentFilters.difficulty && question.difficulty !== this.currentFilters.difficulty) {
                return false;
            }

            // Search filter
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search.toLowerCase();
                const questionText = question.question.toLowerCase();
                const options = question.options.join(' ').toLowerCase();
                
                if (!questionText.includes(searchTerm) && !options.includes(searchTerm)) {
                    return false;
                }
            }

            return true;
        });
    }

    /**
     * Sort questions based on current sort criteria
     */
    sortQuestions(questions) {
        return questions.sort((a, b) => {
            let aValue, bValue;

            switch (this.sortBy) {
                case 'subject':
                    aValue = a.subject;
                    bValue = b.subject;
                    break;
                case 'difficulty':
                    aValue = this.getDifficultyWeight(a.difficulty);
                    bValue = this.getDifficultyWeight(b.difficulty);
                    break;
                case 'created':
                default:
                    aValue = a.created || 0;
                    bValue = b.created || 0;
                    break;
            }

            if (this.sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    }

    /**
     * Get numeric weight for difficulty sorting
     */
    getDifficultyWeight(difficulty) {
        switch (difficulty) {
            case 'Easy': return 1;
            case 'Medium': return 2;
            case 'Hard': return 3;
            default: return 0;
        }
    }

    /**
     * Create a table row for a question
     */
    createQuestionRow(question, index) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <input type="checkbox" class="question-checkbox" data-question-id="${question.id}" 
                       onchange="window.QuestionBank.toggleQuestionSelection('${question.id}', this.checked)">
            </td>
            <td class="question-text" title="${this.escapeHtml(question.question)}">
                ${this.truncateText(question.question, 100)}
            </td>
            <td><span class="subject-badge subject-${question.subject.replace(/\s+/g, '-').toLowerCase()}">${question.subject}</span></td>
            <td>${question.chapter || 'N/A'}</td>
            <td><span class="difficulty-badge difficulty-${question.difficulty.toLowerCase()}">${question.difficulty}</span></td>
            <td>${question.isPYQ ? '<span class="pyq-badge">PYQ</span>' : ''}</td>
            <td class="source">${question.source || 'Manual'}</td>
            <td class="actions">
                <button class="btn btn--sm btn--secondary" onclick="window.QuestionBank.editQuestion('${question.id}')" title="Edit">✏️</button>
                <button class="btn btn--sm btn--danger" onclick="window.QuestionBank.deleteQuestion('${question.id}')" title="Delete">🗑️</button>
                <button class="btn btn--sm btn--outline" onclick="window.QuestionBank.previewQuestion('${question.id}')" title="Preview">👁️</button>
            </td>
        `;
        return row;
    }

    /**
     * Apply current filters to the questions list
     */
    applyFilters() {
        this.refreshQuestionsList();
        this.updateFilterCounts();
    }

    /**
     * Debounced search function
     */
    debounceSearch() {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        this.searchTimeout = setTimeout(() => {
            this.applyFilters();
        }, 300);
    }

    /**
     * Toggle selection of all questions
     */
    toggleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.question-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
            const questionId = checkbox.dataset.questionId;
            if (checked) {
                this.selectedQuestions.add(questionId);
            } else {
                this.selectedQuestions.delete(questionId);
            }
        });
        this.updateSelectionControls();
    }

    /**
     * Toggle selection of individual question
     */
    toggleQuestionSelection(questionId, checked) {
        if (checked) {
            this.selectedQuestions.add(questionId);
        } else {
            this.selectedQuestions.delete(questionId);
        }
        this.updateSelectionControls();
    }

    /**
     * Update selection control states
     */
    updateSelectionControls() {
        const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
        const selectedCount = this.selectedQuestions.size;
        
        if (deleteSelectedBtn) {
            deleteSelectedBtn.disabled = selectedCount === 0;
            deleteSelectedBtn.textContent = `🗑️ Delete Selected (${selectedCount})`;
        }

        const selectAllCheckbox = document.getElementById('selectAllQuestions');
        if (selectAllCheckbox) {
            const totalCheckboxes = document.querySelectorAll('.question-checkbox').length;
            selectAllCheckbox.checked = selectedCount > 0 && selectedCount === totalCheckboxes;
            selectAllCheckbox.indeterminate = selectedCount > 0 && selectedCount < totalCheckboxes;
        }
    }

    /**
     * Delete selected questions
     */
    async deleteSelectedQuestions() {
        if (this.selectedQuestions.size === 0) return;

        const confirmed = confirm(`Are you sure you want to delete ${this.selectedQuestions.size} selected question(s)?`);
        if (!confirmed) return;

        const questionManager = window.QuestionManager;
        if (!questionManager) return;

        try {
            for (const questionId of this.selectedQuestions) {
                await questionManager.deleteQuestion(questionId);
            }

            this.selectedQuestions.clear();
            this.refreshQuestionsList();
            this.updateSelectionControls();

            // Show success message
            this.showSuccessMessage(`Successfully deleted ${this.selectedQuestions.size} question(s)`);
        } catch (error) {
            console.error('Error deleting questions:', error);
            this.showErrorMessage('Failed to delete questions. Please try again.');
        }
    }

    /**
     * Show add question modal
     */
    showAddQuestionModal() {
        const modal = document.getElementById('questionModal');
        if (modal) {
            modal.classList.remove('hidden');
            // Reset form if needed
            const form = document.getElementById('questionForm');
            if (form) form.reset();
        }
    }

    /**
     * Show upload modal
     */
    showUploadModal() {
        const modal = document.getElementById('pdfUploadModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    /**
     * Edit question
     */
    editQuestion(questionId) {
        console.log('Editing question:', questionId);
        // Implementation will be handled by QuestionManager
        if (window.QuestionManager && window.QuestionManager.editQuestion) {
            window.QuestionManager.editQuestion(questionId);
        }
    }

    /**
     * Delete individual question
     */
    async deleteQuestion(questionId) {
        const confirmed = confirm('Are you sure you want to delete this question?');
        if (!confirmed) return;

        const questionManager = window.QuestionManager;
        if (!questionManager) return;

        try {
            await questionManager.deleteQuestion(questionId);
            this.refreshQuestionsList();
            this.showSuccessMessage('Question deleted successfully');
        } catch (error) {
            console.error('Error deleting question:', error);
            this.showErrorMessage('Failed to delete question. Please try again.');
        }
    }

    /**
     * Preview question
     */
    previewQuestion(questionId) {
        console.log('Previewing question:', questionId);
        // Implementation for question preview
    }

    /**
     * Update filter counts
     */
    updateFilterCounts() {
        // Implementation for showing filter counts
    }

    /**
     * Update question statistics
     */
    updateQuestionStats(total, filtered) {
        const totalQuestionsElement = document.getElementById('totalQuestions');
        if (totalQuestionsElement) {
            totalQuestionsElement.textContent = total;
        }
    }

    /**
     * Utility functions
     */
    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showSuccessMessage(message) {
        console.log('Success:', message);
        // Implement UI notification
    }

    showErrorMessage(message) {
        console.error('Error:', message);
        // Implement UI notification
    }
}

// Make QuestionBank available globally
window.QuestionBank = new QuestionBank();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuestionBank;
}