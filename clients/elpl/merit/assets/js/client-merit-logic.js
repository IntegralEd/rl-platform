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
    static handleError(error, component = 'Unknown') {
        console.error(`Error in ${component}:`, error);
        // Implement proper error handling/reporting here
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
        try {
            // Get sidebar elements with proper error handling
            this.sidebar = document.querySelector('.sidebar');
            this.mainContent = document.querySelector('.client-content');
            this.toggleButton = document.getElementById('sidebarToggle');
            
            if (!this.sidebar || !this.mainContent || !this.toggleButton) {
                throw new Error('Required sidebar elements not found');
            }

            this.setupEventListeners();
            this.applyInitialState();
        } catch (error) {
            ErrorBoundary.handleError(error, 'SidebarManager');
        }
    }

    setupEventListeners() {
        // Toggle sidebar on button click
        this.toggleButton.addEventListener('click', () => this.toggleSidebar());
        
        // Handle navigation clicks
        const navLinks = this.sidebar.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(link);
            });
        });

        // Close sidebar on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.isCollapsed()) {
                this.toggleSidebar();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    applyInitialState() {
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed) {
            this.mainContent.classList.add('sidebar-collapsed');
            this.updateToggleIcon(true);
        }
        console.log('Initial sidebar state:', isCollapsed ? 'collapsed' : 'expanded');
    }

    toggleSidebar() {
        const isNowCollapsed = this.mainContent.classList.toggle('sidebar-collapsed');
        localStorage.setItem('sidebarCollapsed', isNowCollapsed);
        this.updateToggleIcon(isNowCollapsed);
        this.announceState(isNowCollapsed);
    }

    handleNavigation(link) {
        // Remove active class from all links
        this.sidebar.querySelectorAll('.nav-link').forEach(navLink => {
            navLink.classList.remove('active');
            navLink.removeAttribute('aria-current');
        });

        // Add active class to clicked link
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');

        // Show corresponding section
        const sectionId = link.getAttribute('data-section');
        this.showSection(sectionId);
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.hidden = true;
            section.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.querySelector(`[data-section="${sectionId}"]`);
        if (targetSection) {
            targetSection.hidden = false;
            targetSection.classList.add('active');
        }

        // Toggle footer state
        const playbar = document.getElementById('playbar');
        const chatbar = document.getElementById('chatbar');
        
        if (sectionId === 'welcome') {
            playbar.hidden = false;
            chatbar.hidden = true;
        } else {
            playbar.hidden = true;
            chatbar.hidden = false;
        }
    }

    updateToggleIcon(collapsed) {
        const icon = this.toggleButton.querySelector('.toggle-icon');
        if (icon) {
            icon.textContent = collapsed ? '▶' : '◀';
            this.toggleButton.setAttribute('aria-expanded', !collapsed);
        }
    }

    announceState(collapsed) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = `Sidebar ${collapsed ? 'collapsed' : 'expanded'}`;
        document.body.appendChild(announcement);
        setTimeout(() => announcement.remove(), 1000);
    }

    isCollapsed() {
        return this.mainContent.classList.contains('sidebar-collapsed');
    }

    handleResize() {
        const isMobile = window.innerWidth <= 768;
        if (isMobile && !this.isCollapsed()) {
            this.toggleSidebar();
        }
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    try {
        new SidebarManager();
    } catch (error) {
        ErrorBoundary.handleError(error, 'Page Initialization');
    }
}); 