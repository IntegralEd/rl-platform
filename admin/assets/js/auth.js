// Auth management for recursive learning platform
const Auth = {
    isAuthenticated: false,
    user: null,

    initialize() {
        // Check for existing session
        const session = localStorage.getItem('rl_session');
        if (session) {
            try {
                this.user = JSON.parse(session);
                this.isAuthenticated = true;
            } catch (e) {
                console.error('Invalid session data');
            }
        }
    },

    setUser(userData) {
        this.user = userData;
        this.isAuthenticated = true;
        localStorage.setItem('rl_session', JSON.stringify(userData));
    },

    clearSession() {
        this.user = null;
        this.isAuthenticated = false;
        localStorage.removeItem('rl_session');
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    Auth.initialize();
});

// Admin Authentication Protocol
const AdminAuth = {
    // State tracking
    state: {
        userLoaded: false,
        adminValidated: false,
        startTime: null
    },

    // Initialize auth check
    init() {
        // Check if we already have a valid session
        const existingValidation = this.getStoredValidation();
        if (existingValidation && existingValidation.isValid) {
            console.log('Using existing admin validation');
            this.state.adminValidated = true;
            this.showAdminUI();
            return;
        }
        
        this.state.startTime = Date.now();
        console.log('Loading user data...', {timestamp: this.state.startTime});
        
        // Check if header span is available (from Softr wrapper)
        this.processHeaderSpan();
    },
    
    // Get stored validation state
    getStoredValidation() {
        const stored = sessionStorage.getItem('adminValidation');
        if (!stored) return null;
        
        try {
            const validation = JSON.parse(stored);
            // Expire after 1 hour
            if (new Date().getTime() - validation.timestamp > 3600000) {
                sessionStorage.removeItem('adminValidation');
                return null;
            }
            return validation;
        } catch (e) {
            console.error('Invalid session data', e);
            sessionStorage.removeItem('adminValidation');
            return null;
        }
    },

    // Process the header span data that's already populated by Softr
    processHeaderSpan() {
        const headerSpan = document.getElementById('header-span');
        
        if (headerSpan) {
            const email = headerSpan.getAttribute('data-user-email');
            const name = headerSpan.getAttribute('data-user-name');
            const userId = headerSpan.getAttribute('data-user-id');
            const roleLevel = headerSpan.getAttribute('data-role-level');
            
            if (email && roleLevel) {
                console.log('Header span data found', { 
                    email, 
                    roleLevel,
                    timeElapsed: Date.now() - this.state.startTime 
                });
                
                // Check if user has admin role
                if (roleLevel === 'Org Admin') {
                    this.state.userLoaded = true;
                    
                    // Create user object
                    const user = {
                        id: userId,
                        email: email,
                        name: name,
                        roleLevel: roleLevel
                    };
                    
                    // Skip external verification since we're already inside Softr
                    this.state.adminValidated = true;
                    this.onAdminValidated(user);
                    return;
                } else {
                    this.handleAuthError(`Invalid role level: ${roleLevel}`);
                    return;
                }
            }
        }
        
        // If we get here, header span wasn't found or was incomplete
        console.log('No header span data, falling back to Softr SDK');
        // Only try once, don't keep retrying
        this.checkSoftrSDK();
    },
    
    // One-time check for Softr SDK
    checkSoftrSDK() {
        if (typeof Softr !== 'undefined') {
            console.log('Softr SDK found');
            this.loadUserFromSoftr();
        } else {
            console.error('Softr SDK not available');
            this.handleAuthError('No authentication source available');
        }
    },
    
    // Load user data from Softr if available
    async loadUserFromSoftr() {
        try {
            const user = await Softr.user.getUser();
            
            if (!user || !user.email) {
                throw new Error('User not found or email missing');
            }

            console.log('Loaded user from Softr', {
                timeElapsed: Date.now() - this.state.startTime,
                hasEmail: !!user.email
            });

            if (!user.email.endsWith('@integral-ed.com')) {
                throw new Error('Non-integral email');
            }

            this.state.userLoaded = true;
            this.validateAdmin(user);
        } catch (error) {
            console.error('User validation error:', error.message);
            this.handleAuthError(error.message);
        }
    },

    // Validate admin access (simplified - only if needed)
    async validateAdmin(user) {
        // Since we're already in Softr, we can trust the role
        // This is just a fallback
        this.state.adminValidated = true;
        this.onAdminValidated(user);
    },

    // Handle successful validation
    onAdminValidated(user) {
        const validationTime = Date.now();
        const adminContext = {
            userId: user.id,
            email: user.email,
            validatedAt: new Date(validationTime).toISOString(),
            timeToValidate: validationTime - this.state.startTime,
            isValid: true,
            timestamp: validationTime
        };

        // Store admin context
        window.adminContext = adminContext;
        
        // Store validation in session storage
        sessionStorage.setItem('adminValidation', JSON.stringify(adminContext));

        console.log('Admin validated successfully', {
            context: adminContext,
            timeElapsed: adminContext.timeToValidate
        });

        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('adminValidated', { 
            detail: adminContext
        }));

        // Show admin UI
        this.showAdminUI();
    },

    // Show admin interface
    showAdminUI() {
        const adminContainer = document.getElementById('admin-container');
        const loadingEl = document.getElementById('loading-message');
        const accessDenied = document.getElementById('access-denied');

        if (adminContainer) {
            adminContainer.style.display = 'block';
        }
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
        if (accessDenied) {
            accessDenied.style.display = 'none';
        }

        console.log('Admin UI ready', {
            timeElapsed: Date.now() - this.state.startTime
        });
    },

    // Handle auth errors
    handleAuthError(message) {
        console.error('Auth Error:', message, {
            timeElapsed: Date.now() - this.state.startTime,
            state: this.state
        });

        const loadingEl = document.getElementById('loading-message');
        const accessDenied = document.getElementById('access-denied');
        const adminContainer = document.getElementById('admin-container');

        if (loadingEl) loadingEl.style.display = 'none';
        if (accessDenied) accessDenied.style.display = 'flex';
        if (adminContainer) adminContainer.style.display = 'none';
    }
};

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', () => {
    AdminAuth.init();
});

// Export for use in other modules
window.AdminAuth = AdminAuth; 