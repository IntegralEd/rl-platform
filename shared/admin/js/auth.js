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