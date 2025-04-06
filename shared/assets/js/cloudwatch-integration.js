/**
 * CloudWatch Integration for Recursive Learning Platform
 * 
 * Provides client-side metrics and logging to AWS CloudWatch
 */

import { secureFetch, getClientIdFromUrl, getPageType } from './api-client.js';

// Configuration
const CW_CONFIG = {
  METRICS_ENDPOINT: '/api/v1/metrics',
  LOG_ENDPOINT: '/api/v1/logs',
  BATCH_SIZE: 10,
  FLUSH_INTERVAL: 30000, // 30 seconds
  DEFAULT_NAMESPACE: 'RecursiveLearning/Frontend',
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  DEBUG: false
};

// Queues for metrics and logs
const metricsQueue = [];
const logsQueue = [];

// Timer for flushing queues
let flushTimer = null;

// Initialize the module
function init() {
  // Start the flush timer
  flushTimer = setInterval(flushAll, CW_CONFIG.FLUSH_INTERVAL);
  
  // Add window unload handler to flush remaining metrics
  window.addEventListener('beforeunload', () => {
    clearInterval(flushTimer);
    flushAll(true);
  });
  
  // Add error handlers
  window.addEventListener('error', captureError);
  window.addEventListener('unhandledrejection', capturePromiseError);
  
  debug('CloudWatch integration initialized');
}

/**
 * Log a message to CloudWatch Logs
 * @param {string} message - Log message
 * @param {Object} additionalData - Additional data to include in the log
 * @param {string} logLevel - Log level (error, warn, info, debug)
 */
function log(message, additionalData = {}, logLevel = 'info') {
  const logEntry = {
    timestamp: new Date().toISOString(),
    message,
    level: logLevel,
    client_id: getClientIdFromUrl(),
    page_type: getPageType(),
    url: window.location.href,
    user_agent: navigator.userAgent,
    ...additionalData
  };
  
  logsQueue.push(logEntry);
  
  // Auto-flush if queue is full
  if (logsQueue.length >= CW_CONFIG.BATCH_SIZE) {
    flushLogs();
  }
  
  // Also output to console for debugging
  if (CW_CONFIG.DEBUG) {
    console[logLevel](`[CloudWatch] ${message}`, additionalData);
  }
}

/**
 * Log an error to CloudWatch Logs
 * @param {Error|string} error - Error object or message
 * @param {Object} additionalData - Additional data to include in the log
 */
function logError(error, additionalData = {}) {
  const errorDetails = error instanceof Error ? {
    name: error.name,
    message: error.message,
    stack: error.stack
  } : { message: String(error) };
  
  log(
    errorDetails.message || 'An error occurred',
    { ...errorDetails, ...additionalData },
    'error'
  );
}

/**
 * Capture browser errors
 * @param {ErrorEvent} event - Error event
 */
function captureError(event) {
  logError(event.error || new Error(event.message), {
    source: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    auto_captured: true
  });
}

/**
 * Capture unhandled promise rejections
 * @param {PromiseRejectionEvent} event - Promise rejection event
 */
function capturePromiseError(event) {
  logError(event.reason || new Error('Unhandled promise rejection'), {
    auto_captured: true,
    is_promise_rejection: true
  });
}

/**
 * Record a metric to CloudWatch Metrics
 * @param {string} name - Metric name
 * @param {number} value - Metric value
 * @param {string} unit - Metric unit (Count, Milliseconds, Bytes, etc.)
 * @param {Object} dimensions - Metric dimensions
 * @param {string} namespace - Custom namespace to use (optional)
 */
function recordMetric(name, value, unit = 'Count', dimensions = {}, namespace = CW_CONFIG.DEFAULT_NAMESPACE) {
  // Add default dimensions
  const allDimensions = {
    ClientId: getClientIdFromUrl(),
    PageType: getPageType(),
    ...dimensions
  };
  
  const metric = {
    MetricName: name,
    Value: value,
    Unit: unit,
    Dimensions: Object.entries(allDimensions).map(([key, value]) => ({
      Name: key,
      Value: String(value)
    })),
    Timestamp: new Date().toISOString(),
    Namespace: namespace
  };
  
  metricsQueue.push(metric);
  
  // Auto-flush if queue is full
  if (metricsQueue.length >= CW_CONFIG.BATCH_SIZE) {
    flushMetrics();
  }
  
  debug(`Recorded metric: ${name} = ${value} ${unit}`, dimensions);
}

/**
 * Record a timing metric (in milliseconds)
 * @param {string} name - Metric name
 * @param {Function} fn - Function to time
 * @param {Object} dimensions - Additional dimensions
 * @returns {Promise<any>} Result of the function
 */
async function recordTiming(name, fn, dimensions = {}) {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    const duration = performance.now() - start;
    recordMetric(name, duration, 'Milliseconds', dimensions);
  }
}

/**
 * Setup performance monitoring for a page load
 */
function setupPageLoadMetrics() {
  // Wait for the page to fully load
  window.addEventListener('load', () => {
    // Get performance timing metrics
    const performance = window.performance;
    
    if (performance && performance.timing) {
      const timing = performance.timing;
      
      // Record various page load timings
      recordMetric('PageLoadTime', 
        timing.loadEventEnd - timing.navigationStart, 
        'Milliseconds'
      );
      
      recordMetric('DomLoadTime', 
        timing.domComplete - timing.domLoading, 
        'Milliseconds'
      );
      
      recordMetric('NetworkLatency', 
        timing.responseEnd - timing.fetchStart, 
        'Milliseconds'
      );
      
      recordMetric('DomainLookupTime', 
        timing.domainLookupEnd - timing.domainLookupStart, 
        'Milliseconds'
      );
      
      recordMetric('ServerResponseTime', 
        timing.responseEnd - timing.requestStart, 
        'Milliseconds'
      );
    }
    
    // Report resource timings
    if (performance && performance.getEntriesByType) {
      const resources = performance.getEntriesByType('resource');
      
      // Count resources by type
      const resourceTypes = {};
      resources.forEach(resource => {
        const type = resource.initiatorType || 'other';
        resourceTypes[type] = (resourceTypes[type] || 0) + 1;
      });
      
      // Record counts
      Object.entries(resourceTypes).forEach(([type, count]) => {
        recordMetric(`ResourceCount`, count, 'Count', { ResourceType: type });
      });
      
      // Record total resources
      recordMetric('TotalResources', resources.length, 'Count');
    }
  });
}

/**
 * Flush metrics queue to CloudWatch
 * @param {boolean} sync - Whether to flush synchronously (default: false)
 * @returns {Promise<boolean>} Success status
 */
async function flushMetrics(sync = false) {
  if (metricsQueue.length === 0) {
    return true;
  }
  
  // Get metrics to send
  const metrics = [...metricsQueue];
  metricsQueue.length = 0;
  
  try {
    const options = {
      method: 'POST',
      body: JSON.stringify({ metrics }),
    };
    
    if (sync) {
      options.keepalive = true;
    }
    
    // Send metrics
    await sendWithRetry(CW_CONFIG.METRICS_ENDPOINT, options);
    debug(`Flushed ${metrics.length} metrics`);
    return true;
  } catch (error) {
    console.error('Error sending metrics to CloudWatch:', error);
    
    // Put metrics back in queue on failure
    metricsQueue.unshift(...metrics);
    return false;
  }
}

/**
 * Flush logs queue to CloudWatch Logs
 * @param {boolean} sync - Whether to flush synchronously (default: false)
 * @returns {Promise<boolean>} Success status
 */
async function flushLogs(sync = false) {
  if (logsQueue.length === 0) {
    return true;
  }
  
  // Get logs to send
  const logs = [...logsQueue];
  logsQueue.length = 0;
  
  try {
    const options = {
      method: 'POST',
      body: JSON.stringify({ logs }),
    };
    
    if (sync) {
      options.keepalive = true;
    }
    
    // Send logs
    await sendWithRetry(CW_CONFIG.LOG_ENDPOINT, options);
    debug(`Flushed ${logs.length} logs`);
    return true;
  } catch (error) {
    console.error('Error sending logs to CloudWatch:', error);
    
    // Put logs back in queue on failure
    logsQueue.unshift(...logs);
    return false;
  }
}

/**
 * Flush all queues
 * @param {boolean} sync - Whether to flush synchronously (default: false)
 * @returns {Promise<boolean>} Success status
 */
async function flushAll(sync = false) {
  const metricsSuccess = await flushMetrics(sync);
  const logsSuccess = await flushLogs(sync);
  return metricsSuccess && logsSuccess;
}

/**
 * Send data to an endpoint with retry logic
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} API response
 */
async function sendWithRetry(endpoint, options, retries = 0) {
  try {
    return await secureFetch(endpoint, options);
  } catch (error) {
    if (retries < CW_CONFIG.MAX_RETRIES) {
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, CW_CONFIG.RETRY_DELAY));
      
      // Increase delay for next retry (exponential backoff)
      CW_CONFIG.RETRY_DELAY *= 2;
      
      // Retry
      return sendWithRetry(endpoint, options, retries + 1);
    }
    
    // Max retries exceeded
    throw error;
  }
}

/**
 * Debug logging
 * @param {string} message - Debug message
 * @param {any} data - Optional data to log
 */
function debug(message, data) {
  if (CW_CONFIG.DEBUG) {
    if (data) {
      console.debug(`[CloudWatch] ${message}`, data);
    } else {
      console.debug(`[CloudWatch] ${message}`);
    }
  }
}

// Export public API
export {
  init,
  log,
  logError,
  recordMetric,
  recordTiming,
  setupPageLoadMetrics,
  flushAll
}; 