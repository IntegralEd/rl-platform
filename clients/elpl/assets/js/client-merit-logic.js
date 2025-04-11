// Merit page logic and form handling

class MeritIntakeForm {
    constructor() {
        this.form = document.querySelector('[data-client-component="merit-intake-form"]');
        this.gradeLevelInput = document.getElementById('grade-level');
        this.curriculumInput = document.getElementById('curriculum');
        this.gradeLevelError = document.getElementById('grade-level-error');
        this.curriculumError = document.getElementById('curriculum-error');
        this.nextButton = document.querySelector('.next-button');
        this.contentArea = document.querySelector('.content');
        
        this.initializeEventListeners();
        this.checkPreviousResponses();
    }

    initializeEventListeners() {
        // Clear error messages when user starts typing/selecting
        this.gradeLevelInput.addEventListener('change', () => this.clearError('grade-level'));
        this.curriculumInput.addEventListener('input', () => this.clearError('curriculum'));
        
        // Handle form submission
        this.nextButton.addEventListener('click', () => this.handleNextClick());
    }

    checkPreviousResponses() {
        // Check if user has already completed the intake form
        const gradeLevel = localStorage.getItem('merit_grade_level');
        const curriculum = localStorage.getItem('merit_curriculum');
        
        if (gradeLevel && curriculum) {
            // User has completed the form before, show chat interface
            this.showChatInterface();
        }
    }

    clearError(fieldId) {
        document.getElementById(`${fieldId}-error`).textContent = '';
    }

    showError(message) {
        const errorOverlay = document.createElement('div');
        errorOverlay.className = 'error-overlay';
        errorOverlay.innerHTML = `
            <div class="error-dialog">
                <p>${message}</p>
                <button onclick="this.parentElement.parentElement.remove()">OK</button>
            </div>
        `;
        document.querySelector('.client-layout').appendChild(errorOverlay);
    }

    validateForm() {
        let isValid = true;
        
        if (!this.gradeLevelInput.value) {
            this.gradeLevelError.textContent = 'Please select a grade level';
            isValid = false;
        }
        
        if (!this.curriculumInput.value) {
            this.curriculumError.textContent = 'Please enter your curriculum';
            isValid = false;
        }

        if (!isValid) {
            this.showError('Please tell us a little about yourself before we get started');
        }
        
        return isValid;
    }

    showLoadingState() {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = '<div class="loading-spinner"></div>';
        document.querySelector('.client-layout').appendChild(loadingOverlay);
        return loadingOverlay;
    }

    createChatInterface() {
        return `
            <div class="chat-container" data-client-component="merit-chat">
                <div class="chat-messages">
                    <!-- Messages will be dynamically added here -->
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
    }

    showChatInterface() {
        // Replace form content with chat interface
        this.contentArea.innerHTML = this.createChatInterface();
        
        // Initialize chat functionality
        this.initializeChat();
    }

    initializeChat() {
        const chatContainer = document.querySelector('[data-client-component="merit-chat"]');
        const messagesContainer = chatContainer.querySelector('.chat-messages');
        const input = chatContainer.querySelector('.chat-input');
        const sendButton = chatContainer.querySelector('.send-button');

        // Add welcome message
        const gradeLevel = localStorage.getItem('merit_grade_level');
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'message assistant';
        welcomeMessage.textContent = `Welcome! I see you teach ${gradeLevel}. How can I help you today?`;
        messagesContainer.appendChild(welcomeMessage);

        // Handle send button click
        sendButton.addEventListener('click', () => {
            if (input.value.trim()) {
                // Add user message
                const userMessage = document.createElement('div');
                userMessage.className = 'message user';
                userMessage.textContent = input.value;
                messagesContainer.appendChild(userMessage);

                // Clear input
                input.value = '';

                // Auto scroll to bottom
                messagesContainer.scrollTop = messagesContainer.scrollHeight;

                // TODO: Handle sending message to backend
                // For now, just show a loading state
                this.showTypingIndicator();
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

    showTypingIndicator() {
        const messagesContainer = document.querySelector('.chat-messages');
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message assistant typing';
        typingIndicator.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
        messagesContainer.appendChild(typingIndicator);

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

    async handleNextClick() {
        // Clear any existing errors
        this.clearError('grade-level');
        this.clearError('curriculum');
        
        // Validate form
        if (!this.validateForm()) {
            return;
        }
        
        try {
            const loadingOverlay = this.showLoadingState();
            
            // Store form data
            const formData = {
                gradeLevel: this.gradeLevelInput.value,
                curriculum: this.curriculumInput.value
            };
            
            localStorage.setItem('merit_grade_level', formData.gradeLevel);
            localStorage.setItem('merit_curriculum', formData.curriculum);
            
            // Simulate some loading time
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Remove loading overlay
            loadingOverlay.remove();
            
            // Show chat interface
            this.showChatInterface();
            
        } catch (error) {
            console.error('Error saving form data:', error);
            this.showError('An error occurred while saving your responses. Please try again.');
        }
    }
}

// Initialize the form handler when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const meritForm = new MeritIntakeForm();
}); 