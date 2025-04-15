/**
 * Component Loader for Recursive Learning Platform
 * Dynamically loads components from the Airtable resource map
 * with dependency resolution and client-specific overrides.
 */

import { secureFetch, getClientIdFromUrl, getComponent } from './api-client.js';
import { hasPermission } from './platform-auth.js';

// Configuration
const LOADER_CONFIG = {
  COMPONENT_CACHE_TTL: 60 * 60 * 1000, // 1 hour component cache time
  DEPENDENCY_TIMEOUT: 10000, // 10 second timeout for dependency resolution
  COMPONENTS_ENDPOINT: '/api/v1/components',
  DEBUG: false, // Set to true to enable debug logging
};

// Cache for loaded components
const componentCache = new Map();
// Track loading components to prevent circular dependencies
const loadingComponents = new Set();
// Track loaded script paths to prevent duplicate loading
const loadedScripts = new Set();
// Track loaded style paths to prevent duplicate loading
const loadedStyles = new Set();

/**
 * Load a component by ID with all its dependencies
 * @param {string} componentId - Component identifier
 * @param {Object} options - Options for loading
 * @param {boolean} options.renderImmediately - Whether to render the component immediately
 * @param {string} options.targetSelector - Selector for target element to render into
 * @param {Object} options.props - Properties to pass to the component
 * @returns {Promise<Object>} - Component data and rendered element if applicable
 */
async function loadComponent(componentId, options = {}) {
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
    const component = await getComponent(componentId);
    
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
        component.dependencies.map(depId => loadComponent(depId, { renderImmediately: false }))
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
      expiry: Date.now() + LOADER_CONFIG.COMPONENT_CACHE_TTL
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
    // Remove from loading set regardless of success/failure
    loadingComponents.delete(componentId);
  }
}

/**
 * Load multiple components in parallel
 * @param {Array<string>} componentIds - Array of component identifiers
 * @param {Object} options - Options for loading
 * @returns {Promise<Object>} - Map of component IDs to component data
 */
async function loadComponents(componentIds, options = {}) {
  const results = {};
  
  await Promise.all(
    componentIds.map(async id => {
      try {
        results[id] = await loadComponent(id, options);
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
 * @param {Object} component - Component data
 * @param {string} targetSelector - CSS selector for target element
 * @param {Object} props - Properties to pass to the component
 * @returns {Promise<Element>} - The rendered element
 */
async function renderComponent(component, targetSelector, props = {}) {
  const target = document.querySelector(targetSelector);
  
  if (!target) {
    throw new Error(`Target element not found: ${targetSelector}`);
  }
  
  // Check if component has HTML content
  if (component.html) {
    // Replace prop placeholders in HTML
    let html = component.html;
    Object.entries(props).forEach(([key, value]) => {
      const placeholder = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      html = html.replace(placeholder, value);
    });
    
    // Set inner HTML
    target.innerHTML = html;
    
    // Run any initialization functions if component defines them
    if (component.initFunction && window[component.initFunction]) {
      window[component.initFunction](target, props);
    }
    
    return target;
  } else if (component.templateId) {
    // Use template if available
    const template = document.getElementById(component.templateId);
    if (template) {
      const clone = document.importNode(template.content, true);
      
      // Replace prop placeholders in template
      const textNodes = getAllTextNodes(clone);
      textNodes.forEach(node => {
        let text = node.nodeValue;
        Object.entries(props).forEach(([key, value]) => {
          const placeholder = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
          text = text.replace(placeholder, value);
        });
        node.nodeValue = text;
      });
      
      // Clear target and append template
      target.innerHTML = '';
      target.appendChild(clone);
      
      // Run any initialization functions
      if (component.initFunction && window[component.initFunction]) {
        window[component.initFunction](target, props);
      }
      
      return target;
    }
  } else if (component.componentUrl) {
    // Fetch component HTML from URL
    try {
      const response = await fetch(component.componentUrl);
      const html = await response.text();
      
      // Replace prop placeholders
      let processedHtml = html;
      Object.entries(props).forEach(([key, value]) => {
        const placeholder = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
        processedHtml = processedHtml.replace(placeholder, value);
      });
      
      target.innerHTML = processedHtml;
      
      // Run any initialization functions
      if (component.initFunction && window[component.initFunction]) {
        window[component.initFunction](target, props);
      }
      
      return target;
    } catch (error) {
      console.error(`Failed to fetch component HTML from ${component.componentUrl}:`, error);
      throw error;
    }
  }
  
  throw new Error(`Component ${component.id} has no renderable content`);
}

/**
 * Load a JavaScript file
 * @param {string} src - Script source URL
 * @returns {Promise<void>} - Resolves when script is loaded
 */
function loadScript(src) {
  // Skip if already loaded
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
 * @param {string} href - CSS file URL
 * @returns {Promise<void>} - Resolves when CSS is loaded
 */
function loadStyle(href) {
  // Skip if already loaded
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
 * @param {Node} node - Root node
 * @returns {Array<Text>} - Array of text nodes
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
 * Load components based on data-component attributes in the DOM
 * @returns {Promise<void>} - Resolves when all components are loaded
 */
async function autoLoadComponents() {
  const elements = document.querySelectorAll('[data-component]');
  
  if (!elements.length) {
    return;
  }
  
  debug(`Auto-loading ${elements.length} components`);
  
  for (const element of elements) {
    const componentId = element.getAttribute('data-component');
    const props = {};
    
    // Extract props from data attributes
    for (const attr of element.attributes) {
      if (attr.name.startsWith('data-prop-')) {
        const propName = attr.name.slice(10); // Remove 'data-prop-' prefix
        props[propName] = attr.value;
      }
    }
    
    try {
      await loadComponent(componentId, {
        renderImmediately: true,
        targetSelector: `[data-component="${componentId}"]`,
        props
      });
    } catch (error) {
      console.error(`Failed to auto-load component ${componentId}:`, error);
      // Add error message to the element
      element.innerHTML = `<div class="component-error">Failed to load component: ${error.message}</div>`;
    }
  }
}

/**
 * Debug logging
 * @param {string} message - Debug message
 * @param {any} data - Optional data to log
 */
function debug(message, data) {
  if (LOADER_CONFIG.DEBUG) {
    if (data) {
      console.debug(`[ComponentLoader] ${message}`, data);
    } else {
      console.debug(`[ComponentLoader] ${message}`);
    }
  }
}

// Auto-initialize component loading
document.addEventListener('DOMContentLoaded', () => {
  autoLoadComponents().catch(err => {
    console.error('Component auto-loading failed:', err);
  });
});

// Listen for auth initialized event
document.addEventListener('auth:initialized', () => {
  // Refresh components that require permissions after auth
  autoLoadComponents().catch(err => {
    console.error('Component refresh after auth failed:', err);
  });
});

// Export the public API
export {
  loadComponent,
  loadComponents,
  renderComponent,
  autoLoadComponents
}; 