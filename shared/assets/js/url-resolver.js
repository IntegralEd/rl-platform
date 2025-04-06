/**
 * URL Resolver for Recursive Learning Platform
 * 
 * Handles advanced URL pattern matching, parameter extraction,
 * and resolving to appropriate resources using the Airtable resource map.
 */

import { secureFetch, getClientIdFromUrl, getPageType } from './api-client.js';

// Configuration
const RESOLVER_CONFIG = {
  URL_REGISTRY_ENDPOINT: '/api/v1/airtable/url-registry',
  URL_CACHE_TTL: 30 * 60 * 1000, // 30 minutes
  PATTERN_TYPES: {
    EXACT: 'exact',
    PARAMETERIZED: 'parameterized',
    REGEX: 'regex',
    WILDCARD: 'wildcard'
  },
  DEBUG: false // Set to true to enable debug logging
};

// Cache for URL patterns
const urlPatternCache = new Map();
// Cache for resolved URLs
const resolvedUrlCache = new Map();

/**
 * Represents a URL pattern that can match against URLs
 */
class UrlPattern {
  /**
   * Create a URL pattern
   * @param {Object} config - Pattern configuration
   * @param {string} config.pattern - The pattern string
   * @param {string} config.type - Pattern type (exact, parameterized, regex, wildcard)
   * @param {number} config.specificity - Pattern specificity score
   * @param {Object} config.metadata - Additional metadata for the pattern
   */
  constructor(config) {
    this.originalPattern = config.pattern;
    this.type = config.type || detectPatternType(config.pattern);
    this.specificity = config.specificity || calculateSpecificity(config.pattern, this.type);
    this.metadata = config.metadata || {};
    
    // Prepare the pattern for matching based on type
    if (this.type === RESOLVER_CONFIG.PATTERN_TYPES.REGEX) {
      try {
        this.regex = new RegExp(config.pattern);
      } catch (error) {
        console.error(`Invalid regex pattern: ${config.pattern}`, error);
        this.regex = /^$/; // Empty regex that won't match anything
      }
    } else if (this.type === RESOLVER_CONFIG.PATTERN_TYPES.PARAMETERIZED) {
      this.segments = config.pattern.split('/');
      this.paramNames = [];
      
      // Extract parameter names and create a regex for each segment
      this.segmentMatchers = this.segments.map(segment => {
        if (segment.startsWith(':')) {
          const paramName = segment.substring(1);
          this.paramNames.push(paramName);
          return '([^/]+)'; // Match any character except /
        } else if (segment === '*') {
          return '([^/]+)'; // Match any segment
        } else if (segment === '**') {
          return '(.*)'; // Match multiple segments
        }
        return segment.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); // Escape regex special chars
      });
      
      this.regex = new RegExp(`^${this.segmentMatchers.join('/')}$`);
    }
  }
  
  /**
   * Match a URL against this pattern
   * @param {string} url - URL to match
   * @returns {Object|null} Match result with parameters if matched, null otherwise
   */
  match(url) {
    // For exact pattern, simple string comparison
    if (this.type === RESOLVER_CONFIG.PATTERN_TYPES.EXACT) {
      return url === this.originalPattern ? { params: {} } : null;
    }
    
    // For wildcard pattern, check if URL starts with the pattern (minus the *)
    if (this.type === RESOLVER_CONFIG.PATTERN_TYPES.WILDCARD) {
      const basePattern = this.originalPattern.replace(/\*$/, '');
      return url.startsWith(basePattern) ? { params: {} } : null;
    }
    
    // For regex and parameterized patterns, use the regex
    const match = url.match(this.regex);
    if (!match) return null;
    
    // For parameterized patterns, extract named parameters
    if (this.type === RESOLVER_CONFIG.PATTERN_TYPES.PARAMETERIZED) {
      const params = {};
      this.paramNames.forEach((name, index) => {
        params[name] = match[index + 1];
      });
      return { params };
    }
    
    // For regex patterns, return captured groups
    return {
      params: match.slice(1).reduce((params, value, index) => {
        params[`capture${index + 1}`] = value;
        return params;
      }, {})
    };
  }
}

/**
 * Detect the type of a URL pattern
 * @param {string} pattern - The pattern string
 * @returns {string} Pattern type
 */
function detectPatternType(pattern) {
  if (pattern.includes('(') || pattern.includes(')') || pattern.includes('?') || pattern.includes('+')) {
    return RESOLVER_CONFIG.PATTERN_TYPES.REGEX;
  }
  
  if (pattern.includes(':')) {
    return RESOLVER_CONFIG.PATTERN_TYPES.PARAMETERIZED;
  }
  
  if (pattern.endsWith('*')) {
    return RESOLVER_CONFIG.PATTERN_TYPES.WILDCARD;
  }
  
  return RESOLVER_CONFIG.PATTERN_TYPES.EXACT;
}

/**
 * Calculate the specificity score for a pattern
 * Higher score = more specific (should be matched first)
 * @param {string} pattern - The pattern string
 * @param {string} type - Pattern type
 * @returns {number} Specificity score
 */
function calculateSpecificity(pattern, type) {
  // Base score by type
  let score = {
    [RESOLVER_CONFIG.PATTERN_TYPES.EXACT]: 1000,
    [RESOLVER_CONFIG.PATTERN_TYPES.PARAMETERIZED]: 500,
    [RESOLVER_CONFIG.PATTERN_TYPES.REGEX]: 250,
    [RESOLVER_CONFIG.PATTERN_TYPES.WILDCARD]: 100
  }[type] || 0;
  
  // Add points for length (longer patterns are more specific)
  score += pattern.length;
  
  // Subtract points for each wildcard/parameter (more dynamic = less specific)
  const wildcardCount = (pattern.match(/[*:]/g) || []).length;
  score -= wildcardCount * 10;
  
  return score;
}

/**
 * Get all URL patterns from Airtable
 * @param {boolean} [forceRefresh=false] - Force refresh the cache
 * @returns {Promise<Array<UrlPattern>>} Array of URL patterns
 */
async function getAllUrlPatterns(forceRefresh = false) {
  const cacheKey = 'all_patterns';
  
  // Check cache first
  if (!forceRefresh) {
    const cached = urlPatternCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      debug('Using cached URL patterns');
      return cached.patterns;
    }
  }
  
  try {
    debug('Fetching URL patterns from Airtable');
    const response = await secureFetch(`${RESOLVER_CONFIG.URL_REGISTRY_ENDPOINT}/all`);
    
    // Convert to UrlPattern objects
    const patterns = response.map(pattern => new UrlPattern({
      pattern: pattern.path_pattern,
      type: detectPatternType(pattern.path_pattern),
      metadata: {
        id: pattern.id,
        resourceType: pattern.resource_type,
        authLevel: pattern.auth_level,
        components: pattern.components,
        clientAccess: pattern.client_access,
        cachePolicy: pattern.cache_policy
      }
    }));
    
    // Sort by specificity (highest first)
    patterns.sort((a, b) => b.specificity - a.specificity);
    
    // Cache the patterns
    urlPatternCache.set(cacheKey, {
      patterns,
      expiry: Date.now() + RESOLVER_CONFIG.URL_CACHE_TTL
    });
    
    return patterns;
  } catch (error) {
    console.error('Error fetching URL patterns:', error);
    
    // Return empty array if fetch fails
    return [];
  }
}

/**
 * Get the best matching pattern for a URL
 * @param {string} url - URL to match
 * @param {Object} options - Options
 * @param {boolean} options.forceRefresh - Force refresh the pattern cache
 * @returns {Promise<Object|null>} Match result with pattern and parameters if matched, null otherwise
 */
async function matchUrl(url, options = {}) {
  const { forceRefresh = false } = options;
  
  // Get all patterns
  const patterns = await getAllUrlPatterns(forceRefresh);
  
  // Try to match each pattern
  for (const pattern of patterns) {
    const match = pattern.match(url);
    if (match) {
      return {
        pattern,
        params: match.params
      };
    }
  }
  
  return null;
}

/**
 * Resolve a URL to its resource configuration
 * @param {string} url - URL to resolve
 * @param {Object} options - Options
 * @param {boolean} options.forceRefresh - Force refresh the cache
 * @returns {Promise<Object|null>} Resource configuration if resolved, null otherwise
 */
async function resolveUrl(url, options = {}) {
  const { forceRefresh = false } = options;
  
  // Check cache first
  if (!forceRefresh) {
    const cached = resolvedUrlCache.get(url);
    if (cached && cached.expiry > Date.now()) {
      debug(`Using cached resolution for ${url}`);
      return cached.resource;
    }
  }
  
  // Match the URL
  const match = await matchUrl(url, { forceRefresh });
  if (!match) {
    debug(`No pattern matched for ${url}`);
    return null;
  }
  
  // Create resource configuration
  const resource = {
    url,
    patternId: match.pattern.metadata.id,
    params: match.params,
    resourceType: match.pattern.metadata.resourceType,
    authLevel: match.pattern.metadata.authLevel,
    components: match.pattern.metadata.components,
    clientAccess: match.pattern.metadata.clientAccess,
    cachePolicy: match.pattern.metadata.cachePolicy
  };
  
  // Cache the resolution
  resolvedUrlCache.set(url, {
    resource,
    expiry: Date.now() + RESOLVER_CONFIG.URL_CACHE_TTL
  });
  
  return resource;
}

/**
 * Check if a client has access to a resource
 * @param {string} clientId - Client ID
 * @param {Object} resource - Resource configuration
 * @returns {boolean} True if client has access, false otherwise
 */
function hasClientAccess(clientId, resource) {
  if (!resource.clientAccess || resource.clientAccess.length === 0 || resource.clientAccess.includes('all')) {
    return true;
  }
  
  return resource.clientAccess.includes(clientId);
}

/**
 * Extract parameters from a URL based on a pattern
 * @param {string} url - URL to extract parameters from
 * @param {string} pattern - Pattern string
 * @returns {Object|null} Parameters if matched, null otherwise
 */
async function extractUrlParams(url, pattern) {
  const urlPattern = new UrlPattern({ pattern });
  const match = urlPattern.match(url);
  return match ? match.params : null;
}

/**
 * Log URL access for analytics
 * @param {string} url - Accessed URL
 * @param {Object} resource - Resolved resource
 * @param {number} responseTime - Response time in milliseconds
 */
async function logUrlAccess(url, resource, responseTime) {
  try {
    await secureFetch('/api/v1/log', {
      method: 'POST',
      body: JSON.stringify({
        type: 'url_access',
        url,
        patternId: resource.patternId,
        resourceType: resource.resourceType,
        clientId: getClientIdFromUrl(),
        pageType: getPageType(),
        responseTime,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    // Silently fail to avoid cascading errors
    debug('Failed to log URL access:', error);
  }
}

/**
 * Debug logging
 * @param {string} message - Debug message
 * @param {any} data - Optional data to log
 */
function debug(message, data) {
  if (RESOLVER_CONFIG.DEBUG) {
    if (data) {
      console.debug(`[UrlResolver] ${message}`, data);
    } else {
      console.debug(`[UrlResolver] ${message}`);
    }
  }
}

// Export the public API
export {
  resolveUrl,
  matchUrl,
  extractUrlParams,
  hasClientAccess,
  getAllUrlPatterns,
  logUrlAccess
}; 