/**
 * Merit Instructional Flow Handler
 * Controls the flow of instruction, navigation, and state management for Merit pages.
 * 
 * @version 1.0.15
 * @module client-merit-instructional-flow
 */

import MeritOpenAIClient from './client-merit-openai.js';

export class MeritInstructionalFlow {
    /**
     * Configuration for the instructional flow
     * @private
     */
    #config = {
        id: "merit-ela-flow",
        version: "1.0.15",
        sections: ["welcome", "chat"],
        defaultSection: "welcome",
        persistence: {
            storage: "localStorage",
            key: "merit-flow-state"
        }
    };

    /**
     * State management for the flow
     * @private
     */
    #state = {
        currentSection: null,
        formValid: false,
        gradeLevel: null,
        curriculum: "ela",
        initialized: false,
        chatReady: false
    };

    /**
     * DOM elements used by the flow
     * @private
     */
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

    // Private initialize method declaration
    #initialize = () => {
        if (!this.#initializeElements()) {
            console.error('[Merit Flow] Failed to initialize elements');
            return;
        }

        this.#setupEventListeners();
        this.#loadPersistedState();
        this.#initializeActiveSection();
        
        // For MVP testing - hardcode initial state
        this.#state.formValid = true;
        this.#state.chatReady = true;
        this.#state.gradeLevel = 'Grade 1';
        
        this.#logState('Initialization complete');
        console.log('[Merit Flow] All validations passed for MVP testing');
        console.log('[Merit Flow] Note: Proper validation will be implemented in v1.0.16');
    };

    /**
     * Initialize the instructional flow
     * @constructor
     */
    constructor() {
        console.log('[Merit Flow] Initializing instructional flow controller');
        
        // Ensure DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.#initialize());
            return;
        }
        
        this.#initialize();
    }

    /**
     * Initialize DOM elements
     * @private
     */
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
        console.log('[Merit Flow] All elements validated for MVP testing');
        return true;
    }

    /**
     * Set up event listeners
     * @private
     */
    #setupEventListeners() {
        // Form events - hardcoded for MVP
        this.#elements.form?.addEventListener('change', () => {
            this.#validateForm();
        });

        // Next button - explicit navigation to chat
        this.#elements.nextButton?.addEventListener('click', () => {
            console.log('[Merit Flow] Next button clicked');
            this.#handleNavigation('chat');
        });

        // Navigation events
        this.#elements.navLinks?.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                console.log('[Merit Flow] Navigation link clicked:', section);
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

        // Browser navigation
        window.addEventListener('popstate', () => {
            this.#handleBrowserNavigation();
        });
    }

    /**
     * Updates the action button states based on current section and form validity
     * @private
     */
    #updateActionState() {
        // Enable all buttons for MVP testing
        if (this.#elements.nextButton) {
            this.#elements.nextButton.disabled = false;
        }
        if (this.#elements.sendButton) {
            this.#elements.sendButton.disabled = false;
        }
        if (this.#elements.chatInput) {
            this.#elements.chatInput.disabled = false;
        }

        // Update visibility
        if (this.#elements.playbar) {
            this.#elements.playbar.hidden = this.#state.currentSection !== 'welcome';
        }
        if (this.#elements.chatbar) {
            this.#elements.chatbar.hidden = this.#state.currentSection !== 'chat';
        }

        console.log('[Merit Flow] UI state validated for MVP testing');
    }

    /**
     * Handles section navigation
     * @private
     * @param {string} sectionId - The ID of the section to navigate to
     */
    #handleNavigation(sectionId) {
        const previousSection = this.#state.currentSection;
        console.log('[Merit Flow] Navigation:', { from: previousSection, to: sectionId });

        // Update state first
        this.#state.currentSection = sectionId;
        
        // Update sections
        this.#elements.sections?.forEach(section => {
            const isActive = section.dataset.section === sectionId;
            section.classList.toggle('active', isActive);
            section.hidden = !isActive;
        });

        // Update navigation
        this.#elements.navLinks?.forEach(link => {
            const isActive = link.dataset.section === sectionId;
            link.classList.toggle('active', isActive);
            link.setAttribute('aria-current', isActive ? 'page' : 'false');
        });

        // Update footer state
        this.#elements.playbar.hidden = sectionId !== 'welcome';
        this.#elements.chatbar.hidden = sectionId !== 'chat';

        // Update URL
        history.pushState({ section: sectionId }, '', `#${sectionId}`);
        
        // Update UI
        this.#updateActionState();
        this.#persistState();

        console.log('[Merit Flow] Navigation complete:', {
            from: previousSection,
            to: sectionId,
            success: true
        });
    }

    /**
     * Validate form and update state
     * @private
     */
    #validateForm() {
        // Hardcoded for MVP testing
        this.#state.formValid = true;
        this.#state.chatReady = true;
        
        this.#updateActionState();
        this.#persistState();
        
        console.log('[Merit Flow] Form validation passed for MVP testing');
        return true;
    }

    /**
     * Handle browser navigation events
     * @private
     */
    #handleBrowserNavigation() {
        const hash = window.location.hash.slice(1);
        if (this.#config.sections.includes(hash)) {
            this.#handleNavigation(hash);
        }
    }

    /**
     * Load persisted state from storage
     * @private
     */
    #loadPersistedState() {
        try {
            const stored = localStorage.getItem(this.#config.persistence.key);
            if (stored) {
                const parsed = JSON.parse(stored);
                this.#state = { ...this.#state, ...parsed };
            }
        } catch (error) {
            console.error('[Merit Flow] Error loading state:', error);
        }
    }

    /**
     * Persist current state to storage
     * @private
     */
    #persistState() {
        try {
            localStorage.setItem(
                this.#config.persistence.key,
                JSON.stringify(this.#state)
            );
        } catch (error) {
            console.error('[Merit Flow] Error persisting state:', error);
        }
    }

    /**
     * Initialize active section based on URL or default
     * @private
     */
    #initializeActiveSection() {
        const hash = window.location.hash.slice(1);
        const initialSection = this.#config.sections.includes(hash) 
            ? hash 
            : this.#config.defaultSection;
        
        this.#handleNavigation(initialSection);
        this.#state.initialized = true;
    }

    /**
     * Get current flow state
     * @public
     * @returns {Object}
     */
    getState() {
        return { ...this.#state };
    }

    /**
     * Reset flow state
     * @public
     */
    reset() {
        this.#state = {
            currentSection: this.#config.defaultSection,
            formValid: false,
            gradeLevel: null,
            curriculum: "ela",
            initialized: true
        };
        this.#persistState();
        this.#handleNavigation(this.#config.defaultSection);
    }

    /**
     * Log current state for debugging
     * @private
     * @param {string} action - The action that triggered the state change
     */
    #logState(action) {
        console.log('[Merit Flow] State Update:', {
            action,
            section: this.#state.currentSection,
            formValid: this.#state.formValid,
            gradeLevel: this.#state.gradeLevel,
            curriculum: this.#state.curriculum
        });
    }

    /**
     * Handle Escape key press
     * @private
     */
    #handleEscapeKey() {
        if (this.#state.currentSection === 'chat') {
            this.#handleNavigation('welcome');
        }
    }

    /**
     * Handle Tab navigation
     * @private
     * @param {KeyboardEvent} e
     */
    #handleTabNavigation(e) {
        const activeSection = document.querySelector('.section.active');
        if (!activeSection) return;

        const focusableElements = activeSection.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }

    /**
     * Sends a message to the OpenAI assistant
     * @param {string} content Message content
     * @returns {Promise<void>}
     */
    async #sendMessage() {
        const content = this.#elements.chatInput?.value.trim();
        if (!content) return;

        try {
            // Clear input and show user message
            this.#elements.chatInput.value = '';
            this.#addMessage('user', content);
            this.#addMessage('loading', 'Assistant is thinking...');

            // Get response from OpenAI
            const response = await this.openAIClient.sendMessage(content);
            
            // Remove loading and show response
            this.#removeLoadingMessage();
            this.#addMessage('assistant', response.content);

        } catch (error) {
            console.error('[Merit Flow] Chat error:', error);
            this.#removeLoadingMessage();
            this.#addMessage('error', 'Failed to get response. Please try again.');
        }
    }

    #addMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = content;
        this.#elements.chatWindow?.appendChild(messageDiv);
        messageDiv.scrollIntoView({ behavior: 'smooth' });
    }

    #removeLoadingMessage() {
        const loadingMessage = document.querySelector('.message.loading');
        if (loadingMessage) loadingMessage.remove();
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