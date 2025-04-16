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
        
        // Chat is ready immediately - thread will be created with first message
        this.#state.chatReady = true;
        console.log('[Merit Flow] Chat system initialized for new user session');
        
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

    async #handleNavigation(section) {
        if (!this.#config.sections.includes(section)) {
            console.error('[Merit Flow] Invalid section:', section);
            return;
        }

        // If moving to chat, create user session first
        if (section === 'chat' && !this.#state.contextLoaded) {
            try {
                const email = document.querySelector('#header-span')?.dataset?.userEmail || 'default@integral-ed.com';
                const context = {
                    gradeLevel: this.#state.gradeLevel,
                    curriculum: this.#state.curriculum
                };
                
                // Create Redis user session
                const userData = await this.#openAIClient.createUserSession(email, context);
                console.log('[Merit Flow] User session created:', userData);
                
                this.#state.contextLoaded = true;
            } catch (error) {
                console.error('[Merit Flow] Failed to create user session:', error);
                this.#showError('Failed to initialize chat. Please try again.');
                return;
            }
        }

        // Update active section
        this.#state.currentSection = section;
        this.#elements.sections?.forEach(s => {
            s.classList.toggle('active', s.id === section);
        });

        // Update navigation
        this.#elements.navLinks?.forEach(link => {
            link.classList.toggle('active', link.dataset.section === section);
        });

        // Update footer visibility and content
        if (section === 'chat') {
            this.#elements.playbar?.setAttribute('hidden', '');
            this.#elements.chatbar?.removeAttribute('hidden');
            this.#elements.chatInput?.focus();
        } else {
            this.#elements.chatbar?.setAttribute('hidden', '');
            this.#elements.playbar?.removeAttribute('hidden');
        }

        this.#logState(`Navigated to ${section}`);
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
            this.#elements.nextButton.disabled = !this.#state.formValid;
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