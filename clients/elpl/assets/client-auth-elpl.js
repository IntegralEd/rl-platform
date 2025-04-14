// Authentication configuration
export const AUTH_CONFIG = {
    authEndpoint: '/api/auth',
    clientId: 'elpl-client',
    tokenStorageKey: 'elpl_user_token',
    adminTokenStorageKey: 'elpl_admin_token',
    tokenExpiryBuffer: 300000 // 5 minutes in milliseconds
};

// Generate authentication headers
export function getAuthHeaders(token) {
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

// Validate token expiry and structure
export function isTokenValid(token) {
    try {
        // Basic structure validation
        if (!token || typeof token !== 'string') return false;
        
        // Parse token parts (assuming JWT format)
        const [header, payload, signature] = token.split('.');
        if (!header || !payload || !signature) return false;
        
        // Check expiry
        const decodedPayload = JSON.parse(atob(payload));
        if (!decodedPayload.exp) return false;
        
        const expiryTime = decodedPayload.exp * 1000; // Convert to milliseconds
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
        return null;
    }
}

// Handle authentication errors
export function handleAuthError(error) {
    console.error('Authentication error:', error);
    // Add any common error handling logic here
    return {
        success: false,
        message: error.message || 'Authentication failed'
    };
}

// Refresh token if needed
export async function refreshTokenIfNeeded(token) {
    try {
        const tokenData = parseToken(token);
        if (!tokenData) return null;
        
        const expiryTime = tokenData.payload.exp * 1000;
        const currentTime = Date.now();
        
        // If token is close to expiry, refresh it
        if (expiryTime - currentTime < AUTH_CONFIG.tokenExpiryBuffer) {
            const response = await fetch(`${AUTH_CONFIG.authEndpoint}/refresh`, {
                method: 'POST',
                headers: getAuthHeaders(token)
            });
            
            if (!response.ok) throw new Error('Token refresh failed');
            
            const { newToken } = await response.json();
            return newToken;
        }
        
        return token;
    } catch (error) {
        console.error('Token refresh error:', error);
        return null;
    }
} 