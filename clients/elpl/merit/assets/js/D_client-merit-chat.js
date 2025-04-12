/**
 * Merit chat functionality
 * Handles chat interface and message handling
 */

class MeritChat {
    constructor() {
        this.messageCount = 0;
        this.threadId = localStorage.getItem('threadId') || null;
        this.setupEventListeners();
        this.initialize();
    }

    initialize() {
        // Add welcome message
        this.addMessageToUI("Welcome! I'm here to help you with your EL Education curriculum. What questions do you have?", 'assistant');
        
        // Show chat UI
        const chatSection = document.querySelector('[data-section="chat"]');
        const chatbar = document.getElementById('chatbar');
        const playbar = document.getElementById('playbar');
        
        if (chatSection && chatbar && playbar) {
            chatSection.hidden = false;
            chatbar.hidden = false;
            playbar.hidden = true;
        }

        // Focus chat input
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.focus();
        }
    }

    setupEventListeners() {
        const chatInput = document.getElementById('chat-input');
        const sendButton = document.querySelector('.interaction-button.send-button');

        if (chatInput) {
            chatInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    this.sendMessage();
                }
                if (event.key === 'Tab') {
                    event.preventDefault();
                    sendButton?.focus();
                }
            });
        }

        if (sendButton) {
            sendButton.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    this.sendMessage();
                }
            });
            sendButton.addEventListener('click', () => this.sendMessage());
        }
    }

    async sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input?.value.trim();
        if (!message) return;

        this.messageCount++;
        console.log(`Message ${this.messageCount}: ${this.threadId ? `Using thread ${this.threadId}` : 'No thread exists'}`);

        // Add user message to UI
        this.addMessageToUI(message, 'user');
        input.value = '';

        // Show loading indicator
        const loadingId = this.addLoadingIndicator();

        try {
            const response = await this.sendToAPI(message);
            this.removeLoadingIndicator(loadingId);
            this.addMessageToUI(response.message, 'assistant');

            if (this.messageCount === 5) {
                this.saveChat();
            }
        } catch (error) {
            console.error('Error:', error);
            this.removeLoadingIndicator(loadingId);
            this.addMessageToUI('Failed to send message. Please try again.', 'error');
        }
    }

    addMessageToUI(text, type) {
        const chatWindow = document.getElementById('chat-window');
        if (!chatWindow) return;

        const message = document.createElement('div');
        message.classList.add('message', type);
        message.textContent = text;
        chatWindow.appendChild(message);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    addLoadingIndicator() {
        const id = `loading-${Date.now()}`;
        const indicator = document.createElement('div');
        indicator.id = id;
        indicator.classList.add('loading-indicator');
        indicator.textContent = 'Sending';
        
        const chatWindow = document.getElementById('chat-window');
        chatWindow?.appendChild(indicator);
        
        return id;
    }

    removeLoadingIndicator(id) {
        document.getElementById(id)?.remove();
    }

    async sendToAPI(message) {
        const requestBody = this.threadId ? 
            { message, threadId: this.threadId } : 
            { message };

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        return response.json();
    }

    saveChat() {
        const chatSummary = {
            event_type: "merit_chat",
            session: {
                id: this.threadId || 'new',
                timestamp: new Date().toISOString(),
                source_url: window.location.href,
                entry_point: "merit_form"
            },
            interaction_log: {
                message_count: this.messageCount,
                completion_status: "in_progress"
            }
        };

        // Send to analytics endpoint
        fetch('/api/analytics/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(chatSummary)
        }).catch(console.error);
    }
}

// Export for use in other files
export default MeritChat; 