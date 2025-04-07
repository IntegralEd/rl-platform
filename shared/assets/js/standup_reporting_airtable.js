/**
 * Standup Reporting Airtable Integration
 * 
 * Direct implementation for writing standup reports to Airtable via the backend API.
 * Handles authentication, formatting, and error reporting for Airtable operations.
 */

import { secureFetch } from './api-client.js';
import { log } from './cloudwatch-integration.js';

// Configuration
const AIRTABLE_CONFIG = {
  API_ENDPOINT: '/api/v1/airtable',
  STANDUP_TABLE_ID: 'tblNfEQbQINXSN8C6',
  STANDUP_VIEW_ID: 'viwIwhW0J7LWD4wNo',
  FRONTEND_CURSOR_TAG: 'frontend_cursor',
  BACKEND_CURSOR_TAG: 'backend_cursor'
};

/**
 * Enhanced fetch for Airtable operations with proper authentication
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} Response data
 */
async function airtableFetch(endpoint, options = {}) {
  // Ensure headers exist
  if (!options.headers) {
    options.headers = {};
  }
  
  // Add Airtable-specific headers
  options.headers['X-Team'] = 'frontend';
  options.headers['X-Airtable-Access'] = 'standup-reports';
  options.headers['X-Resource-Type'] = 'standup';
  
  // Add client info if available from URL
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = urlParams.get('client_id');
    if (clientId) {
      options.headers['X-Client-ID'] = clientId;
    }
  } catch (e) {
    // Ignore URL parsing errors
  }
  
  // Set content type if sending data
  if (options.body) {
    options.headers['Content-Type'] = 'application/json';
  }
  
  const fullEndpoint = `${AIRTABLE_CONFIG.API_ENDPOINT}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  
  try {
    log('Making Airtable API request', { 
      endpoint: fullEndpoint, 
      method: options.method || 'GET' 
    }, 'debug');
    
    const response = await secureFetch(fullEndpoint, options);
    return response;
  } catch (error) {
    log('Airtable API request failed', { 
      endpoint: fullEndpoint,
      error: error.message,
      status: error.status
    }, 'error');
    
    throw error;
  }
}

/**
 * Format a standup report for Airtable submission
 * @param {Object} report - Standup report data 
 * @param {string} status - Report status (Drafted, Completed, In Progress)
 * @returns {Object} Airtable-formatted record
 */
function formatReport(report, status = 'Drafted') {
  // Create default title with date and version
  const defaultDate = report.date || new Date().toISOString().split('T')[0];
  const defaultVersion = report.reportNumber || 1;
  const defaultTitle = `Front End Standup ${defaultDate} v${String(defaultVersion).padStart(2, '0')}`;
  
  return {
    fields: {
      Title: report.title || defaultTitle,
      Date: report.date || defaultDate,
      Team: 'Frontend Cursor',
      Reporter: report.reporter || 'Cursor AI',
      Summary: report.summary || '',
      Status: status,
      'Current Features': report.currentFeatures || [],
      'Completed Tasks': report.completedTasks || [],
      'Test Results': report.testResults || [],
      'Challenges': report.challenges || [],
      'Next Steps': report.nextSteps || [],
      'Future Integrations': report.futureIntegrations || [],
      'CTO Review': report.ctoReview || '',
      'Report Number': report.reportNumber || 1,
      'Branch': report.branch || 'backend-integration',
      Tags: [AIRTABLE_CONFIG.FRONTEND_CURSOR_TAG]
    }
  };
}

/**
 * Extract standup report data from MDC content
 * @param {string} mdcContent - MDC file content
 * @returns {Object} Structured report data
 */
function parseReportMdc(mdcContent) {
  if (!mdcContent) {
    throw new Error('MDC content is empty');
  }
  
  const report = {
    title: '',
    date: '',
    summary: '',
    currentFeatures: [],
    completedTasks: [],
    testResults: [],
    challenges: [],
    nextSteps: [],
    futureIntegrations: [],
    ctoReview: '',
    reportNumber: 1,
    branch: 'backend-integration'
  };
  
  // Extract title and report number
  const titleMatch = mdcContent.match(/^#\s+(.*?)(?:\s+-\s+(.*))?$/m);
  if (titleMatch) {
    report.title = titleMatch[1].trim();
    
    // Try to extract report number from title
    const numberMatch = report.title.match(/(\d+)$/);
    if (numberMatch) {
      report.reportNumber = parseInt(numberMatch[1], 10);
    }
    
    // Try to extract date if present in title
    const dateMatch = titleMatch[2] ? titleMatch[2].trim() : '';
    if (dateMatch) {
      try {
        // Attempt to parse date like "April 7" to ISO format
        const parsedDate = new Date(dateMatch);
        if (!isNaN(parsedDate.getTime())) {
          report.date = parsedDate.toISOString().split('T')[0];
        }
      } catch (e) {
        // Ignore date parsing errors
      }
    }
  }
  
  // Extract summary section
  const summaryMatch = mdcContent.match(/##\s+Summary\s+(.*?)(?=##|\n$)/s);
  if (summaryMatch) {
    report.summary = summaryMatch[1].trim();
  }
  
  // Extract current features
  const featuresMatch = mdcContent.match(/##\s+Current Build Features\s+(.*?)(?=##|\n$)/s);
  if (featuresMatch) {
    report.currentFeatures = featuresMatch[1]
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s+/, '').trim());
  }
  
  // Extract completed tasks
  const tasksMatch = mdcContent.match(/##\s+Completed Tasks\s+(.*?)(?=##|\n$)/s);
  if (tasksMatch) {
    report.completedTasks = tasksMatch[1]
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s+/, '').trim());
  }
  
  // Extract test results
  const testsMatch = mdcContent.match(/##\s+Test Results\s+(.*?)(?=##|\n$)/s);
  if (testsMatch) {
    report.testResults = testsMatch[1]
      .split('\n')
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
      .map(line => line.replace(/^[-*]\s+/, '').trim());
  }
  
  // Extract next steps
  const nextStepsMatch = mdcContent.match(/##\s+Next Steps\s+(.*?)(?=##|\n$)/s);
  if (nextStepsMatch) {
    report.nextSteps = nextStepsMatch[1]
      .split('\n')
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
      .map(line => line.replace(/^[-*]\s+/, '').trim());
  }
  
  // Extract future integrations
  const integrationsMatch = mdcContent.match(/##\s+Future Integrations\s+(.*?)(?=##|\n$)/s);
  if (integrationsMatch) {
    report.futureIntegrations = integrationsMatch[1]
      .split('\n')
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
      .map(line => line.replace(/^[-*]\s+/, '').trim());
  }
  
  // Extract CTO review
  const ctoMatch = mdcContent.match(/##\s+CTO Review\s+(.*?)(?=##|\n$)/s);
  if (ctoMatch) {
    report.ctoReview = ctoMatch[1].trim();
  }
  
  return report;
}

/**
 * Submit a standup report to Airtable
 * @param {string} mdcPath - Path to the MDC file
 * @param {string} status - Status to set (Drafted, Completed, In Progress)
 * @returns {Promise<Object>} Result of submission
 */
async function submitReport(mdcPath, status = 'Drafted') {
  try {
    // Fetch MDC content
    log('Fetching MDC content', { path: mdcPath }, 'info');
    const response = await fetch(mdcPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch MDC file: ${response.status} ${response.statusText}`);
    }
    
    const mdcContent = await response.text();
    
    // Parse and format the report
    const reportData = parseReportMdc(mdcContent);
    const formattedReport = formatReport(reportData, status);
    
    log('Submitting report to Airtable', { 
      title: formattedReport.fields.Title,
      status: formattedReport.fields.Status
    }, 'info');
    
    // Submit to Airtable
    const result = await airtableFetch('/records', {
      method: 'POST',
      body: JSON.stringify({
        tableId: AIRTABLE_CONFIG.STANDUP_TABLE_ID,
        records: [formattedReport]
      })
    });
    
    if (!result || !result.records || !result.records[0]) {
      throw new Error('Invalid response from Airtable API');
    }
    
    const recordId = result.records[0].id;
    log('Report submitted successfully', { recordId }, 'info');
    
    return {
      success: true,
      recordId,
      report: reportData
    };
  } catch (error) {
    log('Failed to submit report', { error: error.message }, 'error');
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Update a report's status in Airtable
 * @param {string} recordId - Airtable record ID 
 * @param {string} newStatus - New status to set
 * @returns {Promise<Object>} Result of update
 */
async function updateStatus(recordId, newStatus) {
  if (!recordId) {
    return { success: false, error: 'Record ID is required' };
  }
  
  try {
    log('Updating report status', { recordId, newStatus }, 'info');
    
    const result = await airtableFetch(`/records/${recordId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        tableId: AIRTABLE_CONFIG.STANDUP_TABLE_ID,
        fields: {
          Status: newStatus
        }
      })
    });
    
    if (!result || !result.id) {
      throw new Error('Invalid response from Airtable API');
    }
    
    log('Status updated successfully', { recordId, status: newStatus }, 'info');
    
    return {
      success: true,
      recordId: result.id
    };
  } catch (error) {
    log('Failed to update status', { error: error.message, recordId }, 'error');
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Diagnose Airtable connectivity issues
 * @returns {Promise<Object>} Diagnostic information
 */
async function diagnoseConnection() {
  const diagnostic = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    apiEndpoint: AIRTABLE_CONFIG.API_ENDPOINT,
    tableId: AIRTABLE_CONFIG.STANDUP_TABLE_ID,
    status: 'pending',
    authed: false,
    headers: {}
  };
  
  try {
    // Check for authentication
    const testHeaders = {};
    const apiClient = await import('./api-client.js');
    apiClient.addAuthHeaders(testHeaders);
    
    diagnostic.headers = Object.keys(testHeaders);
    diagnostic.authed = !!(testHeaders['X-API-Key'] || testHeaders['X-Session-Token']);
    
    // Attempt a ping request
    const pingResult = await airtableFetch('/ping', { method: 'GET' });
    diagnostic.status = pingResult.status || 'successful';
    diagnostic.pingResponse = pingResult;
    
    return diagnostic;
  } catch (error) {
    diagnostic.status = 'failed';
    diagnostic.error = error.message;
    
    return diagnostic;
  }
}

/**
 * Complete standup reporting workflow
 * @param {string} mdcPath - Path to MDC file
 * @returns {Promise<Object>} Workflow result
 */
async function completeReportingWorkflow(mdcPath) {
  try {
    // First submit as Drafted
    const submitResult = await submitReport(mdcPath, 'Drafted');
    if (!submitResult.success) {
      return {
        success: false,
        stage: 'submit',
        error: submitResult.error
      };
    }
    
    log('Initial report submission successful', { recordId: submitResult.recordId }, 'info');
    
    // Then update to Completed (normally would be done after Slack notification)
    const updateResult = await updateStatus(submitResult.recordId, 'Completed');
    if (!updateResult.success) {
      return {
        success: false,
        stage: 'update',
        error: updateResult.error,
        recordId: submitResult.recordId
      };
    }
    
    return {
      success: true,
      recordId: submitResult.recordId,
      report: submitResult.report
    };
  } catch (error) {
    log('Workflow failed', { error: error.message }, 'error');
    return {
      success: false,
      stage: 'workflow',
      error: error.message
    };
  }
}

// Export public API
export {
  submitReport,
  updateStatus,
  diagnoseConnection,
  parseReportMdc,
  formatReport,
  completeReportingWorkflow,
  AIRTABLE_CONFIG
}; 