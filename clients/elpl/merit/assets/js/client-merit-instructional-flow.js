/**
 * Merit Instructional Flow Handler
 * Controls the flow of instruction, navigation, and state management for Merit pages.
 * Integrates admin and client functionality in a unified controller.
 * 
 * @version 1.0.22
 * @module client-merit-instructional-flow
 */

import { MeritOpenAIClient } from './client-merit-openai.js';

export class MeritInstructionalFlow {
    #config = {
        id: "merit-ela-flow",
        version: window.env.SCHEMA_VERSION,
        sections: ["welcome", "chat"],
        defaultSection: "welcome",
        apiEndpoint: window.env.RL_API_GATEWAY_ENDPOINT,
        apiFallback: window.env.RL_API_FALLBACK_ENDPOINT,
        assistant: {
            id: window.env.MERIT_ASSISTANT_ID,
            project: window.env.OPENAI_PROJECT_ID,
            org: window.env.MERIT_ORG_ID
        },
        cors: {
            origin: window.env.CORS_ORIGIN,
            methods: window.env.CORS_METHODS,
            headers: window.env.CORS_HEADERS
        },
        retryAttempts: window.env.RL_API_RETRY_ATTEMPTS || 3,
        timeout: window.env.RL_API_TIMEOUT || 30000
    };

    #state = {
        currentSection: 'welcome',
        formValid: false,
        gradeLevel: null,
        initialized: false,
        chatReady: false,
        contextLoaded: false,
        isAdmin: false,
        hasError: false,
        errorMessage: null,
        openAIConfigured: false,
        threadId: null,
        context: {},
        mockMode: window.env?.ENABLE_MOCK_MODE || false,
        connectionAttempts: 0,
        lastEndpoint: null
    };

    #elements = {
        sections: [],
        navLinks: null,
        footer: null,
        playbar: null,
        chatbar: null,
        form: null,
        nextButton: null,
        sendButton: null,
        chatInput: null,
        chatWindow: null,
        adminControls: null,
        gradeSelect: null
    };

    #openAIClient = null;
    assistant = null;

    constructor(isAdmin = false) {
        console.log('[Merit Flow] Initializing flow controller:', {
            version: this.#config.version,
            endpoint: this.#config.apiEndpoint,
            timestamp: new Date().toISOString()
        });
        
        this.#state.isAdmin = isAdmin;
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.#initialize());
            return;
        }
        
        this.#initialize();
    }

    #initialize = async () => {
        console.log('[Merit Flow] Starting initialization...');
        
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
                console.log('[Merit Flow] OpenAI client configured successfully:', {
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
            
            console.log('[Merit Flow] Initialization complete:', {
                state: this.getState(),
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('[Merit Flow] Initialization error:', error);
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
            sections: document.querySelectorAll('[data-section]'),
            navLinks: document.querySelectorAll('.client-nav__item'),
            footer: document.querySelector('.rl-footer'),
            playbar: null,
            chatbar: null,
            form: null,
            nextButton: document.getElementById('nextButton'),
            sendButton: document.getElementById('send-button'),
            chatInput: document.getElementById('chat-input'),
            chatWindow: document.getElementById('chat-window'),
            adminControls: null,
            gradeSelect: document.getElementById('gradeSelect')
        };

        // Only require elements that are present in the new HTML
        const required = ['sections', 'navLinks', 'footer', 'nextButton', 'sendButton', 'chatInput', 'chatWindow', 'gradeSelect'];
        const missing = required.filter(key => !elements[key]);
        if (missing.length > 0) {
            console.error('[Merit Flow] Missing elements:', missing.join(', '));
            return false;
        }
        this.#elements = elements;
        console.log('[Merit Flow] Elements initialized:', Object.keys(elements));
        return true;
    }

    #setupEventListeners() {
        // Grade selection (multi-select)
        const gradeOptions = document.querySelectorAll('.grade-option');
        const nextButton = document.getElementById('nextButton');
        let selectedGrades = [];
        gradeOptions.forEach(option => {
            option.addEventListener('click', function() {
                option.classList.toggle('selected');
                const grade = option.getAttribute('data-grade');
                if (option.classList.contains('selected')) {
                    if (!selectedGrades.includes(grade)) selectedGrades.push(grade);
                } else {
                    selectedGrades = selectedGrades.filter(g => g !== grade);
                }
                nextButton.disabled = selectedGrades.length === 0;
                if (selectedGrades.length > 0) {
                    nextButton.classList.add('enabled');
                } else {
                    nextButton.classList.remove('enabled');
                }
                this.#state.gradeLevel = selectedGrades;
            }.bind(this));
            option.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    option.click();
                }
            });
        });
        nextButton.addEventListener('click', async (e) => {
            e.preventDefault();
            if (selectedGrades.length === 0) return;
            try {
                // Create thread using new API
                const thread = await this.#openAIClient.createThread();
                this.#state.threadId = thread.id;
                // Send preflight context message
                const contextMsg = `New user is an English Language Arts user of ${selectedGrades.join(', ')} curriculum. Say: 'Hi, I'm Merit. How can I help with ${selectedGrades.join(', ')} ELA curriculum questions?'`;
                await this.#openAIClient.sendMessage(contextMsg);
                // Switch to chat section
                this.#handleNavigation('chat');
            } catch (err) {
                this.#showError('Failed to start chat. Please try again.');
            }
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

    async #sendMessage() {
        const content = this.#elements.chatInput?.value.trim();
        if (!content) return;
        this.#elements.chatInput.value = '';
        this.#elements.chatInput.disabled = true;
        this.#elements.sendButton.disabled = true;
        try {
            this.#addMessage('user', content);
            this.#showLoading();
            // Use new sendMessage API (thread/message/run)
            const response = await this.#openAIClient.sendMessage(content);
            this.#hideLoading();
            this.#addMessage('assistant', response.content);
        } catch (error) {
            this.#hideLoading();
            this.#showError('Failed to send message. Please try again.');
        } finally {
            this.#elements.chatInput.disabled = false;
            this.#elements.sendButton.disabled = false;
            this.#elements.chatInput.focus();
        }
    }

    #addMessage(type, content) {
        const messageBlock = document.createElement('div');
        messageBlock.className = `message-block ${type}`;

        const avatar = document.createElement('div');
        avatar.className = 'avatar';

        const messageContainer = document.createElement('div');
        
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = content;

        const timestamp = document.createElement('div');
        timestamp.className = 'timestamp';
        timestamp.textContent = new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).toLowerCase();

        messageContainer.appendChild(message);
        messageContainer.appendChild(timestamp);

        if (type === 'user') {
            messageBlock.appendChild(messageContainer);
            messageBlock.appendChild(avatar);
        } else {
            messageBlock.appendChild(avatar);
            messageBlock.appendChild(messageContainer);
        }

        this.#elements.chatWindow?.appendChild(messageBlock);
        messageBlock.scrollIntoView({ behavior: 'smooth' });
    }

    #showLoading() {
        const messageBlock = document.createElement('div');
        messageBlock.className = 'message-block assistant loading';

        const avatar = document.createElement('div');
        avatar.className = 'avatar';

        const messageContainer = document.createElement('div');
        
        const message = document.createElement('div');
        message.className = 'message assistant';
        message.textContent = 'Assistant is thinking...';

        const timestamp = document.createElement('div');
        timestamp.className = 'timestamp';
        timestamp.textContent = 'now';

        messageContainer.appendChild(message);
        messageContainer.appendChild(timestamp);

        messageBlock.appendChild(avatar);
        messageBlock.appendChild(messageContainer);

        this.#elements.chatWindow?.appendChild(messageBlock);
        messageBlock.scrollIntoView({ behavior: 'smooth' });
    }

    #hideLoading() {
        const loadingMessage = this.#elements.chatWindow?.querySelector('.message-block.loading');
        loadingMessage?.remove();
    }

    #showError(message, isHtml = false) {
        const messageBlock = document.createElement('div');
        messageBlock.className = 'message-block system';

        const messageContainer = document.createElement('div');
        
        const errorMessage = document.createElement('div');
        errorMessage.className = 'message system error';
        
        if (isHtml) {
            errorMessage.innerHTML = message;
        } else {
            errorMessage.textContent = message;
        }

        const timestamp = document.createElement('div');
        timestamp.className = 'timestamp';
        timestamp.textContent = 'now';

        messageContainer.appendChild(errorMessage);
        messageContainer.appendChild(timestamp);
        messageBlock.appendChild(messageContainer);

        this.#elements.chatWindow?.appendChild(messageBlock);
        messageBlock.scrollIntoView({ behavior: 'smooth' });

        // Log error for monitoring
        console.error('[Merit Flow] Error displayed:', {
            message: message,
            timestamp: new Date().toISOString(),
            endpoint: this.#state.lastEndpoint
        });

        // Update error state
        this.#state.hasError = true;
        this.#state.errorMessage = message;
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
            initialized: false,
            chatReady: false,
            contextLoaded: false,
            isAdmin: this.#state.isAdmin,
            redisConnected: false,
            hasError: false,
            errorMessage: null,
            openAIConfigured: false,
            threadId: null,
            context: {},
            mockMode: window.env.ENABLE_MOCK_MODE
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

    #logError(error) {
        console.error('[Merit Flow] Error:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    }

    // Add debug methods
    debug = {
        getState: () => this.getState(),
        getConfig: () => this.#config,
        testNavigation: (section) => {
            console.log('[Merit Flow Debug] Testing navigation:', {
                target: section,
                current: this.#state.currentSection,
                timestamp: new Date().toISOString()
            });
            return this.#handleNavigation(section);
        }
    };

    async #initializeAssistant() {
        // Mock successful initialization in development mode
        this.#state.chatReady = true;
        this.#state.openAIConfigured = true;
        console.log('[Merit Flow] Assistant mock-initialized for development');
        return true;
    }

    // Restore #handleNavigation method for navigation
    async #handleNavigation(sectionOrEvent) {
        let targetSection;
        if (typeof sectionOrEvent === 'string') {
            targetSection = sectionOrEvent;
        } else if (sectionOrEvent?.preventDefault) {
            sectionOrEvent.preventDefault();
            targetSection = sectionOrEvent.target.getAttribute('href')?.substring(1);
        }
        if (!targetSection) {
            console.error('[Merit Flow] Invalid navigation target');
            return;
        }
        try {
            this.#elements.sections?.forEach(section => {
                section.hidden = section.dataset.section !== targetSection;
                section.classList.toggle('active', !section.hidden);
            });
            this.#elements.navLinks?.forEach(link => {
                const isActive = link.dataset.section === targetSection;
                link.classList.toggle('active', isActive);
                link.setAttribute('aria-current', isActive ? 'page' : 'false');
            });
        } catch (error) {
            console.error('[Merit Flow] Navigation error:', error);
            this.#logError(error);
        }
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