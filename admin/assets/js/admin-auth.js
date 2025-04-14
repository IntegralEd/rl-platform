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

/**
 * Simple admin authentication module
 * Uses localStorage for session persistence
 */
export const AdminAuth = {
    AUTH_KEY: 'admin_auth',
    AUTH_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    TEMP_PASSWORD: 'r3curs1v3', // Temporary hardcoded password

    checkAuth() {
        const auth = localStorage.getItem(this.AUTH_KEY);
        if (!auth) return false;

        const { expiry } = JSON.parse(auth);
        if (Date.now() > expiry) {
            this.clearAuth();
            return false;
        }
        return true;
    },

    setAuth() {
        const expiry = Date.now() + this.AUTH_DURATION;
        localStorage.setItem(this.AUTH_KEY, JSON.stringify({ expiry }));
    },

    clearAuth() {
        localStorage.removeItem(this.AUTH_KEY);
    },

    validatePassword(password) {
        return password === this.TEMP_PASSWORD;
    },

    requireAuth() {
        if (!this.checkAuth()) {
            window.location.href = '/admin/index.html';
        }
    },

    redirectIfAuthed() {
        if (this.checkAuth()) {
            window.location.href = '/admin/dashboard.html';
        }
    }
};

// Auto-check auth on protected pages
if (!window.location.pathname.includes('index.html')) {
    AdminAuth.requireAuth();
} 