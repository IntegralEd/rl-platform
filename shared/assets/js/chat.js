const Chat = {
    messages: [],
    state: {
        userId: window.USER_ID || 'anonymous',
        chatState: {
            threadId: window.THREAD_ID || localStorage.getItem(`chat_thread_${window.USER_ID || 'anonymous'}`) || '',
            orgId: window.ORG_ID || getComputedStyle(document.documentElement).getPropertyValue('--org-id').trim().replace(/['"]/g, ''),
            assistantId: window.ASSISTANT_ID || getComputedStyle(document.documentElement).getPropertyValue('--assistant-id').trim().replace(/['"]/g, '')
        },
        isTyping: false,
        error: null
    },
    
    init: function() {
        this.chatWindow = document.querySelector('.chat-container');
        this.setupEventListeners();
        
        // Initialize API client
        APIClient.init({
            endpoint: window.API_ENDPOINT,
            apiKey: window.API_KEY,
            orgId: this.state.chatState.orgId
        });

        // If we have a thread ID, load previous messages
        if (this.state.chatState.threadId) {
            this.loadThreadHistory();
        }

        // Add error handler for network issues
        window.addEventListener('offline', () => this.handleError('Network connection lost'));
        window.addEventListener('online', () => this.clearError());
    },

    async loadThreadHistory() {
        try {
            this.showTypingIndicator();
            const response = await APIClient.sendMessage({
                message: "load_history",
                userId: this.state.userId,
                assistantId: this.state.chatState.assistantId,
                threadId: this.state.chatState.threadId
            });

            if (response.messages) {
                response.messages.forEach(msg => {
                    this.addMessage(msg.role, msg.content);
                });
            }
        } catch (error) {
            console.error('Error loading thread history:', error);
            this.handleError('Failed to load chat history');
        } finally {
            this.hideTypingIndicator();
        }
    },

    setupEventListeners: function() {
        const input = document.querySelector('#chat-input');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (input.value.trim()) {
                        this.sendMessage(input.value.trim());
                        input.value = '';
                    }
                }
            });

            // Auto-resize textarea
            input.addEventListener('input', () => {
                input.style.height = 'auto';
                input.style.height = input.scrollHeight + 'px';
            });
        }
    },

    async sendMessage(content) {
        if (this.state.isTyping) return;
        
        try {
            this.showTypingIndicator();
            
            const response = await APIClient.withRetry(() => 
                APIClient.sendMessage({
                    message: content,
                    userId: this.state.userId,
                    assistantId: this.state.chatState.assistantId,
                    threadId: this.state.chatState.threadId
                })
            );
            
            if (response.thread_id) {
                this.state.chatState.threadId = response.thread_id;
                localStorage.setItem(`chat_thread_${this.state.userId}`, response.thread_id);
            }
            
            this.addMessage('assistant', response.message);
            this.clearError();
            
        } catch (error) {
            console.error('Error:', error);
            this.handleError('Failed to send message');
        } finally {
            this.state.isTyping = false;
            this.hideTypingIndicator();
        }
    },

    addMessage: function(role, content) {
        const message = { role, content, timestamp: new Date() };
        this.messages.push(message);
        
        const messageEl = document.createElement('div');
        messageEl.className = `message ${role}`;
        messageEl.textContent = content;
        this.chatWindow.appendChild(messageEl);
        
        this.chatWindow.scrollTop = this.chatWindow.scrollHeight;

        // Emit chat message event
        const event = new CustomEvent('chat:message', {
            detail: { role, content }
        });
        document.dispatchEvent(event);
    },

    showTypingIndicator: function() {
        const indicator = document.createElement('div');
        indicator.className = 'message assistant typing';
        indicator.textContent = '...';
        indicator.id = 'typing-indicator';
        this.chatWindow.appendChild(indicator);
        this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
    },

    hideTypingIndicator: function() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    },

    handleError: function(message) {
        this.state.error = message;
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.textContent = message;
        this.chatWindow.appendChild(errorEl);
        this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
    },

    clearError: function() {
        this.state.error = null;
        const errorEl = this.chatWindow.querySelector('.error-message');
        if (errorEl) {
            errorEl.remove();
        }
    },

    getContext: function() {
        const params = new URLSearchParams({
            User_ID: this.state.userId,
            Assistant_ID: this.state.chatState.assistantId,
            Org_ID: this.state.chatState.orgId,
            Intake_Token: 'goalsetter_chat',
            Thread_ID: this.state.chatState.threadId,
            Source: 'goalsetter',
            Action_ID: 'goal_setting'
        });
        return params.toString();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Chat.init();
}); 