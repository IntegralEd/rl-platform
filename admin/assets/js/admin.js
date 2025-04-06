// Admin Core JavaScript
class AdminPanel {
    constructor() {
        this.clientId = window.clientId;
        this.projectId = window.projectId;
        this.debug = true;
        this.isAuthenticated = false;
        this.trustedSources = [
            'integral-mothership.softr.app',
            'recursive-review.softr.app', // New review portal
            'localhost',
            '127.0.0.1'
        ];
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
                this.setupQipuComments();
            } else {
                this.showError('Authentication required. Please use a valid review link or access through an authorized portal.');
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
        
        // Check review token in URL
        if (await this.checkReviewToken()) {
            this.log('Authenticated via review token');
            return true;
        }
        
        // Check if we're in an iframe from a trusted source
        if (this.isInTrustedIframe()) {
            this.log('Detected valid trusted parent frame');
            
            // Use URL parameters if available
            if (await this.checkUrlAuthentication()) {
                this.log('Authenticated via URL parameters');
                return true;
            }
            
            // If URL params aren't available but we're in a trusted iframe, trust it
            this.log('Authenticated via trusted origin');
            const validation = {
                isValid: true,
                userId: 'trusted_user', 
                userEmail: '',
                userName: 'Trusted User',
                roleLevel: 'client_sme', // Default role for iframe without params
                source: 'trusted_origin',
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
    
    async checkReviewToken() {
        const urlParams = new URLSearchParams(window.location.search);
        const reviewToken = urlParams.get('review_token');
        
        if (!reviewToken) return false;
        
        this.log('Found review token in URL');
        
        try {
            // Verify token with backend
            const response = await fetch('/api/verify-review-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: reviewToken })
            });
            
            if (!response.ok) {
                this.log('Invalid review token');
                return false;
            }
            
            const data = await response.json();
            
            // Store authentication
            const validation = {
                isValid: true,
                userId: data.userId || 'review_user',
                userEmail: data.email || '',
                userName: data.name || 'Review User',
                roleLevel: data.role || 'client_sme',
                projectId: data.projectId,
                reviewSession: data.reviewSession,
                source: 'review_token',
                timestamp: new Date().getTime()
            };
            
            sessionStorage.setItem('adminValidation', JSON.stringify(validation));
            this.showAdminContent();
            this.isAuthenticated = true;
            
            // Set up review mode
            if (data.projectId) {
                this.setupReviewMode(data.projectId, reviewToken);
            }
            
            return true;
        } catch (error) {
            this.log('Error verifying review token:', error);
            
            // Fallback: For development or when API isn't available
            // In production, remove this fallback and rely on actual API verification
            if (this.debug && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
                this.log('Debug mode: Accepting token without verification');
                
                const validation = {
                    isValid: true,
                    userId: 'dev_review_user',
                    userEmail: 'test@example.com',
                    userName: 'Test Review User',
                    roleLevel: 'client_sme',
                    source: 'review_token_debug',
                    timestamp: new Date().getTime()
                };
                
                sessionStorage.setItem('adminValidation', JSON.stringify(validation));
                this.showAdminContent();
                this.isAuthenticated = true;
                return true;
            }
            
            return false;
        }
    }
    
    isInTrustedIframe() {
        try {
            // Check if we're in an iframe
            if (window.self === window.top) {
                this.log('Not in an iframe');
                return false;
            }
            
            // Check the referrer
            const referrer = document.referrer;
            if (referrer) {
                for (const trustedSource of this.trustedSources) {
                    if (referrer.includes(trustedSource)) {
                        this.log('Valid trusted referrer:', referrer);
                        return true;
                    }
                }
            }
            
            this.log('Invalid referrer:', referrer);
            return false;
        } catch (e) {
            // If we can't access parent due to security restrictions,
            // it means we're in a cross-origin iframe
            this.log('Cross-origin iframe detected, assuming trusted wrapper');
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
                    
                    // Set up review mode if this was a review session
                    if (validation.source === 'review_token' && validation.projectId) {
                        this.setupReviewMode(validation.projectId, validation.reviewSession);
                    }
                    
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
            
            // Add project ID if present
            const projectId = urlParams.get('Project_ID');
            if (projectId) {
                validation.projectId = projectId;
            }
            
            sessionStorage.setItem('adminValidation', JSON.stringify(validation));
            this.showAdminContent();
            this.isAuthenticated = true;
            return true;
        }
        
        return false;
    }
    
    setupReviewMode(projectId, reviewToken) {
        this.log('Setting up review mode for project:', projectId);
        
        // Set project-specific elements if needed
        document.body.classList.add('review-mode');
        
        // Add review token to all internal links
        document.querySelectorAll('a[href^="/"]').forEach(link => {
            const url = new URL(link.href, window.location.origin);
            url.searchParams.set('review_token', reviewToken);
            link.href = url.toString();
        });
        
        // Highlight current project in the file tree
        this.highlightProjectInTree(projectId);
    }
    
    highlightProjectInTree(projectId) {
        // Implementation depends on the structure of your file tree
        // This is a simplified example
        const projectItem = document.querySelector(`.tree-item[data-project-id="${projectId}"]`);
        if (projectItem) {
            projectItem.classList.add('active-review');
            
            // Expand parent folders
            let parent = projectItem.parentElement;
            while (parent) {
                if (parent.classList.contains('tree-children')) {
                    parent.style.display = 'block';
                    const toggle = parent.previousElementSibling.querySelector('.tree-toggle');
                    if (toggle) toggle.classList.add('open');
                }
                parent = parent.parentElement;
            }
        }
    }
    
    setupQipuComments() {
        // Check if we have a valid user for Qipu comments
        const stored = sessionStorage.getItem('adminValidation');
        if (!stored) return;
        
        try {
            const validation = JSON.parse(stored);
            
            // Only proceed if we have a valid user
            if (!validation.isValid || !validation.userId) return;
            
            this.log('Setting up Qipu comments for user:', validation.userId);
            
            // Check if Qipu is loaded
            if (window.Qipu) {
                this.initQipu(validation);
            } else {
                // Load Qipu script if not already loaded
                const script = document.createElement('script');
                script.src = '/shared/assets/js/qipu.js';
                script.onload = () => this.initQipu(validation);
                document.head.appendChild(script);
            }
        } catch (e) {
            this.log('Failed to set up Qipu comments:', e);
        }
    }
    
    initQipu(validation) {
        // Initialize Qipu with user data
        window.Qipu.init({
            userId: validation.userId,
            userName: validation.userName,
            userEmail: validation.userEmail,
            userRole: validation.roleLevel,
            projectId: validation.projectId || this.projectId,
            reviewSession: validation.reviewSession || null,
            mode: validation.source === 'review_token' ? 'review' : 'edit'
        });
        
        this.log('Qipu comments initialized');
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