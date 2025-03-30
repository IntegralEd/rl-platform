// Debug logging for page loading
console.log('Debug: Page Load', {
    url: window.location.href,
    pathname: window.location.pathname,
    hostname: window.location.hostname,
    timestamp: new Date().toISOString()
});

// Log all resource loading attempts
document.addEventListener('DOMContentLoaded', () => {
    console.log('Debug: DOM Loaded', {
        title: document.title,
        scripts: Array.from(document.scripts).map(s => s.src),
        styles: Array.from(document.styleSheets).map(s => s.href),
        timestamp: new Date().toISOString()
    });
});

// Log 404s
window.addEventListener('error', (e) => {
    if (e.target.tagName === 'LINK' || e.target.tagName === 'SCRIPT' || e.target.tagName === 'IMG') {
        console.log('Debug: Resource 404', {
            element: e.target.tagName,
            src: e.target.src || e.target.href,
            path: window.location.pathname,
            timestamp: new Date().toISOString()
        });
    }
}, true); 