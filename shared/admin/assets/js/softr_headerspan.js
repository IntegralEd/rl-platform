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
        debug: true
    };

    // Debug logging
    function log(...args) {
        if (CONFIG.debug) {
            console.log('[Softr Header]', ...args);
        }
    }

    // Initialize header span with user data
    function initHeaderSpan() {
        const headerSpan = document.querySelector('#header-span');
        if (!headerSpan) {
            log('Header span not found, creating...');
            const span = document.createElement('span');
            span.id = 'header-span';
            span.style.display = 'none';
            document.body.insertBefore(span, document.body.firstChild);
            headerSpan = span;
        }

        function updateHeaderData() {
            if (window.logged_in_user) {
                // Map Airtable fields to header span attributes
                const userData = window.logged_in_user;
                headerSpan.setAttribute('data-user-email', userData['email'] || '');
                headerSpan.setAttribute('data-user-name', userData['Name'] || '');
                headerSpan.setAttribute('data-user-id', userData['User_ID'] || '');
                headerSpan.setAttribute('data-role-level', userData['IE_Role_Level'] || '');
                headerSpan.setAttribute('data-last-login', new Date().toISOString());
                log('Header span updated with user data');
            }
        }

        // Check for user data with retry
        let attempts = 0;
        function checkAndUpdateData() {
            if (window.logged_in_user) {
                updateHeaderData();
            } else if (attempts < CONFIG.maxAttempts) {
                attempts++;
                setTimeout(checkAndUpdateData, CONFIG.retryInterval);
            } else {
                log('Max attempts reached, user data not available');
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