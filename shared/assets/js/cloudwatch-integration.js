/**
 * CloudWatch Integration Module for Recursive Learning Platform
 * 
 * Provides metrics, logging, and performance monitoring functionality
 * for frontend components with CloudWatch backend integration.
 */

// Configuration
const CLOUDWATCH_CONFIG = {
  API_ENDPOINT: '/api/v1/monitoring',
  ENABLED: true,
  LOG_LEVEL: 'info',  // debug, info, warn, error
  SAMPLE_RATE: 0.1,   // Only send 10% of metrics to reduce costs
  BATCH_INTERVAL: 30000, // Send metrics in batches every 30 seconds
  LOCAL_STORAGE_KEY: 'rl_cloudwatch_metrics_buffer'
};

// Metric buffer for batching
let metricsBuffer = [];
let logsBuffer = [];
let isInitialized = false;
let batchIntervalId = null;

// Load buffer from localStorage if available
try {
  const savedBuffer = localStorage.getItem(CLOUDWATCH_CONFIG.LOCAL_STORAGE_KEY);
  if (savedBuffer) {
    metricsBuffer = JSON.parse(savedBuffer);
  }
} catch (e) {
  console.error('Failed to load metrics buffer from localStorage:', e);
}

/**
 * Initialize the CloudWatch integration
 */
function init() {
  if (isInitialized) return;
  
  // Set up batch sending interval
  batchIntervalId = setInterval(sendBufferedMetrics, CLOUDWATCH_CONFIG.BATCH_INTERVAL);
  
  // Send metrics on page unload
  window.addEventListener('beforeunload', () => {
    if (metricsBuffer.length > 0) {
      // Save to localStorage in case send fails during unload
      try {
        localStorage.setItem(
          CLOUDWATCH_CONFIG.LOCAL_STORAGE_KEY, 
          JSON.stringify(metricsBuffer)
        );
      } catch (e) {
        console.error('Failed to save metrics buffer to localStorage:', e);
      }
      
      // Try to send synchronously before page unload
      sendBufferedMetrics(true);
    }
  });
  
  isInitialized = true;
  
  // Initial log
  log('CloudWatch integration initialized', { 
    userAgent: navigator.userAgent,
    url: window.location.href,
    referrer: document.referrer
  }, 'info');
}

/**
 * Record a custom metric
 * @param {string} name - Metric name
 * @param {number} value - Metric value
 * @param {string} unit - Metric unit (Count, Milliseconds, Bytes, etc.)
 * @param {Object} dimensions - Additional dimensions for the metric
 */
function recordMetric(name, value, unit = 'Count', dimensions = {}) {
  if (!CLOUDWATCH_CONFIG.ENABLED) return;
  
  // Apply sampling rate
  if (Math.random() > CLOUDWATCH_CONFIG.SAMPLE_RATE) return;
  
  // Initialize if not already done
  if (!isInitialized) init();
  
  // Add metric to buffer
  metricsBuffer.push({
    name,
    value,
    unit,
    dimensions,
    timestamp: new Date().toISOString()
  });
  
  // Send immediately if buffer gets too large
  if (metricsBuffer.length > 100) {
    sendBufferedMetrics();
  }
}

/**
 * Record timing for an operation
 * @param {string} name - Operation name
 * @param {Function} fn - Function to time (can be async)
 * @param {Object} dimensions - Additional dimensions for the metric
 * @returns {any} The result of the function call
 */
async function recordTiming(name, fn, dimensions = {}) {
  if (!CLOUDWATCH_CONFIG.ENABLED) return fn();
  
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    
    recordMetric(`${name}Duration`, duration, 'Milliseconds', dimensions);
    recordMetric(`${name}Success`, 1, 'Count', dimensions);
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    
    recordMetric(`${name}Duration`, duration, 'Milliseconds', dimensions);
    recordMetric(`${name}Error`, 1, 'Count', {
      ...dimensions,
      errorType: error.name,
      errorMessage: truncate(error.message, 100)
    });
    
    throw error;
  }
}

/**
 * Log an event to CloudWatch Logs
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 * @param {string} level - Log level (debug, info, warn, error)
 */
function log(message, data = {}, level = 'info') {
  // Skip logs below configured level
  const levels = ['debug', 'info', 'warn', 'error'];
  const configLevelIndex = levels.indexOf(CLOUDWATCH_CONFIG.LOG_LEVEL);
  const currentLevelIndex = levels.indexOf(level);
  
  if (currentLevelIndex < configLevelIndex) return;
  
  // Always log to console
  const consoleMethod = level === 'error' ? 'error' : 
                        level === 'warn' ? 'warn' : 
                        level === 'debug' ? 'debug' : 'log';
  
  console[consoleMethod](`[CloudWatch ${level}] ${message}`, data);
  
  if (!CLOUDWATCH_CONFIG.ENABLED) return;
  
  // Initialize if not already done
  if (!isInitialized) init();
  
  // Apply sampling except for errors
  if (level !== 'error' && Math.random() > CLOUDWATCH_CONFIG.SAMPLE_RATE) return;
  
  // Add log to buffer
  logsBuffer.push({
    message,
    data,
    level,
    timestamp: new Date().toISOString(),
    url: window.location.pathname,
    sessionId: getSessionId()
  });
  
  // Send logs immediately for errors or if buffer gets too large
  if (level === 'error' || logsBuffer.length > 20) {
    sendBufferedLogs();
  }
}

/**
 * Send buffered metrics to the CloudWatch API
 * @param {boolean} sync - Whether to send synchronously (for page unload)
 */
function sendBufferedMetrics(sync = false) {
  if (!CLOUDWATCH_CONFIG.ENABLED || metricsBuffer.length === 0) return;
  
  const metrics = [...metricsBuffer];
  metricsBuffer = [];
  
  try {
    // Clear localStorage
    localStorage.removeItem(CLOUDWATCH_CONFIG.LOCAL_STORAGE_KEY);
    
    // Add client info to each metric
    const enhancedMetrics = metrics.map(metric => ({
      ...metric,
      clientId: getClientId(),
      projectId: getProjectId(),
      url: window.location.pathname,
      userAgent: navigator.userAgent
    }));
    
    // Send to API
    fetch(`${CLOUDWATCH_CONFIG.API_ENDPOINT}/metrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        metrics: enhancedMetrics
      }),
      // Use keepalive for unload events
      keepalive: sync
    }).catch(error => {
      console.error('Failed to send metrics to CloudWatch:', error);
      // Re-add to buffer on failure
      metricsBuffer.push(...metrics);
    });
  } catch (error) {
    console.error('Error preparing metrics for CloudWatch:', error);
    // Re-add to buffer on failure
    metricsBuffer.push(...metrics);
  }
}

/**
 * Send buffered logs to the CloudWatch API
 * @param {boolean} sync - Whether to send synchronously (for page unload)
 */
function sendBufferedLogs() {
  if (!CLOUDWATCH_CONFIG.ENABLED || logsBuffer.length === 0) return;
  
  const logs = [...logsBuffer];
  logsBuffer = [];
  
  try {
    // Add client info to each log
    const enhancedLogs = logs.map(log => ({
      ...log,
      clientId: getClientId(),
      projectId: getProjectId()
    }));
    
    // Send to API
    fetch(`${CLOUDWATCH_CONFIG.API_ENDPOINT}/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        logs: enhancedLogs
      }),
      // Use keepalive for error logs to ensure delivery
      keepalive: true
    }).catch(error => {
      console.error('Failed to send logs to CloudWatch:', error);
      // Re-add to buffer on failure
      logsBuffer.push(...logs);
    });
  } catch (error) {
    console.error('Error preparing logs for CloudWatch:', error);
    // Re-add to buffer on failure
    logsBuffer.push(...logs);
  }
}

/**
 * Get the client ID from the URL or session storage
 * @returns {string} Client ID
 */
function getClientId() {
  // Try to get from URL first
  const path = window.location.pathname;
  const urlMatch = path.match(/\/clients\/([^\/]+)/);
  
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }
  
  // Fall back to session storage
  return sessionStorage.getItem('clientId') || 'unknown';
}

/**
 * Get the project ID from the URL or session storage
 * @returns {string} Project ID
 */
function getProjectId() {
  // Try to get from URL first
  const path = window.location.pathname;
  const urlMatch = path.match(/\/projects\/([^\/]+)/);
  
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }
  
  // Fall back to session storage
  return sessionStorage.getItem('projectId') || 'unknown';
}

/**
 * Get a unique session ID for this browsing session
 * @returns {string} Session ID
 */
function getSessionId() {
  let sessionId = sessionStorage.getItem('rl_session_id');
  
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('rl_session_id', sessionId);
  }
  
  return sessionId;
}

/**
 * Truncate a string to a maximum length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
function truncate(str, maxLength) {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}

// Export public API
export {
  init,
  recordMetric,
  recordTiming,
  log
}; 