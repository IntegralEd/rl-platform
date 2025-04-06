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
        retryCount: 0,
        maxRetries: 10,
        retryDelay: 800,
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
        console.log('Loading user DOM...', {timestamp: this.state.startTime});
        this.waitForSoftrSDK();
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

    // Wait for Softr SDK to be available
    async waitForSoftrSDK() {
        if (this.state.retryCount >= this.state.maxRetries) {
            console.error('Failed to load Softr SDK after max retries');
            this.handleAuthError('SDK load timeout');
            return;
        }

        if (typeof Softr === 'undefined') {
            this.state.retryCount++;
            console.log('Waiting for Softr SDK...', {attempt: this.state.retryCount});
            setTimeout(() => this.waitForSoftrSDK(), this.state.retryDelay);
            return;
        }

        console.log('Softr SDK loaded', {
            timeElapsed: Date.now() - this.state.startTime
        });
        this.waitForSoftrUser();
    },

    // Wait for Softr user context
    async waitForSoftrUser() {
        try {
            const user = await Softr.user.getUser();
            
            if (!user) {
                console.log('No user found, retrying...');
                if (this.state.retryCount < this.state.maxRetries) {
                    this.state.retryCount++;
                    setTimeout(() => this.waitForSoftrUser(), this.state.retryDelay);
                    return;
                }
                throw new Error('No user found after max retries');
            }

            console.log('Loaded user context', {
                timeElapsed: Date.now() - this.state.startTime,
                hasEmail: !!user.email
            });

            if (!user.email) {
                throw new Error('User email not found');
            }

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

    // Validate admin access
    async validateAdmin(user) {
        console.log('Contacting recursive learning admin page...', {
            timeElapsed: Date.now() - this.state.startTime
        });
        
        try {
            if (!Softr.token) {
                throw new Error('No auth token found');
            }

            const response = await fetch('https://integral-mothership.softr.app/recursive-admin-dashboard', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${Softr.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('Validating admin access...', {
                status: response.status,
                timeElapsed: Date.now() - this.state.startTime
            });

            this.state.adminValidated = true;
            this.onAdminValidated(user);

        } catch (error) {
            console.error('Admin validation failed:', error.message);
            this.handleAuthError('Admin validation error: ' + error.message);
        }
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