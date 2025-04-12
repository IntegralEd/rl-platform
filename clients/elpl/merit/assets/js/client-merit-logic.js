// Merit page logic and form handling

class BuildManager {
    static BUILD_KEY = 'meritBuildNumber';
    static LAST_BUILD_KEY = 'meritLastBuild';
    static MIN_BUILD = 12;

    static getCurrentBuild() {
        return parseInt(localStorage.getItem(this.BUILD_KEY)) || this.MIN_BUILD;
    }

    static getLastBuildTime() {
        return localStorage.getItem(this.LAST_BUILD_KEY) || new Date().toISOString();
    }

    static incrementBuild() {
        const currentBuild = this.getCurrentBuild();
        const newBuild = currentBuild + 1;
        localStorage.setItem(this.BUILD_KEY, newBuild);
        localStorage.setItem(this.LAST_BUILD_KEY, new Date().toISOString());
        return newBuild;
    }

    static updateVersionDisplay() {
        const versionDisplay = document.querySelector('.version-display');
        if (versionDisplay) {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const buildNumber = this.getCurrentBuild();
            const version = `v1.0.${buildNumber}`;
            const datetime = `(${hours}:${minutes})`;
            versionDisplay.textContent = `${version} ${datetime}`;
        }
    }
}

class MeritIntakeForm {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.updateNextButtonState();
        this.initializeActiveSection();
        this.chat = null; // Will hold MeritChat instance
    }

    initializeElements() {
        // Initialize all required elements
        this.form = document.querySelector('.welcome-form');
        this.gradeLevelInput = document.getElementById('grade-level');
        this.curriculumInput = document.getElementById('curriculum');
        this.nextButton = document.getElementById('next-button');
        this.sections = document.querySelectorAll('.section');
        this.playbar = document.getElementById('playbar');
        this.chatbar = document.getElementById('chatbar');
        this.contentArea = document.querySelector('.content-area');

        // Validate required elements
        if (!this.form || !this.gradeLevelInput || !this.curriculumInput || !this.nextButton) {
            console.error("MeritIntakeForm: Required form elements not found");
            return;
        }
    }

    initializeActiveSection() {
        // Show welcome section by default
        const welcomeSection = document.querySelector('[data-section="welcome"]');
        const welcomeLink = document.querySelector('.nav-link[data-section="welcome"]');
        
        if (welcomeSection && welcomeLink) {
            welcomeSection.classList.add('active');
            welcomeSection.hidden = false;
            welcomeLink.classList.add('active');
            welcomeLink.setAttribute('aria-current', 'page');
        }
        
        // Hide chat section
        const chatSection = document.querySelector('[data-section="chat"]');
        if (chatSection) {
            chatSection.classList.remove('active');
            chatSection.hidden = true;
        }
        
        // Ensure correct footer state
        if (this.playbar && this.chatbar) {
            this.playbar.hidden = false;
            this.chatbar.hidden = true;
        }
    }

    setupEventListeners() {
        if (!this.form || !this.nextButton) return;
        
        // Listen for form changes
        this.form.addEventListener('input', () => this.updateNextButtonState());
        this.form.addEventListener('change', () => this.updateNextButtonState());
        
        // Handle next button click
        this.nextButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.form.checkValidity()) {
                this.handleFormSubmit();
            } else {
                this.form.reportValidity();
            }
        });

        // Handle navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach((link, index) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(link, index);
            });
        });
    }
    
    updateNextButtonState() {
        if (!this.form || !this.nextButton) return;
        
        const isValid = this.form.checkValidity();
        this.nextButton.disabled = !isValid;
        
        if (isValid) {
            this.nextButton.classList.add('enabled');
            this.nextButton.setAttribute('aria-disabled', 'false');
        } else {
            this.nextButton.classList.remove('enabled');
            this.nextButton.setAttribute('aria-disabled', 'true');
        }
    }

    handleFormSubmit() {
        if (!this.form || !this.form.checkValidity()) return;

        const formData = {
            gradeLevel: this.gradeLevelInput.value,
            curriculum: this.curriculumInput.value
        };

        console.log('Form submitted with data:', formData);
        
        // Switch to chat section immediately
        this.switchToChat(true);
    }

    async switchToChat(isDirectTransition = false) {
        // Update navigation state
        const chatLink = document.querySelector('[data-section="chat"]');
        const welcomeSection = document.querySelector('[data-section="welcome"]');
        const chatSection = document.querySelector('[data-section="chat"]');
        
        if (chatLink && welcomeSection && chatSection) {
            // Update navigation
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            });
            chatLink.classList.add('active');
            chatLink.setAttribute('aria-current', 'page');

            // Hide welcome, show chat
            welcomeSection.classList.remove('active');
            welcomeSection.hidden = true;
            chatSection.classList.add('active');
            chatSection.hidden = false;

            // Update footer state
            if (this.playbar && this.chatbar) {
                this.playbar.hidden = true;
                this.chatbar.hidden = false;
            }

            // Initialize chat if not already done
            if (!this.chat) {
                try {
                    const ChatModule = await import('./client-merit-chat.js');
                    this.chat = new ChatModule.default();
                    console.log('Chat initialized successfully');
                } catch (error) {
                    console.error('Failed to initialize chat:', error);
                    ErrorBoundary.handleError(error, 'Chat Initialization');
                }
            }
        }
    }

    handleNavigation(link, index) {
        // Only allow navigation to chat if form is completed
        if (index === 1 && !this.form.checkValidity()) {
            this.form.reportValidity();
            return;
        }

        // Update navigation state
        document.querySelectorAll('.nav-link').forEach(navLink => {
            navLink.classList.remove('active');
            navLink.removeAttribute('aria-current');
        });

        link.classList.add('active');
        link.setAttribute('aria-current', 'page');

        // Show correct section
        const welcomeSection = document.querySelector('[data-section="welcome"]');
        const chatSection = document.querySelector('[data-section="chat"]');
        
        if (welcomeSection && chatSection) {
            if (index === 0) {
                welcomeSection.classList.add('active');
                welcomeSection.hidden = false;
                chatSection.classList.remove('active');
                chatSection.hidden = true;
                
                // Update footer state
                if (this.playbar && this.chatbar) {
                    this.playbar.hidden = false;
                    this.chatbar.hidden = true;
                }
            } else if (index === 1) {
                // Direct transition to chat without recursion
                this.switchToChat(true);
            }
        }
    }
}

class ErrorBoundary {
    static handleError(error, component = 'Unknown') {
        console.error(`Error in ${component}:`, error);
        // Implement proper error handling/reporting here
    }
}

// Update the DOMContentLoaded handler
document.addEventListener('DOMContentLoaded', () => {
    BuildManager.updateVersionDisplay();
    new MeritIntakeForm();
}); 