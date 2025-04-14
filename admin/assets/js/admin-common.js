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
        isProd: true, // Temporarily always true
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
            localStorage.setItem('userRole', 'admin');
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

// Common utilities for admin pages
import { AdminAuth } from './admin-auth.js';

/**
 * Secure fetch wrapper that handles auth and common error cases
 * @param {string} url - The URL to fetch from
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} The fetch response
 */
export async function secureFetch(url, options = {}) {
  // Ensure options has headers object
  options.headers = options.headers || {};
  
  // Add auth header if we have a token
  const auth = AdminAuth.checkAuth();
  if (auth) {
    options.headers['Authorization'] = `Bearer ${auth.token}`;
  }

  // Add default headers
  options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
  options.headers['X-Requested-With'] = 'XMLHttpRequest';

  try {
    const response = await fetch(url, options);

    // Handle common error cases
    if (response.status === 401) {
      AdminAuth.clearAuth();
      window.location.href = '/admin/index.html';
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('Secure fetch error:', error);
    throw error;
  }
}

/**
 * Common error handler for admin components
 * @param {Error} error - The error to handle
 * @param {HTMLElement} element - The element to show error in
 */
export function handleError(error, element) {
  console.error('Admin error:', error);
  if (element) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'admin-error';
    errorDiv.textContent = error.message || 'An error occurred';
    element.appendChild(errorDiv);
  }
}

/**
 * Debounce function for rate limiting
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Format date for admin displays
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
} 