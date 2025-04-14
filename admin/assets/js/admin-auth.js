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
 * Admin Authentication Module
 * Version: 1.0.0
 * Handles admin vault access and session management
 */
export class AdminAuth {
    static #VAULT_KEY = 'rl_admin_vault_access';
    static #SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
    static #VAULT_CODE = 'RecursiveLearning2025!'; // This should be moved to environment config

    /**
     * Validates the provided vault password
     * @param {string} password - The password to validate
     * @returns {boolean} - Whether the password is valid
     */
    static validatePassword(password) {
        return password === this.#VAULT_CODE;
    }

    /**
     * Sets authentication state and timestamp
     */
    static setAuth() {
        const authState = {
            timestamp: Date.now(),
            isAuthenticated: true
        };
        localStorage.setItem(this.#VAULT_KEY, JSON.stringify(authState));
    }

    /**
     * Checks if user is currently authenticated
     * @returns {boolean} - Authentication status
     */
    static isAuthenticated() {
        const authState = localStorage.getItem(this.#VAULT_KEY);
        if (!authState) return false;

        try {
            const { timestamp, isAuthenticated } = JSON.parse(authState);
            const isExpired = Date.now() - timestamp > this.#SESSION_DURATION;
            return isAuthenticated && !isExpired;
        } catch (e) {
            return false;
        }
    }

    /**
     * Redirects to dashboard if authenticated
     */
    static redirectIfAuthed() {
        if (this.isAuthenticated() && window.location.pathname !== '/admin/dashboard.html') {
            window.location.href = '/admin/dashboard.html';
        }
    }

    /**
     * Redirects to login if not authenticated
     */
    static requireAuth() {
        if (!this.isAuthenticated() && window.location.pathname !== '/admin/index.html') {
            window.location.href = '/admin/index.html';
        }
    }

    /**
     * Clears authentication state
     */
    static logout() {
        localStorage.removeItem(this.#VAULT_KEY);
        window.location.href = '/admin/index.html';
    }
}

// Auto-check auth on protected pages
if (!window.location.pathname.includes('index.html')) {
    AdminAuth.requireAuth();
} 