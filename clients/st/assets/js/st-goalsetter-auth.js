// Client-specific authentication and validation flow
// This template can be adapted for different client instances by modifying the validation rules
const STAuth = {
    // State management
    state: {
        // Access control
        accessLevel: 'public', // 'public', 'authenticated', 'restricted'
        isAuthenticated: false,
        userId: null,
        
        // Form validation
        formState: {
            standardsChoice: null,
            standardsLink: '',
            standardsDetail: '',
            reflectionChoice: null,
            reflectionDetail: ''
        },

        // Chat validation
        chatState: {
            teachingContext: '',
            learningTarget: '',
            successCriteria: '',
            teacherGoalStatement: '',
            studentGoalStatement: '',
            messageCount: 0,
            isComplete: false,
            goalStatementReceived: false
        },

        // Tools validation
        toolsState: {
            requiresEmail: true,
            emailCollected: false,
            requiresPayment: false,
            paymentComplete: false
        }
    },

    // Access Control Validation
    validateAccess() {
        // Check if user has required access level
        switch(this.state.accessLevel) {
            case 'public':
                return true;
            case 'authenticated':
                return this.state.isAuthenticated && this.state.userId;
            case 'restricted':
                // Add additional checks (e.g., Softr domain validation)
                return this.validateSoftrAccess();
            default:
                return false;
        }
    },

    validateSoftrAccess() {
        // Implement Softr-specific validation
        return false; // Placeholder
    },

    // Form Validation
    initFormValidation() {
        document.addEventListener('DOMContentLoaded', () => {
            // Set up form input listeners
            this.setupFormValidation();
            
            // Set up navigation listeners
            this.setupNavigationListeners();
        });
    },

    setupFormValidation() {
        // Add validation listeners to form inputs
        const standardsLink = document.getElementById('standards-link');
        const standardsDetail = document.getElementById('standards-detail-input');
        const reflectionInput = document.getElementById('reflection-input');

        if (standardsLink) standardsLink.addEventListener('input', () => this.checkFormCompletion());
        if (standardsDetail) standardsDetail.addEventListener('input', () => this.checkFormCompletion());
        if (reflectionInput) reflectionInput.addEventListener('input', () => this.checkFormCompletion());
    },

    setupNavigationListeners() {
        const nextButton = document.querySelector('.next-button');
        const sendButton = document.querySelector('.send-button');

        if (nextButton) nextButton.addEventListener('click', () => this.startInterview());
        if (sendButton) sendButton.addEventListener('click', () => this.sendMessage());
    },

    handleStandardsChoice(choice) {
        const standardsDetail = document.getElementById('standards-detail');
        const nextButton = document.querySelector('.next-button');
        
        if (choice === 'yes') {
            standardsDetail.classList.add('visible');
            const inputs = standardsDetail.querySelectorAll('input');
            inputs.forEach(input => input.addEventListener('input', () => this.checkFormCompletion()));
        } else {
            standardsDetail.classList.remove('visible');
            this.checkFormCompletion();
        }
    },

    handleReflectionChoice(choice) {
        const reflectionDetail = document.getElementById('reflection-detail');
        const nextButton = document.querySelector('.next-button');
        
        if (choice === 'yes') {
            reflectionDetail.classList.add('visible');
            document.getElementById('reflection-input').addEventListener('input', () => this.checkFormCompletion());
        } else {
            reflectionDetail.classList.remove('visible');
            this.checkFormCompletion();
        }
    },

    checkFormCompletion() {
        const nextButton = document.querySelector('.next-button');
        const standardsChoice = document.querySelector('input[name="standards"]:checked')?.value;
        const reflectionChoice = document.querySelector('input[name="reflection"]:checked')?.value;
        
        let isComplete = standardsChoice && reflectionChoice;
        
        if (standardsChoice === 'yes') {
            const standardsUrl = document.getElementById('standards-url')?.value.trim();
            const standardsGrade = document.getElementById('standards-grade')?.value.trim();
            const standardsSubject = document.getElementById('standards-subject')?.value.trim();
            const standardsState = document.getElementById('standards-state')?.value.trim();
            
            const hasStandardsInput = standardsUrl && standardsGrade && standardsSubject && standardsState;
            document.getElementById('standards-validation').classList.toggle('visible', !hasStandardsInput);
            isComplete = isComplete && hasStandardsInput;
        }
        
        if (reflectionChoice === 'yes') {
            const reflectionText = document.getElementById('reflection-input')?.value.trim();
            const hasReflectionInput = reflectionText.length > 0;
            document.getElementById('reflection-validation').classList.toggle('visible', !hasReflectionInput);
            isComplete = isComplete && hasReflectionInput;
        }

        nextButton.disabled = !isComplete;
        nextButton.classList.toggle('enabled', isComplete);

        // Auto-enable interview for No/No case
        if (isComplete && standardsChoice === 'no' && reflectionChoice === 'no') {
            this.enableInterviewTab();
        }
    },

    enableInterviewTab() {
        const interviewTab = document.querySelector('.nav-tab[onclick*="interview"]');
        if (interviewTab) {
            interviewTab.disabled = false;
            this.switchTab('interview');
        }
    },

    // Chat Validation
    validateChatAccess() {
        // Check if user can access chat based on state
        const standardsChoice = document.querySelector('input[name="standards"]:checked')?.value;
        const reflectionChoice = document.querySelector('input[name="reflection"]:checked')?.value;
        
        // If both choices are made, allow access
        if (standardsChoice && reflectionChoice) {
            // If either is "yes", check if details are provided
            if (standardsChoice === 'yes') {
                const standardsLink = document.getElementById('standards-link').value.trim();
                const standardsDetail = document.getElementById('standards-detail-input').value.trim();
                if (!standardsLink && !standardsDetail) {
                    return false;
                }
            }
            
            if (reflectionChoice === 'yes') {
                const reflectionDetail = document.getElementById('reflection-input').value.trim();
                if (!reflectionDetail) {
                    return false;
                }
            }
            
            return true;
        }
        
        return false;
    },

    validateMessageLimit() {
        // Check if user has reached message limit
        return this.state.chatState.messageCount < this.state.chatState.maxMessages;
    },

    startInterview() {
        if (!this.validateChatAccess()) {
            console.error('Chat access denied');
            return;
        }

        // Get form data
        const standardsChoice = document.querySelector('input[name="standards"]:checked').value;
        const reflectionChoice = document.querySelector('input[name="reflection"]:checked').value;
        
        // Build context message
        let contextMessage = '';
        if (standardsChoice === 'yes') {
            const grade = document.getElementById('standards-grade').value.trim();
            const subject = document.getElementById('standards-subject').value.trim();
            const state = document.getElementById('standards-state').value.trim();
            const url = document.getElementById('standards-url').value.trim();
            contextMessage += `\nAcademic Standards Context:\nGrade: ${grade}\nSubject: ${subject}\nState/Jurisdiction: ${state}\nReference: ${url}`;
        }
        if (reflectionChoice === 'yes') {
            const reflection = document.getElementById('reflection-input').value.trim();
            contextMessage += `\nPrevious Goals Context:\n${reflection}`;
        }

        // Initialize chat
        this.initializeChat(contextMessage);
        
        // Switch to interview tab
        this.switchTab('interview');
    },

    initializeChat(contextMessage = '') {
        // Clear existing chat
        const chatContainer = document.querySelector('.chat-container');
        chatContainer.innerHTML = '';
        
        // Send initial message
        if (contextMessage) {
            this.addMessage('user', `New user here to set goals. ${contextMessage}`);
        } else {
            this.addMessage('assistant', "Hi! I'm here to help you set meaningful goals. What specific area would you like to focus on for this improvement cycle?");
        }

        // Reset chat state
        this.state.chatState = {
            messageCount: contextMessage ? 1 : 0,
            isComplete: false,
            goalStatementReceived: false
        };
    },

    handleChatComplete(goalSummary) {
        this.state.chatState.isComplete = true;
        this.state.chatState.goalStatementReceived = true;

        // Store goal data for webhook
        this.state.chatState.goalData = {
            standards: {
                choice: document.querySelector('input[name="standards"]:checked').value,
                grade: document.getElementById('standards-grade')?.value.trim(),
                subject: document.getElementById('standards-subject')?.value.trim(),
                state: document.getElementById('standards-state')?.value.trim(),
                url: document.getElementById('standards-url')?.value.trim()
            },
            reflection: {
                choice: document.querySelector('input[name="reflection"]:checked').value,
                text: document.getElementById('reflection-input')?.value.trim()
            },
            goalSummary
        };

        // Add completion message
        this.addMessage('assistant', `Perfect! I've captured your goal statements:\n${goalSummary}\n\nWould you like to create a goal-setting poster with these statements?`);
        
        // Enable tools tab
        const toolsTab = document.querySelector('.nav-tab[onclick*="tools"]');
        if (toolsTab) {
            toolsTab.disabled = false;
        }
    },

    // Tools Validation
    validateToolsAccess() {
        // Check if user can access tools based on state
        if (this.state.toolsState.requiresEmail && !this.state.toolsState.emailCollected) {
            return false;
        }
        if (this.state.toolsState.requiresPayment && !this.state.toolsState.paymentComplete) {
            return false;
        }
        return true;
    },

    collectEmail(email) {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return false;
        }
        
        // Store email and update state
        this.state.toolsState.emailCollected = true;
        return true;
    },

    // Navigation
    switchTab(tabName) {
        // Validate access before switching
        if (tabName === 'interview' && !this.validateChatAccess()) {
            console.error('Chat access denied');
            return;
        }
        if (tabName === 'tools' && !this.validateToolsAccess()) {
            console.error('Tools access denied');
            return;
        }

        // Update tab styling
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`.nav-tab[onclick*="${tabName}"]`).classList.add('active');

        // Show correct section
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${tabName}-section`).classList.add('active');

        // Update interaction bars
        document.querySelectorAll('.interaction-bar').forEach(bar => {
            bar.classList.remove('active');
        });
        
        if (tabName === 'welcome') {
            document.querySelector('.playbar').classList.add('active');
        } else if (tabName === 'interview') {
            document.querySelector('.chatbar').classList.add('active');
            document.querySelector('.chat-input').focus();
        }
    },

    // Footer Management
    updateFooter(tabName) {
        const footer = document.querySelector('.app-footer');
        const isChatTab = tabName === 'interview';

        // Clear existing content
        footer.innerHTML = '';
        footer.className = 'app-footer ' + (isChatTab ? 'chat-mode' : 'standard-mode');

        if (isChatTab) {
            // Chat mode footer
            footer.innerHTML = `
                <div class="interaction-bar">
                    <div class="interaction-left">
                        <button class="interaction-button send-button">
                            <span class="sr-only">Send</span>
                            <img class="interaction-icon" src="/shared/assets/images/send.svg" alt="Send">
                        </button>
                    </div>
                    <div class="interaction-center">
                        <div class="chat-input-group">
                            <textarea 
                                class="interaction-input" 
                                id="chat-input" 
                                placeholder="Type your message..."
                                rows="3"
                                onkeypress="STAuth.handleChatKeypress(event)"
                            ></textarea>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Standard footer with next/back based on tab
            const showNext = tabName === 'welcome' && this.state.chatState.isComplete;
            footer.innerHTML = `
                <div class="interaction-bar">
                    ${showNext ? `
                        <div class="interaction-left">
                            <button class="interaction-button next-button" onclick="STAuth.startInterview()">
                                <span class="sr-only">Next</span>
                                <img class="interaction-icon" src="/shared/assets/images/arrow-right.svg" alt="Next">
                            </button>
                        </div>
                    ` : ''}
                    <div class="footer-content">
                        <img class="footer-logo" src="/shared/assets/images/RecursiveLearningLockup_White.png" alt="Recursive Learning Logo">
                        <span class="footer-text">Powered by Recursive Learning</span>
                    </div>
                </div>
            `;
        }

        // Update styles based on mode
        this.updateFooterStyles(isChatTab);
    },

    updateFooterStyles(isChatMode) {
        const footer = document.querySelector('.app-footer');
        if (isChatMode) {
            footer.style.height = '80px';
            footer.style.padding = '0';
        } else {
            footer.style.height = 'var(--footer-height)';
            footer.style.padding = '0 24px';
        }
    },

    // Chat Message Handling
    handleChatKeypress(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    },

    sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        if (message) {
            this.addMessage('user', message);
            this.state.chatState.messageCount++;
            input.value = '';
        }
    },

    // Listen for goal statement completion
    checkForGoalStatement(message) {
        // Look for specific markers in the message
        const hasTeacherGoal = message.includes('Teacher Goal Statement:') || 
                              message.includes('Teacher Goal:');
        const hasStudentGoal = message.includes('Student Goal Statement:') || 
                              message.includes('Student Goal:');
        
        if (hasTeacherGoal && hasStudentGoal) {
            this.state.chatState.goalStatementReceived = true;
            this.handleGoalStatementComplete();
        }
    },

    handleGoalStatementComplete() {
        // Enable tools section
        const toolsTab = document.querySelector('.nav-tab[onclick="switchTab(\'tools\')"]');
        if (toolsTab) {
            toolsTab.disabled = false;
        }
        
        // Show completion message
        this.addMessage('assistant', 'Great! Your goal statements are complete. You can now access the tools section to download your goal-setting poster.');
    },

    // Feature detection
    isReviewMode: () => {
        return window.location.hash === '#review' || window.isReviewMode === true;
    },

    // Initialize features based on mode
    init: () => {
        if (STAuth.isReviewMode()) {
            STAuth.enableReviewFeatures();
        }
        STAuth.setupCommonFeatures();
        STAuth.switchTab('welcome'); // Ensure welcome tab is active
        
        // Initialize welcome section
        const welcomeSection = document.getElementById('welcome-section');
        if (welcomeSection) {
            welcomeSection.classList.add('active');
        }
    },

    // Enable review-specific features
    enableReviewFeatures: () => {
        // Enable Qipu
        if (window.Qipu) {
            Qipu.init();
        }
        
        // Add review banner if not exists
        if (!document.querySelector('.review-banner')) {
            const banner = document.createElement('div');
            banner.className = 'review-banner';
            banner.textContent = 'Review Mode - Comments Enabled';
            document.body.insertBefore(banner, document.body.firstChild);
        }
    },

    // Setup features common to all modes
    setupCommonFeatures: () => {
        // Common initialization code
        STAuth.setupEventListeners();
    },

    // Event listeners
    setupEventListeners: () => {
        // Handle chat input
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keypress', STAuth.handleChatKeypress);
        }
    },

    addMessage(type, content) {
        const chatContainer = document.querySelector('.chat-container');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = content;
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', STAuth.init); 