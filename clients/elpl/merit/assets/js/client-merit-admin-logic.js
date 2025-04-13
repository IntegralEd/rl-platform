/**
 * Merit Instructional Flow Controller
 * Handles state transitions, Redis integration, and UI management
 * @version 1.0.15
 */

class MeritInstructionalFlow {
    constructor() {
        this.state = {
            section: 'welcome',
            formValid: false,
            gradeLevel: null,
            curriculum: 'ela',
            isLoading: false,
            redisConnected: false
        };
        
        this.initializeElements();
        this.setupEventListeners();
        this.initializeRedis();
        this.logState('Initializing v1.0.15...');
    }

    initializeElements() {
        // Form elements
        this.form = document.getElementById('welcome-form');
        this.gradeSelect = document.getElementById('grade-level');
        this.curriculumSelect = document.getElementById('curriculum');
        
        // Navigation elements
        this.sections = document.querySelectorAll('.section');
        this.navLinks = document.querySelectorAll('.nav-link');
        
        // Action elements
        this.nextButton = document.getElementById('next-button');
        this.sendButton = document.getElementById('send-button');
        this.chatInput = document.getElementById('chat-input');
        
        // Section containers
        this.welcomeSection = document.querySelector('[data-section="welcome"]');
        this.chatSection = document.querySelector('[data-section="chat"]');
        this.chatWindow = document.getElementById('chat-window');

        this.logState('Elements found: form, grade, curriculum');
    }

    setupEventListeners() {
        // Form validation
        this.gradeSelect.addEventListener('change', () => this.validateForm());
        this.curriculumSelect.addEventListener('change', () => this.validateForm());
        
        // Next button
        this.nextButton.addEventListener('click', () => this.handleNextClick());
        
        // Navigation
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.canNavigate(link.dataset.section)) {
                    this.updateUIState(link.dataset.section);
                }
            });
        });
    }

    async initializeRedis() {
        try {
            // Initialize Redis connection
            this.redis = new RedisManager();
            this.state.redisConnected = true;
            console.log('[Redis] Connection established');
        } catch (error) {
            console.error('[Redis] Connection failed:', error);
            this.state.redisConnected = false;
        }
    }

    validateForm() {
        const gradeValid = this.gradeSelect.value !== '';
        const curriculumValid = this.curriculumSelect.value === 'ela';
        
        this.state.formValid = gradeValid && curriculumValid;
        this.state.gradeLevel = this.gradeSelect.value;
        
        this.nextButton.disabled = !this.state.formValid;
        this.logState(`Form validation: ${this.state.formValid} (grade: ${this.state.gradeLevel}, curriculum: ${this.state.curriculum})`);
    }

    async handleNextClick() {
        if (!this.state.formValid) return;
        
        this.logState('Form submitted:', {
            grade: this.state.gradeLevel,
            curriculum: this.state.curriculum
        });

        // 1. Immediate UI Updates
        this.updateUIState('chat');
        this.showLoadingState();
        
        // 2. Async Redis Operations
        try {
            const welcomeMessage = await this.redis.loadWelcomeMessage(this.state.gradeLevel);
            this.displayWelcomeMessage(welcomeMessage);
        } catch (error) {
            this.handleRedisError(error);
        }
    }

    updateUIState(section) {
        // Update state
        this.state.section = section;
        
        // Update navigation
        this.navLinks.forEach(link => {
            const isActive = link.dataset.section === section;
            link.classList.toggle('active', isActive);
            link.setAttribute('aria-current', isActive ? 'page' : 'false');
        });
        
        // Update sections
        this.sections.forEach(s => {
            const isActive = s.dataset.section === section;
            s.classList.toggle('active', isActive);
            s.hidden = !isActive;
        });
        
        // Update footer state
        document.getElementById('playbar').hidden = section === 'chat';
        document.getElementById('chatbar').hidden = section === 'welcome';
        
        // Update URL without reload
        history.pushState({}, '', `#${section}`);
        
        this.logState(`Transitioning to ${section}...`);
    }

    showLoadingState() {
        this.chatWindow.innerHTML = `
            <div class="loading-indicator" role="status">
                <span>Loading your personalized chat experience...</span>
                <div class="loading-animation"></div>
            </div>
        `;
    }

    displayWelcomeMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message assistant';
        messageElement.innerHTML = message.content;
        
        this.chatWindow.innerHTML = '';
        this.chatWindow.appendChild(messageElement);
        
        // Enable chat input
        this.chatInput.disabled = false;
        this.sendButton.disabled = false;
        
        this.logState('Welcome message loaded');
    }

    handleRedisError(error) {
        console.error('[Redis] Error:', error);
        this.chatWindow.innerHTML = `
            <div class="error-message" role="alert">
                <p>Unable to load chat experience. Please try:</p>
                <button onclick="window.location.reload()">Refresh Page</button>
            </div>
        `;
    }

    canNavigate(targetSection) {
        if (targetSection === 'chat' && !this.state.formValid) {
            this.logState('Navigation blocked: Form not valid');
            return false;
        }
        return true;
    }

    logState(message, data = {}) {
        console.log(`[MeritInstructionalFlow] ${message}`, data);
    }
}

class RedisManager {
    async loadWelcomeMessage(gradeLevel) {
        const key = `welcome:${gradeLevel}:ela`;
        try {
            // Simulate Redis get with 500ms delay
            await new Promise(resolve => setTimeout(resolve, 500));
            return this.getDefaultWelcome(gradeLevel);
        } catch (error) {
            console.error('[Redis] Connection error:', error);
            throw error;
        }
    }

    getDefaultWelcome(gradeLevel) {
        return {
            type: 'assistant',
            content: `Welcome to Grade ${gradeLevel} ELA support! How can I help you today?`
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MeritInstructionalFlow();
}); 