/**
 * Standup Report Publisher
 * 
 * Demonstration script that publishes frontend standup reports to Airtable,
 * implementing the bidirectional reporting system shared with the backend team.
 * 
 * Usage: Include this script in your HTML and call publishLatestReport() from the console
 * or a button click to publish the most recent standup report.
 */

import { submitReport, updateStatus, completeReportingWorkflow, diagnoseConnection } from './standup_reporting_airtable.js';
import { log } from './cloudwatch-integration.js';

// Configuration for report discovery
const REPORT_CONFIG = {
  REPORT_PATH: '/shared/docs/standup-reports/',
  LATEST_PATTERN: /frontend-standup-(\d+)\.mdc$/,
  SLACK_NOTIFICATION: true
};

/**
 * Find the latest standup report file
 * @returns {Promise<string>} Path to the latest report
 */
async function findLatestReport() {
  try {
    // In a real environment, we would scan the directory
    // For now, we'll use a fetch to get a directory listing or implement a simple version
    
    // Simple version with known report
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '-');
    const reportPath = `${REPORT_CONFIG.REPORT_PATH}april-7-frontend-standup-01.mdc`;
    
    // Check if file exists
    try {
      const response = await fetch(reportPath, { method: 'HEAD' });
      if (response.ok) {
        return reportPath;
      }
    } catch (e) {
      // File doesn't exist or can't be accessed
    }
    
    // Alternative approach - could scan a directory listing
    console.warn('Could not find latest report automatically');
    return prompt('Please enter the path to the standup report:', `${REPORT_CONFIG.REPORT_PATH}april-7-frontend-standup-01.mdc`);
  } catch (error) {
    console.error('Error finding latest report:', error);
    throw error;
  }
}

/**
 * Notify Slack about published report (placeholder)
 * @param {Object} reportData - The published report data
 * @param {string} recordId - Airtable record ID
 * @returns {Promise<Object>} Notification result
 */
async function notifySlack(reportData, recordId) {
  try {
    log('Would notify Slack about published report', { 
      title: reportData.title,
      recordId: recordId
    }, 'info');
    
    // In a real implementation, this would call the Slack webhook
    console.log('🔔 Slack notification would be sent for:', reportData.title);
    
    return {
      success: true,
      notified: true
    };
  } catch (error) {
    console.error('Failed to notify Slack:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Complete publishing workflow with Slack notification
 * @param {string} reportPath - Path to the report MDC file
 * @returns {Promise<Object>} Workflow result
 */
async function publishWithNotification(reportPath) {
  try {
    log('Starting full publish workflow', { reportPath }, 'info');
    
    // Show status in console
    console.log('🔄 Publishing report to Airtable...');
    
    // First submit to Airtable as Drafted
    const submitResult = await submitReport(reportPath, 'Drafted');
    if (!submitResult.success) {
      console.error('❌ Failed to submit report:', submitResult.error);
      return submitResult;
    }
    
    console.log('✅ Report submitted to Airtable with ID:', submitResult.recordId);
    
    // Notify Slack if enabled
    if (REPORT_CONFIG.SLACK_NOTIFICATION) {
      console.log('🔄 Sending Slack notification...');
      await notifySlack(submitResult.report, submitResult.recordId);
    }
    
    // Update status to Completed
    console.log('🔄 Updating report status to Completed...');
    const updateResult = await updateStatus(submitResult.recordId, 'Completed');
    if (!updateResult.success) {
      console.error('❌ Failed to update status:', updateResult.error);
      return {
        success: false,
        stage: 'status_update',
        error: updateResult.error,
        recordId: submitResult.recordId
      };
    }
    
    console.log('✅ Report status updated to Completed');
    
    // Success!
    console.log('🎉 Publish workflow completed successfully!');
    console.log('Report:', submitResult.report.title);
    console.log('Record ID:', submitResult.recordId);
    
    return {
      success: true,
      recordId: submitResult.recordId,
      report: submitResult.report
    };
  } catch (error) {
    console.error('❌ Publish workflow failed:', error);
    return {
      success: false,
      stage: 'workflow',
      error: error.message
    };
  }
}

/**
 * Run diagnostics and show results in console
 * @returns {Promise<Object>} Diagnostic results
 */
async function runDiagnostics() {
  console.log('🔍 Running Airtable connection diagnostics...');
  
  try {
    const results = await diagnoseConnection();
    
    console.log('==== Airtable Diagnostics ====');
    console.log('API Endpoint:', results.apiEndpoint);
    console.log('Table ID:', results.tableId);
    console.log('Authenticated:', results.authed ? '✅ Yes' : '❌ No');
    console.log('Status:', results.status);
    
    if (results.status === 'failed') {
      console.error('❌ Connection test failed:', results.error);
    } else if (!results.authed) {
      console.warn('⚠️ Not properly authenticated for Airtable');
    } else {
      console.log('✅ Connection test passed');
    }
    
    return results;
  } catch (error) {
    console.error('❌ Diagnostics failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Publish the latest standup report (main function to call)
 * @returns {Promise<Object>} Result of publishing
 */
async function publishLatestReport() {
  try {
    // Run diagnostics first
    const diagnostics = await runDiagnostics();
    if (diagnostics.status === 'failed' || !diagnostics.authed) {
      if (!confirm('Diagnostics indicate issues with Airtable connection. Continue anyway?')) {
        return { success: false, cancelled: true };
      }
    }
    
    // Find the latest report
    const reportPath = await findLatestReport();
    if (!reportPath) {
      return { success: false, error: 'No report file found' };
    }
    
    // Publish report
    return await publishWithNotification(reportPath);
  } catch (error) {
    console.error('Failed to publish latest report:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Export public API
export {
  publishLatestReport,
  runDiagnostics,
  findLatestReport
};

// If running as a script
if (typeof document !== 'undefined') {
  // Add to window for console access
  window.publishStandupReport = publishLatestReport;
  window.diagnosAirtableConnection = runDiagnostics;
  
  console.log('📝 Standup report publisher loaded');
  console.log('To publish the latest report, run: publishStandupReport()');
} 