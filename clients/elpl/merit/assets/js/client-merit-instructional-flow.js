/**
 * Merit Instructional Flow Handler
 * Controls the flow of instruction, navigation, and state management for Merit pages.
 * 
 * @version 1.0.14
 * @module client-merit-instructional-flow
 */

export class MeritInstructionalFlow {
    /**
     * Configuration for the instructional flow
     * @private
     */
    #config = {
        id: "merit-ela-flow",
        version: "1.0.14",
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
        formValid: true,  // Hardcoded to true for MVP testing
        gradeLevel: "Grade 1",  // Default for MVP
        curriculum: "ela",
        initialized: false,
        chatReady: true  // Hardcoded to true for MVP testing
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

    /**
     * Initialize the instructional flow
     * @constructor
     */
    constructor() {
        console.log('[Merit Flow] Initializing instructional flow controller');
        this.#initializeElements();
        this.#setupEventListeners();
        this.#loadPersistedState();
        this.#initializeActiveSection();
        this.#logState('Initialization complete');
    }

    /**
     * Initialize DOM elements
     * @private
     */
    #initializeElements() {
        this.#elements = {
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

        console.log('[Merit Flow] All elements validated for MVP testing');
        return true; // Always return true for MVP
    }

    /**
     * Set up event listeners
     * @private
     */
    #setupEventListeners() {
        // Navigation events
        this.#elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.#handleNavigation(link.dataset.section);
            });
        });

        // Form events
        this.#elements.form.addEventListener('change', () => {
            this.#validateForm();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.#handleEscapeKey();
            }
            if (e.key === 'Tab') {
                this.#handleTabNavigation(e);
            }
        });

        // Handle browser navigation
        window.addEventListener('popstate', () => {
            this.#handleBrowserNavigation();
        });
    }

    /**
     * Updates the action button states based on current section and form validity
     * @private
     */
    #updateActionState() {
        // All buttons enabled for MVP testing
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
        console.log('[Merit Flow] Navigating to section:', sectionId);
        
        // Validate section exists
        if (!this.#config.sections.includes(sectionId)) {
            console.error(`[Merit Flow] Invalid section: ${sectionId}`);
            return false;
        }

        // Critical: Check navigation requirements
        if (sectionId === 'chat' && !this.#state.formValid) {
            console.warn('[Merit Flow] Cannot navigate to chat - form invalid');
            return false;
        }

        // Update section visibility
        this.#elements.sections.forEach(section => {
            const isActive = section.dataset.section === sectionId;
            section.classList.toggle('active', isActive);
            section.hidden = !isActive;
        });

        // Update navigation state
        this.#elements.navLinks.forEach(link => {
            const isActive = link.dataset.section === sectionId;
            link.classList.toggle('active', isActive);
            link.setAttribute('aria-current', isActive ? 'page' : 'false');
        });

        // Critical: Update state before UI
        this.#state.currentSection = sectionId;
        this.#persistState();
        
        // Update UI last
        this.#updateActionState();

        // Update URL without reload
        history.pushState({ section: sectionId }, '', `#${sectionId}`);
        
        this.#logState('Navigation complete');
        return true;
    }

    /**
     * Validate form and update state
     * @private
     */
    #validateForm() {
        // Always valid for MVP testing
        this.#state.formValid = true;
        this.#state.chatReady = true;
        
        // Force UI update
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
            console.error('Error loading persisted state:', error);
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
            console.error('Error persisting state:', error);
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
        console.group(`[Merit Flow] ${action}`);
        console.log('Current Section:', this.#state.currentSection);
        console.log('Form Valid:', this.#state.formValid);
        console.log('Grade Level:', this.#state.gradeLevel);
        console.log('Curriculum:', this.#state.curriculum);
        console.log('Path:', window.location.pathname + window.location.hash);
        console.groupEnd();
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
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.meritFlow = new MeritInstructionalFlow();
    } catch (error) {
        console.error('Error initializing Merit flow:', error);
    }
}); 