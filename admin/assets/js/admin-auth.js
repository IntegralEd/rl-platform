// Development version - Authentication bypass
const DEV_MODE = false; // Disabled for production

// Admin authentication state
let adminToken = null;
let adminData = null;
let adminPermissions = [];

// Initialize admin authentication
export async function initAdminAuth() {
    console.log('[Admin Auth] Initializing authentication system');
    if (DEV_MODE) {
        console.warn('[Admin Auth] Development mode is disabled');
        return false;
    }
    return false;
}

// Admin login validation
export async function loginAdmin(email, password) {
    console.log('[Admin Auth] Login attempt:', email);
    
    // Validate email domain
    if (!email.endsWith('@integral-ed.com')) {
        console.warn('[Admin Auth] Invalid email domain:', email);
        return false;
    }

    // Validate credentials
    if (AdminAuth.validatePassword(password)) {
        console.log('[Admin Auth] Login successful for:', email);
        return true;
    }

    console.warn('[Admin Auth] Login failed for:', email);
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
    static #VAULT_KEY = 'admin_vault_key';
    static #SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

    /**
     * Validate admin password
     */
    static validatePassword(password) {
        // Updated password validation for @integral-ed.com emails
        return password === 'r3curs!v3';
    }

    /**
     * Set authentication state
     */
    static setAuth() {
        const email = sessionStorage.getItem('admin_email');
        console.log('[Admin Auth] Setting auth state for:', email);
        
        const authData = {
            token: 'auth_' + Date.now(),
            timestamp: Date.now(),
            email: email
        };
        
        localStorage.setItem(this.#VAULT_KEY, JSON.stringify(authData));
        adminToken = authData.token;
        adminData = {
            email: email,
            role: 'admin'
        };
        adminPermissions = ['admin'];
        
        console.log('[Admin Auth] Auth state set successfully');
    }

    /**
     * Check if user is authenticated
     */
    static isAuthenticated() {
        try {
            const authData = JSON.parse(localStorage.getItem(this.#VAULT_KEY));
            if (!authData) {
                console.log('[Admin Auth] No auth data found');
                return false;
            }

            // Check session expiration
            if (Date.now() - authData.timestamp > this.#SESSION_DURATION) {
                console.log('[Admin Auth] Session expired');
                this.clearAuth();
                return false;
            }

            // Validate stored email domain
            if (!authData.email?.endsWith('@integral-ed.com')) {
                console.warn('[Admin Auth] Invalid email in stored auth:', authData.email);
                this.clearAuth();
                return false;
            }

            console.log('[Admin Auth] Valid session for:', authData.email);
            return true;
        } catch (error) {
            console.error('[Admin Auth] Error checking auth state:', error);
            return false;
        }
    }

    /**
     * Redirect if authenticated
     */
    static redirectIfAuthed() {
        if (this.isAuthenticated()) {
            const authData = JSON.parse(localStorage.getItem(this.#VAULT_KEY));
            console.log('[Admin Auth] Redirecting authenticated user:', authData.email);
            window.location.href = '/admin/dashboard.html';
        }
    }

    /**
     * Clears all authentication state
     */
    static clearAuth() {
        const email = sessionStorage.getItem('admin_email');
        console.log('[Admin Auth] Clearing auth state for:', email);
        
        localStorage.removeItem(this.#VAULT_KEY);
        sessionStorage.removeItem('admin_email');
        adminToken = null;
        adminData = null;
        adminPermissions = [];
    }

    /**
     * Logs out user and clears all auth state
     */
    static logout() {
        const email = sessionStorage.getItem('admin_email');
        console.log('[Admin Auth] Logging out user:', email);
        
        this.clearAuth();
        window.location.href = '/admin/index.html';
    }
}

// Auto-check auth on protected pages
if (!window.location.pathname.includes('index.html')) {
    AdminAuth.requireAuth();
} 