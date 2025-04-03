/**
 * Softr Header Span Initialization
 * Reusable script for Softr admin pages to initialize user data in header span
 * Usage: Add to preheader with <script src="/admin/assets/js/softr_headerspan.js"></script>
 */

(function() {
    // Configuration
    const CONFIG = {
        maxAttempts: 10,
        retryInterval: 500,
        debug: true,
        defaultValues: {
            name: 'Guest',
            email: '',
            userId: '',
            roleLevel: ''
        }
    };

    // Debug logging
    function log(...args) {
        if (CONFIG.debug) {
            console.log('[Softr Header]', ...args);
        }
    }

    // Safely get user data with fallback
    function getUserValue(userData, key, defaultValue) {
        try {
            return userData && userData[key] ? userData[key] : defaultValue;
        } catch (e) {
            log('Error accessing user data:', e);
            return defaultValue;
        }
    }

    // Initialize header span with user data
    function initHeaderSpan() {
        let headerSpan = document.querySelector('#header-span');
        if (!headerSpan) {
            log('Header span not found, creating...');
            headerSpan = document.createElement('span');
            headerSpan.id = 'header-span';
            headerSpan.style.display = 'none';
            document.body.insertBefore(headerSpan, document.body.firstChild);
        }

        function updateHeaderData() {
            if (window.logged_in_user) {
                const userData = window.logged_in_user;
                log('Updating header with user data:', userData);
                
                // Safely set attributes with fallbacks
                headerSpan.setAttribute('data-user-email', 
                    getUserValue(userData, 'email', CONFIG.defaultValues.email));
                headerSpan.setAttribute('data-user-name', 
                    getUserValue(userData, 'Name', CONFIG.defaultValues.name));
                headerSpan.setAttribute('data-user-id', 
                    getUserValue(userData, 'User_ID', CONFIG.defaultValues.userId));
                headerSpan.setAttribute('data-role-level', 
                    getUserValue(userData, 'IE_Role_Level', CONFIG.defaultValues.roleLevel));
                headerSpan.setAttribute('data-last-login', new Date().toISOString());
                
                log('Header span updated successfully');
                return true;
            }
            return false;
        }

        // Check for user data with retry
        let attempts = 0;
        function checkAndUpdateData() {
            if (updateHeaderData()) {
                log('User data initialized successfully');
                return;
            }
            
            if (attempts < CONFIG.maxAttempts) {
                attempts++;
                log(`Retrying user data check (${attempts}/${CONFIG.maxAttempts})`);
                setTimeout(checkAndUpdateData, CONFIG.retryInterval);
            } else {
                log('Max attempts reached, using default values');
                // Set default values if user data never becomes available
                headerSpan.setAttribute('data-user-email', CONFIG.defaultValues.email);
                headerSpan.setAttribute('data-user-name', CONFIG.defaultValues.name);
                headerSpan.setAttribute('data-user-id', CONFIG.defaultValues.userId);
                headerSpan.setAttribute('data-role-level', CONFIG.defaultValues.roleLevel);
                headerSpan.setAttribute('data-last-login', new Date().toISOString());
            }
        }

        // Start checking for user data
        log('Initializing header span...');
        checkAndUpdateData();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeaderSpan);
    } else {
        initHeaderSpan();
    }
})(); 