/**
 * Authentication Module for Recursive Learning Admin
 * Handles multiple authentication sources in priority order:
 * 1. URL parameters (highest priority)
 * 2. Header span (secondary)
 * 3. PostMessage from parent frame (fallback)
 */
(function() {
    // Configuration
    const DEBUG = true;
    const SOFTR_ORIGIN = 'https://integral-mothership.softr.app';
    const AUTH_TIMEOUT = 10000; // 10 seconds timeout for auth

    // Required roles for admin access
    const ADMIN_ROLES = ['admin', 'org_admin', 'team_leader'];
    
    // Set to track authentication attempts
    const authMethodsAttempted = new Set();
    
    // User session data
    let currentUser = null;
    let authTimer = null;
    
    // Debug logging helper
    function log(...args) {
        if (DEBUG) {
            console.log('[Auth]', ...args);
        }
    }
    
    /**
     * Main authentication controller
     * Tries all available auth methods in sequence
     */
    function initAuth() {
        log('Initializing authentication...');
        
        // Set timeout for authentication
        authTimer = setTimeout(function() {
            log('Authentication timed out');
            if (!currentUser) {
                showAccessDenied('Authentication timed out. Please refresh or log in again.');
            }
        }, AUTH_TIMEOUT);
        
        // Try authentication methods in priority order
        tryUrlAuth();
        tryHeaderSpanAuth();
        setupPostMessageAuth();
        
        // Notify parent frame that we're ready for auth data
        notifyParentFrame();
    }
    
    /**
     * 1. Try URL parameter authentication (highest priority)
     */
    function tryUrlAuth() {
        log('Attempting URL parameter authentication');
        authMethodsAttempted.add('url');
        
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('User_ID') || urlParams.get('user_id') || urlParams.get('userId');
        const name = urlParams.get('Name') || urlParams.get('name');
        const email = urlParams.get('Email') || urlParams.get('email');
        const role = urlParams.get('Role') || urlParams.get('role');
        
        if (userId && role) {
            log('Auth data found in URL params');
            processAuthData({
                userId,
                name: name || 'Guest',
                email: email || '',
                role: role.toLowerCase(),
                source: 'url'
            });
            return true;
        }
        
        log('No valid auth data in URL params');
        return false;
    }
    
    /**
     * 2. Try header span authentication (secondary)
     */
    function tryHeaderSpanAuth() {
        log('Attempting header span authentication');
        authMethodsAttempted.add('header-span');
        
        const headerSpan = document.querySelector('#header-span');
        if (!headerSpan) {
            log('No header span found in document');
            return false;
        }
        
        const userId = headerSpan.getAttribute('data-user-id');
        const name = headerSpan.getAttribute('data-user-name');
        const email = headerSpan.getAttribute('data-user-email');
        const role = headerSpan.getAttribute('data-role-level');
        
        if (userId && role) {
            log('Auth data found in header span');
            processAuthData({
                userId,
                name: name || 'Guest',
                email: email || '',
                role: role.toLowerCase(),
                source: 'header-span'
            });
            return true;
        }
        
        log('No valid auth data in header span');
        return false;
    }
    
    /**
     * 3. Set up postMessage authentication listener (fallback)
     */
    function setupPostMessageAuth() {
        log('Setting up postMessage authentication listener');
        authMethodsAttempted.add('postMessage');
        
        window.addEventListener('message', function(event) {
            // Only accept messages from trusted origins
            if (event.origin !== SOFTR_ORIGIN && 
                !event.origin.includes('recursivelearning.app') && 
                !event.origin.includes('localhost')) {
                return;
            }
            
            try {
                const message = event.data;
                
                // Handle auth-data message type
                if (message && message.type === 'auth-data') {
                    log('Received auth data via postMessage');
                    processAuthData({
                        userId: message.userId,
                        name: message.name || 'Guest',
                        email: message.email || '',
                        role: message.role ? message.role.toLowerCase() : '',
                        source: 'postMessage'
                    });
                }
            } catch (e) {
                log('Error processing postMessage', e);
            }
        });
    }
    
    /**
     * Notify parent frame that we're ready for auth data
     */
    function notifyParentFrame() {
        if (window.parent !== window) {
            try {
                log('Notifying parent frame we are ready for auth');
                window.parent.postMessage({
                    type: 'iframe-ready',
                    url: window.location.href
                }, '*');
            } catch (e) {
                log('Could not notify parent frame', e);
            }
        }
    }
    
    /**
     * Process authentication data from any source
     * @param {Object} data - User authentication data
     */
    function processAuthData(data) {
        // Skip if we already have authenticated
        if (currentUser) {
            log('Auth already completed, ignoring new data from', data.source);
            return;
        }
        
        log('Processing auth data from', data.source, data);
        
        // Validate required fields
        if (!data.userId || !data.role) {
            log('Invalid auth data, missing userId or role');
            return;
        }
        
        // Convert role to lowercase for case-insensitive comparison
        const role = data.role.toLowerCase();
        
        // Check if role is allowed
        if (!ADMIN_ROLES.includes(role)) {
            log('Access denied for role:', role);
            showAccessDenied(`The role "${data.role}" does not have permission to access admin features.`);
            return;
        }
        
        // Valid authentication
        currentUser = {
            id: data.userId,
            name: data.name || 'Guest',
            email: data.email || '',
            role: role,
            authenticated: true,
            authSource: data.source,
            timestamp: new Date().toISOString()
        };
        
        // Clear timeout since we're authenticated
        if (authTimer) {
            clearTimeout(authTimer);
            authTimer = null;
        }
        
        // Save to session storage for persistence
        try {
            sessionStorage.setItem('rl_admin_user', JSON.stringify(currentUser));
        } catch (e) {
            log('Could not save to session storage', e);
        }
        
        // Update UI
        showAdminInterface();
        
        // Publish event for other modules
        dispatchUserAuthenticated(currentUser);
        
        return currentUser;
    }
    
    /**
     * Show access denied message
     * @param {string} message - Custom error message
     */
    function showAccessDenied(message) {
        const accessDeniedEl = document.getElementById('access-denied');
        const loadingEl = document.getElementById('loading');
        const adminContentEl = document.getElementById('admin-content');
        
        // If elements don't exist, create them
        if (!accessDeniedEl) {
            const newEl = document.createElement('div');
            newEl.id = 'access-denied';
            newEl.className = 'access-denied';
            newEl.innerHTML = `
                <div class="access-denied-content">
                    <h2>Access Denied</h2>
                    <p id="access-denied-message">${message || 'You do not have permission to access this page.'}</p>
                    <div class="actions">
                        <button onclick="window.location.reload()">Try Again</button>
                    </div>
                </div>
            `;
            document.body.appendChild(newEl);
        } else {
            const messageEl = accessDeniedEl.querySelector('#access-denied-message');
            if (messageEl) {
                messageEl.textContent = message || 'You do not have permission to access this page.';
            }
            accessDeniedEl.style.display = 'flex';
        }
        
        // Hide other elements
        if (loadingEl) loadingEl.style.display = 'none';
        if (adminContentEl) adminContentEl.style.display = 'none';
        
        // Log authentication methods that were attempted
        log('Authentication failed. Methods attempted:', Array.from(authMethodsAttempted).join(', '));
        
        // Clear timeout
        if (authTimer) {
            clearTimeout(authTimer);
            authTimer = null;
        }
    }
    
    /**
     * Show the admin interface after successful authentication
     */
    function showAdminInterface() {
        const accessDeniedEl = document.getElementById('access-denied');
        const loadingEl = document.getElementById('loading');
        const adminContentEl = document.getElementById('admin-content');
        
        // Hide non-content elements
        if (accessDeniedEl) accessDeniedEl.style.display = 'none';
        if (loadingEl) loadingEl.style.display = 'none';
        
        // Show content
        if (adminContentEl) {
            adminContentEl.style.display = 'block';
            log('Admin interface displayed');
        } else {
            log('Warning: #admin-content element not found');
        }
        
        // Update user display if it exists
        updateUserDisplay();
    }
    
    /**
     * Update UI elements with user info
     */
    function updateUserDisplay() {
        if (!currentUser) return;
        
        const userNameEl = document.getElementById('user-name');
        const userRoleEl = document.getElementById('user-role');
        
        if (userNameEl) {
            userNameEl.textContent = currentUser.name;
        }
        
        if (userRoleEl) {
            userRoleEl.textContent = currentUser.role;
        }
    }
    
    /**
     * Dispatch custom event for other modules
     * @param {Object} userData - User data to include in event
     */
    function dispatchUserAuthenticated(userData) {
        const event = new CustomEvent('rl-user-authenticated', {
            detail: userData,
            bubbles: true
        });
        document.dispatchEvent(event);
        log('User authenticated event dispatched');
    }
    
    /**
     * Check if user is already authenticated from session storage
     */
    function checkExistingSession() {
        try {
            const storedUser = sessionStorage.getItem('rl_admin_user');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                log('Found existing session', userData);
                
                // Verify the session isn't too old (30 minutes)
                const timestamp = new Date(userData.timestamp);
                const now = new Date();
                const sessionAge = now - timestamp;
                const maxAge = 30 * 60 * 1000; // 30 minutes
                
                if (sessionAge > maxAge) {
                    log('Session expired, re-authenticating');
                    sessionStorage.removeItem('rl_admin_user');
                    return false;
                }
                
                // Valid existing session
                currentUser = userData;
                showAdminInterface();
                dispatchUserAuthenticated(currentUser);
                return true;
            }
        } catch (e) {
            log('Error checking existing session', e);
        }
        
        return false;
    }
    
    /**
     * Public API
     */
    window.RLAuth = {
        // Initialize authentication
        init: function() {
            if (!checkExistingSession()) {
                initAuth();
            }
        },
        
        // Get current authenticated user
        getCurrentUser: function() {
            return currentUser;
        },
        
        // Check if user has specific role
        hasRole: function(role) {
            return currentUser && currentUser.role === role.toLowerCase();
        },
        
        // Force logout
        logout: function() {
            currentUser = null;
            sessionStorage.removeItem('rl_admin_user');
            window.location.href = '/';
        }
    };
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.RLAuth.init);
    } else {
        window.RLAuth.init();
    }
})(); 