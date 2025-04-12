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
            this.form = document.querySelector('.welcome-form');
            this.gradeLevelInput = document.getElementById('grade-level');
            this.curriculumInput = document.getElementById('curriculum');
            this.nextButton = document.getElementById('next-button');

            if (!this.form || !this.gradeLevelInput || !this.curriculumInput || !this.nextButton) {
                console.warn("MeritIntakeForm: Initial form elements not found. Assuming managed elsewhere or will be loaded.");
            } else {
                this.setupEventListeners();
                this.updateNextButtonState();
            }
        } catch (error) {
            ErrorBoundary.handleError(error, 'MeritIntakeForm Constructor');
        }
    }

    setupEventListeners() {
        if (!this.form || !this.nextButton) return;
        
        this.form.addEventListener('change', () => this.updateNextButtonState());
    }
    
    updateNextButtonState() {
        if (this.form && this.nextButton) {
            this.nextButton.disabled = !this.form.checkValidity();
        }
    }

    handleFormSubmit() {
        if (this.form && this.form.checkValidity()) {
            const gradeLevel = this.gradeLevelInput.value;
            const curriculum = this.curriculumInput.value;
            console.log('Form submitted (handled by MeritIntakeForm - likely redundant)', { gradeLevel, curriculum });
        } else {
            console.log('MeritIntakeForm validation failed.');
            this.form.reportValidity();
        }
    }
}

class ErrorBoundary {
    static handleError(error, component = 'Unknown') {
        console.error(`Error in ${component}:`, error);
        // Implement proper error handling/reporting here
    }
}

class SidebarManager {
    constructor() {
        try {
            this.sidebar = document.querySelector('.sidebar');
            this.mainContent = document.querySelector('.client-content');
            this.toggleButton = document.getElementById('sidebarToggle');
            
            if (!this.sidebar || !this.mainContent || !this.toggleButton) {
                throw new Error('Required sidebar elements not found: Need .sidebar, .client-content, #sidebarToggle');
            }

            this.setupEventListeners();
            this.applyInitialState();
        } catch (error) {
            ErrorBoundary.handleError(error, 'SidebarManager Constructor');
        }
    }

    setupEventListeners() {
        this.toggleButton.addEventListener('click', () => this.toggleSidebar());
        
        const navLinks = this.sidebar.querySelectorAll('.nav-link');
        navLinks.forEach((link, index) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(link, index);
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.isCollapsed()) {
                this.toggleSidebar();
            }
        });
    }

    applyInitialState() {
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        console.log('SidebarManager applying initial state:', isCollapsed ? 'collapsed' : 'expanded');
        this.sidebar.style.transition = 'none'; 
        this.mainContent.style.transition = 'none';
        this.toggleButton.style.transition = 'none';

        if (isCollapsed) {
            this.sidebar.classList.remove('expanded');
            this.sidebar.classList.add('collapsed');
            this.mainContent.classList.add('sidebar-collapsed');
            this.updateToggleIcon(true);
        } else {
            this.sidebar.classList.add('expanded');
            this.sidebar.classList.remove('collapsed');
            this.mainContent.classList.remove('sidebar-collapsed');
            this.updateToggleIcon(false);
        }
        setTimeout(() => {
            this.sidebar.style.transition = ''; 
            this.mainContent.style.transition = '';
            this.toggleButton.style.transition = '';
        }, 0);
    }

    toggleSidebar() {
        const isNowCollapsed = this.sidebar.classList.toggle('collapsed');
        this.sidebar.classList.toggle('expanded', !isNowCollapsed);
        this.mainContent.classList.toggle('sidebar-collapsed', isNowCollapsed); 
        localStorage.setItem('sidebarCollapsed', isNowCollapsed);
        this.updateToggleIcon(isNowCollapsed);
        this.announceState(isNowCollapsed);
        console.log(`SidebarManager toggled: ${isNowCollapsed ? 'collapsed' : 'expanded'}`);
    }

    handleNavigation(link, index) {
        this.sidebar.querySelectorAll('.nav-link').forEach(navLink => {
            navLink.classList.remove('active');
            navLink.removeAttribute('aria-current');
        });

        link.classList.add('active');
        link.setAttribute('aria-current', 'page');

        this.showSectionByIndex(index);
    }

    showSectionByIndex(index) {
        console.group('SidebarManager Tab Navigation');
        console.log(`Activating section index: ${index}`);

        const sections = document.querySelectorAll('.section');
        const playbar = document.getElementById('playbar');
        const chatbar = document.getElementById('chatbar');

        if (!sections.length || !sections[index] || !playbar || !chatbar) {
            console.error("Required elements for section switching not found.");
            console.groupEnd();
            return;
        }

        const targetSection = sections[index];
        const sectionId = targetSection.dataset.section;
        console.log(`Showing section: ${sectionId}`);

        sections.forEach(section => {
            section.hidden = true;
            section.classList.remove('active');
        });

        targetSection.hidden = false;
        targetSection.classList.add('active');

        if (index === 0) {
            console.log('Footer State: Welcome - Showing playbar, hiding chatbar');
            playbar.style.display = 'flex';
            chatbar.style.display = 'none';
        } else {
            console.log('Footer State: Chat - Showing chatbar, hiding playbar');
            playbar.style.display = 'none';
            chatbar.style.display = 'flex';
        }
        console.groupEnd();
    }

    updateToggleIcon(collapsed) {
        const icon = this.toggleButton.querySelector('.toggle-icon');
        if (icon) {
            icon.style.transform = collapsed ? 'rotate(180deg)' : 'rotate(0deg)'; 
            this.toggleButton.setAttribute('aria-expanded', !collapsed);
        }
    }

    announceState(collapsed) {
        let announcer = document.getElementById('sidebar-announcer');
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'sidebar-announcer';
            announcer.setAttribute('role', 'status');
            announcer.setAttribute('aria-live', 'polite');
            announcer.className = 'sr-only';
            document.body.appendChild(announcer);
        }
        announcer.textContent = `Sidebar ${collapsed ? 'collapsed' : 'expanded'}`;
    }

    isCollapsed() {
        return this.sidebar.classList.contains('collapsed');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        window.sidebarManager = new SidebarManager(); 
        
        window.meritIntakeForm = new MeritIntakeForm();
        
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach((link, index) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                window.sidebarManager.handleNavigation(link, index); 
            });
        });
        
        const nextButton = document.getElementById('next-button');
        if(nextButton) {
            nextButton.addEventListener('click', (e) => {
                e.preventDefault();
                const form = document.querySelector('.welcome-form');
                if (form && form.checkValidity()) {
                    console.log("Next button clicked, form valid. Navigating to chat...");
                    window.sidebarManager.showSectionByIndex(1);
                    navLinks.forEach((l, i) => {
                        l.classList.toggle('active', i === 1);
                        if(i === 1) l.setAttribute('aria-current', 'page');
                        else l.removeAttribute('aria-current');
                    });
                } else if (form) {
                    console.log("Next button clicked, form invalid.");
                    form.reportValidity();
                }
            });
        }
        
        const initialSectionIndex = window.location.hash === '#chat' ? 1 : 0;
        window.sidebarManager.showSectionByIndex(initialSectionIndex);
        navLinks.forEach((link, index) => {
            link.classList.toggle('active', index === initialSectionIndex);
            if(index === initialSectionIndex) link.setAttribute('aria-current', 'page');
        });

    } catch (error) {
        ErrorBoundary.handleError(error, 'Page Initialization');
    }
}); 