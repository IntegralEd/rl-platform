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
     * Initialize tree view
     */
    async initTree(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const files = await this.fetchGitHubTree();
        const treeHtml = files
            .map(file => this.createTreeItem(file.path, file.path.split('/').pop()))
            .join('');
        
        container.innerHTML = treeHtml;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.adminTree = new AdminTree();
    window.adminTree.initTree('admin-tree');

    // Handle admin panel loading
    window.loadAdminPanel = (path) => {
        const adminPanel = document.getElementById('admin-panel');
        if (adminPanel) {
            adminPanel.src = path;
        }
    };
}); 