/**
 * ELPL Client Authentication Module (Unified)
 * Handles authentication, token management, and security functions
 * All traffic allowed, all within recursivelearning.app
 * @version 1.0.17
 */

// Authentication Configuration
export const AUTH_CONFIG = {
    clientId: 'elpl-client',
    authEndpoint: '/api/auth',
    loginEndpoint: '#bypass-login', // Bypass login for development
    redirectUri: window.location.origin + '/clients/elpl/',
    tokenStorageKey: 'elpl_user_token',
    adminTokenStorageKey: 'elpl_admin_token',
    tokenExpiryBuffer: 300000, // 5 minutes in ms
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

// Validate token expiry and structure (JWT)
export function isTokenValid(token) {
    try {
        if (!token || typeof token !== 'string') return false;
        const [header, payload, signature] = token.split('.');
        if (!header || !payload || !signature) return false;
        const decodedPayload = JSON.parse(atob(payload));
        if (!decodedPayload.exp) return false;
        const expiryTime = decodedPayload.exp * 1000;
        const currentTime = Date.now();
        // Return true if token is not expired (considering buffer time)
        return expiryTime > (currentTime + AUTH_CONFIG.tokenExpiryBuffer);
    } catch (error) {
        console.error('Token validation error:', error);
        return false;
    }
}

// Parse JWT token
export function parseToken(token) {
    try {
        const [header, payload, signature] = token.split('.');
        return {
            header: JSON.parse(atob(header)),
            payload: JSON.parse(atob(payload)),
            signature
        };
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
        // No redirect in dev mode
    }
    return {
        success: false,
        message: error.message || 'Authentication failed'
    };
}

// Refresh token if needed
export async function refreshTokenIfNeeded(token = null) {
    try {
        const currentToken = token || localStorage.getItem(AUTH_CONFIG.tokenStorageKey);
        if (!currentToken) return null;
        const tokenData = parseToken(currentToken);
        if (!tokenData) return null;
        const expiryTime = tokenData.payload.exp * 1000;
        const currentTime = Date.now();
        // If token is close to expiry, refresh it
        if (expiryTime - currentTime < AUTH_CONFIG.tokenExpiryBuffer) {
            const response = await fetch(`${AUTH_CONFIG.authEndpoint}/refresh`, {
                method: 'POST',
                headers: getAuthHeaders(currentToken)
            });
            if (!response.ok) throw new Error('Token refresh failed');
            const { token: newToken } = await response.json();
            localStorage.setItem(AUTH_CONFIG.tokenStorageKey, newToken);
            return newToken;
        }
        return currentToken;
    } catch (error) {
        console.error('Token refresh error:', error);
        return null;
    }
}

// Initialize auth on page load (dev mode: no redirect)
document.addEventListener('DOMContentLoaded', () => {
    const session = localStorage.getItem(AUTH_CONFIG.tokenStorageKey);
    if (!session || !isTokenValid(session)) {
        console.warn('[Auth] No valid session token found. (Dev mode: not redirecting)');
    }
}); 