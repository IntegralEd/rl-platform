/**
 * Merit Instructional Flow Handler
 * Controls the flow of instruction, navigation, and state management for Merit pages.
 * 
 * @version 1.0.0
 * @module client-merit-instructional-flow
 */

export class MeritInstructionalFlow {
    /**
     * Configuration for the instructional flow
     * @private
     */
    #config = {
        id: "merit-ela-flow",
        version: "1.0.0",
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
        initialized: false
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
        form: null
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
            form: document.getElementById('welcome-form')
        };

        // Validate required elements
        if (!this.#validateElements()) {
            throw new Error('Required elements not found for Merit instructional flow');
        }
    }

    /**
     * Validate required elements exist
     * @private
     * @returns {boolean}
     */
    #validateElements() {
        return Object.values(this.#elements).every(element => 
            element !== null && (
                element instanceof NodeList ? element.length > 0 : true
            )
        );
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
     * Handle section navigation
     * @private
     * @param {string} sectionId
     */
    #handleNavigation(sectionId) {
        console.log(`[Merit Flow] Navigating to section: ${sectionId}`);
        
        // Validate section exists
        if (!this.#config.sections.includes(sectionId)) {
            console.error(`[Merit Flow] Invalid section: ${sectionId}`);
            return;
        }

        // Check if navigation is allowed
        if (!this.#canNavigateToSection(sectionId)) {
            console.warn(`[Merit Flow] Navigation to ${sectionId} blocked - requirements not met`);
            return;
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

        // Update footer state
        this.#updateFooterState(sectionId);

        // Update state and persist
        this.#state.currentSection = sectionId;
        this.#persistState();

        // Update URL without reload
        history.pushState(
            { section: sectionId },
            '',
            `#${sectionId}`
        );

        this.#logState('Navigation complete');
    }

    /**
     * Check if navigation to section is allowed
     * @private
     * @param {string} sectionId
     * @returns {boolean}
     */
    #canNavigateToSection(sectionId) {
        if (sectionId === 'chat') {
            return this.#state.formValid;
        }
        return true;
    }

    /**
     * Update footer state based on active section
     * @private
     * @param {string} sectionId
     */
    #updateFooterState(sectionId) {
        const isWelcome = sectionId === 'welcome';
        this.#elements.playbar.hidden = !isWelcome;
        this.#elements.chatbar.hidden = isWelcome;
    }

    /**
     * Validate form and update state
     * @private
     */
    #validateForm() {
        const form = this.#elements.form;
        const isValid = form.checkValidity();
        const gradeLevel = form.querySelector('#grade-level').value;
        const curriculum = form.querySelector('#curriculum').value;

        this.#state.formValid = isValid;
        this.#state.gradeLevel = gradeLevel;
        this.#state.curriculum = curriculum;

        // Update next button state
        const nextButton = document.getElementById('next-button');
        if (nextButton) {
            nextButton.disabled = !isValid;
        }

        this.#persistState();
        this.#logState('Form validation');
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