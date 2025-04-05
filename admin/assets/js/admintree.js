/**
 * Admin Tree Management
 * Enforces URL conventions and provides tree functionality
 */

class AdminTree {
    constructor() {
        this.urlPatterns = {
            admin: /.*_admin\.html$/,
            live: /.*_live\.html$/,
            review: /.*_review\.html$/,
            temp: /.*_temp\.html$/
        };
        
        this.baseUrl = 'https://recursivelearning.app';
        this.validationState = null;

        // Define valid iframe sources
        this.iframeRules = {
            allowed: [
                /^https:\/\/.*_live\.html$/,  // Only _live.html URLs
                /^https:\/\/[^\/]+\.[^\/]+\// // Public URLs (must have domain)
            ],
            forbidden: [
                /_admin\.html$/,
                /_review\.html$/,
                /_temp\.html$/
            ]
        };
    }

    /**
     * Check and store validation state
     */
    async checkValidation() {
        const headerSpan = document.querySelector('#header-span');
        if (!headerSpan) {
            console.error('Header span not found');
            return false;
        }

        const roleLevel = headerSpan.getAttribute('data-role-level');
        const userEmail = headerSpan.getAttribute('data-user-email');
        
        this.validationState = {
            isValid: roleLevel === 'Org Admin',
            userEmail,
            roleLevel,
            timestamp: new Date().getTime()
        };

        // Store validation state in sessionStorage
        sessionStorage.setItem('adminValidation', JSON.stringify(this.validationState));
        
        return this.validationState.isValid;
    }

    /**
     * Get stored validation state
     */
    getStoredValidation() {
        const stored = sessionStorage.getItem('adminValidation');
        if (!stored) return null;
        
        const validation = JSON.parse(stored);
        // Expire after 1 hour
        if (new Date().getTime() - validation.timestamp > 3600000) {
            sessionStorage.removeItem('adminValidation');
            return null;
        }
        return validation;
    }

    /**
     * Validate file path against URL conventions
     */
    validatePath(path) {
        const rules = {
            admin: {
                pattern: /^\/admin\/pages\/[^\/]+\/[^\/]+\/_admin\.html$/,
                message: 'Admin pages must be in /admin/pages/{client}/{project}/_admin.html'
            },
            live: {
                pattern: /^\/clients\/[^\/]+\/[^\/]+\/_live\.html$/,
                message: 'Live pages must be in /clients/{client}/{project}/_live.html'
            },
            review: {
                pattern: /^\/clients\/[^\/]+\/[^\/]+\/_review\.html$/,
                message: 'Review pages must be in /clients/{client}/{project}/_review.html'
            }
        };

        for (const [type, rule] of Object.entries(rules)) {
            if (path.match(this.urlPatterns[type]) && !path.match(rule.pattern)) {
                console.error(`URL Convention Error: ${rule.message}`);
                return false;
            }
        }
        return true;
    }

    /**
     * Generate tree item HTML with actions
     */
    createTreeItem(path, name) {
        const isAdmin = path.match(this.urlPatterns.admin);
        const isLive = path.match(this.urlPatterns.live);
        const isReview = path.match(this.urlPatterns.review);

        const fullUrl = `${this.baseUrl}${path}`;
        
        return `
            <div class="tree-item">
                <span class="item-name">${name}</span>
                <div class="item-actions">
                    <button onclick="navigator.clipboard.writeText('${fullUrl}')" title="Copy URL">
                        📋
                    </button>
                    <button onclick="window.open('${fullUrl}', '_blank')" title="Open in new tab">
                        🔗
                    </button>
                    ${isAdmin ? `
                        <button class="admin-link" onclick="loadAdminPanel('${path}')" title="Load in admin panel">
                            ADMIN
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Fetch and validate GitHub tree
     */
    async fetchGitHubTree() {
        try {
            const response = await fetch('https://api.github.com/repos/IntegralEd/rl-platform/git/trees/main?recursive=1');
            const data = await response.json();
            
            return data.tree
                .filter(item => item.type === 'blob')
                .filter(item => this.validatePath(item.path));
        } catch (error) {
            console.error('Error fetching GitHub tree:', error);
            return [];
        }
    }

    /**
     * Handle admin panel navigation
     */
    handleAdminNavigation(path) {
        const validation = this.getStoredValidation();
        if (!validation || !validation.isValid) {
            // Store intended destination
            sessionStorage.setItem('adminRedirectAfterLogin', path);
            window.location.href = '/admin/index.html';
            return;
        }

        // If we're already validated, just load the panel
        const adminPanel = document.getElementById('admin-panel');
        if (adminPanel) {
            adminPanel.src = path;
        } else {
            // Direct navigation with validation state
            const url = new URL(path, this.baseUrl);
            url.searchParams.append('validated', 'true');
            url.searchParams.append('email', validation.userEmail);
            window.location.href = url.toString();
        }
    }

    /**
     * Initialize tree view with validation
     */
    async init(containerId) {
        // Check validation first
        const isValid = await this.checkValidation();
        if (!isValid) {
            const currentPath = window.location.pathname;
            if (currentPath !== '/admin/index.html') {
                sessionStorage.setItem('adminRedirectAfterLogin', currentPath);
                window.location.href = '/admin/index.html';
                return;
            }
        }

        // If we have a stored redirect, handle it
        const redirectPath = sessionStorage.getItem('adminRedirectAfterLogin');
        if (redirectPath && isValid) {
            sessionStorage.removeItem('adminRedirectAfterLogin');
            this.handleAdminNavigation(redirectPath);
            return;
        }

        // Initialize tree if we're on the main admin page
        if (containerId) {
            await this.initTree(containerId);
        }
    }

    /**
     * Validate iframe source URL
     */
    validateIframeSource(url) {
        // Check against forbidden patterns
        if (this.iframeRules.forbidden.some(pattern => url.match(pattern))) {
            return {
                valid: false,
                message: 'This URL type is not allowed for iframes'
            };
        }

        // Check against allowed patterns
        if (this.iframeRules.allowed.some(pattern => url.match(pattern))) {
            return {
                valid: true,
                message: 'URL is valid for iframe embedding'
            };
        }

        return {
            valid: false,
            message: 'URL must be either a _live.html page or public URL'
        };
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.adminTree = new AdminTree();
    
    // Initialize with container ID if we're on the main admin page
    const container = document.getElementById('admin-tree');
    if (container) {
        window.adminTree.init('admin-tree');
    } else {
        // Just check validation if we're on another admin page
        window.adminTree.init();
    }

    // Override loadAdminPanel to use new navigation handler
    window.loadAdminPanel = (path) => {
        window.adminTree.handleAdminNavigation(path);
    };
}); 