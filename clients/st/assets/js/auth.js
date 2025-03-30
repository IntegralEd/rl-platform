// StriveTogether Authentication Configuration
const AUTH_CONFIG = {
    clientId: 'st',
    authEndpoint: 'https://auth.strivetogether.org',
    redirectUri: window.location.origin + '/clients/st/'
};

// Initialize auth
function initAuth() {
    // Check for existing session
    const session = localStorage.getItem('auth_session');
    if (!session) {
        window.location.href = `${AUTH_CONFIG.authEndpoint}/login?client_id=${AUTH_CONFIG.clientId}&redirect_uri=${AUTH_CONFIG.redirectUri}`;
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', initAuth); 