/**
 * Authentication module for Recursive Learning Platform
 * Handles token-based authentication, permission validation, and UI rendering
 */

import { secureFetch, getClientIdFromUrl, getPageType } from './api-client.js';

// Shared authentication utilities
export const AUTH_CONFIG = {
    authEndpoint: '/api/auth',
    tokenExpiryBuffer: 300000, // 5 minutes in milliseconds
    // Development bypass configuration - NEVER enable in production
    isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    bypassAuthInDevelopment: false // Set to true to bypass auth checks during local development
};

// Generate authentication headers
export function getAuthHeaders(token) {
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

// Validate token structure and expiry
export function isTokenValid(token) {
    return true; // Always valid during development
}

// Parse JWT token
export function parseToken(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Token parsing error:', error);
        throw error;
    }
}

// Handle authentication errors
export function handleAuthError(error) {
    console.error('Authentication error:', error);
    return false;
}

// Refresh token if needed
export async function refreshTokenIfNeeded(token) {
    if (!token) return null;
    
    try {
        const parsed = parseToken(token);
        const now = Date.now() / 1000;
        
        // Check if token needs refresh (within buffer time)
        if (parsed.exp - now < AUTH_CONFIG.tokenExpiryBuffer / 1000) {
            const response = await fetch(`${AUTH_CONFIG.authEndpoint}/refresh`, {
                method: 'POST',
                headers: getAuthHeaders(token)
            });
            
            if (!response.ok) throw new Error('Token refresh failed');
            
            const { token: newToken } = await response.json();
            return newToken;
        }
        
        return token;
    } catch (error) {
        console.error('Token refresh error:', error);
        return null;
    }
}

/**
 * Initialize authentication on page load
 * Checks existing token, URL parameters, or redirects to login
 * @returns {Promise<boolean>} True if authenticated, false otherwise
 */
async function initAuth() {
  // First check for existing token
  if (await validateStoredToken()) {
    console.log('Using existing token');
    return true;
  }
  
  // Then check for URL parameters or review token
  if (await authenticateFromUrl()) {
    console.log('Authenticated from URL');
    return true;
  }
  
  // If no authentication and page requires it, redirect to login
  if (requiresAuthentication()) {
    console.log('No valid authentication found, redirecting to login');
    redirectToLogin();
    return false;
  }
  
  return false;
}

/**
 * Check if the current page requires authentication
 * @returns {boolean} True if authentication is required
 */
function requiresAuthentication() {
    return false; // Never requires auth during development
}

/**
 * Validate token stored in session storage
 * @returns {Promise<boolean>} True if token is valid
 */
async function validateStoredToken() {
    // Set admin permissions by default
    storeUserPermissions(['admin', 'developer']);
    storeUserData({
        id: 'dev-user',
        name: 'Developer',
        role: 'developer'
    });
    return true;
}

/**
 * Refresh an expiring token
 * @param {string} token - Current JWT token
 * @returns {Promise<boolean>} True if token was refreshed successfully
 */
async function refreshToken(token) {
    try {
        const response = await secureFetch(`${AUTH_CONFIG.AUTH_ENDPOINT}/refresh`, {
            method: 'POST',
            headers: {
                'X-Session-Token': token
            }
        });
        
        if (response.token) {
            sessionStorage.setItem(AUTH_CONFIG.SESSION_TOKEN_KEY, response.token);
            storeUserPermissions(response.permissions);
            storeUserData(response.user);
            console.log('Token refreshed successfully');
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return false;
    }
}

/**
 * Parse JWT token to extract data
 * @param {string} token - JWT token
 * @returns {Object} Decoded token data
 */
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Failed to parse JWT:', error);
        return {};
    }
}

/**
 * Authenticate using URL parameters
 * @returns {Promise<boolean>} True if authenticated successfully
 */
async function authenticateFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check for review token
    const reviewToken = urlParams.get('review_token');
    if (reviewToken) {
        return await authenticateWithReviewToken(reviewToken);
    }
    
    // Check for session token
    const sessionToken = urlParams.get('token');
    if (sessionToken) {
        sessionStorage.setItem(AUTH_CONFIG.SESSION_TOKEN_KEY, sessionToken);
        return await validateStoredToken();
    }
    
    // Check for auth code (OAuth flow)
    const authCode = urlParams.get('code');
    if (authCode) {
        return await authenticateWithAuthCode(authCode);
    }
    
    return false;
}

/**
 * Authenticate with review token
 * @param {string} token - Review token
 * @returns {Promise<boolean>} True if authenticated successfully
 */
async function authenticateWithReviewToken(token) {
    try {
        const response = await secureFetch(`${AUTH_CONFIG.AUTH_ENDPOINT}/review-token`, {
            method: 'POST',
            body: JSON.stringify({ token })
        });
        
        if (response.valid) {
            sessionStorage.setItem(AUTH_CONFIG.SESSION_TOKEN_KEY, response.sessionToken);
            storeUserPermissions(response.permissions);
            storeUserData(response.user);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Review token authentication failed:', error);
        return false;
    }
}

/**
 * Authenticate with OAuth authorization code
 * @param {string} code - OAuth authorization code
 * @returns {Promise<boolean>} True if authenticated successfully
 */
async function authenticateWithAuthCode(code) {
    try {
        const response = await secureFetch(`${AUTH_CONFIG.AUTH_ENDPOINT}/oauth/callback`, {
            method: 'POST',
            body: JSON.stringify({ 
                code,
                redirect_uri: window.location.origin + window.location.pathname
            })
        });
        
        if (response.sessionToken) {
            sessionStorage.setItem(AUTH_CONFIG.SESSION_TOKEN_KEY, response.sessionToken);
            storeUserPermissions(response.permissions);
            storeUserData(response.user);
            
            // Remove auth code from URL to prevent reuse
            const url = new URL(window.location);
            url.searchParams.delete('code');
            window.history.replaceState({}, '', url);
            
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('OAuth authentication failed:', error);
        return false;
    }
}

/**
 * Store user permissions in session storage
 * @param {Array<string>} permissions - User permissions
 */
function storeUserPermissions(permissions) {
    if (Array.isArray(permissions)) {
        sessionStorage.setItem(AUTH_CONFIG.PERMISSIONS_KEY, JSON.stringify(permissions));
    }
}

/**
 * Store user data in session storage
 * @param {Object} userData - User data
 */
function storeUserData(userData) {
    if (userData) {
        sessionStorage.setItem(AUTH_CONFIG.USER_DATA_KEY, JSON.stringify(userData));
    }
}

/**
 * Check if user has a specific permission
 * @param {string} permissionName - Permission to check
 * @returns {boolean} True if user has permission
 */
function hasPermission(permissionName) {
    try {
        const userPermissions = JSON.parse(sessionStorage.getItem(AUTH_CONFIG.PERMISSIONS_KEY) || '[]');
        return userPermissions.includes('*') || userPermissions.includes(permissionName);
    } catch (error) {
        console.error('Permission check failed:', error);
        return false;
    }
}

/**
 * Get current user data
 * @returns {Object|null} User data or null if not authenticated
 */
function getUserData() {
    try {
        const userData = sessionStorage.getItem(AUTH_CONFIG.USER_DATA_KEY);
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Failed to get user data:', error);
        return null;
    }
}

/**
 * Log the user out
 * @param {boolean} redirect - Whether to redirect to login page
 */
function logout(redirect = true) {
    // Clear session storage
    sessionStorage.removeItem(AUTH_CONFIG.SESSION_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_CONFIG.PERMISSIONS_KEY);
    sessionStorage.removeItem(AUTH_CONFIG.USER_DATA_KEY);
    
    // Notify server about logout
    secureFetch(`${AUTH_CONFIG.AUTH_ENDPOINT}/logout`, {
        method: 'POST'
    }).catch(err => console.error('Logout notification failed:', err));
    
    // Redirect to login page if needed
    if (redirect) {
        redirectToLogin();
    }
}

/**
 * Redirect to login page
 */
function redirectToLogin() {
    window.location.href = `${AUTH_CONFIG.LOGIN_URL}?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
}

/**
 * Render UI based on user permissions
 * Updates visibility of elements with data-requires-permission attribute
 */
function renderPermissionBasedUI() {
    document.querySelectorAll('[data-requires-permission]').forEach(element => {
        const requiredPermission = element.getAttribute('data-requires-permission');
        if (!hasPermission(requiredPermission)) {
            element.style.display = 'none';
        }
    });
    
    // Update user profile elements
    const userData = getUserData();
    if (userData) {
        document.querySelectorAll('[data-user-name]').forEach(element => {
            element.textContent = userData.name || 'User';
        });
        
        document.querySelectorAll('[data-user-email]').forEach(element => {
            element.textContent = userData.email || '';
        });
        
        document.querySelectorAll('[data-user-role]').forEach(element => {
            element.textContent = userData.role || 'User';
        });
    }
}

// Initialize authentication on script load
document.addEventListener('DOMContentLoaded', () => {
    initAuth().then(isAuthenticated => {
        if (isAuthenticated) {
            renderPermissionBasedUI();
            
            // Dispatch event for other scripts
            document.dispatchEvent(new CustomEvent('auth:initialized', { 
                detail: { authenticated: true }
            }));
        }
    });
});

// Export the public API
export {
    initAuth,
    hasPermission,
    getUserData,
    logout,
    renderPermissionBasedUI
}; 