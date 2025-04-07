/**
 * Authentication Module (Simplified for Softr Integration)
 * 
 * Provides simplified authentication for development purposes when running
 * in a Softr iframe. Focuses on allowing easy access from trusted domains
 * with minimal authentication barriers.
 */

// Configuration
const AUTH_CONFIG = {
  // Development mode (enable for easier access during development)
  DEBUG: true,
  
  // Trusted origins that will be auto-authenticated
  TRUSTED_ORIGINS: [
    'integral-mothership.softr.app',
    'recursivelearning.app',
    'localhost'
  ],
  
  // Login endpoint (for fallback)
  LOGIN_ENDPOINT: '/auth/login',
  
  // Redirect URL param (might be used by Softr embedding)
  REDIRECT_PARAM: 'redirect_uri',
  
  // How long to wait for authentication (ms)
  AUTH_TIMEOUT: 5000
};

// Default user for development
const DEV_USER = {
  id: 'dev-user-1234',
  name: 'Development User',
  email: 'dev@recursivelearning.app',
  role: 'admin',
  permissions: ['read', 'write', 'admin'],
  token: 'dev-token-1234',
  origin: 'development'
};

// State
let authState = {
  authenticated: false,
  user: null,
  token: null,
  processingAuth: false,
  origin: null
};

/**
 * Initialize authentication
 * @returns {Promise<boolean>} Whether authentication was successful
 */
async function initAuth() {
  console.log('Initializing authentication...');
  
  // If already authenticated, return immediately
  if (authState.authenticated && authState.user) {
    console.log('Already authenticated:', authState.user.name);
    return true;
  }
  
  // Try methods in order:
  // 1. Restore from session
  // 2. URL params auth
  // 3. Check for Softr iframe
  // 4. Dev user fallback
  
  try {
    // 1. Try to restore from session first
    if (await restoreSession()) {
      console.log('Session restored');
      return true;
    }
    
    // 2. Check URL params
    if (await authenticateFromUrlParams()) {
      console.log('Authenticated from URL params');
      return true;
    }
    
    // 3. Check if running in a Softr iframe
    if (isInSoftrFrame()) {
      console.log('Running in Softr iframe - auto authenticating');
      return await autoAuthenticateSoftrUser();
    }
    
    // 4. Fall back to development user if in DEBUG mode
    if (AUTH_CONFIG.DEBUG) {
      console.log('DEBUG MODE: Using development user');
      authState.user = DEV_USER;
      authState.token = DEV_USER.token;
      authState.authenticated = true;
      authState.origin = 'development';
      
      // Update UI
      showAdminInterface();
      
      // Dispatch event
      dispatchAuthEvent('auth:success', {
        user: authState.user,
        origin: 'development'
      });
      
      return true;
    }
    
    // None of the methods worked, redirect to login
    redirectToLogin();
    return false;
  } catch (error) {
    console.error('Authentication failed:', error);
    
    // If in DEBUG mode, use development user anyway
    if (AUTH_CONFIG.DEBUG) {
      console.log('DEBUG MODE: Using development user despite error');
      authState.user = DEV_USER;
      authState.token = DEV_USER.token;
      authState.authenticated = true;
      authState.origin = 'development';
      
      // Update UI
      showAdminInterface();
      
      return true;
    }
    
    // Show error UI
    document.getElementById('auth-error-message').textContent = 
      'Authentication failed: ' + error.message;
    document.getElementById('auth-error').style.display = 'block';
    document.getElementById('loading-indicator').style.display = 'none';
    return false;
  }
}

/**
 * Check if running in a trusted Softr frame
 * @returns {boolean} Whether in a Softr frame
 */
function isInSoftrFrame() {
  try {
    // Check if iframe
    if (window.self === window.top) {
      return false;
    }
    
    // Check origin if available
    const currentHostname = window.location.hostname;
    return AUTH_CONFIG.TRUSTED_ORIGINS.some(
      origin => currentHostname.includes(origin)
    );
  } catch (e) {
    // If we can't access parent due to same-origin policy,
    // we might be in an iframe from another domain
    return true;
  }
}

/**
 * Auto-authenticate users coming from Softr
 * @returns {Promise<boolean>} Whether authentication was successful
 */
async function autoAuthenticateSoftrUser() {
  // Create a user based on available information
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = urlParams.get('client_id') || 'softr-client';
  const userId = urlParams.get('user_id') || 'softr-user';
  
  // Try to get email and name from URL
  const email = urlParams.get('email') || `${userId}@recursivelearning.app`;
  const name = urlParams.get('name') || 'Softr User';
  
  // Create user object
  const softrUser = {
    id: userId,
    name: name,
    email: email,
    role: 'member',
    permissions: ['read', 'write'],
    token: `softr-token-${Date.now()}`,
    origin: 'softr'
  };
  
  // Set state
  authState.user = softrUser;
  authState.token = softrUser.token;
  authState.authenticated = true;
  authState.origin = 'softr';
  
  // Store session
  localStorage.setItem('auth_token', softrUser.token);
  localStorage.setItem('auth_user', JSON.stringify(softrUser));
  
  // Update UI
  showAdminInterface();
  
  // Dispatch event
  dispatchAuthEvent('auth:success', {
    user: authState.user,
    origin: 'softr'
  });
  
  return true;
}

/**
 * Try to restore authentication from session storage
 * @returns {Promise<boolean>} Whether session was restored
 */
async function restoreSession() {
  try {
    const token = localStorage.getItem('auth_token');
    const userJson = localStorage.getItem('auth_user');
    
    if (!token || !userJson) {
      return false;
    }
    
    // Parse user
    const user = JSON.parse(userJson);
    
    // Validate (minimal check)
    if (!user.id || !user.email) {
      return false;
    }
    
    // Set state
    authState.user = user;
    authState.token = token;
    authState.authenticated = true;
    authState.origin = 'session';
    
    // Update UI
    showAdminInterface();
    
    // Dispatch event
    dispatchAuthEvent('auth:success', {
      user: authState.user,
      origin: 'session'
    });
    
    return true;
  } catch (error) {
    console.error('Failed to restore session:', error);
    return false;
  }
}

/**
 * Try to authenticate from URL parameters
 * @returns {Promise<boolean>} Whether authentication was successful
 */
async function authenticateFromUrlParams() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (!token) {
      return false;
    }
    
    // Get user info from token
    const userId = urlParams.get('user_id') || 'url-user';
    const email = urlParams.get('email') || `${userId}@recursivelearning.app`;
    const name = urlParams.get('name') || 'URL User';
    
    // Create user
    const urlUser = {
      id: userId,
      name: name,
      email: email,
      role: 'member',
      permissions: ['read', 'write'],
      token: token,
      origin: 'url'
    };
    
    // Set state
    authState.user = urlUser;
    authState.token = token;
    authState.authenticated = true;
    authState.origin = 'url';
    
    // Store session
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(urlUser));
    
    // Update UI
    showAdminInterface();
    
    // Dispatch event
    dispatchAuthEvent('auth:success', {
      user: authState.user,
      origin: 'url'
    });
    
    return true;
  } catch (error) {
    console.error('Failed to authenticate from URL:', error);
    return false;
  }
}

/**
 * Update UI to show admin interface
 */
function showAdminInterface() {
  // Hide loading and error if they exist
  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'none';
  }
  
  const authError = document.getElementById('auth-error');
  if (authError) {
    authError.style.display = 'none';
  }
  
  // Show content if it exists
  const adminContent = document.getElementById('admin-content');
  if (adminContent) {
    adminContent.style.display = 'block';
  }
  
  // Update user info if element exists
  const userElement = document.getElementById('current-user');
  if (userElement && authState.user) {
    userElement.textContent = authState.user.name;
  }
  
  console.log('Admin interface displayed');
}

/**
 * Redirect to login page
 */
function redirectToLogin() {
  if (AUTH_CONFIG.DEBUG) {
    console.log('DEBUG MODE: Would redirect to login, but staying on page');
    return;
  }
  
  const currentUrl = encodeURIComponent(window.location.href);
  window.location.href = `${AUTH_CONFIG.LOGIN_ENDPOINT}?${AUTH_CONFIG.REDIRECT_PARAM}=${currentUrl}`;
}

/**
 * Add auth token to headers
 * @param {Object} headers - Headers object to modify
 */
function addAuthHeaders(headers) {
  if (authState.token) {
    headers['X-Auth-Token'] = authState.token;
  }
  
  // For Softr, add special bypass header
  if (authState.origin === 'softr' || isInSoftrFrame()) {
    headers['X-Auth-Bypass'] = 'softr-embedded';
  }
  
  // In debug mode, also add this header
  if (AUTH_CONFIG.DEBUG) {
    headers['X-Auth-Debug'] = 'true';
  }
}

/**
 * Get current user
 * @returns {Object|null} User object or null
 */
function getCurrentUser() {
  return authState.user;
}

/**
 * Check if user has a specific permission
 * @param {string} permission - Permission to check
 * @returns {boolean} Whether user has permission
 */
function hasPermission(permission) {
  // In debug mode, always return true
  if (AUTH_CONFIG.DEBUG) {
    return true;
  }
  
  // If running in Softr, also grant permissions
  if (isInSoftrFrame()) {
    return true;
  }
  
  if (!authState.user || !authState.user.permissions) {
    return false;
  }
  
  // Check for admin permission (grants all)
  if (authState.user.permissions.includes('admin')) {
    return true;
  }
  
  return authState.user.permissions.includes(permission);
}

/**
 * Dispatch authentication event
 * @param {string} type - Event type
 * @param {Object} detail - Event detail
 */
function dispatchAuthEvent(type, detail = {}) {
  const event = new CustomEvent(type, {
    detail: {
      ...detail,
      timestamp: new Date().toISOString()
    },
    bubbles: true
  });
  document.dispatchEvent(event);
}

/**
 * Log out current user
 */
function logout() {
  // Clear state
  authState = {
    authenticated: false,
    user: null,
    token: null,
    processingAuth: false,
    origin: null
  };
  
  // Clear storage
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  
  // Dispatch event
  dispatchAuthEvent('auth:logout');
  
  // Redirect to login
  redirectToLogin();
}

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing auth...');
  initAuth().then(success => {
    if (success) {
      console.log('Authentication initialized successfully');
    } else {
      console.error('Authentication initialization failed');
    }
  });
});

// Export public API
window.auth = {
  init: initAuth,
  getUser: getCurrentUser,
  hasPermission,
  addAuthHeaders,
  logout
}; 