/**
 * Merit page logic handling form submission and chat interface
 */

class MeritIntakeForm {
    constructor() {
        // Get form elements
        this.form = document.querySelector('.welcome-form');
        this.gradeLevelInput = document.getElementById('grade-level');
        this.curriculumInput = document.getElementById('curriculum');
        this.nextButton = document.querySelector('.next-button');
        this.contentArea = document.querySelector('.content');
        
        // Tab elements
        this.tabs = document.querySelectorAll('.tab-button');
        this.welcomeTab = document.getElementById('welcome-tab');
        this.chatTab = document.getElementById('chat-tab');
        
        // Set up event listeners
        this.setupEventListeners();
        this.setupTabs();
    }

    setupEventListeners() {
        this.nextButton?.addEventListener('click', () => this.handleNextClick());
        this.form.addEventListener('input', () => this.validateForm());
    }

    setupTabs() {
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab));
        });
    }

    switchTab(selectedTab) {
        // Update tab states
        this.tabs.forEach(tab => {
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', 'false');
        });
        selectedTab.classList.add('active');
        selectedTab.setAttribute('aria-selected', 'true');

        // Show corresponding content
        const tabName = selectedTab.dataset.tab;
        if (tabName === 'welcome') {
            this.welcomeTab.style.display = 'block';
            this.chatTab.style.display = 'none';
        } else if (tabName === 'chat') {
            this.welcomeTab.style.display = 'none';
            this.chatTab.style.display = 'block';
        }

        // Log for debugging
        console.log(`Switched to ${tabName} tab`);
    }

    validateForm() {
        const isValid = this.gradeLevelInput.value && this.curriculumInput.value;
        this.nextButton.classList.toggle('enabled', isValid);
        return isValid;
    }

    handleNextClick() {
        if (!this.validateForm()) return;
        
        // Hide form, show chat
        this.form.style.display = 'none';
        this.chatContainer.classList.add('active');
        
        // Initialize chat interface
        this.initializeChat();
    }

    initializeChat() {
        const context = {
            gradeLevel: this.gradeLevelInput.value,
            curriculum: this.curriculumInput.value
        };
        
        // Add welcome message
        this.addMessage('assistant', `Welcome! I see you're teaching ${context.gradeLevel} using ${context.curriculum}. How can I help you today?`);
        
        // Set up chat handlers
        this.setupChatHandlers();
    }

    setupChatHandlers() {
        const input = document.querySelector('.chat-input');
        const sendButton = document.querySelector('.send-button');
        const messagesContainer = document.querySelector('.chat-window');

        const sendMessage = () => {
            const message = input.value.trim();
            if (!message) return;

            // Add user message
            this.addMessage('user', message);
            input.value = '';

            // Show typing indicator
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'message assistant typing';
            typingIndicator.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
            messagesContainer.appendChild(typingIndicator);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            // Clear typing indicator and add response after delay
            setTimeout(() => {
                typingIndicator.remove();
                this.addMessage('assistant', 'I understand. Let me help you with that...');
            }, 2000);
        };

        sendButton.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    addMessage(type, content) {
        const messagesContainer = document.querySelector('.chat-window');
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = content;
        messagesContainer.appendChild(message);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MeritIntakeForm();
}); 