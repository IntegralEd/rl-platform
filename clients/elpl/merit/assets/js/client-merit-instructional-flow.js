/**
 * Merit Instructional Flow Handler
 * Controls the flow of instruction, navigation, and state management for Merit pages.
 * Integrates admin and client functionality in a unified controller.
 * 
 * @version 1.0.21
 * @module client-merit-instructional-flow
 */

import MeritOpenAIClient from './client-merit-openai.js';

export class MeritInstructionalFlow {
    #config = {
        id: "merit-ela-flow",
        version: "1.0.21",
        sections: ["welcome", "chat"],
        defaultSection: "welcome",
        schema_version: window.env.SCHEMA_VERSION
    };

    #state = {
        currentSection: null,
        formValid: false,
        gradeLevel: null,
        curriculum: "ela",
        initialized: false,
        chatReady: false,
        contextLoaded: false,
        isAdmin: false,
        redisConnected: false,
        hasError: false,
        errorMessage: null,
        openAIConfigured: false
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
        chatWindow: null,
        adminControls: null
    };

    #openAIClient = null;

    constructor(isAdmin = false) {
        console.log('[Merit Flow] Initializing unified flow controller');
        this.#state.isAdmin = isAdmin;
        
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

        try {
            // Initialize OpenAI client and verify configuration
            this.#openAIClient = new MeritOpenAIClient();
            const clientState = this.#openAIClient.getState();
            
            if (!clientState.hasError) {
                this.#state.openAIConfigured = true;
                this.#state.redisConnected = true;
                console.log('[Merit Flow] OpenAI client configured successfully', {
                    project: this.#openAIClient.config.project_id,
                    schema: this.#openAIClient.config.schema_version
                });
            } else {
                throw new Error('OpenAI client configuration failed: ' + clientState.errorMessage);
            }
            
            // Initialize based on role
            if (this.#state.isAdmin) {
                await this.#initializeAdminFeatures();
            }
            
            const welcomeSection = document.querySelector('[data-section="welcome"]');
            if (welcomeSection) {
                welcomeSection.classList.add('active');
                welcomeSection.removeAttribute('hidden');
            }

            const welcomeForm = document.getElementById('welcome-form');
            if (welcomeForm) {
                welcomeForm.style.display = 'block';
            }

            this.#setupEventListeners();
            this.#state.chatReady = true;
            this.#logState('Initialization complete');
            
        } catch (error) {
            this.#handleError(error);
        }
    };

    async #initializeAdminFeatures() {
        // Admin-specific initialization
        const adminControls = document.querySelector('.admin-controls');
        if (adminControls) {
            this.#elements.adminControls = adminControls;
            adminControls.removeAttribute('hidden');
        }
        
        // Add admin event listeners
        this.#setupAdminEventListeners();
    }

    #setupAdminEventListeners() {
        if (!this.#state.isAdmin) return;
        
        const adminControls = this.#elements.adminControls;
        if (!adminControls) return;

        // Admin-specific event listeners
        adminControls.querySelectorAll('[data-admin-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.dataset.adminAction;
                this.#handleAdminAction(action);
            });
        });
    }

    async #handleAdminAction(action) {
        try {
            switch (action) {
                case 'reset-context':
                    await this.#openAIClient.resetContext();
                    this.#logState('Admin: Context reset');
                    break;
                case 'view-logs':
                    this.#displayAdminLogs();
                    break;
                default:
                    console.warn('[Merit Flow] Unknown admin action:', action);
            }
        } catch (error) {
            this.#handleError(error);
        }
    }

    #displayAdminLogs() {
        if (!this.#state.isAdmin) return;
        
        const logs = {
            state: this.#state,
            redis: this.#state.redisConnected,
            thread: this.#openAIClient?.threadId,
            errors: this.#state.errorMessage
        };
        
        console.table(logs);
    }

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
        
        // Log element initialization
        console.log('[Merit Flow] Elements initialized:', Object.keys(elements));
        return true;
    }

    #setupEventListeners() {
        // Form validation
        this.#elements.form?.addEventListener('change', () => {
            this.#validateForm();
        });

        const gradeSelect = this.#elements.form?.querySelector('#grade-level');
        if (gradeSelect) {
            gradeSelect.addEventListener('input', () => {
                console.log('[Merit Flow] gradeSelect input event fired');
                this.#validateForm();
            });
        }

        // Next button
        this.#elements.nextButton?.addEventListener('click', (e) => {
            if (this.#state.formValid) {
                e.preventDefault();
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
        console.log('[Merit Flow] validateForm: gradeLevel value:', gradeLevel);
        this.#state.formValid = !!gradeLevel;
        this.#state.gradeLevel = gradeLevel;
        
        this.#updateActionState();
    }

    async #handleNavigation(sectionOrEvent) {
        let targetSection;
        
        // Handle both event objects and direct section strings
        if (typeof sectionOrEvent === 'string') {
            targetSection = sectionOrEvent;
        } else if (sectionOrEvent && typeof sectionOrEvent === 'object' && typeof sectionOrEvent.preventDefault === 'function') {
            sectionOrEvent.preventDefault();
            targetSection = sectionOrEvent.target.getAttribute('href').substring(1);
        } else {
            console.error('[Merit Flow] Invalid navigation parameter:', sectionOrEvent);
            return;
        }
        
        try {
            console.log('[Merit Flow] Attempting to navigate to:', targetSection);
            
            // First update the UI immediately to show the new section
            // Update active section
            this.#elements.sections.forEach(section => {
                section.hidden = section.dataset.section !== targetSection;
                if (!section.hidden) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });
            
            // Update navigation links
            this.#elements.navLinks.forEach(link => {
                const isActive = link.dataset.section === targetSection;
                link.classList.toggle('active', isActive);
                link.setAttribute('aria-current', isActive ? 'page' : 'false');
            });
            
            // Update UI elements based on section
            if (targetSection === 'chat') {
                this.#elements.playbar.hidden = true;
                this.#elements.chatbar.hidden = false;
            } else {
                this.#elements.playbar.hidden = false;
                this.#elements.chatbar.hidden = true;
            }
            
            // Now handle background initialization if needed
            // Only create thread when entering chat section
            if (targetSection === 'chat' && !this.#openAIClient.threadId) {
                console.log('[Merit Flow] Creating new thread for chat...');
                const loadingMessage = document.createElement('div');
                loadingMessage.className = 'alert alert-info';
                loadingMessage.textContent = 'Connecting to chat service...';
                this.#elements.chatWindow.appendChild(loadingMessage);
                
                // Create thread in the background
                this.#openAIClient.createThread()
                    .then(() => {
                        loadingMessage.remove();
                        console.log('[Merit Flow] Thread creation completed');
                    })
                    .catch(error => {
                        console.error('[Merit Flow] Thread creation failed:', error);
                        loadingMessage.className = 'alert alert-danger';
                        loadingMessage.innerHTML = `
                            ${this.#openAIClient.getState().errorMessage}<br>
                            <button class="btn btn-outline-danger mt-2" onclick="window.location.reload()">
                                Try Again
                            </button>
                        `;
                    });
            }
            
            // Track navigation
            console.log('[Merit Flow] Navigation successful:', {
                section: targetSection,
                threadId: this.#openAIClient?.threadId || 'not_created'
            });
            
        } catch (error) {
            console.error('[Merit Flow] Navigation error:', error);
            this.#handleError(error);
        }
    }

    async #sendMessage() {
        const content = this.#elements.chatInput?.value.trim();
        if (!content || !this.#state.chatReady) return;

        console.log('[Merit Flow] Processing message:', {
            content,
            isNewThread: !this.#openAIClient.threadId,
            gradeLevel: this.#state.gradeLevel
        });

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
            
            // If this created a new thread, update user record
            if (response.thread_id && !this.#openAIClient.threadId) {
                const email = document.querySelector('#header-span')?.dataset?.userEmail;
                if (email) {
                    await this.#openAIClient.updateUserThread(email, response.thread_id);
                }
            }

            // Show assistant response
            this.#hideLoading();
            this.#addMessage('assistant', response.content);

            // Log successful chat interaction
            console.log('[Merit Flow] Chat exchange complete:', {
                threadId: this.#openAIClient.threadId,
                hasResponse: true
            });

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

    #updateActionState() {
        if (this.#elements.nextButton) {
            const shouldBeEnabled = this.#state.formValid;
            this.#elements.nextButton.disabled = !shouldBeEnabled;
            
            // Update button visibility and active state
            if (shouldBeEnabled) {
                this.#elements.nextButton.style.opacity = '1';
                this.#elements.nextButton.dataset.active = 'true';
            } else {
                this.#elements.nextButton.style.opacity = '0.7';
                this.#elements.nextButton.dataset.active = 'false';
            }
            
            console.log('[Merit Flow] Next button updated:', {
                disabled: !shouldBeEnabled,
                active: shouldBeEnabled,
                formValid: this.#state.formValid
            });
        }
        
        if (this.#elements.sendButton) {
            this.#elements.sendButton.disabled = !this.#state.chatReady;
        }
        if (this.#elements.chatInput) {
            this.#elements.chatInput.disabled = !this.#state.chatReady;
        }
        
        console.log('[Merit Flow] Action state updated:', {
            nextButton: this.#elements.nextButton?.disabled,
            sendButton: this.#elements.sendButton?.disabled,
            chatInput: this.#elements.chatInput?.disabled,
            chatReady: this.#state.chatReady,
            formValid: this.#state.formValid,
            currentSection: this.#state.currentSection
        });
    }

    #initializeActiveSection() {
        const hash = window.location.hash.slice(1);
        const section = this.#config.sections.includes(hash) ? hash : this.#config.defaultSection;
        this.#handleNavigation(section);
    }

    #logState(action) {
        const state = {
            section: this.#state.currentSection,
            formValid: this.#state.formValid,
            gradeLevel: this.#state.gradeLevel,
            curriculum: this.#state.curriculum,
            chatReady: this.#state.chatReady,
            isAdmin: this.#state.isAdmin,
            redisConnected: this.#state.redisConnected
        };
        
        console.log('[Merit Flow]', action, state);
        
        if (this.#state.isAdmin) {
            this.#displayAdminLogs();
        }
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
            contextLoaded: false,
            isAdmin: this.#state.isAdmin,
            redisConnected: false,
            hasError: false,
            errorMessage: null,
            openAIConfigured: false
        };
        
        this.#openAIClient?.destroy();
        this.#openAIClient = new MeritOpenAIClient();
        this.#initialize();
    }

    #handleError(error) {
        this.#state.hasError = true;
        this.#state.errorMessage = error.message;
        console.error('[Merit Flow] Error:', error);
        
        const errorMessage = this.#state.isAdmin 
            ? `Error: ${error.message}\nCheck console for details.`
            : 'An error occurred. Please try again.';
            
        this.#elements.chatWindow.innerHTML = `
            <div class="error-message" role="alert">
                <p>${errorMessage}</p>
                <button onclick="window.location.reload()">Refresh Page</button>
            </div>
        `;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Check for admin role
        const isAdmin = document.body.hasAttribute('data-admin-view');
        window.meritFlow = new MeritInstructionalFlow(isAdmin);
    } catch (error) {
        console.error('[Merit Flow] Error initializing:', error);
    }
});

/*
Immediate Client Layout Punch List (to be addressed promptly):
1. Tidy up the chat container div structure for a more organized layout.
2. Align chat input and send button consistently within the chatbar.
3. Standardize spacing and margins for chat components.
4. Improve alignment of chat messages for better readability.
5. Optimize responsive design for chat sections on mobile devices.

UX & Accessibility Tickets for v19 (to work on overnight):
1. Refactor chat container divs for a tidier, more organized layout.
2. Improve focus management and tab order for chat input and send button.
3. Enhance color contrast and font sizes for better readability.
4. Add ARIA roles and labels to all interactive elements in the chat interface.
5. Standardize spacing and margins across chat messages and action buttons.
6. Incorporate better animation and feedback on button hovers.
7. Tidy up the chat header and version display alignment.
8. Streamline error message display for improved accessibility.
9. Implement lazy loading for chat message history.
10. Improve loading state indicators with accessible announcements.
11. Optimize responsive design layout for mobile view.
12. Enhance button size consistency across various screen sizes.
13. Add tooltips for clarity on button functions.
14. Improve keyboard navigation support within the chat interface.
15. Ensure all interactive elements have proper focus outlines.
16. Optimize the streaming message indicator for clarity.
17. Refactor event handling to reduce latency.
18. Improve error recovery messaging in the chat window.
19. Enhance the visual hierarchy of chat sections.
20. Standardize use of web fonts and icons across the chat interface.
*/ 