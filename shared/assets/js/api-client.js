/**
 * API Client for Recursive Learning Platform
 * Implements the Airtable resource map pattern for URL resolution and component management
 */

const API_CONFIG = {
  BASE_URL: 'https://{api-id}.execute-api.us-east-2.amazonaws.com/{environment}/api/v1/context',
  API_KEY: 'your-api-key', // Replace with environment variable in production
  ENVIRONMENT: 'dev', // 'dev' or 'prod'
  AIRTABLE_API_ENDPOINT: '/api/v1/airtable',
  LOG_ENDPOINT: '/api/v1/log',
};

// Client token map to convert from URL path client IDs to backend client identifiers
const CLIENT_TOKEN_MAP = {
  "st": "schoolteacher",
  "elpl": "epl_learning",
  "bhb": "bright_horizons",
  "integraled": "integrated_education"
};

/**
 * Extract client ID from current URL path
 * @returns {string} The extracted client ID or empty string if not found
 */
function getClientIdFromUrl() {
  const url = window.location.pathname;
  const matches = url.match(/\/(clients|admin\/pages)\/([^\/]+)/);
  const clientPathId = matches ? matches[2] : '';
  
  // Map the path client ID to the backend client identifier
  return CLIENT_TOKEN_MAP[clientPathId] || clientPathId;
}

/**
 * Extract project ID from current URL path
 * @returns {string} The extracted project ID or empty string if not found
 */
function getProjectIdFromUrl() {
  const url = window.location.pathname;
  const matches = url.match(/\/(clients|admin\/pages)\/[^\/]+\/([^\/]+)/);
  return matches ? matches[2] : '';
}

/**
 * Determine the page type from URL or page attributes
 * @returns {string} 'live', 'review', 'temp', 'admin', or 'unknown'
 */
function getPageType() {
  const path = window.location.pathname;
  if (path.includes('_live.html')) return 'live';
  if (path.includes('_review.html')) return 'review';
  if (path.includes('_temp.html')) return 'temp';
  if (path.includes('_admin.html') || path.includes('/admin/')) return 'admin';
  
  // Also check for data attributes on body that might indicate page type
  const bodyType = document.body.getAttribute('data-page-type');
  if (bodyType) return bodyType;
  
  return 'unknown';
}

/**
 * Make a secure fetch request to the API with proper headers and error handling
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - Parsed JSON response
 */
async function secureFetch(endpoint, options = {}) {
  // Format the base URL with environment and API ID
  const apiId = sessionStorage.getItem('apiId') || '{api-id}';
  const environment = API_CONFIG.ENVIRONMENT;
  const baseUrl = API_CONFIG.BASE_URL
    .replace('{api-id}', apiId)
    .replace('{environment}', environment);
  
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
  const clientId = getClientIdFromUrl();
  const projectId = getProjectIdFromUrl();
  
  const defaultOptions = {
    credentials: 'include',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_CONFIG.API_KEY,
      'X-Session-Token': sessionStorage.getItem('sessionToken') || '',
      'X-Client-ID': clientId,
      'X-Project-ID': projectId,
    }
  };
  
  try {
    console.debug(`API Request: ${endpoint}`, options);
    const startTime = performance.now();
    
    const response = await fetch(url, { 
      ...defaultOptions, 
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    });
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Log performance data
    if (duration > 1000) {
      console.warn(`Slow API call (${Math.round(duration)}ms): ${endpoint}`);
    }
    
    // Log request to backend if needed
    if (endpoint !== API_CONFIG.LOG_ENDPOINT) {
      logApiRequest(endpoint, response.status, duration);
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: { message: 'Unknown error', code: 'UNKNOWN' } 
      }));
      
      handleApiError(response.status, errorData);
      throw new Error(`API Error (${response.status}): ${errorData.error?.message || 'Unknown error'}`);
    }
    
    // Parse and return the JSON response
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    // Report to CloudWatch
    reportErrorToCloudWatch(error, endpoint);
    throw error;
  }
}

/**
 * Handle API error responses based on status code
 * @param {number} status - HTTP status code
 * @param {Object} errorData - Error response data
 */
function handleApiError(status, errorData) {
  switch (status) {
    case 401:
      // Redirect to login or refresh token
      sessionStorage.removeItem('sessionToken');
      console.warn('Authentication failed, redirecting to login');
      setTimeout(() => {
        window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
      }, 100);
      break;
    case 403:
      // Permission denied
      console.error('Permission denied:', errorData);
      showUserFriendlyError('You don\'t have permission to access this resource.');
      break;
    case 404:
      // Resource not found
      console.error('Resource not found:', errorData);
      showUserFriendlyError('The requested resource was not found.');
      break;
    case 429:
      // Rate limiting
      console.error('Rate limit exceeded. Please try again later.');
      showUserFriendlyError('Too many requests. Please try again in a few minutes.');
      break;
    default:
      // Generic error
      console.error('API error:', errorData);
      showUserFriendlyError('An error occurred while communicating with the server.');
  }
}

/**
 * Show a user-friendly error message
 * @param {string} message - Error message to display
 */
function showUserFriendlyError(message) {
  // Implementation depends on your UI framework
  if (window.notify) {
    window.notify.error(message);
  } else {
    alert(message);
  }
}

/**
 * Log API request to CloudWatch
 * @param {string} endpoint - API endpoint
 * @param {number} statusCode - HTTP status code
 * @param {number} duration - Request duration in ms
 */
async function logApiRequest(endpoint, statusCode, duration) {
  try {
    await fetch(`${API_CONFIG.LOG_ENDPOINT}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_CONFIG.API_KEY,
      },
      body: JSON.stringify({
        type: 'api_request',
        endpoint,
        statusCode,
        duration,
        pageType: getPageType(),
        clientId: getClientIdFromUrl(),
        projectId: getProjectIdFromUrl(),
        url: window.location.href,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    // Silently fail to avoid cascading errors
    console.debug('Failed to log API request:', error);
  }
}

/**
 * Report errors to CloudWatch
 * @param {Error} error - The error object
 * @param {string} endpoint - API endpoint where error occurred
 */
async function reportErrorToCloudWatch(error, endpoint) {
  try {
    await fetch(`${API_CONFIG.LOG_ENDPOINT}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_CONFIG.API_KEY,
      },
      body: JSON.stringify({
        type: 'error',
        message: error.message,
        stack: error.stack,
        endpoint,
        pageType: getPageType(),
        clientId: getClientIdFromUrl(),
        projectId: getProjectIdFromUrl(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })
    });
  } catch (e) {
    // Silently fail to avoid cascading errors
    console.debug('Failed to report error:', e);
  }
}

/**
 * Get URL configuration from Airtable resource map
 * @param {string} path - URL path to look up
 * @returns {Promise<Object>} - URL configuration object
 */
async function getUrlConfig(path = window.location.pathname) {
  try {
    const response = await secureFetch(`${API_CONFIG.AIRTABLE_API_ENDPOINT}/url-registry`, {
      method: 'POST',
      body: JSON.stringify({ path })
    });
    
    // Cache the URL config
    sessionStorage.setItem('urlConfig_' + path, JSON.stringify(response));
    return response;
  } catch (error) {
    console.error('Failed to get URL configuration:', error);
    
    // Try to get from cache if available
    const cachedConfig = sessionStorage.getItem('urlConfig_' + path);
    if (cachedConfig) {
      console.info('Using cached URL configuration');
      return JSON.parse(cachedConfig);
    }
    
    return null;
  }
}

/**
 * Get component by ID from Airtable component registry
 * @param {string} componentId - Component identifier
 * @returns {Promise<Object>} - Component configuration
 */
async function getComponent(componentId) {
  try {
    const response = await secureFetch(`${API_CONFIG.AIRTABLE_API_ENDPOINT}/components/${componentId}`);
    
    // Cache the component config
    sessionStorage.setItem('component_' + componentId, JSON.stringify(response));
    return response;
  } catch (error) {
    console.error(`Failed to get component ${componentId}:`, error);
    
    // Try to get from cache if available
    const cachedComponent = sessionStorage.getItem('component_' + componentId);
    if (cachedComponent) {
      console.info(`Using cached component ${componentId}`);
      return JSON.parse(cachedComponent);
    }
    
    return null;
  }
}

// Export the public API
export { 
  secureFetch, 
  getClientIdFromUrl, 
  getProjectIdFromUrl, 
  getPageType,
  getUrlConfig,
  getComponent,
  CLIENT_TOKEN_MAP
}; 