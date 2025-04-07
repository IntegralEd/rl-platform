/**
 * Softr Header Span
 * Loads Softr user data into a hidden span element for cross-domain authentication
 * This script should be hosted on GitHub Pages for cross-domain access
 * 
 * @version 1.0.0
 * @license MIT
 */
(function() {
    'use strict';
    
    // Configuration
    const DEBUG = true;
    const MAX_RETRIES = 20;
    const RETRY_INTERVAL = 500; // ms
    
    // TEMPORARY: Bypass authentication for direct access
    const BYPASS_AUTH = true;
    
    // Debug logging helper
    function log(...args) {
        if (DEBUG) {
            console.log('[Softr Header Span]', ...args);
        }
    }
    
    // Initialize header span data
    function initHeaderSpan() {
        log('Initializing header span');
        
        // Create the header span if it doesn't exist
        let headerSpan = document.getElementById('header-span');
        if (!headerSpan) {
            headerSpan = document.createElement('span');
            headerSpan.id = 'header-span';
            headerSpan.style.display = 'none';
            document.body.appendChild(headerSpan);
            log('Created header span element');
        }
        
        // TEMPORARY: If bypassing auth, create simulated user data
        if (BYPASS_AUTH) {
            log('⚠️ AUTH BYPASS ENABLED - Using simulated admin user');
            const simulatedUser = {
                User_ID: 'admin-bypass',
                Name: 'Admin User',
                email: 'admin@integral-ed.com',
                IE_Role_Level: 'Org Admin',
                First_Name: 'Admin'
            };
            
            // Store in window for other scripts
            window.logged_in_user = simulatedUser;
            
            // Update header span with simulated data
            updateHeaderSpan(simulatedUser);
            return;
        }
        
        // Try to get Softr user data
        if (window.logged_in_user) {
            updateHeaderSpan(window.logged_in_user);
        } else {
            waitForSoftrUser();
        }
    }
    
    // Wait for Softr user data to become available
    let retryCount = 0;
    function waitForSoftrUser() {
        if (window.logged_in_user) {
            log('Softr user data found');
            updateHeaderSpan(window.logged_in_user);
            return;
        }
        
        // TEMPORARY: If bypassing auth and we're still waiting after several retries,
        // create a simulated user
        if (BYPASS_AUTH && retryCount >= 5) {
            log('⚠️ AUTH BYPASS ENABLED - Creating simulated user after timeout');
            const simulatedUser = {
                User_ID: 'admin-bypass',
                Name: 'Admin User',
                email: 'admin@integral-ed.com',
                IE_Role_Level: 'Org Admin',
                First_Name: 'Admin'
            };
            
            // Store in window for other scripts
            window.logged_in_user = simulatedUser;
            
            // Update header span with simulated data
            updateHeaderSpan(simulatedUser);
            return;
        }
        
        if (retryCount < MAX_RETRIES) {
            retryCount++;
            log(`Waiting for Softr user data (attempt ${retryCount}/${MAX_RETRIES})`);
            setTimeout(waitForSoftrUser, RETRY_INTERVAL);
        } else {
            log('Max retries reached, no Softr user data found');
        }
    }
    
    // Update header span with user data
    function updateHeaderSpan(userData) {
        const headerSpan = document.getElementById('header-span');
        if (!headerSpan) return;
        
        try {
            // Set data attributes (using both bracket notation and dot notation for compatibility)
            headerSpan.setAttribute('data-user-email', userData.email || userData['email'] || '');
            headerSpan.setAttribute('data-user-name', userData.Name || userData['Name'] || userData['First Name'] || '');
            headerSpan.setAttribute('data-user-id', userData.User_ID || userData['User_ID'] || '');
            headerSpan.setAttribute('data-role-level', userData.IE_Role_Level || userData['IE_Role_Level'] || '');
            headerSpan.setAttribute('data-last-login', new Date().toISOString());
            
            log('Updated header span with user data');
            
            // Dispatch event for other scripts
            const event = new CustomEvent('header-span-updated', {
                detail: {
                    userId: userData.User_ID || userData['User_ID'],
                    email: userData.email || userData['email'],
                    name: userData.Name || userData['Name'] || userData['First Name'],
                    role: userData.IE_Role_Level || userData['IE_Role_Level']
                },
                bubbles: true
            });
            headerSpan.dispatchEvent(event);
        } catch (e) {
            log('Error updating header span', e);
        }
    }
    
    // Listen for manual update messages
    window.addEventListener('message', function(event) {
        // Only accept messages from allowed domains or same origin
        const allowedDomains = [
            window.location.origin,
            'https://integral-mothership.softr.app',
            'https://recursivelearning.app'
        ];
        
        if (!allowedDomains.includes(event.origin)) {
            return;
        }
        
        if (event.data && event.data.type === 'update-header-span') {
            log('Received update message', event.data);
            const userData = event.data.userData;
            if (userData) {
                updateHeaderSpan(userData);
            }
        }
    });
    
    // Export API for direct calls
    window.SoftrHeaderSpan = {
        update: function(userData) {
            updateHeaderSpan(userData);
        },
        getData: function() {
            const headerSpan = document.getElementById('header-span');
            if (!headerSpan) return null;
            
            return {
                userId: headerSpan.getAttribute('data-user-id'),
                email: headerSpan.getAttribute('data-user-email'),
                name: headerSpan.getAttribute('data-user-name'),
                role: headerSpan.getAttribute('data-role-level'),
                lastLogin: headerSpan.getAttribute('data-last-login')
            };
        },
        // TEMPORARY: Add bypass flag accessor
        isAuthBypassed: function() {
            return BYPASS_AUTH;
        }
    };
    
    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeaderSpan);
    } else {
        initHeaderSpan();
    }
})(); 