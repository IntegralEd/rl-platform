// Merit page logic and form handling

class MeritIntakeForm {
    constructor() {
        // Get form elements
        this.form = document.querySelector('.welcome-form');
        this.gradeLevelInput = document.getElementById('grade-level');
        this.curriculumInput = document.getElementById('curriculum');
        this.contentArea = document.querySelector('.content');
        
        // Initialize
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Handle form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });
    }

    handleFormSubmit() {
        const gradeLevel = this.gradeLevelInput.value;
        const curriculum = this.curriculumInput.value;
        
        // Validate both fields are filled
        if (!gradeLevel || !curriculum) {
            alert('Please tell us a little about yourself before we get started');
            return;
        }
        
        // Show chat interface
        this.showChatInterface(gradeLevel, curriculum);
    }

    showChatInterface(gradeLevel, curriculum) {
        // Replace form with chat interface
        this.contentArea.innerHTML = `
            <div class="chat-container" role="region" aria-label="Chat interface">
                <div class="chat-messages" role="log" aria-label="Chat messages">
                    <div class="message assistant" role="status" aria-label="Assistant message">
                        Welcome! I see you teach ${gradeLevel}. How can I help you today?
                    </div>
                </div>
                <div class="chat-input-container" role="form" aria-label="Chat input form">
                    <textarea 
                        class="chat-input" 
                        placeholder="Type your message here..."
                        rows="3"
                        aria-label="Type your message"
                        role="textbox"
                    ></textarea>
                    <button 
                        class="send-button" 
                        aria-label="Send message"
                        role="button"
                    ></button>
                </div>
            </div>
        `;

        // Setup chat handlers
        this.setupChatHandlers();
    }

    setupChatHandlers() {
        const input = document.querySelector('.chat-input');
        const sendButton = document.querySelector('.send-button');
        const messagesContainer = document.querySelector('.chat-messages');

        // Send message function
        const sendMessage = () => {
            const message = input.value.trim();
            if (message) {
                // Add user message
                const userMessage = document.createElement('div');
                userMessage.className = 'message user';
                userMessage.setAttribute('role', 'status');
                userMessage.setAttribute('aria-label', 'Your message');
                userMessage.textContent = message;
                messagesContainer.appendChild(userMessage);

                // Clear input
                input.value = '';

                // Show typing indicator
                const typingIndicator = document.createElement('div');
                typingIndicator.className = 'message assistant typing';
                typingIndicator.setAttribute('role', 'status');
                typingIndicator.setAttribute('aria-label', 'Assistant is typing');
                typingIndicator.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
                messagesContainer.appendChild(typingIndicator);

                // Auto scroll
                messagesContainer.scrollTop = messagesContainer.scrollHeight;

                // Simulate response (remove this when backend is integrated)
                setTimeout(() => {
                    typingIndicator.remove();
                    const response = document.createElement('div');
                    response.className = 'message assistant';
                    response.setAttribute('role', 'status');
                    response.setAttribute('aria-label', 'Assistant response');
                    response.textContent = 'I understand. Let me help you with that...';
                    messagesContainer.appendChild(response);
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }, 2000);
            }
        };

        // Click handler
        sendButton.addEventListener('click', sendMessage);

        // Enter key handler
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new MeritIntakeForm();
}); 