/**
 * Merit chat functionality
 * Handles chat interface and message handling
 */

class MeritChat {
    constructor(config = {}) {
        this.config = {
            assistantId: config.assistantId || 'asst_9GkHpGa5t50Yw74uzonh6FAz',
            container: config.container || '.chat-container',
            input: config.input || '.chat-input',
            sendButton: config.sendButton || '.send-button',
            messagesContainer: config.messagesContainer || '.chat-window',
            sendIcon: config.sendIcon || '/clients/elpl/assets/images/noun-send-7149925-FFFFFF.png'
        };

        this.elements = {
            container: document.querySelector(this.config.container),
            input: document.querySelector(this.config.input),
            sendButton: document.querySelector(this.config.sendButton),
            messagesContainer: document.querySelector(this.config.messagesContainer)
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.elements.sendButton.addEventListener('click', () => this.sendMessage());
        this.elements.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    addMessage(type, content) {
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.setAttribute('role', type === 'assistant' ? 'status' : 'comment');
        message.setAttribute('aria-label', `${type} message`);
        message.textContent = content;
        
        this.elements.messagesContainer.appendChild(message);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message assistant typing';
        indicator.setAttribute('role', 'status');
        indicator.setAttribute('aria-label', 'Assistant is typing');
        indicator.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
        
        this.elements.messagesContainer.appendChild(indicator);
        this.scrollToBottom();
        return indicator;
    }

    scrollToBottom() {
        this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
    }

    async sendMessage() {
        const message = this.elements.input.value.trim();
        if (!message) return;

        // Clear input
        this.elements.input.value = '';

        // Add user message
        this.addMessage('user', message);

        // Show typing indicator
        const typingIndicator = this.showTypingIndicator();

        // Simulate response for now
        setTimeout(() => {
            typingIndicator.remove();
            this.addMessage('assistant', 'I understand. Let me help you with that...');
        }, 2000);
    }
}

// Export for use in other files
export default MeritChat; 