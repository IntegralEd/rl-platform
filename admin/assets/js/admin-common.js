/**
 * admin-common.js
 * Core functionality for Recursive Learning admin panel
 * 
 * This file contains shared utilities and functions used across
 * all admin pages, providing a consistent experience.
 */

// Admin namespace to avoid global conflicts
const RecursiveAdmin = {
    // Environment detection
    env: {
        isDev: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
        isProd: window.location.hostname === 'recursivelearning.app' || 
                window.location.hostname === 'integral-mothership.softr.app',
        getBaseUrl: function() {
            return this.isDev ? 'http://localhost:8080' : 'https://recursivelearning.app';
        }
    },
    
    // UI utilities
    ui: {
        // Toast notification system
        toast: {
            show: function(message, type = 'info', duration = 3000) {
                const toast = document.createElement('div');
                toast.className = `toast toast-${type}`;
                toast.innerHTML = `
                    <div class="toast-content">
                        <span class="toast-icon">${this.getIcon(type)}</span>
                        <span class="toast-message">${message}</span>
                    </div>
                `;
                
                document.body.appendChild(toast);
                
                // Animation
                setTimeout(() => toast.classList.add('show'), 10);
                
                // Auto dismiss
                setTimeout(() => {
                    toast.classList.remove('show');
                    setTimeout(() => toast.remove(), 300);
                }, duration);
            },
            
            getIcon: function(type) {
                switch(type) {
                    case 'success': return '✓';
                    case 'error': return '✕';
                    case 'warning': return '⚠';
                    case 'info':
                    default: return 'ℹ';
                }
            }
        },
        
        // Modal dialog system
        modal: {
            show: function(options) {
                const defaults = {
                    title: 'Dialog',
                    content: '',
                    confirmText: 'OK',
                    cancelText: 'Cancel',
                    onConfirm: null,
                    onCancel: null,
                    showCancel: true
                };
                
                const settings = {...defaults, ...options};
                
                const modal = document.createElement('div');
                modal.className = 'admin-modal';
                modal.innerHTML = `
                    <div class="admin-modal-backdrop"></div>
                    <div class="admin-modal-container">
                        <div class="admin-modal-header">
                            <h3>${settings.title}</h3>
                            <button class="admin-modal-close">&times;</button>
                        </div>
                        <div class="admin-modal-content">${settings.content}</div>
                        <div class="admin-modal-footer">
                            ${settings.showCancel ? 
                              `<button class="admin-modal-cancel">${settings.cancelText}</button>` : ''}
                            <button class="admin-modal-confirm">${settings.confirmText}</button>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(modal);
                
                // Prevent body scrolling
                document.body.style.overflow = 'hidden';
                
                // Handle close
                const closeModal = () => {
                    modal.classList.add('closing');
                    setTimeout(() => {
                        modal.remove();
                        document.body.style.overflow = '';
                    }, 300);
                };
                
                // Event handlers
                modal.querySelector('.admin-modal-close').addEventListener('click', () => {
                    if (settings.onCancel) settings.onCancel();
                    closeModal();
                });
                
                if (settings.showCancel) {
                    modal.querySelector('.admin-modal-cancel').addEventListener('click', () => {
                        if (settings.onCancel) settings.onCancel();
                        closeModal();
                    });
                }
                
                modal.querySelector('.admin-modal-confirm').addEventListener('click', () => {
                    if (settings.onConfirm) settings.onConfirm();
                    closeModal();
                });
                
                modal.querySelector('.admin-modal-backdrop').addEventListener('click', () => {
                    if (settings.onCancel) settings.onCancel();
                    closeModal();
                });
                
                // Animation
                setTimeout(() => modal.classList.add('show'), 10);
                
                return modal;
            },
            
            confirm: function(message, onConfirm, onCancel) {
                return this.show({
                    title: 'Confirm',
                    content: message,
                    onConfirm,
                    onCancel
                });
            },
            
            alert: function(message, onConfirm) {
                return this.show({
                    title: 'Alert',
                    content: message,
                    showCancel: false,
                    onConfirm
                });
            }
        },
        
        // Copy to clipboard utility
        clipboard: {
            copy: function(text) {
                if (navigator.clipboard && window.isSecureContext) {
                    return navigator.clipboard.writeText(text)
                        .then(() => true)
                        .catch(() => this.fallbackCopy(text));
                } else {
                    return this.fallbackCopy(text);
                }
            },
            
            fallbackCopy: function(text) {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                try {
                    document.execCommand('copy');
                    textArea.remove();
                    return Promise.resolve(true);
                } catch (err) {
                    console.error('Failed to copy:', err);
                    textArea.remove();
                    return Promise.resolve(false);
                }
            }
        }
    },
    
    // Status management for tree view
    status: {
        update: function(activity, status) {
            const card = document.querySelector(`.admin-card[data-activity="${activity}"]`);
            if (card) {
                const dots = card.querySelectorAll('.status-dot');
                dots.forEach((dot, index) => {
                    if (status[index]) {
                        dot.dataset.status = status[index].state;
                        dot.dataset.tooltip = status[index].message;
                    }
                });
            }
        },
        
        broadcast: function(activity, status) {
            // Send status to parent window if in iframe
            if (window.parent !== window) {
                window.parent.postMessage({
                    type: 'status',
                    activity,
                    status
                }, '*');
            }
        }
    },
    
    // URL utilities
    url: {
        getParam: function(name) {
            const params = new URLSearchParams(window.location.search);
            return params.get(name);
        },
        
        setParam: function(name, value) {
            const url = new URL(window.location);
            url.searchParams.set(name, value);
            window.history.pushState({}, '', url);
        },
        
        removeParam: function(name) {
            const url = new URL(window.location);
            url.searchParams.delete(name);
            window.history.pushState({}, '', url);
        }
    },
    
    // Initialize admin common functionality
    init: function() {
        console.log('Recursive Admin: Initializing common functions');
        
        // Development bypass for local testing
        if (this.env.isDev) {
            console.log('Development mode: Authentication bypassed');
            // Set admin user role for testing
            localStorage.setItem('userRole', 'admin');
            
            // Add dev mode indicator if not already present
            if (!document.querySelector('.dev-mode-indicator')) {
                document.querySelector('.admin-header')?.insertAdjacentHTML('beforeend', 
                    '<div class="dev-mode-indicator" style="background: #ffaa00; color: black; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-left: 10px;">DEV MODE</div>');
            }
        }
        
        // Initialize collapsible sections
        this.initCollapsibleSections();
    },
    
    // Initialize collapsible sections
    initCollapsibleSections: function() {
        document.querySelectorAll('.collapsible-section').forEach(section => {
            const header = section.querySelector('.section-header');
            const content = section.querySelector('.section-content');
            const carrot = section.querySelector('.carrot');
            
            if (header && content && carrot) {
                header.addEventListener('click', () => {
                    const isOpen = content.style.display === 'block';
                    
                    if (!isOpen) {
                        content.style.display = 'block';
                        carrot.style.transform = 'rotate(90deg)';
                    } else {
                        content.style.display = 'none';
                        carrot.style.transform = 'rotate(0deg)';
                    }
                });
            }
        });
    }
};

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    RecursiveAdmin.init();
}); 