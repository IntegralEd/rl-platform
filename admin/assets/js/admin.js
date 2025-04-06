// Admin Core JavaScript
class AdminPanel {
    constructor() {
        this.clientId = window.clientId;
        this.projectId = window.projectId;
        this.debug = true;
        this.isAuthenticated = false;
    }

    log(...args) {
        if (this.debug) {
            console.log('[Admin]', ...args);
        }
    }

    async init() {
        this.log('Initializing admin panel');
        try {
            if (await this.authenticate()) {
                this.initTabs();
                this.loadInitialContent();
                this.initFileTree();
            } else {
                this.showError('Authentication required. Please access through Integral Ed Mothership.');
            }
        } catch (error) {
            this.log('Initialization failed:', error);
            this.showError('Failed to initialize admin panel. Please refresh or contact support.');
        }
    }

    async authenticate() {
        this.log('Starting authentication process');
        
        // Check session storage first (fastest)
        if (await this.checkStoredAuthentication()) {
            this.log('Using stored authentication');
            return true;
        }
        
        // Check if we're in an iframe from the Softr domain
        if (this.isInSoftrIframe()) {
            this.log('Detected valid Softr parent frame');
            
            // Use URL parameters if available
            if (await this.checkUrlAuthentication()) {
                this.log('Authenticated via URL parameters');
                return true;
            }
            
            // If URL params aren't available but we're in a Softr iframe, trust it
            // and create a session that will time out in an hour
            this.log('Authenticated via Softr origin');
            const validation = {
                isValid: true,
                userId: 'softr_user', 
                userEmail: '',
                userName: 'Softr User',
                roleLevel: 'org_admin', // Default role
                source: 'softr_origin',
                timestamp: new Date().getTime()
            };
            
            sessionStorage.setItem('adminValidation', JSON.stringify(validation));
            this.showAdminContent();
            this.isAuthenticated = true;
            return true;
        }
        
        // Not authenticated
        return false;
    }
    
    isInSoftrIframe() {
        try {
            // Check if we're in an iframe
            if (window.self === window.top) {
                this.log('Not in an iframe');
                return false;
            }
            
            // Check the referrer
            const referrer = document.referrer;
            if (referrer && (
                referrer.includes('integral-mothership.softr.app') || 
                referrer.includes('localhost') || 
                referrer.includes('127.0.0.1')
            )) {
                this.log('Valid Softr referrer:', referrer);
                return true;
            }
            
            this.log('Invalid referrer:', referrer);
            return false;
        } catch (e) {
            // If we can't access parent due to security restrictions,
            // it means we're in a cross-origin iframe
            this.log('Cross-origin iframe detected, assuming Softr wrapper');
            return true;
        }
    }

    async checkStoredAuthentication() {
        const stored = sessionStorage.getItem('adminValidation');
        if (!stored) return false;
        
        try {
            const validation = JSON.parse(stored);
            // Check if still valid (1 hour)
            if (new Date().getTime() - validation.timestamp <= 3600000) {
                if (validation.isValid) {
                    this.showAdminContent();
                    this.isAuthenticated = true;
                    return true;
                }
            } else {
                sessionStorage.removeItem('adminValidation');
            }
        } catch (e) {
            this.log('Failed to parse stored authentication:', e);
            sessionStorage.removeItem('adminValidation');
        }
        
        return false;
    }

    async checkUrlAuthentication() {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('User_ID');
        
        if (userId) {
            this.log('Found authentication data in URL');
            
            // Store authentication
            const validation = {
                isValid: true,
                userId: userId,
                userEmail: urlParams.get('Email') || '',
                userName: urlParams.get('Name') || 'Admin User',
                roleLevel: urlParams.get('Role') || 'org_admin',
                source: 'url',
                timestamp: new Date().getTime()
            };
            
            sessionStorage.setItem('adminValidation', JSON.stringify(validation));
            this.showAdminContent();
            this.isAuthenticated = true;
            return true;
        }
        
        return false;
    }

    showAdminContent() {
        const adminContent = document.getElementById('admin-content');
        if (adminContent) {
            adminContent.style.display = 'block';
        }
        
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    showError(message) {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
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
    
    initFileTree() {
        this.log('Initializing file tree');
        // Normalized structure for the file tree
        this.generateFileTree();
    }
    
    generateFileTree() {
        // This will be enhanced to normalize the file structure
        const fileTree = document.querySelector('.dos-tree');
        if (!fileTree) return;
        
        // Add proper event handling for tree toggles
        fileTree.addEventListener('click', (e) => {
            if (e.target.classList.contains('tree-toggle')) {
                e.target.classList.toggle('open');
                const parent = e.target.closest('.tree-item');
                const children = parent.querySelector('.tree-children');
                if (children) {
                    children.style.display = children.style.display === 'none' ? 'block' : 'none';
                }
            }
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const admin = new AdminPanel();
    admin.init().catch(error => {
        console.error('Admin panel initialization failed:', error);
        // Show error message in UI
        const errorContainer = document.getElementById('error-message') || document.createElement('div');
        errorContainer.id = 'error-message';
        errorContainer.className = 'error-container';
        errorContainer.textContent = 'Failed to initialize admin panel. Please refresh or contact support.';
        document.body.appendChild(errorContainer);
    });
}); 