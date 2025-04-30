/**
 * Merit Instructional Flow Handler
 * Controls the flow of instruction, navigation, and state management for Merit pages.
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
        assistant: {
            id: window.env.MERIT_ASSISTANT_ID,
            project: window.env.OPENAI_PROJECT_ID,
            org: window.env.MERIT_ORG_ID
        }
    };

    #state = {
        currentSection: 'welcome',
        formValid: false,
        gradeLevel: null,
        initialized: false,
        chatReady: false,
        contextLoaded: false,
        hasError: false,
        errorMessage: null,
        openAIConfigured: false,
        threadId: null,
        context: {},
        mockMode: window.env?.ENABLE_MOCK_MODE || false
    };

    #elements = {
        sections: [],
        form: null,
        nextButton: null,
        sendButton: null,
        chatInput: null,
        chatWindow: null,
        gradeSelect: null,
        chatbar: null
    };

    #openAIClient = null;

    constructor() {
        console.log('[Merit Flow] Initializing flow controller:', {
            version: this.#config.version,
            endpoint: this.#config.apiEndpoint,
            timestamp: new Date().toISOString()
        });
        
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

    #initializeElements() {
        const elements = {
            sections: document.querySelectorAll('.section'),
            form: document.getElementById('welcome-form'),
            nextButton: document.getElementById('next-button'),
            sendButton: document.getElementById('send-button'),
            chatInput: document.getElementById('chat-input'),
            chatWindow: document.getElementById('chat-window'),
            gradeSelect: document.getElementById('grade-level'),
            chatbar: document.getElementById('chatbar')
        };

        // Verify required elements exist
        const required = ['form', 'nextButton', 'gradeSelect', 'chatWindow', 'chatInput', 'sendButton', 'chatbar'];
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
        // Grade selection
        const gradeSelect = this.#elements.gradeSelect;
        const nextButton = this.#elements.nextButton;
        
        if (gradeSelect) {
            gradeSelect.addEventListener('change', () => {
                this.#state.gradeLevel = gradeSelect.value;
                this.#state.formValid = Boolean(gradeSelect.value);
                nextButton.disabled = !this.#state.formValid;
            });
        }

        // Launch Chat button
        if (nextButton) {
            nextButton.addEventListener('click', async (e) => {
                e.preventDefault();
                if (!this.#state.formValid) return;
                
                try {
                    const thread = await this.#openAIClient.createThread();
                    this.#state.threadId = thread.id;
                    
                    await this.#openAIClient.preloadContext({
                        grade_level: this.#state.gradeLevel,
                        curriculum: 'ela'
                    });
                    
                    this.#handleNavigation('chat');
                } catch (err) {
                    this.#handleError('Failed to start chat. Please try again.');
                }
            });
        }

        // Chat input
        if (this.#elements.chatInput) {
            this.#elements.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.#sendMessage();
                }
            });
        }

        // Send button
        if (this.#elements.sendButton) {
            this.#elements.sendButton.addEventListener('click', () => {
                this.#sendMessage();
            });
        }
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
            const response = await this.#openAIClient.sendMessage(content);
            this.#hideLoading();
            this.#addMessage('assistant', response.content);
        } catch (error) {
            this.#hideLoading();
            this.#handleError('Failed to send message. Please try again.');
        } finally {
            this.#elements.chatInput.disabled = false;
            this.#elements.sendButton.disabled = false;
            this.#elements.chatInput.focus();
        }
    }

    #addMessage(type, content) {
        const messageBlock = document.createElement('div');
        messageBlock.className = `message ${type}`;
        messageBlock.textContent = content;
        this.#elements.chatWindow?.appendChild(messageBlock);
        messageBlock.scrollIntoView({ behavior: 'smooth' });
    }

    #showLoading() {
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'message assistant loading';
        loadingMessage.textContent = 'Assistant is thinking...';
        this.#elements.chatWindow?.appendChild(loadingMessage);
        loadingMessage.scrollIntoView({ behavior: 'smooth' });
    }

    #hideLoading() {
        const loadingMessage = this.#elements.chatWindow?.querySelector('.message.loading');
        loadingMessage?.remove();
    }

    #handleError(message) {
        this.#state.hasError = true;
        this.#state.errorMessage = message;
        console.error('[Merit Flow] Error:', message);
    }

    #handleNavigation(section) {
        this.#elements.sections?.forEach(s => {
            const isTarget = s.dataset.section === section;
            s.hidden = !isTarget;
            s.classList.toggle('active', isTarget);
        });
        
        if (section === 'chat') {
            const chatbar = document.getElementById('chatbar');
            if (chatbar) chatbar.hidden = false;
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