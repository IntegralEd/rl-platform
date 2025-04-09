// Admin Core JavaScript
class AdminPanel {
    constructor() {
        this.clientId = window.clientId;
        this.projectId = window.projectId;
        this.maxRetries = 10;
        this.retryDelay = 500;
        this.retryCount = 0;
    }

    async init() {
        console.log('[Admin] Initializing admin panel');
        try {
            // Temporarily bypass authentication
            await this.initializeTree();
            await this.loadAdminCards();
            this.hideLoading();
        } catch (error) {
            console.error('Initialization failed:', error);
            this.showError('Failed to initialize admin panel. Please refresh or contact support.');
        }
    }

    showAdminContent() {
        document.getElementById('admin-content')?.style.display = 'block';
    }

    initTabs() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
    }

    switchTab(tabId) {
        document.querySelectorAll('.tab, .tab-content').forEach(el => {
            el.classList.remove('active');
        });
        document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
        document.querySelector(`#${tabId}`).classList.add('active');
    }

    async loadInitialContent() {
        const activeTab = document.querySelector('.tab.active');
        if (activeTab) {
            await this.loadTabContent(activeTab.dataset.tab);
        }
    }

    async loadTabContent(tabName) {
        const contentPath = `/shared/page_ingredients/admin/tabs/${tabName}/form.html`;
        try {
            const response = await fetch(contentPath);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const content = await response.text();
            document.querySelector(`#${tabName}`).innerHTML = content;
        } catch (error) {
            console.error(`Failed to load ${tabName} content:`, error);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const admin = new AdminPanel();
    admin.init().catch(console.error);
}); 