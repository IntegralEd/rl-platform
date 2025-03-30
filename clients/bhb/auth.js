// BHB Authentication Configuration
const AUTH_CONFIG = {
    clientId: 'bhb',
    authEndpoint: 'https://auth.bhb.com',
    redirectUri: window.location.origin + '/clients/bhb/'
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