/**
 * EL Education Platform Security Module
 * Version: 1.0.0
 * Last Updated: 04.15.2024
 * 
 * This module provides client-level security features including:
 * - CORS validation
 * - Embed protection
 * - Frame ancestor checking
 * - Domain validation
 */

// Allowed domains for CORS and embedding
const ALLOWED_DOMAINS = [
    'recursivelearning.app',
    'localhost',
    '127.0.0.1',
    'integral-ed.com'
];

// Allowed paths for embedding
const ALLOWED_PATHS = [
    '/clients/elpl/',
    '/shared/platform/'
];

class ELPLSecurity {
    constructor() {
        this.initialized = false;
        this.securityLog = [];
        
        // Initialize security checks
        this.init();
    }
    
    init() {
        try {
            console.log('[ELPL Security] Initializing security module...');
            
            // Run security checks
            this.validateOrigin();
            this.validateEmbedding();
            this.validateFrameAncestors();
            
            // Set initialization flag
            this.initialized = true;
            console.log('[ELPL Security] Security module initialized');
            
        } catch (error) {
            console.error('[ELPL Security] Initialization failed:', error);
            this.logSecurityEvent('INIT_FAILED', error.message);
        }
    }
    
    validateOrigin() {
        const currentOrigin = window.location.origin;
        const isAllowedOrigin = ALLOWED_DOMAINS.some(domain => 
            currentOrigin.includes(domain)
        );
        
        if (!isAllowedOrigin) {
            const error = new Error(`Invalid origin: ${currentOrigin}`);
            this.logSecurityEvent('INVALID_ORIGIN', error.message);
            throw error;
        }
        
        console.log('[ELPL Security] Origin validated:', currentOrigin);
    }
    
    validateEmbedding() {
        // Check if page is embedded
        if (window.self !== window.top) {
            const parentOrigin = document.referrer;
            const isAllowedParent = ALLOWED_DOMAINS.some(domain => 
                parentOrigin.includes(domain)
            );
            
            if (!isAllowedParent) {
                const error = new Error(`Invalid parent frame: ${parentOrigin}`);
                this.logSecurityEvent('INVALID_EMBEDDING', error.message);
                throw error;
            }
        }
        
        console.log('[ELPL Security] Embedding validated');
    }
    
    validateFrameAncestors() {
        // Add CSP header for frame-ancestors
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = `frame-ancestors ${ALLOWED_DOMAINS.map(d => `https://*.${d}`).join(' ')}`;
        document.head.appendChild(meta);
        
        console.log('[ELPL Security] Frame ancestors policy set');
    }
    
    logSecurityEvent(type, message) {
        const event = {
            type,
            message,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };
        
        this.securityLog.push(event);
        console.warn('[ELPL Security Event]', event);
    }
    
    static validateResourcePath(path) {
        return ALLOWED_PATHS.some(allowedPath => 
            path.startsWith(allowedPath)
        );
    }
}

// Initialize security module
const security = new ELPLSecurity();

// Export for module usage
export { ELPLSecurity, security as default }; 