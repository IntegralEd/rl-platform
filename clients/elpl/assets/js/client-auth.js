/**
 * ELPL Client Authentication Module
 * Handles authentication, token management, and security functions
 * @version 1.0.16
 */

// Authentication Configuration
export const AUTH_CONFIG = {
    clientId: 'elpl',
    authEndpoint: window.env.LAMBDA_ENDPOINT + '/auth',
    loginEndpoint: '/login.html',
    redirectUri: window.location.origin + '/clients/elpl/',
    tokenStorageKey: 'elpl_auth_token',
    tokenRefreshThreshold: 300 // 5 minutes in seconds
};

// Generate authentication headers
export function getAuthHeaders(token = null) {
    const authToken = token || localStorage.getItem(AUTH_CONFIG.tokenStorageKey);
    return {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
    };
}

// Validate token expiration
export function isTokenValid(token) {
    try {
        const decoded = parseToken(token);
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp > currentTime;
    } catch (error) {
        console.error('Token validation error:', error);
        return false;
    }
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
        throw new Error('Invalid token format');
    }
}

// Handle authentication errors
export function handleAuthError(error) {
    console.error('Authentication error:', error);
    if (error.status === 401) {
        localStorage.removeItem(AUTH_CONFIG.tokenStorageKey);
        window.location.href = '/login.html';
    }
    throw error;
}

// Check and refresh token if needed
export async function refreshTokenIfNeeded() {
    const currentToken = localStorage.getItem(AUTH_CONFIG.tokenStorageKey);
    if (!currentToken) return null;

    try {
        const decoded = parseToken(currentToken);
        const currentTime = Math.floor(Date.now() / 1000);
        
        // Check if token needs refresh
        if (decoded.exp - currentTime < AUTH_CONFIG.tokenRefreshThreshold) {
            const response = await fetch(`${AUTH_CONFIG.authEndpoint}/refresh`, {
                method: 'POST',
                headers: getAuthHeaders(currentToken)
            });
            
            if (!response.ok) throw new Error('Token refresh failed');
            
            const { token } = await response.json();
            localStorage.setItem(AUTH_CONFIG.tokenStorageKey, token);
            return token;
        }
        
        return currentToken;
    } catch (error) {
        console.error('Token refresh error:', error);
        return null;
    }
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', () => {
    const session = localStorage.getItem(AUTH_CONFIG.tokenStorageKey);
    if (!session || !isTokenValid(session)) {
        // Redirect to login page with return URL
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.href = `${AUTH_CONFIG.loginEndpoint}?return_url=${returnUrl}`;
    }
}); 