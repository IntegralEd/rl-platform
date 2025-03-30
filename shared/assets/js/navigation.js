// Initialize Navigation object
const Navigation = {
    currentSection: 'welcome',
    
    showSection: function(sectionId) {
        const welcomeView = document.querySelector('.welcome-container');
        const chatView = document.querySelector('.chat-container');
        
        if (sectionId === 'welcome') {
            welcomeView.style.display = 'flex';
            chatView.style.display = 'none';
            this.updateFooter('welcome');
        } else if (sectionId === 'chat') {
            welcomeView.style.display = 'none';
            chatView.style.display = 'flex';
            this.updateFooter('chat');
        }

        this.currentSection = sectionId;
        this.updateNav(sectionId);
    },

    updateNav: function(sectionId) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            if (item.dataset.section === sectionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    },

    updateFooter: function(sectionId) {
        const playbar = document.querySelector('.playbar');
        const chatbar = document.querySelector('.chatbar');
        
        if (sectionId === 'welcome') {
            playbar.style.display = 'flex';
            chatbar.style.display = 'none';
        } else if (sectionId === 'chat') {
            playbar.style.display = 'none';
            chatbar.style.display = 'flex';
        }
    },

    enableSection: function(index) {
        const navItem = document.querySelector(`.nav-item[data-section="${index}"]`);
        if (navItem) {
            navItem.disabled = false;
        }
    },

    disableSection: function(index) {
        const navItem = document.querySelector(`.nav-item[data-section="${index}"]`);
        if (navItem) {
            navItem.disabled = true;
        }
    }
};

// Initialize navigation when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Set initial state
    Navigation.showSection('welcome');
    
    // Initially disable chat and tools sections
    Navigation.disableSection(1);
    Navigation.disableSection(2);
    
    // Listen for affirmations to enable chat section
    document.addEventListener('affirmationsComplete', () => {
        Navigation.enableSection(1);
        Navigation.showSection('chat');
    });
    
    // Handle nav clicks
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (!item.disabled) {
                Navigation.showSection(item.dataset.section);
            }
        });
    });
}); 