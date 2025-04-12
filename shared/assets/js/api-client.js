/**
 * API Client for Recursive Learning Platform
 * 
 * Provides secure API communication with authentication handling
 * and common utility functions for API interactions.
 */

// Configuration
const API_CONFIG = {
  BASE_URL: '',  // Will be set dynamically based on environment
  TIMEOUT: 30000, // 30 seconds
  RETRY_COUNT: 2,
  RETRY_DELAY: 1000, // 1 second
  CLIENT_TOKEN_MAP: {
    "st": "schoolteacher",
    "elpl": "epl_learning",
    "bhb": "bright_horizons",
    "integraled": "integrated_education"
  },
  // Development mode - set to true to bypass authentication checks
  DEV_MODE: true,
  // Trusted domains that don't require auth in dev mode
  TRUSTED_DOMAINS: [
    'softr.app',
    'recursivelearning.app',
    'localhost',
    '127.0.0.1'
  ]
};

// Initialize API configuration
function init() {
  // Determine environment and set base URL
  const host = window.location.hostname;
  
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    API_CONFIG.BASE_URL = 'http://localhost:3000';
  } else if (host.includes('dev.recursivelearning.app')) {
    API_CONFIG.BASE_URL = 'https://dev-api.recursivelearning.app';
  } else if (host.includes('staging.recursivelearning.app')) {
    API_CONFIG.BASE_URL = 'https://staging-api.recursivelearning.app';
  } else {
    API_CONFIG.BASE_URL = 'https://api.recursivelearning.app';
  }
  
  // Pre-fetch API key from meta tag if available
  const apiKeyMeta = document.querySelector('meta[name="api-key"]');
  if (apiKeyMeta) {
    sessionStorage.setItem('apiKey', apiKeyMeta.content);
  }
}

/**
 * Make a secure API request with authentication and error handling
 * @param {string} url - API endpoint URL (can be relative to base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} Response data
 */
async function secureFetch(url, options = {}) {
  // Ensure API is initialized
  if (!API_CONFIG.BASE_URL) {
    init();
  }
  
  // Prepare full URL
  const fullUrl = url.startsWith('http') 
    ? url 
    : `${API_CONFIG.BASE_URL}${url.startsWith('/') ? url : '/' + url}`;
  
  // Build request options with defaults
  const requestOptions = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    credentials: 'include',
    mode: 'cors',
    ...options
  };
  
  // Add authentication headers - bypassed in dev mode for trusted domains
  const skipAuth = API_CONFIG.DEV_MODE && isTrustedDomain();
  if (!skipAuth) {
    addAuthHeaders(requestOptions.headers);
  } else {
    // Add dev bypass headers
    requestOptions.headers['X-Dev-Mode'] = 'true';
    requestOptions.headers['X-Auth-Bypass'] = 'development-only';
  }
  
  // Add request timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
  requestOptions.signal = controller.signal;
  
  try {
    // Execute request
    const response = await fetchWithRetry(fullUrl, requestOptions);
    
    // Skip auth checks in dev mode with trusted domains
    if (!skipAuth) {
      // Handle common response status codes
      if (response.status === 401) {
        // Unauthorized - refresh token and retry once
        if (await refreshToken()) {
          // Update auth headers and retry request once
          addAuthHeaders(requestOptions.headers);
          return fetchWithRetry(fullUrl, requestOptions);
        } else {
          throw new Error('Authentication failed');
        }
      }
      
      if (response.status === 403) {
        throw new Error('Permission denied for this resource');
      }
    }
    
    if (response.status === 404) {
      throw new Error('Resource not found');
    }
    
    if (response.status >= 500) {
      throw new Error('Server error occurred');
    }
    
    // Parse JSON if expected
    if (response.headers.get('Content-Type')?.includes('application/json')) {
      return await response.json();
    }
    
    return response;
  } catch (error) {
    // Handle specific error types
    if (error.name === 'AbortError') {
      throw new Error('Request timeout exceeded');
    }
    
    // Re-throw original error
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Check if current domain is in trusted list for dev mode
 * @returns {boolean} True if domain is trusted
 */
function isTrustedDomain() {
  try {
    const hostname = window.location.hostname;
    return API_CONFIG.TRUSTED_DOMAINS.some(domain => hostname.includes(domain));
  } catch (e) {
    return false;
  }
}

/**
 * Fetch with retry logic for transient errors
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} retryCount - Current retry count
 * @returns {Promise<Response>} Fetch response
 */
async function fetchWithRetry(url, options, retryCount = 0) {
  try {
    return await fetch(url, options);
  } catch (error) {
    // Only retry network errors, not HTTP errors
    if (retryCount < API_CONFIG.RETRY_COUNT && (error.name === 'TypeError' || error.name === 'NetworkError')) {
      // Wait before retry with exponential backoff
      const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry request
      return fetchWithRetry(url, options, retryCount + 1);
    }
    
    // Max retries exceeded or non-retryable error
    throw error;
  }
}

/**
 * Add authentication headers to request
 * @param {Object} headers - Headers object to modify
 */
function addAuthHeaders(headers) {
  // Add API key if available
  const apiKey = sessionStorage.getItem('apiKey');
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }
  
  // Add session token if available
  const sessionToken = sessionStorage.getItem('sessionToken');
  if (sessionToken) {
    headers['X-Session-Token'] = sessionToken;
  }
  
  // Add client/project identifiers from URL
  const clientId = getClientIdFromUrl();
  if (clientId) {
    headers['X-Client-ID'] = clientId;
  }
  
  const projectId = getProjectIdFromUrl();
  if (projectId) {
    headers['X-Project-ID'] = projectId;
  }
}

/**
 * Refresh authentication token
 * @returns {Promise<boolean>} True if token refresh succeeded
 */
async function refreshToken() {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return false;
    }
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });
    
    if (response.ok) {
      const data = await response.json();
      sessionStorage.setItem('sessionToken', data.sessionToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}

/**
 * Extract client ID from URL path
 * @returns {string} Client ID or empty string if not found
 */
function getClientIdFromUrl() {
  const path = window.location.pathname;
  
  // Try to extract from path patterns
  const patterns = [
    /\/clients\/([^\/]+)/,      // /clients/clientid/...
    /\/([^\/]+)\/projects\//,   // /clientid/projects/...
    /\/c\/([^\/]+)\//           // /c/clientid/...
  ];
  
  for (const pattern of patterns) {
    const match = path.match(pattern);
    if (match && match[1]) {
      // Map client ID if needed
      return API_CONFIG.CLIENT_TOKEN_MAP[match[1]] || match[1];
    }
  }
  
  // Try to get from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const clientParam = urlParams.get('client_id') || urlParams.get('client');
  if (clientParam) {
    return API_CONFIG.CLIENT_TOKEN_MAP[clientParam] || clientParam;
  }
  
  // Fall back to session storage
  return sessionStorage.getItem('clientId') || '';
}

/**
 * Extract project ID from URL path
 * @returns {string} Project ID or empty string if not found
 */
function getProjectIdFromUrl() {
  const path = window.location.pathname;
  
  // Try to extract from path patterns
  const patterns = [
    /\/projects\/([^\/]+)/,     // /projects/projectid/...
    /\/p\/([^\/]+)\//          // /p/projectid/...
  ];
  
  for (const pattern of patterns) {
    const match = path.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  // Try to get from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const projectParam = urlParams.get('project_id') || urlParams.get('project');
  if (projectParam) {
    return projectParam;
  }
  
  // Fall back to session storage
  return sessionStorage.getItem('projectId') || '';
}

/**
 * Get user role from session storage
 * @returns {string} User role or 'anonymous' if not found
 */
function getUserRole() {
  return sessionStorage.getItem('userRole') || 'anonymous';
}

/**
 * Check if user has a specific permission
 * @param {string} permission - Permission to check
 * @returns {boolean} True if user has permission
 */
function hasPermission(permission) {
  try {
    const userPermissions = JSON.parse(sessionStorage.getItem('userPermissions') || '[]');
    const userRole = getUserRole();
    
    // Admin has all permissions
    if (userRole === 'admin') {
      return true;
    }
    
    return userPermissions.includes(permission);
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Get the current page type based on URL path
 * @returns {string} Page type ('admin', 'client', or 'public')
 */
function getPageType() {
  const path = window.location.pathname;
  
  if (path.startsWith('/admin')) {
    return 'admin';
  }
  
  if (path.startsWith('/clients/')) {
    return 'client';
  }
  
  return 'public';
}

// Export public API
export {
  init,
  secureFetch,
  getClientIdFromUrl,
  getProjectIdFromUrl,
  getUserRole,
  hasPermission,
  getPageType,
  API_CONFIG
}; 