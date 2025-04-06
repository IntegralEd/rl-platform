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
        await this.waitForSoftr();
        await this.checkAccess();
        this.initTabs();
        this.loadInitialContent();
    }

    async waitForSoftr() {
        return new Promise((resolve, reject) => {
            const check = () => {
                const headerSpan = document.querySelector('#header-span');
                if (headerSpan) {
                    resolve(headerSpan);
                } else if (this.retryCount < this.maxRetries) {
                    this.retryCount++;
                    setTimeout(check, this.retryDelay);
                } else {
                    reject(new Error('Softr header not found after maximum retries'));
                }
            };
            check();
        });
    }

    async checkAccess() {
        // Check URL params first
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('validated') === 'true') {
            this.showAdminContent();
            return;
        }

        // Check stored validation
        const stored = sessionStorage.getItem('adminValidation');
        if (stored) {
            const validation = JSON.parse(stored);
            if (new Date().getTime() - validation.timestamp <= 3600000) {
                if (validation.isValid) {
                    this.showAdminContent();
                    return;
                }
            } else {
                sessionStorage.removeItem('adminValidation');
            }
        }

        // Check Softr header
        try {
            const headerSpan = await this.waitForSoftr();
            const roleLevel = headerSpan.getAttribute('data-role-level');
            
            if (roleLevel !== 'Org Admin') {
                window.location.href = '/admin/unauthorized.html';
                return;
            }

            // Store new validation
            const validation = {
                isValid: true,
                userEmail: headerSpan.getAttribute('data-user-email'),
                roleLevel: roleLevel,
                timestamp: new Date().getTime()
            };
            sessionStorage.setItem('adminValidation', JSON.stringify(validation));
            this.showAdminContent();
        } catch (error) {
            console.error('Auth check failed:', error);
            sessionStorage.setItem('adminRedirectAfterLogin', window.location.pathname);
            window.location.href = '/admin/index.html';
        }
    }

    showAdminContent() {
        document.getElementById('admin-content').style.display = 'block';
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