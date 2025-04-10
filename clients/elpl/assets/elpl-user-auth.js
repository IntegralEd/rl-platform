import { AUTH_CONFIG, getAuthHeaders, isTokenValid } from './elpl-auth.js';

// User authentication state management
let currentUserToken = null;
let currentUserData = null;

// Initialize user authentication
async function initUserAuth() {
    const storedToken = localStorage.getItem(AUTH_CONFIG.tokenStorageKey);
    if (storedToken && isTokenValid(storedToken)) {
        currentUserToken = storedToken;
        await fetchUserData();
        return true;
    }
    return false;
}

// User login handler
async function loginUser(credentials) {
    try {
        const response = await fetch(`${AUTH_CONFIG.authEndpoint}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                clientId: AUTH_CONFIG.clientId,
                ...credentials
            })
        });

        if (!response.ok) throw new Error('Login failed');
        
        const { token, userData } = await response.json();
        currentUserToken = token;
        currentUserData = userData;
        
        localStorage.setItem(AUTH_CONFIG.tokenStorageKey, token);
        return true;
    } catch (error) {
        console.error('Login error:', error);
        return false;
    }
}

// Fetch current user data
async function fetchUserData() {
    if (!currentUserToken) return null;
    
    try {
        const response = await fetch(`${AUTH_CONFIG.authEndpoint}/user`, {
            headers: getAuthHeaders(currentUserToken)
        });
        
        if (!response.ok) throw new Error('Failed to fetch user data');
        
        currentUserData = await response.json();
        return currentUserData;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

// User logout handler
function logoutUser() {
    currentUserToken = null;
    currentUserData = null;
    localStorage.removeItem(AUTH_CONFIG.tokenStorageKey);
    window.location.href = '/login.html';
}

// Get current user data
function getCurrentUser() {
    return currentUserData;
}

// Check if user is authenticated
function isUserAuthenticated() {
    return currentUserToken !== null && isTokenValid(currentUserToken);
}

export {
    initUserAuth,
    loginUser,
    logoutUser,
    getCurrentUser,
    isUserAuthenticated,
    fetchUserData
}; 