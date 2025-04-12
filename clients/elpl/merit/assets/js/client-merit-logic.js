// Merit page logic and form handling

class MeritIntakeForm {
    constructor() {
        // Initialize with null checks
        this.contentArea = document.querySelector('.content-area');
        if (!this.contentArea) {
            ErrorBoundary.handleError(new Error('Content area not found'), 'MeritIntakeForm');
            return;
        }

        this.form = null;
        this.gradeLevelInput = null;
        this.curriculumInput = null;

        // Initial form setup
        try {
            this.resetForm();
        } catch (error) {
            ErrorBoundary.handleError(error, 'MeritIntakeForm');
        }
    }

    updateVersionTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        // Track environment internally
        this.currentEnv = window.location.hostname.includes('review') ? 'review' : 'live';
        if (this.versionDisplay) {
            this.versionDisplay.textContent = `v1.0.0 (${hours}:${minutes})`;
        }
    }

    resetForm() {
        if (!this.contentArea) return;

        try {
            // Clear any previous values if they exist
            if (this.gradeLevelInput) this.gradeLevelInput.value = '';
            if (this.curriculumInput) this.curriculumInput.value = '';
            
            // Update content area with form HTML
            this.contentArea.innerHTML = `
                <form class="welcome-form" role="form" aria-label="User intake form">
                    <div class="form-group">
                        <label for="grade-level">What grade level do you teach?</label>
                        <select 
                            id="grade-level" 
                            name="grade-level" 
                            required
                            aria-required="true"
                            aria-label="Select your grade level"
                        >
                            <option value="">Select a grade level</option>
                            <option value="Kindergarten">Kindergarten</option>
                            <option value="Grade 1">Grade 1</option>
                            <option value="Grade 2">Grade 2</option>
                            <option value="Grade 3">Grade 3</option>
                            <option value="Grade 4">Grade 4</option>
                            <option value="Grade 5">Grade 5</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="curriculum">What curriculum do you use?</label>
                        <input 
                            type="text" 
                            id="curriculum" 
                            name="curriculum" 
                            required
                            aria-required="true"
                            aria-label="Enter your curriculum"
                            placeholder="Enter your curriculum"
                        >
                    </div>
                    
                    <div class="form-actions">
                        <button 
                            type="submit" 
                            class="next-button" 
                            aria-label="Submit form and proceed to chat"
                        >Next</button>
                    </div>
                </form>
            `;
            
            // Re-initialize form elements with null checks
            this.form = document.querySelector('.welcome-form');
            this.gradeLevelInput = document.getElementById('grade-level');
            this.curriculumInput = document.getElementById('curriculum');

            if (!this.form || !this.gradeLevelInput || !this.curriculumInput) {
                throw new Error('Failed to initialize form elements');
            }

            this.setupEventListeners();
        } catch (error) {
            ErrorBoundary.handleError(error, 'MeritIntakeForm.resetForm');
        }
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
                    >SEND</button>
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

class ErrorBoundary {
    static handleError(error, component) {
        console.error(`Error in ${component}:`, error);
        // Show user-friendly error message
        document.querySelector('.error-overlay').style.display = 'flex';
    }
}

class MeritPage {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        
        this.initializeSidebar();
        this.setupEventListeners();
    }
    
    initializeSidebar() {
        // Set initial state from localStorage
        if (this.isCollapsed) {
            this.sidebar.classList.remove('expanded');
            this.sidebarToggle.setAttribute('aria-expanded', 'false');
        } else {
            this.sidebar.classList.add('expanded');
            this.sidebarToggle.setAttribute('aria-expanded', 'true');
        }
    }
    
    setupEventListeners() {
        // Toggle sidebar on button click
        this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        
        // Close sidebar on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.isCollapsed) {
                this.toggleSidebar();
            }
        });
        
        // Handle navigation link clicks
        document.querySelectorAll('.sidebar nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                document.querySelectorAll('.sidebar nav a').forEach(a => a.classList.remove('active'));
                e.target.classList.add('active');
                
                // Close sidebar on mobile after navigation
                if (window.innerWidth <= 768) {
                    this.toggleSidebar();
                }
            });
        });
    }
    
    toggleSidebar() {
        this.isCollapsed = !this.isCollapsed;
        this.sidebar.classList.toggle('expanded');
        this.sidebarToggle.setAttribute('aria-expanded', !this.isCollapsed);
        localStorage.setItem('sidebarCollapsed', this.isCollapsed);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MeritPage();
});

class SidebarManager {
    constructor() {
        this.sidebar = document.querySelector('#sidebar');
        this.toggle = document.querySelector('#sidebar-toggle');
        this.content = document.querySelector('.client-content');
        
        if (!this.sidebar || !this.toggle || !this.content) {
            ErrorBoundary.handleError(new Error('Sidebar elements not found'), 'SidebarManager');
            return;
        }

        this.isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        this.setupEventListeners();
        this.applyInitialState();
    }

    setupEventListeners() {
        this.toggle.addEventListener('click', () => this.toggleSidebar());
        window.addEventListener('resize', () => this.handleResize());
    }

    applyInitialState() {
        try {
            if (this.isCollapsed) {
                this.content.classList.add('sidebar-collapsed');
                this.updateToggleIcon(true);
            }
            this.announceState();
        } catch (error) {
            ErrorBoundary.handleError(error, 'SidebarManager.applyInitialState');
        }
    }

    toggleSidebar() {
        try {
            this.isCollapsed = this.content.classList.toggle('sidebar-collapsed');
            localStorage.setItem('sidebarCollapsed', this.isCollapsed);
            this.updateToggleIcon(this.isCollapsed);
            this.announceState();
        } catch (error) {
            ErrorBoundary.handleError(error, 'SidebarManager.toggleSidebar');
        }
    }

    updateToggleIcon(collapsed) {
        const icon = this.toggle.querySelector('.toggle-icon');
        if (icon) {
            icon.style.transform = collapsed ? 'rotate(0deg)' : 'rotate(180deg)';
        }
    }

    announceState() {
        const announcement = this.isCollapsed ? 'Sidebar collapsed' : 'Sidebar expanded';
        const announcer = document.createElement('div');
        announcer.setAttribute('role', 'status');
        announcer.setAttribute('aria-live', 'polite');
        announcer.className = 'sr-only';
        announcer.textContent = announcement;
        document.body.appendChild(announcer);
        setTimeout(() => announcer.remove(), 1000);
    }

    handleResize() {
        // Add responsive behavior if needed
        const isMobile = window.innerWidth < 768;
        if (isMobile && !this.isCollapsed) {
            this.toggleSidebar();
        }
    }
}

// Initialize sidebar manager
document.addEventListener('DOMContentLoaded', () => {
    new SidebarManager();
}); 