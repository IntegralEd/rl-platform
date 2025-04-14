/**
 * Admin Component Loader for Recursive Learning Platform
 * Handles dynamic loading of admin panel components with dependency resolution
 */

import { hasPermission } from './admin-auth.js';
import { secureFetch } from './admin-common.js';

// Configuration
const ADMIN_LOADER_CONFIG = {
  COMPONENT_CACHE_TTL: 60 * 60 * 1000, // 1 hour component cache time
  DEPENDENCY_TIMEOUT: 10000, // 10 second timeout for dependency resolution
  COMPONENTS_ENDPOINT: '/api/v1/admin/components',
  DEBUG: false
};

// Cache for loaded components
const componentCache = new Map();
const loadingComponents = new Set();
const loadedScripts = new Set();
const loadedStyles = new Set();

// Admin Component Loader
class AdminComponentLoader {
    constructor() {
        this.components = new Map();
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;
        
        // Register standard components
        this.registerComponent('admin-page', this.initAdminPage.bind(this));
        this.registerComponent('admin-nav', this.initAdminNav.bind(this));
        
        // Initialize all components on page
        await this.initializeComponents();
        
        this.initialized = true;
        console.log('[Admin] Component loader initialized');
    }

    registerComponent(name, initializer) {
        this.components.set(name, initializer);
        console.log(`[Admin] Registered component: ${name}`);
    }

    async initializeComponents() {
        const components = document.querySelectorAll('[data-admin-component]');
        for (const element of components) {
            const componentName = element.dataset.adminComponent;
            const initializer = this.components.get(componentName);
            
            if (initializer) {
                try {
                    await initializer(element);
                    console.log(`[Admin] Initialized component: ${componentName}`);
                } catch (error) {
                    console.error(`[Admin] Failed to initialize ${componentName}:`, error);
                }
            }
        }
    }

    // Standard component initializers
    async initAdminPage(element) {
        // Initialize version display
        const versionDisplay = element.querySelector('.version-display');
        if (versionDisplay) {
            const now = new Date();
            const buildDate = now.toLocaleDateString('en-US', { 
                month: '2-digit', 
                day: '2-digit',
                year: 'numeric'
            }).replace(/\//g, '');
            const buildTime = now.toLocaleTimeString('en-US', { 
                hour12: true,
                hour: '2-digit',
                minute: '2-digit'
            }).toLowerCase();
            const version = '1.0.0';
            versionDisplay.textContent = `admin.html/${buildDate}.${buildTime}.v.${version}`;
        }

        // Initialize navigation
        this.initializeNavigation(element);
    }

    async initAdminNav(element) {
        // Initialize navigation state
        const currentPath = window.location.pathname;
        const navLinks = element.querySelectorAll('[data-href]');
        
        navLinks.forEach(link => {
            if (link.dataset.href === currentPath) {
                link.classList.add('active');
            }
            
            link.addEventListener('click', () => {
                window.location.href = link.dataset.href;
            });
        });
    }

    // Helper methods
    initializeNavigation(element) {
        const navButtons = element.querySelectorAll('[data-href]');
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                window.location.href = button.dataset.href;
            });
        });

        const actionButtons = element.querySelectorAll('[data-action]');
        actionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                this.handleAction(action);
            });
        });
    }

    handleAction(action) {
        console.log(`[Admin] Handling action: ${action}`);
        // Add specific action handlers here
    }
}

/**
 * Load an admin component by ID with all its dependencies
 */
async function loadAdminComponent(componentId, options = {}) {
  const {
    renderImmediately = false,
    targetSelector = null,
    props = {},
    forceRefresh = false,
  } = options;

  // Check cache first if not forcing refresh
  if (!forceRefresh) {
    const cached = componentCache.get(componentId);
    if (cached && cached.expiry > Date.now()) {
      debug(`Using cached component: ${componentId}`);
      
      if (renderImmediately && targetSelector) {
        return {
          ...cached.data,
          rendered: await renderComponent(cached.data, targetSelector, props)
        };
      }
      
      return cached.data;
    }
  }
  
  // Prevent circular dependencies
  if (loadingComponents.has(componentId)) {
    throw new Error(`Circular dependency detected for component: ${componentId}`);
  }
  
  loadingComponents.add(componentId);
  
  try {
    // For now, just return a basic component structure
    // This will be replaced with actual API calls later
    const component = {
      id: componentId,
      name: componentId,
      version: '1.0.0',
      template: '<div>Component placeholder</div>'
    };
    
    // Add to cache with expiry
    componentCache.set(componentId, {
      data: component,
      expiry: Date.now() + ADMIN_LOADER_CONFIG.COMPONENT_CACHE_TTL
    });
    
    return component;
  } finally {
    loadingComponents.delete(componentId);
  }
}

/**
 * Load multiple admin components in parallel
 */
async function loadAdminComponents(componentIds, options = {}) {
  const results = {};
  
  await Promise.all(
    componentIds.map(async id => {
      try {
        results[id] = await loadAdminComponent(id, options);
      } catch (error) {
        console.error(`Failed to load component ${id}:`, error);
        results[id] = { error: error.message };
      }
    })
  );
  
  return results;
}

/**
 * Render a component to the specified target
 */
async function renderComponent(component, targetSelector, props = {}) {
  const target = document.querySelector(targetSelector);
  
  if (!target) {
    throw new Error(`Target element not found: ${targetSelector}`);
  }
  
  if (component.html) {
    let html = component.html;
    Object.entries(props).forEach(([key, value]) => {
      const placeholder = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      html = html.replace(placeholder, value);
    });
    
    target.innerHTML = html;
    
    if (component.initFunction && window[component.initFunction]) {
      window[component.initFunction](target, props);
    }
    
    return target;
  } else if (component.templateId) {
    const template = document.getElementById(component.templateId);
    if (template) {
      const clone = document.importNode(template.content, true);
      
      const textNodes = getAllTextNodes(clone);
      textNodes.forEach(node => {
        let text = node.nodeValue;
        Object.entries(props).forEach(([key, value]) => {
          const placeholder = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
          text = text.replace(placeholder, value);
        });
        node.nodeValue = text;
      });
      
      target.innerHTML = '';
      target.appendChild(clone);
      
      if (component.initFunction && window[component.initFunction]) {
        window[component.initFunction](target, props);
      }
      
      return target;
    }
  }
  
  throw new Error(`Component ${component.id} has no renderable content`);
}

/**
 * Load a JavaScript file
 */
function loadScript(src) {
  if (loadedScripts.has(src)) {
    return Promise.resolve();
  }
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    
    script.onload = () => {
      loadedScripts.add(src);
      resolve();
    };
    
    script.onerror = () => {
      reject(new Error(`Failed to load script: ${src}`));
    };
    
    document.head.appendChild(script);
  });
}

/**
 * Load a CSS file
 */
function loadStyle(href) {
  if (loadedStyles.has(href)) {
    return Promise.resolve();
  }
  
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    
    link.onload = () => {
      loadedStyles.add(href);
      resolve();
    };
    
    link.onerror = () => {
      reject(new Error(`Failed to load stylesheet: ${href}`));
    };
    
    document.head.appendChild(link);
  });
}

/**
 * Get all text nodes in an element tree
 */
function getAllTextNodes(node) {
  const textNodes = [];
  
  function getTextNodes(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      textNodes.push(node);
    } else {
      const children = node.childNodes;
      for (let i = 0; i < children.length; i++) {
        getTextNodes(children[i]);
      }
    }
  }
  
  getTextNodes(node);
  return textNodes;
}

/**
 * Debug logging
 */
function debug(message, data) {
  if (ADMIN_LOADER_CONFIG.DEBUG) {
    if (data) {
      console.debug(`[AdminComponentLoader] ${message}`, data);
    } else {
      console.debug(`[AdminComponentLoader] ${message}`);
    }
  }
}

// Auto-initialize component loading
document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('[data-admin-component]');
  
  elements.forEach(element => {
    const componentId = element.getAttribute('data-admin-component');
    const props = {};
    
    // Extract props from data attributes
    for (const attr of element.attributes) {
      if (attr.name.startsWith('data-prop-')) {
        const propName = attr.name.slice(10);
        props[propName] = attr.value;
      }
    }
    
    loadAdminComponent(componentId, {
      renderImmediately: true,
      targetSelector: `[data-admin-component="${componentId}"]`,
      props
    }).catch(error => {
      console.error(`Failed to load admin component ${componentId}:`, error);
      element.innerHTML = `<div class="component-error">Failed to load component: ${error.message}</div>`;
    });
  });
});

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    window.adminLoader = new AdminComponentLoader();
    window.adminLoader.initialize();
});

// Export the public API
export {
  loadAdminComponent,
  loadAdminComponents,
  renderComponent
}; 