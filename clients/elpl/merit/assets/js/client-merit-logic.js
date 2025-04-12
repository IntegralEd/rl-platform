// Merit page logic and form handling

class MeritIntakeForm {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.updateNextButtonState();
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
        
        // Switch to chat section
        this.switchToChat();
    }

    switchToChat() {
        const chatLink = document.querySelector('[data-section="chat"]');
        if (chatLink) {
            this.handleNavigation(chatLink, 1);
        }
    }

    handleNavigation(link, index) {
        // Update navigation links
        document.querySelectorAll('.nav-link').forEach(navLink => {
            navLink.classList.remove('active');
            navLink.removeAttribute('aria-current');
        });

        link.classList.add('active');
        link.setAttribute('aria-current', 'page');

        // Show correct section
        this.sections.forEach(section => {
            section.hidden = true;
            section.classList.remove('active');
        });

        const targetSection = this.sections[index];
        if (targetSection) {
            targetSection.hidden = false;
            targetSection.classList.add('active');

            // Update footer state
            if (index === 0) {
                this.playbar.style.display = 'flex';
                this.chatbar.style.display = 'none';
            } else {
                this.playbar.style.display = 'none';
                this.chatbar.style.display = 'flex';
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

// Initialize the form when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MeritIntakeForm();
}); 