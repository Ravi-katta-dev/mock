/**
 * UserManager - User Management Module for RRB Mock Test App
 * 
 * This module handles user creation, management, authentication,
 * user preferences, and profile management functionality.
 * 
 * @author Ravi-katta-dev
 * @version 1.0.0
 * @created 2025-01-XX
 */

/**
 * User Manager Class
 * Handles all user-related operations
 */
class UserManager {
    constructor() {
        this.initialized = false;
        this.currentUser = null;
        this.users = [];
        this.userPreferences = {};
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.lastActivity = Date.now();
        this.sessionTimer = null;
    }

    /**
     * Initialize the User Manager module
     */
    init() {
        if (this.initialized) return;
        
        console.log('Initializing User Manager module...');
        this.loadStoredUsers();
        this.setupUserEventListeners();
        this.setupSessionManagement();
        this.initialized = true;
        console.log('User Manager module initialized successfully');
    }

    /**
     * Load stored users from localStorage
     */
    loadStoredUsers() {
        try {
            const storedUsers = localStorage.getItem('mockTestUsers');
            if (storedUsers) {
                this.users = JSON.parse(storedUsers);
                console.log(`Loaded ${this.users.length} users from storage`);
            }

            const storedPreferences = localStorage.getItem('userPreferences');
            if (storedPreferences) {
                this.userPreferences = JSON.parse(storedPreferences);
            }

            // Check for existing session
            const currentUserId = localStorage.getItem('currentUserId');
            if (currentUserId) {
                this.currentUser = this.users.find(user => user.id === currentUserId);
                if (this.currentUser) {
                    console.log('Restored user session:', this.currentUser.name);
                    this.updateLastActivity();
                }
            }

        } catch (error) {
            console.warn('Failed to load stored users:', error);
            this.users = [];
            this.userPreferences = {};
        }
    }

    /**
     * Setup event listeners for user-related elements
     */
    setupUserEventListeners() {
        // Create user button
        const createUserBtn = document.getElementById('createUserBtn');
        if (createUserBtn) {
            createUserBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showUserModal();
            });
        }

        // Save user button
        const saveUserBtn = document.getElementById('saveUserBtn');
        if (saveUserBtn) {
            saveUserBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.createUser();
            });
        }

        // Cancel user button
        const cancelUserBtn = document.getElementById('cancelUserBtn');
        if (cancelUserBtn) {
            cancelUserBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideUserModal();
            });
        }

        // Switch user button
        const switchUserBtn = document.getElementById('switchUserBtn');
        if (switchUserBtn) {
            switchUserBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showUserSwitcher();
            });
        }

        // User name input enter key
        const userNameInput = document.getElementById('userName');
        if (userNameInput) {
            userNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.createUser();
                }
            });
        }

        // Track user activity for session management
        this.setupActivityTracking();
    }

    /**
     * Setup activity tracking for session management
     */
    setupActivityTracking() {
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        activityEvents.forEach(event => {
            document.addEventListener(event, () => {
                this.updateLastActivity();
            }, { passive: true });
        });
    }

    /**
     * Setup session management
     */
    setupSessionManagement() {
        // Check session every minute
        this.sessionTimer = setInterval(() => {
            this.checkSession();
        }, 60000);

        // Handle page unload
        window.addEventListener('beforeunload', () => {
            this.saveCurrentSession();
        });
    }

    /**
     * Update last activity timestamp
     */
    updateLastActivity() {
        this.lastActivity = Date.now();
    }

    /**
     * Check if session is still valid
     */
    checkSession() {
        if (!this.currentUser) return;

        const timeSinceLastActivity = Date.now() - this.lastActivity;
        
        if (timeSinceLastActivity > this.sessionTimeout) {
            this.handleSessionTimeout();
        }
    }

    /**
     * Handle session timeout
     */
    handleSessionTimeout() {
        console.log('Session timed out for user:', this.currentUser?.name);
        
        // Save current state before logout
        this.saveCurrentSession();
        
        // Show timeout message
        alert('Your session has expired due to inactivity. Please log in again.');
        
        // Logout user
        this.logoutUser();
    }

    /**
     * Save current session state
     */
    saveCurrentSession() {
        if (this.currentUser) {
            localStorage.setItem('currentUserId', this.currentUser.id);
            localStorage.setItem('lastActivity', this.lastActivity.toString());
        }
    }

    /**
     * Show user creation modal
     */
    showUserModal() {
        const modal = document.getElementById('userModal');
        const welcomeScreen = document.getElementById('welcomeScreen');
        
        if (modal) {
            modal.classList.remove('hidden');
            
            // Focus on name input
            const nameInput = document.getElementById('userName');
            if (nameInput) {
                setTimeout(() => nameInput.focus(), 100);
            }
        }
        
        if (welcomeScreen) {
            welcomeScreen.classList.add('hidden');
        }
    }

    /**
     * Hide user creation modal
     */
    hideUserModal() {
        const modal = document.getElementById('userModal');
        const welcomeScreen = document.getElementById('welcomeScreen');
        
        if (modal) {
            modal.classList.add('hidden');
        }
        
        // Show welcome screen if no current user
        if (!this.currentUser && welcomeScreen) {
            welcomeScreen.classList.remove('hidden');
        }
        
        // Clear form
        const nameInput = document.getElementById('userName');
        if (nameInput) {
            nameInput.value = '';
        }
    }

    /**
     * Create a new user
     */
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

        if (name.length < 2) {
            alert('Name must be at least 2 characters long');
            nameInput.focus();
            return;
        }

        if (name.length > 50) {
            alert('Name must be less than 50 characters long');
            nameInput.focus();
            return;
        }

        // Check if user already exists
        const existingUser = this.users.find(user => 
            user.name.toLowerCase() === name.toLowerCase()
        );
        
        if (existingUser) {
            const useExisting = confirm(`User "${name}" already exists. Do you want to use this existing account?`);
            if (useExisting) {
                this.setCurrentUser(existingUser);
                this.hideUserModal();
                this.showMainApp();
                return;
            } else {
                nameInput.focus();
                return;
            }
        }

        // Create new user
        const user = {
            id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: name,
            createdAt: new Date().toISOString(),
            totalTests: 0,
            averageScore: 0,
            lastLoginAt: new Date().toISOString(),
            preferences: this.getDefaultUserPreferences(),
            statistics: {
                totalQuestions: 0,
                correctAnswers: 0,
                totalTime: 0,
                averageTimePerQuestion: 0,
                strongSubjects: [],
                weakSubjects: [],
                improvement: 0
            }
        };

        console.log('Created user object:', user);
        
        this.users.push(user);
        this.setCurrentUser(user);
        this.saveUsers();
        
        console.log('User saved successfully');
        
        // Hide modal and show main app
        this.hideUserModal();
        this.showMainApp();
        
        // Welcome message
        this.showWelcomeMessage(user);
    }

    /**
     * Get default user preferences
     */
    getDefaultUserPreferences() {
        return {
            theme: 'light',
            autoSave: true,
            notifications: true,
            soundEffects: true,
            keyboardShortcuts: true,
            testSettings: {
                defaultDuration: 60,
                questionsPerTest: 50,
                showTimer: true,
                autoSubmit: false,
                reviewMode: 'immediate'
            },
            difficulty: 'medium',
            preferredSubjects: [],
            language: 'en'
        };
    }

    /**
     * Set current user
     */
    setCurrentUser(user) {
        this.currentUser = user;
        user.lastLoginAt = new Date().toISOString();
        this.updateLastActivity();
        this.saveCurrentSession();
        this.updateUserInterface();
    }

    /**
     * Update user interface with current user info
     */
    updateUserInterface() {
        if (!this.currentUser) return;

        // Update user display
        const currentUserElement = document.getElementById('currentUser');
        if (currentUserElement) {
            currentUserElement.textContent = `Welcome, ${this.currentUser.name}!`;
        }

        // Update user stats if available
        this.updateUserStats();
        
        // Apply user preferences
        this.applyUserPreferences();
    }

    /**
     * Update user statistics display
     */
    updateUserStats() {
        const stats = this.currentUser.statistics;
        
        // Update dashboard stats
        const statsElements = {
            'totalTests': this.currentUser.totalTests,
            'averageScore': this.currentUser.averageScore + '%',
            'totalQuestions': stats.totalQuestions,
            'correctAnswers': stats.correctAnswers,
            'averageTime': this.formatTime(stats.averageTimePerQuestion)
        };

        Object.entries(statsElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    /**
     * Apply user preferences to the application
     */
    applyUserPreferences() {
        if (!this.currentUser?.preferences) return;

        const prefs = this.currentUser.preferences;

        // Apply theme
        if (prefs.theme && window.uiManager) {
            window.uiManager.setTheme(prefs.theme);
        }

        // Apply other preferences
        this.applyTestSettings(prefs.testSettings);
    }

    /**
     * Apply test settings preferences
     */
    applyTestSettings(testSettings) {
        if (!testSettings) return;

        // Update test configuration elements
        const settingMappings = {
            'defaultDuration': 'testDuration',
            'questionsPerTest': 'questionsPerTest',
            'showTimer': 'showTimer',
            'autoSubmit': 'autoSubmit'
        };

        Object.entries(settingMappings).forEach(([setting, elementId]) => {
            const element = document.getElementById(elementId);
            if (element && testSettings[setting] !== undefined) {
                if (element.type === 'checkbox') {
                    element.checked = testSettings[setting];
                } else {
                    element.value = testSettings[setting];
                }
            }
        });
    }

    /**
     * Show main application
     */
    showMainApp() {
        const mainApp = document.getElementById('mainApp');
        const welcomeScreen = document.getElementById('welcomeScreen');
        
        if (mainApp) {
            mainApp.classList.remove('hidden');
        }
        
        if (welcomeScreen) {
            welcomeScreen.classList.add('hidden');
        }

        // Initialize app components if needed
        if (window.app && typeof window.app.initializeApp === 'function') {
            window.app.initializeApp();
        }
    }

    /**
     * Show welcome message for new user
     */
    showWelcomeMessage(user) {
        const message = `Welcome to RRB Mock Test, ${user.name}! 🎉\n\nYou can now:\n• Take practice tests\n• Upload PDFs for question extraction\n• Track your progress\n• Review your performance\n\nGood luck with your preparation!`;
        
        setTimeout(() => {
            alert(message);
        }, 500);
    }

    /**
     * Show user switcher
     */
    showUserSwitcher() {
        if (this.users.length === 0) {
            alert('No users found. Please create a user first.');
            return;
        }

        const userList = this.users.map((user, index) => 
            `${index + 1}. ${user.name} (Created: ${new Date(user.createdAt).toLocaleDateString()})`
        ).join('\n');

        const selection = prompt(`Select a user:\n\n${userList}\n\nEnter the number of the user you want to switch to:`);
        
        if (selection) {
            const userIndex = parseInt(selection) - 1;
            if (userIndex >= 0 && userIndex < this.users.length) {
                const selectedUser = this.users[userIndex];
                this.setCurrentUser(selectedUser);
                alert(`Switched to user: ${selectedUser.name}`);
            } else {
                alert('Invalid selection. Please try again.');
            }
        }
    }

    /**
     * Logout current user
     */
    logoutUser() {
        if (this.currentUser) {
            console.log('Logging out user:', this.currentUser.name);
            this.saveCurrentSession();
        }
        
        this.currentUser = null;
        localStorage.removeItem('currentUserId');
        localStorage.removeItem('lastActivity');
        
        // Hide main app and show welcome screen
        const mainApp = document.getElementById('mainApp');
        const welcomeScreen = document.getElementById('welcomeScreen');
        
        if (mainApp) {
            mainApp.classList.add('hidden');
        }
        
        if (welcomeScreen) {
            welcomeScreen.classList.remove('hidden');
        }
    }

    /**
     * Delete user account
     */
    deleteUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) {
            alert('User not found.');
            return;
        }

        const confirmation = confirm(`Are you sure you want to delete the account for "${user.name}"? This action cannot be undone.`);
        
        if (confirmation) {
            // Remove user from array
            this.users = this.users.filter(u => u.id !== userId);
            
            // If deleting current user, logout
            if (this.currentUser?.id === userId) {
                this.logoutUser();
            }
            
            this.saveUsers();
            alert(`User "${user.name}" has been deleted.`);
        }
    }

    /**
     * Update user statistics after test completion
     */
    updateUserStatistics(testResult) {
        if (!this.currentUser) return;

        const stats = this.currentUser.statistics;
        
        // Update basic stats
        this.currentUser.totalTests++;
        stats.totalQuestions += testResult.totalQuestions;
        stats.correctAnswers += testResult.correctAnswers;
        stats.totalTime += testResult.totalTime;
        
        // Calculate averages
        this.currentUser.averageScore = Math.round(
            (stats.correctAnswers / stats.totalQuestions) * 100
        );
        
        stats.averageTimePerQuestion = Math.round(
            stats.totalTime / stats.totalQuestions
        );

        // Update subject performance
        this.updateSubjectPerformance(testResult);
        
        // Calculate improvement
        this.calculateImprovement(testResult);
        
        this.saveUsers();
    }

    /**
     * Update subject performance tracking
     */
    updateSubjectPerformance(testResult) {
        if (!testResult.subjectBreakdown) return;

        const stats = this.currentUser.statistics;
        
        // Analyze subject performance
        const subjectScores = {};
        Object.entries(testResult.subjectBreakdown).forEach(([subject, data]) => {
            subjectScores[subject] = (data.correct / data.total) * 100;
        });

        // Update strong and weak subjects
        const sortedSubjects = Object.entries(subjectScores)
            .sort(([,a], [,b]) => b - a);

        stats.strongSubjects = sortedSubjects
            .filter(([, score]) => score >= 70)
            .slice(0, 3)
            .map(([subject]) => subject);

        stats.weakSubjects = sortedSubjects
            .filter(([, score]) => score < 60)
            .slice(-3)
            .map(([subject]) => subject);
    }

    /**
     * Calculate improvement trends
     */
    calculateImprovement(testResult) {
        // This would analyze recent test results to calculate improvement
        // For now, implementing a simple version
        const recentTests = this.getRecentTestResults(5);
        
        if (recentTests.length >= 2) {
            const recentAvg = recentTests.slice(0, 3).reduce((sum, test) => sum + test.score, 0) / 3;
            const olderAvg = recentTests.slice(-3).reduce((sum, test) => sum + test.score, 0) / 3;
            
            this.currentUser.statistics.improvement = Math.round(recentAvg - olderAvg);
        }
    }

    /**
     * Get recent test results for user
     */
    getRecentTestResults(count = 10) {
        if (!window.dataManager) return [];
        
        try {
            const allResults = window.dataManager.getData('RESULTS') || [];
            return allResults
                .filter(result => result.userId === this.currentUser.id)
                .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
                .slice(0, count);
        } catch (error) {
            console.warn('Error fetching recent test results:', error);
            return [];
        }
    }

    /**
     * Save users to localStorage
     */
    saveUsers() {
        try {
            localStorage.setItem('mockTestUsers', JSON.stringify(this.users));
            
            if (this.userPreferences && Object.keys(this.userPreferences).length > 0) {
                localStorage.setItem('userPreferences', JSON.stringify(this.userPreferences));
            }
            
            console.log('Users saved successfully');
        } catch (error) {
            console.error('Failed to save users:', error);
            alert('Failed to save user data. Please try again.');
        }
    }

    /**
     * Format time in seconds to readable format
     */
    formatTime(seconds) {
        if (seconds < 60) {
            return `${seconds}s`;
        } else if (seconds < 3600) {
            return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
        } else {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return `${hours}h ${minutes}m`;
        }
    }

    /**
     * Export user data
     */
    exportUserData() {
        if (!this.currentUser) {
            alert('No user is currently logged in.');
            return;
        }

        const userData = {
            user: this.currentUser,
            recentTests: this.getRecentTestResults(),
            exportedAt: new Date().toISOString()
        };

        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `user_data_${this.currentUser.name}_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }

    /**
     * Import user data
     */
    async importUserData(file) {
        try {
            const text = await file.text();
            const userData = JSON.parse(text);
            
            if (!userData.user) {
                throw new Error('Invalid user data format');
            }

            // Check if user already exists
            const existingUser = this.users.find(u => u.id === userData.user.id);
            
            if (existingUser) {
                const overwrite = confirm(`User "${userData.user.name}" already exists. Do you want to overwrite the existing data?`);
                if (!overwrite) return;
                
                // Update existing user
                Object.assign(existingUser, userData.user);
            } else {
                // Add new user
                this.users.push(userData.user);
            }

            this.saveUsers();
            alert(`✅ Successfully imported user data for "${userData.user.name}"`);
            
        } catch (error) {
            console.error('User data import error:', error);
            alert('Error importing user data: ' + error.message);
        }
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Get all users
     */
    getAllUsers() {
        return this.users;
    }

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return this.currentUser !== null;
    }
}

// Initialize global instance
if (typeof window !== 'undefined') {
    window.UserManager = UserManager;
    window.userManager = new UserManager();
}