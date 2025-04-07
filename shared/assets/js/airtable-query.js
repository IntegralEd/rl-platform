/**
 * Standup Report Query Utility
 * 
 * Updated tool to query standup reports via webhook
 * instead of direct Airtable access.
 * 
 * Updated: April 12, 2025
 */

import { log } from './cloudwatch-integration.js';
import { checkBackendUpdates } from './frontend-standup-client.js';

// Configuration
const WEBHOOK_CONFIG = {
  WEBHOOK_URL: 'https://hook.us1.make.com/2p4n1yv1urc4upm9xlkiy459t1yd87fj',
  DEFAULT_HEADERS: { 'Content-Type': 'application/json' }
};

/**
 * Query standup reports via webhook
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Query results
 */
async function queryStandupReports(options = {}) {
  try {
    const defaultOptions = {
      maxRecords: 10,
      team: 'Frontend_Cursor',
      days: 7, // Last 7 days by default
      tags: [] // No tag filtering by default
    };
    
    const queryOptions = { ...defaultOptions, ...options };
    console.log('Querying webhook for standup reports with options:', queryOptions);
    
    // Make query request to webhook
    const response = await fetch(`${WEBHOOK_CONFIG.WEBHOOK_URL}/query`, {
      method: 'POST',
      headers: WEBHOOK_CONFIG.DEFAULT_HEADERS,
      body: JSON.stringify({
        team: queryOptions.team,
        days: queryOptions.days,
        maxRecords: queryOptions.maxRecords,
        tags: queryOptions.tags
      })
    });
    
    if (!response.ok) {
      throw new Error(`Webhook error (${response.status}): ${await response.text()}`);
    }
    
    const reports = await response.json();
    
    // Success
    console.log(`Found ${reports.length} standup reports`);
    
    return {
      success: true,
      reports: reports,
      count: reports.length
    };
  } catch (error) {
    console.error('Query failed:', error);
    log('Failed to query reports via webhook', { error: error.message }, 'error');
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Display standup reports in the console in a user-friendly format
 * @param {Array} reports - Reports from webhook
 */
function displayReports(reports) {
  if (!reports || reports.length === 0) {
    console.log('No reports found');
    return;
  }
  
  console.log(`----- Found ${reports.length} Standup Reports -----`);
  
  reports.forEach((report, index) => {
    console.log(`\n[${index + 1}] ${report.Title || 'Untitled Report'}`);
    console.log(`ID: ${report.ID || 'Unknown'}`);
    console.log(`Created: ${report.Created ? new Date(report.Created).toLocaleString() : 'Unknown'}`);
    
    if (report.Priorities && report.Priorities.length > 0) {
      console.log('\nPriorities:');
      report.Priorities.forEach(priority => console.log(`- ${priority}`));
    }
    
    if (report.Findings && report.Findings.length > 0) {
      console.log('\nFindings:');
      report.Findings.forEach(finding => console.log(`- ${finding}`));
    }
    
    if (report.Next_Steps && report.Next_Steps.length > 0) {
      console.log('\nNext Steps:');
      report.Next_Steps.forEach(step => console.log(`- ${step}`));
    }
  });
}

/**
 * Run a query and display results
 * @param {Object} options - Query options
 */
async function queryAndDisplay(options = {}) {
  console.log('Querying webhook for standup reports...');
  
  const result = await queryStandupReports(options);
  
  if (result.success) {
    displayReports(result.reports);
  } else {
    console.error('Query failed:', result.error);
  }
  
  return result;
}

/**
 * Check for backend team updates
 * @param {number} days - Number of days to look back
 */
async function checkBackendTeamUpdates(days = 3) {
  try {
    console.log(`Checking for backend team updates in the last ${days} days...`);
    
    const updates = await checkBackendUpdates();
    
    if (!updates || updates.length === 0) {
      console.log('No recent backend team updates found.');
      return {
        success: true,
        updates: [],
        count: 0
      };
    }
    
    console.log(`Found ${updates.length} backend team updates:`);
    updates.forEach((update, index) => {
      console.log(`\n[${index + 1}] ${update.title}`);
      if (update.priorities && update.priorities.length > 0) {
        console.log('Priorities:');
        update.priorities.forEach(priority => console.log(`- ${priority}`));
      }
    });
    
    return {
      success: true,
      updates,
      count: updates.length
    };
  } catch (error) {
    console.error('Failed to check backend updates:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Export public API
export {
  queryStandupReports,
  displayReports,
  queryAndDisplay,
  checkBackendTeamUpdates
};

// Add to window for console access
if (typeof window !== 'undefined') {
  window.queryStandupReports = queryAndDisplay;
  window.checkBackendTeamUpdates = checkBackendTeamUpdates;
  
  console.log('📊 Airtable query utility loaded');
  console.log('To query reports: queryStandupReports()');
  console.log('To check backend updates: checkBackendTeamUpdates()');
} 