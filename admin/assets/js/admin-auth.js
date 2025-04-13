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

// Admin Authentication Module
export const AdminAuth = {
    AUTH_KEY: 'rl_admin_auth',
    AUTH_DURATION: 24 * 60 * 60 * 1000, // 24 hours

    checkAuth() {
        try {
            const auth = JSON.parse(localStorage.getItem(this.AUTH_KEY));
            if (!auth) return false;
            
            if (Date.now() > auth.expiry) {
                this.clearAuth();
                return false;
            }
            
            return auth.authenticated;
        } catch {
            return false;
        }
    },

    setAuth() {
        const expiry = Date.now() + this.AUTH_DURATION;
        localStorage.setItem(this.AUTH_KEY, JSON.stringify({
            authenticated: true,
            expiry
        }));
    },

    clearAuth() {
        localStorage.removeItem(this.AUTH_KEY);
    },

    requireAuth() {
        if (!this.checkAuth()) {
            window.location.href = '/admin/index.html?reauth=true';
            return false;
        }
        return true;
    },

    redirectIfAuthed() {
        if (this.checkAuth()) {
            window.location.href = '/admin/dashboard.html';
            return true;
        }
        return false;
    }
};

// Auto-check auth on protected pages
if (window.location.pathname !== '/admin/index.html') {
    AdminAuth.requireAuth();
} 