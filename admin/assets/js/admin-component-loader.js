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
    // Fetch component configuration
    const response = await secureFetch(`${ADMIN_LOADER_CONFIG.COMPONENTS_ENDPOINT}/${componentId}`);
    const component = await response.json();
    
    if (!component) {
      throw new Error(`Component not found: ${componentId}`);
    }
    
    // Check permissions if component requires them
    if (component.requiredPermissions && component.requiredPermissions.length > 0) {
      const hasRequiredPermission = component.requiredPermissions.some(perm => hasPermission(perm));
      if (!hasRequiredPermission) {
        throw new Error(`Permission denied for component: ${componentId}`);
      }
    }
    
    // Load dependencies first
    if (component.dependencies && component.dependencies.length > 0) {
      await Promise.all(
        component.dependencies.map(depId => loadAdminComponent(depId, { renderImmediately: false }))
      );
    }
    
    // Load component resources (JS and CSS)
    if (component.scripts && component.scripts.length > 0) {
      await Promise.all(component.scripts.map(loadScript));
    }
    
    if (component.styles && component.styles.length > 0) {
      await Promise.all(component.styles.map(loadStyle));
    }
    
    // Add to cache with expiry
    componentCache.set(componentId, {
      data: component,
      expiry: Date.now() + ADMIN_LOADER_CONFIG.COMPONENT_CACHE_TTL
    });
    
    // Render if requested
    if (renderImmediately && targetSelector) {
      const rendered = await renderComponent(component, targetSelector, props);
      return {
        ...component,
        rendered
      };
    }
    
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

// Export the public API
export {
  loadAdminComponent,
  loadAdminComponents,
  renderComponent
}; 