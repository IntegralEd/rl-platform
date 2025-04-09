/**
 * admin-nav.js
 * Navigation and sidebar behavior for Recursive Learning admin panel
 * 
 * This file handles tree navigation, sidebars, and section transitions
 * for the admin interface.
 */

// Extend RecursiveAdmin namespace if it exists, create if it doesn't
window.RecursiveAdmin = window.RecursiveAdmin || {};

// Navigation namespace
RecursiveAdmin.nav = {
    // Tree view functionality
    tree: {
        init: function() {
            console.log('Initializing admin tree navigation');
            
            // Initialize tree toggles
            const toggles = document.querySelectorAll('.tree-toggle');
            toggles.forEach(toggle => {
                toggle.addEventListener('click', function(e) {
                    e.stopPropagation(); // Prevent parent handlers from firing
                    
                    const item = this.parentElement;
                    const children = item.nextElementSibling;
                    
                    if (children && children.classList.contains('tree-children')) {
                        children.classList.toggle('expanded');
                        this.classList.toggle('open');
                    }
                });
            });
            
            // Initialize tree item selection
            const items = document.querySelectorAll('.tree-item');
            items.forEach(item => {
                item.addEventListener('click', function(e) {
                    if (e.target.classList.contains('tree-toggle')) return;
                    
                    // Remove selection from other items
                    document.querySelectorAll('.tree-item.selected').forEach(selected => {
                        if (selected !== this) selected.classList.remove('selected');
                    });
                    
                    // Select this item
                    this.classList.add('selected');
                    
                    // Trigger item selection event
                    const resourceId = this.dataset.resourceId;
                    if (resourceId) {
                        this.dispatchEvent(new CustomEvent('resource-selected', {
                            bubbles: true,
                            detail: { resourceId }
                        }));
                    }
                });
            });
            
            // Initialize mode buttons
            const modeButtons = document.querySelectorAll('.mode-button');
            modeButtons.forEach(button => {
                button.addEventListener('click', function(e) {
                    e.stopPropagation(); // Prevent parent item selection
                    
                    const mode = this.dataset.mode;
                    const resourceId = this.closest('.tree-item').dataset.resourceId;
                    
                    if (mode && resourceId) {
                        this.dispatchEvent(new CustomEvent('mode-selected', {
                            bubbles: true,
                            detail: { mode, resourceId }
                        }));
                    }
                });
            });
            
            // Listen for resource selection events
            document.addEventListener('resource-selected', function(e) {
                console.log('Resource selected:', e.detail.resourceId);
                RecursiveAdmin.nav.loadResourcePanel(e.detail.resourceId);
            });
            
            // Listen for mode selection events
            document.addEventListener('mode-selected', function(e) {
                console.log('Mode selected:', e.detail.mode, 'for resource:', e.detail.resourceId);
                RecursiveAdmin.nav.loadResourceMode(e.detail.resourceId, e.detail.mode);
            });
        },
        
        // Expand path to specific item
        expandToItem: function(resourceId) {
            const item = document.querySelector(`.tree-item[data-resource-id="${resourceId}"]`);
            if (!item) return;
            
            // Expand all parent containers
            let parent = item.parentElement;
            while (parent) {
                if (parent.classList.contains('tree-children')) {
                    parent.classList.add('expanded');
                    const toggle = parent.previousElementSibling.querySelector('.tree-toggle');
                    if (toggle) toggle.classList.add('open');
                }
                parent = parent.parentElement;
            }
            
            // Select the item
            item.click();
        },
        
        // Filter tree items by search term
        filterItems: function(searchTerm) {
            if (!searchTerm) {
                // Reset visibility
                document.querySelectorAll('.tree-item').forEach(item => {
                    item.style.display = '';
                });
                document.querySelectorAll('.tree-children').forEach(container => {
                    container.style.display = '';
                });
                return;
            }
            
            searchTerm = searchTerm.toLowerCase();
            
            // Hide all items initially
            document.querySelectorAll('.tree-item').forEach(item => {
                const itemText = item.querySelector('.tree-item-text').textContent.toLowerCase();
                const matches = itemText.includes(searchTerm);
                item.style.display = matches ? '' : 'none';
                
                // If this item matches, ensure all parent containers are visible
                if (matches) {
                    let parent = item.parentElement;
                    while (parent) {
                        if (parent.classList.contains('tree-children')) {
                            parent.style.display = '';
                            parent.classList.add('expanded');
                            const toggle = parent.previousElementSibling.querySelector('.tree-toggle');
                            if (toggle) toggle.classList.add('open');
                        }
                        parent = parent.parentElement;
                    }
                }
            });
        }
    },
    
    // Tab navigation
    tabs: {
        init: function() {
            console.log('Initializing admin tab navigation');
            
            const tabLinks = document.querySelectorAll('.tab-link');
            const tabContents = document.querySelectorAll('.tab-content');
            
            tabLinks.forEach(link => {
                link.addEventListener('click', function() {
                    // Remove active class from all tabs
                    tabLinks.forEach(tab => tab.classList.remove('active'));
                    tabContents.forEach(content => content.classList.remove('active'));
                    
                    // Add active class to current tab
                    this.classList.add('active');
                    
                    // Show corresponding content
                    const tabId = this.getAttribute('data-tab');
                    document.getElementById(tabId).classList.add('active');
                    
                    // Update URL if needed
                    if (this.dataset.updateUrl !== 'false') {
                        RecursiveAdmin.url.setParam('tab', tabId);
                    }
                });
            });
            
            // Activate tab from URL
            const tabParam = RecursiveAdmin.url.getParam('tab');
            if (tabParam) {
                const tabLink = document.querySelector(`.tab-link[data-tab="${tabParam}"]`);
                if (tabLink) tabLink.click();
            } else if (tabLinks.length > 0) {
                // Activate first tab by default
                tabLinks[0].click();
            }
        }
    },
    
    // Responsive navigation
    responsive: {
        init: function() {
            console.log('Initializing responsive navigation');
            
            // Toggle sidebar
            const sidebarToggle = document.querySelector('.sidebar-toggle');
            if (sidebarToggle) {
                sidebarToggle.addEventListener('click', function() {
                    document.body.classList.toggle('sidebar-collapsed');
                    
                    // Store preference
                    const isCollapsed = document.body.classList.contains('sidebar-collapsed');
                    localStorage.setItem('admin-sidebar-collapsed', isCollapsed);
                });
                
                // Restore sidebar state
                const isCollapsed = localStorage.getItem('admin-sidebar-collapsed') === 'true';
                if (isCollapsed) {
                    document.body.classList.add('sidebar-collapsed');
                }
            }
            
            // Mobile navigation
            const mobileToggle = document.querySelector('.mobile-nav-toggle');
            if (mobileToggle) {
                mobileToggle.addEventListener('click', function() {
                    document.body.classList.toggle('mobile-nav-open');
                });
                
                // Close mobile nav when clicking outside
                document.addEventListener('click', function(e) {
                    if (document.body.classList.contains('mobile-nav-open') && 
                        !e.target.closest('.sidebar') && 
                        !e.target.closest('.mobile-nav-toggle')) {
                        document.body.classList.remove('mobile-nav-open');
                    }
                });
            }
        }
    },
    
    // Load resource panel
    loadResourcePanel: function(resourceId) {
        // This would be implemented to load resource-specific content
        console.log(`Loading resource panel for ${resourceId}`);
        
        // Load resource info from API or local data
        // Then update UI with the resource data
        
        // Example: Update breadcrumbs
        const breadcrumbs = document.querySelector('.admin-breadcrumbs');
        if (breadcrumbs) {
            // Split resource path
            const parts = resourceId.split('/');
            
            // Build breadcrumb HTML
            let html = '<span class="breadcrumb-home">Admin</span>';
            let currentPath = '';
            
            parts.forEach((part, index) => {
                if (!part) return;
                
                currentPath += `/${part}`;
                const isLast = index === parts.length - 1;
                
                html += ` <span class="breadcrumb-separator">›</span> `;
                html += isLast 
                    ? `<span class="breadcrumb-current">${part}</span>`
                    : `<span class="breadcrumb-item" data-path="${currentPath}">${part}</span>`;
            });
            
            breadcrumbs.innerHTML = html;
            
            // Add click handlers to breadcrumb items
            breadcrumbs.querySelectorAll('.breadcrumb-item').forEach(item => {
                item.addEventListener('click', function() {
                    const path = this.dataset.path;
                    if (path) {
                        RecursiveAdmin.nav.tree.expandToItem(path);
                    }
                });
            });
        }
        
        // Update URL
        RecursiveAdmin.url.setParam('resource', resourceId);
    },
    
    // Load resource in specific mode
    loadResourceMode: function(resourceId, mode) {
        console.log(`Loading ${mode} mode for resource ${resourceId}`);
        
        // Handle different modes
        switch(mode) {
            case 'live':
                this.loadPreviewIframe(resourceId, false);
                break;
            case 'preview':
                this.loadPreviewIframe(resourceId, true);
                break;
            case 'review':
                this.loadReviewPanel(resourceId);
                break;
            case 'analytics':
                this.loadAnalyticsPanel(resourceId);
                break;
        }
        
        // Update URL
        RecursiveAdmin.url.setParam('resource', resourceId);
        RecursiveAdmin.url.setParam('mode', mode);
    },
    
    // Load preview iframe
    loadPreviewIframe: function(resourceId, isTemp) {
        console.log(`Loading ${isTemp ? 'temp' : 'live'} preview for ${resourceId}`);
        
        // Select the preview tab
        const previewTab = document.querySelector('.tab-link[data-tab="preview-tab"]');
        if (previewTab) previewTab.click();
        
        // Get the iframe container
        const previewContainer = document.getElementById('preview-container');
        if (!previewContainer) return;
        
        // Build the URL for the resource
        const baseUrl = RecursiveAdmin.env.getBaseUrl();
        let url = `${baseUrl}${resourceId}`;
        
        // Add _temp suffix for temp mode
        if (isTemp) {
            // Check if URL ends with .html and insert _temp before it
            if (url.endsWith('.html')) {
                url = url.replace(/\.html$/, '_temp.html');
            } else {
                url += isTemp ? '_temp' : '';
            }
        }
        
        // Create or update iframe
        let iframe = previewContainer.querySelector('iframe');
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.className = 'preview-iframe';
            previewContainer.appendChild(iframe);
        }
        
        // Set iframe source if it's different from current
        if (iframe.src !== url) {
            // Show loading indicator
            previewContainer.classList.add('loading');
            
            iframe.onload = function() {
                previewContainer.classList.remove('loading');
            };
            
            iframe.src = url;
        }
        
        // Update preview info
        const previewInfo = document.getElementById('preview-info');
        if (previewInfo) {
            previewInfo.innerHTML = `
                <div class="preview-status ${isTemp ? 'temp' : 'live'}">
                    <span class="status-dot"></span>
                    <span class="status-text">${isTemp ? 'TEMP' : 'LIVE'}</span>
                </div>
                <div class="preview-url">${url}</div>
                <button class="preview-button copy-url" onclick="RecursiveAdmin.ui.clipboard.copy('${url}').then(() => RecursiveAdmin.ui.toast.show('URL copied!', 'success'))">
                    Copy URL
                </button>
                <button class="preview-button open-new-tab" onclick="window.open('${url}', '_blank')">
                    Open in New Tab
                </button>
            `;
        }
    },
    
    // Load review panel
    loadReviewPanel: function(resourceId) {
        console.log(`Loading review panel for ${resourceId}`);
        
        // Select the review tab
        const reviewTab = document.querySelector('.tab-link[data-tab="review-tab"]');
        if (reviewTab) reviewTab.click();
        
        // Implementation would fetch review data
        // and populate the review tab interface
    },
    
    // Load analytics panel
    loadAnalyticsPanel: function(resourceId) {
        console.log(`Loading analytics for ${resourceId}`);
        
        // Select the analytics tab
        const analyticsTab = document.querySelector('.tab-link[data-tab="analytics-tab"]');
        if (analyticsTab) analyticsTab.click();
        
        // Implementation would fetch analytics data
        // and populate the analytics tab interface
    },
    
    // Initialize all navigation
    init: function() {
        console.log('Initializing admin navigation');
        
        this.tree.init();
        this.tabs.init();
        this.responsive.init();
        
        // Set initial state from URL if available
        const resourceId = RecursiveAdmin.url.getParam('resource');
        const mode = RecursiveAdmin.url.getParam('mode');
        
        if (resourceId) {
            // Expand to the selected resource
            this.tree.expandToItem(resourceId);
            
            // Load specific mode if provided
            if (mode) {
                this.loadResourceMode(resourceId, mode);
            }
        }
    }
};

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    // Make sure RecursiveAdmin is initialized first
    if (RecursiveAdmin.init && typeof RecursiveAdmin.init === 'function') {
        RecursiveAdmin.nav.init();
    } else {
        console.error('RecursiveAdmin not properly initialized. Please check admin-common.js');
    }
}); 