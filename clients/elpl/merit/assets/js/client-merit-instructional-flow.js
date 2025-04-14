/**
 * Merit Instructional Flow Handler
 * Controls the flow of instruction, navigation, and state management for Merit pages.
 * 
 * @version 1.0.15
 * @module client-merit-instructional-flow
 */

import MeritOpenAIClient from './client-merit-openai.js';

export class MeritInstructionalFlow {
    #config = {
        id: "merit-ela-flow",
        version: "1.0.15",
        sections: ["welcome", "chat"],
        defaultSection: "welcome"
    };

    #state = {
        currentSection: null,
        formValid: false,
        gradeLevel: null,
        curriculum: "ela",
        initialized: false,
        chatReady: false,
        contextLoaded: false
    };

    #elements = {
        sections: null,
        navLinks: null,
        footer: null,
        playbar: null,
        chatbar: null,
        form: null,
        nextButton: null,
        sendButton: null,
        chatInput: null,
        chatWindow: null
    };

    #openAIClient = null;

    constructor() {
        console.log('[Merit Flow] Initializing instructional flow controller');
        
        // Ensure DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.#initialize());
            return;
        }
        
        this.#initialize();
    }

    #initialize = async () => {
        if (!this.#initializeElements()) {
            console.error('[Merit Flow] Failed to initialize elements');
            return;
        }

        this.#openAIClient = new MeritOpenAIClient();
        this.#setupEventListeners();
        this.#initializeActiveSection();
        
        try {
            // Create initial thread
            await this.#openAIClient.createThread();
            this.#state.chatReady = true;
            console.log('[Merit Flow] Chat system initialized');
        } catch (error) {
            console.error('[Merit Flow] Chat initialization failed:', error);
            this.#showError('Chat initialization failed. Please refresh the page.');
        }
        
        this.#logState('Initialization complete');
    };

    #initializeElements() {
        const elements = {
            sections: document.querySelectorAll('.section'),
            navLinks: document.querySelectorAll('.nav-link'),
            footer: document.querySelector('.client-footer'),
            playbar: document.getElementById('playbar'),
            chatbar: document.getElementById('chatbar'),
            form: document.getElementById('welcome-form'),
            nextButton: document.getElementById('next-button'),
            sendButton: document.getElementById('send-button'),
            chatInput: document.getElementById('chat-input'),
            chatWindow: document.getElementById('chat-window')
        };

        // Verify all elements exist
        const missing = Object.entries(elements)
            .filter(([key, el]) => !el)
            .map(([key]) => key);

        if (missing.length > 0) {
            console.error('[Merit Flow] Missing elements:', missing.join(', '));
            return false;
        }

        this.#elements = elements;
        return true;
    }

    #setupEventListeners() {
        // Form validation
        this.#elements.form?.addEventListener('change', () => {
            this.#validateForm();
        });

        // Next button
        this.#elements.nextButton?.addEventListener('click', () => {
            if (this.#state.formValid) {
                this.#handleNavigation('chat');
            }
        });

        // Navigation
        this.#elements.navLinks?.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.#handleNavigation(section);
            });
        });

        // Chat input
        this.#elements.chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.#sendMessage();
            }
        });

        // Send button
        this.#elements.sendButton?.addEventListener('click', () => {
            this.#sendMessage();
        });
    }

    #validateForm() {
        const gradeLevel = this.#elements.form?.querySelector('#grade-level')?.value;
        this.#state.formValid = !!gradeLevel;
        this.#state.gradeLevel = gradeLevel;
        
        this.#updateActionState();
    }

    async #sendMessage() {
        const content = this.#elements.chatInput?.value.trim();
        if (!content || !this.#state.chatReady) return;

        // Clear input and disable
        this.#elements.chatInput.value = '';
        this.#elements.chatInput.disabled = true;
        this.#elements.sendButton.disabled = true;

        try {
            // Show user message
            this.#addMessage('user', content);
            this.#showLoading();

            // Send to API
            const response = await this.#openAIClient.sendMessage(content);
            
            // Show assistant response
            this.#hideLoading();
            this.#addMessage('assistant', response.content);

        } catch (error) {
            console.error('[Merit Flow] Message error:', error);
            this.#hideLoading();
            this.#showError('Failed to send message. Please try again.');
        } finally {
            // Re-enable input
            this.#elements.chatInput.disabled = false;
            this.#elements.sendButton.disabled = false;
            this.#elements.chatInput.focus();
        }
    }

    #addMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = content;
        this.#elements.chatWindow?.appendChild(messageDiv);
        messageDiv.scrollIntoView({ behavior: 'smooth' });
    }

    #showLoading() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message loading';
        loadingDiv.textContent = 'Assistant is thinking...';
        this.#elements.chatWindow?.appendChild(loadingDiv);
        loadingDiv.scrollIntoView({ behavior: 'smooth' });
    }

    #hideLoading() {
        const loadingMessage = this.#elements.chatWindow?.querySelector('.message.loading');
        loadingMessage?.remove();
    }

    #showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message error';
        errorDiv.textContent = message;
        this.#elements.chatWindow?.appendChild(errorDiv);
        errorDiv.scrollIntoView({ behavior: 'smooth' });
    }

    #handleNavigation(section) {
        if (!this.#config.sections.includes(section)) {
            console.error('[Merit Flow] Invalid section:', section);
            return;
        }

        // Update state
        this.#state.currentSection = section;
        
        // Update sections
        this.#elements.sections?.forEach(el => {
            const isActive = el.dataset.section === section;
            el.hidden = !isActive;
            el.classList.toggle('active', isActive);
        });

        // Update navigation
        this.#elements.navLinks?.forEach(link => {
            const isActive = link.dataset.section === section;
            link.classList.toggle('active', isActive);
            link.setAttribute('aria-current', isActive ? 'page' : 'false');
        });

        // Update footer
        if (this.#elements.playbar) {
            this.#elements.playbar.hidden = section !== 'welcome';
        }
        if (this.#elements.chatbar) {
            this.#elements.chatbar.hidden = section !== 'chat';
        }

        // Update URL without reload
        history.pushState({}, '', `#${section}`);
        
        this.#updateActionState();
        this.#logState(`Navigated to ${section}`);
    }

    #updateActionState() {
        if (this.#elements.nextButton) {
            this.#elements.nextButton.disabled = !this.#state.formValid;
        }
        if (this.#elements.sendButton) {
            this.#elements.sendButton.disabled = !this.#state.chatReady;
        }
        if (this.#elements.chatInput) {
            this.#elements.chatInput.disabled = !this.#state.chatReady;
        }
    }

    #initializeActiveSection() {
        const hash = window.location.hash.slice(1);
        const section = this.#config.sections.includes(hash) ? hash : this.#config.defaultSection;
        this.#handleNavigation(section);
    }

    #logState(action) {
        console.log('[Merit Flow]', action, {
            section: this.#state.currentSection,
            formValid: this.#state.formValid,
            gradeLevel: this.#state.gradeLevel,
            curriculum: this.#state.curriculum,
            chatReady: this.#state.chatReady
        });
    }

    getState() {
        return { ...this.#state };
    }

    reset() {
        this.#state = {
            currentSection: this.#config.defaultSection,
            formValid: false,
            gradeLevel: null,
            curriculum: "ela",
            initialized: false,
            chatReady: false,
            contextLoaded: false
        };
        
        this.#openAIClient?.destroy();
        this.#openAIClient = new MeritOpenAIClient();
        this.#initialize();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.meritFlow = new MeritInstructionalFlow();
    } catch (error) {
        console.error('[Merit Flow] Error initializing:', error);
    }
}); 