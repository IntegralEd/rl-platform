const Chat = {
    messages: [],
    endpoint: 'https://tixnmh1pe8.execute-api.us-east-2.amazonaws.com/prod/IntegralEd-Main', // Default endpoint, can be overridden per client
    
    init: function() {
        this.chatWindow = document.querySelector('.chat-content');
        this.setupEventListeners();
    },

    setupEventListeners: function() {
        const form = document.querySelector('.chat-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = form.querySelector('input[type="text"]');
                if (input.value.trim()) {
                    this.sendMessage(input.value.trim());
                    input.value = '';
                }
            });
        }
    },

    async sendMessage(content) {
        // Add user message to UI
        this.addMessage('user', content);
        
        try {
            // Show typing indicator
            this.showTypingIndicator();
            
            // Send to endpoint
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: this.messages,
                    context: this.getContext()
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            // Add assistant response to UI
            this.addMessage('assistant', data.content);
            
        } catch (error) {
            console.error('Error:', error);
            this.addMessage('assistant', 'I apologize, but I encountered an error. Please try again.');
        } finally {
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

    getContext: function() {
        const params = new URLSearchParams({
            User_ID: this.state.userId || 'anonymous',
            Org_ID: 'ST',
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