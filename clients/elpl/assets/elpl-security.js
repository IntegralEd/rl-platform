/**
 * EL Education Platform Security Module
 * Version: 1.0.0
 * Last Updated: 04.15.2024
 * 
 * MVP Testing Mode: All traffic allowed
 * Note: Proper security validation will be implemented in v1.0.16
 */

// Development configuration - MVP testing
const CONFIG = {
    MVP_MODE: true,  // Set to true for MVP testing
    LOG_ONLY: true   // Only log security events, don't block
};

// Allowed domains for CORS and embedding (for future use)
const ALLOWED_DOMAINS = [
    'recursivelearning.app',
    'localhost',
    '127.0.0.1',
    'integral-ed.com',
    '*' // Allow all during MVP
];

// Allowed paths for embedding (for future use)
const ALLOWED_PATHS = [
    '/clients/elpl/',
    '/shared/platform/',
    '*' // Allow all during MVP
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
            console.log('[ELPL Security] Initializing security module (MVP Testing Mode)...');
            
            if (!CONFIG.MVP_MODE) {
                // Run security checks when not in MVP mode
                this.validateOrigin();
                this.validateEmbedding();
                this.validateFrameAncestors();
            } else {
                // Log but don't enforce in MVP mode
                this.logSecurityState();
            }
            
            // Set initialization flag
            this.initialized = true;
            console.log('[ELPL Security] Security module initialized (MVP Mode: validation disabled)');
            
        } catch (error) {
            console.warn('[ELPL Security] Initialization warning:', error);
            this.logSecurityEvent('INIT_WARNING', error.message);
        }
    }
    
    logSecurityState() {
        const currentOrigin = window.location.origin;
        const isEmbedded = window.self !== window.top;
        
        console.log('[ELPL Security] MVP Testing Mode Active');
        console.log('[ELPL Security] Origin:', currentOrigin);
        console.log('[ELPL Security] Embedded:', isEmbedded);
        console.log('[ELPL Security] Note: Security validation will be implemented in v1.0.16');
        
        this.logSecurityEvent('MVP_MODE', 'Security validation disabled for testing');
    }
    
    validateOrigin() {
        if (CONFIG.MVP_MODE) return true;
        // Original validation code preserved for future use
        const currentOrigin = window.location.origin;
        const isAllowedOrigin = ALLOWED_DOMAINS.some(domain => 
            currentOrigin.includes(domain)
        );
        
        if (!isAllowedOrigin && !CONFIG.LOG_ONLY) {
            const error = new Error(`Invalid origin: ${currentOrigin}`);
            this.logSecurityEvent('INVALID_ORIGIN', error.message);
            throw error;
        }
        
        console.log('[ELPL Security] Origin logged:', currentOrigin);
        return true;
    }
    
    validateEmbedding() {
        if (CONFIG.MVP_MODE) return true;
        // Original embedding validation preserved for future use
        if (window.self !== window.top) {
            const parentOrigin = document.referrer;
            const isAllowedParent = ALLOWED_DOMAINS.some(domain => 
                parentOrigin.includes(domain)
            );
            
            if (!isAllowedParent && !CONFIG.LOG_ONLY) {
                const error = new Error(`Invalid parent frame: ${parentOrigin}`);
                this.logSecurityEvent('INVALID_EMBEDDING', error.message);
                throw error;
            }
        }
        
        console.log('[ELPL Security] Embedding logged');
        return true;
    }
    
    validateFrameAncestors() {
        if (CONFIG.MVP_MODE) return true;
        // Original frame ancestors code preserved for future use
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = 'frame-ancestors *'; // Allow all during MVP
        document.head.appendChild(meta);
        
        console.log('[ELPL Security] Frame ancestors policy set to allow all (MVP Mode)');
        return true;
    }
    
    logSecurityEvent(type, message) {
        const event = {
            type,
            message,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            mvpMode: CONFIG.MVP_MODE
        };
        
        this.securityLog.push(event);
        console.log('[ELPL Security Event]', event);
    }
    
    static validateResourcePath(path) {
        if (CONFIG.MVP_MODE) return true;
        return ALLOWED_PATHS.some(allowedPath => 
            path.startsWith(allowedPath) || allowedPath === '*'
        );
    }
}

// Initialize security module
const security = new ELPLSecurity();

// Export for module usage
export { ELPLSecurity, security as default }; 