import { AUTH_CONFIG, getAuthHeaders, isTokenValid, parseToken, handleAuthError, refreshTokenIfNeeded } from './elpl-auth.js';

// Admin authentication state
let adminToken = null;
let adminData = null;
let adminPermissions = [];

// Initialize admin authentication
export async function initAdminAuth() {
    try {
        // Get stored admin token
        adminToken = localStorage.getItem(AUTH_CONFIG.adminTokenStorageKey);
        
        // Validate and refresh token if needed
        if (adminToken) {
            if (!isTokenValid(adminToken)) {
                adminToken = await refreshTokenIfNeeded(adminToken);
                if (!adminToken) {
                    await logoutAdmin();
                    return false;
                }
            }
            
            // Fetch admin data if token is valid
            const success = await fetchAdminData();
            return success;
        }
        
        return false;
    } catch (error) {
        console.error('Admin auth initialization error:', error);
        return false;
    }
}

// Admin login
export async function loginAdmin(credentials) {
    try {
        const response = await fetch(`${AUTH_CONFIG.authEndpoint}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        if (!response.ok) {
            throw new Error('Admin login failed');
        }

        const { token, permissions } = await response.json();
        
        // Store admin token
        adminToken = token;
        localStorage.setItem(AUTH_CONFIG.adminTokenStorageKey, token);
        
        // Store permissions
        adminPermissions = permissions || [];
        
        // Fetch admin data
        await fetchAdminData();
        
        return true;
    } catch (error) {
        return handleAuthError(error);
    }
}

// Fetch admin data
export async function fetchAdminData() {
    try {
        if (!adminToken) return false;
        
        const response = await fetch(`${AUTH_CONFIG.authEndpoint}/admin/profile`, {
            headers: getAuthHeaders(adminToken)
        });

        if (!response.ok) {
            throw new Error('Failed to fetch admin data');
        }

        const data = await response.json();
        adminData = data;
        
        return true;
    } catch (error) {
        console.error('Error fetching admin data:', error);
        return false;
    }
}

// Admin logout
export async function logoutAdmin() {
    try {
        if (adminToken) {
            await fetch(`${AUTH_CONFIG.authEndpoint}/admin/logout`, {
                method: 'POST',
                headers: getAuthHeaders(adminToken)
            });
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Clear admin state
        adminToken = null;
        adminData = null;
        adminPermissions = [];
        localStorage.removeItem(AUTH_CONFIG.adminTokenStorageKey);
        
        // Redirect to admin login
        window.location.href = '/admin/login.html';
    }
}

// Get current admin data
export function getCurrentAdmin() {
    return adminData;
}

// Check if admin is authenticated
export function isAdminAuthenticated() {
    return !!adminToken && isTokenValid(adminToken);
}

// Check admin permission
export function hasPermission(permission) {
    return adminPermissions.includes(permission);
}

// Get admin permissions
export function getPermissions() {
    return [...adminPermissions];
} 