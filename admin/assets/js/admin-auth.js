// Development version - Authentication bypass
const DEV_MODE = true; // Toggle this for production

// Admin authentication state
let adminToken = 'dev_token';
let adminData = {
    id: 'dev_admin',
    name: 'Development Admin',
    role: 'super_admin'
};
let adminPermissions = ['*']; // All permissions in dev mode

// Initialize admin authentication
export async function initAdminAuth() {
    if (DEV_MODE) {
        console.warn('Running in development mode - authentication is bypassed');
        return true;
    }
    // Production authentication logic will go here
    return false;
}

// Admin login - Development bypass
export async function loginAdmin(credentials) {
    if (DEV_MODE) {
        console.warn('Development mode - auto-login enabled');
        return true;
    }
    // Production login logic will go here
    return false;
}

// Get current admin data
export function getCurrentAdmin() {
    if (DEV_MODE) return adminData;
    return null;
}

// Check if admin is authenticated
export function isAdminAuthenticated() {
    if (DEV_MODE) return true;
    return false;
}

// Check admin permission
export function hasPermission(permission) {
    if (DEV_MODE) return true;
    return false;
}

// Get admin permissions
export function getPermissions() {
    if (DEV_MODE) return ['*'];
    return [];
}

// Admin configuration
export const ADMIN_CONFIG = {
    authEndpoint: '/api/auth/admin',
    tokenStorageKey: 'admin_token',
    assetsPath: '/admin/assets',
    pagesPath: '/admin/pages'
}; 