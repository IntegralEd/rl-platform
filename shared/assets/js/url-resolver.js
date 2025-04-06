/**
 * URL Resolver for Recursive Learning Platform
 * 
 * Handles URL pattern matching, resolution to resources,
 * and client access validation for dynamic components.
 */

import { secureFetch, getClientIdFromUrl } from './api-client.js';
import { log } from './cloudwatch-integration.js';

// Configuration
const RESOLVER_CONFIG = {
  API_ENDPOINT: '/api/v1/resolve',
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes in milliseconds
  CACHE_PREFIX: 'rl_url_',
  MAX_CACHE_ENTRIES: 100
};

// Cache for URL resolutions
let urlCache = new Map();

// Initialize the module
function init() {
  // Initialize pattern registry
  loadUrlPatterns();
  
  // Set up periodic cache cleanup
  setInterval(cleanupCache, RESOLVER_CONFIG.CACHE_DURATION);
}

/**
 * Load URL patterns from the backend
 */
async function loadUrlPatterns() {
  try {
    const response = await secureFetch(`${RESOLVER_CONFIG.API_ENDPOINT}/patterns`);
    
    if (response.patterns) {
      // Store patterns in localStorage for offline use
      localStorage.setItem('rl_url_patterns', JSON.stringify(response.patterns));
      log('URL patterns loaded', { count: response.patterns.length }, 'info');
    }
  } catch (error) {
    console.error('Failed to load URL patterns:', error);
    log('Failed to load URL patterns', { error: error.message }, 'error');
  }
}

/**
 * Resolve a URL to its resource configuration
 * @param {string} url - URL to resolve
 * @returns {Promise<Object|null>} Resource configuration or null if not found
 */
async function resolveUrl(url) {
  // Normalize URL by removing trailing slash and query parameters
  url = normalizeUrl(url);
  
  // Check cache first
  const cachedResource = getCachedUrl(url);
  if (cachedResource) {
    return cachedResource;
  }
  
  try {
    // Call API to resolve URL
    const response = await secureFetch(`${RESOLVER_CONFIG.API_ENDPOINT}/url`, {
      method: 'POST',
      body: JSON.stringify({ url })
    });
    
    if (response.resource) {
      // Cache the resolution result
      cacheUrl(url, response.resource);
      return response.resource;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to resolve URL:', error);
    log('URL resolution failed', { url, error: error.message }, 'error');
    
    // Try to resolve using local patterns in case we're offline
    return resolveUrlLocally(url);
  }
}

/**
 * Check if a client has access to a resource
 * @param {string} clientId - Client identifier
 * @param {Object} resource - Resource configuration
 * @returns {boolean} True if client has access
 */
function hasClientAccess(clientId, resource) {
  if (!resource || !resource.access) {
    return false;
  }
  
  // Check client access list
  if (resource.access.allowedClients) {
    const allowedClients = resource.access.allowedClients;
    
    // Allow all clients
    if (allowedClients.includes('*')) {
      return true;
    }
    
    // Check specific client
    if (allowedClients.includes(clientId)) {
      return true;
    }
  }
  
  // Check group access
  if (resource.access.allowedGroups && resource.access.allowedGroups.length > 0) {
    const clientGroups = getClientGroups(clientId);
    for (const group of clientGroups) {
      if (resource.access.allowedGroups.includes(group)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Get groups that a client belongs to
 * @param {string} clientId - Client identifier
 * @returns {Array<string>} Array of group identifiers
 */
function getClientGroups(clientId) {
  // This would typically be fetched from session storage or an API
  // For now, we'll return a hardcoded set of groups
  
  const clientGroups = {
    'schoolteacher': ['education', 'k12'],
    'epl_learning': ['education', 'public_libraries'],
    'bright_horizons': ['education', 'early_childhood'],
    'integrated_education': ['education', 'higher_ed']
  };
  
  return clientGroups[clientId] || [];
}

/**
 * Normalize a URL for consistent comparison
 * @param {string} url - URL to normalize
 * @returns {string} Normalized URL
 */
function normalizeUrl(url) {
  // Remove trailing slash
  url = url.endsWith('/') ? url.slice(0, -1) : url;
  
  // Remove query parameters and hash
  const urlParts = url.split(/[?#]/);
  return urlParts[0];
}

/**
 * Get a cached URL resolution result
 * @param {string} url - URL to look up
 * @returns {Object|null} Cached resource or null if not found or expired
 */
function getCachedUrl(url) {
  const cacheKey = `${RESOLVER_CONFIG.CACHE_PREFIX}${url}`;
  
  // Check in-memory cache first
  if (urlCache.has(cacheKey)) {
    const cacheEntry = urlCache.get(cacheKey);
    
    // Check if cache entry is still valid
    if (Date.now() - cacheEntry.timestamp < RESOLVER_CONFIG.CACHE_DURATION) {
      return cacheEntry.resource;
    }
    
    // Remove expired entry
    urlCache.delete(cacheKey);
  }
  
  // Try localStorage
  try {
    const storedEntry = localStorage.getItem(cacheKey);
    if (storedEntry) {
      const entry = JSON.parse(storedEntry);
      
      // Check if entry is still valid
      if (Date.now() - entry.timestamp < RESOLVER_CONFIG.CACHE_DURATION) {
        // Update in-memory cache
        urlCache.set(cacheKey, entry);
        return entry.resource;
      }
      
      // Remove expired entry
      localStorage.removeItem(cacheKey);
    }
  } catch (error) {
    console.error('Error reading from URL cache:', error);
  }
  
  return null;
}

/**
 * Cache a URL resolution result
 * @param {string} url - URL that was resolved
 * @param {Object} resource - Resource configuration
 */
function cacheUrl(url, resource) {
  const cacheKey = `${RESOLVER_CONFIG.CACHE_PREFIX}${url}`;
  const entry = {
    resource,
    timestamp: Date.now()
  };
  
  // Update in-memory cache
  urlCache.set(cacheKey, entry);
  
  // Update localStorage
  try {
    localStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    console.error('Error writing to URL cache:', error);
    
    // If storage is full, clear some old entries
    if (error.name === 'QuotaExceededError') {
      clearOldCacheEntries();
      
      // Try again
      try {
        localStorage.setItem(cacheKey, JSON.stringify(entry));
      } catch (e) {
        // Give up if it still fails
        console.error('Failed to cache URL after clearing old entries:', e);
      }
    }
  }
}

/**
 * Clear old cache entries when storage is full
 */
function clearOldCacheEntries() {
  // Get all keys from localStorage
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(RESOLVER_CONFIG.CACHE_PREFIX)) {
      keys.push(key);
    }
  }
  
  // Sort by age (oldest first)
  keys.sort((a, b) => {
    const aEntry = JSON.parse(localStorage.getItem(a));
    const bEntry = JSON.parse(localStorage.getItem(b));
    return aEntry.timestamp - bEntry.timestamp;
  });
  
  // Remove oldest entries to get under the limit
  const entriesToRemove = Math.max(keys.length - RESOLVER_CONFIG.MAX_CACHE_ENTRIES, 
                                   Math.floor(keys.length * 0.25)); // Remove at least 25%
  
  for (let i = 0; i < entriesToRemove; i++) {
    localStorage.removeItem(keys[i]);
    
    // Also remove from in-memory cache
    urlCache.delete(keys[i]);
  }
  
  log('Cleared old URL cache entries', { count: entriesToRemove }, 'info');
}

/**
 * Clean up expired cache entries periodically
 */
function cleanupCache() {
  const now = Date.now();
  const expiryTime = now - RESOLVER_CONFIG.CACHE_DURATION;
  
  // Clean in-memory cache
  for (const [key, entry] of urlCache.entries()) {
    if (entry.timestamp < expiryTime) {
      urlCache.delete(key);
    }
  }
  
  // Clean localStorage cache
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(RESOLVER_CONFIG.CACHE_PREFIX)) {
      try {
        const entry = JSON.parse(localStorage.getItem(key));
        if (entry.timestamp < expiryTime) {
          localStorage.removeItem(key);
        }
      } catch (e) {
        // If entry is corrupt, remove it
        localStorage.removeItem(key);
      }
    }
  }
}

/**
 * Resolve a URL using locally cached patterns (for offline use)
 * @param {string} url - URL to resolve
 * @returns {Object|null} Resource configuration or null if not found
 */
function resolveUrlLocally(url) {
  try {
    // Get patterns from localStorage
    const patternsJson = localStorage.getItem('rl_url_patterns');
    if (!patternsJson) {
      return null;
    }
    
    const patterns = JSON.parse(patternsJson);
    
    // Find matching pattern
    for (const pattern of patterns) {
      if (matchesPattern(url, pattern.urlPattern)) {
        // Generate resource config from pattern
        return {
          resourceId: pattern.resourceId,
          resourceType: pattern.resourceType,
          access: pattern.access,
          params: extractParamsFromUrl(url, pattern.urlPattern),
          components: pattern.components || []
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Failed to resolve URL locally:', error);
    return null;
  }
}

/**
 * Check if a URL matches a pattern
 * @param {string} url - URL to check
 * @param {string} pattern - URL pattern to match against
 * @returns {boolean} True if URL matches pattern
 */
function matchesPattern(url, pattern) {
  // Convert pattern to regex pattern
  const regexPattern = pattern
    .replace(/\//g, '\\/') // Escape slashes
    .replace(/\{([^}]+)\}/g, '([^/]+)') // Convert {param} to capture groups
    .replace(/\*/g, '.*'); // Convert * to wildcard
  
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(url);
}

/**
 * Extract parameters from a URL based on a pattern
 * @param {string} url - URL to extract from
 * @param {string} pattern - URL pattern with parameters
 * @returns {Object} Extracted parameters
 */
function extractParamsFromUrl(url, pattern) {
  const params = {};
  
  // Find parameter names in pattern
  const paramNames = [];
  const paramRegex = /\{([^}]+)\}/g;
  let match;
  
  while ((match = paramRegex.exec(pattern)) !== null) {
    paramNames.push(match[1]);
  }
  
  // Convert pattern to regex with capture groups
  const regexPattern = pattern
    .replace(/\//g, '\\/') // Escape slashes
    .replace(/\{([^}]+)\}/g, '([^/]+)') // Convert {param} to capture groups
    .replace(/\*/g, '.*'); // Convert * to wildcard
    
  const regex = new RegExp(`^${regexPattern}$`);
  const matches = url.match(regex);
  
  // Extract values
  if (matches && matches.length > 1) {
    for (let i = 0; i < paramNames.length; i++) {
      params[paramNames[i]] = matches[i + 1];
    }
  }
  
  // Also add client ID as a parameter
  params.clientId = getClientIdFromUrl();
  
  return params;
}

/**
 * Get component configuration for a URL
 * @param {string} url - URL to get components for
 * @returns {Promise<Array<Object>>} Array of component configurations
 */
async function getComponentsForUrl(url) {
  const resource = await resolveUrl(url);
  if (!resource || !resource.components) {
    return [];
  }
  
  return resource.components;
}

// Export public API
export {
  init,
  resolveUrl,
  hasClientAccess,
  getComponentsForUrl
}; 