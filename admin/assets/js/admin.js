// Admin Core JavaScript
class AdminPanel {
    constructor() {
        this.clientId = window.clientId;
        this.projectId = window.projectId;
        this.debug = true;
        this.isAuthenticated = false;
        this.trustedSources = [
            'integral-mothership.softr.app',
            'recursive-review.softr.app',
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
                await this.initializeTree();
                await this.loadAdminCards();
                this.hideLoading();
            } else {
                this.showError('Authentication required. Please use a valid review link or access through an authorized portal.');
            }
        } catch (error) {
            this.log('Initialization failed:', error);
            this.showError('Failed to initialize admin panel. Please refresh or contact support.');
        }
    }

    async authenticate() {
        // Check URL params first
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('validated') === 'true') {
            return true;
        }

        // Check stored validation
        const stored = sessionStorage.getItem('adminValidation');
        if (stored) {
            const validation = JSON.parse(stored);
            if (new Date().getTime() - validation.timestamp <= 3600000) {
                if (validation.isValid) {
                    return true;
                }
            } else {
                sessionStorage.removeItem('adminValidation');
            }
        }

        // Check if we're in a trusted iframe
        if (this.isInTrustedIframe()) {
            return true;
        }

        return false;
    }

    isInTrustedIframe() {
        try {
            if (window.self === window.top) {
                return false;
            }
            
            const referrer = document.referrer;
            if (referrer) {
                return this.trustedSources.some(source => referrer.includes(source));
            }
            
            return false;
        } catch (e) {
            return true;
        }
    }

    async initializeTree() {
        const treeContainer = document.querySelector('.dos-tree');
        if (!treeContainer) return;

        // Define the tree structure
        const treeStructure = [
            {
                name: 'clients',
                type: 'folder',
                children: [
                    {
                        name: 'elpl',
                        type: 'folder',
                        children: [
                            {
                                name: 'merit',
                                type: 'folder',
                                children: [
                                    { name: 'merit.html', type: 'file' },
                                    { name: 'merit_live.html', type: 'file' },
                                    { name: 'merit_review.html', type: 'file' },
                                    { name: 'merit_temp.html', type: 'file' }
                                ]
                            }
                        ]
                    },
                    {
                        name: 'st',
                        type: 'folder',
                        children: [
                            {
                                name: 'goalsetter',
                                type: 'folder',
                                children: [
                                    { name: 'goalsetter.html', type: 'file' },
                                    { name: 'goalsetter_live.html', type: 'file' },
                                    { name: 'goalsetter_review.html', type: 'file' },
                                    { name: 'goalsetter_temp.html', type: 'file' }
                                ]
                            }
                        ]
                    },
                    {
                        name: 'bhb',
                        type: 'folder',
                        children: [
                            { name: 'bmorehealthybabies.html', type: 'file' }
                        ]
                    }
                ]
            }
        ];

        // Generate tree HTML
        treeContainer.innerHTML = this.generateTreeHTML(treeStructure);

        // Initialize tree functionality
        this.initTreeBehavior();
    }

    generateTreeHTML(items, level = 0) {
        return items.map(item => {
            if (item.type === 'folder') {
                return `
                    <div class="tree-item tree-folder">
                        <span class="tree-toggle"></span>
                        <span class="tree-icon">📁</span>
                        <span>${item.name}</span>
                    </div>
                    <div class="tree-children">
                        ${item.children ? this.generateTreeHTML(item.children, level + 1) : ''}
                    </div>
                `;
            } else {
                return `
                    <div class="tree-item tree-file">
                        <div class="tree-content">
                            <span class="tree-icon">📄</span>
                            <span>${item.name}</span>
                        </div>
                    </div>
                `;
            }
        }).join('');
    }

    initTreeBehavior() {
        // Add click handlers for tree toggles
        document.querySelectorAll('.tree-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const children = toggle.parentElement.nextElementSibling;
                if (children && children.classList.contains('tree-children')) {
                    toggle.classList.toggle('open');
                    children.classList.toggle('expanded');
                }
            });
        });

        // Add click handlers for tree items
        document.querySelectorAll('.tree-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.tree-item.selected').forEach(selected => {
                    if (selected !== item) selected.classList.remove('selected');
                });
                item.classList.add('selected');
            });
        });
    }

    async loadAdminCards() {
        const cardsContainer = document.querySelector('.admin-cards');
        if (!cardsContainer) return;

        const cards = [
            {
                title: 'GoalSetter Admin',
                description: 'Manage GoalSetter versions and review tokens',
                adminUrl: '/admin/pages/clients/st/goalsetter_admin.html',
                liveUrl: '/clients/st/goalsetter/goalsetter_live.html'
            },
            {
                title: 'Merit',
                description: 'Manage Merit versions and review tokens',
                adminUrl: '/admin/pages/clients/elpl/merit_admin.html',
                liveUrl: '/clients/elpl/merit/merit_live.html'
            },
            {
                title: 'B\'more Healthy Babies',
                description: 'Manage B\'more Healthy Babies versions and review tokens',
                adminUrl: '/admin/pages/clients/bhb/admin.html',
                liveUrl: '/clients/bhb/bmore/bmore_live.html'
            }
        ];

        cardsContainer.innerHTML = cards.map(card => this.generateCardHTML(card)).join('');
    }

    generateCardHTML(card) {
        return `
            <div class="admin-card">
                <div class="admin-card-content">
                    <h2>${card.title}</h2>
                    <p>${card.description}</p>
                    <div class="admin-card-actions">
                        <button class="admin-button" onclick="window.location.href='${card.adminUrl}'">Open Admin</button>
                        <button class="admin-button secondary" onclick="window.location.href='${card.liveUrl}'">View Live</button>
                    </div>
                </div>
            </div>
        `;
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    showError(message) {
        const error = document.getElementById('error-message');
        if (error) {
            error.textContent = message;
            error.style.display = 'block';
        }
        this.hideLoading();
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