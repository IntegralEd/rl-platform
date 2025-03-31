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
        
        if (choice === 'yes') {
            standardsDetail.classList.add('visible');
            // Add listeners for both inputs
            document.getElementById('standards-link').addEventListener('input', () => this.checkFormCompletion());
            document.getElementById('standards-detail-input').addEventListener('input', () => this.checkFormCompletion());
        } else {
            standardsDetail.classList.remove('visible');
            this.checkFormCompletion();
        }
    },

    handleReflectionChoice(choice) {
        const reflectionDetail = document.getElementById('reflection-detail');
        
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
        
        // Check if required fields are filled based on choices
        let isComplete = standardsChoice && reflectionChoice;
        
        // Handle standards validation
        if (standardsChoice === 'yes') {
            const standardsLink = document.getElementById('standards-link').value.trim();
            const standardsDetail = document.getElementById('standards-detail-input').value.trim();
            const hasStandardsInput = standardsLink || standardsDetail;
            document.getElementById('standards-validation').classList.toggle('visible', !hasStandardsInput);
            isComplete = isComplete && hasStandardsInput;
        } else {
            document.getElementById('standards-validation')?.classList.remove('visible');
        }
        
        // Handle reflection validation
        if (reflectionChoice === 'yes') {
            const reflectionDetail = document.getElementById('reflection-input').value.trim();
            const hasReflectionInput = reflectionDetail.length > 0;
            document.getElementById('reflection-validation').classList.toggle('visible', !hasReflectionInput);
            isComplete = isComplete && hasReflectionInput;
        } else {
            document.getElementById('reflection-validation')?.classList.remove('visible');
        }
        
        // Enable/disable next button
        nextButton.disabled = !isComplete;
        nextButton.classList.toggle('enabled', isComplete);

        // Update chat state
        this.state.chatState.isComplete = isComplete;

        // If both are "no", enable chat immediately
        if (isComplete && standardsChoice === 'no' && reflectionChoice === 'no') {
            this.startInterview();
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

        const standardsChoice = document.querySelector('input[name="standards"]:checked').value;
        const reflectionChoice = document.querySelector('input[name="reflection"]:checked').value;
        
        // Hide form container and show chat interface
        document.querySelector('.form-container').style.display = 'none';
        document.querySelector('.chatbar').style.display = 'flex';
        document.querySelector('.playbar').style.display = 'none';
        document.getElementById('interview-section').style.display = 'block';

        // Enable interview tab
        const interviewTab = document.querySelector('.nav-tab[onclick*="interview"]');
        if (interviewTab) {
            interviewTab.disabled = false;
            this.switchTab('interview');
        }

        // For no/no case, just show a simple welcome
        if (standardsChoice === 'no' && reflectionChoice === 'no') {
            this.addMessage('assistant', "Hi! I'm here to help you set meaningful goals. What specific area would you like to focus on for this improvement cycle?");
            return;
        }

        // For cases with context, show loading count
        let count = 0;
        const loadingMessage = this.addMessage('assistant', 'Preparing your context... 0%');
        const loadingInterval = setInterval(() => {
            count += 10;
            if (count <= 90) {
                loadingMessage.textContent = `Preparing your context... ${count}%`;
            }
        }, 500);

        // Prepare context message
        setTimeout(() => {
            clearInterval(loadingInterval);
            loadingMessage.textContent = 'Preparing your context... 100%';
            
            // Small delay before showing the actual context
            setTimeout(() => {
                loadingMessage.remove();
                let contextMessage = "Starting goal setting interview with context:\n";
                if (standardsChoice === 'yes') {
                    const standardsLink = document.getElementById('standards-link').value.trim();
                    const standardsDetail = document.getElementById('standards-detail-input').value.trim();
                    contextMessage += `\nStandards Context:\n${standardsDetail}`;
                    if (standardsLink) {
                        contextMessage += `\nStandards Link: ${standardsLink}`;
                    }
                }
                if (reflectionChoice === 'yes') {
                    const reflectionDetail = document.getElementById('reflection-input').value.trim();
                    contextMessage += `\nPrevious Cycle Reflection:\n${reflectionDetail}`;
                }
                this.addMessage('user', contextMessage);
            }, 500);
        }, 3000);
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
        document.querySelector(`.nav-tab[onclick="switchTab('${tabName}')"]`).classList.add('active');

        // Show correct section
        document.getElementById('welcome-section').style.display = tabName === 'welcome' ? 'block' : 'none';
        document.getElementById('interview-section').style.display = tabName === 'interview' ? 'block' : 'none';
        document.getElementById('tools-section').style.display = tabName === 'tools' ? 'block' : 'none';

        // Toggle chatbar/playbar based on section
        const playbar = document.querySelector('.playbar');
        const chatbar = document.querySelector('.chatbar');
        
        playbar.classList.toggle('active', tabName === 'welcome');
        chatbar.classList.toggle('active', tabName === 'interview');

        // Focus chat input when switching to interview
        if (tabName === 'interview') {
            const chatInput = document.querySelector('.chat-input');
            chatInput.focus();
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
        return document.referrer.includes('_review') || 
               window.location.hash === '#review';
    },

    // Initialize features based on mode
    init: () => {
        // Set hash if coming from review path
        if (document.referrer.includes('_review') && window.location.hash !== '#review') {
            window.location.hash = '#review';
        }
        
        if (STAuth.isReviewMode()) {
            STAuth.enableReviewFeatures();
        }
        STAuth.setupCommonFeatures();
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