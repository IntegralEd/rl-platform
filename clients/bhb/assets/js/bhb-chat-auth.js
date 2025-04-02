const BHBAuth = {
    // Configuration
    config: {
        assistantId: 'asst_IA5PsJxdShVPTAv2xeXTr4Ma',
        orgId: 'bhb',
        apiEndpoint: '/api/chat'
    },

    // State management
    state: {
        threadId: null,
        isAuthenticated: false,
        messageCount: 0
    },

    // Initialize chat
    async init() {
        // Set up initial state
        this.state.threadId = this.getThreadId();
        this.state.isAuthenticated = this.checkAffirmations();
        
        // Add welcome message
        if (!this.state.threadId) {
            this.addSystemMessage('Welcome to B\'more Healthy Babies chat. How can I assist you today?');
        }
    },

    // Check if user has completed affirmations
    checkAffirmations() {
        const tos = document.getElementById('tos').checked;
        const norms = document.getElementById('norms').checked;
        const acknowledge = document.getElementById('acknowledge').checked;
        return tos && norms && acknowledge;
    },

    // Get or create thread ID
    getThreadId() {
        return sessionStorage.getItem('bhb_thread_id') || null;
    },

    // Save thread ID
    saveThreadId(threadId) {
        sessionStorage.setItem('bhb_thread_id', threadId);
        this.state.threadId = threadId;
    },

    // Add message to UI
    addMessage(message, isUser = true) {
        const messagesContainer = document.querySelector('.chat-messages');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isUser ? 'user-message' : 'assistant-message'}`;
        messageElement.textContent = message;
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    // Add system message
    addSystemMessage(message) {
        this.addMessage(message, false);
    },

    // Send message to API
    async sendMessage(message) {
        if (!message.trim() || !this.state.isAuthenticated) return;

        // Add user message to UI
        this.addMessage(message, true);
        
        try {
            const response = await fetch(this.config.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message,
                    org_id: this.config.orgId,
                    thread_id: this.state.threadId,
                    assistant_id: this.config.assistantId
                })
            });

            const data = await response.json();
            
            // Save thread ID if new
            if (data.thread_id && !this.state.threadId) {
                this.saveThreadId(data.thread_id);
            }

            // Add assistant response to UI
            if (data.message) {
                this.addMessage(data.message, false);
            }

            // Update message count
            this.state.messageCount++;

        } catch (error) {
            console.error('Error sending message:', error);
            this.addSystemMessage('Sorry, there was an error sending your message. Please try again.');
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    BHBAuth.init();
}); 