// Merit page logic and form handling

class MeritIntakeForm {
    constructor() {
        // Get form elements
        this.form = document.querySelector('.welcome-form');
        this.gradeLevelInput = document.getElementById('grade-level');
        this.curriculumInput = document.getElementById('curriculum');
        this.nextButton = document.querySelector('.next-button');
        this.contentArea = document.querySelector('.content');
        
        // Initialize
        this.setupEventListeners();
        this.checkPreviousResponses();
    }

    setupEventListeners() {
        this.nextButton.addEventListener('click', () => this.handleNextClick());
    }

    checkPreviousResponses() {
        // If user already answered questions, show chat
        const gradeLevel = localStorage.getItem('merit_grade_level');
        const curriculum = localStorage.getItem('merit_curriculum');
        
        if (gradeLevel && curriculum) {
            this.showChatInterface();
        }
    }

    handleNextClick() {
        const gradeLevel = this.gradeLevelInput.value;
        const curriculum = this.curriculumInput.value;
        
        // Validate both fields are filled
        if (!gradeLevel || !curriculum) {
            alert('Please tell us a little about yourself before we get started');
            return;
        }
        
        // Store responses
        localStorage.setItem('merit_grade_level', gradeLevel);
        localStorage.setItem('merit_curriculum', curriculum);
        
        // Show chat interface
        this.showChatInterface();
    }

    showChatInterface() {
        this.contentArea.innerHTML = `
            <div class="chat-container">
                <div class="chat-messages">
                    <div class="message assistant">
                        Welcome! I see you teach ${localStorage.getItem('merit_grade_level')}. 
                        How can I help you today?
                    </div>
                </div>
                <div class="chat-input-container">
                    <textarea 
                        class="chat-input" 
                        placeholder="Type your message here..."
                        rows="3"
                    ></textarea>
                    <button class="send-button">Send</button>
                </div>
            </div>
        `;

        // Setup chat handlers
        const input = document.querySelector('.chat-input');
        const sendButton = document.querySelector('.send-button');
        const messagesContainer = document.querySelector('.chat-messages');

        sendButton.addEventListener('click', () => {
            const message = input.value.trim();
            if (message) {
                // Add user message
                const userMessage = document.createElement('div');
                userMessage.className = 'message user';
                userMessage.textContent = message;
                messagesContainer.appendChild(userMessage);

                // Clear input
                input.value = '';

                // Show typing indicator
                const typingIndicator = document.createElement('div');
                typingIndicator.className = 'message assistant typing';
                typingIndicator.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
                messagesContainer.appendChild(typingIndicator);

                // Auto scroll
                messagesContainer.scrollTop = messagesContainer.scrollHeight;

                // Simulate response (remove this when backend is integrated)
                setTimeout(() => {
                    typingIndicator.remove();
                    const response = document.createElement('div');
                    response.className = 'message assistant';
                    response.textContent = 'I understand. Let me help you with that...';
                    messagesContainer.appendChild(response);
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }, 2000);
            }
        });

        // Handle enter key
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendButton.click();
            }
        });
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new MeritIntakeForm();
}); 